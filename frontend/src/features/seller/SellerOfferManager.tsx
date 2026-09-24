import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles, TrendingUp,
  Search, ShieldCheck, X, Check, Copy, Eye
} from 'lucide-react';
import { api } from '../../api/endpoints';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { cn } from '../../lib/utils';

interface Offer {
  id: number;
  listing_id?: number;
  property_title: string;
  buyer_username: string;
  amount: number;
  counter_amount?: number;
  message: string;
  status: 'accepted' | 'pending' | 'rejected' | 'countered';
  date: string;
}

export const SellerOfferManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [counterModal, setCounterModal] = useState<{ open: boolean; offer: Offer | null; amount: string }>({
    open: false,
    offer: null,
    amount: '',
  });

  // AI Offer Analysis Modal State
  const [aiModal, setAiModal] = useState<{
    open: boolean;
    offer: Offer | null;
    loading: boolean;
    analysis: string | null;
    discountPercent: number;
    recommendedCounter?: number;
  }>({
    open: false,
    offer: null,
    loading: false,
    analysis: null,
    discountPercent: 0,
  });

  const [copied, setCopied] = useState(false);

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['seller-offers'],
    queryFn: async () => {
      const response = await api.seller.offers();
      return response.data;
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, action, amount }: { id: number; action: 'accept' | 'reject' | 'counter'; amount?: string }) => {
      return api.seller.respondOffer(id.toString(), action, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-offers'] });
      setCounterModal({ open: false, offer: null, amount: '' });
    },
  });

  const handleAiAnalyze = async (offer: Offer) => {
    setAiModal({
      open: true,
      offer,
      loading: true,
      analysis: null,
      discountPercent: 0,
    });

    try {
      const res = await api.ai.analyzeOffer(offer.listing_id || offer.id, offer.amount);
      const data = res.data;
      setAiModal({
        open: true,
        offer,
        loading: false,
        analysis: data.ai_analysis,
        discountPercent: data.discount_percent || 0,
        recommendedCounter: data.recommended_counter || Math.round(offer.amount * 1.05),
      });
    } catch (err: any) {
      setAiModal({
        open: true,
        offer,
        loading: false,
        analysis: `AI Market Feasibility valuation is momentarily unavailable (${err?.response?.data?.error || err?.message || 'Connection error'}). Please review the offer of ${offer.amount.toLocaleString()} RWF directly against your registered reserve pricing.`,
        discountPercent: 0,
        recommendedCounter: undefined,
      });
    }
  };

  const filteredOffers = offers.filter((o: any) =>
    (o.property_title && o.property_title.toLowerCase().includes(search.toLowerCase())) ||
    (o.buyer_username && o.buyer_username.toLowerCase().includes(search.toLowerCase()))
  );

  const paginatedOffers = filteredOffers.slice((page - 1) * pageSize, page * pageSize);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center text-zinc-500 text-xs">
        Loading incoming offers...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── HEADER CARD ── */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-950/40 via-white/[0.02] to-transparent p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <TrendingUp size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Offers & Negotiations</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">Review buyer proposals, verify feasibility with AI, and counter-offer through escrow.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {filteredOffers.length} Active Proposals
            </span>
          </div>
        </div>
      </div>

      {/* ── OFFERS TABLE ── */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-base">Incoming Purchase & Rental Offers</h3>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs outline-none focus:border-emerald-400/50"
              placeholder="Search by property or buyer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Property</th>
                <th className="px-6 py-4">Buyer</th>
                <th className="px-6 py-4">Offered Price</th>
                <th className="px-6 py-4">Counter Status</th>
                <th className="px-6 py-4">Buyer Note</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    No offers received yet. Your active listings will receive buyer proposals here.
                  </td>
                </tr>
              ) : (
                paginatedOffers.map((o: any) => (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-bold text-white group-hover:text-emerald-400 transition-colors block">
                        {o.property_title}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">{o.date}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-300">
                      {o.buyer_username}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {o.amount?.toLocaleString()} RWF
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {o.counter_amount ? (
                        <span className="font-mono font-semibold text-amber-400">
                          {o.counter_amount.toLocaleString()} RWF
                        </span>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 truncate max-w-xs">
                      {o.message || 'Standard offer proposal submitted.'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          o.status === 'accepted' ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                          o.status === 'pending' ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
                          o.status === 'countered' ? "bg-blue-500/15 text-blue-400 border-blue-500/30" :
                          "bg-red-500/15 text-red-400 border-red-500/30"
                        )}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedOffer(o)}
                          className="p-1.5 rounded-lg border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white bg-white/[0.02] transition-colors cursor-pointer"
                          title="Inspect Offer Dossier"
                        >
                          <Eye size={13} />
                        </button>

                        {/* AI Analyze Button */}
                        <Button
                          variant="ghost"
                          onClick={() => handleAiAnalyze(o)}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-400 border border-emerald-500/25 flex items-center gap-1 transition-all cursor-pointer"
                          title="Evaluate with AI"
                        >
                          <Sparkles size={12} className="animate-pulse" />
                          <span>AI Assess</span>
                        </Button>

                        {o.status === 'pending' && (
                          <>
                            <button
                              onClick={() => respondMutation.mutate({ id: o.id, action: 'accept' })}
                              className="px-2.5 py-1 text-[11px] rounded-lg bg-white/[0.05] hover:bg-emerald-500 hover:text-white text-zinc-300 font-semibold transition-all cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => setCounterModal({ open: true, offer: o, amount: o.amount.toString() })}
                              className="px-2.5 py-1 text-[11px] rounded-lg bg-white/[0.05] hover:bg-amber-500 hover:text-white text-zinc-300 font-semibold transition-all cursor-pointer"
                            >
                              Counter
                            </button>
                            <button
                              onClick={() => respondMutation.mutate({ id: o.id, action: 'reject' })}
                              className="px-2 py-1 text-[11px] rounded-lg bg-white/[0.05] hover:bg-red-500 hover:text-white text-zinc-500 transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredOffers.length > 0 && (
          <div className="p-4 border-t border-white/10">
            <Pagination
              currentPage={page}
              totalPages={Math.max(1, Math.ceil(filteredOffers.length / pageSize))}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={(sz) => { setPageSize(sz); setPage(1); }}
              totalItems={filteredOffers.length}
            />
          </div>
        )}
      </div>

      {/* ── COUNTER OFFER MODAL ── */}
      {counterModal.open && counterModal.offer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0b0e14] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-white text-base">Propose Counter Offer</h3>
              <button
                onClick={() => setCounterModal({ open: false, offer: null, amount: '' })}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-zinc-400">
                Buyer <strong className="text-white">{counterModal.offer.buyer_username}</strong> proposed{' '}
                <strong className="text-emerald-400 font-mono">{counterModal.offer.amount.toLocaleString()} RWF</strong> for{' '}
                <strong className="text-white">{counterModal.offer.property_title}</strong>.
              </p>

              <div>
                <label className="text-zinc-400 block mb-1">Your Counter Amount (RWF)</label>
                <input
                  type="number"
                  value={counterModal.amount}
                  onChange={(e) => setCounterModal({ ...counterModal, amount: e.target.value })}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white font-mono text-sm outline-none focus:border-emerald-400/50"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="primary"
                  onClick={() => respondMutation.mutate({
                    id: counterModal.offer!.id,
                    action: 'counter',
                    amount: counterModal.amount
                  })}
                  disabled={respondMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                >
                  Submit Counter Offer
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setCounterModal({ open: false, offer: null, amount: '' })}
                  className="px-4 py-2.5 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── AI OFFER ANALYSIS MODAL ── */}
      {aiModal.open && aiModal.offer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl border border-emerald-500/30 bg-[#0b0e14] p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Sparkles size={16} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">AI Offer Feasibility Assessment</h3>
                  <p className="text-[11px] text-zinc-400">{aiModal.offer.property_title}</p>
                </div>
              </div>
              <button
                onClick={() => setAiModal({ ...aiModal, open: false })}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs text-zinc-300 scrollbar-thin">
              {aiModal.loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
                  <Sparkles size={24} className="text-emerald-400 animate-spin" />
                  <p>Analyzing offer variance vs Kigali market comps with NVIDIA NIM...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
                      <p className="text-[10px] text-zinc-400 uppercase font-mono">Offered Amount</p>
                      <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                        {aiModal.offer.amount.toLocaleString()} RWF
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
                      <p className="text-[10px] text-zinc-400 uppercase font-mono">Estimated Variance</p>
                      <p className="text-base font-bold font-mono text-amber-400 mt-0.5">
                        {aiModal.discountPercent}% Discount
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 leading-relaxed whitespace-pre-wrap">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Strategic Guidance:</span>
                      {aiModal.analysis && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(aiModal.analysis!)}
                          className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                        >
                          {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                    {aiModal.analysis}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
              {aiModal.recommendedCounter && (
                <Button
                  variant="primary"
                  onClick={() => {
                    const counterAmt = aiModal.recommendedCounter!.toString();
                    setCounterModal({ open: true, offer: aiModal.offer, amount: counterAmt });
                    setAiModal({ ...aiModal, open: false });
                  }}
                  className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center gap-1.5"
                >
                  <TrendingUp size={13} />
                  <span>Use Recommended Counter ({aiModal.recommendedCounter.toLocaleString()} RWF)</span>
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => setAiModal({ ...aiModal, open: false })}
                className="px-4 py-2 text-xs rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── OFFER DOSSIER INSPECTION MODAL ── */}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#080c14] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck size={12} /> Offer Dossier #{selectedOffer.id}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {selectedOffer.property_title}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Buyer: {selectedOffer.buyer_username} • {selectedOffer.date}</p>
              </div>
              <button
                onClick={() => setSelectedOffer(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
                  <span className="text-zinc-500 text-[10px] block font-bold uppercase tracking-wider">Offered Price</span>
                  <span className="text-lg font-mono font-bold text-emerald-400 mt-1 block">
                    {selectedOffer.amount?.toLocaleString()} RWF
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
                  <span className="text-zinc-500 text-[10px] block font-bold uppercase tracking-wider">Counter Position</span>
                  <span className="text-lg font-mono font-bold text-amber-400 mt-1 block">
                    {selectedOffer.counter_amount ? `${selectedOffer.counter_amount.toLocaleString()} RWF` : 'None proposed'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Buyer Submission Note & Terms</span>
                <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {selectedOffer.message || 'Standard offer proposal submitted under sovereign escrow rules.'}
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 text-xs">
                <span className="text-zinc-400">Offer Status:</span>
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    selectedOffer.status === 'accepted' ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                    selectedOffer.status === 'pending' ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
                    selectedOffer.status === 'countered' ? "bg-blue-500/15 text-blue-400 border-blue-500/30" :
                    "bg-red-500/15 text-red-400 border-red-500/30"
                  )}
                >
                  {selectedOffer.status}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleAiAnalyze(selectedOffer);
                    setSelectedOffer(null);
                  }}
                  className="px-3 py-2 text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-1.5"
                >
                  <Sparkles size={13} /> AI Assess
                </Button>

                {selectedOffer.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        respondMutation.mutate({ id: selectedOffer.id, action: 'accept' });
                        setSelectedOffer(null);
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCounterModal({ open: true, offer: selectedOffer, amount: selectedOffer.amount.toString() });
                        setSelectedOffer(null);
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 cursor-pointer"
                    >
                      Counter
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        respondMutation.mutate({ id: selectedOffer.id, action: 'reject' });
                        setSelectedOffer(null);
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 cursor-pointer"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedOffer(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SellerOfferManager;

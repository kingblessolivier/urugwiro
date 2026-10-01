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
import { tableHead, tableTh, tableBody, tableTr } from '../../components/ui/Dashboard';

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
      const asking = Number((offer as any).asking_price || (offer as any).listing?.price || offer.amount);
      const response = await api.ai.analyzeOffer({
        offer_amount: offer.amount,
        asking_price: asking,
        property_title: offer.property_title,
      });

      const data = response.data;
      setAiModal({
        open: true,
        offer,
        loading: false,
        analysis: data.analysis || data.recommendation || 'Analysis complete.',
        discountPercent: data.discount_percent || 0,
        recommendedCounter: data.recommended_counter || undefined,
      });
    } catch (error) {
      // Fallback to rule-based analysis if AI endpoint unavailable
      const asking = Number((offer as any).asking_price || (offer as any).listing?.price || offer.amount);
      const offered = Number(offer.amount || 0);
      const diff = asking > 0 ? Math.round(((asking - offered) / asking) * 100) : 0;
      const recommended = Math.round(offered * 1.05);
      const analysisText = diff > 0
        ? `This offer is ${diff}% below asking price (${asking.toLocaleString()} RWF). Recommended counter-offer: ${recommended.toLocaleString()} RWF.`
        : `This offer matches or exceeds the asking price. Ready for acceptance.`;

      setAiModal({
        open: true,
        offer,
        loading: false,
        analysis: analysisText,
        discountPercent: diff,
        recommendedCounter: recommended,
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
      <div className="h-96 flex items-center justify-center text-[var(--color-text-dim)] text-xs">
        Loading incoming offers...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── HEADER CARD ── */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 sm:p-8 shadow-[var(--shadow-depth-1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] border border-emerald-500/30">
              <TrendingUp size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-main)] tracking-tight">Offers & Negotiations</h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">Review buyer proposals, verify feasibility with AI, and counter-offer through escrow.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] border border-emerald-500/30">
              {filteredOffers.length} Active Proposals
            </span>
          </div>
        </div>
      </div>

      {/* ── OFFERS TABLE ── */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden shadow-[var(--shadow-depth-1)]">
        <div className="p-4 sm:p-6 border-b border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[var(--color-text-main)] text-base">Incoming Purchase & Rental Offers</h3>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-main)] text-xs outline-none focus:border-emerald-500/50"
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
            <thead className={tableHead}>
              <tr>
                <th className={tableTh}>Property</th>
                <th className={tableTh}>Buyer</th>
                <th className={tableTh}>Offered Price</th>
                <th className={tableTh}>Counter Status</th>
                <th className={tableTh}>Buyer Note</th>
                <th className={tableTh}>Status</th>
                <th className={cn(tableTh, 'text-right')}>Actions</th>
              </tr>
            </thead>
            <tbody className={tableBody}>
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--color-text-dim)]">
                    No offers received yet. Your active listings will receive buyer proposals here.
                  </td>
                </tr>
              ) : (
                paginatedOffers.map((o: any) => (
                  <tr key={o.id} className={cn(tableTr, "group")}>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-brand-emerald)] transition-colors block">
                        {o.property_title}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-dim)] font-mono">{o.date}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-[var(--color-text-muted)]">
                      {o.buyer_username}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-[var(--color-brand-emerald)] text-sm">
                        {o.amount?.toLocaleString()} RWF
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {o.counter_amount ? (
                        <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                          {o.counter_amount.toLocaleString()} RWF
                        </span>
                      ) : (
                        <span className="text-[var(--color-text-dim)]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)] truncate max-w-xs">
                      {o.message || 'Standard offer proposal submitted.'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          o.status === 'accepted' ? "bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] border-emerald-500/30" :
                          o.status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-600 dark:text-amber-400 dark:border-amber-500/30" :
                          o.status === 'countered' ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30" :
                          "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30"
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
                          className="p-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-border-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
                          title="View Offer Details"
                        >
                          <Eye size={13} />
                        </button>

                        {/* AI Analyze Button */}
                        <Button
                          variant="ghost"
                          onClick={() => handleAiAnalyze(o)}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-emerald-500/10 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-[#fff] text-[var(--color-brand-emerald)] border border-emerald-500/25 flex items-center gap-1 transition-all cursor-pointer"
                          title="Evaluate with AI"
                        >
                          <Sparkles size={12} className="animate-pulse" />
                          <span>AI Assess</span>
                        </Button>

                        {o.status === 'pending' && (
                          <>
                            <button
                              onClick={() => respondMutation.mutate({ id: o.id, action: 'accept' })}
                              className="px-2.5 py-1 text-[11px] rounded-lg bg-[var(--color-bg-elevated)] hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-[#fff] text-[var(--color-text-muted)] font-semibold transition-all cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => setCounterModal({ open: true, offer: o, amount: o.amount.toString() })}
                              className="px-2.5 py-1 text-[11px] rounded-lg bg-[var(--color-bg-elevated)] hover:bg-amber-500 hover:text-[#fff] text-[var(--color-text-muted)] font-semibold transition-all cursor-pointer"
                            >
                              Counter
                            </button>
                            <button
                              onClick={() => respondMutation.mutate({ id: o.id, action: 'reject' })}
                              className="px-2 py-1 text-[11px] rounded-lg bg-[var(--color-bg-elevated)] hover:bg-red-500 hover:text-[#fff] text-[var(--color-text-dim)] transition-all cursor-pointer"
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
          <div className="p-4 border-t border-[var(--color-border)]">
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
          <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-1)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <h3 className="font-bold text-[var(--color-text-main)] text-base">Propose Counter Offer</h3>
              <button
                onClick={() => setCounterModal({ open: false, offer: null, amount: '' })}
                className="text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[var(--color-text-muted)]">
                Buyer <strong className="text-[var(--color-text-main)]">{counterModal.offer.buyer_username}</strong> proposed{' '}
                <strong className="text-[var(--color-brand-emerald)] font-mono">{counterModal.offer.amount.toLocaleString()} RWF</strong> for{' '}
                <strong className="text-[var(--color-text-main)]">{counterModal.offer.property_title}</strong>.
              </p>

              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Your Counter Amount (RWF)</label>
                <input
                  type="number"
                  value={counterModal.amount}
                  onChange={(e) => setCounterModal({ ...counterModal, amount: e.target.value })}
                  className="w-full rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-text-main)] font-mono text-sm outline-none focus:border-emerald-500/50"
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
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] font-bold"
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
          <div className="w-full max-w-xl rounded-xl border border-emerald-500/30 bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-1)] space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] flex items-center justify-center border border-emerald-500/30">
                  <Sparkles size={16} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-text-main)] text-base">AI Offer Feasibility Assessment</h3>
                  <p className="text-[11px] text-[var(--color-text-muted)]">{aiModal.offer.property_title}</p>
                </div>
              </div>
              <button
                onClick={() => setAiModal({ ...aiModal, open: false })}
                className="text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs text-[var(--color-text-muted)] scrollbar-thin">
              {aiModal.loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-[var(--color-text-muted)]">
                  <Sparkles size={24} className="text-[var(--color-brand-emerald)] animate-spin" />
                  <p>Analyzing offer variance vs Kigali market comps with NVIDIA NIM...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-mono">Offered Amount</p>
                      <p className="text-base font-bold font-mono text-[var(--color-brand-emerald)] mt-0.5">
                        {aiModal.offer.amount.toLocaleString()} RWF
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-mono">Estimated Variance</p>
                      <p className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                        {aiModal.discountPercent}% Discount
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] leading-relaxed whitespace-pre-wrap">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-emerald)]">Strategic Guidance:</span>
                      {aiModal.analysis && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(aiModal.analysis!)}
                          className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] flex items-center gap-1"
                        >
                          {copied ? <Check size={11} className="text-[var(--color-brand-emerald)]" /> : <Copy size={11} />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                    {aiModal.analysis}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4">
              {aiModal.recommendedCounter && (
                <Button
                  variant="primary"
                  onClick={() => {
                    const counterAmt = aiModal.recommendedCounter!.toString();
                    setCounterModal({ open: true, offer: aiModal.offer, amount: counterAmt });
                    setAiModal({ ...aiModal, open: false });
                  }}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] rounded-xl flex items-center gap-1.5"
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

      {/* ── OFFER DETAILS MODAL ── */}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 sm:p-8 shadow-[var(--shadow-depth-1)] space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-[var(--color-brand-emerald)] border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck size={12} /> Offer Details #{selectedOffer.id}
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text-main)]">
                  {selectedOffer.property_title}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Buyer: {selectedOffer.buyer_username} • {selectedOffer.date}</p>
              </div>
              <button
                onClick={() => setSelectedOffer(null)}
                className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-card-hover)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                  <span className="text-[var(--color-text-dim)] text-[10px] block font-bold uppercase tracking-wider">Offered Price</span>
                  <span className="text-lg font-mono font-bold text-[var(--color-brand-emerald)] mt-1 block">
                    {selectedOffer.amount?.toLocaleString()} RWF
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                  <span className="text-[var(--color-text-dim)] text-[10px] block font-bold uppercase tracking-wider">Counter Position</span>
                  <span className="text-lg font-mono font-bold text-amber-600 dark:text-amber-400 mt-1 block">
                    {selectedOffer.counter_amount ? `${selectedOffer.counter_amount.toLocaleString()} RWF` : 'None proposed'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] space-y-2">
                <span className="text-[var(--color-text-dim)] text-[10px] font-bold uppercase tracking-wider block">Buyer Submission Note & Terms</span>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed whitespace-pre-wrap">
                  {selectedOffer.message || 'Standard offer proposal submitted under secure escrow terms.'}
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs">
                <span className="text-[var(--color-text-muted)]">Offer Status:</span>
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    selectedOffer.status === 'accepted' ? "bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] border-emerald-500/30" :
                    selectedOffer.status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-600 dark:text-amber-400 dark:border-amber-500/30" :
                    selectedOffer.status === 'countered' ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30" :
                    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30"
                  )}
                >
                  {selectedOffer.status}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleAiAnalyze(selectedOffer);
                    setSelectedOffer(null);
                  }}
                  className="px-3 py-2 text-xs font-semibold bg-emerald-500/10 text-[var(--color-brand-emerald)] hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-1.5"
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
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCounterModal({ open: true, offer: selectedOffer, amount: selectedOffer.amount.toString() });
                        setSelectedOffer(null);
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-500/20 dark:text-amber-300 dark:hover:bg-amber-500/30 border dark:border-amber-500/30 cursor-pointer"
                    >
                      Counter
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        respondMutation.mutate({ id: selectedOffer.id, action: 'reject' });
                        setSelectedOffer(null);
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border dark:border-red-500/30 cursor-pointer"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedOffer(null)}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] cursor-pointer"
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

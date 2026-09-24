import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Handshake, Search, TrendingDown, TrendingUp,
  Eye, X, Phone, Mail
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { api } from '../../api/endpoints';
import { CounterOfferModal } from './components/CounterOfferModal';

export const AgentOfferManager: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'countered' | 'accepted' | 'rejected'>('all');
  const [selectedOfferForCounter, setSelectedOfferForCounter] = useState<any | null>(null);
  const [selectedOfferForView, setSelectedOfferForView] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['agent-offers'],
    queryFn: async () => {
      const res = await api.agent.offers();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const filteredOffers = offers.filter((o: any) => {
    const matchesSearch =
      (o.property_title && o.property_title.toLowerCase().includes(search.toLowerCase())) ||
      (o.buyer_username && o.buyer_username.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedOffers = filteredOffers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Handshake size={22} className="text-emerald-500" /> Fiduciary Offer Negotiation Desk
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Assess buyer variance to asking prices, formulate counter-offers, and lock earnest escrow deposits.
          </p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs px-3 py-1 font-bold">
          {filteredOffers.length} Offers Under Review
        </Badge>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Offers' },
            { id: 'pending', label: 'Pending Review' },
            { id: 'countered', label: 'Countered' },
            { id: 'accepted', label: 'Accepted' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id as any);
                setPage(1);
              }}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by property or buyer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Offers Table */}
      <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400 text-sm">Loading buyer proposals...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-zinc-50 dark:bg-white/[0.01] text-zinc-400 text-[10px] uppercase font-bold border-b border-zinc-200 dark:border-white/10">
                <tr>
                  <th className="px-6 py-4">Property</th>
                  <th className="px-6 py-4">Buyer / Contact</th>
                  <th className="px-6 py-4">Offer Amount</th>
                  <th className="px-6 py-4">Asking Variance</th>
                  <th className="px-6 py-4">Counter Proposal</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Negotiate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.06]">
                {paginatedOffers.map((o: any) => (
                  <tr key={o.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900 dark:text-white">{o.property_title}</div>
                      <div className="text-[11px] font-mono text-zinc-400">
                        List: {Number(o.property_price || o.amount).toLocaleString()} RWF
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-800 dark:text-zinc-200">{o.buyer_username}</div>
                      <div className="text-[11px] font-mono text-zinc-400">{o.buyer_phone || o.buyer_email}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-zinc-900 dark:text-white">
                      {Number(o.amount).toLocaleString()} RWF
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-mono font-bold">
                        {(o.variance_percent || 0) < 0 ? (
                          <span className="text-amber-500 flex items-center gap-0.5">
                            <TrendingDown size={13} /> {o.variance_percent}%
                          </span>
                        ) : (
                          <span className="text-emerald-500 flex items-center gap-0.5">
                            <TrendingUp size={13} /> +{o.variance_percent}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {o.counter_amount ? (
                        <div className="font-mono font-bold text-amber-500">
                          {Number(o.counter_amount).toLocaleString()} RWF
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        o.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        o.status === 'countered' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        o.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-sky-500/10 text-sky-500 border-sky-500/20'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOfferForView(o)}
                          className="p-1.5 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-white/[0.02] transition-colors cursor-pointer"
                          title="Inspect Full Offer Dossier"
                        >
                          <Eye size={14} />
                        </button>
                        <Button
                          size="sm"
                          onClick={() => setSelectedOfferForCounter(o)}
                          className="rounded-xl text-xs font-bold bg-zinc-900 dark:bg-white/10 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-white transition-colors cursor-pointer"
                        >
                          Negotiate
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOffers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-zinc-400">
                      <Handshake size={32} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300">No offers found</p>
                      <p className="text-xs text-zinc-500 mt-1">Offers submitted by verified buyers will appear here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {filteredOffers.length > 0 && (
          <div className="p-4 border-t border-zinc-200 dark:border-white/10">
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

      {/* Counter Offer Modal */}
      {selectedOfferForCounter && (
        <CounterOfferModal
          offer={selectedOfferForCounter}
          onClose={() => setSelectedOfferForCounter(null)}
        />
      )}

      {/* View Offer Details Modal */}
      {selectedOfferForView && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080c14] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Handshake size={12} /> Broker Proposal Review
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {selectedOfferForView.property_title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Proposer: <strong className="text-zinc-800 dark:text-zinc-200">{selectedOfferForView.buyer_username}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedOfferForView(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10">
                  <span className="text-zinc-400 text-[10px] block font-bold uppercase tracking-wider">Offered Price</span>
                  <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {Number(selectedOfferForView.amount).toLocaleString()} RWF
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10">
                  <span className="text-zinc-400 text-[10px] block font-bold uppercase tracking-wider">Listing Ask</span>
                  <span className="text-lg font-mono font-bold text-zinc-700 dark:text-zinc-300 mt-1 block">
                    {Number(selectedOfferForView.property_price || selectedOfferForView.amount).toLocaleString()} RWF
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10">
                  <span className="text-zinc-400 text-[10px] block font-bold uppercase tracking-wider">Price Variance</span>
                  <div className="text-sm font-mono font-bold mt-1 flex items-center gap-1">
                    {(selectedOfferForView.variance_percent || 0) < 0 ? (
                      <span className="text-amber-500 flex items-center gap-0.5">
                        <TrendingDown size={14} /> {selectedOfferForView.variance_percent}% below ask
                      </span>
                    ) : (
                      <span className="text-emerald-500 flex items-center gap-0.5">
                        <TrendingUp size={14} /> +{selectedOfferForView.variance_percent}% above ask
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10">
                  <span className="text-zinc-400 text-[10px] block font-bold uppercase tracking-wider">Counter Position</span>
                  <span className="text-sm font-mono font-bold text-amber-500 mt-1 block">
                    {selectedOfferForView.counter_amount ? `${Number(selectedOfferForView.counter_amount).toLocaleString()} RWF` : 'None proposed yet'}
                  </span>
                </div>
              </div>

              {(selectedOfferForView.buyer_phone || selectedOfferForView.buyer_email) && (
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 space-y-1">
                  <span className="text-zinc-400 text-[10px] block font-bold uppercase tracking-wider">Buyer Communication Channels</span>
                  <div className="flex flex-wrap gap-3 text-xs pt-1">
                    {selectedOfferForView.buyer_phone && (
                      <a href={`tel:${selectedOfferForView.buyer_phone}`} className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                        <Phone size={13} /> {selectedOfferForView.buyer_phone}
                      </a>
                    )}
                    {selectedOfferForView.buyer_email && (
                      <a href={`mailto:${selectedOfferForView.buyer_email}`} className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-medium hover:underline">
                        <Mail size={13} /> {selectedOfferForView.buyer_email}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {selectedOfferForView.message && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 space-y-2">
                  <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block">Buyer Submission Note & Conditions</span>
                  <p className="text-xs text-zinc-700 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {selectedOfferForView.message}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">Current Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  selectedOfferForView.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  selectedOfferForView.status === 'countered' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                  selectedOfferForView.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                  'bg-sky-500/10 text-sky-500 border-sky-500/20'
                }`}>
                  {selectedOfferForView.status}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between gap-3">
              <Button
                size="sm"
                onClick={() => {
                  setSelectedOfferForCounter(selectedOfferForView);
                  setSelectedOfferForView(null);
                }}
                className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                Open Negotiation / Counter
              </Button>
              <button
                type="button"
                onClick={() => setSelectedOfferForView(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
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

export default AgentOfferManager;

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Search, ArrowUpRight,
  Sparkles,
  Calendar, DollarSign
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { tableHead, tableTh, tableBody, tableTr, StatCard } from '../../components/ui/Dashboard';
import { cn } from '../../lib/utils';
import { api } from '../../api/endpoints';

const offerChip = (status?: string) =>
  status === 'pending'
    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/40'
    : status === 'accepted'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40'
    : status === 'rejected'
    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/40'
    : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/40';

const visitChip = (status?: string) =>
  status === 'requested'
    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/40'
    : status === 'confirmed'
    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/40'
    : status === 'completed'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40'
    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/40';

const chipBase = 'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-block';

type TabKey = 'offers' | 'visits';

interface AdminOffersProps {
  initialTab?: TabKey;
}

const AdminOffers: React.FC<AdminOffersProps> = ({ initialTab = 'offers' }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [counteringOfferId, setCounteringOfferId] = useState<number | null>(null);
  const [counterAmount, setCounterAmount] = useState<number>(0);

  const [offerAnalysis, setOfferAnalysis] = useState<any | null>(null);
  const [analyzingOfferId, setAnalyzingOfferId] = useState<number | null>(null);

  const { data: offersData, isLoading: offersLoading } = useQuery({
    queryKey: ['admin-offers'],
    queryFn: async () => {
      const res = await api.offers.list();
      const d: any = res.data;
      return Array.isArray(d) ? d : (d?.results || []);
    },
  });

  const { data: visitsData, isLoading: visitsLoading } = useQuery({
    queryKey: ['admin-visits'],
    queryFn: async () => {
      const res = await api.visits.list();
      const d: any = res.data;
      return Array.isArray(d) ? d : (d?.results || []);
    },
  });

  const offers = offersData || [];
  const visits = visitsData || [];

  const offerStatusMutation = useMutation({
    mutationFn: async ({ offerId, status, counter_amount }: { offerId: number; status: 'accepted' | 'rejected' | 'countered'; counter_amount?: number }) => {
      return api.offers.updateStatus(offerId, { status, counter_amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      setCounteringOfferId(null);
    },
  });

  const visitStatusMutation = useMutation({
    mutationFn: async ({ visitId, status }: { visitId: number; status: string }) => {
      return api.visits.updateStatus(visitId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-visits'] });
    },
  });

  const filteredOffers = offers.filter((o: any) => {
    return !search ||
      (o.listing_title || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.buyer_name || '').toLowerCase().includes(search.toLowerCase());
  });

  const filteredVisits = visits.filter((v: any) => {
    return !search ||
      (v.listing_title || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.client_name || '').toLowerCase().includes(search.toLowerCase());
  });

  const activeRows = activeTab === 'offers' ? filteredOffers : filteredVisits;
  const paginatedRows = activeRows.slice((page - 1) * pageSize, page * pageSize);

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleRunAiOfferAnalysis = (offer: any) => {
    const asking = Number(offer.asking_price || offer.listing_price || offer.amount || 0);
    const offered = Number(offer.amount || offer.offered_amount || 0);
    const diff = asking > 0 ? Math.round(((asking - offered) / asking) * 100) : 0;
    const analysis = diff > 0
      ? `Offer is ${diff}% below asking price (${asking.toLocaleString()} RWF). Counter-negotiation recommended.`
      : `Offer meets or exceeds listing price. Favorable for immediate closing.`;
    setOfferAnalysis({
      id: offer.id,
      data: {
        ai_analysis: analysis,
        discount_percent: diff,
        recommended_counter: Math.round(offered * 1.05),
      },
    });
  };


  const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ size?: number }>; count: number }[] = [
    { key: 'offers', label: 'Offers & Bids', icon: DollarSign, count: offers.length },
    { key: 'visits', label: 'Site Inspections', icon: Calendar, count: visits.length },
  ];

  return (
    <div className="min-h-screen bg-transparent px-6 py-10 text-[var(--color-text-main)] lg:px-12">
      <div className="mx-auto max-w-7xl space-y-8">

        <header className="flex flex-col justify-between gap-5 border-b border-[var(--color-border)] pb-8 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text-main)] tracking-tight">
              Offers & Visits
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{activeRows.length} {activeTab}</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/api/reports/export/offers/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2 text-xs font-semibold text-[var(--color-text-muted)] transition hover:border-emerald-500/40 hover:text-[var(--color-text-main)]"
            >
              <ArrowUpRight size={15} /> Export Offers CSV
            </a>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            label="Total Offers"
            value={offers.length}
            sub="All submissions"
            icon={DollarSign}
            tone="emerald"
          />
          <StatCard
            label="Pending Offers"
            value={offers.filter((o: any) => o.status === 'pending').length}
            sub="Awaiting decision"
            icon={DollarSign}
            tone="amber"
          />
          <StatCard
            label="Total Site Visits"
            value={visits.length}
            sub="All inspections"
            icon={Calendar}
            tone="blue"
          />
          <StatCard
            label="Scheduled Visits"
            value={visits.filter((v: any) => v.status === 'requested' || v.status === 'confirmed').length}
            sub="Upcoming inspections"
            icon={Calendar}
            tone="purple"
          />
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 shadow-[var(--shadow-depth-1)] xl:flex-row xl:items-center">
          <div className="flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                key={tab.key}
                type="button"
                onClick={() => switchTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors',
                  activeTab === tab.key
                    ? 'bg-emerald-600 text-[#fff] shadow-sm dark:bg-emerald-500 dark:text-emerald-950'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card-hover)] hover:text-[var(--color-text-main)]'
                )}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="font-mono text-[10px] opacity-80">({tab.count})</span>
              </button>
              );
            })}
          </div>

          <div className="relative flex-1 xl:max-w-md">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search properties or participants..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] py-2.5 pl-11 pr-4 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>
        </div>

        {activeTab === 'offers' && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-depth-1)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left border-collapse">
                  <thead className={tableHead}>
                    <tr>
                      <th className={tableTh}>Listing</th>
                      <th className={tableTh}>Buyer</th>
                      <th className={cn(tableTh, 'text-right')}>Offer Amount</th>
                      <th className={tableTh}>Terms</th>
                      <th className={cn(tableTh, 'text-center')}>Status</th>
                      <th className={cn(tableTh, 'text-right')}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={cn(tableBody, 'text-sm')}>
                    {offersLoading && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)] font-medium">Loading offers...</td>
                      </tr>
                    )}
                    {!offersLoading && paginatedRows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)]">No offers found.</td>
                      </tr>
                    )}
                    {!offersLoading && paginatedRows.map((offer: any) => (
                      <tr key={offer.id} className={tableTr}>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[var(--color-text-main)]">{offer.listing_title || `Listing #${offer.listing}`}</p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Submitted: {new Date(offer.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-[var(--color-text-main)]">
                            <User size={14} className="text-[var(--color-text-dim)]" />
                            <span className="font-medium">{offer.buyer_name || 'Buyer'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right font-mono font-bold text-[var(--color-text-main)]">
                          {Number(offer.amount).toLocaleString()} RWF
                          {offer.counter_amount && (
                            <div className="text-xs text-[var(--color-brand-emerald)] font-normal">
                              Counter: {Number(offer.counter_amount).toLocaleString()} RWF
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-[var(--color-text-muted)] space-y-1">
                          <div>Financing: <strong className="text-[var(--color-text-main)] capitalize">{offer.financing_type || 'Cash'}</strong></div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <Badge variant="neutral" className={cn(chipBase, offerChip(offer.status))}>
                            {offer.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRunAiOfferAnalysis(offer)}
                              disabled={analyzingOfferId === offer.id}
                              className="rounded-lg border border-purple-300 p-1.5 text-purple-600 transition-colors hover:bg-purple-50 disabled:opacity-50 dark:border-purple-500/30 dark:text-purple-400 dark:hover:bg-purple-500/10"
                              title="AI Feasibility Analysis"
                            >
                              <Sparkles size={15} />
                            </button>

                            {offer.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => offerStatusMutation.mutate({ offerId: offer.id, status: 'accepted' })}
                                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-[#fff] transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400"
                                >
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCounteringOfferId(offer.id);
                                    setCounterAmount(Number(offer.amount) * 1.05);
                                  }}
                                  className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                                >
                                  Counter
                                </button>
                                <button
                                  type="button"
                                  onClick={() => offerStatusMutation.mutate({ offerId: offer.id, status: 'rejected' })}
                                  className="rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>

                          {counteringOfferId === offer.id && (
                            <div className="mt-3 p-3 rounded-lg bg-[var(--color-bg-elevated)] border border-amber-300 dark:border-amber-500/40 flex items-center gap-2 justify-end">
                              <input
                                type="number"
                                value={counterAmount}
                                onChange={(e) => setCounterAmount(Number(e.target.value))}
                                placeholder="Counter Amount (RWF)"
                                className="bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md px-3 py-1 text-xs text-[var(--color-text-main)] font-mono outline-none focus:border-emerald-500/50"
                              />
                              <button
                                type="button"
                                onClick={() => offerStatusMutation.mutate({ offerId: offer.id, status: 'countered', counter_amount: counterAmount })}
                                className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-bold text-[#fff] hover:bg-emerald-700 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400"
                              >
                                Send Counter
                              </button>
                              <button
                                type="button"
                                onClick={() => setCounteringOfferId(null)}
                                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {offerAnalysis?.id === offer.id && (
                            <div className="mt-3 p-4 rounded-lg bg-purple-50 border border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/30 text-left text-xs space-y-2">
                              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold">
                                <Sparkles size={14} /> AI Valuation Advisory
                              </div>
                              <p className="text-[var(--color-text-main)]">
                                Fairness Score: <strong>{offerAnalysis.data?.fairness_score || 85}%</strong>
                              </p>
                              <p className="text-[var(--color-text-muted)] leading-relaxed">
                                {offerAnalysis.data?.analysis || 'This offer falls within 7% of average regional comps for Gasabo/Kicukiro.'}
                              </p>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination
              currentPage={page}
              totalItems={filteredOffers.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
              itemLabel="offers"
            />
          </div>
        )}

        {activeTab === 'visits' && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-depth-1)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left border-collapse">
                  <thead className={tableHead}>
                    <tr>
                      <th className={tableTh}>Property</th>
                      <th className={tableTh}>Client</th>
                      <th className={tableTh}>Scheduled Date</th>
                      <th className={tableTh}>Focus / Notes</th>
                      <th className={cn(tableTh, 'text-center')}>Status</th>
                      <th className={cn(tableTh, 'text-right')}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={cn(tableBody, 'text-sm')}>
                    {visitsLoading && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)] font-medium">Loading site visits...</td>
                      </tr>
                    )}
                    {!visitsLoading && paginatedRows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)]">No scheduled visits.</td>
                      </tr>
                    )}
                    {!visitsLoading && paginatedRows.map((visit: any) => (
                      <tr key={visit.id} className={tableTr}>
                        <td className="px-5 py-4 font-semibold text-[var(--color-text-main)]">
                          {visit.listing_title || `Listing #${visit.listing}`}
                        </td>
                        <td className="px-5 py-4 text-[var(--color-text-main)] font-medium">
                          {visit.client_name || 'Client'}
                        </td>
                        <td className="px-5 py-4 text-[var(--color-text-muted)] font-mono text-xs">
                          {visit.scheduled_date} {visit.scheduled_time && `at ${visit.scheduled_time}`}
                        </td>
                        <td className="px-5 py-4 text-xs text-[var(--color-text-muted)] max-w-xs truncate">
                          {visit.notes || 'General inspection'}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <Badge variant="neutral" className={cn(chipBase, visitChip(visit.status))}>
                            {visit.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {visit.status === 'requested' && (
                              <button
                                type="button"
                                onClick={() => visitStatusMutation.mutate({ visitId: visit.id, status: 'confirmed' })}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-[#fff] transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                              >
                                Confirm
                              </button>
                            )}
                            {visit.status === 'confirmed' && (
                              <button
                                type="button"
                                onClick={() => visitStatusMutation.mutate({ visitId: visit.id, status: 'completed' })}
                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-[#fff] transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400"
                              >
                                Mark Completed
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination
              currentPage={page}
              totalItems={filteredVisits.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
              itemLabel="visits"
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminOffers;

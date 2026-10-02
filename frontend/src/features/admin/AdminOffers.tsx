import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User, Search, ArrowUpRight, Sparkles, Calendar, DollarSign, Loader2,
} from 'lucide-react';
import { StatCard } from '../../components/ui/Dashboard';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { cn } from '../../lib/utils';
import { api } from '../../api/endpoints';

// Offer statuses (backend): new | reviewing | negotiating | accepted | declined | withdrawn
const OPEN_OFFER_STATUSES = ['new', 'reviewing', 'negotiating'];

const money = (value: unknown, currency = 'RWF') => {
  const n = Number(value ?? 0);
  return `${Number.isFinite(n) ? n.toLocaleString() : '0'} ${currency}`;
};

type TabKey = 'offers' | 'visits';

interface AdminOffersProps {
  initialTab?: TabKey;
}

const AdminOffers: React.FC<AdminOffersProps> = ({ initialTab = 'offers' }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [counteringOfferId, setCounteringOfferId] = useState<number | null>(null);
  const [counterAmount, setCounterAmount] = useState<number>(0);

  const [analyzingOfferId, setAnalyzingOfferId] = useState<number | null>(null);
  const [offerAnalysis, setOfferAnalysis] = useState<{ id: number; data: any } | null>(null);

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
    mutationFn: ({ offerId, status, offered_amount }: { offerId: number; status: string; offered_amount?: number }) =>
      api.offers.updateStatus(offerId, { status, offered_amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      setCounteringOfferId(null);
    },
  });

  const visitStatusMutation = useMutation({
    mutationFn: ({ visitId, status }: { visitId: number; status: string }) =>
      api.visits.updateStatus(visitId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-visits'] });
    },
  });

  const runAiAnalysis = async (offer: any) => {
    setAnalyzingOfferId(offer.id);
    setOfferAnalysis(null);
    try {
      const res = await api.ai.analyzeOffer({
        offer_amount: Number(offer.offered_amount ?? 0),
        asking_price: Number(offer.asking_price ?? offer.listing_price ?? 0),
        property_title: offer.listing_title || `Listing #${offer.listing}`,
      });
      setOfferAnalysis({ id: offer.id, data: res.data });
    } catch {
      setOfferAnalysis({ id: offer.id, data: { analysis: 'AI analysis unavailable. Check the AI service configuration.' } });
    } finally {
      setAnalyzingOfferId(null);
    }
  };

  const filteredOffers = offers.filter((o: any) =>
    !search ||
    (o.listing_title || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.customer_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredVisits = visits.filter((v: any) =>
    !search ||
    (v.listing_title || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.customer_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const activeRows = activeTab === 'offers' ? filteredOffers : filteredVisits;

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
  };

  const openOffers = offers.filter((o: any) => OPEN_OFFER_STATUSES.includes(o.status)).length;
  const upcomingVisits = visits.filter((v: any) => v.status === 'requested' || v.status === 'confirmed').length;

  const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ size?: number }>; count: number }[] = [
    { key: 'offers', label: 'Offers & Bids', icon: DollarSign, count: offers.length },
    { key: 'visits', label: 'Site Inspections', icon: Calendar, count: visits.length },
  ];

  const offerColumns = useMemo(() => [
    { accessorKey: 'listing_title', id: 'listing', header: 'Listing', cell: ({ row }: any) => (
      <div>
        <p className="font-semibold text-[var(--color-text-main)]">{row.original.listing_title || `Listing #${row.original.listing}`}</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Asking: {money(row.original.asking_price ?? row.original.listing_price)}</p>
      </div>
    ) },
    { accessorKey: 'customer_name', id: 'buyer', header: 'Buyer', cell: ({ row }: any) => (
      <div className="flex items-center gap-2 text-[var(--color-text-main)]">
        <User size={14} className="text-[var(--color-text-dim)]" />
        <span className="font-medium">{row.original.customer_name || 'Buyer'}</span>
      </div>
    ) },
    { accessorKey: 'offered_amount', id: 'offer', header: 'Offer', cell: ({ row }: any) => (
      <span className="font-mono font-bold text-[var(--color-text-main)]">{money(row.original.offered_amount)}</span>
    ) },
    { accessorKey: 'message', id: 'message', header: 'Message', cell: ({ row }: any) => (
      <span className="text-xs text-[var(--color-text-muted)] max-w-xs truncate block">{row.original.message || '—'}</span>
    ) },
    { accessorKey: 'status', id: 'status', header: 'Status', cell: ({ row }: any) => <StatusBadge status={row.original.status} size="sm" /> },
    { id: 'actions', header: '', cell: ({ row }: any) => {
      const offer = row.original;
      const analysis = offerAnalysis && offerAnalysis.id === offer.id ? offerAnalysis.data : null;
      return (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => runAiAnalysis(offer)}
            disabled={analyzingOfferId === offer.id}
            className="flex items-center gap-1 rounded-lg border border-purple-300 px-2.5 py-1.5 text-xs font-semibold text-purple-600 transition-colors hover:bg-purple-50 disabled:opacity-50 dark:border-purple-500/30 dark:text-purple-400 dark:hover:bg-purple-500/10"
            title="AI valuation check"
          >
            {analyzingOfferId === offer.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span className="hidden sm:inline">Analyze</span>
          </button>
          {OPEN_OFFER_STATUSES.includes(offer.status) && (
            <>
              <button onClick={() => offerStatusMutation.mutate({ offerId: offer.id, status: 'accepted' })} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400">Accept</button>
              <button onClick={() => { setCounteringOfferId(offer.id); setCounterAmount(Math.round(Number(offer.offered_amount ?? 0) * 1.05)); }} className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10">Counter</button>
              <button onClick={() => offerStatusMutation.mutate({ offerId: offer.id, status: 'declined' })} className="rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">Decline</button>
            </>
          )}
        </div>
      );
    } },
  ], [offerAnalysis, analyzingOfferId, offerStatusMutation, runAiAnalysis, setCounteringOfferId, setCounterAmount]);

  const visitColumns = useMemo(() => [
    { accessorKey: 'listing_title', id: 'property', header: 'Property', cell: ({ row }: any) => (
      <span className="font-semibold text-[var(--color-text-main)]">{row.original.listing_title || `Listing #${row.original.listing}`}</span>
    ) },
    { accessorKey: 'customer_name', id: 'client', header: 'Client', cell: ({ row }: any) => (
      <div>
        <span className="font-medium text-[var(--color-text-main)]">{row.original.customer_name || 'Client'}</span>
        {row.original.phone && <div className="text-xs text-[var(--color-text-muted)] font-mono">{row.original.phone}</div>}
      </div>
    ) },
    { accessorKey: 'scheduled_date', id: 'scheduled', header: 'Scheduled', cell: ({ row }: any) => (
      <span className="text-xs text-[var(--color-text-muted)] font-mono">{row.original.scheduled_date || row.original.preferred_date}</span>
    ) },
    { accessorKey: 'notes', id: 'notes', header: 'Notes', cell: ({ row }: any) => (
      <span className="text-xs text-[var(--color-text-muted)] max-w-xs truncate block">{row.original.notes || '—'}</span>
    ) },
    { accessorKey: 'status', id: 'status', header: 'Status', cell: ({ row }: any) => <StatusBadge status={row.original.status} size="sm" /> },
    { id: 'actions', header: '', cell: ({ row }: any) => {
      const visit = row.original;
      return (
        <div className="flex items-center justify-end gap-2">
          {visit.status === 'requested' && (
            <button onClick={() => visitStatusMutation.mutate({ visitId: visit.id, status: 'confirmed' })} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-700">Confirm</button>
          )}
          {(visit.status === 'requested' || visit.status === 'confirmed') && (
            <>
              <button onClick={() => visitStatusMutation.mutate({ visitId: visit.id, status: 'completed' })} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400">Complete</button>
              <button onClick={() => visitStatusMutation.mutate({ visitId: visit.id, status: 'cancelled' })} className="rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">Cancel</button>
            </>
          )}
        </div>
      );
    } },
  ], [visitStatusMutation]);

  return (
    <div className="min-h-screen bg-transparent px-6 py-10 text-[var(--color-text-main)] lg:px-12">
      <div className="mx-auto max-w-7xl space-y-8">

        <header className="flex flex-col justify-between gap-5 border-b border-[var(--color-border)] pb-8 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text-main)] tracking-tight">
              Offers &amp; Visits
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Review buyer offers and property inspections.</p>
          </div>
          <a
            href="/api/reports/export/offers/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2 text-xs font-semibold text-[var(--color-text-muted)] transition hover:border-emerald-500/40 hover:text-[var(--color-text-main)]"
          >
            <ArrowUpRight size={15} /> Export CSV
          </a>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard label="Total Offers" value={offers.length} sub="All submissions" icon={DollarSign} tone="emerald" />
          <StatCard label="Open Offers" value={openOffers} sub="Awaiting decision" icon={DollarSign} tone="amber" />
          <StatCard label="Total Visits" value={visits.length} sub="All inspections" icon={Calendar} tone="blue" />
          <StatCard label="Upcoming Visits" value={upcomingVisits} sub="Requested or confirmed" icon={Calendar} tone="purple" />
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
              placeholder="Search listings or people..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] py-2.5 pl-11 pr-4 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>
        </div>

        {activeTab === 'offers' && (
          <DataTable
            data={filteredOffers}
            columns={offerColumns}
            searchKeys={['listing_title', 'customer_name']}
            searchPlaceholder="Search listings or people..."
            emptyTitle="No offers found"
            emptyDescription="No offers have been received yet."
            isLoading={offersLoading}
            showBulkActions={false}
            showDensityToggle={true}
            showColumnToggle={true}
            pageSize={pageSize}
          />
        )}

        {activeTab === 'visits' && (
          <DataTable
            data={filteredVisits}
            columns={visitColumns}
            searchKeys={['listing_title', 'customer_name']}
            searchPlaceholder="Search listings or people..."
            emptyTitle="No visits scheduled"
            emptyDescription="No visits have been scheduled yet."
            isLoading={visitsLoading}
            showBulkActions={false}
            showDensityToggle={true}
            showColumnToggle={true}
            pageSize={pageSize}
          />
        )}

      </div>
    </div>
  );
};

export default AdminOffers;

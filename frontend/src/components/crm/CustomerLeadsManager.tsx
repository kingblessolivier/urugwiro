import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Phone, MessageSquare, Mail, Calendar, Heart, Search,
  CheckCircle2, Clock, Building2, User, ExternalLink,
  ChevronDown, MessageCircle, Eye,
  Sparkles, RefreshCw, X, Users
} from 'lucide-react';
import { cn, logError } from '../../lib/utils';
import { api } from '../../api/endpoints';
import { Pagination } from '../ui/Pagination';
import {
  DashboardCard, CardHeader, StatCard, EmptyState,
} from '../ui/Dashboard';
import { DataTable } from '../ui/DataTable';
import { StatusBadge } from '../ui/StatusBadge';

export type LeadChannel = 'all' | 'visits' | 'inquiries' | 'likes';

interface CustomerLeadsManagerProps {
  mode: 'seller' | 'admin';
  initialChannel?: LeadChannel;
  onListingClick?: (id: string) => void;
  title?: string;
  subtitle?: string;
}

const chipBase = 'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider';

const channelChip = (channel: string) =>
  channel === 'visit'
    ? `${chipBase} bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/40`
    : channel === 'inquiry'
    ? `${chipBase} bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40`
    : `${chipBase} bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/40`;

const statusChip =
  `${chipBase} border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]`;

const iconBtn =
  'p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:border-[var(--color-border-hover)] transition-colors cursor-pointer';

export const CustomerLeadsManager: React.FC<CustomerLeadsManagerProps> = ({
  mode,
  initialChannel = 'all',
  onListingClick,
  title,
  subtitle,
}) => {
  const queryClient = useQueryClient();

  // State
  const [activeChannel, setActiveChannel] = useState<LeadChannel>(initialChannel);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Fetch visits
  const { data: visitsData, isLoading: loadingVisits, refetch: refetchVisits } = useQuery({
    queryKey: ['seller-visits'],
    queryFn: async () => (await api.seller.visits()).data,
  });

  // Fetch inquiries
  const { data: inquiriesData, isLoading: loadingInquiries, refetch: refetchInquiries } = useQuery({
    queryKey: ['seller-inquiries'],
    queryFn: async () => (await api.seller.inquiries()).data,
  });

  // Fetch likes
  const { data: likesData, isLoading: loadingLikes, refetch: refetchLikes } = useQuery({
    queryKey: ['seller-likes'],
    queryFn: async () => (await api.seller.likes()).data,
  });

  // Mutations
  const updateVisitMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.seller.updateVisit(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-visits'] });
      setActionSuccess('Visit marked as completed.');
      setTimeout(() => setActionSuccess(''), 3000);
    },
    onError: () => {
      setActionError('Failed to update visit.');
      setTimeout(() => setActionError(''), 3000);
    },
  });

  const updateInquiryMutation = useMutation({
    mutationFn: ({ id, is_read }: { id: number; is_read: boolean }) =>
      api.seller.updateInquiry(id, { is_read }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-inquiries'] });
      setActionSuccess('Inquiry marked as contacted.');
      setTimeout(() => setActionSuccess(''), 3000);
    },
    onError: () => {
      setActionError('Failed to update inquiry.');
      setTimeout(() => setActionError(''), 3000);
    },
  });

  // Normalize data
  const normalizedVisits = useMemo(() => {
    if (!Array.isArray(visitsData)) return [];
    return visitsData.map((v: any) => ({
      id: `visit-${v.id}`,
      rawId: v.id,
      channel: 'visit',
      customerName: v.name || v.buyer_name || 'Unknown',
      customerPhone: v.phone || v.buyer_phone || '',
      customerEmail: v.email || '',
      propertyTitle: v.listing?.title || v.property_title || 'Property',
      propertyId: v.listing_id,
      status: v.status || 'scheduled',
      dateLabel: v.scheduled_date || v.date || '',
      timeSlot: v.scheduled_time || '',
      notes: v.notes || '',
    }));
  }, [visitsData]);

  const normalizedInquiries = useMemo(() => {
    if (!Array.isArray(inquiriesData)) return [];
    return inquiriesData.map((i: any) => ({
      id: `inquiry-${i.id}`,
      rawId: i.id,
      channel: 'inquiry',
      customerName: i.name || i.sender_name || 'Unknown',
      customerPhone: i.phone || '',
      customerEmail: i.email || '',
      propertyTitle: i.listing?.title || i.property_title || 'Property',
      propertyId: i.listing_id,
      status: i.is_read ? 'contacted' : 'unread',
      dateLabel: i.created_at || '',
      timeSlot: '',
      notes: i.message || '',
    }));
  }, [inquiriesData]);

  const normalizedLikes = useMemo(() => {
    if (!Array.isArray(likesData)) return [];
    return likesData.map((l: any) => ({
      id: `like-${l.id}`,
      rawId: l.id,
      channel: 'like',
      customerName: l.user?.full_name || l.user?.username || 'Unknown',
      customerPhone: l.user?.phone_number || '',
      customerEmail: l.user?.email || '',
      propertyTitle: l.listing?.title || 'Property',
      propertyId: l.listing_id,
      status: 'saved',
      dateLabel: l.created_at || '',
      timeSlot: '',
      notes: '',
    }));
  }, [likesData]);

  // Filter by channel
  const displayedLeads = useMemo(() => {
    let leads: any[] = [];
    if (activeChannel === 'all' || activeChannel === 'visits') leads = [...leads, ...normalizedVisits];
    if (activeChannel === 'all' || activeChannel === 'inquiries') leads = [...leads, ...normalizedInquiries];
    if (activeChannel === 'all' || activeChannel === 'likes') leads = [...leads, ...normalizedLikes];

    // Filter by property
    if (selectedPropertyFilter !== 'all') {
      leads = leads.filter((l) => String(l.propertyId) === selectedPropertyFilter);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      leads = leads.filter((l) =>
        l.customerName.toLowerCase().includes(q) ||
        l.customerPhone.toLowerCase().includes(q) ||
        l.customerEmail.toLowerCase().includes(q) ||
        l.propertyTitle.toLowerCase().includes(q) ||
        l.notes.toLowerCase().includes(q)
      );
    }

    return leads;
  }, [activeChannel, normalizedVisits, normalizedInquiries, normalizedLikes, selectedPropertyFilter, searchQuery]);

  const paginatedLeads = useMemo(
    () => displayedLeads.slice((page - 1) * pageSize, page * pageSize),
    [displayedLeads, page, pageSize]
  );

  // Total phone numbers captured
  const totalPhonesCount = useMemo(() => {
    const all = [...normalizedVisits, ...normalizedInquiries, ...normalizedLikes];
    return all.filter((item) => Boolean(item.customerPhone)).length;
  }, [normalizedVisits, normalizedInquiries, normalizedLikes]);

  // Unique properties list for filter dropdown
  const propertiesList = useMemo(() => {
    const all = [...normalizedVisits, ...normalizedInquiries, ...normalizedLikes];
    const seen = new Set<string>();
    return all
      .filter((item) => item.propertyId && !seen.has(String(item.propertyId)) && seen.add(String(item.propertyId)))
      .map((item) => ({ id: String(item.propertyId), title: item.propertyTitle }));
  }, [normalizedVisits, normalizedInquiries, normalizedLikes]);

  const handleRefreshAll = () => {
    refetchVisits();
    refetchInquiries();
    refetchLikes();
  };

  const switchChannel = (ch: LeadChannel) => {
    setActiveChannel(ch);
    setPage(1);
  };

  const isLoading = loadingVisits || loadingInquiries || loadingLikes;

  const channelTabs: { id: LeadChannel; label: string; count: number; icon: React.ElementType }[] = [
    { id: 'all', label: 'All Channels', count: normalizedVisits.length + normalizedInquiries.length + normalizedLikes.length, icon: Users },
    { id: 'visits', label: 'Booked Visits', count: normalizedVisits.length, icon: Calendar },
    { id: 'inquiries', label: 'Inquiries', count: normalizedInquiries.length, icon: MessageSquare },
    { id: 'likes', label: 'Wishlist', count: normalizedLikes.length, icon: Heart },
  ];

  const leadColumns = useMemo(() => [
    { accessorKey: 'customerName', id: 'name', header: 'Customer', cell: ({ row }: any) => (
      <div>
        <span className="font-semibold text-[var(--color-text-main)]">{row.original.customerName}</span>
        {row.original.customerPhone && <div className="text-xs text-[var(--color-text-muted)] font-mono">{row.original.customerPhone}</div>}
      </div>
    ) },
    { accessorKey: 'channel', id: 'channel', header: 'Channel', cell: ({ row }: any) => {
      const channel = row.original.channel;
      const variant = channel === 'visit' ? 'pending' : channel === 'inquiry' ? 'published' : 'draft';
      return <StatusBadge status={variant} size="sm" />;
    } },
    { accessorKey: 'propertyTitle', id: 'property', header: 'Property', cell: ({ row }: any) => (
      <span className="text-sm text-[var(--color-text-muted)]">{row.original.propertyTitle}</span>
    ) },
    { accessorKey: 'status', id: 'status', header: 'Status', cell: ({ row }: any) => <StatusBadge status={row.original.status} size="sm" /> },
    { accessorKey: 'dateLabel', id: 'date', header: 'Date', cell: ({ row }: any) => (
      <span className="text-xs text-[var(--color-text-muted)]">{row.original.dateLabel || '-'}</span>
    ) },
    { accessorKey: 'notes', id: 'notes', header: 'Notes', cell: ({ row }: any) => (
      <span className="text-xs text-[var(--color-text-muted)] truncate max-w-xs block">{row.original.notes || '—'}</span>
    ) },
    { id: 'actions', header: '', cell: ({ row }: any) => (
      <div className="flex items-center justify-end gap-1.5">
        {onListingClick && (
          <button onClick={() => onListingClick(String(row.original.propertyId))} className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors" title="View Property"><ExternalLink size={14} /></button>
        )}
      </div>
    ) },
  ], [onListingClick]);

  return (
    <div className="space-y-6 text-[var(--color-text-main)]">
      {/* Toast feedback */}
      {actionSuccess && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl border shadow-[var(--shadow-depth-1)] flex items-center gap-2.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 animate-fadeIn">
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div role="alert" className="fixed right-6 top-20 z-50 flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-400 shadow-[var(--shadow-depth-1)] animate-fadeIn">
          <X size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {/* ━━━ 1. HEADER ━━━ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-[var(--color-brand-emerald)] text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-2">
            <Sparkles size={12} /> {mode === 'seller' ? 'Customers' : 'Admin Customers'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-main)]">
            {title || (mode === 'seller' ? 'Customers & Visit Requests' : 'Customer Inquiries & Visits')}
          </h1>
          {subtitle && <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
        </div>

        <button
          onClick={handleRefreshAll}
          className="self-start md:self-auto p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:border-[var(--color-border-hover)] transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
        >
          <RefreshCw size={14} className={cn(isLoading && 'animate-spin text-[var(--color-brand-emerald)]')} />
          Refresh Leads
        </button>
      </div>

      {/* ━━━ 2. KPI STRIP ━━━ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Booked Visits"
          value={normalizedVisits.length}
          sub="Scheduled tours"
          icon={Calendar}
          tone="blue"
          onClick={() => switchChannel('visits')}
          className={cn(activeChannel === 'visits' && 'border-sky-500/50 ring-1 ring-sky-500/30')}
        />
        <StatCard
          label="Property Inquiries"
          value={normalizedInquiries.length}
          sub="Inbound messages"
          icon={MessageSquare}
          tone="emerald"
          onClick={() => switchChannel('inquiries')}
          className={cn(activeChannel === 'inquiries' && 'border-emerald-500/50 ring-1 ring-emerald-500/30')}
        />
        <StatCard
          label="Wishlist & Saves"
          value={normalizedLikes.length}
          sub="Client saves"
          icon={Heart}
          tone="amber"
          onClick={() => switchChannel('likes')}
          className={cn(activeChannel === 'likes' && 'border-amber-500/50 ring-1 ring-amber-500/30')}
        />
        <StatCard
          label="Phones Captured"
          value={totalPhonesCount}
          sub="Verified phone numbers"
          icon={Phone}
          tone="neutral"
          onClick={() => switchChannel('all')}
          className={cn(activeChannel === 'all' && 'border-emerald-500/50 ring-1 ring-emerald-500/30')}
        />
      </div>

      {/* ━━━ 3. TOOLBAR: CHANNEL TABS + FILTERS ━━━ */}
      <DashboardCard className="p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] p-1 overflow-x-auto">
          {channelTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeChannel === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchChannel(tab.id)}
                className={cn(
                  "px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                  active
                    ? "bg-emerald-600 text-[#fff] shadow-sm dark:bg-emerald-500 dark:text-emerald-950"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                )}
              >
                <Icon size={13} />
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {propertiesList.length > 0 && (
            <div className="relative sm:min-w-[200px]">
              <select
                value={selectedPropertyFilter}
                onChange={(e) => { setSelectedPropertyFilter(e.target.value); setPage(1); }}
                className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3.5 py-2 pr-8 text-xs font-medium text-[var(--color-text-main)] focus:outline-none focus:border-emerald-500/50 transition-colors"
              >
                <option value="all">All Properties ({propertiesList.length})</option>
                {propertiesList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title.length > 32 ? `${p.title.slice(0, 32)}...` : p.title}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] pointer-events-none" />
            </div>
          )}

          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
            <input
              type="text"
              placeholder="Search name, phone, notes..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] pl-9 pr-3.5 py-2 text-xs font-medium text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>
      </DashboardCard>

      {/* ━━━ 4. CUSTOMER LEADS LEDGER (TABLE) ━━━ */}
      <DashboardCard className="overflow-hidden">
        <CardHeader
          icon={Users}
          title="Customer Leads Ledger"
          subtitle={`${displayedLeads.length} ${displayedLeads.length === 1 ? 'record' : 'records'} · direct follow-up channels`}
        />

        <DataTable
          data={displayedLeads}
          columns={leadColumns}
          searchKeys={['customerName', 'customerPhone', 'propertyTitle', 'notes']}
          searchPlaceholder="Search name, phone, notes..."
          emptyTitle="No customer leads found"
          emptyDescription="When prospective buyers request site inspections, send inquiry messages, or save properties to their wishlist, they will appear here."
          isLoading={isLoading}
          showBulkActions={false}
          showDensityToggle={true}
          showColumnToggle={true}
          pageSize={pageSize}
        />
      </DashboardCard>
    </div>
  );
};

export default CustomerLeadsManager;

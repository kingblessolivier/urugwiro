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
  tableHead, tableTh, tableBody, tableTr, tableTd,
  tdPrimary, tdSecondary, tdMono,
} from '../ui/Dashboard';

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
  const [activeChannel, setActiveChannel] = useState<LeadChannel>(initialChannel);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 1. Fetch Showing Visits
  const {
    data: visitsData = [],
    isLoading: loadingVisits,
    refetch: refetchVisits
  } = useQuery({
    queryKey: [mode === 'seller' ? 'seller-visits' : 'admin-visits'],
    queryFn: async () => {
      try {
        const res = mode === 'seller' ? await api.seller.visits() : await api.admin.visits();
        return Array.isArray(res.data) ? res.data : (res.data?.results || []);
      } catch (err) {
        logError('Failed to load showing visits:', err);
        return [];
      }
    },
  });

  // 2. Fetch Inquiries
  const {
    data: inquiriesData = [],
    isLoading: loadingInquiries,
    refetch: refetchInquiries
  } = useQuery({
    queryKey: [mode === 'seller' ? 'seller-inquiries' : 'admin-enquiries-crm'],
    queryFn: async () => {
      try {
        if (mode === 'seller') {
          const res = await api.seller.inquiries();
          return Array.isArray(res.data) ? res.data : (res.data?.results || []);
        } else {
          const res = await api.admin.enquiries();
          return Array.isArray(res.data?.enquiries) ? res.data.enquiries : (Array.isArray(res.data) ? res.data : (res.data?.results || []));
        }
      } catch (err) {
        logError('Failed to load inquiries:', err);
        return [];
      }
    },
  });

  // 3. Fetch Likes / Wishlist Leads
  const {
    data: likesData = [],
    isLoading: loadingLikes,
    refetch: refetchLikes
  } = useQuery({
    queryKey: [mode === 'seller' ? 'seller-likes' : 'admin-likes'],
    queryFn: async () => {
      try {
        const res = mode === 'seller' ? await api.seller.likes() : await api.admin.likes();
        return Array.isArray(res.data) ? res.data : (res.data?.results || []);
      } catch (err) {
        logError('Failed to load likes leads:', err);
        return [];
      }
    },
  });

  // Visit status mutation
  const updateVisitMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      if (mode === 'seller') {
        return api.seller.updateVisit(id, { status, notes });
      } else {
        return api.admin.updateVisitStatus(id, { status, report: notes });
      }
    },
    onSuccess: () => {
      setActionError('');
      queryClient.invalidateQueries({ queryKey: [mode === 'seller' ? 'seller-visits' : 'admin-visits'] });
      setActionSuccess('Showing appointment updated successfully.');
      setTimeout(() => setActionSuccess(''), 3500);
      if (selectedLead) setSelectedLead(null);
    },
    onError: () => setActionError('The appointment could not be updated. Please try again.'),
  });

  // Inquiry read status mutation
  const updateInquiryMutation = useMutation({
    mutationFn: async ({ id, is_read }: { id: string | number; is_read: boolean }) => {
      if (mode === 'seller') {
        return api.seller.updateInquiry(id, { is_read });
      } else {
        return api.admin.updateEnquiry(id, { status: is_read ? 'read' : 'unread' });
      }
    },
    onSuccess: () => {
      setActionError('');
      queryClient.invalidateQueries({ queryKey: [mode === 'seller' ? 'seller-inquiries' : 'admin-enquiries-crm'] });
      setActionSuccess('Inquiry status updated.');
      setTimeout(() => setActionSuccess(''), 3500);
      if (selectedLead) setSelectedLead(null);
    },
    onError: () => setActionError('The inquiry status could not be updated. Please try again.'),
  });

  // Unique properties for filter dropdown
  const propertiesList = useMemo(() => {
    const map = new Map<string, string>();
    visitsData.forEach((v: any) => {
      if (v.property_id && v.property_title) map.set(String(v.property_id), v.property_title);
    });
    inquiriesData.forEach((i: any) => {
      const pid = i.property_id || i.propertyId || i.listing_id;
      const title = i.property_title || i.propertyTitle || i.listing_title;
      if (pid && title) map.set(String(pid), title);
    });
    likesData.forEach((l: any) => {
      if (l.property_id && l.property_title) map.set(String(l.property_id), l.property_title);
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [visitsData, inquiriesData, likesData]);

  // Normalized visits
  const normalizedVisits = useMemo(() => {
    return visitsData.map((v: any) => ({
      id: `visit_${v.id}`,
      rawId: v.id,
      channel: 'visit' as const,
      customerName: v.visitor_name || 'Prospective Buyer',
      customerPhone: v.visitor_phone || '',
      customerEmail: v.visitor_email || '',
      propertyId: v.property_id,
      propertyTitle: v.property_title || 'Platform Listing',
      propertySlug: v.property_slug || '',
      propertyImage: v.property_image || '',
      propertyPrice: v.property_price,
      propertyCurrency: v.property_currency,
      dateLabel: v.scheduled_date || 'Scheduled Date',
      timeSlot: v.time_window || 'Morning',
      notes: v.notes || v.raw_notes || 'Client requested physical site inspection.',
      status: v.status || 'scheduled',
      timestamp: v.created_at || v.scheduled_date || '',
    }));
  }, [visitsData]);

  // Normalized inquiries
  const normalizedInquiries = useMemo(() => {
    return inquiriesData.map((i: any) => {
      const pid = i.property_id || i.propertyId || i.listing_id;
      const title = i.property_title || i.propertyTitle || i.listing_title || 'Marketplace Asset';
      return {
        id: `inq_${i.id}`,
        rawId: i.id,
        channel: 'inquiry' as const,
        customerName: i.name || 'Interested Client',
        customerPhone: i.phone || '',
        customerEmail: i.email || '',
        propertyId: pid,
        propertyTitle: title,
        propertySlug: i.property_slug || '',
        propertyImage: i.property_image || '',
        propertyPrice: i.property_price,
        propertyCurrency: i.property_currency,
        dateLabel: i.date || (i.created_at ? new Date(i.created_at).toLocaleDateString() : 'Recent'),
        timeSlot: '',
        notes: i.message || 'Client inquired about purchasing/leasing this property.',
        status: i.is_read || i.status === 'read' ? 'read' : 'unread',
        timestamp: i.created_at || '',
      };
    });
  }, [inquiriesData]);

  // Normalized likes / wishlist
  const normalizedLikes = useMemo(() => {
    return likesData.map((l: any) => ({
      id: `like_${l.id}`,
      rawId: l.id,
      channel: 'like' as const,
      customerName: l.customer_name || 'Interested Prospect',
      customerPhone: l.phone || '',
      customerEmail: l.email || '',
      propertyId: l.property_id,
      propertyTitle: l.property_title || 'Marketplace Property',
      propertySlug: l.property_slug || '',
      propertyImage: l.property_image || '',
      propertyPrice: l.property_price,
      propertyCurrency: l.property_currency,
      dateLabel: l.date || 'Active Favorite',
      timeSlot: '',
      notes: l.notes || 'Saved to favorites / requested status updates.',
      status: 'active',
      timestamp: l.date || '',
    }));
  }, [likesData]);

  // Combined and filtered leads
  const displayedLeads = useMemo(() => {
    let pool: any[] = [];
    if (activeChannel === 'all') {
      pool = [...normalizedVisits, ...normalizedInquiries, ...normalizedLikes];
    } else if (activeChannel === 'visits') {
      pool = normalizedVisits;
    } else if (activeChannel === 'inquiries') {
      pool = normalizedInquiries;
    } else if (activeChannel === 'likes') {
      pool = normalizedLikes;
    }

    return pool.filter((item) => {
      if (selectedPropertyFilter !== 'all' && String(item.propertyId) !== selectedPropertyFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.customerName.toLowerCase().includes(q);
        const matchPhone = item.customerPhone.toLowerCase().includes(q);
        const matchEmail = item.customerEmail.toLowerCase().includes(q);
        const matchProperty = item.propertyTitle.toLowerCase().includes(q);
        const matchNotes = item.notes.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail && !matchProperty && !matchNotes) {
          return false;
        }
      }

      return true;
    });
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
    { id: 'visits', label: 'Showing Visits', count: normalizedVisits.length, icon: Calendar },
    { id: 'inquiries', label: 'Inquiries', count: normalizedInquiries.length, icon: MessageSquare },
    { id: 'likes', label: 'Wishlist', count: normalizedLikes.length, icon: Heart },
  ];

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

      {/* ━━━ 1. CRM HEADER ━━━ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-[var(--color-brand-emerald)] text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-2">
            <Sparkles size={12} /> {mode === 'seller' ? 'Seller CRM' : 'Admin CRM'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-main)]">
            {title || (mode === 'seller' ? 'Customer Leads & Showing Requests' : 'Customer Inquiries & Showing Requests')}
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
          label="Showing Visits"
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className={tableHead}>
              <tr>
                <th className={cn(tableTh, 'px-5 py-3.5 font-semibold')}>Customer</th>
                <th className={cn(tableTh, 'px-5 py-3.5 font-semibold')}>Channel</th>
                <th className={cn(tableTh, 'px-5 py-3.5 font-semibold')}>Property</th>
                <th className={cn(tableTh, 'px-5 py-3.5 font-semibold')}>Contact</th>
                <th className={cn(tableTh, 'px-5 py-3.5 font-semibold')}>Activity</th>
                <th className={cn(tableTh, 'px-5 py-3.5 font-semibold')}>Status</th>
                <th className={cn(tableTh, 'px-5 py-3.5 font-semibold text-right')}>Follow-Up Actions</th>
              </tr>
            </thead>
            <tbody className={cn(tableBody, 'text-xs sm:text-sm')}>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-[var(--color-text-dim)]">
                    <Clock size={24} className="mx-auto animate-spin text-[var(--color-brand-emerald)] mb-2" />
                    Loading verified customer inquiries and showing bookings...
                  </td>
                </tr>
              )}

              {!isLoading && paginatedLeads.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6">
                    <EmptyState
                      icon={User}
                      title="No customer leads match your filters"
                      hint="When prospective buyers request site inspections, send inquiry messages, or save properties to their wishlist, they will appear here with instant contact links."
                      action={
                        (selectedPropertyFilter !== 'all' || searchQuery.trim()) ? (
                          <button
                            onClick={() => { setSelectedPropertyFilter('all'); setSearchQuery(''); setPage(1); }}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--color-brand-emerald)] border border-emerald-500/30 bg-[var(--color-accent-soft-bg)] hover:bg-emerald-500/15 transition-colors cursor-pointer"
                          >
                            Clear Filters
                          </button>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              )}

              {!isLoading && paginatedLeads.map((lead: any) => {
                const isVisit = lead.channel === 'visit';
                const isInquiry = lead.channel === 'inquiry';
                const cleanPhone = String(lead.customerPhone || '').replace(/[^0-9]/g, '');
                const waText = encodeURIComponent(
                  `Hello ${lead.customerName}, I am reaching out from Urugwiro regarding ${lead.propertyTitle}. Are you available for a brief follow-up?`
                );

                return (
                  <tr key={lead.id} className={tableTr}>
                    {/* Customer */}
                    <td className={cn(tableTd, 'px-5')}>
                      <div className={cn(tdPrimary, 'text-sm flex items-center gap-1.5')}>
                        <User size={13} className="text-[var(--color-text-dim)] shrink-0" />
                        {lead.customerName}
                      </div>
                      {lead.customerEmail && (
                        <div className={cn(tdSecondary, 'flex items-center gap-1 mt-0.5')}>
                          <Mail size={11} className="shrink-0" /> {lead.customerEmail}
                        </div>
                      )}
                    </td>

                    {/* Channel */}
                    <td className={cn(tableTd, 'px-5')}>
                      <span className={channelChip(lead.channel)}>
                        {isVisit && <Calendar size={11} />}
                        {isInquiry && <MessageSquare size={11} />}
                        {lead.channel === 'like' && <Heart size={11} />}
                        {isVisit ? 'Showing Tour' : isInquiry ? 'Buyer Inquiry' : 'Wishlist Save'}
                      </span>
                    </td>

                    {/* Property */}
                    <td className={cn(tableTd, 'px-5')}>
                      <button
                        type="button"
                        onClick={() => onListingClick && lead.propertyId && onListingClick(String(lead.propertyId))}
                        className="text-xs font-semibold text-[var(--color-brand-emerald)] hover:underline flex items-center gap-1.5 max-w-[220px] cursor-pointer text-left"
                        title="Inspect Property Listing"
                      >
                        <Building2 size={12} className="shrink-0" />
                        <span className="truncate">{lead.propertyTitle}</span>
                      </button>
                    </td>

                    {/* Contact */}
                    <td className={cn(tableTd, 'px-5')}>
                      {lead.customerPhone ? (
                        <span className={cn(tdMono, 'text-xs')}>{lead.customerPhone}</span>
                      ) : (
                        <span className="text-xs text-[var(--color-text-dim)] italic">No phone provided</span>
                      )}
                    </td>

                    {/* Activity */}
                    <td className={cn(tableTd, 'px-5')}>
                      <div className={cn(tdMono, 'text-xs')}>{lead.dateLabel}</div>
                      {isVisit && lead.timeSlot && (
                        <div className={tdSecondary}>Window: {lead.timeSlot}</div>
                      )}
                    </td>

                    {/* Status */}
                    <td className={cn(tableTd, 'px-5')}>
                      <span className={statusChip}>{lead.status}</span>
                    </td>

                    {/* Actions */}
                    <td className={cn(tableTd, 'px-5')}>
                      <div className="flex items-center justify-end gap-1.5">
                        {lead.customerPhone && (
                          <a href={`tel:${lead.customerPhone}`} className={iconBtn} title="Direct Phone Call">
                            <Phone size={14} />
                          </a>
                        )}
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${waText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={iconBtn}
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </a>
                        )}
                        {lead.customerEmail && (
                          <a
                            href={`mailto:${lead.customerEmail}?subject=${encodeURIComponent(`Following up on ${lead.propertyTitle}`)}`}
                            className={iconBtn}
                            title="Send Direct Email"
                          >
                            <Mail size={14} />
                          </a>
                        )}
                        <button type="button" onClick={() => setSelectedLead(lead)} className={iconBtn} title="View Lead Details">
                          <Eye size={14} />
                        </button>

                        {isVisit && lead.status === 'scheduled' && (
                          <button
                            type="button"
                            onClick={() => updateVisitMutation.mutate({ id: lead.rawId, status: 'completed' })}
                            disabled={updateVisitMutation.isPending}
                            className="ml-1 px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-[#fff] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 size={12} /> Complete
                          </button>
                        )}

                        {isInquiry && lead.status === 'unread' && (
                          <button
                            type="button"
                            onClick={() => updateInquiryMutation.mutate({ id: lead.rawId, is_read: true })}
                            disabled={updateInquiryMutation.isPending}
                            className="ml-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] dark:text-emerald-950 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 size={12} /> Contacted
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {displayedLeads.length > 0 && (
          <div className="p-4 border-t border-[var(--color-border)]">
            <Pagination
              currentPage={page}
              totalPages={Math.max(1, Math.ceil(displayedLeads.length / pageSize))}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={(sz) => { setPageSize(sz); setPage(1); }}
              totalItems={displayedLeads.length}
              itemLabel="leads"
            />
          </div>
        )}
      </DashboardCard>

      {/* ━━━ 5. LEAD DETAILS MODAL ━━━ */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="border border-[var(--color-border)] rounded-2xl max-w-lg w-full p-6 sm:p-7 space-y-6 shadow-[var(--shadow-depth-3)] bg-[var(--color-bg-surface)] text-[var(--color-text-main)]">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={channelChip(selectedLead.channel)}>
                    {selectedLead.channel === 'visit' ? 'Showing Appointment' : selectedLead.channel === 'inquiry' ? 'Buyer Inquiry' : 'Wishlist Interest'}
                  </span>
                  <span className="text-xs text-[var(--color-text-dim)] font-mono">{selectedLead.dateLabel}</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text-main)] mt-1.5 flex items-center gap-2">
                  <User size={16} className="text-[var(--color-brand-emerald)]" /> {selectedLead.customerName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="p-1.5 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Target Property */}
            <div className="p-3.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--color-text-dim)] font-semibold block">Target Asset</span>
                <h4 className="text-sm font-bold text-[var(--color-text-main)] truncate">{selectedLead.propertyTitle}</h4>
              </div>
              {onListingClick && selectedLead.propertyId && (
                <button
                  type="button"
                  onClick={() => {
                    onListingClick(String(selectedLead.propertyId));
                    setSelectedLead(null);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--color-brand-emerald)] hover:bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <ExternalLink size={12} /> View
                </button>
              )}
            </div>

            {/* Contact Details Dock */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-dim)] font-bold block">
                Direct Contact Channels
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedLead.customerPhone ? (
                  <a
                    href={`tel:${selectedLead.customerPhone}`}
                    className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-[var(--color-brand-emerald)] text-xs font-mono font-bold flex items-center gap-2 transition-all"
                  >
                    <Phone size={14} /> {selectedLead.customerPhone}
                  </a>
                ) : (
                  <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-dim)] text-xs font-mono">
                    No phone recorded
                  </div>
                )}

                {selectedLead.customerPhone && (
                  <a
                    href={`https://wa.me/${selectedLead.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${selectedLead.customerName}, regarding your interest in ${selectedLead.propertyTitle} on Urugwiro...`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 border border-emerald-600 dark:border-emerald-500 text-[#fff] dark:text-emerald-950 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageCircle size={14} /> Open WhatsApp
                  </a>
                )}
              </div>

              {selectedLead.customerEmail && (
                <a
                  href={`mailto:${selectedLead.customerEmail}`}
                  className="p-3 rounded-xl bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-card-hover)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs flex items-center gap-2 transition-all"
                >
                  <Mail size={14} className="text-[var(--color-text-dim)]" /> {selectedLead.customerEmail}
                </a>
              )}
            </div>

            {/* Full Notes / Message */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-dim)] font-bold block">
                Customer Message & Inquiry Details
              </span>
              <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] leading-relaxed whitespace-pre-wrap">
                {selectedLead.notes}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
              >
                Close
              </button>

              {selectedLead.channel === 'visit' && (
                <button
                  type="button"
                  onClick={() => updateVisitMutation.mutate({ id: selectedLead.rawId, status: 'completed' })}
                  disabled={updateVisitMutation.isPending}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-[#fff] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  <CheckCircle2 size={13} /> Mark Tour Completed
                </button>
              )}

              {selectedLead.channel === 'inquiry' && selectedLead.status === 'unread' && (
                <button
                  type="button"
                  onClick={() => updateInquiryMutation.mutate({ id: selectedLead.rawId, is_read: true })}
                  disabled={updateInquiryMutation.isPending}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] dark:text-emerald-950 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  <CheckCircle2 size={13} /> Mark Contacted
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

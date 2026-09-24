import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Phone, MessageSquare, Mail, Calendar, Heart, Search,
  CheckCircle2, Clock, Building2, User, ExternalLink,
  ChevronDown, MessageCircle, Eye,
  Sparkles, RefreshCw
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { api } from '../../api/endpoints';

export type LeadChannel = 'all' | 'visits' | 'inquiries' | 'likes';

interface CustomerLeadsManagerProps {
  mode: 'seller' | 'admin';
  initialChannel?: LeadChannel;
  onListingClick?: (id: string) => void;
  title?: string;
  subtitle?: string;
}

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
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error('Failed to load showing visits:', err);
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
          return Array.isArray(res.data) ? res.data : [];
        } else {
          const res = await api.admin.enquiries();
          return Array.isArray(res.data?.enquiries) ? res.data.enquiries : (Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error('Failed to load inquiries:', err);
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
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error('Failed to load likes leads:', err);
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
      queryClient.invalidateQueries({ queryKey: [mode === 'seller' ? 'seller-visits' : 'admin-visits'] });
      setActionSuccess('Showing appointment updated successfully.');
      setTimeout(() => setActionSuccess(''), 3500);
      if (selectedLead) setSelectedLead(null);
    },
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
      queryClient.invalidateQueries({ queryKey: [mode === 'seller' ? 'seller-inquiries' : 'admin-enquiries-crm'] });
      setActionSuccess('Inquiry status updated.');
      setTimeout(() => setActionSuccess(''), 3500);
      if (selectedLead) setSelectedLead(null);
    },
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
      // Property filter
      if (selectedPropertyFilter !== 'all' && String(item.propertyId) !== selectedPropertyFilter) {
        return false;
      }

      // Search filter
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

  const isLoading = loadingVisits || loadingInquiries || loadingLikes;

  return (
    <div className="space-y-6 text-zinc-100">
      {/* ━━━ 1. CRM HEADER & TELEMETRY ━━━ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={13} /> {mode === 'seller' ? 'Seller Portfolio CRM' : 'Admin Sovereign CRM'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {title || (mode === 'seller' ? 'Customer Leads & Showing Requests' : 'Customer Enquiries & Showing Bureau')}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefreshAll}
            className="rounded-xl text-xs font-bold border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200"
          >
            <RefreshCw size={13} className={cn(isLoading && 'animate-spin')} /> Refresh Leads
          </Button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* ━━━ 2. UNIFIED KPI CARDS (MATCHING DESIGN & FONT SIZES) ━━━ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Showing Visits */}
        <div
          onClick={() => setActiveChannel('visits')}
          className={cn(
            "p-5 rounded-2xl border transition-all cursor-pointer backdrop-blur-xl group",
            activeChannel === 'visits'
              ? "border-sky-500/50 bg-sky-500/10 shadow-lg shadow-sky-500/10"
              : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Showing Visits
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Calendar size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
            {normalizedVisits.length}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Scheduled Tours</span>
        </div>

        {/* Metric 2: Inquiries */}
        <div
          onClick={() => setActiveChannel('inquiries')}
          className={cn(
            "p-5 rounded-2xl border transition-all cursor-pointer backdrop-blur-xl group",
            activeChannel === 'inquiries'
              ? "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
              : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Property Inquiries
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
            {normalizedInquiries.length}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Inbound Messages</span>
        </div>

        {/* Metric 3: Wishlist & Likes */}
        <div
          onClick={() => setActiveChannel('likes')}
          className={cn(
            "p-5 rounded-2xl border transition-all cursor-pointer backdrop-blur-xl group",
            activeChannel === 'likes'
              ? "border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/10"
              : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Wishlist & Saves
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Heart size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
            {normalizedLikes.length}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Client Saves</span>
        </div>

        {/* Metric 4: Total Phone Numbers */}
        <div
          onClick={() => setActiveChannel('all')}
          className={cn(
            "p-5 rounded-2xl border transition-all cursor-pointer backdrop-blur-xl group",
            activeChannel === 'all'
              ? "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
              : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Phones Captured
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Phone size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
            {totalPhonesCount}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Verified Phone Numbers</span>
        </div>
      </div>

      {/* ━━━ 3. CHANNEL TABS & FILTER TOOLBAR ━━━ */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-2 rounded-2xl border border-white/10 bg-white/[0.02]">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveChannel('all')}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeChannel === 'all'
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            )}
          >
            All Channels ({normalizedVisits.length + normalizedInquiries.length + normalizedLikes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveChannel('visits')}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              activeChannel === 'visits'
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            )}
          >
            <Calendar size={13} /> Showing Visits ({normalizedVisits.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveChannel('inquiries')}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              activeChannel === 'inquiries'
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            )}
          >
            <MessageSquare size={13} /> Inquiries ({normalizedInquiries.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveChannel('likes')}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              activeChannel === 'likes'
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            )}
          >
            <Heart size={13} /> Wishlist ({normalizedLikes.length})
          </button>
        </div>

        {/* Search & Property Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Property Dropdown Filter */}
          {propertiesList.length > 0 && (
            <div className="relative min-w-[200px]">
              <select
                value={selectedPropertyFilter}
                onChange={(e) => setSelectedPropertyFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 pr-8 text-xs font-medium text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="all" className="bg-[#0b101b] text-white">All Properties ({propertiesList.length})</option>
                {propertiesList.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0b101b] text-white">
                    {p.title.length > 32 ? `${p.title.slice(0, 32)}...` : p.title}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          )}

          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search name, phone, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3.5 py-2 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ━━━ 4. CUSTOMER LEADS LIST (USER-FRIENDLY DIRECT FOLLOW-UP LEDGER) ━━━ */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-20 text-center text-zinc-500 text-xs font-mono flex flex-col items-center justify-center gap-3">
            <Clock className="w-8 h-8 animate-spin text-emerald-400/50" />
            <span>Loading verified customer inquiries and showing bookings...</span>
          </div>
        ) : displayedLeads.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center text-zinc-400 space-y-3">
            <User size={36} className="mx-auto text-zinc-600" />
            <h3 className="text-base font-bold text-white">No customer leads match your filters</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              When prospective buyers request site inspections, send inquiry messages, or save properties to their wishlist, they will appear here with instant contact links.
            </p>
            {(selectedPropertyFilter !== 'all' || searchQuery.trim()) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSelectedPropertyFilter('all'); setSearchQuery(''); }}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          displayedLeads.map((lead: any) => {
            const isVisit = lead.channel === 'visit';
            const isInquiry = lead.channel === 'inquiry';
            const isLike = lead.channel === 'like';

            const cleanPhone = lead.customerPhone.replace(/[^0-9]/g, '');
            const waText = encodeURIComponent(
              `Hello ${lead.customerName}, I am reaching out from Urugwiro regarding ${lead.propertyTitle}. Are you available for a brief follow-up?`
            );

            return (
              <div
                key={lead.id}
                className={cn(
                  "rounded-2xl border transition-all p-4.5 sm:p-5 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-white/20",
                  isVisit && "border-sky-500/25 bg-sky-500/[0.03] hover:border-sky-500/40",
                  isInquiry && "border-emerald-500/25 bg-emerald-500/[0.03] hover:border-emerald-500/40",
                  isLike && "border-amber-500/25 bg-amber-500/[0.03] hover:border-amber-500/40"
                )}
              >
                {/* Left Content Column */}
                <div className="space-y-2 min-w-0 flex-1">
                  {/* Lead Metadata Header */}
                  <div className="flex flex-wrap items-center gap-2">
                    {isVisit && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                        <Calendar size={11} /> Showing Tour
                      </span>
                    )}
                    {isInquiry && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <MessageSquare size={11} /> Buyer Inquiry
                      </span>
                    )}
                    {isLike && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Heart size={11} /> Wishlist Save
                      </span>
                    )}

                    {/* Customer Name */}
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <User size={13} className="text-zinc-400" /> {lead.customerName}
                    </span>

                    {/* Property Link */}
                    <span className="text-xs text-zinc-500">•</span>
                    <button
                      type="button"
                      onClick={() => onListingClick && lead.propertyId && onListingClick(String(lead.propertyId))}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 truncate max-w-xs cursor-pointer text-left"
                      title="Inspect Property Listing"
                    >
                      <Building2 size={12} className="shrink-0" />
                      <span className="truncate">{lead.propertyTitle}</span>
                    </button>
                  </div>

                  {/* Activity Details (Titles & Badges Only - No Descriptions) */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {isVisit ? (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                        <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 font-semibold">
                          Inspection Date: <strong className="text-white">{lead.dateLabel}</strong>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 font-semibold">
                          Window: <strong className="text-white">{lead.timeSlot}</strong>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-zinc-300 border border-white/10 uppercase font-semibold">
                          Status: {lead.status}
                        </span>
                      </div>
                    ) : isInquiry ? (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                          Activity: Inbound Buyer Inquiry
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-zinc-300 border border-white/10 uppercase font-semibold">
                          Status: Active Lead
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                          Activity: Saved to Wishlist
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-zinc-300 border border-white/10 uppercase font-semibold">
                          Status: Interested Prospect
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Customer Email & Timestamp */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                    {lead.customerEmail && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-zinc-500" /> {lead.customerEmail}
                      </span>
                    )}
                    {lead.dateLabel && !isVisit && (
                      <>
                        <span className="text-zinc-600">•</span>
                        <span className="text-[11px] font-mono text-zinc-500">{lead.dateLabel}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Action Column: Direct Follow-Up Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center">
                  {/* Direct Phone Call */}
                  {lead.customerPhone ? (
                    <a
                      href={`tel:${lead.customerPhone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer"
                      title="Direct Phone Call"
                    >
                      <Phone size={13} />
                      <span>{lead.customerPhone}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-500 font-mono italic px-2 py-1">
                      No phone provided
                    </span>
                  )}

                  {/* Direct WhatsApp */}
                  {cleanPhone && (
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${waText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircle size={13} />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  {/* Direct Email */}
                  {lead.customerEmail && (
                    <a
                      href={`mailto:${lead.customerEmail}?subject=${encodeURIComponent(`Following up on ${lead.propertyTitle}`)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/10 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                      title="Send Direct Email"
                    >
                      <Mail size={13} />
                      <span>Email</span>
                    </a>
                  )}

                  {/* Inspect Details / Action Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedLead(lead)}
                    className="p-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="View Full Lead Dossier"
                  >
                    <Eye size={14} />
                  </button>

                  {/* Toggle Status Quick Actions */}
                  {isVisit && lead.status === 'scheduled' && (
                    <Button
                      size="sm"
                      onClick={() => updateVisitMutation.mutate({ id: lead.rawId, status: 'completed' })}
                      disabled={updateVisitMutation.isPending}
                      className="text-xs font-bold py-1.5 px-2.5 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 border border-sky-500/40"
                    >
                      <CheckCircle2 size={12} className="mr-1" /> Complete
                    </Button>
                  )}

                  {isInquiry && lead.status === 'unread' && (
                    <Button
                      size="sm"
                      onClick={() => updateInquiryMutation.mutate({ id: lead.rawId, is_read: true })}
                      disabled={updateInquiryMutation.isPending}
                      className="text-xs font-bold py-1.5 px-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40"
                    >
                      <CheckCircle2 size={12} className="mr-1" /> Mark Contacted
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ━━━ 5. LEAD DOSSIER MODAL ━━━ */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-6 shadow-2xl bg-[#090d16] text-white">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
                    {selectedLead.channel === 'visit' ? 'Showing Appointment' : selectedLead.channel === 'inquiry' ? 'Buyer Inquiry' : 'Wishlist Interest'}
                  </Badge>
                  <span className="text-xs text-zinc-500 font-mono">{selectedLead.dateLabel}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
                  <User size={16} className="text-emerald-400" /> {selectedLead.customerName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08]"
              >
                ✕
              </button>
            </div>

            {/* Target Property */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-semibold">Target Asset</span>
                <h4 className="text-sm font-bold text-white">{selectedLead.propertyTitle}</h4>
              </div>
              {onListingClick && selectedLead.propertyId && (
                <button
                  type="button"
                  onClick={() => {
                    onListingClick(String(selectedLead.propertyId));
                    setSelectedLead(null);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1"
                >
                  <ExternalLink size={12} /> View
                </button>
              )}
            </div>

            {/* Contact Details Dock */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                Direct Contact Channels
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedLead.customerPhone ? (
                  <a
                    href={`tel:${selectedLead.customerPhone}`}
                    className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-2 transition-all"
                  >
                    <Phone size={14} /> {selectedLead.customerPhone}
                  </a>
                ) : (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 text-zinc-500 text-xs font-mono">
                    No phone recorded
                  </div>
                )}

                {selectedLead.customerPhone && (
                  <a
                    href={`https://wa.me/${selectedLead.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${selectedLead.customerName}, regarding your interest in ${selectedLead.propertyTitle} on Urugwiro...`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageCircle size={14} /> Open WhatsApp
                  </a>
                )}
              </div>

              {selectedLead.customerEmail && (
                <a
                  href={`mailto:${selectedLead.customerEmail}`}
                  className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-zinc-300 text-xs flex items-center gap-2 transition-all"
                >
                  <Mail size={14} className="text-zinc-500" /> {selectedLead.customerEmail}
                </a>
              )}
            </div>

            {/* Full Notes / Message */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                Customer Message & Inquiry Details
              </span>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
                {selectedLead.notes}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLead(null)}
                className="text-xs font-bold text-zinc-400 hover:text-white"
              >
                Close
              </Button>

              {selectedLead.channel === 'visit' && (
                <Button
                  size="sm"
                  onClick={() => updateVisitMutation.mutate({ id: selectedLead.rawId, status: 'completed' })}
                  disabled={updateVisitMutation.isPending}
                  className="text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-xl"
                >
                  <CheckCircle2 size={13} className="mr-1" /> Mark Tour Completed
                </Button>
              )}

              {selectedLead.channel === 'inquiry' && selectedLead.status === 'unread' && (
                <Button
                  size="sm"
                  onClick={() => updateInquiryMutation.mutate({ id: selectedLead.rawId, is_read: true })}
                  disabled={updateInquiryMutation.isPending}
                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                >
                  <CheckCircle2 size={13} className="mr-1" /> Mark Contacted
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

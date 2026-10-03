import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle, Calendar, CheckCircle2, ChevronDown, ExternalLink,
  MailCheck, MessageSquare, Phone, RefreshCw, Users,
} from 'lucide-react';
import { api } from '../../api/endpoints';
import { cn } from '../../lib/utils';
import { CardHeader, DashboardCard, StatCard } from '../ui/Dashboard';
import { DataTable } from '../ui/DataTable';
import { StatusBadge } from '../ui/StatusBadge';

export type LeadChannel = 'all' | 'visits' | 'inquiries';

interface CustomerLeadsManagerProps {
  mode: 'seller' | 'admin';
  initialChannel?: LeadChannel;
  onListingClick?: (id: string) => void;
  title?: string;
  subtitle?: string;
}

interface Lead {
  id: string;
  rawId: number;
  channel: 'visit' | 'inquiry';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  propertyTitle: string;
  propertyId: string;
  status: string;
  dateLabel: string;
  notes: string;
}

const rowsFrom = (data: any): any[] => Array.isArray(data) ? data : data?.results || [];

const formatDate = (value: string) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const apiError = (error: any, fallback: string) =>
  error?.response?.data?.error || error?.response?.data?.detail || fallback;

export const CustomerLeadsManager: React.FC<CustomerLeadsManagerProps> = ({
  mode,
  initialChannel = 'all',
  onListingClick,
  title,
  subtitle,
}) => {
  const queryClient = useQueryClient();
  const [activeChannel, setActiveChannel] = useState<LeadChannel>(initialChannel);
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const queryScope = `${mode}-customer-leads`;

  const visitsQuery = useQuery({
    queryKey: [queryScope, 'visits'],
    queryFn: async () => {
      const response = mode === 'admin'
        ? await api.admin.visits({ page_size: '100' })
        : await api.seller.visits({ page_size: '100' });
      return rowsFrom(response.data);
    },
  });

  const inquiriesQuery = useQuery({
    queryKey: [queryScope, 'inquiries'],
    queryFn: async () => {
      const response = mode === 'admin'
        ? await api.admin.enquiries({ page_size: 100 })
        : await api.seller.inquiries({ page_size: '100' });
      return rowsFrom(response.data);
    },
  });

  const visits = useMemo<Lead[]>(() => (visitsQuery.data || []).map((visit: any) => ({
    id: `visit-${visit.id}`,
    rawId: visit.id,
    channel: 'visit',
    customerName: visit.customer_name || visit.name || 'Unknown customer',
    customerPhone: visit.phone || '',
    customerEmail: visit.email || '',
    propertyTitle: visit.listing_title || visit.listing?.title || 'Property',
    propertyId: String(visit.listing || visit.listing_id || ''),
    status: visit.status || 'requested',
    dateLabel: visit.confirmed_date || visit.preferred_date || visit.created_at || '',
    notes: visit.notes || '',
  })), [visitsQuery.data]);

  const inquiries = useMemo<Lead[]>(() => (inquiriesQuery.data || []).map((inquiry: any) => ({
    id: `inquiry-${inquiry.id}`,
    rawId: inquiry.id,
    channel: 'inquiry',
    customerName: inquiry.name || 'Unknown customer',
    customerPhone: inquiry.phone || '',
    customerEmail: inquiry.email || '',
    propertyTitle: inquiry.listing_title || inquiry.listing?.title || 'Property',
    propertyId: String(inquiry.listing || inquiry.listing_id || ''),
    status: inquiry.is_read ? 'contacted' : 'unread',
    dateLabel: inquiry.created_at || '',
    notes: inquiry.message || '',
  })), [inquiriesQuery.data]);

  const updateLead = useMutation({
    mutationFn: async (lead: Lead) => {
      if (lead.channel === 'visit') {
        return mode === 'admin'
          ? api.admin.updateVisit(lead.rawId, { status: 'completed' })
          : api.seller.updateVisit(lead.rawId, { status: 'completed' });
      }
      return mode === 'admin'
        ? api.admin.updateEnquiry(lead.rawId, { is_read: true })
        : api.seller.updateInquiry(lead.rawId, { is_read: true });
    },
    onSuccess: (_response, lead) => {
      queryClient.invalidateQueries({ queryKey: [queryScope, lead.channel === 'visit' ? 'visits' : 'inquiries'] });
      setFeedback({
        type: 'success',
        text: lead.channel === 'visit' ? 'Visit marked as completed.' : 'Inquiry marked as contacted.',
      });
    },
    onError: (error, lead) => setFeedback({
      type: 'error',
      text: apiError(error, lead.channel === 'visit' ? 'The visit could not be updated.' : 'The inquiry could not be updated.'),
    }),
  });

  const allLeads = useMemo(() => [...visits, ...inquiries], [visits, inquiries]);
  const displayedLeads = useMemo(() => {
    let leads = activeChannel === 'visits' ? visits : activeChannel === 'inquiries' ? inquiries : allLeads;
    if (selectedProperty !== 'all') {
      leads = leads.filter((lead) => lead.propertyId === selectedProperty);
    }
    return leads;
  }, [activeChannel, allLeads, inquiries, selectedProperty, visits]);

  const properties = useMemo(() => {
    const unique = new Map<string, string>();
    allLeads.forEach((lead) => {
      if (lead.propertyId) unique.set(lead.propertyId, lead.propertyTitle);
    });
    return Array.from(unique, ([id, propertyTitle]) => ({ id, propertyTitle }));
  }, [allLeads]);

  const contactableCount = allLeads.filter((lead) => Boolean(lead.customerPhone)).length;
  const isLoading = visitsQuery.isLoading || inquiriesQuery.isLoading;
  const isError = visitsQuery.isError || inquiriesQuery.isError;

  const refresh = () => {
    visitsQuery.refetch();
    inquiriesQuery.refetch();
  };

  const switchChannel = (channel: LeadChannel) => {
    setActiveChannel(channel);
    setFeedback(null);
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'customerName', id: 'customer', header: 'Customer', cell: ({ row }: any) => (
        <div>
          <p className="font-semibold text-[var(--color-text-main)]">{row.original.customerName}</p>
          {row.original.customerPhone && <p className="text-xs text-[var(--color-text-muted)]">{row.original.customerPhone}</p>}
          {!row.original.customerPhone && row.original.customerEmail && <p className="text-xs text-[var(--color-text-muted)]">{row.original.customerEmail}</p>}
        </div>
      ),
    },
    {
      accessorKey: 'channel', id: 'channel', header: 'Channel', cell: ({ row }: any) => row.original.channel === 'visit'
        ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300"><Calendar size={13} />Visit</span>
        : <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><MessageSquare size={13} />Inquiry</span>,
    },
    { accessorKey: 'propertyTitle', id: 'property', header: 'Property' },
    { accessorKey: 'status', id: 'status', header: 'Status', cell: ({ row }: any) => <StatusBadge status={row.original.status} size="sm" /> },
    { accessorKey: 'dateLabel', id: 'date', header: 'Date', cell: ({ row }: any) => <span className="text-xs text-[var(--color-text-muted)]">{formatDate(row.original.dateLabel)}</span> },
    { accessorKey: 'notes', id: 'notes', header: 'Notes', cell: ({ row }: any) => <span className="block max-w-xs truncate text-xs text-[var(--color-text-muted)]">{row.original.notes || '-'}</span> },
    {
      id: 'actions', header: '', cell: ({ row }: any) => {
        const lead = row.original as Lead;
        const isComplete = lead.channel === 'visit'
          ? ['completed', 'cancelled', 'no_show'].includes(lead.status)
          : lead.status === 'contacted';
        return (
          <div className="flex justify-end gap-1">
            {!isComplete && (
              <button type="button" onClick={() => updateLead.mutate(lead)} disabled={updateLead.isPending} className="rounded-lg p-2 text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-elevated)] hover:text-emerald-600 disabled:opacity-50" title={lead.channel === 'visit' ? 'Mark visit completed' : 'Mark inquiry contacted'} aria-label={lead.channel === 'visit' ? 'Mark visit completed' : 'Mark inquiry contacted'}>
                {lead.channel === 'visit' ? <CheckCircle2 size={16} /> : <MailCheck size={16} />}
              </button>
            )}
            {onListingClick && lead.propertyId && (
              <button type="button" onClick={() => onListingClick(lead.propertyId)} className="rounded-lg p-2 text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-main)]" title="View property" aria-label="View property"><ExternalLink size={16} /></button>
            )}
          </div>
        );
      },
    },
  ], [onListingClick, updateLead]);

  return (
    <div className="space-y-6 text-[var(--color-text-main)]">
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--color-border)] pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">{title || (mode === 'seller' ? 'Customer enquiries and visits' : 'Marketplace enquiries and visits')}</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{subtitle || 'Review direct enquiries and scheduled property visits.'}</p>
        </div>
        <button type="button" onClick={refresh} className="flex self-start items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-main)]">
          <RefreshCw size={14} className={cn(isLoading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {feedback && (
        <div role="status" className={cn(
          'flex items-center gap-2 rounded-lg border px-4 py-3 text-sm',
          feedback.type === 'success'
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
            : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
        )}>{feedback.type === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}{feedback.text}</div>
      )}

      {isError && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <span className="flex items-center gap-2"><AlertCircle size={17} />Some lead records could not be loaded.</span>
          <button type="button" onClick={refresh} className="font-semibold underline">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Visits" value={visits.length} sub="Property appointments" icon={Calendar} tone="blue" onClick={() => switchChannel('visits')} className={cn(activeChannel === 'visits' && 'border-sky-500/50')} />
        <StatCard label="Inquiries" value={inquiries.length} sub="Direct messages" icon={MessageSquare} tone="emerald" onClick={() => switchChannel('inquiries')} className={cn(activeChannel === 'inquiries' && 'border-emerald-500/50')} />
        <StatCard label="Phone provided" value={contactableCount} sub="Across these records" icon={Phone} tone="neutral" onClick={() => switchChannel('all')} className={cn(activeChannel === 'all' && 'border-emerald-500/50')} />
      </div>

      <DashboardCard className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-1">
          {([
            ['all', 'All', Users],
            ['visits', 'Visits', Calendar],
            ['inquiries', 'Inquiries', MessageSquare],
          ] as const).map(([id, label, Icon]) => (
            <button key={id} type="button" onClick={() => switchChannel(id)} className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition',
              activeChannel === id ? 'bg-emerald-600 text-white' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]',
            )}><Icon size={13} />{label}</button>
          ))}
        </div>
        {properties.length > 0 && (
          <div className="relative sm:min-w-56">
            <select value={selectedProperty} onChange={(event) => setSelectedProperty(event.target.value)} className="h-10 w-full appearance-none rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 pr-8 text-xs text-[var(--color-text-main)] outline-none focus:border-emerald-500">
              <option value="all">All properties</option>
              {properties.map((property) => <option key={property.id} value={property.id}>{property.propertyTitle}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
          </div>
        )}
      </DashboardCard>

      <DashboardCard className="overflow-hidden">
        <CardHeader icon={Users} title="Lead records" subtitle={`${displayedLeads.length} direct customer ${displayedLeads.length === 1 ? 'record' : 'records'}`} />
        <DataTable
          data={displayedLeads}
          columns={columns}
          searchKeys={['customerName', 'customerPhone', 'customerEmail', 'propertyTitle', 'notes']}
          searchPlaceholder="Search customer, contact, property, or notes"
          emptyTitle="No lead records found"
          emptyDescription="Direct enquiries and scheduled visits will appear here."
          isLoading={isLoading}
          showBulkActions={false}
          showDensityToggle
          showColumnToggle
          pageSize={10}
        />
      </DashboardCard>
    </div>
  );
};

export default CustomerLeadsManager;

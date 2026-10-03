import React, { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Eye,
  Search,
  CheckCircle2,
  Calendar,
  Building2,
  ShieldCheck,
  MapPin,
  Users,
} from 'lucide-react';
import { cn, logError } from '../../lib/utils';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';

import { api } from '../../api/endpoints';
import { CustomerLeadsManager, type LeadChannel } from '../../components/crm/CustomerLeadsManager';

export type AdminEnquirySection = 'leads' | 'visits' | 'inquiries' | 'proposals';

export const AdminEnquiries: React.FC = () => {
  // Mode: New Listings vs Customers tabs
  const [section, setSection] = useState<AdminEnquirySection>('leads');

  // Proposal State
  const [proposalFilter, setProposalFilter] = useState('all');
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);

  const proposalsQuery = useQuery({
    queryKey: ['admin-proposals', proposalFilter, deferredSearch],
    queryFn: async () => {
      const res = await api.proposals.list({
        status: proposalFilter !== 'all' ? proposalFilter : undefined,
        search: deferredSearch || undefined,
      });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    },
    enabled: section === 'proposals',
  });
  const proposals = proposalsQuery.data || [];
  const refetchProposals = proposalsQuery.refetch;

  // Actions for Proposals
  const handleConfirmVisit = useCallback(async (id: number) => {
    setActionLoading(true);
    setActionError('');
    try {
      await api.proposals.update(id, { status: 'visit_scheduled' });
      setActionSuccess('Physical surveyor visit confirmed. Status updated to Visit Scheduled.');
      refetchProposals();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      logError('Failed to confirm visit:', err);
      setActionError('The visit could not be confirmed.');
    } finally {
      setActionLoading(false);
    }
  }, [refetchProposals]);

  const handleConvertToLiveListing = useCallback(async (id: number) => {
    if (!window.confirm('Convert this verified proposal into a live marketplace listing?')) return;
    setActionLoading(true);
    setActionError('');
    try {
      const res = await api.proposals.convert(id);
      setActionSuccess(`Proposal converted successfully! Official Listing ID: ${res.data?.listing_id}`);
      refetchProposals();
      setSelectedProposal(null);
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'The proposal could not be converted.');
    } finally {
      setActionLoading(false);
    }
  }, [refetchProposals]);

  const proposalColumns = useMemo(() => [
    { accessorKey: 'proposal_code', id: 'code', header: 'Code', cell: ({ row }: any) => (
      <div>
        <span className="font-mono font-bold text-[var(--color-brand-emerald)]">{row.original.proposal_code}</span>
        <span className="block text-[10px] font-sans font-normal text-[var(--color-text-dim)] mt-0.5">{new Date(row.original.created_at).toLocaleDateString()}</span>
      </div>
    ) },
    { accessorKey: 'title', id: 'asset', header: 'Asset & UPI', cell: ({ row }: any) => (
      <div>
        <div className="font-bold text-[var(--color-text-main)] truncate">{row.original.title}</div>
        <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5 mt-0.5">
          <MapPin size={12} className="text-[var(--color-text-dim)] shrink-0" />
          <span>{row.original.district}</span>
          {row.original.sector && <span>• {row.original.sector}</span>}
        </div>
        {row.original.land_upi && (
          <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-[var(--color-brand-emerald)]">
            <ShieldCheck size={11} /> UPI: {row.original.land_upi}
          </div>
        )}
      </div>
    ) },
    { accessorKey: 'full_name', id: 'owner', header: 'Owner', cell: ({ row }: any) => (
      <div>
        <div className="font-medium text-[var(--color-text-main)]">{row.original.full_name}</div>
        <div className="text-xs text-[var(--color-text-muted)]">{row.original.phone || '-'}</div>
      </div>
    ) },
    { accessorKey: 'price', id: 'price', header: 'Price', cell: ({ row }: any) => (
      <span className="font-mono font-bold text-[var(--color-text-main)]">{Number(row.original.price || 0).toLocaleString()} RWF</span>
    ) },
    { accessorKey: 'preferred_date', id: 'visit', header: 'Visit', cell: ({ row }: any) => (
      <span className="text-xs text-[var(--color-text-muted)]">{row.original.preferred_date || '-'}</span>
    ) },
    { accessorKey: 'status', id: 'status', header: 'Status', cell: ({ row }: any) => {
      const status = row.original.status;
      const variant = status === 'approved' ? 'published' : status === 'visit_scheduled' ? 'pending' : status === 'pending' ? 'draft' : 'draft';
      return <StatusBadge status={variant} size="sm" />;
    } },
    { id: 'actions', header: '', cell: ({ row }: any) => (
      <div className="flex items-center justify-end gap-1.5">
        <button onClick={() => setSelectedProposal(row.original)} className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors" title="View"><Eye size={14} /></button>
        {row.original.status === 'pending' && (
          <button onClick={() => handleConfirmVisit(row.original.id)} className="px-2 py-1 text-[11px] rounded-lg bg-[var(--color-bg-elevated)] hover:bg-emerald-600 hover:text-white text-[var(--color-text-muted)] font-semibold transition-all">Confirm</button>
        )}
        {row.original.status === 'visit_scheduled' && (
          <button onClick={() => handleConvertToLiveListing(row.original.id)} className="px-2 py-1 text-[11px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all">Convert</button>
        )}
      </div>
    ) },
  ], [handleConfirmVisit, handleConvertToLiveListing]);


  const pendingCount = proposals.filter(p => p.status === 'pending').length;
  const visitCount = proposals.filter(p => p.status === 'visit_scheduled').length;
  const approvedCount = proposals.filter(p => p.status === 'approved').length;

  return (
    <div className="p-6 lg:p-10 bg-[var(--color-bg-deep)] min-h-screen text-[var(--color-text-muted)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[var(--color-brand-emerald)] text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck size={14} /> Customers & New Listings
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--color-text-main)] font-display">
              Customers & <span className="text-[var(--color-brand-emerald)]">Listing Intake</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
              Manage property inquiries, booked visits, saved listings, and new property submissions.
            </p>
          </div>

          {/* Section Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
            <button
              type="button"
              onClick={() => setSection('leads')}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                section !== 'proposals'
                  ? "bg-emerald-600 text-[#fff] shadow-[var(--shadow-emerald-soft)] dark:bg-emerald-500"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-card-hover)]"
              )}
            >
              <Users size={14} />
              <span>Customers</span>
            </button>

            <button
              type="button"
              onClick={() => setSection('proposals')}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                section === 'proposals'
                  ? "bg-emerald-600 text-[#fff] shadow-[var(--shadow-emerald-soft)] dark:bg-emerald-500"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-card-hover)]"
              )}
            >
              <Building2 size={14} />
              <span>New Listings</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-700 text-[10px] font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[var(--color-brand-emerald)] text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 size={18} className="text-[var(--color-brand-emerald)] shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div role="alert" className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
            <span className="font-semibold">{actionError}</span>
          </div>
        )}

        {/* ━━━ SECTION 1: NEW LISTINGS SUBMISSIONS & REVIEW QUEUE ━━━ */}
        {section === 'proposals' && (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-depth-1)]">
                <span className="text-[var(--color-text-dim)] text-xs font-bold uppercase tracking-wider">Awaiting Review</span>
                <div className="flex items-end justify-between mt-2">
                  <h3 className="text-3xl font-bold text-[var(--color-text-main)] font-mono">{pendingCount}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 text-xs font-bold">Pending</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-depth-1)]">
                <span className="text-[var(--color-text-dim)] text-xs font-bold uppercase tracking-wider">Visits Scheduled</span>
                <div className="flex items-end justify-between mt-2">
                  <h3 className="text-3xl font-bold text-[var(--color-text-main)] font-mono">{visitCount}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 text-xs font-bold">Scheduled</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-depth-1)]">
                <span className="text-[var(--color-text-dim)] text-xs font-bold uppercase tracking-wider">Published Live</span>
                <div className="flex items-end justify-between mt-2">
                  <h3 className="text-3xl font-bold text-[var(--color-text-main)] font-mono">{approvedCount}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-[var(--color-brand-emerald)] text-xs font-bold">Approved</span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
                <input
                  type="text"
                  placeholder="Search by title, owner, UPI, code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Status Pill Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
                {[
                  { id: 'all', label: 'All Submissions' },
                  { id: 'pending', label: 'Awaiting Review' },
                  { id: 'visit_scheduled', label: 'Visit Scheduled' },
                  { id: 'approved', label: 'Published' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setProposalFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      proposalFilter === f.id
                        ? 'bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] border border-emerald-500/40'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-card-hover)] border border-transparent'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Proposals Table */}
            <DataTable
              data={proposals}
              columns={proposalColumns}
              searchKeys={['title', 'full_name', 'proposal_code']}
              searchPlaceholder="Search by title, owner, UPI, code..."
              emptyTitle="No submissions found"
              emptyDescription="No submissions match the current filters."
              isLoading={proposalsQuery.isLoading}
              showBulkActions={false}
              showDensityToggle={true}
              showColumnToggle={true}
              pageSize={10}
            />
            {proposalsQuery.isError && (
              <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                <span>Listing submissions could not be loaded.</span>
                <button type="button" onClick={() => refetchProposals()} className="font-semibold underline">Retry</button>
              </div>
            )}
          </div>
        )}

        {/* ━━━ SECTION 2: CUSTOMERS — VISITS, INQUIRIES, SAVED LISTINGS ━━━ */}
        {section !== 'proposals' && (
          <div className="space-y-6">
            <CustomerLeadsManager
              mode="admin"
              initialChannel={section === 'leads' ? 'all' : (section as LeadChannel)}
              title="Customers"
              subtitle="Review direct property inquiries and booked visits."
            />
          </div>
        )}

        {/* ━━━ PROPOSAL DETAILS MODAL ━━━ */}
        {selectedProposal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-2xl rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 sm:p-8 shadow-[var(--shadow-depth-1)] space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4">
                <div>
                  <span className="font-mono text-[var(--color-brand-emerald)] font-bold text-xs">
                    {selectedProposal.proposal_code}
                  </span>
                  <h3 className="text-xl font-bold text-[var(--color-text-main)] mt-0.5">
                    {selectedProposal.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    Submitted on {new Date(selectedProposal.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProposal(null)}
                  className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-bg-elevated)]"
                >
                  ✕
                </button>
              </div>

              {/* Owner Contact */}
              <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[var(--color-text-dim)] font-bold uppercase text-[10px] block">Owner / Submitter</span>
                  <span className="font-semibold text-[var(--color-text-main)] text-sm">{selectedProposal.full_name}</span>
                  <span className="block text-[var(--color-text-muted)] capitalize">{selectedProposal.relationship_label || selectedProposal.owner_relationship}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-dim)] font-bold uppercase text-[10px] block">Contact Channels</span>
                  <a href={`tel:${selectedProposal.phone_number}`} className="text-[var(--color-brand-emerald)] font-mono block hover:underline">
                    {selectedProposal.phone_number}
                  </a>
                  <a href={`mailto:${selectedProposal.email}`} className="text-[var(--color-text-muted)] block hover:underline truncate">
                    {selectedProposal.email}
                  </a>
                </div>
              </div>

              {/* Asset & Domain-Specific Model Details */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">
                  {selectedProposal.asset_type === 'vehicle' ? 'Vehicle Specifications & Technical Audit' : 'Cadastre & Asset Specifications'}
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                    <span className="text-[var(--color-text-dim)] block text-[10px]">Asking Price</span>
                    <span className="font-mono font-bold text-[var(--color-text-main)] text-sm">
                      {Number(selectedProposal.proposed_price).toLocaleString()} {selectedProposal.currency}
                    </span>
                  </div>

                  {selectedProposal.asset_type === 'vehicle' ? (
                    <>
                      <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-dim)] block text-[10px]">Make & Model</span>
                        <span className="font-bold text-[var(--color-brand-emerald)] truncate block">
                          {selectedProposal.specifications?.make || 'Vehicle'} {selectedProposal.specifications?.model || ''}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-dim)] block text-[10px]">Year / Mileage</span>
                        <span className="font-bold text-[var(--color-text-main)]">
                          {selectedProposal.specifications?.year || 'N/A'} • {selectedProposal.specifications?.mileage ? `${Number(selectedProposal.specifications.mileage).toLocaleString()} km` : '0 km'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-dim)] block text-[10px]">Transmission / Fuel</span>
                        <span className="font-bold text-[var(--color-text-main)]">
                          {selectedProposal.specifications?.transmission || 'Auto'} • {selectedProposal.specifications?.fuel_type || 'Petrol'}
                        </span>
                      </div>
                    </>
                  ) : selectedProposal.asset_type === 'land' ? (
                    <>
                      <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-dim)] block text-[10px]">Land UPI</span>
                        <span className="font-mono font-bold text-[var(--color-brand-emerald)] truncate block">
                          {selectedProposal.land_upi || 'None'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-dim)] block text-[10px]">Total Land Area</span>
                        <span className="font-bold text-[var(--color-text-main)]">
                          {selectedProposal.size_sqm ? `${selectedProposal.size_sqm} m²` : 'N/A'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-dim)] block text-[10px]">Zoning & Terrain</span>
                        <span className="font-bold text-[var(--color-text-main)]">
                          {selectedProposal.specifications?.zoning_code || 'R1'} • {selectedProposal.specifications?.terrain || 'Flat'}
                        </span>
                      </div>
                    </>
                  ) : selectedProposal.asset_type === 'commercial' ? (
                    <>
                      <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-dim)] block text-[10px]">Land UPI</span>
                        <span className="font-mono font-bold text-[var(--color-brand-emerald)] truncate block">
                          {selectedProposal.land_upi || 'None'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-dim)] block text-[10px]">Gross Area</span>
                        <span className="font-bold text-[var(--color-text-main)]">
                          {selectedProposal.size_sqm ? `${selectedProposal.size_sqm} m²` : 'N/A'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-dim)] block text-[10px]">Floors / Parking</span>
                        <span className="font-bold text-[var(--color-text-main)]">
                          {selectedProposal.specifications?.total_floors || '1'} Flr • {selectedProposal.specifications?.parking_spaces || '0'} Bays
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-dim)] block text-[10px]">Land UPI</span>
                        <span className="font-mono font-bold text-[var(--color-brand-emerald)] truncate block">
                          {selectedProposal.land_upi || 'None'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-dim)] block text-[10px]">Area</span>
                        <span className="font-bold text-[var(--color-text-main)]">
                          {selectedProposal.size_sqm ? `${selectedProposal.size_sqm} m²` : 'N/A'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-dim)] block text-[10px]">Rooms</span>
                        <span className="font-bold text-[var(--color-text-main)]">
                          {selectedProposal.bedrooms ? `${selectedProposal.bedrooms} Bed, ${selectedProposal.bathrooms} Bath` : 'N/A'}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
                  <span className="text-[var(--color-text-dim)] block text-[10px] mb-1">Full Location Address</span>
                  {selectedProposal.address}, {selectedProposal.cell && `${selectedProposal.cell}, `}{selectedProposal.sector && `${selectedProposal.sector}, `}{selectedProposal.district}
                </div>

                {selectedProposal.description && (
                  <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
                    <span className="text-[var(--color-text-dim)] block text-[10px] mb-1">Owner Highlights</span>
                    {selectedProposal.description}
                  </div>
                )}
              </div>

              {/* Physical Visit Schedule */}
              <div className="p-4 rounded-2xl border border-sky-200 bg-sky-50 dark:border-sky-500/20 dark:bg-sky-500/[0.03] space-y-2 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block flex items-center gap-1.5">
                  <Calendar size={14} /> Scheduled Physical Surveyor Inspection
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[var(--color-text-dim)] text-[10px] block">Requested Date</span>
                    <span className="font-semibold text-[var(--color-text-main)]">{selectedProposal.preferred_visit_date || 'Flexible'}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-dim)] text-[10px] block">Time Window</span>
                    <span className="font-semibold text-[var(--color-text-main)] capitalize">{selectedProposal.preferred_time_slot}</span>
                  </div>
                </div>
                {selectedProposal.site_access_notes && (
                  <div className="pt-2 border-t border-[var(--color-border)] text-[var(--color-text-muted)]">
                    <span className="text-[var(--color-text-dim)] text-[10px] block">Access Notes / Caretaker</span>
                    {selectedProposal.site_contact_name && <span className="text-[var(--color-text-main)] block">{selectedProposal.site_contact_name} ({selectedProposal.site_contact_phone})</span>}
                    {selectedProposal.site_access_notes}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProposal(null)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {selectedProposal.status === 'pending' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleConfirmVisit(selectedProposal.id)}
                      className="px-4 py-2.5 rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-300 font-bold text-xs hover:bg-sky-500/20"
                    >
                      Confirm Visit Date
                    </button>
                  )}

                  {selectedProposal.status !== 'approved' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleConvertToLiveListing(selectedProposal.id)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] font-bold text-xs shadow-[var(--shadow-emerald-soft)]"
                    >
                      Convert to Live Listing
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminEnquiries;

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Mail,
  Eye,
  Search,
  CheckCircle2,
  Reply,
  Calendar,
  Clock,
  Phone,
  Building2,
  ShieldCheck,
  Car,
  RefreshCw,
  MapPin,
  Users,
  Heart,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { tableHead, tableTh, tableBody, tableTr } from '../../components/ui/Dashboard';

import { api } from '../../api/endpoints';
import { Pagination } from '../../components/ui/Pagination';
import { CustomerLeadsManager, type LeadChannel } from '../../components/crm/CustomerLeadsManager';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  propertyTitle: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  createdAt?: string;
}

export type AdminEnquirySection = 'leads' | 'visits' | 'inquiries' | 'likes' | 'proposals';

export const AdminEnquiries: React.FC = () => {
  // Mode: Proposals Intake vs Customer CRM Channels
  const [section, setSection] = useState<AdminEnquirySection>('leads');

  // Proposal State
  const [proposals, setProposals] = useState<any[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [proposalFilter, setProposalFilter] = useState('all');
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [proposalPage, setProposalPage] = useState(1);
  const [proposalPageSize, setProposalPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProposals = async () => {
    setLoadingProposals(true);
    try {
      const res = await api.proposals.list({
        status: proposalFilter !== 'all' ? proposalFilter : undefined,
        search: searchQuery || undefined,
      });
      setProposals(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch proposals:', err);
    } finally {
      setLoadingProposals(false);
    }
  };

  useEffect(() => {
    if (section === 'proposals') {
      fetchProposals();
    }
  }, [section, proposalFilter, searchQuery]);

  const paginatedProposals = proposals.slice(
    (proposalPage - 1) * proposalPageSize,
    proposalPage * proposalPageSize
  );

  // Actions for Proposals
  const handleConfirmVisit = async (id: number) => {
    setActionLoading(true);
    try {
      await api.proposals.update(id, { status: 'visit_scheduled' });
      setActionSuccess('Physical surveyor visit confirmed. Status updated to Visit Scheduled.');
      fetchProposals();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to confirm visit:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToLiveListing = async (id: number) => {
    if (!window.confirm('Convert this verified proposal into a live marketplace listing?')) return;
    setActionLoading(true);
    try {
      const res = await api.proposals.convert(id);
      setActionSuccess(`Proposal converted successfully! Official Listing ID: ${res.data?.listing_id}`);
      fetchProposals();
      setSelectedProposal(null);
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to convert proposal to listing');
    } finally {
      setActionLoading(false);
    }
  };


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
              <ShieldCheck size={14} /> Intake & Customer Communication Hub
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--color-text-main)] font-display">
              Customer Leads & <span className="text-[var(--color-brand-emerald)]">Communication Hub</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
              Platform-wide customer showing visits, property inquiries, wishlist leads, and intake proposals.
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
              <span>Customer Leads CRM</span>
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
              <span>Asset Proposals</span>
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

        {/* ━━━ SECTION 1: ASSET PROPOSALS & PHYSICAL INSPECTION QUEUE ━━━ */}
        {section === 'proposals' && (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-depth-1)]">
                <span className="text-[var(--color-text-dim)] text-xs font-bold uppercase tracking-wider">Awaiting Cadastre Review</span>
                <div className="flex items-end justify-between mt-2">
                  <h3 className="text-3xl font-bold text-[var(--color-text-main)] font-mono">{pendingCount}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 text-xs font-bold">Pending</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-depth-1)]">
                <span className="text-[var(--color-text-dim)] text-xs font-bold uppercase tracking-wider">Physical Visits Scheduled</span>
                <div className="flex items-end justify-between mt-2">
                  <h3 className="text-3xl font-bold text-[var(--color-text-main)] font-mono">{visitCount}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 text-xs font-bold">Field Dispatch</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-depth-1)]">
                <span className="text-[var(--color-text-dim)] text-xs font-bold uppercase tracking-wider">Converted To Live Listings</span>
                <div className="flex items-end justify-between mt-2">
                  <h3 className="text-3xl font-bold text-[var(--color-text-main)] font-mono">{approvedCount}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-[var(--color-brand-emerald)] text-xs font-bold">Trust Verified</span>
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
                  { id: 'all', label: 'All Proposals' },
                  { id: 'pending', label: 'Pending Review' },
                  { id: 'visit_scheduled', label: 'Visit Scheduled' },
                  { id: 'approved', label: 'Converted' },
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
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden shadow-[var(--shadow-depth-1)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead className={tableHead}>
                    <tr>
                      <th className={tableTh}>Proposal Code</th>
                      <th className={tableTh}>Asset & Cadastre UPI</th>
                      <th className={tableTh}>Owner / Submitter</th>
                      <th className={tableTh}>Asking Price</th>
                      <th className={tableTh}>Requested Visit</th>
                      <th className={cn(tableTh, 'text-center')}>Status</th>
                      <th className={cn(tableTh, 'text-right')}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={tableBody}>
                    {paginatedProposals.map((prop) => (
                      <tr key={prop.id} className={cn(tableTr, 'group')}>
                        {/* Code */}
                        <td className="px-5 py-4 font-mono font-bold text-[var(--color-text-main)] whitespace-nowrap">
                          <span className="text-[var(--color-brand-emerald)]">{prop.proposal_code}</span>
                          <span className="block text-[10px] font-sans font-normal text-[var(--color-text-dim)] mt-0.5">
                            {new Date(prop.created_at).toLocaleDateString()}
                          </span>
                        </td>

                        {/* Asset Title & UPI */}
                        <td className="px-5 py-4 max-w-xs">
                          <div className="font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-brand-emerald)] transition-colors truncate">
                            {prop.title}
                          </div>
                          <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5 mt-0.5">
                            <MapPin size={12} className="text-[var(--color-text-dim)] shrink-0" />
                            <span>{prop.district}</span>
                            {prop.sector && <span>• {prop.sector}</span>}
                          </div>
                          {prop.asset_type === 'vehicle' ? (
                            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-[10px] font-mono text-sky-700 dark:bg-sky-500/10 dark:border-sky-500/20 dark:text-sky-400">
                              <Car size={11} /> {prop.specifications?.make || 'Vehicle'} {prop.specifications?.model || ''} ({prop.specifications?.year || ''})
                            </div>
                          ) : prop.land_upi ? (
                            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-[var(--color-brand-emerald)]">
                              <ShieldCheck size={11} /> UPI: {prop.land_upi}
                            </div>
                          ) : (
                            <span className="text-[10px] text-[var(--color-text-dim)] block mt-1">UPI pending</span>
                          )}
                        </td>

                        {/* Owner */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="font-medium text-[var(--color-text-main)]">{prop.full_name}</div>
                          <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                            <Phone size={11} className="text-[var(--color-text-dim)]" />
                            <span>{prop.phone_number}</span>
                          </div>
                          <div className="text-[10px] text-[var(--color-text-dim)] mt-0.5 capitalize">
                            {prop.relationship_label || prop.owner_relationship.replace('_', ' ')}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-5 py-4 font-mono font-bold text-[var(--color-text-main)] whitespace-nowrap">
                          {Number(prop.proposed_price).toLocaleString()} {prop.currency}
                          <span className="block text-[10px] font-sans font-normal text-[var(--color-text-dim)] mt-0.5 capitalize">
                            For {prop.purpose}
                          </span>
                        </td>

                        {/* Requested Visit */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {prop.preferred_visit_date ? (
                            <div>
                              <div className="flex items-center gap-1.5 text-[var(--color-text-main)] font-medium">
                                <Calendar size={13} className="text-[var(--color-brand-emerald)]" />
                                <span>{prop.preferred_visit_date}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] mt-0.5">
                                <Clock size={11} />
                                <span className="capitalize">{prop.preferred_time_slot}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[var(--color-text-dim)] text-xs">Unspecified</span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              prop.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30'
                                : prop.status === 'visit_scheduled'
                                ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30'
                                : prop.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-[var(--color-brand-emerald)] dark:border-emerald-500/30'
                                : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border)]'
                            }`}
                          >
                            {prop.status_label || prop.status.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Modal */}
                            <button
                              type="button"
                              onClick={() => setSelectedProposal(prop)}
                              className="p-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-border-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
                              title="Inspect Details"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Confirm Visit */}
                            {prop.status === 'pending' && (
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleConfirmVisit(prop.id)}
                                className="px-2.5 py-1 rounded-lg border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-semibold text-[11px] transition-colors cursor-pointer"
                                title="Confirm visit date with owner"
                              >
                                Confirm Visit
                              </button>
                            )}

                            {/* Convert to Live Listing */}
                            {prop.status !== 'approved' && (
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleConvertToLiveListing(prop.id)}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] font-bold text-[11px] shadow-[var(--shadow-emerald-soft)] transition-all cursor-pointer"
                                title="Approve and convert to official marketplace listing"
                              >
                                Publish Listing
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {proposals.length === 0 && !loadingProposals && (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-[var(--color-text-dim)]">
                          <Building2 size={36} className="mx-auto mb-2 text-[var(--color-text-dim)]" />
                          <p>No asset proposals found matching this filter.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-[var(--color-border)]">
                <Pagination
                  currentPage={proposalPage}
                  totalPages={Math.max(1, Math.ceil(proposals.length / proposalPageSize))}
                  onPageChange={setProposalPage}
                  pageSize={proposalPageSize}
                  onPageSizeChange={(sz) => { setProposalPageSize(sz); setProposalPage(1); }}
                  totalItems={proposals.length}
                />
              </div>
            </div>
          </div>
        )}

        {/* ━━━ SECTION 2: CUSTOMER LEADS CRM (SHOWING VISITS, INQUIRIES, WISHLIST) ━━━ */}
        {section !== 'proposals' && (
          <div className="space-y-6">
            <CustomerLeadsManager
              mode="admin"
              initialChannel={section === 'leads' ? 'all' : (section as LeadChannel)}
              title="Platform Customer Leads CRM"
              subtitle="Manage prospects who scheduled showing inspections, submitted inquiries, or wishlisted assets."
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

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Eye,
  Archive,
  Trash2,
  Search,
  CheckCircle2,
  Reply,
  Calendar,
  Clock,
  Phone,
  Building2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MapPin,
  FileText,
  User,
  Check,
  AlertCircle,
  Car,
  Layers
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';
import { api } from '../../api/endpoints';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  propertyTitle: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
}

const MOCK_ENQUIRIES: Enquiry[] = [
  { id: '1', name: 'Jean Paul', email: 'jp@example.com', propertyTitle: 'Modern Villa Kicukiro', message: 'I am interested in this property. Is the price negotiable?', status: 'unread', createdAt: '2026-09-18T10:00:00Z' },
  { id: '2', name: 'Marie Claire', email: 'mc@example.com', propertyTitle: 'Prime Plot Gasabo', message: 'Does this plot have a registered title deed?', status: 'read', createdAt: '2026-09-17T14:30:00Z' },
  { id: '3', name: 'Eric Kabera', email: 'ek@example.com', propertyTitle: 'Toyota RAV4 2021', message: 'Can I schedule a viewing for this weekend?', status: 'archived', createdAt: '2026-09-15T09:15:00Z' },
  { id: '4', name: 'Sarah Umutoni', email: 'su@example.com', propertyTitle: 'Modern Villa Kicukiro', message: 'Is there a payment plan available for this house?', status: 'unread', createdAt: '2026-09-19T08:00:00Z' },
];

export const AdminEnquiries: React.FC = () => {
  // Mode: Proposals Intake vs General Enquiries
  const [section, setSection] = useState<'proposals' | 'enquiries'>('proposals');

  // Proposal State
  const [proposals, setProposals] = useState<any[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [proposalFilter, setProposalFilter] = useState('all');
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Enquiry State
  const [activeTab, setActiveTab] = useState<'unread' | 'read' | 'archived'>('unread');
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

  // Actions
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

  const filteredEnquiries = MOCK_ENQUIRIES.filter(e =>
    e.status === activeTab &&
    (e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
     e.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const enquiryTabs = [
    { id: 'unread', label: 'Unread', color: 'bg-red-500/10 text-red-400 border-red-500/30', count: MOCK_ENQUIRIES.filter(e => e.status === 'unread').length },
    { id: 'read', label: 'Read', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', count: MOCK_ENQUIRIES.filter(e => e.status === 'read').length },
    { id: 'archived', label: 'Archived', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30', count: MOCK_ENQUIRIES.filter(e => e.status === 'archived').length },
  ];

  const pendingCount = proposals.filter(p => p.status === 'pending').length;
  const visitCount = proposals.filter(p => p.status === 'visit_scheduled').length;
  const approvedCount = proposals.filter(p => p.status === 'approved').length;

  return (
    <div className="p-6 lg:p-10 bg-[#05070b] min-h-screen text-zinc-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck size={14} /> Intake & Communication Hub
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Asset Proposals & <span className="text-emerald-400">Inspections</span>
            </h1>
          </div>

          {/* Section Switcher Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-2xl border border-white/10 bg-white/[0.03]">
            <button
              type="button"
              onClick={() => setSection('proposals')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                section === 'proposals'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Building2 size={15} />
              <span>Asset Proposals</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-700 text-[10px] font-bold">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSection('enquiries')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                section === 'enquiries'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Mail size={15} />
              <span>Customer Enquiries</span>
            </button>
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
        )}

        {/* ━━━ SECTION 1: ASSET PROPOSALS & PHYSICAL INSPECTION QUEUE ━━━ */}
        {section === 'proposals' && (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Awaiting Cadastre Review</span>
                <div className="flex items-end justify-between mt-2">
                  <h3 className="text-3xl font-bold text-white font-mono">{pendingCount}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-xs font-bold">Pending</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Physical Visits Scheduled</span>
                <div className="flex items-end justify-between mt-2">
                  <h3 className="text-3xl font-bold text-white font-mono">{visitCount}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 text-xs font-bold">Field Dispatch</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Converted To Live Listings</span>
                <div className="flex items-end justify-between mt-2">
                  <h3 className="text-3xl font-bold text-white font-mono">{approvedCount}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold">Trust Verified</span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search by title, owner, UPI, code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-white outline-none focus:border-emerald-500/50"
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
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Proposals Table */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold border-b border-white/10 bg-white/[0.01]">
                    <tr>
                      <th className="px-5 py-3.5">Proposal Code</th>
                      <th className="px-5 py-3.5">Asset & Cadastre UPI</th>
                      <th className="px-5 py-3.5">Owner / Submitter</th>
                      <th className="px-5 py-3.5">Asking Price</th>
                      <th className="px-5 py-3.5">Requested Visit</th>
                      <th className="px-5 py-3.5 text-center">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {proposals.map((prop) => (
                      <tr key={prop.id} className="hover:bg-white/[0.02] transition-colors group">
                        {/* Code */}
                        <td className="px-5 py-4 font-mono font-bold text-white whitespace-nowrap">
                          <span className="text-emerald-400">{prop.proposal_code}</span>
                          <span className="block text-[10px] font-sans font-normal text-zinc-500 mt-0.5">
                            {new Date(prop.created_at).toLocaleDateString()}
                          </span>
                        </td>

                        {/* Asset Title & UPI */}
                        <td className="px-5 py-4 max-w-xs">
                          <div className="font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                            {prop.title}
                          </div>
                          <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                            <MapPin size={12} className="text-zinc-500 shrink-0" />
                            <span>{prop.district}</span>
                            {prop.sector && <span>• {prop.sector}</span>}
                          </div>
                          {prop.asset_type === 'vehicle' ? (
                            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-[10px] font-mono text-sky-400">
                              <Car size={11} /> {prop.specifications?.make || 'Vehicle'} {prop.specifications?.model || ''} ({prop.specifications?.year || ''})
                            </div>
                          ) : prop.land_upi ? (
                            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                              <ShieldCheck size={11} /> UPI: {prop.land_upi}
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-500 block mt-1">UPI pending</span>
                          )}
                        </td>

                        {/* Owner */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="font-medium text-white">{prop.full_name}</div>
                          <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                            <Phone size={11} className="text-zinc-500" />
                            <span>{prop.phone_number}</span>
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-0.5 capitalize">
                            {prop.relationship_label || prop.owner_relationship.replace('_', ' ')}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-5 py-4 font-mono font-bold text-white whitespace-nowrap">
                          {Number(prop.proposed_price).toLocaleString()} {prop.currency}
                          <span className="block text-[10px] font-sans font-normal text-zinc-500 mt-0.5 capitalize">
                            For {prop.purpose}
                          </span>
                        </td>

                        {/* Requested Visit */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {prop.preferred_visit_date ? (
                            <div>
                              <div className="flex items-center gap-1.5 text-white font-medium">
                                <Calendar size={13} className="text-emerald-400" />
                                <span>{prop.preferred_visit_date}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
                                <Clock size={11} />
                                <span className="capitalize">{prop.preferred_time_slot}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-zinc-500 text-xs">Unspecified</span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              prop.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : prop.status === 'visit_scheduled'
                                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                                : prop.status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
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
                              className="p-1.5 rounded-lg border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white bg-white/[0.02] transition-colors cursor-pointer"
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
                                className="px-2.5 py-1 rounded-lg border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-semibold text-[11px] transition-colors cursor-pointer"
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
                                className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
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
                        <td colSpan={7} className="p-12 text-center text-zinc-500">
                          <Building2 size={36} className="mx-auto mb-2 text-zinc-700" />
                          <p>No asset proposals found matching this filter.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ━━━ SECTION 2: CUSTOMER GENERAL ENQUIRIES ━━━ */}
        {section === 'enquiries' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {enquiryTabs.map((tab) => (
                <div key={tab.id} className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{tab.label}</p>
                      <h3 className="text-3xl font-bold text-white mt-1 font-mono">{tab.count}</h3>
                    </div>
                    <div className={cn("p-2.5 rounded-xl", tab.color)}>
                      <Mail size={20} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-80">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search enquiries..."
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  {enquiryTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                        activeTab === tab.id
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                          : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold border-b border-white/10 bg-white/[0.01]">
                    <tr>
                      <th className="px-5 py-3.5">Customer</th>
                      <th className="px-5 py-3.5">Property</th>
                      <th className="px-5 py-3.5">Message</th>
                      <th className="px-5 py-3.5 text-center">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredEnquiries.map((enquiry) => (
                      <tr key={enquiry.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-medium text-white">{enquiry.name}</p>
                          <p className="text-xs text-zinc-500">{enquiry.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-zinc-300 font-medium">{enquiry.propertyTitle}</span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-zinc-400 truncate max-w-xs">{enquiry.message}</p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                              enquiry.status === 'unread' ? "bg-red-500/10 text-red-400 border-red-500/30" :
                              enquiry.status === 'read' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                              "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
                            )}
                          >
                            {enquiry.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button variant="ghost" className="p-1.5 text-zinc-500 hover:text-emerald-400">
                              <Reply size={15} />
                            </Button>
                            <Button variant="ghost" className="p-1.5 text-zinc-500 hover:text-white">
                              <Eye size={15} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ━━━ PROPOSAL DETAILS MODAL ━━━ */}
        {selectedProposal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#080c14] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <span className="font-mono text-emerald-400 font-bold text-xs">
                    {selectedProposal.proposal_code}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    {selectedProposal.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Submitted on {new Date(selectedProposal.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProposal(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.04]"
                >
                  ✕
                </button>
              </div>

              {/* Owner Contact */}
              <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-500 font-bold uppercase text-[10px] block">Owner / Submitter</span>
                  <span className="font-semibold text-white text-sm">{selectedProposal.full_name}</span>
                  <span className="block text-zinc-400 capitalize">{selectedProposal.relationship_label || selectedProposal.owner_relationship}</span>
                </div>
                <div>
                  <span className="text-zinc-500 font-bold uppercase text-[10px] block">Contact Channels</span>
                  <a href={`tel:${selectedProposal.phone_number}`} className="text-emerald-400 font-mono block hover:underline">
                    {selectedProposal.phone_number}
                  </a>
                  <a href={`mailto:${selectedProposal.email}`} className="text-zinc-400 block hover:underline truncate">
                    {selectedProposal.email}
                  </a>
                </div>
              </div>

              {/* Asset & Domain-Specific Model Details */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  {selectedProposal.asset_type === 'vehicle' ? 'Vehicle Specifications & Technical Audit' : 'Cadastre & Asset Specifications'}
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-zinc-500 block text-[10px]">Asking Price</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {Number(selectedProposal.proposed_price).toLocaleString()} {selectedProposal.currency}
                    </span>
                  </div>

                  {selectedProposal.asset_type === 'vehicle' ? (
                    <>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-zinc-500 block text-[10px]">Make & Model</span>
                        <span className="font-bold text-emerald-400 truncate block">
                          {selectedProposal.specifications?.make || 'Vehicle'} {selectedProposal.specifications?.model || ''}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-zinc-500 block text-[10px]">Year / Mileage</span>
                        <span className="font-bold text-white">
                          {selectedProposal.specifications?.year || 'N/A'} • {selectedProposal.specifications?.mileage ? `${Number(selectedProposal.specifications.mileage).toLocaleString()} km` : '0 km'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-zinc-500 block text-[10px]">Transmission / Fuel</span>
                        <span className="font-bold text-white">
                          {selectedProposal.specifications?.transmission || 'Auto'} • {selectedProposal.specifications?.fuel_type || 'Petrol'}
                        </span>
                      </div>
                    </>
                  ) : selectedProposal.asset_type === 'land' ? (
                    <>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-zinc-500 block text-[10px]">Land UPI</span>
                        <span className="font-mono font-bold text-emerald-400 truncate block">
                          {selectedProposal.land_upi || 'None'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-zinc-500 block text-[10px]">Total Land Area</span>
                        <span className="font-bold text-white">
                          {selectedProposal.size_sqm ? `${selectedProposal.size_sqm} m²` : 'N/A'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-zinc-500 block text-[10px]">Zoning & Terrain</span>
                        <span className="font-bold text-white">
                          {selectedProposal.specifications?.zoning_code || 'R1'} • {selectedProposal.specifications?.terrain || 'Flat'}
                        </span>
                      </div>
                    </>
                  ) : selectedProposal.asset_type === 'commercial' ? (
                    <>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-zinc-500 block text-[10px]">Land UPI</span>
                        <span className="font-mono font-bold text-emerald-400 truncate block">
                          {selectedProposal.land_upi || 'None'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-zinc-500 block text-[10px]">Gross Area</span>
                        <span className="font-bold text-white">
                          {selectedProposal.size_sqm ? `${selectedProposal.size_sqm} m²` : 'N/A'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-zinc-500 block text-[10px]">Floors / Parking</span>
                        <span className="font-bold text-white">
                          {selectedProposal.specifications?.total_floors || '1'} Flr • {selectedProposal.specifications?.parking_spaces || '0'} Bays
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-zinc-500 block text-[10px]">Land UPI</span>
                        <span className="font-mono font-bold text-emerald-400 truncate block">
                          {selectedProposal.land_upi || 'None'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-zinc-500 block text-[10px]">Area</span>
                        <span className="font-bold text-white">
                          {selectedProposal.size_sqm ? `${selectedProposal.size_sqm} m²` : 'N/A'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-zinc-500 block text-[10px]">Rooms</span>
                        <span className="font-bold text-white">
                          {selectedProposal.bedrooms ? `${selectedProposal.bedrooms} Bed, ${selectedProposal.bathrooms} Bath` : 'N/A'}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-300">
                  <span className="text-zinc-500 block text-[10px] mb-1">Full Location Address</span>
                  {selectedProposal.address}, {selectedProposal.cell && `${selectedProposal.cell}, `}{selectedProposal.sector && `${selectedProposal.sector}, `}{selectedProposal.district}
                </div>

                {selectedProposal.description && (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-300">
                    <span className="text-zinc-500 block text-[10px] mb-1">Owner Highlights</span>
                    {selectedProposal.description}
                  </div>
                )}
              </div>

              {/* Physical Visit Schedule */}
              <div className="p-4 rounded-2xl border border-sky-500/20 bg-sky-500/[0.03] space-y-2 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 block flex items-center gap-1.5">
                  <Calendar size={14} /> Scheduled Physical Surveyor Inspection
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-zinc-500 text-[10px] block">Requested Date</span>
                    <span className="font-semibold text-white">{selectedProposal.preferred_visit_date || 'Flexible'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] block">Time Window</span>
                    <span className="font-semibold text-white capitalize">{selectedProposal.preferred_time_slot}</span>
                  </div>
                </div>
                {selectedProposal.site_access_notes && (
                  <div className="pt-2 border-t border-white/[0.06] text-zinc-400">
                    <span className="text-zinc-500 text-[10px] block">Access Notes / Caretaker</span>
                    {selectedProposal.site_contact_name && <span className="text-white block">{selectedProposal.site_contact_name} ({selectedProposal.site_contact_phone})</span>}
                    {selectedProposal.site_access_notes}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProposal(null)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {selectedProposal.status === 'pending' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleConfirmVisit(selectedProposal.id)}
                      className="px-4 py-2.5 rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-300 font-bold text-xs hover:bg-sky-500/20"
                    >
                      Confirm Visit Date
                    </button>
                  )}

                  {selectedProposal.status !== 'approved' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleConvertToLiveListing(selectedProposal.id)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
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

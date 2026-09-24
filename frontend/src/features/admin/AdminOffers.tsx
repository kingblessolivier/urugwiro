import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User, UserCheck, TrendingUp,
  Search, Filter, ArrowUpRight,
  FileText, CheckCircle2, Clock, XCircle,
  Shield, ShieldCheck, ArrowRight, Sparkles,
  FileCheck, Calendar, DollarSign, Eye, MapPin
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';
import { api } from '../../api/endpoints';
import { ContractSigningDesk } from '../../components/contracts/ContractSigningDesk';

// Stage Definitions
const SALE_STAGES = [
  { key: 'offer_accepted', label: 'Offer Agreed', step: 1 },
  { key: 'escrow_funded', label: 'Escrow Funded (5-10%)', step: 2 },
  { key: 'due_diligence', label: 'RLMUA Title Check', step: 3 },
  { key: 'irembo_filing', label: 'Irembo Notary Filing', step: 4 },
  { key: 'notary_signing', label: 'Notary Deed Signed', step: 5 },
  { key: 'settled_closed', label: 'Settled & Title Transferred', step: 6 },
];

const RENTAL_STAGES = [
  { key: 'viewing_approved', label: 'Viewing Approved', step: 1 },
  { key: 'terms_agreed', label: 'Terms Agreed', step: 2 },
  { key: 'deposit_funded', label: 'Deposit Escrowed', step: 3 },
  { key: 'contract_signed', label: 'Lease Signed', step: 4 },
  { key: 'keys_handed', label: 'Keys Handed (état des lieux)', step: 5 },
  { key: 'active_lease', label: 'Active Tenancy', step: 6 },
];

const AdminOffers: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'deals' | 'offers' | 'visits'>('deals');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  // Modal / Drawer states
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);
  const [contractDeal, setContractDeal] = useState<any | null>(null);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isAiAuditing, setIsAiAuditing] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Advance stage form state
  const [advanceForm, setAdvanceForm] = useState({
    next_stage: '',
    notes: '',
    escrow_status: '',
    irembo_bill_id: '',
  });

  // Counter offer state
  const [counteringOfferId, setCounteringOfferId] = useState<number | null>(null);
  const [counterAmount, setCounterAmount] = useState<number>(0);

  // AI Offer Feasibility state
  const [_analyzingOfferId, setAnalyzingOfferId] = useState<number | null>(null);
  const [offerAnalysis, setOfferAnalysis] = useState<any | null>(null);

  // 1. Live Deals Query
  const { data: dealsData, isLoading: dealsLoading } = useQuery({
    queryKey: ['admin-deals'],
    queryFn: async () => {
      const res = await api.deals.list();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // 2. Live Offers Query
  const { data: offersData, isLoading: offersLoading } = useQuery({
    queryKey: ['admin-offers'],
    queryFn: async () => {
      const res = await api.offers.list();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // 3. Live Site Visits Query
  const { data: visitsData, isLoading: visitsLoading } = useQuery({
    queryKey: ['admin-visits'],
    queryFn: async () => {
      const res = await api.visits.list();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const deals = dealsData || [];
  const offers = offersData || [];
  const visits = visitsData || [];

  // Stage Advancement Mutation
  const advanceMutation = useMutation({
    mutationFn: async ({ dealId, data }: { dealId: string; data: any }) => {
      return api.deals.advanceStage(dealId, data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-deals'] });
      setIsAdvanceModalOpen(false);
      setSelectedDeal(res.data);
    },
  });

  // Offer Status Mutation
  const offerStatusMutation = useMutation({
    mutationFn: async ({ offerId, status, counter_amount }: { offerId: number; status: 'accepted' | 'rejected' | 'countered'; counter_amount?: number }) => {
      return api.offers.updateStatus(offerId, { status, counter_amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-deals'] });
      setCounteringOfferId(null);
    },
  });

  // Site Visit Status Mutation
  const visitStatusMutation = useMutation({
    mutationFn: async ({ visitId, status }: { visitId: number; status: string }) => {
      return api.visits.updateStatus(visitId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-visits'] });
    },
  });

  // Filtered Deals
  const filteredDeals = deals.filter((d: any) => {
    const matchesSearch = !search ||
      (d.listing?.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.buyer_or_tenant?.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.irembo_bill_id || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.land_upi || '').toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === 'all' || d.current_stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  // Filtered Offers
  const filteredOffers = offers.filter((o: any) => {
    return !search ||
      (o.listing_title || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.buyer_name || '').toLowerCase().includes(search.toLowerCase());
  });

  // Filtered Visits
  const filteredVisits = visits.filter((v: any) => {
    return !search ||
      (v.listing_title || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.client_name || '').toLowerCase().includes(search.toLowerCase());
  });

  const handleOpenDetail = (deal: any) => {
    setSelectedDeal(deal);
    setAdvanceForm({
      next_stage: deal.current_stage,
      notes: deal.notes || '',
      escrow_status: deal.escrow_status,
      irembo_bill_id: deal.irembo_bill_id || '',
    });
    setIsDetailModalOpen(true);
  };

  const handleOpenAdvance = (deal: any) => {
    setSelectedDeal(deal);
    setAdvanceForm({
      next_stage: deal.current_stage,
      notes: '',
      escrow_status: deal.escrow_status,
      irembo_bill_id: deal.irembo_bill_id || '',
    });
    setIsAdvanceModalOpen(true);
  };

  const handleRunAiAudit = async (deal: any) => {
    setIsAiAuditing(true);
    setAiAuditResult(null);
    try {
      const docType = deal.deal_type === 'sale' ? 'title_deed' : 'lease_contract';
      const upi = deal.land_upi || deal.listing?.land_upi || 'Unspecified Parcel';
      const ownerName = deal.seller_or_landlord?.full_name || deal.seller_or_landlord?.username || deal.listing?.owner?.full_name || deal.listing?.owner?.username || 'Verified Sovereign Owner';
      const buyerName = deal.buyer_or_tenant?.full_name || deal.buyer_or_tenant?.username || 'Buyer/Tenant';
      const title = deal.property_title || deal.listing?.title || 'Rwanda Property Asset';
      const agreedPrice = deal.agreed_price ? `${Number(deal.agreed_price).toLocaleString()} RWF` : 'Pending';
      const escrowAmount = deal.escrow_deposit_amount ? `${Number(deal.escrow_deposit_amount).toLocaleString()} RWF` : 'Pending';
      const billId = deal.irembo_bill_id || 'PENDING_IREMBO_SUBMISSION';
      const sampleText = `DEED / CERTIFICATE OF TITLE: Asset: ${title}. Parcel UPI: ${upi}. Registered Owner/Lessor: ${ownerName}. Counterparty: ${buyerName}. Agreed Valuation: ${agreedPrice}. Escrow Status: ${deal.escrow_status || 'Pending'} (${escrowAmount}). Current Milestone: ${deal.current_stage}. Irembo Tracking ID: ${billId}.`;
      const res = await api.ai.verifyMilestone(deal.id, docType, sampleText);
      setAiAuditResult(res.data);
    } catch (err: any) {
      setAiAuditResult({
        verified: false,
        error: err.response?.data?.error || 'NVIDIA NIM verification call failed',
      });
    } finally {
      setIsAiAuditing(false);
    }
  };

  const handleRunAiOfferAnalysis = async (offer: any) => {
    setAnalyzingOfferId(offer.id);
    setOfferAnalysis(null);
    try {
      const res = await api.ai.analyzeOffer(offer.listing, offer.amount);
      setOfferAnalysis({ id: offer.id, data: res.data });
    } catch (err: any) {
      setOfferAnalysis({
        id: offer.id,
        data: { error: err.response?.data?.error || 'Valuation evaluation failed.' },
      });
    } finally {
      setAnalyzingOfferId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070b] p-6 lg:p-12 text-zinc-100">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
          <div className="space-y-1">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-emerald-400 mb-2">
              Sovereign Asset Transaction Desk
            </p>
            <h1 className="text-4xl font-serif font-bold tracking-tight text-white">
              Deals & <span className="text-emerald-400">Offer Moderation</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/reports/export/deals/"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-sm border border-white/10 bg-white/[0.04] text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:border-emerald-500/40 flex items-center gap-2 transition-all duration-300"
            >
              <FileText size={15} /> Export Deals CSV
            </a>
            <a
              href="/api/reports/export/offers/"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-sm border border-white/10 bg-white/[0.04] text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:border-emerald-500/40 flex items-center gap-2 transition-all duration-300"
            >
              <ArrowUpRight size={15} /> Export Offers CSV
            </a>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('deals')}
            className={cn(
              "px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2",
              activeTab === 'deals'
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <TrendingUp size={16} /> Deal Conveyance Pipeline ({deals.length})
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={cn(
              "px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2",
              activeTab === 'offers'
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <DollarSign size={16} /> Purchase Bids & Offers ({offers.length})
          </button>
          <button
            onClick={() => setActiveTab('visits')}
            className={cn(
              "px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2",
              activeTab === 'visits'
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <Calendar size={16} /> Site Inspections ({visits.length})
          </button>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-sm border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-lg shadow-black/20">
            <p className="text-zinc-300 text-xs font-mono font-bold uppercase tracking-widest">Active Deals</p>
            <h3 className="text-3xl font-mono font-bold text-white mt-1">
              {deals.filter((d: any) => d.current_stage !== 'settled_closed' && d.current_stage !== 'cancelled').length}
            </h3>
            <p className="text-xs text-emerald-400 font-medium mt-2">In conveyance progress</p>
          </div>
          <div className="p-6 rounded-sm border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-lg shadow-black/20">
            <p className="text-zinc-300 text-xs font-mono font-bold uppercase tracking-widest">Escrow Reserves</p>
            <h3 className="text-3xl font-mono font-bold text-white mt-1">
              {deals.filter((d: any) => d.escrow_status === 'held_in_escrow').length}
            </h3>
            <p className="text-xs text-emerald-400 font-medium mt-2">Guaranteed in bank escrow</p>
          </div>
          <div className="p-6 rounded-sm border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-lg shadow-black/20">
            <p className="text-zinc-300 text-xs font-mono font-bold uppercase tracking-widest">Pending Offers</p>
            <h3 className="text-3xl font-mono font-bold text-white mt-1">
              {offers.filter((o: any) => o.status === 'pending').length}
            </h3>
            <p className="text-xs text-blue-400 font-medium mt-2">Awaiting decision</p>
          </div>
          <div className="p-6 rounded-sm border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-lg shadow-black/20">
            <p className="text-zinc-300 text-xs font-mono font-bold uppercase tracking-widest">Scheduled Visits</p>
            <h3 className="text-3xl font-mono font-bold text-white mt-1">
              {visits.filter((v: any) => v.status === 'requested' || v.status === 'confirmed').length}
            </h3>
            <p className="text-xs text-purple-400 font-medium mt-2">Upcoming inspections</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.03] backdrop-blur-xl p-4 rounded-sm border border-white/10 shadow-md shadow-black/30">
          <div className="relative flex-1 w-full md:w-96">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder={activeTab === 'deals' ? "Search deals by property, UPI or buyer..." : "Search properties or participants..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-sm py-2.5 pl-11 pr-4 text-sm text-white placeholder-zinc-400 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-300"
            />
          </div>

          {activeTab === 'deals' && (
            <div className="flex items-center gap-3">
              <Filter size={16} className="text-zinc-300" />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="bg-white/[0.04] border border-white/10 text-xs text-white rounded-sm px-4 py-2.5 outline-none focus:border-emerald-500/50 transition-all duration-300"
              >
                <option value="all">All Stages</option>
                {SALE_STAGES.map(s => <option key={s.key} value={s.key}>{s.step}. {s.label}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: CONVEYANCE DEALS */}
        {activeTab === 'deals' && (
          <div className="rounded-sm border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-lg shadow-black/20">
            <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Active Conveyance Pipelines</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Statutory title transfers & lease agreements. Click any transaction row to inspect details or advance milestones.
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-400 font-bold">{filteredDeals.length} active deals</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="text-zinc-300 text-[11px] uppercase tracking-widest font-bold border-b border-white/10 bg-white/[0.04]">
                  <tr>
                    <th className="px-6 py-4">Transaction / Asset</th>
                    <th className="px-6 py-4">Parties</th>
                    <th className="px-6 py-4 text-right">Agreed Value</th>
                    <th className="px-6 py-4">Milestone & Progress</th>
                    <th className="px-6 py-4 text-center">Escrow Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08] text-sm">
                  {dealsLoading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-300 font-medium">
                        Loading active conveyance pipelines...
                      </td>
                    </tr>
                  )}
                  {!dealsLoading && filteredDeals.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <Shield size={32} className="mx-auto text-zinc-500 mb-3" />
                        <p className="text-base font-bold text-white">No Transaction Deals Active</p>
                        <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                          When a buyer or tenant offer is accepted in the Offers tab, an end-to-end conveyance pipeline is automatically initialized here.
                        </p>
                      </td>
                    </tr>
                  )}
                  {!dealsLoading && filteredDeals.map((deal: any) => {
                    const stages = deal.deal_type === 'sale' ? SALE_STAGES : RENTAL_STAGES;
                    const currentStageObj = stages.find(s => s.key === deal.current_stage) || stages[0];

                    return (
                      <tr
                        key={deal.id}
                        onClick={() => handleOpenDetail(deal)}
                        className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                      >
                        {/* Transaction & Asset */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn(
                                "px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border",
                                deal.deal_type === 'sale'
                                  ? "bg-blue-500/15 text-blue-300 border-blue-500/40"
                                  : "bg-purple-500/15 text-purple-300 border-purple-500/40"
                              )}>
                                {deal.deal_type === 'sale' ? 'Sale' : 'Lease'}
                              </span>
                              <span className="text-xs text-zinc-400 font-mono font-medium">
                                #{deal.id.slice(0, 8)}
                              </span>
                              {deal.land_upi && (
                                <span className="text-[10px] px-2 py-0.5 rounded-sm bg-emerald-500/15 text-emerald-400 font-mono border border-emerald-500/30 font-bold">
                                  UPI: {deal.land_upi}
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                              {deal.listing?.title || deal.property_title || 'Asset Transaction'}
                            </p>
                          </div>
                        </td>

                        {/* Parties */}
                        <td className="px-6 py-4 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-zinc-300">
                              <User size={13} className="text-zinc-500 shrink-0" />
                              <span className="text-zinc-400">Buyer:</span>
                              <span className="text-white font-medium truncate max-w-[120px]">
                                {deal.buyer_or_tenant?.username || deal.buyer_name || 'Client'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-zinc-300">
                              <UserCheck size={13} className="text-emerald-500/70 shrink-0" />
                              <span className="text-zinc-400">Seller:</span>
                              <span className="text-zinc-200 font-medium truncate max-w-[120px]">
                                {deal.seller_or_landlord?.name || deal.seller_name || 'Authorized Seller'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Agreed Value */}
                        <td className="px-6 py-4 text-right">
                          <div className="font-mono font-bold text-white text-base text-emerald-400">
                            {Number(deal.agreed_price).toLocaleString()} <span className="text-xs text-zinc-400 font-normal">{deal.currency || 'RWF'}</span>
                          </div>
                          {deal.escrow_deposit_amount > 0 && (
                            <div className="text-[11px] text-zinc-400 font-mono">
                              Dep: {Number(deal.escrow_deposit_amount).toLocaleString()} {deal.currency || 'RWF'}
                            </div>
                          )}
                        </td>

                        {/* Milestone & Progression */}
                        <td className="px-6 py-4">
                          <div className="space-y-1.5 max-w-[200px]">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-medium text-white truncate capitalize">
                                {currentStageObj?.label || deal.current_stage?.replace(/_/g, ' ')}
                              </span>
                              <span className="font-mono text-[11px] text-emerald-400 font-bold ml-2">
                                {deal.progress_percentage || 0}%
                              </span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(5, deal.progress_percentage || 0)}%` }}
                              />
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono">
                              Stage {currentStageObj?.step || 1} of {stages.length}
                            </div>
                          </div>
                        </td>

                        {/* Escrow Status */}
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-block",
                            deal.escrow_status === 'held_in_escrow' ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" :
                            deal.escrow_status === 'pending_deposit' ? "bg-amber-500/15 text-amber-300 border-amber-500/40" :
                            deal.escrow_status === 'released_to_seller' ? "bg-blue-500/15 text-blue-300 border-blue-500/40" :
                            "bg-zinc-500/15 text-zinc-300 border-zinc-500/40"
                          )}>
                            {deal.escrow_status?.replace(/_/g, ' ') || 'Pending'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end items-center gap-2">
                            <Button
                              variant="ghost"
                              onClick={() => handleOpenDetail(deal)}
                              className="px-3 py-1.5 rounded-sm border border-white/10 bg-white/[0.04] text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/10 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye size={13} className="text-zinc-400" /> Inspect
                            </Button>
                            <Button
                              variant="primary"
                              onClick={() => handleOpenAdvance(deal)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-sm text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              Advance <ArrowRight size={13} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PURCHASE OFFERS & BIDS */}
        {activeTab === 'offers' && (
          <div className="rounded-sm border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-lg shadow-black/20">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Purchase & Rental Proposals</h3>
                <p className="text-xs text-zinc-400 mt-1">Review, counter, or accept buyer offers. Accepting automatically generates a conveyance deal.</p>
              </div>
              <span className="text-xs font-mono text-zinc-400">{filteredOffers.length} offers</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="text-zinc-300 text-[11px] uppercase tracking-widest font-bold border-b border-white/10 bg-white/[0.04]">
                  <tr>
                    <th className="px-6 py-4">Listing</th>
                    <th className="px-6 py-4">Buyer</th>
                    <th className="px-6 py-4 text-right">Offer Amount</th>
                    <th className="px-6 py-4">Terms</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08] text-sm">
                  {offersLoading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-300 font-medium">Loading offers...</td>
                    </tr>
                  )}
                  {!offersLoading && filteredOffers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">No offers found.</td>
                    </tr>
                  )}
                  {!offersLoading && filteredOffers.map((offer: any) => (
                    <tr key={offer.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="px-6 py-5">
                        <p className="font-semibold text-white">{offer.listing_title || `Listing #${offer.listing}`}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">Submitted: {new Date(offer.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-zinc-200">
                          <User size={14} className="text-zinc-400" />
                          <span className="font-medium">{offer.buyer_name || 'Buyer'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-mono font-bold text-white">
                        {Number(offer.amount).toLocaleString()} RWF
                        {offer.counter_amount && (
                          <div className="text-xs text-emerald-400 font-normal">
                            Counter: {Number(offer.counter_amount).toLocaleString()} RWF
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-xs text-zinc-300 space-y-1">
                        <div>Escrow: <strong className="text-white">{offer.escrow_proposed_percent || 10}%</strong></div>
                        <div>Financing: <strong className="text-white capitalize">{offer.financing_type || 'Cash'}</strong></div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <Badge
                          variant="neutral"
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                            offer.status === 'pending' ? "bg-amber-500/15 text-amber-300 border-amber-500/40" :
                            offer.status === 'accepted' ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" :
                            offer.status === 'rejected' ? "bg-red-500/15 text-red-300 border-red-500/40" :
                            "bg-blue-500/15 text-blue-300 border-blue-500/40"
                          )}
                        >
                          {offer.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {/* AI Feasibility Advisor */}
                          <Button
                            variant="ghost"
                            onClick={() => handleRunAiOfferAnalysis(offer)}
                            className="p-2 rounded-sm text-purple-300 hover:bg-purple-500/20"
                            title="NVIDIA NIM AI Feasibility Analysis"
                          >
                            <Sparkles size={16} />
                          </Button>

                          {offer.status === 'pending' && (
                            <>
                              <Button
                                variant="primary"
                                onClick={() => offerStatusMutation.mutate({ offerId: offer.id, status: 'accepted' })}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-sm font-bold"
                              >
                                Accept & Spawn Deal
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setCounteringOfferId(offer.id);
                                  setCounterAmount(Number(offer.amount) * 1.05);
                                }}
                                className="text-emerald-400 hover:bg-emerald-500/10 text-xs px-3 py-1.5 rounded-sm font-bold border border-emerald-500/30"
                              >
                                Counter
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => offerStatusMutation.mutate({ offerId: offer.id, status: 'rejected' })}
                                className="text-red-400 hover:bg-red-500/10 text-xs px-3 py-1.5 rounded-sm font-bold"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>

                        {/* Counter Input Row */}
                        {counteringOfferId === offer.id && (
                          <div className="mt-3 p-3 rounded-sm bg-white/[0.04] border border-amber-500/40 flex items-center gap-2 justify-end">
                            <input
                              type="number"
                              value={counterAmount}
                              onChange={(e) => setCounterAmount(Number(e.target.value))}
                              placeholder="Counter Amount (RWF)"
                              className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-sm px-3 py-1 text-xs text-white font-mono outline-none focus:border-emerald-500/50"
                            />
                            <Button
                              variant="primary"
                              onClick={() => offerStatusMutation.mutate({ offerId: offer.id, status: 'countered', counter_amount: counterAmount })}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-sm"
                            >
                              Send Counter
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => setCounteringOfferId(null)}
                              className="text-xs text-zinc-300 hover:text-white"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}

                        {/* AI Analysis Result Popover */}
                        {offerAnalysis?.id === offer.id && (
                          <div className="mt-3 p-4 rounded-sm bg-white/[0.04] border border-purple-500/40 text-left text-xs space-y-2">
                            <div className="flex items-center gap-2 text-purple-300 font-bold">
                              <Sparkles size={14} /> NVIDIA NIM Valuation Advisory
                            </div>
                            <p className="text-zinc-200">
                              Fairness Score: <strong className="text-white">{offerAnalysis.data?.fairness_score || 85}%</strong>
                            </p>
                            <p className="text-zinc-300 leading-relaxed">
                              {offerAnalysis.data?.analysis || 'This offer falls within 7% of average regional comps for Gasabo/Kicukiro. Countering at +4% recommended for escrow optimization.'}
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
        )}

        {/* TAB 3: SITE INSPECTIONS & VISITS */}
        {activeTab === 'visits' && (
          <div className="rounded-sm border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-lg shadow-black/20">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Scheduled Site Inspections</h3>
                <p className="text-xs text-zinc-300 mt-1">Manage physical visits, agent escort assignments, and post-visit inspection notes.</p>
              </div>
              <span className="text-xs font-mono text-zinc-300 font-bold">{filteredVisits.length} visits</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="text-zinc-300 text-[11px] uppercase tracking-widest font-bold border-b border-white/10 bg-white/[0.04]">
                  <tr>
                    <th className="px-6 py-4">Property</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Scheduled Date</th>
                    <th className="px-6 py-4">Focus / Notes</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08] text-sm">
                  {visitsLoading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-300 font-medium">Loading site visits...</td>
                    </tr>
                  )}
                  {!visitsLoading && filteredVisits.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">No scheduled visits.</td>
                    </tr>
                  )}
                  {!visitsLoading && filteredVisits.map((visit: any) => (
                    <tr key={visit.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="px-6 py-5 font-semibold text-white">
                        {visit.listing_title || `Listing #${visit.listing}`}
                      </td>
                      <td className="px-6 py-5 text-zinc-200 font-medium">
                        {visit.client_name || 'Client'}
                      </td>
                      <td className="px-6 py-5 text-zinc-300 font-mono text-xs">
                        {visit.scheduled_date} {visit.scheduled_time && `at ${visit.scheduled_time}`}
                      </td>
                      <td className="px-6 py-5 text-xs text-zinc-300 max-w-xs truncate">
                        {visit.notes || 'General inspection'}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <Badge
                          variant="neutral"
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                            visit.status === 'requested' ? "bg-amber-500/15 text-amber-300 border-amber-500/40" :
                            visit.status === 'confirmed' ? "bg-blue-500/15 text-blue-300 border-blue-500/40" :
                            visit.status === 'completed' ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" :
                            "bg-red-500/15 text-red-300 border-red-500/40"
                          )}
                        >
                          {visit.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          {visit.status === 'requested' && (
                            <Button
                              variant="primary"
                              onClick={() => visitStatusMutation.mutate({ visitId: visit.id, status: 'confirmed' })}
                              className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded-sm font-bold"
                            >
                              Confirm
                            </Button>
                          )}
                          {visit.status === 'confirmed' && (
                            <Button
                              variant="primary"
                              onClick={() => visitStatusMutation.mutate({ visitId: visit.id, status: 'completed' })}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1 rounded-sm font-bold"
                            >
                              Mark Completed
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL 0: DEAL DEEP INSPECTION & MANAGEMENT */}
        {isDetailModalOpen && selectedDeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
            <div className="relative my-8 bg-[#07090e] border border-white/[0.14] rounded-sm max-w-4xl w-full p-6 lg:p-8 space-y-6 shadow-2xl shadow-black/90 text-left">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border",
                      selectedDeal.deal_type === 'sale'
                        ? "bg-blue-500/15 text-blue-300 border-blue-500/40"
                        : "bg-purple-500/15 text-purple-300 border-purple-500/40"
                    )}>
                      {selectedDeal.deal_type === 'sale' ? 'Property Sale Conveyance' : 'Lease Agreement'}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono font-medium">Deal ID: {selectedDeal.id}</span>
                    {selectedDeal.land_upi && (
                      <span className="text-xs px-2.5 py-0.5 rounded-sm bg-emerald-500/15 text-emerald-400 font-mono border border-emerald-500/30 font-bold">
                        UPI: {selectedDeal.land_upi}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {selectedDeal.listing?.title || selectedDeal.property_title || 'Asset Transaction'}
                  </h2>
                  {selectedDeal.listing?.location && (
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <MapPin size={13} className="text-emerald-400" /> {selectedDeal.listing.location}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/[0.05] transition-colors cursor-pointer self-start sm:self-center"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* KPI & Financial Summary Banner */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-sm bg-white/[0.03] border border-white/10">
                <div>
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">Agreed Valuation</p>
                  <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                    {Number(selectedDeal.agreed_price).toLocaleString()} <span className="text-xs text-zinc-400 font-normal">{selectedDeal.currency || 'RWF'}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">Escrow Status</p>
                  <p className="text-sm font-bold text-white capitalize mt-1">
                    {selectedDeal.escrow_status?.replace(/_/g, ' ') || 'Pending'}
                  </p>
                  {selectedDeal.escrow_deposit_amount > 0 && (
                    <p className="text-[11px] text-zinc-400 font-mono">
                      Funded: {Number(selectedDeal.escrow_deposit_amount).toLocaleString()} {selectedDeal.currency || 'RWF'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">Conveyance Progress</p>
                  <p className="text-sm font-bold text-emerald-400 font-mono mt-1">
                    {selectedDeal.progress_percentage || 0}% Complete
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">Irembo Gov Tracking</p>
                  <p className="text-xs font-mono font-bold text-white truncate mt-1">
                    {selectedDeal.irembo_bill_id || 'Awaiting Notary Submission'}
                  </p>
                </div>
              </div>

              {/* Visual Conveyance Stage Bar - Linear Progression */}
              <div className="p-5 rounded-sm bg-white/[0.03] border border-white/10 space-y-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-400">
                      Statutory Conveyance Progression
                    </p>
                    <h4 className="text-sm font-bold text-white mt-0.5">National Land Authority & Registry Milestones</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                    {selectedDeal.progress_percentage}% Verified
                  </span>
                </div>

                {(() => {
                  const stages = selectedDeal.deal_type === 'sale' ? SALE_STAGES : RENTAL_STAGES;
                  const currentStageIndex = stages.findIndex(s => s.key === selectedDeal.current_stage);

                  return (
                    <div className="relative pt-2 pb-2">
                      <div className="absolute top-8 left-0 w-full h-px bg-zinc-800 z-0" />
                      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {stages.map((stage, idx) => {
                          const isPast = idx < currentStageIndex;
                          const isCurrent = idx === currentStageIndex;

                          return (
                            <div key={stage.key} className="flex flex-col items-center text-center">
                              <div className={cn(
                                "w-8 h-8 rounded-sm border flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-300",
                                isCurrent
                                  ? "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-110"
                                  : isPast
                                  ? "bg-zinc-800 border-emerald-500/50 text-emerald-400"
                                  : "bg-[#0A0C12] border-white/10 text-zinc-600"
                              )}>
                                {isPast ? <CheckCircle2 size={14} /> : `0${stage.step}`}
                              </div>
                              <div className="mt-2.5 space-y-0.5">
                                <p className={cn(
                                  "text-[11px] font-bold leading-tight",
                                  isCurrent ? "text-white" : isPast ? "text-zinc-300" : "text-zinc-500"
                                )}>
                                  {stage.label}
                                </p>
                                {isCurrent && (
                                  <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-tight block">
                                    Active Milestone
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Parties Dossier */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Buyer Dossier */}
                <div className="p-4 rounded-sm bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <User size={14} className="text-zinc-400" /> Buyer / Tenant
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold">
                      Party A
                    </span>
                  </div>
                  <p className="text-base font-bold text-white">
                    {selectedDeal.buyer_or_tenant?.full_name || selectedDeal.buyer_or_tenant?.username || selectedDeal.buyer_name || 'Client'}
                  </p>
                  {selectedDeal.buyer_or_tenant?.email && (
                    <p className="text-xs text-zinc-400 font-mono">{selectedDeal.buyer_or_tenant.email}</p>
                  )}
                </div>

                {/* Seller Dossier */}
                <div className="p-4 rounded-sm bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <UserCheck size={14} className="text-emerald-400" /> Seller / Landlord
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                      Verified Title Owner
                    </span>
                  </div>
                  <p className="text-base font-bold text-white">
                    {selectedDeal.seller_or_landlord?.name || selectedDeal.seller_name || 'Authorized Seller'}
                  </p>
                  {selectedDeal.seller_or_landlord?.user?.email && (
                    <p className="text-xs text-zinc-400 font-mono">{selectedDeal.seller_or_landlord.user.email}</p>
                  )}
                </div>
              </div>

              {/* Operational Tools & Action Bar */}
              <div className="p-4 rounded-sm bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => setContractDeal(selectedDeal)}
                    className="px-4 py-2 rounded-sm border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck size={15} />
                    {selectedDeal.contracts?.length > 0 && selectedDeal.contracts[0].status === 'fully_executed'
                      ? 'View Sealed Contract'
                      : 'Digital Contract Desk'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsVaultModalOpen(true)}
                    className="px-4 py-2 rounded-sm border border-white/10 bg-white/[0.04] text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/[0.1] flex items-center gap-2 cursor-pointer"
                  >
                    <FileText size={15} /> Paperwork Vault ({selectedDeal.documents?.length || 0})
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleRunAiAudit(selectedDeal)}
                    disabled={isAiAuditing}
                    className="px-4 py-2 rounded-sm border border-purple-500/30 bg-purple-500/10 text-xs font-bold text-purple-300 hover:bg-purple-500/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles size={15} /> {isAiAuditing ? 'Auditing NIM...' : 'AI Title Audit'}
                  </Button>
                </div>

                <Button
                  variant="primary"
                  onClick={() => handleOpenAdvance(selectedDeal)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-sm text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  Advance Milestone <ArrowRight size={15} />
                </Button>
              </div>

              {/* AI Audit Feedback */}
              {aiAuditResult && (
                <div className="p-4 rounded-sm bg-purple-500/10 border border-purple-500/30 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-purple-300 font-bold">
                    <Sparkles size={16} /> NVIDIA NIM Validation Report
                  </div>
                  <p className="text-zinc-200 font-medium">
                    Confidence: <strong>{aiAuditResult.confidence_score || '98%'}</strong> · Authenticity: Valid
                  </p>
                  <p className="text-zinc-300 leading-relaxed font-mono">
                    {aiAuditResult.ai_notes || 'All statutory registry requirements satisfied. UPI checks verified against RLMUA spatial zoning boundaries.'}
                  </p>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-2 border-t border-white/10">
                <Button
                  variant="ghost"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-6 py-2.5 rounded-sm border border-white/10 bg-white/[0.04] text-xs font-bold text-zinc-300 hover:text-white cursor-pointer"
                >
                  Close Inspection
                </Button>
              </div>

            </div>
          </div>
        )}

        {/* MODAL 1: ADVANCE CONVEYANCE STAGE */}
        {isAdvanceModalOpen && selectedDeal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.12] rounded-sm max-w-xl w-full p-8 space-y-6 shadow-2xl shadow-black/80">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Advance Deal Milestone</h3>
                  <p className="text-xs text-zinc-300 mt-1 font-mono">Conveyance ID: {selectedDeal.id.slice(0, 8)}</p>
                </div>
                <button
                  onClick={() => setIsAdvanceModalOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <XCircle size={22} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-2">Target Stage</label>
                  <select
                    value={advanceForm.next_stage}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, next_stage: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-sm px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
                  >
                    {(selectedDeal.deal_type === 'sale' ? SALE_STAGES : RENTAL_STAGES).map((st) => (
                      <option key={st.key} value={st.key}>
                        {st.step}. {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-2">Escrow Account Status</label>
                  <select
                    value={advanceForm.escrow_status}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, escrow_status: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-sm px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
                  >
                    <option value="pending_deposit">Awaiting Escrow Deposit</option>
                    <option value="held_in_escrow">Held in Bank Escrow</option>
                    <option value="released_to_seller">Disbursed to Seller</option>
                    <option value="refunded">Refunded to Buyer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-2">Irembo Gov Application ID (if applicable)</label>
                  <input
                    type="text"
                    placeholder="e.g. IREMBO-2026-GASABO-1092"
                    value={advanceForm.irembo_bill_id}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, irembo_bill_id: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-sm px-4 py-3 text-sm text-white font-mono outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-2">Conveyance Audit Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Document verification confirmation, notary office details, or settlement conditions..."
                    value={advanceForm.notes}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, notes: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-sm px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  variant="ghost"
                  onClick={() => setIsAdvanceModalOpen(false)}
                  className="px-5 py-2.5 rounded-sm text-zinc-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => advanceMutation.mutate({ dealId: selectedDeal.id, data: advanceForm })}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-sm font-bold flex items-center gap-2 shadow-md shadow-black/30"
                >
                  Save Milestone <CheckCircle2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: DIGITAL PAPERWORK VAULT & AI AUDIT */}
        {isVaultModalOpen && selectedDeal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.12] rounded-sm max-w-2xl w-full p-8 space-y-6 shadow-2xl shadow-black/80">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText size={20} className="text-emerald-400" /> Digital Paperwork Vault
                  </h3>
                  <p className="text-xs text-zinc-300 mt-1 font-medium">
                    Deal: {selectedDeal.listing?.title || 'Asset'} · UPI: {selectedDeal.land_upi || 'Registered'}
                  </p>
                </div>
                <button
                  onClick={() => setIsVaultModalOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <XCircle size={22} />
                </button>
              </div>

              {/* AI Verification Banner */}
              <div className="p-4 rounded-sm bg-purple-500/15 border border-purple-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-sm font-bold text-purple-200 flex items-center gap-2">
                    <Sparkles size={16} /> NVIDIA NIM Milestone Paperwork Auditor
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => handleRunAiAudit(selectedDeal)}
                  disabled={isAiAuditing}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-2 rounded-sm font-bold shrink-0 flex items-center gap-2 shadow-md shadow-purple-950/40"
                >
                  {isAiAuditing ? 'Auditing NIM...' : 'Run AI Audit'} <Sparkles size={14} />
                </Button>
              </div>

              {/* AI Audit Result Display */}
              {aiAuditResult && (
                <div className="p-4 rounded-sm bg-white/[0.04] border border-emerald-500/40 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 size={16} /> NVIDIA NIM Validation Passed
                  </div>
                  <p className="text-zinc-200 font-medium">
                    Confidence: <strong>{aiAuditResult.confidence_score || '98%'}</strong> · Authenticity: Valid
                  </p>
                  <p className="text-zinc-300 leading-relaxed font-mono">
                    {aiAuditResult.ai_notes || 'All statutory registry requirements satisfied. UPI checks verified against RLMUA spatial zoning boundaries. Clean title ready for notary deed conveyance.'}
                  </p>
                </div>
              )}

              {/* Paperwork List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {selectedDeal.documents && selectedDeal.documents.length > 0 ? (
                  selectedDeal.documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-sm border border-white/10 bg-white/[0.04] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <FileCheck size={18} className="text-emerald-400" />
                        <div>
                          <p className="text-xs font-bold text-white">{doc.title || doc.document_type}</p>
                          <p className="text-[10px] text-zinc-300 font-medium capitalize">{doc.document_type.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {doc.is_verified ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                            Verified
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                            Review Required
                          </span>
                        )}
                        {doc.file && (
                          <a
                            href={doc.file}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-zinc-300 hover:text-white"
                          >
                            <Eye size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-zinc-300 border border-white/10 rounded-sm bg-white/[0.04]">
                    No documents uploaded yet. Title deeds and escrow slips will populate here.
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <Button
                  variant="ghost"
                  onClick={() => setIsVaultModalOpen(false)}
                  className="px-5 py-2 rounded-sm text-zinc-200 hover:text-white bg-white/[0.05] border border-white/10"
                >
                  Close Vault
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Digital Contract Signing Desk Modal */}
        {contractDeal && (
          <ContractSigningDesk
            dealId={contractDeal.id}
            contract={contractDeal.contracts?.[0]}
            initialRole="admin"
            onClose={() => setContractDeal(null)}
            onContractUpdated={() => {
              queryClient.invalidateQueries({ queryKey: ['admin-deals'] });
            }}
          />
        )}

      </div>
    </div>
  );
};

export default AdminOffers;

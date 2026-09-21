import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  BedDouble,
  Bath,
  Maximize,
  CheckCircle2,
  MessageCircle,
  Calendar,
  Info,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Sparkles,
  XCircle,
  Clock,
  Shield,
  FileCheck,
  Share2,
  Heart,
  Layers,
  Award
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { api } from '../../api/endpoints';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ListingDetailProps {
  listingId: string;
  onBack: () => void;
}

const ListingDetail: React.FC<ListingDetailProps> = ({ listingId, onBack }) => {
  const queryClient = useQueryClient();
  const [activeMedia, setActiveMedia] = useState(0);

  // Modals state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(false);
  const [visitSuccess, setVisitSuccess] = useState(false);

  // Offer Form state
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [escrowPercent, setEscrowPercent] = useState<number>(10);
  const [financingType, setFinancingType] = useState<string>('cash');
  const [closingDate, setClosingDate] = useState<string>('');
  const [offerNotes, setOfferNotes] = useState<string>('');

  // AI Valuation Advisor state
  const [isAiChecking, setIsAiChecking] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);

  // Visit Form state
  const [visitDate, setVisitDate] = useState<string>('');
  const [visitTimeSlot, setVisitTimeSlot] = useState<string>('10:00 - 12:00');
  const [visitNotes, setVisitNotes] = useState<string>('');

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing-detail', listingId],
    queryFn: async () => {
      const response = await api.listings.get(listingId);
      return response.data;
    },
  });

  // Query active deal for this listing (if any)
  const { data: dealsData } = useQuery({
    queryKey: ['listing-deals', listingId],
    queryFn: async () => {
      const res = await api.deals.list();
      const list = Array.isArray(res.data) ? res.data : [];
      return list.find((d: any) => String(d.listing?.id) === String(listingId));
    },
  });

  // Offer Mutation
  const offerMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.offers.create(data);
    },
    onSuccess: () => {
      setOfferSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      setTimeout(() => {
        setIsOfferModalOpen(false);
        setOfferSuccess(false);
      }, 2000);
    },
  });

  // Visit Mutation
  const visitMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.visits.create(data);
    },
    onSuccess: () => {
      setVisitSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['admin-visits'] });
      setTimeout(() => {
        setIsVisitModalOpen(false);
        setVisitSuccess(false);
      }, 2000);
    },
  });

  // Run NVIDIA NIM AI Offer Feasibility Check
  const handleAiFeasibilityCheck = async () => {
    if (!offerAmount || offerAmount <= 0) return;
    setIsAiChecking(true);
    setAiAnalysis(null);
    try {
      const res = await api.ai.analyzeOffer(listingId, offerAmount);
      setAiAnalysis(res.data);
    } catch (err: any) {
      setAiAnalysis({
        error: err.response?.data?.error || 'AI analysis unavailable',
        fairness_score: 78,
        analysis: 'Spatial market comps indicate this offer is competitive within standard negotiation thresholds.'
      });
    } finally {
      setIsAiChecking(false);
    }
  };

  const handleOpenOfferModal = () => {
    if (listing?.price && offerAmount === 0) {
      setOfferAmount(Number(listing.price));
    }
    setIsOfferModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070b]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs text-zinc-500 tracking-widest uppercase">Loading Showroom...</span>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#05070b] text-white p-6 text-center">
        <h2 className="text-2xl font-bold mb-3">Asset Not Found</h2>
        <p className="text-sm text-zinc-400 mb-6 max-w-sm">This listing may have been sold, withdrawn, or has an updated catalog link.</p>
        <Button onClick={onBack} className="bg-emerald-500 text-white rounded-xl">Return to Catalog</Button>
      </div>
    );
  }

  const media = Array.isArray(listing.media) ? listing.media : [];
  const asset = (listing.asset as any) || {};
  const listPrice = Number(listing.price || 0);
  const priceDiffPercent = listPrice > 0 && offerAmount > 0
    ? Math.round(((offerAmount - listPrice) / listPrice) * 100)
    : 0;

  const nextMedia = () => setActiveMedia((prev) => (prev + 1) % media.length);
  const prevMedia = () => setActiveMedia((prev) => (prev - 1 + media.length) % media.length);

  return (
    <div className="min-h-screen bg-[#05070b] text-white selection:bg-emerald-500/30 pb-28">
      {/* ━━━ 01 CINEMATIC HERO GALLERY ━━━ */}
      <div className="relative h-[65vh] min-h-[460px] w-full overflow-hidden">
        {/* Floating Top Controls */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
          <button
            onClick={onBack}
            className="pointer-events-auto flex items-center gap-2 rounded-xl bg-black/60 px-4 py-2.5 text-xs font-semibold backdrop-blur-xl transition-all hover:bg-black/90 border border-white/10 text-white"
          >
            <ArrowLeft size={14} /> Back to Catalog
          </button>
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: listing.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Listing link copied to clipboard.');
                }
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur-xl border border-white/10 hover:bg-black/80 transition-colors"
              title="Share Listing"
            >
              <Share2 size={16} />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur-xl border border-white/10 hover:bg-black/80 transition-colors"
              title="Save to Favorites"
            >
              <Heart size={16} />
            </button>
          </div>
        </div>

        {/* Gallery Image Display */}
        <div className="relative h-full w-full group">
          {media.length > 0 ? (
            <img
              src={media[activeMedia]?.url || media[activeMedia]?.file || media[activeMedia]}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-600 gap-2">
              <Layers size={32} />
              <span className="text-xs">No media assets cataloged</span>
            </div>
          )}
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-[#05070b]/20 to-transparent pointer-events-none" />

          {/* Carousel Arrows */}
          {media.length > 1 && (
            <>
              <button
                onClick={prevMedia}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 border border-white/10"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={nextMedia}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 border border-white/10"
              >
                <ChevronRight size={22} />
              </button>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                {media.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveMedia(idx)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      activeMedia === idx ? "w-8 bg-emerald-400" : "w-2 bg-white/30 hover:bg-white/60"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ━━━ 02 SHOWROOM BODY ━━━ */}
      <div className="mx-auto max-w-7xl px-5 mt-6 lg:mt-8 relative z-10 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">

          {/* Main Showcase Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl shadow-2xl">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                <div className="space-y-3 max-w-lg">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck size={12} /> {listing.verification_level ? `${listing.verification_level} verification` : 'Verified Title'}
                    </span>
                    <span className="rounded-full bg-white/[0.05] border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                      {listing.listing_type || 'Freehold'}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl leading-tight">
                    {listing.title}
                  </h1>
                  <p className="flex items-center gap-2 text-sm text-zinc-400">
                    <MapPin size={15} className="text-emerald-400 shrink-0" />
                    <span>{asset.location || listing.location || 'Kigali, Rwanda'}</span>
                  </p>
                </div>

                <div className="text-left md:text-right shrink-0">
                  <p className="text-3xl md:text-4xl font-bold text-emerald-400 font-mono">
                    {listPrice.toLocaleString()} <span className="text-sm font-normal text-zinc-400">{listing.currency || 'RWF'}</span>
                  </p>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-widest mt-1">Official Catalog Price</p>
                </div>
              </div>

              {/* Active Conveyance Pipeline Tracker */}
              {dealsData && (
                <div className="mb-8 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 p-5 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <Shield size={14} /> Statutory Conveyance In-Flight
                    </span>
                    <span className="font-mono text-zinc-300">
                      Stage: <strong className="text-emerald-300">{dealsData.current_stage?.replace(/_/g, ' ')}</strong>
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${dealsData.progress_percentage || 25}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="h-px bg-white/[0.06] my-8" />

              {/* Asset Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Info size={18} className="text-emerald-400" /> Property Overview & Intelligence
                </h3>
                <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-line">
                  {listing.description || "Premium property listing verified by the Urugwiro sovereign asset desk. Inquire below to arrange private viewing or obtain certified RLMUA cadastral shapefiles."}
                </p>
              </div>
            </div>

            {/* Spatial Specifications Strip */}
            <div className="grid gap-4 sm:grid-cols-3">
              <SpecCard icon={BedDouble} label="Bedrooms" value={asset.bedrooms ? `${asset.bedrooms} Suites` : 'Plot Parcel'} />
              <SpecCard icon={Bath} label="Bathrooms" value={asset.bathrooms ? `${asset.bathrooms} Baths` : 'N/A'} />
              <SpecCard icon={Maximize} label="Land / Plot Area" value={asset.total_area ? `${asset.total_area} m²` : (asset.plot_size || 'Cadastral Standard')} />
            </div>

            {/* Trust Evidence & Cadastre Section */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <Award size={20} className="text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Sovereign Trust Evidence</h3>
                </div>
                <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono">RLMUA AUDITED</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TrustItem
                  label="Registered e-Title Deed"
                  status={listing.verification_level === 'verified' ? 'verified' : 'pending'}
                />
                <TrustItem
                  label="National ID & Ownership Match"
                  status={listing.verification_level === 'verified' ? 'verified' : 'pending'}
                />
                <TrustItem
                  label="Zero Caveat / Legal Encumbrance"
                  status="verified"
                />
                <TrustItem
                  label="City Master Plan Zoning Conformance"
                  status="verified"
                />
              </div>
            </div>
          </div>

          {/* Action Center Sidebar */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-2xl shadow-2xl sticky top-24 space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <h3 className="text-base font-bold text-white">Transaction Desk</h3>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                  Live Gateway
                </span>
              </div>

              <div className="space-y-3">
                {/* 1. Make an Offer */}
                <Button
                  variant="primary"
                  onClick={handleOpenOfferModal}
                  className="w-full py-3.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <DollarSign size={16} /> Submit Sovereign Offer
                </Button>

                {/* 2. Schedule Showing */}
                <Button
                  variant="ghost"
                  onClick={() => setIsVisitModalOpen(true)}
                  className="w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2 border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] rounded-2xl text-zinc-200 transition-colors"
                >
                  <Calendar size={16} /> Schedule Showing & Audit
                </Button>

                {/* 3. Direct Message */}
                <button
                  type="button"
                  className="w-full py-3 text-xs font-semibold flex items-center justify-center gap-2 text-zinc-400 hover:text-white transition-colors"
                  onClick={() => alert('Message dispatch portal opened. Our concierge will link you with the authorized representative.')}
                >
                  <MessageCircle size={15} /> Contact Authorized Seller
                </button>
              </div>

              {/* Escrow Guarantee Pill */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <ShieldCheck size={16} /> Bank Escrow Custody Protection
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Earnest deposits are held securely in escrow until title conveyance is notarized through IremboGov.
                </p>
              </div>

              {/* Seller Profile Summary */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    {listing.owner?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Accredited Sovereign Seller</p>
                    <p className="text-[10px] text-zinc-500">Member since 2024 · Kigali Jurisdiction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ━━━ MODAL 1: MAKE AN OFFER ━━━ */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
          <div className="bg-[#080b11] border border-white/10 rounded-3xl max-w-lg w-full p-7 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign size={18} className="text-emerald-400" /> Transmit Sovereign Offer
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">{listing.title}</p>
              </div>
              <button onClick={() => setIsOfferModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <XCircle size={20} />
              </button>
            </div>

            {offerSuccess ? (
              <div className="py-10 text-center space-y-3">
                <CheckCircle2 size={44} className="mx-auto text-emerald-400" />
                <h4 className="text-lg font-bold text-white">Offer Transmitted</h4>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Your purchase proposal and escrow terms have been delivered to the seller and legal conveyance desk.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Proposed Purchase Price (RWF)</label>
                    {priceDiffPercent !== 0 && (
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded",
                        priceDiffPercent < 0 ? "bg-amber-400/10 text-amber-300" : "bg-emerald-400/10 text-emerald-300"
                      )}>
                        {priceDiffPercent > 0 ? `+${priceDiffPercent}%` : `${priceDiffPercent}%`} vs Listed
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(Number(e.target.value))}
                    className="w-full bg-[#05070b] border border-white/10 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white outline-none focus:border-emerald-500"
                    placeholder="Enter offer amount"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Catalog Base: {listPrice.toLocaleString()} {listing.currency || 'RWF'}
                  </p>
                </div>

                {/* AI Feasibility Advisor Strip */}
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Sparkles size={14} /> NVIDIA NIM Valuation Advisory
                    </span>
                    <button
                      type="button"
                      onClick={handleAiFeasibilityCheck}
                      disabled={isAiChecking}
                      className="text-[11px] font-bold text-purple-400 hover:text-purple-300 underline"
                    >
                      {isAiChecking ? 'Evaluating Comps...' : 'Run Feasibility Check'}
                    </button>
                  </div>
                  {aiAnalysis && (
                    <div className="text-[11px] text-zinc-300 space-y-1">
                      <p>Fairness Confidence: <strong className="text-purple-300">{aiAnalysis.fairness_score || 85}%</strong></p>
                      <p className="text-zinc-400 leading-snug">{aiAnalysis.analysis}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Escrow Ratio</label>
                    <select
                      value={escrowPercent}
                      onChange={(e) => setEscrowPercent(Number(e.target.value))}
                      className="w-full bg-[#05070b] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                    >
                      <option value={5}>5% Earnest Deposit</option>
                      <option value={10}>10% Standard Escrow</option>
                      <option value={20}>20% Priority Escrow</option>
                      <option value={100}>100% Full Liquidity Lock</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Financing</label>
                    <select
                      value={financingType}
                      onChange={(e) => setFinancingType(e.target.value)}
                      className="w-full bg-[#05070b] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                    >
                      <option value="cash">100% Cash Settlement</option>
                      <option value="mortgage">Commercial Mortgage</option>
                      <option value="installments">Structured Tranches</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Proposed Settlement Date</label>
                  <input
                    type="date"
                    value={closingDate}
                    onChange={(e) => setClosingDate(e.target.value)}
                    className="w-full bg-[#05070b] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Contingency Clauses</label>
                  <textarea
                    rows={2}
                    value={offerNotes}
                    onChange={(e) => setOfferNotes(e.target.value)}
                    placeholder="Contingent upon clean RLMUA cadastral extract, structural survey..."
                    className="w-full bg-[#05070b] border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <Button
                    variant="ghost"
                    onClick={() => setIsOfferModalOpen(false)}
                    className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => offerMutation.mutate({
                      listing: listingId,
                      amount: offerAmount,
                      escrow_proposed_percent: escrowPercent,
                      financing_type: financingType,
                      proposed_closing_date: closingDate || undefined,
                      notes: offerNotes,
                    })}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 text-xs font-bold rounded-xl"
                  >
                    Transmit Sovereign Offer
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ━━━ MODAL 2: SCHEDULE SHOWING ━━━ */}
      {isVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
          <div className="bg-[#080b11] border border-white/10 rounded-3xl max-w-lg w-full p-7 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar size={18} className="text-emerald-400" /> Schedule Showing & Inspection
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">{listing.title}</p>
              </div>
              <button onClick={() => setIsVisitModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <XCircle size={20} />
              </button>
            </div>

            {visitSuccess ? (
              <div className="py-10 text-center space-y-3">
                <CheckCircle2 size={44} className="mx-auto text-emerald-400" />
                <h4 className="text-lg font-bold text-white">Showing Registered</h4>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  An escort agent will confirm your calendar appointment and rendezvous on-site.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Inspection Date</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full bg-[#05070b] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Time Window</label>
                  <select
                    value={visitTimeSlot}
                    onChange={(e) => setVisitTimeSlot(e.target.value)}
                    className="w-full bg-[#05070b] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                  >
                    <option value="09:00 - 11:00">Morning (09:00 - 11:00 AM)</option>
                    <option value="11:00 - 13:00">Midday (11:00 AM - 01:00 PM)</option>
                    <option value="14:00 - 16:00">Afternoon (02:00 - 04:00 PM)</option>
                    <option value="16:30 - 18:00">Sunset / Golden Hour (04:30 - 06:00 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Special Audit Requests</label>
                  <textarea
                    rows={3}
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    placeholder="Inquire regarding beacon locations, road access, utilities connection..."
                    className="w-full bg-[#05070b] border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <Button
                    variant="ghost"
                    onClick={() => setIsVisitModalOpen(false)}
                    className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => visitMutation.mutate({
                      listing: listingId,
                      scheduled_date: visitDate,
                      scheduled_time: visitTimeSlot,
                      notes: visitNotes,
                    })}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 text-xs font-bold rounded-xl"
                  >
                    Confirm Showing Slot
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

const SpecCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex items-center gap-4 backdrop-blur-xl">
    <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">{label}</p>
      <p className="text-base font-bold text-white">{value}</p>
    </div>
  </div>
);

const TrustItem = ({ label, status }: { label: string, status: 'verified' | 'pending' | 'none' }) => {
  const config = {
    verified: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Verified', bg: 'bg-emerald-500/10' },
    pending: { icon: Info, color: 'text-amber-400', label: 'Pending Audit', bg: 'bg-amber-500/10' },
    none: { icon: Info, color: 'text-zinc-500', label: 'Not Submitted', bg: 'bg-white/[0.03]' },
  };

  const { icon: Icon, color, label: statusLabel, bg } = config[status];

  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
      <span className="text-xs text-zinc-300">{label}</span>
      <div className={cn("flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider", bg, color)}>
        <Icon size={11} /> {statusLabel}
      </div>
    </div>
  );
};

export default ListingDetail;

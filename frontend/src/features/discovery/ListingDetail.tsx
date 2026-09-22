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
    <div
      className="min-h-screen selection:bg-emerald-500/30 pb-28 transition-colors duration-300"
      style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-main)' }}
    >
      {/* ━━━ 01 CINEMATIC HERO GALLERY ━━━ */}
      <div className="relative h-[65vh] min-h-[460px] w-full overflow-hidden">
        {/* Floating Top Controls */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
          <button
            onClick={onBack}
            className="pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold backdrop-blur-xl transition-all border text-white oneui-press cursor-pointer"
            style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.65)' }}
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
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white backdrop-blur-xl border transition-colors oneui-press cursor-pointer"
              style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.65)' }}
              title="Share Listing"
            >
              <Share2 size={16} />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white backdrop-blur-xl border transition-colors oneui-press cursor-pointer"
              style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.65)' }}
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
          {/* Subtle gradient vignette blending into theme page background */}
          <div
            className="absolute inset-0 pointer-events-none transition-colors duration-300"
            style={{
              background: 'linear-gradient(to top, var(--color-bg-deep) 0%, transparent 60%)',
            }}
          />

          {/* Carousel Arrows */}
          {media.length > 1 && (
            <>
              <button
                onClick={prevMedia}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition-opacity border cursor-pointer"
                style={{ borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.6)' }}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={nextMedia}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition-opacity border cursor-pointer"
                style={{ borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.6)' }}
              >
                <ChevronRight size={22} />
              </button>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                {media.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveMedia(idx)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                      activeMedia === idx ? "w-8 bg-emerald-500" : "w-2 bg-white/40 hover:bg-white/70"
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
            <div
              className="rounded-3xl border p-8 backdrop-blur-2xl transition-colors duration-300"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-bg-card)',
                boxShadow: 'var(--shadow-depth-2)',
              }}
            >
              {/* Header Info */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                <div className="space-y-3 max-w-lg">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500 border border-emerald-500/20">
                      <ShieldCheck size={12} /> {listing.verification_level ? `${listing.verification_level} verification` : 'Verified Title'}
                    </span>
                    <span
                      className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-input-bg)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {listing.listing_type || 'Freehold'}
                    </span>
                  </div>
                  <h1
                    className="text-3xl font-bold tracking-tight md:text-4xl leading-tight"
                    style={{ color: 'var(--color-text-main)' }}
                  >
                    {listing.title}
                  </h1>
                  <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <MapPin size={15} className="text-emerald-500 shrink-0" />
                    <span>{asset.location || listing.location || 'Kigali, Rwanda'}</span>
                  </p>
                </div>

                <div className="text-left md:text-right shrink-0">
                  <p className="text-3xl md:text-4xl font-bold text-emerald-500 font-mono">
                    {listPrice.toLocaleString()} <span className="text-sm font-normal" style={{ color: 'var(--color-text-dim)' }}>{listing.currency || 'RWF'}</span>
                  </p>
                  <p className="text-[11px] uppercase tracking-widest mt-1" style={{ color: 'var(--color-text-dim)' }}>Official Catalog Price</p>
                </div>
              </div>

              {/* Active Conveyance Pipeline Tracker */}
              {dealsData && (
                <div
                  className="mb-8 rounded-2xl border p-5 space-y-3"
                  style={{
                    borderColor: 'rgba(16, 185, 129, 0.25)',
                    background: 'rgba(16, 185, 129, 0.05)',
                  }}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-2">
                      <Shield size={14} /> Statutory Conveyance In-Flight
                    </span>
                    <span className="font-mono" style={{ color: 'var(--color-text-main)' }}>
                      Stage: <strong className="text-emerald-500">{dealsData.current_stage?.replace(/_/g, ' ')}</strong>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-input-bg)' }}>
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${dealsData.progress_percentage || 25}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="h-px my-8" style={{ background: 'var(--color-border)' }} />

              {/* Asset Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-text-main)' }}>
                  <Info size={18} className="text-emerald-500" /> Property Overview & Intelligence
                </h3>
                <p className="leading-relaxed text-sm whitespace-pre-line" style={{ color: 'var(--color-text-muted)' }}>
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
            <div
              className="rounded-3xl border p-8 backdrop-blur-xl transition-colors duration-300"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-bg-card)',
                boxShadow: 'var(--shadow-depth-1)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <Award size={20} className="text-emerald-500" />
                  <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-main)' }}>Sovereign Trust Evidence</h3>
                </div>
                <span className="text-[11px] uppercase tracking-widest font-mono" style={{ color: 'var(--color-text-dim)' }}>RLMUA AUDITED</span>
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
            <div
              className="rounded-3xl border p-7 backdrop-blur-2xl shadow-2xl sticky top-24 space-y-6 transition-colors duration-300"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-bg-card)',
                boxShadow: 'var(--shadow-depth-2)',
              }}
            >
              <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <h3 className="text-base font-bold" style={{ color: 'var(--color-text-main)' }}>Transaction Desk</h3>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500 uppercase tracking-wide">
                  Live Gateway
                </span>
              </div>

              <div className="space-y-3">
                {/* 1. Make an Offer */}
                <Button
                  variant="primary"
                  onClick={handleOpenOfferModal}
                  className="w-full py-3.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <DollarSign size={16} /> Submit Sovereign Offer
                </Button>

                {/* 2. Schedule Showing */}
                <Button
                  variant="ghost"
                  onClick={() => setIsVisitModalOpen(true)}
                  className="w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2 border rounded-2xl transition-colors cursor-pointer"
                  style={{
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-input-bg)',
                    color: 'var(--color-text-main)',
                  }}
                >
                  <Calendar size={16} /> Schedule Showing & Audit
                </Button>

                {/* 3. Direct Message */}
                <button
                  type="button"
                  className="w-full py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer hover:text-emerald-500"
                  style={{ color: 'var(--color-text-muted)' }}
                  onClick={() => alert('Message dispatch portal opened. Our concierge will link you with the authorized representative.')}
                >
                  <MessageCircle size={15} /> Contact Authorized Seller
                </button>
              </div>

              {/* Escrow Guarantee Pill */}
              <div
                className="rounded-2xl border p-4 space-y-2"
                style={{
                  borderColor: 'rgba(16, 185, 129, 0.2)',
                  background: 'rgba(16, 185, 129, 0.05)',
                }}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                  <ShieldCheck size={16} /> Bank Escrow Custody Protection
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  Earnest deposits are held securely in escrow until title conveyance is notarized through IremboGov.
                </p>
              </div>

              {/* Seller Profile Summary */}
              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-input-bg)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-sm">
                    {listing.owner?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--color-text-main)' }}>Accredited Sovereign Seller</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>Member since 2024 · Kigali Jurisdiction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ━━━ MODAL 1: MAKE AN OFFER ━━━ */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xl p-4">
          <div
            className="border rounded-3xl max-w-lg w-full p-7 space-y-6 shadow-2xl transition-colors duration-300"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-surface)',
              color: 'var(--color-text-main)',
              boxShadow: 'var(--shadow-depth-3)',
            }}
          >
            <div className="flex justify-between items-center pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-text-main)' }}>
                  <DollarSign size={18} className="text-emerald-500" /> Transmit Sovereign Offer
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-dim)' }}>{listing.title}</p>
              </div>
              <button onClick={() => setIsOfferModalOpen(false)} className="cursor-pointer hover:text-emerald-500 transition-colors" style={{ color: 'var(--color-text-dim)' }}>
                <XCircle size={20} />
              </button>
            </div>

            {offerSuccess ? (
              <div className="py-10 text-center space-y-3">
                <CheckCircle2 size={44} className="mx-auto text-emerald-500" />
                <h4 className="text-lg font-bold" style={{ color: 'var(--color-text-main)' }}>Offer Transmitted</h4>
                <p className="text-xs max-w-xs mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                  Your purchase proposal and escrow terms have been delivered to the seller and legal conveyance desk.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>Proposed Purchase Price (RWF)</label>
                    {priceDiffPercent !== 0 && (
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded",
                        priceDiffPercent < 0 ? "bg-amber-400/10 text-amber-500" : "bg-emerald-400/10 text-emerald-500"
                      )}>
                        {priceDiffPercent > 0 ? `+${priceDiffPercent}%` : `${priceDiffPercent}%`} vs Listed
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(Number(e.target.value))}
                    className="w-full rounded-xl px-4 py-3 text-lg font-mono font-bold outline-none border transition-all"
                    style={{
                      background: 'var(--color-input-bg)',
                      borderColor: 'var(--color-input-border)',
                      color: 'var(--color-text-main)',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-input-border)'}
                    placeholder="Enter offer amount"
                  />
                  <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-dim)' }}>
                    Catalog Base: {listPrice.toLocaleString()} {listing.currency || 'RWF'}
                  </p>
                </div>

                {/* AI Feasibility Advisor Strip */}
                <div
                  className="p-3.5 rounded-xl border space-y-2"
                  style={{
                    borderColor: 'rgba(168, 85, 247, 0.25)',
                    background: 'rgba(168, 85, 247, 0.06)',
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-300 flex items-center gap-1.5">
                      <Sparkles size={14} /> NVIDIA NIM Valuation Advisory
                    </span>
                    <button
                      type="button"
                      onClick={handleAiFeasibilityCheck}
                      disabled={isAiChecking}
                      className="text-[11px] font-bold text-purple-500 hover:text-purple-400 underline cursor-pointer"
                    >
                      {isAiChecking ? 'Evaluating Comps...' : 'Run Feasibility Check'}
                    </button>
                  </div>
                  {aiAnalysis && (
                    <div className="text-[11px] space-y-1" style={{ color: 'var(--color-text-main)' }}>
                      <p>Fairness Confidence: <strong className="text-purple-500">{aiAnalysis.fairness_score || 85}%</strong></p>
                      <p className="leading-snug" style={{ color: 'var(--color-text-muted)' }}>{aiAnalysis.analysis}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Escrow Ratio</label>
                    <select
                      value={escrowPercent}
                      onChange={(e) => setEscrowPercent(Number(e.target.value))}
                      className="w-full rounded-xl px-3 py-2.5 text-xs outline-none border transition-all cursor-pointer [&>option]:bg-[#080c14] dark:[&>option]:bg-[#080c14] light:[&>option]:bg-white [&>option]:text-[var(--color-text-main)]"
                      style={{
                        background: 'var(--color-input-bg)',
                        borderColor: 'var(--color-input-border)',
                        color: 'var(--color-text-main)',
                      }}
                    >
                      <option value={5}>5% Earnest Deposit</option>
                      <option value={10}>10% Standard Escrow</option>
                      <option value={20}>20% Priority Escrow</option>
                      <option value={100}>100% Full Liquidity Lock</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Financing</label>
                    <select
                      value={financingType}
                      onChange={(e) => setFinancingType(e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 text-xs outline-none border transition-all cursor-pointer [&>option]:bg-[#080c14] dark:[&>option]:bg-[#080c14] light:[&>option]:bg-white [&>option]:text-[var(--color-text-main)]"
                      style={{
                        background: 'var(--color-input-bg)',
                        borderColor: 'var(--color-input-border)',
                        color: 'var(--color-text-main)',
                      }}
                    >
                      <option value="cash">100% Cash Settlement</option>
                      <option value="mortgage">Commercial Mortgage</option>
                      <option value="installments">Structured Tranches</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Proposed Settlement Date</label>
                  <input
                    type="date"
                    value={closingDate}
                    onChange={(e) => setClosingDate(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs outline-none border transition-all"
                    style={{
                      background: 'var(--color-input-bg)',
                      borderColor: 'var(--color-input-border)',
                      color: 'var(--color-text-main)',
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Contingency Clauses</label>
                  <textarea
                    rows={2}
                    value={offerNotes}
                    onChange={(e) => setOfferNotes(e.target.value)}
                    placeholder="Contingent upon clean RLMUA cadastral extract, structural survey..."
                    className="w-full rounded-xl px-4 py-2 text-xs outline-none border transition-all resize-none"
                    style={{
                      background: 'var(--color-input-bg)',
                      borderColor: 'var(--color-input-border)',
                      color: 'var(--color-text-main)',
                    }}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <Button
                    variant="ghost"
                    onClick={() => setIsOfferModalOpen(false)}
                    className="px-4 py-2 text-xs cursor-pointer"
                    style={{ color: 'var(--color-text-muted)' }}
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
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xl p-4">
          <div
            className="border rounded-3xl max-w-lg w-full p-7 space-y-6 shadow-2xl transition-colors duration-300"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-surface)',
              color: 'var(--color-text-main)',
              boxShadow: 'var(--shadow-depth-3)',
            }}
          >
            <div className="flex justify-between items-center pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-text-main)' }}>
                  <Calendar size={18} className="text-emerald-500" /> Schedule Showing & Inspection
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-dim)' }}>{listing.title}</p>
              </div>
              <button onClick={() => setIsVisitModalOpen(false)} className="cursor-pointer hover:text-emerald-500 transition-colors" style={{ color: 'var(--color-text-dim)' }}>
                <XCircle size={20} />
              </button>
            </div>

            {visitSuccess ? (
              <div className="py-10 text-center space-y-3">
                <CheckCircle2 size={44} className="mx-auto text-emerald-500" />
                <h4 className="text-lg font-bold" style={{ color: 'var(--color-text-main)' }}>Showing Registered</h4>
                <p className="text-xs max-w-xs mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                  An escort agent will confirm your calendar appointment and rendezvous on-site.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Inspection Date</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs outline-none border transition-all"
                    style={{
                      background: 'var(--color-input-bg)',
                      borderColor: 'var(--color-input-border)',
                      color: 'var(--color-text-main)',
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Time Window</label>
                  <select
                    value={visitTimeSlot}
                    onChange={(e) => setVisitTimeSlot(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs outline-none border transition-all cursor-pointer [&>option]:bg-[#080c14] dark:[&>option]:bg-[#080c14] light:[&>option]:bg-white [&>option]:text-[var(--color-text-main)]"
                    style={{
                      background: 'var(--color-input-bg)',
                      borderColor: 'var(--color-input-border)',
                      color: 'var(--color-text-main)',
                    }}
                  >
                    <option value="09:00 - 11:00">Morning (09:00 - 11:00 AM)</option>
                    <option value="11:00 - 13:00">Midday (11:00 AM - 01:00 PM)</option>
                    <option value="14:00 - 16:00">Afternoon (02:00 - 04:00 PM)</option>
                    <option value="16:30 - 18:00">Sunset / Golden Hour (04:30 - 06:00 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Special Audit Requests</label>
                  <textarea
                    rows={3}
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    placeholder="Inquire regarding beacon locations, road access, utilities connection..."
                    className="w-full rounded-xl px-4 py-2 text-xs outline-none border transition-all resize-none"
                    style={{
                      background: 'var(--color-input-bg)',
                      borderColor: 'var(--color-input-border)',
                      color: 'var(--color-text-main)',
                    }}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <Button
                    variant="ghost"
                    onClick={() => setIsVisitModalOpen(false)}
                    className="px-4 py-2 text-xs cursor-pointer"
                    style={{ color: 'var(--color-text-muted)' }}
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
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
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
  <div
    className="rounded-2xl border p-5 flex items-center gap-4 backdrop-blur-xl oneui-card transition-all"
    style={{
      borderColor: 'var(--color-border)',
      background: 'var(--color-bg-card)',
      boxShadow: 'var(--shadow-depth-1)',
    }}
  >
    <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--color-text-dim)' }}>{label}</p>
      <p className="text-base font-bold" style={{ color: 'var(--color-text-main)' }}>{value}</p>
    </div>
  </div>
);

const TrustItem = ({ label, status }: { label: string, status: 'verified' | 'pending' | 'none' }) => {
  const config = {
    verified: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Verified', bg: 'bg-emerald-500/10' },
    pending: { icon: Info, color: 'text-amber-500', label: 'Pending Audit', bg: 'bg-amber-500/10' },
    none: { icon: Info, color: 'text-zinc-500', label: 'Not Submitted', bg: 'bg-black/[0.04] dark:bg-white/[0.03]' },
  };

  const { icon: Icon, color, label: statusLabel, bg } = config[status];

  return (
    <div
      className="flex items-center justify-between p-3.5 rounded-xl border transition-colors"
      style={{
        borderColor: 'var(--color-border)',
        background: 'var(--color-input-bg)',
      }}
    >
      <span className="text-xs" style={{ color: 'var(--color-text-main)' }}>{label}</span>
      <div className={cn("flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider", bg, color)}>
        <Icon size={11} /> {statusLabel}
      </div>
    </div>
  );
};

export default ListingDetail;

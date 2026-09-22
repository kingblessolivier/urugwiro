import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Building2,
  Car,
  Home,
  Map as MapIcon,
  Search,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Lock,
  Sparkles,
  ChevronDown,
  Users,
  TrendingUp,
  Globe,
  Key,
  Bike,
  ChevronLeft,
  ChevronRight,
  MapPin,
  BadgeCheck,
} from 'lucide-react';
import { ListingCard } from '../../components/ui/ListingCard';
import type { ListingCardData } from '../../components/ui/ListingCard';
import { Button } from '../../components/ui/Button';
import { api } from '../../api/endpoints';
import type { AppView } from '../../types/navigation';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

interface HomePageProps {
  onExplore: (query?: string) => void;
  onSell: () => void;
  onNavigate: (view: AppView) => void;
  onListingClick?: (id: string) => void;
}

interface HeroSlide {
  id: string;
  pillLabel: string;
  icon: React.ElementType;
  query: string;
  image: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  caption: string;
  price: string;
  watermark: string;
  coordinates: string;
  cadastreRef: string;
  aiAdvice: {
    tag: string;
    text: string;
    metric: string;
  };
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'house',
    pillLabel: 'Homes & Villas',
    icon: Home,
    query: 'house',
    image: '/images/hero/house.jpg',
    title: 'Luxury Homes & Villas',
    subtitle: 'Nyarutarama & Gacuriro, Kigali',
    searchPlaceholder: 'Search villas in Nyarutarama, Gacuriro, Kiyovu...',
    caption: 'Modern Villa, Nyarutarama',
    price: '480,000,000 RWF',
    watermark: 'ESTATES',
    coordinates: '1°56\'22"S 30°05\'48"E',
    cadastreRef: 'UPI 1/02/11/04/1820',
    aiAdvice: {
      tag: 'AI Investment Analysis',
      text: 'Prime Nyarutarama Expat Corridor • Projected 11.4% Annual Rental Yield',
      metric: '98.5% Valuation Match',
    },
  },
  {
    id: 'land',
    pillLabel: 'Titled Land',
    icon: MapIcon,
    query: 'land',
    image: '/images/hero/land.jpg',
    title: 'Prime Titled Land',
    subtitle: 'RLMUA Cadastre Verified, Gasabo',
    searchPlaceholder: 'Search titled plots in Gasabo, Kicukiro, Bugesera...',
    caption: 'Titled Hillside Parcel, Gasabo',
    price: '95,000,000 RWF',
    watermark: 'CADASTRE',
    coordinates: '1°54\'10"S 30°07\'15"E',
    cadastreRef: 'UPI 1/02/08/03/4921',
    aiAdvice: {
      tag: 'AI Cadastre & Zoning Engine',
      text: 'RLMUA Master Plan R2 Medium Density • Clean Title Deed • Zero Encumbrance',
      metric: '100% Title Verified',
    },
  },
  {
    id: 'car',
    pillLabel: 'Executive SUVs',
    icon: Car,
    query: 'vehicle',
    image: '/images/hero/car.jpg',
    title: 'Executive SUVs',
    subtitle: 'Certified & Inspected, Kigali',
    searchPlaceholder: 'Search Toyota Land Cruiser, RAV4, Defender...',
    caption: 'Land Cruiser LC300 GR-Sport',
    price: '165,000,000 RWF',
    watermark: 'EXECUTIVE',
    coordinates: '1°57\'05"S 30°03\'55"E',
    cadastreRef: 'VIN-RW-2024-8891',
    aiAdvice: {
      tag: 'AI Price & Fleet Audit',
      text: '4.2% Below Kigali Market Median • Verified Rwanda Customs Dossier & Tech Health',
      metric: 'Grade A Inspected',
    },
  },
  {
    id: 'motorbike',
    pillLabel: 'Bikes & Fleets',
    icon: Bike,
    query: 'vehicle',
    image: '/images/hero/motorbike.jpg',
    title: 'Bikes & Fleet Mobility',
    subtitle: 'Urban & Adventure Touring',
    searchPlaceholder: 'Search BMW GS, electric bikes, TVS...',
    caption: 'Adventure Touring Machine',
    price: '18,500,000 RWF',
    watermark: 'MOBILITY',
    coordinates: '1°57\'44"S 30°04\'12"E',
    cadastreRef: 'FLEET-KGL-0419',
    aiAdvice: {
      tag: 'AI Fleet ROI Forecast',
      text: 'High Urban Courier & Tourism Demand • Fast 14-Month Payback Velocity',
      metric: 'Optimal Fleet ROI',
    },
  },
];

const categories = [
  { label: 'Homes & Villas', icon: Home, query: 'sale', desc: 'Luxury residences & family homes' },
  { label: 'Land & Plots', icon: MapIcon, query: 'land', desc: 'Verified land with UPI cadastre' },
  { label: 'Apartments', icon: Building2, query: 'apartment', desc: 'Modern urban living spaces' },
  { label: 'Vehicles', icon: Car, query: 'vehicle', desc: 'Cars, SUVs & motorcycles' },
  { label: 'Commercial', icon: Building2, query: 'commercial', desc: 'Office & retail spaces' },
  { label: 'Rentals', icon: Key, query: 'rental', desc: 'Short & long-term rentals' },
];

const pillars = [
  {
    title: 'RLMUA Verified',
    description: 'Every land parcel cross-referenced with Rwanda\'s official cadastre registry for authentic ownership verification.',
    icon: ShieldCheck,
  },
  {
    title: 'Escrow Protected',
    description: 'Your deposit is secured in regulated escrow custody until the conveyance closes — protecting both buyer and seller.',
    icon: Lock,
  },
  {
    title: 'AI-Powered Insights',
    description: 'Market valuation models, document verification, and intelligent matching powered by advanced AI infrastructure.',
    icon: Sparkles,
  },
];

const steps = [
  { step: '01', title: 'Discover', desc: 'Search verified listings with intelligent filters, AI intent search, or browse curated collections.' },
  { step: '02', title: 'Verify', desc: 'Review documentation, verification status, and get AI-powered market valuations before committing.' },
  { step: '03', title: 'Transact', desc: 'Make offers, schedule visits, and close deals through our secure escrow-protected pipeline.' },
];

const mapApiListing = (item: Record<string, unknown>): ListingCardData => {
  const media = Array.isArray(item.media) ? item.media : [];
  const asset = (item.asset as Record<string, unknown> | undefined) || {};
  const locationParts = [asset.district, asset.province, item.location].filter(Boolean);
  return {
    id: String(item.id ?? item.slug ?? ''),
    title: String(item.title ?? asset.name ?? 'Listing'),
    price: Number(item.price) || 0,
    currency: String(item.currency ?? 'RWF'),
    location: locationParts.length ? locationParts.join(', ') : 'Rwanda',
    listing_type: String(item.listing_type ?? item.type ?? 'Listing'),
    verification_level: (item.verification_level as ListingCardData['verification_level']) || 'none',
    media,
    specs: (item.specs as ListingCardData['specs']) || undefined,
  };
};

const HomePage: React.FC<HomePageProps> = ({ onExplore, onSell, onNavigate, onListingClick }) => {
  const { isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartXRef.current - touchEndX;
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
      } else {
        setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
      }
    }
    touchStartXRef.current = null;
  };

  const currentSlide = HERO_SLIDES[activeSlide];

  const listingsQuery = useQuery({
    queryKey: ['homepage-listings'],
    queryFn: async () => {
      const response = await api.listings.list({ sort: 'newest' });
      const payload = response.data;
      const rows = Array.isArray(payload) ? payload : payload?.results || [];
      return rows.map(mapApiListing).filter((listing: ListingCardData) => listing.id);
    },
    retry: false,
  });

  const statsQuery = useQuery({
    queryKey: ['homepage-platform-stats'],
    queryFn: async () => {
      const response = await api.public.platformStats();
      return response.data;
    },
    staleTime: 60000,
  });

  const featured = useMemo(() => (listingsQuery.data || []).slice(0, 6), [listingsQuery.data]);
  const totalListings = listingsQuery.data?.length || 0;

  const liveStats = statsQuery.data || {
    properties_listed: totalListings,
    verified_listings: 0,
    completed_deals: 0,
    active_deals: 0,
    active_users: 0,
    districts_covered: 30,
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    onExplore(query || currentSlide.query);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden transition-colors duration-300" style={{ background: 'var(--color-bg-deep)' }}>
      {/* ━━━ 01 — CINEMATIC FULL-BLEED HERO BACKGROUND CAROUSEL ━━━ */}
      <section 
        className="relative isolate min-h-[86svh] sm:min-h-screen flex flex-col justify-between px-3.5 pt-5 pb-4 sm:px-8 sm:pt-8 sm:pb-6 lg:px-12 lg:pt-12 lg:pb-10 overflow-hidden w-full select-none sm:select-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Full-bleed edge-to-edge background images for entire hero */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                activeSlide === idx ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className={cn(
                  "w-full h-full object-cover object-center transition-transform duration-7000 ease-out",
                  activeSlide === idx ? "scale-105" : "scale-100"
                )}
                loading="eager"
              />
            </div>
          ))}

          {/* Architectural Spatial Micro-Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px] opacity-35 pointer-events-none" />

          {/* Deep Cinematic Radial Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(5,7,11,0.45)_65%,#05070b_100%)] pointer-events-none" />

          {/* Subtle shaded architectural watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <span className="text-[17vw] sm:text-[16vw] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/[0.035] leading-none whitespace-nowrap drop-shadow-2xl">
              {currentSlide.watermark}
            </span>
          </div>

          {/* Balanced cinematic overlays */}
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-x-0 top-0 h-32 sm:h-44 bg-gradient-to-b from-[#05070b] via-[#05070b]/70 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-44 sm:h-60 bg-gradient-to-t from-[#05070b] via-[#05070b]/80 to-transparent pointer-events-none" />

          {/* Brand ambient glows */}
          <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] sm:h-[600px] sm:w-[600px] rounded-full bg-emerald-500/[0.10] blur-[150px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 h-[260px] w-[260px] sm:h-[500px] sm:w-[500px] rounded-full bg-[#f98604]/[0.07] blur-[150px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[220px] w-[220px] sm:h-[400px] sm:w-[400px] rounded-full bg-white/[0.03] blur-[130px] pointer-events-none" />
        </div>

        {/* Spatial Telemetry Pill (Desktop Cadastral & GPS Coordinates) */}
        <div className="hidden md:flex absolute top-8 left-8 xl:top-12 xl:left-12 z-10 items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/55 border border-white/15 backdrop-blur-xl text-[10px] font-mono text-zinc-300 shadow-xl transition-all pointer-events-auto">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-emerald-400 font-bold uppercase tracking-wider">CADASTRE // {currentSlide.cadastreRef}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">{currentSlide.coordinates}</span>
        </div>

        {/* Floating Shaded AI Advisory Intelligence Card (Desktop / Tablet Background) */}
        <div className="hidden lg:flex absolute top-8 right-8 xl:top-12 xl:right-12 z-10 max-w-xs flex-col gap-1.5 rounded-2xl border border-emerald-500/25 bg-black/55 p-3.5 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition-all duration-700 hover:border-emerald-500/50 hover:bg-black/75 pointer-events-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles size={13} className="animate-pulse text-emerald-400" />
              <span>{currentSlide.aiAdvice.tag}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              {currentSlide.aiAdvice.metric}
            </span>
          </div>
          <p className="text-xs text-zinc-200 leading-snug font-medium">
            "{currentSlide.aiAdvice.text}"
          </p>
          <div className="pt-1.5 flex items-center justify-between text-[10px] text-zinc-400 border-t border-white/10 mt-0.5">
            <span className="text-zinc-500 font-mono">Autonomous Engine</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Advice
            </span>
          </div>
        </div>

        {/* CENTER: Clean Headline, Shaded Link Capsule & Search Bar */}
        <div className="relative z-10 mx-auto w-full max-w-3xl text-center space-y-3.5 sm:space-y-4 my-auto py-3 sm:py-6">
          {/* Shaded Link Capsule */}
          <div className="px-2">
            <button
              type="button"
              onClick={() => onExplore(currentSlide.query)}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-medium text-zinc-200 bg-black/60 hover:bg-black/85 border border-emerald-500/30 hover:border-emerald-400/60 backdrop-blur-2xl transition-all shadow-[0_4px_20px_rgba(0,0,0,0.6)] cursor-pointer group max-w-full"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="truncate">Explore verified {currentSlide.title.toLowerCase()} in Rwanda</span>
              <ArrowRight size={12} className="text-zinc-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          </div>

          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent drop-shadow-[0_8px_32px_rgba(0,0,0,0.9)] leading-[1.1]">
            {currentSlide.title}
          </h1>

          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/15 text-zinc-200 text-xs sm:text-sm font-medium backdrop-blur-md shadow-md">
              <MapPin size={12} className="text-emerald-400" />
              <span>{currentSlide.subtitle}</span>
            </span>
          </div>

          {/* Shaded AI Property Advice Capsule */}
          <div className="flex justify-center px-2">
            <div className="inline-flex items-center gap-2 sm:gap-2.5 rounded-full px-3.5 sm:px-4 py-1.5 bg-gradient-to-r from-emerald-950/40 via-black/65 to-emerald-950/40 hover:from-emerald-950/60 hover:to-emerald-950/60 border border-emerald-500/40 backdrop-blur-2xl text-zinc-200 shadow-[0_4px_24px_rgba(16,185,129,0.18)] transition-all max-w-full group">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/25 text-emerald-400 shrink-0 border border-emerald-500/40 shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                <Sparkles size={11} className="animate-pulse text-emerald-400" />
              </div>
              <div className="flex items-center gap-1.5 text-left min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-400 shrink-0">
                  AI Advice:
                </span>
                <span className="text-zinc-100 text-[11px] sm:text-xs font-medium truncate max-w-[200px] xs:max-w-[280px] sm:max-w-md">
                  {currentSlide.aiAdvice.text}
                </span>
              </div>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 shrink-0">
                {currentSlide.aiAdvice.metric}
              </span>
            </div>
          </div>

          {/* Clean Floating Search Bar (Single sleek inline bar on all screens) */}
          <form onSubmit={submitSearch} className="pt-1 sm:pt-2 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-2xl border border-white/25 hover:border-emerald-400/60 focus-within:border-emerald-400/80 bg-black/75 p-1.5 sm:p-2 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.75)] transition-all">
              <div className="flex flex-1 items-center gap-2 sm:gap-3 px-2 sm:px-4 min-w-0">
                <Search size={16} className="text-emerald-400 shrink-0 sm:hidden" />
                <Search size={18} className="text-emerald-400 shrink-0 hidden sm:block" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  placeholder={currentSlide.searchPlaceholder}
                  className="w-full bg-transparent py-2 sm:py-3 text-white outline-none placeholder:text-zinc-400 text-xs sm:text-sm min-w-0 font-medium"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="text-zinc-400 hover:text-white p-1 text-xs shrink-0"
                  >
                    ×
                  </button>
                )}
              </div>
              <Button
                variant="primary"
                className="shrink-0 rounded-xl px-4 sm:px-7 py-2 sm:py-3 font-bold bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white transition-all active:scale-[0.97] shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 text-xs sm:text-sm cursor-pointer border border-emerald-400/20"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Shaded Quick Link Pills */}
          <div className="pt-1 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap text-xs">
            <span className="text-zinc-400 text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold mr-0.5">Trending:</span>
            {[
              { label: 'Nyarutarama', q: 'Nyarutarama' },
              { label: 'Gasabo Plots', q: 'Gasabo land' },
              { label: 'Gacuriro', q: 'Gacuriro' },
              { label: 'Executive SUVs', q: 'SUV' },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => onExplore(item.q)}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/15 hover:border-emerald-400/40 text-zinc-200 hover:text-white text-[11px] sm:text-xs backdrop-blur-xl transition-all shadow-sm cursor-pointer group"
              >
                <span>{item.label}</span>
                <ArrowUpRight size={10} className="text-zinc-400 group-hover:text-emerald-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* BOTTOM ROW: Minimal Caption & Slide Controls */}
        <div className="relative z-10 mx-auto max-w-7xl w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 text-xs">
          {/* Active slide caption */}
          <div className="flex items-center justify-center gap-2 text-zinc-200 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/15 text-[11px] sm:text-xs max-w-full shadow-2xl">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 shrink-0 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              <Sparkles size={10} className="text-emerald-400" />
              <span>AI Verified</span>
            </span>
            <span className="text-zinc-600">•</span>
            <span className="font-semibold text-white truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none">{currentSlide.caption}</span>
            <span className="text-zinc-500">•</span>
            <span className="text-emerald-400 font-mono font-bold whitespace-nowrap">{currentSlide.price}</span>
            <button
              type="button"
              onClick={() => onExplore(currentSlide.query)}
              className="ml-1 text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap group"
            >
              <span>Explore</span>
              <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Clean Controls with finger-friendly touch targets and glowing active pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-xl px-2.5 sm:px-3 py-1.5 rounded-full border border-white/15 shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              aria-label="Previous slide"
              className="h-7 w-7 sm:h-6 sm:w-6 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-90"
            >
              <ChevronLeft size={15} />
            </button>

            {/* Slide dots with glowing active pill */}
            <div className="flex items-center gap-1.5 px-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                    activeSlide === idx 
                      ? "w-7 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" 
                      : "w-2 bg-white/25 hover:bg-white/60 hover:w-3"
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
              aria-label="Next slide"
              className="h-7 w-7 sm:h-6 sm:w-6 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-90"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Subtle scroll indicator */}
        <div className="hidden sm:flex absolute bottom-1.5 left-1/2 -translate-x-1/2 flex-col items-center text-zinc-500 animate-bounce pointer-events-none">
          <ChevronDown size={15} />
        </div>
      </section>

      {/* ━━━ 02 — CATEGORY EXPLORER ━━━ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20 lg:px-12">
        <div className="mb-8 sm:mb-12 flex items-end justify-between">
          <div className="space-y-2 sm:space-y-3">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500">Discover</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-main)' }}>Browse by Category</h2>
          </div>
          <button
            onClick={() => onExplore('')}
            className="flex items-center gap-1.5 text-xs sm:text-sm transition-colors hover:text-emerald-500"
            style={{ color: 'var(--color-text-muted)' }}
          >
            View all <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => onExplore(cat.query)}
                className="group rounded-2xl border p-3.5 sm:p-5 text-left transition-all duration-300 hover:border-emerald-500/40 oneui-card cursor-pointer"
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-bg-card)',
                  boxShadow: 'var(--shadow-depth-1)',
                }}
              >
                <div className="mb-3 sm:mb-4 inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-all group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/25">
                  <Icon size={18} />
                </div>
                <span className="block text-xs sm:text-sm font-semibold leading-tight" style={{ color: 'var(--color-text-main)' }}>{cat.label}</span>
                <span className="mt-1 block text-[10px] sm:text-[11px] group-hover:text-zinc-400 transition-colors line-clamp-2" style={{ color: 'var(--color-text-dim)' }}>{cat.desc}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ━━━ 03 — FEATURED LISTINGS ━━━ */}
      <section className="px-4 py-12 sm:py-20 lg:px-12 transition-colors duration-300"
        style={{ background: 'var(--color-section-alt)', borderTop: '1px solid var(--color-section-alt-border)', borderBottom: '1px solid var(--color-section-alt-border)' }}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 sm:mb-12 flex items-end justify-between">
            <div className="space-y-2 sm:space-y-3">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500">Curated</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-main)' }}>Exclusive Listings</h2>
              <p className="mt-1 text-xs sm:text-sm max-w-xl" style={{ color: 'var(--color-text-dim)' }}>Hand-picked properties with verified cadastral boundaries and titles.</p>
            </div>
            <button
              onClick={() => onExplore('')}
              className="flex items-center gap-1.5 text-xs sm:text-sm transition-colors hover:text-emerald-500"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Explore all <ArrowRight size={14} />
            </button>
          </div>

          {featured.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featured.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onClick={onListingClick} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Button variant="ghost" onClick={() => onExplore('')} className="text-xs py-2.5 hover:text-emerald-500 transition-colors" style={{ color: 'var(--color-text-muted)' }}>
              View all listings <ArrowRight size={14} className="ml-1.5 inline" />
            </Button>
          </div>
        </div>
      </section>

      {/* ━━━ 04 — WHY URUGWIRO (TRUST PILLARS) ━━━ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20 lg:px-12">
        <div className="mb-10 sm:mb-16 text-center space-y-2.5 sm:space-y-3 max-w-2xl mx-auto">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500">The Urugwiro Standard</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--color-text-main)' }}>Beyond simple classifieds</h2>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>We built a marketplace where every transaction is backed by verification, protection, and spatial intelligence.</p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {pillars.map((prop) => (
            <div key={prop.title}
              className="rounded-2xl border p-5 sm:p-8 transition-all duration-300 hover:border-emerald-500/30 group oneui-card"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-bg-card)',
                boxShadow: 'var(--shadow-depth-2)',
              }}
            >
              <div className="mb-4 sm:mb-6 inline-flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all group-hover:shadow-lg group-hover:shadow-emerald-500/20">
                <prop.icon size={22} />
              </div>
              <h3 className="mb-2 text-base sm:text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>{prop.title}</h3>
              <p className="leading-relaxed text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>{prop.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━ 05 — HOW IT WORKS ━━━ */}
      <section className="px-4 py-12 sm:py-20 lg:px-12 transition-colors duration-300"
        style={{ background: 'var(--color-section-alt)', borderTop: '1px solid var(--color-section-alt-border)', borderBottom: '1px solid var(--color-section-alt-border)' }}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 sm:mb-16 text-center space-y-2.5 sm:space-y-3">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500">Process</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-main)' }}>How it Works</h2>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.step} className="relative text-left p-5 sm:p-6 rounded-2xl border oneui-card"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-depth-1)' }}>
                <div className="mb-3 sm:mb-5 inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 font-mono text-xs sm:text-sm font-bold">
                  {s.step}
                </div>
                <h3 className="mb-1.5 sm:mb-3 text-base sm:text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>{s.title}</h3>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{s.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute -right-4 top-8 z-10">
                    <div className="h-8 w-8 flex items-center justify-center rounded-full" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                      <ArrowRight size={14} style={{ color: 'var(--color-text-dim)' }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 06 — MARKET STATISTICS (LIVE DATABASE AUDIT) ━━━ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20 lg:px-12">
        <div className="rounded-3xl border p-6 sm:p-10 md:p-14 transition-colors duration-300"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-depth-2)' }}>
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4 text-center">
            {[
              { icon: Building2, value: Number(liveStats.properties_listed || totalListings || 0).toLocaleString(), label: 'Live Catalog Properties' },
              { icon: CheckCircle2, value: Number(liveStats.verified_listings || 0).toLocaleString(), label: 'RLMUA Cadastre Verified' },
              { icon: Users, value: Number(liveStats.active_users || 0).toLocaleString(), label: 'Platform Members' },
              { icon: Globe, value: `${liveStats.districts_covered || 30}`, label: 'Districts Across Rwanda' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label}>
                <Icon size={20} className="mx-auto mb-2 text-emerald-500" />
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono" style={{ color: 'var(--color-text-main)' }}>{value}</p>
                <p className="mt-1 text-[11px] sm:text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 08 — SELLER CTA ━━━ */}
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-4 sm:py-20 lg:px-12 overflow-hidden w-full">
        <div className="relative overflow-hidden rounded-3xl border p-6 sm:p-10 md:p-14 text-center"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(8,126,57,0.1) 0%, rgba(255,255,255,0.02) 60%, transparent 100%)'
              : 'linear-gradient(135deg, rgba(8,126,57,0.06) 0%, #ffffff 60%, #f0fdf4 100%)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-depth-2)',
          }}>
          <div className="absolute top-0 right-0 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-emerald-500/[0.07] blur-[80px]" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight" style={{ color: 'var(--color-text-main)' }}>Have a property to sell?</h2>
            <p className="mx-auto mt-3 sm:mt-5 max-w-xl text-xs sm:text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Join Rwanda's most trusted marketplace. Submit your property proposal for physical cadastre inspection and connect with serious, verified investors.
            </p>
            <div className="mt-6 sm:mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                variant="primary"
                onClick={onSell}
                className="w-full sm:w-auto rounded-xl px-8 py-3.5 text-sm sm:text-base font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
              >
                Submit Property Proposal
              </Button>
              <button
                onClick={() => onNavigate('about')}
                className="text-xs sm:text-sm flex items-center justify-center gap-1.5 py-2 transition-colors cursor-pointer hover:text-emerald-500"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Learn how it works <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

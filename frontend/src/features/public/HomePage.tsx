import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Building2,
  Car,
  Home,
  Map as MapIcon,
  Search,
  CheckCircle2,
  ChevronDown,
  Users,
  Globe,
  Key,
  Bike,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { ListingCard } from '../../components/ui/ListingCard';
import type { ListingCardData } from '../../components/ui/ListingCard';
import { Button } from '../../components/ui/Button';
import { SkeletonGrid, ErrorState } from '../../components/ui/Dashboard';
import { api } from '../../api/endpoints';
import type { AppView } from '../../types/navigation';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { useSavedListings } from '../../hooks/useSavedListings';

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
  cornerBadge: string;
  systemExplanation: string;
  watermark: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'house',
    pillLabel: 'Homes & Villas',
    icon: Home,
    query: 'house',
    image: '/images/hero/house.jpg',
    title: 'Homes & Villas Across Rwanda',
    cornerBadge: 'Review Status Visible',
    systemExplanation: 'Compare listing details and check the recorded document-review status before contacting a seller.',
    watermark: 'ESTATES',
  },
  {
    id: 'land',
    pillLabel: 'Titled Land',
    icon: MapIcon,
    query: 'land',
    image: '/images/hero/land.jpg',
    title: 'Titled Plots Across Rwanda',
    cornerBadge: 'Parcel Details Available',
    systemExplanation: 'Review location, area, UPI, and zoning details when they have been supplied for a parcel.',
    watermark: 'CADASTRE',
  },
  {
    id: 'car',
    pillLabel: 'Executive SUVs',
    icon: Car,
    query: 'vehicle',
    image: '/images/hero/car.jpg',
    title: 'Vehicles Across Rwanda',
    cornerBadge: 'Detailed Vehicle Records',
    systemExplanation: 'Compare seller-supplied specifications, condition, mileage, and document status in one place.',
    watermark: 'EXECUTIVE',
  },
  {
    id: 'motorbike',
    pillLabel: 'Bikes & Fleets',
    icon: Bike,
    query: 'vehicle',
    image: '/images/hero/motorbike.jpg',
    title: 'Bikes & Fleet Vehicles',
    cornerBadge: 'Fleet Details Available',
    systemExplanation: 'Browse commercial fleets and personal mobility listings with their recorded specifications.',
    watermark: 'MOBILITY',
  },
];





const categories = [
  { label: 'Homes & Villas', icon: Home, query: 'house', desc: 'Luxury residences & family homes' },
  { label: 'Land & Plots', icon: MapIcon, query: 'land', desc: 'Parcels with location and UPI details' },
  { label: 'Apartments', icon: Building2, query: 'apartment', desc: 'Modern urban living spaces' },
  { label: 'Vehicles', icon: Car, query: 'car', desc: 'Cars, SUVs & motorcycles' },
  { label: 'Commercial', icon: Building2, query: 'commercial', desc: 'Office & retail spaces' },
  { label: 'Rentals', icon: Key, query: 'rent', desc: 'Short & long-term rentals' },
];

const steps = [
  { step: '01', title: 'Discover', desc: 'Search listings by location, category, or price. Browse homes, land, apartments, and vehicles across Rwanda.' },
  { step: '02', title: 'Review', desc: 'Compare specifications and check whether supporting documents are pending, submitted, or verified.' },
  { step: '03', title: 'Connect', desc: 'Make offers, schedule visits, and message sellers while you perform your own due diligence.' },
];



const mapApiListing = (item: any): ListingCardData => {
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
    is_liked: Boolean(item.is_liked),
  };
};

const HomePage: React.FC<HomePageProps> = ({ onExplore, onSell, onNavigate, onListingClick }) => {
  const { isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const { savedIds, toggleSaved } = useSavedListings();

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

  // Pick a real listing from the DB that matches the active slide's category, for the hero caption
  const heroListing = useMemo(() => {
    const all = listingsQuery.data || [];
    return all.find((l) =>
      l.listing_type?.toLowerCase().includes(currentSlide.query) ||
      l.title?.toLowerCase().includes(currentSlide.query)
    ) || all[0] || null;
  }, [listingsQuery.data, currentSlide.query]);

  const liveStats = statsQuery.data || {
    properties_listed: totalListings,
    verified_listings: 0,
    completed_deals: 0,
    active_deals: 0,
    active_users: 0,
    districts_covered: null,
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

          {/* Legibility scrim — lighter in light mode so the hero never reads as "black" */}
          <div className={cn('absolute inset-0 pointer-events-none', isDark ? 'bg-black/50' : 'bg-black/25')} />

          {/* Subtle shaded architectural watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <span className="text-[17vw] sm:text-[16vw] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/[0.06] leading-none whitespace-nowrap">
              {currentSlide.watermark}
            </span>
          </div>

          {/* Top/bottom fades melt the photo into the page canvas (theme-aware) */}
          <div className="absolute inset-x-0 top-0 h-24 sm:h-32 bg-gradient-to-b from-[var(--color-bg-deep)] to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-40 sm:h-56 bg-gradient-to-t from-[var(--color-bg-deep)] to-transparent pointer-events-none" />
        </div>

        {/* ━━━ 40-DEGREE GREEN CORNER SYSTEM SASH (Spanning Banner) ━━━ */}
        <div className="absolute top-0 right-0 w-44 h-44 sm:w-60 sm:h-60 overflow-hidden pointer-events-none z-20">
          <div className="absolute top-8 sm:top-12 -right-12 sm:-right-16 w-56 sm:w-72 bg-gradient-to-r from-emerald-800 via-emerald-600 to-emerald-800 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider py-1.5 sm:py-2 text-center rotate-[40deg] shadow-[0_8px_24px_rgba(0,0,0,0.65)] border-y border-emerald-400/40 select-none">
            <span className="flex items-center justify-center gap-1.5 drop-shadow-md">
              <CheckCircle2 size={12} className="text-emerald-300 shrink-0 inline" />
              <span>{currentSlide.cornerBadge}</span>
            </span>
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-4xl text-center space-y-3.5 sm:space-y-4 my-auto py-3 sm:py-6">

          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.9)] leading-[1.1]">
            {currentSlide.title}
          </h1>

          {/* System Explanation: Green background spanning entire text */}
          <div className="flex justify-center px-2">
            <div className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-card)] border text-xs sm:text-sm font-medium backdrop-blur-md shadow-[var(--shadow-depth-2)] max-w-2xl text-center',
              isDark ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-100' : 'bg-white/95 border-emerald-200 text-emerald-900'
            )}>
              <CheckCircle2 size={15} className={cn('shrink-0', isDark ? 'text-emerald-400' : 'text-emerald-600')} />
              <span className="leading-snug">{currentSlide.systemExplanation}</span>
            </div>
          </div>




          {/* Clean Floating Search Bar (Single sleek inline bar on all screens) */}
          <form onSubmit={submitSearch} className="pt-1 sm:pt-2 max-w-2xl mx-auto w-full">
            <div className={cn(
              'flex items-center gap-1.5 sm:gap-2 rounded-[var(--radius-card)] border p-1.5 sm:p-2 backdrop-blur-md shadow-[var(--shadow-depth-3)] transition-all',
              isDark ? 'border-white/15 bg-black/70' : 'border-[var(--color-border)] bg-white/95'
            )}>
              <div className="flex flex-1 items-center gap-2 sm:gap-3 px-2 sm:px-4 min-w-0">
                <Search size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 sm:hidden" />
                <Search size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 hidden sm:block" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  placeholder="Search listings — location, type, keyword..."
                  className="w-full bg-transparent py-2 sm:py-3 text-[var(--color-text-main)] outline-none placeholder:text-[var(--color-text-dim)] text-xs sm:text-sm min-w-0 font-medium"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] p-1 text-xs shrink-0"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
              <Button type="submit" variant="primary" className="shrink-0 px-4 sm:px-7 py-2 sm:py-3 text-xs sm:text-sm">
                Search
              </Button>
            </div>
          </form>
        </div>


        {/* BOTTOM ROW: Minimal Caption & Slide Controls */}
        <div className="relative z-10 mx-auto max-w-7xl w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 text-xs">
          {/* Active slide caption — real listing from DB */}
          {heroListing ? (
            <div className={cn(
              'flex items-center justify-center gap-2 backdrop-blur-md px-4 py-2 rounded-full border text-[11px] sm:text-xs max-w-full shadow-[var(--shadow-depth-2)]',
              isDark ? 'bg-black/60 border-white/15' : 'bg-white/95 border-[var(--color-border)]'
            )}>
              <span className={cn(
                'inline-flex items-center gap-1 text-[10px] font-bold shrink-0 px-2 py-0.5 rounded-full border',
                isDark ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              )}>
                <CheckCircle2 size={10} />
                <span>{heroListing.verification_level === 'verified' ? 'Verified' : 'Marketplace listing'}</span>
              </span>
              <span className="text-[var(--color-text-dim)]">•</span>
              <span className="font-semibold text-[var(--color-text-main)] truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[320px]">{heroListing.title}</span>
              {heroListing.price > 0 && (
                <>
                  <span className="text-[var(--color-text-dim)]">•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold whitespace-nowrap">
                    {heroListing.price.toLocaleString()} {heroListing.currency}
                  </span>
                </>
              )}
              <button
                type="button"
                onClick={() => onListingClick?.(heroListing.id)}
                className="ml-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap group"
              >
                <span>View</span>
                <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            <div className={cn(
              'flex items-center justify-center gap-2 backdrop-blur-md px-4 py-2 rounded-full border text-[11px] sm:text-xs max-w-full shadow-[var(--shadow-depth-2)]',
              isDark ? 'bg-black/60 border-white/15' : 'bg-white/95 border-[var(--color-border)]'
            )}>
              <span className={cn(
                'inline-flex items-center gap-1 text-[10px] font-bold shrink-0 px-2 py-0.5 rounded-full border',
                isDark ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              )}>
                <CheckCircle2 size={10} />
                <span>Live</span>
              </span>
              <span className="text-[var(--color-text-muted)]">{currentSlide.pillLabel}</span>
              <button
                type="button"
                onClick={() => onExplore(currentSlide.query)}
                className="ml-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap group"
              >
                <span>Explore</span>
                <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}


          {/* Slide controls */}
          <div className={cn(
            'flex items-center gap-1.5 sm:gap-2 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-full border shadow-[var(--shadow-depth-2)]',
            isDark ? 'bg-black/60 border-white/15' : 'bg-white/95 border-[var(--color-border)]'
          )}>
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              aria-label="Previous slide"
              className="h-7 w-7 sm:h-6 sm:w-6 rounded-full hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] flex items-center justify-center cursor-pointer transition-all active:scale-90"
            >
              <ChevronLeft size={15} />
            </button>

            <div className="flex items-center gap-1.5 px-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
                    activeSlide === idx
                      ? 'w-7 bg-emerald-500'
                      : 'w-2 bg-[var(--color-border-hover)] hover:bg-[var(--color-text-dim)] hover:w-3'
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
              aria-label="Next slide"
              className="h-7 w-7 sm:h-6 sm:w-6 rounded-full hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] flex items-center justify-center cursor-pointer transition-all active:scale-90"
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
              <p className="mt-1 text-xs sm:text-sm max-w-xl" style={{ color: 'var(--color-text-dim)' }}>Featured listings selected from the current marketplace inventory.</p>
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
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClick={onListingClick}
                  saved={savedIds.has(String(listing.id)) || Boolean(listing.is_liked)}
                  onToggleSave={toggleSaved}
                />
              ))}
            </div>
          ) : listingsQuery.isLoading || listingsQuery.isFetching ? (
            <SkeletonGrid count={6} />
          ) : listingsQuery.isError ? (
            <ErrorState
              title="Failed to load listings"
              message="We encountered an error loading featured properties. Please try again."
              onRetry={() => listingsQuery.refetch()}
            />
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
                <Building2 size={32} className="text-[var(--color-text-dim)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text-main)]">No listings available</h3>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">Check back soon for new listings across Rwanda.</p>
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Button variant="ghost" onClick={() => onExplore('')} className="text-xs py-2.5 hover:text-emerald-500 transition-colors" style={{ color: 'var(--color-text-muted)' }}>
              View all listings <ArrowRight size={14} className="ml-1.5 inline" />
            </Button>
          </div>
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
            {([
              { icon: Building2, value: Number(liveStats.properties_listed || totalListings || 0).toLocaleString(), label: 'Active Listings' },
              { icon: CheckCircle2, value: Number(liveStats.verified_listings || 0).toLocaleString(), label: 'Verified' },
              { icon: Users, value: Number(liveStats.active_users || 0).toLocaleString(), label: 'Platform Members' },
              liveStats.districts_covered ? { icon: Globe, value: `${liveStats.districts_covered}`, label: 'Districts Covered' } : null,
            ] as ({ icon: React.ElementType; value: string; label: string } | null)[])
              .filter((s): s is { icon: React.ElementType; value: string; label: string } => s !== null)
              .map(({ icon: Icon, value, label }) => (
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
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight" style={{ color: 'var(--color-text-main)' }}>Have a property to sell or rent?</h2>
            <p className="mx-auto mt-3 sm:mt-5 max-w-xl text-xs sm:text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Submit your property details for review, manage buyer interest, and keep listing activity in one workspace.
            </p>
            <div className="mt-6 sm:mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                variant="primary"
                onClick={onSell}
                className="w-full sm:w-auto rounded-xl px-8 py-3.5 text-sm sm:text-base font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
              >
                List Your Property (Sale or Rent)
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

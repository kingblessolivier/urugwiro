import React, { useMemo, useState, useEffect } from 'react';
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

interface HomePageProps {
  onExplore: (query?: string) => void;
  onSell: () => void;
  onNavigate: (view: AppView) => void;
  onListingClick?: (id: string) => void;
}

interface HeroSlide {
  id: string;
  category: string;
  pillLabel: string;
  icon: React.ElementType;
  query: string;
  image: string;
  badge: string;
  badgeTone: 'emerald' | 'orange';
  headlinePrefix: string;
  headlineHighlight: string;
  headlineSuffix: string;
  highlightTone: 'emerald' | 'orange';
  subtitle: string;
  searchPlaceholder: string;
  popularTags: string[];
  spotlight: {
    category: string;
    badge: string;
    title: string;
    location: string;
    priceRwf: string;
    priceUsd: string;
    specs: { label: string; value: string }[];
    tag: string;
  };
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'house',
    category: 'Luxury Residences',
    pillLabel: 'Homes & Villas',
    icon: Home,
    query: 'house',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=85&w=1920',
    badge: 'RLMUA Title & Deed Verified',
    badgeTone: 'emerald',
    headlinePrefix: 'The finest luxury',
    headlineHighlight: 'villas & private residences',
    headlineSuffix: 'in Rwanda.',
    highlightTone: 'emerald',
    subtitle: 'Curated architectural estates in Kigali’s most prestigious neighbourhoods — with verified titles, cadastral boundaries, and escrow protection.',
    searchPlaceholder: 'Search villas in Nyarutarama, Gacuriro, Kiyovu...',
    popularTags: ['5-Bed Villa Nyarutarama', 'Modern Duplex Gacuriro', 'Kiyovu Hill Residence', 'Pool & Garden Villa'],
    spotlight: {
      category: 'RESIDENTIAL ESTATE',
      badge: 'VERIFIED DEED',
      title: 'The Hilltop Glass Villa',
      location: 'Nyarutarama Ridge, Gasabo',
      priceRwf: '480,000,000 RWF',
      priceUsd: '$360,000 USD',
      specs: [
        { label: 'Bedrooms', value: '5 Beds' },
        { label: 'Bathrooms', value: '6 Baths' },
        { label: 'Plot Area', value: '820 m²' },
        { label: 'Feature', value: 'Infinity Pool' },
      ],
      tag: 'Architectural Masterpiece',
    },
  },
  {
    id: 'land',
    category: 'Titled Land & Plots',
    pillLabel: 'Titled Land',
    icon: MapIcon,
    query: 'land',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=85&w=1920',
    badge: 'UPI Cadastre Direct Match',
    badgeTone: 'emerald',
    headlinePrefix: 'Prime titled land &',
    headlineHighlight: 'strategic development plots',
    headlineSuffix: 'with clean cadastre.',
    highlightTone: 'orange',
    subtitle: 'Every land parcel is cross-verified directly with Rwanda Land Management & Use Authority (RLMUA) UPI records for absolute ownership certainty.',
    searchPlaceholder: 'Search titled plots in Gasabo, Kicukiro, Bugesera...',
    popularTags: ['Titled Plot Gasabo', 'Zoned R1A Kicukiro', 'Bugesera Airport Corridor', 'Commercial Acreage'],
    spotlight: {
      category: 'RLMUA TITLED LAND',
      badge: 'UPI CLEAN MATCH',
      title: 'Prime Hillside Acreage',
      location: 'Gasabo District, Kigali',
      priceRwf: '95,000,000 RWF',
      priceUsd: '$71,000 USD',
      specs: [
        { label: 'Total Area', value: '2,400 m²' },
        { label: 'Zoning Code', value: 'R1A Residential' },
        { label: 'UPI Status', value: 'Clean Cadastre' },
        { label: 'Topography', value: 'Gentle Slope' },
      ],
      tag: 'Ready for Immediate Conveyance',
    },
  },
  {
    id: 'car',
    category: 'Executive Vehicles',
    pillLabel: 'Executive SUVs',
    icon: Car,
    query: 'vehicle',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=85&w=1920',
    badge: 'Yellow-Card & Customs Cleared',
    badgeTone: 'emerald',
    headlinePrefix: 'Certified executive',
    headlineHighlight: '4x4s, SUVs & premium cars',
    headlineSuffix: 'fully inspected.',
    highlightTone: 'emerald',
    subtitle: 'Verified motor vehicles with validated registration (carte jaune), clean customs duty clearance, and certified mechanical inspection reports.',
    searchPlaceholder: 'Search Toyota Land Cruiser, RAV4 Hybrid, Defender...',
    popularTags: ['Land Cruiser LC300', 'Toyota RAV4 Hybrid', 'Defender 110', 'Mercedes GLE 400d'],
    spotlight: {
      category: 'CERTIFIED VEHICLE',
      badge: 'CUSTOMS CLEARED',
      title: 'Land Cruiser LC300 GR-Sport',
      location: 'Kigali Free Zone / Downtown',
      priceRwf: '165,000,000 RWF',
      priceUsd: '$124,000 USD',
      specs: [
        { label: 'Engine', value: '3.5L Twin Turbo' },
        { label: 'Year', value: '2024 Model' },
        { label: 'Mileage', value: '12,500 km' },
        { label: 'Drivetrain', value: 'Full-Time 4WD' },
      ],
      tag: 'Yellow-Card Registered',
    },
  },
  {
    id: 'motorbike',
    category: 'Bikes & Mobility',
    pillLabel: 'Bikes & Fleets',
    icon: Bike,
    query: 'vehicle',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=85&w=1920',
    badge: 'RURA & Commercial Fleet Ready',
    badgeTone: 'orange',
    headlinePrefix: 'High-performance',
    headlineHighlight: 'motorbikes & commercial fleets',
    headlineSuffix: 'for modern mobility.',
    highlightTone: 'orange',
    subtitle: 'From urban delivery fleets and electric motorbikes to high-displacement adventure tourers, all title-transferred and tax-cleared seamlessly.',
    searchPlaceholder: 'Search BMW GS, Ampersand Electric, TVS HLX, Yamaha...',
    popularTags: ['BMW R1250 GS', 'Ampersand Electric Fleet', 'TVS HLX 150', 'Yamaha MT-07'],
    spotlight: {
      category: 'URBAN & FLEET MOBILITY',
      badge: 'FLEET CERTIFIED',
      title: 'Adventure Tourer & Urban Fleet',
      location: 'Kicukiro District, Kigali',
      priceRwf: '18,500,000 RWF',
      priceUsd: '$13,900 USD',
      specs: [
        { label: 'Displacement', value: '1,250 cc' },
        { label: 'Category', value: 'Adventure / Fleet' },
        { label: 'Condition', value: 'Immaculate' },
        { label: 'Transfer', value: 'Immediate RRA' },
      ],
      tag: 'Turnkey Commercial Ready',
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

const testimonials = [
  { name: 'Jean-Pierre M.', role: 'Property Investor, Kigali', quote: 'Urugwiro transformed how I find verified land. The UPI verification saved me from a fraudulent listing.' },
  { name: 'Diane U.', role: 'First-Time Buyer', quote: 'The AI valuation tool helped me negotiate confidently. I knew exactly what the property was worth.' },
  { name: 'Patrick K.', role: 'Real Estate Agent', quote: 'My clients trust listings on Urugwiro because of the verification process. It\'s elevated our entire business.' },
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
  const [query, setQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused]);

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

  const featured = useMemo(() => (listingsQuery.data || []).slice(0, 6), [listingsQuery.data]);
  const totalListings = listingsQuery.data?.length || 0;

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    onExplore(query || currentSlide.query);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#05070b]">
      {/* ━━━ 01 — CINEMATIC MULTI-CATEGORY HERO CAROUSEL ━━━ */}
      <section 
        className="relative min-h-[calc(100vh-4rem)] flex items-center px-4 py-10 sm:py-14 lg:px-12 lg:py-16 overflow-hidden w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Full-bleed stacked background images with Ken Burns & crossfade */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 transition-all duration-1000 ease-out",
                activeSlide === idx
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-105 pointer-events-none"
              )}
            >
              <img
                src={slide.image}
                alt={slide.category}
                className="w-full h-full object-cover object-center brightness-75 contrast-105"
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}

          {/* Multi-stop dark gradient masks for guaranteed contrast & zero white bleed */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070b] via-[#05070b]/95 md:via-[#05070b]/85 to-[#05070b]/40 lg:to-[#05070b]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-transparent to-[#05070b]/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070b]/90 via-transparent to-[#05070b]" />

          {/* Brand glowing orbs matching logo */}
          <div className="absolute top-20 left-1/4 h-[350px] w-[350px] sm:h-[500px] sm:w-[500px] rounded-full bg-emerald-500/[0.08] blur-[150px] pointer-events-none" />
          <div className="absolute bottom-20 right-1/4 h-[300px] w-[300px] sm:h-[450px] sm:w-[450px] rounded-full bg-[#f98604]/[0.06] blur-[140px] pointer-events-none" />
        </div>

        <div className="mx-auto max-w-7xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Category Switcher, Dynamic Headline, Subtitle, Search, Controls */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-7">
              
              {/* Category Pills Switcher */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {HERO_SLIDES.map((slide, idx) => {
                  const Icon = slide.icon;
                  const isActive = activeSlide === idx;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setActiveSlide(idx)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer",
                        isActive
                          ? slide.highlightTone === 'orange'
                            ? "bg-[#f98604]/20 border border-[#f98604]/50 text-[#fb923c] shadow-lg shadow-[#f98604]/20"
                            : "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/20"
                          : "bg-black/40 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.08] backdrop-blur-md"
                      )}
                    >
                      <Icon size={14} />
                      <span>{slide.pillLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 backdrop-blur-md">
                <ShieldCheck size={14} className="shrink-0" />
                <span>{currentSlide.badge}</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.12] tracking-tight text-white min-h-[120px] sm:min-h-[140px] flex flex-col justify-center">
                <span>{currentSlide.headlinePrefix}</span>
                <span className={cn(
                  "transition-colors duration-500",
                  currentSlide.highlightTone === 'orange'
                    ? "text-[#fb923c] drop-shadow-[0_0_25px_rgba(249,134,4,0.35)]"
                    : "text-emerald-400 drop-shadow-[0_0_25px_rgba(8,126,57,0.35)]"
                )}>
                  {currentSlide.headlineHighlight}
                </span>
                <span className="text-zinc-400 text-2xl sm:text-4xl md:text-5xl">{currentSlide.headlineSuffix}</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base leading-relaxed text-zinc-300 max-w-xl min-h-[48px]">
                {currentSlide.subtitle}
              </p>

              {/* Search Bar */}
              <form onSubmit={submitSearch} className="relative max-w-2xl">
                <div className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-black/40 p-2 backdrop-blur-xl sm:flex-row hover:border-white/25 transition-colors shadow-2xl">
                  <div className="flex flex-1 items-center gap-3 px-3 sm:px-4">
                    <Search size={18} className="text-zinc-400 shrink-0" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => setIsPaused(true)}
                      onBlur={() => setIsPaused(false)}
                      placeholder={currentSlide.searchPlaceholder}
                      className="w-full bg-transparent py-2.5 sm:py-3 text-white outline-none placeholder:text-zinc-500 text-base sm:text-sm"
                    />
                  </div>
                  <Button
                    variant="primary"
                    className="w-full sm:w-auto rounded-xl px-7 py-3 font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-all active:scale-95 shadow-lg shadow-emerald-500/25 text-sm"
                  >
                    Search
                  </Button>
                </div>

                {/* Popular Tags */}
                <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 sm:flex-wrap text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-500 shrink-0">Popular:</span>
                  {currentSlide.popularTags.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        onExplore(term);
                      }}
                      className="shrink-0 rounded-lg bg-black/40 border border-white/10 px-2.5 py-1 text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-all backdrop-blur-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </form>

              {/* Slide Controls & Trust Stats */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10">
                {/* Carousel Navigation Buttons & Indicators */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                      aria-label="Previous category"
                      className="h-9 w-9 rounded-full bg-black/50 border border-white/15 text-zinc-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
                      aria-label="Next category"
                      className="h-9 w-9 rounded-full bg-black/50 border border-white/15 text-zinc-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Indicators */}
                  <div className="flex items-center gap-1.5">
                    {HERO_SLIDES.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveSlide(idx)}
                        aria-label={`Slide ${idx + 1}`}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                          activeSlide === idx
                            ? "w-7 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]"
                            : "w-2 bg-white/20 hover:bg-white/40"
                        )}
                      />
                    ))}
                  </div>

                  <span className="text-[11px] text-zinc-500 font-mono pl-1">
                    0{activeSlide + 1} / 0{HERO_SLIDES.length}
                  </span>
                </div>

                {/* Trust Stats */}
                <div className="flex items-center gap-4 sm:gap-6 text-left">
                  {[
                    { value: totalListings > 0 ? `${totalListings}+` : '1,200+', label: 'Verified' },
                    { value: '99.4%', label: 'UPI Accuracy' },
                    { value: 'Escrow', label: 'Protected' },
                  ].map(({ value, label }) => (
                    <div key={label} className="flex flex-col">
                      <span className="text-sm sm:text-base font-bold text-white leading-tight">{value}</span>
                      <span className="text-[10px] text-zinc-400 leading-tight">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Floating Frosted Glass Spotlight Dossier Card */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="relative group">
                {/* Glow behind card */}
                <div className={cn(
                  "absolute -inset-1 rounded-3xl blur-2xl opacity-40 transition-all duration-700",
                  currentSlide.highlightTone === 'orange' ? "bg-[#f98604]/30" : "bg-emerald-500/30"
                )} />

                {/* Dossier Card */}
                <div className="relative rounded-3xl border border-white/20 bg-black/50 p-6 backdrop-blur-2xl shadow-2xl space-y-5 transition-all">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] border border-white/10 px-3 py-1 text-[10px] font-bold tracking-widest text-zinc-300 uppercase">
                      <Sparkles size={12} className={currentSlide.highlightTone === 'orange' ? "text-[#fb923c]" : "text-emerald-400"} />
                      <span>{currentSlide.spotlight.category}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      <BadgeCheck size={12} /> {currentSlide.spotlight.badge}
                    </span>
                  </div>

                  {/* Card Image preview */}
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/20 transition-all">
                    <img
                      src={currentSlide.image}
                      alt={currentSlide.spotlight.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <span className="text-xs font-semibold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15">
                        {currentSlide.spotlight.tag}
                      </span>
                    </div>
                  </div>

                  {/* Asset Details */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                      {currentSlide.spotlight.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <MapPin size={13} className="text-emerald-400 shrink-0" />
                      <span>{currentSlide.spotlight.location}</span>
                    </div>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {currentSlide.spotlight.specs.map((spec, sIdx) => (
                      <div
                        key={sIdx}
                        className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left backdrop-blur-sm"
                      >
                        <span className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                          {spec.label}
                        </span>
                        <span className="block text-xs font-semibold text-zinc-200 mt-0.5 truncate">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Indicative Value
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-extrabold text-white">
                          {currentSlide.spotlight.priceRwf}
                        </span>
                        <span className="text-xs text-zinc-500">
                          ({currentSlide.spotlight.priceUsd})
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => onExplore(currentSlide.query)}
                      className={cn(
                        "rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all shadow-lg flex items-center gap-1.5 cursor-pointer",
                        currentSlide.highlightTone === 'orange'
                          ? "bg-[#f98604] hover:bg-[#db6803] shadow-[#f98604]/25"
                          : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25"
                      )}
                    >
                      <span>Explore {currentSlide.pillLabel}</span>
                      <ArrowRight size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hidden sm:flex absolute bottom-4 left-1/2 -translate-x-1/2 flex-col items-center gap-1 text-zinc-600 animate-bounce pointer-events-none">
          <ChevronDown size={18} />
        </div>
      </section>

      {/* ━━━ 02 — CATEGORY EXPLORER ━━━ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20 lg:px-12">
        <div className="mb-8 sm:mb-12 flex items-end justify-between">
          <div className="space-y-2 sm:space-y-3">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">Discover</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Browse by Category</h2>
          </div>
          <button
            onClick={() => onExplore('')}
            className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
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
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 sm:p-5 text-left transition-all duration-300 hover:border-emerald-500/40 hover:bg-emerald-500/[0.04] cursor-pointer"
              >
                <div className="mb-3 sm:mb-4 inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-all group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/25">
                  <Icon size={18} />
                </div>
                <span className="block text-xs sm:text-sm font-semibold text-white leading-tight">{cat.label}</span>
                <span className="mt-1 block text-[10px] sm:text-[11px] text-zinc-500 group-hover:text-zinc-400 transition-colors line-clamp-2">{cat.desc}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ━━━ 03 — FEATURED LISTINGS ━━━ */}
      <section className="border-y border-white/[0.06] bg-white/[0.01] px-4 py-12 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 sm:mb-12 flex items-end justify-between">
            <div className="space-y-2 sm:space-y-3">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">Curated</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Exclusive Listings</h2>
              <p className="mt-1 text-xs sm:text-sm text-zinc-500 max-w-xl">Hand-picked properties with verified cadastral boundaries and titles.</p>
            </div>
            <button
              onClick={() => onExplore('')}
              className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
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
                <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Button variant="ghost" onClick={() => onExplore('')} className="text-xs text-zinc-400 hover:text-emerald-400 py-2.5">
              View all listings <ArrowRight size={14} className="ml-1.5 inline" />
            </Button>
          </div>
        </div>
      </section>

      {/* ━━━ 04 — WHY URUGWIRO (TRUST PILLARS) ━━━ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20 lg:px-12">
        <div className="mb-10 sm:mb-16 text-center space-y-2.5 sm:space-y-3 max-w-2xl mx-auto">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">The Urugwiro Standard</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">Beyond simple classifieds</h2>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">We built a marketplace where every transaction is backed by verification, protection, and spatial intelligence.</p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {pillars.map((prop) => (
            <div key={prop.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-8 transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/[0.04] group">
              <div className="mb-4 sm:mb-6 inline-flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all group-hover:shadow-lg group-hover:shadow-emerald-500/20">
                <prop.icon size={22} />
              </div>
              <h3 className="mb-2 text-base sm:text-xl font-bold text-white">{prop.title}</h3>
              <p className="leading-relaxed text-xs sm:text-sm text-zinc-400">{prop.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━ 05 — HOW IT WORKS ━━━ */}
      <section className="border-y border-white/[0.06] bg-white/[0.01] px-4 py-12 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 sm:mb-16 text-center space-y-2.5 sm:space-y-3">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">Process</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">How it Works</h2>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.step} className="relative text-left p-4 sm:p-0 rounded-2xl sm:rounded-none bg-white/[0.01] sm:bg-transparent border border-white/5 sm:border-none">
                <div className="mb-3 sm:mb-5 inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-400 font-mono text-xs sm:text-sm font-bold">
                  {s.step}
                </div>
                <h3 className="mb-1.5 sm:mb-3 text-base sm:text-xl font-bold text-white">{s.title}</h3>
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-400">{s.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-6 right-0 translate-x-1/2 text-zinc-700">
                    <ArrowRight size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 06 — MARKET STATISTICS ━━━ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20 lg:px-12">
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-10 md:p-14">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4 text-center">
            {[
              { icon: Building2, value: totalListings > 0 ? totalListings.toLocaleString() : '1,200+', label: 'Properties Listed' },
              { icon: CheckCircle2, value: '340+', label: 'Completed Deals' },
              { icon: Users, value: '8,500+', label: 'Active Users' },
              { icon: Globe, value: '30', label: 'Districts Covered' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label}>
                <Icon size={20} className="mx-auto mb-2 text-emerald-400" />
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{value}</p>
                <p className="mt-1 text-[11px] sm:text-xs text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 07 — TESTIMONIALS ━━━ */}
      <section className="border-y border-white/[0.06] bg-white/[0.01] px-4 py-12 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 sm:mb-14 text-center space-y-2.5 sm:space-y-3">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">Trusted By</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">What Our Users Say</h2>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-7 transition-all hover:border-white/[0.15]">
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-300 italic">"{t.quote}"</p>
                <div className="mt-4 sm:mt-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold shrink-0">
                    {t.name.split(' ').map(p => p[0]).join('')}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-[10px] sm:text-[11px] text-zinc-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 08 — SELLER CTA ━━━ */}
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-12 sm:py-20 lg:px-12 overflow-hidden w-full">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-600/10 via-white/[0.02] to-transparent p-6 sm:p-10 md:p-14 text-center backdrop-blur-sm">
          <div className="absolute top-0 right-0 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-emerald-500/[0.06] blur-[80px]" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-white">Have a property to sell?</h2>
            <p className="mx-auto mt-3 sm:mt-5 max-w-xl text-zinc-400 text-xs sm:text-base leading-relaxed">
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
                className="text-xs sm:text-sm text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 py-2 transition-colors cursor-pointer"
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

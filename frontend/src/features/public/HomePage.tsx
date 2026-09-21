import React, { useMemo, useState } from 'react';
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
    onExplore(query);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#05070b]">
      {/* ━━━ 01 — CINEMATIC HERO ━━━ */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center px-4 py-10 sm:py-16 lg:px-12 lg:py-20 overflow-hidden w-full">
        {/* Background treatment */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070b] via-[#071210] to-[#05070b]" />
          <div className="absolute top-20 left-1/4 h-[350px] w-[350px] sm:h-[500px] sm:w-[500px] rounded-full bg-emerald-500/[0.04] blur-[150px]" />
          <div className="absolute bottom-20 right-1/4 h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] rounded-full bg-emerald-600/[0.03] blur-[130px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] sm:h-[600px] sm:w-[600px] rounded-full bg-emerald-500/[0.02] blur-[200px]" />
        </div>

        <div className="mx-auto max-w-7xl w-full">
          <div className="max-w-3xl space-y-6 sm:space-y-8">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
              <ShieldCheck size={13} /> Rwanda's Premier Asset Marketplace
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.12] tracking-tight text-white">
              The premium way to
              <br />
              <span className="text-emerald-400">buy, sell & invest</span>
              <br />
              <span className="text-zinc-500">in Rwanda.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg leading-relaxed text-zinc-400 max-w-xl">
              Verified properties. Transparent transactions. AI-powered insights.
              From Kigali penthouses to rural land parcels — every listing is trust-verified.
            </p>

            {/* Search Bar */}
            <form onSubmit={submitSearch} className="relative max-w-2xl">
              <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur-sm sm:flex-row hover:border-white/[0.15] transition-colors">
                <div className="flex flex-1 items-center gap-3 px-3 sm:px-4">
                  <Search size={18} className="text-zinc-500 shrink-0" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search properties, land, vehicles..."
                    className="w-full bg-transparent py-2.5 sm:py-3 text-white outline-none placeholder:text-zinc-600 text-base sm:text-sm"
                  />
                </div>
                <Button
                  variant="primary"
                  className="w-full sm:w-auto rounded-xl px-7 py-3 font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-all active:scale-95 shadow-lg shadow-emerald-500/20 text-sm"
                >
                  Search
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 sm:flex-wrap text-xs text-zinc-600">
                <span className="font-medium shrink-0">Popular:</span>
                {['3 bedroom house Kigali', 'Land in Gasabo', 'Toyota RAV4', 'Apartment Nyarutarama'].map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => onExplore(term)}
                    className="shrink-0 rounded-lg bg-white/[0.03] border border-white/5 px-2.5 py-1 text-zinc-400 hover:text-emerald-400 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </form>

            {/* Trust Stats (Floating) */}
            <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-6 pt-2 sm:pt-4 text-left">
              {[
                { value: totalListings > 0 ? `${totalListings}+` : '1,200+', label: 'Verified Listings' },
                { value: '98%', label: 'Trust Score' },
                { value: '24h', label: 'Avg. Response' },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-base sm:text-lg font-bold text-white leading-tight">{value}</span>
                  <span className="text-[10px] sm:text-xs text-zinc-500 leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-zinc-600 animate-bounce">
          <ChevronDown size={20} />
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

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Bike,
  Building2,
  Car,
  Home,
  Map as MapIcon,
  Search,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  ArrowUpRight
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
  { label: 'Homes', icon: Home, query: 'sale' },
  { label: 'Land', icon: MapIcon, query: 'land' },
  { label: 'Cars', icon: Car, query: 'vehicle' },
  { label: 'Motorcycles', icon: Bike, query: 'motorcycle' },
  { label: 'Commercial', icon: Building2, query: 'commercial' },
  { label: 'Services', icon: Wrench, query: 'service', view: 'services' as AppView },
];

const valueProps = [
  {
    title: 'Verified Truth',
    description: 'Every document is reviewed to ensure the asset is exactly as described.',
    icon: ShieldCheck,
  },
  {
    title: 'Information Rich',
    description: 'Get structured facts on plot boundaries, engine condition, and legal status.',
    icon: CheckCircle2,
  },
  {
    title: 'Seamless Connection',
    description: 'Direct communication with verified sellers and structured offer systems.',
    icon: ArrowUpRight,
  },
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
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('');

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

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const parts = [query, category !== 'all' ? category : '', location].filter(Boolean);
    onExplore(parts.join(' '));
  };

  return (
    <div className="min-h-screen bg-[#05070b] text-white selection:bg-emerald-500/30">
      {/* 01 HERO SECTION - CLEAN & PROFESSIONAL */}
      <section className="relative px-6 pt-32 pb-20 lg:px-12">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              <ShieldCheck size={12} /> Trust-First Marketplace
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              Find what <span className="text-emerald-500">matters.</span><br />
              <span className="text-zinc-500">Buy. Sell. Discover.</span>
            </h1>

            <p className="text-lg leading-relaxed text-zinc-400 max-w-2xl">
              The premium destination for property, land, and vehicles in Rwanda.
              We replace basic classifieds with a high-trust digital showroom.
            </p>

            <form onSubmit={submitSearch} className="relative max-w-2xl">
              <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur-sm sm:flex-row">
                <div className="flex flex-1 items-center gap-3 px-4">
                  <Search size={18} className="text-zinc-500" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search properties, land or vehicles..."
                    className="w-full bg-transparent py-3 text-white outline-none placeholder:text-zinc-600 text-sm"
                  />
                </div>
                <Button variant="primary" className="rounded-xl px-6 py-2 font-semibold transition-all active:scale-95">
                  Search
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 px-2 text-xs text-zinc-500">
                <span className="opacity-60 font-medium">Popular:</span>
                {['3 bedroom house', 'Land in Gasabo', 'Toyota RAV4'].map(term => (
                  <button
                    key={term}
                    onClick={() => onExplore(term)}
                    className="text-emerald-400 transition hover:text-emerald-300 hover:underline"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 02 CATEGORIES GRID - MINIMALIST */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
        <div className="mb-12 flex items-end justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500">Discovery</p>
            <h2 className="text-3xl font-bold tracking-tight">Browse Categories</h2>
          </div>
          <Button variant="ghost" className="text-zinc-400 hover:text-emerald-400 flex items-center gap-2 text-sm">
            View all <ArrowRight size={14} />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => (cat.view ? onNavigate(cat.view) : onExplore(cat.query))}
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left transition-all duration-300 hover:border-emerald-500/40 hover:bg-emerald-500/[0.03]"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                  <Icon size={20} />
                </div>
                <span className="block text-base font-semibold text-white">{cat.label}</span>
                <span className="mt-1 block text-xs text-zinc-500 group-hover:text-zinc-300">Explore →</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 03 FEATURED LISTINGS - CLEAN GRID */}
      <section className="border-y border-white/5 bg-white/[0.01] px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-500">Curated</p>
              <h2 className="text-3xl font-bold tracking-tight">Marketplace Highlights</h2>
              <p className="mt-2 text-zinc-500 max-w-xl text-sm">Our most trusted and information-rich listings across all categories.</p>
            </div>
            <Button variant="ghost" className="text-zinc-400 hover:text-emerald-400 flex items-center gap-2 text-sm">
              Explore all <ArrowRight size={14} />
            </Button>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} onClick={() => onExplore(listing.listing_type)} />
            ))}
          </div>
        </div>
      </section>

      {/* 04 TRUST & VALUE PROPOSITION - SIMPLE & DIRECT */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
        <div className="mb-16 text-center space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-500">The Urugwiro Standard</p>
          <h2 className="text-3xl font-bold tracking-tight">Beyond simple classifieds</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {valueProps.map((prop) => (
            <div key={prop.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 transition-all hover:border-emerald-500/30">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <prop.icon size={24} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">{prop.title}</h3>
              <p className="leading-relaxed text-zinc-400 text-sm">{prop.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 05 FINAL CTA SECTION - GROUNDED */}
      <section className="mx-auto max-w-5xl px-6 pb-32 pt-12 text-center lg:px-12">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-600/10 to-transparent p-12 backdrop-blur-sm">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Have something to sell?</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
            Join our premium marketplace and reach buyers who value transparency.
            Build a trustworthy listing today.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              variant="primary"
              onClick={onSell}
              className="rounded-xl px-10 py-4 text-lg font-bold transition-all active:scale-95"
            >
              List Asset on Urugwiro
            </Button>
            <Button
              variant="ghost"
              className="text-zinc-400 hover:text-white flex items-center gap-2"
              onClick={() => onNavigate('about')}
            >
              Learn how it works <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER - CLEAN & PROFESSIONAL */}
      <footer className="border-t border-white/10 bg-[#0b0d12] px-6 py-16 lg:px-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-4">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 font-bold text-black">U</div>
              <span className="text-xl font-bold tracking-tight text-white">Urugwiro</span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-500">
              The gold standard for property, land, and vehicle discovery in Rwanda.
              Built on trust, transparency, and spatial intelligence.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Marketplace</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li><button className="transition hover:text-emerald-400" onClick={() => onExplore('sale')}>Buy Property</button></li>
              <li><button className="transition hover:text-emerald-400" onClick={() => onExplore('land')}>Buy Land</button></li>
              <li><button className="transition hover:text-emerald-400" onClick={() => onExplore('vehicle')}>Buy Vehicles</button></li>
              <li><button className="transition hover:text-emerald-400" onClick={() => onNavigate('services')}>Professional Services</button></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Information</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li><button className="transition hover:text-emerald-400" onClick={() => onNavigate('land-information')}>Land Info Center</button></li>
              <li><button className="transition hover:text-emerald-400">Verification Guide</button></li>
              <li><button className="transition hover:text-emerald-400">How to Sell</button></li>
              <li><button className="transition hover:text-emerald-400">Privacy Policy</button></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Support</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li><button className="transition hover:text-emerald-400" onClick={() => onNavigate('contact')}>Contact Us</button></li>
              <li><button className="transition hover:text-emerald-400">Help Center</button></li>
              <li><button className="transition hover:text-emerald-400">Report a Listing</button></li>
              <li><button className="transition hover:text-emerald-400">Terms of Service</button></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-16 flex items-center justify-between border-t border-white/5 pt-8 max-w-7xl text-xs text-zinc-600">
          <p>© 2026 Urugwiro Marketplace. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-zinc-400 cursor-pointer">Twitter</span>
            <span className="hover:text-zinc-400 cursor-pointer">LinkedIn</span>
            <span className="hover:text-zinc-400 cursor-pointer">Instagram</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

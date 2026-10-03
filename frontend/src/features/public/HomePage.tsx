import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Building2,
  Car,
  ChevronRight,
  Home,
  Search,
  ShieldCheck,
  Trees,
} from 'lucide-react';

import { ListingCard } from '../../components/ui/ListingCard';
import type { ListingCardData } from '../../components/ui/ListingCard';
import { Button } from '../../components/ui/Button';
import { SkeletonGrid, ErrorState } from '../../components/ui/Dashboard';
import { api } from '../../api/endpoints';
import type { AppView } from '../../types/navigation';
import { useSavedListings } from '../../hooks/useSavedListings';

interface HomePageProps {
  onExplore: (query?: string) => void;
  onSell: () => void;
  onNavigate: (view: AppView) => void;
  onListingClick?: (id: string) => void;
}

const HERO_IMAGE = '/images/hero/house.jpg';

const categoryCards = [
  { label: 'Homes', query: 'house', icon: Home, image: '/images/hero/house.jpg' },
  { label: 'Land', query: 'land', icon: Trees, image: '/images/hero/land.jpg' },
  { label: 'Apartments', query: 'apartment', icon: Building2, image: '/images/hero/house.jpg' },
  { label: 'Vehicles', query: 'car', icon: Car, image: '/images/hero/car.jpg' },
];

const quickSearches = ['Kigali', 'Land', 'Rentals', 'Apartments', 'SUV'];

const mapApiListing = (item: any): ListingCardData => {
  const media = Array.isArray(item.media) ? item.media : [];
  const asset = (item.asset as Record<string, any> | undefined) || {};
  const locationParts = [asset.district, asset.province, item.location].filter(Boolean);
  const residential = asset.residential_spec || {};
  const specs = {
    ...(residential.bedrooms ? { beds: residential.bedrooms } : {}),
    ...(residential.bathrooms ? { baths: residential.bathrooms } : {}),
  };

  return {
    id: String(item.id ?? item.slug ?? ''),
    title: String(item.title ?? asset.name ?? 'Listing'),
    price: Number(item.price) || 0,
    currency: String(item.currency ?? 'RWF'),
    location: locationParts.length ? locationParts.join(', ') : item.address || 'Rwanda',
    listing_type: String(item.listing_type ?? item.category ?? item.type ?? 'Listing'),
    verification_level: (item.verification_level as ListingCardData['verification_level']) || 'none',
    media,
    specs: Object.keys(specs).length ? specs : undefined,
    views: Number(item.views_count || item.views || 0),
    status: item.status || 'Available',
    is_liked: Boolean(item.is_liked),
  };
};

const HomePage: React.FC<HomePageProps> = ({ onExplore, onSell, onNavigate, onListingClick }) => {
  const [query, setQuery] = useState('');
  const { savedIds, toggleSaved } = useSavedListings();

  const listingsQuery = useQuery({
    queryKey: ['homepage-listings'],
    queryFn: async () => {
      const response = await api.listings.list({ sort: 'newest', page_size: 12 });
      const payload = response.data;
      const rows = Array.isArray(payload) ? payload : payload?.results || [];
      return rows.map(mapApiListing).filter((listing: ListingCardData) => listing.id);
    },
    retry: false,
  });

  const listings = listingsQuery.data || [];
  const featured = useMemo(() => listings.slice(0, 6), [listings]);
  const heroListing = featured[0];

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    onExplore(query.trim());
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-bg-deep)] text-[var(--color-text-main)]">
      <section className="relative isolate overflow-hidden">
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-950/64 to-slate-950/24" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[var(--color-bg-deep)] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[76svh] max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100 backdrop-blur">
                <ShieldCheck size={14} /> Buy, rent, or sell in Rwanda
              </div>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl lg:leading-[0.96]">
                Your next property starts here.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-100 sm:text-xl">
                Discover homes, land, rentals, commercial spaces, and vehicles. List your own property when you are ready to sell or rent.
              </p>

              <form onSubmit={submitSearch} className="mt-7 max-w-2xl">
                <div className="rounded-lg border border-white/20 bg-white p-2 shadow-2xl shadow-slate-950/30">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <label className="flex min-w-0 flex-1 items-center gap-3 rounded-md bg-slate-100 px-4">
                      <Search size={18} className="shrink-0 text-emerald-700" />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search by location, property type, or keyword"
                        className="h-12 w-full bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-500"
                      />
                    </label>
                    <Button type="submit" size="lg" className="rounded-md px-7">
                      Search
                    </Button>
                  </div>
                </div>
              </form>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => onExplore(query.trim())} className="rounded-md px-7">
                  Browse Listings <ArrowRight size={18} />
                </Button>
                <Button size="lg" variant="secondary" onClick={onSell} className="rounded-md border-white/25 bg-white/12 px-7 text-white hover:bg-white/18">
                  Sell or Rent
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {quickSearches.map((item) => (
                  <button key={item} type="button" onClick={() => onExplore(item)} className="rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/18">
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/18 bg-white/12 p-4 text-white shadow-2xl shadow-slate-950/25 backdrop-blur-md">
              {heroListing && (
                <button
                  type="button"
                  onClick={() => onListingClick?.(heroListing.id)}
                  className="block w-full overflow-hidden rounded-md border border-white/14 bg-white/10 text-left transition hover:bg-white/16"
                >
                  <div className="aspect-[4/3] bg-slate-800">
                    {heroListing.media?.[0]?.url || heroListing.media?.[0]?.file ? (
                      <img src={heroListing.media[0].url || heroListing.media[0].file} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-300">Featured listing</div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">Featured now</p>
                    <p className="mt-1 truncate text-base font-bold">{heroListing.title}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{heroListing.price.toLocaleString()} {heroListing.currency}</p>
                    <p className="mt-1 truncate text-xs text-slate-200">{heroListing.location}</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {categoryCards.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.label}
                type="button"
                onClick={() => onExplore(category.query)}
                className="group relative min-h-36 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-left shadow-[var(--shadow-depth-1)] transition hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-[var(--shadow-depth-2)] sm:min-h-44"
              >
                <img src={category.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/88 via-slate-950/38 to-transparent" />
                <div className="relative flex h-full min-h-36 flex-col justify-end p-4 text-white sm:min-h-44">
                  <Icon size={22} className="mb-3 text-emerald-200" />
                  <h2 className="text-xl font-bold">{category.label}</h2>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[var(--color-section-alt-border)] bg-[var(--color-section-alt)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-brand-emerald)]">For sale and rent</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Featured listings</h2>
            </div>
            <button type="button" onClick={() => onExplore('')} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-brand-emerald)]">
              Explore all listings <ArrowRight size={16} />
            </button>
          </div>

          {featured.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
            <ErrorState title="Failed to load listings" message="Featured listings could not be loaded. Please try again." onRetry={() => listingsQuery.refetch()} />
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)] p-10 text-center">
              <Building2 size={30} className="mx-auto text-[var(--color-text-dim)]" />
              <h3 className="mt-3 text-lg font-bold">No listings available yet</h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">New listings will appear here as they are published.</p>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-[var(--shadow-depth-2)] sm:grid-cols-[1fr_auto] sm:items-center sm:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-brand-emerald)]">Owners and sellers</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Ready to sell or rent your property?</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Publish your asset and start receiving real customer interest.</p>
          </div>
          <Button size="lg" onClick={onSell} className="rounded-md">
            List Your Property <ArrowRight size={18} />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

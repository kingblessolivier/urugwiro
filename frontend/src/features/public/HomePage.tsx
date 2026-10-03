import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Building2,
  Car,
  ChevronLeft,
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

const heroSlides = [
  { label: 'Homes', title: 'Sell or rent homes customers want.', query: 'house', image: '/images/hero/house.jpg' },
  { label: 'Land', title: 'Put titled land in front of serious buyers.', query: 'land', image: '/images/hero/land.jpg' },
  { label: 'Apartments', title: 'Fill apartments and rentals faster.', query: 'apartment', image: '/images/hero/house.jpg' },
  { label: 'Vehicles', title: 'List vehicles beside property demand.', query: 'car', image: '/images/hero/car.jpg' },
];

const categoryCards = [
  { label: 'Homes', query: 'house', icon: Home, image: '/images/hero/house.jpg' },
  { label: 'Land', query: 'land', icon: Trees, image: '/images/hero/land.jpg' },
  { label: 'Apartments', query: 'apartment', icon: Building2, image: '/images/hero/house.jpg' },
  { label: 'Vehicles', query: 'car', icon: Car, image: '/images/hero/car.jpg' },
];

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

const HomePage: React.FC<HomePageProps> = ({ onExplore, onSell, onListingClick }) => {
  const [query, setQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
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
  const slide = heroSlides[activeSlide];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    onExplore(query.trim() || slide.query);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-bg-deep)] text-[var(--color-text-main)]">
      <section className="home-hero relative isolate overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          {heroSlides.map((item, index) => (
            <img
              key={item.label}
              src={item.image}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition duration-1000 ${activeSlide === index ? 'scale-100 opacity-[var(--home-hero-image-opacity)]' : 'scale-105 opacity-0'}`}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,var(--home-hero-left-overlay)),rgba(15,23,42,var(--home-hero-mid-overlay)),rgba(15,23,42,var(--home-hero-right-overlay)))]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(2,6,23,var(--home-hero-bottom-overlay)),transparent_52%,rgba(2,6,23,var(--home-hero-top-overlay)))]" />

        <div className="relative z-10 mx-auto flex min-h-[82svh] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-center">
            <div className="min-w-0 max-w-[calc(100vw-2rem)] sm:max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100 backdrop-blur">
                <ShieldCheck size={14} /> Buy, rent, or sell in Rwanda
              </div>
              <h1 className="mt-5 max-w-4xl break-words text-2xl font-bold leading-tight tracking-tight text-white min-[430px]:text-3xl sm:text-6xl lg:text-7xl lg:leading-[0.96]">
                {slide.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-100 sm:mt-5 sm:text-xl sm:leading-7">
                Urugwiro brings buyers, tenants, sellers, and owners into one sharp marketplace for property and vehicles across Rwanda.
              </p>

              <form onSubmit={submitSearch} className="mt-7 w-full max-w-2xl">
                <div className="rounded-xl border border-white/20 bg-white p-2 shadow-2xl shadow-slate-950/30">
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
                    <Button type="submit" size="lg" className="rounded-lg px-7">
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

              <div className="mt-6 flex max-w-full flex-col gap-4 xl:flex-row xl:items-center">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length)}
                    aria-label="Previous hero image"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/18"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSlide((current) => (current + 1) % heroSlides.length)}
                    aria-label="Next hero image"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/18"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="flex max-w-full flex-wrap gap-2">
                  {heroSlides.map((item, index) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setActiveSlide(index)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold text-white backdrop-blur transition ${activeSlide === index ? 'border-emerald-300 bg-emerald-500/40' : 'border-white/18 bg-white/10 hover:bg-white/18'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-sm" />
              <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-slate-950/70 text-white shadow-2xl shadow-slate-950/35">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                  <img src={slide.image} alt="" className="h-full w-full object-cover transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/18 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">{slide.label}</p>
                    <h2 className="mt-2 text-2xl font-bold leading-tight">{slide.title}</h2>
                    <button
                      type="button"
                      onClick={() => onExplore(slide.query)}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-400"
                    >
                      View {slide.label} <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 bg-slate-950/92 p-3">
                  {heroSlides.map((item, index) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setActiveSlide(index)}
                      aria-label={`Show ${item.label}`}
                      className={`relative aspect-[5/4] overflow-hidden rounded-lg border transition ${activeSlide === index ? 'border-emerald-300' : 'border-white/15 opacity-70 hover:opacity-100'}`}
                    >
                      <img src={item.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                      <span className="absolute inset-x-0 bottom-0 bg-slate-950/70 px-1.5 py-1 text-center text-[10px] font-bold text-white">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {heroListing && (
                <button
                  type="button"
                  onClick={() => onListingClick?.(heroListing.id)}
                  className="relative mt-4 flex w-full items-center justify-between gap-3 rounded-xl border border-white/16 bg-white/12 px-4 py-3 text-left text-white backdrop-blur transition hover:bg-white/18"
                >
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">Featured now</span>
                    <span className="mt-1 block truncate text-sm font-bold">{heroListing.title}</span>
                  </span>
                  <span className="shrink-0 text-sm font-bold">{heroListing.price.toLocaleString()} {heroListing.currency}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-12 max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3 shadow-[var(--shadow-depth-3)]">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {categoryCards.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.label}
                  type="button"
                  onClick={() => onExplore(category.query)}
                  className="group relative min-h-36 overflow-hidden rounded-xl text-left transition hover:-translate-y-0.5 sm:min-h-44"
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

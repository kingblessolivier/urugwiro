import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CalendarCheck,
  Car,
  CheckCircle2,
  ChevronRight,
  Compass,
  Heart,
  Home,
  Landmark,
  MapPin,
  Search,
  ShieldCheck,
  Store,
  Trees,
  Users,
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
  { label: 'Homes', query: 'house', icon: Home, image: '/images/hero/house.jpg', detail: 'Family houses, villas, and townhomes' },
  { label: 'Land', query: 'land', icon: Trees, image: '/images/hero/land.jpg', detail: 'Plots, parcels, and titled land' },
  { label: 'Apartments', query: 'apartment', icon: Building2, image: '/images/hero/house.jpg', detail: 'Urban apartments and rentals' },
  { label: 'Vehicles', query: 'car', icon: Car, image: '/images/hero/car.jpg', detail: 'Cars, SUVs, motorbikes, and fleets' },
];

const quickSearches = ['Kigali', 'Land', 'Rentals', 'Apartments', 'SUV', 'Commercial'];

const customerSteps = [
  { title: 'Find the right match', desc: 'Search by location, price, type, or keyword and compare listings without jumping between tools.', icon: Compass },
  { title: 'Review the essentials', desc: 'Check photos, price, location, specifications, seller details, and verification status before you act.', icon: ShieldCheck },
  { title: 'Move when ready', desc: 'Save favorites, message the seller, book a visit, or submit an offer from the listing page.', icon: CalendarCheck },
];

const trustItems = [
  { title: 'Clear listing details', desc: 'Listings are organized around price, location, category, media, and available documentation.', icon: CheckCircle2 },
  { title: 'Customer workspace', desc: 'Signed-in customers can track saved properties, offers, and scheduled visits from their dashboard.', icon: Heart },
  { title: 'Seller visibility', desc: 'Contact options and seller context stay close to the listing so customers know who they are contacting.', icon: Store },
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

  const statsQuery = useQuery({
    queryKey: ['homepage-platform-stats'],
    queryFn: async () => (await api.public.platformStats()).data,
    staleTime: 60000,
  });

  const listings = listingsQuery.data || [];
  const featured = useMemo(() => listings.slice(0, 6), [listings]);
  const heroListing = featured[0];
  const stats = statsQuery.data || {};

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    onExplore(query.trim());
  };

  const statCards = [
    { label: 'Active Listings', value: Number(stats.properties_listed || listings.length || 0).toLocaleString(), icon: Building2 },
    { label: 'Verified Listings', value: Number(stats.verified_listings || 0).toLocaleString(), icon: ShieldCheck },
    { label: 'Members', value: Number(stats.active_users || 0).toLocaleString(), icon: Users },
    { label: 'Coverage', value: stats.districts_covered ? `${stats.districts_covered} Districts` : 'Rwanda', icon: MapPin },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-bg-deep)] text-[var(--color-text-main)]">
      <section className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden">
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/58 to-slate-950/20" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[var(--color-bg-deep)] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col justify-end px-4 pb-8 pt-24 sm:px-6 lg:px-8 lg:pb-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_26rem] lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100 backdrop-blur">
                <ShieldCheck size={14} /> Rwanda marketplace
              </div>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Find property and vehicles with confidence.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-100 sm:text-lg">
                Search homes, land, rentals, commercial spaces, and vehicles across Rwanda. Save what matters, compare details, and contact sellers from one clean workspace.
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

              <div className="mt-4 flex flex-wrap gap-2">
                {quickSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onExplore(item)}
                    className="rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/18"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/18 bg-white/12 p-4 text-white shadow-2xl shadow-slate-950/25 backdrop-blur-md">
              <div className="grid grid-cols-2 gap-3">
                {statCards.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-md border border-white/14 bg-white/10 p-3">
                    <Icon size={16} className="text-emerald-200" />
                    <p className="mt-3 text-2xl font-bold">{value}</p>
                    <p className="text-xs text-slate-200">{label}</p>
                  </div>
                ))}
              </div>

              {heroListing && (
                <button
                  type="button"
                  onClick={() => onListingClick?.(heroListing.id)}
                  className="mt-4 w-full rounded-md border border-white/14 bg-white/10 p-3 text-left transition hover:bg-white/16"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">Latest highlight</p>
                  <p className="mt-1 truncate text-sm font-bold">{heroListing.title}</p>
                  <p className="mt-1 text-xs text-slate-200">{heroListing.price.toLocaleString()} {heroListing.currency} · {heroListing.location}</p>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categoryCards.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.label}
                type="button"
                onClick={() => onExplore(category.query)}
                className="group relative min-h-52 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-left shadow-[var(--shadow-depth-1)] transition hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-[var(--shadow-depth-2)]"
              >
                <img src={category.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/88 via-slate-950/38 to-transparent" />
                <div className="relative flex h-full min-h-52 flex-col justify-end p-5 text-white">
                  <Icon size={22} className="mb-3 text-emerald-200" />
                  <h2 className="text-xl font-bold">{category.label}</h2>
                  <p className="mt-1 text-sm text-slate-200">{category.detail}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[var(--color-section-alt-border)] bg-[var(--color-section-alt)] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-brand-emerald)]">Marketplace</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Fresh listings for customers</h2>
              <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">A quick look at current homes, land, rentals, commercial assets, and vehicles.</p>
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

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-brand-emerald)]">Customer journey</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">From browsing to viewing, without confusion.</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
            The homepage should get customers to the right action quickly. These steps are built around what buyers and tenants naturally need first.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <MiniFact icon={BedDouble} label="Specs" />
            <MiniFact icon={Bath} label="Details" />
            <MiniFact icon={Landmark} label="Location" />
          </div>
        </div>

        <div className="grid gap-4">
          {customerSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-[var(--shadow-depth-1)]">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-[var(--color-brand-emerald)]">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-dim)]">0{index + 1}</p>
                    <h3 className="mt-1 text-lg font-bold">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">{step.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[var(--color-section-alt-border)] bg-[var(--color-section-alt)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-3">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-[var(--shadow-depth-1)]">
                  <Icon size={22} className="text-[var(--color-brand-emerald)]" />
                  <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-[var(--shadow-depth-2)]">
          <div className="grid lg:grid-cols-[1fr_0.85fr]">
            <div className="p-6 sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-brand-emerald)]">Ready to move?</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Start with the listings, then choose your next step.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
                Customers can browse openly. When you are ready, create an account to save favorites, track offers, and manage visit requests.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => onExplore('')} className="rounded-md">
                  Browse Listings <ChevronRight size={18} />
                </Button>
                <Button size="lg" variant="secondary" onClick={() => onNavigate('customer-dashboard')} className="rounded-md">
                  My Dashboard
                </Button>
              </div>
            </div>
            <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 sm:p-10 lg:border-l lg:border-t-0">
              <h3 className="text-lg font-bold">Have a property to sell or rent?</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">Submit details for review, publish your listing, and manage customer interest from the seller workspace.</p>
              <button
                type="button"
                onClick={onSell}
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                List Property <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const MiniFact = ({ icon: Icon, label }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string }) => (
  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3 text-center">
    <Icon size={18} className="mx-auto text-[var(--color-brand-emerald)]" />
    <p className="mt-2 text-xs font-bold text-[var(--color-text-muted)]">{label}</p>
  </div>
);

export default HomePage;

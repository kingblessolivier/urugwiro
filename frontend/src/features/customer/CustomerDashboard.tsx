import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Compass, HandCoins, Heart, Home, Loader2 } from 'lucide-react';
import { api } from '../../api/endpoints';
import type { AppView } from '../../types/navigation';
import { formatMoney } from '../discovery/listingSpecs';
import { getListingImage } from '../../lib/imageUrl';

interface CustomerDashboardProps {
  onNavigate: (view: AppView, options?: { listingId?: string }) => void;
}

const rowsFrom = (data: any) => Array.isArray(data) ? data : data?.results || [];

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onNavigate }) => {
  const dashboardQuery = useQuery({
    queryKey: ['consumer-dashboard'],
    queryFn: async () => (await api.consumer.dashboard()).data,
  });

  const savedQuery = useQuery({
    queryKey: ['consumer-saved-properties'],
    queryFn: async () => (await api.consumer.savedProperties({ page_size: 8 })).data,
  });

  const offersQuery = useQuery({
    queryKey: ['consumer-offers'],
    queryFn: async () => (await api.consumer.offers()).data,
  });

  const visitsQuery = useQuery({
    queryKey: ['consumer-visits'],
    queryFn: async () => (await api.consumer.visits()).data,
  });

  const saved = useMemo(() => rowsFrom(savedQuery.data), [savedQuery.data]);
  const offers = useMemo(() => rowsFrom(offersQuery.data), [offersQuery.data]);
  const visits = useMemo(() => rowsFrom(visitsQuery.data), [visitsQuery.data]);
  const isLoading = dashboardQuery.isLoading || savedQuery.isLoading || offersQuery.isLoading || visitsQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[var(--color-text-muted)]">
        <Loader2 className="mr-2 animate-spin" size={18} /> Loading dashboard...
      </div>
    );
  }

  const metrics = dashboardQuery.data || {};

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="flex flex-col justify-between gap-4 border-b border-[var(--color-border)] pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-brand-emerald)]">Client Workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text-main)]">My Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">Track saved properties, offers, and viewing requests in one place.</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('discovery')}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
        >
          <Compass size={16} /> Explore Properties
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Metric label="Saved Properties" value={metrics.saved_properties ?? saved.length} icon={Heart} />
        <Metric label="My Offers" value={metrics.my_offers ?? offers.length} icon={HandCoins} />
        <Metric label="My Visits" value={metrics.my_visits ?? visits.length} icon={Calendar} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--color-text-main)]">Saved Properties</h2>
            <button type="button" onClick={() => onNavigate('saved')} className="text-sm font-bold text-[var(--color-brand-emerald)]">View saved</button>
          </div>
          {saved.length === 0 ? (
            <Empty icon={Heart} title="No saved properties yet" text="Save listings while browsing and they will appear here." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {saved.map((listing: any) => {
                const imageUrl = getListingImage(listing);
                return (
                  <button
                    key={listing.id}
                    type="button"
                    onClick={() => onNavigate('listing-detail', { listingId: String(listing.slug || listing.id) })}
                    className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-left transition hover:border-emerald-500/40"
                  >
                    <div className="aspect-[16/10] bg-[var(--color-bg-surface)]">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[var(--color-text-dim)]"><Home size={24} /></div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-bold text-[var(--color-text-main)]">{listing.title}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">{formatMoney(Number(listing.price || 0), listing.currency || 'RWF')}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Panel title="Recent Offers" empty={<Empty icon={HandCoins} title="No offers yet" text="Your submitted prices will appear here." />}>
            {offers.slice(0, 5).map((offer: any) => (
              <MiniRow key={offer.id} title={offer.listing_title || 'Property offer'} detail={`${formatMoney(Number(offer.offered_amount || 0), offer.currency || 'RWF')} · ${offer.status || 'new'}`} />
            ))}
          </Panel>
          <Panel title="Upcoming Visits" empty={<Empty icon={Calendar} title="No visits booked" text="Book a showing from any listing page." />}>
            {visits.slice(0, 5).map((visit: any) => (
              <MiniRow key={visit.id} title={visit.listing_title || visit.listing?.title || 'Property visit'} detail={`${visit.preferred_date || visit.scheduled_date || 'Date pending'} · ${visit.status || 'requested'}`} />
            ))}
          </Panel>
        </div>
      </section>
    </main>
  );
};

const Metric = ({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ size?: number; className?: string }> }) => (
  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
    <Icon size={18} className="text-[var(--color-brand-emerald)]" />
    <p className="mt-4 text-3xl font-bold text-[var(--color-text-main)]">{value}</p>
    <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
  </div>
);

const Panel = ({ title, children, empty }: { title: string; children: React.ReactNode[]; empty: React.ReactNode }) => (
  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
    <h2 className="mb-4 text-lg font-bold text-[var(--color-text-main)]">{title}</h2>
    {children.length ? <div className="space-y-3">{children}</div> : empty}
  </div>
);

const MiniRow = ({ title, detail }: { title: string; detail: string }) => (
  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3">
    <p className="truncate text-sm font-bold text-[var(--color-text-main)]">{title}</p>
    <p className="mt-1 text-xs capitalize text-[var(--color-text-muted)]">{detail}</p>
  </div>
);

const Empty = ({ icon: Icon, title, text }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; text: string }) => (
  <div className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center">
    <Icon size={22} className="mx-auto text-[var(--color-text-dim)]" />
    <p className="mt-3 text-sm font-bold text-[var(--color-text-main)]">{title}</p>
    <p className="mt-1 text-xs text-[var(--color-text-muted)]">{text}</p>
  </div>
);

export default CustomerDashboard;

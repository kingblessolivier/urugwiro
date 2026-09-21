import React from 'react';
import { MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface ListingCardData {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  listing_type: string;
  verification_level?: 'none' | 'submitted' | 'verified' | 'professional';
  media?: { url?: string; file?: string; category?: string }[];
  specs?: Record<string, string | number>;
  isFeatured?: boolean;
  isDemo?: boolean;
}

interface ListingCardProps {
  listing: ListingCardData;
  onClick?: (id: string) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onClick }) => {
  const image =
    listing.media?.[0]?.url ||
    listing.media?.[0]?.file ||
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=900';

  const verification = () => {
    switch (listing.verification_level) {
      case 'professional':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            <ShieldCheck size={12} /> Professional review
          </span>
        );
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            <ShieldCheck size={12} /> Identity / docs reviewed
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
            <CheckCircle2 size={12} /> Documents submitted
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <article
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
      onClick={() => onClick?.(listing.id)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={listing.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-800">
            {listing.listing_type}
          </span>
          {verification()}
          {listing.isDemo ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
              Demo listing
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold leading-snug text-slate-900">{listing.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <MapPin size={14} className="text-emerald-700" /> {listing.location}
        </p>

        {listing.specs ? (
          <p className="mt-3 text-sm text-slate-600">
            {Object.entries(listing.specs)
              .map(([key, value]) => `${value} ${key}`)
              .join(' · ')}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-4">
          <p className="text-lg font-semibold text-slate-900">
            {listing.price.toLocaleString()} <span className="text-sm font-normal text-slate-500">{listing.currency}</span>
          </p>
          <span className="text-sm font-medium text-emerald-700">View details</span>
        </div>
      </div>
    </article>
  );
};

export { ListingCard };

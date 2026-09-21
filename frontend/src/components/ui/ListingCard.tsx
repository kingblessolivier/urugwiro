import React from 'react';
import { MapPin, ShieldCheck, CheckCircle2, Heart } from 'lucide-react';

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

  const verificationBadge = () => {
    switch (listing.verification_level) {
      case 'professional':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            <ShieldCheck size={11} /> Pro Verified
          </span>
        );
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            <ShieldCheck size={11} /> Verified
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            <CheckCircle2 size={11} /> Docs Submitted
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <article
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/[0.05] hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/[0.06]"
      onClick={() => onClick?.(listing.id)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
        <img
          src={image}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top badges row */}
        <div className="absolute left-3 top-3 right-12 flex flex-wrap gap-1.5 pointer-events-none">
          <span className="rounded-lg bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            {listing.listing_type}
          </span>
          {verificationBadge()}
        </div>

        {/* Save button */}
        <button
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white/70 backdrop-blur-sm hover:bg-black/50 hover:text-white transition-all"
          onClick={(e) => { e.stopPropagation(); }}
        >
          <Heart size={14} />
        </button>

        {/* Price badge (bottom-left of image) */}
        <div className="absolute bottom-3 left-3">
          <p className="rounded-lg bg-black/50 px-3 py-1.5 text-lg font-bold text-white backdrop-blur-sm">
            {listing.price.toLocaleString()} <span className="text-xs font-normal text-white/70">{listing.currency}</span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[15px] font-semibold leading-snug text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
          {listing.title}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-500">
          <MapPin size={12} className="text-emerald-500" /> {listing.location}
        </p>

        {listing.specs ? (
          <p className="mt-3 text-xs text-zinc-500">
            {Object.entries(listing.specs)
              .map(([key, value]) => `${value} ${key}`)
              .join(' · ')}
          </p>
        ) : null}

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/[0.06]">
          {listing.isDemo && (
            <span className="text-[10px] font-medium text-amber-400/70 uppercase tracking-wider">Demo</span>
          )}
          <span className="ml-auto text-xs font-medium text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
            View Details →
          </span>
        </div>
      </div>
    </article>
  );
};

export { ListingCard };

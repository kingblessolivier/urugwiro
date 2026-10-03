import React from 'react';
import { MapPin, ShieldCheck, CheckCircle2, Heart, GitCompareArrows, Eye, ImageOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ListingCardData, ListingCardProps } from './types';

const VerificationBadge: React.FC<{ level?: ListingCardData['verification_level'] }> = ({ level }) => {
  if (level === 'professional' || level === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
        <ShieldCheck size={11} /> {level === 'professional' ? 'Pro Verified' : 'Verified'}
      </span>
    );
  }
  if (level === 'submitted') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-slate-900/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
        <CheckCircle2 size={11} /> Docs Submitted
      </span>
    );
  }
  return null;
};

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onClick,
  viewMode = 'grid',
  saved = false,
  compared = false,
  onToggleSave,
  onToggleCompare,
}) => {
  const image =
    listing.media?.[0]?.url ||
    listing.media?.[0]?.file ||
    '';

  return (
    <article
      onClick={() => onClick?.(listing.id)}
      className={cn(
        'group cursor-pointer overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-[var(--shadow-depth-1)]',
        'transition-[border-color,box-shadow,transform] duration-200 hover:border-[var(--color-border-hover)] hover:shadow-[var(--shadow-depth-2)]',
        viewMode === 'list' ? 'flex flex-col sm:flex-row' : 'flex flex-col hover:-translate-y-0.5'
      )}
    >
      {/* Image */}
      <div
        className={cn(
          'relative overflow-hidden bg-[var(--color-bg-elevated)]',
          viewMode === 'list' ? 'aspect-[4/3] w-full shrink-0 sm:aspect-auto sm:h-auto sm:w-56' : 'aspect-[4/3]'
        )}
      >
        {image ? (
          <>
            <img
              src={image}
              alt={listing.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/45 to-transparent" />
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[var(--color-text-dim)]">
            <ImageOff size={28} />
            <span className="text-xs font-semibold">No photo uploaded</span>
          </div>
        )}

        <div className="absolute left-3 top-3 right-12 flex flex-wrap gap-1.5 pointer-events-none">
          <span className="rounded-md bg-black/55 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            {listing.listing_type}
          </span>
          <VerificationBadge level={listing.verification_level} />
        </div>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleSave?.(listing.id); }}
          title={saved ? 'Remove from saved' : 'Save listing'}
          aria-label={saved ? 'Remove from saved' : 'Save listing'}
          className={cn(
            'absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors',
            saved ? 'bg-red-600 text-white' : 'bg-black/35 text-white/85 hover:bg-black/55 hover:text-white'
          )}
        >
          <Heart size={14} className={saved ? 'fill-white' : ''} />
        </button>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <p className="text-lg font-bold tabular-nums text-[var(--color-text-main)]">
          {listing.price.toLocaleString()}
          <span className="ml-1 text-xs font-medium text-[var(--color-text-dim)]">{listing.currency}</span>
        </p>

        <h3 className="mt-1 line-clamp-1 text-[15px] font-semibold leading-snug text-[var(--color-text-main)]">
          {listing.title}
        </h3>

        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
          <MapPin size={12} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="truncate">{listing.location}</span>
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--color-text-dim)]">
          {listing.specs && Object.entries(listing.specs).map(([key, value]) => (
            <span key={key}>{value} {key}</span>
          ))}
          {listing.views !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Eye size={12} /> {listing.views} views
            </span>
          )}
        </div>

        {viewMode === 'list' && listing.description && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[var(--color-text-muted)]">{listing.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-[var(--color-border)] pt-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
            {listing.status || 'Available'}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleCompare?.(listing.id); }}
              className={cn(
                'inline-flex items-center gap-1 text-[11px] font-semibold transition-colors',
                compared ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-main)]'
              )}
              title="Compare listing"
            >
              <GitCompareArrows size={13} /> {compared ? 'Added' : 'Compare'}
            </button>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">View details</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export { ListingCard };
export type { ListingCardData, ListingCardProps };

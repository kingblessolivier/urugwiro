import React from 'react';
import { Grid2x2, Play } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getMediaUrl, getHiResFallback, type MediaItem } from './PhotoZoomLightbox';

interface ListingGalleryProps {
  media: MediaItem[];
  title: string;
  onOpen: (index: number) => void;
}

function isVideo(item: MediaItem) {
  return item.media_type === 'video';
}

const ListingGallery: React.FC<ListingGalleryProps> = ({ media, title, onOpen }) => {
  const items = media.length > 0
    ? media
    : [0, 1, 2, 3].map((i) => ({ url: getHiResFallback(i, i === 0), media_type: 'image' as const }));

  const visible = items.slice(0, 5);
  const extra = Math.max(0, items.length - visible.length);

  return (
    <div className="relative overflow-hidden rounded-none sm:rounded-2xl border-y sm:border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
      <div
        className={cn(
          'grid gap-1 sm:gap-2 h-[260px] sm:h-[420px] lg:h-[520px]',
          visible.length === 1 && 'grid-cols-1',
          visible.length === 2 && 'grid-cols-2',
          visible.length === 3 && 'grid-cols-2 grid-rows-2',
          visible.length >= 4 && 'grid-cols-4 grid-rows-2',
        )}
      >
        {visible.map((item, index) => {
          const src = getMediaUrl(item, { hero: index === 0 });
          const span =
            visible.length === 3 && index === 0
              ? 'row-span-2'
              : visible.length >= 4 && index === 0
                ? 'col-span-2 row-span-2'
                : '';
          return (
            <button
              key={item.id ?? index}
              type="button"
              onClick={() => onOpen(index)}
              className={cn('relative overflow-hidden bg-[var(--color-bg-elevated)] cursor-zoom-in group', span)}
              aria-label={`View photo ${index + 1} of ${items.length}`}
            >
              {isVideo(item) ? (
                <div className="flex h-full w-full items-center justify-center bg-black/60">
                  <Play className="text-white" size={32} />
                </div>
              ) : (
                <img
                  src={src}
                  alt={item.caption || item.room_name || `${title} ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              )}
              {(item.caption || item.room_name || item.category) && index === 0 && (
                <span className="absolute left-3 bottom-3 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                  {item.room_name || item.category || item.caption}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onOpen(0)}
        className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-bold text-slate-900 shadow-md hover:bg-white cursor-pointer"
      >
        <Grid2x2 size={14} /> Show all {items.length} photos
        {extra > 0 ? ` +${extra}` : ''}
      </button>
    </div>
  );
};

export default ListingGallery;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Layers,
  Sparkles,
  Download,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface MediaItem {
  id?: string | number;
  url?: string;
  file?: string;
  image?: string;
  category?: string;
  caption?: string;
  room_name?: string;
  media_type?: string;
}

interface PhotoZoomLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  media: (MediaItem | string)[];
  initialIndex?: number;
  listingTitle?: string;
}

export function getMediaUrl(
  item: MediaItem | string | undefined | null,
  opts?: { width?: number; quality?: number; hero?: boolean }
): string {
  const width = opts?.width ?? (opts?.hero ? 2560 : 1600);
  const quality = opts?.quality ?? 85;
  if (!item) return '';
  const raw = typeof item === 'string' ? item : (item.url || item.file || item.image || '');
  if (!raw) return '';

  try {
    const u = new URL(raw);
    const h = u.hostname.replace(/^www\./, '');

    // Unsplash — force 4K / Retina native resolution at high quality
    if (h === 'images.unsplash.com') {
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      u.searchParams.set('w', String(width));
      u.searchParams.set('q', String(quality));
      if (opts?.hero) u.searchParams.set('dpr', '2');
      return u.toString();
    }

    // Picsum — force exact width
    if (h === 'picsum.photos') {
      // Picsum supports /id/{id}/{w}/{h} or /seed/{seed}/{w}/{h} or ?random
      // Rewrite path: anything → /seed/{stable}/{width}
      const seed = (u.pathname.replace(/\//g, '-').replace(/^-/, '') || 'urugwiro').slice(0, 64) || 'urugwiro';
      return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${Math.round(width * 0.62)}`;
    }

    // LoremFlickr
    if (h === 'loremflickr.com') {
      const match = u.pathname.match(/^\/(\d+)\/(\d+)/);
      const w = match ? Math.max(Number(match[1]), width) : width;
      const hh = match ? Math.max(Number(match[2]), Math.round(width * 0.62)) : Math.round(width * 0.62);
      const tail = u.pathname.replace(/^\/\d+\/\d+/, '');
      return `https://loremflickr.com/${w}/${hh}${tail}`;
    }
  } catch {
    // not a URL, leave alone
  }
  return raw;
}

/** Luxury hi-res fallback image pool — used if backend media is missing or
 *  the only URL it provided is a tiny 600-pixel placeholder.  Always returns
 *  estate-appropriate Unsplash 4K photography with explicit w=2560, q=90, dpr=2.
 */
const FALLBACK_POOL = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
  'https://images.unsplash.com/photo-1605146769289-440113cc3d00',
];
export function getHiResFallback(index = 0, hero = true): string {
  const base = FALLBACK_POOL[index % FALLBACK_POOL.length];
  const params = new URLSearchParams({
    auto: 'format', fit: 'crop',
    w: hero ? '2560' : '1600',
    q: hero ? '92' : '85',
  });
  if (hero) params.set('dpr', '2');
  return `${base}?${params.toString()}`;
}

export function getMediaCaption(item: MediaItem | string | undefined | null): string {
  if (!item || typeof item === 'string') return '';
  return item.caption || item.category || item.room_name || '';
}

export const PhotoZoomLightbox: React.FC<PhotoZoomLightboxProps> = ({
  isOpen,
  onClose,
  media,
  initialIndex = 0,
  listingTitle = 'Property Photo',
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const touchDistanceRef = useRef<number | null>(null);

  // Sync initialIndex when lightbox opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex]);

  // Reset zoom and pan when switching photos
  const changePhoto = useCallback((newIndex: number) => {
    setCurrentIndex(newIndex);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleNext = useCallback(() => {
    if (media.length === 0) return;
    changePhoto((currentIndex + 1) % media.length);
  }, [currentIndex, media.length, changePhoto]);

  const handlePrev = useCallback(() => {
    if (media.length === 0) return;
    changePhoto((currentIndex - 1 + media.length) % media.length);
  }, [currentIndex, media.length, changePhoto]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleToggleZoom = (e: React.MouseEvent) => {
    if (zoom > 1) {
      handleResetZoom();
    } else {
      // Zoom into clicked area
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left - rect.width / 2;
        const clickY = e.clientY - rect.top - rect.height / 2;
        setZoom(2.5);
        setPan({ x: -clickX * 1.2, y: -clickY * 1.2 });
      } else {
        setZoom(2.5);
      }
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(prev + 0.25, 4));
    } else {
      setZoom((prev) => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) setPan({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Drag to pan when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    e.preventDefault();
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pinch & pan handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceRef.current = dist;
    } else if (e.touches.length === 1 && zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const diff = (dist - touchDistanceRef.current) * 0.01;
      setZoom((prev) => Math.min(Math.max(prev + diff, 1), 4));
      touchDistanceRef.current = dist;
    } else if (e.touches.length === 1 && isDragging && zoom > 1) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistanceRef.current = null;
  };

  // Keyboard navigation & shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock background scroll
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = origOverflow;
    };
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || media.length === 0) return null;

  const currentMedia = media[currentIndex];
  const currentUrl = getMediaUrl(currentMedia, { width: 3200, quality: 92, hero: true });
  const currentCaption = getMediaCaption(currentMedia);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col bg-black/95 backdrop-blur-2xl text-white select-none animate-in fade-in duration-200"
      onWheel={handleWheel}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Sovereign Unsharp Mask Filter — isolated copy for the lightbox DOM */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <defs>
          <filter id="ld-svg-sharpen-lb" x="-5%" y="-5%" width="110%" height="110%">
            <feConvolveMatrix
              order="3"
              preserveAlpha="true"
              kernelMatrix="0 -0.75 0  -0.75 4 -0.75  0 -0.75 0"
              divisor="1"
              bias="0"
            />
          </filter>
        </defs>
      </svg>
      {/* ━━━ TOP CONTROL BAR ━━━ */}
      <div className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        {/* Left: Info & Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold tracking-wider shrink-0">
            <Layers size={13} />
            {currentIndex + 1} / {media.length}
          </span>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold truncate text-white leading-tight">
              {listingTitle}
            </h3>
            {currentCaption && (
              <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
                <Sparkles size={11} className="text-emerald-400 shrink-0" />
                {currentCaption}
              </p>
            )}
          </div>
        </div>

        {/* Right: Zoom & Control Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            aria-label="Zoom Out"
            className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer active:scale-95"
            title="Zoom Out (-)"
          >
            <ZoomOut size={16} />
          </button>

          {/* Current Zoom Level / Reset */}
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-emerald-400 hover:text-emerald-300 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            title="Reset Zoom (0)"
          >
            <RotateCcw size={13} />
            <span>{Math.round(zoom * 100)}%</span>
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 4}
            aria-label="Zoom In"
            className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer active:scale-95"
            title="Zoom In (+)"
          >
            <ZoomIn size={16} />
          </button>

          <div className="h-5 w-px bg-white/15 mx-1 hidden sm:block" />

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen"
            className="hidden sm:flex p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>

          {/* Download Original */}
          {currentUrl && (
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="hidden md:flex p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95"
              title="Open / Download Full Resolution"
            >
              <Download size={16} />
            </a>
          )}

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Lightbox"
            className="p-2 sm:p-2.5 ml-1 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white border border-red-500/30 transition-all cursor-pointer active:scale-95"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ━━━ MAIN IMAGE VIEWPORT (INTERACTIVE ZOOM & PAN) ━━━ */}
      <div
        className={cn(
          'relative flex-1 flex items-center justify-center overflow-hidden',
          zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleToggleZoom}
      >
        {/* Previous Button */}
        {media.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous Photo"
            className="absolute left-4 sm:left-6 z-20 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white backdrop-blur-xl transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-2xl"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Current Photo with smooth scale and pan translation */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-75"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center',
          }}
        >
          {currentUrl ? (
            <img
              ref={imageRef}
              src={currentUrl}
              srcSet={`${getMediaUrl(currentMedia, { width: 1920, quality: 90, hero: true })} 1x, ${getMediaUrl(currentMedia, { width: 3840, quality: 92, hero: true })} 2x`}
              sizes="(min-width: 2000px) 2000px, 90vw"
              alt={currentCaption || listingTitle}
              draggable={false}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              referrerPolicy="no-referrer-when-downgrade"
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-lg shadow-2xl pointer-events-none select-none ld-img-crisp"
              style={{
                willChange: 'transform',
                filter: 'url("#ld-svg-sharpen-lb") contrast(1.04) saturate(1.03)',
                WebkitFilter: 'url("#ld-svg-sharpen-lb") contrast(1.04) saturate(1.03)',
              }}
            />
          ) : (
            <div className="p-12 text-center text-zinc-500">
              <Layers size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Image not available</p>
            </div>
          )}
        </div>

        {/* Next Button */}
        {media.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next Photo"
            className="absolute right-4 sm:right-6 z-20 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white backdrop-blur-xl transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-2xl"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Floating Controls Overlay & Zoom Helper Guide */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-2">
          <div className="px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/15 text-[11px] text-zinc-300 font-medium shadow-2xl flex items-center gap-2">
            <span className="text-emerald-400 font-bold">Tip:</span>
            <span>Scroll wheel to zoom</span>
            <span className="text-zinc-600">·</span>
            <span>Drag to inspect</span>
            <span className="text-zinc-600">·</span>
            <span>Double-click to toggle {zoom > 1 ? '1x' : '2.5x'}</span>
          </div>
        </div>
      </div>

      {/* ━━━ BOTTOM THUMBNAIL STRIP ━━━ */}
      {media.length > 1 && (
        <div className="relative z-30 border-t border-white/10 bg-black/80 backdrop-blur-xl py-3 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            {/* Toggle thumbnail view */}
            <button
              type="button"
              onClick={() => setShowThumbnails((prev) => !prev)}
              className="text-[11px] font-semibold text-zinc-400 hover:text-white uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
            >
              {showThumbnails ? 'Hide Thumbnails' : `Show ${media.length} Thumbnails`}
            </button>

            {/* Thumbnail items */}
            {showThumbnails && (
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none max-w-full">
                {media.map((item, idx) => {
                  const thumbUrl = getMediaUrl(item, { width: 320, quality: 80 });
                  const isSelected = currentIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => changePhoto(idx)}
                      className={cn(
                        'relative shrink-0 h-14 w-20 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer',
                        isSelected
                          ? 'border-emerald-500 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.5)] ring-2 ring-emerald-500/30'
                          : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white/50'
                      )}
                      title={`View photo ${idx + 1}`}
                    >
                      {thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          loading="lazy"
                          decoding="async"
                          fetchPriority="low"
                          referrerPolicy="no-referrer-when-downgrade"
                          draggable={false}
                          className="h-full w-full object-cover ld-thumb-crisp"
                        />
                      ) : (
                        <div className="h-full w-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500">
                          #{idx + 1}
                        </div>
                      )}
                      <span className="absolute bottom-0.5 right-1 text-[9px] font-mono font-bold bg-black/70 px-1 rounded text-white">
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Total count badge */}
            <span className="text-xs font-mono text-zinc-400 shrink-0 hidden sm:block">
              {currentIndex + 1} of {media.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoZoomLightbox;

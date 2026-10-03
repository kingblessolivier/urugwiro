import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ArrowLeft, MapPin, Heart, Share2, Phone, Calendar, MessageCircle,
  HandCoins, Star, BedDouble, Bath, Maximize, Car, Gauge, Fuel, Users,
  Landmark, CheckCircle2, X, Send, Building2, ShieldCheck, Home,
  Layers, Globe, UserCircle2, StarHalf, Sparkles, Trees,
  Droplets, Zap, Wifi, Camera, Waves as WavesIcon, Shield, KeyRound,
  Truck, Grid3X3, Armchair, Flower2, ThermometerSun, Sun,
  Cctv, Warehouse, Factory,
  Check, Map as MapIcon, Camera as CameraIcon, Film, Compass,
  Crown, Award, CircleDot, Eye, Copy, ChevronRight, ChevronLeft,
  Navigation, ExternalLink,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getLocationCoordinates } from '../../data/rwandaLocations';

// Fix default marker icon for bundlers
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
import { Button } from '../../components/ui/Button';
import { cn, logError, logWarn } from '../../lib/utils';
import { readGuestSavedListingIds, toggleGuestSavedListing } from '../../lib/savedListings';
import { api } from '../../api/endpoints';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PhotoZoomLightbox } from './components/PhotoZoomLightbox';
import { getMediaUrl } from './components/media';
import { AtAGlanceGrid, type AtAGlanceFact } from './components/TechnicalSpecs';
import {
  detectListingKind,
  formatMoney,
  purposeLabel,
  priceSuffix,
  locationText,
  highlightFacts,
  specGroups,
  amenities,
  verificationCopy,
  aboutHeading,
  sellerDisplay,
  type ListingKind,
} from './listingSpecs';
import { addRecentlyViewed } from '../../components/RecentlyViewed';
import { NeighborhoodInfo } from '../../components/NeighborhoodInfo';
import { SimilarProperties } from '../../components/SimilarProperties';
import './listing-detail-styles.css';

interface ListingDetailProps {
  listingId: string;
  onBack: () => void;
  onListingClick?: (id: string) => void;
}

const inputCls =
  'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 ' +
  'text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none ' +
  'focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition';

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i <= Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'text-[var(--color-text-dim)]',
          )}
        />
      ))}
    </span>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
          className="p-0.5 cursor-pointer transition-transform hover:scale-110"
        >
          <Star
            size={28}
            className={cn(
              i <= (hover || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-[var(--color-text-dim)]',
            )}
          />
        </button>
      ))}
    </div>
  );
}

const RAIL_SECTIONS = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'details', label: 'Details', icon: Layers },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'seller', label: 'Seller', icon: UserCircle2 },
  { id: 'reviews', label: 'Reviews', icon: StarHalf },
] as const;

const AT_A_GLANCE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'Bedrooms': BedDouble, 'Bathrooms': Bath, 'Living area': Maximize, 'Parking': Car,
  'Beds': BedDouble, 'Baths': Bath, 'Built Area (m²)': Maximize, 'Year Built': Building2,
  'Plot size': Landmark, 'Land use': Globe, 'Tenure': ShieldCheck, 'Terrain': Trees,
  'Plot Size': Layers, 'UPI': KeyRound, 'Tenure Type': Shield,
  'Year': Gauge, 'Mileage': Gauge, 'Fuel': Fuel, 'Gearbox': Sparkles, 'Engine': Zap,
  'Star rating': Crown, 'Rooms': Building2, 'Conference halls': Users, 'Restaurant': Sparkles,
  'Floors': Layers, 'Gross area': Maximize, 'Zoning': Factory,
};

const AMENITY_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  'Furnished': Armchair,
  'Garden': Flower2,
  'Swimming pool': WavesIcon,
  'Staff quarters': Users,
  'Water tank': Droplets,
  'Solar water heater': Sun,
  'Backup generator': Zap,
  'Three-phase power': Zap,
  'Fiber internet': Wifi,
  'CCTV': Cctv,
  'Elevator': Grid3X3,
  'Balcony': Home,
  'Water on site': Droplets,
  'Electricity on site': Zap,
  'Fiber conduit': Wifi,
  'Road access': Truck,
  'Clear title': CheckCircle2,
  'Air conditioning': ThermometerSun,
  'Leather seats': Armchair,
  'Sunroof': Sun,
  'Reverse camera': Camera,
  'Service history': CheckCircle2,
  'Driver included': UserCircle2,
  'Helmet included': Shield,
  'Delivery rack': Truck,
  'Restaurant / bar': Sparkles,
  'Licensed': Award,
  'Loading bay': Warehouse,
};

function hasValue(v: unknown): boolean {
  if (v === undefined || v === null || v === '') return false;
  const s = String(v).trim().toLowerCase();
  if (['n/a', 'na', 'not listed', 'not provided', 'undefined', 'null', 'none'].includes(s)) return false;
  return true;
}

function apiErrorMessage(error: any, fallback: string): string {
  const data = error?.response?.data;
  if (typeof data?.error === 'string') return data.error;
  if (data && typeof data === 'object') {
    const first = Object.values(data).flat().find((value) => typeof value === 'string');
    if (typeof first === 'string') return first;
  }
  return fallback;
}

function localDateInputValue(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

const ListingDetail: React.FC<ListingDetailProps> = ({ listingId, onBack, onListingClick }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeMediaPill, setActiveMediaPill] = useState<'photos' | '3d' | 'map'>('photos');

  const [offerOpen, setOfferOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [toast, setToast] = useState('');

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const [offerAmount, setOfferAmount] = useState(0);
  const [offerNotes, setOfferNotes] = useState('');

  const [visitName, setVisitName] = useState('');
  const [visitPhone, setVisitPhone] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitSlot, setVisitSlot] = useState('09:00 - 11:00');

  const [inqName, setInqName] = useState('');
  const [inqEmail, setInqEmail] = useState('');
  const [inqPhone, setInqPhone] = useState('');
  const [inqMessage, setInqMessage] = useState('');

  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');

  const [activeRail, setActiveRail] = useState<string>('overview');
  const [upiFlash, setUpiFlash] = useState(false);
  const earliestVisitDate = useMemo(localDateInputValue, []);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const { data: listing, isLoading, error: listingError, refetch: refetchListing } = useQuery({
    queryKey: ['listing-detail', listingId],
    queryFn: async () => (await api.listings.get(listingId)).data,
    retry: 2,
  });

  const { data: reviewData } = useQuery({
    queryKey: ['listing-reviews', listingId],
    queryFn: async () => (await api.listings.reviews(listingId)).data,
    enabled: Boolean(listingId),
    retry: 2,
  });

  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2500);
  }, []);

  useEffect(() => {
    if (user) {
      const name =
        (user as any).full_name ||
        `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
        user.username ||
        '';
      const email = user.email || '';
      const phone = (user as any).phone_number || (user as any).phone || '';
      setVisitName((p) => p || name);
      setInqName((p) => p || name);
      setInqEmail((p) => p || email);
      setVisitPhone((p) => p || phone);
      setInqPhone((p) => p || phone);
    }
  }, [user]);

  const offerMutation = useMutation({
    mutationFn: (data: any) => api.consumer.createOffer(data),
    onSuccess: () => {
      setOfferOpen(false);
      flash('Your price was sent to the seller.');
    },
    onError: (e) => {
      logError('[offerMutation]', e);
      flash(apiErrorMessage(e, 'Unable to send your offer. Please try again.'));
    },
  });
  const visitMutation = useMutation({
    mutationFn: (data: any) => api.visits.create(data),
    onSuccess: () => {
      setVisitOpen(false);
      flash('Visit request sent. The seller will confirm.');
    },
    onError: (e) => {
      logError('[visitMutation]', e);
      flash(apiErrorMessage(e, 'Unable to request the visit. Please check the details.'));
    },
  });
  const inquiryMutation = useMutation({
    mutationFn: (data: any) => api.public.contactSubmit(data),
    onSuccess: () => {
      setInquiryOpen(false);
      setInqMessage('');
      flash('Message sent to the seller.');
    },
    onError: (e) => {
      logError('[inquiryMutation]', e);
      flash(apiErrorMessage(e, 'Unable to send your message. Please try again.'));
    },
  });
  const reviewMutation = useMutation({
    mutationFn: (data: any) => api.listings.submitReview(listingId, data),
    onSuccess: () => {
      setRevComment('');
      setRevRating(5);
      queryClient.invalidateQueries({ queryKey: ['listing-reviews', listingId] });
      flash('Thank you for your rating!');
    },
    onError: (e) => {
      logError('[reviewMutation]', e);
      flash(apiErrorMessage(e, 'Unable to submit your review. Please try again.'));
    },
  });

  const handleLike = async () => {
    if (!user) {
      const saved = toggleGuestSavedListing(String(listingId));
      const nowSaved = saved.has(String(listingId));
      setIsLiked(nowSaved);
      flash(nowSaved ? 'Saved on this device.' : 'Removed from saved listings.');
      return;
    }
    try {
      const res = await api.listings.like(listingId);
      setIsLiked(Boolean(res.data.liked));
      setLikesCount(
        res.data.total_likes ??
          (res.data.liked ? likesCount + 1 : Math.max(0, likesCount - 1)),
      );
    } catch (e) {
      logWarn('[handleLike] failed', e);
    }
  };

  const openOffer = () => {
    if (!user) {
      flash('Sign in to make an offer.');
      return;
    }
    setOfferOpen(true);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: listing?.title, url });
      } catch {
        /* cancelled */
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      flash('Link copied.');
    }
  };

  useEffect(() => {
    if (listing) {
      setIsLiked(
        user
          ? Boolean(listing.is_liked)
          : readGuestSavedListingIds().has(String(listingId)),
      );
      if (typeof listing.likes_count === 'number') setLikesCount(listing.likes_count);
      setOfferAmount(Number(listing.price) || 0);
      try {
        addRecentlyViewed({
          id: listingId,
          title: listing.title,
          price: Number(listing.price) || 0,
          currency: listing.currency || 'RWF',
          location: listing.address || 'Rwanda',
          listing_type: listing.listing_type || listing.purpose || 'For Sale',
        });
      } catch (e) {
        logWarn('[addRecentlyViewed] failed silently', e);
      }
    }
  }, [listing, listingId, user]);

  // ── Derived polymorphic data ──────────────────────────────────────────

  const kind: ListingKind = useMemo(() => {
    if (!listing) return 'house';
    try {
      return detectListingKind(listing as any);
    } catch (e) {
      logWarn('[detectListingKind] fallback to house', e);
      return 'house';
    }
  }, [listing]);

  const price = Number(listing?.price || 0);
  const currency = listing?.currency || 'RWF';
  const formattedPrice = useMemo(() => formatMoney(price, currency), [price, currency]);
  const locationStr = listing ? locationText(listing as any) : 'Rwanda';
  const seller = listing ? sellerDisplay(listing as any) : { name: 'Private seller', phone: '' };
  const phone = listing?.owner_phone || (listing as any)?.asset?.contact_phone || seller.phone || '';
  const verification = listing ? verificationCopy(listing.verification_level as string) : null;

  const rawMedia = useMemo(() => (Array.isArray(listing?.media) ? listing.media : []), [listing?.media]);
  const images: string[] = useMemo(() => {
    let imgs = rawMedia
      .filter((m: any) => !m.media_type || m.media_type === 'image')
      .map((m: any) => getMediaUrl(m))
      .filter(Boolean);
    return imgs;
  }, [rawMedia]);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const nextImage = useCallback(() => {
    setActiveImage((prev) => (images.length > 0 ? (prev + 1) % images.length : 0));
  }, [images.length]);

  const prevImage = useCallback(() => {
    setActiveImage((prev) => (images.length > 0 ? (prev - 1 + images.length) % images.length : 0));
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      nextImage();
    } else if (diff < -45) {
      prevImage();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, nextImage, prevImage]);

  const has360 = rawMedia.some(
    (m: any) =>
      String(m.category || '').toLowerCase().includes('360') ||
      m.media_type === 'floor_plan',
  );
  const hasVideo = rawMedia.some((m: any) => m.media_type === 'video');
  const asset = (listing?.asset as any) || {};
  const landSpec = asset.land_spec || {};
  const hasUPI = Boolean(landSpec.upi_number || asset.upi_number);
  const hasCoords = Boolean(asset.latitude && asset.longitude);

  const resolvedCoords = useMemo(() => {
    const lat = Number(asset.latitude);
    const lng = Number(asset.longitude);
    const hasExplicit = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    if (hasExplicit) {
      return { lat, lng, isExact: true, zoom: 15 };
    }
    const coords = getLocationCoordinates(
      asset.province,
      asset.district,
      asset.sector,
      asset.cell,
      asset.village
    );
    return {
      lat: coords.lat,
      lng: coords.lng,
      isExact: false,
      zoom: coords.zoom || 14,
    };
  }, [asset.latitude, asset.longitude, asset.province, asset.district, asset.sector, asset.cell, asset.village]);

  const facts: AtAGlanceFact[] = useMemo(() => {
    if (!listing) return [];
    try {
      const hf = highlightFacts(listing as any, kind);
      return hf
        .map((f) => {
          const Icon = AT_A_GLANCE_ICONS[f.label] || Sparkles;
          return { icon: Icon, label: f.label, value: f.value } as AtAGlanceFact;
        })
        .slice(0, 4);
    } catch (e) {
      logWarn('[highlightFacts] failed silently', e);
      return [];
    }
  }, [listing, kind]);

  const groups = useMemo(() => {
    if (!listing) return [];
    try {
      return specGroups(listing as any, kind);
    } catch (e) {
      logWarn('[specGroups] failed silently', e);
      return [];
    }
  }, [listing, kind]);

  const amenityList = useMemo(() => {
    if (!listing) return [];
    try {
      return amenities(listing as any, kind);
    } catch (e) {
      logWarn('[amenities] failed silently', e);
      return [];
    }
  }, [listing, kind]);

  // ── IntersectionObserver rail sync ─────────────────────────────────────

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveRail(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    observerRef.current = obs;
    RAIL_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => {
      obs.disconnect();
      observerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing?.id]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      el.scrollIntoView();
    }
  }, []);

  const copyUpi = useCallback(() => {
    const upi = String(landSpec.upi_number || asset.upi_number || '').trim();
    if (!upi) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upi).then(
        () => {
          setUpiFlash(true);
          flash('UPI copied.');
          window.setTimeout(() => setUpiFlash(false), 1400);
        },
        () => flash('Copy failed.'),
      );
    } else {
      flash('Copy not supported.');
    }
  }, [landSpec.upi_number, asset.upi_number, flash]);

  const reviews = reviewData?.results || [];
  const avgRating = Number(reviewData?.average || 0);
  const reviewCount = Number(reviewData?.count || 0);
  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    reviewMutation.mutate({
      rating: revRating,
      comment: revComment,
    });
  };

  // ── SKELETON ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-bg-deep)' }}>
        <div className="animate-pulse">
          <div className="h-64 sm:h-96 bg-[var(--color-bg-elevated)]" />
          <div className="mx-auto max-w-5xl px-4 py-5 space-y-4">
            <div className="h-10 w-3/4 bg-[var(--color-bg-elevated)] rounded-xl" />
            <div className="h-6 w-1/2 bg-[var(--color-bg-elevated)] rounded-lg" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-[var(--color-bg-elevated)] rounded-2xl" />
              ))}
            </div>
            <div className="h-56 bg-[var(--color-bg-elevated)] rounded-2xl" />
            <div className="h-72 bg-[var(--color-bg-elevated)] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (listingError || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-6"
        style={{ background: 'var(--color-bg-deep)' }}>
        <Building2 size={48} style={{ color: 'var(--color-text-dim)' }} />
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>
          {listingError ? 'Failed to load property' : 'Property not found'}
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {listingError?.message || 'The property you are looking for does not exist.'}
        </p>
        <div className="flex gap-3">
          <Button onClick={() => refetchListing()}>Try again</Button>
          <Button variant="outline" onClick={onBack}>Go back</Button>
        </div>
      </div>
    );
  }

  // ── RENDER ─────────────────────────────────────────────────────────────

  const purpose = purposeLabel(listing as any);
  const pSuffix = priceSuffix(listing as any);

  return (
    <div
      className={cn(
        'min-h-screen text-[var(--color-text-main)] ld-main-content',
      )}
      style={{ background: 'var(--color-bg-deep)' }}
    >
      {/* ══════ TOP BAR ══════ */}
      <div
        className="sticky top-0 z-30 backdrop-blur-xl"
        style={{
          borderBottom: '1px solid var(--color-border)',
          background: 'color-mix(in srgb, var(--color-bg-surface) 92%, transparent)',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold transition cursor-pointer oneui-press"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-elevated)';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-text-main)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
            }}
          >
            <ArrowLeft size={18} /> <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition cursor-pointer oneui-press"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-elevated)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
              title="Share"
            >
              <Share2 size={16} /> <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={handleLike}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition cursor-pointer oneui-press',
                isLiked
                  ? 'border-red-300 text-red-600'
                  : '',
              )}
              style={
                !isLiked
                  ? { borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }
                  : { background: 'rgba(239,68,68,0.08)' }
              }
              onMouseEnter={(e) => {
                if (!isLiked)
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-elevated)';
              }}
              onMouseLeave={(e) => {
                if (!isLiked) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
              title="Save"
            >
              <Heart size={16} className={cn(isLiked ? 'fill-red-500 text-red-500' : '')} />
              <span className="hidden sm:inline">
                {likesCount > 0 ? likesCount : 'Save'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════ MAIN 3-COL WRAPPER ══════ */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* ── LEFT GLASS RAIL (lg+) ── */}
          <div className="hidden lg:block w-14 shrink-0">
            <div className="ld-rail-container">
              <div className="ld-rail">
                {RAIL_SECTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    className="ld-rail-btn"
                    data-active={activeRail === id ? 'true' : 'false'}
                    onClick={() => scrollToSection(id)}
                    aria-label={label}
                  >
                    <Icon size={17} strokeWidth={1.8} />
                    <span className="ld-rail-tooltip">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── CENTER CONTENT ── */}
          <div className="min-w-0 flex-1 space-y-10">
            {/* ─── HERO + GALLERY ─── */}
            <section className="ld-section-anchor ld-hero-sovereign ld-fade-in-up" id="overview">
              <div className="ld-hero-emerald-radial" aria-hidden />
              <div className="ld-hero-noise" aria-hidden />

              {/* Corner badges */}
              <div className="ld-hero-badges">
                {hasUPI && (
                  <span className="ld-badge ld-badge-upi">
                    <KeyRound size={11} /> UPI Cadastral
                  </span>
                )}
                {has360 && (
                  <span className="ld-badge ld-badge-360">
                    <Compass size={11} /> 360° Tour
                  </span>
                )}
                {hasVideo && (
                  <span className="ld-badge ld-badge-video">
                    <Film size={11} /> Video
                  </span>
                )}
                {verification?.tone === 'emerald' && (
                  verification.label.toLowerCase().includes('professional') ? (
                    <span className="ld-badge ld-badge-pro">
                      <Award size={11} /> {verification.label}
                    </span>
                  ) : (
                    <span className="ld-badge ld-badge-verified">
                      <ShieldCheck size={11} /> {verification.label}
                    </span>
                  )
                )}
              </div>

              {images.length === 0 ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-center">
                  <div>
                    <CameraIcon size={32} className="mx-auto text-[var(--color-text-dim)]" />
                    <p className="mt-3 text-sm font-semibold text-[var(--color-text-main)]">No property photos uploaded</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">Ask the seller for current photos before arranging a visit.</p>
                  </div>
                </div>
              ) : (
              <>
              {/* Desktop Gallery (lg+): 1 main + 4 thumbs (2x2) */}
              <div className="hidden lg:grid ld-gallery-layout">
                <button
                  className="ld-gallery-main ld-hero-img-isolate cursor-zoom-in oneui-card"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Open photo viewer"
                >
                  <img
                    src={images[activeImage]}
                    alt={listing.title}
                    className={cn(
                      'h-full w-full object-cover ld-img-crisp ld-img-zoom',
                    )}
                    style={{ minHeight: '380px' }}
                    loading="eager"
                  />
                  <div className="ld-hero-vignette" aria-hidden />
                  <span className="absolute bottom-4 right-4 rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                    style={{ background: 'rgba(0,0,0,0.58)', backdropFilter: 'blur(6px)' }}>
                    {activeImage + 1} / {images.length}
                  </span>
                </button>
                {images.length > 1 && (
                  <div className="ld-gallery-thumbs ld-fade-in-up ld-fade-in-up-delay-1">
                    {images.slice(1, 5).map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i + 1)}
                        className={cn(
                          'ld-gallery-thumb cursor-pointer oneui-card transition-all',
                          activeImage === i + 1
                            ? 'ring-2 ring-offset-2'
                            : 'opacity-90 hover:opacity-100',
                        )}
                        style={
                          activeImage === i + 1
                            ? { '--tw-ring-color': 'var(--color-brand-emerald)' } as React.CSSProperties
                            : {}
                        }
                        aria-label={`Photo ${i + 2}`}
                      >
                        <img src={src} alt="" className="h-full w-full object-cover ld-thumb-crisp" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Phone Carousel (< lg): Single photo with touch swipe, arrows, counter & clean horizontal thumb strip */}
              <div className="block lg:hidden">
                <div
                  className="relative overflow-hidden rounded-2xl aspect-[4/3] sm:aspect-[16/10] bg-[var(--color-bg-elevated)] select-none touch-pan-y shadow-md"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src={images[activeImage]}
                    alt={listing.title}
                    className="h-full w-full object-cover cursor-zoom-in transition-all duration-300"
                    onClick={() => setLightboxOpen(true)}
                    loading="eager"
                  />
                  <div className="ld-hero-vignette" aria-hidden />

                  {/* Previous Button */}
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition active:scale-95 shadow-md z-10 cursor-pointer"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}

                  {/* Next Button */}
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition active:scale-95 shadow-md z-10 cursor-pointer"
                      aria-label="Next photo"
                    >
                      <ChevronRight size={20} />
                    </button>
                  )}

                  {/* Photo Counter Pill & Lightbox trigger */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
                      className="rounded-xl px-2.5 py-1 text-xs font-bold text-white bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      <Camera size={12} />
                      <span>{activeImage + 1} / {images.length}</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Horizontal Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 px-0.5 no-scrollbar scroll-smooth">
                    {images.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImage(i)}
                        className={cn(
                          'relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer',
                          activeImage === i
                            ? 'border-emerald-500 scale-[1.02] shadow-md ring-2 ring-emerald-500/20'
                            : 'border-transparent opacity-60 hover:opacity-100',
                        )}
                        aria-label={`Switch to photo ${i + 1}`}
                      >
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              </>
              )}

              {/* Media pills row */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  className="ld-media-pill"
                  data-active={activeMediaPill === 'photos' ? 'true' : 'false'}
                  onClick={() => setActiveMediaPill('photos')}
                >
                  <CameraIcon size={13} /> Photos <span className="opacity-60">· {images.length}</span>
                </button>
                <button
                  className="ld-media-pill"
                  data-active={activeMediaPill === '3d' ? 'true' : 'false'}
                  onClick={() => setActiveMediaPill('3d')}
                  disabled={!has360}
                  title={has360 ? '3D Tour' : 'No 3D tour available for this property'}
                >
                  <CubeStub size={13} /> 3D Tour
                </button>
                <button
                  className="ld-media-pill"
                  data-active={activeMediaPill === 'map' ? 'true' : 'false'}
                  onClick={() => {
                    setActiveMediaPill('map');
                    scrollToSection('location');
                  }}
                  disabled={!hasCoords}
                  title={hasCoords ? 'Map view' : 'Coordinates not published'}
                >
                  <MapIcon size={13} /> Map
                </button>
              </div>
            </section>

            {/* ─── TITLE + PRICE ─── */}
            <section className="ld-fade-in-up ld-fade-in-up-delay-1">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="min-w-0 max-w-3xl">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]"
                      style={{
                        borderColor: 'rgba(5,150,105,0.3)',
                        background: 'rgba(5,150,105,0.08)',
                        color: 'var(--color-brand-emerald)',
                      }}
                    >
                      <CircleDot size={10} /> {purpose}
                      {pSuffix ? ` · ${pSuffix}` : ''}
                    </span>
                    {listing.negotiable && (
                      <span
                        className="rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]"
                        style={{
                          borderColor: 'var(--color-border)',
                          background: 'var(--color-bg-surface)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        Negotiable
                      </span>
                    )}
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]"
                      style={{ color: 'var(--color-text-dim)' }}
                    >
                      <Eye size={10} />
                      {Number(listing.views_count || 0).toLocaleString()} views
                    </span>
                  </div>

                  <h1
                    className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight"
                    style={{ color: 'var(--color-text-main)', lineHeight: 1.1 }}
                  >
                    {listing.title}
                  </h1>

                  <p className="mt-3 flex flex-wrap items-center gap-1.5 text-sm"
                    style={{ color: 'var(--color-text-muted)' }}>
                    <MapPin size={16} className="shrink-0" style={{ color: 'var(--color-brand-emerald)' }} />
                    <span>{locationStr}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right min-w-0 sm:min-w-[240px]">
                  <div
                    className="font-display tabular-nums font-bold tracking-tight leading-none"
                    style={{ color: 'var(--color-brand-emerald)', fontSize: 'clamp(1.75rem, 5vw, 3rem)' }}
                  >
                    {formattedPrice}
                  </div>
                  {pSuffix && (
                    <p className="mt-1 text-xs font-semibold"
                      style={{ color: 'var(--color-text-dim)' }}>
                      per {pSuffix.replace(/^per /, '')}
                    </p>
                  )}
                  {listing.purpose === 'rent' && hasValue(listing.security_deposit) && (
                    <p className="mt-1 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                      + deposit {formatMoney(Number(listing.security_deposit), currency)}
                    </p>
                  )}
                </div>
              </div>

              {/* ── AT A GLANCE ── */}
              {facts.length > 0 && (
                <div className="mt-7 ld-fade-in-up ld-fade-in-up-delay-2">
                  <AtAGlanceGrid facts={facts} />
                </div>
              )}

              {/* ── INLINE CTA ROW (md only — below lg hides rail+desk; below md hides rail) ── */}
              <div className="mt-7 hidden md:grid grid-cols-2 gap-3 lg:grid-cols-4 ld-fade-in-up ld-fade-in-up-delay-2">
                <a
                  href={phone ? `tel:${phone}` : undefined}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 text-sm font-bold transition oneui-press',
                    phone ? '' : 'pointer-events-none opacity-50',
                  )}
                  style={{
                    background: 'var(--color-bg-elevated)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-main)',
                  }}
                >
                  <Phone size={18} /> Call
                </a>
                <button
                  onClick={() => setVisitOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-bold text-white transition oneui-press ld-btn-primary cursor-pointer"
                >
                  <Calendar size={18} /> Book a visit
                </button>
                <button
                  onClick={openOffer}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 text-sm font-bold transition oneui-press cursor-pointer"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-main)',
                  }}
                >
                  <HandCoins size={18} /> My price
                </button>
                <button
                  onClick={() => setInquiryOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 text-sm font-bold transition oneui-press cursor-pointer"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-main)',
                  }}
                >
                  <MessageCircle size={18} /> Message
                </button>
              </div>
            </section>

            {/* ─── ABOUT ─── */}
            {hasValue(listing.description) && (
              <section className="ld-section-anchor ld-fade-in-up" id="about-block">
                <h2
                  className="font-display text-2xl sm:text-3xl tracking-tight mb-4"
                  style={{ color: 'var(--color-text-main)' }}
                >
                  {aboutHeading(kind)}
                </h2>
                <div
                  className="text-sm leading-relaxed max-w-prose whitespace-pre-line"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {listing.description}
                </div>
              </section>
            )}

            {/* ─── AMENITY GRID ─── */}
            {amenityList.length > 0 && (
              <section className="ld-fade-in-up ld-fade-in-up-delay-1">
                <h2
                  className="font-display text-2xl sm:text-3xl tracking-tight mb-5"
                  style={{ color: 'var(--color-text-main)' }}
                >
                  Amenities
                </h2>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                  {amenityList.map((c, i) => {
                    const Icon = AMENITY_ICONS[c.label] || Sparkles;
                    return (
                      <div
                        key={i}
                        className="ld-amenity-cell oneui-card"
                        data-on={c.tone !== 'warn' ? 'true' : 'true'}
                        style={c.tone === 'warn' ? { borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.06)' } : undefined}
                      >
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            background: c.tone === 'warn' ? 'rgba(245,158,11,0.12)' : 'rgba(5,150,105,0.1)',
                            color: c.tone === 'warn' ? '#d97706' : 'var(--color-brand-emerald)',
                          }}
                        >
                          <Icon size={15} />
                        </div>
                        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-main)' }}>
                          {c.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ─── DETAILS: spec groups ─── */}
            <section className="ld-section-anchor ld-fade-in-up" id="details">
              <h2
                className="font-display text-2xl sm:text-3xl tracking-tight mb-6"
                style={{ color: 'var(--color-text-main)' }}
              >
                Property Details
              </h2>

              {/* UPI spotlight for LAND */}
              {hasUPI && (
                <div
                  onClick={copyUpi}
                  className={cn(
                    'mb-5 flex items-center justify-between gap-3 rounded-2xl border p-4 cursor-pointer transition-all oneui-card',
                    upiFlash ? 'ld-upi-flash' : '',
                  )}
                  style={{
                    borderColor: 'rgba(251,191,36,0.4)',
                    background:
                      'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(5,150,105,0.04))',
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') copyUpi();
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: 'rgba(251,191,36,0.2)', color: '#b45309' }}
                    >
                      <KeyRound size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: '#92400e' }}>
                        UPI — Official Parcel ID
                      </p>
                      <p
                        className="font-mono tabular-nums text-lg font-bold truncate"
                        style={{ color: 'var(--color-text-main)' }}
                      >
                        {landSpec.upi_number || asset.upi_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-amber-300/40 bg-white/60 px-2.5 py-1.5 text-xs font-bold"
                    style={{ color: '#92400e' }}>
                    <Copy size={12} /> Tap to copy
                  </div>
                </div>
              )}

              <div className="space-y-5">
                {groups.map((group, gi) => (
                  <div
                    key={gi}
                    className="surface-card oneui-card ld-fade-in-up"
                    style={{ padding: '1.5rem' }}
                  >
                    <div className="mb-4 flex items-center justify-between gap-4"
                      style={{
                        paddingBottom: '1rem',
                        borderBottom: '1px solid var(--color-border)',
                      }}
                    >
                      <h3
                        className="font-display text-xl tracking-tight"
                        style={{ color: 'var(--color-text-main)' }}
                      >
                        {group.title}
                      </h3>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider"
                        style={{ color: 'var(--color-text-dim)' }}>
                        {group.rows.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                      {group.rows.map((row, ri) => (
                        <div
                          key={ri}
                          className="flex items-start gap-3 py-3"
                          style={{
                            borderBottom:
                              ri < group.rows.length - 1 ? '1px solid var(--color-border)' : undefined,
                          }}
                        >
                          <span className="text-xs font-medium shrink-0 w-[40%] sm:w-[45%]"
                            style={{ color: 'var(--color-text-muted)' }}>
                            {row.label}
                          </span>
                          <span className="font-mono tabular-nums text-sm font-semibold break-words flex-1"
                            style={{ color: 'var(--color-text-main)' }}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ─── LOCATION ─── */}
            <section className="ld-section-anchor ld-fade-in-up" id="location">
              <h2
                className="font-display text-2xl sm:text-3xl tracking-tight mb-6"
                style={{ color: 'var(--color-text-main)' }}
              >
                Location &amp; Neighborhood
              </h2>

              {/* Interactive Leaflet Map */}
              <div
                className="mb-6 overflow-hidden rounded-2xl border oneui-card"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="relative h-72 sm:h-96 w-full z-0">
                  <MapContainer
                    key={`${resolvedCoords.lat.toFixed(5)}-${resolvedCoords.lng.toFixed(5)}`}
                    center={[resolvedCoords.lat, resolvedCoords.lng]}
                    zoom={resolvedCoords.zoom || (resolvedCoords.isExact ? 15 : 13)}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                    style={{ minHeight: '100%', zIndex: 1 }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <Marker position={[resolvedCoords.lat, resolvedCoords.lng]} icon={defaultIcon}>
                      <Popup>
                        <div className="p-1 text-xs max-w-[200px]">
                          <p className="font-bold text-sm text-slate-900 mb-1">{listing.title || 'Property'}</p>
                          <p className="text-slate-600 mb-1 leading-snug">
                            {[asset.village, asset.cell, asset.sector, asset.district, asset.province]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                          <p className="font-mono text-[11px] text-slate-500 mb-2">
                            {resolvedCoords.lat.toFixed(5)}, {resolvedCoords.lng.toFixed(5)}
                          </p>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${resolvedCoords.lat},${resolvedCoords.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700"
                          >
                            Open in Google Maps &rarr;
                          </a>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>

                  {/* Top-right quick link to Google Maps */}
                  <div className="absolute top-3 right-3 z-[400]">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${resolvedCoords.lat},${resolvedCoords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md border backdrop-blur-md transition-colors"
                      style={{
                        backgroundColor: 'var(--color-bg-surface)',
                        color: 'var(--color-text-main)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <Navigation size={13} style={{ color: 'var(--color-brand-emerald)' }} />
                      <span>Google Maps</span>
                      <ExternalLink size={11} className="opacity-70" />
                    </a>
                  </div>
                </div>

                {/* Map Bottom Metadata Bar */}
                <div
                  className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs border-t"
                  style={{
                    backgroundColor: 'var(--color-bg-subtle)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-[11px]"
                      style={{
                        backgroundColor: resolvedCoords.isExact ? 'rgba(5, 150, 105, 0.12)' : 'rgba(217, 119, 6, 0.12)',
                        color: resolvedCoords.isExact ? 'var(--color-brand-emerald)' : '#d97706',
                      }}
                    >
                      <MapPin size={11} />
                      {resolvedCoords.isExact
                        ? 'Exact Coordinates'
                        : `Area: ${[asset.village, asset.cell, asset.sector, asset.district].filter(Boolean).slice(0, 2).join(', ') || 'Rwanda'}`}
                    </span>
                    <span className="font-mono tabular-nums text-[11px]">
                      {resolvedCoords.lat.toFixed(5)}, {resolvedCoords.lng.toFixed(5)}
                    </span>
                  </div>
                  <span className="text-[11px]">
                    Drag to pan &bull; Click pin for location details
                  </span>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1fr,1.2fr]">
                <div
                  className="surface-card oneui-card"
                  style={{ padding: '1.5rem' }}
                >
                  <h3 className="font-display text-xl mb-4" style={{ color: 'var(--color-text-main)' }}>
                    Address
                  </h3>
                  <div className="space-y-3">
                    {[
                      ['Address', listing.address],
                      ['Village', asset.village],
                      ['Cell', asset.cell],
                      ['Sector', asset.sector],
                      ['District', asset.district],
                      ['Province', asset.province],
                    ]
                      .filter(([, v]) => hasValue(v))
                      .map(([k, v], i) => (
                        <div key={i} className="flex items-start justify-between gap-3 py-2"
                          style={{
                            borderBottom:
                              i === 0 ? '1px solid var(--color-border)' : undefined,
                          }}
                        >
                          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                            {k}
                          </span>
                          <span className="text-sm font-semibold text-right break-words max-w-[60%]"
                            style={{ color: 'var(--color-text-main)' }}>
                            {v}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
                <NeighborhoodInfo
                  address={listing.address || undefined}
                  district={asset.district}
                  sector={asset.sector}
                />
              </div>
            </section>

            {/* ─── SOVEREIGN JOURNEY TIMELINE ─── */}
            <section className="ld-fade-in-up">
              <h2
                className="font-display text-2xl sm:text-3xl tracking-tight mb-6"
                style={{ color: 'var(--color-text-main)' }}
              >
                Your Sovereign Journey
              </h2>
              <div
                className="surface-card oneui-card"
                style={{ padding: '1.5rem 1.5rem 1.75rem' }}
              >
                <div className="relative py-2">
                  <div className="ld-journey-track" style={{ ['--progress' as any]: '15%' }} />
                  <div className="mt-3 grid grid-cols-4 sm:grid-cols-7 gap-2 relative">
                    {[
                      { label: 'Listed', done: true },
                      { label: 'Viewed', done: true },
                      { label: 'Inquiry', done: false },
                      { label: 'Visit', done: false },
                      { label: 'Offer', done: false },
                      { label: 'Negotiate', done: false },
                      { label: 'Complete', done: false },
                    ].map((s, i) => (
                      <div key={i} className="flex flex-col items-center text-center gap-2 pt-2">
                        <div
                          className="ld-journey-dot"
                          data-done={s.done ? 'true' : 'false'}
                        >
                          {s.done && (
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                              <Check size={10} />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-semibold leading-tight tracking-wide uppercase"
                          style={{ color: s.done ? 'var(--color-brand-emerald)' : 'var(--color-text-dim)' }}>
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ─── SELLER ─── */}
            <section className="ld-section-anchor ld-fade-in-up" id="seller">
              <h2
                className="font-display text-2xl sm:text-3xl tracking-tight mb-6"
                style={{ color: 'var(--color-text-main)' }}
              >
                Listed by
              </h2>
              <div className="surface-card oneui-card" style={{ padding: '1.5rem' }}>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-bold"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(5,150,105,0.18), rgba(212,175,55,0.16))',
                        color: 'var(--color-brand-emerald)',
                      }}
                    >
                      {seller.name.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-xl tracking-tight truncate"
                          style={{ color: 'var(--color-text-main)' }}>
                          {seller.name}
                        </p>
                        {verification && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                            style={{
                              borderColor: 'rgba(5,150,105,0.3)',
                              background: 'rgba(5,150,105,0.08)',
                              color: 'var(--color-brand-emerald)',
                            }}
                          >
                            <ShieldCheck size={10} /> {verification.label}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Urugwiro Seller · Listed {new Date(listing.date_listed || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:justify-end">
                    <a
                      href={phone ? `tel:${phone}` : undefined}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition oneui-press',
                        phone ? '' : 'pointer-events-none opacity-50',
                      )}
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-main)',
                        background: 'var(--color-bg-elevated)',
                      }}
                    >
                      <Phone size={13} /> Call
                    </a>
                    <button
                      onClick={() => setInquiryOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white transition oneui-press ld-btn-primary cursor-pointer"
                    >
                      <MessageCircle size={13} /> Message
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── REVIEWS ─── */}
            <section className="ld-section-anchor ld-fade-in-up" id="reviews">
              <h2
                className="font-display text-2xl sm:text-3xl tracking-tight mb-6"
                style={{ color: 'var(--color-text-main)' }}
              >
                Reviews &amp; Ratings
              </h2>
              <div
                className="rounded-2xl border p-5 sm:p-6 oneui-card"
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-bg-surface)',
                }}
              >
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="font-mono tabular-nums text-4xl font-bold tracking-tight"
                      style={{ color: 'var(--color-text-main)' }}
                    >
                      {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                    </div>
                    <div>
                      {reviewCount > 0 && <Stars value={avgRating} size={18} />}
                      <p className="mt-0.5 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        {reviewCount} review{reviewCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                </div>

                {user ? (
                  <form onSubmit={submitReview} className="space-y-3"
                    style={{
                      paddingTop: '1.25rem',
                      borderTop: '1px solid var(--color-border)',
                    }}
                  >
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                      Rate this property
                    </p>
                    <StarPicker value={revRating} onChange={setRevRating} />
                    <textarea
                      value={revComment}
                      onChange={(e) => setRevComment(e.target.value)}
                      placeholder="Share a short comment (optional)"
                      rows={2}
                      className={cn(inputCls, 'resize-none')}
                    />
                    <Button
                      type="submit"
                      isLoading={reviewMutation.isPending}
                      className="px-5"
                    >
                      <Send size={15} /> Submit rating
                    </Button>
                  </form>
                ) : (
                  <div className="border-t border-[var(--color-border)] pt-5">
                    <Button type="button" variant="secondary" onClick={() => navigate('/login')}>
                      <UserCircle2 size={16} /> Sign in to rate
                    </Button>
                  </div>
                )}

                <div className="mt-6 space-y-3"
                  style={{
                    paddingTop: '1.25rem',
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  {reviews.length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
                      No ratings yet. Be the first to rate.
                    </p>
                  ) : (
                    reviews.map((r: any) => (
                      <div
                        key={r.id}
                        className="rounded-2xl border p-4 oneui-card"
                        style={{
                          borderColor: 'var(--color-border)',
                          background: 'var(--color-bg-elevated)',
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold" style={{ color: 'var(--color-text-main)' }}>
                            {r.reviewer_display_name || 'Customer'}
                          </span>
                          <Stars value={r.rating} size={14} />
                        </div>
                        {r.comment && (
                          <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                            {r.comment}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* ─── SIMILAR ─── */}
            <SimilarProperties
              currentListingId={String(listingId)}
              category={listing.category || undefined}
              onListingClick={onListingClick}
            />
          </div>

          {/* ── RIGHT TRANSACTION DESK (xl+) ── */}
          <div className="hidden xl:block w-80 shrink-0">
            <div className="ld-transaction-desk ld-fade-in-scale">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
                style={{ color: 'var(--color-text-dim)' }}>
                Asking price
              </p>
              <div
                className="font-display tabular-nums font-bold tracking-tight leading-none"
                style={{ color: 'var(--color-brand-emerald)', fontSize: '2.6rem' }}
              >
                {formattedPrice}
              </div>
              {pSuffix && (
                <p className="mt-1 text-xs font-semibold" style={{ color: 'var(--color-text-dim)' }}>
                  {purpose} · per {pSuffix.replace(/^per /, '')}
                </p>
              )}
              {!pSuffix && (
                <p className="mt-1 text-xs font-semibold" style={{ color: 'var(--color-text-dim)' }}>
                  {purpose}
                </p>
              )}

              {listing.purpose === 'rent' && hasValue(listing.security_deposit) && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border p-3"
                    style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-elevated)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: 'var(--color-text-dim)' }}>Rent</p>
                    <p className="mt-1 font-mono tabular-nums text-base font-bold"
                      style={{ color: 'var(--color-text-main)' }}>
                      {formattedPrice}
                    </p>
                  </div>
                  <div className="rounded-xl border p-3"
                    style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-elevated)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: 'var(--color-text-dim)' }}>Deposit</p>
                    <p className="mt-1 font-mono tabular-nums text-base font-bold"
                      style={{ color: 'var(--color-text-main)' }}>
                      {formatMoney(Number(listing.security_deposit), currency)}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-5 space-y-2.5">
                <button
                  onClick={openOffer}
                  className="ld-gold-btn w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold cursor-pointer oneui-press"
                >
                  <HandCoins size={17} /> Make an offer
                </button>
                <button
                  onClick={() => setVisitOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white cursor-pointer oneui-press ld-btn-primary"
                >
                  <Calendar size={17} /> Book a visit
                </button>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setInquiryOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl border py-3 text-xs font-bold transition oneui-press cursor-pointer"
                    style={{
                      borderColor: 'var(--color-border)',
                      background: 'var(--color-bg-elevated)',
                      color: 'var(--color-text-main)',
                    }}
                  >
                    <MessageCircle size={15} /> Message
                  </button>
                  <a
                    href={phone ? `tel:${phone}` : undefined}
                    className={cn(
                      'inline-flex items-center justify-center gap-1.5 rounded-2xl border py-3 text-xs font-bold transition oneui-press',
                      phone ? '' : 'pointer-events-none opacity-50',
                    )}
                    style={{
                      borderColor: 'var(--color-border)',
                      background: 'var(--color-bg-elevated)',
                      color: 'var(--color-text-main)',
                    }}
                  >
                    <Phone size={15} /> Call
                  </a>
                </div>
              </div>

              <div className="mt-5 space-y-2.5 pt-5"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--color-text-muted)' }}>Views</span>
                  <span className="font-mono tabular-nums font-semibold"
                    style={{ color: 'var(--color-text-main)' }}>
                    {Number(listing.views_count || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--color-text-muted)' }}>Verification</span>
                  <span className="inline-flex items-center gap-1 font-bold"
                    style={{ color: 'var(--color-brand-emerald)' }}>
                    <ShieldCheck size={12} /> {verification?.label || 'Seller listed'}
                  </span>
                </div>
                {listing.negotiable && (
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--color-text-muted)' }}>Price</span>
                    <span className="font-semibold" style={{ color: 'var(--color-accent-gold)' }}>
                      Negotiable
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════ MOBILE BOTTOM PRICE GLASS SHEET — <md only ══════ */}
      <div className="md:hidden ld-bottom-glass safe-area-bottom">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-end justify-between gap-3 mb-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-0.5"
                style={{ color: 'var(--color-text-dim)' }}>
                {purpose}
              </p>
              <div
                className="font-display tabular-nums font-bold tracking-tight leading-none truncate"
                style={{ color: 'var(--color-brand-emerald)', fontSize: '1.65rem' }}
              >
                {formattedPrice}
              </div>
              {pSuffix && (
                <p className="mt-0.5 text-[11px] font-semibold"
                  style={{ color: 'var(--color-text-dim)' }}>
                  / {pSuffix.replace(/^per /, '')}
                </p>
              )}
            </div>
            <button
              onClick={openOffer}
              className="shrink-0 inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-bold oneui-press"
              style={{
                borderColor: 'rgba(212,175,55,0.5)',
                background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(229,193,88,0.08))',
                color: '#854d0e',
              }}
            >
              <HandCoins size={13} /> Offer
            </button>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_3rem_3rem] items-center gap-2">
            <button
              onClick={() => setVisitOpen(true)}
              className="inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold text-white ld-btn-primary cursor-pointer oneui-press"
            >
              <Calendar size={16} className="shrink-0" /> <span className="truncate">Book visit</span>
            </button>
            <button
              onClick={() => setInquiryOpen(true)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition oneui-press cursor-pointer"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-bg-surface)',
                color: 'var(--color-text-main)',
              }}
              aria-label="Message seller"
            >
              <MessageCircle size={17} />
            </button>
            <a
              href={phone ? `tel:${phone}` : undefined}
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition oneui-press',
                phone ? '' : 'pointer-events-none opacity-40',
              )}
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-bg-surface)',
                color: 'var(--color-text-main)',
              }}
              aria-label="Call seller"
            >
              <Phone size={17} />
            </a>
          </div>
        </div>
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 z-[60] -translate-x-1/2 md:bottom-8">
          <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg"
            style={{
              background: 'var(--color-text-main)',
              color: 'var(--color-bg-surface)',
            }}
          >
            <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      {offerOpen && (
        <Modal title="What is your price?" onClose={() => setOfferOpen(false)}>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Asking price:{' '}
            <span className="font-bold" style={{ color: 'var(--color-text-main)' }}>
              {price.toLocaleString()} {currency}
            </span>
          </p>
          <div className="mt-4 space-y-3">
            <input
              type="number"
              value={offerAmount || ''}
              onChange={(e) => setOfferAmount(Number(e.target.value))}
              placeholder="Enter your price"
              className={cn(inputCls, 'font-mono text-lg tabular-nums')}
            />
            <div className="flex gap-2">
              {[-10, -5, 0].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setOfferAmount(Math.round(price * (1 + pct / 100)))}
                  className="flex-1 rounded-lg border py-2 text-xs font-bold transition cursor-pointer oneui-press"
                  style={{
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-bg-elevated)',
                    color: 'var(--color-text-muted)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-text-main)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
                  }}
                >
                  {pct === 0 ? 'Full price' : `${pct}%`}
                </button>
              ))}
            </div>
            <textarea
              value={offerNotes}
              onChange={(e) => setOfferNotes(e.target.value)}
              placeholder="Add a note (optional)"
              rows={2}
              className={cn(inputCls, 'resize-none')}
            />
            <Button
              onClick={() =>
                offerMutation.mutate({
                  listing: listingId,
                  amount: offerAmount,
                  notes: offerNotes,
                })
              }
              disabled={!offerAmount}
              isLoading={offerMutation.isPending}
              className="w-full py-3"
            >
              <Send size={16} /> Send my price
            </Button>
          </div>
        </Modal>
      )}

      {visitOpen && (
        <Modal title="Book a visit" onClose={() => setVisitOpen(false)}>
          <div className="space-y-3">
            <input
              value={visitName}
              onChange={(e) => setVisitName(e.target.value)}
              placeholder="Your name"
              className={inputCls}
              required
            />
            <input
              type="tel"
              value={visitPhone}
              onChange={(e) => setVisitPhone(e.target.value)}
              placeholder="Phone number"
              className={inputCls}
              required
            />
            <input
              type="date"
              value={visitDate}
              min={earliestVisitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className={inputCls}
              required
            />
            <select
              value={visitSlot}
              onChange={(e) => setVisitSlot(e.target.value)}
              className={inputCls}
            >
              <option value="09:00 - 11:00">Morning (09:00 - 11:00)</option>
              <option value="11:00 - 13:00">Midday (11:00 - 13:00)</option>
              <option value="14:00 - 16:00">Afternoon (14:00 - 16:00)</option>
            </select>
            <Button
              onClick={() =>
                visitMutation.mutate({
                  listing_id: listingId,
                  name: visitName,
                  phone: visitPhone,
                  scheduled_date: visitDate,
                  scheduled_time: visitSlot,
                })
              }
              disabled={!visitName || !visitPhone || !visitDate}
              isLoading={visitMutation.isPending}
              className="w-full py-3"
            >
              <Calendar size={16} /> Request visit
            </Button>
          </div>
        </Modal>
      )}

      {inquiryOpen && (
        <Modal title="Message the seller" onClose={() => setInquiryOpen(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              inquiryMutation.mutate({
                name: inqName,
                email: inqEmail,
                phone: inqPhone,
                message: inqMessage,
                listing_id: listing.id,
              });
            }}
            className="space-y-3"
          >
            <input
              value={inqName}
              onChange={(e) => setInqName(e.target.value)}
              placeholder="Your name"
              className={inputCls}
              required
            />
            <input
              type="email"
              value={inqEmail}
              onChange={(e) => setInqEmail(e.target.value)}
              placeholder="Email"
              className={inputCls}
              required
            />
            <input
              type="tel"
              value={inqPhone}
              onChange={(e) => setInqPhone(e.target.value)}
              placeholder="Phone (optional)"
              className={inputCls}
            />
            <textarea
              value={inqMessage}
              onChange={(e) => setInqMessage(e.target.value)}
              placeholder="Write your message..."
              rows={4}
              className={cn(inputCls, 'resize-none')}
              required
            />
            <Button type="submit" isLoading={inquiryMutation.isPending} className="w-full py-3">
              <Send size={16} /> Send message
            </Button>
          </form>
        </Modal>
      )}

      {images.length > 0 && lightboxOpen && (
        <PhotoZoomLightbox
          onClose={() => setLightboxOpen(false)}
          media={images}
          initialIndex={activeImage}
          listingTitle={listing.title}
        />
      )}
    </div>
  );
};

// Tiny placeholder for 3D cube icon (no need to import extra icon)
function CubeStub({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl border shadow-xl sm:rounded-2xl"
        style={{
          background: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
          animation: 'scaleIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        <div className="mb-4 flex items-center justify-between p-6 pb-4">
          <h3
            className="font-display text-xl tracking-tight"
            style={{ color: 'var(--color-text-main)' }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition cursor-pointer oneui-press"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-elevated)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}

export default ListingDetail;

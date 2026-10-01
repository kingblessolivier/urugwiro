import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, MapPin, Heart, Share2, Phone, Calendar, MessageCircle,
  HandCoins, Star, BedDouble, Bath, Maximize, Car, Gauge, Fuel, Users,
  Landmark, CheckCircle2, X, Send, Building2, ShieldCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { api } from '../../api/endpoints';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { PhotoZoomLightbox, getMediaUrl, getHiResFallback } from './components/PhotoZoomLightbox';
import { SpecDomain } from './components/TechnicalSpecs';
import { addRecentlyViewed } from '../../components/RecentlyViewed';
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
          className={i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-[var(--color-text-dim)]'}
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
            className={i <= (hover || value) ? 'fill-amber-400 text-amber-400' : 'text-[var(--color-text-dim)]'}
          />
        </button>
      ))}
    </div>
  );
}

const ListingDetail: React.FC<ListingDetailProps> = ({ listingId, onBack }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [offerOpen, setOfferOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
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

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [revName, setRevName] = useState('');

  const { data: listing, isLoading, error: listingError, refetch: refetchListing } = useQuery({
    queryKey: ['listing-detail', listingId],
    queryFn: async () => (await api.listings.get(listingId)).data,
    retry: 2,
  });

  const { data: reviewData, error: reviewError, refetch: refetchReviews } = useQuery({
    queryKey: ['listing-reviews', listingId],
    queryFn: async () => (await api.listings.reviews(listingId)).data,
    enabled: Boolean(listingId),
    retry: 2,
  });

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  useEffect(() => {
    if (user) {
      const name = (user as any).full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || '';
      const email = user.email || '';
      const phone = (user as any).phone_number || (user as any).phone || '';
      setVisitName((p) => p || name); setInqName((p) => p || name); setGuestName((p) => p || name); setRevName((p) => p || name);
      setInqEmail((p) => p || email); setGuestEmail((p) => p || email);
      setVisitPhone((p) => p || phone); setInqPhone((p) => p || phone); setGuestPhone((p) => p || phone);
    }
  }, [user]);

  const offerMutation = useMutation({
    mutationFn: (data: any) => api.offers.create(data),
    onSuccess: () => { setOfferOpen(false); flash('Your price was sent to the seller.'); },
  });
  const visitMutation = useMutation({
    mutationFn: (data: any) => api.visits.create(data),
    onSuccess: () => { setVisitOpen(false); flash('Visit request sent. The seller will confirm.'); },
  });
  const inquiryMutation = useMutation({
    mutationFn: (data: any) => api.public.contactSubmit(data),
    onSuccess: () => { setInquiryOpen(false); setInqMessage(''); flash('Message sent to the seller.'); },
  });
  const reviewMutation = useMutation({
    mutationFn: (data: any) => api.listings.submitReview(listingId, data),
    onSuccess: () => {
      setRevComment(''); setRevRating(5);
      queryClient.invalidateQueries({ queryKey: ['listing-reviews', listingId] });
      flash('Thank you for your rating!');
    },
  });

  const handleLike = async () => {
    if (!user) { setGuestOpen(true); return; }
    try {
      const res = await api.listings.like(listingId);
      setIsLiked(Boolean(res.data.liked));
      setLikesCount(res.data.total_likes ?? (res.data.liked ? likesCount + 1 : Math.max(0, likesCount - 1)));
    } catch { /* ignore */ }
  };

  const handleGuestSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.listings.like(listingId, { name: guestName, phone: guestPhone, email: guestEmail });
      setIsLiked(true);
      setLikesCount(res.data.total_likes ?? likesCount + 1);
      setGuestOpen(false);
      flash('Saved! We will keep you updated.');
    } catch { /* ignore */ }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: listing?.title, url }); } catch { /* cancelled */ }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      flash('Link copied.');
    }
  };

  useEffect(() => {
    if (listing) {
      if (typeof listing.is_liked === 'boolean') setIsLiked(listing.is_liked);
      if (typeof listing.likes_count === 'number') setLikesCount(listing.likes_count);
      setOfferAmount(Number(listing.price) || 0);
      addRecentlyViewed({
        id: listingId,
        title: listing.title,
        price: Number(listing.price) || 0,
        currency: listing.currency || 'RWF',
        location: listing.address || 'Rwanda',
        listing_type: listing.listing_type || listing.purpose || 'For Sale',
      });
    }
  }, [listing, listingId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-deep)]">
        <div className="animate-pulse">
          <div className="h-64 sm:h-96 bg-[var(--color-bg-elevated)]" />
          <div className="mx-auto max-w-5xl px-4 py-5 space-y-4">
            <div className="h-8 w-3/4 bg-[var(--color-bg-elevated)] rounded-lg" />
            <div className="h-4 w-1/2 bg-[var(--color-bg-elevated)] rounded" />
            <div className="h-24 bg-[var(--color-bg-elevated)] rounded-xl" />
            <div className="h-32 bg-[var(--color-bg-elevated)] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (listingError || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--color-bg-deep)] text-center p-6">
        <Building2 size={48} className="text-[var(--color-text-dim)]" />
        <h2 className="text-xl font-bold text-[var(--color-text-main)]">
          {listingError ? 'Failed to load property' : 'Property not found'}
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          {listingError?.message || 'The property you are looking for does not exist.'}
        </p>
        <div className="flex gap-3">
          <Button onClick={() => refetchListing()}>Try again</Button>
          <Button variant="outline" onClick={onBack}>Go back</Button>
        </div>
      </div>
    );
  }

  const asset = (listing.asset as any) || {};
  const resSpec = asset.residential_spec || {};
  const landSpec = asset.land_spec || {};
  const vehSpec = asset.vehicle_spec || {};
  const price = Number(listing.price || 0);
  const currency = listing.currency || 'RWF';
  const locationText = listing.address || [asset.province, asset.district, asset.sector].filter(Boolean).join(', ') || 'Rwanda';
  const phone = listing.owner_phone || asset.contact_phone || '';

  const rawCat = (listing.category || listing.listing_type || '').toLowerCase();
  const isLand = rawCat.includes('land') || rawCat.includes('plot') || !!landSpec.upi_number;
  const isVehicle = rawCat.includes('car') || rawCat.includes('vehic') || rawCat.includes('motor') || !!vehSpec.make;

  // Build the image list from every media item that resolves to a picture.
  const rawMedia = Array.isArray(listing.media) ? listing.media : [];
  let images: string[] = rawMedia
    .filter((m: any) => !m.media_type || m.media_type === 'image')
    .map((m: any) => getMediaUrl(m))
    .filter(Boolean);
  if (images.length === 0) {
    const seed = (listing.title || 'urugwiro').split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
    images = [0, 1, 2].map((i) => getHiResFallback(seed + i, i === 0));
  }

  const specDomains: { title: string; icon: any; metrics: { icon: any; value?: string | number; label: string }[] }[] = [];
  if (isVehicle) {
    specDomains.push({
      title: 'Vehicle Specifications',
      icon: Car,
      metrics: [
        { icon: Car, label: 'Model', value: `${vehSpec.year || ''} ${vehSpec.make}`.trim() },
        { icon: Gauge, label: 'Mileage', value: vehSpec.mileage != null ? `${Number(vehSpec.mileage).toLocaleString()} km` : undefined },
        { icon: Fuel, label: 'Fuel Type', value: vehSpec.fuel_type },
        { icon: Users, label: 'Seating Capacity', value: vehSpec.seating_capacity },
      ],
    });
  } else if (isLand) {
    specDomains.push({
      title: 'Land Information',
      icon: Landmark,
      metrics: [
        { icon: Maximize, label: 'Plot Size', value: landSpec.plot_size_sqm || asset.total_area ? `${landSpec.plot_size_sqm || asset.total_area} m²` : undefined },
        { icon: Landmark, label: 'Land Use Category', value: landSpec.land_use_category },
        { icon: ShieldCheck, label: 'UPI Number', value: landSpec.upi_number },
      ],
    });
  } else {
    specDomains.push({
      title: 'Property Specifications',
      icon: Building2,
      metrics: [
        { icon: BedDouble, label: 'Bedrooms', value: resSpec.bedrooms },
        { icon: Bath, label: 'Bathrooms', value: resSpec.bathrooms },
        { icon: Maximize, label: 'Built-up Area', value: resSpec.built_up_area_sqm || asset.total_area ? `${resSpec.built_up_area_sqm || asset.total_area} m²` : undefined },
        { icon: Car, label: 'Parking Spaces', value: resSpec.parking_spaces },
      ],
    });
  }

  const reviews = reviewData?.results || [];
  const avgRating = reviewData?.average || 0;
  const reviewCount = reviewData?.count || 0;

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    reviewMutation.mutate({
      rating: revRating,
      comment: revComment,
      reviewer_name: user ? '' : revName,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] text-[var(--color-text-main)] pb-24 md:pb-10">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <button onClick={onBack} className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-main)] transition cursor-pointer">
            <ArrowLeft size={18} /> <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] transition cursor-pointer" title="Share">
              <Share2 size={16} /> <span className="hidden sm:inline">Share</span>
            </button>
            <button onClick={handleLike} className={cn('inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition cursor-pointer', isLiked ? 'border-red-300 bg-red-50 text-red-600' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)]')} title="Save">
              <Heart size={16} className={isLiked ? 'fill-red-500 text-red-500' : ''} /> <span className="hidden sm:inline">{likesCount || 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-5">
        {/* Photo gallery */}
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
          <button onClick={() => setLightboxOpen(true)} className="relative block w-full cursor-zoom-in" aria-label="Open photo viewer">
            <img src={images[activeImage]} alt={listing.title} className="h-64 w-full object-cover sm:h-96" />
            <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">{activeImage + 1} / {images.length}</span>
          </button>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-3">
              {images.map((src, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={cn('h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition cursor-pointer', i === activeImage ? 'border-emerald-500' : 'border-transparent opacity-60 hover:opacity-100')}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title, location, price */}
        <div className="mt-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] sm:text-3xl">{listing.title}</h1>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                <MapPin size={16} className="shrink-0 text-[var(--color-brand-emerald)]" /> {locationText}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[var(--color-brand-emerald)] sm:text-3xl">{price.toLocaleString()}</p>
              <p className="text-xs font-medium text-[var(--color-text-muted)]">{currency}{listing.rental_frequency ? ` / ${listing.rental_frequency}` : ''}</p>
            </div>
          </div>

          {/* Technical Specifications */}
          {specDomains.length > 0 && (
            <div className="mt-6 space-y-4">
              {specDomains.map((domain) => (
                <SpecDomain key={domain.title} title={domain.title} icon={domain.icon} metrics={domain.metrics} />
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <a href={phone ? `tel:${phone}` : undefined} className={cn('inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold transition', phone ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-main)] border border-[var(--color-border)] hover:bg-[var(--color-bg-card-hover)] cursor-pointer' : 'pointer-events-none bg-[var(--color-bg-elevated)] text-[var(--color-text-dim)] border border-[var(--color-border)] opacity-50')}>
            <Phone size={18} /> Call
          </a>
          <button onClick={() => setVisitOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 cursor-pointer">
            <Calendar size={18} /> Book a visit
          </button>
          <button onClick={() => setOfferOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] px-4 py-3.5 text-sm font-bold text-[var(--color-text-main)] transition hover:bg-[var(--color-bg-card-hover)] cursor-pointer">
            <HandCoins size={18} /> My price
          </button>
          <button onClick={() => setInquiryOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] px-4 py-3.5 text-sm font-bold text-[var(--color-text-main)] transition hover:bg-[var(--color-bg-card-hover)] cursor-pointer">
            <MessageCircle size={18} /> Message
          </button>
        </div>

        {/* Description */}
        {listing.description && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-[var(--color-text-main)]">About this property</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-text-muted)]">{listing.description}</p>
          </div>
        )}

        {/* Ratings */}
        <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[var(--color-text-main)]">Ratings</h2>
            {reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <Stars value={avgRating} size={18} />
                <span className="text-sm font-semibold text-[var(--color-text-main)]">{avgRating}</span>
                <span className="text-xs text-[var(--color-text-dim)]">({reviewCount})</span>
              </div>
            )}
          </div>

          {/* Submit a rating */}
          <form onSubmit={submitReview} className="mt-4 space-y-3 border-t border-[var(--color-border)] pt-4">
            <p className="text-sm font-medium text-[var(--color-text-muted)]">Rate this property</p>
            <StarPicker value={revRating} onChange={setRevRating} />
            {!user && (
              <input value={revName} onChange={(e) => setRevName(e.target.value)} placeholder="Your name" className={inputCls} required />
            )}
            <textarea value={revComment} onChange={(e) => setRevComment(e.target.value)} placeholder="Share a short comment (optional)" rows={2} className={cn(inputCls, 'resize-none')} />
            <Button type="submit" isLoading={reviewMutation.isPending} className="px-5">
              <Send size={15} /> Submit rating
            </Button>
          </form>

          {/* Review list */}
          <div className="mt-5 space-y-3 border-t border-[var(--color-border)] pt-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-[var(--color-text-dim)]">No ratings yet. Be the first to rate.</p>
            ) : (
              reviews.map((r: any) => (
                <div key={r.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[var(--color-text-main)]">{r.reviewer_name || 'Customer'}</span>
                    <Stars value={r.rating} size={14} />
                  </div>
                  {r.comment && <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{r.comment}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3 md:hidden">
        <div className="mx-auto flex max-w-5xl items-center gap-2">
          <a href={phone ? `tel:${phone}` : undefined} className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] py-3 text-sm font-bold', phone ? 'text-[var(--color-text-main)]' : 'pointer-events-none text-[var(--color-text-dim)] opacity-50')}>
            <Phone size={16} /> Call
          </a>
          <button onClick={() => setVisitOpen(true)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white">
            <Calendar size={16} /> Visit
          </button>
          <button onClick={() => setOfferOpen(true)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] py-3 text-sm font-bold text-[var(--color-text-main)]">
            <HandCoins size={16} /> My price
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 md:bottom-6">
          <div className="flex items-center gap-2 rounded-xl bg-[var(--color-text-main)] px-4 py-3 text-sm font-medium text-[var(--color-bg-surface)] shadow-lg">
            <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
          </div>
        </div>
      )}

      {/* OFFER MODAL — simple "my price" */}
      {offerOpen && (
        <Modal title="What is your price?" onClose={() => setOfferOpen(false)}>
          <p className="text-sm text-[var(--color-text-muted)]">Asking price: <span className="font-bold text-[var(--color-text-main)]">{price.toLocaleString()} {currency}</span></p>
          <div className="mt-4 space-y-3">
            <input type="number" value={offerAmount || ''} onChange={(e) => setOfferAmount(Number(e.target.value))} placeholder="Enter your price" className={cn(inputCls, 'font-mono text-lg')} />
            <div className="flex gap-2">
              {[-10, -5, 0].map((pct) => (
                <button key={pct} type="button" onClick={() => setOfferAmount(Math.round(price * (1 + pct / 100)))} className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] py-2 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition cursor-pointer">
                  {pct === 0 ? 'Full price' : `${pct}%`}
                </button>
              ))}
            </div>
            <textarea value={offerNotes} onChange={(e) => setOfferNotes(e.target.value)} placeholder="Add a note (optional)" rows={2} className={cn(inputCls, 'resize-none')} />
            <Button onClick={() => offerMutation.mutate({ listing: listingId, amount: offerAmount, notes: offerNotes })} disabled={!offerAmount} isLoading={offerMutation.isPending} className="w-full py-3">
              <Send size={16} /> Send my price
            </Button>
          </div>
        </Modal>
      )}

      {/* VISIT MODAL */}
      {visitOpen && (
        <Modal title="Book a visit" onClose={() => setVisitOpen(false)}>
          <div className="space-y-3">
            <input value={visitName} onChange={(e) => setVisitName(e.target.value)} placeholder="Your name" className={inputCls} required />
            <input type="tel" value={visitPhone} onChange={(e) => setVisitPhone(e.target.value)} placeholder="Phone number" className={inputCls} required />
            <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className={inputCls} required />
            <select value={visitSlot} onChange={(e) => setVisitSlot(e.target.value)} className={inputCls}>
              <option value="09:00 - 11:00">Morning (09:00 - 11:00)</option>
              <option value="11:00 - 13:00">Midday (11:00 - 13:00)</option>
              <option value="14:00 - 16:00">Afternoon (14:00 - 16:00)</option>
            </select>
            <Button onClick={() => visitMutation.mutate({ listing_id: listingId, name: visitName, phone: visitPhone, scheduled_date: visitDate, scheduled_time: visitSlot })} disabled={!visitName || !visitPhone || !visitDate} isLoading={visitMutation.isPending} className="w-full py-3">
              <Calendar size={16} /> Request visit
            </Button>
          </div>
        </Modal>
      )}

      {/* INQUIRY MODAL */}
      {inquiryOpen && (
        <Modal title="Message the seller" onClose={() => setInquiryOpen(false)}>
          <form onSubmit={(e) => { e.preventDefault(); inquiryMutation.mutate({ name: inqName, email: inqEmail, phone: inqPhone, message: inqMessage, listing_id: listing.id }); }} className="space-y-3">
            <input value={inqName} onChange={(e) => setInqName(e.target.value)} placeholder="Your name" className={inputCls} required />
            <input type="email" value={inqEmail} onChange={(e) => setInqEmail(e.target.value)} placeholder="Email" className={inputCls} required />
            <input type="tel" value={inqPhone} onChange={(e) => setInqPhone(e.target.value)} placeholder="Phone (optional)" className={inputCls} />
            <textarea value={inqMessage} onChange={(e) => setInqMessage(e.target.value)} placeholder="Write your message..." rows={4} className={cn(inputCls, 'resize-none')} required />
            <Button type="submit" isLoading={inquiryMutation.isPending} className="w-full py-3">
              <Send size={16} /> Send message
            </Button>
          </form>
        </Modal>
      )}

      {/* GUEST SAVE MODAL */}
      {guestOpen && (
        <Modal title="Save this property" onClose={() => setGuestOpen(false)}>
          <form onSubmit={handleGuestSave} className="space-y-3">
            <p className="text-sm text-[var(--color-text-muted)]">Leave your details and we will keep you updated.</p>
            <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your name" className={inputCls} required />
            <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="Phone number" className={inputCls} required />
            <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="Email (optional)" className={inputCls} />
            <Button type="submit" className="w-full py-3"><Heart size={16} /> Save</Button>
          </form>
        </Modal>
      )}

      <PhotoZoomLightbox isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} media={images} initialIndex={activeImage} listingTitle={listing.title} />
    </div>
  );
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--color-text-main)]">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] transition cursor-pointer" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default ListingDetail;

import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  BedDouble,
  Bath,
  Maximize,
  CheckCircle2,
  MessageCircle,
  Calendar,
  Info,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { api } from '../../api/endpoints';
import { useQuery } from '@tanstack/react-query';

interface ListingDetailProps {
  listingId: string;
  onBack: () => void;
}

const ListingDetail: React.FC<ListingDetailProps> = ({ listingId, onBack }) => {
  const [activeMedia, setActiveMedia] = useState(0);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing-detail', listingId],
    queryFn: async () => {
      const response = await api.listings.get(listingId);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070b]">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#05070b] text-white p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Listing not found</h2>
        <Button onClick={onBack}>Return to Discovery</Button>
      </div>
    );
  }

  const media = Array.isArray(listing.media) ? listing.media : [];
  const asset = (listing.asset as any) || {};

  const nextMedia = () => setActiveMedia((prev) => (prev + 1) % media.length);
  const prevMedia = () => setActiveMedia((prev) => (prev - 1 + media.length) % media.length);

  return (
    <div className="min-h-screen bg-[#05070b] text-white selection:bg-emerald-500/30 pb-24">
      {/* 01 CINEMATIC HEADER - GROUNDED SCALE */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium backdrop-blur-md transition-all hover:bg-black/80 border border-white/10"
        >
          <ArrowLeft size={16} /> Back to Discovery
        </button>

        <div className="relative h-full w-full group">
          {media.length > 0 ? (
            <img
              src={media[activeMedia]}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-zinc-900 flex items-center justify-center text-zinc-600">
              No media available
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-transparent to-transparent" />

          {/* Navigation Controls */}
          {media.length > 1 && (
            <>
              <button onClick={prevMedia} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60">
                <ChevronLeft size={24} />
              </button>
              <button onClick={nextMedia} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60">
                <ChevronRight size={24} />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {media.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveMedia(idx)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      activeMedia === idx ? "w-8 bg-emerald-500" : "w-2 bg-white/30 hover:bg-white/50"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 02 THE SHOWROOM CONTENT */}
      <div className="mx-auto max-w-7xl px-6 -mt-20 relative z-10">
        <div className="grid gap-12 lg:grid-cols-3">

          {/* Main Intelligence Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="luxury-card p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                      {listing.verification_level || 'Standard'}
                    </span>
                    {listing.verification_level === 'verified' && (
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <ShieldCheck size={14} className="text-emerald-500" /> Trust-Verified
                      </div>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">{listing.title}</h1>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <MapPin size={16} />
                    <span className="text-sm">{asset.location || listing.location || 'Rwanda'}</span>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-3xl font-bold text-emerald-500">
                    {listing.price?.toLocaleString()} {listing.currency || 'RWF'}
                  </p>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Listed Price</p>
                </div>
              </div>

              <div className="h-px bg-white/10 mb-8" />

              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Info size={18} className="text-emerald-500" /> Asset Intelligence
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  {listing.description || "No detailed description provided for this asset. Please contact the seller for more information."}
                </p>
              </div>
            </div>

            {/* Spatial Specs Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              <SpecCard icon={BedDouble} label="Bedrooms" value={asset.bedrooms || 'N/A'} />
              <SpecCard icon={Bath} label="Bathrooms" value={asset.bathrooms || 'N/A'} />
              <SpecCard icon={Maximize} label="Plot Size" value={asset.plot_size || 'N/A'} />
            </div>

            {/* Trust Evidence Section */}
            <div className="luxury-card p-8 border-emerald-500/10 bg-emerald-500/[0.01]">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500" /> Trust Evidence
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <TrustItem
                  label="Title Deed"
                  status={listing.verification_level === 'verified' ? 'verified' : 'pending'}
                />
                <TrustItem
                  label="Owner Identity"
                  status={listing.verification_level === 'verified' ? 'verified' : 'pending'}
                />
                <TrustItem
                  label="Professional Inspection"
                  status="none"
                />
                <TrustItem
                  label="Zoning Certification"
                  status="none"
                />
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-6">
            <div className="luxury-card p-6 sticky top-24 border-white/10">
              <h3 className="text-lg font-bold mb-6">Secure Connection</h3>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full py-4 text-lg flex items-center justify-center gap-2"
                >
                  <MessageCircle size={20} /> Message Seller
                </Button>
                <Button
                  variant="ghost"
                  className="w-full py-4 flex items-center justify-center gap-2 border-white/10"
                >
                  <Calendar size={20} /> Schedule Visit
                </Button>
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">
                    {listing.owner?.name?.[0] || 'S'}
                  </div>
                  <div>
                    <p className="text-sm font-bold">Verified Seller</p>
                    <p className="text-xs text-zinc-500">Member since 2024</p>
                  </div>
                </div>
                <Button variant="ghost" className="w-full text-xs py-2 text-emerald-400 hover:text-emerald-300">
                  View Seller Profile <ExternalLink size={12} className="ml-1" />
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const SpecCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="luxury-card p-6 flex items-center gap-4">
    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  </div>
);

const TrustItem = ({ label, status }: { label: string, status: 'verified' | 'pending' | 'none' }) => {
  const config = {
    verified: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Verified', bg: 'bg-emerald-500/10' },
    pending: { icon: Info, color: 'text-amber-500', label: 'Pending', bg: 'bg-amber-500/10' },
    none: { icon: Info, color: 'text-zinc-600', label: 'Not Submitted', bg: 'bg-zinc-500/10' },
  };

  const { icon: Icon, color, label: statusLabel, bg } = config[status];

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
      <span className="text-sm text-zinc-400">{label}</span>
      <div className={cn("flex items-center gap-2 px-2 py-1 rounded-lg text-[10px] font-bold uppercase", bg, color)}>
        <Icon size={12} /> {statusLabel}
      </div>
    </div>
  );
};

export default ListingDetail;

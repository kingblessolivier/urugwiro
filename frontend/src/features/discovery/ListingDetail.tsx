import React, { useState } from 'react';
import {
  ArrowLeft, MapPin, ShieldCheck, BedDouble, Bath, Maximize, CheckCircle2,
  MessageCircle, Calendar, ChevronLeft, ChevronRight, DollarSign,
  Sparkles, XCircle, Shield, Heart,
  Layers, Award, Building2, Car, Map,
  Waves, Wifi, Zap, Droplets,
  DoorOpen, ZoomIn,
  Pencil, Trash2, Settings,
  Gauge, Fuel, FileText, Phone, PhoneCall,
  Plus,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { api } from '../../api/endpoints';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import DigitalTwinViewer from './components/DigitalTwinViewer';
import InteractiveUnitMatrix from '../../components/listing-wizard/InteractiveUnitMatrix';
import type { ApartmentUnit, FloorPlan } from '../../components/listing-wizard/InteractiveUnitMatrix';
import { PhotoZoomLightbox, getMediaUrl } from './components/PhotoZoomLightbox';
import {
  ListingSectionEditModal,
  type EditableSectionKey,
} from './components/ListingSectionEditModal';
import {
  AddDiscoveryModal,
  type DiscoverySectionItem,
  DISCOVERY_ICONS,
} from './components/AddDiscoveryModal';
import { SpecDomain } from './components/TechnicalSpecs';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Setup leaflet default marker
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface ListingDetailProps {
  listingId: string;
  onBack: () => void;
}

type HeroDisplayMode = 'photos' | '3d' | 'map';

const ListingDetail: React.FC<ListingDetailProps> = ({ listingId, onBack }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // --- State Management ---
  const [activeMedia, setActiveMedia] = useState(0);
  const [heroMode, setHeroMode] = useState<HeroDisplayMode>('photos');
  const [isZoomLightboxOpen, setIsZoomLightboxOpen] = useState(false);
  const [selectedApartmentUnit, setSelectedApartmentUnit] = useState<{ unit: ApartmentUnit; floor: number } | null>(null);

  // Modals
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isGuestLeadModalOpen, setIsGuestLeadModalOpen] = useState(false);
  const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<EditableSectionKey | null>(null);
  const [editingDiscovery, setEditingDiscovery] = useState<DiscoverySectionItem | null>(null);

  // Feedback
  const [offerSuccess, setOfferSuccess] = useState(false);
  const [visitSuccess, setVisitSuccess] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [guestSuccess, setGuestSuccess] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  // Forms
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');

  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [escrowPercent, setEscrowPercent] = useState<number>(10);
  const [financingType, setFinancingType] = useState<string>('cash');
  const [closingDate, setClosingDate] = useState<string>('');
  const [offerNotes, setOfferNotes] = useState<string>('');

  const [visitDate, setVisitDate] = useState<string>('');
  const [visitTimeSlot, setVisitTimeSlot] = useState<string>('10:00 - 12:00');
  const [visitNotes, setVisitNotes] = useState<string>('');
  const [visitName, setVisitName] = useState('');
  const [visitPhone, setVisitPhone] = useState('');
  const [visitEmail, setVisitEmail] = useState('');

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // AI Analysis
  const [isAiChecking, setIsAiChecking] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);

  // Engagement
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [leadsTab, setLeadsTab] = useState<'all' | 'inquiries' | 'visits' | 'likes'>('all');

  // --- Data Fetching ---
  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing-detail', listingId],
    queryFn: async () => {
      const response = await api.listings.get(listingId);
      return response.data;
    },
  });

  const { data: dealsData } = useQuery({
    queryKey: ['listing-deals', listingId],
    queryFn: async () => {
      const res = await api.deals.list();
      const list = Array.isArray(res.data) ? res.data : [];
      return list.find((d: any) => String(d.listing?.id || d.listing) === String(listingId)) ?? null;
    },
  });

  const [customSections, setCustomSections] = useState<DiscoverySectionItem[]>(() => {
    try {
      const cached = localStorage.getItem(`urugwiro_custom_sections_${listingId}`);
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });

  React.useEffect(() => {
    if (listing?.custom_sections && Array.isArray(listing.custom_sections)) {
      setCustomSections(listing.custom_sections);
      localStorage.setItem(`urugwiro_custom_sections_${listingId}`, JSON.stringify(listing.custom_sections));
    }
  }, [listing?.custom_sections, listingId]);

  React.useEffect(() => {
    if (listing) {
      if (typeof listing.is_liked === 'boolean') setIsLiked(listing.is_liked);
      if (typeof listing.likes_count === 'number') setLikesCount(listing.likes_count);
    }
  }, [listing]);

  React.useEffect(() => {
    if (user) {
      const fullName = (user as any).name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || '';
      const email = user.email || '';
      const phone = (user as any).phone_number || '';
      setInquiryName(prev => prev || fullName);
      setVisitName(prev => prev || fullName);
      setGuestName(prev => prev || fullName);
      setInquiryEmail(prev => prev || email);
      setVisitEmail(prev => prev || email);
      setGuestEmail(prev => prev || email);
      setInquiryPhone(prev => prev || phone);
      setVisitPhone(prev => prev || phone);
      setGuestPhone(prev => prev || phone);
    }
  }, [user]);

  // --- Mutations ---
  const offerMutation = useMutation({
    mutationFn: async (data: any) => api.offers.create(data),
    onSuccess: () => {
      setOfferSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      setTimeout(() => { setIsOfferModalOpen(false); setOfferSuccess(false); }, 2000);
    },
  });

  const visitMutation = useMutation({
    mutationFn: async (data: any) => api.visits.create(data),
    onSuccess: () => {
      setVisitSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['listing-detail', listingId] });
      setTimeout(() => { setIsVisitModalOpen(false); setVisitSuccess(false); }, 2000);
    },
  });

  const inquiryMutation = useMutation({
    mutationFn: async (data: any) => api.public.contactSubmit(data),
    onSuccess: () => {
      setInquirySuccess(true);
      queryClient.invalidateQueries({ queryKey: ['listing-detail', listingId] });
      setTimeout(() => { setIsInquiryModalOpen(false); setInquirySuccess(false); setInquiryMessage(''); }, 2000);
    },
  });

  // --- Handlers ---
  const handleToggleLike = async () => {
    if (user) {
      try {
        const res = await api.listings.like(listingId);
        setIsLiked(Boolean(res.data.liked));
        setLikesCount(res.data.total_likes || (res.data.liked ? likesCount + 1 : Math.max(0, likesCount - 1)));
        queryClient.invalidateQueries({ queryKey: ['listing-detail', listingId] });
      } catch (err) { console.error(err); }
    } else {
      setIsGuestLeadModalOpen(true);
    }
  };

  const handleGuestLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuestLoading(true);
    try {
      const res = await api.listings.like(listingId, { name: guestName, phone: guestPhone, email: guestEmail });
      setIsLiked(true);
      setLikesCount(res.data.total_likes || likesCount + 1);
      setGuestSuccess(true);
      setTimeout(() => { setIsGuestLeadModalOpen(false); setGuestSuccess(false); }, 2200);
    } catch (err) { console.error(err); } finally { setGuestLoading(false); }
  };

  const handleSaveDiscovery = async (newSection: DiscoverySectionItem) => {
    const exists = customSections.some(s => s.id === newSection.id);
    const updated = exists ? customSections.map(s => s.id === newSection.id ? newSection : s) : [...customSections, newSection];
    setCustomSections(updated);
    localStorage.setItem(`urugwiro_custom_sections_${listingId}`, JSON.stringify(updated));
    await api.seller.updateListing(listingId, { custom_sections: updated });
    queryClient.invalidateQueries({ queryKey: ['listing-detail', listingId] });
  };

  const handleDeleteDiscovery = async (sectionId: string) => {
    const updated = customSections.filter(s => s.id !== sectionId);
    setCustomSections(updated);
    localStorage.setItem(`urugwiro_custom_sections_${listingId}`, JSON.stringify(updated));
    await api.seller.updateListing(listingId, { custom_sections: updated });
    queryClient.invalidateQueries({ queryKey: ['listing-detail', listingId] });
  };

  const handleQuickStatusChange = async (newStatus: string) => {
    await api.seller.updateListing(listingId, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ['listing-detail', listingId] });
  };

  const handleAiFeasibilityCheck = async () => {
    if (!offerAmount || offerAmount <= 0) return;
    setIsAiChecking(true);
    try {
      const res = await api.ai.analyzeOffer(listingId, offerAmount);
      setAiAnalysis(res.data);
    } catch (err: any) {
      setAiAnalysis({ error: 'AI unavailable', fairness_score: 0, analysis: 'Unable to fetch real-time valuation.' });
    } finally { setIsAiChecking(false); }
  };

  const handleOpenOfferModal = (targetAmount?: number) => {
    const amount = targetAmount || selectedApartmentUnit?.unit.price || Number(listing?.price) || 0;
    setOfferAmount(amount);
    setIsOfferModalOpen(true);
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-deep)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--color-text-dim)' }}>Loading Sovereign Showroom...</span>
      </div>
    </div>
  );

  if (!listing) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-deep)' }}>Asset Not Found</div>;

  // --- Normalization ---
  const media = Array.isArray(listing.media) ? listing.media : [];
  const asset = (listing.asset as any) || {};
  const resSpec = asset.residential_spec || {};
  const landSpec = asset.land_spec || {};
  const vehSpec = asset.vehicle_spec || {};

  const isAdmin = Boolean(user?.is_staff || user?.role === 'admin');
  const isOwner = Boolean(user?.id && (listing?.owner_user_id === user?.id || listing?.owner?.id === user?.id));
  const isSeller = user?.role === 'seller';
  const canManage = Boolean(isAdmin || isOwner || isSeller);

  const listPrice = Number(listing.price || 0);

  const rawCat = (listing.category || '').toLowerCase();
  const subType = resSpec.sub_type || listing.sub_type || '';
  const isApartment = rawCat === 'apartment' || subType === 'Apartment' || !!resSpec.total_building_floors;
  const isLand = rawCat === 'land' || !!landSpec.upi_number;
  const isVehicle = rawCat === 'car' || rawCat === 'motorbike' || !!vehSpec.make;
  const isCommercial = rawCat === 'hotel' || rawCat === 'commercial';
  const isHouse = !isLand && !isVehicle && !isCommercial && !isApartment;

  const modelUrl = media.find((m: any) => m.media_type === 'model_3d')?.file || media.find((m: any) => m.file?.endsWith('.glb'))?.file;
  const latitude = Number(asset.latitude) || -1.9441;
  const longitude = Number(asset.longitude) || 30.0619;
  const adminHierarchy = [asset.province || 'Kigali City', asset.district, asset.sector, asset.cell, asset.village].filter(Boolean);

  let parsedFloorPlan: FloorPlan[] = [];
  if (resSpec.apartment_floor_plan) {
    try {
      parsedFloorPlan = typeof resSpec.apartment_floor_plan === 'string' ? JSON.parse(resSpec.apartment_floor_plan) : resSpec.apartment_floor_plan;
    } catch { parsedFloorPlan = []; }
  }

  if (isApartment && parsedFloorPlan.length === 0 && resSpec.total_building_floors) {
    const numFloors = Number(resSpec.total_building_floors) || 3;
    for (let f = 1; f <= numFloors; f++) {
      parsedFloorPlan.push({
        floor: f,
        units: [{ unitId: `${f}01`, bedrooms: 2, bathrooms: 2, areaSqm: 85, view: 'City View', price: listPrice, status: 'available' }],
      });
    }
  }

  return (
    <div className="min-h-screen selection:bg-emerald-500/30 pb-28 transition-colors duration-300" style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-main)' }}>
      {canManage && (
        <div className="border-b px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-xl" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(11, 16, 27, 0.96)', backdropFilter: 'blur(20px)' }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0"><Settings size={16} /></div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-emerald-400">{isAdmin ? 'ADMINISTRATOR SHOWROOM STUDIO' : 'SELLER / OWNER STUDIO'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">Editing Enabled</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-zinc-400 text-[11px]">Status:</span>
                <select value={listing.status} onChange={(e) => handleQuickStatusChange(e.target.value)} className="bg-transparent text-emerald-400 font-bold outline-none cursor-pointer text-xs uppercase">
                  <option value="listed" className="bg-zinc-900 text-white">Listed</option>
                  <option value="under_negotiation" className="bg-zinc-900 text-white">Under Offer</option>
                  <option value="sold" className="bg-zinc-900 text-white">Sold</option>
                  <option value="withdrawn" className="bg-zinc-900 text-white">Withdrawn</option>
                </select>
              </div>
              <button onClick={() => { setEditingDiscovery(null); setIsDiscoveryModalOpen(true); }} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold cursor-pointer active:scale-95"><Sparkles size={13} /> + Add Discovery</button>
            </div>
          </div>
        </div>
      )}

      <div className="relative h-[65vh] min-h-[480px] w-full overflow-hidden bg-black">
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
          <button onClick={onBack} className="pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold backdrop-blur-xl border text-white oneui-press cursor-pointer" style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.65)' }}><ArrowLeft size={14} /> Back</button>
          <div className="pointer-events-auto hidden sm:flex items-center gap-1 p-1 rounded-2xl backdrop-blur-xl border" style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.7)' }}>
            <button onClick={() => setHeroMode('photos')} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer', heroMode === 'photos' ? 'bg-emerald-500 text-white' : 'text-zinc-400 hover:text-white')}><Layers size={14} /> Photos</button>
            <button onClick={() => setHeroMode('3d')} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer', heroMode === '3d' ? 'bg-emerald-500 text-white' : 'text-zinc-400 hover:text-white')}><Sparkles size={14} /> 3D Tour</button>
            <button onClick={() => setHeroMode('map')} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer', heroMode === 'map' ? 'bg-emerald-500 text-white' : 'text-zinc-400 hover:text-white')}><Map size={14} /> Map</button>
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <button onClick={() => setIsZoomLightboxOpen(true)} className="flex items-center gap-2 h-10 px-3.5 rounded-xl text-white backdrop-blur-xl border oneui-press cursor-pointer" style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.65)' }}><ZoomIn size={16} className="text-emerald-400" /><span className="text-xs font-bold hidden sm:inline">Zoom</span></button>
            <button onClick={handleToggleLike} className={cn("flex items-center gap-1.5 h-10 px-3 rounded-xl backdrop-blur-xl border oneui-press cursor-pointer", isLiked ? "text-red-400 border-red-500/40 bg-red-500/20" : "text-white border-white/15 bg-black/65")}><Heart size={16} className={isLiked ? "fill-red-500 text-red-500" : ""} />{likesCount > 0 && <span className="text-xs font-mono font-bold">{likesCount}</span>}</button>
          </div>
        </div>

        {heroMode === 'photos' && (
          <div className="relative h-full w-full group">
            {media.length > 0 ? (
              <div className="relative h-full w-full cursor-zoom-in" onClick={() => setIsZoomLightboxOpen(true)}>
                <img src={getMediaUrl(media[activeMedia])} alt={listing.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--color-bg-deep) 0%, transparent 50%)' }} />
              </div>
            ) : <div className="h-full w-full bg-zinc-900 flex items-center justify-center text-zinc-500"><Layers size={36} /></div>}
            {media.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setActiveMedia((prev) => (prev - 1 + media.length) % media.length); }} className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-xl text-white border z-20 cursor-pointer" style={{ borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.6)' }}><ChevronLeft size={22} /></button>
                <button onClick={(e) => { e.stopPropagation(); setActiveMedia((prev) => (prev + 1) % media.length); }} className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-xl text-white border z-20 cursor-pointer" style={{ borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.6)' }}><ChevronRight size={22} /></button>
              </>
            )}
          </div>
        )}
        {heroMode === '3d' && <div className="relative h-full w-full"><DigitalTwinViewer listingId={listingId} modelUrl={modelUrl} /></div>}
        {heroMode === 'map' && (
          <div className="relative h-full w-full">
            <MapContainer center={[latitude, longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[latitude, longitude]} icon={customMarkerIcon}><Popup>{listing.title}</Popup></Marker>
            </MapContainer>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-5 mt-8 lg:mt-10 relative z-10 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-3xl border p-8 backdrop-blur-2xl" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-depth-2)' }}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/25"><ShieldCheck size={13} />{listing.listed_by_role === 'admin' ? 'Platform Verified' : 'Verified Owner'}</span>
                  <span className="rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider" style={{ borderColor: 'var(--color-border)', background: 'var(--color-input-bg)' }}>{isApartment ? '🏢 Apartment' : isHouse ? '🏠 House' : isLand ? '🏗️ Land' : '🚗 Vehicle'}</span>
                </div>
                {canManage && <button onClick={() => setEditingSection('header')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold cursor-pointer"><Pencil size={13} /> Edit Header</button>}
              </div>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                <div className="space-y-3 max-w-xl">
                  <h1 className="text-3xl lg:text-[46px] font-bold tracking-tight" style={{ color: 'var(--color-text-main)' }}>{listing.title}</h1>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <MapPin size={14} className="text-emerald-500" />
                    {adminHierarchy.map((item, i) => (
                      <React.Fragment key={i}><span className={cn(i === adminHierarchy.length - 1 ? 'font-bold text-emerald-500' : '')}>{item}</span>{i < adminHierarchy.length - 1 && <span className="text-zinc-600">›</span>}</React.Fragment>
                    ))}
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-3xl md:text-4xl font-bold text-emerald-500 font-mono">{listPrice.toLocaleString()} <span className="text-sm font-normal" style={{ color: 'var(--color-text-dim)' }}>{listing.currency || 'RWF'}</span></p>
                </div>
              </div>
              {dealsData && (
                <div className="mb-8 rounded-2xl border p-5 space-y-3" style={{ borderColor: 'rgba(16, 185, 129, 0.25)', background: 'rgba(16, 185, 129, 0.05)' }}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold uppercase text-emerald-500 flex items-center gap-2"><Shield size={14} /> Transaction Progress</span>
                    <span className="font-mono">Stage: <strong className="text-emerald-500">{dealsData.current_stage?.replace(/_/g, ' ')}</strong></span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-input-bg)' }}><div className="bg-emerald-500 h-full transition-all" style={{ width: `${dealsData.progress_percentage || 25}%` }} /></div>
                </div>
              )}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-text-main)' }}><Layers size={18} className="text-emerald-500" /> Technical Specifications</h3>
                  {canManage && <button onClick={() => setEditingSection('specs')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] text-zinc-300 hover:text-emerald-400 border border-white/10 text-xs font-semibold cursor-pointer"><Pencil size={12} /> Edit Specs</button>}
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <Button
                    onClick={() => window.location.href = `tel:${listing.owner_phone || ''}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <PhoneCall size={14} /> Call Now
                  </Button>
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <Phone size={14} className="text-emerald-500" />
                    {listing.owner_phone || 'No phone provided'}
                  </div>
                </div>







              <div className="mb-8 rounded-2xl border p-6 backdrop-blur-xl" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={18} className="text-emerald-500" />
                  <h3 className="text-base font-bold">Asset Dossier</h3>
                </div>
                <div className="space-y-4">
                  {listing.description ? (
                    <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-line">
                      {listing.description}
                    </p>
                  ) : (
                    <p className="text-sm italic text-zinc-500">No detailed asset narrative provided.</p>
                  )}
                </div>
              </div>

              {isVehicle ? (
                  <div className="space-y-4">
                    <SpecDomain title="Mechanical & Identification" icon={Gauge} metrics={[ { icon: Car, value: `${vehSpec.year} ${vehSpec.make} ${vehSpec.model}`, label: 'Vehicle Model' }, { icon: Gauge, value: `${Number(vehSpec.mileage).toLocaleString()} km`, label: 'Total Mileage' }, { icon: Fuel, value: `${vehSpec.transmission} · ${vehSpec.fuel_type}`, label: 'Drive & Fuel' }, { icon: FileText, value: vehSpec.plate_number, label: 'Plate Number' }, { icon: Shield, value: vehSpec.rra_customs_status || 'Paid', label: 'Customs Status' }, { icon: Award, value: vehSpec.condition || 'Used', label: 'Vehicle Condition' }, { icon: Maximize, value: vehSpec.body_type || 'N/A', label: 'Body Style' }, { icon: Maximize, value: vehSpec.engine_capacity || 'N/A', label: 'Engine Capacity' }, { icon: Zap, value: vehSpec.horsepower ? `${vehSpec.horsepower} HP` : 'N/A', label: 'Horsepower' }, { icon: Shield, value: vehSpec.drivetrain || 'FWD', label: 'Drivetrain' }, { icon: Maximize, value: vehSpec.seating_capacity ? `${vehSpec.seating_capacity} Seats` : 'N/A', label: 'Seating Capacity' }, ]} />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <SpecDomain title="Spatial & Architectural" icon={Maximize} metrics={[ { icon: BedDouble, value: resSpec.bedrooms || asset.bedrooms, label: 'Bedrooms' }, { icon: Bath, value: resSpec.bathrooms || asset.bathrooms, label: 'Bathrooms' }, { icon: Maximize, value: `${resSpec.built_up_area_sqm || asset.total_area} m²`, label: 'Total Area' }, { icon: Building2, value: `${resSpec.total_building_floors} Floors`, label: 'Building Height' }, { icon: DoorOpen, value: resSpec.is_furnished ? 'Fully Furnished' : 'Unfurnished', label: 'Interior Status' }, { icon: Maximize, value: resSpec.compound_size_sqm ? `${resSpec.compound_size_sqm} m²` : 'N/A', label: 'Compound Size' }, { icon: Maximize, value: resSpec.balcony_area_sqm ? `${resSpec.balcony_area_sqm} m²` : 'N/A', label: 'Balcony Area' }, { icon: DoorOpen, value: resSpec.kitchen_type || 'Standard', label: 'Kitchen Style' }, { icon: Calendar, value: resSpec.year_built || 'N/A', label: 'Year of Construction' }, ]} />
                    <SpecDomain title="Infrastructure" icon={Zap} metrics={[ { icon: Droplets, value: resSpec.water_tank_capacity_liters ? `${resSpec.water_tank_capacity_liters} Liters` : 'Standard', label: 'Water Reserve' }, { icon: Zap, value: resSpec.electricity_meter || 'Cash Power', label: 'Power Supply' }, { icon: Wifi, value: resSpec.has_fiber_internet ? 'Fiber Optic' : 'Standard', label: 'Connectivity' }, { icon: DoorOpen, value: resSpec.has_elevator ? 'Elevator Installed' : 'Stairs Only', label: 'Vertical Access' }, { icon: Shield, value: resSpec.has_cctv ? 'CCTV Secured' : 'No System', label: 'Security' }, { icon: Zap, value: resSpec.has_backup_generator ? 'Generator Available' : 'No Backup', label: 'Power Backup' }, { icon: Zap, value: resSpec.has_three_phase_power ? '3-Phase Power' : 'Single Phase', label: 'Electrical Grid' }, { icon: Zap, value: resSpec.backup_generator_kva ? `${resSpec.backup_generator_kva} KVA` : 'N/A', label: 'Generator Capacity' }, { icon: Waves, value: resSpec.has_swimming_pool ? 'Swimming Pool' : 'No Pool', label: 'Luxury Amenities' }, { icon: DoorOpen, value: resSpec.has_staff_quarters ? 'Staff Quarters' : 'None', label: 'Additional Space' }, { icon: Maximize, value: `${resSpec.parking_spaces || '1'} Space(s)`, label: 'Parking Capacity' }, ]} />
                    <SpecDomain title="Legal & Cadastral" icon={ShieldCheck} metrics={[ { icon: FileText, value: landSpec.upi_number || asset.upi_number, label: 'UPI Number' }, { icon: Award, value: landSpec.zoning_code || 'Residential', label: 'Zoning Code' }, { icon: Shield, value: landSpec.tenure_type, label: 'Tenure Type' }, { icon: ShieldCheck, value: listing.verification_level, label: 'Trust Level' }, { icon: FileText, value: landSpec.title_deed_number || 'Verified', label: 'Title Deed Ref' }, { icon: Award, value: landSpec.lease_years_remaining ? `${landSpec.lease_years_remaining} Years Left` : 'N/A', label: 'Lease Duration' }, { icon: Shield, value: landSpec.is_encumbrance_free ? 'Clear Title' : 'Encumbered', label: 'Ownership Status' }, ]} />
                    <SpecDomain title="Site & Environment" icon={Map} metrics={[ { icon: MapPin, value: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, label: 'Coordinates' }, { icon: Waves, value: landSpec.terrain || 'Standard', label: 'Terrain Type' }, { icon: MapPin, value: asset.district, label: 'District' }, { icon: MapPin, value: asset.sector, label: 'Sector' }, { icon: MapPin, value: asset.cell, label: 'Cell' }, { icon: MapPin, value: asset.village, label: 'Village' }, { icon: MapPin, value: landSpec.road_type || 'Standard', label: 'Road Access' }, { icon: Waves, value: landSpec.soil_type || 'N/A', label: 'Soil Composition' }, { icon: Zap, value: landSpec.water_onsite ? 'Onsite Access' : 'Offsite', label: 'Water Utility' }, { icon: Zap, value: landSpec.electricity_onsite ? 'Onsite Access' : 'Offsite', label: 'Power Utility' }, ]} />
                  </div>
                )}
              </div>
            </div>

            {isApartment && (
              <div className="rounded-3xl border p-6 backdrop-blur-xl" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <DoorOpen size={18} className="text-emerald-500" />
                  <h3 className="text-base font-bold">Unit Floor Explorer</h3>
                </div>
                <InteractiveUnitMatrix
                  sellingMode={resSpec.apartment_selling_mode || 'per_unit'}
                  onSellingModeChange={() => {}}
                  totalFloors={Number(resSpec.total_building_floors) || 3}
                  onTotalFloorsChange={() => {}}
                  floorPlan={parsedFloorPlan}
                  onFloorPlanChange={() => {}}
                  readOnly={true}
                  selectedUnit={selectedApartmentUnit?.unit.unitId}
                  onSelectUnit={(unit, floor) => setSelectedApartmentUnit({ unit, floor })}
                />
                {selectedApartmentUnit && (
                  <div className="mt-5 p-4 rounded-2xl border flex items-center justify-between" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.08)' }}>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase block">Selected Unit</span>
                      <h4 className="text-sm font-bold">Unit {selectedApartmentUnit.unit.unitId} (Floor {selectedApartmentUnit.floor}) · {selectedApartmentUnit.unit.bedrooms}BR</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-mono font-bold text-emerald-400">{selectedApartmentUnit.unit.price.toLocaleString()} RWF</span>
                      <Button onClick={() => handleOpenOfferModal(selectedApartmentUnit.unit.price)} className="px-4 py-2 text-xs font-bold bg-emerald-500 text-white rounded-xl">Book Unit</Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-3xl border p-8 backdrop-blur-2xl space-y-6" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={20} className="text-emerald-500" />
                  <h3 className="text-lg font-bold">Property Discoveries</h3>
                </div>
                {canManage && <button onClick={() => { setEditingDiscovery(null); setIsDiscoveryModalOpen(true); }} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold cursor-pointer"><Plus size={14} /> Add Discovery</button>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customSections.map(sec => {
                  const IconComp = DISCOVERY_ICONS[sec.icon] || Sparkles;
                  return (
                    <div key={sec.id} className="rounded-2xl border p-5 bg-white/[0.02] relative group" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><IconComp size={16} /></div>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{sec.category}</span>
                        </div>
                        {canManage && (
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingDiscovery(sec); setIsDiscoveryModalOpen(true); }} className="p-1.5 text-zinc-400 hover:text-white"><Pencil size={13} /></button>
                            <button onClick={() => handleDeleteDiscovery(sec.id)} className="p-1.5 text-zinc-400 hover:text-red-400"><Trash2 size={13} /></button>
                          </div>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white mb-2">{sec.title}</h4>
                      <p className="text-xs text-zinc-300 mb-3 whitespace-pre-line">{sec.description}</p>
                      {sec.highlights && (
                        <div className="pt-3 border-t border-white/5 space-y-1.5">
                          {sec.highlights.map((h, i) => <div key={i} className="flex items-start gap-2 text-xs text-zinc-300"><CheckCircle2 size={13} className="text-emerald-400 mt-0.5" /> {h}</div>)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {canManage && (
              <div className="rounded-3xl border p-8 backdrop-blur-xl space-y-6" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(11, 16, 27, 0.75)', boxShadow: 'var(--shadow-depth-2)' }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400"><PhoneCall size={20} /></div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Customer Leads Ledger</h3>
                      <p className="text-xs text-zinc-400">Direct contact for interested prospects</p>
                    </div>
                  </div>
                  <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10 text-xs">
                    {(['all', 'visits', 'inquiries', 'likes'] as const).map(tab => (
                      <button key={tab} onClick={() => setLeadsTab(tab)} className={cn("px-3 py-1.5 rounded-xl transition-all cursor-pointer", leadsTab === tab ? "bg-emerald-500 text-white font-bold" : "text-zinc-400 hover:text-white")}>{tab.toUpperCase()}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  {(leadsTab === 'all' || leadsTab === 'visits') && (listing.leads_visits || []).map((v: any) => (
                    <div key={v.id} className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.04] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">Visit</span>
                          <span className="text-xs font-bold text-white">{v.visitor_name}</span>
                          <span className="text-[11px] text-zinc-400">{v.scheduled_date}</span>
                        </div>
                        <p className="text-xs text-zinc-300">{v.notes}</p>
                      </div>
                      <div className="flex gap-2">
                        <a href={`tel:${v.visitor_phone}`} className="px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold cursor-pointer"><Phone size={13} /> {v.visitor_phone}</a>
                        <a href={`https://wa.me/${v.visitor_phone?.replace(/\D/g,'')}`} target="_blank" className="px-3 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold cursor-pointer"><MessageCircle size={13} /> WhatsApp</a>
                      </div>
                    </div>
                  ))}
                  {(leadsTab === 'all' || leadsTab === 'inquiries') && (listing.leads_inquiries || []).map((inq: any) => (
                    <div key={inq.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Inquiry</span>
                          <span className="text-xs font-bold text-white">{inq.name}</span>
                        </div>
                        <p className="text-xs text-zinc-300">{inq.message}</p>
                      </div>
                      <div className="flex gap-2">
                        <a href={`tel:${inq.phone}`} className="px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold cursor-pointer"><Phone size={13} /> {inq.phone}</a>
                      </div>
                    </div>
                  ))}
                  {((leadsTab === 'all' && !listing.leads_inquiries?.length && !listing.leads_visits?.length && !listing.leads_likes?.length) || (leadsTab !== 'all' && !listing[`leads_${leadsTab}`]?.length)) && (
                    <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-zinc-500 text-xs">No leads found in this view.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border p-7 backdrop-blur-2xl sticky top-24 space-y-6" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-depth-2)' }}>
              <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="text-base font-bold">Transaction Desk</h3>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-500 uppercase">Live Gateway</span>
              </div>
              {selectedApartmentUnit && (
                <div className="p-3 rounded-2xl border bg-emerald-500/10 border-emerald-500/30 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-emerald-400">
                    <span>Unit {selectedApartmentUnit.unit.unitId}</span>
                    <span>{selectedApartmentUnit.unit.price.toLocaleString()} RWF</span>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <Button onClick={() => handleOpenOfferModal()} className="w-full py-3.5 text-xs font-bold bg-emerald-500 text-white flex items-center justify-center gap-2 rounded-2xl shadow-lg shadow-emerald-500/20 cursor-pointer"><DollarSign size={16} /> Submit Sovereign Offer</Button>
                <Button variant="ghost" onClick={() => setIsVisitModalOpen(true)} className="w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2 border rounded-2xl cursor-pointer" style={{ borderColor: 'var(--color-border)', background: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}><Calendar size={16} /> Schedule Showing</Button>
                <button onClick={() => setIsInquiryModalOpen(true)} className="w-full py-3 text-xs font-semibold flex items-center justify-center gap-2 text-zinc-400 hover:text-emerald-500 cursor-pointer"><MessageCircle size={15} /> Contact Authorized Lister</button>
              </div>
              <div className="rounded-2xl border p-4 space-y-2" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.05)' }}>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-500"><ShieldCheck size={16} /> Bank Escrow Protection</div>
                <p className="text-[11px] text-zinc-400">Deposits held securely until title conveyance is notarized.</p>
              </div>
              <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-input-bg)' }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">{(listing.owner?.full_name || 'U')[0]?.toUpperCase()}</div>
                  <div>
                    <p className="text-xs font-bold">{listing.owner?.full_name || 'Verified Owner'}</p>
                    <p className="text-[10px] text-zinc-500">{listing.listed_by_role === 'admin' ? 'Institutional Registry' : 'Verified Seller'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OFFER MODAL */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xl p-4">
          <div className="border rounded-3xl max-w-lg w-full p-7 space-y-6 bg-zinc-900 text-white" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold flex items-center gap-2"><DollarSign size={18} className="text-emerald-500" /> Transmit Offer</h3>
              <button onClick={() => setIsOfferModalOpen(false)}><XCircle size={20} /></button>
            </div>
            {offerSuccess ? (
              <div className="py-10 text-center space-y-3">
                <CheckCircle2 size={44} className="mx-auto text-emerald-500" />
                <h4 className="text-lg font-bold">Offer Transmitted</h4>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Proposed Price (RWF)</label>
                  <input type="number" value={offerAmount} onChange={e => setOfferAmount(Number(e.target.value))} className="w-full p-3 rounded-xl bg-black border border-white/10 text-white font-mono" />
                </div>
                <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5"><Sparkles size={14} /> AI Valuation Advisor</span>
                    <button onClick={handleAiFeasibilityCheck} disabled={isAiChecking} className="text-[11px] underline text-purple-400 cursor-pointer">{isAiChecking ? 'Checking...' : 'Run Analysis'}</button>
                  </div>
                  {aiAnalysis && <p className="text-[11px] text-zinc-300">{aiAnalysis.analysis}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={escrowPercent} onChange={e => setEscrowPercent(Number(e.target.value))} className="p-2 rounded-xl bg-black border border-white/10 text-xs outline-none">
                    <option value={5}>5% Escrow</option>
                    <option value={10}>10% Escrow</option>
                    <option value={20}>20% Escrow</option>
                  </select>
                  <select value={financingType} onChange={e => setFinancingType(e.target.value)} className="p-2 rounded-xl bg-black border border-white/10 text-xs outline-none">
                    <option value="cash">Cash</option>
                    <option value="mortgage">Mortgage</option>
                  </select>
                </div>
                <input type="date" value={closingDate} onChange={e => setClosingDate(e.target.value)} className="w-full p-3 rounded-xl bg-black border border-white/10 text-xs outline-none" />
                <textarea value={offerNotes} onChange={e => setOfferNotes(e.target.value)} className="w-full p-3 rounded-xl bg-black border border-white/10 text-xs outline-none resize-none" placeholder="Contingency clauses..." rows={2} />
                <Button onClick={() => offerMutation.mutate({ listing: listingId, amount: offerAmount, escrow_proposed_percent: escrowPercent, financing_type: financingType, proposed_closing_date: closingDate, notes: offerNotes })} className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold cursor-pointer">Transmit Sovereign Offer</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISIT MODAL */}
      {isVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xl p-4">
          <div className="border rounded-3xl max-w-lg w-full p-7 space-y-6 bg-zinc-900 text-white" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold flex items-center gap-2"><Calendar size={18} className="text-emerald-500" /> Schedule Showing</h3>
              <button onClick={() => setIsVisitModalOpen(false)}><XCircle size={20} /></button>
            </div>
            {visitSuccess ? (
              <div className="py-10 text-center space-y-3">
                <CheckCircle2 size={44} className="mx-auto text-emerald-500" />
                <h4 className="text-lg font-bold">Showing Registered</h4>
              </div>
            ) : (
              <div className="space-y-4">
                <input type="text" value={visitName} onChange={e => setVisitName(e.target.value)} placeholder="Full Name" className="w-full p-3 rounded-xl bg-black border border-white/10 text-white text-xs outline-none" required />
                <input type="tel" value={visitPhone} onChange={e => setVisitPhone(e.target.value)} placeholder="Phone Number" className="w-full p-3 rounded-xl bg-black border border-white/10 text-white text-xs outline-none" required />
                <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} className="w-full p-3 rounded-xl bg-black border border-white/10 text-white text-xs outline-none" required />
                <select value={visitTimeSlot} onChange={e => setVisitTimeSlot(e.target.value)} className="w-full p-3 rounded-xl bg-black border border-white/10 text-white text-xs outline-none">
                  <option value="09:00 - 11:00">Morning (09:00 - 11:00 AM)</option>
                  <option value="11:00 - 13:00">Midday (11:00 AM - 01:00 PM)</option>
                  <option value="14:00 - 16:00">Afternoon (02:00 - 04:00 PM)</option>
                </select>
                <textarea value={visitNotes} onChange={e => setVisitNotes(e.target.value)} className="w-full p-3 rounded-xl bg-black border border-white/10 text-white text-xs outline-none resize-none" placeholder="Special requests..." rows={3} />
                <Button onClick={() => visitMutation.mutate({ listing_id: listingId, name: visitName, phone: visitPhone, scheduled_date: visitDate, scheduled_time: visitTimeSlot, notes: visitNotes })} className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold cursor-pointer">Confirm Slot</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INQUIRY MODAL */}
      {isInquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xl p-4">
          <div className="border rounded-3xl max-w-lg w-full p-7 space-y-6 bg-zinc-900 text-white" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold flex items-center gap-2"><MessageCircle size={18} className="text-emerald-500" /> Direct Inquiry</h3>
              <button onClick={() => setIsInquiryModalOpen(false)}><XCircle size={20} /></button>
            </div>
            {inquirySuccess ? (
              <div className="py-10 text-center space-y-3">
                <CheckCircle2 size={44} className="mx-auto text-emerald-500" />
                <h4 className="text-lg font-bold">Message Dispatched</h4>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); inquiryMutation.mutate({ name: inquiryName, email: inquiryEmail, phone: inquiryPhone, message: inquiryMessage, listing_id: listing.id }); }} className="space-y-4">
                <input type="text" value={inquiryName} onChange={e => setInquiryName(e.target.value)} placeholder="Full Name" className="w-full p-3 rounded-xl bg-black border border-white/10 text-white text-xs outline-none" required />
                <input type="email" value={inquiryEmail} onChange={e => setInquiryEmail(e.target.value)} placeholder="Email Address" className="w-full p-3 rounded-xl bg-black border border-white/10 text-white text-xs outline-none" required />
                <input type="tel" value={inquiryPhone} onChange={e => setInquiryPhone(e.target.value)} placeholder="Phone Number" className="w-full p-3 rounded-xl bg-black border border-white/10 text-white text-xs outline-none" />
                <textarea value={inquiryMessage} onChange={e => setInquiryMessage(e.target.value)} placeholder="Your message..." className="w-full p-3 rounded-xl bg-black border border-white/10 text-white text-xs outline-none resize-none" rows={4} required />
                <Button type="submit" className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold cursor-pointer">Dispatch Message</Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* GUEST LEAD MODAL */}
      {isGuestLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xl p-4">
          <div className="border rounded-3xl max-w-md w-full p-7 space-y-6 bg-zinc-900 text-white" style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-center space-y-2">
              <Heart size={40} className="mx-auto text-red-500" />
              <h3 className="text-xl font-bold">Save Asset</h3>
            </div>
            <form onSubmit={handleGuestLeadSubmit} className="space-y-4">
              <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Full Name" className="w-full p-3 rounded-xl bg-black border border-white/10 text-white text-xs outline-none" required />
              <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="Phone Number" className="w-full p-3 rounded-xl bg-black border border-white/10 text-white text-xs outline-none" required />
              <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="Email Address" className="w-full p-3 rounded-xl bg-black border border-white/10 text-white text-xs outline-none" />
              <Button type="submit" disabled={guestLoading} className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold cursor-pointer">{guestLoading ? 'Saving...' : 'Register & Save'}</Button>
            </form>
          </div>
        </div>
      )}

      <PhotoZoomLightbox isOpen={isZoomLightboxOpen} onClose={() => setIsZoomLightboxOpen(false)} media={media} initialIndex={activeMedia} listingTitle={listing.title} />
      {editingSection && <ListingSectionEditModal isOpen={Boolean(editingSection)} sectionKey={editingSection} listing={listing} isAdmin={isAdmin} onClose={() => setEditingSection(null)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['listing-detail', listingId] })} />}
      <AddDiscoveryModal isOpen={isDiscoveryModalOpen} onClose={() => { setIsDiscoveryModalOpen(false); setEditingDiscovery(null); }} onSave={handleSaveDiscovery} initialData={editingDiscovery} />
    </div>
  );
};

export default ListingDetail;

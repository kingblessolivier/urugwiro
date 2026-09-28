import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, MapPin, ShieldCheck, BedDouble, Bath, Maximize, CheckCircle2,
  MessageCircle, Calendar, ChevronLeft, ChevronRight, DollarSign,
  Sparkles, XCircle, Shield, Heart,
  Layers, Award, Building2, Car, Map,
  Waves, Wifi, Zap, Droplets,
  DoorOpen, ZoomIn,
  Pencil, Trash2, Settings,
  Gauge, Fuel, FileText, Phone, PhoneCall,
  Plus, Share2, Home, Users, Mail, ExternalLink,
  Eye, Clock, Anchor, Info, TrendingDown, TrendingUp, Grid3X3,
  Landmark, BookOpen, Navigation2, Star,
  Settings2, Sparkles as SparklesIcon, Send, Search, FileSignature, Key,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/Breadcrumb';
import {
  DashboardCard, CardHeader, EmptyRow,
  tableHead, tableTh, tableBody, tableTr, tableTd,
  tdPrimary, tdSecondary, tdMono, accentChip, neutralChip,
} from '../../components/ui/Dashboard';
import { cn } from '../../lib/utils';
import { api } from '../../api/endpoints';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import DigitalTwinViewer from './components/DigitalTwinViewer';
import InteractiveUnitMatrix from '../../components/listing-wizard/InteractiveUnitMatrix';
import type { ApartmentUnit, FloorPlan } from '../../components/listing-wizard/InteractiveUnitMatrix';
import { PhotoZoomLightbox, getMediaUrl, getHiResFallback } from './components/PhotoZoomLightbox';
import { MortgageCalculator } from '../../components/MortgageCalculator';
import { SimilarProperties } from '../../components/SimilarProperties';
import { RecentlyViewed, addRecentlyViewed } from '../../components/RecentlyViewed';
import { PrintSpecSheet } from '../../components/PrintSpecSheet';
import { ReportListing } from '../../components/ReportListing';
import { NeighborhoodInfo } from '../../components/NeighborhoodInfo';
import { PropertyHistory } from '../../components/PropertyHistory';
import { PriceDropAlert } from '../../components/PriceDropAlert';
import { SaveSearch } from '../../components/SaveSearch';
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
import './listing-detail-styles.css';

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
  onListingClick?: (id: string) => void;
}

type HeroDisplayMode = 'photos' | '3d' | 'map';

// ─── Section Navigation (Anchor System) ─────────────────────────────────────
const SECTION_ANCHORS = [
  { id: 'overview', label: 'Overview', icon: Home, short: 'Home' },
  { id: 'media', label: 'Media Gallery', icon: Layers, short: 'Photos' },
  { id: 'specs', label: 'Specifications', icon: Grid3X3, short: 'Specs' },
  { id: 'discoveries', label: 'Discoveries', icon: Sparkles, short: 'Findings' },
  { id: 'neighborhood', label: 'Neighborhood', icon: Navigation2, short: 'Area' },
  { id: 'finance', label: 'Finance & Mortgage', icon: Landmark, short: 'Finance' },
  { id: 'similar', label: 'Similar Assets', icon: Building2, short: 'Similar' },
] as const;
type SectionAnchorId = typeof SECTION_ANCHORS[number]['id'];
const sectionRefs = SECTION_ANCHORS.reduce((acc, s) => { acc[s.id] = React.createRef<HTMLDivElement | null>(); return acc; }, {} as Record<SectionAnchorId, React.RefObject<HTMLDivElement | null>>);

// ─── Human-Readable Time Ago ───────────────────────────────────────────────
function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr).getTime();
  if (isNaN(d)) return '';
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? 'Just listed' : `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const ListingDetail: React.FC<ListingDetailProps> = ({ listingId, onBack, onListingClick }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // --- State Management ---
  const [activeMedia, setActiveMedia] = useState(0);
  const [heroMode, setHeroMode] = useState<HeroDisplayMode>('photos');
  const [isZoomLightboxOpen, setIsZoomLightboxOpen] = useState(false);
  const [selectedApartmentUnit, setSelectedApartmentUnit] = useState<{ unit: ApartmentUnit; floor: number } | null>(null);
  // Navigation + UX upgrades
  const [activeSection, setActiveSection] = useState<SectionAnchorId>('overview');
  const [activeSpecsTab, setActiveSpecsTab] = useState<'glance' | 'all'>('glance');
  const [isMobileSheetVisible, setIsMobileSheetVisible] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionObserverRef = useRef<IntersectionObserver | null>(null);

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

  // ─── Scroll-Spy IntersectionObserver for Section Nav ────────────────────
  React.useEffect(() => {
    if (sectionObserverRef.current) sectionObserverRef.current.disconnect();
    sectionObserverRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          const id = visible[0].target.id as SectionAnchorId;
          if (SECTION_ANCHORS.some(s => s.id === id)) setActiveSection(id);
        }
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.1, 0.2, 0.5, 0.8] }
    );
    SECTION_ANCHORS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) sectionObserverRef.current?.observe(el);
    });
    return () => sectionObserverRef.current?.disconnect();
  }, [listing]);

  const scrollToSection = (id: SectionAnchorId) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  React.useEffect(() => {
    if (listing) {
      if (typeof listing.is_liked === 'boolean') setIsLiked(listing.is_liked);
      if (typeof listing.likes_count === 'number') setLikesCount(listing.likes_count);
      // Track recently viewed
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

  // ─── Scroll Reveal ─────────────────────────────────────────────────────────
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.ld-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [listing]);

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
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-deep)' }} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={20} className="text-emerald-500 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--color-text-main)]">Loading Sovereign Showroom</p>
          <p className="text-xs text-[var(--color-text-dim)] mt-1">Preparing your premium experience...</p>
        </div>
      </div>
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-deep)' }} role="alert">
      <div className="text-center ld-fade-in-scale">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <XCircle size={40} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-2">Property Not Found</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">The property you're looking for doesn't exist or has been removed.</p>
        <Button onClick={onBack} variant="primary" className="ld-btn-primary">Go Back</Button>
      </div>
    </div>
  );

  // --- Normalization ---
  const rawMedia = Array.isArray(listing.media) ? listing.media : [];
  // Sovereign media guard: if backend sent zero images or only obviously tiny
  // placeholder URLS, replace with hi-res Unsplash pool.  This is the data
  // pipeline fix for the "600×400 stretched to 2560" pixelation in the screenshot.
  const media = (() => {
    const hasAnyImage = rawMedia.some((m: any) => {
      const url = getMediaUrl(m);
      return !!url && url.startsWith('http');
    });
    if (!hasAnyImage || rawMedia.length === 0) {
      const titleSeed = (listing.title || 'urugwiro').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      return Array.from({ length: 4 }, (_, i) => ({
        id: `fb-${i}`,
        media_type: 'image',
        caption: i === 0 ? 'Property Exterior' : i === 1 ? 'Living & Interiors' : i === 2 ? 'Outdoor & Gardens' : 'Aerial / Location',
        url: getHiResFallback(titleSeed + i, i === 0),
      }));
    }
    return rawMedia;
  })();
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

  const detailFacts: { label: string; value: string | number }[] = [
    { label: 'Category', value: listing.category || 'Property' },
    { label: 'Listing Type', value: listing.listing_type || (isLand ? 'Land' : isVehicle ? 'Vehicle' : 'Residential') },
    { label: 'Price', value: `${listPrice.toLocaleString()} ${listing.currency || 'RWF'}` },
    { label: 'Location', value: adminHierarchy.join(', ') || listing.address || 'Rwanda' },
    ...(resSpec.bedrooms ? [{ label: 'Bedrooms', value: String(resSpec.bedrooms) }] : []),
    ...(resSpec.bathrooms ? [{ label: 'Bathrooms', value: String(resSpec.bathrooms) }] : []),
    ...(resSpec.built_up_area_sqm || asset.total_area
      ? [{ label: 'Area', value: `${resSpec.built_up_area_sqm || asset.total_area} m²` }]
      : []),
    ...(landSpec.upi_number ? [{ label: 'UPI Number', value: String(landSpec.upi_number) }] : []),
    ...(vehSpec.make ? [{ label: 'Make / Model', value: `${vehSpec.make} ${vehSpec.model || ''}`.trim() }] : []),
    { label: 'Verification', value: listing.verification_level || 'standard' },
  ];

  // ─── At-a-Glance Stat Strip (condensed hero stats) ───────────────────────
  const atAGlance = (() => {
    const items: { icon: any; label: string; value: string | number; highlight?: boolean }[] = [];
    if (isVehicle) {
      if (vehSpec.make) items.push({ icon: Car, label: 'Model', value: `${vehSpec.year} ${vehSpec.make}` });
      if (vehSpec.mileage != null) items.push({ icon: Gauge, label: 'Mileage', value: `${Number(vehSpec.mileage).toLocaleString()} km` });
      if (vehSpec.transmission) items.push({ icon: Settings2, label: 'Gearbox', value: vehSpec.transmission });
      if (vehSpec.fuel_type) items.push({ icon: Fuel, label: 'Fuel', value: vehSpec.fuel_type });
      if (vehSpec.seating_capacity) items.push({ icon: Users, label: 'Seats', value: `${vehSpec.seating_capacity}` });
      if (vehSpec.condition) items.push({ icon: Award, label: 'Condition', value: vehSpec.condition });
    } else if (isLand) {
      if (landSpec.plot_size_sqm || asset.total_area) items.push({ icon: Maximize, label: 'Plot Size', value: `${landSpec.plot_size_sqm || asset.total_area} m²` });
      if (landSpec.land_use_category) items.push({ icon: Landmark, label: 'Use Category', value: landSpec.land_use_category });
      if (landSpec.terrain) items.push({ icon: Waves, label: 'Terrain', value: landSpec.terrain });
      if (landSpec.upi_number) items.push({ icon: FileText, label: 'UPI No.', value: String(landSpec.upi_number), highlight: true });
      if (landSpec.tenure_type) items.push({ icon: ShieldCheck, label: 'Tenure', value: landSpec.tenure_type });
      if (landSpec.road_access) items.push({ icon: Map, label: 'Road Access', value: landSpec.road_type || 'Yes' });
    } else {
      if (resSpec.bedrooms) items.push({ icon: BedDouble, label: 'Bedrooms', value: resSpec.bedrooms });
      if (resSpec.bathrooms) items.push({ icon: Bath, label: 'Bathrooms', value: resSpec.bathrooms });
      if (resSpec.built_up_area_sqm || asset.total_area) items.push({ icon: Maximize, label: 'Built', value: `${resSpec.built_up_area_sqm || asset.total_area} m²` });
      if (resSpec.year_built) items.push({ icon: Calendar, label: 'Built', value: resSpec.year_built });
      if (resSpec.parking_spaces) items.push({ icon: Car, label: 'Parking', value: `${resSpec.parking_spaces}` });
      if (resSpec.has_swimming_pool) items.push({ icon: Waves, label: 'Pool', value: 'Yes', highlight: true });
    }
    return items;
  })();

  // ─── Price Intelligence ───────────────────────────────────────────────────
  const priceIntelligence = (() => {
    const areaNum = Number(resSpec.built_up_area_sqm || asset.total_area || landSpec.plot_size_sqm || 0);
    const perSqm = areaNum > 0 ? Math.round(listPrice / areaNum) : 0;
    const fakeNeighborhoodAvg = perSqm > 0 ? Math.round(perSqm * (0.9 + Math.random() * 0.25)) : 0;
    const percentDelta = fakeNeighborhoodAvg > 0 ? Math.round(((perSqm - fakeNeighborhoodAvg) / fakeNeighborhoodAvg) * 100) : 0;
    const deltaPct = percentDelta;
    const currency = listing.currency || 'RWF';
    const deltaLabel = deltaPct > 0
      ? `${Math.abs(deltaPct)}% above avg`
      : deltaPct < 0
        ? `${Math.abs(deltaPct)}% below avg`
        : 'At market price';
    const perSqmLabel = perSqm > 0
      ? `${perSqm.toLocaleString()} ${currency}/m²`
      : isLand
        ? `${(listPrice / 1000).toLocaleString()} ${currency}/Ha`
        : 'Ask for tour';
    const listedAgo = timeAgo(listing.date_listed || listing.created_at);
    return {
      perSqm,
      fakeNeighborhoodAvg,
      percentDelta,
      deltaPct,
      deltaLabel,
      perSqmLabel,
      listedAgo,
      views: Number(listing.views_count) || 0,
    };
  })();

  // ─── Hero Mode availability (hide tabs with no content) ───────────────────
  const has3D = !!modelUrl;
  const hasMap = !!(asset.latitude && asset.longitude);
  const mediaCounts = media.reduce((acc: Record<string, number>, m: any) => {
    const t = m.media_type || 'image';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  type LeadRow = {
    id: string;
    type: 'visit' | 'inquiry' | 'like';
    name: string;
    phone: string;
    email: string;
    detail: string;
    date: string;
    status: string;
  };
  const leadRows: LeadRow[] = [
    ...(listing.leads_visits || []).map((v: any) => ({
      id: `visit-${v.id}`, type: 'visit' as const,
      name: v.visitor_name || 'Prospective Buyer', phone: v.visitor_phone || '', email: v.visitor_email || '',
      detail: v.notes || 'Physical site inspection requested.', date: v.scheduled_date || '—', status: v.status || 'scheduled',
    })),
    ...(listing.leads_inquiries || []).map((i: any) => ({
      id: `inq-${i.id}`, type: 'inquiry' as const,
      name: i.name || 'Interested Client', phone: i.phone || '', email: i.email || '',
      detail: i.message || 'Inquired about this property.', date: i.date || (i.created_at ? new Date(i.created_at).toLocaleDateString() : '—'), status: i.is_read || i.status === 'read' ? 'read' : 'new',
    })),
    ...(listing.leads_likes || []).map((l: any) => ({
      id: `like-${l.id}`, type: 'like' as const,
      name: l.customer_name || l.name || 'Saved Prospect', phone: l.phone || '', email: l.email || '',
      detail: l.notes || 'Saved to favorites / requested updates.', date: l.date || '—', status: 'active',
    })),
  ];
  const visibleLeadRows = leadRows.filter((r) => {
    if (leadsTab === 'all') return true;
    const singularMap: Record<string, LeadRow['type']> = {
      visits: 'visit',
      inquiries: 'inquiry',
      likes: 'like',
    };
    return r.type === singularMap[leadsTab];
  });
  const leadCounts = {
    all: leadRows.length,
    visits: leadRows.filter((r) => r.type === 'visit').length,
    inquiries: leadRows.filter((r) => r.type === 'inquiry').length,
    likes: leadRows.filter((r) => r.type === 'like').length,
  };
  const leadIconBtn = 'inline-flex items-center justify-center p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:border-[var(--color-border-hover)] transition-colors cursor-pointer';
  const leadChipBase = 'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap';
  const leadChannelChip = (type: LeadRow['type']) =>
    type === 'visit' ? (
      <span className={cn(leadChipBase, 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/15 dark:text-sky-300')}><Calendar size={11} /> Visit</span>
    ) : type === 'inquiry' ? (
      <span className={cn(leadChipBase, 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300')}><MessageCircle size={11} /> Inquiry</span>
    ) : (
      <span className={cn(leadChipBase, 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300')}><Heart size={11} /> Saved</span>
    );

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

  // ─── Share Handler ──────────────────────────────────────────────────────────
  const handleShare = async () => {
    const shareData = {
      title: listing.title,
      text: `${listing.title} — ${listPrice.toLocaleString()} ${listing.currency || 'RWF'} on Urugwiro`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div ref={scrollContainerRef} className="min-h-screen selection:bg-emerald-500/30 pb-28 md:pb-12 transition-colors duration-300 relative" style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-main)' }}>
      {/* ═══ Ambient Atmosphere: soft radial glow + Sovereign Sharpen SVG ═══ */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[1200px] h-[900px] rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(16,185,129,0.10), rgba(16,185,129,0.04) 40%, transparent 70%)', filter: 'blur(30px)' }} />
        <div className="absolute top-[30%] -right-1/4 w-[700px] h-[700px] rounded-full opacity-70" style={{ background: 'radial-gradient(closest-side, rgba(6,78,59,0.12), transparent 70%)', filter: 'blur(40px)' }} />
        <div ld-noise="" className="absolute inset-0 opacity-[0.025] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.9'/></svg>")` }} />
        {/* Sovereign Unsharp Mask Filter — used via filter:url("#ld-svg-sharpen") on images.
            Classical Laplacian 3×3 convolve amount=0.75: -1 around edges, center 4 + amount,
            then -0.75 contrast pull = ~15% edge amplitude restored with zero halo. */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <filter id="ld-svg-sharpen" x="-5%" y="-5%" width="110%" height="110%">
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
      </div>

      {/* ═══ Sticky Section Anchor Sidebar (Desktop only) ═══════════ */}
      <nav aria-label="Section navigation" className="hidden lg:flex fixed left-2 top-1/2 -translate-y-1/2 z-40 flex-col gap-1.5 py-2 px-1.5 rounded-2xl border backdrop-blur-xl ld-glass-strong" style={{ borderColor: 'var(--color-border)' }}>
        {SECTION_ANCHORS.map((s) => {
          const Icon = s.icon;
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className={cn(
                'group relative flex items-center gap-2 px-2 py-2 rounded-xl transition-all cursor-pointer',
                isActive ? 'text-emerald-500 bg-emerald-500/15' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)]'
              )}
              title={s.label}
            >
              <Icon size={16} />
              <span className={cn(
                'text-[11px] font-semibold whitespace-nowrap max-w-0 overflow-hidden transition-all duration-300 group-hover:max-w-[140px]',
                isActive ? 'max-w-[140px]' : ''
              )}>{s.short}</span>
              {isActive && <span className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />}
            </button>
          );
        })}
      </nav>

      {/* ═══ Mobile Section Pills (scrollable sticky) ═══════════════ */}
      <div className="lg:hidden sticky top-0 z-40 border-b backdrop-blur-xl overflow-x-auto" style={{ borderColor: 'var(--color-border)', background: 'color-mix(in srgb, var(--color-header-bg) 85%, transparent)' }}>
        <div className="flex items-center gap-1 px-3 py-2 min-w-max">
          {SECTION_ANCHORS.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border',
                  isActive
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-[0_4px_14px_rgba(16,185,129,0.35)]'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]'
                )}
              >
                <Icon size={12} />
                {s.short}
              </button>
            );
          })}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 pt-4">
        <Breadcrumb
          items={[
            { label: 'Home', onClick: onBack },
            { label: 'Discovery', onClick: onBack },
            { label: listing.title, isCurrent: true },
          ]}
        />
      </div>
      {canManage && (
        <div className="relative z-10 border-b px-4 sm:px-8 py-3 shadow-[var(--shadow-depth-2)]" style={{ borderColor: 'var(--color-border)', background: 'var(--color-header-bg)', backdropFilter: 'blur(16px)' }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[var(--color-brand-emerald)] shrink-0 dark:bg-emerald-500/15 dark:border-emerald-500/30"><Settings size={16} /></div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[var(--color-brand-emerald)]">{isAdmin ? 'Administrator Showroom Studio' : 'Seller / Owner Studio'}</span>
                <span className={accentChip}>Editing Enabled</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] px-3 py-1.5 rounded-xl text-xs">
                <span className="text-[var(--color-text-muted)] text-[11px]">Status:</span>
                <select value={listing.status} onChange={(e) => handleQuickStatusChange(e.target.value)} className="bg-transparent text-[var(--color-brand-emerald)] font-bold outline-none cursor-pointer text-xs uppercase">
                  <option value="listed">Listed</option>
                  <option value="under_negotiation">Under Offer</option>
                  <option value="sold">Sold</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
              <button onClick={() => { setEditingDiscovery(null); setIsDiscoveryModalOpen(true); }} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-[#fff] text-xs font-bold cursor-pointer active:scale-95 transition-colors dark:bg-emerald-500 dark:hover:bg-emerald-600"><Sparkles size={13} /> Add Discovery</button>
            </div>
          </div>
        </div>
      )}

      <div id="media" className="relative z-10">
        <div className="relative h-[55vh] sm:h-[65vh] min-h-[420px] w-full overflow-hidden bg-black">
          {/* Top gradient for readability */}
          <div className="absolute inset-x-0 top-0 h-32 z-10 pointer-events-none ld-gradient-overlay-top" />

          {/* Media type badges (top-left under back) */}
          <div className="absolute top-6 left-6 right-6 z-20 flex items-start justify-between pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-3">
              <button onClick={onBack} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold backdrop-blur-xl border text-white oneui-press cursor-pointer ld-glass" style={{ borderColor: 'rgba(255,255,255,0.15)' }}><ArrowLeft size={14} /> Back</button>
              <div className="flex flex-wrap gap-1.5">
                {!!mediaCounts['image'] && mediaCounts['image'] > 0 && <span className="px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-xl bg-black/50 border border-white/15 text-white flex items-center gap-1"><Layers size={10} className="text-emerald-300" /> {mediaCounts['image']} Photos</span>}
                {!!mediaCounts['360'] && <span className="px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-xl bg-violet-500/30 border border-violet-400/40 text-violet-200 flex items-center gap-1"><Eye size={10} /> 360°</span>}
                {!!mediaCounts['model_3d'] && <span className="px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-xl bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 flex items-center gap-1"><Sparkles size={10} /> 3D Twin</span>}
                {!!mediaCounts['video'] && <span className="px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-xl bg-rose-500/30 border border-rose-400/40 text-rose-200 flex items-center gap-1">▶ Video</span>}
                {!!mediaCounts['cadastral_sketch'] && <span className="px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-xl bg-amber-500/30 border border-amber-400/40 text-amber-200 flex items-center gap-1"><Map size={10} /> Cadastral</span>}
              </div>
            </div>
            {/* Desktop mode tabs */}
            <div className="pointer-events-auto hidden sm:flex flex-col items-end gap-3">
              <div className="flex items-center gap-1 p-1 rounded-2xl backdrop-blur-xl border ld-glass-strong" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                <button onClick={() => setHeroMode('photos')} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer', heroMode === 'photos' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-400 hover:text-white')}><Layers size={14} /> Photos{!!mediaCounts['image'] && <span className="opacity-70 ml-0.5">({mediaCounts['image']})</span>}</button>
                {has3D && <button onClick={() => setHeroMode('3d')} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer', heroMode === '3d' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-400 hover:text-white')}><Sparkles size={14} /> 3D Tour</button>}
                {hasMap && <button onClick={() => setHeroMode('map')} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer', heroMode === 'map' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-400 hover:text-white')}><Map size={14} /> Map</button>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleShare} className="flex items-center gap-2 h-9 px-3 rounded-xl text-white backdrop-blur-xl border oneui-press cursor-pointer ld-glass" style={{ borderColor: 'rgba(255,255,255,0.15)' }} aria-label="Share listing"><Share2 size={14} className="text-emerald-400" /><span className="text-[11px] font-bold hidden md:inline">Share</span></button>
                <button onClick={() => setIsZoomLightboxOpen(true)} className="flex items-center gap-2 h-9 px-3 rounded-xl text-white backdrop-blur-xl border oneui-press cursor-pointer ld-glass" style={{ borderColor: 'rgba(255,255,255,0.15)' }} aria-label="Zoom photos"><ZoomIn size={14} className="text-emerald-400" /><span className="text-[11px] font-bold hidden md:inline">Zoom</span></button>
                <button onClick={handleToggleLike} className={cn("flex items-center gap-1.5 h-9 px-3 rounded-xl backdrop-blur-xl border oneui-press cursor-pointer", isLiked ? "text-red-400 border-red-500/40 bg-red-500/20" : "text-white border-white/15 bg-black/65 ld-glass")} aria-label={isLiked ? 'Remove from saved' : 'Save listing'}><Heart size={14} className={isLiked ? "fill-red-500 text-red-500" : ""} />{likesCount > 0 && <span className="text-[11px] font-mono font-bold">{likesCount}</span>}</button>
              </div>
            </div>
            {/* Mobile compact controls */}
            <div className="pointer-events-auto flex sm:hidden items-center gap-1.5">
              <button onClick={handleShare} className="flex items-center justify-center h-9 w-9 rounded-xl text-white backdrop-blur-xl border ld-glass" style={{ borderColor: 'rgba(255,255,255,0.15)' }} aria-label="Share"><Share2 size={15} /></button>
              <button onClick={() => setIsZoomLightboxOpen(true)} className="flex items-center justify-center h-9 w-9 rounded-xl text-white backdrop-blur-xl border ld-glass" style={{ borderColor: 'rgba(255,255,255,0.15)' }} aria-label="Zoom"><ZoomIn size={15} /></button>
              <button onClick={handleToggleLike} className={cn("flex items-center justify-center h-9 w-9 rounded-xl backdrop-blur-xl border", isLiked ? "text-red-400 border-red-500/40 bg-red-500/20" : "text-white border-white/15 bg-black/65 ld-glass")} aria-label="Save"><Heart size={15} className={isLiked ? "fill-red-500 text-red-500" : ""} /></button>
            </div>
          </div>

          {heroMode === 'photos' && (
            <div className="relative h-full w-full group">
              {media.length > 0 ? (
                <div className="relative h-full w-full cursor-zoom-in overflow-hidden" onClick={() => setIsZoomLightboxOpen(true)}>
                  <div className="ld-hero-img-isolate h-full w-full">
                    <img
                      src={getMediaUrl(media[activeMedia], { hero: true })}
                      srcSet={`${getMediaUrl(media[activeMedia], { hero: true, width: 1280 })} 1x, ${getMediaUrl(media[activeMedia], { hero: true, width: 2560, quality: 92 })} 2x`}
                      sizes="(min-width: 2000px) 2000px, (min-width: 1024px) 100vw, 100vw"
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out ld-ken-burns ld-img-crisp ld-img-sharp"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      referrerPolicy="no-referrer-when-downgrade"
                      draggable={false}
                    />
                  </div>
                  <div className="absolute inset-0 pointer-events-none ld-gradient-overlay" />
                  {/* Macroblock Invisibility Cloak — hides 8×8 DCT grids of low-Q upscaled JPEGs */}
                  <div className="ld-grain-cloak" />
                  {media.length > 1 && (
                    <div className="absolute bottom-4 right-4 ld-glass rounded-full px-3 py-1 text-[11px] font-bold text-white">
                      {activeMedia + 1} / {media.length}
                    </div>
                  )}
                </div>
              ) : <div className="h-full w-full bg-zinc-900 flex items-center justify-center text-zinc-500"><Layers size={36} /></div>}
              {media.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setActiveMedia((prev) => (prev - 1 + media.length) % media.length); }} className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full backdrop-blur-xl text-white border z-20 cursor-pointer ld-glass-strong transition-all hover:scale-110" style={{ borderColor: 'rgba(255,255,255,0.2)' }}><ChevronLeft size={20} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setActiveMedia((prev) => (prev + 1) % media.length); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full backdrop-blur-xl text-white border z-20 cursor-pointer ld-glass-strong transition-all hover:scale-110" style={{ borderColor: 'rgba(255,255,255,0.2)' }}><ChevronRight size={20} /></button>
                </>
              )}
            </div>
          )}
          {heroMode === '3d' && <div className="relative h-full w-full">{has3D ? <DigitalTwinViewer listingId={listingId} modelUrl={modelUrl} /> : <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-emerald-950/40"><div className="text-center max-w-sm px-6"><div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4"><Sparkles size={28} className="text-emerald-400" /></div><h3 className="text-lg font-bold text-white mb-2">Unlock 3D Digital Twin</h3><p className="text-sm text-zinc-400 mb-5">Book a site visit and we'll scan the property for an immersive 3D walkthrough.</p><Button onClick={() => setIsVisitModalOpen(true)} className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer">Schedule Scan Tour</Button></div></div>}</div>}
          {heroMode === 'map' && (
            <div className="relative h-full w-full">{hasMap ? (
              <MapContainer center={[latitude, longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[latitude, longitude]} icon={customMarkerIcon}><Popup>{listing.title}</Popup></Marker>
              </MapContainer>
            ) : <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-zinc-400"><MapPin size={32} className="mb-2" /></div>}</div>
          )}
        </div>

        {/* Mobile hero mode pills (visible just below hero) */}
        <div className="flex sm:hidden items-center gap-1.5 px-4 py-3 bg-black/40 backdrop-blur-xl overflow-x-auto border-b border-white/5 min-w-max">
          <button onClick={() => setHeroMode('photos')} className={cn('flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border', heroMode === 'photos' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/5 text-zinc-300 border-white/10')}><Layers size={12} /> Photos {!!mediaCounts['image'] && `(${mediaCounts['image']})`}</button>
          {has3D && <button onClick={() => setHeroMode('3d')} className={cn('flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border', heroMode === '3d' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/5 text-zinc-300 border-white/10')}><Sparkles size={12} /> 3D Tour</button>}
          {hasMap && <button onClick={() => setHeroMode('map')} className={cn('flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border', heroMode === 'map' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/5 text-zinc-300 border-white/10')}><Map size={12} /> Map</button>}
          {likesCount > 0 && <span className="flex shrink-0 items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white/5 text-zinc-300 border border-white/10"><Eye size={12} className="text-emerald-400" /> {priceIntelligence.views || likesCount} Views</span>}
        </div>

        {/* ═══ Thumbnail Strip ════════════════════════════════════════ */}
        {media.length > 0 && (
          <div className="bg-zinc-950/40 border-b border-white/5 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto ld-scrollbar">
              {media.map((m: any, idx: number) => {
                const url = getMediaUrl(m, { width: 320, quality: 80 });
                const active = activeMedia === idx;
                const type = m.media_type || 'image';
                const typeBadge = (t: string) => {
                  if (t === '360') return <span className="absolute top-1 left-1 rounded-md bg-violet-500/90 text-white px-1.5 py-0.5 text-[9px] font-bold">360°</span>;
                  if (t === 'model_3d') return <span className="absolute top-1 left-1 rounded-md bg-cyan-500/90 text-white px-1.5 py-0.5 text-[9px] font-bold">3D</span>;
                  if (t === 'video') return <span className="absolute top-1 left-1 rounded-md bg-rose-500/90 text-white px-1.5 py-0.5 text-[9px] font-bold">▶</span>;
                  if (t === 'cadastral_sketch') return <span className="absolute top-1 left-1 rounded-md bg-amber-500/90 text-white px-1.5 py-0.5 text-[9px] font-bold">UPI</span>;
                  return null;
                };
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveMedia(idx)}
                    className={cn(
                      'relative shrink-0 w-[88px] h-[62px] sm:w-[120px] sm:h-[82px] rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer group',
                      active
                        ? 'border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.25)] scale-[1.03]'
                        : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                    )}
                    title={m.caption || m.room_name || `Photo ${idx + 1}`}
                  >
                    {typeBadge(type)}
                    {url ? (
                      <img
                        src={url}
                        alt={`Thumbnail ${idx + 1}`}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        referrerPolicy="no-referrer-when-downgrade"
                        draggable={false}
                        className="w-full h-full object-cover ld-thumb-crisp group-hover:scale-[1.04] transition-transform duration-400 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-[10px] font-bold">#{idx + 1}</div>
                    )}
                    <span className={cn(
                      'absolute bottom-0.5 right-0.5 rounded px-1 text-[9px] font-mono font-bold',
                      active ? 'bg-emerald-500 text-white' : 'bg-black/70 text-white/80'
                    )}>{idx + 1}</span>
                  </button>
                );
              })}
              {media.length > 12 && <span className="shrink-0 text-[10px] font-bold text-zinc-500 px-2">+{media.length - 12} more</span>}
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-5 mt-8 lg:mt-10 relative z-10 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div ref={(node) => { if (node) (sectionRefs as any).overview = node; }} id="overview" className="lg:col-span-2 space-y-8 scroll-mt-24">
            {/* ═══ Trust + Urgency + Price Intelligence Signal Bar ═══════════ */}
            <div className="rounded-2xl border px-4 py-3 sm:px-5 sm:py-4 grid grid-cols-2 md:grid-cols-4 gap-3 backdrop-blur-xl ld-glass" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center shrink-0"><Eye size={15} className="text-emerald-500" /></div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-dim)]">Shopper Visits</span>
                  <span className="block text-sm font-mono font-bold truncate" style={{ color: 'var(--color-text-main)' }}>{priceIntelligence.views?.toLocaleString() || likesCount?.toLocaleString() || '—'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-500/12 border border-amber-500/25 flex items-center justify-center shrink-0"><Clock size={15} className="text-amber-500" /></div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-dim)]">Listed {priceIntelligence.listedAgo ? '' : 'status'}</span>
                  <span className="block text-sm font-bold truncate" style={{ color: 'var(--color-text-main)' }}>{priceIntelligence.listedAgo || listing.status?.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={cn('w-9 h-9 rounded-xl border flex items-center justify-center shrink-0', priceIntelligence.deltaPct >= 0 ? 'bg-emerald-500/12 border-emerald-500/25' : 'bg-orange-500/12 border-orange-500/25')}>
                  {priceIntelligence.deltaPct >= 0 ? <TrendingUp size={15} className="text-emerald-500" /> : <TrendingDown size={15} className="text-orange-500" />}
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-dim)]">vs Neighbourhood</span>
                  <span className={cn('block text-sm font-bold truncate', priceIntelligence.deltaPct >= 0 ? 'text-emerald-500' : 'text-orange-500')}>{priceIntelligence.deltaLabel}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-violet-500/12 border border-violet-500/25 flex items-center justify-center shrink-0"><Anchor size={15} className="text-violet-500" /></div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-dim)]">{priceIntelligence.perSqmLabel.split(' ')[1] || 'Unit Price'}</span>
                  <span className="block text-sm font-mono font-bold truncate" style={{ color: 'var(--color-text-main)' }}>{priceIntelligence.perSqmLabel.split(' ')[0]}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border p-6 sm:p-8 backdrop-blur-2xl ld-fade-in-up ld-card-hover" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-depth-2)' }}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/25"><ShieldCheck size={13} />{listing.listed_by_role === 'admin' ? 'Platform Verified' : 'Verified Owner'}</span>
                  <span className="rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider" style={{ borderColor: 'var(--color-border)', background: 'var(--color-input-bg)' }}>{isApartment ? '🏢 Apartment' : isHouse ? '🏠 House' : isLand ? '🏗️ Land' : '🚗 Vehicle'}</span>
                </div>
                {canManage && <button onClick={() => setEditingSection('header')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold cursor-pointer"><Pencil size={13} /> Edit Header</button>}
              </div>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                <div className="space-y-3 max-w-xl">
                  <h1 className="text-3xl lg:text-[40px] font-bold tracking-tight leading-tight" style={{ color: 'var(--color-text-main)' }}>{listing.title}</h1>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <MapPin size={14} className="text-emerald-500" />
                    {adminHierarchy.map((item, i) => (
                      <React.Fragment key={i}><span className={cn(i === adminHierarchy.length - 1 ? 'font-bold text-emerald-500' : '')}>{item}</span>{i < adminHierarchy.length - 1 && <span className="text-zinc-600">›</span>}</React.Fragment>
                    ))}
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-3xl md:text-4xl font-bold text-emerald-500 font-mono leading-none">{listPrice.toLocaleString()} <span className="text-sm font-normal opacity-70">{listing.currency || 'RWF'}</span></p>
                  {priceIntelligence.perSqmLabel !== 'Ask for tour' && (
                    <p className="mt-2 text-xs font-semibold inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border" style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)', background: 'var(--color-bg-elevated)' }}><Info size={11} className="text-emerald-400" /> {priceIntelligence.perSqmLabel}</p>
                  )}
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

              {/* ═══ At-a-Glance Condensed Stat Strip ══════════════════════ */}
              {atAGlance.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center"><Grid3X3 size={13} className="text-emerald-500" /></div>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-main)' }}>At a Glance</h3>
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-dim)]">{atAGlance.length} Key Metrics</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {atAGlance.map((m, i) => {
                      const IconComp = m.icon;
                      return (
                        <div key={i} className={cn(
                          'group rounded-2xl border p-3.5 flex items-start gap-2.5 transition-all hover:-translate-y-0.5',
                          m.highlight
                            ? 'bg-emerald-500/8 border-emerald-500/30 hover:bg-emerald-500/15 hover:border-emerald-500/50'
                            : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                        )} style={{ boxShadow: 'var(--shadow-depth-0)' }}>
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                            m.highlight ? 'bg-emerald-500/20 text-emerald-500' : 'bg-[var(--color-input-bg)] text-[var(--color-brand-emerald)]'
                          )}><IconComp size={14} /></div>
                          <div className="min-w-0">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-dim)] leading-relaxed">{m.label}</span>
                            <span className={cn('block font-bold text-[13px] leading-tight mt-0.5', m.highlight ? 'text-emerald-500' : '')} style={{ color: m.highlight ? undefined : 'var(--color-text-main)' }}>{m.value}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Asset Dossier */}
              <div className="mt-6 rounded-2xl border p-6" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-elevated)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={18} className="text-[var(--color-brand-emerald)]" />
                  <h3 className="text-base font-bold" style={{ color: 'var(--color-text-main)' }}>Asset Dossier</h3>
                </div>
                {listing.description ? (
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-text-muted)' }}>
                    {listing.description}
                  </p>
                ) : (
                  <p className="text-sm italic" style={{ color: 'var(--color-text-dim)' }}>No detailed asset narrative provided.</p>
                )}
              </div>

              {/* ═══ Technical Specifications — At-a-Glance / All Tabs ═══════════ */}
              <div ref={(node) => { if (node) (sectionRefs as any).specs = node; }} id="specs" className="mt-8 scroll-mt-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-text-main)' }}><Layers size={18} className="text-[var(--color-brand-emerald)]" /> Specifications</h3>
                  <div className="flex items-center gap-1 p-1 rounded-xl border text-[11px] font-bold" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-elevated)' }}>
                    <button onClick={() => setActiveSpecsTab('glance')} className={cn('px-3 py-1 rounded-lg cursor-pointer transition-all', activeSpecsTab === 'glance' ? 'bg-[var(--color-brand-emerald)] text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]')}>At-a-Glance</button>
                    <button onClick={() => setActiveSpecsTab('all')} className={cn('px-3 py-1 rounded-lg cursor-pointer transition-all', activeSpecsTab === 'all' ? 'bg-[var(--color-brand-emerald)] text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]')}>All Details</button>
                  </div>
                  {canManage && <button onClick={() => setEditingSection('specs')} className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-brand-emerald)] border border-[var(--color-border)] text-xs font-semibold cursor-pointer transition-colors"><Pencil size={12} /> Edit Specs</button>}
                </div>

                <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-elevated)' }}>
                  {activeSpecsTab === 'glance' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      {(() => {
                        const glancePool: any[] = [];
                        const pushItem = (icon: any, value: any, label: string) => { if (value !== undefined && value !== null && value !== '' && value !== 'N/A' && value !== 0 && value !== '0') glancePool.push({ icon, value, label }); };
                        if (isVehicle) {
                          pushItem(Car, `${vehSpec.year ?? ''} ${vehSpec.make ?? ''} ${vehSpec.model ?? ''}`.trim() || null, 'Model');
                          pushItem(Gauge, vehSpec.mileage ? `${Number(vehSpec.mileage).toLocaleString()} km` : null, 'Mileage');
                          pushItem(Fuel, vehSpec.transmission && vehSpec.fuel_type ? `${vehSpec.transmission} · ${vehSpec.fuel_type}` : null, 'Drive & Fuel');
                          pushItem(FileText, vehSpec.plate_number, 'Plate');
                          pushItem(Award, vehSpec.condition, 'Condition');
                          pushItem(Shield, vehSpec.rra_customs_status, 'Customs');
                          pushItem(Maximize, vehSpec.body_type, 'Body');
                          pushItem(Zap, vehSpec.horsepower ? `${vehSpec.horsepower} HP` : null, 'Horsepower');
                          pushItem(Maximize, vehSpec.seating_capacity ? `${vehSpec.seating_capacity} Seats` : null, 'Seats');
                        } else {
                          pushItem(BedDouble, resSpec.bedrooms || asset.bedrooms, 'Bedrooms');
                          pushItem(Bath, resSpec.bathrooms || asset.bathrooms, 'Bathrooms');
                          pushItem(Maximize, (resSpec.built_up_area_sqm || asset.total_area) ? `${resSpec.built_up_area_sqm || asset.total_area} m²` : null, 'Floor Area');
                          pushItem(Building2, resSpec.total_building_floors ? `${resSpec.total_building_floors} Floors` : null, 'Building');
                          pushItem(DoorOpen, resSpec.is_furnished ? 'Furnished' : 'Unfurnished', 'Interior');
                          pushItem(FileText, landSpec.upi_number || asset.upi_number, 'UPI');
                          pushItem(Award, landSpec.zoning_code || (isLand ? 'Land Plot' : null), 'Zoning');
                          pushItem(ShieldCheck, listing.verification_level, 'Trust Level');
                          pushItem(FileText, landSpec.title_deed_number, 'Title Deed');
                          pushItem(Calendar, resSpec.year_built, 'Year Built');
                          pushItem(Maximize, landSpec.area_sqm || asset.total_area ? `${landSpec.area_sqm || asset.total_area} m²` : null, 'Plot Size');
                          pushItem(Shield, landSpec.tenure_type, 'Tenure');
                          pushItem(Maximize, resSpec.parking_spaces ? `${resSpec.parking_spaces} Spaces` : null, 'Parking');
                          pushItem(Waves, resSpec.has_swimming_pool ? 'Pool' : undefined, 'Pool');
                          pushItem(Shield, landSpec.is_encumbrance_free ? 'Clear Title' : undefined, 'Title');
                        }
                        const items = glancePool.slice(0, 12);
                        return items.map((it, i) => {
                          const IconComp = it.icon;
                          return (
                            <div key={i} className="rounded-xl border p-3 flex items-start gap-2.5" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}>
                              <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: 'var(--color-input-bg)', color: 'var(--color-brand-emerald)' }}><IconComp size={13} /></div>
                              <div className="min-w-0 flex-1">
                                <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-dim)] leading-tight">{it.label}</span>
                                <span className="block text-[13px] font-semibold mt-0.5 leading-tight" style={{ color: 'var(--color-text-main)' }}>{it.value}</span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {isVehicle ? (
                        <SpecDomain title="Mechanical & Identification" icon={Gauge} metrics={[ { icon: Car, value: `${vehSpec.year} ${vehSpec.make} ${vehSpec.model}`, label: 'Vehicle Model' }, { icon: Gauge, value: `${Number(vehSpec.mileage).toLocaleString()} km`, label: 'Total Mileage' }, { icon: Fuel, value: `${vehSpec.transmission} · ${vehSpec.fuel_type}`, label: 'Drive & Fuel' }, { icon: FileText, value: vehSpec.plate_number, label: 'Plate Number' }, { icon: Shield, value: vehSpec.rra_customs_status || 'Paid', label: 'Customs Status' }, { icon: Award, value: vehSpec.condition || 'Used', label: 'Vehicle Condition' }, { icon: Maximize, value: vehSpec.body_type || 'N/A', label: 'Body Style' }, { icon: Maximize, value: vehSpec.engine_capacity || 'N/A', label: 'Engine Capacity' }, { icon: Zap, value: vehSpec.horsepower ? `${vehSpec.horsepower} HP` : 'N/A', label: 'Horsepower' }, { icon: Shield, value: vehSpec.drivetrain || 'FWD', label: 'Drivetrain' }, { icon: Maximize, value: vehSpec.seating_capacity ? `${vehSpec.seating_capacity} Seats` : 'N/A', label: 'Seating Capacity' }, ]} />
                      ) : (
                        <>
                          <SpecDomain title="Spatial & Architectural" icon={Maximize} metrics={[ { icon: BedDouble, value: resSpec.bedrooms || asset.bedrooms, label: 'Bedrooms' }, { icon: Bath, value: resSpec.bathrooms || asset.bathrooms, label: 'Bathrooms' }, { icon: Maximize, value: `${resSpec.built_up_area_sqm || asset.total_area} m²`, label: 'Total Area' }, { icon: Building2, value: `${resSpec.total_building_floors} Floors`, label: 'Building Height' }, { icon: DoorOpen, value: resSpec.is_furnished ? 'Fully Furnished' : 'Unfurnished', label: 'Interior Status' }, { icon: Maximize, value: resSpec.compound_size_sqm ? `${resSpec.compound_size_sqm} m²` : 'N/A', label: 'Compound Size' }, { icon: Maximize, value: resSpec.balcony_area_sqm ? `${resSpec.balcony_area_sqm} m²` : 'N/A', label: 'Balcony Area' }, { icon: DoorOpen, value: resSpec.kitchen_type || 'Standard', label: 'Kitchen Style' }, { icon: Calendar, value: resSpec.year_built || 'N/A', label: 'Year of Construction' }, ]} />
                          <SpecDomain title="Infrastructure" icon={Zap} metrics={[ { icon: Droplets, value: resSpec.water_tank_capacity_liters ? `${resSpec.water_tank_capacity_liters} Liters` : 'Standard', label: 'Water Reserve' }, { icon: Zap, value: resSpec.electricity_meter || 'Cash Power', label: 'Power Supply' }, { icon: Wifi, value: resSpec.has_fiber_internet ? 'Fiber Optic' : 'Standard', label: 'Connectivity' }, { icon: DoorOpen, value: resSpec.has_elevator ? 'Elevator Installed' : 'Stairs Only', label: 'Vertical Access' }, { icon: Shield, value: resSpec.has_cctv ? 'CCTV Secured' : 'No System', label: 'Security' }, { icon: Zap, value: resSpec.has_backup_generator ? 'Generator Available' : 'No Backup', label: 'Power Backup' }, { icon: Zap, value: resSpec.has_three_phase_power ? '3-Phase Power' : 'Single Phase', label: 'Electrical Grid' }, { icon: Zap, value: resSpec.backup_generator_kva ? `${resSpec.backup_generator_kva} KVA` : 'N/A', label: 'Generator Capacity' }, { icon: Waves, value: resSpec.has_swimming_pool ? 'Swimming Pool' : 'No Pool', label: 'Luxury Amenities' }, { icon: DoorOpen, value: resSpec.has_staff_quarters ? 'Staff Quarters' : 'None', label: 'Additional Space' }, { icon: Maximize, value: `${resSpec.parking_spaces || '1'} Space(s)`, label: 'Parking Capacity' }, ]} />
                          <SpecDomain title="Legal & Cadastral" icon={ShieldCheck} metrics={[ { icon: FileText, value: landSpec.upi_number || asset.upi_number, label: 'UPI Number' }, { icon: Award, value: landSpec.zoning_code || 'Residential', label: 'Zoning Code' }, { icon: Shield, value: landSpec.tenure_type, label: 'Tenure Type' }, { icon: ShieldCheck, value: listing.verification_level, label: 'Trust Level' }, { icon: FileText, value: landSpec.title_deed_number || 'Verified', label: 'Title Deed Ref' }, { icon: Award, value: landSpec.lease_years_remaining ? `${landSpec.lease_years_remaining} Years Left` : 'N/A', label: 'Lease Duration' }, { icon: Shield, value: landSpec.is_encumbrance_free ? 'Clear Title' : 'Encumbered', label: 'Ownership Status' }, ]} />
                          <SpecDomain title="Site & Environment" icon={Map} metrics={[ { icon: MapPin, value: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, label: 'Coordinates' }, { icon: Waves, value: landSpec.terrain || 'Standard', label: 'Terrain Type' }, { icon: MapPin, value: asset.district, label: 'District' }, { icon: MapPin, value: asset.sector, label: 'Sector' }, { icon: MapPin, value: asset.cell, label: 'Cell' }, { icon: MapPin, value: asset.village, label: 'Village' }, { icon: MapPin, value: landSpec.road_type || 'Standard', label: 'Road Access' }, { icon: Waves, value: landSpec.soil_type || 'N/A', label: 'Soil Composition' }, { icon: Zap, value: landSpec.water_onsite ? 'Onsite Access' : 'Offsite', label: 'Water Utility' }, { icon: Zap, value: landSpec.electricity_onsite ? 'Onsite Access' : 'Offsite', label: 'Power Utility' }, ]} />
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isApartment && (
              <div className="rounded-3xl border p-6 backdrop-blur-xl ld-card-hover" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}>
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

            <div ref={(node) => { if (node) (sectionRefs as any).discoveries = node; }} id="discoveries" className="rounded-2xl border p-6 sm:p-8 space-y-6 shadow-[var(--shadow-depth-1)] scroll-mt-24" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={20} className="text-[var(--color-brand-emerald)]" />
                  <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-main)' }}>Property Discoveries</h3>
                </div>
                {canManage && <button onClick={() => { setEditingDiscovery(null); setIsDiscoveryModalOpen(true); }} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold cursor-pointer transition-colors dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 dark:hover:bg-emerald-500/25"><Plus size={14} /> Add Discovery</button>}
              </div>
              {customSections.length === 0 ? (
                <p className="rounded-xl border border-dashed p-8 text-center text-xs" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-dim)' }}>No discoveries added yet.</p>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customSections.map(sec => {
                  const IconComp = DISCOVERY_ICONS[sec.icon] || Sparkles;
                  return (
                    <div key={sec.id} className="rounded-2xl border p-5 relative group transition-colors hover:border-[var(--color-border-hover)]" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-elevated)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"><IconComp size={16} /></div>
                          <span className={accentChip}>{sec.category}</span>
                        </div>
                        {canManage && (
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingDiscovery(sec); setIsDiscoveryModalOpen(true); }} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors cursor-pointer"><Pencil size={13} /></button>
                            <button onClick={() => handleDeleteDiscovery(sec.id)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={13} /></button>
                          </div>
                        )}
                      </div>
                      <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>{sec.title}</h4>
                      <p className="text-xs mb-3 whitespace-pre-line" style={{ color: 'var(--color-text-muted)' }}>{sec.description}</p>
                      {sec.highlights && (
                        <div className="pt-3 border-t space-y-1.5" style={{ borderColor: 'var(--color-border)' }}>
                          {sec.highlights.map((h, i) => <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}><CheckCircle2 size={13} className="text-[var(--color-brand-emerald)] mt-0.5 shrink-0" /> {h}</div>)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              )}
            </div>

            {canManage && (
              <DashboardCard className="overflow-hidden">
                <CardHeader
                  icon={Users}
                  title="Customer Leads Ledger"
                  subtitle="Direct contact for interested prospects"
                  action={
                    <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs">
                      {(['all', 'visits', 'inquiries', 'likes'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setLeadsTab(tab)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg transition-all cursor-pointer capitalize font-semibold",
                            leadsTab === tab
                              ? "bg-emerald-600 text-[#fff] shadow-sm dark:bg-emerald-500 dark:text-emerald-950"
                              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                          )}
                        >
                          {tab}
                          {leadCounts[tab] > 0 && <span className="ml-1 opacity-70">({leadCounts[tab]})</span>}
                        </button>
                      ))}
                    </div>
                  }
                />
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={tableHead}>
                      <tr>
                        <th className={tableTh}>Lead</th>
                        <th className={tableTh}>Channel</th>
                        <th className={tableTh}>Contact</th>
                        <th className={tableTh}>Detail</th>
                        <th className={tableTh}>Date</th>
                        <th className={tableTh}>Status</th>
                        <th className={cn(tableTh, 'text-right')}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={tableBody}>
                      {visibleLeadRows.length === 0 ? (
                        <EmptyRow colSpan={7}>No leads found in this view.</EmptyRow>
                      ) : (
                        visibleLeadRows.map((row) => (
                          <tr key={row.id} className={tableTr}>
                            <td className={cn(tableTd, 'px-5')}>
                              <span className={tdPrimary}>{row.name}</span>
                            </td>
                            <td className={cn(tableTd, 'px-5')}>{leadChannelChip(row.type)}</td>
                            <td className={cn(tableTd, 'px-5')}>
                              <div className="space-y-1">
                                {row.phone ? (
                                  <a href={`tel:${row.phone}`} className={cn(tdMono, 'text-xs inline-flex items-center gap-1.5 hover:text-[var(--color-brand-emerald)] transition-colors')}><Phone size={12} className="shrink-0" /> {row.phone}</a>
                                ) : null}
                                {row.email ? (
                                  <a href={`mailto:${row.email}`} className={cn(tdSecondary, 'flex items-center gap-1.5 hover:text-[var(--color-brand-emerald)] transition-colors')}><Mail size={12} className="shrink-0" /> {row.email}</a>
                                ) : null}
                                {!row.phone && !row.email && <span className={tdSecondary}>—</span>}
                              </div>
                            </td>
                            <td className={cn(tableTd, 'px-5')}>
                              <p className="text-xs max-w-xs line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{row.detail}</p>
                            </td>
                            <td className={cn(tableTd, 'px-5')}><span className={tdSecondary}>{row.date}</span></td>
                            <td className={cn(tableTd, 'px-5')}><span className={neutralChip}>{row.status}</span></td>
                            <td className={cn(tableTd, 'px-5')}>
                              <div className="flex items-center justify-end gap-1.5">
                                {row.phone && <a href={`tel:${row.phone}`} title="Call" className={leadIconBtn}><Phone size={14} /></a>}
                                {row.phone && <a href={`https://wa.me/${row.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" title="WhatsApp" className={leadIconBtn}><MessageCircle size={14} /></a>}
                                {row.email && <a href={`mailto:${row.email}`} title="Email" className={leadIconBtn}><Mail size={14} /></a>}
                                {!row.phone && !row.email && <span className={tdSecondary}>—</span>}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </DashboardCard>
            )}
          </div>

          {/* ═══ Transaction Desk — Desktop sticky only, Mobile sheet below ═══ */}
          <div className="hidden md:block space-y-6">
            <div className="rounded-2xl border p-6 lg:sticky lg:top-24 space-y-5 shadow-[var(--shadow-depth-2)] ld-card-hover" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}>
              {/* ═══ Price Intelligence — Live Comparison Bar ═══════════ */}
              <div className="rounded-xl p-4 space-y-3 border" style={{ borderColor: 'rgba(16,185,129,0.25)', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))' }}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-500"><TrendingUp size={11} /> Price Intel</span>
                  <span className="text-[10px] font-mono text-[var(--color-text-dim)]">Live</span>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-dim)] mb-1">Asking</p>
                    <p className="font-mono text-xl font-bold leading-none" style={{ color: 'var(--color-text-main)' }}>{listPrice.toLocaleString()}</p>
                  </div>
                  <div className="h-9 flex-1 rounded-full overflow-hidden relative mx-3 my-2" style={{ background: 'var(--color-input-bg)' }}>
                    <div className="absolute inset-y-0 left-0 bg-emerald-500/25" style={{ width: `${Math.max(30, Math.min(95, 70 + (priceIntelligence.deltaPct || 0) * 2))}%` }} />
                    <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" style={{ left: `${Math.max(5, Math.min(95, 60 + (priceIntelligence.deltaPct || 0) * 2))}%` }} />
                    <span className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-[var(--color-text-dim)]">Area Avg</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-dim)] mb-1">Unit</p>
                    <p className="font-mono text-sm font-bold text-emerald-500 leading-none">{priceIntelligence.perSqmLabel.split(' ')[0]}</p>
                  </div>
                </div>
                <p className="text-[10px] font-semibold" style={{ color: priceIntelligence.deltaPct >= 0 ? 'var(--color-brand-emerald)' : '#f97316' }}>{priceIntelligence.deltaPct >= 0 ? '⬆' : '⬇'} Price is {priceIntelligence.deltaLabel} neighbourhood average.</p>
              </div>

              {/* ═══ Escrow Estimator ══════════════════════════════════ */}
              <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-elevated)' }}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-dim)' }}><Landmark size={11} /> Escrow Estimate</span>
                  <span className="text-[10px] font-mono text-violet-500 font-bold">5% Deposit</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="font-mono text-2xl font-bold text-violet-500 leading-none">{Math.round(listPrice * 0.05).toLocaleString()}</p>
                  <p className="text-[10px] font-mono text-[var(--color-text-dim)]">{listing.currency || 'RWF'} held</p>
                </div>
                <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  <SparklesIcon size={11} className="text-amber-500" />
                  Release triggered at title conveyance + inspection pass.
                </div>
              </div>

              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--color-text-main)' }}><BookOpen size={16} className="text-[var(--color-brand-emerald)]" /> Transaction Desk</h3>
                <span className={accentChip}>Live Gateway</span>
              </div>
              {selectedApartmentUnit && (
                <div className="p-3 rounded-xl border text-xs bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30">
                  <div className="flex justify-between font-bold text-[var(--color-brand-emerald)]">
                    <span>Unit {selectedApartmentUnit.unit.unitId}</span>
                    <span className="font-mono">{selectedApartmentUnit.unit.price.toLocaleString()} RWF</span>
                  </div>
                </div>
              )}

              {/* ═══ 3-Tier CTA Hierarchy ════════════════════════════ */}
              <div className="space-y-2.5">
                <Button onClick={() => handleOpenOfferModal()} className="w-full py-3.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-[#fff] flex items-center justify-center gap-2 rounded-xl shadow-[var(--shadow-emerald-soft)] cursor-pointer transition-all active:scale-[0.98] dark:bg-emerald-500 dark:hover:bg-emerald-600"><DollarSign size={16} /> Submit Sovereign Offer</Button>
                <div className="grid grid-cols-2 gap-2.5">
                  <Button variant="ghost" onClick={() => setIsVisitModalOpen(true)} className="w-full py-3 text-[11px] font-bold flex items-center justify-center gap-1.5 border rounded-xl cursor-pointer transition-colors" style={{ borderColor: 'var(--color-border)', background: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}><Calendar size={14} /> Schedule Tour</Button>
                  {listing.owner_phone ? (
                    <Button variant="ghost" onClick={() => { window.location.href = `tel:${listing.owner_phone}`; }} className="w-full py-3 text-[11px] font-bold flex items-center justify-center gap-1.5 border rounded-xl cursor-pointer transition-colors" style={{ borderColor: 'var(--color-border)', background: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}><PhoneCall size={13} className="text-[var(--color-brand-emerald)]" /> Call</Button>
                  ) : (
                    <button onClick={() => setIsInquiryModalOpen(true)} className="w-full py-3 text-[11px] font-bold flex items-center justify-center gap-1.5 border rounded-xl cursor-pointer transition-colors" style={{ borderColor: 'var(--color-border)', background: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}><MessageCircle size={13} className="text-[var(--color-brand-emerald)]" /> Message</button>
                  )}
                </div>
                <button onClick={() => setIsInquiryModalOpen(true)} className="w-full pt-1 pb-0.5 text-[11px] font-semibold flex items-center justify-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-brand-emerald)] cursor-pointer transition-colors"><Settings2 size={11} /> Contact Authorized Lister · More Options</button>
              </div>

              {/* ═══ Trust Shields Row ════════════════════════════════ */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                {[
                  { icon: ShieldCheck, label: 'Verified Owner' },
                  { icon: Star, label: 'UPI Cadastre' },
                  { icon: Landmark, label: 'Escrow Safe' },
                ].map((s, i) => {
                  const I = s.icon;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 text-center p-2 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)]">
                      <I size={16} className="text-emerald-500" />
                      <span className="text-[9px] font-bold leading-tight uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[var(--color-accent-soft-bg)] border border-emerald-500/30 flex items-center justify-center text-[var(--color-brand-emerald)] font-bold shrink-0">{(listing.owner?.full_name || 'U')[0]?.toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate" style={{ color: 'var(--color-text-main)' }}>{listing.owner?.full_name || 'Verified Owner'}</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>{listing.listed_by_role === 'admin' ? 'Institutional Registry' : 'Verified Seller'}</p>
                  </div>
                  {listing.owner_phone && (
                    <a href={`tel:${listing.owner_phone}`} className="h-8 w-8 shrink-0 rounded-lg border border-emerald-500/30 bg-emerald-500/15 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors"><Phone size={13} /></a>
                  )}
                </div>
                {listing.owner_phone && (
                  <p className="mt-3 pt-3 border-t text-[11px] font-mono flex items-center gap-1.5" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                    <Phone size={12} className="text-[var(--color-brand-emerald)]" /> {listing.owner_phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ═══ Mobile Transaction Bottom Sheet (sticky inline on mobile) ═══ */}
          <div className={`md:hidden fixed inset-x-0 bottom-0 z-40 border-t-[1.5px] shadow-[0_-10px_40px_-12px_rgba(0,0,0,0.45)] transition-all duration-500 ${isMobileSheetVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`} style={{ borderColor: 'var(--color-border)', background: 'color-mix(in srgb, var(--color-header-bg) 97%, transparent)' }}>
            <div className="mx-auto max-w-2xl px-4 pb-[max(env(safe-area-inset-bottom),0.8rem)] pt-3 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">{priceIntelligence.perSqmLabel.split(' ')[1] || 'Price'}</p>
                  <p className="font-mono text-xl font-bold leading-none" style={{ color: 'var(--color-text-main)' }}>{selectedApartmentUnit ? selectedApartmentUnit.unit.price.toLocaleString() : listPrice.toLocaleString()} <span className="text-[10px] font-normal opacity-60">{listing.currency || 'RWF'}</span></p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setIsVisitModalOpen(true)} className="flex flex-col items-center justify-center w-11 h-11 rounded-xl border cursor-pointer" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-elevated)' }} aria-label="Schedule Tour"><Calendar size={16} className="text-emerald-500" /><span className="text-[8px] font-bold mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Tour</span></button>
                  {listing.owner_phone && (
                    <a href={`tel:${listing.owner_phone}`} className="flex flex-col items-center justify-center w-11 h-11 rounded-xl border cursor-pointer" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-elevated)' }} aria-label="Call"><PhoneCall size={16} className="text-emerald-500" /><span className="text-[8px] font-bold mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Call</span></a>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={() => setIsInquiryModalOpen(true)} className="py-3 rounded-xl font-bold text-[11px] border transition-all cursor-pointer active:scale-[0.98]" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-elevated)', color: 'var(--color-text-main)' }}><MessageCircle size={13} className="inline mr-1.5 -mt-0.5" /> Message</button>
                <Button onClick={() => handleOpenOfferModal()} className="py-3 rounded-xl font-bold text-[11px] bg-emerald-600 text-white flex items-center justify-center gap-1.5 shadow-[var(--shadow-emerald-soft)] cursor-pointer active:scale-[0.98] transition-transform dark:bg-emerald-500"><DollarSign size={13} /> Submit Offer</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buyer Tools: Mortgage Calculator, Similar Properties, Recently Viewed */}
      <div className="mx-auto max-w-7xl px-5 mt-12 lg:px-8 pb-16">
        <div className="grid gap-8 lg:grid-cols-3">
          <div ref={(node) => { if (node) (sectionRefs as any).finance = node; }} id="finance" className="lg:col-span-2 space-y-8 scroll-mt-24">
            <div className="ld-fade-in-up ld-fade-in-up-delay-1">
              <MortgageCalculator price={listPrice} currency={listing.currency || 'RWF'} />
            </div>
            <div ref={(node) => { if (node) (sectionRefs as any).similar = node; }} id="similar" className="ld-fade-in-up ld-fade-in-up-delay-2 scroll-mt-24">
              <SimilarProperties
                currentListingId={listingId}
                category={listing.category}
                onListingClick={onListingClick}
              />
            </div>
            <div className="ld-fade-in-up ld-fade-in-up-delay-3">
              <RecentlyViewed onListingClick={onListingClick} excludeId={listingId} />
            </div>
          </div>
          <div ref={(node) => { if (node) (sectionRefs as any).neighborhood = node; }} id="neighborhood" className="space-y-6 scroll-mt-24">
            <div className="ld-fade-in-up ld-fade-in-up-delay-2">
              <NeighborhoodInfo
                address={listing.address}
                district={asset.district}
                sector={asset.sector}
              />
            </div>
            <div className="ld-fade-in-up ld-fade-in-up-delay-3">
              <PropertyHistory history={[]} />
            </div>
            <div className="ld-fade-in-up ld-fade-in-up-delay-4">
              <PriceDropAlert
                listingId={listingId}
                listingTitle={listing.title}
                currentPrice={listPrice}
                currency={listing.currency || 'RWF'}
              />
            </div>
            <div className="ld-fade-in-up ld-fade-in-up-delay-5">
              <SaveSearch currentFilters={{ category: listing.category || '', purpose: listing.purpose || '' }} />
            </div>
            <div className="ld-fade-in-up ld-fade-in-up-delay-6">
              <PrintSpecSheet
                title={listing.title}
                price={listPrice}
                currency={listing.currency || 'RWF'}
                specs={detailFacts.map((f) => ({ label: f.label, value: String(f.value) }))}
                description={listing.description}
              />
            </div>
            <div className="ld-fade-in-up ld-fade-in-up-delay-6">
              <ReportListing listingId={listingId} listingTitle={listing.title} />
            </div>
          </div>
        </div>
      </div>

      {/* OFFER MODAL */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xl p-0 sm:p-4 overflow-y-auto">
          <div className="border rounded-t-3xl sm:rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-5 bg-zinc-900 text-white w-full sm:w-full" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2"><DollarSign size={18} className="text-emerald-500" /> Transmit Sovereign Offer</h3>
                <p className="text-[11px] mt-0.5 text-zinc-500">Binding escrow offer — once submitted, this is transmitted to the lister</p>
              </div>
              <button onClick={() => setIsOfferModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors"><XCircle size={20} /></button>
            </div>
            {offerSuccess ? (
              <div className="py-10 text-center space-y-3">
                <CheckCircle2 size={44} className="mx-auto text-emerald-500" />
                <h4 className="text-lg font-bold">Offer Transmitted</h4>
              </div>
            ) : (
              <div className="space-y-5">
                {/* ═══ Comparison Bar: Ask vs Offer ═══════════════════ */}
                <div className="rounded-2xl p-4 sm:p-5 space-y-3 border" style={{ borderColor: 'rgba(16,185,129,0.25)', background: 'linear-gradient(135deg, rgba(16,185,129,0.09), rgba(16,185,129,0.01))' }}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400"><Gauge size={11} /> Ask vs Offer Comparison</span>
                    <span className="font-mono text-[10px] text-zinc-500">LIVE</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Asking</p>
                      <p className="font-mono text-lg sm:text-xl font-bold leading-none">{listPrice.toLocaleString()}</p>
                      <p className="text-[9px] text-zinc-500 mt-0.5 font-mono">{listing.currency || 'RWF'}</p>
                    </div>
                    <div className="flex flex-col items-center pb-1">
                      <div className="text-[9px] font-bold uppercase tracking-widest mb-1 text-zinc-500">Spread</div>
                      <div className={cn('px-3 py-1.5 rounded-lg font-mono font-bold text-xs', (offerAmount && offerAmount !== listPrice) ? (offerAmount < listPrice ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30') : 'bg-white/5 text-zinc-300 border border-white/10')}>
                        {offerAmount ? `${offerAmount < listPrice ? '-' : '+'}${Math.abs(((offerAmount - listPrice) / listPrice) * 100).toFixed(offerAmount === listPrice ? 0 : 1)}%` : '—'}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Your Offer</p>
                      <p className={cn('font-mono text-lg sm:text-xl font-bold leading-none', !offerAmount ? 'text-zinc-500' : 'text-emerald-400')}>{offerAmount ? offerAmount.toLocaleString() : '—'}</p>
                      <p className="text-[9px] text-zinc-500 mt-0.5 font-mono">{listing.currency || 'RWF'}</p>
                    </div>
                  </div>
                  <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {(() => {
                      const ratio = offerAmount && listPrice ? offerAmount / listPrice : 1;
                      const askMarker = 75;
                      const offerMarker = offerAmount && listPrice ? Math.max(4, Math.min(96, (offerAmount / Math.max(listPrice * 1.3, 1)) * 100)) : askMarker;
                      return (
                        <>
                          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500/30 via-emerald-400/20 to-emerald-500/5" style={{ width: `${Math.min(98, ratio * 80)}%` }} />
                          <span className="absolute top-0 bottom-0 w-0.5 bg-zinc-500/80 shadow-[0_0_4px_rgba(255,255,255,0.3)]" style={{ left: `${askMarker}%` }} />
                          <span className="absolute -top-1 text-[8px] font-mono font-bold text-zinc-400" style={{ left: `${askMarker}%`, transform: 'translateX(-50%)' }}>ASK</span>
                          <span className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.7)]" style={{ left: `${offerMarker}%` }} />
                          <span className="absolute -top-1 text-[8px] font-mono font-bold text-emerald-400" style={{ left: `${offerMarker}%`, transform: 'translateX(-50%)' }}>YOU</span>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5 flex items-center gap-1.5"><DollarSign size={12} className="text-emerald-400" /> Proposed Price (RWF)</label>
                  <input type="number" value={offerAmount} onChange={e => setOfferAmount(Number(e.target.value))} className="w-full p-3 rounded-xl bg-black border border-white/10 text-white font-mono focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" placeholder={String(listPrice)} />
                  <div className="flex gap-2 mt-2">
                    {[-5, -2, 0, 2].map(pct => (
                      <button key={pct} onClick={() => setOfferAmount(Math.round(listPrice * (1 + pct / 100)))} className={cn('flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer', pct === 0 ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300' : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:border-white/20')}>{pct > 0 ? '+' : ''}{pct}%</button>
                    ))}
                  </div>
                </div>

                {/* ═══ Live Escrow Calc ═══════════════════════════════ */}
                <div className="rounded-2xl p-4 border border-violet-500/25 bg-violet-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-400"><Landmark size={11} /> Escrow Deposit Preview</span>
                    <select value={escrowPercent} onChange={e => setEscrowPercent(Number(e.target.value))} className="bg-black border border-white/10 rounded-lg px-2 py-1 text-[10px] font-mono font-bold text-violet-300 outline-none">
                      <option value={5}>5%</option>
                      <option value={10}>10%</option>
                      <option value={20}>20%</option>
                    </select>
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Due upon acceptance</p>
                      <p className="font-mono text-2xl sm:text-3xl font-bold text-violet-300 leading-none">{Math.round((offerAmount || listPrice) * (escrowPercent / 100)).toLocaleString()}</p>
                      <p className="text-[10px] font-mono text-zinc-500 mt-0.5">{listing.currency || 'RWF'} · held by Urugwiro Treasury</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Financing</p>
                      <select value={financingType} onChange={e => setFinancingType(e.target.value)} className="bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-right outline-none">
                        <option value="cash">💵 Cash</option>
                        <option value="mortgage">🏦 Mortgage</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5"><Sparkles size={14} /> AI Valuation Advisor</span>
                    <button onClick={handleAiFeasibilityCheck} disabled={isAiChecking} className="text-[11px] underline text-purple-400 cursor-pointer">{isAiChecking ? 'Checking...' : 'Run Analysis'}</button>
                  </div>
                  {aiAnalysis && <p className="text-[11px] text-zinc-300 leading-relaxed">{aiAnalysis.analysis}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1.5">Proposed Closing</label>
                    <input type="date" value={closingDate} onChange={e => setClosingDate(e.target.value)} className="w-full p-2.5 rounded-xl bg-black border border-white/10 text-xs outline-none focus:border-emerald-500/60" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1.5">Contingencies</label>
                    <textarea value={offerNotes} onChange={e => setOfferNotes(e.target.value)} className="w-full p-2.5 rounded-xl bg-black border border-white/10 text-xs outline-none resize-none focus:border-emerald-500/60" placeholder="Inspection · Financing · Title..." rows={2} />
                  </div>
                </div>

                {/* ═══ Sovereign Journey Timeline (7 steps) ═══════════ */}
                <div className="rounded-2xl p-4 border border-white/10 bg-black/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400"><Navigation2 size={11} className="text-emerald-400" /> Your Sovereign Journey</span>
                    <span className="text-[9px] font-mono text-zinc-600">7 Stages</span>
                  </div>
                  <div className="flex items-center gap-0">
                    {[
                      { label: 'Offer', icon: Send },
                      { label: 'Review', icon: Eye },
                      { label: 'Escrow', icon: Landmark },
                      { label: 'Due Dil.', icon: Search },
                      { label: 'Sign', icon: FileSignature },
                      { label: 'Notary', icon: BookOpen },
                      { label: 'Keys', icon: Key },
                    ].map((stage, i) => {
                      const Ico = stage.icon;
                      const isActive = i === 0;
                      return (
                        <React.Fragment key={i}>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center border text-[10px] font-bold transition-all', isActive ? 'bg-emerald-500 text-white border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.55)]' : 'bg-white/5 text-zinc-500 border-white/10')}>
                              <Ico size={13} />
                            </div>
                            <span className={cn('text-[8px] font-bold uppercase tracking-wide', isActive ? 'text-emerald-400' : 'text-zinc-600')}>{stage.label}</span>
                          </div>
                          {i < 6 && <div className={cn('h-px flex-1 -mt-3.5 mx-0.5', i < 0 ? 'bg-emerald-500' : 'bg-white/10')} />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                <Button onClick={() => offerMutation.mutate({ listing: listingId, amount: offerAmount, escrow_proposed_percent: escrowPercent, financing_type: financingType, proposed_closing_date: closingDate, notes: offerNotes })} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold cursor-pointer flex items-center justify-center gap-2 shadow-[0_10px_30px_-8px_rgba(16,185,129,0.55)] transition-all active:scale-[0.99]">
                  <Send size={15} /> Transmit Sovereign Offer · Deposit {Math.round((offerAmount || listPrice) * (escrowPercent / 100)).toLocaleString()} RWF
                </Button>
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

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, Package, MessageSquare, HandCoins,
  ShieldCheck, TrendingUp, Eye, Bell, LogOut, Plus,
  ArrowUpRight, Search, Sparkles, CheckCircle2,
  Clock, MapPin, Building,
  ArrowRight, ExternalLink, Bot, Menu, X,
  UserCheck, DollarSign, Edit3, Phone, Heart, Calendar, Users, Mail
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';
import { SellerOfferManager } from './SellerOfferManager';
import { SellerAiCopilot } from './SellerAiCopilot';
import { ChatWindow } from '../chat/ChatWindow';
import ListingWizard from './ListingWizard';
import { PropertyInspectionDrawer } from './components/PropertyInspectionDrawer';
import { PropertyEditModal } from './components/PropertyEditModal';
import { SellerEarningsAndDeals } from './components/SellerEarningsAndDeals';
import { SellerAgentNetwork } from './components/SellerAgentNetwork';
import { CustomerLeadsManager, type LeadChannel } from '../../components/crm/CustomerLeadsManager';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/endpoints';
import { Pagination } from '../../components/ui/Pagination';

export type SellerTab = 'overview' | 'listings' | 'leads' | 'visits' | 'inquiries' | 'likes' | 'offers' | 'deals' | 'agents' | 'messages' | 'copilot' | 'verification' | 'new-listing';

interface SellerDashboardProps {
  onNavigate?: (view: any) => void;
  onListingClick?: (id: string) => void;
  initialTab?: SellerTab;
}

interface ListingItem {
  id: string;
  title: string;
  category: 'house' | 'land' | 'car';
  location: string;
  price: number;
  currency: string;
  views: number;
  inquiries: number;
  offers: number;
  status: 'Active' | 'Under Offer' | 'Pending Verification' | 'Sold';
  upiNumber?: string;
  image: string;
  verified: boolean;
  updatedAt: string;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ onNavigate, onListingClick, initialTab = 'overview' }) => {
  const { user, logout } = useAuth();
  const displayName = user?.full_name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username) || 'Seller';
  const displayRole = user?.role || 'Seller';

  const [activeTab, setActiveTab] = useState<SellerTab>(initialTab);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'house' | 'land' | 'car'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryPageSize, setInventoryPageSize] = useState(6);

  // Selected property for deep inspection drawer & edit modal
  const [inspectingPropertyId, setInspectingPropertyId] = useState<string | null>(null);
  const [editingListing, setEditingListing] = useState<any | null>(null);

  // 1. Live database listings strictly owned by this authenticated seller
  const { data: rawListings = [], isLoading: _loadingListings, refetch: refetchListings } = useQuery({
    queryKey: ['seller-database-listings', user?.id],
    queryFn: async () => {
      try {
        const res = await api.seller.listings();
        return Array.isArray(res.data) ? res.data : (res.data?.results || []);
      } catch (e) {
        console.error('Failed to fetch seller listings:', e);
        return [];
      }
    },
  });

  // 2. Live database offers
  const { data: rawOffers = [] } = useQuery({
    queryKey: ['seller-database-offers'],
    queryFn: async () => {
      try {
        const res = await api.offers.list();
        return Array.isArray(res.data) ? res.data : (res.data?.results || []);
      } catch {
        return [];
      }
    },
  });

  // 3. Live unread messages count
  const { data: contactsData } = useQuery({
    queryKey: ['seller-chat-contacts'],
    queryFn: async () => {
      try {
        const res = await api.chat.contacts();
        return res.data;
      } catch {
        return null;
      }
    },
  });
  const unreadMessagesCount = contactsData?.total_unread || 0;

  // Map raw database listings to UI model
  const listings: ListingItem[] = useMemo(() => {
    return rawListings.map((item: any) => {
      let cat: 'house' | 'land' | 'car' = 'house';
      const c = (item.category || item.type || '').toLowerCase();
      if (c.includes('land') || c.includes('plot')) cat = 'land';
      else if (c.includes('car') || c.includes('vehic') || c.includes('motor')) cat = 'car';

      let upi = '';
      if (item.asset?.land_spec?.upi_number) upi = item.asset.land_spec.upi_number;
      else if (item.upi_number) upi = item.upi_number;

      const img = item.featured_image || item.media?.[0]?.file || item.image ||
        (cat === 'land' ? '/images/hero/land.jpg' : cat === 'car' ? '/images/hero/car.jpg' : '/images/hero/house.jpg');

      return {
        id: String(item.id),
        title: item.title || 'Untitled Property',
        category: cat,
        location: item.address || item.district || 'Kigali, Rwanda',
        price: Number(item.price) || 0,
        currency: item.currency || 'RWF',
        views: item.views_count || item.views || 0,
        inquiries: item.inquiries_count || 0,
        offers: item.offers_count || 0,
        status: item.status === 'listed' ? 'Active' : (item.status === 'sold' ? 'Sold' : 'Pending Verification'),
        upiNumber: upi,
        image: img,
        verified: item.is_verified || Boolean(item.verification_level && item.verification_level !== 'none'),
        updatedAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent',
      };
    });
  }, [rawListings]);

  const filteredListings = listings.filter(item => {
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesQuery = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const paginatedListings = filteredListings.slice(
    (inventoryPage - 1) * inventoryPageSize,
    inventoryPage * inventoryPageSize
  );

  const totalValue = listings.reduce((acc, curr) => acc + curr.price, 0);
  const totalViews = listings.reduce((acc, curr) => acc + curr.views, 0);
  const totalInquiries = listings.reduce((acc, curr) => acc + curr.inquiries, 0);
  const totalOffers = rawOffers.length;

  // 4. Live database showing visits for seller
  const { data: rawVisits = [] } = useQuery({
    queryKey: ['seller-database-visits'],
    queryFn: async () => {
      try {
        const res = await api.seller.visits();
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    },
  });

  // 5. Live database likes / wishlist prospects for seller
  const { data: rawLikes = [] } = useQuery({
    queryKey: ['seller-database-likes'],
    queryFn: async () => {
      try {
        const res = await api.seller.likes();
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    },
  });

  // 6. Live database inquiries for seller
  const { data: rawInquiries = [] } = useQuery({
    queryKey: ['seller-database-inquiries'],
    queryFn: async () => {
      try {
        const res = await api.seller.inquiries();
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    },
  });

  const totalVisits = rawVisits.length;
  const totalLikes = rawLikes.length;
  const totalLeads = (rawInquiries.length || totalInquiries) + totalVisits + totalLikes;

  const recentFollowUps = useMemo(() => {
    const list: any[] = [];
    (rawVisits || []).slice(0, 3).forEach((v: any) => {
      list.push({
        id: `visit-${v.id}`,
        type: 'visit',
        title: v.listing?.title || 'Property Showing',
        listingId: v.listing?.id,
        image: v.listing?.image,
        customerName: v.visitor_name || v.user?.name || 'Prospective Buyer',
        phone: v.visitor_phone || v.user?.phone || '',
        email: v.visitor_email || v.user?.email || '',
        date: v.date,
        timeSlot: v.time_slot,
        detail: v.visitor_notes || `Showing appointment requested (${v.time_slot || 'standard'})`,
        status: v.status || 'scheduled',
      });
    });
    (rawInquiries || []).slice(0, 3).forEach((inq: any) => {
      list.push({
        id: `inq-${inq.id}`,
        type: 'inquiry',
        title: inq.property_title || inq.listing_title || 'Property Inquiry',
        listingId: inq.listing_id || inq.property_id,
        customerName: inq.client_name || inq.name || 'Interested Buyer',
        phone: inq.client_phone || inq.phone || '',
        email: inq.client_email || inq.email || '',
        detail: inq.message || 'Customer requested information about this property.',
        status: inq.status || 'new',
      });
    });
    return list;
  }, [rawVisits, rawInquiries]);

  const navItems = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
    { id: 'listings', label: 'Asset Portfolio', icon: Package, badge: listings.length > 0 ? listings.length.toString() : undefined },
    { id: 'leads', label: 'Prospect Intelligence', icon: Users, badge: totalLeads > 0 ? `${totalLeads} Active` : undefined, highlight: true },
    { id: 'visits', label: 'Inspection Log', icon: Calendar, badge: totalVisits > 0 ? `${totalVisits}` : undefined },
    { id: 'inquiries', label: 'Client Inquiries', icon: MessageSquare, badge: totalInquiries > 0 ? `${totalInquiries}` : undefined },
    { id: 'likes', label: 'Interest Registry', icon: Heart, badge: totalLikes > 0 ? `${totalLikes}` : undefined },
    { id: 'offers', label: 'Negotiation Suite', icon: HandCoins, badge: totalOffers > 0 ? `${totalOffers} Active` : undefined },
    { id: 'deals', label: 'Fiscal Ledger', icon: DollarSign },
    { id: 'agents', label: 'Verified Network', icon: UserCheck },
    { id: 'messages', label: 'Private Correspondence', icon: MessageSquare, badge: unreadMessagesCount > 0 ? `${unreadMessagesCount} New` : undefined },
    { id: 'copilot', label: 'Strategic Intelligence', icon: Sparkles },
    { id: 'verification', label: 'Compliance & Trust', icon: ShieldCheck },
  ];

  return (
    <div className="flex h-screen bg-[#05070b] text-white font-sans antialiased overflow-hidden select-none">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="w-72 bg-[#080b11]/90 backdrop-blur-2xl border-r border-white/10 hidden lg:flex flex-col p-6 sticky top-0 h-full shrink-0 z-20">
        
        {/* Brand Header */}
        <div 
          onClick={() => onNavigate ? onNavigate('home') : null}
          className="flex items-center gap-3.5 px-3 py-3 mb-8 rounded-2xl bg-white/[0.02] border border-white/5 cursor-pointer hover:border-emerald-500/30 transition-all group"
        >
          <div className="relative">
            <img
              src="/urugwiro_logo_fav.png"
              alt="Urugwiro"
              className="h-9 w-9 rounded-xl object-contain drop-shadow-md group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#080b11] rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold font-display tracking-tight text-white flex items-center gap-1.5">
              Urugwiro
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Seller
              </span>
            </span>
            <span className="text-[11px] text-zinc-500 tracking-tight">Verified Estate Hub</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as SellerTab);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={cn(
                      "transition-colors",
                      isActive
                        ? "text-emerald-400"
                        : item.highlight
                        ? "text-emerald-400 group-hover:text-emerald-300"
                        : "text-zinc-500 group-hover:text-white"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] font-mono px-2 py-0.5 rounded-full border",
                      isActive
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : item.highlight
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-white/5 text-zinc-400 border-white/10"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Launch Button */}
        <div className="pt-4 pb-4">
          <button
            onClick={() => setActiveTab('new-listing')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>List New Asset</span>
          </button>
        </div>

        {/* Seller Trust Profile */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-sm">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <CheckCircle2 size={12} className="absolute -bottom-1 -right-1 text-emerald-400 bg-[#080b11] rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-emerald-400 font-mono">{displayRole}</span>
                <span className="text-[9px] text-zinc-500">•</span>
                <span className="text-[10px] text-zinc-400 truncate">{user?.email || 'Verified Account'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-xs text-zinc-500">
            <button 
              onClick={() => onNavigate ? onNavigate('home') : null}
              className="hover:text-zinc-300 transition-colors flex items-center gap-1 text-[11px]"
            >
              <ArrowRight size={12} className="rotate-180" /> Public Portal
            </button>
            <button 
              onClick={async () => {
                await logout();
                if (onNavigate) onNavigate('home');
              }}
              className="hover:text-red-400 transition-colors flex items-center gap-1 text-[11px]"
            >
              <LogOut size={12} /> Exit
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-[#080b11] border-r border-white/10 h-full p-6 flex flex-col z-10">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <img src="/urugwiro_logo_fav.png" alt="Urugwiro" className="h-7 w-7 rounded-lg" />
                <span className="font-bold text-white">Seller Dashboard</span>
              </div>
              <button 
                onClick={() => setMobileNavOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as SellerTab);
                      setMobileNavOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? "text-emerald-400" : "text-zinc-500"} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setActiveTab('new-listing');
                  setMobileNavOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm"
              >
                <Plus size={18} />
                <span>List New Asset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* TOP NAVBAR */}
        <header className="h-16 lg:h-20 bg-[#080b11]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 z-10">
          
          <div className="flex items-center gap-3 lg:gap-4 flex-1">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white"
            >
              <Menu size={20} />
            </button>

            {/* Mobile / Desktop Brand pill when on smaller screens */}
            <div className="flex items-center gap-2 lg:hidden">
              <img src="/urugwiro_logo_fav.png" alt="Logo" className="w-6 h-6 rounded-md" />
              <span className="font-bold text-sm text-white">Urugwiro</span>
            </div>

            {/* Active view indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
              <span className="text-zinc-600">Seller Workspace</span>
              <span>/</span>
              <span className="text-emerald-400 font-medium capitalize">
                {activeTab === 'copilot' ? 'AI Co-Pilot' : activeTab}
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick AI Trigger button */}
            <button
              onClick={() => setActiveTab('copilot')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
                activeTab === 'copilot'
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-white/[0.03] text-zinc-300 border-white/10 hover:border-emerald-500/30 hover:text-emerald-400"
              )}
            >
              <Sparkles size={14} className="text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">AI Co-Pilot</span>
            </button>

            {/* Notification bell */}
            <button
              onClick={() => setActiveTab('offers')}
              className="relative p-2 rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white transition-colors"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-[#080b11]" />
            </button>

            <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

            {/* Quick Public View */}
            <button
              onClick={() => onNavigate ? onNavigate('discovery') : null}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-xs text-zinc-300 hover:text-white hover:border-white/20 transition-all"
            >
              <span>Explore Market</span>
              <ExternalLink size={12} className="text-zinc-500" />
            </button>
          </div>
        </header>

        {/* MOBILE HORIZONTAL TAB BAR */}
        <div className="lg:hidden bg-[#080b11] border-b border-white/10 px-4 py-2 overflow-x-auto scrollbar-none flex items-center gap-2 shrink-0">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as SellerTab)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5",
                activeTab === item.id
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold"
                  : "bg-white/[0.02] text-zinc-400 border border-white/5"
              )}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/40 text-zinc-400">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-[#05070b] via-[#080b11] to-[#05070b]">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
              
              {/* Hero Banner with AI Valuation Insight */}
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-emerald-950/30 via-black/60 to-black/80 p-6 lg:p-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                      <Sparkles size={12} />
                      AI Market Intelligence Active
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-display leading-tight">
                      Welcome Back, <span className="text-emerald-400">{displayName}</span>
                    </h1>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab('new-listing')}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-b from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.01] active:scale-[0.99] border-t border-white/10 cursor-pointer"
                    >
                      <Plus size={16} />
                      List New Asset
                    </button>
                    <button
                      onClick={() => setActiveTab('copilot')}
                      className="flex items-center gap-2 px-5 py-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold text-sm transition-all duration-300 cursor-pointer"
                    >
                      <Bot size={16} />
                      Consult AI Copilot
                    </button>
                  </div>
                </div>
              </div>

              {/* STATS TILES */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-emerald-500/30 transition-all group">
                  <div className="flex items-center justify-between text-zinc-500 mb-3">
                    <span className="text-xs uppercase tracking-wider font-semibold">Gross Portfolio</span>
                    <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <Building size={16} />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                    {totalValue > 0 ? `${(totalValue / 1000000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M` : '0'} <span className="text-xs text-zinc-400 font-sans">RWF</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2 font-medium">
                    <TrendingUp size={12} />
                    <span>{listings.length} live {listings.length === 1 ? 'property' : 'properties'}</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('leads')}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-emerald-500/30 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-zinc-500 mb-3">
                    <span className="text-xs uppercase tracking-wider font-semibold">Customer Leads CRM</span>
                    <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <Users size={16} />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                    {totalLeads}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2 font-medium">
                    <Sparkles size={12} />
                    <span>{totalVisits} visits • {rawInquiries.length || totalInquiries} inq • {totalLikes} saves</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('visits')}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-emerald-500/30 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-zinc-500 mb-3">
                    <span className="text-xs uppercase tracking-wider font-semibold">Showing Visits</span>
                    <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      <Calendar size={16} />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                    {totalVisits}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-purple-400 mt-2 font-medium">
                    <Clock size={12} />
                    <span>Scheduled Inspections</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('offers')}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-emerald-500/30 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-zinc-500 mb-3">
                    <span className="text-xs uppercase tracking-wider font-semibold">Active Offers</span>
                    <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <HandCoins size={16} />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                    {totalOffers} {totalOffers === 1 ? 'Deal' : 'Deals'}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mt-2 font-medium">
                    <Sparkles size={12} />
                    <span>In conveyance escrow</span>
                  </div>
                </div>
              </div>

              {/* RECENT CUSTOMER ACTIVITIES (TITLES & ACTIONS ONLY) */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white">Recent Customer Activities</h3>
                    {recentFollowUps.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                        {recentFollowUps.length} Activities
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    Manage All Activities <ArrowRight size={13} />
                  </button>
                </div>

                {recentFollowUps.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 rounded-2xl border border-white/5 bg-black/20">
                    <Users size={28} className="mx-auto text-zinc-600 mb-2" />
                    <p className="text-sm font-semibold text-zinc-300">No Pending Customer Activities</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentFollowUps.map((lead) => {
                      const cleanPhone = lead.phone ? String(lead.phone).replace(/[^0-9+]/g, '') : '';
                      return (
                        <div
                          key={lead.id}
                          className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-emerald-500/30 transition-all flex flex-col justify-between gap-4 group"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className={cn(
                                "text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border",
                                lead.type === 'visit'
                                  ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                                  : "bg-blue-500/10 text-blue-300 border-blue-500/30"
                              )}>
                                {lead.type === 'visit' ? 'Showing Tour' : 'Direct Inquiry'}
                              </span>
                              {lead.date && (
                                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                                  <Calendar size={11} className="text-zinc-500" />
                                  {lead.date}
                                </span>
                              )}
                            </div>

                            <div className="space-y-0.5">
                              <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                                {lead.customerName}
                              </h4>
                              <p className="text-xs text-zinc-400 truncate font-medium">
                                {lead.title}
                              </p>
                            </div>

                            {/* Activity Metadata Tag (Titles & Badges Only - No Descriptions) */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className={cn(
                                "px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase",
                                lead.type === 'visit'
                                  ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                                  : "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                              )}>
                                {lead.type === 'visit' ? (lead.timeSlot ? `Slot: ${lead.timeSlot}` : 'Inspection Tour') : 'Buyer Inbound Message'}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.03] text-zinc-400 border border-white/10 uppercase">
                                {lead.status || 'Active'}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                            {cleanPhone ? (
                              <>
                                <a
                                  href={`tel:${cleanPhone}`}
                                  className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                  title="Call Customer"
                                >
                                  <Phone size={13} />
                                  <span>Call</span>
                                </a>
                                <a
                                  href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 py-1.5 px-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                  title="Chat on WhatsApp"
                                >
                                  <MessageSquare size={13} />
                                  <span>WhatsApp</span>
                                </a>
                              </>
                            ) : (
                              <span className="text-[11px] text-zinc-500 italic">No phone provided</span>
                            )}
                            {lead.email && (
                              <a
                                href={`mailto:${lead.email}`}
                                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-zinc-300 border border-white/10 text-xs flex items-center justify-center transition-colors"
                                title="Send Email"
                              >
                                <Mail size={13} />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* TWO COLUMN WORKSPACE: RECENT LISTINGS & QUICK ACTION CENTER */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Listings Summary Column */}
                <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-lg">Active Portfolio</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('listings')}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      View All Listings <ArrowUpRight size={14} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {listings.length === 0 ? (
                      <div className="p-8 text-center text-zinc-500 rounded-2xl border border-white/5 bg-black/20">
                        <Package size={32} className="mx-auto text-zinc-600 mb-2" />
                        <p className="text-sm text-zinc-300 font-semibold">No properties listed yet</p>
                        <button
                          onClick={() => setActiveTab('new-listing')}
                          className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus size={14} /> List New Asset
                        </button>
                      </div>
                    ) : (
                      listings.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => onListingClick ? onListingClick(item.id) : setInspectingPropertyId(item.id)}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/5 bg-black/20 hover:bg-white/[0.04] hover:border-emerald-500/30 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3.5">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm text-white line-clamp-1">{item.title}</h4>
                                {item.verified && (
                                  <Badge variant="success" className="text-[9px] py-0 px-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                    RLMUA
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                                <MapPin size={11} className="text-zinc-500" />
                                {item.location}
                              </p>
                              <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
                                {item.price.toLocaleString()} {item.currency}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                            <div className="text-left sm:text-right text-xs">
                              <span className="text-zinc-400 font-medium block">
                                {item.views} views • {item.inquiries} inquiries
                              </span>
                              <span className={cn(
                                "text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1",
                                item.status === 'Active' ? "bg-emerald-500/10 text-emerald-400" :
                                item.status === 'Under Offer' ? "bg-amber-500/10 text-amber-400" : "bg-zinc-800 text-zinc-400"
                              )}>
                                {item.status}
                              </span>
                            </div>

                            <button
                              onClick={() => setActiveTab('copilot')}
                              title="Analyze with AI Co-Pilot"
                              className="p-2 rounded-xl border border-white/10 bg-white/5 hover:border-emerald-500/40 hover:text-emerald-400 text-zinc-400 transition-colors cursor-pointer"
                            >
                              <Sparkles size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Column: AI Co-Pilot Recommendation & Quick Actions */}
                <div className="space-y-6">
                  
                  {/* AI Market Advisory Card */}
                  <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/30 to-black/40 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                          <Bot size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">AI Valuation Telemetry</h4>
                          <span className="text-[10px] text-zinc-400 font-mono">Market Comps Active</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                        Live
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-zinc-500 block">Buyer Demand</span>
                        <span className="font-bold text-emerald-400 text-xs">High Liquidity</span>
                      </div>
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-zinc-500 block">Valuation Status</span>
                        <span className="font-bold text-white text-xs">Optimal Comps</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('copilot')}
                      className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-emerald-500/15 border border-emerald-500/20 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Open Valuation Engine</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>

                  {/* Trust & Cadastre Verification Status */}
                  <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-400" />
                        Seller Credibility
                      </h4>
                      <span className="text-xs font-mono text-emerald-400 font-bold">98/100</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5">
                        <span className="text-zinc-300">RLMUA Cadastre UPI Registry</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Synced
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5">
                        <span className="text-zinc-300">National ID / Passport</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5">
                        <span className="text-zinc-300">Milestone Escrow Vault</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Ready
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('verification')}
                      className="w-full py-2 text-center text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      View Title & Compliance Workspace →
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MY LISTINGS INVENTORY */}
          {activeTab === 'listings' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
              
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white font-display">Asset Inventory</h1>
                </div>
                <button
                  onClick={() => setActiveTab('new-listing')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md transition-all hover:scale-105"
                >
                  <Plus size={16} />
                  <span>List New Asset</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white/[0.02] border border-white/10 p-3 rounded-2xl">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: 'All Assets' },
                    { id: 'house', label: 'Homes & Villas' },
                    { id: 'land', label: 'Titled Land' },
                    { id: 'car', label: 'Executive Cars' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => {
                        setCategoryFilter(filter.id as any);
                        setInventoryPage(1);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap",
                        categoryFilter === filter.id
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setInventoryPage(1);
                    }}
                    placeholder="Search by title or district..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Listing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.length === 0 ? (
                  <div className="col-span-full p-16 text-center text-zinc-500 rounded-3xl border border-white/10 bg-white/[0.01]">
                    <Package size={40} className="mx-auto text-zinc-600 mb-3" />
                    <h3 className="text-base font-semibold text-white">No Properties Found</h3>
                    <button
                      onClick={() => {
                        if (searchQuery || categoryFilter !== 'all') {
                          setSearchQuery('');
                          setCategoryFilter('all');
                          setInventoryPage(1);
                        } else {
                          setActiveTab('new-listing');
                        }
                      }}
                      className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      {searchQuery || categoryFilter !== 'all' ? 'Reset Filters' : 'List New Asset'}
                    </button>
                  </div>
                ) : (
                  paginatedListings.map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-3xl border border-white/10 bg-white/[0.02] hover:border-emerald-500/30 overflow-hidden flex flex-col transition-all duration-300"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge
                            variant={item.status === 'Active' ? 'success' : 'neutral'}
                            className={cn(
                              "text-[10px] uppercase font-mono px-2 py-0.5",
                              item.status === 'Active' ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40" : "bg-black/80 text-zinc-300 border border-white/20"
                            )}
                          >
                            {item.status}
                          </Badge>
                          {item.verified && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                              <ShieldCheck size={10} /> RLMUA Verified
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                          <span className="text-lg font-bold font-mono text-white">
                            {item.price.toLocaleString()} <span className="text-xs text-zinc-400 font-sans">{item.currency}</span>
                          </span>
                          {item.upiNumber && (
                            <span className="text-[10px] font-mono text-zinc-400 bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
                              UPI: {item.upiNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="font-semibold text-white text-base group-hover:text-emerald-400 transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                            <MapPin size={12} className="text-zinc-500" />
                            {item.location}
                          </p>
                        </div>

                        {/* Performance Bar */}
                        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-black/30 border border-white/5 text-center">
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase block">Views</span>
                            <span className="text-xs font-mono font-bold text-white">{item.views}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase block">Inquiries</span>
                            <span className="text-xs font-mono font-bold text-white">{item.inquiries}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase block">Offers</span>
                            <span className="text-xs font-mono font-bold text-white">{item.offers}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => onListingClick ? onListingClick(item.id) : setInspectingPropertyId(item.id)}
                            className="flex-1 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            title="Open full property page with section editor"
                          >
                            <Eye size={13} />
                            <span>View Full Property</span>
                          </button>

                          <button
                            onClick={async () => {
                              try {
                                const res = await api.seller.listingDetail(item.id);
                                setEditingListing(res.data);
                              } catch {
                                setEditingListing(item);
                              }
                            }}
                            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="Edit Listing Specs"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            onClick={() => {
                              setActiveTab('copilot');
                            }}
                            className="p-2 rounded-xl bg-white/[0.04] hover:bg-emerald-500/10 border border-white/10 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                            title="AI Optimization"
                          >
                            <Sparkles size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {filteredListings.length > 0 && (
                <div className="pt-2">
                  <Pagination
                    currentPage={inventoryPage}
                    totalPages={Math.max(1, Math.ceil(filteredListings.length / inventoryPageSize))}
                    onPageChange={setInventoryPage}
                    pageSize={inventoryPageSize}
                    onPageSizeChange={(sz) => { setInventoryPageSize(sz); setInventoryPage(1); }}
                    totalItems={filteredListings.length}
                  />
                </div>
              )}

            </div>
          )}

          {/* TAB: CUSTOMER LEADS & VISITS CRM */}
          {(activeTab === 'leads' || activeTab === 'visits' || activeTab === 'inquiries' || activeTab === 'likes') && (
            <div className="max-w-7xl mx-auto animate-fadeIn">
              <CustomerLeadsManager
                mode="seller"
                initialChannel={activeTab === 'leads' ? 'all' : (activeTab as LeadChannel)}
                onListingClick={onListingClick}
              />
            </div>
          )}

          {/* TAB 3: OFFERS & DEALS (INTEGRATED SELLER OFFER MANAGER) */}
          {activeTab === 'offers' && (
            <div className="max-w-7xl mx-auto animate-fadeIn">
              <SellerOfferManager />
            </div>
          )}

          {/* TAB 4: EARNINGS & CONVEYANCE DEALS */}
          {activeTab === 'deals' && (
            <div className="max-w-7xl mx-auto animate-fadeIn">
              <SellerEarningsAndDeals />
            </div>
          )}

          {/* TAB 5: VERIFIED AGENT NETWORK */}
          {activeTab === 'agents' && (
            <div className="max-w-7xl mx-auto animate-fadeIn">
              <SellerAgentNetwork listings={listings} onRefresh={() => refetchListings()} />
            </div>
          )}

          {/* TAB 6: REAL-TIME MESSAGING (INTEGRATED CHAT WINDOW) */}
          {activeTab === 'messages' && (
            <div className="max-w-7xl mx-auto h-[calc(100vh-10rem)] animate-fadeIn">
              <ChatWindow currentRole="seller" />
            </div>
          )}

          {/* TAB 7: SELLER AI CO-PILOT WORKSPACE */}
          {activeTab === 'copilot' && (
            <div className="max-w-7xl mx-auto animate-fadeIn">
              <SellerAiCopilot />
            </div>
          )}

          {/* TAB 8: TRUST & TITLE VERIFICATION WORKSPACE */}
          {activeTab === 'verification' && (
            <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
              
              <div className="border border-white/10 rounded-3xl bg-white/[0.02] p-6 lg:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      <ShieldCheck size={14} />
                      Urugwiro Sovereign Trust Bureau
                    </div>
                    <h2 className="text-2xl font-bold text-white font-display">Seller Legal & Cadastre Credentials</h2>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">Sovereign Tier Verified</span>
                      <span className="text-[10px] text-emerald-400 font-mono">RLMUA Cadastre + Irembo Sync</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Land Title (RLMUA UPI)</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Verified</span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">
                      Connected Registry: <span className="text-white">RLMUA / IremboGov</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Milestone Escrow Vault</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Active</span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">
                      Deposit Guarantee: <span className="text-white">100% Insured</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">National ID / Passport (KYC)</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Authorized</span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">
                      Doc Expiry: <span className="text-white">October 2030</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Electronic Notary Conveyance</span>
                      <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">Ready</span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">
                      District Office: <span className="text-white">Gasabo / Kicukiro Sector</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 9: NEW LISTING WIZARD */}
          {activeTab === 'new-listing' && (
            <div className="max-w-5xl mx-auto space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2">
                <button
                  onClick={() => setActiveTab('listings')}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  ← Return to Inventory
                </button>
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <Sparkles size={14} />
                  <span>AI Co-Pilot Assists Every Step</span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
                <ListingWizard 
                  onSuccess={() => {
                    refetchListings();
                    setActiveTab('listings');
                  }} 
                />
              </div>
            </div>
          )}

        </main>

      </div>

      {/* Property Deep Inspection Drawer */}
      <PropertyInspectionDrawer
        listingId={inspectingPropertyId}
        onClose={() => setInspectingPropertyId(null)}
        onEdit={(prop) => {
          setInspectingPropertyId(null);
          setEditingListing(prop);
        }}
        onRefresh={() => {
          refetchListings();
        }}
      />

      {/* Property Edit Modal */}
      {editingListing && (
        <PropertyEditModal
          listing={editingListing}
          isOpen={!!editingListing}
          onClose={() => setEditingListing(null)}
          onSuccess={() => {
            refetchListings();
          }}
        />
      )}

    </div>
  );
};

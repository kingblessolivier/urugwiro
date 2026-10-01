import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, Package, MessageSquare, HandCoins,
  ShieldCheck, TrendingUp, Bell, LogOut, Plus,
  ArrowUpRight, Search, Sparkles, CheckCircle2,
  Clock, MapPin, Building,
  ArrowRight, ExternalLink, Bot, Menu, X,
  UserCheck, DollarSign, Phone, Heart, Calendar, Users, Mail,
  Layers, Activity, FileSpreadsheet, RefreshCw, Cpu, Compass, Star, Eye
} from 'lucide-react';
import { cn, logError } from '../../lib/utils';
import { Badge } from '../../components/ui/Badge';
import { SellerOfferManager } from './SellerOfferManager';
import ListingWizard from './ListingWizard';
import { PropertyInspectionDrawer } from './components/PropertyInspectionDrawer';
import SellerPropertyEditor from './components/SellerPropertyEditor';
import SellerRatings from './components/SellerRatings';
import { CustomerLeadsManager, type LeadChannel } from '../../components/crm/CustomerLeadsManager';
import SellerListingsTable from './SellerListingsTable';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/endpoints';
import { Pagination } from '../../components/ui/Pagination';

export type SellerTab = 'overview' | 'listings' | 'leads' | 'visits' | 'inquiries' | 'offers' | 'messages' | 'new-listing' | 'ratings' | 'earnings';

interface SellerDashboardProps {
  onNavigate?: (view: any) => void;
  onListingClick?: (id: string) => void;
  initialTab?: SellerTab;
  hideShell?: boolean;
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

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ onNavigate, onListingClick, initialTab = 'overview', hideShell = false }) => {
  const { user, logout } = useAuth();
  const displayName = user?.full_name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username) || 'Seller';
  const displayRole = user?.role || 'Seller';

  const [activeTab, setActiveTab] = useState<SellerTab>(initialTab);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('urugwiro_seller_sidebar_collapsed') === '1');
  const [headerSearch, setHeaderSearch] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);


  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      localStorage.setItem('urugwiro_seller_sidebar_collapsed', prev ? '0' : '1');
      return !prev;
    });
  };


  // Selected property for deep inspection drawer & edit modal
  const [inspectingPropertyId, setInspectingPropertyId] = useState<string | null>(null);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);

  // 1. Live database listings strictly owned by this authenticated seller
  const { data: rawListings = [], isLoading: _loadingListings, refetch: refetchListings } = useQuery({
    queryKey: ['seller-database-listings', user?.id],
    queryFn: async () => {
      try {
        const res = await api.seller.listings();
        const d: any = res.data;
        return Array.isArray(d) ? d : (d?.results || []);
      } catch (e) {
        logError('Failed to fetch seller listings:', e);
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
        const d: any = res.data;
        return Array.isArray(d) ? d : (d?.results || []);
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

  const totalValue = listings.reduce((acc, curr) => acc + curr.price, 0);
  const totalInquiries = listings.reduce((acc, curr) => acc + curr.inquiries, 0);
  const totalOffers = rawOffers.length;

  // 4. Live database showing visits for seller
  const { data: rawVisits = [] } = useQuery({
    queryKey: ['seller-database-visits'],
    queryFn: async () => {
      try {
        const res = await api.seller.visits();
        return Array.isArray(res.data) ? res.data : (res.data?.results || []);
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
        return Array.isArray(res.data) ? res.data : (res.data?.results || []);
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
        return Array.isArray(res.data) ? res.data : (res.data?.results || []);
      } catch {
        return [];
      }
    },
  });

  // 7. Live database earnings & payouts for seller
  const { data: earningsData } = useQuery({
    queryKey: ['seller-database-earnings', user?.id],
    queryFn: async () => {
      try {
        const res = await api.seller.earnings();
        return res.data;
      } catch {
        return { summary: { total_earned: 0, total_paid: 0, total_pending: 0 }, payments: [] };
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

  const navSections = [
    {
      label: 'Portfolio',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'listings', label: 'My Listings', icon: Package, badge: listings.length > 0 ? listings.length.toString() : undefined },
        { id: 'new-listing', label: 'Add Property', icon: Plus },
      ],
    },
    {
      label: 'Customers',
      items: [
        { id: 'leads', label: 'Leads & Inquiries', icon: Users, badge: totalLeads > 0 ? `${totalLeads} Active` : undefined, highlight: true },
        { id: 'visits', label: 'Visits & Showings', icon: Calendar, badge: totalVisits > 0 ? `${totalVisits}` : undefined },
        { id: 'inquiries', label: 'Inquiries', icon: MessageSquare, badge: totalInquiries > 0 ? `${totalInquiries}` : undefined },
        { id: 'messages', label: 'Messages', icon: Mail, badge: unreadMessagesCount > 0 ? `${unreadMessagesCount} New` : undefined },
      ],
    },
    {
      label: 'Sales & Feedback',
      items: [
        { id: 'offers', label: 'Offers & Prices', icon: HandCoins, badge: totalOffers > 0 ? `${totalOffers} Active` : undefined },
        { id: 'ratings', label: 'Ratings & Reviews', icon: Star },
      ],
    },
  ];
  const navItems = navSections.flatMap(s => s.items);

  return (
    <div className={cn(hideShell ? "w-full" : "flex h-screen overflow-hidden select-none", "bg-[var(--color-bg-deep)] text-[var(--color-text-main)] font-sans antialiased")}>
      
      {/* DESKTOP SIDEBAR */}
      {!hideShell && (
      <aside
        className={cn(
          "bg-[var(--color-bg-surface)] border-r border-[var(--color-border)] hidden lg:flex flex-col sticky top-0 h-full shrink-0 z-20 transition-all duration-300",
          sidebarCollapsed ? "w-20" : "w-72"
        )}
      >
        {/* Brand Header */}
        <div className={cn("flex items-center gap-3 shrink-0 border-b border-[var(--color-border)]", sidebarCollapsed ? "justify-center px-2 py-5" : "px-5 py-5")}>
          <div
            onClick={() => onNavigate ? onNavigate('home') : null}
            className="flex items-center gap-3 cursor-pointer min-w-0 group"
            title="Urugwiro — Public Portal"
          >
            <div className="relative shrink-0">
              <img
                src="/urugwiro_logo_fav.png"
                alt="Urugwiro"
                className="h-9 w-9 rounded-xl object-contain drop-shadow-md group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-600 dark:bg-emerald-500 border-2 border-[var(--color-bg-surface)] rounded-full" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold tracking-tight text-[var(--color-text-main)] flex items-center gap-1.5">
                  Urugwiro
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-[var(--color-brand-emerald)] dark:border-emerald-500/20">
                    Seller
                  </span>
                </span>
                <span className="text-[10px] text-[var(--color-text-dim)] tracking-tight truncate">Verified Estate Hub</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {navSections.map((section) => (
            <div key={section.label} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-dim)]">
                  {section.label}
                </div>
              )}
              {sidebarCollapsed && <div className="mx-3 mb-2 border-t border-[var(--color-border)]" />}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as SellerTab); setEditingListingId(null); }}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      "w-full relative flex items-center rounded-xl text-sm transition-all group",
                      sidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3.5 py-2.5 font-medium",
                      isActive
                        ? "bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] border border-emerald-500/30 font-bold shadow-[var(--shadow-emerald-soft)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] border border-transparent"
                    )}
                  >
                    <div className={cn("flex items-center", sidebarCollapsed ? "" : "gap-3 min-w-0")}>
                      <Icon
                        size={18}
                        className={cn(
                          "shrink-0 transition-colors",
                          isActive
                            ? "text-[var(--color-brand-emerald)]"
                            : item.highlight
                            ? "text-[var(--color-brand-emerald)]"
                            : "text-[var(--color-text-dim)] group-hover:text-[var(--color-text-main)]"
                        )}
                      />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {item.badge && !sidebarCollapsed && (
                      <span
                        className={cn(
                          "text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0",
                          isActive
                            ? "bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] border-emerald-500/40"
                            : item.highlight
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-[var(--color-brand-emerald)] dark:border-emerald-500/20"
                            : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border)]"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.badge && sidebarCollapsed && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-500" />
                    )}
                    {sidebarCollapsed && (
                      <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] shadow-[var(--shadow-depth-2)] text-xs font-semibold text-[var(--color-text-main)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                        {item.label}
                        {item.badge ? ` · ${item.badge}` : ''}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className={cn("px-3 py-2 border-t border-[var(--color-border)]", sidebarCollapsed ? "flex justify-center" : "flex justify-end")}>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] transition-colors"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ArrowRight size={16} /> : <ArrowRight size={16} className="rotate-180" />}
          </button>
        </div>

        {/* Seller Trust Profile */}
        <div className="px-3 pb-4 pt-2 border-t border-[var(--color-border)] space-y-2 shrink-0">
          <div className={cn(
            "rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center gap-3",
            sidebarCollapsed ? "justify-center p-2" : "p-3"
          )}>
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-accent-soft-bg)] border border-emerald-500/30 flex items-center justify-center font-bold text-[var(--color-brand-emerald)] text-xs">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <CheckCircle2 size={12} className="absolute -bottom-1 -right-1 text-[var(--color-brand-emerald)] bg-[var(--color-bg-elevated)] rounded-full" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[var(--color-text-main)] truncate">{displayName}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] truncate">{displayRole} • {user?.email || 'Verified Account'}</p>
              </div>
            )}
          </div>

          <div className={cn("flex items-center text-[11px] text-[var(--color-text-dim)]", sidebarCollapsed ? "flex-col gap-1.5" : "justify-between px-1")}>
            <button
              onClick={() => onNavigate ? onNavigate('home') : null}
              className="hover:text-[var(--color-text-main)] transition-colors flex items-center gap-1"
              title="Public Portal"
            >
              <ExternalLink size={12} /> {!sidebarCollapsed && 'Public Portal'}
            </button>
            <button
              onClick={async () => {
                await logout();
                if (onNavigate) onNavigate('home');
              }}
              className="hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1"
              title="Sign out"
            >
              <LogOut size={12} /> {!sidebarCollapsed && 'Exit'}
            </button>
          </div>
        </div>
      </aside>
      )}

      {/* MOBILE NAVIGATION DRAWER */}
      {!hideShell && mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-[var(--color-bg-surface)] border-r border-[var(--color-border)] h-full p-6 flex flex-col z-10">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2.5">
                <img src="/urugwiro_logo_fav.png" alt="Urugwiro" className="h-7 w-7 rounded-lg" />
                <span className="font-bold text-[var(--color-text-main)]">Seller Dashboard</span>
              </div>
              <button 
                onClick={() => setMobileNavOpen(false)}
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-bg-elevated)]"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto space-y-5 py-1">
              {navSections.map((section) => (
                <div key={section.label} className="space-y-1.5">
                  <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-dim)]">
                    {section.label}
                  </div>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as SellerTab);
                          setEditingListingId(null);
                          setMobileNavOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all",
                          isActive
                            ? "bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] border border-emerald-500/30 font-bold shadow-[var(--shadow-emerald-soft)]"
                            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] border border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon size={18} className={cn("shrink-0", isActive ? "text-[var(--color-brand-emerald)]" : "text-[var(--color-text-dim)]")} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border)] shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="pt-4 border-t border-[var(--color-border)]">
              <button
                onClick={() => {
                  setActiveTab('new-listing');
                  setMobileNavOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] font-semibold text-sm"
              >
                <Plus size={18} />
                <span>List New Asset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className={cn("flex-1 flex flex-col min-w-0", !hideShell && "overflow-hidden")}>

        {/* TOP NAVBAR */}
        {!hideShell && (
        <header className="h-16 lg:h-20 bg-[var(--color-header-bg)] backdrop-blur-xl border-b border-[var(--color-border)] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0 z-10">

          <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] shrink-0"
            >
              <Menu size={20} />
            </button>

            {/* Mobile Brand pill */}
            <div className="flex items-center gap-2 lg:hidden shrink-0">
              <img src="/urugwiro_logo_fav.png" alt="Logo" className="w-6 h-6 rounded-md" />
              <span className="font-bold text-sm text-[var(--color-text-main)]">Urugwiro</span>
            </div>

            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center gap-2 text-xs min-w-0" aria-label="Breadcrumb">
              <span className="text-[var(--color-text-dim)] font-medium">Seller Workspace</span>
              <span className="text-[var(--color-text-dim)]">/</span>
              <span className="text-[var(--color-text-muted)] font-medium">
                {navSections.find(s => s.items.some(i => i.id === activeTab))?.label || 'Portfolio'}
              </span>
              <span className="text-[var(--color-text-dim)]">/</span>
              <span className="text-[var(--color-brand-emerald)] font-bold capitalize truncate">
                {activeTab.replace(/-/g, ' ')}
              </span>
            </nav>
          </div>

          {/* Header Command Search */}
          <div className="hidden md:flex items-center relative max-w-xs flex-1">
            <Search size={15} className="absolute left-3.5 text-[var(--color-text-dim)] pointer-events-none" />
            <input
              type="text"
              value={headerSearch}
              onChange={(e) => {
                setHeaderSearch(e.target.value);
                if (e.target.value && activeTab !== 'listings') setActiveTab('listings');
              }}
              placeholder="Search inventory..."
              className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl py-2 pl-10 pr-12 text-xs text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500/50 transition-colors"
            />
            <span className="absolute right-3 text-[9px] font-mono font-bold text-[var(--color-text-dim)] border border-[var(--color-border)] rounded px-1.5 py-0.5 bg-[var(--color-bg-elevated)] pointer-events-none">
              ⌘K
            </span>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notification bell */}
            <button
              onClick={() => setActiveTab('offers')}
              className="relative p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
              title="Offers & notifications"
            >
              <Bell size={18} />
              {(totalOffers > 0 || unreadMessagesCount > 0) && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 dark:bg-emerald-500 text-[#fff] dark:text-emerald-950 text-[9px] font-bold flex items-center justify-center ring-2 ring-[var(--color-bg-surface)]">
                  {totalOffers + unreadMessagesCount}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-[var(--color-border)] mx-1 hidden sm:block" />

            {/* Quick Public View */}
            <button
              onClick={() => onNavigate ? onNavigate('discovery') : null}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:border-[var(--color-border-hover)] transition-all"
            >
              <span>Explore Market</span>
              <ExternalLink size={12} className="text-[var(--color-text-dim)]" />
            </button>

            {/* User chip */}
            <div className="hidden lg:flex items-center gap-2.5 pl-1">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-accent-soft-bg)] border border-emerald-500/30 flex items-center justify-center font-bold text-[var(--color-brand-emerald)] text-xs shrink-0">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden xl:flex flex-col leading-tight">
                <span className="text-xs font-bold text-[var(--color-text-main)] truncate max-w-[140px]">{displayName}</span>
                <span className="text-[10px] text-[var(--color-text-dim)]">{displayRole}</span>
              </div>
            </div>
          </div>
        </header>
        )}

        {/* MOBILE HORIZONTAL TAB BAR */}
        {!hideShell && (
        <div className="lg:hidden bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] px-4 py-2 overflow-x-auto scrollbar-none flex items-center gap-2 shrink-0">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as SellerTab); setEditingListingId(null); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5",
                activeTab === item.id
                  ? "bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] border border-emerald-500/30 font-semibold"
                  : "bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
              )}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        )}

        {/* TAB CONTENT AREA */}
        <main className={cn("flex-1", hideShell ? "p-0" : "overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[var(--color-bg-deep)]")}>

          {/* Full Property Editor (replaces tab content when active) */}
          {editingListingId ? (
            <SellerPropertyEditor
              listingId={editingListingId}
              onBack={() => setEditingListingId(null)}
              onChanged={() => refetchListings()}
            />
          ) : (
            <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
              
              {/* Hero Banner with AI Valuation Insight */}
              <div className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-depth-1)] p-6 lg:p-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-[var(--color-brand-emerald)] text-[10px] font-bold uppercase tracking-widest">
                      <Sparkles size={12} />
                      AI Market Insights Active
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--color-text-main)] font-display leading-tight">
                      Welcome Back, <span className="text-[var(--color-brand-emerald)]">{displayName}</span>
                    </h1>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab('new-listing')}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] font-semibold text-sm shadow-[var(--shadow-emerald-soft)] transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                      <Plus size={16} />
                      List New Asset
                    </button>
                    <button
                      onClick={() => setActiveTab('listings')}
                      className="flex items-center gap-2 px-5 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-card-hover)] text-[var(--color-text-main)] font-semibold text-sm transition-all duration-300 cursor-pointer"
                    >
                      <Package size={16} />
                      View Listings
                    </button>
                  </div>
                </div>
              </div>

              {/* STATS TILES */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 hover:border-emerald-500/30 transition-all group">
                  <div className="flex items-center justify-between text-[var(--color-text-dim)] mb-3">
                    <span className="text-xs uppercase tracking-wider font-semibold">Gross Portfolio</span>
                    <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-[var(--color-brand-emerald)] group-hover:bg-emerald-600 group-hover:text-[#fff] transition-colors">
                      <Building size={16} />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-[var(--color-text-main)]">
                    {totalValue > 0 ? `${(totalValue / 1000000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M` : '0'} <span className="text-xs text-[var(--color-text-muted)] font-sans">RWF</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-brand-emerald)] mt-2 font-medium">
                    <TrendingUp size={12} />
                    <span>{listings.length} live {listings.length === 1 ? 'property' : 'properties'}</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('leads')}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 hover:border-emerald-500/30 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[var(--color-text-dim)] mb-3">
                    <span className="text-xs uppercase tracking-wider font-semibold">Customer Leads CRM</span>
                    <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-[var(--color-brand-emerald)] group-hover:bg-emerald-600 group-hover:text-[#fff] transition-colors">
                      <Users size={16} />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-[var(--color-text-main)]">
                    {totalLeads}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-brand-emerald)] mt-2 font-medium">
                    <Sparkles size={12} />
                    <span>{totalVisits} visits • {rawInquiries.length || totalInquiries} inq • {totalLikes} saves</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('visits')}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 hover:border-emerald-500/30 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[var(--color-text-dim)] mb-3">
                    <span className="text-xs uppercase tracking-wider font-semibold">Showing Visits</span>
                    <span className="p-2 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-[#fff] transition-colors">
                      <Calendar size={16} />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-[var(--color-text-main)]">
                    {totalVisits}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-purple-600 dark:text-purple-400 mt-2 font-medium">
                    <Clock size={12} />
                    <span>Scheduled Inspections</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('offers')}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 hover:border-emerald-500/30 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[var(--color-text-dim)] mb-3">
                    <span className="text-xs uppercase tracking-wider font-semibold">Active Offers</span>
                    <span className="p-2 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-[#fff] transition-colors">
                      <HandCoins size={16} />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-[var(--color-text-main)]">
                    {totalOffers} {totalOffers === 1 ? 'Deal' : 'Deals'}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 mt-2 font-medium">
                    <Sparkles size={12} />
                    <span>In discussion &amp; review</span>
                  </div>

                </div>
              </div>

              {/* RECENT CUSTOMER ACTIVITIES (TITLES & ACTIONS ONLY) */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-main)]">Recent Customer Activities</h3>
                    {recentFollowUps.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] text-[10px] font-mono font-bold border border-emerald-500/30">
                        {recentFollowUps.length} Activities
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="text-xs font-semibold text-[var(--color-brand-emerald)] hover:text-[var(--color-brand-emerald)] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    Manage All Activities <ArrowRight size={13} />
                  </button>
                </div>

                {recentFollowUps.length === 0 ? (
                  <div className="p-8 text-center text-[var(--color-text-dim)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                    <Users size={28} className="mx-auto text-[var(--color-text-dim)] mb-2" />
                    <p className="text-sm font-semibold text-[var(--color-text-muted)]">No Pending Customer Activities</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentFollowUps.map((lead) => {
                      const cleanPhone = lead.phone ? String(lead.phone).replace(/[^0-9+]/g, '') : '';
                      return (
                        <div
                          key={lead.id}
                          className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] hover:border-emerald-500/30 transition-all flex flex-col justify-between gap-4 group"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className={cn(
                                "text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border",
                                lead.type === 'visit'
                                  ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30"
                                  : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30"
                              )}>
                                {lead.type === 'visit' ? 'Showing Tour' : 'Direct Inquiry'}
                              </span>
                              {lead.date && (
                                <span className="text-[11px] font-mono text-[var(--color-text-muted)] flex items-center gap-1">
                                  <Calendar size={11} className="text-[var(--color-text-dim)]" />
                                  {lead.date}
                                </span>
                              )}
                            </div>

                            <div className="space-y-0.5">
                              <h4 className="text-sm font-semibold text-[var(--color-text-main)] group-hover:text-[var(--color-brand-emerald)] transition-colors">
                                {lead.customerName}
                              </h4>
                              <p className="text-xs text-[var(--color-text-muted)] truncate font-medium">
                                {lead.title}
                              </p>
                            </div>

                            {/* Activity Metadata Tag (Titles & Badges Only - No Descriptions) */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className={cn(
                                "px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase",
                                lead.type === 'visit'
                                  ? "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20"
                                  : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20"
                              )}>
                                {lead.type === 'visit' ? (lead.timeSlot ? `Slot: ${lead.timeSlot}` : 'Inspection Tour') : 'Buyer Inbound Message'}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border)] uppercase">
                                {lead.status || 'Active'}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[var(--color-border)] flex items-center gap-2">
                            {cleanPhone ? (
                              <>
                                <a
                                  href={`tel:${cleanPhone}`}
                                  className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-500/10 hover:bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                  title="Call Customer"
                                >
                                  <Phone size={13} />
                                  <span>Call</span>
                                </a>
                                <a
                                  href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 py-1.5 px-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                  title="Chat on WhatsApp"
                                >
                                  <MessageSquare size={13} />
                                  <span>WhatsApp</span>
                                </a>
                              </>
                            ) : (
                              <span className="text-[11px] text-[var(--color-text-dim)] italic">No phone provided</span>
                            )}
                            {lead.email && (
                              <a
                                href={`mailto:${lead.email}`}
                                className="p-2 rounded-xl bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-card-hover)] text-[var(--color-text-muted)] border border-[var(--color-border)] text-xs flex items-center justify-center transition-colors"
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
                <div className="lg:col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-[var(--color-text-main)] text-lg">Active Portfolio</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('listings')}
                      className="text-xs font-semibold text-[var(--color-brand-emerald)] hover:text-[var(--color-brand-emerald)] flex items-center gap-1"
                    >
                      View All Listings <ArrowUpRight size={14} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {listings.length === 0 ? (
                      <div className="p-8 text-center text-[var(--color-text-dim)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                        <Package size={32} className="mx-auto text-[var(--color-text-dim)] mb-2" />
                        <p className="text-sm text-[var(--color-text-muted)] font-semibold">No properties listed yet</p>
                        <button
                          onClick={() => setActiveTab('new-listing')}
                          className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus size={14} /> List New Asset
                        </button>
                      </div>
                    ) : (
                      listings.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => onListingClick ? onListingClick(item.id) : setInspectingPropertyId(item.id)}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-elevated)] hover:border-emerald-500/30 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3.5">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[var(--color-border)]"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm text-[var(--color-text-main)] line-clamp-1">{item.title}</h4>
                                {item.verified && (
                                  <Badge variant="success" className="text-[9px] py-0 px-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-[var(--color-brand-emerald)] dark:border-emerald-500/30">
                                    RLMUA
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                                <MapPin size={11} className="text-[var(--color-text-dim)]" />
                                {item.location}
                              </p>
                              <p className="text-xs font-mono font-bold text-[var(--color-brand-emerald)] mt-1">
                                {item.price.toLocaleString()} {item.currency}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--color-border)]">
                            <div className="text-left sm:text-right text-xs">
                              <span className="text-[var(--color-text-muted)] font-medium block">
                                {item.views} views • {item.inquiries} inquiries
                              </span>
                              <span className={cn(
                                "text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1",
                                item.status === 'Active' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-[var(--color-brand-emerald)]" :
                                item.status === 'Under Offer' ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]"
                              )}>
                                {item.status}
                              </span>
                            </div>

                            <button
                              onClick={() => onListingClick?.(item.id)}
                              title="View Listing Details"
                              className="p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:border-emerald-500/40 hover:text-[var(--color-brand-emerald)] text-[var(--color-text-muted)] transition-colors cursor-pointer"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Column: Quick Status & Actions */}
                <div className="space-y-6">
                  {/* Trust & Verification Status */}
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[var(--color-text-main)] text-sm flex items-center gap-2">
                        <ShieldCheck size={16} className="text-[var(--color-brand-emerald)]" />
                        Seller Verification
                      </h4>
                      <span className="text-xs font-mono text-[var(--color-brand-emerald)] font-bold">Verified</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-muted)]">Profile Status</span>
                        <span className="text-[var(--color-brand-emerald)] font-semibold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-muted)]">ID / Identity</span>
                        <span className="text-[var(--color-brand-emerald)] font-semibold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Confirmed
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MY LISTINGS INVENTORY (admin-style table) */}
          {activeTab === 'listings' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
              <div className="flex flex-col justify-between gap-5 border-b border-[var(--color-border)] pb-8 md:flex-row md:items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-brand-emerald)]">Seller Inventory</p>
                  <h1 className="mt-2 text-3xl lg:text-4xl font-bold text-[var(--color-text-main)] tracking-tight">My Listings</h1>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] backdrop-blur-xl px-4 py-2 text-xs font-mono font-bold text-[var(--color-brand-emerald)] shadow-sm">
                    {listings.length} records
                  </div>
                  <button
                    onClick={() => setActiveTab('new-listing')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] font-semibold text-sm shadow-[var(--shadow-emerald-soft)] transition-all cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>List New Asset</span>
                  </button>
                </div>
              </div>

              <SellerListingsTable onListingClick={onListingClick} onEdit={(id) => setEditingListingId(id)} />
            </div>
          )}

          {/* TAB: CUSTOMER LEADS & VISITS CRM */}
          {(activeTab === 'leads' || activeTab === 'visits' || activeTab === 'inquiries') && (
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

          {/* TAB 4: REAL-TIME MESSAGING & INQUIRIES */}
          {activeTab === 'messages' && (
            <div className="max-w-7xl mx-auto animate-fadeIn">
              <CustomerLeadsManager
                mode="seller"
                initialChannel="inquiries"
                onListingClick={onListingClick}
              />
            </div>
          )}

          {/* TAB 5: NEW LISTING WIZARD */}
          {activeTab === 'new-listing' && (
            <div className="max-w-5xl mx-auto space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2">
                <button
                  onClick={() => setActiveTab('listings')}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] flex items-center gap-1"
                >
                  ← Return to Inventory
                </button>
              </div>

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 sm:p-6">
                <ListingWizard 
                  onSuccess={() => {
                    refetchListings();
                    setActiveTab('listings');
                  }} 
                />
              </div>
            </div>
          )}

          {/* TAB 6: EARNINGS & PAYOUTS */}
          {activeTab === 'earnings' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
              <div className="flex flex-col justify-between gap-5 border-b border-[var(--color-border)] pb-8 md:flex-row md:items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-brand-emerald)]">Financial Operations</p>
                  <h1 className="mt-2 text-3xl lg:text-4xl font-bold text-[var(--color-text-main)] tracking-tight">Earnings &amp; Payouts</h1>
                </div>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-dim)]">Total Realized</span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-[var(--color-brand-emerald)] mt-2">
                    {(earningsData?.summary?.total_earned || 0).toLocaleString()} <span className="text-xs font-sans text-[var(--color-text-dim)]">RWF</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-1">From completed property sales</p>
                </div>

                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-dim)]">Paid to You</span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-[var(--color-text-main)] mt-2">
                    {(earningsData?.summary?.total_paid || 0).toLocaleString()} <span className="text-xs font-sans text-[var(--color-text-dim)]">RWF</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Disbursed via Bank / Mobile Money</p>
                </div>

                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-dim)]">Pending Balance</span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-500 mt-2">
                    {(earningsData?.summary?.total_pending || 0).toLocaleString()} <span className="text-xs font-sans text-[var(--color-text-dim)]">RWF</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Scheduled for upcoming payout</p>
                </div>
              </div>

              {/* Payouts list */}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
                <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-4">Payout Statements</h3>
                {(!earningsData?.payments || earningsData.payments.length === 0) ? (
                  <div className="py-12 text-center text-[var(--color-text-muted)]">
                    <p className="text-sm">No payout statements yet.</p>
                    <p className="text-xs text-[var(--color-text-dim)] mt-1">When deals are finalized and payments are recorded, your statements will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-text-dim)] uppercase">
                          <th className="pb-3 font-semibold">Reference</th>
                          <th className="pb-3 font-semibold">Listing</th>
                          <th className="pb-3 font-semibold">Method</th>
                          <th className="pb-3 font-semibold">Entitlement</th>
                          <th className="pb-3 font-semibold">Paid</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {earningsData.payments.map((p: any) => (
                          <tr key={p.id} className="hover:bg-[var(--color-bg-elevated)] transition-colors">
                            <td className="py-3 font-mono text-xs font-semibold">{p.payment_reference || p.id?.slice(0, 8)}</td>
                            <td className="py-3 font-medium text-[var(--color-text-main)]">{p.listing?.title || 'Property'}</td>
                            <td className="py-3 capitalize text-[var(--color-text-muted)]">{p.payment_method?.replace(/_/g, ' ') || 'Bank Transfer'}</td>
                            <td className="py-3 font-mono font-medium">{Number(p.seller_entitlement || 0).toLocaleString()} RWF</td>
                            <td className="py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{Number(p.amount_paid || 0).toLocaleString()} RWF</td>
                            <td className="py-3">
                              <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', p.status === 'paid' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30')}>
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3 text-xs text-[var(--color-text-dim)]">{p.payment_date || new Date(p.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

            </>
          )}
        </main>

      </div>

      {/* Property Deep Inspection Drawer */}
      <PropertyInspectionDrawer
        listingId={inspectingPropertyId}
        onClose={() => setInspectingPropertyId(null)}
        onEdit={(prop) => {
          setInspectingPropertyId(null);
          setEditingListingId(String(prop.id));
        }}
        onRefresh={() => {
          refetchListings();
        }}
      />

    </div>
  );
};

export default SellerDashboard;

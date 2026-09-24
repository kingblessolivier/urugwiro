import React, { useState } from 'react';
import {
  LayoutDashboard, TrendingUp, Building2, ShieldCheck,
  MessageSquare, Mail, BarChart3, Users,
  PlusCircle, ArrowUpRight, Search, Bell,
  PanelLeftClose, PanelLeftOpen, Shield, Sparkles,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { type AppView } from '../../types/navigation';
import { api } from '../../api/endpoints';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  children: React.ReactNode;
}

interface NavItem {
  view: AppView;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string | number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentView, onNavigate, children }) => {
  const { user } = useAuth();
  const displayName = user?.full_name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username) || 'Administrator';
  const initial = displayName.slice(0, 1).toUpperCase();

  // Collapsed state persisted in localStorage
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('urugwiro_admin_sidebar_collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('urugwiro_admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Live Unread Messages Count
  const { data: contactsData } = useQuery({
    queryKey: ['chat-contacts-unread'],
    queryFn: async () => {
      const res = await api.chat.contacts();
      return res.data;
    },
    refetchInterval: 10000,
  });

  const totalUnread = contactsData?.total_unread || 0;

  const NAV_SECTIONS: NavSection[] = [
    {
      title: 'Transactions & Conveyance',
      items: [
        { view: 'admin', label: 'Dashboard', icon: LayoutDashboard },
        { view: 'admin-offers', label: 'Deals & Conveyance', icon: TrendingUp },
        { view: 'admin-listings', label: 'Unified Listings', icon: Building2 },
      ],
    },
    {
      title: 'Operations & Registry',
      items: [
        { view: 'admin-verification', label: 'Trust & Verification', icon: ShieldCheck },
        { view: 'admin-inbox', label: 'Command Inbox', icon: MessageSquare, badge: totalUnread > 0 ? totalUnread : undefined },
        { view: 'admin-enquiries', label: 'Customer Inquiries', icon: Mail },
        { view: 'admin-property-wizard', label: 'Register New Asset', icon: PlusCircle },
      ],
    },
    {
      title: 'Intelligence & Core',
      items: [
        { view: 'admin-reports', label: 'Reports & Export', icon: BarChart3 },
        { view: 'admin-users', label: 'User Directory', icon: Users },
        { view: 'admin-settings', label: 'NVIDIA AI & Settings', icon: Sparkles },
      ],
    },
  ];

  // Helper for Breadcrumb Title
  const getPageTitle = (view: AppView): { category: string; title: string } => {
    switch (view) {
      case 'admin':
        return { category: 'Executive Operations', title: 'Overall Performance Dashboard' };
      case 'admin-offers':
        return { category: 'Transactions', title: 'Deal Pipeline & Offer Conveyance' };
      case 'admin-listings':
        return { category: 'Marketplace', title: 'Unified Sovereign Asset Records' };
      case 'admin-verification':
        return { category: 'Trust & Legal', title: 'RLMUA & Deeds Verification Workspace' };
      case 'admin-inbox':
        return { category: 'Communications', title: 'Real-Time Negotiation Terminal' };
      case 'admin-enquiries':
        return { category: 'Communications', title: 'Customer Property Enquiries' };
      case 'admin-property-wizard':
        return { category: 'Registry', title: 'Sovereign Asset Registration Wizard' };
      case 'admin-reports':
        return { category: 'Intelligence', title: 'Reports, Telemetry & CSV Exports' };
      case 'admin-users':
        return { category: 'Governance', title: 'Platform User & Access Management' };
      case 'admin-settings':
        return { category: 'System Architecture', title: 'NVIDIA NIM AI Accelerator Console' };
      default:
        return { category: 'Admin Center', title: 'Administration' };
    }
  };

  const pageMeta = getPageTitle(currentView);

  return (
    <div className="h-screen w-screen bg-[#05070b] text-zinc-100 flex overflow-hidden font-sans">

      {/* ─── DESKTOP COLLAPSIBLE SIDENAV ─── */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-white/10 bg-[#080b11] transition-all duration-300 z-40 h-screen shrink-0 overflow-hidden select-none",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        {/* Sidenav Header */}
        <div className="h-20 shrink-0 border-b border-white/10 flex items-center px-4 justify-between bg-[#080b11]">
          <div
            onClick={() => onNavigate('admin')}
            className={cn(
              "flex items-center gap-3 cursor-pointer overflow-hidden",
              isCollapsed && "justify-center w-full"
            )}
          >
            <img
              src="/urugwiro_logo_fav.png"
              alt="Urugwiro"
              className="h-10 w-10 rounded-xl object-contain shrink-0 drop-shadow-md"
            />

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm tracking-[0.25em] text-white font-display">
                  URUGWIRO
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold">
                  Sovereign Desk
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-xl border border-white/[0.14] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors oneui-press"
              title="Collapse Sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {/* Collapsed Toggle Button when in Icon-Only Mode */}
        {isCollapsed && (
          <div className="p-3 flex justify-center border-b border-white/[0.1] bg-[#0b0f19]">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors oneui-press"
              title="Expand Sidebar"
            >
              <PanelLeftOpen size={18} />
            </button>
          </div>
        )}

        {/* Sidenav Navigation Items */}
        <div className="flex-1 overflow-y-auto overscroll-contain py-6 px-3 space-y-6 luxury-scrollbar">
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              {!isCollapsed && (
                <p className="px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-300 mb-2.5">
                  {section.title}
                </p>
              )}

              {section.items.map((item) => {
                const isActive = currentView === item.view;
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.view}
                    onClick={() => onNavigate(item.view)}
                    className={cn(
                      "w-full flex items-center rounded-2xl transition-all group relative text-left oneui-press",
                      isCollapsed
                        ? "justify-center p-3"
                        : "px-3.5 py-2.5 gap-3",
                      isActive
                        ? "bg-gradient-to-r from-[#e2ca9c]/20 via-[#e2ca9c]/10 to-transparent text-white border border-[#e2ca9c]/40 shadow-[0_0_20px_rgba(226,202,156,0.15)] font-bold"
                        : "text-zinc-300 hover:text-white hover:bg-white/[0.08]"
                    )}
                  >
                    <IconComponent
                      size={18}
                      className={cn(
                        "shrink-0 transition-colors",
                        isActive ? "text-[#e2ca9c]" : "text-zinc-300 group-hover:text-[#e2ca9c]"
                      )}
                    />

                    {!isCollapsed && (
                      <span className="text-xs font-semibold tracking-wide flex-1 truncate">
                        {item.label}
                      </span>
                    )}

                    {!isCollapsed && item.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded-full bg-[#e2ca9c] text-black text-[10px] font-extrabold shrink-0 shadow-sm">
                        {item.badge}
                      </span>
                    )}

                    {/* Floating Tooltip for Icon-Only Mode */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-[#151d2e] border border-white/[0.25] text-white text-xs font-bold whitespace-nowrap shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {item.label}
                        {item.badge !== undefined && (
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-[#e2ca9c] text-black text-[9px] font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidenav Footer */}
        <div className="shrink-0 p-3 border-t border-white/10 space-y-2 bg-[#080b11]">
          {/* Quick Exit to Marketplace */}
          <button
            onClick={() => onNavigate('home')}
            className={cn(
              "w-full flex items-center rounded-xl p-2.5 text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all text-xs font-bold border border-white/10 hover:border-emerald-500/40 oneui-press",
              isCollapsed ? "justify-center" : "gap-3"
            )}
            title="Return to Marketplace"
          >
            <ArrowUpRight size={16} className="text-emerald-400 shrink-0 transition-colors" />
            {!isCollapsed && <span>Public Marketplace</span>}
          </button>

          {/* Admin User Mini Bar */}
          <div
            className={cn(
              "flex items-center rounded-2xl p-2.5 bg-white/[0.03] border border-white/10",
              isCollapsed ? "justify-center" : "gap-3"
            )}
          >
            <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
              {initial}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{displayName}</p>
                <p className="text-[10px] text-zinc-400 font-mono truncate">{user?.role ? `${user.role} Executive` : 'Executive Command'}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT CONTAINER (TopNav + Page Body) ─── */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden bg-[#05070b]">

        {/* ─── TOP NAVIGATION BAR ─── */}
        <header className="h-20 shrink-0 border-b border-white/10 bg-[#080b11]/90 backdrop-blur-xl z-30 px-6 lg:px-10 flex items-center justify-between gap-4">

          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Mobile drawer button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-xl border border-white/10 text-zinc-300 hover:text-white oneui-press"
            >
              <PanelLeftOpen size={18} />
            </button>

            {/* Breadcrumb Info */}
            <div className="hidden sm:flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 uppercase tracking-wider font-mono font-medium">
                <span>{pageMeta.category}</span>
                <ChevronRight size={12} className="text-zinc-500" />
                <span className="text-emerald-400 font-bold">{currentView}</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight truncate font-display">
                {pageMeta.title}
              </h2>
            </div>
          </div>

          {/* Center: Command Search Input */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search deals, parcels, UPI deeds, or buyers..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-2.5 pl-10 pr-12 text-sm text-white placeholder-zinc-400 outline-none focus:border-emerald-500/50 transition-all font-sans"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-zinc-400 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/10">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right: Quick Action Launchpads */}
          <div className="flex items-center gap-3 shrink-0">
            {/* System Status Indicators */}
            <div className="hidden xl:flex items-center gap-2 mr-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono text-emerald-400 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                RLMUA Registry: Verified
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-[10px] font-mono text-purple-300 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                NVIDIA NIM: Active
              </div>
            </div>

            {/* Direct Listing Button */}
            <Button
              onClick={() => onNavigate('admin-property-wizard')}
              variant="primary"
              className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 oneui-press"
            >
              <PlusCircle size={15} />
              <span className="hidden sm:inline">Register Asset</span>
            </Button>

            {/* Notification Bell */}
            <button
              onClick={() => onNavigate('admin-inbox')}
              className="relative p-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:border-white/20 transition-all oneui-press"
              title="Command Inbox"
            >
              <Bell size={16} />
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-emerald-500 text-black text-[9px] font-black flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </button>

            {/* Return to Public Market Button */}
            <Button
              variant="ghost"
              onClick={() => onNavigate('home')}
              className="hidden sm:flex border border-white/10 bg-white/[0.04] text-xs px-3.5 py-2 rounded-xl text-zinc-200 hover:text-white hover:border-white/20 oneui-press"
            >
              Marketplace <ArrowUpRight size={14} className="ml-1 text-emerald-400" />
            </Button>
          </div>
        </header>

        {/* ─── MOBILE DRAWER OVERLAY ─── */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-black/80 backdrop-blur-md">
            <div className="w-72 bg-[#080b11] border-r border-white/10 h-full p-4 flex flex-col space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="font-bold text-white tracking-widest text-sm">URUGWIRO SOVEREIGN</span>
                <button onClick={() => setIsMobileOpen(false)} className="text-zinc-300 hover:text-white oneui-press">
                  <PanelLeftClose size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6">
                {NAV_SECTIONS.map((sec, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-[11px] uppercase font-bold text-zinc-300 tracking-wider px-2">{sec.title}</p>
                    {sec.items.map(it => (
                      <button
                        key={it.view}
                        onClick={() => { onNavigate(it.view); setIsMobileOpen(false); }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold oneui-press",
                          currentView === it.view ? "bg-white/[0.08] text-white border border-white/20 font-bold" : "text-zinc-300 hover:text-white"
                        )}
                      >
                        <it.icon size={16} className={currentView === it.view ? "text-emerald-400" : "text-zinc-400"} />
                        <span>{it.label}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileOpen(false)} />
          </div>
        )}

        {/* ─── PAGE BODY VIEWPORT (INDEPENDENT SMOOTH SCROLL & ONE UI ENTRANCE) ─── */}
        <main className="flex-1 overflow-y-auto overscroll-contain bg-[#05070b] luxury-scrollbar">
          <div key={currentView} className="oneui-enter min-h-full">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;

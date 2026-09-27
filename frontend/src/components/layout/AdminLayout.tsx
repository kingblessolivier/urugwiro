import React, { useState } from 'react';
import {
  LayoutDashboard, TrendingUp, Building2, ShieldCheck,
  MessageSquare, Mail, BarChart3, Users,
  PlusCircle, ArrowUpRight, Search, Bell,
  PanelLeftClose, PanelLeftOpen, Sparkles,
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
      title: 'Transactions',
      items: [
        { view: 'admin', label: 'Dashboard', icon: LayoutDashboard },
        { view: 'admin-offers', label: 'Deals', icon: TrendingUp },
        { view: 'admin-listings', label: 'Listings', icon: Building2 },
      ],
    },
    {
      title: 'Operations',
      items: [
        { view: 'admin-verification', label: 'Verification', icon: ShieldCheck },
        { view: 'admin-inbox', label: 'Inbox', icon: MessageSquare, badge: totalUnread > 0 ? totalUnread : undefined },
        { view: 'admin-enquiries', label: 'Inquiries', icon: Mail },
        { view: 'admin-property-wizard', label: 'Add Listing', icon: PlusCircle },
      ],
    },
    {
      title: 'Administration',
      items: [
        { view: 'admin-reports', label: 'Reports', icon: BarChart3 },
        { view: 'admin-users', label: 'Users', icon: Users },
        { view: 'admin-settings', label: 'Settings', icon: Sparkles },
      ],
    },
  ];

  const getPageTitle = (view: AppView): { category: string; title: string } => {
    switch (view) {
      case 'admin':
          return { category: 'Operations', title: 'Dashboard' };
      case 'admin-offers':
          return { category: 'Transactions', title: 'Deals & Offers' };
      case 'admin-listings':
          return { category: 'Marketplace', title: 'Listings' };
      case 'admin-verification':
          return { category: 'Operations', title: 'Verification' };
      case 'admin-inbox':
          return { category: 'Communications', title: 'Inbox' };
      case 'admin-enquiries':
          return { category: 'Communications', title: 'Inquiries' };
      case 'admin-property-wizard':
          return { category: 'Operations', title: 'Add Listing' };
      case 'admin-reports':
          return { category: 'Administration', title: 'Reports & Exports' };
      case 'admin-users':
          return { category: 'Administration', title: 'Users' };
      case 'admin-settings':
          return { category: 'Administration', title: 'Settings' };
      default:
        return { category: 'Admin Center', title: 'Administration' };
    }
  };

  const pageMeta = getPageTitle(currentView);

  return (
    <div className="h-screen w-screen bg-[var(--color-bg-deep)] text-[var(--color-text-main)] flex overflow-hidden font-sans">
      {/* Skip Navigation — accessibility */}
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--color-brand-emerald)] focus:text-white focus:text-sm focus:font-bold"
      >
        Skip to main content
      </a>

      {/* ─── DESKTOP COLLAPSIBLE SIDENAV ─── */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-surface)] transition-all duration-300 z-40 h-screen shrink-0 overflow-hidden select-none",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        {/* Sidenav Header */}
        <div className="h-20 shrink-0 border-b border-[var(--color-border)] flex items-center px-4 justify-between bg-[var(--color-bg-surface)]">
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
              className="h-10 w-10 rounded-xl object-contain shrink-0"
            />

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm tracking-[0.25em] text-[var(--color-text-main)] font-display">
                  URUGWIRO
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-brand-emerald)] font-bold">
                  Admin Panel
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] transition-colors oneui-press"
              title="Collapse Sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {/* Collapsed Toggle Button when in Icon-Only Mode */}
        {isCollapsed && (
          <div className="p-3 flex justify-center border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-card-hover)] transition-colors oneui-press"
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
                <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-dim)] mb-2.5">
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
                      "w-full flex items-center rounded-xl transition-all group relative text-left oneui-press",
                      isCollapsed
                        ? "justify-center p-3"
                        : "px-3.5 py-2.5 gap-3",
                      isActive
                        ? "bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] border border-emerald-500/30 font-bold shadow-[var(--shadow-emerald-soft)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] border border-transparent"
                    )}
                  >
                    <IconComponent
                      size={18}
                      className={cn(
                        "shrink-0 transition-colors",
                        isActive ? "text-[var(--color-brand-emerald)]" : "text-[var(--color-text-dim)] group-hover:text-[var(--color-brand-emerald)]"
                      )}
                    />

                    {!isCollapsed && (
                      <span className="text-xs font-semibold tracking-wide flex-1 truncate">
                        {item.label}
                      </span>
                    )}

                    {!isCollapsed && item.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 dark:bg-emerald-500 text-[#fff] dark:text-emerald-950 text-[10px] font-extrabold shrink-0">
                        {item.badge}
                      </span>
                    )}

                    {/* Floating Tooltip for Icon-Only Mode */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-main)] text-xs font-bold whitespace-nowrap shadow-[var(--shadow-depth-2)] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {item.label}
                        {item.badge !== undefined && (
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-600 text-[#fff] text-[9px] font-bold">
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
        <div className="shrink-0 p-3 border-t border-[var(--color-border)] space-y-2 bg-[var(--color-bg-surface)]">
          {/* Quick Exit to Marketplace */}
          <button
            onClick={() => onNavigate('home')}
            className={cn(
              "w-full flex items-center rounded-xl p-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] transition-all text-xs font-bold border border-[var(--color-border)] hover:border-emerald-500/40 oneui-press",
              isCollapsed ? "justify-center" : "gap-3"
            )}
            title="Return to Marketplace"
          >
            <ArrowUpRight size={16} className="text-[var(--color-brand-emerald)] shrink-0 transition-colors" />
            {!isCollapsed && <span>Public Marketplace</span>}
          </button>

          {/* Admin User Mini Bar */}
          <div
            className={cn(
              "flex items-center rounded-xl p-2.5 bg-[var(--color-bg-elevated)] border border-[var(--color-border)]",
              isCollapsed ? "justify-center" : "gap-3"
            )}
          >
            <div className="h-8 w-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/40 dark:text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
              {initial}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[var(--color-text-main)] truncate">{displayName}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] font-mono truncate">{user?.role ? user.role : 'Administrator'}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT CONTAINER (TopNav + Page Body) ─── */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden bg-[var(--color-bg-deep)]">

        {/* ─── TOP NAVIGATION BAR ─── */}
        <header className="h-20 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-header-bg)] backdrop-blur-xl z-30 px-6 lg:px-10 flex items-center justify-between gap-4">

          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Mobile drawer button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] oneui-press"
            >
              <PanelLeftOpen size={18} />
            </button>

            {/* Breadcrumb Info */}
            <div className="hidden sm:flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-dim)] uppercase tracking-wider font-mono font-medium">
                <span>{pageMeta.category}</span>
                <ChevronRight size={12} className="text-[var(--color-text-dim)]" />
                <span className="text-[var(--color-brand-emerald)] font-bold">{currentView}</span>
              </div>
              <h2 className="text-lg font-bold text-[var(--color-text-main)] tracking-tight truncate font-display">
                {pageMeta.title}
              </h2>
            </div>
          </div>

          {/* Center: Command Search Input */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
              <input
                type="text"
                placeholder="Search deals, properties, or buyers..."
                className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl py-2.5 pl-10 pr-12 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-[var(--color-text-dim)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right: Quick Action Launchpads */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Bell */}
            <button
              onClick={() => onNavigate('admin-inbox')}
              className="relative p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:border-[var(--color-border-hover)] transition-all oneui-press"
              title="Inbox"
            >
              <Bell size={16} />
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-emerald-600 dark:bg-emerald-500 text-[#fff] dark:text-emerald-950 text-[9px] font-black flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </button>

            {/* Return to Public Market Button */}
            <Button
              variant="ghost"
              onClick={() => onNavigate('home')}
              className="hidden sm:flex border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-xs px-3.5 py-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:border-[var(--color-border-hover)] oneui-press"
            >
              Marketplace <ArrowUpRight size={14} className="ml-1 text-[var(--color-brand-emerald)]" />
            </Button>
          </div>
        </header>

        {/* ─── MOBILE DRAWER OVERLAY ─── */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-md">
            <div className="w-72 bg-[var(--color-bg-surface)] border-r border-[var(--color-border)] h-full p-4 flex flex-col space-y-6">
              <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
                <span className="font-bold text-[var(--color-text-main)] tracking-widest text-sm">URUGWIRO ADMIN</span>
                <button onClick={() => setIsMobileOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] oneui-press">
                  <PanelLeftClose size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6">
                {NAV_SECTIONS.map((sec, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-[var(--color-text-dim)] tracking-[0.18em] px-2">{sec.title}</p>
                    {sec.items.map(it => (
                      <button
                        key={it.view}
                        onClick={() => { onNavigate(it.view); setIsMobileOpen(false); }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold oneui-press",
                          currentView === it.view
                            ? "bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] border border-emerald-500/30 font-bold"
                            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] border border-transparent"
                        )}
                      >
                        <it.icon size={16} className={currentView === it.view ? "text-[var(--color-brand-emerald)]" : "text-[var(--color-text-dim)]"} />
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

        {/* ─── PAGE BODY VIEWPORT ─── */}
        <main id="admin-main-content" className="flex-1 overflow-y-auto overscroll-contain bg-[var(--color-bg-deep)] luxury-scrollbar" tabIndex={-1}>
          <div key={currentView} className="oneui-enter min-h-full">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;

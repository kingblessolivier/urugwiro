import React, { useState } from 'react';
import {
  LayoutDashboard, TrendingUp, Building2, ShieldCheck,
  MessageSquare, Mail, BarChart3, Users,
  PlusCircle, ArrowUpRight, Search, Bell,
  PanelLeftClose, PanelLeftOpen, Settings,
  ChevronRight, Calendar, Tag, CheckCircle2,
  Wallet, Receipt, FileText, Newspaper,
  FolderTree, History, UserCheck, PhoneCall, UserRound
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { type AppView } from '../../types/navigation';
import { api } from '../../api/endpoints';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { NotificationCenter } from '../common/NotificationCenter';

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
      try {
        const res = await api.chat.contacts();
        return res.data;
      } catch {
        return [];
      }
    },
    refetchInterval: 15000,
  });

  const totalUnread = Array.isArray(contactsData)
    ? contactsData.reduce((acc, c) => acc + (c.unread_count || 0), 0)
    : 0;

  const NAV_SECTIONS: NavSection[] = [
    {
      title: 'Platform',
      items: [
        { view: 'admin', label: 'Overview', icon: LayoutDashboard },
        { view: 'admin-listings', label: 'Properties', icon: Building2 },
        { view: 'admin-verification', label: 'Verification Desk', icon: ShieldCheck },
        { view: 'admin-sellers', label: 'Sellers', icon: UserCheck },
        { view: 'admin-customers', label: 'Customers & CRM', icon: Users },
        { view: 'admin-users', label: 'Users', icon: UserRound },
      ],
    },
    {
      title: 'Operations',
      items: [
        { view: 'admin-conversations', label: 'Inbox & Chat', icon: MessageSquare, badge: totalUnread > 0 ? totalUnread : undefined },
        { view: 'admin-enquiries', label: 'Inquiries & Leads', icon: Mail },
        { view: 'admin-offers', label: 'Offers & Visits', icon: Tag },
      ],
    },
    {
      title: 'Finance & System',
      items: [
        { view: 'admin-reports', label: 'Financial Reports', icon: BarChart3 },
        { view: 'admin-settings', label: 'System Settings', icon: Settings },
      ],
    },
  ];

  const getPageTitle = (view: AppView): { category: string; title: string } => {
    switch (view) {
      case 'admin':
        return { category: 'Platform', title: 'Platform Overview' };
      case 'admin-listings':
      case 'admin-properties':
        return { category: 'Platform', title: 'Properties & Listings' };
      case 'admin-property-wizard':
      case 'admin-property-new':
        return { category: 'Platform', title: 'Add New Property' };
      case 'admin-property-detail':
        return { category: 'Platform', title: 'Property Details' };
      case 'admin-verification':
        return { category: 'Platform', title: 'Verification Desk' };
      case 'admin-sellers':
      case 'admin-seller-detail':
        return { category: 'Platform', title: 'Sellers Directory' };
      case 'admin-customers':
      case 'admin-customer-detail':
        return { category: 'Platform', title: 'Customers & CRM' };
      case 'admin-users':
        return { category: 'Platform', title: 'Users' };
      case 'admin-conversations':
      case 'admin-inbox':
        return { category: 'Operations', title: 'Inbox & Chat' };
      case 'admin-enquiries':
      case 'admin-leads':
        return { category: 'Operations', title: 'Inquiries & Leads' };
      case 'admin-offers':
      case 'admin-visits':
        return { category: 'Operations', title: 'Offers & Visits Moderation' };
      case 'admin-reports':
      case 'admin-transactions':
      case 'admin-revenue':
      case 'admin-seller-payments':
      case 'admin-expenses':
      case 'admin-documents':
        return { category: 'Finance', title: 'Financial Reports & Exports' };
      case 'admin-settings':
      case 'admin-activity-log':
      case 'admin-updates':
      case 'admin-categories':
        return { category: 'System', title: 'Platform Settings' };
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
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Sidenav Header */}
        <div className="h-16 shrink-0 border-b border-[var(--color-border)] flex items-center px-4 justify-between bg-[var(--color-bg-surface)]">
          <div
            onClick={() => onNavigate('admin')}
            className={cn(
              "flex items-center gap-3 cursor-pointer overflow-hidden",
              isCollapsed && "justify-center w-full"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
              U
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm tracking-wider text-[var(--color-text-main)] font-display">
                  URUGWIRO
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-brand-emerald)] font-bold">
                  Admin Workspace
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] transition-colors"
              title="Collapse Sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {/* Collapsed Toggle Button */}
        {isCollapsed && (
          <div className="p-2 flex justify-center border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
              title="Expand Sidebar"
            >
              <PanelLeftOpen size={16} />
            </button>
          </div>
        )}

        {/* Sidenav Navigation Items */}
        <div className="flex-1 overflow-y-auto overscroll-contain py-4 px-2 space-y-4 luxury-scrollbar">
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-dim)] mb-1">
                  {section.title}
                </p>
              )}

              {section.items.map((item) => {
                const isActive = currentView === item.view || 
                  (item.view === 'admin-listings' && (currentView === 'admin-properties' || currentView === 'admin-property-detail' || currentView === 'admin-property-wizard' || currentView === 'admin-property-new')) ||
                  (item.view === 'admin-sellers' && currentView === 'admin-seller-detail') ||
                  (item.view === 'admin-customers' && currentView === 'admin-customer-detail') ||
                  (item.view === 'admin-conversations' && currentView === 'admin-inbox') ||
                  (item.view === 'admin-enquiries' && currentView === 'admin-leads') ||
                  (item.view === 'admin-offers' && currentView === 'admin-visits') ||
                  (item.view === 'admin-reports' && ['admin-transactions', 'admin-revenue', 'admin-seller-payments', 'admin-expenses', 'admin-documents'].includes(currentView)) ||
                  (item.view === 'admin-settings' && ['admin-activity-log', 'admin-updates', 'admin-categories'].includes(currentView));
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.view}
                    onClick={() => onNavigate(item.view)}
                    className={cn(
                      "w-full flex items-center rounded-lg transition-all group relative text-left",
                      isCollapsed
                        ? "justify-center p-2.5"
                        : "px-3 py-2 gap-2.5",
                      isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold"
                        : "text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)]"
                    )}
                  >
                    <IconComponent
                      size={16}
                      className={cn(
                        "shrink-0 transition-colors",
                        isActive ? "text-emerald-600 dark:text-emerald-400" : "text-current"
                      )}
                    />

                    {!isCollapsed && (
                      <span className="text-xs tracking-wide flex-1 truncate">
                        {item.label}
                      </span>
                    )}

                    {!isCollapsed && item.badge !== undefined && (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shrink-0">
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip for Icon-Only Mode */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2.5 py-1 rounded bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-main)] text-xs font-semibold whitespace-nowrap shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {item.label}
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
          <button
            onClick={() => onNavigate('home')}
            className={cn(
              "w-full flex items-center rounded-lg p-2 text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] transition-all text-xs border border-[var(--color-border)]",
              isCollapsed ? "justify-center" : "gap-2"
            )}
            title="Return to Marketplace"
          >
            <ArrowUpRight size={14} className="text-emerald-600 shrink-0" />
            {!isCollapsed && <span>Public Marketplace</span>}
          </button>

          <div
            className={cn(
              "flex items-center rounded-lg p-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border)]",
              isCollapsed ? "justify-center" : "gap-2.5"
            )}
          >
            <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0">
              {initial}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[var(--color-text-main)] truncate">{displayName}</p>
                <p className="text-[10px] text-[var(--color-text-dim)] capitalize truncate">{user?.role || 'Admin'}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden bg-[var(--color-bg-deep)]">
        {/* Top Header */}
        <header className="h-16 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]/95 backdrop-blur z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
            >
              <PanelLeftOpen size={18} />
            </button>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-dim)] uppercase tracking-wider font-mono">
                <span>{pageMeta.category}</span>
                <ChevronRight size={10} className="text-[var(--color-text-dim)]" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{pageMeta.title}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-main)] tracking-tight truncate">
                {pageMeta.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <NotificationCenter />
            <Button
              variant="ghost"
              onClick={() => onNavigate('home')}
              className="hidden sm:flex border border-[var(--color-border)] text-xs px-3 py-1.5 rounded-lg text-[var(--color-text-dim)] hover:text-[var(--color-text-main)]"
            >
              Marketplace <ArrowUpRight size={13} className="ml-1 text-emerald-600" />
            </Button>
          </div>
        </header>

        {/* Mobile Drawer */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm">
            <div className="w-72 bg-[var(--color-bg-surface)] border-r border-[var(--color-border)] h-full p-4 flex flex-col space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
                <span className="font-bold text-sm tracking-wider">ADMIN WORKSPACE</span>
                <button onClick={() => setIsMobileOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]">
                  <PanelLeftClose size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                {NAV_SECTIONS.map((sec, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-[var(--color-text-dim)] tracking-wider px-2">{sec.title}</p>
                    {sec.items.map(it => {
                      const isActive = currentView === it.view ||
                        (it.view === 'admin-listings' && (currentView === 'admin-properties' || currentView === 'admin-property-detail' || currentView === 'admin-property-wizard' || currentView === 'admin-property-new')) ||
                        (it.view === 'admin-sellers' && currentView === 'admin-seller-detail') ||
                        (it.view === 'admin-customers' && currentView === 'admin-customer-detail') ||
                        (it.view === 'admin-conversations' && currentView === 'admin-inbox') ||
                        (it.view === 'admin-enquiries' && currentView === 'admin-leads') ||
                        (it.view === 'admin-offers' && currentView === 'admin-visits') ||
                        (it.view === 'admin-reports' && ['admin-transactions', 'admin-revenue', 'admin-seller-payments', 'admin-expenses', 'admin-documents'].includes(currentView)) ||
                        (it.view === 'admin-settings' && ['admin-activity-log', 'admin-updates', 'admin-categories'].includes(currentView));

                      return (
                        <button
                          key={it.view}
                          onClick={() => { onNavigate(it.view); setIsMobileOpen(false); }}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium",
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold"
                              : "text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)]"
                          )}
                        >
                          <it.icon size={15} />
                          <span>{it.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileOpen(false)} />
          </div>
        )}

        {/* Body */}
        <main id="admin-main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 luxury-scrollbar" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

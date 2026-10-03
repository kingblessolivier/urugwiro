import React, { useState } from 'react';
import {
  LayoutDashboard, Building2, ShieldCheck,
  MessageSquare, Mail, BarChart3, Users,
  ArrowUpRight,
  PanelLeftClose,
  Settings,
  UserCheck, Newspaper, FolderTree, UserRound, Tag
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  getDefaultDashboardForUser,
  isViewAllowedForUser,
  type AppView,
} from '../../types/navigation';
import { api } from '../../api/endpoints';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { Sidebar, type SidebarSection } from './Sidebar';
import { Topbar } from './Topbar';
import { Plus } from 'lucide-react';

interface AdminLayoutProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentView, onNavigate, children }) => {
  const { user, logout } = useAuth();
  const displayName = user?.full_name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username) || 'Administrator';
  const initial = displayName.slice(0, 1).toUpperCase();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const canManageOperations = isViewAllowedForUser('admin', user);
  const defaultDashboard = getDefaultDashboardForUser(user);

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
    enabled: canManageOperations,
    refetchInterval: 15000,
  });

  const totalUnread = Array.isArray(contactsData)
    ? contactsData.reduce((acc, c) => acc + (c.unread_count || 0), 0)
    : 0;

  const allNavSections: SidebarSection[] = [
    {
      title: 'Platform',
      items: [
        { view: 'admin', label: 'Overview', icon: LayoutDashboard },
        { view: 'admin-listings', label: 'Properties', icon: Building2 },
        { view: 'admin-verification', label: 'Verification', icon: ShieldCheck },
        { view: 'admin-sellers', label: 'Sellers', icon: UserCheck },
        { view: 'admin-customers', label: 'Customers', icon: Users },
        { view: 'admin-users', label: 'User Accounts', icon: UserRound },
      ],
    },
    {
      title: 'Operations',
      items: [
        { view: 'admin-conversations', label: 'Inbox & Chat', icon: MessageSquare, badge: totalUnread > 0 ? totalUnread : undefined, highlight: totalUnread > 0 },
        { view: 'admin-enquiries', label: 'Inquiries & Leads', icon: Mail },
        { view: 'admin-offers', label: 'Offers & Visits', icon: Tag },
      ],
    },
    {
      title: 'Insights & System',
      items: [
        { view: 'admin-reports', label: 'Reports & Analytics', icon: BarChart3 },
        { view: 'admin-updates', label: 'Announcements', icon: Newspaper },
        { view: 'admin-activity-log', label: 'System Logs', icon: FolderTree },
        { view: 'admin-settings', label: 'Platform Settings', icon: Settings },
      ],
    },
  ];

  const NAV_SECTIONS = allNavSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => isViewAllowedForUser(item.view as AppView, user)),
    }))
    .filter((section) => section.items.length > 0);

  const isNavActive = (itemView: string) => {
    if (currentView === itemView) return true;
    const matchTable: Record<string, string[]> = {
      'admin-listings': ['admin-properties', 'admin-property-detail', 'admin-property-wizard', 'admin-property-new'],
      'admin-sellers': ['admin-seller-detail'],
      'admin-customers': ['admin-customer-detail'],
      'admin-conversations': ['admin-inbox'],
      'admin-enquiries': ['admin-leads'],
      'admin-offers': ['admin-visits'],
      'admin-reports': ['admin-transactions', 'admin-revenue', 'admin-seller-payments', 'admin-expenses', 'admin-documents'],
      'admin-settings': ['admin-categories'],
    };
    return (matchTable[itemView] || []).includes(currentView);
  };

  // Map AppView → breadcrumb/title
  const pageMeta = (() => {
    const findMatch = (): { section: string; crumb: string; title: string; view?: AppView } | null => {
      for (const sec of NAV_SECTIONS) {
        for (const it of sec.items) {
          if (isNavActive(it.view)) {
            return { section: sec.title, crumb: it.label, title: it.label, view: it.view as AppView };
          }
        }
      }
      return null;
    };
    const m = findMatch();
    if (!m) {
      return {
        breadcrumbs: [{ label: 'Admin Center' }, { label: 'Administration', accent: true }],
        title: 'Administration',
      };
    }
    // Some views have more specific titles
    const overrides: Partial<Record<string, string>> = {
      'admin-property-wizard': 'Add New Property',
      'admin-property-new': 'Add New Property',
      'admin-property-detail': 'Property Details',
      'admin-seller-detail': 'Seller Profile',
      'admin-customer-detail': 'Customer Profile',
    };
    const specificTitle = (currentView && overrides[currentView]) || m.title;
    return {
      breadcrumbs: [
        { label: m.section },
        { label: specificTitle, accent: true },
      ],
      title: specificTitle,
      subtitle: m.section,
    };
  })();

  const handleQuickAdd = () => onNavigate('admin-property-wizard');

  return (
    <div className="h-screen w-screen bg-[var(--color-bg-deep)] text-[var(--color-text-main)] flex overflow-hidden font-sans antialiased">
      {/* Skip Navigation — accessibility */}
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--color-brand-emerald)] focus:text-white focus:text-sm focus:font-bold"
      >
        Skip to main content
      </a>

      {/* ─── LUXURY SIDENAV ─── */}
      <Sidebar
        sections={NAV_SECTIONS}
        activeView={currentView}
        onNavigate={(v) => onNavigate(v as AppView)}
        brandName="Urugwiro"
        roleChip={user?.role || 'Admin'}
        brandSubtitle="Administration"
        userInitial={initial}
        userName={displayName}
        userRole={user?.role || 'Administrator'}
        storageKey="urugwiro_admin_sidebar_collapsed"
        onPublicClick={() => onNavigate('home')}
        onBrandClick={() => onNavigate(defaultDashboard)}
        accentTone="emerald"
      />

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden bg-[var(--color-bg-deep)]">
        {/* ─── LUXURY TOP NAVBAR ─── */}
        <Topbar
          breadcrumbs={pageMeta.breadcrumbs}
          title={pageMeta.title}
          subtitle={pageMeta.subtitle}
          searchPlaceholder="Search properties, users, inquiries…"
          showMenuButton
          menuOpen={isMobileOpen}
          onMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
          primaryAction={canManageOperations ? {
            label: 'New Listing',
            icon: Plus,
            onClick: handleQuickAdd,
            tone: 'emerald',
          } : undefined}
          avatar={{
            initial,
            name: displayName,
            role: user?.role || 'Administrator',
            accentTone: 'emerald',
            onLogout: logout,
          }}
        />

        {/* Mobile Drawer */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-black/55 backdrop-blur-sm">
            <div className="w-72 h-full p-4 flex flex-col space-y-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, var(--color-bg-surface) 0%, var(--color-bg-deep) 100%)',
                borderRight: '1px solid var(--color-border)',
              }}
            >
              {/* emerald radial glow */}
              <div className="pointer-events-none absolute inset-0 opacity-60" style={{
                background: 'radial-gradient(ellipse at 0% 0%, rgba(5,150,105,0.18), transparent 45%)',
              }} />

              <div className="relative z-10 flex justify-between items-center border-b border-[var(--color-border)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">U</div>
                  <div className="flex flex-col">
                    <span className="font-display font-semibold text-sm tracking-tight leading-none">Urugwiro</span>
                    <span className="text-[9px] uppercase tracking-wider text-[var(--color-brand-emerald)] font-bold">Admin</span>
                  </div>
                </div>
                <button onClick={() => setIsMobileOpen(false)} className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] border border-transparent hover:border-[var(--color-border)] transition-colors">
                  <PanelLeftClose size={17} />
                </button>
              </div>

              <div className="relative z-10 flex-1 overflow-y-auto space-y-5 [scrollbar-width:thin]">
                {NAV_SECTIONS.map((sec, i) => (
                  <div key={i} className="space-y-1">
                    <div className="px-3 pb-1.5 flex items-center gap-2">
                      <div className="h-px flex-1 rounded-full bg-gradient-to-r from-emerald-500/25 via-transparent to-transparent" />
                      <p className="text-[9.5px] uppercase font-bold text-[var(--color-text-dim)] tracking-[0.16em] whitespace-nowrap">{sec.title}</p>
                      <div className="h-px w-3 rounded-full bg-[var(--color-border)]/40" />
                    </div>
                    {sec.items.map(it => {
                      const active = isNavActive(it.view);
                      const ItemIcon = it.icon;
                      return (
                        <button
                          key={it.view}
                          onClick={() => { onNavigate(it.view as AppView); setIsMobileOpen(false); }}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-[12.5px] font-medium transition-all",
                            active
                              ? "bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] border border-emerald-500/30 font-semibold shadow-[var(--shadow-emerald-soft)]"
                              : "text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] border border-transparent"
                          )}
                        >
                          <ItemIcon size={16} className={active ? "text-[var(--color-brand-emerald)]" : ""} />
                          <span className="tracking-wide">{it.label}</span>
                          {it.badge !== undefined && (
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full border ml-auto",
                              active
                                ? "bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] border-emerald-500/30"
                                : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border)]"
                            )}>
                              {it.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="relative z-10 pt-3 mt-2 border-t border-[var(--color-border)] space-y-2">
                <button
                  onClick={() => { onNavigate('home'); setIsMobileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-[12px] text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] border border-transparent hover:border-[var(--color-border)]/60 transition-all"
                >
                  <ArrowUpRight size={14} className="text-emerald-600" />
                  <span className="tracking-wide font-medium">Public Marketplace</span>
                </button>

                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
                  <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-[var(--color-text-main)] truncate leading-none">{displayName}</p>
                    <p className="text-[10px] text-[var(--color-text-dim)] capitalize leading-none mt-1 truncate">{user?.role || 'Admin'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileOpen(false)} />
          </div>
        )}

        {/* Body */}
        <main id="admin-main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 [scrollbar-width:thin] scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

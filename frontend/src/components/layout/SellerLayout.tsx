import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  MessageSquare,
  Calendar,
  Tag,
  Wallet,
  ArrowLeft,
  X,
  LogOut,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { AppView } from '../../types/navigation';
import { cn } from '../../lib/utils';
import { Sidebar, type SidebarSection } from './Sidebar';
import { Topbar } from './Topbar';

interface SellerLayoutProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  children: React.ReactNode;
}

export const SellerLayout: React.FC<SellerLayoutProps> = ({
  currentView,
  onNavigate,
  children,
}) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username || 'Seller';
  const initial = (user?.first_name?.[0] || user?.username?.[0] || displayName?.[0] || 'S').toUpperCase();
  const sellerRole = user?.seller_is_verified
    ? 'Verified Seller'
    : user?.seller_status === 'approved'
      ? 'Approved Seller'
      : user?.seller_status === 'pending'
        ? 'Seller - Pending Review'
        : 'Seller';

  const activeView = currentView === 'seller' ? 'seller-dashboard' : currentView;

  const NAV_SECTIONS: SidebarSection[] = [
    {
      title: 'Portfolio',
      items: [
        { view: 'seller-dashboard', label: 'Overview', icon: LayoutDashboard },
        { view: 'seller-properties', label: 'My Listings', icon: Building2 },
        { view: 'seller-property-new', label: 'Add Property', icon: PlusCircle, highlight: true },
      ],
    },
    {
      title: 'Engagement',
      items: [
        { view: 'seller-conversations', label: 'Messages', icon: MessageSquare },
        { view: 'seller-visits', label: 'Visits & Showings', icon: Calendar },
        { view: 'seller-offers', label: 'Offers & Prices', icon: Tag },
      ],
    },
    {
      title: 'Business',
      items: [
        { view: 'seller-earnings', label: 'Earnings', icon: Wallet },
      ],
    },
  ];

  const isNavActive = (view: string) => {
    if (activeView === view) return true;
    const map: Record<string, string[]> = {
      'seller-dashboard': ['seller'],
      'seller-properties': ['seller-property-detail', 'seller-listing-edit', 'seller-listings', 'seller-listing-wizard'],
    };
    return (map[view] || []).includes(activeView);
  };

  const pageMeta = useMemo(() => {
    for (const sec of NAV_SECTIONS) {
      for (const it of sec.items) {
        if (isNavActive(it.view)) {
          return {
            breadcrumbs: [
              { label: sec.title },
              { label: it.label, accent: true },
            ],
            title: it.label,
            subtitle: sec.title,
          };
        }
      }
    }
    return {
      breadcrumbs: [{ label: 'Seller Studio' }, { label: 'Dashboard', accent: true }],
      title: 'Seller Dashboard',
    };
  }, [activeView]);

  return (
    <div className="h-screen w-screen bg-[var(--color-bg-deep)] text-[var(--color-text-main)] flex overflow-hidden font-sans antialiased">
      {/* ─── LUXURY SIDENAV (goldish/GOLD TONE ─── */}
      <Sidebar
        sections={NAV_SECTIONS}
        activeView={activeView}
        onNavigate={(v) => onNavigate(v as AppView)}
        brandName="Urugwiro"
        roleChip="Seller"
        brandSubtitle="Listing Studio"
        userInitial={initial}
        userName={displayName}
        userRole={sellerRole}
        storageKey="urugwiro_seller_sidebar_collapsed"
        onPublicClick={() => onNavigate('home')}
        onBrandClick={() => onNavigate('seller-dashboard')}
        accentTone="emerald"
      />

      {/* ─── MAIN ─── */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden bg-[var(--color-bg-deep)]">
        {/* ─── TOPBAR ─── */}
        <Topbar
          breadcrumbs={pageMeta.breadcrumbs}
          title={pageMeta.title}
          subtitle={pageMeta.subtitle}
          searchPlaceholder="Search my listings, inquiries, messages…"
          showMenuButton
          menuOpen={mobileMenuOpen}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          primaryAction={{
            label: 'Add Listing',
            icon: Plus,
            onClick: () => onNavigate('seller-property-new'),
            tone: 'emerald',
          }}
          avatar={{
            initial,
            name: displayName,
            role: sellerRole,
            accentTone: 'emerald',
            onLogout: logout,
          }}
        />

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-black/55 backdrop-blur-sm"
               onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-72 max-w-[80vw] h-full p-4 flex flex-col space-y-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, var(--color-bg-surface) 0%, var(--color-bg-deep) 100%)',
                borderRight: '1px solid var(--color-border)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pointer-events-none absolute inset-0 opacity-60" style={{
                background: 'radial-gradient(ellipse at 0% 0%, rgba(5,150,105,0.18), transparent 45%)',
              }} />

              <div className="relative z-10 flex items-center justify-between pb-3 border-b border-[var(--color-border)] mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">U</div>
                  <div className="flex flex-col">
                    <span className="font-display font-semibold text-sm tracking-tight leading-none">Urugwiro</span>
                    <span className="text-[9px] uppercase tracking-wider text-[var(--color-brand-emerald)] font-bold">Seller Studio</span>
                  </div>
                </div>
                <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] border border-transparent hover:border-[var(--color-border)] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="relative z-10 flex-1 space-y-5 overflow-y-auto [scrollbar-width:thin]">
                {NAV_SECTIONS.map((sec, i) => (
                  <div key={i} className="space-y-1">
                    <div className="px-3 pb-1.5 flex items-center gap-2">
                      <div className="h-px flex-1 rounded-full bg-gradient-to-r from-emerald-500/25 via-transparent to-transparent" />
                      <p className="text-[9.5px] uppercase font-bold text-[var(--color-text-dim)] tracking-[0.16em] whitespace-nowrap">{sec.title}</p>
                      <div className="h-px w-3 rounded-full bg-[var(--color-border)]/40" />
                    </div>
                    {sec.items.map(it => {
                      const Icon = it.icon;
                      const active = isNavActive(it.view);
                      return (
                        <button key={it.view}
                          type="button"
                          onClick={() => { onNavigate(it.view as AppView); setMobileMenuOpen(false); }}
                          className={cn(
                            'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-[12.5px] font-medium transition-all',
                            active
                              ? 'bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] border border-emerald-500/30 font-semibold shadow-[var(--shadow-emerald-soft)]'
                              : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] border border-transparent'
                          )}
                        >
                          <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-[var(--color-brand-emerald)]' : '')} />
                          <span className="tracking-wide flex-1 text-left">{it.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>

              <div className="relative z-10 pt-3 mt-2 border-t border-[var(--color-border)] space-y-2">
                <button type="button"
                  onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-[12px] text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] border border-transparent hover:border-[var(--color-border)]/60 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="tracking-wide font-medium">Public Marketplace</span>
                </button>

                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
                  <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-[var(--color-text-main)] truncate leading-none">{displayName}</p>
                    <p className="text-[10px] text-[var(--color-text-dim)] leading-none mt-1">{sellerRole}</p>
                  </div>
                  <button type="button" onClick={() => logout()} title="Sign Out"
                    className="p-2 rounded-xl text-[var(--color-text-dim)] hover:text-red-500 hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1" />
          </div>
        )}

        {/* Content */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 [scrollbar-width:thin] scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent pb-24 lg:pb-8">
          {children}
        </main>

        {/* Mobile FAB - Primary Action */}
        <button type="button"
          onClick={() => onNavigate('seller-property-new')}
          className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600 text-white flex items-center justify-center shadow-[0_6px_22px_-4px_rgba(5,150,105,0.55)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          aria-label="Add new listing"
        >
          <PlusCircle size={24} />
        </button>
      </div>
    </div>
  );
};

export default SellerLayout;

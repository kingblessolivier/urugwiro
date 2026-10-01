import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  MessageSquare,
  Calendar,
  Tag,
  BarChart3,
  FileText,
  Wallet,
  User,
  ArrowLeft,
  Menu,
  X,
  LogOut,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { AppView } from '../../types/navigation';
import { DarkModeToggle } from './DarkModeToggle';
import { cn } from '../../lib/utils';
import { NotificationCenter } from '../common/NotificationCenter';

interface SellerLayoutProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  children: React.ReactNode;
}

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'seller-dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'seller-properties', label: 'My Listings', icon: Building2 },
  { id: 'seller-property-new', label: 'Add Listing', icon: PlusCircle },
  { id: 'seller-conversations', label: 'Conversations', icon: MessageSquare },
  { id: 'seller-visits', label: 'Visits', icon: Calendar },
  { id: 'seller-offers', label: 'Offers', icon: Tag },
  { id: 'seller-analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'seller-documents', label: 'Documents', icon: FileText },
  { id: 'seller-earnings', label: 'Earnings & Payouts', icon: Wallet },
  { id: 'seller-profile', label: 'Profile', icon: User },
];

export const SellerLayout: React.FC<SellerLayoutProps> = ({
  currentView,
  onNavigate,
  children,
}) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeView = currentView === 'seller' ? 'seller-dashboard' : currentView;

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] text-[var(--color-text-main)] flex flex-col antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 h-16 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-2 rounded-lg text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-subtle)] lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => onNavigate('seller-dashboard')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              U
            </div>
            <div>
              <span className="font-bold tracking-tight text-base block leading-none">URUGWIRO</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider uppercase block">
                Seller Studio
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-subtle)] rounded-md transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Public Site
          </button>

          <DarkModeToggle />
          <NotificationCenter />

          <div className="h-5 w-px bg-[var(--color-border-subtle)] hidden sm:block" />

          {/* User badge */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center justify-center text-xs">
              {(user?.first_name?.[0] || user?.username?.[0] || 'S').toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-medium leading-none truncate max-w-[120px]">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
              </div>
              <div className="text-[10px] text-[var(--color-text-dim)] capitalize leading-none mt-1">
                Verified Seller
              </div>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-md text-[var(--color-text-dim)] hover:text-red-500 hover:bg-red-500/10 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Area: Sidebar + Content */}
      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
          <div className="text-[11px] font-semibold text-[var(--color-text-dim)] uppercase tracking-wider px-3 py-2">
            Workspace
          </div>

          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left relative',
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold'
                      : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-subtle)]'
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-r-full" />
                  )}
                  <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-emerald-600' : 'text-current')} />
                  <span className="truncate flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-[var(--color-border-subtle)] mt-auto">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-subtle)] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Marketplace</span>
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-64 max-w-[80vw] h-full bg-[var(--color-bg-surface)] p-4 flex flex-col shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)] mb-3">
                <span className="font-bold text-sm">Seller Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-[var(--color-text-dim)] hover:text-[var(--color-text-main)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-left',
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold'
                          : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-subtle)]'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-[var(--color-border-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('home');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text-main)]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Public Marketplace</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content View Area */}
        <main className="flex-1 min-w-0 pb-16 lg:pb-8 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-bg-surface)] border-t border-[var(--color-border-subtle)] px-2 py-1.5 flex items-center justify-around">
        <button
          type="button"
          onClick={() => onNavigate('seller-dashboard')}
          className={cn(
            'flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors',
            activeView === 'seller-dashboard'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-[var(--color-text-dim)]'
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('seller-properties')}
          className={cn(
            'flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors',
            activeView === 'seller-properties'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-[var(--color-text-dim)]'
          )}
        >
          <Building2 className="w-4 h-4" />
          <span>Listings</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('seller-property-new')}
          className="flex flex-col items-center -mt-4"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">Add</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('seller-offers')}
          className={cn(
            'flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors',
            activeView === 'seller-offers'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-[var(--color-text-dim)]'
          )}
        >
          <Tag className="w-4 h-4" />
          <span>Offers</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium text-[var(--color-text-dim)]"
        >
          <Menu className="w-4 h-4" />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
};

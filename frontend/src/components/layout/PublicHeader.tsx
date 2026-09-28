import React, { useState, useRef, useEffect } from 'react';
import {
  Menu, Search, X, ChevronDown, LogOut, Building2, KeyRound, Shield, Briefcase,
  Layers, Settings, Compass, FileText, Sun, Moon, LayoutDashboard, Mail,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { AppView } from '../../types/navigation';

interface PublicHeaderProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  onSearch?: (query: string) => void;
}

const links: { label: string; view: AppView }[] = [
  { label: 'Explore', view: 'discovery' },
  { label: 'Property', view: 'discovery' },
  { label: 'Updates', view: 'updates' },
  { label: 'About', view: 'about' },
  { label: 'Contact', view: 'contact' },
];

const menuItem =
  'flex w-full items-center gap-3 rounded-[var(--radius-control)] px-3.5 py-2.5 text-sm font-medium ' +
  'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] ' +
  'transition-colors cursor-pointer';

const iconButton =
  'h-10 w-10 flex items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border)] ' +
  'bg-[var(--color-input-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] ' +
  'hover:border-[var(--color-border-hover)] transition-colors cursor-pointer oneui-press shrink-0';

const searchWrap =
  'flex w-full items-center gap-2.5 rounded-[var(--radius-control)] border border-[var(--color-input-border)] ' +
  'bg-[var(--color-input-bg)] px-3.5 transition-all focus-within:border-emerald-600 ' +
  'focus-within:ring-2 focus-within:ring-emerald-600/20';

const searchInput =
  'w-full bg-transparent py-2.5 text-sm text-[var(--color-text-main)] outline-none placeholder:text-[var(--color-text-dim)]';

export const PublicHeader: React.FC<PublicHeaderProps> = ({ view, onNavigate, onSearch }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch?.(query);
    onNavigate('discovery');
    setOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    setOpen(false);
    onNavigate('home');
  };

  const getInitials = () => {
    try {
      if (!user) return 'U';
      if (user.full_name && typeof user.full_name === 'string') {
        const trimmed = user.full_name.trim();
        if (!trimmed) {
          return (user.username && typeof user.username === 'string') ? user.username.slice(0, 2).toUpperCase() : 'U';
        }
        const parts = trimmed.split(/\s+/).filter(Boolean);
        if (parts.length >= 2 && parts[0] && parts[1]) {
          return `${parts[0][0] || parts[0].charAt(0) || ''}${parts[1][0] || parts[1].charAt(0) || ''}`.toUpperCase() || 'U';
        }
        if (parts[0]) {
          return parts[0].slice(0, 2).toUpperCase() || 'U';
        }
      }
      if (user.username && typeof user.username === 'string') {
        return user.username.slice(0, 2).toUpperCase();
      }
      return 'U';
    } catch (_err) {
      return 'U';
    }
  };

  const role = user?.role || 'Buyer';
  const getRoleBadge = (r: string) => {
    switch (r.toLowerCase()) {
      case 'admin':
        return {
          pill: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30',
          label: 'Platform Executive',
          icon: <Shield size={12} className="text-purple-600 dark:text-purple-400" />,
        };
      case 'tenant':
        return {
          pill: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30',
          label: 'Resident / Tenant',
          icon: <KeyRound size={12} className="text-sky-600 dark:text-sky-400" />,
        };
      case 'seller':
        return {
          pill: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
          label: 'Asset Seller',
          icon: <Building2 size={12} className="text-amber-600 dark:text-amber-400" />,
        };
      case 'agent':
        return {
          pill: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30',
          label: 'Licensed Broker',
          icon: <Briefcase size={12} className="text-teal-600 dark:text-teal-400" />,
        };
      case 'owner':
        return {
          pill: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30',
          label: 'Asset Owner',
          icon: <Building2 size={12} className="text-orange-600 dark:text-orange-400" />,
        };
      case 'buyer':
      default:
        return {
          pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
          label: 'Private Client',
          icon: <Building2 size={12} className="text-emerald-600 dark:text-emerald-400" />,
        };
    }
  };

  const badgeInfo = getRoleBadge(role);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300 overflow-x-clip"
      style={{ background: 'var(--color-header-bg)', borderColor: 'var(--color-header-border)' }}
    >
      <div className="flex h-16 sm:h-18 w-full max-w-7xl mx-auto items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button type="button" data-tour="logo" onClick={() => onNavigate('home')} className="flex shrink-0 items-center gap-2.5 group cursor-pointer">
          <img src="/urugwiro_logo_fav.png" alt="Urugwiro Logo" className="h-9 w-9 rounded-lg object-contain group-hover:scale-105 transition-transform" />
          <span className="text-xl font-bold font-display tracking-tight text-[var(--color-text-main)]">Urugwiro</span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex shrink-0">
          {links.map((link) => {
            const active = view === link.view;
            return (
              <button
                key={link.label}
                type="button"
                data-tour={link.view === 'discovery' ? 'explore' : undefined}
                onClick={() => onNavigate(link.view)}
                className={cn(
                  'relative rounded-[var(--radius-control)] px-3.5 py-2 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap',
                  active
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)]'
                )}
              >
                {link.label}
                {active && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-emerald-600 dark:bg-emerald-400" />}
              </button>
            );
          })}
        </nav>

        {/* Desktop Search */}
        {view !== 'discovery' && (
          <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 justify-end 2xl:flex max-w-xs">
            <label className={searchWrap} data-tour="search">
              <Search size={18} className="shrink-0 text-[var(--color-text-dim)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search properties..."
                className={searchInput}
              />
            </label>
          </form>
        )}

        {/* Desktop Actions */}
        <div className="ml-auto hidden items-center gap-2.5 lg:flex shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={iconButton}
          >
            {isDark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
          </button>

          <Button variant="primary" size="md" data-tour="sell" onClick={() => onNavigate('submit-proposal')} className="whitespace-nowrap">
            Sell or Rent
          </Button>

          {isAuthenticated && user ? (
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((p) => !p)}
                className="flex items-center gap-2.5 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-hover)] px-3 py-2 transition-colors text-left cursor-pointer"
              >
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm font-bold">
                  {getInitials()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-[var(--color-text-main)] leading-tight max-w-[140px] truncate">
                    {user.full_name || user.username}
                  </span>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {user.role}
                  </span>
                </div>
                <ChevronDown size={16} className={cn('text-[var(--color-text-dim)] transition-transform', profileDropdownOpen && 'rotate-180')} />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-2 shadow-[var(--shadow-depth-3)] animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="p-3 border-b border-[var(--color-border)] mb-1.5">
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold">
                        {getInitials()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-[var(--color-text-main)] truncate">{user.full_name || user.username}</div>
                        <div className="text-xs text-[var(--color-text-muted)] truncate">{user.email || `@${user.username}`}</div>
                      </div>
                    </div>
                    <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold', badgeInfo.pill)}>
                      {badgeInfo.icon}
                      <span>{badgeInfo.label}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5 py-1">
                    {role.toLowerCase() === 'admin' && (
                      <>
                        <button type="button" onClick={() => { onNavigate('admin'); setProfileDropdownOpen(false); }} className={menuItem}><Shield size={16} className="text-purple-500" /><span>Admin Dashboard</span></button>
                        <button type="button" onClick={() => { onNavigate('admin-listings'); setProfileDropdownOpen(false); }} className={menuItem}><Layers size={16} className="text-emerald-500" /><span>Admin Listings</span></button>
                        <button type="button" onClick={() => { onNavigate('admin-enquiries'); setProfileDropdownOpen(false); }} className={menuItem}><Mail size={16} className="text-emerald-500" /><span>Customer Inquiries &amp; Leads</span></button>
                        <button type="button" onClick={() => { onNavigate('admin-offers'); setProfileDropdownOpen(false); }} className={menuItem}><Briefcase size={16} className="text-blue-500" /><span>Deals &amp; Offers</span></button>
                        <button type="button" onClick={() => { onNavigate('admin-verification'); setProfileDropdownOpen(false); }} className={menuItem}><Building2 size={16} className="text-amber-500" /><span>Title Verification &amp; Cadastre</span></button>
                        <button type="button" onClick={() => { onNavigate('admin-settings'); setProfileDropdownOpen(false); }} className={menuItem}><Settings size={16} className="text-[var(--color-text-dim)]" /><span>System Settings &amp; AI</span></button>
                      </>
                    )}

                    {role.toLowerCase() === 'tenant' && (
                      <>
                        <button type="button" onClick={() => { onNavigate('tenant-dashboard'); setProfileDropdownOpen(false); }} className={menuItem}><KeyRound size={16} className="text-sky-500" /><span>Tenant Launchpad &amp; Leases</span></button>
                        <button type="button" onClick={() => { onNavigate('discovery'); setProfileDropdownOpen(false); }} className={menuItem}><Compass size={16} className="text-emerald-500" /><span>Explore Available Rentals</span></button>
                      </>
                    )}

                    {role.toLowerCase() === 'buyer' && (
                      <>
                        <button type="button" onClick={() => { onNavigate('buyer-dashboard'); setProfileDropdownOpen(false); }} className={menuItem}><LayoutDashboard size={16} className="text-emerald-500" /><span>Buyer Studio &amp; Offers</span></button>
                        <button type="button" onClick={() => { onNavigate('discovery'); setProfileDropdownOpen(false); }} className={menuItem}><Compass size={16} className="text-emerald-500" /><span>Explore Property Catalog</span></button>
                        <button type="button" onClick={() => { onNavigate('submit-proposal'); setProfileDropdownOpen(false); }} className={menuItem}><FileText size={16} className="text-blue-500" /><span>Submit Acquisition Request</span></button>
                      </>
                    )}

                    {role.toLowerCase() === 'seller' && (
                      <>
                        <button type="button" onClick={() => { onNavigate('seller-dashboard'); setProfileDropdownOpen(false); }} className={menuItem}><Building2 size={16} className="text-amber-500" /><span>Seller Studio &amp; Inventory</span></button>
                        <button type="button" onClick={() => { onNavigate('seller-wizard'); setProfileDropdownOpen(false); }} className={menuItem}><Layers size={16} className="text-emerald-500" /><span>List New Asset</span></button>
                      </>
                    )}

                    {role.toLowerCase() === 'agent' && (
                      <button type="button" onClick={() => { onNavigate('agent-dashboard'); setProfileDropdownOpen(false); }} className={menuItem}><Briefcase size={16} className="text-teal-500" /><span>Broker &amp; Showing Desk</span></button>
                    )}

                    {role.toLowerCase() === 'owner' && (
                      <button type="button" onClick={() => { onNavigate('owner-dashboard'); setProfileDropdownOpen(false); }} className={menuItem}><Building2 size={16} className="text-orange-500" /><span>Owner Portfolio Launchpad</span></button>
                    )}
                  </div>

                  <div className="border-t border-[var(--color-border)] pt-1.5 mt-1.5">
                    <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-[var(--radius-control)] px-3.5 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer">
                      <LogOut size={16} /><span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="md" data-tour="auth" onClick={() => onNavigate('login')} className="whitespace-nowrap">Sign In</Button>
              <Button variant="secondary" size="md" onClick={() => onNavigate('register')} className="whitespace-nowrap">Join Platform</Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="ml-auto rounded-[var(--radius-control)] p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] lg:hidden transition-colors cursor-pointer"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-4 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {isAuthenticated && user && (
            <div className="mb-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold">
                  {getInitials()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-[var(--color-text-main)] truncate">{user.full_name || user.username}</div>
                  <div className="text-xs text-[var(--color-text-muted)] truncate">{user.email || `@${user.username}`}</div>
                  <div className="mt-1.5">
                    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold', badgeInfo.pill)}>
                      {badgeInfo.icon}<span>{badgeInfo.label}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[var(--color-border)] grid gap-1">
                {role.toLowerCase() === 'admin' && <button type="button" onClick={() => { onNavigate('admin'); setOpen(false); }} className={menuItem}><Shield size={16} className="text-purple-500" />Admin Dashboard</button>}
                {(role.toLowerCase() === 'buyer' || role.toLowerCase() === 'consumer' || role.toLowerCase() === 'client') && <button type="button" onClick={() => { onNavigate('buyer-dashboard'); setOpen(false); }} className={menuItem}><LayoutDashboard size={16} className="text-emerald-500" />Buyer Studio &amp; Offers</button>}
                {role.toLowerCase() === 'tenant' && <button type="button" onClick={() => { onNavigate('tenant-dashboard'); setOpen(false); }} className={menuItem}><KeyRound size={16} className="text-sky-500" />Tenant Studio &amp; Leases</button>}
                {role.toLowerCase() === 'seller' && <button type="button" onClick={() => { onNavigate('seller-dashboard'); setOpen(false); }} className={menuItem}><Building2 size={16} className="text-amber-500" />Seller Studio</button>}
                {role.toLowerCase() === 'agent' && <button type="button" onClick={() => { onNavigate('agent-dashboard'); setOpen(false); }} className={menuItem}><Briefcase size={16} className="text-teal-500" />Broker Showing Desk</button>}
                {role.toLowerCase() === 'owner' && <button type="button" onClick={() => { onNavigate('owner-dashboard'); setOpen(false); }} className={menuItem}><Building2 size={16} className="text-orange-500" />Owner Portfolio</button>}
              </div>
            </div>
          )}

          <form onSubmit={submitSearch} className="mb-4">
            <label className={searchWrap}>
              <Search size={18} className="shrink-0 text-[var(--color-text-dim)]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search properties..." className={searchInput} />
            </label>
          </form>

          <div className="grid gap-1">
            {links.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => { onNavigate(link.view); setOpen(false); }}
                className={cn(
                  'rounded-[var(--radius-control)] px-3.5 py-3 text-left text-sm font-semibold transition-colors cursor-pointer',
                  view === link.view
                    ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-main)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)]'
                )}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-2 pt-4 border-t border-[var(--color-border)]">
            <button type="button" onClick={toggleTheme} className="flex items-center justify-between rounded-[var(--radius-control)] px-3.5 py-3 border border-[var(--color-border)] bg-[var(--color-input-bg)] text-[var(--color-text-main)] transition-colors cursor-pointer">
              <span className="text-sm font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              {isDark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
            </button>

            <Button variant="primary" size="lg" onClick={() => { onNavigate('submit-proposal'); setOpen(false); }} className="w-full">Sell or Rent</Button>

            {isAuthenticated ? (
              <button type="button" onClick={handleLogout} className="flex items-center justify-center gap-2 rounded-[var(--radius-control)] py-3 text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors cursor-pointer">
                <LogOut size={18} /><span>Sign Out</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" size="lg" onClick={() => { onNavigate('login'); setOpen(false); }} className="w-full">Sign In</Button>
                <Button variant="primary" size="lg" onClick={() => { onNavigate('register'); setOpen(false); }} className="w-full">Sign Up</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

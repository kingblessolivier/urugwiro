import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  X,
  ChevronDown,
  LogOut,
  Building2,
  KeyRound,
  Shield,
  Briefcase,
  Layers,
  Settings,
  User as UserIcon,
  Compass,
  FileText
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import type { AppView } from '../../types/navigation';

interface PublicHeaderProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  onSearch?: (query: string) => void;
}

const links: { label: string; view: AppView }[] = [
  { label: 'Explore', view: 'discovery' },
  { label: 'Services', view: 'services' },
  { label: 'Land Guide', view: 'land-information' },
  { label: 'About', view: 'about' },
  { label: 'Contact', view: 'contact' },
];

export const PublicHeader: React.FC<PublicHeaderProps> = ({ view, onNavigate, onSearch }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
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

  // User initials
  const getInitials = () => {
    if (!user) return 'U';
    if (user.full_name) {
      const parts = user.full_name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  // Role styles & labels
  const role = user?.role || 'Buyer';
  const getRoleBadge = (r: string) => {
    switch (r.toLowerCase()) {
      case 'admin':
        return {
          pill: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          label: 'Platform Executive',
          icon: <Shield size={12} className="text-purple-400" />
        };
      case 'tenant':
        return {
          pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          label: 'Resident / Tenant',
          icon: <KeyRound size={12} className="text-sky-400" />
        };
      case 'seller':
        return {
          pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          label: 'Asset Seller',
          icon: <Building2 size={12} className="text-amber-400" />
        };
      case 'agent':
        return {
          pill: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
          label: 'Licensed Broker',
          icon: <Briefcase size={12} className="text-teal-400" />
        };
      case 'owner':
        return {
          pill: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
          label: 'Asset Owner',
          icon: <Building2 size={12} className="text-orange-400" />
        };
      case 'buyer':
      default:
        return {
          pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          label: 'Private Client',
          icon: <Building2 size={12} className="text-emerald-400" />
        };
    }
  };

  const badgeInfo = getRoleBadge(role);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#080b11]/95 backdrop-blur-xl shadow-lg shadow-black/40">
      <div className="flex h-16 w-full items-center justify-between gap-6 px-5 lg:px-8">
        {/* Logo */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex shrink-0 items-center gap-2.5 group cursor-pointer"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
            U
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            Urugwiro
          </span>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {links.map((link) => (
            <button
              key={link.view}
              type="button"
              onClick={() => onNavigate(link.view)}
              className={cn(
                'rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all duration-200 cursor-pointer',
                view === link.view
                  ? 'bg-white/[0.08] text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              )}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop Search (Only when NOT on discovery) */}
        {view !== 'discovery' && (
          <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 justify-end md:flex">
            <label className="flex w-full max-w-xs items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 focus-within:border-emerald-500/50 focus-within:bg-white/[0.06] transition-all">
              <Search size={15} className="text-zinc-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search properties..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
              />
            </label>
          </form>
        )}

        {/* Desktop Actions */}
        <div className="ml-auto hidden items-center gap-3 lg:flex">
          {/* List Property CTA (Asset Intake & Inspection Proposal) */}
          <Button
            variant="primary"
            onClick={() => onNavigate('submit-proposal')}
            className="rounded-xl px-4 py-2 text-[13px] font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
          >
            Sell With Us
          </Button>

          {/* Authenticated Profile Dropdown or Guest Sign In */}
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/20 px-3 py-1.5 transition-all text-left cursor-pointer"
              >
                {/* Avatar with status indicator */}
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs">
                  {getInitials()}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#080b11]" />
                </div>

                {/* Name & Role */}
                <div className="flex flex-col text-left">
                  <span className="text-[13px] font-semibold text-white leading-tight max-w-[120px] truncate">
                    {user.full_name || user.username}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                    {user.role}
                  </span>
                </div>

                <ChevronDown
                  size={14}
                  className={`text-zinc-400 transition-transform duration-200 ${
                    profileDropdownOpen ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {/* Floating Glassmorphic Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/10 bg-[#080c14]/95 backdrop-blur-2xl p-2 shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  {/* User Identity Header */}
                  <div className="p-3 border-b border-white/[0.08] mb-1">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-sm">
                        {getInitials()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-white truncate">
                          {user.full_name || user.username}
                        </div>
                        <div className="text-xs text-zinc-400 truncate">
                          {user.email || `@${user.username}`}
                        </div>
                      </div>
                    </div>

                    <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold', badgeInfo.pill)}>
                      {badgeInfo.icon}
                      <span>{badgeInfo.label}</span>
                    </div>
                  </div>

                  {/* Role-Specific Navigation Links */}
                  <div className="space-y-0.5 py-1">
                    {/* Admin Options */}
                    {role.toLowerCase() === 'admin' && (
                      <>
                        <button
                          type="button"
                          onClick={() => { onNavigate('admin'); setProfileDropdownOpen(false); }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          <Shield size={14} className="text-purple-400" />
                          <span>Admin Command Cockpit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { onNavigate('admin-listings'); setProfileDropdownOpen(false); }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          <Layers size={14} className="text-emerald-400" />
                          <span>Unified Listings Directory</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { onNavigate('admin-offers'); setProfileDropdownOpen(false); }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          <Briefcase size={14} className="text-blue-400" />
                          <span>Conveyance & Deals Kanban</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { onNavigate('admin-verification'); setProfileDropdownOpen(false); }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          <Building2 size={14} className="text-amber-400" />
                          <span>Title Bureau & Cadastre Audit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { onNavigate('admin-settings'); setProfileDropdownOpen(false); }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          <Settings size={14} className="text-zinc-400" />
                          <span>System Telemetry & NVIDIA NIM</span>
                        </button>
                      </>
                    )}

                    {/* Tenant Options */}
                    {role.toLowerCase() === 'tenant' && (
                      <>
                        <button
                          type="button"
                          onClick={() => { onNavigate('tenant-dashboard'); setProfileDropdownOpen(false); }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          <KeyRound size={14} className="text-sky-400" />
                          <span>Tenant Launchpad & Leases</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { onNavigate('discovery'); setProfileDropdownOpen(false); }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          <Compass size={14} className="text-emerald-400" />
                          <span>Explore Available Rentals</span>
                        </button>
                      </>
                    )}

                    {/* Buyer Options */}
                    {role.toLowerCase() === 'buyer' && (
                      <>
                        <button
                          type="button"
                          onClick={() => { onNavigate('discovery'); setProfileDropdownOpen(false); }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          <Compass size={14} className="text-emerald-400" />
                          <span>Explore Property Catalog</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { onNavigate('admin-offers'); setProfileDropdownOpen(false); }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          <FileText size={14} className="text-blue-400" />
                          <span>My Submitted Offers & Escrow</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { onNavigate('land-information'); setProfileDropdownOpen(false); }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          <Shield size={14} className="text-amber-400" />
                          <span>Rwanda Land Cadastre Guide</span>
                        </button>
                      </>
                    )}

                    {/* Seller Options */}
                    {role.toLowerCase() === 'seller' && (
                      <>
                        <button
                          type="button"
                          onClick={() => { onNavigate('seller-dashboard'); setProfileDropdownOpen(false); }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          <Building2 size={14} className="text-amber-400" />
                          <span>Seller Studio & Inventory</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { onNavigate('seller-wizard'); setProfileDropdownOpen(false); }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          <Layers size={14} className="text-emerald-400" />
                          <span>List New Asset</span>
                        </button>
                      </>
                    )}

                    {/* Agent Options */}
                    {role.toLowerCase() === 'agent' && (
                      <button
                        type="button"
                        onClick={() => { onNavigate('agent-dashboard'); setProfileDropdownOpen(false); }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <Briefcase size={14} className="text-teal-400" />
                        <span>Broker & Showing Desk</span>
                      </button>
                    )}

                    {/* Owner Options */}
                    {role.toLowerCase() === 'owner' && (
                      <button
                        type="button"
                        onClick={() => { onNavigate('owner-dashboard'); setProfileDropdownOpen(false); }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <Building2 size={14} className="text-orange-400" />
                        <span>Owner Portfolio Launchpad</span>
                      </button>
                    )}
                  </div>

                  {/* Sign Out Action */}
                  <div className="border-t border-white/[0.08] pt-1 mt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="rounded-xl px-4 py-2 text-[13px] font-medium text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 bg-white/[0.03] transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="rounded-xl px-4 py-2 text-[13px] font-semibold text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-500/10 transition-all cursor-pointer"
              >
                Join Platform
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          className="ml-auto rounded-xl p-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] lg:hidden transition-colors cursor-pointer"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-white/10 bg-[#080b11] px-5 py-5 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Profile Card on Mobile (if authenticated) */}
          {isAuthenticated && user && (
            <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-sm">
                  {getInitials()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white truncate">
                    {user.full_name || user.username}
                  </div>
                  <div className="text-xs text-zinc-400 truncate">
                    {user.email || `@${user.username}`}
                  </div>
                  <div className="mt-1">
                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold', badgeInfo.pill)}>
                      {badgeInfo.icon}
                      <span>{badgeInfo.label}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Role Link */}
              <div className="mt-3 pt-3 border-t border-white/[0.06]">
                {role.toLowerCase() === 'admin' && (
                  <button
                    type="button"
                    onClick={() => { onNavigate('admin'); setOpen(false); }}
                    className="w-full py-2 px-3 rounded-xl bg-purple-500/10 text-purple-300 font-semibold text-xs border border-purple-500/20 text-center"
                  >
                    Open Admin Cockpit
                  </button>
                )}
                {role.toLowerCase() === 'tenant' && (
                  <button
                    type="button"
                    onClick={() => { onNavigate('tenant-dashboard'); setOpen(false); }}
                    className="w-full py-2 px-3 rounded-xl bg-sky-500/10 text-sky-300 font-semibold text-xs border border-sky-500/20 text-center"
                  >
                    Open Tenant Launchpad
                  </button>
                )}
                {role.toLowerCase() === 'seller' && (
                  <button
                    type="button"
                    onClick={() => { onNavigate('seller-dashboard'); setOpen(false); }}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500/10 text-amber-300 font-semibold text-xs border border-amber-500/20 text-center"
                  >
                    Open Seller Studio
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Search Bar in Mobile Drawer */}
          <form onSubmit={submitSearch} className="mb-5">
            <label className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5">
              <Search size={15} className="text-zinc-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search properties..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
              />
            </label>
          </form>

          {/* Nav Links */}
          <div className="grid gap-0.5">
            {links.map((link) => (
              <button
                key={link.view}
                type="button"
                onClick={() => { onNavigate(link.view); setOpen(false); }}
                className={cn(
                  'rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors',
                  view === link.view
                    ? 'bg-white/[0.06] text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                )}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Action Buttons in Mobile Drawer */}
          <div className="mt-5 grid gap-2.5 pt-4 border-t border-white/10">
            <Button
              variant="primary"
              onClick={() => { onNavigate('submit-proposal'); setOpen(false); }}
              className="rounded-xl py-3 font-semibold bg-emerald-500 text-white cursor-pointer"
            >
              Sell With Us
            </Button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl py-3 text-sm font-medium text-red-400 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { onNavigate('login'); setOpen(false); }}
                  className="rounded-xl py-2.5 text-sm font-medium text-zinc-300 border border-white/10 bg-white/[0.03] hover:text-white transition-colors text-center"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { onNavigate('register'); setOpen(false); }}
                  className="rounded-xl py-2.5 text-sm font-semibold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 transition-colors text-center"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

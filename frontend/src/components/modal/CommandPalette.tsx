import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Building2, Users, MessageSquare, Calendar,
  TrendingUp, FileText, Settings, Plus, ArrowRight,
  User, Tag, CreditCard, BarChart3
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useModal } from './ModalProvider';
import { api } from '../../api/endpoints';
import { useQuery } from '@tanstack/react-query';

interface CommandItem {
  id: string;
  type: 'property' | 'user' | 'seller' | 'conversation' | 'visit' | 'offer' | 'action';
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  action: () => void;
  keywords: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { openModal } = useModal();
  const navigate = useNavigate();

  // Fetch data for search
  const { data: listings } = useQuery({
    queryKey: ['command-palette-listings'],
    queryFn: async () => (await api.listings.list()).data,
    enabled: isOpen,
  });

  const { data: users } = useQuery({
    queryKey: ['command-palette-users'],
    queryFn: async () => (await api.admin.users()).data,
    enabled: isOpen,
  });

  const { data: offers } = useQuery({
    queryKey: ['command-palette-offers'],
    queryFn: async () => (await api.offers.list()).data,
    enabled: isOpen,
  });

  const { data: visits } = useQuery({
    queryKey: ['command-palette-visits'],
    queryFn: async () => (await api.visits.list()).data,
    enabled: isOpen,
  });

  const items = useMemo<CommandItem[]>(() => {
    const results: CommandItem[] = [];

    // Quick actions
    results.push({
      id: 'action-new-property',
      type: 'action',
      title: 'Add New Property',
      subtitle: 'Create a new listing',
      icon: Plus,
      action: () => { onClose(); navigate('/admin/listings/new'); },
      keywords: 'add new property listing create',
    });

    results.push({
      id: 'action-new-user',
      type: 'action',
      title: 'Add New User',
      subtitle: 'Register a new user',
      icon: User,
      action: () => { onClose(); navigate('/admin/users'); },
      keywords: 'add new user register create',
    });

    results.push({
      id: 'action-reports',
      type: 'action',
      title: 'View Reports',
      subtitle: 'Financial reports and analytics',
      icon: BarChart3,
      action: () => { onClose(); navigate('/admin/reports'); },
      keywords: 'reports analytics financial',
    });

    // Properties
    if (Array.isArray(listings)) {
      listings.slice(0, 20).forEach((l: any) => {
        results.push({
          id: `property-${l.id}`,
          type: 'property',
          title: l.title || l.name || 'Untitled Property',
          subtitle: `${l.category || l.listing_type || 'Property'} · ${l.district || l.location || 'Unknown'}`,
          icon: Building2,
          action: () => {
            onClose();
            openModal({
              id: `property-detail-${l.id}`,
              type: 'drawer',
              title: l.title || 'Property Details',
              subtitle: `ID: ${l.id}`,
              width: 'lg',
              content: <PropertyDetailContent property={l} />,
            });
          },
          keywords: `${l.title} ${l.name} ${l.category} ${l.district} ${l.location} property listing`,
        });
      });
    }

    // Users
    if (Array.isArray(users)) {
      users.slice(0, 15).forEach((u: any) => {
        results.push({
          id: `user-${u.id}`,
          type: 'user',
          title: u.full_name || u.username || 'Unknown User',
          subtitle: `${u.role || 'User'} · ${u.email || ''}`,
          icon: Users,
          action: () => {
            onClose();
            openModal({
              id: `user-detail-${u.id}`,
              type: 'drawer',
              title: u.full_name || 'User Details',
              subtitle: `ID: ${u.id}`,
              width: 'md',
              content: <UserDetailContent user={u} />,
            });
          },
          keywords: `${u.full_name} ${u.username} ${u.email} ${u.role} user`,
        });
      });
    }

    // Offers
    if (Array.isArray(offers)) {
      offers.slice(0, 10).forEach((o: any) => {
        results.push({
          id: `offer-${o.id}`,
          type: 'offer',
          title: `Offer #${o.id} — ${o.property_title || 'Property'}`,
          subtitle: `${o.buyer_name || 'Buyer'} · ${Number(o.amount || 0).toLocaleString()} RWF`,
          icon: TrendingUp,
          action: () => {
            onClose();
            openModal({
              id: `offer-detail-${o.id}`,
              type: 'drawer',
              title: `Offer #${o.id}`,
              subtitle: o.property_title || 'Property',
              width: 'md',
              content: <OfferDetailContent offer={o} />,
            });
          },
          keywords: `offer ${o.id} ${o.property_title} ${o.buyer_name} ${o.amount}`,
        });
      });
    }

    // Visits
    if (Array.isArray(visits)) {
      visits.slice(0, 10).forEach((v: any) => {
        results.push({
          id: `visit-${v.id}`,
          type: 'visit',
          title: `Visit #${v.id} — ${v.property_title || 'Property'}`,
          subtitle: `${v.client_name || 'Client'} · ${v.date || 'TBD'}`,
          icon: Calendar,
          action: () => {
            onClose();
            openModal({
              id: `visit-detail-${v.id}`,
              type: 'drawer',
              title: `Visit #${v.id}`,
              subtitle: v.property_title || 'Property',
              width: 'md',
              content: <VisitDetailContent visit={v} />,
            });
          },
          keywords: `visit ${v.id} ${v.property_title} ${v.client_name} ${v.date}`,
        });
      });
    }

    // Filter by query
    if (query.trim()) {
      const q = query.toLowerCase();
      return results.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q) ||
          item.keywords.toLowerCase().includes(q)
      );
    }

    return results;
  }, [query, listings, users, offers, visits, onClose, openModal, navigate]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, items.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        items[selectedIndex]?.action();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, items, selectedIndex]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-[var(--color-bg-surface)] rounded-xl shadow-2xl border border-[var(--color-border)] overflow-hidden animate-scale-in">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
          <Search size={18} className="text-[var(--color-text-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Search properties, users, offers, visits..."
            className="flex-1 bg-transparent text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[10px] font-mono text-[var(--color-text-muted)]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto overscroll-contain">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-[var(--color-text-muted)]">No results found</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="py-2">
              {items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    data-index={index}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      index === selectedIndex
                        ? 'bg-[var(--color-accent-soft-bg)]'
                        : 'hover:bg-[var(--color-bg-elevated)]'
                    )}
                  >
                    <span className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                      index === selectedIndex
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-[var(--color-brand-emerald)]'
                        : 'border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]'
                    )}>
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        'text-sm font-medium truncate',
                        index === selectedIndex ? 'text-[var(--color-text-main)]' : 'text-[var(--color-text-main)]'
                      )}>
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-xs text-[var(--color-text-muted)] truncate">{item.subtitle}</p>
                      )}
                    </div>
                    {index === selectedIndex && (
                      <ArrowRight size={14} className="text-[var(--color-brand-emerald)] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/50">
          <span className="text-[10px] text-[var(--color-text-muted)]">
            {items.length} results
          </span>
          <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-surface)]">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-surface)]">↵</kbd>
              Select
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Detail Content Components ─── */

const PropertyDetailContent: React.FC<{ property: any }> = ({ property }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3">
      <InfoField label="ID" value={property.id} mono />
      <InfoField label="Status" value={property.status} />
      <InfoField label="Category" value={property.category || property.listing_type} />
      <InfoField label="Price" value={`${Number(property.price || 0).toLocaleString()} RWF`} />
      <InfoField label="Location" value={property.district || property.location || 'N/A'} />
      <InfoField label="Type" value={property.listing_type || 'N/A'} />
    </div>
    {property.description && (
      <div>
        <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Description</p>
        <p className="text-sm text-[var(--color-text-main)]">{property.description}</p>
      </div>
    )}
    <div className="flex gap-2 pt-2">
      <button className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors">
        Edit Property
      </button>
      <button className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-bold hover:bg-[var(--color-bg-elevated)] transition-colors">
        View on Site
      </button>
    </div>
  </div>
);

const UserDetailContent: React.FC<{ user: any }> = ({ user }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3">
      <InfoField label="ID" value={user.id} mono />
      <InfoField label="Role" value={user.role} />
      <InfoField label="Name" value={user.full_name || user.username} />
      <InfoField label="Email" value={user.email} />
      <InfoField label="Phone" value={user.phone || 'N/A'} />
      <InfoField label="Joined" value={user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'} />
    </div>
    <div className="flex gap-2 pt-2">
      <button className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors">
        Edit User
      </button>
      <button className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-bold hover:bg-[var(--color-bg-elevated)] transition-colors">
        View Activity
      </button>
    </div>
  </div>
);

const OfferDetailContent: React.FC<{ offer: any }> = ({ offer }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3">
      <InfoField label="Offer ID" value={`#${offer.id}`} mono />
      <InfoField label="Status" value={offer.status} />
      <InfoField label="Property" value={offer.property_title || 'N/A'} />
      <InfoField label="Buyer" value={offer.buyer_name || 'N/A'} />
      <InfoField label="Amount" value={`${Number(offer.amount || 0).toLocaleString()} RWF`} />
      <InfoField label="Date" value={offer.created_at ? new Date(offer.created_at).toLocaleDateString() : 'N/A'} />
    </div>
    {offer.message && (
      <div>
        <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Message</p>
        <p className="text-sm text-[var(--color-text-main)]">{offer.message}</p>
      </div>
    )}
    <div className="flex gap-2 pt-2">
      <button className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors">
        Accept
      </button>
      <button className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-bold hover:bg-[var(--color-bg-elevated)] transition-colors">
        Counter
      </button>
      <button className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors">
        Decline
      </button>
    </div>
  </div>
);

const VisitDetailContent: React.FC<{ visit: any }> = ({ visit }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3">
      <InfoField label="Visit ID" value={`#${visit.id}`} mono />
      <InfoField label="Status" value={visit.status} />
      <InfoField label="Property" value={visit.property_title || 'N/A'} />
      <InfoField label="Client" value={visit.client_name || 'N/A'} />
      <InfoField label="Date" value={visit.date || 'TBD'} />
      <InfoField label="Time" value={visit.time_slot || 'TBD'} />
    </div>
    <div className="flex gap-2 pt-2">
      <button className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors">
        Confirm
      </button>
      <button className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-bold hover:bg-[var(--color-bg-elevated)] transition-colors">
        Reschedule
      </button>
    </div>
  </div>
);

const InfoField: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div>
    <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{label}</p>
    <p className={cn('text-sm text-[var(--color-text-main)] mt-0.5', mono && 'font-mono')}>{value || 'N/A'}</p>
  </div>
);

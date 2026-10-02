import React from 'react';
import { ChevronRight, Search, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DarkModeToggle } from './DarkModeToggle';
import { NotificationCenter } from '../common/NotificationCenter';

export interface TopbarBreadcrumb {
  label: string;
  view?: string;
  accent?: boolean;
}

interface TopbarProps {
  breadcrumbs?: TopbarBreadcrumb[];
  title: string;
  subtitle?: string;
  search?: React.ReactNode;
  searchPlaceholder?: string;
  searchOnChange?: (val: string) => void;
  actions?: React.ReactNode;
  primaryAction?: {
    label: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    onClick: () => void;
    tone?: 'emerald' | 'gold' | 'outline';
  };
  avatar?: {
    initial?: string;
    name?: string;
    role?: string;
    onLogout?: () => void;
    accentTone?: 'emerald' | 'gold';
  };
  onMenuToggle?: () => void;
  menuOpen?: boolean;
  showMenuButton?: boolean;
  showQuickActions?: boolean;
  className?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  breadcrumbs,
  title,
  subtitle,
  search,
  searchPlaceholder,
  searchOnChange,
  actions,
  primaryAction,
  avatar,
  onMenuToggle,
  menuOpen,
  showMenuButton = false,
  showQuickActions = true,
  className,
}) => {
  const PrimIcon = primaryAction?.icon;
  const toneClass =
    primaryAction?.tone === 'gold'
      ? 'bg-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold-hover)] text-[var(--color-logo-navy)] shadow-[0_4px_14px_-3px_rgba(212,175,55,0.45)]'
      : primaryAction?.tone === 'outline'
      ? 'bg-transparent border border-[var(--color-border)] text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)]'
      : 'bg-gradient-to-br from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600 text-white shadow-[var(--shadow-emerald-soft)] hover:shadow-[0_4px_18px_-2px_rgba(5,150,105,0.4)]';

  const avatarAccent =
    avatar?.accentTone === 'gold'
      ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300'
      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300';

  return (
    <header
      className={cn(
        'shrink-0 border-b border-[var(--color-border)]/60 backdrop-blur-xl z-30 relative overflow-hidden',
        'bg-gradient-to-b from-[var(--color-bg-surface)]/98 via-[var(--color-bg-surface)]/92 to-[var(--color-bg-surface)]/85',
        'h-[72px] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4',
        className
      )}
    >
      {/* Subtle radial glow behind the title */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at 10% 50%, rgba(5,150,105,0.10), transparent 40%)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '200px 200px',
        }}
      />

      <div className="relative z-10 flex items-center gap-3 min-w-0 flex-1">
        {showMenuButton && onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]/70 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] shrink-0 transition-all"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        )}

        <div className="flex flex-col min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-dim)] uppercase tracking-[0.12em] font-semibold mb-0.5">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight size={10} className="text-[var(--color-text-dim)]/60 shrink-0" />}
                  <span className={cn(
                    'whitespace-nowrap truncate',
                    crumb.accent ? 'text-[var(--color-brand-emerald)] font-bold' : ''
                  )}>
                    {crumb.label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
          <div className="flex items-baseline gap-2 min-w-0">
            <h2 className="font-display font-semibold text-[1.1rem] sm:text-[1.2rem] text-[var(--color-text-main)] tracking-[-0.01em] truncate leading-none">
              {title}
            </h2>
            {subtitle && !breadcrumbs && (
              <span className="hidden sm:block text-[11px] text-[var(--color-text-dim)] whitespace-nowrap shrink-0">
                · {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side — search, actions, avatar */}
      <div className="relative z-10 flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search */}
        {search !== undefined ? (
          <div className="hidden sm:block">{search}</div>
        ) : searchPlaceholder && searchOnChange ? (
          <div className="hidden md:flex items-center gap-2 h-10 w-56 lg:w-72 px-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]/70 hover:bg-[var(--color-bg-surface)] hover:border-[var(--color-border-hover)] transition-colors group">
            <Search size={15} className="text-[var(--color-text-dim)] group-hover:text-[var(--color-text-muted)] transition-colors shrink-0" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => searchOnChange(e.target.value)}
              className="flex-1 min-w-0 bg-transparent outline-none text-[12.5px] text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)]"
            />
            <span className="hidden lg:inline-flex text-[9.5px] font-mono px-1.5 py-0.5 rounded-md border border-[var(--color-border)] text-[var(--color-text-dim)] tracking-tight">
              ⌘K
            </span>
          </div>
        ) : null}

        {/* Quick actions */}
        {showQuickActions && (
          <div className="hidden sm:flex items-center gap-1.5">
            <DarkModeToggle />
            <NotificationCenter />
          </div>
        )}

        {/* Secondary actions */}
        {actions}

        {/* Primary CTA pill */}
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className={cn(
              'hidden sm:inline-flex items-center gap-1.5 h-10 px-4 rounded-2xl text-[12px] font-bold whitespace-nowrap transition-all hover:-translate-y-0.5 active:translate-y-0',
              toneClass
            )}
          >
            {PrimIcon && <PrimIcon size={15} />}
            {primaryAction.label}
          </button>
        )}

        {/* Divider + user avatar block */}
        {avatar && (
          <div className="flex items-center gap-2 pl-2 ml-1 border-l border-[var(--color-border)]/60">
            <div className={cn(
              'h-9 w-9 rounded-xl flex items-center justify-center font-bold text-[13px] shadow-sm shrink-0',
              avatarAccent
            )}>
              {avatar.initial || 'U'}
            </div>
            <div className="hidden xl:flex flex-col min-w-0">
              <span className="text-[12px] font-semibold text-[var(--color-text-main)] leading-none truncate max-w-[120px]">
                {avatar.name || 'User'}
              </span>
              <span className="text-[10px] text-[var(--color-text-dim)] leading-none mt-1 capitalize truncate max-w-[120px]">
                {avatar.role || 'Guest'}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;

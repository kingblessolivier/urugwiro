import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import { PanelLeftClose, PanelLeftOpen, ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';

export interface SidebarItem {
  view: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  highlight?: boolean;
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarProps {
  sections: SidebarSection[];
  activeView: string;
  onNavigate: (view: string) => void;
  brandName: string;
  brandSubtitle?: string;
  roleChip?: string;
  userInitial?: string;
  userName?: string;
  userRole?: string;
  collapsible?: boolean;
  storageKey?: string;
  onPublicClick?: () => void;
  onBrandClick?: () => void;
  accentTone?: 'emerald' | 'gold';
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sections,
  activeView,
  onNavigate,
  brandName,
  brandSubtitle,
  roleChip,
  userInitial,
  userName,
  userRole,
  collapsible = true,
  storageKey,
  onPublicClick,
  onBrandClick,
  accentTone = 'emerald',
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (storageKey) {
      return localStorage.getItem(storageKey) === 'true';
    }
    return false;
  });

  const navRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    if (!collapsible) return;
    setIsCollapsed((prev) => {
      const next = !prev;
      if (storageKey) {
        localStorage.setItem(storageKey, String(next));
      }
      return next;
    });
  };

  const emeraldAccent = {
    bgActive: 'bg-[var(--color-accent-soft-bg)]',
    textActive: 'text-[var(--color-brand-emerald)]',
    borderActive: 'border-emerald-500/30',
    shadowActive: 'shadow-[var(--shadow-emerald-soft)]',
    bar: 'bg-[var(--color-brand-emerald)]',
    chipBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-[var(--color-brand-emerald)] dark:border-emerald-500/20',
    chipBorder: 'border-emerald-200',
    logoBg: 'bg-emerald-600',
    avatarBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    avatarText: 'text-emerald-700 dark:text-emerald-300',
    brandLogo: 'text-white',
  };
  const goldAccent = {
    bgActive: 'bg-amber-50 dark:bg-amber-500/10',
    textActive: 'text-[var(--color-accent-gold)]',
    borderActive: 'border-amber-400/30',
    shadowActive: 'shadow-[0_1px_3px_rgba(212,175,55,0.22)]',
    bar: 'bg-[var(--color-accent-gold)]',
    chipBg: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-400/20',
    chipBorder: 'border-amber-200',
    logoBg: 'bg-[var(--color-accent-gold)]',
    avatarBg: 'bg-amber-100 dark:bg-amber-500/15',
    avatarText: 'text-amber-700 dark:text-amber-300',
    brandLogo: 'text-[var(--color-logo-navy)]',
  };
  const a = accentTone === 'gold' ? goldAccent : emeraldAccent;

  const isActive = (view: string) => {
    if (activeView === view) return true;
    return false;
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isCollapsed) return;
    const buttons = navRef.current?.querySelectorAll<HTMLButtonElement>('button[data-nav-item]');
    if (!buttons || buttons.length === 0) return;
    const currentIndex = Array.from(buttons).findIndex(
      (btn) => btn === document.activeElement
    );
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % buttons.length;
      buttons[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex < 0 ? buttons.length - 1 : (currentIndex - 1 + buttons.length) % buttons.length;
      buttons[prevIndex]?.focus();
    } else if (e.key === 'Enter' && currentIndex >= 0) {
      e.preventDefault();
      buttons[currentIndex]?.click();
    }
  }, [isCollapsed]);

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-[var(--color-border)] shrink-0 z-40 h-screen overflow-hidden select-none',
        'bg-gradient-to-b from-[var(--color-bg-surface)] to-[var(--color-bg-deep)] relative',
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
      style={{ transition: 'width 0.45s cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      {/* Emerald Sovereign radial glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
        style={{
          background:
            accentTone === 'emerald'
              ? 'radial-gradient(ellipse at 0% 0%, rgba(5,150,105,0.16), transparent 45%), radial-gradient(ellipse at 100% 100%, rgba(16,185,129,0.08), transparent 50%)'
              : 'radial-gradient(ellipse at 0% 0%, rgba(212,175,55,0.18), transparent 45%), radial-gradient(ellipse at 100% 100%, rgba(249,134,4,0.08), transparent 50%)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '180px 180px',
        }}
      />

      <div className="relative z-10 h-full flex flex-col min-h-0">
        {/* ─── Brand Header ─── */}
        <div className="shrink-0 border-b border-[var(--color-border)]/60 bg-[var(--color-bg-surface)]/40">
          <div className={cn(
            'flex items-center justify-between',
            isCollapsed ? 'px-2 py-4' : 'px-5 py-4'
          )}>
            <div
              className={cn(
                'flex items-center gap-3 cursor-pointer overflow-hidden min-w-0 group',
                isCollapsed && 'justify-center w-full'
              )}
              onClick={onBrandClick || (() => onNavigate(sections[0]?.items[0]?.view || ''))}
            >
              <div className="relative shrink-0">
                <div className={cn(
                  'w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm shadow-[var(--shadow-depth-2)] shrink-0',
                  a.logoBg,
                  a.brandLogo,
                )}>
                  {brandName.slice(0, 1).toUpperCase()}
                </div>
                <span className={cn(
                  'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[var(--color-bg-surface)]',
                  accentTone === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'
                )} />
              </div>

              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-display font-semibold text-[1.02rem] tracking-tight text-[var(--color-text-main)] truncate leading-none">
                      {brandName}
                    </span>
                    {roleChip && (
                      <span className={cn(
                        "text-[9px] uppercase font-semibold tracking-wider px-1.5 py-[3px] rounded-md border shrink-0 whitespace-nowrap",
                        a.chipBg,
                        a.chipBorder
                      )}>
                        {roleChip}
                      </span>
                    )}
                  </div>
                  {brandSubtitle && (
                    <span className="text-[10px] text-[var(--color-text-dim)] mt-1 truncate leading-none tracking-wide">
                      {brandSubtitle}
                    </span>
                  )}
                </div>
              )}
            </div>

            {!isCollapsed && collapsible && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] transition-colors border border-transparent hover:border-[var(--color-border)] shrink-0"
                title="Collapse Sidebar"
              >
                <PanelLeftClose size={16} />
              </button>
            )}
          </div>

          {isCollapsed && collapsible && (
            <div className="pb-3 flex justify-center">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] border border-transparent hover:border-[var(--color-border)] transition-colors"
                title="Expand Sidebar"
              >
                <PanelLeftOpen size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ─── Navigation ─── */}
        <div
          ref={navRef}
          className="flex-1 overflow-y-auto overscroll-contain py-5 px-3 space-y-6 [scrollbar-width:thin] scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent"
          onKeyDown={handleKeyDown}
          role="navigation"
          aria-label="Sidebar navigation"
        >
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1.5">
                  <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-dim)] whitespace-nowrap">
                    {section.title}
                  </span>
                </div>
              )}
              {isCollapsed && <div className="mx-3 mb-2 h-px bg-[var(--color-border)]/50 rounded-full" />}

              {section.items.map((item) => {
                const active = isActive(item.view);
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.view}
                    data-nav-item
                    onClick={() => onNavigate(item.view)}
                    className={cn(
                      'w-full flex items-center rounded-2xl transition-all group relative text-left',
                      isCollapsed ? 'justify-center p-2.5 mx-1' : 'px-3 py-2.5 gap-3 mx-0',
                      active
                        ? cn(a.bgActive, a.textActive, 'border', a.borderActive, a.shadowActive, 'font-semibold')
                        : cn(
                            'text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)]/80',
                            'border border-transparent hover:border-[var(--color-border)]/60',
                          )
                    )}
                    style={{
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <IconComponent
                      size={isCollapsed ? 18 : 17}
                      strokeWidth={active ? 2.2 : 1.9}
                      className={cn(
                        'shrink-0 transition-colors',
                        active ? a.textActive : (item.highlight && !isCollapsed ? a.textActive : 'text-current group-hover:text-[var(--color-text-main)]')
                      )}
                    />

                    {!isCollapsed && (
                      <span className="text-[13px] tracking-wide flex-1 truncate leading-none">
                        {item.label}
                      </span>
                    )}

                    {!isCollapsed && item.badge !== undefined && (
                      <span className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 whitespace-nowrap",
                        active
                          ? cn(a.bgActive, a.textActive, a.borderActive)
                          : item.highlight
                          ? cn(a.chipBg, a.chipBorder)
                          : 'bg-[var(--color-bg-elevated)]/90 text-[var(--color-text-muted)] border-[var(--color-border)]'
                      )}>
                        {item.badge}
                      </span>
                    )}
                    {isCollapsed && item.badge !== undefined && (
                      <span className="absolute top-1.5 right-1.5">
                        <Badge variant="dot" tone={accentTone} />
                      </span>
                    )}

                    {/* Tooltip for collapsed mode */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-3 py-2 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-[var(--shadow-depth-3)] text-[12px] font-semibold text-[var(--color-text-main)] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 z-50 transition-all backdrop-blur-xl">
                        {item.label}
                        {item.badge ? <span className="ml-2 text-[var(--color-text-dim)] font-normal">· {item.badge}</span> : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* ─── Footer ─── */}
        <div className="shrink-0 px-3 pt-3 pb-3 space-y-2 border-t border-[var(--color-border)]/60 bg-[var(--color-bg-surface)]/50 backdrop-blur">
          {onPublicClick && (
            <button
              onClick={onPublicClick}
              className={cn(
                'w-full flex items-center rounded-2xl p-2 text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] transition-all text-[12px] border border-transparent hover:border-[var(--color-border)]/60',
                isCollapsed ? 'justify-center' : 'gap-2.5'
              )}
              title="Return to Marketplace"
            >
              <ArrowUpRight size={15} className={cn("shrink-0", a.textActive)} />
              {!isCollapsed && <span className="tracking-wide font-medium">Public Marketplace</span>}
            </button>
          )}

          {(userName || userInitial) && (
            <div
              className={cn(
                'flex items-center rounded-2xl p-2.5 border border-[var(--color-border)] bg-[var(--color-bg-surface)]/80 hover:bg-[var(--color-bg-elevated)]/60 transition-colors',
                isCollapsed ? 'justify-center' : 'gap-3'
              )}
            >
              {userInitial && (
                <div className={cn(
                  'h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm',
                  a.avatarBg,
                  a.avatarText
                )}>
                  {userInitial}
                </div>
              )}
              {!isCollapsed && userName && (
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-[var(--color-text-main)] truncate leading-none">{userName}</p>
                  {userRole && (
                    <p className="text-[10px] text-[var(--color-text-dim)] capitalize truncate leading-none mt-1">
                      {userRole}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

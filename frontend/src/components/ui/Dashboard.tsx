import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

/* ─── Shared class constants — every admin/seller table uses these ─── */

export const dashCard =
  'rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-depth-1)]';

export const tableHead =
  'bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]';

export const tableTh = 'py-3 px-4 font-bold text-left';

export const tableBody = 'divide-y divide-[var(--color-border)]';

export const tableTr = 'hover:bg-[var(--color-bg-card-hover)] transition-colors';

export const tableTd = 'py-3.5 px-4 align-top';

/* Cell text hierarchy */
export const tdPrimary = 'text-[var(--color-text-main)] font-semibold';
export const tdSecondary = 'text-[11px] text-[var(--color-text-muted)]';
export const tdMono = 'font-mono text-[var(--color-text-main)]';

/* Accent chip for emerald-brand emphasis */
export const accentChip =
  'inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase ' +
  'text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300';

export const neutralChip =
  'inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] ' +
  'px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--color-text-muted)]';

/* ─── DashboardCard ─── */

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const DashboardCard = ({ children, className, ...props }: DashboardCardProps) => (
  <div className={cn(dashCard, className)} {...props}>
    {children}
  </div>
);

/* ─── Card header with icon + title + optional action ─── */

interface CardHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader = ({ icon: Icon, title, subtitle, action, className }: CardHeaderProps) => (
  <div
    className={cn(
      'flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4 sm:px-6',
      className
    )}
  >
    <div className="flex items-center gap-2.5 min-w-0">
      {Icon && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-[var(--color-brand-emerald)] dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <Icon size={16} />
        </span>
      )}
      <div className="min-w-0">
        <h3 className="text-sm font-bold tracking-tight text-[var(--color-text-main)] truncate">{title}</h3>
        {subtitle && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-dim)] mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
  </div>
);

/* ─── StatCard — the KPI tile used across dashboards ─── */

type StatTone = 'emerald' | 'blue' | 'amber' | 'purple' | 'neutral';

const toneClasses: Record<StatTone, string> = {
  emerald:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400',
  blue:
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-400',
  amber:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400',
  purple:
    'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/25 dark:bg-purple-500/10 dark:text-purple-400',
  neutral:
    'border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]',
};

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  unit?: string;
  sub?: React.ReactNode;
  footer?: React.ReactNode;
  icon?: LucideIcon;
  tone?: StatTone;
}

export const StatCard = ({
  label,
  value,
  unit,
  sub,
  footer,
  icon: Icon,
  tone = 'emerald',
  className,
  ...props
}: StatCardProps) => (
  <div
    className={cn(
      dashCard,
      'p-5 transition-colors hover:border-[var(--color-border-hover)]',
      props.onClick && 'cursor-pointer',
      className
    )}
    {...props}
  >
    <div className="flex items-center justify-between gap-3 mb-4">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
        {label}
      </span>
      {Icon && (
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
            toneClasses[tone]
          )}
        >
          <Icon size={16} />
        </span>
      )}
    </div>
    <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[var(--color-text-main)]">
      {value}
      {unit && (
        <span className="ml-1 text-xs font-sans font-semibold uppercase text-[var(--color-text-dim)]">
          {unit}
        </span>
      )}
    </div>
    {sub && <div className="mt-1.5 text-xs text-[var(--color-text-muted)]">{sub}</div>}
    {footer && (
      <div className="mt-4 pt-3 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-dim)] flex items-center justify-between gap-2">
        {footer}
      </div>
    )}
  </div>
);

/* ─── EmptyState — consistent "no data" block for cards & tables ─── */

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  colSpan?: number;
  className?: string;
}

export const EmptyState = ({ icon: Icon, title, hint, action, className }: EmptyStateProps) => (
  <div
    className={cn(
      'rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-elevated)]/50 p-8 text-center',
      className
    )}
    role="status"
    aria-live="polite"
  >
    {Icon && <Icon size={28} className="mx-auto mb-2 text-[var(--color-text-dim)]" aria-hidden="true" />}
    <p className="text-sm font-semibold text-[var(--color-text-main)]">{title}</p>
    {hint && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p>}
    {action && <div className="mt-4 flex justify-center">{action}</div>}
  </div>
);

/* ─── Skeleton — loading placeholder for cards ─── */

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'animate-pulse rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden',
      className
    )}
    aria-hidden="true"
  >
    <div className="aspect-[4/3] bg-[var(--color-bg-elevated)]" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-[var(--color-bg-elevated)] rounded w-3/4" />
      <div className="h-3 bg-[var(--color-bg-elevated)] rounded w-1/2" />
      <div className="h-3 bg-[var(--color-bg-elevated)] rounded w-2/3" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 6, className }: SkeletonProps) => (
  <div className={cn('grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

/* ─── ErrorState — consistent error block ─── */

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading this content. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) => (
  <div
    className={cn(
      'rounded-lg border border-red-500/20 bg-red-500/5 p-8 text-center',
      className
    )}
    role="alert"
  >
    <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
    </div>
    <p className="text-sm font-semibold text-[var(--color-text-main)]">{title}</p>
    <p className="mt-1 text-xs text-[var(--color-text-muted)]">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-brand-emerald)] text-white text-xs font-bold hover:bg-[var(--color-brand-emerald)]/90 transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
        Try Again
      </button>
    )}
  </div>
);

/* ─── LoadingState ─── */

export const LoadingState = ({ className }: { className?: string }) => (
  <div
    className={cn('flex flex-col items-center justify-center py-16', className)}
    role="status"
    aria-live="polite"
  >
    <div className="w-10 h-10 border-2 border-[var(--color-brand-emerald)]/20 border-t-[var(--color-brand-emerald)] rounded-full animate-spin" />
    <span className="mt-3 text-xs tracking-widest uppercase text-[var(--color-text-dim)]">Loading...</span>
  </div>
);

/* Table-embedded empty row */
export const EmptyRow = ({ colSpan, children }: { colSpan: number; children?: React.ReactNode }) => (
  <tr>
    <td colSpan={colSpan} className="py-8 text-center text-xs text-[var(--color-text-muted)]">
      {children || 'No records found.'}
    </td>
  </tr>
);

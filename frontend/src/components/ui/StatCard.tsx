import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

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
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  sub,
  footer,
  icon: Icon,
  tone = 'emerald',
  trend,
  trendValue,
  className,
  ...props
}) => (
  <div
    className={cn(
      'rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-depth-1)] p-4 sm:p-5 transition-colors hover:border-[var(--color-border-hover)]',
      props.onClick && 'cursor-pointer',
      className
    )}
    {...props}
  >
    <div className="flex items-center justify-between gap-3 mb-3">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {trend && trendValue && (
          <span className={cn(
            'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
            trend === 'up' && 'bg-emerald-500/10 text-emerald-500',
            trend === 'down' && 'bg-red-500/10 text-red-500',
            trend === 'flat' && 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]'
          )}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        )}
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
    </div>
    <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[var(--color-text-main)]">
      {value}
      {unit && (
        <span className="ml-1 text-xs font-sans font-semibold uppercase text-[var(--color-text-dim)]">
          {unit}
        </span>
      )}
    </div>
    {sub && <div className="mt-1 text-xs text-[var(--color-text-muted)] font-medium">{sub}</div>}
    {footer && (
      <div className="mt-3 pt-3 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-dim)] flex items-center justify-between gap-2">
        {footer}
      </div>
    )}
  </div>
);

export default StatCard;

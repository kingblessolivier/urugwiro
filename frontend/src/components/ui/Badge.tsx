import React from 'react';
import { cn } from '../../lib/utils';

type Variant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'accent';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  success:
    'bg-emerald-50 text-emerald-700 border-emerald-200 ' +
    'dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  warning:
    'bg-amber-50 text-amber-700 border-amber-200 ' +
    'dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  error:
    'bg-red-50 text-red-700 border-red-200 ' +
    'dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
  info:
    'bg-blue-50 text-blue-700 border-blue-200 ' +
    'dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
  accent:
    'bg-[var(--color-accent-soft-bg)] text-emerald-700 border-emerald-200 ' +
    'dark:text-emerald-300 dark:border-emerald-500/30',
  neutral:
    'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border)]',
};

export const Badge = ({ children, variant = 'neutral', className, ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
      variants[variant],
      className
    )}
    {...props}
  >
    {children}
  </span>
);

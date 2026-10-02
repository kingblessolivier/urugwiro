import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  count?: number | string;
  variant?: 'count' | 'text' | 'dot';
  tone?: 'emerald' | 'amber' | 'red' | 'blue' | 'neutral';
  className?: string;
  children?: React.ReactNode;
}

const toneClasses: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  red: 'bg-red-500/10 text-red-500 border-red-500/20',
  blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  neutral: 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border)]',
};

export const Badge: React.FC<BadgeProps> = ({
  count,
  variant = 'count',
  tone = 'emerald',
  className,
  children,
}) => {
  if (variant === 'dot') {
    return (
      <span
        className={cn(
          'inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0',
          className
        )}
        aria-label="Notification indicator"
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold border shrink-0 min-w-[20px]',
        toneClasses[tone],
        className
      )}
    >
      {count !== undefined ? count : children}
    </span>
  );
};

export default Badge;

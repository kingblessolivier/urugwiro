import React from 'react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)]/50',
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 text-xl shadow-xs">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-[var(--color-text-main)] mb-1.5 tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[var(--color-text-dim)] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          variant="primary"
          size="sm"
          className="shadow-sm"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

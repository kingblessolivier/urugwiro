import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../lib/utils';

interface BreadcrumbItem {
    label: string;
    onClick?: () => void;
    isCurrent?: boolean;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
    return (
        <nav
            aria-label="Breadcrumb"
            className={cn('flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] overflow-x-auto', className)}
        >
            <button
                onClick={() => items[0]?.onClick?.()}
                className="flex items-center gap-1 hover:text-[var(--color-brand-emerald)] transition-colors shrink-0"
                aria-label="Go to home"
            >
                <Home size={12} />
                <span>{items[0]?.label || 'Home'}</span>
            </button>
            {items.slice(1).map((item, idx) => (
                <React.Fragment key={idx}>
                    <ChevronRight size={12} className="text-[var(--color-text-dim)] shrink-0" />
                    {item.isCurrent ? (
                        <span
                            className="text-[var(--color-text-main)] font-medium truncate max-w-[200px]"
                            aria-current="page"
                        >
                            {item.label}
                        </span>
                    ) : (
                        <button
                            onClick={item.onClick}
                            className="hover:text-[var(--color-brand-emerald)] transition-colors truncate max-w-[150px]"
                        >
                            {item.label}
                        </button>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

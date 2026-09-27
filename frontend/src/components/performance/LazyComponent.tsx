import React, { Suspense } from 'react';

interface LazyComponentProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Lazy Component Wrapper
 * Wraps components in Suspense with a loading fallback.
 * Used for code splitting heavy components.
 */
export const LazyComponent: React.FC<LazyComponentProps> = ({
    children,
    fallback = (
        <div className="flex items-center justify-center p-8" role="status" aria-label="Loading">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-brand-emerald)]" />
        </div>
    ),
}) => {
    return <Suspense fallback={fallback}>{children}</Suspense>;
};

export default LazyComponent;

import { useEffect } from 'react';

/**
 * Performance Monitor
 * Tracks Core Web Vitals and reports to console in development.
 * In production, send to analytics endpoint.
 */
export const PerformanceMonitor: React.FC = () => {
    useEffect(() => {
        // Only run in browser
        if (typeof window === 'undefined') return;

        // Report Web Vitals
        const reportWebVitals = () => {
            // Largest Contentful Paint
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('[Performance] LCP:', lastEntry.startTime.toFixed(2), 'ms');
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry: any) => {
                    const delay = entry.processingStart - entry.startTime;
                    console.log('[Performance] FID:', delay.toFixed(2), 'ms');
                });
            }).observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift
            let clsValue = 0;
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry: any) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                console.log('[Performance] CLS:', clsValue.toFixed(4));
            }).observe({ entryTypes: ['layout-shift'] });

            // Navigation Timing
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                    if (navEntry) {
                        console.log('[Performance] DOM Content Loaded:', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
                        console.log('[Performance] Page Load:', navEntry.loadEventEnd.toFixed(2), 'ms');
                        console.log('[Performance] TTFB:', navEntry.responseStart.toFixed(2), 'ms');
                    }
                }, 0);
            });
        };

        // Run after page load
        if (document.readyState === 'complete') {
            reportWebVitals();
        } else {
            window.addEventListener('load', reportWebVitals);
        }

        // Log bundle size
        if (import.meta.env.DEV) {
            console.log('[Performance] Bundle analysis available via: npx vite-bundle-analyzer');
        }
    }, []);

    return null;
};

export default PerformanceMonitor;

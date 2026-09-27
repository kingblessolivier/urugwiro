import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BannerNotification {
    id: string;
    type: 'info' | 'warning' | 'success';
    message: string;
    link?: string;
}

export const BannerNotifications: React.FC = () => {
    const [banners, setBanners] = useState<BannerNotification[]>([]);

    useEffect(() => {
        // In production, fetch from API
        // Placeholder: show welcome banner for new users
        try {
            const dismissed = localStorage.getItem('urugwiro_banner_dismissed');
            if (!dismissed) {
                setBanners([
                    {
                        id: 'welcome',
                        type: 'info',
                        message: 'Welcome to Urugwiro! Explore verified properties across Rwanda.',
                        link: '/about',
                    },
                ]);
            }
        } catch {
            // localStorage not available
        }
    }, []);

    const dismissBanner = (id: string) => {
        setBanners((prev) => prev.filter((b) => b.id !== id));
        try {
            localStorage.setItem('urugwiro_banner_dismissed', id);
        } catch {
            // localStorage not available
        }
    };

    if (banners.length === 0) return null;

    const iconMap = {
        info: Info,
        warning: AlertTriangle,
        success: CheckCircle2,
    };

    const styleMap = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    };

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9998] w-full max-w-lg px-4 space-y-2" role="alert" aria-live="polite">
            {banners.map((banner) => {
                const Icon = iconMap[banner.type];
                return (
                    <div
                        key={banner.id}
                        className={cn(
                            'flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg animate-in slide-in-from-top-2 duration-300',
                            styleMap[banner.type]
                        )}
                    >
                        <Icon size={18} className="shrink-0" aria-hidden="true" />
                        <p className="flex-1 text-xs font-medium leading-relaxed">{banner.message}</p>
                        {banner.link && (
                            <a
                                href={banner.link}
                                className="text-xs font-bold underline shrink-0 hover:opacity-80 transition-opacity"
                            >
                                Learn more
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={() => dismissBanner(banner.id)}
                            className="p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                            aria-label="Dismiss banner"
                        >
                            <X size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

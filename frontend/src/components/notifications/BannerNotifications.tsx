import React, { useState } from 'react';
import {
    AlertTriangle, BadgeCheck, BadgePercent, CalendarClock,
    Home, Info, Megaphone, PartyPopper, Star, X,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import { cn } from '../../lib/utils';

interface BannerNotification {
    id: number;
    text: string;
    icon: string;
}

export const BannerNotifications: React.FC = () => {
    const [dismissedIds, setDismissedIds] = useState<number[]>(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('urugwiro_dismissed_announcements') || '[]');
            return Array.isArray(stored) ? stored.filter(Number.isInteger) : [];
        } catch {
            return [];
        }
    });

    const { data = [] } = useQuery({
        queryKey: ['public-announcements'],
        queryFn: async () => {
            const response = await api.public.announcements();
            return Array.isArray(response.data) ? response.data as BannerNotification[] : [];
        },
        staleTime: 60_000,
        retry: false,
    });

    const banners = data.filter((banner) => !dismissedIds.includes(banner.id));

    const dismissBanner = (id: number) => {
        const next = [...dismissedIds, id];
        setDismissedIds(next);
        try {
            localStorage.setItem('urugwiro_dismissed_announcements', JSON.stringify(next));
        } catch {
            // localStorage not available
        }
    };

    if (banners.length === 0) return null;

    const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
        campaign: Megaphone,
        home_work: Home,
        verified: BadgeCheck,
        star: Star,
        info: Info,
        warning: AlertTriangle,
        celebration: PartyPopper,
        local_offer: BadgePercent,
        schedule: CalendarClock,
    };

    const styleFor = (icon: string) => icon === 'warning'
        ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-100'
        : icon === 'verified'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-100'
            : 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100';

    return (
        <div className="fixed top-20 left-1/2 z-[9998] w-full max-w-[calc(100vw-2rem)] -translate-x-1/2 space-y-2 sm:max-w-lg" role="alert" aria-live="polite">
            {banners.map((banner) => {
                const Icon = iconMap[banner.icon] || Info;
                return (
                    <div
                        key={banner.id}
                        className={cn(
                            'flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg animate-in slide-in-from-top-2 duration-300',
                            styleFor(banner.icon)
                        )}
                    >
                        <Icon size={18} className="shrink-0" aria-hidden="true" />
                        <p className="min-w-0 flex-1 break-words text-xs font-medium leading-relaxed">{banner.text}</p>
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

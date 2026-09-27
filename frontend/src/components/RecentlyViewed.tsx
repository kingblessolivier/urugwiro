import React, { useState, useEffect } from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { ListingCard, type ListingCardData } from './ui';

interface RecentlyViewedProps {
    onListingClick?: (id: string) => void;
    excludeId?: string;
}

interface ViewedItem {
    id: string;
    title: string;
    price: number;
    currency: string;
    location: string;
    listing_type: string;
    viewedAt: number;
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ onListingClick, excludeId }) => {
    const [items, setItems] = useState<ViewedItem[]>(() => {
        try {
            const stored = localStorage.getItem('urugwiro_recently_viewed');
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });

    useEffect(() => {
        try {
            localStorage.setItem('urugwiro_recently_viewed', JSON.stringify(items));
        } catch {}
    }, [items]);

    const filtered = items.filter((item) => item.id !== excludeId).slice(0, 6);

    if (filtered.length === 0) return null;

    return (
        <section className="mt-12">
            <div className="flex items-center gap-2 mb-6">
                <Clock size={18} className="text-[var(--color-brand-emerald)]" />
                <h2 className="text-xl font-bold text-[var(--color-text-main)]">Recently Viewed</h2>
            </div>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((item) => (
                    <ListingCard
                        key={item.id}
                        listing={{
                            id: item.id,
                            title: item.title,
                            price: item.price,
                            currency: item.currency,
                            location: item.location,
                            listing_type: item.listing_type,
                        } as ListingCardData}
                        onClick={(id) => onListingClick?.(id)}
                    />
                ))}
            </div>
        </section>
    );
};

export function addRecentlyViewed(listing: { id: string; title: string; price: number; currency: string; location: string; listing_type: string }) {
    try {
        const stored = localStorage.getItem('urugwiro_recently_viewed');
        const items: ViewedItem[] = stored ? JSON.parse(stored) : [];
        const newItem: ViewedItem = {
            id: listing.id,
            title: listing.title,
            price: listing.price,
            currency: listing.currency,
            location: listing.location,
            listing_type: listing.listing_type,
            viewedAt: Date.now(),
        };
        const filtered = items.filter((item) => item.id !== listing.id);
        const updated = [newItem, ...filtered].slice(0, 20);
        localStorage.setItem('urugwiro_recently_viewed', JSON.stringify(updated));
    } catch {}
}

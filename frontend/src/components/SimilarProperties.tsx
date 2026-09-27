import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ListingCard, type ListingCardData } from './ui';
import { SkeletonGrid } from './ui';
import { api } from '../api/endpoints';
import { useQuery } from '@tanstack/react-query';

interface SimilarPropertiesProps {
    currentListingId: string;
    category?: string;
    onListingClick?: (id: string) => void;
}

export const SimilarProperties: React.FC<SimilarPropertiesProps> = ({
    currentListingId,
    category,
    onListingClick,
}) => {
    const { data: listings, isLoading } = useQuery({
        queryKey: ['similar-properties', currentListingId, category],
        queryFn: async () => {
            const params: Record<string, any> = { sort: 'newest' };
            if (category && category !== 'All') params.category = category;
            const res = await api.listings.list(params);
            const data = res.data;
            const rows = Array.isArray(data) ? data : data?.results || [];
            return rows
                .filter((l: any) => String(l.id) !== String(currentListingId))
                .slice(0, 3);
        },
    });

    if (isLoading) return <SkeletonGrid count={3} />;

    if (!listings || listings.length === 0) return null;

    return (
        <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--color-text-main)]">Similar Properties</h2>
                <button
                    onClick={() => onListingClick?.('')}
                    className="flex items-center gap-1 text-xs font-semibold text-[var(--color-brand-emerald)] hover:underline"
                >
                    View All <ArrowRight size={12} />
                </button>
            </div>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {listings.map((listing: any) => (
                    <ListingCard
                        key={listing.id}
                        listing={{
                            id: String(listing.id),
                            title: listing.title || 'Property',
                            price: Number(listing.price) || 0,
                            currency: listing.currency || 'RWF',
                            location: listing.location || listing.address || 'Rwanda',
                            listing_type: listing.listing_type || listing.purpose || 'For Sale',
                            verification_level: listing.verification_level,
                            media: listing.media || [],
                            specs: listing.specs,
                            views: listing.views_count,
                            status: listing.status,
                        }}
                        onClick={onListingClick}
                    />
                ))}
            </div>
        </section>
    );
};

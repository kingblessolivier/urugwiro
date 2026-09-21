import React from 'react';
import { ListingCard, type ListingCardData } from '../../../components/ui/ListingCard';

interface Listing {
    id: string;
    title: string;
    price: string | number;
    currency: string;
    listing_type: string;
    verification_level?: ListingCardData['verification_level'];
    asset?: {
        name?: string;
        province?: string;
        district?: string;
    };
    media?: { url?: string; file?: string }[];
    location?: string;
}

interface ResultsGridProps {
    listings: Listing[];
    loading: boolean;
    onListingClick?: (id: string) => void;
}

const ResultsGrid: React.FC<ResultsGridProps> = ({ listings, loading, onListingClick }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-[320px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
                ))}
            </div>
        );
    }

    if (listings.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <h2 className="text-xl font-semibold text-slate-900">No listings match these filters</h2>
                <p className="mt-2 text-sm text-slate-600">Try expanding the location, increasing the budget, or removing a filter.</p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-6 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                >
                    Clear filters
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {listings.map((listing) => (
                <ListingCard
                    key={listing.id}
                    listing={{
                        id: listing.id,
                        title: listing.title,
                        price: Number(listing.price) || 0,
                        currency: listing.currency || 'RWF',
                        location: listing.location || [listing.asset?.district, listing.asset?.province].filter(Boolean).join(', ') || 'Rwanda',
                        listing_type: listing.listing_type,
                        verification_level: listing.verification_level,
                        media: listing.media,
                    }}
                    onClick={onListingClick}
                />
            ))}
        </div>
    );
};

export default ResultsGrid;

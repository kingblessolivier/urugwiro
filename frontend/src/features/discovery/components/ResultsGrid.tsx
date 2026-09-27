import React, { useState, useEffect } from 'react';
import { ListingCard, type ListingCardData } from '../../../components/ui/ListingCard';
import { SearchX, RotateCcw, Heart } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Pagination } from '../../../components/ui/Pagination';

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
    description?: string;
    views_count?: number;
    views?: number;
    status?: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    is_liked?: boolean;
}

interface ResultsGridProps {
    listings: Listing[];
    loading: boolean;
    onListingClick?: (id: string) => void;
    columns?: 2 | 3;
    viewMode?: 'grid' | 'list';
    savedIds?: Set<string>;
    comparedIds?: Set<string>;
    onToggleSave?: (id: string) => void;
    onToggleCompare?: (id: string) => void;
    isSavedOnly?: boolean;
    onClearSavedFilter?: () => void;
}

const ResultsGrid: React.FC<ResultsGridProps> = ({ listings, loading, onListingClick, columns = 3, viewMode = 'grid', savedIds, comparedIds, onToggleSave, onToggleCompare, isSavedOnly, onClearSavedFilter }) => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(9);

    useEffect(() => {
        setPage(1);
    }, [listings.length]);

    const gridClass = viewMode === 'list' ? 'grid grid-cols-1 gap-4' : columns === 3
        ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-2';

    if (loading) {
        return (
            <div className={gridClass}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl border border-white/10 bg-white/[0.02]" />
                ))}
            </div>
        );
    }

    if (listings.length === 0) {
        if (isSavedOnly) {
            return (
                <div className="rounded-3xl border border-dashed border-rose-500/20 bg-rose-500/[0.02] p-12 text-center backdrop-blur-xl">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                        <Heart size={26} />
                    </div>
                    <h2 className="text-xl font-bold text-white">No saved properties yet</h2>
                    <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                        Click the heart icon on any property card to save it to your personal watchlist.
                    </p>
                    <div className="mt-6">
                        <Button
                            variant="secondary"
                            onClick={onClearSavedFilter}
                            className="rounded-xl border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                        >
                            Browse All Properties
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center backdrop-blur-xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-500">
                    <SearchX size={26} />
                </div>
                <h2 className="text-xl font-bold text-white">No properties match your current filters</h2>
                <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                    Try broadening your price parameters, expanding your target district, or resetting specific search constraints.
                </p>
                <div className="mt-6">
                    <Button
                        variant="secondary"
                        onClick={() => window.location.reload()}
                        className="rounded-xl border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                    >
                        <RotateCcw size={14} className="mr-2 inline" /> Reset All Filters
                    </Button>
                </div>
            </div>
        );
    }

    const paginatedListings = listings.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="space-y-8">
            <div className={gridClass}>
                {paginatedListings.map((listing) => (
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
                            specs: {
                                ...(listing.bedrooms ? { beds: listing.bedrooms } : {}),
                                ...(listing.bathrooms ? { baths: listing.bathrooms } : {}),
                                ...(listing.area ? { 'm²': listing.area } : {}),
                            },
                            description: listing.description,
                            views: listing.views_count ?? listing.views,
                            status: listing.status,
                            is_liked: listing.is_liked,
                        }}
                        onClick={onListingClick}
                        viewMode={viewMode}
                        saved={savedIds?.has(String(listing.id)) || Boolean(listing.is_liked)}
                        compared={comparedIds?.has(String(listing.id))}
                        onToggleSave={onToggleSave}
                        onToggleCompare={onToggleCompare}
                    />
                ))}
            </div>

            {listings.length > 0 && (
                <div className="pt-2">
                    <Pagination
                        currentPage={page}
                        totalPages={Math.max(1, Math.ceil(listings.length / pageSize))}
                        onPageChange={setPage}
                        pageSize={pageSize}
                        onPageSizeChange={(sz) => { setPageSize(sz); setPage(1); }}
                        totalItems={listings.length}
                    />
                </div>
            )}
        </div>
    );
};

export default ResultsGrid;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import FilterPane from './components/FilterPane';
import ResultsGrid from './components/ResultsGrid';
import DiscoveryMap from './components/DiscoveryMap';
import { api } from '../../api/endpoints';
import { Sparkles, Image as ImageIcon, SlidersHorizontal, Map, Grid, List, Heart, GitCompareArrows, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState } from '../../components/ui/Dashboard';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { logError } from '../../lib/utils';

interface DiscoveryPageProps {
    onListingClick?: (id: string) => void;
    initialQuery?: string;
    initialSavedOnly?: boolean;
}


// ─── URL State Management ─────────────────────────────────────────────────────
function getFiltersFromURL(): Record<string, string> {
    const params = new URLSearchParams(window.location.search);
    const filters: Record<string, string> = {};
    ['search', 'type', 'purpose', 'category', 'minPrice', 'maxPrice', 'bedrooms', 'bathrooms', 'verification', 'furnished', 'city', 'province', 'district', 'sector', 'sort'].forEach(key => {
        const val = params.get(key);
        if (val !== null && val !== '') filters[key] = val;
    });
    const view = params.get('view');
    if (view === 'grid' || view === 'list' || view === 'map') filters.view = view;
    const saved = params.get('saved');
    if (saved === 'true') filters.savedOnly = 'true';
    return filters;
}

function updateURLFilters(filters: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== '' && val !== 'All') {
            params.set(key, val);
        }
    });
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState(null, '', newURL);
}

const DiscoveryPage: React.FC<DiscoveryPageProps> = ({ onListingClick, initialQuery = '', initialSavedOnly = false }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const urlFilters = useMemo(() => getFiltersFromURL(), []);

    const [filters, setFilters] = useState(() => ({
        search: urlFilters.search || initialQuery || '',
        type: urlFilters.type || 'All',
        purpose: urlFilters.purpose || 'All',
        category: urlFilters.category || 'All',
        minPrice: urlFilters.minPrice || '',
        maxPrice: urlFilters.maxPrice || '',
        bedrooms: urlFilters.bedrooms || '',
        bathrooms: urlFilters.bathrooms || '',
        verification: urlFilters.verification || '',
        furnished: urlFilters.furnished || '',
        city: urlFilters.city || '',
        province: urlFilters.province || '',
        district: urlFilters.district || '',
        sector: urlFilters.sector || '',
        sort: urlFilters.sort || 'newest',
    }));

    const [intentQuery, setIntentQuery] = useState('');
    const [isAnalyzingIntent, setIsAnalyzingIntent] = useState(false);
    const [isVisualSearching, setIsVisualSearching] = useState(false);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>(
        (urlFilters.view as 'grid' | 'list' | 'map') || 'grid'
    );
    const [savedIds, setSavedIds] = useState<Set<string>>(() => {
        try { return new Set(JSON.parse(localStorage.getItem('urugwiro_saved_listings') || '[]')); } catch { return new Set(); }
    });
    const [comparedIds, setComparedIds] = useState<Set<string>>(new Set());
    const [showSavedOnly, setShowSavedOnly] = useState(initialSavedOnly || urlFilters.savedOnly === 'true');

    // Fetch listings using TanStack Query with stale-while-revalidate
    const [listingsPage, setListingsPage] = useState(1);
    const listingsPerPage = 20;

    const cleanedParams = useMemo(() => {
        const params: Record<string, any> = {};
        if (filters.search?.trim()) params.search = filters.search.trim();
        if (filters.category && filters.category !== 'All') params.category = filters.category;
        if (filters.purpose && filters.purpose !== 'All') params.purpose = filters.purpose;
        if (filters.type && filters.type !== 'All') params.type = filters.type;
        if (filters.province && filters.province !== 'All') params.province = filters.province;
        if (filters.district && filters.district !== 'All') params.district = filters.district;
        if (filters.sector && filters.sector !== 'All') params.sector = filters.sector;
        if (filters.minPrice) params.min_price = filters.minPrice;
        if (filters.maxPrice) params.max_price = filters.maxPrice;
        if (filters.bedrooms) params.bedrooms = filters.bedrooms;
        if (filters.bathrooms) params.bathrooms = filters.bathrooms;
        if (filters.verification) params.verification_level = filters.verification;
        if (filters.furnished) params.furnished = filters.furnished;
        if (filters.sort) params.sort = filters.sort;
        params.page = listingsPage;
        params.page_size = listingsPerPage;
        return params;
    }, [filters, listingsPage]);

    const {
        data: listingsData,
        isLoading: isLoadingListings,
        isError: isListingsError,
        error: listingsError,
        refetch: refetchListings,
    } = useQuery({
        queryKey: ['listings', cleanedParams],
        queryFn: async () => {
            const response = await api.listings.list(cleanedParams);
            return response.data;
        },
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

    const listings: any[] = useMemo(() => {
        if (!listingsData) return [];
        return Array.isArray(listingsData) ? listingsData : listingsData?.results || [];
    }, [listingsData]);

    const totalListings = useMemo(() => {
        if (Array.isArray(listingsData)) return listingsData.length;
        return listingsData?.count || 0;
    }, [listingsData]);

    const totalPages = Math.max(1, Math.ceil(totalListings / listingsPerPage));

    // Reset to page 1 when filters change
    useEffect(() => {
        setListingsPage(1);
    }, [filters.search, filters.type, filters.purpose, filters.category, filters.minPrice, filters.maxPrice, filters.bedrooms, filters.bathrooms, filters.verification, filters.furnished, filters.city, filters.province, filters.district, filters.sector, filters.sort]);

    // Fetch user's saved properties from backend if authenticated
    const savedPropertiesQuery = useQuery({
        queryKey: ['consumer-saved-properties'],
        queryFn: async () => {
            const res = await api.consumer.savedProperties();
            return Array.isArray(res.data) ? res.data : res.data?.results || [];
        },
        enabled: !!user,
    });

    // Ingest backend saved properties into savedIds
    useEffect(() => {
        if (savedPropertiesQuery.data && Array.isArray(savedPropertiesQuery.data)) {
            const idsFromBackend = savedPropertiesQuery.data
                .map((item: any) => String(item.id || item.listing?.id || item.listing))
                .filter(Boolean);
            if (idsFromBackend.length > 0) {
                setSavedIds((current) => {
                    const merged = new Set(current);
                    idsFromBackend.forEach((id: string) => merged.add(id));
                    try {
                        localStorage.setItem('urugwiro_saved_listings', JSON.stringify([...merged]));
                    } catch {}
                    return merged;
                });
            }
        }
    }, [savedPropertiesQuery.data]);

    // Also ingest is_liked from returned listings into savedIds
    useEffect(() => {
        if (listings.length > 0) {
            const likedListings = listings.filter((l: any) => l.is_liked).map((l: any) => String(l.id));
            if (likedListings.length > 0) {
                setSavedIds((current) => {
                    const merged = new Set(current);
                    likedListings.forEach((id: string) => merged.add(id));
                    try {
                        localStorage.setItem('urugwiro_saved_listings', JSON.stringify([...merged]));
                    } catch {}
                    return merged;
                });
            }
        }
    }, [listings]);

    // Bidirectional map-grid linking
    const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);

    // ─── Sync filters to URL ────────────────────────────────────────────────────
    useEffect(() => {
        updateURLFilters({
            search: filters.search,
            type: filters.type,
            purpose: filters.purpose,
            category: filters.category,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            bedrooms: filters.bedrooms,
            bathrooms: filters.bathrooms,
            verification: filters.verification,
            furnished: filters.furnished,
            city: filters.city,
            province: filters.province,
            district: filters.district,
            sector: filters.sector,
            sort: filters.sort,
            view: viewMode,
            saved: showSavedOnly ? 'true' : undefined,
        });
    }, [filters, viewMode, showSavedOnly]);

    const visibleListings = useMemo(() => {
        if (!showSavedOnly) return listings;

        const matchedFromListings = listings.filter((listing) => savedIds.has(String(listing.id)));
        const matchedIds = new Set(matchedFromListings.map((l) => String(l.id)));

        // Include any saved properties from user's account that might not be in the current filtered listings
        const extraSaved = (savedPropertiesQuery.data || [])
            .filter((item: any) => !matchedIds.has(String(item.id)))
            .map((item: any) => ({
                id: String(item.id),
                title: item.title,
                price: item.price,
                currency: item.currency || 'RWF',
                listing_type: item.purpose === 'rent' ? 'For Rent' : 'For Sale',
                category: item.category,
                location: item.location || [item.district, item.sector].filter(Boolean).join(', ') || 'Rwanda',
                media: item.image ? [{ url: item.image }] : [],
                status: item.status || 'listed',
                is_liked: true,
            }));

        return [...matchedFromListings, ...extraSaved];
    }, [showSavedOnly, listings, savedIds, savedPropertiesQuery.data]);

    const comparedListings = listings.filter((listing) => comparedIds.has(String(listing.id)));

    const toggleSaved = async (id: string) => {
        const isCurrentlySaved = savedIds.has(id);
        setSavedIds((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id); else next.add(id);
            try {
                localStorage.setItem('urugwiro_saved_listings', JSON.stringify([...next]));
            } catch {}
            return next;
        });

        if (user) {
            try {
                await api.listings.like(id);
                queryClient.invalidateQueries({ queryKey: ['listings'] });
                queryClient.invalidateQueries({ queryKey: ['consumer-saved-properties'] });
                queryClient.invalidateQueries({ queryKey: ['consumer-dashboard'] });
                queryClient.invalidateQueries({ queryKey: ['listing-detail', id] });
                queryClient.invalidateQueries({ queryKey: ['homepage-listings'] });
            } catch (err) {
                logError('Failed to toggle save on backend:', err);
                setSavedIds((current) => {
                    const rollback = new Set(current);
                    if (isCurrentlySaved) rollback.add(id); else rollback.delete(id);
                    try {
                        localStorage.setItem('urugwiro_saved_listings', JSON.stringify([...rollback]));
                    } catch {}
                    return rollback;
                });
            }
        }
    };

    const toggleCompared = (id: string) => {
        setComparedIds((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else if (next.size < 3) next.add(id);
            return next;
        });
    };

    useEffect(() => {
        if (initialQuery !== undefined) {
            const q = initialQuery.toLowerCase().trim();
            if (['house', 'apartment', 'land', 'car', 'motorbike', 'hotel'].includes(q)) {
                setFilters((prev) => ({ ...prev, category: q, search: '' }));
            } else if (q === 'vehicle') {
                setFilters((prev) => ({ ...prev, category: 'car', search: '' }));
            } else if (['sale', 'rent'].includes(q)) {
                setFilters((prev) => ({ ...prev, purpose: q, search: '' }));
            } else {
                setFilters((prev) => ({ ...prev, search: initialQuery }));
            }
        }
    }, [initialQuery]);

    // Fix visual search to update filter state instead of bypassing
    const handleVisualSearchFixed = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsVisualSearching(true);
        try {
            const response = await api.listings.visualSearch(file);
            const results = response.data?.listings || [];
            if (results.length > 0) {
                const firstResult = results[0];
                if (firstResult.category) {
                    setFilters(prev => ({ ...prev, category: firstResult.category || prev.category, search: '' }));
                }
            }
        } catch (error) {
            logError('Visual search failed:', error);
            alert('Visual search failed. Please try another image.');
        } finally {
            setIsVisualSearching(false);
        }
    };

    const handleIntentSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!intentQuery.trim()) return;

        setIsAnalyzingIntent(true);
        try {
            const response = await api.listings.searchIntent(intentQuery);
            const { filters: aiFilters } = response.data;

            setFilters(prev => {
                const rawCat = String(aiFilters.category || aiFilters.propertyType || '').toLowerCase();
                const rawPurp = String(aiFilters.purpose || aiFilters.listingType || '').toLowerCase();

                let mappedCat = prev.category;
                if (rawCat.includes('house') || rawCat.includes('villa') || rawCat.includes('home') || rawCat.includes('residen') || rawCat.includes('apartment')) {
                    mappedCat = 'house';
                } else if (rawCat.includes('land') || rawCat.includes('plot')) {
                    mappedCat = 'land';
                } else if (rawCat.includes('hotel') || rawCat.includes('commercial')) {
                    mappedCat = 'hotel';
                } else if (rawCat.includes('car') || rawCat.includes('vehicle')) {
                    mappedCat = 'car';
                }

                let mappedPurp = prev.purpose;
                if (rawPurp.includes('rent') || rawPurp.includes('lease')) {
                    mappedPurp = 'rent';
                } else if (rawPurp.includes('sale') || rawPurp.includes('buy')) {
                    mappedPurp = 'sale';
                }

                return {
                    ...prev,
                    search: aiFilters.keywords ? (Array.isArray(aiFilters.keywords) ? aiFilters.keywords.join(' ') : String(aiFilters.keywords)) : prev.search,
                    category: mappedCat,
                    purpose: mappedPurp,
                    minPrice: aiFilters.min_price !== undefined ? String(aiFilters.min_price) : prev.minPrice,
                    maxPrice: aiFilters.max_price !== undefined ? String(aiFilters.max_price) : prev.maxPrice,
                    city: aiFilters.city !== undefined ? String(aiFilters.city) : prev.city,
                    district: aiFilters.district !== undefined ? String(aiFilters.district) : prev.district,
                    sector: aiFilters.sector !== undefined ? String(aiFilters.sector) : prev.sector,
                };
            });
            setIntentQuery('');
        } catch (error) {
            logError('Intent analysis failed:', error);
            alert('Could not translate your intent into filters. Please try again.');
        } finally {
            setIsAnalyzingIntent(false);
        }
    };

    const handleVisualSearch = handleVisualSearchFixed;

    return (
        <div
            className="flex h-[calc(100vh-4.5rem)] sm:h-[calc(100vh-5rem)] overflow-hidden w-full max-w-full transition-colors duration-300"
            style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-main)' }}
        >
            {/* Desktop Filter Sidebar */}
            <aside
                className="hidden w-[310px] shrink-0 overflow-y-auto border-r transition-colors duration-300 lg:block"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}
            >
                <FilterPane filters={filters} setFilters={setFilters} />
            </aside>

            {/* Main Content Area */}
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                {/* Top Semantic & Visual Search Bar */}
                <header
                    className="border-b px-4 py-3.5 backdrop-blur-xl transition-colors duration-300 lg:px-6"
                    style={{ borderColor: 'var(--color-border)', background: 'var(--color-header-bg)' }}
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <form
                            onSubmit={handleIntentSearch}
                            className="flex flex-1 items-center gap-2 rounded-2xl border p-1.5 focus-within:border-emerald-500/50 transition-colors"
                            style={{ borderColor: 'var(--color-border)', background: 'var(--color-input-bg)' }}
                        >
                            <div className="flex flex-1 items-center gap-2.5 px-3">
                                <Sparkles size={16} className="text-emerald-500 shrink-0" />
                                <input
                                    type="text"
                                    className="w-full bg-transparent text-sm outline-none"
                                    style={{ color: 'var(--color-text-main)' }}
                                    placeholder="Ask AI: e.g. 4 bedroom villa with pool in Nyarutarama under 400M"
                                    value={intentQuery}
                                    onChange={(e) => setIntentQuery(e.target.value)}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isAnalyzingIntent || isVisualSearching}
                                className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-50 shadow-md shadow-emerald-500/20"
                            >
                                {isAnalyzingIntent ? 'Interpreting...' : 'AI Search'}
                            </Button>
                        </form>

                        <div className="flex items-center gap-2">
                            {/* Visual Search Button */}
                            <label
                                className="flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-colors hover:border-emerald-500/40 oneui-press"
                                style={{
                                    borderColor: 'var(--color-border)',
                                    background: 'var(--color-bg-card)',
                                    color: 'var(--color-text-muted)',
                                }}
                                title="Upload property photo for reverse search"
                            >
                                <ImageIcon size={14} className="text-emerald-500" />
                                <span className="hidden md:inline">Reverse Image</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleVisualSearch} />
                            </label>

                            {/* Mobile Filter Toggle */}
                            <button
                                type="button"
                                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                                className="flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-colors lg:hidden oneui-press"
                                style={{
                                    borderColor: 'var(--color-border)',
                                    background: 'var(--color-bg-card)',
                                    color: 'var(--color-text-muted)',
                                }}
                            >
                                <SlidersHorizontal size={14} />
                                <span>Filter</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowSavedOnly((current) => !current)}
                                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-colors ${showSavedOnly ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'hover:border-emerald-500/40'}`}
                                style={!showSavedOnly ? { borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-muted)' } : undefined}
                                title="Show saved listings"
                            >
                                <Heart size={14} className={showSavedOnly ? 'fill-red-400' : ''} />
                                <span className="hidden sm:inline">Saved {savedIds.size > 0 ? `(${savedIds.size})` : ''}</span>
                            </button>

                            {/* Map / List / Grid View Toggle */}
                            <div
                                className="flex items-center rounded-xl border p-1"
                                style={{ borderColor: 'var(--color-border)', background: 'var(--color-input-bg)' }}
                            >
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all oneui-press cursor-pointer ${
                                        viewMode === 'grid'
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                            : 'hover:text-emerald-500'
                                    }`}
                                    style={viewMode !== 'grid' ? { color: 'var(--color-text-dim)' } : undefined}
                                    title="Show full catalog grid"
                                >
                                    <Grid size={13} />
                                    <span className="hidden sm:inline">Grid</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all oneui-press cursor-pointer ${viewMode === 'list' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'hover:text-emerald-500'}`}
                                    style={viewMode !== 'list' ? { color: 'var(--color-text-dim)' } : undefined}
                                    title="Show comparison list"
                                >
                                    <List size={13} />
                                    <span className="hidden sm:inline">List</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all oneui-press cursor-pointer ${
                                        viewMode === 'map'
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                            : 'hover:text-emerald-500'
                                    }`}
                                    style={viewMode !== 'map' ? { color: 'var(--color-text-dim)' } : undefined}
                                    title="Show spatial map view"
                                >
                                    <Map size={13} />
                                    <span className="hidden sm:inline">Map</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Filter Drawer */}
                {mobileFilterOpen && (
                    <div
                        className="border-b p-4 lg:hidden max-h-[50vh] overflow-y-auto"
                        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}
                    >
                        <FilterPane filters={filters} setFilters={setFilters} />
                    </div>
                )}

                {comparedListings.length > 0 && (
                    <div className="border-b px-4 py-3 lg:px-6" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400"><GitCompareArrows size={15} /> Compare ({comparedListings.length}/3)</span>
                            {comparedListings.map((listing) => (
                                <button key={listing.id} type="button" onClick={() => toggleCompared(String(listing.id))} className="inline-flex max-w-[180px] items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-zinc-200 hover:border-red-500/40 hover:text-red-300" title="Remove from comparison">
                                    <span className="truncate">{listing.title}</span><X size={12} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content View: Persistent Triple-Pane Layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Catalog Results Grid */}
                    <section className={`flex-1 overflow-y-auto p-5 lg:p-8 ${viewMode === 'map' ? 'hidden md:block md:w-1/2 xl:w-[58%]' : 'block w-full'}`}>
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">Curated Showcase</span>
                                <h1 className="mt-1 text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-main)' }}>
                                    Verified Assets
                                </h1>
                            </div>
                            <div
                                className="flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium"
                                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-muted)' }}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{totalListings} properties found</span>
                            </div>
                        </div>

                        {isLoadingListings || isVisualSearching ? (
                            <LoadingState />
                        ) : isListingsError ? (
                            <ErrorState
                                title="Failed to load properties"
                                message={listingsError?.message || 'An error occurred'}
                                onRetry={() => refetchListings()}
                            />
                        ) : visibleListings.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
                                    <Map size={32} className="text-[var(--color-text-dim)]" />
                                </div>
                                <h3 className="text-lg font-bold text-[var(--color-text-main)]">No properties found</h3>
                                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                                    {showSavedOnly
                                        ? 'You have no saved properties matching your filters.'
                                        : 'Try adjusting your filters or search terms to find what you\'re looking for.'}
                                </p>
                                <div className="mt-6 flex justify-center gap-3">
                                    {showSavedOnly ? (
                                        <Button variant="outline" onClick={() => setShowSavedOnly(false)}>
                                            Show All Properties
                                        </Button>
                                    ) : (
                                        <Button variant="outline" onClick={() => {
                                            setFilters({
                                                search: '', type: 'All', purpose: 'All', category: 'All',
                                                minPrice: '', maxPrice: '', bedrooms: '', bathrooms: '',
                                                verification: '', furnished: '', city: '', province: '',
                                                district: '', sector: '', sort: 'newest',
                                            });
                                        }}>
                                            Clear All Filters
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <ResultsGrid
                                listings={visibleListings}
                                loading={false}
                                onListingClick={onListingClick}
                                columns={viewMode === 'grid' ? 3 : 2}
                                viewMode={viewMode === 'map' ? 'grid' : viewMode}
                                savedIds={savedIds}
                                comparedIds={comparedIds}
                                onToggleSave={toggleSaved}
                                onToggleCompare={toggleCompared}
                                isSavedOnly={showSavedOnly}
                                onClearSavedFilter={() => setShowSavedOnly(false)}
                                hoveredListingId={hoveredListingId}
                                onHoverListing={setHoveredListingId}
                                currentPage={listingsPage}
                                totalPages={totalPages}
                                onPageChange={setListingsPage}
                            />
                        )}
                    </section>

                    {/* Spatial GIS Map Container - Persistent in map mode */}
                    {viewMode === 'map' && (
                        <section
                            className="relative flex-1 md:w-1/2 xl:w-[42%] border-l"
                            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}
                        >
                            <DiscoveryMap
                                listings={visibleListings}
                                onListingClick={onListingClick}
                                hoveredListingId={hoveredListingId}
                                onHoverListing={setHoveredListingId}
                            />
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DiscoveryPage;

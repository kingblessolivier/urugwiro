import React, { useState, useEffect } from 'react';
import FilterPane from './components/FilterPane';
import ResultsGrid from './components/ResultsGrid';
import DiscoveryMap from './components/DiscoveryMap';
import { api } from '../../api/endpoints';
import { Sparkles, Image as ImageIcon, SlidersHorizontal, Map, Grid } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface DiscoveryPageProps {
    onListingClick?: (id: string) => void;
    initialQuery?: string;
}

const DiscoveryPage: React.FC<DiscoveryPageProps> = ({ onListingClick, initialQuery = '' }) => {
    const [filters, setFilters] = useState({
        search: initialQuery,
        type: 'All',
        purpose: 'All',
        category: 'All',
        minPrice: '',
        maxPrice: '',
        city: '',
        province: '',
        district: '',
        sector: '',
        sort: 'newest',
    });

    const [intentQuery, setIntentQuery] = useState('');
    const [isAnalyzingIntent, setIsAnalyzingIntent] = useState(false);
    const [isVisualSearching, setIsVisualSearching] = useState(false);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                // Sanitize parameters so empty values or 'All' are not sent as literal search terms
                const cleanedParams: Record<string, any> = {};
                if (filters.search?.trim()) cleanedParams.search = filters.search.trim();
                if (filters.category && filters.category !== 'All') cleanedParams.category = filters.category;
                if (filters.purpose && filters.purpose !== 'All') cleanedParams.purpose = filters.purpose;
                if (filters.type && filters.type !== 'All') cleanedParams.type = filters.type;
                if (filters.province && filters.province !== 'All') cleanedParams.province = filters.province;
                if (filters.district && filters.district !== 'All') cleanedParams.district = filters.district;
                if (filters.sector && filters.sector !== 'All') cleanedParams.sector = filters.sector;
                if (filters.minPrice) cleanedParams.min_price = filters.minPrice;
                if (filters.maxPrice) cleanedParams.max_price = filters.maxPrice;
                if (filters.sort) cleanedParams.sort = filters.sort;

                const response = await api.listings.list(cleanedParams);
                const data = response.data;
                setListings(Array.isArray(data) ? data : data?.results || []);
            } catch (error) {
                console.error('Error fetching listings:', error);
                setListings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [filters]);

    const handleIntentSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!intentQuery.trim()) return;

        setIsAnalyzingIntent(true);
        try {
            const response = await api.listings.searchIntent(intentQuery);
            const { filters: aiFilters } = response.data;

            setFilters(prev => {
                const rawCat = (aiFilters.category || aiFilters.propertyType || '').toLowerCase();
                const rawPurp = (aiFilters.purpose || aiFilters.listingType || '').toLowerCase();

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
                    city: aiFilters.city || prev.city,
                    district: aiFilters.district || prev.district,
                    sector: aiFilters.sector || prev.sector,
                };
            });
            setIntentQuery('');
        } catch (error) {
            console.error('Intent analysis failed:', error);
            alert('Could not translate your intent into filters. Please try again.');
        } finally {
            setIsAnalyzingIntent(false);
        }
    };

    const handleVisualSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsVisualSearching(true);
        try {
            const response = await api.listings.visualSearch(file);
            setListings(response.data?.listings || []);
            setLoading(false);
        } catch (error) {
            console.error('Visual search failed:', error);
            alert('Visual search failed. Please try another image.');
        } finally {
            setIsVisualSearching(false);
        }
    };

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

                            {/* Map / Grid View Toggle on all screen sizes */}
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

                {/* Content View: Split Catalog Grid & GIS Map */}
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
                                <span>{listings.length} properties cataloged</span>
                            </div>
                        </div>

                        <ResultsGrid
                            listings={listings}
                            loading={loading || isVisualSearching}
                            onListingClick={onListingClick}
                            columns={viewMode === 'grid' ? 3 : 2}
                        />
                    </section>

                    {/* Spatial GIS Map Container - Only shown when in map mode */}
                    {viewMode === 'map' && (
                        <section
                            className="relative flex-1 md:w-1/2 xl:w-[42%] border-l"
                            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}
                        >
                            <DiscoveryMap listings={listings} onListingClick={onListingClick} />
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DiscoveryPage;

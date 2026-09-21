import React, { useState, useEffect } from 'react';
import FilterPane from './components/FilterPane';
import ResultsGrid from './components/ResultsGrid';
import DiscoveryMap from './components/DiscoveryMap';
import { api } from '../../api/endpoints';

interface DiscoveryPageProps {
    onListingClick?: (id: string) => void;
    initialQuery?: string;
}

const DiscoveryPage: React.FC<DiscoveryPageProps> = ({ onListingClick, initialQuery = '' }) => {
    const [filters, setFilters] = useState({
        search: initialQuery,
        type: 'All',
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
    const [listings, setListings] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (initialQuery) {
            setFilters((prev) => ({ ...prev, search: initialQuery }));
        }
    }, [initialQuery]);

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                const response = await api.listings.list(filters);
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

            setFilters(prev => ({
                ...prev,
                search: aiFilters.keywords ? aiFilters.keywords.join(' ') : prev.search,
                type: aiFilters.propertyType || prev.type,
                minPrice: aiFilters.min_price || prev.minPrice,
                maxPrice: aiFilters.max_price || prev.maxPrice,
                city: aiFilters.city || prev.city,
                district: aiFilters.district || prev.district,
                sector: aiFilters.sector || prev.sector,
            }));
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
            setListings(response.data.listings);
            setLoading(false);
        } catch (error) {
            console.error('Visual search failed:', error);
            alert('Visual search failed. Please try another image.');
        } finally {
            setIsVisualSearching(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] overflow-hidden bg-[#f9fafb] text-slate-900">
            <aside className="hidden w-[280px] shrink-0 border-r border-slate-200 bg-white lg:block">
                <FilterPane filters={filters} setFilters={setFilters} />
            </aside>

            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <header className="border-b border-slate-200 bg-white px-4 py-4 lg:px-6">
                    <form onSubmit={handleIntentSearch} className="flex flex-col gap-2 sm:flex-row">
                        <input
                            type="text"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                            placeholder="Try: 3 bedroom house in Kicukiro"
                            value={intentQuery}
                            onChange={(e) => setIntentQuery(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 px-3 text-sm text-slate-600" title="Visual Search">
                                Image
                                <input type="file" className="hidden" accept="image/*" onChange={handleVisualSearch} />
                            </label>
                            <button
                                type="submit"
                                disabled={isAnalyzingIntent || isVisualSearching}
                                className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                            >
                                {isAnalyzingIntent ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </form>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    <section className="flex-1 overflow-y-auto p-4 lg:p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Explore</p>
                                <h1 className="mt-1 text-2xl font-semibold tracking-tight">Marketplace</h1>
                            </div>
                            <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                                {listings.length} results
                            </div>
                        </div>
                        <ResultsGrid listings={listings} loading={loading || isVisualSearching} onListingClick={onListingClick} />
                    </section>

                    <section className="relative hidden min-w-[320px] w-[38%] border-l border-slate-200 bg-white xl:block">
                        <DiscoveryMap listings={listings} />
                    </section>
                </div>
            </main>
        </div>
    );
};

export default DiscoveryPage;

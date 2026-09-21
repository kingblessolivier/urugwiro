import React from 'react';
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';

interface FilterProps {
    filters: any;
    setFilters: React.Dispatch<React.SetStateAction<any>>;
}

const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all';

const FilterPane: React.FC<FilterProps> = ({ filters, setFilters }) => {
    const updateFilter = (key: string, value: string) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-emerald-400" />
                    <h2 className="text-base font-bold text-white tracking-wide">Refine Search</h2>
                </div>
                <button
                    type="button"
                    onClick={() =>
                        setFilters({
                            search: '',
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
                        })
                    }
                    className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-emerald-400 transition-colors"
                >
                    <RotateCcw size={12} /> Reset
                </button>
            </div>

            <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Search Keywords</span>
                <div className="relative mt-2">
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="Title, UPI, or features..."
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                    />
                </div>
            </label>

            <div>
                <label className="block">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Transaction Type</span>
                    <select
                        className={`mt-2 ${inputClass} [&>option]:bg-[#080b11] [&>option]:text-white`}
                        value={filters.purpose || 'All'}
                        onChange={(e) => updateFilter('purpose', e.target.value)}
                    >
                        <option value="All">All Transactions</option>
                        <option value="sale">Outright Sale</option>
                        <option value="rent">Lease / Rental</option>
                    </select>
                </label>
            </div>

            <div>
                <label className="block">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Asset Category</span>
                    <select
                        className={`mt-2 ${inputClass} [&>option]:bg-[#080b11] [&>option]:text-white`}
                        value={filters.category || 'All'}
                        onChange={(e) => updateFilter('category', e.target.value)}
                    >
                        <option value="All">All Asset Classes</option>
                        <option value="house">Residential Estates & Villas</option>
                        <option value="land">Sovereign Land Parcels</option>
                        <option value="car">Vehicles & Luxury Fleet</option>
                        <option value="motorbike">Motorcycles</option>
                        <option value="hotel">Commercial & Hospitality</option>
                    </select>
                </label>
            </div>

            <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Price Range (RWF)</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                    <input
                        type="number"
                        className={inputClass}
                        placeholder="Min RWF"
                        value={filters.minPrice}
                        onChange={(e) => updateFilter('minPrice', e.target.value)}
                    />
                    <input
                        type="number"
                        className={inputClass}
                        placeholder="Max RWF"
                        value={filters.maxPrice}
                        onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Administrative Hierarchy</span>
                <input
                    type="text"
                    className={inputClass}
                    placeholder="Province (e.g. Kigali, Eastern)"
                    value={filters.province}
                    onChange={(e) => updateFilter('province', e.target.value)}
                />
                <input
                    type="text"
                    className={inputClass}
                    placeholder="District (e.g. Gasabo, Kicukiro)"
                    value={filters.district}
                    onChange={(e) => updateFilter('district', e.target.value)}
                />
                <input
                    type="text"
                    className={inputClass}
                    placeholder="Sector (e.g. Kimihurura, Nyarutarama)"
                    value={filters.sector}
                    onChange={(e) => updateFilter('sector', e.target.value)}
                />
            </div>

            <label className="block border-t border-white/[0.06] pt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Sort By</span>
                <select
                    className={`mt-2 ${inputClass} [&>option]:bg-[#080b11] [&>option]:text-white`}
                    value={filters.sort}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Ascending</option>
                    <option value="price_desc">Price: Descending</option>
                </select>
            </label>
        </div>
    );
};

export default FilterPane;

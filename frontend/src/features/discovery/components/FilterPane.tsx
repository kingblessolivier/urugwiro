import React from 'react';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';

interface FilterProps {
    filters: any;
    setFilters: React.Dispatch<React.SetStateAction<any>>;
}

const FilterPane: React.FC<FilterProps> = ({ filters, setFilters }) => {
    const updateFilter = (key: string, value: string) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }));
    };

    const inputStyle = {
        background: 'var(--color-input-bg)',
        borderColor: 'var(--color-input-border)',
        color: 'var(--color-text-main)',
    };

    const inputClass =
        'w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500/50 transition-all';

    return (
        <div className="space-y-6 p-6" style={{ color: 'var(--color-text-main)' }}>
            <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-emerald-500" />
                    <h2 className="text-base font-bold tracking-wide" style={{ color: 'var(--color-text-main)' }}>Refine Search</h2>
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
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors hover:text-emerald-500"
                    style={{ color: 'var(--color-text-dim)' }}
                >
                    <RotateCcw size={12} /> Reset
                </button>
            </div>

            <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Search Keywords</span>
                <div className="relative mt-2">
                    <input
                        type="text"
                        className={inputClass}
                        style={inputStyle}
                        placeholder="Title, UPI, or features..."
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                    />
                </div>
            </label>

            <div>
                <label className="block">
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Transaction Type</span>
                    <select
                        className={`mt-2 ${inputClass} cursor-pointer [&>option]:bg-[#080c14] dark:[&>option]:bg-[#080c14] light:[&>option]:bg-white [&>option]:text-[var(--color-text-main)]`}
                        style={inputStyle}
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
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Asset Category</span>
                    <select
                        className={`mt-2 ${inputClass} cursor-pointer [&>option]:bg-[#080c14] dark:[&>option]:bg-[#080c14] light:[&>option]:bg-white [&>option]:text-[var(--color-text-main)]`}
                        style={inputStyle}
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
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Price Range (RWF)</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                    <input
                        type="number"
                        className={inputClass}
                        style={inputStyle}
                        placeholder="Min RWF"
                        value={filters.minPrice}
                        onChange={(e) => updateFilter('minPrice', e.target.value)}
                    />
                    <input
                        type="number"
                        className={inputClass}
                        style={inputStyle}
                        placeholder="Max RWF"
                        value={filters.maxPrice}
                        onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Administrative Hierarchy</span>
                <input
                    type="text"
                    className={inputClass}
                    style={inputStyle}
                    placeholder="Province (e.g. Kigali, Eastern)"
                    value={filters.province}
                    onChange={(e) => updateFilter('province', e.target.value)}
                />
                <input
                    type="text"
                    className={inputClass}
                    style={inputStyle}
                    placeholder="District (e.g. Gasabo, Kicukiro)"
                    value={filters.district}
                    onChange={(e) => updateFilter('district', e.target.value)}
                />
                <input
                    type="text"
                    className={inputClass}
                    style={inputStyle}
                    placeholder="Sector (e.g. Kimihurura, Nyarutarama)"
                    value={filters.sector}
                    onChange={(e) => updateFilter('sector', e.target.value)}
                />
            </div>

            <label className="block pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Sort By</span>
                <select
                    className={`mt-2 ${inputClass} cursor-pointer [&>option]:bg-[#080c14] dark:[&>option]:bg-[#080c14] light:[&>option]:bg-white [&>option]:text-[var(--color-text-main)]`}
                    style={inputStyle}
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

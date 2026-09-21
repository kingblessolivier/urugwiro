import React from 'react';

interface FilterProps {
    filters: Record<string, string>;
    setFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600';

const FilterPane: React.FC<FilterProps> = ({ filters, setFilters }) => {
    const updateFilter = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6 p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Refine</p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-900">Filters</h2>
                </div>
                <button
                    type="button"
                    onClick={() =>
                        setFilters({
                            search: '',
                            type: 'All',
                            minPrice: '',
                            maxPrice: '',
                            city: '',
                            province: '',
                            district: '',
                            sector: '',
                            sort: 'newest',
                        })
                    }
                    className="text-xs font-medium text-slate-500 hover:text-emerald-700"
                >
                    Reset
                </button>
            </div>

            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Search
                <input
                    type="text"
                    className={`mt-2 ${inputClass}`}
                    placeholder="Search listings..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                />
            </label>

            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Category
                <select className={`mt-2 ${inputClass}`} value={filters.type} onChange={(e) => updateFilter('type', e.target.value)}>
                    <option value="All">All</option>
                    <option value="sale">For sale</option>
                    <option value="rental">For rent</option>
                    <option value="land">Land</option>
                    <option value="vehicle">Vehicles</option>
                    <option value="service">Services</option>
                </select>
            </label>

            <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Price</p>
                <div className="mt-2 flex gap-2">
                    <input type="number" className={inputClass} placeholder="Min" value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} />
                    <input type="number" className={inputClass} placeholder="Max" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} />
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Location</p>
                <input type="text" className={inputClass} placeholder="Province" value={filters.province} onChange={(e) => updateFilter('province', e.target.value)} />
                <input type="text" className={inputClass} placeholder="District" value={filters.district} onChange={(e) => updateFilter('district', e.target.value)} />
                <input type="text" className={inputClass} placeholder="Sector" value={filters.sector} onChange={(e) => updateFilter('sector', e.target.value)} />
            </div>

            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Sort
                <select className={`mt-2 ${inputClass}`} value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
                    <option value="newest">Recommended / newest</option>
                    <option value="price_asc">Price: low to high</option>
                    <option value="price_desc">Price: high to low</option>
                </select>
            </label>
        </div>
    );
};

export default FilterPane;

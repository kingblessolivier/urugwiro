import React, { useMemo } from 'react';
import { RotateCcw, SlidersHorizontal, MapPin } from 'lucide-react';
import { getProvinces, getDistrictsByProvince, getSectorsByDistrict } from '../../../data/rwandaLocations';
import { cn } from '../../../lib/utils';

interface FilterProps {
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

const FilterPane: React.FC<FilterProps> = ({ filters, setFilters }) => {
  const updateFilter = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const provinces = useMemo(() => ['All', ...getProvinces()], []);
  const districts = useMemo(() => {
    if (!filters.province || filters.province === 'All') return [];
    return ['All', ...getDistrictsByProvince(filters.province)];
  }, [filters.province]);
  const sectors = useMemo(() => {
    if (!filters.district || filters.district === 'All') return [];
    return ['All', ...getSectorsByDistrict(filters.district)];
  }, [filters.district]);

  const handleProvinceChange = (prov: string) => {
    setFilters((prev: any) => ({
      ...prev,
      province: prov === 'All' ? '' : prov,
      district: '',
      sector: '',
    }));
  };

  const handleDistrictChange = (dist: string) => {
    setFilters((prev: any) => ({
      ...prev,
      district: dist === 'All' ? '' : dist,
      sector: '',
    }));
  };

  const inputStyle = {
    background: 'var(--color-input-bg)',
    borderColor: 'var(--color-input-border)',
    color: 'var(--color-text-main)',
  };

  const inputClass =
    'w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500/50 transition-all';
  const selectClass =
    'mt-2 w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500/50 transition-all cursor-pointer [&>option]:bg-[#080c14] dark:[&>option]:bg-[#080c14] light:[&>option]:bg-white [&>option]:text-[var(--color-text-main)]';

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
            placeholder="Title, UPI, sector, or features..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>
      </label>

      <div>
        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Transaction Type</span>
          <select
            className={selectClass}
            style={inputStyle}
            value={filters.purpose || 'All'}
            onChange={(e) => updateFilter('purpose', e.target.value)}
          >
            <option value="All">All Transactions</option>
            <option value="sale">Outright Sale / Acquisition</option>
            <option value="rent">Lease / Rental</option>
          </select>
        </label>
      </div>

      <div>
        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Asset Class</span>
          <select
            className={selectClass}
            style={inputStyle}
            value={filters.category || 'All'}
            onChange={(e) => updateFilter('category', e.target.value)}
          >
            <option value="All">All Asset Classes</option>
            <option value="house">Houses & Standalone Villas</option>
            <option value="apartment">Apartments & Building Units</option>
            <option value="land">Sovereign Land & Parcels</option>
            <option value="car">Vehicles & Fleet</option>
            <option value="motorbike">Motorcycles & Scooters</option>
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

      {/* Rwanda Cascading Administrative Hierarchy */}
      <div className="space-y-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-1.5">
          <MapPin size={13} className="text-emerald-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Rwanda Location</span>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-dim)' }}>Province</label>
          <select
            className={cn(inputClass, 'cursor-pointer [&>option]:bg-[#080c14] dark:[&>option]:bg-[#080c14] light:[&>option]:bg-white [&>option]:text-[var(--color-text-main)]')}
            style={inputStyle}
            value={filters.province || 'All'}
            onChange={(e) => handleProvinceChange(e.target.value)}
          >
            {provinces.map((p) => (
              <option key={p} value={p}>{p === 'All' ? 'All Provinces' : p}</option>
            ))}
          </select>
        </div>

        {districts.length > 0 && (
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-dim)' }}>District</label>
            <select
              className={cn(inputClass, 'cursor-pointer [&>option]:bg-[#080c14] dark:[&>option]:bg-[#080c14] light:[&>option]:bg-white [&>option]:text-[var(--color-text-main)]')}
              style={inputStyle}
              value={filters.district || 'All'}
              onChange={(e) => handleDistrictChange(e.target.value)}
            >
              {districts.map((d) => (
                <option key={d} value={d}>{d === 'All' ? 'All Districts' : d}</option>
              ))}
            </select>
          </div>
        )}

        {sectors.length > 0 && (
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-dim)' }}>Sector</label>
            <select
              className={cn(inputClass, 'cursor-pointer [&>option]:bg-[#080c14] dark:[&>option]:bg-[#080c14] light:[&>option]:bg-white [&>option]:text-[var(--color-text-main)]')}
              style={inputStyle}
              value={filters.sector || 'All'}
              onChange={(e) => updateFilter('sector', e.target.value === 'All' ? '' : e.target.value)}
            >
              <option value="All">All Sectors</option>
              {sectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <label className="block pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Sort By</span>
        <select
          className={selectClass}
          style={inputStyle}
          value={filters.sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
        >
          <option value="newest">Newest Cataloged First</option>
          <option value="price_asc">Price: Lowest to Highest</option>
          <option value="price_desc">Price: Highest to Lowest</option>
        </select>
      </label>
    </div>
  );
};

export default FilterPane;

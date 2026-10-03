import React from 'react';
import { X, MapPin, BedDouble, Bath, Maximize, Car, Star } from 'lucide-react';
import type { Listing } from '../../types/listing';
import { cn } from '../../lib/utils';

interface ComparisonMatrixProps {
  listings: Listing[];
  onRemove: (id: string) => void;
  onListingClick: (id: string) => void;
  onClose: () => void;
}

const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({ listings, onRemove, onListingClick, onClose }) => {
  if (listings.length === 0) return null;

  const getSpecs = (listing: Listing) => {
    const asset = listing.asset || {};
    const resSpec = asset.residential_spec || {};
    const landSpec = asset.land_spec || {};
    const vehSpec = asset.vehicle_spec || {};

    return {
      price: Number(listing.price) || 0,
      location: listing.address || [asset.province, asset.district, asset.sector].filter(Boolean).join(', ') || 'Rwanda',
      bedrooms: resSpec.bedrooms,
      bathrooms: resSpec.bathrooms,
      area: resSpec.built_up_area_sqm || landSpec.plot_size_sqm || asset.total_area,
      parking: resSpec.parking_spaces,
      vehicle: vehSpec.make ? `${vehSpec.year} ${vehSpec.make} ${vehSpec.model}` : null,
      mileage: vehSpec.mileage,
      purpose: listing.purpose || 'sale',
      verification: listing.verification_level || 'seller_claimed',
    };
  };

  const specs = listings.map(getSpecs);
  const bestPrice = Math.min(...specs.map((s) => s.price).filter(Boolean));
  const bestArea = Math.max(...specs.map((s) => s.area || 0).filter(Boolean));

  const rows: { label: string; render: (spec: ReturnType<typeof getSpecs>, listing: Listing) => React.ReactNode; highlightBest?: 'min' | 'max' }[] = [
    { label: 'Price', render: (s) => <span className="font-mono font-bold">{s.price.toLocaleString()} RWF</span>, highlightBest: 'min' },
    { label: 'Location', render: (s) => <span className="flex items-center gap-1"><MapPin size={12} /> {s.location}</span> },
    { label: 'Bedrooms', render: (s) => s.bedrooms ? <span className="flex items-center gap-1"><BedDouble size={12} /> {s.bedrooms}</span> : '—' },
    { label: 'Bathrooms', render: (s) => s.bathrooms ? <span className="flex items-center gap-1"><Bath size={12} /> {s.bathrooms}</span> : '—' },
    { label: 'Area', render: (s) => s.area ? <span className="flex items-center gap-1"><Maximize size={12} /> {s.area} m²</span> : '—', highlightBest: 'max' },
    { label: 'Parking', render: (s) => s.parking ? <span className="flex items-center gap-1"><Car size={12} /> {s.parking}</span> : '—' },
    { label: 'Vehicle', render: (s) => s.vehicle || '—' },
    { label: 'Mileage', render: (s) => s.mileage ? `${Number(s.mileage).toLocaleString()} km` : '—' },
    { label: 'Purpose', render: (s) => s.purpose === 'sale' ? 'For Sale' : 'For Rent' },
    { label: 'Verification', render: (s) => (
      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold',
        s.verification === 'verified' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'
      )}>
        {s.verification === 'verified' ? 'Verified' : 'Not verified'}
      </span>
    ) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Comparison Matrix</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] transition cursor-pointer" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-[var(--color-text-dim)] p-3 border-b border-[var(--color-border)] w-32">
                  Feature
                </th>
                {listings.map((listing) => (
                  <th key={listing.id} className="text-left p-3 border-b border-[var(--color-border)] min-w-[180px]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <button
                          onClick={() => onListingClick(String(listing.id))}
                          className="text-sm font-bold hover:text-emerald-500 transition text-left line-clamp-2 cursor-pointer"
                        >
                          {listing.title}
                        </button>
                        <p className="text-[10px] text-[var(--color-text-dim)] mt-1">{listing.category}</p>
                      </div>
                      <button
                        onClick={() => onRemove(String(listing.id))}
                        className="shrink-0 rounded-full p-1 hover:bg-red-500/10 text-[var(--color-text-dim)] hover:text-red-400 transition cursor-pointer"
                        aria-label="Remove"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-[var(--color-border)]">
                  <td className="p-3 text-xs font-semibold text-[var(--color-text-muted)]">{row.label}</td>
                  {specs.map((spec, idx) => {
                    const isBest = row.highlightBest === 'min' && spec.price === bestPrice && spec.price > 0
                      || row.highlightBest === 'max' && spec.area === bestArea && spec.area > 0;
                    return (
                      <td key={idx} className={cn('p-3 text-sm', isBest && 'text-emerald-500 font-semibold')}>
                        {row.render(spec, listings[idx])}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-[10px] text-[var(--color-text-dim)]">
          <Star size={10} className="inline mr-1" />
          Green text indicates best value in each row
        </p>
      </div>
    </div>
  );
};

export default ComparisonMatrix;

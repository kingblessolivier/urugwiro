import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Compass, Building2, Car, Landmark } from 'lucide-react';
import { api } from '../../api/endpoints';

const SellerAssetDistribution: React.FC = () => {
  const { data: listings = [] } = useQuery({
    queryKey: ['seller-asset-distribution'],
    queryFn: async () => {
      try {
        const res = await api.seller.listings();
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    },
  });

  const categories = [
    { key: 'land', label: 'Land', icon: Compass },
    { key: 'residential', label: 'Residential Estates', icon: Building2 },
    { key: 'vehicle', label: 'Vehicles', icon: Car },
    { key: 'commercial', label: 'Commercial & Office', icon: Landmark },
  ];

  const totalValue = listings.reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0);

  const categoryStats = categories.map((cat) => {
    const matching = listings.filter((l: any) => {
      const c = (l.category || l.listing_type || '').toLowerCase();
      if (cat.key === 'residential') return ['house', 'apartment', 'residential'].some((value) => c.includes(value));
      if (cat.key === 'vehicle') return ['car', 'vehicle', 'motorbike'].some((value) => c.includes(value));
      return c.includes(cat.key);
    });
    const count = matching.length;
    const totalVal = matching.reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0);
    const share = totalValue > 0 ? Math.round((totalVal / totalValue) * 100) : 0;
    return {
      ...cat,
      count,
      totalVal,
      share,
    };
  });

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 lg:p-7 shadow-[var(--shadow-depth-1)]">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2">
            <Compass size={18} strokeWidth={2} className="text-[var(--color-brand-emerald)]" />
            <h3 className="text-base font-sans font-bold text-[var(--color-text-main)] tracking-tight">
              Portfolio by Category
            </h3>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {categoryStats.filter((cat) => cat.count > 0).map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.key}
              className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-hover)] transition-all shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-main)]">
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--color-text-main)]">{cat.label}</div>
                    <div className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5">
                      {cat.count} listings · {cat.share}% of portfolio value
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-sm font-bold text-[var(--color-text-main)]">
                    {(cat.totalVal / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M RWF
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)] font-medium">
                    Approx. ${Math.round(cat.totalVal / 1350).toLocaleString()} USD
                  </div>
                </div>
              </div>

              {/* Relative bar */}
              <div className="w-full bg-[var(--color-border)] h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                  style={{ width: `${Math.max(cat.share, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
        {categoryStats.every((cat) => cat.count === 0) && (
          <div className="p-8 text-center text-[var(--color-text-dim)]">
            <Compass size={32} className="mx-auto mb-2" />
            <p className="text-sm">No listings available to display distribution.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerAssetDistribution;

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, ArrowUpRight, Flame, MapPin
} from 'lucide-react';
import { api } from '../../../api/endpoints';
import type { MarketTrendsData } from '../types';

interface ConsumerMarketTrendsProps {
  onExploreDistrict?: (district: string) => void;
}

export const ConsumerMarketTrends: React.FC<ConsumerMarketTrendsProps> = ({ onExploreDistrict }) => {
  const { data, isLoading } = useQuery<MarketTrendsData>({
    queryKey: ['consumer-market-trends'],
    queryFn: async () => {
      const res = await api.consumer.marketTrends();
      return res.data;
    },
  });

  const districts = data?.districts || [];
  const corridors = data?.investment_corridors || [];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-zinc-200 dark:bg-white/5 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-zinc-200 dark:bg-white/5 border border-zinc-200 dark:border-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-wider mb-2">
          <TrendingUp size={13} /> Kigali Real Estate Telemetry
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
          Market Trends & Valuation Benchmarks
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Empowering buyers and tenants with real land prices per square meter and yield indicators across Kigali districts.
        </p>
      </div>

      {/* District Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {districts.map((district) => (
          <div
            key={district.name}
            className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 shadow-lg space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <MapPin size={16} className="text-emerald-500" />
                  <span>{district.name} District</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {district.demand_level} Demand
                </span>
              </div>

              {/* Price Per SQM */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10">
                <span className="text-[11px] text-zinc-400 uppercase font-semibold block">
                  Avg Benchmark Price
                </span>
                <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {district.avg_sqm_rwf.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-zinc-400">RWF/m²</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2.5 mt-3 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5">
                  <span className="text-[10px] text-zinc-400 block">Annual Growth</span>
                  <span className="font-bold text-emerald-500 font-mono">
                    {district.yoy_growth_pct > 0 ? `+${district.yoy_growth_pct}%` : `${district.yoy_growth_pct}%`}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5">
                  <span className="text-[10px] text-zinc-400 block">Rental Yield</span>
                  <span className="font-bold text-sky-500 font-mono">
                    {district.rental_yield_pct}% p.a.
                  </span>
                </div>
              </div>

              {/* Hotspots */}
              <div className="mt-3">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block mb-1.5">
                  Key Hotspots
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {district.hotspots.map((spot) => (
                    <span
                      key={spot}
                      className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-white/[0.04] text-[11px] text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-white/5"
                    >
                      {spot}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {onExploreDistrict && (
              <button
                onClick={() => onExploreDistrict(district.name)}
                className="w-full mt-4 py-2 px-3 rounded-xl bg-zinc-100 dark:bg-white/[0.04] hover:bg-emerald-500/10 hover:text-emerald-500 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Find Listings in {district.name}</span>
                <ArrowUpRight size={13} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Strategic Investment Corridors */}
      <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="text-amber-500" size={20} />
          <h4 className="text-base font-bold text-zinc-900 dark:text-white">
            High-Appreciation Strategic Corridors
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {corridors.map((corridor, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500">
                    {corridor.district}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-500">
                    {corridor.growth_rate}
                  </span>
                </div>
                <h5 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {corridor.title}
                </h5>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  {corridor.description}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-200/60 dark:border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">{corridor.category}</span>
                <span className="font-semibold text-amber-500">{corridor.signal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

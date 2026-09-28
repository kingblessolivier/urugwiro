import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layers, ArrowRight } from 'lucide-react';
import { api } from '../../api/endpoints';
import { cn } from '../../lib/utils';

const STAGES = [
  { id: 'offer_accepted', label: '1. Offer Accepted', step: '01' },
  { id: 'escrow_funded', label: '2. Escrow Funded', step: '02' },
  { id: 'due_diligence', label: '3. Due Diligence', step: '03' },
  { id: 'irembo_filing', label: '4. Government Filing', step: '04' },
  { id: 'notary_signing', label: '5. Notary Signing', step: '05' },
  { id: 'settled_closed', label: '6. Deal Closed', step: '06' },
];

const SellerDealPipeline: React.FC = () => {
  const { data: deals = [] } = useQuery({
    queryKey: ['seller-deals-pipeline'],
    queryFn: async () => {
      try {
        const res = await api.seller.deals();
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    },
  });

  const stageCounts: Record<string, { count: number; volume: number }> = {};
  STAGES.forEach((s) => {
    stageCounts[s.id] = { count: 0, volume: 0 };
  });
  deals.forEach((d: any) => {
    const stg = d.current_stage || d.stage || 'offer_accepted';
    if (!stageCounts[stg]) {
      stageCounts[stg] = { count: 0, volume: 0 };
    }
    stageCounts[stg].count += 1;
    stageCounts[stg].volume += Number(d.agreed_price) || 0;
  });

  const activeDeals = deals.filter((d: any) => !['settled_closed', 'closed', 'cancelled'].includes(d.current_stage || d.stage));
  const closedDeals = deals.filter((d: any) => ['settled_closed', 'closed'].includes(d.current_stage || d.stage));
  const projectedCommission = Math.round(activeDeals.reduce((sum: number, d: any) => sum + (Number(d.agreed_price) || 0), 0) * 0.025);
  const realizedCommission = Math.round(closedDeals.reduce((sum: number, d: any) => sum + (Number(d.agreed_price) || 0), 0) * 0.025);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 lg:p-7 shadow-[var(--shadow-depth-1)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[var(--color-border)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers size={16} strokeWidth={2} className="text-[var(--color-brand-emerald)]" />
            <h2 className="text-lg font-sans font-bold text-[var(--color-text-main)] tracking-tight">
              Deal Pipeline
            </h2>
          </div>
          <p className="text-[11px] font-mono text-[var(--color-text-dim)] uppercase tracking-wider">Deals grouped by current stage</p>
        </div>
      </div>

      {/* 6 Stage-based Precision View: Linear Progression */}
      <div className="relative">
        {/* Background Progress Line */}
        <div className="absolute top-6 left-0 w-full h-px bg-[var(--color-border)] z-0" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 relative z-10">
          {STAGES.map((stg) => {
            const data = stageCounts[stg.id] || { count: 0, volume: 0 };
            return (
              <div key={stg.id} className="group cursor-pointer relative">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-md border border-emerald-500/40 bg-[var(--color-bg-surface)] flex items-center justify-center text-[10px] font-mono text-emerald-600 dark:text-[var(--color-brand-emerald)] font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-[var(--shadow-emerald-soft)]">
                      {stg.step}
                    </div>
                    <span className="text-xs font-semibold text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)] transition-colors tracking-wide">
                      {stg.label}
                    </span>
                  </div>
                  {data.count > 0 && (
                    <span className="text-[10px] font-mono text-[var(--color-brand-emerald)] bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                      {data.count} Assets
                    </span>
                  )}
                </div>
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 transition-all duration-300 group-hover:border-[var(--color-brand-emerald)] group-hover:bg-[var(--color-bg-card-hover)] flex items-end justify-between shadow-sm">
                  <div className="text-3xl font-mono font-bold text-[var(--color-text-main)]">
                    {data.count}
                  </div>
                  <div className="text-[11px] font-mono text-[var(--color-text-dim)]">
                    {data.volume > 0 ? (
                      <span className="text-[var(--color-brand-emerald)] font-bold">{(data.volume / 1_000_000).toFixed(1)}M RWF</span>
                    ) : (
                      <span className="text-[var(--color-text-dim)] font-medium">Zero Volume</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pipeline Conversion Health Bar */}
      <div className="mt-10 pt-6 border-t border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[var(--color-text-dim)] font-medium">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span>Closing Velocity: <strong className="text-[var(--color-text-main)] font-mono font-bold">14 Calendar Days</strong></span>
        </div>
        <div className="flex items-center gap-6 font-mono text-[11px]">
          <span className="flex items-center gap-1.5">Active Deals: <strong className="text-[var(--color-brand-emerald)] font-bold">{activeDeals.length}</strong></span>
          <span className="flex items-center gap-1.5">Closed: <strong className="text-[var(--color-text-main)] font-bold">{closedDeals.length}</strong></span>
          <span className="flex items-center gap-1.5">Projected Commission: <strong className="text-[var(--color-brand-emerald)] font-bold">{(projectedCommission / 1_000_000).toFixed(1)}M RWF</strong></span>
          <span className="flex items-center gap-1.5">Realized: <strong className="text-[var(--color-brand-emerald)] font-bold">{(realizedCommission / 1_000_000).toFixed(1)}M RWF</strong></span>
        </div>
      </div>
    </div>
  );
};

export default SellerDealPipeline;

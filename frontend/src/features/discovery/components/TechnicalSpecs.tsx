import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Info, ArrowUpRight } from 'lucide-react';

interface TechnicalMetricProps {
  icon: LucideIcon;
  value?: string | number;
  label: string;
}

const FRIENDLY_LABELS: Record<string, { friendly: string; explanation: string }> = {
  'Zoning Code': { friendly: 'Property Use', explanation: 'Defines what the land can legally be used for (Residential, Commercial, etc.)' },
  'Tenure Type': { friendly: 'Ownership Type', explanation: 'The legal nature of the property ownership (Freehold, Leasehold, etc.)' },
  'Cadastral': { friendly: 'Official Records', explanation: 'The official government land registry record for this plot' },
  'Built-up Area': { friendly: 'House Size', explanation: 'The total area of the building footprint' },
  'UPI Number': { friendly: 'Registration ID', explanation: 'Unique Parcel Identifier: The official government ID for this specific plot of land' },
  'Title Deed Ref': { friendly: 'Ownership Paper', explanation: 'The official document reference number proving legal ownership' },
  'Lease Duration': { friendly: 'Rental Length', explanation: 'The remaining time on the legal land lease' },
  'Ownership Status': { friendly: 'Title Status', explanation: 'Whether the property is clear of debts or legal disputes' },
  'Terrain Type': { friendly: 'Land Shape', explanation: 'The physical characteristics of the ground (Flat, Sloping, etc.)' },
  'Soil Composition': { friendly: 'Ground Type', explanation: 'The type of soil, which affects construction and gardening' },
  'Coordinates': { friendly: 'Exact Location', explanation: 'Precise GPS coordinates for mapping' },
};

export const TechnicalMetric: React.FC<TechnicalMetricProps> = ({ icon: Icon, value, label }) => {
  if (value === undefined || value === null || value === '') return null;

  const { friendly, explanation } = FRIENDLY_LABELS[label] || { friendly: label, explanation: '' };
  const isAddress = label === 'Address';
  const isExactLocation = label === 'Exact Location' || label === 'Coordinates';

  return (
    <div className={`group flex min-w-0 items-center gap-3 border-b py-4 last:border-b-0 ${isAddress ? 'sm:col-span-2' : ''}`} style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 group-hover:text-[var(--color-brand-emerald)]" style={{ borderColor: 'var(--color-border)', background: 'var(--color-input-bg)', color: 'var(--color-text-dim)' }}>
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{friendly}</span>
        {explanation && (
          <div className="relative group/tooltip">
            <Info size={12} className="cursor-help hover:text-[var(--color-text-main)]" style={{ color: 'var(--color-text-dim)' }} />
            <div className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 w-52 rounded-lg border p-2.5 text-[10px] leading-relaxed opacity-0 shadow-[var(--shadow-depth-2)] transition-opacity group-hover/tooltip:opacity-100" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}>
              {explanation}
            </div>
          </div>
        )}
        </div>
        <span className={`mt-1 block font-mono font-semibold transition-colors group-hover:text-[var(--color-brand-emerald)] ${isAddress ? 'break-words text-sm leading-relaxed' : isExactLocation ? 'break-all text-xs leading-relaxed' : 'break-words text-sm'}`} style={{ color: 'var(--color-text-main)' }}>
          {value}
        </span>
      </div>
    </div>
  );
};

interface SpecDomainProps {
  title: string;
  icon: LucideIcon;
  metrics: { icon: LucideIcon; value?: string | number; label: string }[];
}

export const SpecDomain: React.FC<SpecDomainProps> = ({ title, icon: Icon, metrics }) => {
  const visibleMetrics = metrics.filter((metric) => {
    if (metric.value === undefined || metric.value === null || metric.value === '') return false;
    const normalized = String(metric.value).trim().toLowerCase();
    return !['n/a', 'na', 'not listed', 'not provided', 'undefined', 'null', 'none'].includes(normalized);
  });

  if (visibleMetrics.length === 0) return null;

  return (
    <section className="overflow-visible rounded-2xl border p-5 sm:p-6" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}>
      <div className="mb-1 flex items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-[var(--color-brand-emerald)]">
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold tracking-tight" style={{ color: 'var(--color-text-main)' }}>{title}</h4>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-dim)' }}>Property information</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-dim)' }}>
          {visibleMetrics.length} fields <ArrowUpRight size={13} className="text-[var(--color-brand-emerald)]" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
        {visibleMetrics.map((m, idx) => (
          <TechnicalMetric key={idx} {...m} />
        ))}
      </div>
    </section>
  );
};

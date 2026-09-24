import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Info } from 'lucide-react';

interface TechnicalMetricProps {
  icon: LucideIcon;
  value: string | number;
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

  return (
    <div className="group relative p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-emerald-500/40 hover:bg-emerald-500/[0.03] transition-all duration-300 hover:-translate-y-1 cursor-default">
      <div className="flex items-start justify-between mb-2">
        <div className="text-zinc-500 group-hover:text-emerald-400 transition-colors">
          <Icon size={16} />
        </div>
        {explanation && (
          <div className="relative group/tooltip">
            <Info size={12} className="text-zinc-600 hover:text-zinc-400 cursor-help" />
            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 rounded-lg bg-zinc-800 text-zinc-300 text-[10px] leading-tight opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity shadow-xl border border-white/10 z-50">
              {explanation}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-emerald-400 text-sm font-bold truncate">
          {value}
        </span>
        <span className="text-zinc-500 text-[10px] uppercase tracking-widest truncate">
          {friendly}
        </span>
      </div>
    </div>
  );
};

interface SpecDomainProps {
  title: string;
  icon: LucideIcon;
  metrics: { icon: LucideIcon; value: string | number; label: string }[];
}

export const SpecDomain: React.FC<SpecDomainProps> = ({ title, icon: Icon, metrics }) => {
  if (metrics.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 text-zinc-400">
        <Icon size={16} className="text-emerald-500" />
        <h4 className="text-[11px] uppercase font-bold tracking-widest">{title}</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map((m, idx) => (
          <TechnicalMetric key={idx} {...m} />
        ))}
      </div>
    </div>
  );
};

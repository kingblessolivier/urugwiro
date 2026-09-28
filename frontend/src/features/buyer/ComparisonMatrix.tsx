import React, { useState } from 'react';
import { GitCompareArrows, X, Check, Minus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

interface ComparisonMatrixProps {
  listings: any[];
  onRemove: (id: string) => void;
}

const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({ listings, onRemove }) => {
  const [highlightDiffs, setHighlightDiffs] = useState(true);

  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-12 text-center">
        <GitCompareArrows size={32} className="mx-auto text-[var(--color-text-dim)] mb-3" />
        <p className="text-sm text-[var(--color-text-muted)]">Select properties to compare (up to 3)</p>
      </div>
    );
  }

  const allKeys = Array.from(new Set(listings.flatMap(l => Object.keys(l))));

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'number') {
      if (value > 1000000) return `${(value / 1000000).toFixed(1)}M`;
      return value.toLocaleString();
    }
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  const isDifferent = (key: string): boolean => {
    if (!highlightDiffs || listings.length < 2) return false;
    const values = listings.map(l => JSON.stringify(l[key]));
    return new Set(values).size > 1;
  };

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-depth-1)] overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <GitCompareArrows size={18} className="text-[var(--color-brand-emerald)]" />
          <h3 className="text-base font-sans font-bold text-[var(--color-text-main)] tracking-tight">
            Comparison Matrix
          </h3>
        </div>
        <label className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] cursor-pointer">
          <input
            type="checkbox"
            checked={highlightDiffs}
            onChange={e => setHighlightDiffs(e.target.checked)}
            className="accent-emerald-500"
          />
          Highlight differences
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left p-4 text-[10px] uppercase font-bold text-[var(--color-text-dim)] min-w-[140px]">
                Feature
              </th>
              {listings.map((listing) => (
                <th key={listing.id} className="text-left p-4 min-w-[200px]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[var(--color-text-main)] text-sm">{listing.title || 'Untitled'}</p>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{listing.category || 'Property'}</p>
                    </div>
                    <button
                      onClick={() => onRemove(String(listing.id))}
                      className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allKeys.map((key) => (
              <tr
                key={key}
                className={cn(
                  "border-b border-[var(--color-border)]",
                  isDifferent(key) && "bg-emerald-500/5"
                )}
              >
                <td className="p-4 text-[10px] uppercase font-bold text-[var(--color-text-dim)]">
                  {key.replace(/_/g, ' ')}
                </td>
                {listings.map((listing) => (
                  <td
                    key={listing.id}
                    className={cn(
                      "p-4 text-sm",
                      isDifferent(key) ? "font-semibold text-[var(--color-brand-emerald)]" : "text-[var(--color-text-muted)]"
                    )}
                  >
                    {formatValue(listing[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {listings.length < 3 && (
        <div className="p-4 border-t border-[var(--color-border)] text-center">
          <p className="text-xs text-[var(--color-text-dim)]">
            Add up to {3 - listings.length} more {3 - listings.length === 1 ? 'property' : 'properties'} to compare
          </p>
        </div>
      )}
    </div>
  );
};

export default ComparisonMatrix;

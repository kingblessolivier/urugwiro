import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHero } from '../../components/layout/PageHero';
import { Button } from '../../components/ui/Button';
import type { AppView } from '../../types/navigation';
import { Calendar, Bell, Sparkles, AlertCircle, Tag, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Update {
  id: number;
  title: string;
  description: string;
  end_date?: string;
  created_at?: string;
  category?: string;
}

interface UpdatesPageProps {
  onNavigate?: (view: AppView) => void;
}

const filters = [
  { id: 'all', label: 'All Releases & Bulletins' },
  { id: 'announcement', label: 'Executive Bulletins' },
  { id: 'feature', label: 'Platform & AI Features' },
  { id: 'property', label: 'Market Intelligence' },
  { id: 'maintenance', label: 'Infrastructure Status' },
];

const UpdatesPage: React.FC<UpdatesPageProps> = ({ onNavigate }) => {
  const [filter, setFilter] = useState('all');

  const updatesQuery = useQuery({
    queryKey: ['public-updates'],
    queryFn: async () => {
      const response = await fetch('/api/public/updates/');
      if (!response.ok) throw new Error('Could not load updates');
      const data = await response.json();
      return (Array.isArray(data) ? data : data.results || []) as Update[];
    },
    retry: false,
  });

  const updates = updatesQuery.data || [];
  const visible = useMemo(() => {
    if (filter === 'all') return updates;
    return updates.filter((item) => (item.category || 'announcement') === filter);
  }, [filter, updates]);

  return (
    <div style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-main)' }} className="min-h-screen transition-colors duration-300">
      <PageHero
        eyebrow="Marketplace Dispatch"
        title="Official Bulletins, Market Dispatches & Platform Releases."
        description="Stay informed on sovereign legal updates, marketplace security upgrades, new spatial intelligence features, and executive communications."
      />

      <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        {/* Category Pill Filters */}
        <div className="mb-10 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                'rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 oneui-press cursor-pointer',
                filter === item.id
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'border hover:border-emerald-500/30 hover:text-emerald-500'
              )}
              style={
                filter !== item.id
                  ? {
                      borderColor: 'var(--color-border)',
                      background: 'var(--color-bg-card)',
                      color: 'var(--color-text-muted)',
                    }
                  : undefined
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Dynamic Content */}
        {updatesQuery.isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((key) => (
              <div
                key={key}
                className="h-40 animate-pulse rounded-2xl border"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div
            className="rounded-3xl border border-dashed px-6 py-20 text-center transition-all"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-card)',
              boxShadow: 'var(--shadow-depth-1)',
            }}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Bell size={24} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>
              No active dispatches in this category
            </h2>
            <p className="mt-2 text-sm max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
              Our engineering and editorial teams publish weekly briefs. Check back shortly or return to catalog exploration.
            </p>
            <Button
              className="mt-6 rounded-xl bg-emerald-500 px-6 py-2.5 font-semibold text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
              onClick={() => onNavigate?.('home')}
            >
              Return to Showcase
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {visible.map((update) => (
              <article
                key={update.id}
                className="group rounded-2xl border p-7 transition-all duration-300 hover:border-emerald-500/40 oneui-card"
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-bg-card)',
                  boxShadow: 'var(--shadow-depth-1)',
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                      <Tag size={10} /> {update.category || 'Executive'}
                    </span>
                    {update.created_at && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-dim)' }}>
                        <Calendar size={12} />{' '}
                        {new Date(update.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                  {update.end_date && (
                    <span className="text-[11px]" style={{ color: 'var(--color-text-dim)' }}>
                      Active until {new Date(update.end_date).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <h2
                  className="mt-4 text-xl font-bold transition-colors group-hover:text-emerald-500"
                  style={{ color: 'var(--color-text-main)' }}
                >
                  {update.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {update.description}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UpdatesPage;

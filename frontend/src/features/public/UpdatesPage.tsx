import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHero } from '../../components/layout/PageHero';
import { Button } from '../../components/ui/Button';
import type { AppView } from '../../types/navigation';

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
  { id: 'all', label: 'All updates' },
  { id: 'announcement', label: 'Announcements' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'feature', label: 'New features' },
  { id: 'property', label: 'Listings' },
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
    <div>
      <PageHero
        eyebrow="News"
        title="Latest updates"
        description="Company news, product changes and announcements. Only published updates from the API are shown."
      />

      <section className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
        <div className="mb-8 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${
                filter === item.id
                  ? 'border-emerald-700 bg-emerald-700 text-white'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {updatesQuery.isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((key) => (
              <div key={key} className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-semibold">No updates available</h2>
            <p className="mt-2 text-slate-600">There are no published updates for this filter right now.</p>
            <Button className="mt-6" variant="secondary" onClick={() => onNavigate?.('home')}>
              Return home
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map((update) => (
              <article key={update.id} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold text-slate-900">{update.title}</h2>
                  {update.created_at || update.end_date ? (
                    <p className="text-xs text-slate-500">
                      {update.created_at ? new Date(update.created_at).toLocaleDateString() : null}
                      {update.end_date ? ` · Until ${new Date(update.end_date).toLocaleDateString()}` : null}
                    </p>
                  ) : null}
                </div>
                <p className="mt-3 leading-relaxed text-slate-600">{update.description}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UpdatesPage;

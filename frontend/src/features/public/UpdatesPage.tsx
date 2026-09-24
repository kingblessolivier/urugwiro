import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AppView } from '../../types/navigation';
import { ArrowLeft, Search, Sparkles } from 'lucide-react';

interface UpdateItem {
  id?: string | number;
  title: string;
  description?: string;
  date?: string;
  created_at?: string;
}

interface UpdatesPageProps {
  onNavigate?: (view: AppView) => void;
}

const DEFAULT_UPDATES: UpdateItem[] = [
  {
    id: 'up-1',
    date: '22.09.2026',
    title: 'Digital contract signing for completed deals',
    description: 'Buyers, sellers, and agents can now review, sign, and verify statutory conveyance agreements directly on the platform with phone OTP confirmation and SHA-256 tamper-proof timestamps.',
  },
  {
    id: 'up-2',
    date: '21.09.2026',
    title: 'Interactive 3D building viewer and cadastral parcel maps',
    description: 'Explore apartment complexes with floor-by-floor room layouts, view directions, pricing, and exact cadastral parcel boundaries mapped via Leaflet OpenStreetMap.',
  },
  {
    id: 'up-3',
    date: '18.09.2026',
    title: 'Direct seller property proposal submission',
    description: 'Property owners can now submit listings directly for cadastre inspection, title deed matching, and administrative verification.',
  },
  {
    id: 'up-4',
    date: '15.09.2026',
    title: 'Kigali Master Plan 2050 zoning validation',
    description: 'Added automatic zoning checks, building coverage ratio calculations, and wetland buffer zone screening for land listings.',
  },
  {
    id: 'up-5',
    date: '12.09.2026',
    title: 'Conveyance pipeline and escrow tracking',
    description: 'Track deal progress step-by-step from offer acceptance through escrow funding, notary appointment, and official title transfer.',
  },
];

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

export const UpdatesPage: React.FC<UpdatesPageProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState('');

  const { data: serverUpdates = [], isLoading } = useQuery<UpdateItem[]>({
    queryKey: ['public-updates'],
    queryFn: async () => {
      const response = await fetch('/api/public/updates/');
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : data.results || [];
    },
    retry: false,
  });

  const list: UpdateItem[] = serverUpdates.length > 0 ? serverUpdates : DEFAULT_UPDATES;

  const filtered = useMemo(() => {
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.date && item.date.toLowerCase().includes(q))
    );
  }, [list, query]);

  const latestUpdate = filtered.length > 0 ? filtered[0] : null;
  const olderUpdates = filtered.length > 1 ? filtered.slice(1) : [];

  return (
    <main
      style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-main)' }}
      className="min-h-screen transition-colors duration-200"
    >
      {/* Expanded Container Width: max-w-6xl */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-14 py-14 sm:py-20">
        {/* Navigation & Breadcrumb */}
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors mb-10 cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to home</span>
          </button>
        )}

        {/* Page Header with Increased Font Sizes */}
        <header className="mb-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200/80 dark:border-zinc-800">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                Updates
              </h1>
              <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 mt-2.5 leading-relaxed max-w-2xl">
                Recent improvements, feature releases, and statutory changes to the platform.
              </p>
            </div>

            {/* Generous Search Input */}
            <div className="relative w-full md:w-80 shrink-0">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search updates by keyword or date..."
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500/70 dark:focus:border-emerald-500/70 transition-colors shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-20 text-sm font-mono text-zinc-400 text-center">
            Loading updates...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm text-zinc-500">
            No updates found matching "{query}".
          </div>
        ) : (
          <div className="space-y-14">
            {/* ━━━ PROMINENTLY HIGHLIGHTED LATEST POSTED UPDATE ━━━ */}
            {latestUpdate && (
              <section className="p-7 sm:p-9 md:p-10 rounded-3xl border border-emerald-500/35 dark:border-emerald-500/40 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.035] shadow-sm relative overflow-hidden group">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm sm:text-base md:text-lg font-bold text-emerald-600 dark:text-emerald-400 select-all">
                      {formatDate(latestUpdate.date || latestUpdate.created_at)} :
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs">
                      <Sparkles size={13} className="text-emerald-500" />
                      Latest Update
                    </span>
                  </div>
                  <span className="text-xs font-mono text-zinc-400 font-medium">
                    Most Recent Release
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white leading-snug tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {latestUpdate.title}
                </h2>

                {latestUpdate.description && latestUpdate.description.trim() !== latestUpdate.title.trim() && (
                  <p className="mt-3.5 text-sm sm:text-base md:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-4xl">
                    {latestUpdate.description}
                  </p>
                )}
              </section>
            )}

            {/* ━━━ PREVIOUS UPDATES TIMELINE WITH LARGE FONTS & ALIGNMENT ━━━ */}
            {olderUpdates.length > 0 && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
                  <h3 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Previous Updates
                  </h3>
                </div>

                <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800/80">
                  {olderUpdates.map((item, idx) => {
                    const formattedDate = formatDate(item.date || item.created_at) || '';

                    return (
                      <article
                        key={item.id ?? idx}
                        className="py-7 sm:py-8 group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                          <span className="font-mono text-sm sm:text-base md:text-lg font-bold text-emerald-600 dark:text-emerald-400 shrink-0 select-all sm:w-36 md:w-40">
                            {formattedDate} :
                          </span>
                          <h4 className="text-base sm:text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug flex-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                            {item.title}
                          </h4>
                        </div>

                        {item.description && item.description.trim() !== item.title.trim() && (
                          <p className="mt-2.5 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed sm:pl-[160px] md:pl-[176px] max-w-4xl">
                            {item.description}
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Minimal Footer Note */}
        <footer className="mt-20 pt-8 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs sm:text-sm text-zinc-400 font-mono">
          <span>Urugwiro Platform</span>
          <span>Updated regularly</span>
        </footer>
      </div>
    </main>
  );
};

export default UpdatesPage;

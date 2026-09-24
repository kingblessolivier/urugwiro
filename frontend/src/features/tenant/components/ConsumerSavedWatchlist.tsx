import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, MapPin, Eye, Calendar, ArrowRight, ExternalLink } from 'lucide-react';
import { api } from '../../../api/endpoints';
import { Pagination } from '../../../components/ui/Pagination';

interface SavedProperty {
  id: number;
  title: string;
  category: string;
  purpose: string;
  price: number;
  currency: string;
  location: string;
  district: string;
  image: string;
  status: string;
  views_count: number;
}

interface ConsumerSavedWatchlistProps {
  onNavigate?: (view: any) => void;
  onListingClick?: (id: string) => void;
  onScheduleVisit?: (listingId: number) => void;
}

export const ConsumerSavedWatchlist: React.FC<ConsumerSavedWatchlistProps> = ({
  onNavigate,
  onListingClick,
  onScheduleVisit,
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const { data: saved = [], isLoading } = useQuery<SavedProperty[]>({
    queryKey: ['consumer-saved-properties'],
    queryFn: async () => {
      const res = await api.consumer.savedProperties();
      return res.data;
    },
  });

  const paginatedSaved = saved.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Heart className="text-rose-500" size={22} />
          <span>Saved Properties & Watchlist</span>
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Properties you have bookmarked for price monitoring, comparison, and showings.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-zinc-400 text-sm">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading your saved watchlist...
        </div>
      ) : saved.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <Heart size={28} />
          </div>
          <h4 className="text-base font-bold text-zinc-900 dark:text-white">Watchlist is Empty</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            When exploring verified properties in the marketplace, tap the heart icon to monitor them here.
          </p>
          <button
            onClick={() => onNavigate && onNavigate('discovery')}
            className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-md"
          >
            <span>Browse Properties</span>
            <ArrowRight size={13} />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedSaved.map((prop) => (
              <div
                key={prop.id}
                onClick={() => onListingClick ? onListingClick(String(prop.id)) : (onNavigate && onNavigate('discovery'))}
                className="rounded-3xl overflow-hidden bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 shadow-lg hover:border-rose-500/40 transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-zinc-100 dark:bg-black">
                    <img
                      src={prop.image}
                      alt={prop.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                      {prop.purpose}
                    </div>
                    <div className="absolute top-3 right-3 p-1.5 rounded-full bg-rose-500 text-white shadow-md">
                      <Heart size={14} fill="currentColor" />
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="text-xs text-zinc-400 flex items-center gap-1">
                      <MapPin size={12} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{prop.location}</span>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover:text-rose-500 transition-colors">
                      {prop.title}
                    </h4>
                    <div className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {prop.price.toLocaleString()} RWF {prop.purpose === 'rent' ? '/ mo' : ''}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onListingClick) {
                        onListingClick(String(prop.id));
                      } else if (onNavigate) {
                        onNavigate('discovery');
                      }
                    }}
                    className="w-full py-2.5 rounded-2xl bg-zinc-100 dark:bg-white/[0.05] hover:bg-rose-500 hover:text-white text-zinc-800 dark:text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Inspect Details</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {saved.length > 0 && (
            <div className="pt-2">
              <Pagination
                currentPage={page}
                totalPages={Math.max(1, Math.ceil(saved.length / pageSize))}
                onPageChange={setPage}
                pageSize={pageSize}
                onPageSizeChange={(sz) => { setPageSize(sz); setPage(1); }}
                totalItems={saved.length}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

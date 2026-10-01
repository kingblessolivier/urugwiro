import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Trash2, MessageSquare } from 'lucide-react';
import { api } from '../../../api/endpoints';
import { cn } from '../../../lib/utils';

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= value ? 'fill-amber-400 text-amber-400' : 'text-[var(--color-text-dim)]'} />
      ))}
    </span>
  );
}

const SellerRatings: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['seller-reviews'],
    queryFn: async () => {
      const res = await api.seller.reviews();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => api.listings.deleteReview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seller-reviews'] }),
  });

  const reviews = data || [];
  const average = reviews.length
    ? Math.round((reviews.reduce((a: number, r: any) => a + Number(r.rating || 0), 0) / reviews.length) * 10) / 10
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      <div className="border-b border-[var(--color-border)] pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-brand-emerald)]">Customer Feedback</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text-main)]">Ratings & Reviews</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">See what customers say about your properties and follow up.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-dim)]">Average rating</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-3xl font-bold text-[var(--color-text-main)]">{average || '—'}</span>
            <Stars value={Math.round(average)} size={18} />
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-dim)]">Total reviews</p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-text-main)]">{reviews.length}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-12 text-center text-[var(--color-text-muted)]">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-12 text-center">
          <MessageSquare size={40} className="mx-auto text-[var(--color-text-dim)]" />
          <p className="mt-3 text-sm font-medium text-[var(--color-text-muted)]">No customer ratings yet.</p>
          <p className="mt-1 text-xs text-[var(--color-text-dim)]">Ratings appear here once customers review your properties.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r: any) => (
            <div key={r.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[var(--color-text-main)]">{r.reviewer_name || 'Customer'}</span>
                    <Stars value={Number(r.rating) || 0} size={15} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-text-dim)]">
                    {r.listing_title || (r.listing ? `Property #${typeof r.listing === 'object' ? r.listing.id : r.listing}` : '')}
                    {r.created_at ? ` · ${new Date(r.created_at).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => { if (confirm('Delete this review?')) deleteMutation.mutate(r.id); }}
                  className="shrink-0 rounded-lg border border-red-500/30 p-1.5 text-red-600 transition hover:bg-red-500/10 cursor-pointer"
                  title="Delete review"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {r.comment && (
                <p className={cn('mt-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] p-3 text-sm text-[var(--color-text-muted)]')}>
                  {r.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerRatings;

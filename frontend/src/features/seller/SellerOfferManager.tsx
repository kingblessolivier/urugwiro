import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Sparkles, TrendingUp, ShieldCheck, X, Check, Copy, Eye, Loader2,
} from 'lucide-react';
import { api } from '../../api/endpoints';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';

type OfferStatus = 'new' | 'reviewing' | 'negotiating' | 'accepted' | 'declined' | 'withdrawn';

interface Offer {
  id: number;
  listing?: number | null;
  listing_title?: string;
  listing_price?: string | number | null;
  customer?: number | null;
  customer_name?: string;
  seller?: number | null;
  seller_name?: string;
  conversation?: number | null;
  asking_price?: string | number | null;
  offered_amount?: string | number | null;
  currency?: string;
  message?: string;
  status: OfferStatus;
  created_at?: string;
  updated_at?: string;
}

const OPEN_STATUSES: OfferStatus[] = ['new', 'reviewing', 'negotiating'];

const num = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const money = (value: unknown, currency = 'RWF'): string => {
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toLocaleString()} ${currency}` : '—';
};

const askingOf = (offer: Offer): number =>
  num(offer.asking_price ?? offer.listing_price ?? offer.offered_amount);

export const SellerOfferManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [counterModal, setCounterModal] = useState<{ open: boolean; offer: Offer | null; amount: string }>({
    open: false,
    offer: null,
    amount: '',
  });
  const [aiModal, setAiModal] = useState<{
    open: boolean;
    offer: Offer | null;
    loading: boolean;
    analysis: string | null;
    discountPercent: number;
    recommendedCounter?: number;
  }>({ open: false, offer: null, loading: false, analysis: null, discountPercent: 0 });
  const [copied, setCopied] = useState(false);

  const { data: offers = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['seller-offers'],
    queryFn: async () => {
      const res = await api.seller.offers();
      const d: any = res.data;
      return (Array.isArray(d) ? d : (d?.results || [])) as Offer[];
    },
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, action, amount }: { id: number; action: 'accept' | 'reject' | 'counter'; amount?: string }) =>
      api.seller.respondOffer(id, action, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-offers'] });
      setCounterModal({ open: false, offer: null, amount: '' });
      setSelectedOffer(null);
    },
  });

  const openCounter = (offer: Offer, preset?: number) => {
    const amount = preset != null ? String(preset) : String(num(offer.offered_amount) || '');
    setCounterModal({ open: true, offer, amount });
  };

  const handleAiAnalyze = async (offer: Offer) => {
    setAiModal({ open: true, offer, loading: true, analysis: null, discountPercent: 0 });
    const offered = num(offer.offered_amount);
    const asking = askingOf(offer);
    try {
      const response = await api.ai.analyzeOffer({
        offer_amount: offered,
        asking_price: asking,
        property_title: offer.listing_title || '',
      });
      const data: any = response.data;
      setAiModal({
        open: true,
        offer,
        loading: false,
        analysis: data.analysis || data.ai_analysis || data.recommendation || 'Analysis complete.',
        discountPercent: num(data.discount_percent),
        recommendedCounter: data.recommended_counter != null ? num(data.recommended_counter) : undefined,
      });
    } catch {
      const diff = asking > 0 ? Math.round(((asking - offered) / asking) * 100) : 0;
      const recommended = Math.round(offered * 1.05);
      const analysisText = diff > 0
        ? `This offer is ${diff}% below the asking price (${money(asking, offer.currency)}). A counter around ${money(recommended, offer.currency)} keeps the deal moving.`
        : 'This offer matches or exceeds the asking price and is ready for acceptance.';
      setAiModal({ open: true, offer, loading: false, analysis: analysisText, discountPercent: diff, recommendedCounter: recommended });
    }
  };

  const openCount = offers.filter((o) => OPEN_STATUSES.includes(o.status)).length;

  const columns = useMemo<ColumnDef<Offer>[]>(() => [
    {
      accessorKey: 'listing_title',
      id: 'property',
      header: 'Property',
      cell: ({ row }) => (
        <span className="font-semibold text-[var(--color-text-main)]">
          {row.original.listing_title || `Listing #${row.original.listing ?? row.original.id}`}
        </span>
      ),
    },
    {
      accessorKey: 'customer_name',
      id: 'buyer',
      header: 'Buyer',
      cell: ({ row }) => (
        <span className="text-[var(--color-text-muted)]">{row.original.customer_name || 'Buyer'}</span>
      ),
    },
    {
      accessorKey: 'offered_amount',
      id: 'offered',
      header: 'Offer',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-[var(--color-brand-emerald)]">
          {money(row.original.offered_amount, row.original.currency)}
        </span>
      ),
    },
    {
      id: 'asking',
      header: 'Asking',
      cell: ({ row }) => (
        <span className="font-mono text-[var(--color-text-muted)]">
          {money(askingOf(row.original), row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: 'message',
      id: 'message',
      header: 'Note',
      cell: ({ row }) => (
        <span className="block max-w-xs truncate text-[var(--color-text-muted)]">
          {row.original.message || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const offer = row.original;
        const isOpen = OPEN_STATUSES.includes(offer.status);
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedOffer(offer)}
              className="rounded-lg border border-[var(--color-border)] p-1.5 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-main)]"
              title="View offer"
            >
              <Eye size={13} />
            </button>
            <button
              type="button"
              onClick={() => handleAiAnalyze(offer)}
              className="flex items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-[var(--color-brand-emerald)] transition-colors hover:bg-emerald-500/20"
              title="AI assessment"
            >
              <Sparkles size={12} /> AI
            </button>
            {isOpen && (
              <>
                <button
                  type="button"
                  onClick={() => respondMutation.mutate({ id: offer.id, action: 'accept' })}
                  className="rounded-lg bg-[var(--color-bg-elevated)] px-2 py-1 text-[11px] font-semibold text-[var(--color-text-muted)] transition-all hover:bg-emerald-600 hover:text-white"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => openCounter(offer)}
                  className="rounded-lg bg-[var(--color-bg-elevated)] px-2 py-1 text-[11px] font-semibold text-[var(--color-text-muted)] transition-all hover:bg-amber-500 hover:text-white"
                >
                  Counter
                </button>
                <button
                  type="button"
                  onClick={() => respondMutation.mutate({ id: offer.id, action: 'reject' })}
                  className="rounded-lg bg-[var(--color-bg-elevated)] px-2 py-1 text-[11px] font-semibold text-[var(--color-text-dim)] transition-all hover:bg-red-500 hover:text-white"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ], [respondMutation]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-1)] sm:p-8">
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)]">
              <TrendingUp size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--color-text-main)] sm:text-2xl">
                Offers & Negotiations
              </h2>
              <p className="mt-1 text-xs text-[var(--color-text-muted)] sm:text-sm">
                Review buyer offers, check them with AI, and accept or counter.
              </p>
            </div>
          </div>
          <span className="w-fit rounded-full border border-emerald-500/30 bg-[var(--color-accent-soft-bg)] px-3 py-1 font-mono text-xs font-bold text-[var(--color-brand-emerald)]">
            {openCount} open · {offers.length} total
          </span>
        </div>
      </div>

      {/* ── TABLE ── */}
      <DataTable
        data={offers}
        columns={columns}
        searchKeys={['listing_title', 'customer_name']}
        searchPlaceholder="Search by property or buyer..."
        emptyTitle="No offers yet"
        emptyDescription="Buyer offers on your listings will appear here."
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        showBulkActions={false}
        showDensityToggle
        showColumnToggle
        pageSize={10}
      />

      {/* ── COUNTER MODAL ── */}
      {counterModal.open && counterModal.offer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-1)]">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <h3 className="text-base font-bold text-[var(--color-text-main)]">Propose Counter Offer</h3>
              <button
                type="button"
                onClick={() => setCounterModal({ open: false, offer: null, amount: '' })}
                className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-text-main)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[var(--color-text-muted)]">
                <strong className="text-[var(--color-text-main)]">{counterModal.offer.customer_name || 'Buyer'}</strong> offered{' '}
                <strong className="font-mono text-[var(--color-brand-emerald)]">
                  {money(counterModal.offer.offered_amount, counterModal.offer.currency)}
                </strong>{' '}
                for <strong className="text-[var(--color-text-main)]">{counterModal.offer.listing_title || 'this listing'}</strong>.
              </p>
              <div>
                <label className="mb-1 block text-[var(--color-text-muted)]" htmlFor="counter-amount">
                  Your counter amount ({counterModal.offer.currency || 'RWF'})
                </label>
                <input
                  id="counter-amount"
                  type="number"
                  value={counterModal.amount}
                  onChange={(e) => setCounterModal({ ...counterModal, amount: e.target.value })}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2 font-mono text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={respondMutation.isPending || !counterModal.amount}
                  onClick={() =>
                    respondMutation.mutate({
                      id: counterModal.offer!.id,
                      action: 'counter',
                      amount: counterModal.amount,
                    })
                  }
                >
                  {respondMutation.isPending ? 'Sending...' : 'Submit Counter'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setCounterModal({ open: false, offer: null, amount: '' })}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── AI MODAL ── */}
      {aiModal.open && aiModal.offer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="flex max-h-[85vh] w-full max-w-xl flex-col space-y-4 rounded-xl border border-emerald-500/30 bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-1)]">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/30 bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)]">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--color-text-main)]">AI Offer Assessment</h3>
                  <p className="text-[11px] text-[var(--color-text-muted)]">{aiModal.offer.listing_title || 'Listing'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiModal({ ...aiModal, open: false })}
                className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-text-main)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto text-xs text-[var(--color-text-muted)]">
              {aiModal.loading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <Loader2 size={24} className="animate-spin text-[var(--color-brand-emerald)]" />
                  <p>Analyzing this offer against the asking price...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3.5">
                      <p className="font-mono text-[10px] uppercase text-[var(--color-text-muted)]">Offered</p>
                      <p className="mt-0.5 font-mono text-base font-bold text-[var(--color-brand-emerald)]">
                        {money(aiModal.offer.offered_amount, aiModal.offer.currency)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3.5">
                      <p className="font-mono text-[10px] uppercase text-[var(--color-text-muted)]">Variance</p>
                      <p className="mt-0.5 font-mono text-base font-bold text-amber-600 dark:text-amber-400">
                        {aiModal.discountPercent}% below asking
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 leading-relaxed">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-emerald)]">
                        Guidance
                      </span>
                      {aiModal.analysis && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(aiModal.analysis!)}
                          className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                        >
                          {copied ? <Check size={11} className="text-[var(--color-brand-emerald)]" /> : <Copy size={11} />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap">{aiModal.analysis}</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4">
              {aiModal.recommendedCounter != null && (
                <Button
                  variant="primary"
                  className="flex items-center gap-1.5"
                  onClick={() => {
                    openCounter(aiModal.offer!, aiModal.recommendedCounter);
                    setAiModal({ ...aiModal, open: false });
                  }}
                >
                  <TrendingUp size={13} />
                  Counter {money(aiModal.recommendedCounter, aiModal.offer.currency)}
                </Button>
              )}
              <Button variant="ghost" onClick={() => setAiModal({ ...aiModal, open: false })}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAILS MODAL ── */}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-lg space-y-6 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-1)] sm:p-8">
            <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-emerald)]">
                  <ShieldCheck size={12} /> Offer #{selectedOffer.id}
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text-main)]">
                  {selectedOffer.listing_title || `Listing #${selectedOffer.listing ?? selectedOffer.id}`}
                </h3>
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  Buyer: {selectedOffer.customer_name || '—'}
                  {selectedOffer.created_at ? ` · ${new Date(selectedOffer.created_at).toLocaleDateString()}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOffer(null)}
                className="rounded-xl p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card-hover)] hover:text-[var(--color-text-main)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-dim)]">Offered</span>
                  <span className="mt-1 block font-mono text-lg font-bold text-[var(--color-brand-emerald)]">
                    {money(selectedOffer.offered_amount, selectedOffer.currency)}
                  </span>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-dim)]">Asking</span>
                  <span className="mt-1 block font-mono text-lg font-bold text-[var(--color-text-main)]">
                    {money(askingOf(selectedOffer), selectedOffer.currency)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-dim)]">Buyer note</span>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {selectedOffer.message || 'No message provided.'}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3.5 text-xs">
                <span className="text-[var(--color-text-muted)]">Status</span>
                <StatusBadge status={selectedOffer.status} size="sm" />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/10 text-[var(--color-brand-emerald)] hover:bg-emerald-500/20"
                  onClick={() => {
                    handleAiAnalyze(selectedOffer);
                    setSelectedOffer(null);
                  }}
                >
                  <Sparkles size={13} /> AI Assess
                </Button>
                {OPEN_STATUSES.includes(selectedOffer.status) && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => respondMutation.mutate({ id: selectedOffer.id, action: 'accept' })}
                    >
                      Accept
                    </Button>
                    <Button variant="secondary" onClick={() => { openCounter(selectedOffer); setSelectedOffer(null); }}>
                      Counter
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => respondMutation.mutate({ id: selectedOffer.id, action: 'reject' })}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
              <Button variant="ghost" onClick={() => setSelectedOffer(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOfferManager;

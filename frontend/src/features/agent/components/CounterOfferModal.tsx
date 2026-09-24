import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Handshake, TrendingDown, TrendingUp, CheckCircle2 } from 'lucide-react';
import { api } from '../../../api/endpoints';
import { Button } from '../../../components/ui/Button';

interface CounterOfferModalProps {
  offer: {
    id: number;
    property_title: string;
    property_price?: number;
    buyer_username: string;
    buyer_phone?: string;
    buyer_email?: string;
    amount: number;
    counter_amount?: number | null;
    variance_percent?: number;
    status: string;
    financing_type?: string;
    message?: string;
  } | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CounterOfferModal: React.FC<CounterOfferModalProps> = ({ offer, onClose, onSuccess }) => {
  const queryClient = useQueryClient();

  const askingPrice = offer?.property_price || offer?.amount || 0;
  const initialCounter = offer?.counter_amount || Math.round((askingPrice + (offer?.amount || 0)) / 2);

  const [action, setAction] = useState<'counter' | 'accept' | 'reject'>('counter');
  const [counterAmount, setCounterAmount] = useState<number>(initialCounter);
  const [brokerNotes, setBrokerNotes] = useState('');

  const counterVariance = askingPrice > 0
    ? Number((((counterAmount - askingPrice) / askingPrice) * 100).toFixed(1))
    : 0;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!offer) return;
      return api.agent.counterOffer(offer.id, {
        action,
        counter_amount: action === 'counter' ? counterAmount : undefined,
        notes: brokerNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-offers'] });
      queryClient.invalidateQueries({ queryKey: ['agent-dashboard'] });
      if (onSuccess) onSuccess();
      onClose();
    },
  });

  if (!offer) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#080c14] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Handshake size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Offer Negotiation Desk</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Fiduciary review & counter-offer submission</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Offer Snapshot */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/5 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Asset Under Negotiation</span>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{offer.property_title}</h3>
              <p className="text-xs text-zinc-500">Buyer: <strong className="text-zinc-700 dark:text-zinc-300">{offer.buyer_username}</strong></p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Asking List Price</span>
              <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                {Number(askingPrice).toLocaleString()} RWF
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200/60 dark:border-white/5">
            <div className="p-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200/50 dark:border-white/5">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Current Buyer Offer</span>
              <span className="text-sm font-bold font-mono text-zinc-900 dark:text-white">
                {Number(offer.amount).toLocaleString()} RWF
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200/50 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Asking Variance</span>
                <span className={`text-sm font-bold font-mono ${
                  (offer.variance_percent || 0) < 0 ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {offer.variance_percent !== undefined ? `${offer.variance_percent}%` : '-'}
                </span>
              </div>
              {(offer.variance_percent || 0) < 0 ? (
                <TrendingDown size={18} className="text-amber-500" />
              ) : (
                <TrendingUp size={18} className="text-emerald-500" />
              )}
            </div>
          </div>

          {offer.message && (
            <p className="text-xs text-zinc-500 italic bg-white/50 dark:bg-white/[0.01] p-2.5 rounded-xl border border-zinc-200/40 dark:border-white/5">
              "{offer.message}"
            </p>
          )}
        </div>

        {/* Action Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Select Fiduciary Action
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'counter', label: 'Propose Counter-Offer', color: 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' },
              { id: 'accept', label: 'Accept Offer (Lock Deal)', color: 'border-sky-500 text-sky-500 bg-sky-500/10' },
              { id: 'reject', label: 'Decline Offer', color: 'border-red-500 text-red-500 bg-red-500/10' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setAction(btn.id as any)}
                className={`p-3 text-xs font-bold rounded-2xl border text-center transition-all ${
                  action === btn.id
                    ? btn.color
                    : 'border-zinc-200 dark:border-white/10 text-zinc-500 hover:border-zinc-300 dark:hover:border-white/20'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Counter-Offer Inputs (Only when action is 'counter') */}
        {action === 'counter' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Seller Counter-Offer Amount (RWF)
                </label>
                <span className={`text-[10px] font-bold font-mono ${counterVariance < 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {counterVariance >= 0 ? `+${counterVariance}%` : `${counterVariance}%`} of Asking
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="500000"
                  value={counterAmount}
                  onChange={(e) => setCounterAmount(Number(e.target.value))}
                  className="w-full py-3 px-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-sm font-bold font-mono text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all"
                  placeholder="Enter counter amount..."
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                  RWF
                </span>
              </div>
            </div>

            {/* Quick Adjustment Pills */}
            <div className="flex gap-2">
              {[
                { label: 'Midway Comps', val: Math.round((askingPrice + offer.amount) / 2) },
                { label: '-3% Concession', val: Math.round(askingPrice * 0.97) },
                { label: '-5% Concession', val: Math.round(askingPrice * 0.95) },
              ].map((pill, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCounterAmount(pill.val)}
                  className="py-1 px-2.5 rounded-lg bg-zinc-100 dark:bg-white/[0.04] text-[10px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 border border-zinc-200/60 dark:border-white/5 transition-colors"
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Broker Advisory & Counter Terms Rationale
              </label>
              <textarea
                rows={2}
                placeholder="Specify condition terms (e.g. 10% Earnest Escrow required within 5 days, expedited notary closing)..."
                value={brokerNotes}
                onChange={(e) => setBrokerNotes(e.target.value)}
                className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>
        )}

        {action === 'accept' && (
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-600 dark:text-sky-400 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Ready to generate Bilateral Conveyance Deal
            </p>
            <p>
              Accepting will lock in the agreed price of <strong>{Number(offer.amount).toLocaleString()} RWF</strong> and initiate the 6-stage Rwandan legal transfer pipeline.
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1 rounded-2xl text-xs font-bold py-3 border-zinc-300 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
          >
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className={`flex-1 rounded-2xl text-xs font-bold py-3 text-white shadow-lg ${
              action === 'reject'
                ? 'bg-red-600 hover:bg-red-500 shadow-red-950/20'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/20'
            }`}
          >
            {mutation.isPending ? 'Transmitting...' : action === 'counter' ? 'Send Official Counter' : action === 'accept' ? 'Accept & Lock Deal' : 'Decline Offer'}
          </Button>
        </div>
      </div>
    </div>
  );
};

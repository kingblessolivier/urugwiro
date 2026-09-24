import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight, CornerDownLeft, Ban, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { ConsumerOffer } from '../types';

interface CounterResponseModalProps {
  offer: ConsumerOffer | null;
  isOpen: boolean;
  onClose: () => void;
  onRespond: (offerId: number, action: 'accept' | 're_counter' | 'withdraw', newAmount?: number, message?: string) => Promise<void>;
}

export const CounterResponseModal: React.FC<CounterResponseModalProps> = ({
  offer,
  isOpen,
  onClose,
  onRespond,
}) => {
  const [mode, setMode] = useState<'decision' | 're_counter'>('decision');
  const [reCounterAmount, setReCounterAmount] = useState('');
  const [reCounterNote, setReCounterNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !offer) return null;

  const counterVal = offer.counter_amount || offer.offer_amount;
  const originalVal = offer.offer_amount;

  const handleAccept = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onRespond(offer.id, 'accept');
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.error || 'Failed to accept counter-offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Are you sure you want to withdraw this offer?')) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onRespond(offer.id, 'withdraw');
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.error || 'Failed to withdraw offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReCounterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(reCounterAmount.replace(/,/g, ''));
    if (isNaN(parsed) || parsed <= 0) {
      setErrorMessage('Please enter a valid positive number in RWF.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onRespond(offer.id, 're_counter', parsed, reCounterNote);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.error || 'Failed to transmit revised counter');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-white dark:bg-[#0c121e] border-t sm:border border-zinc-200 dark:border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-zinc-100 dark:border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Negotiation Desk
            </span>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {mode === 'decision' ? 'Seller Counter-Offer' : 'Submit Revised Counter'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Property Snippet */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10">
            <img
              src={offer.property_image}
              alt={offer.property_title}
              className="w-14 h-14 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-zinc-400 truncate">{offer.property_location}</div>
              <div className="text-sm font-bold text-zinc-900 dark:text-white truncate">{offer.property_title}</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Asking: {offer.asking_price.toLocaleString()} RWF
              </div>
            </div>
          </div>

          {/* Comparison Matrix */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10">
              <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Your Initial Offer</div>
              <div className="text-lg font-bold text-zinc-800 dark:text-zinc-200 font-mono mt-1">
                {originalVal.toLocaleString()} <span className="text-xs font-normal">RWF</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30">
              <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-300 uppercase flex items-center gap-1">
                Seller's Counter
              </div>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-300 font-mono mt-1">
                {counterVal.toLocaleString()} <span className="text-xs font-normal">RWF</span>
              </div>
            </div>
          </div>

          {/* Seller Message */}
          {offer.message && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200">
              <span className="font-semibold block mb-1">Message from Seller / Broker:</span>
              <p className="italic">"{offer.message}"</p>
            </div>
          )}

          {mode === 'decision' ? (
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAccept}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all text-sm"
              >
                <CheckCircle size={18} />
                Accept Counter of {counterVal.toLocaleString()} RWF
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setReCounterAmount(counterVal.toString());
                    setMode('re_counter');
                  }}
                  disabled={isSubmitting}
                  className="py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-800 dark:text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <CornerDownLeft size={16} />
                  Re-Counter Amount
                </button>

                <button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={isSubmitting}
                  className="py-3 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <Ban size={16} />
                  Withdraw Offer
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReCounterSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Your New Counter Proposal (RWF)
                </label>
                <input
                  type="number"
                  value={reCounterAmount}
                  onChange={(e) => setReCounterAmount(e.target.value)}
                  placeholder="e.g. 75000000"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-300 dark:border-white/10 focus:border-purple-500 focus:outline-none text-zinc-900 dark:text-white font-mono text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Negotiation Note to Seller
                </label>
                <textarea
                  rows={2}
                  value={reCounterNote}
                  onChange={(e) => setReCounterNote(e.target.value)}
                  placeholder="e.g. Willing to close at this revised amount with 10% cash deposit by end of week..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-300 dark:border-white/10 focus:border-purple-500 focus:outline-none text-zinc-900 dark:text-white text-xs resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('decision')}
                  className="w-1/3 py-3 rounded-2xl bg-zinc-100 dark:bg-white/[0.05] text-zinc-700 dark:text-zinc-300 text-sm font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <ArrowRight size={16} />
                  Transmit Re-Counter
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

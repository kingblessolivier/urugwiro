import React, { useState } from 'react';
import { X, Smartphone, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';


interface RentPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
  propertyTitle?: string;
  onPay: (data: { amount: number; payment_method: 'momo' | 'airtel' | 'card'; phone_number: string }) => Promise<any>;
}

export const RentPaymentModal: React.FC<RentPaymentModalProps> = ({
  isOpen,
  onClose,
  defaultAmount = 450000,
  propertyTitle = 'Monthly Tenancy Rent',
  onPay,
}) => {
  const [method, setMethod] = useState<'momo' | 'airtel' | 'card'>('momo');
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [phoneNumber, setPhoneNumber] = useState('0788123456');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setErrorMsg('Please enter a valid amount.');
      return;
    }
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const res = await onPay({
        amount,
        payment_method: method,
        phone_number: phoneNumber,
      });
      setSuccessReceipt(res);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || 'Payment transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessReceipt(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-white dark:bg-[#0c121e] border-t sm:border border-zinc-200 dark:border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 pt-5 pb-4 border-b border-zinc-100 dark:border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Direct Digital Escrow
            </span>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {successReceipt ? 'Payment Confirmed' : 'Pay Monthly Rent'}
            </h3>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {successReceipt ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-zinc-900 dark:text-white">Receipt Confirmed</h4>
                <p className="text-xs text-zinc-500 mt-1">Transaction recorded to sovereign tenant ledger.</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 text-left space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Reference:</span>
                  <span className="text-zinc-900 dark:text-white font-bold">{successReceipt.transaction_reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Amount Paid:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{amount.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Channel:</span>
                  <span className="text-zinc-900 dark:text-white uppercase">{method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Date & Time:</span>
                  <span className="text-zinc-500">{successReceipt.date_paid || 'Just now'}</span>
                </div>
              </div>

              <button
                onClick={handleResetAndClose}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Property name */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10">
                <div className="text-[11px] text-zinc-400">Rental Property:</div>
                <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{propertyTitle}</div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Amount to Pay (RWF)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-4 pr-16 py-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-white font-mono text-lg font-bold focus:border-emerald-500 focus:outline-none"
                    required
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-bold text-zinc-400">RWF</span>
                </div>
              </div>

              {/* Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Select Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('momo')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      method === 'momo'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                        : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <Smartphone size={20} />
                    <span className="text-xs">MTN MoMo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('airtel')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      method === 'airtel'
                        ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-bold'
                        : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <Smartphone size={20} />
                    <span className="text-xs">Airtel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('card')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      method === 'card'
                        ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold'
                        : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <CreditCard size={20} />
                    <span className="text-xs">Visa / Card</span>
                  </button>
                </div>
              </div>

              {/* Phone or Card input */}
              {method !== 'card' ? (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {method === 'momo' ? 'MTN MoMo Number' : 'Airtel Money Number'}
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="078... or 079..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                    required
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    A USSD prompt will be sent to this phone to authorize payment.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-700 dark:text-sky-300 flex items-center gap-2">
                  <ShieldCheck size={16} />
                  <span>3D-Secure Rwandan Bank Card Checkout</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Authorize {amount.toLocaleString()} RWF</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

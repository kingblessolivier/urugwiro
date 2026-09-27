import React, { useState } from 'react';
import { CreditCard, DollarSign, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';

interface PaymentCollectionProps {
    dealId: string;
    amount: number;
    currency?: string;
    escrowPercent?: number;
    onPaymentSubmit?: (data: { amount: number; method: string; phone?: string }) => void;
}

export const PaymentCollection: React.FC<PaymentCollectionProps> = ({
    dealId,
    amount,
    currency = 'RWF',
    escrowPercent = 10,
    onPaymentSubmit,
}) => {
    const [paymentMethod, setPaymentMethod] = useState<'momo' | 'airtel' | 'card' | 'bank'>('momo');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const escrowAmount = (amount * escrowPercent) / 100;

    const handleSubmit = async () => {
        setIsProcessing(true);
        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 2000));
        onPaymentSubmit?.({ amount: escrowAmount, method: paymentMethod, phone: phoneNumber });
        setIsSuccess(true);
        setIsProcessing(false);
    };

    if (isSuccess) {
        return (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
                <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-3" />
                <h3 className="text-lg font-bold text-[var(--color-text-main)]">Payment Initiated</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    {escrowAmount.toLocaleString()} {currency} via {paymentMethod === 'momo' ? 'MTN MoMo' : paymentMethod === 'airtel' ? 'Airtel Money' : paymentMethod}
                </p>
                <p className="text-xs text-[var(--color-text-dim)] mt-2">
                    Funds will be held in escrow until the transaction is complete.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <div className="flex items-center gap-2 mb-4">
                <Shield size={18} className="text-[var(--color-brand-emerald)]" />
                <h3 className="text-base font-bold text-[var(--color-text-main)]">Escrow Payment</h3>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-4 mb-4">
                <div className="flex justify-between mb-2">
                    <span className="text-xs text-[var(--color-text-muted)]">Total Price</span>
                    <span className="text-sm font-bold text-[var(--color-text-main)]">{amount.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span className="text-xs text-[var(--color-text-muted)]">Escrow Percentage</span>
                    <span className="text-sm font-bold text-[var(--color-text-main)]">{escrowPercent}%</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--color-border)]">
                    <span className="text-sm font-bold text-[var(--color-text-main)]">Escrow Amount</span>
                    <span className="text-lg font-bold text-[var(--color-brand-emerald)]">{escrowAmount.toLocaleString()} {currency}</span>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'momo', label: 'MTN MoMo', icon: '📱' },
                            { id: 'airtel', label: 'Airtel Money', icon: '📱' },
                            { id: 'card', label: 'Card', icon: '💳' },
                            { id: 'bank', label: 'Bank Transfer', icon: '🏦' },
                        ].map((method) => (
                            <button
                                key={method.id}
                                type="button"
                                onClick={() => setPaymentMethod(method.id as any)}
                                className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-colors ${
                                    paymentMethod === method.id
                                        ? 'border-[var(--color-brand-emerald)] bg-[var(--color-brand-emerald)]/5'
                                        : 'border-[var(--color-border)] bg-[var(--color-input-bg)] hover:border-[var(--color-border-hover)]'
                                }`}
                            >
                                <span className="text-lg">{method.icon}</span>
                                <span className="text-xs font-semibold text-[var(--color-text-main)]">{method.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {(paymentMethod === 'momo' || paymentMethod === 'airtel') && (
                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Phone Number</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="078XXXXXXXX"
                            className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                        />
                    </div>
                )}

                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={isProcessing || (paymentMethod === 'momo' || paymentMethod === 'airtel') && !phoneNumber}
                    className="w-full"
                >
                    {isProcessing ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Processing...
                        </span>
                    ) : (
                        <>
                            <DollarSign size={14} />
                            <span>Pay {escrowAmount.toLocaleString()} {currency}</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

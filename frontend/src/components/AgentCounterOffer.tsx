import React, { useState } from 'react';
import { ArrowRightLeft, Send } from 'lucide-react';
import { Button } from './ui/Button';

interface AgentCounterOfferProps {
    originalOffer: number;
    listingPrice: number;
    currency?: string;
    onSubmit?: (counterAmount: number, message: string) => void;
}

export const AgentCounterOffer: React.FC<AgentCounterOfferProps> = ({
    originalOffer,
    listingPrice,
    currency = 'RWF',
    onSubmit,
}) => {
    const [counterAmount, setCounterAmount] = useState(originalOffer);
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        onSubmit?.(counterAmount, message);
    };

    const difference = counterAmount - originalOffer;
    const percentDiff = originalOffer > 0 ? (difference / originalOffer) * 100 : 0;

    return (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <div className="flex items-center gap-2 mb-4">
                <ArrowRightLeft size={18} className="text-[var(--color-brand-emerald)]" />
                <h3 className="text-base font-bold text-[var(--color-text-main)]">Counter Offer</h3>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-3">
                    <div>
                        <p className="text-[10px] text-[var(--color-text-muted)]">Original Offer</p>
                        <p className="text-sm font-bold text-[var(--color-text-main)]">
                            {originalOffer.toLocaleString()} {currency}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-[var(--color-text-muted)]">Listing Price</p>
                        <p className="text-sm font-bold text-[var(--color-text-main)]">
                            {listingPrice.toLocaleString()} {currency}
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                        Counter Amount
                    </label>
                    <input
                        type="number"
                        value={counterAmount}
                        onChange={(e) => setCounterAmount(Number(e.target.value))}
                        className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                    />
                    {difference !== 0 && (
                        <p className={`text-[10px] mt-1 ${difference > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {difference > 0 ? '+' : ''}{difference.toLocaleString()} {currency} ({percentDiff > 0 ? '+' : ''}{percentDiff.toFixed(1)}%)
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                        Message (optional)
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        placeholder="Explain your counter offer..."
                        className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)] resize-none"
                    />
                </div>

                <Button variant="primary" onClick={handleSubmit} className="w-full">
                    <Send size={14} />
                    <span>Send Counter Offer</span>
                </Button>
            </div>
        </div>
    );
};

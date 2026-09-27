import React from 'react';
import { GitCompareArrows, Check, X } from 'lucide-react';

interface Offer {
    id: string;
    buyerName: string;
    amount: number;
    currency: string;
    escrowPercent: number;
    financingType: string;
    closingDate: string;
    status: string;
    message?: string;
}

interface OfferComparisonProps {
    offers: Offer[];
    onAccept?: (id: string) => void;
    onCounter?: (id: string) => void;
    onReject?: (id: string) => void;
}

export const OfferComparison: React.FC<OfferComparisonProps> = ({
    offers,
    onAccept,
    onCounter,
    onReject,
}) => {
    if (offers.length === 0) return null;

    const maxAmount = Math.max(...offers.map((o) => o.amount));

    return (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <div className="flex items-center gap-2 mb-4">
                <GitCompareArrows size={18} className="text-[var(--color-brand-emerald)]" />
                <h3 className="text-base font-bold text-[var(--color-text-main)]">Compare Offers</h3>
            </div>

            <div className="space-y-4">
                {offers.map((offer) => (
                    <div
                        key={offer.id}
                        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-4"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-sm font-bold text-[var(--color-text-main)]">{offer.buyerName}</p>
                                <p className="text-[10px] text-[var(--color-text-dim)]">{offer.financingType}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-[var(--color-brand-emerald)]">
                                    {offer.amount.toLocaleString()} {offer.currency}
                                </p>
                                <p className="text-[10px] text-[var(--color-text-dim)]">
                                    {offer.escrowPercent}% escrow
                                </p>
                            </div>
                        </div>

                        {/* Comparison bar */}
                        <div className="mb-3">
                            <div className="h-2 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-[var(--color-brand-emerald)]"
                                    style={{ width: `${(offer.amount / maxAmount) * 100}%` }}
                                />
                            </div>
                        </div>

                        {offer.message && (
                            <p className="text-xs text-[var(--color-text-muted)] mb-3 italic">
                                "{offer.message}"
                            </p>
                        )}

                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                offer.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-500' :
                                offer.status === 'pending' ? 'bg-amber-500/15 text-amber-500' :
                                offer.status === 'rejected' ? 'bg-red-500/15 text-red-500' :
                                'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]'
                            }`}>
                                {offer.status}
                            </span>
                            {offer.status === 'pending' && onAccept && (
                                <div className="ml-auto flex gap-1">
                                    <button
                                        onClick={() => onAccept(offer.id)}
                                        className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 transition-colors"
                                        title="Accept"
                                    >
                                        <Check size={14} />
                                    </button>
                                    <button
                                        onClick={() => onCounter?.(offer.id)}
                                        className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 transition-colors"
                                        title="Counter"
                                    >
                                        <GitCompareArrows size={14} />
                                    </button>
                                    <button
                                        onClick={() => onReject?.(offer.id)}
                                        className="p-1.5 rounded-lg bg-red-500/15 text-red-500 hover:bg-red-500/25 transition-colors"
                                        title="Reject"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

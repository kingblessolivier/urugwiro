import React, { useState } from 'react';
import { CreditCard, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';

interface Payout {
    id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    date: string;
    method: string;
}

interface AgentPayoutProps {
    payouts: Payout[];
    onRequestPayout?: () => void;
}

export const AgentPayout: React.FC<AgentPayoutProps> = ({ payouts, onRequestPayout }) => {
    const [isRequesting, setIsRequesting] = useState(false);

    const handleRequestPayout = () => {
        setIsRequesting(true);
        onRequestPayout?.();
        setTimeout(() => setIsRequesting(false), 2000);
    };

    const statusColors = {
        pending: 'bg-amber-500/15 text-amber-500',
        processing: 'bg-blue-500/15 text-blue-500',
        completed: 'bg-emerald-500/15 text-emerald-500',
        failed: 'bg-red-500/15 text-red-500',
    };

    const totalPending = payouts
        .filter((p) => p.status === 'pending' || p.status === 'processing')
        .reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-[var(--color-brand-emerald)]" />
                    <h3 className="text-base font-bold text-[var(--color-text-main)]">Payouts</h3>
                </div>
                <Button size="sm" variant="primary" onClick={handleRequestPayout} disabled={isRequesting}>
                    <DollarSign size={12} />
                    <span>{isRequesting ? 'Requesting...' : 'Request Payout'}</span>
                </Button>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-[var(--color-text-muted)]">Available for Payout</p>
                        <p className="text-2xl font-bold text-[var(--color-text-main)]">
                            {totalPending.toLocaleString()} RWF
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                        <DollarSign size={24} className="text-emerald-500" />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                {payouts.length === 0 ? (
                    <p className="text-xs text-[var(--color-text-muted)] text-center py-4">No payouts yet</p>
                ) : (
                    payouts.map((payout) => (
                        <div key={payout.id} className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-3">
                            <div>
                                <p className="text-sm font-bold text-[var(--color-text-main)]">
                                    {payout.amount.toLocaleString()} {payout.currency}
                                </p>
                                <p className="text-[10px] text-[var(--color-text-dim)]">{payout.date} · {payout.method}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[payout.status]}`}>
                                {payout.status}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

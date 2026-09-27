import React, { useState } from 'react';
import { TrendingDown, Bell } from 'lucide-react';
import { Button } from './ui/Button';

interface PriceDropAlertProps {
    listingId: string;
    listingTitle: string;
    currentPrice: number;
    currency?: string;
}

export const PriceDropAlert: React.FC<PriceDropAlertProps> = ({
    listingId,
    listingTitle,
    currentPrice,
    currency = 'RWF',
}) => {
    const [alertSet, setAlertSet] = useState(() => {
        try {
            const stored = localStorage.getItem(`urugwiro_price_alert_${listingId}`);
            return stored === 'true';
        } catch { return false; }
    });

    const toggleAlert = () => {
        const newState = !alertSet;
        setAlertSet(newState);
        try { localStorage.setItem(`urugwiro_price_alert_${listingId}`, String(newState)); } catch {}
    };

    return (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alertSet ? 'bg-emerald-500/15 text-emerald-500' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-dim)]'}`}>
                    <TrendingDown size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text-main)]">Price Drop Alert</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] truncate">
                        {listingTitle} — {currentPrice.toLocaleString()} {currency}
                    </p>
                </div>
                <Button
                    size="sm"
                    variant={alertSet ? 'primary' : 'outline'}
                    onClick={toggleAlert}
                >
                    <Bell size={12} />
                    <span>{alertSet ? 'On' : 'Off'}</span>
                </Button>
            </div>
        </div>
    );
};

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface HistoryEvent {
    date: string;
    event: string;
    price?: number;
    currency?: string;
}

interface PropertyHistoryProps {
    history: HistoryEvent[];
}

export const PropertyHistory: React.FC<PropertyHistoryProps> = ({ history }) => {
    if (history.length === 0) return null;

    return (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <h3 className="text-base font-bold text-[var(--color-text-main)] mb-4">Price History</h3>
            <div className="space-y-3">
                {history.map((event, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-[var(--color-text-main)]">{event.event}</p>
                            <p className="text-[10px] text-[var(--color-text-dim)]">{event.date}</p>
                        </div>
                        {event.price !== undefined && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[var(--color-text-main)]">
                                    {event.price.toLocaleString()} {event.currency || 'RWF'}
                                </span>
                                {idx > 0 && history[idx - 1].price !== undefined && (
                                    event.price < history[idx - 1].price! ? (
                                        <TrendingDown size={12} className="text-red-500" />
                                    ) : event.price > history[idx - 1].price! ? (
                                        <TrendingUp size={12} className="text-emerald-500" />
                                    ) : null
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

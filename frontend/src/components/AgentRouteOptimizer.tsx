import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Route } from 'lucide-react';
import { Button } from './ui/Button';

interface VisitStop {
    id: string;
    address: string;
    title: string;
    scheduledTime: string;
    latitude?: number;
    longitude?: number;
}

interface AgentRouteOptimizerProps {
    visits: VisitStop[];
    onOptimize?: (optimizedOrder: VisitStop[]) => void;
}

export const AgentRouteOptimizer: React.FC<AgentRouteOptimizerProps> = ({ visits, onOptimize }) => {
    const [optimizedOrder, setOptimizedOrder] = useState<VisitStop[]>(visits);
    const [isOptimizing, setIsOptimizing] = useState(false);

    const optimizeRoute = () => {
        setIsOptimizing(true);
        // Simple optimization: sort by time
        // In production, this would use a routing API (Google Maps, Mapbox, etc.)
        const sorted = [...visits].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
        setOptimizedOrder(sorted);
        onOptimize?.(sorted);
        setIsOptimizing(false);
    };

    const totalDistance = '12.5 km'; // Placeholder
    const totalTime = '2h 30m'; // Placeholder

    return (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Route size={18} className="text-[var(--color-brand-emerald)]" />
                    <h3 className="text-base font-bold text-[var(--color-text-main)]">Route Optimizer</h3>
                </div>
                <Button size="sm" variant="outline" onClick={optimizeRoute} disabled={isOptimizing}>
                    <Navigation size={12} />
                    <span>{isOptimizing ? 'Optimizing...' : 'Optimize'}</span>
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-3 text-center">
                    <p className="text-lg font-bold text-[var(--color-text-main)]">{totalDistance}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Total Distance</p>
                </div>
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-3 text-center">
                    <p className="text-lg font-bold text-[var(--color-text-main)]">{totalTime}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Est. Time</p>
                </div>
            </div>

            <div className="space-y-2">
                {optimizedOrder.map((visit, idx) => (
                    <div key={visit.id} className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-3">
                        <div className="w-6 h-6 rounded-full bg-[var(--color-brand-emerald)]/15 flex items-center justify-center text-[10px] font-bold text-[var(--color-brand-emerald)]">
                            {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[var(--color-text-main)] truncate">{visit.title}</p>
                            <p className="text-[10px] text-[var(--color-text-dim)] truncate">{visit.address}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
                            <Clock size={10} />
                            {visit.scheduledTime}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

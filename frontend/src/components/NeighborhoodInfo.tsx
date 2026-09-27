import React from 'react';
import { MapPin, GraduationCap, Bus, ShoppingCart, Trees, Train } from 'lucide-react';

interface NeighborhoodInfoProps {
    address?: string;
    district?: string;
    sector?: string;
}

export const NeighborhoodInfo: React.FC<NeighborhoodInfoProps> = ({
    address,
    district,
    sector,
}) => {
    // In production, this would fetch real neighborhood data
    const amenities = [
        { icon: GraduationCap, label: 'Schools', distance: '0.5 km', count: 3 },
        { icon: Bus, label: 'Bus Stops', distance: '0.2 km', count: 5 },
        { icon: ShoppingCart, label: 'Markets', distance: '0.8 km', count: 2 },
        { icon: Trees, label: 'Parks', distance: '1.2 km', count: 1 },
        { icon: Train, label: 'Transit', distance: '2.5 km', count: 1 },
    ];

    return (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-[var(--color-brand-emerald)]" />
                <h3 className="text-base font-bold text-[var(--color-text-main)]">Neighborhood</h3>
            </div>

            {(address || district || sector) && (
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                    {[address, district, sector].filter(Boolean).join(', ')}
                </p>
            )}

            <div className="space-y-3">
                {amenities.map((amenity) => (
                    <div key={amenity.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <amenity.icon size={14} className="text-[var(--color-text-dim)]" />
                            <span className="text-xs text-[var(--color-text-main)]">{amenity.label}</span>
                        </div>
                        <span className="text-[11px] text-[var(--color-text-muted)]">
                            {amenity.distance} · {amenity.count} place{amenity.count > 1 ? 's' : ''}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--color-border)]">
                <div className="flex justify-between mb-2">
                    <span className="text-xs text-[var(--color-text-muted)]">Walk Score</span>
                    <span className="text-xs font-bold text-emerald-500">78/100</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span className="text-xs text-[var(--color-text-muted)]">Transit Score</span>
                    <span className="text-xs font-bold text-emerald-500">65/100</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-xs text-[var(--color-text-muted)]">Bike Score</span>
                    <span className="text-xs font-bold text-emerald-500">72/100</span>
                </div>
            </div>
        </div>
    );
};

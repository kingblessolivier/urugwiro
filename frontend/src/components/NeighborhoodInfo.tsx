import React from 'react';
import { MapPin, GraduationCap, Bus, ShoppingCart, Trees, Train, Footprints } from 'lucide-react';

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
    const amenities = [
        { icon: GraduationCap, label: 'Schools', distance: '0.5 km', count: 3 },
        { icon: Bus, label: 'Bus Stops', distance: '0.2 km', count: 5 },
        { icon: ShoppingCart, label: 'Markets', distance: '0.8 km', count: 2 },
        { icon: Trees, label: 'Parks', distance: '1.2 km', count: 1 },
        { icon: Train, label: 'Transit', distance: '2.5 km', count: 1 },
    ];

    const scores = [
        { label: 'Walk Score', value: 78, icon: Footprints },
        { label: 'Transit Score', value: 65, icon: Bus },
        { label: 'Bike Score', value: 72, icon: Train },
    ];

    return (
        <div
            className="surface-card oneui-card"
            style={{ padding: '1.5rem' }}
        >
            <div className="flex items-center gap-2.5 mb-5"
              style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}
            >
                <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: 'rgba(5,150,105,0.12)', color: 'var(--color-brand-emerald)' }}
                >
                    <MapPin size={17} />
                </div>
                <h3
                    className="font-display text-xl tracking-tight"
                    style={{ color: 'var(--color-text-main)' }}
                >
                    Neighborhood
                </h3>
            </div>

            {(address || district || sector) && (
                <p className="text-xs font-medium mb-5 break-words"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                    {[address, district, sector].filter(Boolean).join(', ')}
                </p>
            )}

            <div className="space-y-3.5">
                {amenities.map((amenity) => (
                    <div key={amenity.label} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                                style={{ background: 'var(--color-input-bg)', color: 'var(--color-text-dim)' }}
                            >
                                <amenity.icon size={13} />
                            </div>
                            <span className="text-sm font-semibold truncate"
                              style={{ color: 'var(--color-text-main)' }}
                            >
                                {amenity.label}
                            </span>
                        </div>
                        <span className="text-[11px] font-medium whitespace-nowrap shrink-0"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                            {amenity.distance} · {amenity.count} place{amenity.count > 1 ? 's' : ''}
                        </span>
                    </div>
                ))}
            </div>

            <div
                className="mt-6 grid grid-cols-3 gap-3"
                style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}
            >
                {scores.map((s) => (
                    <div
                        key={s.label}
                        className="rounded-xl border p-3 text-center"
                        style={{
                            borderColor: 'rgba(5,150,105,0.2)',
                            background: 'rgba(5,150,105,0.05)',
                        }}
                    >
                        <s.icon
                            size={14}
                            className="mx-auto mb-1.5"
                            style={{ color: 'var(--color-brand-emerald)' }}
                        />
                        <p className="font-mono tabular-nums text-sm font-bold"
                          style={{ color: 'var(--color-brand-emerald)' }}
                        >
                            {s.value}
                        </p>
                        <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em]"
                          style={{ color: 'var(--color-text-dim)' }}
                        >
                            {s.label.replace(' Score', '')}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

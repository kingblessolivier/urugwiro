import React from 'react';
import { BarChart3, Eye, Heart, MessageSquare, TrendingUp } from 'lucide-react';
import { DashboardCard, CardHeader } from './ui/Dashboard';

interface SellerAnalyticsProps {
    viewsCount: number;
    savesCount: number;
    inquiriesCount: number;
    offersCount: number;
}

export const SellerAnalytics: React.FC<SellerAnalyticsProps> = ({
    viewsCount,
    savesCount,
    inquiriesCount,
    offersCount,
}) => {
    const metrics = [
        { label: 'Views', value: viewsCount, icon: Eye, color: 'text-blue-500' },
        { label: 'Saves', value: savesCount, icon: Heart, color: 'text-red-500' },
        { label: 'Inquiries', value: inquiriesCount, icon: MessageSquare, color: 'text-emerald-500' },
        { label: 'Offers', value: offersCount, icon: TrendingUp, color: 'text-amber-500' },
    ];

    return (
        <DashboardCard>
            <CardHeader
                icon={BarChart3}
                title="Listing Analytics"
                subtitle="Performance metrics"
            />
            <div className="p-5">
                <div className="grid grid-cols-2 gap-4">
                    {metrics.map((metric) => (
                        <div key={metric.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <metric.icon size={14} className={metric.color} />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                                    {metric.label}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-[var(--color-text-main)]">
                                {metric.value.toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardCard>
    );
};

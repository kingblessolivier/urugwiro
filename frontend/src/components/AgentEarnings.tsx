import React from 'react';
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { DashboardCard, CardHeader } from './ui/Dashboard';

interface EarningsData {
    totalEarnings: number;
    pendingPayouts: number;
    thisMonth: number;
    lastMonth: number;
    dealsClosed: number;
    commissionRate: number;
}

interface AgentEarningsProps {
    data: EarningsData;
}

export const AgentEarnings: React.FC<AgentEarningsProps> = ({ data }) => {
    const monthChange = data.lastMonth > 0
        ? ((data.thisMonth - data.lastMonth) / data.lastMonth) * 100
        : 0;

    return (
        <DashboardCard>
            <CardHeader
                icon={DollarSign}
                title="Earnings & Commissions"
                subtitle="Your financial summary"
            />
            <div className="p-5">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                                Total Earnings
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-[var(--color-text-main)]">
                            {data.totalEarnings.toLocaleString()} RWF
                        </p>
                    </div>
                    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard size={14} className="text-amber-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                                Pending Payouts
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-[var(--color-text-main)]">
                            {data.pendingPayouts.toLocaleString()} RWF
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[var(--color-text-dim)]" />
                            <span className="text-xs text-[var(--color-text-muted)]">This Month</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[var(--color-text-main)]">
                                {data.thisMonth.toLocaleString()} RWF
                            </span>
                            {monthChange !== 0 && (
                                <span className={`text-[10px] font-bold ${monthChange > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {monthChange > 0 ? '+' : ''}{monthChange.toFixed(1)}%
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[var(--color-text-dim)]" />
                            <span className="text-xs text-[var(--color-text-muted)]">Last Month</span>
                        </div>
                        <span className="text-sm font-bold text-[var(--color-text-main)]">
                            {data.lastMonth.toLocaleString()} RWF
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={14} className="text-[var(--color-text-dim)]" />
                            <span className="text-xs text-[var(--color-text-muted)]">Deals Closed</span>
                        </div>
                        <span className="text-sm font-bold text-[var(--color-text-main)]">
                            {data.dealsClosed}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <DollarSign size={14} className="text-[var(--color-text-dim)]" />
                            <span className="text-xs text-[var(--color-text-muted)]">Commission Rate</span>
                        </div>
                        <span className="text-sm font-bold text-[var(--color-text-main)]">
                            {data.commissionRate}%
                        </span>
                    </div>
                </div>
            </div>
        </DashboardCard>
    );
};

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import {
    TrendingUp, Wallet, ArrowDownRight, ArrowUpRight,
    Landmark, BadgeCheck, Receipt, PieChart, Users
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface OwnerLaunchpadProps {
    onListingClick?: (id: string) => void;
}

const OwnerLaunchpad: React.FC<OwnerLaunchpadProps> = ({ onListingClick }) => {
    const { user } = useAuth();
    const displayName = user?.full_name || user?.first_name || 'Owner';

    // Fetch all necessary data
    const { data: transactionsData, isLoading: isLoadingTx } = useQuery({
        queryKey: ['admin-transactions'],
        queryFn: async () => {
            const res = await api.admin.transactions();
            return Array.isArray(res.data) ? res.data : res.data?.results || [];
        }
    });

    const { data: paymentsData, isLoading: isLoadingPay } = useQuery({
        queryKey: ['admin-seller-payments'],
        queryFn: async () => {
            const res = await api.admin.sellerPayments();
            return Array.isArray(res.data) ? res.data : res.data?.results || [];
        }
    });

    const { data: expensesData, isLoading: isLoadingExp } = useQuery({
        queryKey: ['admin-expenses'],
        queryFn: async () => {
            const res = await api.admin.expenses();
            return Array.isArray(res.data) ? res.data : res.data?.results || [];
        }
    });

    const { data: listingsData, isLoading: isLoadingList } = useQuery({
        queryKey: ['admin-listings'],
        queryFn: async () => {
            const res = await api.listings.list();
            return Array.isArray(res.data) ? res.data : res.data?.results || [];
        }
    });

    const { data: sellersData, isLoading: isLoadingSellers } = useQuery({
        queryKey: ['admin-sellers'],
        queryFn: async () => {
            const res = await api.admin.sellers();
            return Array.isArray(res.data) ? res.data : res.data?.results || [];
        }
    });
    
    const { data: offersData, isLoading: isLoadingOffers } = useQuery({
        queryKey: ['admin-offers'],
        queryFn: async () => {
            const res = await api.admin.offers();
            return Array.isArray(res.data) ? res.data : res.data?.results || [];
        }
    });

    const isLoading = isLoadingTx || isLoadingPay || isLoadingExp || isLoadingList || isLoadingSellers || isLoadingOffers;

    const data = useMemo(() => {
        const transactions = transactionsData || [];
        const payments = paymentsData || [];
        const expenses = expensesData || [];
        const listings = listingsData || [];
        const sellers = sellersData || [];
        const offers = offersData || [];

        // 1. Business KPI Calculations
        const totalRevenue = transactions.reduce((acc: number, t: any) => acc + Number(t.agreed_price || 0), 0);
        const urugwiroEarnings = transactions.reduce((acc: number, t: any) => acc + Number(t.commission_amount || 0), 0);
        const sellerObligations = transactions.reduce((acc: number, t: any) => acc + Number(t.seller_amount || 0), 0);
        
        const paidToSellers = payments
            .filter((p: any) => p.status === 'Paid' || p.status === 'completed')
            .reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0);
            
        const outstandingBalance = sellerObligations - paidToSellers;
        const totalExpenses = expenses.reduce((acc: number, e: any) => acc + Number(e.amount || 0), 0);
        const netProfit = urugwiroEarnings - totalExpenses;
        
        const activeListingsCount = listings.filter((l: any) => l.status === 'active' || l.status === 'published').length;

        // Expense Breakdown
        const expensesByCategory = expenses.reduce((acc: any, e: any) => {
            const cat = e.category || 'Other';
            acc[cat] = (acc[cat] || 0) + Number(e.amount || 0);
            return acc;
        }, {});
        const expenseCategories = Object.keys(expensesByCategory).map(cat => ({
            category: cat,
            amount: expensesByCategory[cat],
            percentage: totalExpenses > 0 ? (expensesByCategory[cat] / totalExpenses) * 100 : 0
        })).sort((a, b) => b.amount - a.amount);

        // Seller Obligations
        const sellerMap = new Map();
        sellers.forEach((s: any) => {
            sellerMap.set(s.id, {
                id: s.id,
                name: s.company_name || s.full_name || `Seller #${s.id}`,
                propertiesSold: 0,
                totalObligation: 0,
                totalPaid: 0,
                outstanding: 0,
                status: 'Pending'
            });
        });

        transactions.forEach((t: any) => {
            const sId = t.seller_id || t.seller?.id;
            if (sId) {
                if (!sellerMap.has(sId)) {
                    sellerMap.set(sId, { id: sId, name: `Seller #${sId}`, propertiesSold: 0, totalObligation: 0, totalPaid: 0, outstanding: 0, status: 'Pending' });
                }
                const s = sellerMap.get(sId);
                s.propertiesSold += 1;
                s.totalObligation += Number(t.seller_amount || 0);
            }
        });

        payments.filter((p: any) => p.status === 'Paid' || p.status === 'completed').forEach((p: any) => {
            const sId = p.seller_id || p.seller?.id;
            if (sId && sellerMap.has(sId)) {
                sellerMap.get(sId).totalPaid += Number(p.amount || 0);
            }
        });

        const sellerObligationsList = Array.from(sellerMap.values())
            .filter(s => s.totalObligation > 0)
            .map(s => {
                s.outstanding = s.totalObligation - s.totalPaid;
                if (s.outstanding <= 0) s.status = 'Paid';
                else if (s.totalPaid > 0) s.status = 'Partially Paid';
                else s.status = 'Pending';
                return s;
            })
            .sort((a, b) => b.outstanding - a.outstanding);

        // Performance
        const avgDealValue = transactions.length > 0 ? totalRevenue / transactions.length : 0;
        const avgCommission = transactions.length > 0 ? urugwiroEarnings / transactions.length : 0;
        const totalPropertiesHandled = listings.length;
        const conversionRate = offers.length > 0 ? (transactions.length / offers.length) * 100 : 0;

        return {
            totalRevenue,
            urugwiroEarnings,
            sellerObligations,
            paidToSellers,
            outstandingBalance,
            totalExpenses,
            netProfit,
            activeListingsCount,
            expensesByCategory: expenseCategories,
            sellerObligationsList,
            avgDealValue,
            avgCommission,
            totalPropertiesHandled,
            conversionRate
        };
    }, [transactionsData, paymentsData, expensesData, listingsData, sellersData, offersData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-[var(--color-text-muted)] animate-pulse">
                Aggregating financial data...
            </div>
        );
    }

    const fmt = (num: number) => Math.round(num).toLocaleString() + ' RWF';

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-[var(--color-text-main)]">Owner Dashboard</h1>
                <p className="text-[var(--color-text-muted)]">Financial overview and business intelligence center.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total Revenue" value={fmt(data.totalRevenue)} icon={Landmark} color="text-green-500" />
                <KPICard title="Urugwiro Earnings" value={fmt(data.urugwiroEarnings)} icon={TrendingUp} color="text-green-400" />
                <KPICard title="Seller Obligations" value={fmt(data.sellerObligations)} icon={Wallet} color="text-amber-500" />
                <KPICard title="Amount Paid to Sellers" value={fmt(data.paidToSellers)} icon={BadgeCheck} color="text-emerald-500" />
                <KPICard title="Outstanding Balance" value={fmt(data.outstandingBalance)} icon={ArrowDownRight} color="text-rose-400" />
                <KPICard title="Total Expenses" value={fmt(data.totalExpenses)} icon={Receipt} color="text-rose-500" />
                <KPICard title="Net Profit" value={fmt(data.netProfit)} icon={ArrowUpRight} color={data.netProfit >= 0 ? "text-green-400" : "text-rose-500"} />
                <KPICard title="Active Listings" value={data.activeListingsCount.toString()} icon={PieChart} color="text-sky-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Financial Overview Table */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
                        <Landmark size={20} className="text-[var(--color-brand-emerald)]" /> Financial Summary
                    </h3>
                    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden backdrop-blur-xl">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Metric</th>
                                    <th className="px-6 py-4 font-semibold text-right">Amount (RWF)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text-main)]">
                                <tr>
                                    <td className="px-6 py-4">Total Transaction Revenue</td>
                                    <td className="px-6 py-4 text-right font-mono text-green-400">{fmt(data.totalRevenue)}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4">Urugwiro Commission Earned</td>
                                    <td className="px-6 py-4 text-right font-mono text-green-400">{fmt(data.urugwiroEarnings)}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4">Seller Obligations</td>
                                    <td className="px-6 py-4 text-right font-mono text-amber-400">{fmt(data.sellerObligations)}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4">Amount Paid to Sellers</td>
                                    <td className="px-6 py-4 text-right font-mono text-emerald-400">{fmt(data.paidToSellers)}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4">Outstanding Seller Payments</td>
                                    <td className="px-6 py-4 text-right font-mono text-rose-400">{fmt(data.outstandingBalance)}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4">Total Expenses</td>
                                    <td className="px-6 py-4 text-right font-mono text-rose-400">{fmt(data.totalExpenses)}</td>
                                </tr>
                                <tr className="bg-[var(--color-bg-elevated)] font-bold">
                                    <td className="px-6 py-4 text-lg">Net Profit</td>
                                    <td className={`px-6 py-4 text-right text-lg font-mono ${data.netProfit >= 0 ? 'text-green-400' : 'text-rose-500'}`}>
                                        {fmt(data.netProfit)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Business Performance & Expenses */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
                            <TrendingUp size={20} className="text-[var(--color-brand-emerald)]" /> Business Performance
                        </h3>
                        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6 backdrop-blur-xl space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[var(--color-text-muted)] text-sm">Avg Deal Value</span>
                                <span className="font-mono font-semibold text-[var(--color-text-main)]">{fmt(data.avgDealValue)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[var(--color-text-muted)] text-sm">Avg Commission / Deal</span>
                                <span className="font-mono font-semibold text-[var(--color-text-main)]">{fmt(data.avgCommission)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[var(--color-text-muted)] text-sm">Offer Conversion Rate</span>
                                <span className="font-mono font-semibold text-[var(--color-text-main)]">{data.conversionRate.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[var(--color-text-muted)] text-sm">Total Properties Handled</span>
                                <span className="font-mono font-semibold text-[var(--color-text-main)]">{data.totalPropertiesHandled}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
                            <Receipt size={20} className="text-[var(--color-brand-emerald)]" /> Expense Breakdown
                        </h3>
                        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6 backdrop-blur-xl space-y-4">
                            {data.expensesByCategory.length === 0 ? (
                                <p className="text-sm text-[var(--color-text-muted)] text-center py-4">No expenses recorded.</p>
                            ) : (
                                data.expensesByCategory.map((exp: any, i: number) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-[var(--color-text-main)] capitalize">{exp.category}</span>
                                            <span className="font-mono text-[var(--color-text-muted)]">{fmt(exp.amount)}</span>
                                        </div>
                                        <div className="w-full bg-[var(--color-bg-elevated)] h-1.5 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-rose-500 h-full rounded-full" 
                                                style={{ width: `${exp.percentage}%` }} 
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Seller Obligations Table */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
                    <Users size={20} className="text-[var(--color-brand-emerald)]" /> Seller Obligations
                </h3>
                <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden backdrop-blur-xl overflow-x-auto">
                    {data.sellerObligationsList.length === 0 ? (
                        <div className="p-8 text-center text-[var(--color-text-muted)]">
                            No seller obligations found.
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Seller</th>
                                    <th className="px-6 py-4 font-semibold text-center">Properties Sold</th>
                                    <th className="px-6 py-4 font-semibold text-right">Total Obligation</th>
                                    <th className="px-6 py-4 font-semibold text-right">Total Paid</th>
                                    <th className="px-6 py-4 font-semibold text-right">Outstanding</th>
                                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text-main)]">
                                {data.sellerObligationsList.map((s: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-[var(--color-bg-card-hover)] transition-colors">
                                        <td className="px-6 py-4 font-medium">{s.name}</td>
                                        <td className="px-6 py-4 text-center">{s.propertiesSold}</td>
                                        <td className="px-6 py-4 text-right font-mono">{fmt(s.totalObligation)}</td>
                                        <td className="px-6 py-4 text-right font-mono text-emerald-400">{fmt(s.totalPaid)}</td>
                                        <td className="px-6 py-4 text-right font-mono text-amber-400">{fmt(s.outstanding)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                s.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                s.status === 'Partially Paid' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                            }`}>
                                                {s.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col gap-3 backdrop-blur-xl hover:border-[var(--color-border-hover)] transition-all">
        <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-[var(--color-text-muted)]">{title}</span>
            <div className={`p-2 rounded-xl bg-[var(--color-bg-elevated)] ${color}`}>
                <Icon size={18} />
            </div>
        </div>
        <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
    </div>
);

export default OwnerLaunchpad;

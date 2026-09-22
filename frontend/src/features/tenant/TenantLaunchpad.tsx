import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { api } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { Building2, FileText, KeyRound, CreditCard, Wrench, ShieldCheck, Mail, Calendar } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const TenantLaunchpad: React.FC = () => {
    const { user } = useAuth();
    const displayName = user?.full_name || user?.username || 'Tenant';

    const { data: tenantData } = useQuery({
        queryKey: ['tenant-dashboard'],
        queryFn: async () => {
            try {
                const response = await api.tenant.dashboard();
                return response.data;
            } catch {
                return null;
            }
        },
        retry: false,
    });

    const metrics = tenantData?.metrics || {
        properties: 0,
        activeLeases: 0,
        totalPaid: 0,
        pendingMaintenance: 0,
    };
    const nextExpiry = tenantData?.nextExpiry;
    const properties = tenantData?.properties || [];
    const payments = tenantData?.payments || [];
    const maintenanceRequests = tenantData?.maintenanceRequests || [];
    const messages = tenantData?.messages || [];
    const leaseCountdowns = tenantData?.leaseCountdowns || [];

    const paymentChartData = {
        labels: ['Jun', 'Jul', 'Aug', 'Sep'],
        datasets: [
            {
                label: 'Payments',
                data: tenantData?.paymentTrends || [0, 0, 0, metrics.totalPaid || 0],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#10b981',
                borderWidth: 2,
            },
        ],
    };

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 bg-[#05070b] min-h-screen text-zinc-100">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-950/30 via-white/[0.02] to-transparent p-8 shadow-2xl backdrop-blur-xl">
                <div className="relative z-10 flex justify-between items-start flex-wrap gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                            <KeyRound size={14} /> Sovereign Resident Terminal
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                            Welcome, <span className="text-emerald-400">{displayName}</span> 👋
                        </h1>
                        <p className="text-zinc-400 text-sm sm:text-base">
                            Your verified tenancy overview — leases, rent payments, and maintenance requests.
                        </p>
                    </div>
                    {nextExpiry?.days_left !== undefined && (
                        <div className="text-right p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Contract Expiry</div>
                            <div className="text-3xl font-bold text-emerald-400 font-mono">{nextExpiry.days_left} days</div>
                            <div className="text-xs text-zinc-500 font-mono mt-0.5">{nextExpiry.end_date}</div>
                        </div>
                    )}
                </div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Assigned Rentals', value: metrics.properties, icon: Building2, color: 'text-sky-400' },
                    { label: 'Active Leases', value: metrics.activeLeases, icon: FileText, color: 'text-emerald-400' },
                    { label: 'Total Paid', value: `${(metrics.totalPaid || 0).toLocaleString()} RWF`, icon: CreditCard, color: 'text-emerald-300' },
                    { label: 'Maintenance Open', value: metrics.pendingMaintenance, icon: Wrench, color: 'text-amber-400' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col items-center text-center hover:border-emerald-500/40 transition-all backdrop-blur-xl">
                            <div className="p-3 rounded-xl bg-white/[0.04] text-emerald-400 mb-2">
                                <Icon size={20} />
                            </div>
                            <div className={`text-xl sm:text-2xl font-bold ${stat.color} font-mono`}>{stat.value}</div>
                            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mt-1">{stat.label}</div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* My Properties */}
                <div className="lg:col-span-12">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden backdrop-blur-xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Building2 size={18} className="text-emerald-400" /> Active Tenancies & Leases
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs sm:text-sm">
                                <thead className="bg-white/[0.01] text-zinc-500 text-[10px] uppercase tracking-wider font-bold border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-4">Property Name</th>
                                        <th className="px-6 py-4">Address / District</th>
                                        <th className="px-6 py-4">Monthly Rent</th>
                                        <th className="px-6 py-4">Unit Specs</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.06]">
                                    {properties.map((p: any, i: number) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4 font-bold text-white">{p.name}</td>
                                            <td className="px-6 py-4 text-zinc-400">{p.address}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 font-mono">
                                                    {Number(p.price || 0).toLocaleString()} RWF
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-400">{p.units || 'Standard Unit'}</td>
                                        </tr>
                                    ))}
                                    {properties.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center text-zinc-500">
                                                <KeyRound size={32} className="mx-auto mb-2 text-zinc-700" />
                                                <p className="font-semibold text-zinc-400">No active rental tenancies found</p>
                                                <p className="text-xs text-zinc-600 mt-1">Once a lease agreement is executed with an owner, details will appear here.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Payment History */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <CreditCard size={18} className="text-emerald-400" /> Rent Payment Ledger
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 h-[260px]">
                                <Line data={paymentChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#71717a' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#71717a' }, grid: { display: false } } } }} />
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Recent Transactions</h4>
                                {payments.map((p: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-white/[0.02] rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-all">
                                        <div>
                                            <div className="text-xs font-bold text-white">{p.date}</div>
                                            <div className="text-[10px] text-zinc-500">{p.property_name}</div>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-400 font-mono">{Number(p.amount || 0).toLocaleString()} RWF</span>
                                    </div>
                                ))}
                                {payments.length === 0 && (
                                    <div className="text-center text-zinc-600 text-xs py-8 border border-dashed border-white/5 rounded-2xl">
                                        No recorded payments in database.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Maintenance & Messages */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Wrench size={16} className="text-emerald-400" /> Maintenance Tickets
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {maintenanceRequests.map((r: any, i: number) => (
                                <div key={i} className="p-3 bg-white/[0.02] rounded-2xl border border-white/10 flex justify-between items-center gap-3">
                                    <div className="overflow-hidden">
                                        <div className="text-xs font-medium text-white truncate">{r.description}</div>
                                        <div className="text-[10px] text-zinc-500">{r.date}</div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                        r.status === 'open' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                        r.status === 'in_progress' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    }`}>
                                        {r.status}
                                    </span>
                                </div>
                            ))}
                            {maintenanceRequests.length === 0 && (
                                <div className="text-center text-zinc-600 text-xs py-6 border border-dashed border-white/5 rounded-2xl">
                                    No open maintenance requests.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Mail size={16} className="text-emerald-400" /> Sovereign Messages
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {messages.map((m: any, i: number) => (
                                <div key={i} className="p-3 bg-white/[0.02] rounded-2xl border border-white/10">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-white">{m.sender}</span>
                                        <span className="text-[10px] text-zinc-500">{m.date}</span>
                                    </div>
                                    <div className="text-xs text-zinc-400 truncate">{m.content}</div>
                                </div>
                            ))}
                            {messages.length === 0 && (
                                <div className="text-center text-zinc-600 text-xs py-6 border border-dashed border-white/5 rounded-2xl">
                                    No unread messages.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenantLaunchpad;

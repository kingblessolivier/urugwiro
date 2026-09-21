import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { api } from '../../api/endpoints';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const TenantLaunchpad: React.FC = () => {
    const { data: tenantData, isLoading } = useQuery({
        queryKey: ['tenant-dashboard'],
        queryFn: async () => {
            const response = await api.tenant.dashboard();
            return response.data;
        },
    });

    if (isLoading || !tenantData) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Tenant Dashboard...</div>;

    const {
        username,
        nextExpiry,
        metrics,
        properties = [],
        payments = [],
        maintenanceRequests = [],
        messages = [],
        leaseCountdowns = []
    } = tenantData;

    const paymentChartData = {
        labels: ['Jun', 'Jul', 'Aug', 'Sep'],
        datasets: [
            {
                label: 'Payments',
                data: tenantData.paymentTrends || [500000, 500000, 500000, 500000],
                borderColor: '#2D5A27',
                backgroundColor: 'rgba(45, 90, 39, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#2D5A27',
                borderWidth: 2,
            },
        ],
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
                <div className="relative z-10 flex justify-between items-start flex-wrap gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Welcome, {username} 👋</h1>
                        <p className="text-zinc-400 text-lg">Your tenant dashboard — account overview and quick actions.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Next contract expires in</div>
                        <div className="text-4xl font-bold text-green-400">{nextExpiry?.days_left} days</div>
                        <div className="text-xs text-zinc-500">on {nextExpiry?.end_date}</div>
                    </div>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                    <button className="px-5 py-2 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2">
                        <span>🏢</span> My Properties
                    </button>
                    <button className="px-5 py-2 bg-zinc-800 text-white font-bold rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-all flex items-center gap-2">
                        <span>📄</span> Contracts
                    </button>
                    <button className="px-5 py-2 bg-zinc-800 text-white font-bold rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-all flex items-center gap-2">
                        <span>💰</span> Make Payment
                    </button>
                    <button className="px-5 py-2 bg-zinc-800 text-white font-bold rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-all flex items-center gap-2">
                        <span>👤</span> Profile
                    </button>
                </div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-500/10 blur-3xl rounded-full pointer-events-none" />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Properties', value: metrics.properties, icon: '🏢', color: 'text-blue-500' },
                    { label: 'Active Leases', value: metrics.activeLeases, icon: '📄', color: 'text-green-500' },
                    { label: 'Total Paid', value: `${metrics.totalPaid.toLocaleString()} RWF`, icon: '💰', color: 'text-emerald-500' },
                    { label: 'Pending Requests', value: metrics.pendingMaintenance, icon: '🛠️', color: 'text-yellow-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl flex flex-col items-center text-center hover:border-zinc-600 transition-all">
                        <div className="text-2xl mb-2">{stat.icon}</div>
                        <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* My Properties */}
                <div className="lg:col-span-12">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-zinc-800">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span>🏢</span> My Properties
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                                    <tr className="border-b border-zinc-800">
                                        <th className="px-6 py-4 font-medium">Property Name</th>
                                        <th className="px-6 py-4 font-medium">Address</th>
                                        <th className="px-6 py-4 font-medium">Rent</th>
                                        <th className="px-6 py-4 font-medium">Units</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {properties.map((p: any, i: number) => (
                                        <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-white">{p.name}</td>
                                            <td className="px-6 py-4 text-sm text-zinc-400">{p.address}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                                                    {p.price} RWF
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-500">{p.units}</td>
                                        </tr>
                                    ))}
                                    {properties.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-10 text-center text-zinc-500">No properties assigned.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Payment History */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span>🏦</span> Payment History
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 h-[300px]">
                                <Line data={paymentChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#71717a' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#71717a' }, grid: { display: false } } } }} />
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">Recent Transactions</h4>
                                {payments.map((p: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-2xl border border-zinc-700 hover:border-zinc-600 transition-all">
                                        <div>
                                            <div className="text-xs font-bold text-white">{p.date}</div>
                                            <div className="text-[10px] text-zinc-500">{p.property_name}</div>
                                        </div>
                                        <span className="text-xs font-bold text-green-400">{p.amount} RWF</span>
                                    </div>
                                ))}
                                {payments.length === 0 && <div className="text-center text-zinc-600 text-xs py-10">No payments yet.</div>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Maintenance & Messages */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span>🛠️</span> Maintenance
                            </h3>
                            <button className="px-3 py-1 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition-all">
                                + New
                            </button>
                        </div>
                        <div className="space-y-4">
                            {maintenanceRequests.map((r: any, i: number) => (
                                <div key={i} className="p-3 bg-zinc-800/50 rounded-2xl border border-zinc-700 flex justify-between items-center gap-3">
                                    <div className="overflow-hidden">
                                        <div className="text-xs font-medium text-white truncate">{r.description}</div>
                                        <div className="text-[10px] text-zinc-500">{r.date}</div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                        r.status === 'open' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                        r.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                        'bg-green-500/10 text-green-400 border-green-500/20'
                                    }`}>
                                        {r.status}
                                    </span>
                                </div>
                            ))}
                            {maintenanceRequests.length === 0 && <div className="text-center text-zinc-600 text-xs py-6">No requests.</div>}
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span>📩</span> Messages
                            </h3>
                            <button className="text-xs text-zinc-500 hover:text-white transition-colors">View All</button>
                        </div>
                        <div className="space-y-4">
                            {messages.map((m: any, i: number) => (
                                <div key={i} className="p-3 bg-zinc-800/50 rounded-2xl border border-zinc-700">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-white">{m.sender}</span>
                                        <span className="text-[10px] text-zinc-500">{m.date}</span>
                                    </div>
                                    <div className="text-xs text-zinc-400 truncate">{m.content}</div>
                                </div>
                            ))}
                            {messages.length === 0 && <div className="text-center text-zinc-600 text-xs py-6">No messages.</div>}
                        </div>
                    </div>
                </div>

                {/* Leases & Expiry */}
                <div className="lg:col-span-12">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-xl">📅</span>
                            <h2 className="text-xl font-bold text-white">Leases & Expiry</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {leaseCountdowns.map((c: any, i: number) => (
                                <div key={i} className="p-6 bg-zinc-800/50 border border-zinc-700 rounded-3xl text-center space-y-2">
                                    <div className="text-sm font-medium text-zinc-400">{c.property_name}</div>
                                    <div className={`text-3xl font-bold ${c.days_left !== null && c.days_left < 30 ? 'text-red-400' : 'text-green-400'}`}>
                                        {c.days_left !== null ? `${c.days_left}d` : 'N/A'}
                                    </div>
                                    <div className="text-xs text-zinc-500">Ends {c.end_date}</div>
                                </div>
                            ))}
                            {leaseCountdowns.length === 0 && <div className="col-span-full text-center text-zinc-600 py-10">No active leases.</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenantLaunchpad;

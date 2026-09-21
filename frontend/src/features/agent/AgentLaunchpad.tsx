import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { api } from '../../api/endpoints';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const AgentLaunchpad: React.FC = () => {
    const { data: dashboardData, isLoading: loadingDashboard } = useQuery({
        queryKey: ['agent-dashboard'],
        queryFn: async () => {
            const response = await api.agent.dashboard();
            return response.data;
        },
    });

    const { data: visits = [], isLoading: loadingVisits } = useQuery({
        queryKey: ['agent-visits'],
        queryFn: async () => {
            const response = await api.agent.visits();
            return response.data;
        },
    });

    const { data: offers = [], isLoading: loadingOffers } = useQuery({
        queryKey: ['agent-offers'],
        queryFn: async () => {
            const response = await api.agent.offers();
            return response.data;
        },
    });

    const { data: properties = [], isLoading: loadingProperties } = useQuery({
        queryKey: ['agent-properties'],
        queryFn: async () => {
            const response = await api.agent.properties();
            return response.data;
        },
    });

    if (loadingDashboard || loadingVisits || loadingOffers || loadingProperties) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Agent Launchpad...</div>;
    }

    const agent = dashboardData;
    const metrics = agent.metrics;

    const statusChartData = {
        labels: ['Active', 'Negotiating', 'Sold'],
        datasets: [
            {
                data: [metrics.active, metrics.negotiating, metrics.sold],
                backgroundColor: ['#2D5A27', '#ff9800', '#1565C0'],
                borderWidth: 0,
                borderRadius: 4,
            },
        ],
    };

    const performanceChartData = {
        labels: ['Assigned', 'Active', 'Deals', 'Reviews'],
        datasets: [
            {
                label: 'Count',
                data: [metrics.assigned, metrics.active, metrics.sold, agent.totalReviews],
                backgroundColor: ['rgba(45, 90, 39, 0.2)', 'rgba(21, 101, 192, 0.2)', 'rgba(255, 152, 0, 0.2)', 'rgba(32, 201, 151, 0.2)'],
                borderColor: ['#2D5A27', '#1565C0', '#ff9800', '#20c997'],
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
                <div className="relative z-10 flex justify-between items-start flex-wrap gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {agent.name} 👋</h1>
                        <p className="text-zinc-400 text-lg">Manage your assigned properties, site visits, and negotiations.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2">
                            <span>📅</span> My Visits
                        </button>
                        <button className="px-5 py-2 bg-zinc-800 text-white font-bold rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-all flex items-center gap-2">
                            <span>🏢</span> Properties
                        </button>
                    </div>
                </div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-500/10 blur-3xl rounded-full pointer-events-none" />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Assigned Properties', value: metrics.assigned, icon: '🏢', color: 'text-blue-500' },
                    { label: 'Active Listings', value: metrics.active, icon: '✅', color: 'text-green-500' },
                    { label: 'Under Negotiation', value: metrics.negotiating, icon: '🤝', color: 'text-yellow-500' },
                    { label: 'Sold', value: metrics.sold, icon: '💰', color: 'text-emerald-500' },
                    { label: 'Rating', value: agent.rating, icon: '⭐', color: 'text-yellow-400' },
                    { label: 'Reviews', value: agent.totalReviews, icon: '💬', color: 'text-zinc-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl flex flex-col items-center text-center hover:border-zinc-600 transition-all">
                        <div className="text-2xl mb-2">{stat.icon}</div>
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>📊</span> Property Status
                        </h3>
                        <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20">Overview</span>
                    </div>
                    <div className="flex-1 relative">
                        <Doughnut data={statusChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#71717a' } } } }} />
                    </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>📈</span> Performance
                        </h3>
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20">Stats</span>
                    </div>
                    <div className="flex-1 relative">
                        <Bar data={performanceChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#71717a' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#71717a' }, grid: { display: false } } } }} />
                    </div>
                </div>
            </div>

            {/* Lists Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Visits */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>📍</span> Upcoming Site Visits
                        </h3>
                        <button className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                            View All <span>→</span>
                        </button>
                    </div>
                    <div className="divide-y divide-zinc-800">
                        {visits.slice(0, 5).map((v: any) => (
                            <div key={v.id} className="p-4 hover:bg-zinc-800/50 transition-all flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">📅</div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-white">{v.property_title}</div>
                                    <div className="text-xs text-zinc-500">{v.date}</div>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold border border-zinc-700">{v.status}</span>
                            </div>
                        ))}
                        {visits.length === 0 && <div className="p-10 text-center text-zinc-500">No upcoming visits</div>}
                    </div>
                </div>

                {/* Recent Offers */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>🤝</span> Recent Offers
                        </h3>
                        <button className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                            View All <span>→</span>
                        </button>
                    </div>
                    <div className="divide-y divide-zinc-800">
                        {offers.slice(0, 5).map((o: any) => (
                            <div key={o.id} className="p-4 hover:bg-zinc-800/50 transition-all flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    o.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
                                    o.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                    'bg-red-500/10 text-red-500'
                                }`}>💰</div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-white">{o.property_title} — {o.amount?.toLocaleString()} Frw</div>
                                    <div className="text-xs text-zinc-500">{o.buyer} · {o.date}</div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    o.status === 'accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    o.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                    {o.status}
                                </span>
                            </div>
                        ))}
                        {offers.length === 0 && <div className="p-10 text-center text-zinc-500">No offers yet</div>}
                    </div>
                </div>
            </div>

            {/* Assigned Properties Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>🏢</span> My Assigned Properties
                    </h3>
                    <button className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                        View All <span>→</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">Title</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Price</th>
                                <th className="px-6 py-4 font-medium">Location</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {properties.slice(0, 5).map((p: any) => (
                                <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-medium text-white">{p.title}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">{p.type}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-green-500">{p.price?.toLocaleString()} Frw</td>
                                    <td className="px-6 py-4 text-sm text-zinc-500">{p.location}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                            p.status === 'listed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            p.status === 'under_negotiation' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-700 transition-colors" title="Schedule Visit">📅</button>
                                            <button className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-700 transition-colors" title="Upload Photos">📷</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {properties.length === 0 && <div className="p-10 text-center text-zinc-500">No properties assigned yet.</div>}
                </div>
            </div>
        </div>
    );
};

export default AgentLaunchpad;

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { api } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { Building2, PlusCircle, CheckCircle2, ShieldCheck, TrendingUp, Layers } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

const OwnerLaunchpad: React.FC = () => {
    const { user } = useAuth();
    const displayName = user?.full_name || user?.username || 'Property Owner';

    const { data: listingsData = [] } = useQuery({
        queryKey: ['owner-listings'],
        queryFn: async () => {
            const response = await api.listings.list();
            return Array.isArray(response.data) ? response.data : [];
        },
    });

    const { data: dealsData = [] } = useQuery({
        queryKey: ['owner-deals'],
        queryFn: async () => {
            const response = await api.deals.list();
            return Array.isArray(response.data) ? response.data : [];
        },
    });

    const totalProperties = listingsData.length;
    const closedDeals = dealsData.filter((d: any) => d.stage === 'closed');
    const inFlightDeals = dealsData.filter((d: any) => d.stage !== 'closed');
    const totalRevenue = closedDeals.reduce((sum: number, d: any) => sum + (Number(d.agreed_price) || 0), 0);

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                labels: { color: '#a1a1aa', font: { family: 'Inter' } },
            },
            tooltip: {
                backgroundColor: '#0a0f18',
                titleColor: '#34d399',
                bodyColor: '#fff',
                cornerRadius: 12,
                padding: 12,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#71717a', font: { family: 'Inter' } },
            },
            x: {
                grid: { display: false },
                ticks: { color: '#71717a', font: { family: 'Inter' } },
            },
        },
    };

    const propertyChartData = {
        labels,
        datasets: [
            {
                label: 'Properties in Portfolio',
                data: [0, 0, 0, 0, 0, 0, 0, 0, totalProperties, 0, 0, 0],
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderColor: '#10b981',
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const revenueChartData = {
        labels,
        datasets: [
            {
                label: 'Conveyance Revenue (RWF)',
                data: [0, 0, 0, 0, 0, 0, 0, 0, totalRevenue, 0, 0, 0],
                borderColor: '#34d399',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
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
                            <ShieldCheck size={14} /> Sovereign Portfolio Cockpit
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                            Welcome, <span className="text-emerald-400">{displayName}</span> 👋
                        </h1>
                        <p className="text-zinc-400 text-sm sm:text-base">
                            Real-time database overview of your listed assets, escrow deposits, and contracts.
                        </p>
                    </div>
                </div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Listed Assets', value: totalProperties, icon: Building2, color: 'text-emerald-400' },
                    { label: 'In-Flight Deals', value: inFlightDeals.length, icon: Layers, color: 'text-sky-400' },
                    { label: 'Completed Conveyances', value: closedDeals.length, icon: CheckCircle2, color: 'text-emerald-300' },
                    { label: 'Realized Volume', value: `${totalRevenue.toLocaleString()} RWF`, icon: TrendingUp, color: 'text-amber-400' },
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

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 h-[380px] flex flex-col backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <Building2 size={16} className="text-emerald-400" /> Portfolio Growth
                        </h3>
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">Active Records</span>
                    </div>
                    <div className="flex-1 relative">
                        <Bar data={propertyChartData} options={chartOpts} />
                    </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 h-[380px] flex flex-col backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <TrendingUp size={16} className="text-emerald-400" /> Revenue Trajectory
                        </h3>
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">Closed Conveyances</span>
                    </div>
                    <div className="flex-1 relative">
                        <Line data={revenueChartData} options={chartOpts} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerLaunchpad;

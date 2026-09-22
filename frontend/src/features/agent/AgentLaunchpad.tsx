import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { api } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { Building2, Calendar, FileText, CheckCircle2, Layers, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const AgentLaunchpad: React.FC = () => {
    const { user } = useAuth();
    const displayName = user?.full_name || user?.username || 'Field Agent';

    const { data: properties = [] } = useQuery({
        queryKey: ['agent-properties'],
        queryFn: async () => {
            const response = await api.listings.list();
            return Array.isArray(response.data) ? response.data : [];
        },
    });

    const { data: visits = [] } = useQuery({
        queryKey: ['agent-visits'],
        queryFn: async () => {
            const response = await api.visits.list();
            return Array.isArray(response.data) ? response.data : [];
        },
    });

    const { data: offers = [] } = useQuery({
        queryKey: ['agent-offers'],
        queryFn: async () => {
            const response = await api.offers.list();
            return Array.isArray(response.data) ? response.data : [];
        },
    });

    const activeListings = properties.filter((p: any) => (p.status || '').toLowerCase() === 'listed' || !p.status);
    const pendingOffers = offers.filter((o: any) => (o.status || '').toLowerCase() === 'pending');
    const confirmedVisits = visits.filter((v: any) => (v.status || '').toLowerCase() === 'confirmed' || (v.status || '').toLowerCase() === 'pending');

    const statusChartData = {
        labels: ['Active Listings', 'Pending Offers', 'Site Visits'],
        datasets: [
            {
                data: [activeListings.length || 1, pendingOffers.length || 0, visits.length || 0],
                backgroundColor: ['#10b981', '#38bdf8', '#fbbf24'],
                borderWidth: 0,
                borderRadius: 4,
            },
        ],
    };

    const performanceChartData = {
        labels: ['Listings', 'Visits', 'Offers'],
        datasets: [
            {
                label: 'Activity Count',
                data: [properties.length, visits.length, offers.length],
                backgroundColor: ['rgba(16, 185, 129, 0.2)', 'rgba(56, 189, 248, 0.2)', 'rgba(251, 191, 36, 0.2)'],
                borderColor: ['#10b981', '#38bdf8', '#fbbf24'],
                borderWidth: 2,
                borderRadius: 8,
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
                            <ShieldCheck size={14} /> Certified Field Broker Cockpit
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                            Welcome back, <span className="text-emerald-400">{displayName}</span> 👋
                        </h1>
                        <p className="text-zinc-400 text-sm sm:text-base">
                            Oversee assigned portfolio assets, schedule physical property inspections, and negotiate sovereign offers.
                        </p>
                    </div>
                </div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Assigned Assets', value: properties.length, icon: Building2, color: 'text-sky-400' },
                    { label: 'Active Listings', value: activeListings.length, icon: CheckCircle2, color: 'text-emerald-400' },
                    { label: 'Scheduled Visits', value: confirmedVisits.length, icon: Calendar, color: 'text-amber-400' },
                    { label: 'Negotiating Offers', value: pendingOffers.length, icon: FileText, color: 'text-emerald-300' },
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

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 h-[380px] flex flex-col backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <Layers size={16} className="text-emerald-400" /> Asset Distribution
                        </h3>
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">Live Pipeline</span>
                    </div>
                    <div className="flex-1 relative flex items-center justify-center">
                        <Doughnut data={statusChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#a1a1aa', font: { family: 'Inter' } } } } }} />
                    </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 h-[380px] flex flex-col backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <Building2 size={16} className="text-emerald-400" /> Operational Volume
                        </h3>
                        <span className="px-2.5 py-0.5 bg-sky-500/10 text-sky-400 text-xs font-bold rounded-full border border-sky-500/20">Real-Time</span>
                    </div>
                    <div className="flex-1 relative">
                        <Bar data={performanceChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#71717a' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#71717a' }, grid: { display: false } } } }} />
                    </div>
                </div>
            </div>

            {/* Assigned Properties Table */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden backdrop-blur-xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <Building2 size={18} className="text-emerald-400" /> Catalog Properties Under Representation
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead className="bg-white/[0.01] text-zinc-500 text-[10px] uppercase tracking-wider font-bold border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">Asset Title</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.06]">
                            {properties.slice(0, 10).map((prop: any) => (
                                <tr key={prop.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 font-bold text-white">{prop.title}</td>
                                    <td className="px-6 py-4 text-zinc-400">{prop.location || prop.district || 'Rwanda'}</td>
                                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                                        {Number(prop.price || 0).toLocaleString()} {prop.currency || 'RWF'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            {prop.verification_level || 'standard'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {properties.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-zinc-500">
                                        <Building2 size={32} className="mx-auto mb-2 text-zinc-700" />
                                        <p className="font-semibold text-zinc-400">No properties assigned</p>
                                        <p className="text-xs text-zinc-600 mt-1">Properties assigned to your agent account will appear here.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AgentLaunchpad;

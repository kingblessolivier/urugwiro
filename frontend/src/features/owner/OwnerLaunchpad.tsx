import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
    LinearScale, BarElement, PointElement, LineElement, Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { api } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import {
    Building2, PlusCircle, CheckCircle2, ShieldCheck, TrendingUp,
    Layers, Clock, FileText, ArrowUpRight, MapPin, AlertCircle,
    Eye, X, ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

interface OwnerLaunchpadProps {
    onListingClick?: (id: string) => void;
}

const OwnerLaunchpad: React.FC<OwnerLaunchpadProps> = ({ onListingClick }) => {
    const { user } = useAuth();
    const displayName = user?.full_name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username) || 'Property Owner';
    const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);

    const { data: ownerDashboard, isLoading } = useQuery({
        queryKey: ['owner-dashboard-live', user?.id],
        queryFn: async () => {
            const response = await api.owner.dashboard();
            return response.data;
        },
    });

    // Show loading state while fetching dashboard data
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-zinc-400">
                Loading dashboard…
            </div>
        );
    }

    const metrics = ownerDashboard?.metrics || {
        total_properties: 0,
        in_flight_deals: 0,
        closed_deals: 0,
        total_revenue: 0,
        active_leases: 0,
        currency: 'RWF',
    };

    const timeline = ownerDashboard?.timeline || {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        properties_curve: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        revenue_curve: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };

    const listings = ownerDashboard?.listings || [];
    const recentDeals = ownerDashboard?.recent_deals || [];

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
        labels: timeline.labels,
        datasets: [
            {
                label: 'Portfolio Asset Trajectory',
                data: timeline.properties_curve,
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderColor: '#10b981',
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const revenueChartData = {
        labels: timeline.labels,
        datasets: [
            {
                label: 'Settled Conveyance Volume (RWF)',
                data: timeline.revenue_curve,
                borderColor: '#34d399',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
            },
        ],
    };

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 bg-[#05070b] min-h-screen text-zinc-100 animate-in fade-in duration-300">
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
                            Real-time database overview of your listed assets, escrow deposits, and verified contracts.
                        </p>
                    </div>
                </div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Listed Assets', value: metrics.total_properties, icon: Building2, color: 'text-emerald-400' },
                    { label: 'In-Flight Deals', value: metrics.in_flight_deals, icon: Layers, color: 'text-sky-400' },
                    { label: 'Active Leases', value: metrics.active_leases, icon: FileText, color: 'text-emerald-300' },
                    { label: 'Realized Conveyance', value: `${(metrics.total_revenue || 0).toLocaleString()} ${metrics.currency}`, icon: TrendingUp, color: 'text-amber-400' },
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
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">Active Database Records</span>
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

            {/* Portfolio Assets Table & Zero-State */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Building2 size={18} className="text-emerald-400" /> Portfolio Assets Overview
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1">Real-time cadastral registry of your listed and managed assets.</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-zinc-300">
                        {listings.length} registered
                    </span>
                </div>

                {listings.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-zinc-500">
                            <Building2 size={32} />
                        </div>
                        <h4 className="text-base font-bold text-white">No Assets Registered in Portfolio</h4>
                        <p className="text-xs text-zinc-400 max-w-md">
                            You currently have zero properties in your portfolio. Onboard an asset or register a verified title deed to view real-time conveyance metrics.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {listings.slice((page - 1) * pageSize, page * pageSize).map((l: any) => (
                                <div
                                    key={l.id}
                                    onClick={() => setSelectedAsset(l)}
                                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex gap-4 items-center hover:border-emerald-500/30 transition-all cursor-pointer group"
                                >
                                    <img
                                        src={l.image || '/images/hero/house.jpg'}
                                        alt={l.title}
                                        className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <h5 className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{l.title}</h5>
                                        <p className="text-xs font-mono text-emerald-400 font-semibold mt-0.5">
                                            {Number(l.price).toLocaleString()} {l.currency}
                                        </p>
                                        <div className="flex items-center justify-between gap-2 mt-2 text-[10px] text-zinc-400">
                                            <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 uppercase">
                                                {l.purpose === 'rent' ? 'For Rent' : 'For Sale'}
                                            </span>
                                            <span className="text-emerald-400 font-medium capitalize flex items-center gap-1">
                                                <Eye size={11} /> Inspect
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {listings.length > 0 && (
                            <div className="pt-2">
                                <Pagination
                                    currentPage={page}
                                    totalPages={Math.max(1, Math.ceil(listings.length / pageSize))}
                                    onPageChange={setPage}
                                    pageSize={pageSize}
                                    onPageSizeChange={(sz) => { setPageSize(sz); setPage(1); }}
                                    totalItems={listings.length}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Asset Inspection Dossier Modal */}
            {selectedAsset && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
                    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#080c14] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between border-b border-white/10 pb-4">
                            <div>
                                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider mb-2">
                                    <Building2 size={12} /> Asset Dossier
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    {selectedAsset.title}
                                </h3>
                                <p className="text-xs text-zinc-400 mt-0.5">Asset ID: #{selectedAsset.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedAsset(null)}
                                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {selectedAsset.image && (
                            <div className="rounded-2xl overflow-hidden h-48 w-full border border-white/10">
                                <img
                                    src={selectedAsset.image}
                                    alt={selectedAsset.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
                                    <span className="text-zinc-500 text-[10px] block font-bold uppercase tracking-wider">Asset Valuation</span>
                                    <span className="text-lg font-mono font-bold text-emerald-400 mt-1 block">
                                        {Number(selectedAsset.price).toLocaleString()} {selectedAsset.currency || 'RWF'}
                                    </span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
                                    <span className="text-zinc-500 text-[10px] block font-bold uppercase tracking-wider">Purpose & Model</span>
                                    <span className="text-sm font-semibold text-white mt-1 block capitalize">
                                        {selectedAsset.purpose === 'rent' ? 'Rental Lease' : 'Outright Sale'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
                                    <span className="text-zinc-500 text-[10px] block font-bold uppercase tracking-wider">Registry Status</span>
                                    <span className="text-sm font-semibold text-emerald-400 mt-1 block capitalize">
                                        {selectedAsset.status || 'Active'}
                                    </span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
                                    <span className="text-zinc-500 text-[10px] block font-bold uppercase tracking-wider">Cadastre UPI</span>
                                    <span className="text-sm font-mono font-semibold text-zinc-300 mt-1 block">
                                        {selectedAsset.upi_number || 'Registered In Vault'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                            {onListingClick && (
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        onListingClick(String(selectedAsset.id));
                                        setSelectedAsset(null);
                                    }}
                                    className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer"
                                >
                                    <ExternalLink size={13} /> View on Marketplace
                                </Button>
                            )}
                            <button
                                type="button"
                                onClick={() => setSelectedAsset(null)}
                                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer ml-auto"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerLaunchpad;

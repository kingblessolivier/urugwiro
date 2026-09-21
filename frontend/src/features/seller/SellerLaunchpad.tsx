import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { api } from '../../api/endpoints';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const SellerLaunchpad: React.FC = () => {
    const { data: sellerData, isLoading: loadingDashboard } = useQuery({
        queryKey: ['seller-dashboard'],
        queryFn: async () => {
            const response = await api.seller.dashboard();
            return response.data;
        },
    });

    const { data: properties = [], isLoading: loadingProperties } = useQuery({
        queryKey: ['seller-properties'],
        queryFn: async () => {
            // This endpoint might be the same as dashboard or a separate one
            // For now using dashboard data if properties are included, or specific endpoint if available
            // Since api.seller.dashboard() likely returns the summary, let's assume properties are there or we call a list
            const response = await api.seller.dashboard();
            return response.data.properties || [];
        },
    });

    if (loadingDashboard || loadingProperties) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Seller Launchpad...</div>;

    const metrics = sellerData.metrics;

    const listingChartData = {
        labels: ['Listed', 'Negotiating', 'Sold'],
        datasets: [
            {
                data: [metrics.listed, metrics.negotiating, metrics.sold],
                backgroundColor: ['#2D5A27', '#ff9800', '#1565C0'],
                borderWidth: 0,
                borderRadius: 4,
            },
        ],
    };

    const offersChartData = {
        labels: ['Total Offers', 'Pending', 'Inquiries'],
        datasets: [
            {
                label: 'Count',
                data: [metrics.totalOffers, metrics.pendingOffers, metrics.inquiries],
                backgroundColor: ['rgba(45, 90, 39, 0.2)', 'rgba(255, 152, 0, 0.2)', 'rgba(106, 27, 154, 0.2)'],
                borderColor: ['#2D5A27', '#ff9800', '#6A1B9A'],
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
                        <h1 className="text-4xl font-bold text-white mb-2">Welcome, {sellerData.name} 👋</h1>
                        <p className="text-zinc-400 text-lg">Manage your property listings, view offers, and track inquiries.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2">
                            <span>➕</span> List Property
                        </button>
                        <button className="px-5 py-2 bg-zinc-800 text-white font-bold rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-all flex items-center gap-2">
                            <span>🤝</span> View Offers
                        </button>
                    </div>
                </div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-500/10 blur-3xl rounded-full pointer-events-none" />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Listed Properties', value: metrics.listed, icon: '🏠', color: 'text-blue-500' },
                    { label: 'Negotiating', value: metrics.negotiating, icon: '🤝', color: 'text-yellow-500' },
                    { label: 'Sold', value: metrics.sold, icon: '💰', color: 'text-green-500' },
                    { label: 'Total Offers', value: metrics.totalOffers, icon: '🏷️', color: 'text-emerald-500' },
                    { label: 'Pending Offers', value: metrics.pendingOffers, icon: '⏳', color: 'text-orange-500' },
                    { label: 'Inquiries', value: metrics.inquiries, icon: '💬', color: 'text-zinc-400' },
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
                            <span>📊</span> Listing Overview
                        </h3>
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20">Status</span>
                    </div>
                    <div className="flex-1 relative">
                        <Doughnut data={listingChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#71717a' } } } }} />
                    </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>📈</span> Offers & Inquiries
                        </h3>
                        <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20">Summary</span>
                    </div>
                    <div className="flex-1 relative">
                        <Bar data={offersChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#71717a' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#71717a' }, grid: { display: false } } } }} />
                    </div>
                </div>
            </div>

            {/* My Listings Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🏢</span>
                        <h2 className="text-xl font-bold text-white">My Listings</h2>
                    </div>
                    <button className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                        <span className="text-lg">➕</span> Add New
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                            <tr className="border-b border-zinc-800">
                                <th className="px-6 py-4 font-medium">Image</th>
                                <th className="px-6 py-4 font-medium">Title</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Price</th>
                                <th className="px-6 py-4 font-medium">Location</th>
                                <th className="px-6 py-4 font-medium">Agent</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Views</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {properties.map((p: any) => (
                                <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        {p.image ? (
                                            <img src={p.image} alt="" className="w-12 h-12 rounded-lg object-cover border border-zinc-700" />
                                        ) : (
                                            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 border border-zinc-700">🖼️</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <a href="#" className="text-sm font-bold text-green-500 hover:underline">{p.title}</a>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">{p.type}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-white">{p.price?.toLocaleString()} Frw</td>
                                    <td className="px-6 py-4 text-sm text-zinc-500">{p.location}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-300">{p.agent}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                            p.status === 'listed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            p.status === 'under_negotiation' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-500">{p.views}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-700 transition-colors" title="Edit">✏️</button>
                                            <button className="p-2 bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-lg border border-zinc-700 transition-colors" title="Delete">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {properties.length === 0 && (
                            <tbody>
                                <tr>
                                    <td colSpan={10} className="p-10 text-center text-zinc-500">No listings found.</td>
                                </tr>
                            </tbody>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SellerLaunchpad;
/*

        datasets: [
            {
                data: [sellerData.metrics.listed, sellerData.metrics.negotiating, sellerData.metrics.sold],
                backgroundColor: ['#2D5A27', '#ff9800', '#1565C0'],
                borderWidth: 0,
                borderRadius: 4,
            },
        ],
    };

    const offersChartData = {
        labels: ['Total Offers', 'Pending', 'Inquiries'],
        datasets: [
            {
                label: 'Count',
                data: [sellerData.metrics.totalOffers, sellerData.metrics.pendingOffers, sellerData.metrics.inquiries],
                backgroundColor: ['rgba(45, 90, 39, 0.2)', 'rgba(255, 152, 0, 0.2)', 'rgba(106, 27, 154, 0.2)'],
                borderColor: ['#2D5A27', '#ff9800', '#6A1B9A'],
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Seller Launchpad...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Hero Section * /}
            <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
                <div className="relative z-10 flex justify-between items-start flex-wrap gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Welcome, {sellerData.name} 👋</h1>
                        <p className="text-zinc-400 text-lg">Manage your property listings, view offers, and track inquiries.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2">
                            <span>➕</span> List Property
                        </button>
                        <button className="px-5 py-2 bg-zinc-800 text-white font-bold rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-all flex items-center gap-2">
                            <span>🤝</span> View Offers
                        </button>
                    </div>
                </div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-500/10 blur-3xl rounded-full pointer-events-none" />
            </div>

            {/* Metrics Grid * /}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Listed Properties', value: sellerData.metrics.listed, icon: '🏠', color: 'text-blue-500' },
                    { label: 'Negotiating', value: sellerData.metrics.negotiating, icon: '🤝', color: 'text-yellow-500' },
                    { label: 'Sold', value: sellerData.metrics.sold, icon: '💰', color: 'text-green-500' },
                    { label: 'Total Offers', value: sellerData.metrics.totalOffers, icon: '🏷️', color: 'text-emerald-500' },
                    { label: 'Pending Offers', value: sellerData.metrics.pendingOffers, icon: '⏳', color: 'text-orange-500' },
                    { label: 'Inquiries', value: sellerData.metrics.inquiries, icon: '💬', color: 'text-zinc-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl flex flex-col items-center text-center hover:border-zinc-600 transition-all">
                        <div className="text-2xl mb-2">{stat.icon}</div>
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row * /}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>📊</span> Listing Overview
                        </h3>
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20">Status</span>
                    </div>
                    <div className="flex-1 relative">
                        <Doughnut data={listingChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#71717a' } } } }} />
                    </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>📈</span> Offers & Inquiries
                        </h3>
                        <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20">Summary</span>
                    </div>
                    <div className="flex-1 relative">
                        <Bar data={offersChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#71717a' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#71717a' }, grid: { display: false } } } }} />
                    </div>
                </div>
            </div>

            {/* My Listings Table * /}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🏢</span>
                        <h2 className="text-xl font-bold text-white">My Listings</h2>
                    </div>
                    <button className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                        <span className="text-lg">➕</span> Add New
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                            <tr className="border-b border-zinc-800">
                                <th className="px-6 py-4 font-medium">Image</th>
                                <th className="px-6 py-4 font-medium">Title</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Price</th>
                                <th className="px-6 py-4 font-medium">Location</th>
                                <th className="px-6 py-4 font-medium">Agent</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Views</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {properties.map(p => (
                                <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        {p.image ? (
                                            <img src={p.image} alt="" className="w-12 h-12 rounded-lg object-cover border border-zinc-700" />
                                        ) : (
                                            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 border border-zinc-700">🖼️</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <a href="#" className="text-sm font-bold text-green-500 hover:underline">{p.title}</a>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">{p.type}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-white">{p.price.toLocaleString()} Frw</td>
                                    <td className="px-6 py-4 text-sm text-zinc-500">{p.location}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-300">{p.agent}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                            p.status === 'listed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            p.status === 'under_negotiation' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-500">{p.views}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-700 transition-colors" title="Edit">✏️</button>
                                            <button className="p-2 bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-lg border border-zinc-700 transition-colors" title="Delete">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {properties.length === 0 && (
                        <div className="p-10 text-center text-zinc-500">No listings found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerLaunchpad;
*/

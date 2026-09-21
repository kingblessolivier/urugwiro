import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { api } from '../../api/endpoints';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

const OwnerLaunchpad: React.FC = () => {
    const { data: ownerData, isLoading } = useQuery({
        queryKey: ['owner-dashboard'],
        queryFn: async () => {
            const response = await api.owner.dashboard();
            return response.data;
        },
    });

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                labels: { color: '#71717a', font: { family: 'Inter' } },
            },
            tooltip: {
                backgroundColor: '#162a1c',
                titleColor: '#6ddf74',
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

    if (isLoading || !ownerData) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Owner Launchpad...</div>;

    const metrics = ownerData.metrics;

    const propertyChartData = {
        labels,
        datasets: [
            {
                label: 'Properties Added',
                data: ownerData.propertyTrends || [5, 3, 2, 7, 10, 5, 8, 3, 6, 9, 2, 5],
                backgroundColor: 'rgba(45, 90, 39, 0.12)',
                borderColor: '#2D5A27',
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const contractChartData = {
        labels,
        datasets: [
            {
                label: 'Designed',
                data: ownerData.contractTrends?.designed || [2, 4, 1, 3, 5, 2, 4, 1, 3, 5, 2, 4],
                borderColor: '#2D5A27',
                borderWidth: 2,
                tension: 0.4,
                fill: false,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#2D5A27',
            },
            {
                label: 'Accepted',
                data: ownerData.contractTrends?.accepted || Array(12).fill(metrics.contractsAccepted),
                borderColor: '#20c997',
                borderWidth: 2,
                tension: 0.4,
                fill: false,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#20c997',
            },
            {
                label: 'Signed',
                data: ownerData.contractTrends?.signed || Array(12).fill(metrics.contractsSigned),
                borderColor: '#ff9800',
                borderWidth: 2,
                tension: 0.4,
                fill: false,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#ff9800',
            },
        ],
    };

    const revenueChartData = {
        labels,
        datasets: [
            {
                label: 'Revenue',
                data: ownerData.revenueTrends || [2000, 3000, 1500, 4000, 5000, 2500, 3500, 1000, 4500, 5500, 3000, 2000],
                backgroundColor: 'rgba(45, 90, 39, 0.12)',
                borderColor: '#2D5A27',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#2D5A27',
            },
        ],
    };

    const tenantChartData = {
        labels,
        datasets: [
            {
                label: 'Tenants',
                data: ownerData.tenantTrends || [2, 3, 1, 4, 5, 2, 3, 1, 4, 5, 2, 3],
                backgroundColor: 'rgba(32, 201, 151, 0.15)',
                borderColor: '#20c997',
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
                        <h1 className="text-4xl font-bold text-white mb-2">Welcome, {ownerData.username} 👋</h1>
                        <p className="text-zinc-400 text-lg">Here's an overview of your properties, contracts, and revenue.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2">
                            <span>➕</span> Add Property
                        </button>
                    </div>
                </div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-500/10 blur-3xl rounded-full pointer-events-none" />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Total Properties', value: metrics.totalProperties, icon: '🏢', color: 'text-blue-500' },
                    { label: 'Designed Contracts', value: metrics.contractsDesigned, icon: '📄', color: 'text-green-500' },
                    { label: 'Accepted Contracts', value: metrics.contractsAccepted, icon: '✅', color: 'text-emerald-500' },
                    { label: 'Signed Contracts', value: metrics.contractsSigned, icon: '✍️', color: 'text-yellow-500' },
                    { label: 'Total Revenue', value: `${metrics.revenue.toLocaleString()} RWF`, icon: '💰', color: 'text-green-400' },
                    { label: 'Tenants', value: metrics.tenants, icon: '👥', color: 'text-zinc-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl flex flex-col items-center text-center hover:border-zinc-600 transition-all">
                        <div className="text-2xl mb-2">{stat.icon}</div>
                        <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>📊</span> Properties Added
                        </h3>
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20">Monthly</span>
                    </div>
                    <div className="flex-1 relative">
                        <Bar data={propertyChartData} options={chartOpts} />
                    </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>📈</span> Contracts Overview
                        </h3>
                        <span className="px-3 py-1 bg-zinc-500/10 text-zinc-400 text-xs font-bold rounded-full border border-zinc-500/20">Monthly</span>
                    </div>
                    <div className="flex-1 relative">
                        <Line data={contractChartData} options={chartOpts} />
                    </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>💰</span> Revenue Trend
                        </h3>
                        <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20">Monthly</span>
                    </div>
                    <div className="flex-1 relative">
                        <Line data={revenueChartData} options={chartOpts} />
                    </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>👥</span> Tenants Over Time
                        </h3>
                        <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/20">Monthly</span>
                    </div>
                    <div className="flex-1 relative">
                        <Bar data={tenantChartData} options={chartOpts} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerLaunchpad;

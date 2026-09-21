import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import apiClient from '../../api/client';

interface MaintenanceRequest {
    id: number;
    title: string;
    property_name: string;
    tenant_name: string;
    request_date: string;
    completion_date?: string;
    description: string;
    status: 'open' | 'in_progress' | 'completed';
}

interface Stat {
    label: string;
    value: number;
    icon: string;
    color: string;
}

const AdminMaintenance: React.FC = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'all' | 'open' | 'in_progress' | 'completed'>('all');
    const [search, setSearch] = useState('');

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['admin-maintenance'],
        queryFn: async () => {
            const response = await api.admin.maintenance();
            return response.data;
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: number, status: MaintenanceRequest['status'] }) => {
            return apiClient.patch(`/admin/maintenance/${id}/`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-maintenance'] });
        },
    });

    const updateStatus = (id: number, newStatus: MaintenanceRequest['status']) => {
        updateStatusMutation.mutate({ id, status: newStatus });
    };

    const stats: Stat[] = [
        { label: 'Total', value: requests.length, icon: '🛠️', color: 'text-blue-500' },
        { label: 'Open', value: requests.filter(r => r.status === 'open').length, icon: '🔴', color: 'text-red-500' },
        { label: 'In Progress', value: requests.filter(r => r.status === 'in_progress').length, icon: '⏳', color: 'text-yellow-500' },
        { label: 'Completed', value: requests.filter(r => r.status === 'completed').length, icon: '✅', color: 'text-green-500' },
    ];

    const filteredRequests = requests.filter(r =>
        (activeTab === 'all' || r.status === activeTab) &&
        (r.title.toLowerCase().includes(search.toLowerCase()) ||
         r.property_name.toLowerCase().includes(search.toLowerCase()) ||
         r.tenant_name.toLowerCase().includes(search.toLowerCase()))
    );

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Maintenance Requests...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🛠️</span>
                    <h1 className="text-3xl font-bold text-white">Maintenance Requests</h1>
                </div>
                <button className="px-6 py-2 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all">
                    + Log Maintenance
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center gap-4 hover:border-zinc-600 transition-all">
                        <div className="text-3xl">{stat.icon}</div>
                        <div>
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                            <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
                <div className="relative max-w-md">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
                    <input
                        type="text"
                        className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                        placeholder="Search requests, properties or tenants..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabbed Content */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="flex border-b border-zinc-800 bg-zinc-900/50">
                    {(['all', 'open', 'in_progress', 'completed'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
                                activeTab === tab
                                ? 'text-white border-b-2 border-green-500 bg-zinc-800/50'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            {tab === 'in_progress' ? 'In Progress' : tab}
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                                tab === 'open' ? 'bg-red-500/20 text-red-400' :
                                tab === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                                tab === 'completed' ? 'bg-green-500/20 text-green-400' :
                                'bg-zinc-700 text-zinc-300'
                            }`}>
                                {tab === 'all' ? requests.length : requests.filter(r => r.status === tab).length}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">Request</th>
                                <th className="px-6 py-4 font-medium">Property / Tenant</th>
                                <th className="px-6 py-4 font-medium">Dates</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredRequests.map((r) => (
                                <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-lg border border-zinc-700">🛠️</div>
                                            <div>
                                                <div className="text-sm font-medium text-white">{r.title}</div>
                                                <div className="text-xs text-zinc-500 truncate max-w-xs">{r.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-zinc-300">🏢 {r.property_name}</div>
                                        <div className="text-xs text-zinc-500">👤 {r.tenant_name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-zinc-400">
                                        <div>Submitted: {r.request_date}</div>
                                        {r.completion_date && <div className="text-green-500">Done: {r.completion_date}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${
                                            r.status === 'open' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                            r.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                            'bg-green-500/20 text-green-400 border-green-500/30'
                                        }`}>
                                            {r.status === 'in_progress' ? 'In Progress' : r.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <select
                                                value={r.status}
                                                onChange={(e) => updateStatus(r.id, e.target.value as any)}
                                                className="bg-zinc-800 text-xs text-white border border-zinc-700 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-green-500"
                                            >
                                                <option value="open">Open</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                            <button className="p-2 text-zinc-400 hover:text-red-400 transition-colors" title="Delete">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredRequests.length === 0 && (
                        <div className="p-10 text-center text-zinc-500">No maintenance requests found for this tab.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMaintenance;

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';

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

const OwnerMaintenance: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['owner-maintenance'],
        queryFn: async () => {
            const response = await api.owner.maintenance();
            return response.data;
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, status }: { id: number, status: MaintenanceRequest['status'] }) => {
            return api.owner.updateMaintenance(id.toString(), status);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['owner-maintenance'] });
        },
    });

    const updateStatus = (id: number, newStatus: MaintenanceRequest['status']) => {
        updateMutation.mutate({ id, status: newStatus });
    };

    const stats: Stat[] = [
        { label: 'Total Requests', value: requests.length, icon: '🛠️', color: 'text-blue-500' },
        { label: 'Active Issues', value: requests.filter(r => r.status !== 'completed').length, icon: '⚠️', color: 'text-yellow-500' },
    ];

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Maintenance Requests...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🛠️</span>
                    <h1 className="text-3xl font-bold text-white">Maintenance Requests</h1>
                </div>
                <button className="px-5 py-2 bg-zinc-800 text-white font-bold rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-all flex items-center gap-2">
                    <span>📊</span> Dashboard
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
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

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>📋</span> Requests for Your Properties
                    </h2>
                </div>
                <div className="divide-y divide-zinc-800">
                    {requests.map(r => (
                        <div key={r.id} className="p-6 hover:bg-zinc-800/30 transition-all flex items-center justify-between gap-6 group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-lg shadow-lg">🛠️</div>
                                <div className="space-y-1">
                                    <div className="text-sm font-bold text-white">{r.title}</div>
                                    <div className="text-xs text-zinc-400 flex items-center gap-3">
                                        <span>🏢 {r.property_name}</span>
                                        <span>👤 {r.tenant_name}</span>
                                    </div>
                                    <div className="text-[10px] text-zinc-500">
                                        Submitted: {r.request_date} {r.completion_date && ` · Completed: ${r.completion_date}`}
                                    </div>
                                    {r.description && <div className="text-xs text-zinc-400 italic mt-1">"{r.description}"</div>}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${
                                    r.status === 'open' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                    r.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                    'bg-green-500/20 text-green-400 border-green-500/30'
                                }`}>
                                    {r.status === 'in_progress' ? 'In Progress' : r.status}
                                </span>
                                <select
                                    value={r.status}
                                    onChange={(e) => updateStatus(r.id, e.target.value as any)}
                                    className="bg-zinc-800 text-xs text-white border border-zinc-700 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-green-500"
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>
                    ))}
                    {requests.length === 0 && (
                        <div className="p-10 text-center text-zinc-500">No maintenance requests for your properties.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OwnerMaintenance;

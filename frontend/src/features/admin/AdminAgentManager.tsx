import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import apiClient from '../../api/client';

interface Stat {
    label: string;
    value: string | number;
    icon: string;
    color: string;
}

const AdminAgentManager: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: agents = [], isLoading } = useQuery({
        queryKey: ['admin-agents'],
        queryFn: async () => {
            const response = await api.admin.agents();
            return response.data;
        },
    });

    const toggleVerifyMutation = useMutation({
        mutationFn: async ({ id, is_verified }: { id: number, is_verified: boolean }) => {
            return apiClient.patch(`/admin/agents/${id}/`, { is_verified });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-agents'] });
        },
    });

    const toggleVerify = (id: number, currentStatus: boolean) => {
        toggleVerifyMutation.mutate({ id, is_verified: !currentStatus });
    };

    const stats: Stat[] = [
        { label: 'Total Agents', value: agents.length, icon: '🛡️', color: 'bg-green-500/10 text-green-500' },
        { label: 'Verified', value: agents.filter(a => a.is_verified).length, icon: '✅', color: 'bg-blue-500/10 text-blue-500' },
        { label: 'Pending', value: agents.filter(a => !a.is_verified).length, icon: '⏳', color: 'bg-yellow-500/10 text-yellow-500' },
    ];

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Agents...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">💼</span>
                    <h1 className="text-3xl font-bold text-white">Agent Management</h1>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center gap-4 hover:border-zinc-600 transition-all">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Agents Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white">All Agents</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">Agent</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Phone</th>
                                <th className="px-6 py-4 font-medium">Specialization</th>
                                <th className="px-6 py-4 font-medium">License</th>
                                <th className="px-6 py-4 font-medium">Rating</th>
                                <th className="px-6 py-4 font-medium">Deals</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {agents.map(agent => (
                                <tr key={agent.id} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {agent.image ? (
                                                <img src={agent.image} alt="" className="w-9 h-9 rounded-full object-cover border border-zinc-700" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-700">👤</div>
                                            )}
                                            <div className="text-sm font-medium text-white">{agent.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-300">{agent.email}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-300">{agent.phone}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-300">{agent.specialization || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-300">{agent.license_number || '-'}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-yellow-500">★ {agent.rating}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-300">{agent.total_deals}</td>
                                    <td className="px-6 py-4">
                                        {agent.is_verified ? (
                                            <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 rounded border border-green-500/30 uppercase">Verified</span>
                                        ) : (
                                            <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30 uppercase">Pending</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => toggleVerify(agent.id, agent.is_verified)}
                                                className={`p-2 rounded-lg transition-colors ${agent.is_verified ? 'text-red-400 hover:bg-red-500/10' : 'text-green-400 hover:bg-green-500/10'}`}
                                                title={agent.is_verified ? 'Unverify' : 'Verify'}
                                            >
                                                {agent.is_verified ? '🚫' : '✅'}
                                            </button>
                                            <button className="p-2 text-zinc-400 hover:text-white transition-colors" title="View Profile">
                                                👁️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {agents.length === 0 && (
                        <div className="p-10 text-center text-zinc-500">No agents registered yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAgentManager;

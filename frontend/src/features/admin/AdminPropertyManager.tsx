import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import apiClient from '../../api/client';

interface Stat {
    label: string;
    value: string | number;
    icon: string;
    color: string;
}

const AdminPropertyManager: React.FC = () => {
    const queryClient = useQueryClient();
    const [assigningAgentId, setAssigningAgentId] = useState<number | null>(null);

    const { data: properties = [], isLoading } = useQuery({
        queryKey: ['admin-properties'],
        queryFn: async () => {
            const response = await api.admin.properties();
            return response.data;
        },
    });

    const assignAgentMutation = useMutation({
        mutationFn: async ({ propertyId, agentId }: { propertyId: number, agentId: string }) => {
            return apiClient.patch(`/admin/properties/${propertyId}/assign-agent/`, { agent_id: agentId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
            setAssigningAgentId(null);
        },
    });

    const stats: Stat[] = [
        { label: 'Total Listings', value: properties.length, icon: '🏠', color: 'bg-green-500/10 text-green-500' },
        { label: 'Active', value: properties.filter(p => p.status === 'listed').length, icon: '✅', color: 'bg-blue-500/10 text-blue-500' },
        { label: 'Negotiating', value: properties.filter(p => p.status === 'under_negotiation').length, icon: '🤝', color: 'bg-yellow-500/10 text-yellow-500' },
        { label: 'Sold', value: properties.filter(p => p.status === 'sold').length, icon: '💰', color: 'bg-red-500/10 text-red-500' },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'listed': return <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 rounded border border-green-500/30 uppercase">Active</span>;
            case 'under_negotiation': return <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30 uppercase">Negotiating</span>;
            case 'sold': return <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 rounded border border-blue-500/30 uppercase">Sold</span>;
            default: return <span className="px-2 py-0.5 text-[10px] font-bold bg-zinc-800 text-zinc-400 rounded border border-zinc-700 uppercase">Draft</span>;
        }
    };

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Properties...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Marketplace Management</h1>
                    <p className="text-zinc-400">Oversee all sale properties and manage agent assignments.</p>
                </div>
                <button className="px-6 py-2 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all">
                    + New Listing
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            {/* Properties Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white">All Sale Properties</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">Property</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Seller</th>
                                <th className="px-6 py-4 font-medium">Agent</th>
                                <th className="px-6 py-4 font-medium">Price</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {properties.map(p => (
                                <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {p.image ? (
                                                <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-zinc-700" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-700">🏠</div>
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-white">{p.title}</p>
                                                <p className="text-xs text-zinc-500">{p.city}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 text-[10px] font-bold bg-zinc-800 text-zinc-300 rounded border border-zinc-700 uppercase">
                                            {p.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-300">
                                        {p.seller.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.agent ? (
                                            <span className="px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-400 rounded border border-green-500/20">
                                                {p.agent.name}
                                            </span>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-green-500"
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            assignAgentMutation.mutate({ propertyId: p.id, agentId: e.target.value });
                                                        }
                                                    }}
                                                >
                                                    <option value="">Assign Agent...</option>
                                                    <option value="1">Agent Smith</option>
                                                    <option value="2">Agent Brown</option>
                                                </select>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-green-500">
                                        {p.price.toLocaleString()} RWF
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(p.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-zinc-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                            👁️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPropertyManager;

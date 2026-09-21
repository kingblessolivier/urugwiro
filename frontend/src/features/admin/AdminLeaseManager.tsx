import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import apiClient from '../../api/client';

interface Lease {
    id: number;
    tenant_name: string;
    property_name: string;
    start_date: string;
    end_date: string;
    rent_amount: number;
    status: 'unsigned' | 'signed' | 'archived';
}

interface Stat {
    label: string;
    value: number;
    icon: string;
    color: string;
}

const AdminLeaseManager: React.FC = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'unsigned' | 'signed' | 'archived'>('unsigned');
    const [search, setSearch] = useState('');

    const { data: leases = [], isLoading } = useQuery({
        queryKey: ['admin-leases'],
        queryFn: async () => {
            const response = await api.admin.leases();
            return response.data;
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: number, status: Lease['status'] }) => {
            return apiClient.patch(`/admin/leases/${id}/`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-leases'] });
        },
    });

    const deleteLeaseMutation = useMutation({
        mutationFn: async (id: number) => {
            return apiClient.delete(`/admin/leases/${id}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-leases'] });
        },
    });

    const updateStatus = (id: number, newStatus: Lease['status']) => {
        updateStatusMutation.mutate({ id, status: newStatus });
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Delete this lease?')) {
            deleteLeaseMutation.mutate(id);
        }
    };

    const stats: Stat[] = [
        { label: 'Total', value: leases.length, icon: '📄', color: 'text-blue-500' },
        { label: 'Signed', value: leases.filter(l => l.status === 'signed').length, icon: '✅', color: 'text-green-500' },
        { label: 'Unsigned', value: leases.filter(l => l.status === 'unsigned').length, icon: '⏳', color: 'text-yellow-500' },
        { label: 'Archived', value: leases.filter(l => l.status === 'archived').length, icon: '📦', color: 'text-zinc-500' },
    ];

    const filteredLeases = leases.filter(l =>
        l.status === activeTab &&
        (l.tenant_name.toLowerCase().includes(search.toLowerCase()) ||
         l.property_name.toLowerCase().includes(search.toLowerCase()))
    );

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Leases...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">📝</span>
                    <h1 className="text-3xl font-bold text-white">Lease Management</h1>
                </div>
                <button className="px-6 py-2 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all">
                    + Add Lease
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
                        placeholder="Search leases..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabbed Content */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="flex border-b border-zinc-800 bg-zinc-900/50">
                    {(['unsigned', 'signed', 'archived'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
                                activeTab === tab
                                ? 'text-white border-b-2 border-green-500 bg-zinc-800/50'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            {tab}
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                                tab === 'unsigned' ? 'bg-red-500/20 text-red-400' :
                                tab === 'signed' ? 'bg-green-500/20 text-green-400' :
                                'bg-zinc-700 text-zinc-300'
                            }`}>
                                {leases.filter(l => l.status === tab).length}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">ID</th>
                                <th className="px-6 py-4 font-medium">Tenant</th>
                                <th className="px-6 py-4 font-medium">Property</th>
                                <th className="px-6 py-4 font-medium">Start Date</th>
                                <th className="px-6 py-4 font-medium">End Date</th>
                                <th className="px-6 py-4 font-medium">Rent (RWF)</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredLeases.map((l, _index) => (
                                <tr key={l.id} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4 text-sm text-zinc-500">{l.id}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-white">{l.tenant_name}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-300">{l.property_name}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">{l.start_date}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">{l.end_date}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-green-500">{l.rent_amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${
                                            l.status === 'unsigned' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                            l.status === 'signed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                            'bg-zinc-800 text-zinc-500 border-zinc-700'
                                        }`}>
                                            {l.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-zinc-400 hover:text-yellow-400 transition-colors" title="Edit">✏️</button>
                                            {l.status === 'unsigned' && (
                                                <button onClick={() => updateStatus(l.id, 'signed')} className="p-2 text-zinc-400 hover:text-green-400 transition-colors" title="Sign">✅</button>
                                            )}
                                            {l.status === 'signed' && (
                                                <button onClick={() => updateStatus(l.id, 'archived')} className="p-2 text-zinc-400 hover:text-blue-400 transition-colors" title="Archive">📦</button>
                                            )}
                                            {l.status === 'archived' && (
                                                <button onClick={() => updateStatus(l.id, 'signed')} className="p-2 text-zinc-400 hover:text-green-400 transition-colors" title="Unarchive">↩️</button>
                                            )}
                                            <button onClick={() => handleDelete(l.id)} className="p-2 text-zinc-400 hover:text-red-400 transition-colors" title="Delete">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredLeases.length === 0 && (
                        <div className="p-10 text-center text-zinc-500">No leases found for this tab.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLeaseManager;

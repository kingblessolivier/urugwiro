import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import apiClient from '../../api/client';

interface Enquiry {
    id: number;
    name: string;
    email: string;
    property_name: string;
    message: string;
    status: 'unread' | 'read' | 'archived';
}

interface Stat {
    label: string;
    value: number;
    icon: string;
    color: string;
}

const EnquiryManager: React.FC = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'unread' | 'read' | 'archived'>('unread');
    const [search, setSearch] = useState('');

    const { data: enquiries = [], isLoading } = useQuery({
        queryKey: ['admin-enquiries'],
        queryFn: async () => {
            const response = await api.admin.enquiries();
            return response.data;
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: number, status: Enquiry['status'] }) => {
            return apiClient.patch(`/admin/enquiries/${id}/`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
        },
    });

    const deleteEnquiryMutation = useMutation({
        mutationFn: async (id: number) => {
            return apiClient.delete(`/admin/enquiries/${id}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
        },
    });

    const stats: Stat[] = [
        { label: 'Total', value: enquiries.length, icon: '💬', color: 'text-blue-500' },
        { label: 'Read', value: enquiries.filter(e => e.status === 'read').length, icon: '✅', color: 'text-green-500' },
        { label: 'Unread', value: enquiries.filter(e => e.status === 'unread').length, icon: '🔴', color: 'text-red-500' },
        { label: 'Archived', value: enquiries.filter(e => e.status === 'archived').length, icon: '📦', color: 'text-zinc-500' },
    ];

    const filteredEnquiries = enquiries.filter(e =>
        e.status === activeTab &&
        (e.name.toLowerCase().includes(search.toLowerCase()) ||
         e.email.toLowerCase().includes(search.toLowerCase()) ||
         e.message.toLowerCase().includes(search.toLowerCase()))
    );

    const updateStatus = (id: number, newStatus: Enquiry['status']) => {
        updateStatusMutation.mutate({ id, status: newStatus });
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Delete this enquiry?')) {
            deleteEnquiryMutation.mutate(id);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Enquiries...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
                <span className="text-3xl">❓</span>
                <h1 className="text-3xl font-bold text-white">Customer Enquiries</h1>
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
                        placeholder="Search enquiries..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabbed Content */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="flex border-b border-zinc-800 bg-zinc-900/50">
                    {(['unread', 'read', 'archived'] as const).map(tab => (
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
                                tab === 'unread' ? 'bg-red-500/20 text-red-400' :
                                tab === 'read' ? 'bg-green-500/20 text-green-400' :
                                'bg-zinc-700 text-zinc-300'
                            }`}>
                                {enquiries.filter(e => e.status === tab).length}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">#</th>
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Property</th>
                                <th className="px-6 py-4 font-medium">Enquiry</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredEnquiries.map((e, index) => (
                                <tr key={e.id} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4 text-sm text-zinc-500">{index + 1}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-white">{e.name}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-300">{e.email}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-300">{e.property_name}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-400 truncate max-w-xs">{e.message}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${
                                            e.status === 'unread' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                            e.status === 'read' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                            'bg-zinc-800 text-zinc-500 border-zinc-700'
                                        }`}>
                                            {e.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-zinc-400 hover:text-white transition-colors" title="View">👁️</button>
                                            <button className="p-2 text-zinc-400 hover:text-white transition-colors" title="Reply">✉️</button>
                                            {e.status === 'unread' && (
                                                <button onClick={() => updateStatus(e.id, 'read')} className="p-2 text-zinc-400 hover:text-green-400 transition-colors" title="Mark Read">✅</button>
                                            )}
                                            {e.status === 'read' && (
                                                <button onClick={() => updateStatus(e.id, 'archived')} className="p-2 text-zinc-400 hover:text-blue-400 transition-colors" title="Archive">📦</button>
                                            )}
                                            {e.status === 'archived' && (
                                                <button onClick={() => updateStatus(e.id, 'read')} className="p-2 text-zinc-400 hover:text-green-400 transition-colors" title="Unarchive">↩️</button>
                                            )}
                                            <button onClick={() => handleDelete(e.id)} className="p-2 text-zinc-400 hover:text-red-400 transition-colors" title="Delete">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredEnquiries.length === 0 && (
                        <div className="p-10 text-center text-zinc-500">No enquiries found for this tab.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EnquiryManager;

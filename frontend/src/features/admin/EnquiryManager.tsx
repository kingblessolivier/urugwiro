import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import apiClient from '../../api/client';
import { cn } from '../../lib/utils';
import { tableHead, tableTh, tableBody, tableTr } from '../../components/ui/Dashboard';

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
        { label: 'Total', value: enquiries.length, icon: '💬', color: 'text-blue-600 dark:text-blue-400' },
        { label: 'Read', value: enquiries.filter(e => e.status === 'read').length, icon: '✅', color: 'text-[var(--color-brand-emerald)]' },
        { label: 'Unread', value: enquiries.filter(e => e.status === 'unread').length, icon: '🔴', color: 'text-red-600 dark:text-red-400' },
        { label: 'Archived', value: enquiries.filter(e => e.status === 'archived').length, icon: '📦', color: 'text-[var(--color-text-dim)]' },
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

    if (isLoading) return <div className="min-h-screen bg-[var(--color-bg-deep)] flex items-center justify-center text-[var(--color-text-dim)]">Loading Enquiries...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
                <span className="text-3xl">❓</span>
                <h1 className="text-3xl font-bold text-[var(--color-text-main)]">Customer Enquiries</h1>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-6 rounded-xl flex items-center gap-4 hover:border-[var(--color-border-hover)] transition-all shadow-[var(--shadow-depth-1)]">
                        <div className="text-3xl">{stat.icon}</div>
                        <div>
                            <p className="text-xs font-medium text-[var(--color-text-dim)] uppercase tracking-wider">{stat.label}</p>
                            <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-6 rounded-xl shadow-[var(--shadow-depth-1)]">
                <div className="relative max-w-md">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]">🔍</span>
                    <input
                        type="text"
                        className="w-full pl-12 pr-4 py-3 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-2xl text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="Search enquiries..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabbed Content */}
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-[var(--shadow-depth-1)]">
                <div className="flex border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                    {(['unread', 'read', 'archived'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
                                activeTab === tab
                                ? 'text-[var(--color-text-main)] border-b-2 border-emerald-500 bg-[var(--color-bg-surface)]'
                                : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)]'
                            }`}
                        >
                            {tab}
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                                tab === 'unread' ? 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                                tab === 'read' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-[var(--color-brand-emerald)]' :
                                'bg-[var(--color-bg-card)] text-[var(--color-text-muted)]'
                            }`}>
                                {enquiries.filter(e => e.status === tab).length}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className={tableHead}>
                            <tr>
                                <th className={tableTh}>#</th>
                                <th className={tableTh}>Name</th>
                                <th className={tableTh}>Email</th>
                                <th className={tableTh}>Property</th>
                                <th className={tableTh}>Enquiry</th>
                                <th className={tableTh}>Status</th>
                                <th className={cn(tableTh, 'text-right')}>Action</th>
                            </tr>
                        </thead>
                        <tbody className={tableBody}>
                            {filteredEnquiries.map((e, index) => (
                                <tr key={e.id} className={cn(tableTr, 'group')}>
                                    <td className="px-6 py-4 text-sm text-[var(--color-text-dim)]">{index + 1}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-[var(--color-text-main)]">{e.name}</td>
                                    <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">{e.email}</td>
                                    <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">{e.property_name}</td>
                                    <td className="px-6 py-4 text-sm text-[var(--color-text-muted)] truncate max-w-xs">{e.message}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${
                                            e.status === 'unread' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30' :
                                            e.status === 'read' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-[var(--color-brand-emerald)] dark:border-emerald-500/30' :
                                            'bg-[var(--color-bg-elevated)] text-[var(--color-text-dim)] border-[var(--color-border)]'
                                        }`}>
                                            {e.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors" title="View">👁️</button>
                                            <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors" title="Reply">✉️</button>
                                            {e.status === 'unread' && (
                                                <button onClick={() => updateStatus(e.id, 'read')} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-brand-emerald)] transition-colors" title="Mark Read">✅</button>
                                            )}
                                            {e.status === 'read' && (
                                                <button onClick={() => updateStatus(e.id, 'archived')} className="p-2 text-[var(--color-text-muted)] hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Archive">📦</button>
                                            )}
                                            {e.status === 'archived' && (
                                                <button onClick={() => updateStatus(e.id, 'read')} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-brand-emerald)] transition-colors" title="Unarchive">↩️</button>
                                            )}
                                            <button onClick={() => handleDelete(e.id)} className="p-2 text-[var(--color-text-muted)] hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredEnquiries.length === 0 && (
                        <div className="p-10 text-center text-[var(--color-text-dim)]">No enquiries found for this tab.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EnquiryManager;

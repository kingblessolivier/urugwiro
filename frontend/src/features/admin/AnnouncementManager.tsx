import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import apiClient from '../../api/client';

interface Announcement {
    id: number;
    text: string;
    icon: string;
    order: number;
    is_active: boolean;
}

interface Stat {
    label: string;
    value: number;
    icon: string;
    color: string;
}

const AnnouncementManager: React.FC = () => {
    const queryClient = useQueryClient();
    const [editAnn, setEditAnn] = useState<Announcement | null>(null);
    const [newAnn, setNewAnn] = useState({ text: '', icon: 'campaign', order: 0, is_active: true });

    const { data: announcements = [], isLoading } = useQuery({
        queryKey: ['admin-announcements'],
        queryFn: async () => {
            const response = await api.admin.announcements();
            return response.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: Partial<Announcement>) => {
            return apiClient.post('/admin/announcements/create/', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
            setNewAnn({ text: '', icon: 'campaign', order: 0, is_active: true });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number, data: Partial<Announcement> }) => {
            return apiClient.patch(`/admin/announcements/${id}/`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
            setEditAnn(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return apiClient.delete(`/admin/announcements/${id}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
        },
    });

    const stats: Stat[] = [
        { label: 'Total', value: announcements.length, icon: '📣', color: 'bg-green-500/10 text-green-500' },
        { label: 'Active', value: announcements.filter(a => a.is_active).length, icon: '👁️', color: 'bg-blue-500/10 text-blue-500' },
        { label: 'Hidden', value: announcements.filter(a => !a.is_active).length, icon: '🙈', color: 'bg-yellow-500/10 text-yellow-500' },
    ];

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(newAnn);
    };

    const handleToggle = async (ann: Announcement) => {
        updateMutation.mutate({ id: ann.id, data: { is_active: !ann.is_active } });
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Delete this announcement?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editAnn) return;
        updateMutation.mutate({ id: editAnn.id, data: editAnn });
    };

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Announcements...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">📢</span>
                    <h1 className="text-3xl font-bold text-white">Announcement Manager</h1>
                </div>
            </div>

            {/* Stats Strip */}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Table */}
                <div className="lg:col-span-2">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-zinc-800">
                            <h2 className="text-xl font-bold text-white">All Announcements</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">#</th>
                                        <th className="px-6 py-4 font-medium">Icon</th>
                                        <th className="px-6 py-4 font-medium">Message</th>
                                        <th className="px-6 py-4 font-medium">Order</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {announcements.map((ann, index) => (
                                        <tr key={ann.id} className="hover:bg-zinc-800/30 transition-colors group">
                                            <td className="px-6 py-4 text-xs text-zinc-500">{index + 1}</td>
                                            <td className="px-6 py-4 text-xl">{ann.icon === 'campaign' ? '📣' : ann.icon === 'home_work' ? '🏠' : 'ℹ️'}</td>
                                            <td className="px-6 py-4 text-sm text-zinc-200">{ann.text}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-zinc-400">{ann.order}</td>
                                            <td className="px-6 py-4">
                                                {ann.is_active ? (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 rounded border border-green-500/30 uppercase">Active</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-zinc-800 text-zinc-500 rounded border border-zinc-700 uppercase">Hidden</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setEditAnn(ann)}
                                                        className="p-2 text-zinc-400 hover:text-white transition-colors"
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggle(ann)}
                                                        className="p-2 text-zinc-400 hover:text-white transition-colors"
                                                        title={ann.is_active ? 'Hide' : 'Show'}
                                                    >
                                                        {ann.is_active ? '👁️‍🗨️' : '👁️'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(ann.id)}
                                                        className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                                                        title="Delete"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {announcements.length === 0 && (
                                <div className="p-10 text-center text-zinc-500">No announcements yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-green-500">➕</span> New Announcement
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Message</label>
                                <textarea
                                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all h-24 text-sm"
                                    placeholder="e.g. New properties available in Kigali this week!"
                                    value={newAnn.text}
                                    onChange={(e) => setNewAnn({...newAnn, text: e.target.value})}
                                    maxLength={200}
                                    required
                                />
                                <div className="text-right text-[10px] text-zinc-500">{newAnn.text.length} / 200</div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Icon</label>
                                <select
                                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all text-sm"
                                    value={newAnn.icon}
                                    onChange={(e) => setNewAnn({...newAnn, icon: e.target.value})}
                                >
                                    <option value="campaign">📣 Campaign</option>
                                    <option value="home_work">🏠 Home / Property</option>
                                    <option value="real_estate_agent">🤝 Agent</option>
                                    <option value="verified">✅ Verified</option>
                                    <option value="star">⭐ Star</option>
                                    <option value="info">ℹ️ Info</option>
                                    <option value="warning">⚠️ Warning</option>
                                    <option value="celebration">🎉 Celebration</option>
                                    <option value="local_offer">🏷️ Offer</option>
                                    <option value="schedule">🕐 Schedule</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Display Order</label>
                                <input
                                    type="number"
                                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all text-sm"
                                    value={newAnn.order}
                                    onChange={(e) => setNewAnn({...newAnn, order: parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-xl border border-zinc-700">
                                <label className="text-sm text-zinc-300 cursor-pointer">Active</label>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-green-500"
                                    checked={newAnn.is_active}
                                    onChange={(e) => setNewAnn({...newAnn, is_active: e.target.checked})}
                                />
                            </div>
                            <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                                <span>➕</span> Add Announcement
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editAnn && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">✏️</span>
                                <h3 className="text-xl font-bold text-white">Edit Announcement</h3>
                            </div>
                            <button onClick={() => setEditAnn(null)} className="text-zinc-500 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Message</label>
                                <textarea
                                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all h-24 text-sm"
                                    value={editAnn.text}
                                    onChange={(e) => setEditAnn({...editAnn, text: e.target.value})}
                                    maxLength={200}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Icon</label>
                                <select
                                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all text-sm"
                                    value={editAnn.icon}
                                    onChange={(e) => setEditAnn({...editAnn, icon: e.target.value})}
                                >
                                    <option value="campaign">📣 Campaign</option>
                                    <option value="home_work">🏠 Home / Property</option>
                                    <option value="real_estate_agent">🤝 Agent</option>
                                    <option value="verified">✅ Verified</option>
                                    <option value="star">⭐ Star</option>
                                    <option value="info">ℹ️ Info</option>
                                    <option value="warning">⚠️ Warning</option>
                                    <option value="celebration">🎉 Celebration</option>
                                    <option value="local_offer">🏷️ Offer</option>
                                    <option value="schedule">🕐 Schedule</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Display Order</label>
                                <input
                                    type="number"
                                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all text-sm"
                                    value={editAnn.order}
                                    onChange={(e) => setEditAnn({...editAnn, order: parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-xl border border-zinc-700">
                                <label className="text-sm text-zinc-300 cursor-pointer">Active</label>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-green-500"
                                    checked={editAnn.is_active}
                                    onChange={(e) => setEditAnn({...editAnn, is_active: e.target.checked})}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditAnn(null)}
                                    className="flex-1 py-3 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all text-sm">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
    );
};

export default AnnouncementManager;

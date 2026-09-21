import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import apiClient from '../../api/client';

const AdminUserManager: React.FC = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const response = await api.admin.users();
            return response.data;
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id: number) => {
            return apiClient.delete(`/admin/users/${id}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
    });

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUserMutation.mutate(id);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Users...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">User Management</h1>
                    <p className="text-zinc-400">Control access and roles across the platform.</p>
                </div>
                <button className="px-6 py-2 bg-zinc-100 text-black font-bold rounded-xl hover:bg-white transition-all">
                    + Add New User
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <input
                        type="text"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                        placeholder="Search by username or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <span className="absolute left-3 top-3.5 text-zinc-500">🔍</span>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-medium">User</th>
                            <th className="px-6 py-4 font-medium">Role</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                                            {user.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{user.username}</p>
                                            <p className="text-xs text-zinc-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 text-[10px] font-bold bg-zinc-800 text-zinc-300 rounded border border-zinc-700 uppercase">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="text-sm text-zinc-400">{user.is_active ? 'Active' : 'Inactive'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-zinc-400 hover:text-white transition-colors">✏️</button>
                                        <button onClick={() => handleDelete(user.id)} className="p-2 text-zinc-400 hover:text-red-400 transition-colors">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="p-10 text-center text-zinc-500">No users found matching your search.</div>
                )}
            </div>
        </div>
    );
};

export default AdminUserManager;

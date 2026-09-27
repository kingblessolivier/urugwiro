import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import apiClient from '../../api/client';
import { tableHead, tableTh, tableBody, tableTr } from '../../components/ui/Dashboard';
import { cn } from '../../lib/utils';

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

    if (isLoading) return <div className="min-h-screen bg-[var(--color-bg-deep)] flex items-center justify-center text-[var(--color-text-dim)]">Loading Users...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-main)]">User Management</h1>
                    <p className="text-[var(--color-text-muted)]">Control access and roles across the platform.</p>
                </div>
                <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] font-bold rounded-xl shadow-[var(--shadow-emerald-soft)] transition-all">
                    + Add New User
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <input
                        type="text"
                        className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl p-3 pl-10 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                        placeholder="Search by username or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <span className="absolute left-3 top-3.5 text-[var(--color-text-dim)]">🔍</span>
                </div>
            </div>

            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-[var(--shadow-depth-1)]">
                <table className="w-full text-left">
                    <thead className={tableHead}>
                        <tr>
                            <th className={cn(tableTh, 'px-6 py-4 font-medium')}>User</th>
                            <th className={cn(tableTh, 'px-6 py-4 font-medium')}>Role</th>
                            <th className={cn(tableTh, 'px-6 py-4 font-medium')}>Status</th>
                            <th className={cn(tableTh, 'px-6 py-4 font-medium text-right')}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className={tableBody}>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className={cn(tableTr, 'group')}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-xs font-bold text-[var(--color-text-muted)]">
                                            {user.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[var(--color-text-main)]">{user.username}</p>
                                            <p className="text-xs text-[var(--color-text-dim)]">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 text-[10px] font-bold bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] rounded border border-[var(--color-border)] uppercase">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="text-sm text-[var(--color-text-muted)]">{user.is_active ? 'Active' : 'Inactive'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors">✏️</button>
                                        <button onClick={() => handleDelete(user.id)} className="p-2 text-[var(--color-text-muted)] hover:text-red-500 dark:hover:text-red-400 transition-colors">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="p-10 text-center text-[var(--color-text-dim)]">No users found matching your search.</div>
                )}
            </div>
        </div>
    );
};

export default AdminUserManager;

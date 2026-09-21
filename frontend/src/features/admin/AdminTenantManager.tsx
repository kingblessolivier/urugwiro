import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import apiClient from '../../api/client';

const AdminTenantManager: React.FC = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data: tenants = [], isLoading } = useQuery({
        queryKey: ['admin-tenants'],
        queryFn: async () => {
            const response = await api.admin.tenants();
            return response.data;
        },
    });

    const deleteTenantMutation = useMutation({
        mutationFn: async (id: number) => {
            return apiClient.delete(`/admin/tenants/${id}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
            setDeleteId(null);
        },
    });

    const handleDelete = (id: number) => {
        deleteTenantMutation.mutate(id);
    };

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Tenants...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">👥</span>
                    <h1 className="text-3xl font-bold text-white">Tenant Management</h1>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
                <div className="relative max-w-md">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
                    <input
                        type="text"
                        className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                        placeholder="Search by Name or Email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white">All Tenants</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">#</th>
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Phone</th>
                                <th className="px-6 py-4 font-medium">Address</th>
                                <th className="px-6 py-4 font-medium">Image</th>
                                <th className="px-6 py-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredTenants.map((tenant, index) => (
                                <tr key={tenant.id} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4 text-sm text-zinc-500">{index + 1}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-white">{tenant.name}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-300">{tenant.email}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-300">{tenant.phone_number}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-300">{tenant.address}</td>
                                    <td className="px-6 py-4">
                                        {tenant.image ? (
                                            <img src={tenant.image} alt="" className="w-10 h-10 rounded-full object-cover border border-zinc-700" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-700">👤</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setDeleteId(tenant.id)}
                                            className="p-2 text-zinc-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredTenants.length === 0 && (
                        <div className="p-10 text-center text-zinc-500">No tenants found matching your search.</div>
                    )}
                </div>
            </div>

            {/* Delete Modal Overlay */}
            {deleteId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-8 space-y-6">
                        <div className="flex items-center gap-3 text-red-500">
                            <span className="text-2xl">🗑️</span>
                            <h3 className="text-xl font-bold">Delete Tenant</h3>
                        </div>
                        <p className="text-zinc-400">Are you sure you want to delete this tenant? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteId)}
                                className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-all"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTenantManager;

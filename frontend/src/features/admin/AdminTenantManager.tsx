import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, User, Trash2, Eye, Edit, Plus, Mail, Phone, MapPin, X } from 'lucide-react';
import { api } from '../../api/endpoints';
import { Pagination } from '../../components/ui/Pagination';

const AdminTenantManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [inspectTenant, setInspectTenant] = useState<any | null>(null);
  const [editingTenant, setEditingTenant] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Tenant State
  const [newTenant, setNewTenant] = useState({
    name: '',
    email: '',
    phone_number: '',
    address: '',
  });

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['admin-tenants'],
    queryFn: async () => {
      const response = await api.admin.tenants();
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const createTenantMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.admin.createTenant(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
      setIsAddOpen(false);
      setNewTenant({ name: '', email: '', phone_number: '', address: '' });
    },
  });

  const updateTenantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return api.admin.updateTenant(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
      setEditingTenant(null);
    },
  });

  const deleteTenantMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.admin.deleteTenant(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
      setDeletingId(null);
      if (inspectTenant && inspectTenant.id === deletingId) {
        setInspectTenant(null);
      }
    },
  });

  const filteredTenants = useMemo(() => {
    return tenants.filter((t: any) => {
      const term = search.toLowerCase();
      return (
        !search ||
        (t.name && t.name.toLowerCase().includes(term)) ||
        (t.email && t.email.toLowerCase().includes(term)) ||
        (t.phone_number && t.phone_number.toLowerCase().includes(term)) ||
        (t.address && t.address.toLowerCase().includes(term))
      );
    });
  }, [tenants, search]);

  const paginatedTenants = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTenants.slice(start, start + pageSize);
  }, [filteredTenants, page, pageSize]);

  if (isLoading) {
    return <div className="min-h-screen bg-transparent flex items-center justify-center text-zinc-400 font-mono">Loading Tenants...</div>;
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 text-zinc-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Directory Management</span>
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mt-1">Tenant Registry</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage tenant profiles, lease contracts, and resident dossiers.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Tenant</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone or address..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-white outline-none focus:border-emerald-500/50"
          />
        </div>
        <div className="text-xs font-mono text-zinc-400">
          {filteredTenants.length} tenants
        </div>
      </div>

      {/* Tenants Table */}
      <div className="space-y-4">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-white/[0.04] text-zinc-400 text-[10px] uppercase tracking-wider font-bold border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-semibold">#</th>
                  <th className="px-6 py-4 font-semibold">Tenant</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Phone</th>
                  <th className="px-6 py-4 font-semibold">Address</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {paginatedTenants.map((tenant: any, index: number) => (
                  <tr
                    key={tenant.id}
                    onClick={() => setInspectTenant(tenant)}
                    className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 text-zinc-500 font-mono">
                      {(page - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400 shrink-0 overflow-hidden">
                          {tenant.image ? (
                            <img src={tenant.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={16} />
                          )}
                        </div>
                        <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          {tenant.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-mono">
                      {tenant.email}
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-mono">
                      {tenant.phone_number || tenant.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {tenant.address || 'Kigali, Rwanda'}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectTenant(tenant)}
                          className="p-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                          title="View Dossier"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setEditingTenant(tenant)}
                          className="p-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-amber-400 hover:bg-white/[0.05] transition-colors"
                          title="Edit Tenant"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingId(tenant.id)}
                          className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          title="Delete Tenant"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTenants.length === 0 && (
              <div className="p-12 text-center text-zinc-500">No tenants found matching your search.</div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalItems={filteredTenants.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel="tenants"
        />
      </div>

      {/* View Tenant Dossier Modal */}
      {inspectTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
                  {inspectTenant.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{inspectTenant.name}</h3>
                  <span className="text-xs text-emerald-400 font-mono">Tenant ID #{inspectTenant.id}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectTenant(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.04]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-[10px] font-bold uppercase text-zinc-500 block">Contact Information</span>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Mail size={14} className="text-emerald-400" />
                  <span>{inspectTenant.email}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Phone size={14} className="text-emerald-400" />
                  <span>{inspectTenant.phone_number || inspectTenant.phone || 'No phone recorded'}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <MapPin size={14} className="text-emerald-400" />
                  <span>{inspectTenant.address || 'Kigali, Rwanda'}</span>
                </div>
              </div>

              {/* Leases Summary */}
              {inspectTenant.leases && inspectTenant.leases.length > 0 && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-zinc-500 block">Active Leases</span>
                  {inspectTenant.leases.map((l: any) => (
                    <div key={l.id} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{l.property_name || 'Assigned Property'}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">{l.start_date} to {l.end_date}</p>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">{Number(l.rent_amount).toLocaleString()} RWF</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setInspectTenant(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tenant Modal */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Edit size={18} className="text-amber-400" />
              Edit Tenant #{editingTenant.id}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingTenant.name}
                  onChange={(e) => setEditingTenant({ ...editingTenant, name: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={editingTenant.email}
                  onChange={(e) => setEditingTenant({ ...editingTenant, email: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingTenant.phone_number || ''}
                  onChange={(e) => setEditingTenant({ ...editingTenant, phone_number: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Address</label>
                <input
                  type="text"
                  value={editingTenant.address || ''}
                  onChange={(e) => setEditingTenant({ ...editingTenant, address: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingTenant(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updateTenantMutation.isPending}
                onClick={() => updateTenantMutation.mutate({ id: editingTenant.id, data: editingTenant })}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                {updateTenantMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tenant Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus size={18} className="text-emerald-400" />
              Add Tenant
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Jean-Paul Habimana"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Email *</label>
                <input
                  type="email"
                  placeholder="e.g. jp.habimana@example.com"
                  value={newTenant.email}
                  onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +250 788 123 456"
                  value={newTenant.phone_number}
                  onChange={(e) => setNewTenant({ ...newTenant, phone_number: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Address</label>
                <input
                  type="text"
                  placeholder="e.g. Remera, Gasabo, Kigali"
                  value={newTenant.address}
                  onChange={(e) => setNewTenant({ ...newTenant, address: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={createTenantMutation.isPending || !newTenant.name || !newTenant.email}
                onClick={() => createTenantMutation.mutate(newTenant)}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                {createTenantMutation.isPending ? 'Adding...' : 'Add Tenant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[#0e131f] p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trash2 className="text-red-400" size={18} />
              Delete Tenant
            </h3>
            <p className="text-xs text-zinc-300">
              Are you sure you want to delete this tenant? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 rounded-xl border border-white/10 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteTenantMutation.isPending}
                onClick={() => deleteTenantMutation.mutate(deletingId)}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
              >
                {deleteTenantMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTenantManager;

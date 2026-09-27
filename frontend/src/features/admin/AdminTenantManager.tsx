import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, User, Trash2, Eye, Edit, Plus, Mail, Phone, MapPin, X } from 'lucide-react';
import { api } from '../../api/endpoints';
import { Pagination } from '../../components/ui/Pagination';
import { tableHead, tableTh, tableBody, tableTr } from '../../components/ui/Dashboard';
import { cn } from '../../lib/utils';

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
    return <div className="min-h-screen bg-transparent flex items-center justify-center text-[var(--color-text-muted)] font-mono">Loading Tenants...</div>;
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 text-[var(--color-text-main)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--color-border)] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-brand-emerald)]">Directory Management</span>
          <h1 className="text-3xl lg:text-4xl font-bold text-[var(--color-text-main)] tracking-tight mt-1">Tenant Registry</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Manage tenant profiles, lease contracts, and resident details.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] font-bold text-xs rounded-xl shadow-[var(--shadow-emerald-soft)] transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Tenant</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
          <input
            type="text"
            placeholder="Search by name, email, phone or address..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500/50"
          />
        </div>
        <div className="text-xs font-mono text-[var(--color-text-muted)]">
          {filteredTenants.length} tenants
        </div>
      </div>

      {/* Tenants Table */}
      <div className="space-y-4">
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-[var(--shadow-depth-1)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className={tableHead}>
                <tr>
                  <th className={cn(tableTh, 'px-6 py-4 font-semibold')}>#</th>
                  <th className={cn(tableTh, 'px-6 py-4 font-semibold')}>Tenant</th>
                  <th className={cn(tableTh, 'px-6 py-4 font-semibold')}>Email</th>
                  <th className={cn(tableTh, 'px-6 py-4 font-semibold')}>Phone</th>
                  <th className={cn(tableTh, 'px-6 py-4 font-semibold')}>Address</th>
                  <th className={cn(tableTh, 'px-6 py-4 font-semibold text-right')}>Actions</th>
                </tr>
              </thead>
              <tbody className={tableBody}>
                {paginatedTenants.map((tenant: any, index: number) => (
                  <tr
                    key={tenant.id}
                    onClick={() => setInspectTenant(tenant)}
                    className={cn(tableTr, 'group cursor-pointer')}
                  >
                    <td className="px-6 py-4 text-[var(--color-text-dim)] font-mono">
                      {(page - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] shrink-0 overflow-hidden">
                          {tenant.image ? (
                            <img src={tenant.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={16} />
                          )}
                        </div>
                        <div className="font-semibold text-[var(--color-text-main)] group-hover:text-[var(--color-brand-emerald)] transition-colors">
                          {tenant.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)] font-mono">
                      {tenant.email}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)] font-mono">
                      {tenant.phone_number || tenant.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">
                      {tenant.address || 'Kigali, Rwanda'}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectTenant(tenant)}
                          className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-card-hover)] transition-colors"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setEditingTenant(tenant)}
                          className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-amber-500 dark:hover:text-amber-400 hover:bg-[var(--color-bg-card-hover)] transition-colors"
                          title="Edit Tenant"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingId(tenant.id)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:text-red-500 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10 transition-colors"
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
              <div className="p-12 text-center text-[var(--color-text-dim)]">No tenants found matching your search.</div>
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

      {/* View Tenant Details Modal */}
      {inspectTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 sm:p-8 shadow-[var(--shadow-depth-1)] space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[var(--color-brand-emerald)] font-bold text-lg">
                  {inspectTenant.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-text-main)]">{inspectTenant.name}</h3>
                  <span className="text-xs text-[var(--color-brand-emerald)] font-mono">Tenant ID #{inspectTenant.id}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectTenant(null)}
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-bg-elevated)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] space-y-2">
                <span className="text-[10px] font-bold uppercase text-[var(--color-text-dim)] block">Contact Information</span>
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <Mail size={14} className="text-[var(--color-brand-emerald)]" />
                  <span>{inspectTenant.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <Phone size={14} className="text-[var(--color-brand-emerald)]" />
                  <span>{inspectTenant.phone_number || inspectTenant.phone || 'No phone recorded'}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <MapPin size={14} className="text-[var(--color-brand-emerald)]" />
                  <span>{inspectTenant.address || 'Kigali, Rwanda'}</span>
                </div>
              </div>

              {/* Leases Summary */}
              {inspectTenant.leases && inspectTenant.leases.length > 0 && (
                <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] space-y-2">
                  <span className="text-[10px] font-bold uppercase text-[var(--color-text-dim)] block">Active Leases</span>
                  {inspectTenant.leases.map((l: any) => (
                    <div key={l.id} className="p-2.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[var(--color-text-main)]">{l.property_name || 'Assigned Property'}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)] font-mono">{l.start_date} to {l.end_date}</p>
                      </div>
                      <span className="font-mono text-[var(--color-brand-emerald)] font-bold">{Number(l.rent_amount).toLocaleString()} RWF</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[var(--color-border)] flex justify-end gap-3">
              <button
                onClick={() => setInspectTenant(null)}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tenant Modal */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 sm:p-8 shadow-[var(--shadow-depth-1)] space-y-4">
            <h3 className="text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <Edit size={18} className="text-amber-600 dark:text-amber-400" />
              Edit Tenant #{editingTenant.id}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingTenant.name}
                  onChange={(e) => setEditingTenant({ ...editingTenant, name: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Email</label>
                <input
                  type="email"
                  value={editingTenant.email}
                  onChange={(e) => setEditingTenant({ ...editingTenant, email: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingTenant.phone_number || ''}
                  onChange={(e) => setEditingTenant({ ...editingTenant, phone_number: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Address</label>
                <input
                  type="text"
                  value={editingTenant.address || ''}
                  onChange={(e) => setEditingTenant({ ...editingTenant, address: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setEditingTenant(null)}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updateTenantMutation.isPending}
                onClick={() => updateTenantMutation.mutate({ id: editingTenant.id, data: editingTenant })}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] font-bold text-xs shadow-[var(--shadow-emerald-soft)]"
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
          <div className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 sm:p-8 shadow-[var(--shadow-depth-1)] space-y-4">
            <h3 className="text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <Plus size={18} className="text-[var(--color-brand-emerald)]" />
              Add Tenant
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Jean-Paul Habimana"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Email *</label>
                <input
                  type="email"
                  placeholder="e.g. jp.habimana@example.com"
                  value={newTenant.email}
                  onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +250 788 123 456"
                  value={newTenant.phone_number}
                  onChange={(e) => setNewTenant({ ...newTenant, phone_number: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Address</label>
                <input
                  type="text"
                  placeholder="e.g. Remera, Gasabo, Kigali"
                  value={newTenant.address}
                  onChange={(e) => setNewTenant({ ...newTenant, address: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={createTenantMutation.isPending || !newTenant.name || !newTenant.email}
                onClick={() => createTenantMutation.mutate(newTenant)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 disabled:opacity-50 text-[#fff] font-bold text-xs shadow-[var(--shadow-emerald-soft)]"
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
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[var(--color-bg-surface)] p-6 space-y-4 shadow-[var(--shadow-depth-1)]">
            <h3 className="text-lg font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <Trash2 className="text-red-400" size={18} />
              Delete Tenant
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Are you sure you want to delete this tenant? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteTenantMutation.isPending}
                onClick={() => deleteTenantMutation.mutate(deletingId)}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-[#fff] text-xs font-bold transition-colors"
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

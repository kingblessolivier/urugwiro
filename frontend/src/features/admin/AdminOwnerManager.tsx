import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Search, User, Trash2, Eye, Edit, Plus, Mail, Phone, MapPin, X, Building, DollarSign } from 'lucide-react';
import { api } from '../../api/endpoints';
import { Pagination } from '../../components/ui/Pagination';
import { tableHead, tableTh, tableBody, tableTr } from '../../components/ui/Dashboard';
import { cn } from '../../lib/utils';

const AdminOwnerManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [inspectOwner, setInspectOwner] = useState<any | null>(null);
  const [editingOwner, setEditingOwner] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Owner Form State
  const [newOwner, setNewOwner] = useState({
    name: '',
    email: '',
    phone_number: '',
    address: '',
  });

  const { data: owners = [], isLoading } = useQuery({
    queryKey: ['admin-owners'],
    queryFn: async () => {
      const response = await api.admin.owners();
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const createOwnerMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.admin.createOwner(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-owners'] });
      setIsAddOpen(false);
      setNewOwner({ name: '', email: '', phone_number: '', address: '' });
    },
  });

  const updateOwnerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return api.admin.updateOwner(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-owners'] });
      setEditingOwner(null);
    },
  });

  const deleteOwnerMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.admin.deleteOwner(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-owners'] });
      setDeletingId(null);
      if (inspectOwner && inspectOwner.id === deletingId) {
        setInspectOwner(null);
      }
    },
  });

  const filteredOwners = useMemo(() => {
    return owners.filter((o: any) => {
      const term = search.toLowerCase();
      return (
        !search ||
        (o.name && o.name.toLowerCase().includes(term)) ||
        (o.email && o.email.toLowerCase().includes(term)) ||
        (o.phone_number && o.phone_number.toLowerCase().includes(term)) ||
        (o.address && o.address.toLowerCase().includes(term))
      );
    });
  }, [owners, search]);

  const paginatedOwners = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOwners.slice(start, start + pageSize);
  }, [filteredOwners, page, pageSize]);

  if (isLoading) {
    return <div className="min-h-screen bg-transparent flex items-center justify-center text-[var(--color-text-muted)] font-mono">Loading Owners...</div>;
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 text-[var(--color-text-main)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--color-border)] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-brand-emerald)]">Ownership Registry</span>
          <h1 className="text-3xl lg:text-4xl font-bold text-[var(--color-text-main)] tracking-tight mt-1">Property Owners</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Manage title holders, asset portfolios, and landlord accounts.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] font-bold text-xs rounded-xl shadow-[var(--shadow-emerald-soft)] transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Owner</span>
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
          {filteredOwners.length} owners
        </div>
      </div>

      {/* Owners Table */}
      <div className="space-y-4">
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-[var(--shadow-depth-1)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className={tableHead}>
                <tr>
                  <th className={cn(tableTh, 'px-6 py-4 font-semibold')}>#</th>
                  <th className={cn(tableTh, 'px-6 py-4 font-semibold')}>Owner</th>
                  <th className={cn(tableTh, 'px-6 py-4 font-semibold')}>Email</th>
                  <th className={cn(tableTh, 'px-6 py-4 font-semibold')}>Phone</th>
                  <th className={cn(tableTh, 'px-6 py-4 font-semibold')}>Address</th>
                  <th className={cn(tableTh, 'px-6 py-4 font-semibold text-right')}>Actions</th>
                </tr>
              </thead>
              <tbody className={tableBody}>
                {paginatedOwners.map((owner: any, index: number) => (
                  <tr
                    key={owner.id}
                    onClick={() => setInspectOwner(owner)}
                    className={cn(tableTr, 'group cursor-pointer')}
                  >
                    <td className="px-6 py-4 text-[var(--color-text-dim)] font-mono">
                      {(page - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] shrink-0 overflow-hidden">
                          {owner.image ? (
                            <img src={owner.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Building2 size={16} />
                          )}
                        </div>
                        <div className="font-semibold text-[var(--color-text-main)] group-hover:text-[var(--color-brand-emerald)] transition-colors">
                          {owner.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)] font-mono">
                      {owner.email}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)] font-mono">
                      {owner.phone_number || owner.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">
                      {owner.address || 'Kigali, Rwanda'}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectOwner(owner)}
                          className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-card-hover)] transition-colors"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setEditingOwner(owner)}
                          className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-amber-500 dark:hover:text-amber-400 hover:bg-[var(--color-bg-card-hover)] transition-colors"
                          title="Edit Owner"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingId(owner.id)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:text-red-500 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10 transition-colors"
                          title="Delete Owner"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOwners.length === 0 && (
              <div className="p-12 text-center text-[var(--color-text-dim)]">No owners found matching your search.</div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalItems={filteredOwners.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel="owners"
        />
      </div>

      {/* View Owner Details Modal */}
      {inspectOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 sm:p-8 shadow-[var(--shadow-depth-1)] space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[var(--color-brand-emerald)] font-bold text-lg">
                  {inspectOwner.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-text-main)]">{inspectOwner.name}</h3>
                  <span className="text-xs text-[var(--color-brand-emerald)] font-mono">Owner ID #{inspectOwner.id}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectOwner(null)}
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-bg-elevated)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] space-y-2">
                <span className="text-[10px] font-bold uppercase text-[var(--color-text-dim)] block">Contact & Identity</span>
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <Mail size={14} className="text-[var(--color-brand-emerald)]" />
                  <span>{inspectOwner.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <Phone size={14} className="text-[var(--color-brand-emerald)]" />
                  <span>{inspectOwner.phone_number || inspectOwner.phone || 'No phone recorded'}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <MapPin size={14} className="text-[var(--color-brand-emerald)]" />
                  <span>{inspectOwner.address || 'Kigali, Rwanda'}</span>
                </div>
              </div>

              {/* Owned Properties */}
              {inspectOwner.properties && inspectOwner.properties.length > 0 && (
                <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] space-y-2">
                  <span className="text-[10px] font-bold uppercase text-[var(--color-text-dim)] block">Portfolio Assets</span>
                  {inspectOwner.properties.map((p: any) => (
                    <div key={p.id} className="p-2.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[var(--color-text-main)]">{p.name}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{p.address} • {p.types}</p>
                      </div>
                      <span className="font-mono text-[var(--color-brand-emerald)] font-bold">{Number(p.price).toLocaleString()} RWF</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[var(--color-border)] flex justify-end gap-3">
              <button
                onClick={() => setInspectOwner(null)}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Owner Modal */}
      {editingOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 sm:p-8 shadow-[var(--shadow-depth-1)] space-y-4">
            <h3 className="text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <Edit size={18} className="text-amber-600 dark:text-amber-400" />
              Edit Owner #{editingOwner.id}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingOwner.name}
                  onChange={(e) => setEditingOwner({ ...editingOwner, name: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Email</label>
                <input
                  type="email"
                  value={editingOwner.email}
                  onChange={(e) => setEditingOwner({ ...editingOwner, email: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingOwner.phone_number || ''}
                  onChange={(e) => setEditingOwner({ ...editingOwner, phone_number: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Address</label>
                <input
                  type="text"
                  value={editingOwner.address || ''}
                  onChange={(e) => setEditingOwner({ ...editingOwner, address: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setEditingOwner(null)}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updateOwnerMutation.isPending}
                onClick={() => updateOwnerMutation.mutate({ id: editingOwner.id, data: editingOwner })}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] font-bold text-xs shadow-[var(--shadow-emerald-soft)]"
              >
                {updateOwnerMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Owner Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 sm:p-8 shadow-[var(--shadow-depth-1)] space-y-4">
            <h3 className="text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <Plus size={18} className="text-[var(--color-brand-emerald)]" />
              Add Owner
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Marie Claire Mukamana"
                  value={newOwner.name}
                  onChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Email *</label>
                <input
                  type="email"
                  placeholder="e.g. marie.claire@example.com"
                  value={newOwner.email}
                  onChange={(e) => setNewOwner({ ...newOwner, email: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +250 788 654 321"
                  value={newOwner.phone_number}
                  onChange={(e) => setNewOwner({ ...newOwner, phone_number: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Address</label>
                <input
                  type="text"
                  placeholder="e.g. Kacyiru, Gasabo, Kigali"
                  value={newOwner.address}
                  onChange={(e) => setNewOwner({ ...newOwner, address: e.target.value })}
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
                disabled={createOwnerMutation.isPending || !newOwner.name || !newOwner.email}
                onClick={() => createOwnerMutation.mutate(newOwner)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 disabled:opacity-50 text-[#fff] font-bold text-xs shadow-[var(--shadow-emerald-soft)]"
              >
                {createOwnerMutation.isPending ? 'Adding...' : 'Add Owner'}
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
              Delete Owner
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Are you sure you want to delete this owner? This action cannot be undone.
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
                disabled={deleteOwnerMutation.isPending}
                onClick={() => deleteOwnerMutation.mutate(deletingId)}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-[#fff] text-xs font-bold transition-colors"
              >
                {deleteOwnerMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOwnerManager;

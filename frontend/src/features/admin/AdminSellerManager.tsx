import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Store, CheckCircle2, Clock, User, Trash2, Eye, Edit, Plus, 
  ShieldCheck, ShieldAlert, Search, X, MapPin, Mail, Phone, Building 
} from 'lucide-react';
import { api } from '../../api/endpoints';
import { Pagination } from '../../components/ui/Pagination';

interface Stat {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}

const AdminSellerManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [inspectSeller, setInspectSeller] = useState<any | null>(null);
  const [editingSeller, setEditingSeller] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Seller Form State
  const [newSeller, setNewSeller] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    id_number: '',
  });

  const { data: sellers = [], isLoading } = useQuery({
    queryKey: ['admin-sellers'],
    queryFn: async () => {
      const response = await api.admin.sellers();
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const toggleVerifyMutation = useMutation({
    mutationFn: async ({ id, is_verified }: { id: number; is_verified: boolean }) => {
      return api.admin.updateSeller(id, { is_verified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
    },
  });

  const createSellerMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.admin.createSeller(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
      setIsAddOpen(false);
      setNewSeller({ name: '', email: '', phone: '', address: '', id_number: '' });
    },
  });

  const updateSellerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return api.admin.updateSeller(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
      setEditingSeller(null);
    },
  });

  const deleteSellerMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.admin.deleteSeller(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
      setDeletingId(null);
      if (inspectSeller && inspectSeller.id === deletingId) {
        setInspectSeller(null);
      }
    },
  });

  const toggleVerify = (id: number, currentStatus: boolean) => {
    toggleVerifyMutation.mutate({ id, is_verified: !currentStatus });
  };

  const filteredSellers = useMemo(() => {
    return sellers.filter((s: any) => {
      const term = search.toLowerCase();
      return (
        !search ||
        (s.name && s.name.toLowerCase().includes(term)) ||
        (s.email && s.email.toLowerCase().includes(term)) ||
        (s.phone && s.phone.toLowerCase().includes(term)) ||
        (s.id_number && s.id_number.toLowerCase().includes(term))
      );
    });
  }, [sellers, search]);

  const paginatedSellers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSellers.slice(start, start + pageSize);
  }, [filteredSellers, page, pageSize]);

  const stats: Stat[] = [
    { label: 'Total Sellers', value: sellers.length, icon: Store, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { label: 'Verified', value: sellers.filter((s: any) => s.is_verified).length, icon: CheckCircle2, color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
    { label: 'Pending Verification', value: sellers.filter((s: any) => !s.is_verified).length, icon: Clock, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  ];

  if (isLoading) {
    return <div className="min-h-screen bg-transparent flex items-center justify-center text-zinc-400 font-mono">Loading Sellers...</div>;
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 text-zinc-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Merchant Directory</span>
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mt-1">Sellers & Merchants</h1>
          <p className="text-xs text-zinc-400 mt-1">Oversee merchant accounts, verify national credentials, and manage listings.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Seller</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white/[0.02] border border-white/10 p-5 rounded-2xl flex items-center gap-4 backdrop-blur-xl">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-bold text-white font-mono mt-0.5">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone or ID number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-white outline-none focus:border-emerald-500/50"
          />
        </div>
        <div className="text-xs font-mono text-zinc-400">
          {filteredSellers.length} sellers
        </div>
      </div>

      {/* Sellers Table */}
      <div className="space-y-4">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-white/[0.04] text-zinc-400 text-[10px] uppercase tracking-wider font-bold border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-semibold">Seller</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Phone</th>
                  <th className="px-6 py-4 font-semibold">National ID</th>
                  <th className="px-6 py-4 font-semibold">Listings</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {paginatedSellers.map((seller: any) => (
                  <tr
                    key={seller.id}
                    onClick={() => setInspectSeller(seller)}
                    className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400 shrink-0 overflow-hidden">
                          {seller.image ? (
                            <img src={seller.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={16} />
                          )}
                        </div>
                        <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          {seller.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-mono">
                      {seller.email}
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-mono">
                      {seller.phone || seller.phone_number || '-'}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono">
                      {seller.id_number || '-'}
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-mono font-bold">
                      {seller.listing_count ?? 0}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleVerify(seller.id, seller.is_verified)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase transition-colors cursor-pointer ${
                          seller.is_verified
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30'
                        }`}
                        title={seller.is_verified ? 'Click to Unverify' : 'Click to Verify'}
                      >
                        {seller.is_verified ? (
                          <>
                            <ShieldCheck size={12} />
                            <span>Verified</span>
                          </>
                        ) : (
                          <>
                            <Clock size={12} />
                            <span>Pending</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectSeller(seller)}
                          className="p-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                          title="View Dossier"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setEditingSeller(seller)}
                          className="p-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-amber-400 hover:bg-white/[0.05] transition-colors"
                          title="Edit Seller"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingId(seller.id)}
                          className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          title="Delete Seller"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSellers.length === 0 && (
              <div className="p-12 text-center text-zinc-500">No sellers found matching your search.</div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalItems={filteredSellers.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel="sellers"
        />
      </div>

      {/* View Seller Dossier Modal */}
      {inspectSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
                  {inspectSeller.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{inspectSeller.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-emerald-400 font-mono">Seller ID #{inspectSeller.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      inspectSeller.is_verified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {inspectSeller.is_verified ? 'Verified Merchant' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectSeller(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.04]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-[10px] font-bold uppercase text-zinc-500 block">Contact & Identity Credentials</span>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Mail size={14} className="text-emerald-400" />
                  <span>{inspectSeller.email}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Phone size={14} className="text-emerald-400" />
                  <span>{inspectSeller.phone || inspectSeller.phone_number || 'No phone recorded'}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <MapPin size={14} className="text-emerald-400" />
                  <span>{inspectSeller.address || 'Kigali, Rwanda'}</span>
                </div>
                <div className="pt-2 border-t border-white/5 text-zinc-400">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">National ID Number</span>
                  <span className="font-mono text-white text-xs">{inspectSeller.id_number || 'Not provided'}</span>
                </div>
              </div>

              {/* Listed Properties */}
              {inspectSeller.listings && inspectSeller.listings.length > 0 && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-zinc-500 block">Active Listings</span>
                  {inspectSeller.listings.map((l: any) => (
                    <div key={l.id} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{l.title}</p>
                        <p className="text-[10px] text-zinc-400">{l.city} • {l.property_type}</p>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">{Number(l.price).toLocaleString()} RWF</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setInspectSeller(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Seller Modal */}
      {editingSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Edit size={18} className="text-amber-400" />
              Edit Seller #{editingSeller.id}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingSeller.name}
                  onChange={(e) => setEditingSeller({ ...editingSeller, name: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={editingSeller.email}
                  onChange={(e) => setEditingSeller({ ...editingSeller, email: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingSeller.phone || editingSeller.phone_number || ''}
                  onChange={(e) => setEditingSeller({ ...editingSeller, phone: e.target.value, phone_number: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">National ID Number</label>
                <input
                  type="text"
                  value={editingSeller.id_number || ''}
                  onChange={(e) => setEditingSeller({ ...editingSeller, id_number: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Address</label>
                <input
                  type="text"
                  value={editingSeller.address || ''}
                  onChange={(e) => setEditingSeller({ ...editingSeller, address: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingSeller(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updateSellerMutation.isPending}
                onClick={() => updateSellerMutation.mutate({ id: editingSeller.id, data: editingSeller })}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                {updateSellerMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Seller Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus size={18} className="text-emerald-400" />
              Add Seller
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Seller Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Kigali Heights Realty"
                  value={newSeller.name}
                  onChange={(e) => setNewSeller({ ...newSeller, name: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Email *</label>
                <input
                  type="email"
                  placeholder="e.g. contact@kigaliheights.rw"
                  value={newSeller.email}
                  onChange={(e) => setNewSeller({ ...newSeller, email: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +250 788 999 888"
                  value={newSeller.phone}
                  onChange={(e) => setNewSeller({ ...newSeller, phone: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">National ID / TIN</label>
                <input
                  type="text"
                  placeholder="e.g. 1 1990 8 0012345 0 12"
                  value={newSeller.id_number}
                  onChange={(e) => setNewSeller({ ...newSeller, id_number: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Address</label>
                <input
                  type="text"
                  placeholder="e.g. Nyarugenge, Kigali"
                  value={newSeller.address}
                  onChange={(e) => setNewSeller({ ...newSeller, address: e.target.value })}
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
                disabled={createSellerMutation.isPending || !newSeller.name || !newSeller.email}
                onClick={() => createSellerMutation.mutate(newSeller)}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                {createSellerMutation.isPending ? 'Adding...' : 'Add Seller'}
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
              Delete Seller
            </h3>
            <p className="text-xs text-zinc-300">
              Are you sure you want to delete this seller? This action cannot be undone.
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
                disabled={deleteSellerMutation.isPending}
                onClick={() => deleteSellerMutation.mutate(deletingId)}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
              >
                {deleteSellerMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellerManager;

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Store, CheckCircle2, Clock, User, Trash2, Eye, Edit, Plus, 
  ShieldCheck, ShieldAlert, Search, X, MapPin, Mail, Phone, Building 
} from 'lucide-react';
import { api } from '../../api/endpoints';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { cn } from '../../lib/utils';

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
      return Array.isArray(response.data) ? response.data : (response.data?.results || []);
    },
  });

  const sellerName = (seller: any) =>
    seller?.name || seller?.full_name || seller?.username || seller?.email || `Seller #${seller?.id || ''}`.trim() || 'Seller';
  const sellerPhone = (seller: any) => seller?.phone || seller?.phone_number || seller?.contact_phone || '-';

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

  const columns = useMemo(() => [
    { accessorKey: 'name', id: 'seller', header: 'Seller', cell: ({ row }: any) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] shrink-0 overflow-hidden">
          {row.original.image ? <img src={row.original.image} alt="" className="w-full h-full object-cover" /> : <User size={14} />}
        </div>
        <span className="font-semibold text-[var(--color-text-main)]">{sellerName(row.original)}</span>
      </div>
    ) },
    { accessorKey: 'email', id: 'email', header: 'Email', cell: ({ row }: any) => <span className="font-mono text-[var(--color-text-muted)]">{row.original.email}</span> },
    { accessorKey: 'phone', id: 'phone', header: 'Phone', cell: ({ row }: any) => <span className="font-mono text-[var(--color-text-muted)]">{sellerPhone(row.original)}</span> },
    { accessorKey: 'id_number', id: 'id_number', header: 'National ID', cell: ({ row }: any) => <span className="font-mono text-[var(--color-text-muted)]">{row.original.id_number || '-'}</span> },
    { accessorKey: 'listing_count', id: 'listings', header: 'Listings', cell: ({ row }: any) => <span className="font-mono font-bold text-[var(--color-text-muted)]">{row.original.listing_count ?? 0}</span> },
    { accessorKey: 'is_verified', id: 'status', header: 'Status', cell: ({ row }: any) => (
      <button
        onClick={(e) => { e.stopPropagation(); toggleVerify(row.original.id, row.original.is_verified); }}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase transition-colors cursor-pointer',
          row.original.is_verified
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-[var(--color-brand-emerald)] dark:border-emerald-500/30'
            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30'
        )}
        title={row.original.is_verified ? 'Click to Unverify' : 'Click to Verify'}
      >
        {row.original.is_verified ? <><ShieldCheck size={12} /><span>Verified</span></> : <><Clock size={12} /><span>Pending</span></>}
      </button>
    ) },
    { id: 'actions', header: '', cell: ({ row }: any) => (
      <div className="flex items-center justify-end gap-1.5">
        <button onClick={() => setInspectSeller(row.original)} className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors" title="View"><Eye size={14} /></button>
        <button onClick={() => setEditingSeller(row.original)} className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-amber-500 transition-colors" title="Edit"><Edit size={14} /></button>
        <button onClick={() => setDeletingId(row.original.id)} className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:text-red-500 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors" title="Delete"><Trash2 size={14} /></button>
      </div>
    ) },
  ], [toggleVerify, setInspectSeller, setEditingSeller, setDeletingId]);

  const stats: Stat[] = [
    { label: 'Total Sellers', value: sellers.length, icon: Store, color: 'bg-emerald-500/10 text-[var(--color-brand-emerald)] border-emerald-500/20' },
    { label: 'Verified', value: sellers.filter((s: any) => s.is_verified).length, icon: CheckCircle2, color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' },
    { label: 'Pending Verification', value: sellers.filter((s: any) => !s.is_verified).length, icon: Clock, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  ];

  if (isLoading) {
    return <div className="min-h-screen bg-transparent flex items-center justify-center text-[var(--color-text-muted)] font-mono">Loading Sellers...</div>;
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 text-[var(--color-text-main)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--color-border)] pb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text-main)] tracking-tight">Sellers</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{filteredSellers.length} sellers</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] font-bold text-xs rounded-xl shadow-[var(--shadow-emerald-soft)] transition-all cursor-pointer"
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
            <div key={i} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-5 rounded-2xl flex items-center gap-4 backdrop-blur-xl">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-text-dim)] uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-bold text-[var(--color-text-main)] font-mono mt-0.5">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
          <input
            type="text"
            placeholder="Search by name, email, phone or ID number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500/50"
          />
        </div>
        <div className="text-xs font-mono text-[var(--color-text-muted)]">
          {filteredSellers.length} sellers
        </div>
      </div>

      {/* Sellers Table */}
      <DataTable
        data={filteredSellers}
        columns={columns}
        searchKeys={['name', 'email', 'phone', 'id_number']}
        searchPlaceholder="Search by name, email, phone or ID..."
        emptyTitle="No sellers found"
        emptyDescription="No sellers match the selected filters."
        onRowClick={(row) => setInspectSeller(row)}
        showBulkActions={false}
        showDensityToggle={true}
        showColumnToggle={true}
        pageSize={pageSize}
      />

      {/* View Seller Details Modal */}
      {inspectSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 sm:p-8 shadow-[var(--shadow-depth-1)] space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[var(--color-brand-emerald)] font-bold text-lg">
                  {sellerName(inspectSeller).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-text-main)]">{sellerName(inspectSeller)}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[var(--color-brand-emerald)] font-mono">Seller ID #{inspectSeller.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      inspectSeller.is_verified ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-[var(--color-brand-emerald)] dark:border-emerald-500/30' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30'
                    }`}>
                      {inspectSeller.is_verified ? 'Verified Merchant' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectSeller(null)}
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-bg-elevated)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] space-y-2">
                <span className="text-[10px] font-bold uppercase text-[var(--color-text-dim)] block">Contact & Identity Credentials</span>
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <Mail size={14} className="text-[var(--color-brand-emerald)]" />
                  <span>{inspectSeller.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <Phone size={14} className="text-[var(--color-brand-emerald)]" />
                  <span>{sellerPhone(inspectSeller) !== '-' ? sellerPhone(inspectSeller) : 'No phone recorded'}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <MapPin size={14} className="text-[var(--color-brand-emerald)]" />
                  <span>{inspectSeller.address || 'Kigali, Rwanda'}</span>
                </div>
                <div className="pt-2 border-t border-[var(--color-border)] text-[var(--color-text-muted)]">
                  <span className="text-[10px] text-[var(--color-text-dim)] uppercase font-bold block">National ID Number</span>
                  <span className="font-mono text-[var(--color-text-main)] text-xs">{inspectSeller.id_number || 'Not provided'}</span>
                </div>
              </div>

              {/* Listed Properties */}
              {inspectSeller.listings && inspectSeller.listings.length > 0 && (
                <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] space-y-2">
                  <span className="text-[10px] font-bold uppercase text-[var(--color-text-dim)] block">Active Listings</span>
                  {inspectSeller.listings.map((l: any) => (
                    <div key={l.id} className="p-2.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[var(--color-text-main)]">{l.title}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{l.city} • {l.property_type}</p>
                      </div>
                      <span className="font-mono text-[var(--color-brand-emerald)] font-bold">{Number(l.price).toLocaleString()} RWF</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[var(--color-border)] flex justify-end gap-3">
              <button
                onClick={() => setInspectSeller(null)}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Seller Modal */}
      {editingSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 sm:p-8 shadow-[var(--shadow-depth-1)] space-y-4">
            <h3 className="text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <Edit size={18} className="text-amber-600 dark:text-amber-400" />
              Edit Seller #{editingSeller.id}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingSeller.name}
                  onChange={(e) => setEditingSeller({ ...editingSeller, name: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Email</label>
                <input
                  type="email"
                  value={editingSeller.email}
                  onChange={(e) => setEditingSeller({ ...editingSeller, email: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingSeller.phone || editingSeller.phone_number || ''}
                  onChange={(e) => setEditingSeller({ ...editingSeller, phone: e.target.value, phone_number: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">National ID Number</label>
                <input
                  type="text"
                  value={editingSeller.id_number || ''}
                  onChange={(e) => setEditingSeller({ ...editingSeller, id_number: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Address</label>
                <input
                  type="text"
                  value={editingSeller.address || ''}
                  onChange={(e) => setEditingSeller({ ...editingSeller, address: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setEditingSeller(null)}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updateSellerMutation.isPending}
                onClick={() => updateSellerMutation.mutate({ id: editingSeller.id, data: editingSeller })}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] font-bold text-xs shadow-[var(--shadow-emerald-soft)]"
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
          <div className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 sm:p-8 shadow-[var(--shadow-depth-1)] space-y-4">
            <h3 className="text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <Plus size={18} className="text-[var(--color-brand-emerald)]" />
              Add Seller
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Seller Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Kigali Heights Realty"
                  value={newSeller.name}
                  onChange={(e) => setNewSeller({ ...newSeller, name: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Email *</label>
                <input
                  type="email"
                  placeholder="e.g. contact@kigaliheights.rw"
                  value={newSeller.email}
                  onChange={(e) => setNewSeller({ ...newSeller, email: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +250 788 999 888"
                  value={newSeller.phone}
                  onChange={(e) => setNewSeller({ ...newSeller, phone: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">National ID / TIN</label>
                <input
                  type="text"
                  placeholder="e.g. 1 1990 8 0012345 0 12"
                  value={newSeller.id_number}
                  onChange={(e) => setNewSeller({ ...newSeller, id_number: e.target.value })}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Address</label>
                <input
                  type="text"
                  placeholder="e.g. Nyarugenge, Kigali"
                  value={newSeller.address}
                  onChange={(e) => setNewSeller({ ...newSeller, address: e.target.value })}
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
                disabled={createSellerMutation.isPending || !newSeller.name || !newSeller.email}
                onClick={() => createSellerMutation.mutate(newSeller)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 disabled:opacity-50 text-[#fff] font-bold text-xs shadow-[var(--shadow-emerald-soft)]"
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
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[var(--color-bg-surface)] p-6 space-y-4 shadow-[var(--shadow-depth-1)]">
            <h3 className="text-lg font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <Trash2 className="text-red-400" size={18} />
              Delete Seller
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Are you sure you want to delete this seller? This action cannot be undone.
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
                disabled={deleteSellerMutation.isPending}
                onClick={() => deleteSellerMutation.mutate(deletingId)}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-[#fff] text-xs font-bold transition-colors"
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

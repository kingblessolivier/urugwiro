import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, CheckCircle2, Clock, Archive, Search, Eye, Edit, Plus, 
  Trash2, RotateCcw, X, Building, User, Calendar, DollarSign 
} from 'lucide-react';
import { api } from '../../api/endpoints';
import { Pagination } from '../../components/ui/Pagination';

interface Lease {
  id: number;
  tenant_name: string;
  property_name: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  status: 'unsigned' | 'signed' | 'archived';
  contract_details?: string;
}

const AdminLeaseManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'unsigned' | 'signed' | 'archived'>('unsigned');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [inspectLease, setInspectLease] = useState<Lease | null>(null);
  const [editingLease, setEditingLease] = useState<Lease | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Lease State
  const [newLease, setNewLease] = useState({
    tenant_name: '',
    property_name: '',
    rent_amount: '',
    start_date: '',
    end_date: '',
    contract_details: '',
  });

  const { data: leases = [], isLoading } = useQuery<Lease[]>({
    queryKey: ['admin-leases'],
    queryFn: async () => {
      const response = await api.admin.leases();
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Lease['status'] }) => {
      return api.admin.updateLease(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leases'] });
    },
  });

  const createLeaseMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.admin.createLease(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leases'] });
      setIsAddOpen(false);
      setNewLease({ tenant_name: '', property_name: '', rent_amount: '', start_date: '', end_date: '', contract_details: '' });
    },
  });

  const updateLeaseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return api.admin.updateLease(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leases'] });
      setEditingLease(null);
    },
  });

  const deleteLeaseMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.admin.deleteLease(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leases'] });
      setDeletingId(null);
      if (inspectLease && inspectLease.id === deletingId) {
        setInspectLease(null);
      }
    },
  });

  const updateStatus = (id: number, newStatus: Lease['status']) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const filteredLeases = useMemo(() => {
    return leases.filter((l) => {
      const matchesTab = l.status === activeTab;
      const term = search.toLowerCase();
      const matchesSearch =
        !search ||
        (l.tenant_name && l.tenant_name.toLowerCase().includes(term)) ||
        (l.property_name && l.property_name.toLowerCase().includes(term));
      return matchesTab && matchesSearch;
    });
  }, [leases, activeTab, search]);

  const paginatedLeases = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLeases.slice(start, start + pageSize);
  }, [filteredLeases, page, pageSize]);

  const stats = [
    { label: 'Total Leases', value: leases.length, icon: FileText, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { label: 'Active Signed', value: leases.filter((l) => l.status === 'signed').length, icon: CheckCircle2, color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
    { label: 'Unsigned Drafts', value: leases.filter((l) => l.status === 'unsigned').length, icon: Clock, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { label: 'Archived', value: leases.filter((l) => l.status === 'archived').length, icon: Archive, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  ];

  if (isLoading) {
    return <div className="min-h-screen bg-transparent flex items-center justify-center text-zinc-400 font-mono">Loading Leases...</div>;
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 text-zinc-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Tenancy Governance</span>
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mt-1">Lease Contracts</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage tenancy agreements, contractual terms, and signature milestones.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Lease</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Search & Filter */}
      <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search leases by tenant or property..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-white outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(['unsigned', 'signed', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-white/10'
              }`}
            >
              {tab}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                tab === 'unsigned' ? 'bg-amber-500/20 text-amber-300' :
                tab === 'signed' ? 'bg-emerald-700/50 text-emerald-200' :
                'bg-zinc-700 text-zinc-300'
              }`}>
                {leases.filter((l) => l.status === tab).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Leases Table */}
      <div className="space-y-4">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-white/[0.04] text-zinc-400 text-[10px] uppercase tracking-wider font-bold border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-semibold">Contract #</th>
                  <th className="px-6 py-4 font-semibold">Tenant</th>
                  <th className="px-6 py-4 font-semibold">Property</th>
                  <th className="px-6 py-4 font-semibold">Start Date</th>
                  <th className="px-6 py-4 font-semibold">End Date</th>
                  <th className="px-6 py-4 font-semibold">Rent (RWF)</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {paginatedLeases.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => setInspectLease(l)}
                    className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 text-emerald-400 font-mono font-bold">
                      #{l.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {l.tenant_name}
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      {l.property_name}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono">
                      {l.start_date}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono">
                      {l.end_date}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                      {Number(l.rent_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase ${
                        l.status === 'unsigned' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        l.status === 'signed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectLease(l)}
                          className="p-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                          title="View Lease Contract"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setEditingLease(l)}
                          className="p-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-amber-400 hover:bg-white/[0.05] transition-colors"
                          title="Edit Lease"
                        >
                          <Edit size={15} />
                        </button>

                        {l.status === 'unsigned' && (
                          <button
                            onClick={() => updateStatus(l.id, 'signed')}
                            className="p-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title="Mark as Signed"
                          >
                            <CheckCircle2 size={15} />
                          </button>
                        )}
                        {l.status === 'signed' && (
                          <button
                            onClick={() => updateStatus(l.id, 'archived')}
                            className="p-1.5 rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors"
                            title="Archive Lease"
                          >
                            <Archive size={15} />
                          </button>
                        )}
                        {l.status === 'archived' && (
                          <button
                            onClick={() => updateStatus(l.id, 'signed')}
                            className="p-1.5 rounded-lg border border-sky-500/30 text-sky-400 hover:bg-sky-500/10 transition-colors"
                            title="Unarchive to Signed"
                          >
                            <RotateCcw size={15} />
                          </button>
                        )}

                        <button
                          onClick={() => setDeletingId(l.id)}
                          className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          title="Delete Lease"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLeases.length === 0 && (
              <div className="p-12 text-center text-zinc-500">No leases found for this status tab.</div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalItems={filteredLeases.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel="leases"
        />
      </div>

      {/* View Lease Modal */}
      {inspectLease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="font-mono text-emerald-400 font-bold text-xs uppercase">
                  Contract Agreement #{inspectLease.id}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{inspectLease.property_name}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Tenant: {inspectLease.tenant_name}</p>
              </div>
              <button
                onClick={() => setInspectLease(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.04]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 block text-[10px] font-bold uppercase">Monthly Rent</span>
                <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">
                  {Number(inspectLease.rent_amount).toLocaleString()} RWF
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 block text-[10px] font-bold uppercase">Status</span>
                <span className="font-semibold text-white capitalize mt-0.5 block">{inspectLease.status}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 block text-[10px] font-bold uppercase">Start Date</span>
                <span className="font-mono text-white mt-0.5 block">{inspectLease.start_date}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 block text-[10px] font-bold uppercase">End Date</span>
                <span className="font-mono text-white mt-0.5 block">{inspectLease.end_date}</span>
              </div>
            </div>

            {inspectLease.contract_details && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-300 space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-500 block">Contractual Terms</span>
                <p className="leading-relaxed">{inspectLease.contract_details}</p>
              </div>
            )}

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setInspectLease(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Close Agreement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lease Modal */}
      {editingLease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Edit size={18} className="text-amber-400" />
              Edit Lease Contract #{editingLease.id}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Rent Amount (RWF)</label>
                <input
                  type="number"
                  value={editingLease.rent_amount}
                  onChange={(e) => setEditingLease({ ...editingLease, rent_amount: Number(e.target.value) })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editingLease.start_date}
                    onChange={(e) => setEditingLease({ ...editingLease, start_date: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={editingLease.end_date}
                    onChange={(e) => setEditingLease({ ...editingLease, end_date: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Contract Details</label>
                <textarea
                  rows={3}
                  value={editingLease.contract_details || ''}
                  onChange={(e) => setEditingLease({ ...editingLease, contract_details: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingLease(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updateLeaseMutation.isPending}
                onClick={() => updateLeaseMutation.mutate({ id: editingLease.id, data: editingLease })}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                {updateLeaseMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lease Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus size={18} className="text-emerald-400" />
              Add Lease Agreement
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Rent Amount (RWF) *</label>
                <input
                  type="number"
                  placeholder="e.g. 450000"
                  value={newLease.rent_amount}
                  onChange={(e) => setNewLease({ ...newLease, rent_amount: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newLease.start_date}
                    onChange={(e) => setNewLease({ ...newLease, start_date: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={newLease.end_date}
                    onChange={(e) => setNewLease({ ...newLease, end_date: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Contractual Clauses & Terms</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Standard 12-month lease with 2 months security deposit..."
                  value={newLease.contract_details}
                  onChange={(e) => setNewLease({ ...newLease, contract_details: e.target.value })}
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
                disabled={createLeaseMutation.isPending || !newLease.rent_amount}
                onClick={() => createLeaseMutation.mutate(newLease)}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                {createLeaseMutation.isPending ? 'Creating...' : 'Create Lease'}
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
              Delete Lease Agreement
            </h3>
            <p className="text-xs text-zinc-300">
              Are you sure you want to delete lease contract #{deletingId}? This action cannot be undone.
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
                disabled={deleteLeaseMutation.isPending}
                onClick={() => deleteLeaseMutation.mutate(deletingId)}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
              >
                {deleteLeaseMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaseManager;

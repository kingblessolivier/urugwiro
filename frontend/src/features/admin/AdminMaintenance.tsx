import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Wrench, AlertCircle, Clock, CheckCircle2, Search, Building, 
  User, Trash2, Eye, Edit, Plus, X, Calendar, MapPin, FileText 
} from 'lucide-react';
import { api } from '../../api/endpoints';
import { Pagination } from '../../components/ui/Pagination';

interface MaintenanceRequest {
  id: number;
  title: string;
  property_name: string;
  tenant_name: string;
  request_date: string;
  completion_date?: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed';
}

const AdminMaintenance: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'in_progress' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [inspectTicket, setInspectTicket] = useState<MaintenanceRequest | null>(null);
  const [editingTicket, setEditingTicket] = useState<MaintenanceRequest | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isLogOpen, setIsLogOpen] = useState(false);

  // New Maintenance State
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
  });

  const { data: requests = [], isLoading } = useQuery<MaintenanceRequest[]>({
    queryKey: ['admin-maintenance'],
    queryFn: async () => {
      const response = await api.admin.maintenance();
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: MaintenanceRequest['status'] }) => {
      return api.admin.updateMaintenance(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-maintenance'] });
    },
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.admin.createMaintenance(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-maintenance'] });
      setIsLogOpen(false);
      setNewTicket({ title: '', description: '' });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return api.admin.updateMaintenance(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-maintenance'] });
      setEditingTicket(null);
    },
  });

  const deleteMaintenanceMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.admin.deleteMaintenance(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-maintenance'] });
      setDeletingId(null);
      if (inspectTicket && inspectTicket.id === deletingId) {
        setInspectTicket(null);
      }
    },
  });

  const updateStatus = (id: number, newStatus: MaintenanceRequest['status']) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesTab = activeTab === 'all' || r.status === activeTab;
      const term = search.toLowerCase();
      const matchesSearch =
        !search ||
        (r.title && r.title.toLowerCase().includes(term)) ||
        (r.property_name && r.property_name.toLowerCase().includes(term)) ||
        (r.tenant_name && r.tenant_name.toLowerCase().includes(term)) ||
        (r.description && r.description.toLowerCase().includes(term));
      return matchesTab && matchesSearch;
    });
  }, [requests, activeTab, search]);

  const paginatedRequests = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRequests.slice(start, start + pageSize);
  }, [filteredRequests, page, pageSize]);

  const stats = [
    { label: 'Total Requests', value: requests.length, icon: Wrench, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { label: 'Open', value: requests.filter((r) => r.status === 'open').length, icon: AlertCircle, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
    { label: 'In Progress', value: requests.filter((r) => r.status === 'in_progress').length, icon: Clock, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { label: 'Completed', value: requests.filter((r) => r.status === 'completed').length, icon: CheckCircle2, color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  ];

  if (isLoading) {
    return <div className="min-h-screen bg-transparent flex items-center justify-center text-zinc-400 font-mono">Loading Maintenance Requests...</div>;
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 text-zinc-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Operations & Facilities</span>
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mt-1">Maintenance Queue</h1>
          <p className="text-xs text-zinc-400 mt-1">Track physical property repairs, dispatch technicians, and audit completion dates.</p>
        </div>
        <button
          onClick={() => setIsLogOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Log Maintenance</span>
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
            placeholder="Search tickets, properties or tenants..."
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
          {(['all', 'open', 'in_progress', 'completed'] as const).map((tab) => (
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
              {tab === 'in_progress' ? 'In Progress' : tab}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                tab === 'open' ? 'bg-red-500/20 text-red-300' :
                tab === 'in_progress' ? 'bg-amber-500/20 text-amber-300' :
                tab === 'completed' ? 'bg-emerald-700/50 text-emerald-200' :
                'bg-zinc-700 text-zinc-300'
              }`}>
                {tab === 'all' ? requests.length : requests.filter((r) => r.status === tab).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Maintenance Table */}
      <div className="space-y-4">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-white/[0.04] text-zinc-400 text-[10px] uppercase tracking-wider font-bold border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-semibold">Request</th>
                  <th className="px-6 py-4 font-semibold">Property / Tenant</th>
                  <th className="px-6 py-4 font-semibold">Timeline</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {paginatedRequests.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setInspectTicket(r)}
                    className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400 shrink-0">
                          <Wrench size={18} />
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                            {r.title}
                          </div>
                          <div className="text-xs text-zinc-400 truncate max-w-xs mt-0.5">
                            {r.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-zinc-200 font-medium flex items-center gap-1">
                        <Building size={12} className="text-zinc-500" />
                        {r.property_name || 'General Asset'}
                      </div>
                      <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                        <User size={12} className="text-zinc-500" />
                        {r.tenant_name || 'Resident'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-zinc-400">
                      <div>Logged: {r.request_date ? new Date(r.request_date).toLocaleDateString() : '-'}</div>
                      {r.completion_date && (
                        <div className="text-emerald-400">Done: {new Date(r.completion_date).toLocaleDateString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase ${
                        r.status === 'open' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        r.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {r.status === 'in_progress' ? 'In Progress' : r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={r.status}
                          onChange={(e) => updateStatus(r.id, e.target.value as any)}
                          className="bg-[#0b101b] text-xs text-white border border-white/15 rounded-lg px-2 py-1 outline-none focus:border-emerald-500"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>

                        <button
                          onClick={() => setInspectTicket(r)}
                          className="p-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                          title="View Ticket Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingId(r.id)}
                          className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          title="Delete Ticket"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRequests.length === 0 && (
              <div className="p-12 text-center text-zinc-500">No maintenance tickets found matching this filter.</div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalItems={filteredRequests.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel="tickets"
        />
      </div>

      {/* View Ticket Details Modal */}
      {inspectTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="font-mono text-emerald-400 font-bold text-xs uppercase">
                  Maintenance Ticket #{inspectTicket.id}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{inspectTicket.title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Property: {inspectTicket.property_name || 'N/A'} • Tenant: {inspectTicket.tenant_name || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setInspectTicket(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.04]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 block text-[10px] font-bold uppercase">Status</span>
                <span className="font-semibold text-white capitalize mt-0.5 block">{inspectTicket.status}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 block text-[10px] font-bold uppercase">Date Logged</span>
                <span className="font-mono text-white mt-0.5 block">
                  {inspectTicket.request_date ? new Date(inspectTicket.request_date).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 block text-[10px] font-bold uppercase">Completion</span>
                <span className="font-mono text-emerald-400 mt-0.5 block">
                  {inspectTicket.completion_date ? new Date(inspectTicket.completion_date).toLocaleDateString() : 'Pending'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-300 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">Incident Description</span>
              <p className="leading-relaxed whitespace-pre-wrap">{inspectTicket.description}</p>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setInspectTicket(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Maintenance Modal */}
      {isLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus size={18} className="text-emerald-400" />
              Log Maintenance Ticket
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Issue Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Water leak in Unit 4B"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Detailed Description *</label>
                <textarea
                  rows={4}
                  placeholder="Provide details about the issue, location inside the property, urgency..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsLogOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={createMaintenanceMutation.isPending || !newTicket.title}
                onClick={() => createMaintenanceMutation.mutate(newTicket)}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                {createMaintenanceMutation.isPending ? 'Logging...' : 'Log Ticket'}
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
              Delete Maintenance Ticket
            </h3>
            <p className="text-xs text-zinc-300">
              Are you sure you want to delete maintenance ticket #{deletingId}? This action cannot be undone.
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
                disabled={deleteMaintenanceMutation.isPending}
                onClick={() => deleteMaintenanceMutation.mutate(deletingId)}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
              >
                {deleteMaintenanceMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMaintenance;

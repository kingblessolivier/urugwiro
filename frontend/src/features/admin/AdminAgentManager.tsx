import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShieldCheck, CheckCircle2, Clock, Briefcase, User, Trash2, Eye, 
  Edit, Plus, Star, Search, X, MapPin, Mail, Phone, Award, Building 
} from 'lucide-react';
import { api } from '../../api/endpoints';
import { Pagination } from '../../components/ui/Pagination';

interface Stat {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}

const AdminAgentManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [inspectAgent, setInspectAgent] = useState<any | null>(null);
  const [editingAgent, setEditingAgent] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Agent Form State
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    phone: '',
    license_number: '',
    specialization: 'Residential Sales',
  });

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['admin-agents'],
    queryFn: async () => {
      const response = await api.admin.agents();
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const toggleVerifyMutation = useMutation({
    mutationFn: async ({ id, is_verified }: { id: number; is_verified: boolean }) => {
      return api.admin.updateAgent(id, { is_verified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agents'] });
    },
  });

  const createAgentMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.admin.createAgent(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agents'] });
      setIsAddOpen(false);
      setNewAgent({ name: '', email: '', phone: '', license_number: '', specialization: 'Residential Sales' });
    },
  });

  const updateAgentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return api.admin.updateAgent(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agents'] });
      setEditingAgent(null);
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.admin.deleteAgent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agents'] });
      setDeletingId(null);
      if (inspectAgent && inspectAgent.id === deletingId) {
        setInspectAgent(null);
      }
    },
  });

  const toggleVerify = (id: number, currentStatus: boolean) => {
    toggleVerifyMutation.mutate({ id, is_verified: !currentStatus });
  };

  const filteredAgents = useMemo(() => {
    return agents.filter((a: any) => {
      const term = search.toLowerCase();
      return (
        !search ||
        (a.name && a.name.toLowerCase().includes(term)) ||
        (a.email && a.email.toLowerCase().includes(term)) ||
        (a.phone && a.phone.toLowerCase().includes(term)) ||
        (a.license_number && a.license_number.toLowerCase().includes(term)) ||
        (a.specialization && a.specialization.toLowerCase().includes(term))
      );
    });
  }, [agents, search]);

  const paginatedAgents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAgents.slice(start, start + pageSize);
  }, [filteredAgents, page, pageSize]);

  const stats: Stat[] = [
    { label: 'Field Brokers', value: agents.length, icon: Briefcase, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { label: 'RERA Certified', value: agents.filter((a: any) => a.is_verified).length, icon: ShieldCheck, color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
    { label: 'Pending Certification', value: agents.filter((a: any) => !a.is_verified).length, icon: Clock, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  ];

  if (isLoading) {
    return <div className="min-h-screen bg-transparent flex items-center justify-center text-zinc-400 font-mono">Loading Agents...</div>;
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 text-zinc-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Broker Guild</span>
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mt-1">Field Agents & Brokers</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage certified real estate brokers, RERA license credentials, and deal volume.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Agent</span>
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
            placeholder="Search by name, email, phone, license or specialization..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-white outline-none focus:border-emerald-500/50"
          />
        </div>
        <div className="text-xs font-mono text-zinc-400">
          {filteredAgents.length} brokers
        </div>
      </div>

      {/* Agents Table */}
      <div className="space-y-4">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-white/[0.04] text-zinc-400 text-[10px] uppercase tracking-wider font-bold border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-semibold">Agent</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Phone</th>
                  <th className="px-6 py-4 font-semibold">Specialization</th>
                  <th className="px-6 py-4 font-semibold">RERA License</th>
                  <th className="px-6 py-4 font-semibold">Rating</th>
                  <th className="px-6 py-4 font-semibold">Deals</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {paginatedAgents.map((agent: any) => (
                  <tr
                    key={agent.id}
                    onClick={() => setInspectAgent(agent)}
                    className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400 shrink-0 overflow-hidden">
                          {agent.image ? (
                            <img src={agent.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={16} />
                          )}
                        </div>
                        <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          {agent.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-mono">
                      {agent.email}
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-mono">
                      {agent.phone || agent.phone_number || '-'}
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      {agent.specialization || 'General Brokerage'}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono">
                      {agent.license_number || 'Pending'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-400 font-mono">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        {Number(agent.rating || 0).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-mono font-bold">
                      {agent.total_deals ?? 0}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleVerify(agent.id, agent.is_verified)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase transition-colors cursor-pointer ${
                          agent.is_verified
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30'
                        }`}
                        title={agent.is_verified ? 'Click to Revoke Certification' : 'Click to Verify Certification'}
                      >
                        {agent.is_verified ? (
                          <>
                            <ShieldCheck size={12} />
                            <span>Certified</span>
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
                          onClick={() => setInspectAgent(agent)}
                          className="p-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                          title="View Dossier"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setEditingAgent(agent)}
                          className="p-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-amber-400 hover:bg-white/[0.05] transition-colors"
                          title="Edit Agent"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingId(agent.id)}
                          className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          title="Delete Agent"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAgents.length === 0 && (
              <div className="p-12 text-center text-zinc-500">No agents found matching your search.</div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalItems={filteredAgents.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel="brokers"
        />
      </div>

      {/* View Agent Dossier Modal */}
      {inspectAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
                  {inspectAgent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{inspectAgent.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-emerald-400 font-mono">Broker ID #{inspectAgent.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      inspectAgent.is_verified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {inspectAgent.is_verified ? 'Certified Broker' : 'Pending Certification'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectAgent(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.04]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-[10px] font-bold uppercase text-zinc-500 block">Licensing & Credentials</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">RERA License</span>
                    <span className="font-mono text-white font-semibold">{inspectAgent.license_number || 'Under Review'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Specialization</span>
                    <span className="text-emerald-400 font-semibold">{inspectAgent.specialization || 'General'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Rating</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1 font-mono">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      {Number(inspectAgent.rating || 0).toFixed(1)} / 5.0
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Closed Deals</span>
                    <span className="text-white font-bold font-mono">{inspectAgent.total_deals ?? 0}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-[10px] font-bold uppercase text-zinc-500 block">Contact Channels</span>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Mail size={14} className="text-emerald-400" />
                  <span>{inspectAgent.email}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Phone size={14} className="text-emerald-400" />
                  <span>{inspectAgent.phone || inspectAgent.phone_number || 'No phone recorded'}</span>
                </div>
              </div>

              {inspectAgent.bio && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-300 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-zinc-500 block">Professional Bio</span>
                  <p className="leading-relaxed">{inspectAgent.bio}</p>
                </div>
              )}

              {/* Assigned Properties */}
              {inspectAgent.properties && inspectAgent.properties.length > 0 && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-zinc-500 block">Assigned Properties</span>
                  {inspectAgent.properties.map((p: any) => (
                    <div key={p.id} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{p.title}</p>
                        <p className="text-[10px] text-zinc-400">{p.city} • {p.property_type}</p>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">{Number(p.price).toLocaleString()} RWF</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setInspectAgent(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {editingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Edit size={18} className="text-amber-400" />
              Edit Broker #{editingAgent.id}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingAgent.name}
                  onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={editingAgent.email}
                  onChange={(e) => setEditingAgent({ ...editingAgent, email: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingAgent.phone || editingAgent.phone_number || ''}
                  onChange={(e) => setEditingAgent({ ...editingAgent, phone: e.target.value, phone_number: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">RERA License</label>
                  <input
                    type="text"
                    value={editingAgent.license_number || ''}
                    onChange={(e) => setEditingAgent({ ...editingAgent, license_number: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Specialization</label>
                  <input
                    type="text"
                    value={editingAgent.specialization || ''}
                    onChange={(e) => setEditingAgent({ ...editingAgent, specialization: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingAgent(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updateAgentMutation.isPending}
                onClick={() => updateAgentMutation.mutate({ id: editingAgent.id, data: editingAgent })}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                {updateAgentMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Agent Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus size={18} className="text-emerald-400" />
              Add Field Broker
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Broker Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Jean-Luc Karasira"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Email *</label>
                <input
                  type="email"
                  placeholder="e.g. jl.karasira@urugwiro.rw"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +250 788 444 555"
                  value={newAgent.phone}
                  onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">RERA License</label>
                  <input
                    type="text"
                    placeholder="e.g. RERA-RW-2024-08"
                    value={newAgent.license_number}
                    onChange={(e) => setNewAgent({ ...newAgent, license_number: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Luxury Residential"
                    value={newAgent.specialization}
                    onChange={(e) => setNewAgent({ ...newAgent, specialization: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
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
                disabled={createAgentMutation.isPending || !newAgent.name || !newAgent.email}
                onClick={() => createAgentMutation.mutate(newAgent)}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                {createAgentMutation.isPending ? 'Adding...' : 'Add Agent'}
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
              Delete Broker
            </h3>
            <p className="text-xs text-zinc-300">
              Are you sure you want to delete this broker? This action cannot be undone.
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
                disabled={deleteAgentMutation.isPending}
                onClick={() => deleteAgentMutation.mutate(deletingId)}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
              >
                {deleteAgentMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgentManager;

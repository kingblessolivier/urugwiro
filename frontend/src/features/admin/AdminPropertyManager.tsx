import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building, CheckCircle2, Handshake, DollarSign, Eye,
  Trash2, Edit, Plus, Search, MapPin, UserCheck, X, ShieldAlert
} from 'lucide-react';
import { api } from '../../api/endpoints';
import { Pagination } from '../../components/ui/Pagination';
import { Button } from '../../components/ui/Button';

interface Stat {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}

interface Stat {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}

const AdminPropertyManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Modals state
  const [inspectProperty, setInspectProperty] = useState<any | null>(null);
  const [editingProperty, setEditingProperty] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Property Form State
  const [newProp, setNewProp] = useState({
    title: '',
    price: '',
    type: 'House',
    city: 'Kigali',
    address: '',
    description: '',
  });

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const response = await api.admin.properties();
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['admin-agents'],
    queryFn: async () => {
      const response = await api.admin.agents();
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const assignAgentMutation = useMutation({
    mutationFn: async ({ propertyId, agentId }: { propertyId: number; agentId: string }) => {
      return api.admin.assignPropertyAgent(propertyId, agentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
    },
  });

  const createPropertyMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.admin.createProperty(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      setIsAddOpen(false);
      setNewProp({ title: '', price: '', type: 'House', city: 'Kigali', address: '', description: '' });
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return api.admin.updateProperty(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      setEditingProperty(null);
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.admin.deleteProperty(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      setDeletingId(null);
      if (inspectProperty && inspectProperty.id === deletingId) {
        setInspectProperty(null);
      }
    },
  });

  const filteredProperties = useMemo(() => {
    return properties.filter((p: any) => {
      const term = search.toLowerCase();
      return (
        !search ||
        (p.title && p.title.toLowerCase().includes(term)) ||
        (p.city && p.city.toLowerCase().includes(term)) ||
        (p.address && p.address.toLowerCase().includes(term)) ||
        (p.seller?.name && p.seller.name.toLowerCase().includes(term))
      );
    });
  }, [properties, search]);

  const paginatedProperties = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProperties.slice(start, start + pageSize);
  }, [filteredProperties, page, pageSize]);

  const stats: Stat[] = [
    { label: 'Total Listings', value: properties.length, icon: Building, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { label: 'Active', value: properties.filter((p: any) => p.status === 'listed').length, icon: CheckCircle2, color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
    { label: 'Negotiating', value: properties.filter((p: any) => p.status === 'under_negotiation').length, icon: Handshake, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { label: 'Sold', value: properties.filter((p: any) => p.status === 'sold').length, icon: DollarSign, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'listed':
        return <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30 uppercase tracking-wider">Active</span>;
      case 'under_negotiation':
        return <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/30 uppercase tracking-wider">Negotiating</span>;
      case 'sold':
        return <span className="px-2.5 py-1 text-[10px] font-bold bg-sky-500/10 text-sky-400 rounded-full border border-sky-500/30 uppercase tracking-wider">Sold</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] font-bold bg-white/5 text-zinc-400 rounded-full border border-white/10 uppercase tracking-wider">Draft</span>;
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-transparent flex items-center justify-center text-zinc-400 font-mono">Loading Properties...</div>;
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 text-zinc-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-emerald-400">Inventory Management</span>
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight mt-1">Sale Properties</h1>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mt-1">Oversee properties, inspect dossiers, and assign verified agents.</p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          variant="primary"
          className="text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>New Property</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-[#0A0C12] border border-white/10 p-6 rounded-sm flex items-center gap-4 shadow-lg transition-all duration-300 hover:border-emerald-500/40 group">
              <div className={`w-10 h-10 rounded-sm flex items-center justify-center border ${stat.color}`}>
                <Icon size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-mono font-bold text-white mt-0.5">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-sm border border-white/10 bg-[#0A0C12] flex items-center justify-between shadow-sm">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by title, city, address or seller..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white/[0.04] border border-white/10 rounded-sm py-2 pl-10 pr-4 text-xs sm:text-sm text-white outline-none focus:border-emerald-500 transition-all duration-300"
          />
        </div>
        <div className="text-xs font-mono text-zinc-400">
          {filteredProperties.length} properties
        </div>
      </div>

      {/* Properties Table */}
      <div className="space-y-4">
        <div className="bg-[#0A0C12] border border-white/10 rounded-sm overflow-hidden shadow-xl shadow-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-white/[0.04] text-zinc-400 text-[10px] uppercase tracking-wider font-bold border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-semibold">Property</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Seller</th>
                  <th className="px-6 py-4 font-semibold">Agent</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {paginatedProperties.map((p: any) => (
                  <tr
                    key={p.id}
                    onClick={() => setInspectProperty(p)}
                    className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-sm bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400 shrink-0 overflow-hidden">
                          {p.image ? (
                            <img src={p.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Building size={18} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{p.title}</p>
                          <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={11} className="text-zinc-500" />
                            {p.city}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-white/[0.04] text-zinc-300 rounded-sm border border-white/10 uppercase">
                        {p.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-medium">
                      {p.seller?.name || 'Platform Seller'}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      {p.agent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 rounded-sm border border-emerald-500/20">
                          <UserCheck size={12} />
                          {p.agent.name}
                        </span>
                      ) : (
                        <select
                          className="bg-[#0b101b] border border-white/15 rounded-sm px-2 py-1 text-xs text-zinc-300 outline-none focus:border-emerald-500"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              assignAgentMutation.mutate({ propertyId: p.id, agentId: e.target.value });
                            }
                          }}
                        >
                          <option value="">Assign Agent...</option>
                          {agents.map((ag: any) => (
                            <option key={ag.id} value={ag.id}>
                              {ag.name} ({ag.specialization || 'Broker'})
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                      {Number(p.price).toLocaleString()} RWF
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectProperty(p)}
                          className="p-1.5 rounded-sm border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                          title="View Dossier"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setEditingProperty(p)}
                          className="p-1.5 rounded-sm border border-white/10 text-zinc-400 hover:text-amber-400 hover:bg-white/[0.05] transition-colors"
                          title="Edit Property"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingId(p.id)}
                          className="p-1.5 rounded-sm border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          title="Delete Property"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProperties.length === 0 && (
              <div className="p-12 text-center text-zinc-500">No properties found matching your search.</div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalItems={filteredProperties.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel="properties"
        />
      </div>

      {/* View Property Dossier Modal */}
      {inspectProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="font-mono text-emerald-400 font-bold text-xs uppercase">
                  Property Dossier #{inspectProperty.id}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{inspectProperty.title}</h3>
                <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                  <MapPin size={12} className="text-emerald-400" />
                  {inspectProperty.address || inspectProperty.city}
                </p>
              </div>
              <button
                onClick={() => setInspectProperty(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.04]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 block text-[10px] font-bold uppercase">Price</span>
                <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">
                  {Number(inspectProperty.price).toLocaleString()} RWF
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 block text-[10px] font-bold uppercase">Type</span>
                <span className="font-semibold text-white mt-0.5 block">{inspectProperty.type}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 block text-[10px] font-bold uppercase">Status</span>
                <span className="font-semibold text-white capitalize mt-0.5 block">{inspectProperty.status}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 block text-[10px] font-bold uppercase">Assigned Agent</span>
                <span className="font-semibold text-emerald-400 mt-0.5 block">
                  {inspectProperty.agent?.name || 'Unassigned'}
                </span>
              </div>
            </div>

            {inspectProperty.description && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-300 space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-500 block">Description</span>
                <p className="leading-relaxed">{inspectProperty.description}</p>
              </div>
            )}

            {/* Seller Contact Info */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-500 block">Seller Information</span>
                <span className="font-semibold text-white block mt-0.5">{inspectProperty.seller?.name || 'N/A'}</span>
                <span className="text-zinc-400 block">{inspectProperty.seller?.email || ''}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-500 block">Seller Phone</span>
                <span className="font-mono text-emerald-400 block mt-0.5">{inspectProperty.seller?.phone || 'No phone registered'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setInspectProperty(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Edit size={18} className="text-amber-400" />
              Edit Property #{editingProperty.id}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Title</label>
                <input
                  type="text"
                  value={editingProperty.title}
                  onChange={(e) => setEditingProperty({ ...editingProperty, title: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Price (RWF)</label>
                  <input
                    type="number"
                    value={editingProperty.price}
                    onChange={(e) => setEditingProperty({ ...editingProperty, price: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Status</label>
                  <select
                    value={editingProperty.status}
                    onChange={(e) => setEditingProperty({ ...editingProperty, status: e.target.value })}
                    className="w-full bg-[#0b101b] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  >
                    <option value="listed">Listed (Active)</option>
                    <option value="under_negotiation">Under Negotiation</option>
                    <option value="sold">Sold</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Address</label>
                <input
                  type="text"
                  value={editingProperty.address || ''}
                  onChange={(e) => setEditingProperty({ ...editingProperty, address: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProperty.description || ''}
                  onChange={(e) => setEditingProperty({ ...editingProperty, description: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingProperty(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatePropertyMutation.isPending}
                onClick={() => updatePropertyMutation.mutate({ id: editingProperty.id, data: editingProperty })}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                {updatePropertyMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Property Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus size={18} className="text-emerald-400" />
              Add New Property
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Property Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Modern Villa in Nyarutarama"
                  value={newProp.title}
                  onChange={(e) => setNewProp({ ...newProp, title: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Price (RWF) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 120000000"
                    value={newProp.price}
                    onChange={(e) => setNewProp({ ...newProp, price: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Type</label>
                  <select
                    value={newProp.type}
                    onChange={(e) => setNewProp({ ...newProp, type: e.target.value })}
                    className="w-full bg-[#0b101b] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  >
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Land">Land</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Villa">Villa</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">City</label>
                  <input
                    type="text"
                    value={newProp.city}
                    onChange={(e) => setNewProp({ ...newProp, city: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="e.g. KG 123 St, Gasabo"
                    value={newProp.address}
                    onChange={(e) => setNewProp({ ...newProp, address: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Property specifications and highlights..."
                  value={newProp.description}
                  onChange={(e) => setNewProp({ ...newProp, description: e.target.value })}
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
                disabled={createPropertyMutation.isPending || !newProp.title || !newProp.price}
                onClick={() => createPropertyMutation.mutate(newProp)}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                {createPropertyMutation.isPending ? 'Creating...' : 'Create Listing'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-sm border border-red-500/30 bg-[#0A0C12] p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <Trash2 className="text-red-400" size={18} />
              Delete Property
            </h3>
            <p className="text-xs text-zinc-300 font-mono">
              Are you sure you want to delete property #{deletingId}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 rounded-sm border border-white/10 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletePropertyMutation.isPending}
                onClick={() => deletePropertyMutation.mutate(deletingId)}
                className="px-4 py-1.5 rounded-sm bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
              >
                {deletePropertyMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPropertyManager;

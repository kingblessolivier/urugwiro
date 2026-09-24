import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Building2, Search, Filter, Calendar, MapPin, ShieldCheck,
  User, Phone, MessageSquare, ExternalLink, ChevronRight,
  Eye, DollarSign, Layers, Plus
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { api } from '../../api/endpoints';
import { AgentPropertyDrawer } from './components/AgentPropertyDrawer';

interface AgentPropertyManagerProps {
  onScheduleVisit?: (propertyId: number | string) => void;
}

export const AgentPropertyManager: React.FC<AgentPropertyManagerProps> = ({ onScheduleVisit }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'house' | 'land' | 'commercial' | 'car'>('all');
  const [inspectingPropertyId, setInspectingPropertyId] = useState<number | string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['agent-properties'],
    queryFn: async () => {
      const res = await api.agent.properties();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const filteredProperties = properties.filter((p: any) => {
    const matchesSearch =
      (p.title && p.title.toLowerCase().includes(search.toLowerCase())) ||
      (p.location && p.location.toLowerCase().includes(search.toLowerCase())) ||
      (p.upi_number && p.upi_number.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const paginatedProperties = filteredProperties.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Building2 size={22} className="text-emerald-500" /> Assigned Asset Portfolio
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Exclusive representation portfolio, cadastral dossiers, and owner co-brokering coordination.
          </p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs px-3 py-1 font-bold">
          {filteredProperties.length} Assets Under Management
        </Badge>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Assets' },
            { id: 'house', label: 'Villas & Homes' },
            { id: 'land', label: 'Titled Plots' },
            { id: 'commercial', label: 'Commercial' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setCategoryFilter(tab.id as any);
                setPage(1);
              }}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-white dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by title, location, or UPI..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Grid of Properties */}
      {isLoading ? (
        <div className="p-12 text-center text-zinc-400 text-sm">Loading assigned portfolio...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedProperties.map((prop: any) => (
              <div
                key={prop.id}
                onClick={() => setInspectingPropertyId(prop.id)}
                className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
              >
              <div>
                {/* Media Container */}
                <div className="relative h-48 w-full bg-zinc-100 dark:bg-white/[0.03] overflow-hidden">
                  <img
                    src={prop.image}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <Badge className="bg-black/60 backdrop-blur-md text-white border-white/20 text-[10px] font-bold uppercase">
                      {prop.category}
                    </Badge>
                    {prop.verified && (
                      <Badge className="bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1">
                        <ShieldCheck size={11} /> Verified
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-white font-mono font-bold text-xs">
                      {Number(prop.price).toLocaleString()} {prop.currency}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-emerald-500 transition-colors">
                    {prop.title}
                  </h3>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <MapPin size={13} className="text-emerald-500 shrink-0" />
                    <span className="truncate">{prop.location}</span>
                  </p>

                  {/* UPI Badge */}
                  {prop.upi_number && (
                    <div className="p-2 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 uppercase font-bold">UPI</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{prop.upi_number}</span>
                    </div>
                  )}

                  {/* Owner Contact Snippet */}
                  {prop.owner && (
                    <div className="pt-2 border-t border-zinc-100 dark:border-white/5 flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Principal: <strong className="text-zinc-700 dark:text-zinc-300">{prop.owner.name}</strong></span>
                      <div className="flex gap-1.5">
                        <a
                          href={`tel:${prop.owner.phone}`}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-white/[0.05] hover:bg-emerald-500/10 hover:text-emerald-500 text-zinc-600 dark:text-zinc-400 transition-colors"
                          title="Call Owner"
                        >
                          <Phone size={12} />
                        </a>
                        <a
                          href={`https://wa.me/${prop.owner.phone?.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-white/[0.05] hover:bg-emerald-500/10 hover:text-emerald-500 text-zinc-600 dark:text-zinc-400 transition-colors"
                          title="WhatsApp Owner"
                        >
                          <MessageSquare size={12} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setInspectingPropertyId(prop.id)}
                  className="flex-1 rounded-xl text-xs font-bold py-2 border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/[0.04]"
                >
                  <Eye size={13} className="mr-1" /> Dossier
                </Button>
                {onScheduleVisit && (
                  <Button
                    size="sm"
                    onClick={() => onScheduleVisit(prop.id)}
                    className="flex-1 rounded-xl text-xs font-bold py-2 bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <Calendar size={13} className="mr-1" /> Showing
                  </Button>
                )}
              </div>
            </div>
          ))}

          {filteredProperties.length === 0 && (
            <div className="col-span-full rounded-3xl border border-zinc-200 dark:border-white/10 p-12 text-center text-zinc-400 bg-zinc-50/50 dark:bg-white/[0.01]">
              <Building2 size={36} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
              <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No properties match your filter</h3>
              <p className="text-xs text-zinc-500 mt-1">Properties assigned to your broker account will appear here.</p>
            </div>
          )}
          </div>

          {filteredProperties.length > 0 && (
            <div className="pt-2">
              <Pagination
                currentPage={page}
                totalPages={Math.max(1, Math.ceil(filteredProperties.length / pageSize))}
                onPageChange={setPage}
                pageSize={pageSize}
                onPageSizeChange={(sz) => { setPageSize(sz); setPage(1); }}
                totalItems={filteredProperties.length}
              />
            </div>
          )}
        </div>
      )}

      {/* Deep Inspection Drawer */}
      {inspectingPropertyId && (
        <AgentPropertyDrawer
          propertyId={inspectingPropertyId}
          onClose={() => setInspectingPropertyId(null)}
          onScheduleVisit={onScheduleVisit}
        />
      )}
    </div>
  );
};

export default AgentPropertyManager;

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserCheck, ShieldCheck, Star, Phone, Mail, CheckCircle2,
  Check
} from 'lucide-react';
import { api } from '../../../api/endpoints';

interface SellerAgentNetworkProps {
  listings: any[];
  onRefresh: () => void;
}

export const SellerAgentNetwork: React.FC<SellerAgentNetworkProps> = ({ listings, onRefresh }) => {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string>('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [notes, setNotes] = useState('');

  // Fetch verified agents
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['seller-agents-directory'],
    queryFn: async () => {
      const res = await api.seller.agents();
      return res.data;
    },
  });

  // Assign agent mutation
  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!selectedListingId || !selectedAgent) return;
      return api.seller.assignAgent(selectedListingId, {
        agent_id: selectedAgent.id,
        notes: notes || 'Direct seller representation assignment.',
      });
    },
    onSuccess: () => {
      alert(`Agent ${selectedAgent?.name} successfully assigned to co-broker your asset!`);
      setAssignModalOpen(false);
      setSelectedAgent(null);
      setSelectedListingId('');
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['seller-database-listings'] });
      onRefresh();
    },
    onError: (err: any) => {
      alert(`Assignment failed: ${err?.response?.data?.message || err.message}`);
    }
  });

  const handleOpenAssign = (agent: any) => {
    setSelectedAgent(agent);
    if (listings.length > 0) {
      setSelectedListingId(String(listings[0].id));
    }
    setAssignModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-[var(--color-text-main)]">Verified Agent & Broker Network</h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Partner with licensed Rwandan real estate concierges and co-brokers to accelerate showings and sales.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[var(--color-brand-emerald)] text-xs font-semibold">
          <ShieldCheck size={14} />
          <span>RERA & Gasabo/Kicukiro Registered</span>
        </div>
      </div>

      {/* Agents Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-[var(--color-text-dim)]">
          <p className="text-xs">Loading verified Rwandan agent registry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent: any) => (
            <div
              key={agent.id}
              className="p-6 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-soft-bg)] border border-emerald-500/30 flex items-center justify-center font-bold text-[var(--color-brand-emerald)] text-base">
                        {agent.image ? (
                          <img src={agent.image} alt={agent.name} className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                          agent.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <CheckCircle2 size={14} className="absolute -bottom-1 -right-1 text-[var(--color-brand-emerald)] bg-[var(--color-bg-surface)] rounded-full" />
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-[var(--color-text-main)] group-hover:text-[var(--color-brand-emerald)] transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{agent.specialization}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          <Star size={12} className="fill-amber-400" />
                          {agent.rating}
                        </span>
                        <span className="text-[var(--color-text-dim)]">•</span>
                        <span className="text-[11px] text-[var(--color-text-muted)] font-mono">{agent.total_deals} Closed Deals</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--color-border)] space-y-2 text-xs text-[var(--color-text-muted)]">
                  <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                    <Phone size={12} className="text-[var(--color-text-dim)]" />
                    <span className="font-mono">{agent.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                    <Mail size={12} className="text-[var(--color-text-dim)]" />
                    <span className="truncate">{agent.email}</span>
                  </div>
                  {agent.license_number && (
                    <div className="text-[10px] font-mono text-[var(--color-brand-emerald)] bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10 inline-block">
                      License: {agent.license_number}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleOpenAssign(agent)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[var(--color-brand-emerald)] font-semibold text-xs flex items-center justify-center gap-2 transition-all group-hover:bg-emerald-600 group-hover:text-[#fff]"
              >
                <UserCheck size={14} />
                <span>Assign to Property</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Assign to Property Modal */}
      {assignModalOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-5 shadow-[var(--shadow-depth-1)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-main)]">Assign Co-Broker</h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Assign {selectedAgent.name} to represent your asset.</p>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="p-1 rounded-lg bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] block mb-1">Select Property from Inventory</label>
                {listings.length === 0 ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400">You don't have any active listings yet.</p>
                ) : (
                  <select
                    value={selectedListingId}
                    onChange={(e) => setSelectedListingId(e.target.value)}
                    className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-emerald-500/50"
                  >
                    {listings.map((l: any) => (
                      <option key={l.id} value={l.id}>
                        {l.title} ({Number(l.price).toLocaleString()} {l.currency})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] block mb-1">Co-Brokering Instructions / Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Authorized to conduct site visits; minimum offer 120M RWF."
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl p-3 text-xs text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-card-hover)] text-xs text-[var(--color-text-muted)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => assignMutation.mutate()}
                disabled={assignMutation.isPending || !selectedListingId}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] text-xs font-semibold flex items-center gap-1.5 shadow-[var(--shadow-emerald-soft)] transition-all disabled:opacity-50"
              >
                <Check size={14} />
                <span>{assignMutation.isPending ? 'Assigning...' : 'Confirm Assignment'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

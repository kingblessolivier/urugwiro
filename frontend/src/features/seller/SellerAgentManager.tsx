import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCheck, User, Phone, Mail, Star, X, Check } from 'lucide-react';
import { api } from '../../api/endpoints';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

interface SellerAgentManagerProps {
  listingId?: string;
}

const SellerAgentManager: React.FC<SellerAgentManagerProps> = ({ listingId }) => {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['seller-agents'],
    queryFn: async () => {
      try {
        const res = await api.seller.agents();
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({ agentId, notes }: { agentId: number; notes?: string }) => {
      if (!listingId) return;
      return api.seller.assignAgent(listingId, { agent_id: agentId, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-agents'] });
      queryClient.invalidateQueries({ queryKey: ['seller-database-listings'] });
      setIsAssigning(false);
      setSelectedAgent(null);
    },
  });

  const handleAssign = (agent: any) => {
    setSelectedAgent(agent);
    setIsAssigning(true);
  };

  const confirmAssign = () => {
    if (!selectedAgent) return;
    assignMutation.mutate({ agentId: selectedAgent.id });
  };

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-1)]">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <UserCheck size={18} className="text-[var(--color-brand-emerald)]" />
          <h3 className="text-base font-sans font-bold text-[var(--color-text-main)] tracking-tight">
            Agent Network
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[var(--color-text-dim)] uppercase tracking-wider">
          {agents.length} agents available
        </span>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-[var(--color-text-muted)]">Loading agents...</div>
      ) : agents.length === 0 ? (
        <div className="p-8 text-center text-[var(--color-text-dim)]">
          <UserCheck size={32} className="mx-auto mb-2" />
          <p className="text-sm">No agents available in your network.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((agent: any) => (
            <div
              key={agent.id}
              className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:border-emerald-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                  {agent.full_name?.[0]?.toUpperCase() || agent.username?.[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-text-main)]">{agent.full_name || agent.username}</p>
                  <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
                    {agent.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={10} />
                        {agent.phone}
                      </span>
                    )}
                    {agent.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={10} />
                        {agent.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {agent.rating && (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-amber-600 dark:text-amber-400">
                    <Star size={12} className="fill-amber-500" />
                    {agent.rating}
                  </span>
                )}
                {listingId && (
                  <Button
                    variant="ghost"
                    className="text-xs text-[var(--color-brand-emerald)] hover:text-[var(--color-text-main)] border border-[var(--color-border)] rounded-xl cursor-pointer"
                    onClick={() => handleAssign(agent)}
                  >
                    Assign
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Confirmation Modal */}
      {isAssigning && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 space-y-4 shadow-[var(--shadow-depth-1)]">
            <h3 className="text-lg font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <UserCheck className="text-[var(--color-brand-emerald)]" size={18} />
              Assign Agent
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Are you sure you want to assign <strong>{selectedAgent.full_name || selectedAgent.username}</strong> to this property?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAssigning(false);
                  setSelectedAgent(null);
                }}
                className="px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={assignMutation.isPending}
                onClick={confirmAssign}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-[#fff] text-xs font-bold transition-colors"
              >
                {assignMutation.isPending ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerAgentManager;

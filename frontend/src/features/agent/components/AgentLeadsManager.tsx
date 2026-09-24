import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Phone, Mail, CheckCircle2, Clock, Building, Calendar, ArrowRight, User } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { api } from '../../../api/endpoints';

interface AgentLeadsManagerProps {
  onScheduleVisit?: (listingId: number) => void;
}

export const AgentLeadsManager: React.FC<AgentLeadsManagerProps> = ({ onScheduleVisit }) => {
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['agent-leads'],
    queryFn: async () => {
      const res = await api.agent.leads();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.agent.markLeadRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-leads'] });
      queryClient.invalidateQueries({ queryKey: ['agent-dashboard'] });
    },
  });

  const unreadCount = leads.filter((l: any) => !l.is_read).length;

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-400">Loading buyer inquiries...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <MessageSquare size={22} className="text-emerald-500" /> Buyer Leads & Inquiries CRM
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Prospective buyer leads generated across your assigned property portfolio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge className="bg-amber-500 text-white font-bold text-xs px-3 py-1">
              {unreadCount} New Leads
            </Badge>
          )}
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs px-3 py-1 font-bold">
            {leads.length} Total Leads
          </Badge>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {leads.map((lead: any) => (
          <div
            key={lead.id}
            className={`rounded-3xl border transition-all p-5 shadow-sm space-y-4 ${
              !lead.is_read
                ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/10'
                : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02]'
            }`}
          >
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {!lead.is_read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <User size={15} className="text-zinc-400" /> {lead.name}
                  </h3>
                  <span className="text-xs text-zinc-400">•</span>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Building size={12} /> {lead.listing_title}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                  <span>Tel: <strong className="font-mono text-zinc-700 dark:text-zinc-300">{lead.phone || 'N/A'}</strong></span>
                  <span>•</span>
                  <span>Email: <strong className="text-zinc-700 dark:text-zinc-300">{lead.email}</strong></span>
                  <span>•</span>
                  <span className="text-zinc-400">{lead.created_at}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {lead.phone && (
                  <a
                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <MessageSquare size={13} /> WhatsApp
                  </a>
                )}
                {lead.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    className="py-1.5 px-3 rounded-xl bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Phone size={13} /> Call
                  </a>
                )}
                {onScheduleVisit && lead.listing_id && (
                  <Button
                    size="sm"
                    onClick={() => onScheduleVisit(lead.listing_id)}
                    className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <Calendar size={13} className="mr-1" /> Book Showing
                  </Button>
                )}
                {!lead.is_read && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => markReadMutation.mutate(lead.id)}
                    className="rounded-xl text-xs py-1 px-2.5 border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  >
                    <CheckCircle2 size={13} />
                  </Button>
                )}
              </div>
            </div>

            {/* Inquiry Message */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/5 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
              "{lead.message}"
            </div>
          </div>
        ))}

        {leads.length === 0 && (
          <div className="rounded-3xl border border-zinc-200 dark:border-white/10 p-12 text-center text-zinc-400 bg-zinc-50/50 dark:bg-white/[0.01]">
            <MessageSquare size={36} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No buyer inquiries yet</h3>
            <p className="text-xs text-zinc-500 mt-1">Inquiries submitted on your assigned listings will appear here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
};

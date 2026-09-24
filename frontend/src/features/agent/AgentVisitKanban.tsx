import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar, Phone, MessageSquare, Plus,
  Clock, FileText
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../api/endpoints';
import { VisitReportModal } from './components/VisitReportModal';

interface Visit {
  id: number;
  listing_id?: number;
  property_title: string;
  property_location?: string;
  scheduled_date: string;
  date: string;
  visitor: string;
  visitor_phone?: string;
  visitor_email?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  report?: string;
}

export const AgentVisitKanban: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedVisitForReport, setSelectedVisitForReport] = useState<Visit | null>(null);
  const [isCreatingVisit, setIsCreatingVisit] = useState(false);
  const [newListingId, setNewListingId] = useState<string>('');
  const [newScheduledDate, setNewScheduledDate] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');

  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['agent-visits'],
    queryFn: async () => {
      const res = await api.agent.visits();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['agent-properties'],
    queryFn: async () => {
      const res = await api.agent.properties();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const createVisitMutation = useMutation({
    mutationFn: async () => {
      return api.agent.createVisit({
        listing_id: Number(newListingId),
        scheduled_date: newScheduledDate,
        notes: newNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-visits'] });
      queryClient.invalidateQueries({ queryKey: ['agent-dashboard'] });
      setIsCreatingVisit(false);
      setNewListingId('');
      setNewScheduledDate('');
      setNewNotes('');
    },
  });

  const columns: Array<{ status: Visit['status']; title: string; color: string; dotColor: string }> = [
    { status: 'scheduled', title: 'Upcoming Showings', color: 'text-sky-500', dotColor: 'bg-sky-500' },
    { status: 'completed', title: 'Completed & Inspected', color: 'text-emerald-500', dotColor: 'bg-emerald-500' },
    { status: 'no_show', title: 'No Show / Postponed', color: 'text-amber-500', dotColor: 'bg-amber-500' },
    { status: 'cancelled', title: 'Cancelled', color: 'text-zinc-400', dotColor: 'bg-zinc-400' },
  ];

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-400 text-sm">Loading showings schedule...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Calendar size={22} className="text-emerald-500" /> Physical Showings & Inspection Kanban
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Field appointments, client attendance tracking, and post-showing État des Lieux reports.
          </p>
        </div>
        <Button
          onClick={() => setIsCreatingVisit(true)}
          className="rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 px-4 py-2"
        >
          <Plus size={15} /> Book Client Showing
        </Button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colVisits = visits.filter((v: Visit) => v.status === col.status);

          return (
            <div
              key={col.status}
              className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-zinc-50/70 dark:bg-white/[0.02] p-4 flex flex-col space-y-3 min-h-[480px]"
            >
              {/* Column Header */}
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                    {col.title}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white dark:bg-white/[0.05] border border-zinc-200 dark:border-white/5 text-[11px] font-mono font-bold text-zinc-600 dark:text-zinc-400">
                  {colVisits.length}
                </span>
              </div>

              {/* Visit Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colVisits.map((v: Visit) => (
                  <div
                    key={v.id}
                    className="rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 shadow-sm hover:shadow-md transition-all space-y-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">
                        {v.property_title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Clock size={11} className="text-emerald-500" />
                        <span className="font-mono">{v.date}</span>
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/50 dark:border-white/5 space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Client:</span>
                        <strong className="text-zinc-800 dark:text-zinc-200 truncate max-w-[120px]">{v.visitor}</strong>
                      </div>
                      {v.visitor_phone && (
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">Tel:</span>
                          <span className="font-mono text-zinc-600 dark:text-zinc-400">{v.visitor_phone}</span>
                        </div>
                      )}
                    </div>

                    {v.report && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-zinc-700 dark:text-zinc-300 line-clamp-2">
                        <strong className="text-emerald-500 block">Inspection Logged:</strong>
                        {v.report}
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-zinc-100 dark:border-white/5">
                      <div className="flex gap-1">
                        {v.visitor_phone && (
                          <a
                            href={`tel:${v.visitor_phone}`}
                            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-white/[0.05] hover:bg-emerald-500/10 text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 transition-colors"
                            title="Call Visitor"
                          >
                            <Phone size={12} />
                          </a>
                        )}
                        {v.visitor_phone && (
                          <a
                            href={`https://wa.me/${v.visitor_phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-white/[0.05] hover:bg-emerald-500/10 text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 transition-colors"
                            title="WhatsApp Visitor"
                          >
                            <MessageSquare size={12} />
                          </a>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedVisitForReport(v)}
                        className="rounded-xl text-[10px] font-bold py-1 px-2.5 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.04]"
                      >
                        <FileText size={11} className="mr-1" />
                        {v.status === 'completed' ? 'View Report' : 'Complete & Log'}
                      </Button>
                    </div>
                  </div>
                ))}

                {colVisits.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-zinc-400 text-xs italic border border-dashed border-zinc-200 dark:border-white/10 rounded-2xl">
                    No showings in this column
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {isCreatingVisit && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#080c14] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Calendar size={18} className="text-emerald-500" /> Book Client Showing
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Select Property</label>
              <select
                value={newListingId}
                onChange={(e) => setNewListingId(e.target.value)}
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              >
                <option value="">Select an assigned listing...</option>
                {properties.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.title} ({p.location})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Date & Time</label>
              <input
                type="datetime-local"
                value={newScheduledDate}
                onChange={(e) => setNewScheduledDate(e.target.value)}
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Showing Notes</label>
              <textarea
                rows={2}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Special client requirements or physical gate access instructions..."
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setIsCreatingVisit(false)}
                className="flex-1 rounded-xl text-xs py-2.5"
              >
                Cancel
              </Button>
              <Button
                onClick={() => createVisitMutation.mutate()}
                disabled={createVisitMutation.isPending || !newListingId}
                className="flex-1 rounded-xl text-xs py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                {createVisitMutation.isPending ? 'Scheduling...' : 'Confirm Appointment'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Report Modal */}
      {selectedVisitForReport && (
        <VisitReportModal
          visit={selectedVisitForReport}
          onClose={() => setSelectedVisitForReport(null)}
        />
      )}
    </div>
  );
};

export default AgentVisitKanban;

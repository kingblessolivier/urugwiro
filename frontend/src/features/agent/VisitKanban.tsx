import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Visit {
  id: string;
  buyerName: string;
  propertyTitle: string;
  date: string;
  time: string;
  phone: string;
  notes: string;
  stage: 'lead' | 'scheduled' | 'negotiation' | 'closing';
}

const INITIAL_VISITS: Visit[] = [
  { id: '1', buyerName: 'Jean Paul', propertyTitle: '4-Bedroom Villa in Nyarutarama', date: '2026-10-05', time: '10:00', phone: '+250 788 111 222', notes: 'Interested in the garden and staff quarters', stage: 'lead' },
  { id: '2', buyerName: 'Marie Claire', propertyTitle: 'Modern Apartment in Kiyovu', date: '2026-10-06', time: '14:00', phone: '+250 788 333 444', notes: 'Pre-approved loan, ready to move fast', stage: 'scheduled' },
  { id: '3', buyerName: 'Patrick', propertyTitle: 'Commercial Plot in Gikondo', date: '2026-10-07', time: '09:00', phone: '+250 788 555 666', notes: 'Wants to discuss zoning and building permits', stage: 'negotiation' },
  { id: '4', buyerName: 'Alice', propertyTitle: '3-Bedroom House in Gahanga', date: '2026-10-08', time: '11:00', phone: '+250 788 777 888', notes: 'Second visit, very interested', stage: 'closing' },
  { id: '5', buyerName: 'Eric', propertyTitle: 'Land Plot in Bugesera', date: '2026-10-09', time: '15:00', phone: '+250 788 999 000', notes: 'Needs financing options', stage: 'lead' },
];

const STAGES: { key: Visit['stage']; label: string; color: string }[] = [
  { key: 'lead', label: 'Lead', color: 'bg-blue-500' },
  { key: 'scheduled', label: 'Scheduled', color: 'bg-amber-500' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-purple-500' },
  { key: 'closing', label: 'Closing', color: 'bg-emerald-500' },
];

const VisitKanban: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>(INITIAL_VISITS);
  const [draggedVisit, setDraggedVisit] = useState<Visit | null>(null);

  const handleDragStart = (visit: Visit) => {
    setDraggedVisit(visit);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stage: Visit['stage']) => {
    if (!draggedVisit) return;
    setVisits((prev) =>
      prev.map((v) => (v.id === draggedVisit.id ? { ...v, stage } : v))
    );
    setDraggedVisit(null);
  };

  const moveVisit = (visitId: string, direction: 'left' | 'right') => {
    const stageOrder: Visit['stage'][] = ['lead', 'scheduled', 'negotiation', 'closing'];
    setVisits((prev) =>
      prev.map((v) => {
        if (v.id !== visitId) return v;
        const currentIdx = stageOrder.indexOf(v.stage);
        const newIdx = direction === 'left' ? Math.max(0, currentIdx - 1) : Math.min(stageOrder.length - 1, currentIdx + 1);
        return { ...v, stage: stageOrder[newIdx] };
      })
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] text-[var(--color-text-main)] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Visit Pipeline</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Drag and drop visits between stages to manage the buyer journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAGES.map((stage) => {
            const stageVisits = visits.filter((v) => v.stage === stage.key);
            return (
              <div
                key={stage.key}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 min-h-[400px]"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.key)}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className={cn('w-2.5 h-2.5 rounded-full', stage.color)} />
                  <h3 className="text-sm font-bold">{stage.label}</h3>
                  <span className="ml-auto text-xs font-mono text-[var(--color-text-dim)]">{stageVisits.length}</span>
                </div>

                <div className="space-y-3">
                  {stageVisits.map((visit) => (
                    <div
                      key={visit.id}
                      draggable
                      onDragStart={() => handleDragStart(visit)}
                      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 cursor-grab active:cursor-grabbing hover:border-emerald-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{visit.propertyTitle}</p>
                          <p className="text-[10px] text-[var(--color-text-dim)] flex items-center gap-1 mt-0.5">
                            <User size={10} /> {visit.buyerName}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-0.5">
                          <button
                            onClick={() => moveVisit(visit.id, 'left')}
                            className="p-1 rounded hover:bg-[var(--color-bg-surface)] text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] transition cursor-pointer"
                            aria-label="Move back"
                          >
                            <ChevronLeft size={12} />
                          </button>
                          <button
                            onClick={() => moveVisit(visit.id, 'right')}
                            className="p-1 rounded hover:bg-[var(--color-bg-surface)] text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] transition cursor-pointer"
                            aria-label="Move forward"
                          >
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                          <Calendar size={10} /> {visit.date}
                        </p>
                        <p className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                          <Clock size={10} /> {visit.time}
                        </p>
                        <p className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                          <Phone size={10} /> {visit.phone}
                        </p>
                        {visit.notes && (
                          <p className="text-[10px] text-[var(--color-text-dim)] flex items-start gap-1 mt-2 pt-2 border-t border-[var(--color-border)]">
                            <FileText size={10} className="shrink-0 mt-0.5" /> {visit.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {stageVisits.length === 0 && (
                    <div className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center">
                      <p className="text-[10px] text-[var(--color-text-dim)]">Drop visits here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VisitKanban;

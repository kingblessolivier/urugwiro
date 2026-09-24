import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, FileText, ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { api } from '../../../api/endpoints';

interface VisitReportModalProps {
  visit: {
    id: number;
    property_title: string;
    visitor: string;
    visitor_phone?: string;
    date: string;
    status: string;
    report?: string;
    notes?: string;
  } | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const VisitReportModal: React.FC<VisitReportModalProps> = ({ visit, onClose, onSuccess }) => {
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<string>(visit?.status || 'completed');
  const [interestLevel, setInterestLevel] = useState<'High' | 'Medium' | 'Low'>('High');
  const [pricingFeedback, setPricingFeedback] = useState('Fair & Competitive');
  const [conditionNotes, _setConditionNotes] = useState(visit?.notes || '');
  const [reportSummary, setReportSummary] = useState(visit?.report || '');

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!visit) return;
      const fullReport = `[Interest Level: ${interestLevel.toUpperCase()}] | [Price Feedback: ${pricingFeedback}]\nReport: ${reportSummary}\nAction Items: Follow-up required within 48h.`;
      return api.agent.updateVisit(visit.id, {
        status: status as any,
        report: fullReport,
        notes: conditionNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-visits'] });
      queryClient.invalidateQueries({ queryKey: ['agent-dashboard'] });
      if (onSuccess) onSuccess();
      onClose();
    },
  });

  if (!visit) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#080c14] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileText size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Site Visit Inspection Report</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Log client inspection outcomes & État des Lieux</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Visit Context Summary */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/5 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-400 uppercase font-bold">Property:</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[240px]">{visit.property_title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400 uppercase font-bold">Client / Visitor:</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">{visit.visitor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400 uppercase font-bold">Showing Time:</span>
            <span className="font-mono text-zinc-600 dark:text-zinc-400">{visit.date}</span>
          </div>
        </div>

        {/* Status Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Visit Outcome Status
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'completed', label: 'Completed', color: 'border-emerald-500 text-emerald-500 bg-emerald-500/10' },
              { id: 'scheduled', label: 'Rescheduled', color: 'border-sky-500 text-sky-500 bg-sky-500/10' },
              { id: 'no_show', label: 'No Show', color: 'border-amber-500 text-amber-500 bg-amber-500/10' },
              { id: 'cancelled', label: 'Cancelled', color: 'border-red-500 text-red-500 bg-red-500/10' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatus(s.id)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                  status === s.id
                    ? s.color
                    : 'border-zinc-200 dark:border-white/10 text-zinc-500 hover:border-zinc-300 dark:hover:border-white/20'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Client Interest Rating */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Buyer Purchase Appetite / Interest Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'High', label: '🔥 High Interest (Offer Expected)', icon: ThumbsUp },
              { id: 'Medium', label: '⚖️ Moderate Interest', icon: HelpCircle },
              { id: 'Low', label: '❄️ Low Interest / Passthrough', icon: ThumbsDown },
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setInterestLevel(lvl.id as any)}
                className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                  interestLevel === lvl.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/[0.02]'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Feedback */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Client Price Perception
          </label>
          <select
            value={pricingFeedback}
            onChange={(e) => setPricingFeedback(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none focus:border-emerald-500"
          >
            <option value="Fair & Competitive">Fair & In Line With Comps</option>
            <option value="Considered Premium (+5-10% Above Market)">Considered High (+5-10% Above Market)</option>
            <option value="Perceived as Underpriced / Great Value">Great Value / Very Attractive</option>
            <option value="Buyer Requested Formal Counter Discount">Buyer Inquired About Counter Discount</option>
          </select>
        </div>

        {/* Inspection Report / Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Inspection Observations & Technical Report
          </label>
          <textarea
            rows={3}
            placeholder="Record client reactions, physical compound observations, access road quality, or requested seller modifications..."
            value={reportSummary}
            onChange={(e) => setReportSummary(e.target.value)}
            className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-400"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1 rounded-2xl text-xs font-bold py-3 border-zinc-300 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
          >
            Cancel
          </Button>
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="flex-1 rounded-2xl text-xs font-bold py-3 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/20"
          >
            {updateMutation.isPending ? 'Logging Report...' : 'Save Inspection Dossier'}
          </Button>
        </div>
      </div>
    </div>
  );
};

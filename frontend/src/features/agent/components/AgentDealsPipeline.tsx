import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck, ArrowRight, CheckCircle2, Clock,
  FileCheck, Landmark, FileText
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { api } from '../../../api/endpoints';
import { ContractSigningDesk } from '../../../components/contracts/ContractSigningDesk';

const CONVEYANCE_STAGES = [
  { id: 'offer_accepted', label: 'Offer Locked', step: 1 },
  { id: 'escrow_funded', label: 'Escrow Funded', step: 2 },
  { id: 'due_diligence', label: 'Title Search (RLMUA)', step: 3 },
  { id: 'irembo_filing', label: 'IremboGov Filing', step: 4 },
  { id: 'notary_signing', label: 'Notary Signing', step: 5 },
  { id: 'settled_closed', label: 'Settled & Closed', step: 6 },
];

export const AgentDealsPipeline: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedDealForAdvance, setSelectedDealForAdvance] = useState<any | null>(null);
  const [contractDeal, setContractDeal] = useState<any | null>(null);
  const [nextStage, setNextStage] = useState('');
  const [iremboBillId, setIremboBillId] = useState('');
  const [advanceNotes, setAdvanceNotes] = useState('');

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['agent-deals'],
    queryFn: async () => {
      const res = await api.agent.deals();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const advanceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDealForAdvance) return;
      return api.agent.advanceDeal(selectedDealForAdvance.id, {
        next_stage: nextStage || undefined,
        irembo_bill_id: iremboBillId || undefined,
        notes: advanceNotes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-deals'] });
      queryClient.invalidateQueries({ queryKey: ['agent-dashboard'] });
      setSelectedDealForAdvance(null);
      setNextStage('');
      setIremboBillId('');
      setAdvanceNotes('');
    },
  });

  const getStageIndex = (stageId: string) => {
    const idx = CONVEYANCE_STAGES.findIndex(s => s.id === stageId);
    return idx >= 0 ? idx : 0;
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <Clock className="animate-spin mx-auto mb-2 text-emerald-500" size={24} />
        Loading legal conveyance pipeline...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Landmark size={22} className="text-emerald-500" /> Rwandan Legal Conveyance Pipeline
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            End-to-end title transfers, bank escrow milestones, and IremboGov notary execution.
          </p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs px-3 py-1 font-bold">
          {deals.length} Active Deals
        </Badge>
      </div>

      {/* Deals List */}
      <div className="space-y-4">
        {deals.map((deal: any) => {
          const currentStageIdx = getStageIndex(deal.current_stage);

          return (
            <div
              key={deal.id}
              className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-6 shadow-sm hover:shadow-md transition-all space-y-5"
            >
              {/* Top Row */}
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-zinc-400">DEAL #{deal.id.slice(0, 8).toUpperCase()}</span>
                    <Badge className="text-[10px] uppercase font-bold bg-zinc-100 dark:bg-white/[0.05]">
                      {deal.deal_type || 'Sale'}
                    </Badge>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      deal.escrow_status === 'released_to_seller' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      deal.escrow_status === 'held_in_escrow' ? 'bg-sky-500/10 text-sky-500 border-sky-500/20' :
                      'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      Escrow: {deal.escrow_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{deal.listing_title}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mt-1">
                    <span>Buyer: <strong className="text-zinc-700 dark:text-zinc-300">{deal.buyer_name}</strong></span>
                    <span>•</span>
                    <span>Seller: <strong className="text-zinc-700 dark:text-zinc-300">{deal.seller_name}</strong></span>
                    {deal.land_upi && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">UPI: {deal.land_upi}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Agreed Transaction Price</span>
                  <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {Number(deal.agreed_price).toLocaleString()} {deal.currency}
                  </span>
                  <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setContractDeal(deal)}
                      className="rounded-xl text-xs font-bold border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                    >
                      <FileText size={13} className="mr-1" />
                      {deal.contracts?.length > 0
                        ? (deal.contracts[0].status === 'fully_executed' ? 'Sealed Contract' : 'Sign / Review Contract')
                        : 'Generate Contract'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedDealForAdvance(deal);
                        setIremboBillId(deal.irembo_bill_id || '');
                        const nextIdx = Math.min(currentStageIdx + 1, CONVEYANCE_STAGES.length - 1);
                        setNextStage(CONVEYANCE_STAGES[nextIdx].id);
                      }}
                      className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                    >
                      Advance Legal Stage <ArrowRight size={13} className="ml-1" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Rwandan 6-Stage Progress Stepper */}
              <div className="py-2">
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {CONVEYANCE_STAGES.map((stg, i) => {
                    const isDone = i <= currentStageIdx;
                    const isCurrent = i === currentStageIdx;

                    return (
                      <div
                        key={stg.id}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isCurrent
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : isDone
                            ? 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-300'
                            : 'border-zinc-100 dark:border-white/5 opacity-40 text-zinc-400'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {isDone ? (
                            <CheckCircle2 size={13} className="text-emerald-500" />
                          ) : (
                            <Clock size={13} className="text-zinc-400" />
                          )}
                          <span className="text-[10px] font-mono font-bold">Step {stg.step}</span>
                        </div>
                        <span className="text-xs font-bold block truncate">{stg.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notary & Legal Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/5 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-emerald-500" />
                  <span>Notary Office: <strong>{deal.notary_office || 'District Land Bureau'}</strong></span>
                </div>
                {deal.irembo_bill_id ? (
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-zinc-400">Irembo Bill:</span>
                    <strong className="text-sky-500">{deal.irembo_bill_id}</strong>
                  </div>
                ) : (
                  <span className="text-zinc-400 italic">Irembo bill ID pending submission</span>
                )}
                {deal.documents?.length > 0 && (
                  <div className="flex items-center gap-1 text-emerald-500">
                    <FileCheck size={14} />
                    <span>{deal.documents.length} verified deeds attached</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {deals.length === 0 && (
          <div className="rounded-3xl border border-zinc-200 dark:border-white/10 p-12 text-center text-zinc-400 bg-zinc-50/50 dark:bg-white/[0.01]">
            <Landmark size={36} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No active conveyance deals</h3>
            <p className="text-xs text-zinc-500 mt-1">Accepted buyer offers will generate deals here for legal transfer tracking.</p>
          </div>
        )}
      </div>

      {/* Stage Advance Modal */}
      {selectedDealForAdvance && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#080c14] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Advance Conveyance Stage
            </h3>
            <p className="text-xs text-zinc-500">
              Update legal stage for <strong>{selectedDealForAdvance.listing_title}</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Next Legal Stage</label>
              <select
                value={nextStage}
                onChange={(e) => setNextStage(e.target.value)}
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              >
                {CONVEYANCE_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">IremboGov Notary Application ID</label>
              <input
                type="text"
                value={iremboBillId}
                onChange={(e) => setIremboBillId(e.target.value)}
                placeholder="e.g. IRM-2026-99412"
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-mono text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Milestone Notes</label>
              <textarea
                rows={2}
                value={advanceNotes}
                onChange={(e) => setAdvanceNotes(e.target.value)}
                placeholder="Record milestone notes or registry filing progress..."
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setSelectedDealForAdvance(null)}
                className="flex-1 rounded-xl text-xs py-2.5"
              >
                Cancel
              </Button>
              <Button
                onClick={() => advanceMutation.mutate()}
                disabled={advanceMutation.isPending}
                className="flex-1 rounded-xl text-xs py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                {advanceMutation.isPending ? 'Advancing...' : 'Confirm Stage Update'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Signing Desk Modal */}
      {contractDeal && (
        <ContractSigningDesk
          dealId={contractDeal.id}
          contract={contractDeal.contracts?.[0]}
          initialRole="agent"
          onClose={() => setContractDeal(null)}
          onContractUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['agent-deals'] });
            queryClient.invalidateQueries({ queryKey: ['agent-dashboard'] });
          }}
        />
      )}
    </div>
  );
};

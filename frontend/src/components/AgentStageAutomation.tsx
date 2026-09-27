import React, { useState } from 'react';
import { Zap, ChevronRight, Check } from 'lucide-react';
import { Button } from './ui/Button';

interface Stage {
    id: string;
    label: string;
    description: string;
    completed: boolean;
    autoActions?: string[];
}

interface AgentStageAutomationProps {
    dealId: string;
    dealType: 'sale' | 'rental';
    currentStage: string;
    onAdvance?: (nextStage: string) => void;
}

const SALE_STAGES: Stage[] = [
    { id: 'offer_accepted', label: 'Offer Accepted', description: 'Terms locked', completed: false, autoActions: ['Notify buyer', 'Create deal record'] },
    { id: 'escrow_funded', label: 'Escrow Funded', description: '10% deposit held', completed: false, autoActions: ['Verify payment', 'Update escrow status'] },
    { id: 'due_diligence', label: 'Due Diligence', description: 'Title search', completed: false, autoActions: ['Order title search', 'Check caveats'] },
    { id: 'irembo_filing', label: 'Irembo Filing', description: 'Notary application', completed: false, autoActions: ['Submit application', 'Pay fees'] },
    { id: 'notary_signing', label: 'Notary Signing', description: 'Deed conveyance', completed: false, autoActions: ['Schedule signing', 'Prepare documents'] },
    { id: 'settled_closed', label: 'Settled & Closed', description: 'Title transferred', completed: false, autoActions: ['Disburse funds', 'Update records'] },
];

const RENTAL_STAGES: Stage[] = [
    { id: 'viewing_approved', label: 'Viewing Approved', description: 'Tenant verified', completed: false, autoActions: ['Verify tenant', 'Schedule viewing'] },
    { id: 'terms_agreed', label: 'Terms Agreed', description: 'Rent confirmed', completed: false, autoActions: ['Draft lease', 'Send for review'] },
    { id: 'deposit_funded', label: 'Deposit Funded', description: 'Security deposit', completed: false, autoActions: ['Verify payment', 'Hold in escrow'] },
    { id: 'contract_signed', label: 'Contract Signed', description: 'Lease executed', completed: false, autoActions: ['Send for signature', 'Collect signatures'] },
    { id: 'keys_handed', label: 'Keys Handed Over', description: 'Possession transferred', completed: false, autoActions: ['Schedule handover', 'Collect keys'] },
    { id: 'active_lease', label: 'Active Lease', description: 'Tenancy active', completed: false, autoActions: ['Set reminders', 'Start management'] },
];

export const AgentStageAutomation: React.FC<AgentStageAutomationProps> = ({
    dealId,
    dealType,
    currentStage,
    onAdvance,
}) => {
    const stages = dealType === 'sale' ? SALE_STAGES : RENTAL_STAGES;
    const [selectedStage, setSelectedStage] = useState<string | null>(null);

    const currentIdx = stages.findIndex((s) => s.id === currentStage);
    const progress = ((currentIdx + 1) / stages.length) * 100;

    const handleAdvance = () => {
        if (currentIdx < stages.length - 1) {
            const nextStage = stages[currentIdx + 1].id;
            onAdvance?.(nextStage);
        }
    };

    return (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Zap size={18} className="text-[var(--color-brand-emerald)]" />
                    <h3 className="text-base font-bold text-[var(--color-text-main)]">Deal Progress</h3>
                </div>
                <span className="text-xs font-bold text-[var(--color-brand-emerald)]">
                    {Math.round(progress)}%
                </span>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
                <div className="h-2 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                    <div
                        className="h-full rounded-full bg-[var(--color-brand-emerald)] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Stages */}
            <div className="space-y-2">
                {stages.map((stage, idx) => {
                    const isCompleted = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    const isUpcoming = idx > currentIdx;

                    return (
                        <button
                            key={stage.id}
                            onClick={() => setSelectedStage(stage.id)}
                            className={`w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                                isCurrent
                                    ? 'border-[var(--color-brand-emerald)]/40 bg-[var(--color-brand-emerald)]/5'
                                    : isCompleted
                                    ? 'border-[var(--color-border)] bg-[var(--color-input-bg)]'
                                    : 'border-[var(--color-border)] bg-[var(--color-input-bg)] opacity-60'
                            }`}
                        >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                isCompleted ? 'bg-emerald-500 text-white' :
                                isCurrent ? 'bg-[var(--color-brand-emerald)]/15 text-[var(--color-brand-emerald)] border-2 border-[var(--color-brand-emerald)]' :
                                'bg-[var(--color-bg-elevated)] text-[var(--color-text-dim)]'
                            }`}>
                                {isCompleted ? <Check size={12} /> : idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold ${isCurrent ? 'text-[var(--color-brand-emerald)]' : 'text-[var(--color-text-main)]'}`}>
                                    {stage.label}
                                </p>
                                <p className="text-[11px] text-[var(--color-text-muted)]">{stage.description}</p>
                                {isCurrent && stage.autoActions && selectedStage === stage.id && (
                                    <div className="mt-2 space-y-1">
                                        {stage.autoActions.map((action, aidx) => (
                                            <div key={aidx} className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-dim)]">
                                                <ChevronRight size={10} />
                                                {action}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Advance button */}
            {currentIdx < stages.length - 1 && (
                <Button variant="primary" onClick={handleAdvance} className="w-full mt-4">
                    <span>Advance to {stages[currentIdx + 1].label}</span>
                    <ChevronRight size={14} />
                </Button>
            )}
        </div>
    );
};

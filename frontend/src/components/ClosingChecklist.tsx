import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';

interface ChecklistItem {
    id: string;
    label: string;
    description?: string;
    completed: boolean;
}

interface ClosingChecklistProps {
    dealId: string;
    dealType: 'sale' | 'rental';
}

const SALE_STEPS = [
    { id: 'offer_accepted', label: 'Offer Accepted', description: 'Buyer and seller agree on terms' },
    { id: 'escrow_funded', label: 'Escrow Deposit Funded', description: '10% earnest deposit held in escrow' },
    { id: 'due_diligence', label: 'Due Diligence', description: 'Title search and caveat check' },
    { id: 'irembo_filing', label: 'Irembo Filing', description: 'Notary application submitted' },
    { id: 'notary_signing', label: 'Notary Signing', description: 'Deed conveyance signed' },
    { id: 'settled_closed', label: 'Settlement Closed', description: 'Title transferred, funds disbursed' },
];

const RENTAL_STEPS = [
    { id: 'viewing_approved', label: 'Viewing Approved', description: 'Tenant profile verified' },
    { id: 'terms_agreed', label: 'Terms Agreed', description: 'Rent and lease duration confirmed' },
    { id: 'deposit_funded', label: 'Deposit Funded', description: 'Security deposit in escrow' },
    { id: 'contract_signed', label: 'Contract Signed', description: 'Lease agreement executed' },
    { id: 'keys_handed', label: 'Keys Handed Over', description: 'Property possession transferred' },
    { id: 'active_lease', label: 'Active Lease', description: 'Tenancy under management' },
];

export const ClosingChecklist: React.FC<ClosingChecklistProps> = ({ dealId, dealType }) => {
    const steps = dealType === 'sale' ? SALE_STEPS : RENTAL_STEPS;
    const [items, setItems] = useState<ChecklistItem[]>(
        steps.map((s) => ({ ...s, completed: false }))
    );
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleItem = (id: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, completed: !item.completed } : item
            )
        );
    };

    const completedCount = items.filter((i) => i.completed).length;
    const progress = (completedCount / items.length) * 100;

    return (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-bold text-[var(--color-text-main)]">Closing Checklist</h3>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                        {completedCount} of {items.length} steps completed
                    </p>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
                >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
                <div className="h-2 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                    <div
                        className="h-full rounded-full bg-[var(--color-brand-emerald)] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {isExpanded && (
                <div className="space-y-2">
                    {items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => toggleItem(item.id)}
                            className="w-full flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-3 text-left hover:border-[var(--color-brand-emerald)]/40 transition-colors"
                        >
                            {item.completed ? (
                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                                <Circle size={18} className="text-[var(--color-text-dim)] shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold ${item.completed ? 'text-[var(--color-text-main)] line-through' : 'text-[var(--color-text-main)]'}`}>
                                    {item.label}
                                </p>
                                {item.description && (
                                    <p className="text-[11px] text-[var(--color-text-muted)]">{item.description}</p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

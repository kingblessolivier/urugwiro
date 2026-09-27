import React, { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { Button } from './ui/Button';

interface ReportListingProps {
    listingId: string;
    listingTitle: string;
}

export const ReportListing: React.FC<ReportListingProps> = ({ listingId, listingTitle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        // In production, this would call an API endpoint
        console.log('Report submitted:', { listingId, reason, details });
        setSubmitted(true);
        setTimeout(() => {
            setIsOpen(false);
            setSubmitted(false);
            setReason('');
            setDetails('');
        }, 2000);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
            >
                <Flag size={12} />
                <span>Report</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-[var(--color-text-main)]">Report Listing</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {submitted ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-[var(--color-text-main)]">Report Submitted</p>
                                <p className="text-xs text-[var(--color-text-muted)] mt-1">We'll review this listing shortly.</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                                    Reporting &ldquo;{listingTitle}&rdquo;
                                </p>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Reason</label>
                                        <select
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                                        >
                                            <option value="">Select a reason</option>
                                            <option value="inaccurate">Inaccurate information</option>
                                            <option value="fraud">Suspected fraud</option>
                                            <option value="duplicate">Duplicate listing</option>
                                            <option value="offensive">Offensive content</option>
                                            <option value="sold">Already sold/rented</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Additional Details</label>
                                        <textarea
                                            value={details}
                                            onChange={(e) => setDetails(e.target.value)}
                                            rows={3}
                                            className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)] resize-none"
                                            placeholder="Provide additional context..."
                                        />
                                    </div>
                                </div>
                                <div className="mt-5 flex justify-end gap-2">
                                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                                    <Button variant="destructive" onClick={handleSubmit} disabled={!reason}>
                                        Submit Report
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

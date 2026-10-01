import React, { useState } from 'react';
import { ShieldCheck, FileText, Paperclip, Check, X, Inbox } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import { cn } from '../../lib/utils';

const VerificationWorkspace: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [notes, setNotes] = useState('');

    const { data: requests = [], isLoading: loadingList } = useQuery({
        queryKey: ['admin-verification-list'],
        queryFn: async () => {
            const response = await api.admin.verification.list();
            const d = response.data;
            if (Array.isArray(d)) return d;
            if (d && Array.isArray(d.results)) return d.results;
            return [];
        },
    });

    const { data: detail, isLoading: loadingDetail } = useQuery({
        queryKey: ['admin-verification-detail', selectedId],
        queryFn: async () => {
            if (!selectedId) return null;
            const response = await api.admin.verification.detail(selectedId.toString());
            return response.data;
        },
        enabled: !!selectedId,
    });

    const reviewMutation = useMutation({
        mutationFn: async ({ id, decision, notes }: { id: number, decision: string, notes: string }) => {
            return api.admin.verification.review(id.toString(), decision, notes);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-verification-list'] });
            queryClient.invalidateQueries({ queryKey: ['admin-verification-detail', selectedId!] });
            setSelectedId(null);
            setNotes('');
        },
    });

    if (loadingList) return <div className="min-h-[60vh] bg-transparent flex items-center justify-center text-[var(--color-text-muted)] font-medium">Loading Verification Workspace...</div>;

    return (
        <div className="h-[calc(100vh-5rem)] bg-transparent text-[var(--color-text-main)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-surface)]">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-400">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[var(--color-text-main)] tracking-tight">Verification Workspace</h1>
                        <p className="text-[11px] text-[var(--color-text-dim)] uppercase tracking-wider font-semibold">Statutory title review queue</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30 text-xs font-bold rounded-full border">
                        {requests.filter(r => r.status === 'pending').length} Pending
                    </span>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Request List */}
                <div className="w-96 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-y-auto custom-scrollbar">
                    <div className="p-4 space-y-3">
                        {requests.map(req => (
                            <div
                                key={req.id}
                                onClick={() => setSelectedId(req.id)}
                                className={cn(
                                    'p-4 rounded-xl border cursor-pointer transition-all',
                                    selectedId === req.id
                                        ? 'bg-[var(--color-accent-soft-bg)] border-emerald-500/40 ring-1 ring-emerald-500/30'
                                        : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                                )}
                            >
                                <div className="flex justify-between items-start mb-2 gap-2">
                                    <div className="font-bold text-sm truncate text-[var(--color-text-main)]">{req.listing_title}</div>
                                    <span className={cn(
                                        'px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 capitalize',
                                        req.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30' :
                                        req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30' :
                                        'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30'
                                    )}>
                                        {req.status}
                                    </span>
                                </div>
                                <div className="text-xs text-[var(--color-text-muted)] font-medium mb-3">{req.seller_name}</div>
                                <div className="flex justify-between items-center text-[10px] text-[var(--color-text-dim)] font-medium">
                                    <span>{req.submitted_at}</span>
                                    <span className="text-[var(--color-brand-emerald)] font-bold">{req.verification_level}</span>
                                </div>
                            </div>
                        ))}
                        {requests.length === 0 && (
                            <div className="text-center p-10 text-[var(--color-text-muted)] italic text-sm">No pending requests.</div>
                        )}
                    </div>
                </div>

                {/* Right Detail Pane */}
                <div className="flex-1 overflow-y-auto bg-transparent p-8 custom-scrollbar">
                    {selectedId && detail ? (
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Listing Summary */}
                            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-[var(--shadow-depth-1)]">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-[var(--color-text-main)] tracking-tight">{detail.listing_title}</h2>
                                        <p className="text-[var(--color-text-muted)] font-medium text-sm mt-1">Seller: <span className="text-[var(--color-text-main)] font-bold">{detail.seller_name}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-[var(--color-text-dim)] uppercase mb-1">Listing ID</div>
                                        <div className="text-lg font-mono text-[var(--color-brand-emerald)] font-bold">#V-{detail.id}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {Object.entries(detail.listing_details).map(([key, value]) => (
                                        <div key={key} className="p-3 bg-[var(--color-bg-elevated)] rounded-xl border border-[var(--color-border)]">
                                            <div className="text-[10px] text-[var(--color-text-dim)] uppercase font-bold mb-1">{key.replace('_', ' ')}</div>
                                            <div className="text-sm text-[var(--color-text-main)] font-semibold">{String(value)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Document Viewer */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-[var(--color-text-main)] flex items-center gap-2">
                                    <FileText size={18} className="text-[var(--color-brand-emerald)]" /> Verification Documents
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {detail.documents.map(doc => (
                                        <div key={doc.id} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all group shadow-[var(--shadow-depth-1)]">
                                            <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-elevated)]">
                                                <div className="flex items-center gap-2">
                                                    <Paperclip size={15} className="text-[var(--color-text-dim)]" />
                                                    <span className="text-sm font-bold text-[var(--color-text-main)]">{doc.name}</span>
                                                </div>
                                                <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">{doc.type}</span>
                                            </div>
                                            <div className="aspect-video bg-[var(--color-bg-elevated)] flex items-center justify-center relative overflow-hidden">
                                                <div className="text-[var(--color-text-dim)] text-sm italic px-4 text-center break-all">Document Preview: {doc.url}</div>
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-[#fff]"
                                                >
                                                    Open Full Document →
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Decision Panel */}
                            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-[var(--shadow-depth-2)] sticky bottom-8">
                                <div className="flex flex-col md:flex-row gap-6 items-end">
                                    <div className="flex-1 w-full space-y-2">
                                        <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Review Notes</label>
                                        <textarea
                                            className="w-full p-4 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-main)] focus:border-emerald-500/50 outline-none transition-all h-24 text-sm"
                                            placeholder="Add reasoning for approval or rejection..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <button
                                            onClick={() => {
                                                reviewMutation.mutate({ id: selectedId, decision: 'rejected', notes });
                                            }}
                                            disabled={reviewMutation.isPending}
                                            className="flex-1 md:flex-none px-6 py-4 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30 dark:hover:bg-red-500/25 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <X size={16} /> Reject
                                        </button>
                                        <button
                                            onClick={() => {
                                                reviewMutation.mutate({ id: selectedId, decision: 'approved', notes });
                                            }}
                                            disabled={reviewMutation.isPending}
                                            className="flex-1 md:flex-none px-6 py-4 bg-emerald-600 text-[#fff] hover:bg-emerald-700 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400 font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[var(--shadow-emerald-soft)]"
                                        >
                                            <Check size={16} /> Approve & Verify
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : loadingDetail ? (
                        <div className="h-full flex items-center justify-center text-[var(--color-text-muted)] font-medium">Loading document details...</div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] space-y-4">
                            <div className="h-16 w-16 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center">
                                <Inbox size={28} className="text-[var(--color-text-dim)]" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-[var(--color-text-main)]">No Request Selected</h3>
                                <p className="text-sm text-[var(--color-text-muted)]">Select a listing from the sidebar to begin the verification process.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerificationWorkspace;

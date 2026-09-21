import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';

const VerificationWorkspace: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [notes, setNotes] = useState('');

    const { data: requests = [], isLoading: loadingList } = useQuery({
        queryKey: ['admin-verification-list'],
        queryFn: async () => {
            const response = await api.admin.verification.list();
            return response.data;
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

    if (loadingList) return <div className="min-h-screen bg-transparent flex items-center justify-center text-zinc-300 font-medium">Loading Verification Workspace...</div>;

    return (
        <div className="h-screen bg-transparent text-white flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Verification Workspace</h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-blue-500/15 text-blue-300 text-xs font-bold rounded-full border border-blue-500/30">
                        {requests.filter(r => r.status === 'pending').length} Pending
                    </span>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Request List */}
                <div className="w-96 border-r border-white/10 bg-white/[0.02] overflow-y-auto custom-scrollbar">
                    <div className="p-4 space-y-4">
                        {requests.map(req => (
                            <div
                                key={req.id}
                                onClick={() => setSelectedId(req.id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                    selectedId === req.id
                                    ? 'bg-emerald-500/15 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                                    : 'bg-white/[0.03] backdrop-blur-xl border-white/10 hover:border-white/[0.15]'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-sm truncate max-w-[150px] text-white">{req.listing_title}</div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                        req.status === 'pending' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                                        req.status === 'approved' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                                        'bg-red-500/15 text-red-300 border-red-500/30'
                                    }`}>
                                        {req.status}
                                    </span>
                                </div>
                                <div className="text-xs text-zinc-300 font-medium mb-3">{req.seller_name}</div>
                                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-medium">
                                    <span>{req.submitted_at}</span>
                                    <span className="text-emerald-400 font-bold">{req.verification_level}</span>
                                </div>
                            </div>
                        ))}
                        {requests.length === 0 && (
                            <div className="text-center p-10 text-zinc-400 italic text-sm">No pending requests.</div>
                        )}
                    </div>
                </div>

                {/* Right Detail Pane */}
                <div className="flex-1 overflow-y-auto bg-transparent p-8 custom-scrollbar">
                    {selectedId && detail ? (
                        <div className="max-w-4xl mx-auto space-y-8">
                            {/* Listing Summary */}
                            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white">{detail.listing_title}</h2>
                                        <p className="text-zinc-300 font-medium">Seller: <span className="text-white font-bold">{detail.seller_name}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-zinc-400 uppercase mb-1">Listing ID</div>
                                        <div className="text-lg font-mono text-emerald-400 font-bold">#V-{detail.id}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {Object.entries(detail.listing_details).map(([key, value]) => (
                                        <div key={key} className="p-3 bg-white/[0.04] rounded-xl border border-white/10">
                                            <div className="text-[10px] text-zinc-300 uppercase font-bold mb-1">{key.replace('_', ' ')}</div>
                                            <div className="text-sm text-white font-semibold">{String(value)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Document Viewer */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="text-blue-400">Ã°Å¸â€œâ€ž</span> Verification Documents
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {detail.documents.map(doc => (
                                        <div key={doc.id} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/50/50 transition-all group shadow-lg">
                                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.04]">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">Ã°Å¸â€œÅ½</span>
                                                    <span className="text-sm font-bold text-white">{doc.name}</span>
                                                </div>
                                                <span className="text-[10px] text-zinc-300 uppercase font-bold">{doc.type}</span>
                                            </div>
                                            <div className="aspect-video bg-white/[0.02] flex items-center justify-center relative overflow-hidden">
                                                <div className="text-zinc-400 text-sm italic">Document Preview: {doc.url}</div>
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-white"
                                                >
                                                    Open Full Document Ã¢â€ â€”
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Decision Panel */}
                            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl sticky bottom-8">
                                <div className="flex flex-col md:flex-row gap-6 items-end">
                                    <div className="flex-1 w-full space-y-2">
                                        <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Review Notes</label>
                                        <textarea
                                            className="w-full p-4 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:border-emerald-500/50 outline-none transition-all h-24 text-sm"
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
                                            className="flex-1 md:flex-none px-6 py-4 bg-red-500/15 text-red-300 hover:bg-red-500 hover:text-white font-bold rounded-xl border border-red-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <span>Ã¢ÂÅ’</span> Reject
                                        </button>
                                        <button
                                            onClick={() => {
                                                reviewMutation.mutate({ id: selectedId, decision: 'approved', notes });
                                            }}
                                            disabled={reviewMutation.isPending}
                                            className="flex-1 md:flex-none px-6 py-4 bg-emerald-500 text-white hover:bg-emerald-600 font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-black/30"
                                        >
                                            <span>Ã¢Å“â€¦</span> Approve & Verify
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : loadingDetail ? (
                        <div className="h-full flex items-center justify-center text-zinc-300 font-medium">Loading document details...</div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4">
                            <div className="text-6xl">Ã°Å¸â€ºÂ¡Ã¯Â¸Â</div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-zinc-200">No Request Selected</h3>
                                <p className="text-sm text-zinc-400">Select a listing from the sidebar to begin the verification process.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerificationWorkspace;



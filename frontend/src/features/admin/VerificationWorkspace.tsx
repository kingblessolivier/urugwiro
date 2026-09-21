import React, { useState } from 'react';
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

    if (loadingList) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Verification Workspace...</div>;

    return (
        <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🛡️</span>
                    <div>
                        <h1 className="text-2xl font-bold">Verification Workspace</h1>
                        <p className="text-zinc-500 text-sm">Audit and verify listing documents to establish Trust Levels.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20">
                        {requests.filter(r => r.status === 'pending').length} Pending
                    </span>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Request List */}
                <div className="w-96 border-r border-zinc-800 bg-zinc-900/50 overflow-y-auto custom-scrollbar">
                    <div className="p-4 space-y-4">
                        {requests.map(req => (
                            <div
                                key={req.id}
                                onClick={() => setSelectedId(req.id)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                    selectedId === req.id
                                    ? 'bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/5'
                                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-sm truncate max-w-[150px]">{req.listing_title}</div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                        req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                        req.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                        {req.status}
                                    </span>
                                </div>
                                <div className="text-xs text-zinc-500 mb-3">{req.seller_name}</div>
                                <div className="flex justify-between items-center text-[10px] text-zinc-600 font-medium">
                                    <span>{req.submitted_at}</span>
                                    <span className="text-zinc-400">{req.verification_level}</span>
                                </div>
                            </div>
                        ))}
                        {requests.length === 0 && (
                            <div className="text-center p-10 text-zinc-600 italic text-sm">No pending requests.</div>
                        )}
                    </div>
                </div>

                {/* Right Detail Pane */}
                <div className="flex-1 overflow-y-auto bg-black p-8 custom-scrollbar">
                    {selectedId && detail ? (
                        <div className="max-w-4xl mx-auto space-y-8">
                            {/* Listing Summary */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white">{detail.listing_title}</h2>
                                        <p className="text-zinc-400">Seller: <span className="text-zinc-200">{detail.seller_name}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-zinc-500 uppercase mb-1">Listing ID</div>
                                        <div className="text-lg font-mono text-zinc-300">#V-{detail.id}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {Object.entries(detail.listing_details).map(([key, value]) => (
                                        <div key={key} className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-700">
                                            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">{key.replace('_', ' ')}</div>
                                            <div className="text-sm text-zinc-200 font-medium">{String(value)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Document Viewer */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="text-blue-500">📄</span> Verification Documents
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {detail.documents.map(doc => (
                                        <div key={doc.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-600 transition-all group">
                                            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">📎</span>
                                                    <span className="text-sm font-bold text-zinc-200">{doc.name}</span>
                                                </div>
                                                <span className="text-[10px] text-zinc-500 uppercase">{doc.type}</span>
                                            </div>
                                            <div className="aspect-video bg-zinc-800 flex items-center justify-center relative overflow-hidden">
                                                {/* In a real app, this would be an <iframe> or <img src={doc.url} /> */}
                                                <div className="text-zinc-600 text-sm italic">Document Preview: {doc.url}</div>
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-white"
                                                >
                                                    Open Full Document ↗
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Decision Panel */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl sticky bottom-8">
                                <div className="flex flex-col md:flex-row gap-6 items-end">
                                    <div className="flex-1 w-full space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Review Notes</label>
                                        <textarea
                                            className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all h-24 text-sm"
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
                                            className="flex-1 md:flex-none px-6 py-4 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-bold rounded-2xl border border-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <span>❌</span> Reject
                                        </button>
                                        <button
                                            onClick={() => {
                                                reviewMutation.mutate({ id: selectedId, decision: 'approved', notes });
                                            }}
                                            disabled={reviewMutation.isPending}
                                            className="flex-1 md:flex-none px-6 py-4 bg-green-600 text-white hover:bg-green-500 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <span>✅</span> Approve & Verify
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : loadingDetail ? (
                        <div className="h-full flex items-center justify-center text-zinc-500">Loading document details...</div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
                            <div className="text-6xl">🛡️</div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-zinc-400">No Request Selected</h3>
                                <p className="text-sm">Select a listing from the sidebar to begin the verification process.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerificationWorkspace;

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Mail, Inbox, Search, Trash2, Send, CheckCircle2,
    Clock, User, Phone, Building2, MessageSquare, X
} from 'lucide-react';
import { api } from '../../api/endpoints';

interface Inquiry {
    id: number;
    property_id?: number;
    property_title?: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    created_at?: string;
    status?: string;
}

const SellerInquiryManager: React.FC = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [replyText, setReplyText] = useState('');
    const [replySuccess, setReplySuccess] = useState(false);

    const { data: inquiries = [], isLoading } = useQuery<Inquiry[]>({
        queryKey: ['seller-inquiries'],
        queryFn: async () => {
            const response = await api.seller.inquiries();
            return Array.isArray(response.data) ? response.data : [];
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return api.seller.deleteInquiry(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-inquiries'] });
            if (selectedInquiry) setSelectedInquiry(null);
        },
    });

    const markStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: number; status: string }) => {
            return api.seller.updateInquiry(id, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-inquiries'] });
        },
    });

    const filteredInquiries = inquiries.filter((i: Inquiry) =>
        (i.property_title && i.property_title.toLowerCase().includes(search.toLowerCase())) ||
        (i.name && i.name.toLowerCase().includes(search.toLowerCase())) ||
        (i.email && i.email.toLowerCase().includes(search.toLowerCase())) ||
        (i.message && i.message.toLowerCase().includes(search.toLowerCase()))
    );

    const handleOpenInquiry = (inquiry: Inquiry) => {
        setSelectedInquiry(inquiry);
        setReplyText('');
        setReplySuccess(false);
        if (inquiry.status !== 'read') {
            markStatusMutation.mutate({ id: inquiry.id, status: 'read' });
        }
    };

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedInquiry) return;
        // Mark as answered and notify
        markStatusMutation.mutate(
            { id: selectedInquiry.id, status: 'responded' },
            {
                onSuccess: () => {
                    setReplySuccess(true);
                    setTimeout(() => {
                        setReplySuccess(false);
                        setSelectedInquiry(null);
                    }, 1200);
                }
            }
        );
    };

    return (
        <div className="min-h-screen bg-[#05070b] p-6 lg:p-12 text-zinc-100">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-mono uppercase tracking-wider">
                                <Mail className="w-3.5 h-3.5" />
                                Sovereign Inbound Ledger
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                                Property Inquiries & Leads
                            </h1>
                            <p className="text-zinc-400 text-sm max-w-2xl">
                                Direct authenticated inquiries from buyers and tenants regarding your verified Kigali inventory.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10 text-right">
                                <div className="text-xs text-zinc-400 font-mono">Live Leads</div>
                                <div className="text-2xl font-bold text-white font-mono">{inquiries.length}</div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
                </div>

                {/* Filter and Content Card */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Inbox className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Inbound Messages</h2>
                                <p className="text-xs text-zinc-400">Authenticated counterparty communications</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="relative w-full sm:w-72">
                                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    placeholder="Filter by name, property, email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20 whitespace-nowrap">
                                {filteredInquiries.length} {filteredInquiries.length === 1 ? 'item' : 'items'}
                            </span>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="py-24 flex flex-col items-center justify-center text-zinc-500 space-y-3">
                            <Clock className="w-8 h-8 animate-spin text-emerald-500/50" />
                            <div className="text-sm font-mono">Querying inbound inquiries...</div>
                        </div>
                    ) : filteredInquiries.length === 0 ? (
                        <div className="py-24 text-center px-4 space-y-4">
                            <div className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
                                <Inbox className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-white">No Inquiries Found</h3>
                                <p className="text-zinc-400 text-sm max-w-md mx-auto">
                                    {search
                                        ? "No inquiries matched your search criteria. Try a different query."
                                        : "You currently have no inbound inquiries. Verified inquiries from interested buyers and tenants will automatically appear here."}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.01] text-zinc-400 text-xs font-mono uppercase tracking-wider">
                                        <th className="px-6 py-4 font-semibold">Target Asset</th>
                                        <th className="px-6 py-4 font-semibold">Sender</th>
                                        <th className="px-6 py-4 font-semibold">Contact</th>
                                        <th className="px-6 py-4 font-semibold">Inquiry Preview</th>
                                        <th className="px-6 py-4 font-semibold">Timestamp</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredInquiries.map((inquiry: Inquiry) => (
                                        <tr
                                            key={inquiry.id}
                                            onClick={() => handleOpenInquiry(inquiry)}
                                            className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                                    <span className="text-sm font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                                                        {inquiry.property_title || 'General Inbound Inquiry'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-xs font-mono text-zinc-300">
                                                        {inquiry.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <span className="text-sm font-medium text-white">{inquiry.name || 'Anonymous Prospect'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-zinc-300 font-mono">{inquiry.email || 'No email'}</div>
                                                {inquiry.phone && (
                                                    <div className="flex items-center gap-1.5 mt-1.5" onClick={(e) => e.stopPropagation()}>
                                                        <a
                                                            href={`tel:${inquiry.phone}`}
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-mono font-bold"
                                                            title="Direct Phone Call"
                                                        >
                                                            <Phone className="w-3 h-3" /> {inquiry.phone}
                                                        </a>
                                                        <a
                                                            href={`https://wa.me/${inquiry.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(inquiry.name)},%20I%20am%20reaching%20out%20regarding%20${encodeURIComponent(inquiry.property_title || 'your inquiry')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-[10px] font-bold"
                                                            title="Chat on WhatsApp"
                                                        >
                                                            WA
                                                        </a>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-zinc-400 truncate max-w-xs">{inquiry.message}</p>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-zinc-500">
                                                {inquiry.created_at ? new Date(inquiry.created_at).toLocaleDateString() : 'Recent'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleOpenInquiry(inquiry)}
                                                        className="p-2 rounded-xl bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-white/10 transition-colors"
                                                        title="View & Reply"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteMutation.mutate(inquiry.id)}
                                                        className="p-2 rounded-xl bg-white/[0.03] text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-white/10 transition-colors"
                                                        title="Archive"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Inquiry Detail & Reply Modal */}
            {selectedInquiry && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0a0e17] p-8 shadow-2xl space-y-6">
                        <div className="flex items-start justify-between border-b border-white/10 pb-4">
                            <div>
                                <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                                    Inquiry Detail
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    {selectedInquiry.property_title || 'General Inbound Inquiry'}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedInquiry(null)}
                                className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Sender Info Card */}
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">{selectedInquiry.name}</div>
                                    <div className="text-xs text-zinc-400">{selectedInquiry.email}</div>
                                </div>
                            </div>
                            {selectedInquiry.phone && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <a
                                        href={`tel:${selectedInquiry.phone}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 text-xs font-mono font-bold"
                                        title="Direct Phone Call"
                                    >
                                        <Phone className="w-3.5 h-3.5" />
                                        {selectedInquiry.phone}
                                    </a>
                                    <a
                                        href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedInquiry.name)},%20I%20am%20reaching%20out%20regarding%20${encodeURIComponent(selectedInquiry.property_title || 'your inquiry')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-bold"
                                        title="Chat on WhatsApp"
                                    >
                                        WhatsApp
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Message Body */}
                        <div className="space-y-2">
                            <label className="text-xs font-mono uppercase text-zinc-400">Client Message</label>
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-zinc-200 leading-relaxed">
                                {selectedInquiry.message}
                            </div>
                        </div>

                        {/* Quick Reply Box */}
                        <form onSubmit={handleSendReply} className="space-y-3">
                            <label className="text-xs font-mono uppercase text-zinc-400">Quick Response Note</label>
                            <textarea
                                rows={3}
                                className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                                placeholder="Write your direct response or consultation notes..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                            />
                            <div className="flex justify-between items-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => deleteMutation.mutate(selectedInquiry.id)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete Inquiry
                                </button>
                                <button
                                    type="submit"
                                    disabled={!replyText.trim() || markStatusMutation.isPending}
                                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                                >
                                    {replySuccess ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            Saved Response
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Record Response
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerInquiryManager;

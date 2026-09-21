import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';

interface Offer {
    id: number;
    property_title: string;
    buyer_username: string;
    amount: number;
    counter_amount?: number;
    message: string;
    status: 'accepted' | 'pending' | 'rejected' | 'countered';
    date: string;
}

const SellerOfferManager: React.FC = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [counterModal, setCounterModal] = useState<{ open: boolean, offerId: number | null, amount: string }>({
        open: false,
        offerId: null,
        amount: '',
    });

    const { data: offers = [], isLoading } = useQuery({
        queryKey: ['seller-offers'],
        queryFn: async () => {
            const response = await api.seller.offers();
            return response.data;
        },
    });

    const respondMutation = useMutation({
        mutationFn: async ({ id, action, amount }: { id: number, action: 'accept' | 'reject' | 'counter', amount?: string }) => {
            return api.seller.respondOffer(id.toString(), action, amount);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-offers'] });
            setCounterModal({ open: false, offerId: null, amount: '' });
        },
    });

    const filteredOffers = offers.filter((o: any) =>
        (o.property_title && o.property_title.toLowerCase().includes(search.toLowerCase())) ||
        (o.buyer_username && o.buyer_username.toLowerCase().includes(search.toLowerCase()))
    );

    const respondToOffer = (id: number, action: 'accept' | 'reject' | 'counter', counterAmount?: string) => {
        respondMutation.mutate({ id, action, amount: counterAmount });
    };

    const openCounterModal = (offer: Offer) => {
        setCounterModal({ open: true, offerId: offer.id, amount: offer.amount.toString() });
    };

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Offers...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
                <div className="relative z-10 flex justify-between items-start flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🤝</span>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Offers Received</h1>
                            <p className="text-zinc-400 text-lg">Review and respond to offers on your listed properties.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2 bg-zinc-800 text-white font-bold rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-all flex items-center gap-2">
                            <span>📊</span> Dashboard
                        </button>
                    </div>
                </div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🏷️</span>
                        <h2 className="text-xl font-bold text-white">All Offers</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative max-w-xs">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all text-sm"
                                placeholder="Search offers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20">
                            {filteredOffers.length} total
                        </span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                            <tr className="border-b border-zinc-800">
                                <th className="px-6 py-4 font-medium">Property</th>
                                <th className="px-6 py-4 font-medium">Buyer</th>
                                <th className="px-6 py-4 font-medium">Offer</th>
                                <th className="px-6 py-4 font-medium">Counter</th>
                                <th className="px-6 py-4 font-medium">Message</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredOffers.map((o: any) => (
                                <tr key={o.id} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <a href="#" className="text-sm font-bold text-green-500 hover:underline">{o.property_title}</a>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-300">{o.buyer_username}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-white">{o.amount?.toLocaleString()} Frw</td>
                                    <td className="px-6 py-4 text-sm">
                                        {o.counter_amount ? (
                                            <strong className="text-yellow-500">{o.counter_amount.toLocaleString()} Frw</strong>
                                        ) : (
                                            <span className="text-zinc-600">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-zinc-500 truncate max-w-xs">{o.message}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                            o.status === 'accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            o.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                            o.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                            {o.status === 'countered' ? 'Countered' : o.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-500">{o.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        {o.status === 'pending' ? (
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => respondToOffer(o.id, 'accept')} className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded-lg border border-green-500/20 transition-all" title="Accept">✅</button>
                                                <button onClick={() => respondToOffer(o.id, 'reject')} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all" title="Reject">❌</button>
                                                <button onClick={() => openCounterModal(o)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg border border-blue-500/20 transition-all" title="Counter">🔄</button>
                                            </div>
                                        ) : (
                                            <span className="text-zinc-600 text-xs">Finalized</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {filteredOffers.length === 0 && (
                            <tbody>
                                <tr>
                                    <td colSpan={8} className="p-10 text-center text-zinc-500">No offers found.</td>
                                </tr>
                            </tbody>
                        )}
                    </table>
                </div>
            </div>

            {/* Counter Modal */}
            {counterModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="text-blue-500">🔄</span> Counter Offer
                            </h3>
                            <button onClick={() => setCounterModal({ open: false, offerId: null, amount: '' })} className="text-zinc-500 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-6">
                            <div className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Original Offer</p>
                                <p className="text-lg font-bold text-white">
                                    {offers.find((o: any) => o.id === counterModal.offerId)?.amount?.toLocaleString()} RWF
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Your Counter Amount (RWF)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    value={counterModal.amount}
                                    onChange={(e) => setCounterModal({ ...counterModal, amount: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCounterModal({ open: false, offerId: null, amount: '' })}
                                    className="flex-1 py-3 bg-zinc-800 text-zinc-400 font-bold rounded-2xl hover:bg-zinc-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => respondToOffer(counterModal.offerId!, 'counter', counterModal.amount)}
                                    className="flex-1 py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-500 transition-all"
                                >
                                    Send Counter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerOfferManager;

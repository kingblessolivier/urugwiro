import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/endpoints';

const AgentOfferManager: React.FC = () => {
    const [search, setSearch] = useState('');

    const { data: offers = [], isLoading } = useQuery({
        queryKey: ['agent-offers'],
        queryFn: async () => {
            const response = await api.agent.offers();
            return response.data;
        },
    });

    const filteredOffers = offers.filter((o: any) =>
        (o.property_title && o.property_title.toLowerCase().includes(search.toLowerCase())) ||
        (o.buyer_username && o.buyer_username.toLowerCase().includes(search.toLowerCase()))
    );

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Offers...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
                <div className="relative z-10 flex justify-between items-start flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🤝</span>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Offers Handled</h1>
                            <p className="text-zinc-400 text-lg">View all offers on properties you're managing.</p>
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
                                <th className="px-6 py-4 font-medium">Offer Amount</th>
                                <th className="px-6 py-4 font-medium">Counter</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Date</th>
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
                                </tr>
                            ))}
                        </tbody>
                        {filteredOffers.length === 0 && (
                            <tbody>
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-zinc-500">No offers found.</td>
                                </tr>
                            </tbody>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AgentOfferManager;

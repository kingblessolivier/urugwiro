import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/endpoints';

const SellerInquiryManager: React.FC = () => {
    const [search, setSearch] = useState('');

    const { data: inquiries = [], isLoading } = useQuery({
        queryKey: ['seller-inquiries'],
        queryFn: async () => {
            const response = await api.seller.inquiries();
            return response.data;
        },
    });

    const filteredInquiries = inquiries.filter((i: any) =>
        (i.property_title && i.property_title.toLowerCase().includes(search.toLowerCase())) ||
        (i.name && i.name.toLowerCase().includes(search.toLowerCase())) ||
        (i.email && i.email.toLowerCase().includes(search.toLowerCase()))
    );

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Inquiries...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
                <div className="relative z-10 flex justify-between items-start flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">✉️</span>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Property Inquiries</h1>
                            <p className="text-zinc-400 text-lg">View messages and inquiries from potential buyers.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2 bg-zinc-800 text-white font-bold rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-all flex items-center gap-2">
                            <span>📊</span> Dashboard
                        </button>
                    </div>
                </div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">📩</span>
                        <h2 className="text-xl font-bold text-white">All Inquiries</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative max-w-xs">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all text-sm"
                                placeholder="Search inquiries..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20">
                            {filteredInquiries.length} total
                        </span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                            <tr className="border-b border-zinc-800">
                                <th className="px-6 py-4 font-medium">Property</th>
                                <th className="px-6 py-4 font-medium">From</th>
                                <th className="px-6 py-4 font-medium">Contact</th>
                                <th className="px-6 py-4 font-medium">Message</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredInquiries.map((i: any) => (
                                <tr key={i.id} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <a href="#" className="text-sm font-bold text-green-500 hover:underline">{i.property_title}</a>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-white">{i.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-zinc-400">{i.email}</div>
                                        <div className="text-xs text-zinc-500">{i.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-zinc-300 truncate max-w-xs">{i.message}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-500">{i.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-700 transition-colors" title="Reply">✉️</button>
                                            <button className="p-2 bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-lg border border-zinc-700 transition-colors" title="Delete">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {filteredInquiries.length === 0 && (
                            <tbody>
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-zinc-500">No inquiries found.</td>
                                </tr>
                            </tbody>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SellerInquiryManager;

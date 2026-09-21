import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/endpoints';

const AgentPropertyManager: React.FC = () => {
    const [search, setSearch] = useState('');

    const { data: properties = [], isLoading } = useQuery({
        queryKey: ['agent-properties'],
        queryFn: async () => {
            const response = await api.agent.properties();
            return response.data;
        },
    });

    const filteredProperties = properties.filter((p: any) =>
        (p.title && p.title.toLowerCase().includes(search.toLowerCase())) ||
        (p.location && p.location.toLowerCase().includes(search.toLowerCase()))
    );

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Properties...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
                <div className="relative z-10 flex justify-between items-start flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🏢</span>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Assigned Properties</h1>
                            <p className="text-zinc-400 text-lg">View and manage all properties assigned to you.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2">
                            <span>📅</span> Site Visits
                        </button>
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
                        <span className="text-xl">🏠</span>
                        <h2 className="text-xl font-bold text-white">All Properties</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative max-w-xs">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all text-sm"
                                placeholder="Search properties..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20">
                            {filteredProperties.length} Assigned
                        </span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                            <tr className="border-b border-zinc-800">
                                <th className="px-6 py-4 font-medium">Image</th>
                                <th className="px-6 py-4 font-medium">Title</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Price</th>
                                <th className="px-6 py-4 font-medium">Location</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Views</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredProperties.map((p: any) => (
                                <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        {p.image ? (
                                            <img src={p.image} alt="" className="w-12 h-12 rounded-lg object-cover border border-zinc-700" />
                                        ) : (
                                            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 border border-zinc-700">🖼️</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <a href="#" className="text-sm font-bold text-green-500 hover:underline">{p.title}</a>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">{p.type}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-white">{p.price?.toLocaleString()} Frw</td>
                                    <td className="px-6 py-4 text-sm text-zinc-500">{p.location}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                            p.status === 'listed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            p.status === 'under_negotiation' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-500">{p.views}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-700 transition-colors" title="Schedule Visit">📅</button>
                                            <button className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-700 transition-colors" title="Upload Photos">📷</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredProperties.length === 0 && (
                        <div className="p-10 text-center text-zinc-500">No properties found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentPropertyManager;

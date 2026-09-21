import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';

interface Visit {
    id: number;
    property_title: string;
    date: string;
    visitor: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
    notes: string;
}

const VisitColumn = ({ status, title, visits, onUpdateStatus }: { status: string, title: string, visits: Visit[], onUpdateStatus: (id: number, status: any) => void }) => (
    <div className="flex flex-col h-full min-w-[320px] bg-zinc-900/50 border border-zinc-800 rounded-3xl p-4">
        <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                    status === 'scheduled' ? 'bg-blue-500' :
                    status === 'completed' ? 'bg-green-500' :
                    status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                {title}
            </h3>
            <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs font-bold rounded-full border border-zinc-700">
                {visits.length}
            </span>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {visits.map(v => (
                <div key={v.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl hover:border-zinc-600 transition-all group shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                        <div className="text-sm font-bold text-white truncate mr-2">{v.property_title}</div>
                        <select
                            value={v.status}
                            onChange={(e) => onUpdateStatus(v.id, e.target.value as any)}
                            className="bg-zinc-800 text-[10px] text-zinc-400 border border-zinc-700 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-green-500"
                        >
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="no_show">No Show</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span>📅</span> {v.date}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span>👤</span> {v.visitor}
                        </div>
                        {v.notes && (
                            <div className="p-2 bg-zinc-800/50 rounded-lg text-xs text-zinc-400 italic border-l-2 border-zinc-700">
                                "{v.notes}"
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {visits.length === 0 && (
                <div className="h-32 flex items-center justify-center text-zinc-600 text-xs italic border-2 border-dashed border-zinc-800 rounded-2xl">
                    No visits here
                </div>
            )}
        </div>
    </div>
);

const AgentVisitKanban: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: visits = [], isLoading } = useQuery({
        queryKey: ['agent-visits'],
        queryFn: async () => {
            const response = await api.agent.visits();
            return response.data;
        },
    });

    const updateVisitMutation = useMutation({
        mutationFn: async ({ id, status }: { id: number, status: Visit['status'] }) => {
            return api.agent.updateVisit(id.toString(), status);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agent-visits'] });
        },
    });

    const updateVisitStatus = (id: number, status: Visit['status']) => {
        updateVisitMutation.mutate({ id, status });
    };

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Visit Kanban...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
                <div className="relative z-10 flex justify-between items-start flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">📍</span>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Site Visits</h1>
                            <p className="text-zinc-400 text-lg">Track and manage all your scheduled property visits.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2">
                            <span>🏢</span> Properties
                        </button>
                        <button className="px-5 py-2 bg-zinc-800 text-white font-bold rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-all flex items-center gap-2">
                            <span>📊</span> Dashboard
                        </button>
                    </div>
                </div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
            </div>

            <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar">
                <VisitColumn
                    status="scheduled"
                    title="Scheduled"
                    visits={visits.filter(v => v.status === 'scheduled')}
                    onUpdateStatus={updateVisitStatus}
                />
                <VisitColumn
                    status="completed"
                    title="Completed"
                    visits={visits.filter(v => v.status === 'completed')}
                    onUpdateStatus={updateVisitStatus}
                />
                <VisitColumn
                    status="cancelled"
                    title="Cancelled"
                    visits={visits.filter(v => v.status === 'cancelled')}
                    onUpdateStatus={updateVisitStatus}
                />
                <VisitColumn
                    status="no_show"
                    title="No Show"
                    visits={visits.filter(v => v.status === 'no_show')}
                    onUpdateStatus={updateVisitStatus}
                />
            </div>
        </div>
    );
};

export default AgentVisitKanban;

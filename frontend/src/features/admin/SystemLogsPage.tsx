import React, { useState } from 'react';

interface LogEntry {
    pk: number;
    timestamp: string;
    level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    category: string;
    message: string;
    user?: string;
    ip_address: string;
    method?: string;
    path: string;
    details?: string;
}

interface Stat {
    label: string;
    value: number;
    color: string;
    icon: string;
}

const SystemLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([
        { pk: 1042, timestamp: '2026-09-18 14:20:01', level: 'INFO', category: 'AUTH', message: 'User admin_olivier logged in successfully', user: 'admin_olivier', ip_address: '192.168.1.10', method: 'POST', path: '/api/auth/login/', details: '{"session_id": "sess_abc123", "duration": "120ms"}' },
        { pk: 1041, timestamp: '2026-09-18 14:15:30', level: 'WARNING', category: 'SYSTEM', message: 'API latency increased in Visual Search module', user: undefined, ip_address: '10.0.0.5', method: 'GET', path: '/api/ai/visual-search/', details: '{"latency": "1.2s", "threshold": "0.5s"}' },
        { pk: 1040, timestamp: '2026-09-18 14:10:12', level: 'ERROR', category: 'DATABASE', message: 'Failed to update listing #452', user: 'admin_olivier', ip_address: '192.168.1.10', method: 'PATCH', path: '/api/listings/452/', details: '{"error": "Deadlock detected", "query": "UPDATE listings SET status=verified..."}' },
        { pk: 1039, timestamp: '2026-09-18 14:05:00', level: 'DEBUG', category: 'AI', message: 'NVIDIA API request sent for valuation', user: undefined, ip_address: '10.0.0.1', method: 'POST', path: '/api/ai/valuation/', details: '{"payload": {"asset_id": 88, "coords": [1.9, 30.1]}}' },
        { pk: 1038, timestamp: '2026-09-18 13:55:45', level: 'CRITICAL', category: 'SECURITY', message: 'Unauthorized access attempt to Admin Hub', user: 'unknown', ip_address: '45.12.33.101', method: 'GET', path: '/api/admin/hub/', details: '{"reason": "Invalid JWT token", "attempt_count": 5}' },
    ]);
    const [search, setSearch] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

    const filteredLogs = logs.filter(log => {
        const matchesSearch = !search || log.message.toLowerCase().includes(search.toLowerCase()) || log.user?.toLowerCase().includes(search.toLowerCase()) || log.path.toLowerCase().includes(search.toLowerCase());
        const matchesLevel = !levelFilter || log.level === levelFilter;
        const matchesCategory = !categoryFilter || log.category === categoryFilter;
        return matchesSearch && matchesLevel && matchesCategory;
    });

    const stats: Stat[] = [
        { label: 'Total Entries', value: logs.length, color: 'text-white', icon: '📊' },
        { label: 'Info', value: logs.filter(l => l.level === 'INFO').length, color: 'text-green-400', icon: 'ℹ️' },
        { label: 'Warnings', value: logs.filter(l => l.level === 'WARNING').length, color: 'text-yellow-400', icon: '⚠️' },
        { label: 'Errors', value: logs.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL').length, color: 'text-red-400', icon: '🚫' },
    ];

    const toggleExpand = (pk: number) => {
        const newExpanded = new Set(expandedLogs);
        if (newExpanded.has(pk)) newExpanded.delete(pk);
        else newExpanded.add(pk);
        setExpandedLogs(newExpanded);
    };

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'DEBUG': return <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-400 rounded border border-indigo-500/30 uppercase">Debug</span>;
            case 'INFO': return <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 rounded border border-green-500/30 uppercase">Info</span>;
            case 'WARNING': return <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30 uppercase">Warning</span>;
            case 'ERROR': return <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 rounded border border-red-500/30 uppercase">Error</span>;
            case 'CRITICAL': return <span className="px-2 py-0.5 text-[10px] font-bold bg-zinc-100 text-black rounded border border-zinc-300 uppercase">Critical</span>;
            default: return <span className="px-2 py-0.5 text-[10px] font-bold bg-zinc-800 text-zinc-400 rounded border border-zinc-700 uppercase">{level}</span>;
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">📜</span>
                    <h1 className="text-3xl font-bold text-white">System Logs</h1>
                </div>
                <button
                    onClick={() => { if(window.confirm('Clear all logs?')) setLogs([]); }}
                    className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-sm font-medium"
                >
                    🗑️ Clear All
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center gap-4 hover:border-zinc-600 transition-all">
                        <div className="text-3xl">{stat.icon}</div>
                        <div>
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                            <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left: Filters and Table */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Filter Bar */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex flex-wrap gap-4 items-center">
                        <div className="relative flex-1 min-w-[200px]">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
                            <input
                                type="text"
                                className="w-full pl-12 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                placeholder="Search logs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-300 outline-none focus:ring-2 focus:ring-green-500"
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                        >
                            <option value="">All Levels</option>
                            <option value="DEBUG">Debug</option>
                            <option value="INFO">Info</option>
                            <option value="WARNING">Warning</option>
                            <option value="ERROR">Error</option>
                            <option value="CRITICAL">Critical</option>
                        </select>
                        <select
                            className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-300 outline-none focus:ring-2 focus:ring-green-500"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            <option value="AUTH">Auth</option>
                            <option value="SYSTEM">System</option>
                            <option value="DATABASE">Database</option>
                            <option value="AI">AI</option>
                            <option value="SECURITY">Security</option>
                        </select>
                        <button
                            onClick={() => { setSearch(''); setLevelFilter(''); setCategoryFilter(''); }}
                            className="px-4 py-2 text-zinc-400 hover:text-white text-sm transition-colors"
                        >
                            Reset
                        </button>
                    </div>

                    {/* Logs Table */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">#</th>
                                        <th className="px-6 py-4 font-medium">Timestamp</th>
                                        <th className="px-6 py-4 font-medium">Level</th>
                                        <th className="px-6 py-4 font-medium">Category</th>
                                        <th className="px-6 py-4 font-medium">Message</th>
                                        <th className="px-6 py-4 font-medium">User</th>
                                        <th className="px-6 py-4 font-medium">Path</th>
                                        <th className="px-6 py-4 font-medium text-center">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {filteredLogs.map(log => (
                                        <React.Fragment key={log.pk}>
                                            <tr className="hover:bg-zinc-800/30 transition-colors group">
                                                <td className="px-6 py-4 text-xs text-zinc-500">{log.pk}</td>
                                                <td className="px-6 py-4 text-xs text-zinc-400 whitespace-nowrap">
                                                    {log.timestamp}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getLevelBadge(log.level)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-zinc-800 text-zinc-400 rounded border border-zinc-700 uppercase">
                                                        {log.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-zinc-200 truncate max-w-xs" title={log.message}>
                                                    {log.message}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-zinc-400">
                                                    {log.user || '—'}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-zinc-500 truncate max-w-[120px]">
                                                    <span className="font-bold text-green-500">{log.method}</span> {log.path}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {log.details && (
                                                        <button
                                                            onClick={() => toggleExpand(log.pk)}
                                                            className="text-zinc-500 hover:text-white transition-colors"
                                                        >
                                                            {expandedLogs.has(log.pk) ? '🔼' : '🔽'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                            {expandedLogs.has(log.pk) && log.details && (
                                                <tr className="bg-zinc-800/50">
                                                    <td colSpan={8} className="px-6 py-4">
                                                        <div className="bg-black p-4 rounded-xl font-mono text-xs text-green-400 whitespace-pre-wrap border border-zinc-700">
                                                            {log.details}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                            {filteredLogs.length === 0 && (
                                <div className="p-10 text-center text-zinc-500">No logs match the current filters.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Breakdowns */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span>📊</span> By Level
                        </h2>
                        <div className="space-y-4">
                            {['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'].map(lvl => {
                                const count = logs.filter(l => l.level === lvl).length;
                                const pct = logs.length ? (count / logs.length) * 100 : 0;
                                return (
                                    <div key={lvl} className="space-y-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-zinc-400 font-medium">{lvl}</span>
                                            <span className="text-zinc-300">{count}</span>
                                        </div>
                                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${
                                                    lvl === 'ERROR' || lvl === 'CRITICAL' ? 'bg-red-500' :
                                                    lvl === 'WARNING' ? 'bg-yellow-500' :
                                                    lvl === 'INFO' ? 'bg-green-500' : 'bg-indigo-500'
                                                }`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span>📁</span> Top Categories
                        </h2>
                        <div className="space-y-4">
                            {Array.from(new Set(logs.map(l => l.category))).map(cat => {
                                const count = logs.filter(l => l.category === cat).length;
                                const pct = logs.length ? (count / logs.length) * 100 : 0;
                                return (
                                    <div key={cat} className="space-y-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-zinc-400 font-medium">{cat}</span>
                                            <span className="text-zinc-300">{count}</span>
                                        </div>
                                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemLogsPage;

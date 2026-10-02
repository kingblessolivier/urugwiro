import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';

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

    const columns = useMemo(() => [
        { accessorKey: 'pk', id: 'pk', header: '#' },
        { accessorKey: 'timestamp', id: 'timestamp', header: 'Timestamp', cell: ({ row }: any) => <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">{row.original.timestamp}</span> },
        { accessorKey: 'level', id: 'level', header: 'Level', cell: ({ row }: any) => {
            const level = row.original.level;
            const variant = level === 'CRITICAL' ? 'lost' : level === 'ERROR' ? 'declined' : level === 'WARNING' ? 'pending' : level === 'INFO' ? 'published' : 'draft';
            return <StatusBadge status={variant} size="sm" />;
        } },
        { accessorKey: 'category', id: 'category', header: 'Category', cell: ({ row }: any) => <span className="px-2 py-0.5 text-[10px] font-bold bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] rounded border border-[var(--color-border)] uppercase">{row.original.category}</span> },
        { accessorKey: 'message', id: 'message', header: 'Message', cell: ({ row }: any) => <span className="text-sm text-[var(--color-text-muted)] truncate max-w-xs block" title={row.original.message}>{row.original.message}</span> },
        { accessorKey: 'user', id: 'user', header: 'User', cell: ({ row }: any) => <span className="text-sm text-[var(--color-text-muted)]">{row.original.user || '—'}</span> },
        { accessorKey: 'path', id: 'path', header: 'Path', cell: ({ row }: any) => <span className="text-xs text-[var(--color-text-dim)] truncate max-w-[120px] block"><span className="font-bold text-[var(--color-brand-emerald)]">{row.original.method}</span> {row.original.path}</span> },
        { id: 'details', header: '', cell: ({ row }: any) => (
            row.original.details ? (
                <button onClick={() => toggleExpand(row.original.pk)} className="text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] transition-colors text-xs">
                    {expandedLogs.has(row.original.pk) ? 'Hide' : 'Show'}
                </button>
            ) : <span className="text-[var(--color-text-dim)]">—</span>
        ) },
    ], [expandedLogs, toggleExpand]);

    const stats: Stat[] = [
        { label: 'Total Entries', value: logs.length, color: 'text-[var(--color-text-main)]', icon: '📊' },
        { label: 'Info', value: logs.filter(l => l.level === 'INFO').length, color: 'text-[var(--color-brand-emerald)]', icon: 'ℹ️' },
        { label: 'Warnings', value: logs.filter(l => l.level === 'WARNING').length, color: 'text-yellow-600 dark:text-yellow-400', icon: '⚠️' },
        { label: 'Errors', value: logs.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL').length, color: 'text-red-600 dark:text-red-400', icon: '🚫' },
    ];

    const toggleExpand = (pk: number) => {
        const newExpanded = new Set(expandedLogs);
        if (newExpanded.has(pk)) newExpanded.delete(pk);
        else newExpanded.add(pk);
        setExpandedLogs(newExpanded);
    };

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'DEBUG': return <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30 uppercase">Debug</span>;
            case 'INFO': return <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded border border-emerald-200 dark:bg-emerald-500/20 dark:text-[var(--color-brand-emerald)] dark:border-emerald-500/30 uppercase">Info</span>;
            case 'WARNING': return <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-50 text-yellow-700 rounded border border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30 uppercase">Warning</span>;
            case 'ERROR': return <span className="px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-700 rounded border border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 uppercase">Error</span>;
            case 'CRITICAL': return <span className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-[#fff] rounded border border-red-600 dark:bg-red-500 dark:border-red-500 uppercase">Critical</span>;
            default: return <span className="px-2 py-0.5 text-[10px] font-bold bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] rounded border border-[var(--color-border)] uppercase">{level}</span>;
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">📜</span>
                    <h1 className="text-3xl font-bold text-[var(--color-text-main)]">System Logs</h1>
                </div>
                <button
                    onClick={() => { if(window.confirm('Clear all logs?')) setLogs([]); }}
                    className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/20 transition-all text-sm font-medium"
                >
                    🗑️ Clear All
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-6 rounded-xl flex items-center gap-4 hover:border-[var(--color-border-hover)] transition-all shadow-[var(--shadow-depth-1)]">
                        <div className="text-3xl">{stat.icon}</div>
                        <div>
                            <p className="text-xs font-medium text-[var(--color-text-dim)] uppercase tracking-wider">{stat.label}</p>
                            <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left: Filters and Table */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Filter Bar */}
                    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-6 rounded-xl flex flex-wrap gap-4 items-center shadow-[var(--shadow-depth-1)]">
                        <div className="relative flex-1 min-w-[200px]">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]">🔍</span>
                            <input
                                type="text"
                                className="w-full pl-12 pr-4 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="Search logs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            className="bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm text-[var(--color-text-muted)] outline-none focus:ring-2 focus:ring-emerald-500"
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
                            className="bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm text-[var(--color-text-muted)] outline-none focus:ring-2 focus:ring-emerald-500"
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
                            className="px-4 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] text-sm transition-colors"
                        >
                            Reset
                        </button>
                    </div>

                    {/* Logs Table */}
                    <DataTable
                        data={filteredLogs}
                        columns={columns}
                        searchKeys={['message', 'user', 'path']}
                        searchPlaceholder="Search logs..."
                        emptyTitle="No logs found"
                        emptyDescription="No logs match the current filters."
                        showBulkActions={false}
                        showDensityToggle={true}
                        showColumnToggle={true}
                        pageSize={10}
                    />
                </div>

                {/* Right: Breakdowns */}
                <div className="space-y-6">
                    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-6 rounded-xl space-y-6 shadow-[var(--shadow-depth-1)]">
                        <h2 className="text-lg font-bold text-[var(--color-text-main)] flex items-center gap-2">
                            <span>📊</span> By Level
                        </h2>
                        <div className="space-y-4">
                            {['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'].map(lvl => {
                                const count = logs.filter(l => l.level === lvl).length;
                                const pct = logs.length ? (count / logs.length) * 100 : 0;
                                return (
                                    <div key={lvl} className="space-y-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-[var(--color-text-muted)] font-medium">{lvl}</span>
                                            <span className="text-[var(--color-text-muted)]">{count}</span>
                                        </div>
                                        <div className="h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${
                                                    lvl === 'ERROR' || lvl === 'CRITICAL' ? 'bg-red-500' :
                                                    lvl === 'WARNING' ? 'bg-yellow-500' :
                                                    lvl === 'INFO' ? 'bg-emerald-500' : 'bg-indigo-500'
                                                }`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-6 rounded-xl space-y-6 shadow-[var(--shadow-depth-1)]">
                        <h2 className="text-lg font-bold text-[var(--color-text-main)] flex items-center gap-2">
                            <span>📁</span> Top Categories
                        </h2>
                        <div className="space-y-4">
                            {Array.from(new Set(logs.map(l => l.category))).map(cat => {
                                const count = logs.filter(l => l.category === cat).length;
                                const pct = logs.length ? (count / logs.length) * 100 : 0;
                                return (
                                    <div key={cat} className="space-y-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-[var(--color-text-muted)] font-medium">{cat}</span>
                                            <span className="text-[var(--color-text-muted)]">{count}</span>
                                        </div>
                                        <div className="h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 transition-all duration-500"
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

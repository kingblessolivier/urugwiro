import React, { useState, useMemo, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChartNoAxesColumn, CircleAlert, CircleX, FileClock, FolderTree, Info, Search, Trash2 } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { api } from '../../api/endpoints';

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
    icon: React.ComponentType<{ size?: number }>;
}

const SystemLogsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const logsQuery = useQuery({
        queryKey: ['admin-system-logs'],
        queryFn: async () => {
            const response = await api.admin.systemLogs.list({ page_size: 100 });
            const rows: any[] = Array.isArray(response.data) ? response.data : response.data?.results || [];
            return rows.map((row: any): LogEntry => ({
                pk: row.id,
                timestamp: new Date(row.timestamp).toLocaleString(),
                level: row.level,
                category: row.category,
                message: row.message,
                user: row.user_name || undefined,
                ip_address: row.ip_address || '',
                method: row.method || '',
                path: row.path || '',
                details: row.details && Object.keys(row.details).length ? JSON.stringify(row.details, null, 2) : undefined,
            }));
        },
    });
    const logs = logsQuery.data || [];
    const clearMutation = useMutation({
        mutationFn: () => api.admin.systemLogs.clear(),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-system-logs'] }),
    });
    const [search, setSearch] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

    const toggleExpand = useCallback((pk: number) => {
        setExpandedLogs((current) => {
            const next = new Set(current);
            if (next.has(pk)) next.delete(pk);
            else next.add(pk);
            return next;
        });
    }, []);

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
        { label: 'Total Entries', value: logs.length, color: 'text-[var(--color-text-main)]', icon: ChartNoAxesColumn },
        { label: 'Info', value: logs.filter(l => l.level === 'INFO').length, color: 'text-[var(--color-brand-emerald)]', icon: Info },
        { label: 'Warnings', value: logs.filter(l => l.level === 'WARNING').length, color: 'text-yellow-600 dark:text-yellow-400', icon: CircleAlert },
        { label: 'Errors', value: logs.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL').length, color: 'text-red-600 dark:text-red-400', icon: CircleX },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <FileClock size={28} aria-hidden="true" />
                    <h1 className="text-3xl font-bold text-[var(--color-text-main)]">System Logs</h1>
                </div>
                <button
                    onClick={() => { if (window.confirm('Clear all system logs?')) clearMutation.mutate(); }}
                    disabled={clearMutation.isPending || logs.length === 0}
                    className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/20 transition-all text-sm font-medium"
                >
                    <Trash2 size={16} aria-hidden="true" /> Clear All
                </button>
            </div>

            {logsQuery.isLoading && (
                <div className="border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 text-sm text-[var(--color-text-muted)]">Loading system logs...</div>
            )}
            {logsQuery.isError && (
                <div role="alert" className="border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
                    System logs are unavailable. Try again after checking the backend connection.
                </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                    <div key={i} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-6 rounded-lg flex items-center gap-4 hover:border-[var(--color-border-hover)] transition-all shadow-[var(--shadow-depth-1)]">
                        <Icon size={28} />
                        <div>
                            <p className="text-xs font-medium text-[var(--color-text-dim)] uppercase tracking-wider">{stat.label}</p>
                            <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
                        </div>
                    </div>
                );})}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left: Filters and Table */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Filter Bar */}
                    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-6 rounded-xl flex flex-wrap gap-4 items-center shadow-[var(--shadow-depth-1)]">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" aria-hidden="true" />
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
                            <ChartNoAxesColumn size={18} aria-hidden="true" /> By Level
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
                            <FolderTree size={18} aria-hidden="true" /> Top Categories
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

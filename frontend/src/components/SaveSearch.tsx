import React, { useState } from 'react';
import { Bell, BellOff, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';

interface SavedSearch {
    id: string;
    name: string;
    filters: Record<string, string>;
    createdAt: number;
    alertEnabled: boolean;
}

interface SaveSearchProps {
    currentFilters: Record<string, string>;
}

export const SaveSearch: React.FC<SaveSearchProps> = ({ currentFilters }) => {
    const [searches, setSearches] = useState<SavedSearch[]>(() => {
        try {
            const stored = localStorage.getItem('urugwiro_saved_searches');
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState('');

    const saveSearch = () => {
        if (!name.trim()) return;
        const newSearch: SavedSearch = {
            id: Date.now().toString(),
            name: name.trim(),
            filters: { ...currentFilters },
            createdAt: Date.now(),
            alertEnabled: true,
        };
        const updated = [...searches, newSearch];
        setSearches(updated);
        try { localStorage.setItem('urugwiro_saved_searches', JSON.stringify(updated)); } catch {}
        setName('');
        setIsAdding(false);
    };

    const toggleAlert = (id: string) => {
        const updated = searches.map((s) =>
            s.id === id ? { ...s, alertEnabled: !s.alertEnabled } : s
        );
        setSearches(updated);
        try { localStorage.setItem('urugwiro_saved_searches', JSON.stringify(updated)); } catch {}
    };

    const deleteSearch = (id: string) => {
        const updated = searches.filter((s) => s.id !== id);
        setSearches(updated);
        try { localStorage.setItem('urugwiro_saved_searches', JSON.stringify(updated)); } catch {}
    };

    const applySearch = (search: SavedSearch) => {
        // Apply filters and navigate to discovery
        const params = new URLSearchParams();
        Object.entries(search.filters).forEach(([key, val]) => {
            if (val && val !== 'All') params.set(key, val);
        });
        window.location.href = `/discovery?${params.toString()}`;
    };

    return (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[var(--color-text-main)]">Saved Searches</h3>
                <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
                    <Plus size={12} />
                    <span>Save Current</span>
                </Button>
            </div>

            {isAdding && (
                <div className="mb-4 flex gap-2">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Search name..."
                        className="flex-1 rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                    />
                    <Button size="sm" variant="primary" onClick={saveSearch}>Save</Button>
                </div>
            )}

            {searches.length === 0 ? (
                <p className="text-xs text-[var(--color-text-muted)] text-center py-4">
                    No saved searches yet. Save your current filters to get alerts.
                </p>
            ) : (
                <div className="space-y-2">
                    {searches.map((search) => (
                        <div
                            key={search.id}
                            className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5"
                        >
                            <button
                                onClick={() => applySearch(search)}
                                className="flex-1 text-left"
                            >
                                <div className="text-sm font-semibold text-[var(--color-text-main)]">{search.name}</div>
                                <div className="text-[10px] text-[var(--color-text-dim)]">
                                    {Object.keys(search.filters).length} filters
                                </div>
                            </button>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => toggleAlert(search.id)}
                                    className={`p-1.5 rounded-lg transition-colors ${search.alertEnabled ? 'text-emerald-500' : 'text-[var(--color-text-dim)]'}`}
                                    title={search.alertEnabled ? 'Disable alerts' : 'Enable alerts'}
                                >
                                    {search.alertEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                                </button>
                                <button
                                    onClick={() => deleteSearch(search.id)}
                                    className="p-1.5 rounded-lg text-[var(--color-text-dim)] hover:text-red-500 transition-colors"
                                    title="Delete search"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

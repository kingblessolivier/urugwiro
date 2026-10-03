import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    AlertCircle, BadgeCheck, BadgePercent, CalendarClock, Eye, EyeOff,
    Home, Info, Loader2, Megaphone, PartyPopper, Pencil, Plus, Save,
    Star, Trash2, TriangleAlert, X,
} from 'lucide-react';
import { api } from '../../api/endpoints';
import { cn } from '../../lib/utils';
import { tableBody, tableHead, tableTh, tableTr } from '../../components/ui/Dashboard';

interface Announcement {
    id: number;
    text: string;
    icon: string;
    order: number;
    is_active: boolean;
    created_at?: string;
}

type AnnouncementDraft = Pick<Announcement, 'text' | 'icon' | 'order' | 'is_active'>;

const EMPTY_DRAFT: AnnouncementDraft = {
    text: '',
    icon: 'campaign',
    order: 0,
    is_active: true,
};

const ICON_OPTIONS = [
    { value: 'campaign', label: 'Campaign', icon: Megaphone },
    { value: 'home_work', label: 'Property', icon: Home },
    { value: 'verified', label: 'Verified', icon: BadgeCheck },
    { value: 'star', label: 'Featured', icon: Star },
    { value: 'info', label: 'Information', icon: Info },
    { value: 'warning', label: 'Warning', icon: TriangleAlert },
    { value: 'celebration', label: 'Celebration', icon: PartyPopper },
    { value: 'local_offer', label: 'Offer', icon: BadgePercent },
    { value: 'schedule', label: 'Schedule', icon: CalendarClock },
] as const;

const iconFor = (value: string) => ICON_OPTIONS.find((option) => option.value === value)?.icon || Info;
const announcementIcon = (value: string, size: number, className?: string) =>
    React.createElement(iconFor(value), { size, className });

const errorMessage = (error: any): string => {
    const detail = error?.response?.data;
    if (typeof detail?.error === 'string') return detail.error;
    if (typeof detail?.detail === 'string') return detail.detail;
    if (detail && typeof detail === 'object') {
        const first = Object.values(detail).flat().find((value) => typeof value === 'string');
        if (typeof first === 'string') return first;
    }
    return error?.message || 'The announcement could not be saved.';
};

const AnnouncementManager: React.FC = () => {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [draft, setDraft] = useState<AnnouncementDraft>(EMPTY_DRAFT);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const announcementsQuery = useQuery({
        queryKey: ['admin-announcements'],
        queryFn: async () => {
            const response = await api.admin.announcements();
            const data = response.data;
            return (Array.isArray(data) ? data : data?.results || []) as Announcement[];
        },
    });

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
        queryClient.invalidateQueries({ queryKey: ['public-announcements'] });
    };

    const resetEditor = () => {
        setEditingId(null);
        setDraft(EMPTY_DRAFT);
    };

    const createMutation = useMutation({
        mutationFn: (data: AnnouncementDraft) => api.admin.createAnnouncement(data),
        onSuccess: () => {
            refresh();
            resetEditor();
            setFeedback({ type: 'success', text: 'Announcement published.' });
        },
        onError: (error) => setFeedback({ type: 'error', text: errorMessage(error) }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<AnnouncementDraft> }) => api.admin.updateAnnouncement(id, data),
        onSuccess: () => {
            refresh();
            resetEditor();
            setFeedback({ type: 'success', text: 'Announcement updated.' });
        },
        onError: (error) => setFeedback({ type: 'error', text: errorMessage(error) }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.admin.deleteAnnouncement(id),
        onSuccess: () => {
            refresh();
            resetEditor();
            setFeedback({ type: 'success', text: 'Announcement deleted.' });
        },
        onError: (error) => setFeedback({ type: 'error', text: errorMessage(error) }),
    });

    const announcements = announcementsQuery.data || [];
    const isSaving = createMutation.isPending || updateMutation.isPending;

    const edit = (announcement: Announcement) => {
        setEditingId(announcement.id);
        setDraft({
            text: announcement.text,
            icon: announcement.icon,
            order: announcement.order,
            is_active: announcement.is_active,
        });
        setFeedback(null);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        setFeedback(null);
        const payload = { ...draft, text: draft.text.trim() };
        if (editingId === null) createMutation.mutate(payload);
        else updateMutation.mutate({ id: editingId, data: payload });
    };

    const remove = (announcement: Announcement) => {
        if (window.confirm(`Delete "${announcement.text}"?`)) {
            deleteMutation.mutate(announcement.id);
        }
    };

    if (announcementsQuery.isLoading) {
        return <div className="flex min-h-64 items-center justify-center text-[var(--color-text-dim)]"><Loader2 className="animate-spin" size={24} /></div>;
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Announcements</h1>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">Manage notices shown across the public marketplace.</p>
            </div>

            {feedback && (
                <div className={cn(
                    'flex items-center gap-2 rounded-lg border px-4 py-3 text-sm',
                    feedback.type === 'success'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
                )} role="status">
                    {feedback.type === 'success' ? <BadgeCheck size={18} /> : <AlertCircle size={18} />}
                    {feedback.text}
                </div>
            )}

            {announcementsQuery.isError && (
                <div className="flex items-center justify-between gap-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                    <span className="flex items-center gap-2"><AlertCircle size={18} />Announcements could not be loaded.</span>
                    <button type="button" className="font-semibold underline" onClick={() => announcementsQuery.refetch()}>Retry</button>
                </div>
            )}

            <div className="grid grid-cols-3 gap-3">
                <Stat label="Total" value={announcements.length} icon={Megaphone} />
                <Stat label="Active" value={announcements.filter((item) => item.is_active).length} icon={Eye} />
                <Stat label="Hidden" value={announcements.filter((item) => !item.is_active).length} icon={EyeOff} />
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                <section className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                    <div className="border-b border-[var(--color-border)] px-5 py-4">
                        <h2 className="font-semibold text-[var(--color-text-main)]">Marketplace notices</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className={tableHead}>
                                <tr>
                                    <th className={tableTh}>Notice</th>
                                    <th className={tableTh}>Order</th>
                                    <th className={tableTh}>Status</th>
                                    <th className={cn(tableTh, 'text-right')}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={tableBody}>
                                {announcements.map((announcement) => {
                                    return (
                                        <tr key={announcement.id} className={tableTr}>
                                            <td className="px-5 py-4">
                                                <div className="flex min-w-64 items-start gap-3">
                                                    {announcementIcon(announcement.icon, 18, 'mt-0.5 shrink-0 text-[var(--color-brand-emerald)]')}
                                                    <span className="text-sm text-[var(--color-text-main)]">{announcement.text}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-[var(--color-text-muted)]">{announcement.order}</td>
                                            <td className="px-5 py-4">
                                                <span className={cn(
                                                    'inline-flex rounded border px-2 py-0.5 text-xs font-semibold',
                                                    announcement.is_active
                                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                        : 'border-[var(--color-border)] text-[var(--color-text-muted)]',
                                                )}>{announcement.is_active ? 'Active' : 'Hidden'}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-1">
                                                    <button type="button" className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-main)]" onClick={() => edit(announcement)} title="Edit announcement" aria-label="Edit announcement"><Pencil size={16} /></button>
                                                    <button type="button" className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-red-600" onClick={() => remove(announcement)} disabled={deleteMutation.isPending} title="Delete announcement" aria-label="Delete announcement"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {!announcementsQuery.isError && announcements.length === 0 && (
                        <div className="px-5 py-12 text-center text-sm text-[var(--color-text-muted)]">No announcements have been created.</div>
                    )}
                </section>

                <section className="h-fit rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <h2 className="font-semibold text-[var(--color-text-main)]">{editingId === null ? 'New announcement' : 'Edit announcement'}</h2>
                        {editingId !== null && <button type="button" onClick={resetEditor} className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)]" title="Cancel editing" aria-label="Cancel editing"><X size={16} /></button>}
                    </div>
                    <form onSubmit={submit} className="space-y-4">
                        <label className="block space-y-1.5">
                            <span className="text-xs font-semibold text-[var(--color-text-muted)]">Message</span>
                            <textarea value={draft.text} onChange={(event) => setDraft({ ...draft, text: event.target.value })} required maxLength={200} rows={4} className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500" />
                            <span className="block text-right text-xs text-[var(--color-text-dim)]">{draft.text.length}/200</span>
                        </label>
                        <label className="block space-y-1.5">
                            <span className="text-xs font-semibold text-[var(--color-text-muted)]">Icon</span>
                            <div className="flex items-center gap-2">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-brand-emerald)]">{announcementIcon(draft.icon, 18)}</span>
                                <select value={draft.icon} onChange={(event) => setDraft({ ...draft, icon: event.target.value })} className="h-10 min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500">
                                    {ICON_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </select>
                            </div>
                        </label>
                        <label className="block space-y-1.5">
                            <span className="text-xs font-semibold text-[var(--color-text-muted)]">Display order</span>
                            <input type="number" min={0} max={32767} value={draft.order} onChange={(event) => setDraft({ ...draft, order: Math.max(0, Number(event.target.value) || 0) })} className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500" />
                        </label>
                        <label className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-sm text-[var(--color-text-main)]">
                            Visible on the marketplace
                            <input type="checkbox" checked={draft.is_active} onChange={(event) => setDraft({ ...draft, is_active: event.target.checked })} className="h-4 w-4 accent-emerald-600" />
                        </label>
                        <button type="submit" disabled={isSaving || !draft.text.trim()} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : editingId === null ? <Plus size={16} /> : <Save size={16} />}
                            {editingId === null ? 'Publish announcement' : 'Save changes'}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

const Stat = ({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ size?: number; className?: string }> }) => (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <Icon size={20} className="shrink-0 text-[var(--color-brand-emerald)]" />
        <div>
            <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
            <p className="text-xl font-bold text-[var(--color-text-main)]">{value}</p>
        </div>
    </div>
);

export default AnnouncementManager;

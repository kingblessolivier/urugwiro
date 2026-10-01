import React, { useState } from 'react';
import { Bell, CheckCheck, MessageSquare, Calendar, Mail, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import { cn } from '../../lib/utils';

interface NotificationItem {
  id: number;
  type: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  actor?: string;
}

const iconFor = (type: string) => {
  if (type.includes('message')) return MessageSquare;
  if (type.includes('visit')) return Calendar;
  if (type.includes('contact')) return Mail;
  return Bell;
};

export const NotificationCenter: React.FC = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.notifications.list()).data,
    refetchInterval: 15000,
    retry: false,
  });

  const markAllRead = useMutation({
    mutationFn: api.notifications.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications: NotificationItem[] = data?.results || [];
  const unreadCount = data?.unread_count || 0;

  const openNotification = async (item: NotificationItem) => {
    if (!item.is_read) {
      await api.notifications.markRead(item.id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
    setOpen(false);
    if (item.link) window.location.assign(item.link);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        onClick={() => setOpen((current) => !current)}
        className="relative rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-main)]"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-emerald-600 px-1 text-center text-[9px] font-bold leading-4 text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button type="button" aria-label="Close notifications" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-main)]">Notifications</h3>
                <p className="text-[10px] text-[var(--color-text-dim)]">{unreadCount ? `${unreadCount} need attention` : 'You are all caught up'}</p>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button type="button" onClick={() => markAllRead.mutate()} className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-emerald-600" title="Mark all as read">
                    <CheckCheck size={16} />
                  </button>
                )}
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)]" aria-label="Close">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-5 py-10 text-center text-xs text-[var(--color-text-dim)]">
                  <Bell size={24} className="mx-auto mb-2 opacity-40" />
                  No notifications yet.
                </div>
              ) : notifications.map((item) => {
                const Icon = iconFor(item.type);
                return (
                  <button key={item.id} type="button" onClick={() => openNotification(item)} className={cn('flex w-full gap-3 border-b border-[var(--color-border)] px-4 py-3 text-left transition hover:bg-[var(--color-bg-elevated)]', !item.is_read && 'bg-emerald-500/5')}>
                    <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', item.is_read ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]' : 'bg-emerald-500/15 text-emerald-600')}>
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-[var(--color-text-main)]">{item.message}</span>
                      <span className="mt-1 block text-[10px] text-[var(--color-text-dim)]">{new Date(item.created_at).toLocaleString()}</span>
                    </span>
                    {!item.is_read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;

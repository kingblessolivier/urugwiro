import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TimelineEvent {
  id: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  channel?: string;
  performer?: string;
  timestamp: string;
}

export interface TimelineProps {
  events: TimelineEvent[];
  emptyMessage?: string;
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  events,
  emptyMessage = 'No activity recorded yet.',
  className,
}) => {
  if (!events || events.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-[var(--color-text-dim)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--color-border)]', className)}>
      {events.map((evt) => {
        const dateObj = new Date(evt.timestamp);
        const formattedDate = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : evt.timestamp;

        return (
          <div key={evt.id} className="relative group">
            {/* Node icon */}
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[var(--color-bg-surface)] border-2 border-emerald-500 text-emerald-600 flex items-center justify-center text-[10px] shadow-xs">
              {evt.icon || <Clock className="w-2.5 h-2.5" />}
            </div>

            <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl p-3.5 space-y-1.5 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[var(--color-text-main)]">
                  {evt.title}
                </span>
                <span className="text-[10px] font-mono text-[var(--color-text-dim)]">
                  {formattedDate}
                </span>
              </div>

              {evt.description && (
                <p className="text-xs text-[var(--color-text-muted)] whitespace-pre-wrap leading-relaxed">
                  {evt.description}
                </p>
              )}

              <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-dim)] pt-1">
                {evt.channel && (
                  <span className="px-2 py-0.5 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] font-medium capitalize">
                    {evt.channel}
                  </span>
                )}
                {evt.performer && (
                  <span>By: <strong className="font-semibold text-[var(--color-text-main)]">{evt.performer}</strong></span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;

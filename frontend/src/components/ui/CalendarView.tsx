import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  status: string;
  color?: string;
  customerName?: string;
  propertyTitle?: string;
}

export interface CalendarProps {
  events: CalendarEvent[];
  view?: 'month' | 'week' | 'day';
  onDateClick?: (date: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

export const CalendarView: React.FC<CalendarProps> = ({
  events,
  onDateClick,
  onEventClick,
  className,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month === 0 ? 12 : month;
    const y = month === 0 ? year - 1 : year;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: true });
  }

  // Next month leading days to complete 35 or 42 grid cells
  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 1 : month + 2;
    const y = month === 11 ? year + 1 : year;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  const selectedDateEvents = events.filter((e) => e.date === selectedDate);

  return (
    <div className={cn('bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-xs flex flex-col lg:flex-row', className)}>
      {/* Calendar Grid */}
      <div className="flex-1 p-4 sm:p-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-main)]">
              {monthNames[month]} {year}
            </h2>
            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-md border border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dw) => (
            <div key={dw} className="text-[11px] font-semibold text-[var(--color-text-dim)] uppercase tracking-wider py-1">
              {dw}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((item, idx) => {
            const isSelected = item.dateStr === selectedDate;
            const dayEvents = events.filter((e) => e.date === item.dateStr);
            const hasEvents = dayEvents.length > 0;
            const isToday = item.dateStr === new Date().toISOString().split('T')[0];

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedDate(item.dateStr);
                  onDateClick?.(item.dateStr);
                }}
                className={cn(
                  'min-h-[64px] sm:min-h-[76px] p-1.5 rounded-xl border flex flex-col items-start justify-between transition-colors text-left relative group',
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500/50'
                    : 'border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]',
                  !item.isCurrentMonth && 'opacity-40'
                )}
              >
                <span
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold',
                    isToday
                      ? 'bg-emerald-600 text-white font-bold'
                      : isSelected
                      ? 'text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'text-[var(--color-text-main)]'
                  )}
                >
                  {item.dayNum}
                </span>

                {/* Event indicator dots */}
                {hasEvents && (
                  <div className="w-full flex flex-col gap-0.5 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <span
                        key={ev.id}
                        className="text-[9px] truncate px-1 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 block w-full leading-tight font-medium"
                      >
                        {ev.time ? `${ev.time} ` : ''}{ev.title}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[8px] text-[var(--color-text-dim)] font-mono pl-1">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda Sidebar */}
      <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-[var(--color-border)] p-4 sm:p-6 bg-[var(--color-bg-deep)]/50 flex flex-col">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--color-border)]">
          <CalendarIcon className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-[var(--color-text-main)]">
            Schedule for {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </h3>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto">
          {selectedDateEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--color-text-dim)]">
              No visits or showings scheduled for this date.
            </div>
          ) : (
            selectedDateEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] hover:border-emerald-500/50 transition-colors cursor-pointer space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--color-text-main)] truncate">
                    {event.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold capitalize">
                    {event.status}
                  </span>
                </div>

                {event.time && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-dim)] font-mono">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>{event.time}</span>
                  </div>
                )}

                {event.customerName && (
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    Client: <strong className="font-semibold text-[var(--color-text-main)]">{event.customerName}</strong>
                  </p>
                )}
                {event.propertyTitle && (
                  <p className="text-[10px] text-[var(--color-text-dim)] truncate">
                    Property: {event.propertyTitle}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

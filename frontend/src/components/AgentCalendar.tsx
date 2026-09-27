import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { Button } from './ui/Button';

interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    location?: string;
    type: 'visit' | 'offer' | 'contract' | 'other';
}

interface AgentCalendarProps {
    events: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
}

export const AgentCalendar: React.FC<AgentCalendarProps> = ({ events, onEventClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
    ).getDate();

    const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    ).getDay();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getEventsForDay = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter((e) => e.date === dateStr);
    };

    const typeColors = {
        visit: 'bg-sky-500',
        offer: 'bg-emerald-500',
        contract: 'bg-purple-500',
        other: 'bg-amber-500',
    };

    return (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-[var(--color-brand-emerald)]" />
                    <h3 className="text-base font-bold text-[var(--color-text-main)]">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={prevMonth}
                        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                    <div key={day} className="text-center text-[10px] font-bold text-[var(--color-text-dim)] py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const dayEvents = getEventsForDay(day);
                    const isToday = new Date().getDate() === day &&
                        new Date().getMonth() === currentDate.getMonth() &&
                        new Date().getFullYear() === currentDate.getFullYear();

                    return (
                        <div
                            key={day}
                            className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative ${
                                isToday ? 'bg-[var(--color-brand-emerald)]/15 font-bold text-[var(--color-brand-emerald)]' : 'text-[var(--color-text-muted)]'
                            }`}
                        >
                            {day}
                            {dayEvents.length > 0 && (
                                <div className="flex gap-0.5 mt-0.5">
                                    {dayEvents.slice(0, 3).map((event, eidx) => (
                                        <div
                                            key={eidx}
                                            className={`w-1.5 h-1.5 rounded-full ${typeColors[event.type]}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Upcoming events */}
            <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                    Upcoming Events
                </h4>
                {events.length === 0 ? (
                    <p className="text-xs text-[var(--color-text-dim)] text-center py-2">No upcoming events</p>
                ) : (
                    <div className="space-y-2">
                        {events.slice(0, 5).map((event) => (
                            <button
                                key={event.id}
                                onClick={() => onEventClick?.(event)}
                                className="w-full flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-2.5 text-left hover:border-[var(--color-brand-emerald)]/40 transition-colors"
                            >
                                <div className={`w-2 h-2 rounded-full ${typeColors[event.type]}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-[var(--color-text-main)] truncate">{event.title}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-dim)]">
                                        <span className="flex items-center gap-0.5">
                                            <Clock size={9} />
                                            {event.time}
                                        </span>
                                        {event.location && (
                                            <span className="flex items-center gap-0.5">
                                                <MapPin size={9} />
                                                {event.location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

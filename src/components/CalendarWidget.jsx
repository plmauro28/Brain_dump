import React from 'react';
import Calendar from 'react-calendar';
import { CalendarDays } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

export default function CalendarWidget({ reminders, isExpanded }) {
  const datesWithReminders = reminders.map((r) => new Date(r.date).toDateString());

  const tileClassName = ({ date, view }) => {
    if (view === 'month' && datesWithReminders.includes(date.toDateString())) {
      return 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-bold rounded-full';
    }
    return null;
  };

  const calendarStyles = `
    .react-calendar { background: transparent !important; border: none !important; font-family: inherit !important; }
    .react-calendar__navigation button { color: inherit !important; min-width: 36px; background: none !important; }
    .react-calendar__month-view__weekdays { font-weight: 600; font-size: 0.65rem; color: #9ca3af; }
    .react-calendar__tile { padding: 0.4em 0.2em !important; color: inherit; }
    .react-calendar__tile:disabled { background-color: transparent !important; }
    .react-calendar__tile--now { background: #f3f4f6; border-radius: 9999px; color: #111827; }
    .dark .react-calendar__tile--now { background: #374151; color: #f9fafb; }
    .react-calendar__tile--active { background: var(--brand-500, #3b82f6) !important; color: white !important; border-radius: 9999px; }
  `;

  return (
    <div className={`glass-panel rounded-xl p-3 sm:p-4 flex flex-col ${isExpanded ? 'h-full w-full border-none shadow-none' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <CalendarDays className="w-4 h-4 text-brand-500" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Mi Calendario</h3>
      </div>
      <div className="flex justify-center w-full overflow-hidden">
        <div className="w-full">
           <Calendar 
             tileClassName={tileClassName}
             className="border-none rounded-lg bg-transparent dark:text-gray-200 text-xs"
           />
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: calendarStyles}} />
    </div>
  );
}

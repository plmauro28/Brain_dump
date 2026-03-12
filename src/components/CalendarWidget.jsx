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

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 sm:p-6 flex flex-col ${isExpanded ? 'h-full w-full border-none shadow-none' : ''}`}>
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5 text-brand-500" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Mi Calendario</h3>
      </div>
      <div className={`flex justify-center w-full overflow-hidden calendar-wrapper ${isExpanded ? 'flex-1 items-center' : ''}`}>
        <div className={`${isExpanded ? 'scale-[1.3] sm:scale-150 transform origin-top w-full flex justify-center mt-10' : 'w-full'}`}>
           <Calendar 
             tileClassName={tileClassName}
             className="border-none rounded-xl bg-transparent dark:text-gray-200"
           />
        </div>
      </div>
      {/* Añadir estilos para el calendario en darkMode */}
      <style dangerouslySetInnerHTML={{__html: `
        .react-calendar {
            background: transparent !important;
            border: none !important;
            font-family: inherit !important;
        }
        .react-calendar__navigation button {
            color: inherit !important;
            min-width: 44px;
            background: none !important;
        }
        .react-calendar__month-view__weekdays {
            font-weight: 600;
            font-size: 0.75rem;
            color: #9ca3af;
        }
        .react-calendar__tile {
            padding: 0.5em 0.25em !important;
            color: inherit;
        }
        .react-calendar__tile:disabled {
            background-color: transparent !important;
        }
        .react-calendar__tile--now {
            background: #f3f4f6;
            border-radius: 9999px;
            color: #111827;
        }
        .dark .react-calendar__tile--now {
            background: #374151;
            color: #f9fafb;
        }
        .react-calendar__tile--active {
            background: var(--brand-500, #3b82f6) !important;
            color: white !important;
            border-radius: 9999px;
        }
      `}} />
    </div>
  );
}

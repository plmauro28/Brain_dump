import React from 'react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, Trash2 } from 'lucide-react';

export default function RemindersWidget({ reminders, onDelete }) {
  if (!reminders || reminders.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 sm:p-6 flex-1 flex flex-col">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Recordatorios</h3>
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <Calendar className="w-10 h-10 text-gray-200 dark:text-gray-800 mb-2" />
          <p className="text-sm text-gray-400 dark:text-gray-500">No hay eventos próximos detectados por la IA.</p>
        </div>
      </div>
    );
  }

  const formatReminderDate = (isoString) => {
    try {
        const date = new Date(isoString);
        let timeLabel = format(date, 'HH:mm'); // Solo hora
        
        let dateLabel = '';
        if (isToday(date)) dateLabel = 'Hoy';
        else if (isTomorrow(date)) dateLabel = 'Mañana';
        else dateLabel = format(date, 'd MMM', { locale: es });

        return {
            dateLabel,
            timeLabel,
            past: isPast(date)
        };
    } catch {
        return { dateLabel: 'Invalida', timeLabel: '', past: false };
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 sm:p-6 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recordatorios</h3>
        <span className="bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold px-2 py-1 rounded-full">
            {reminders.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
        {reminders.map((reminder) => {
            const { dateLabel, timeLabel, past } = formatReminderDate(reminder.date);
            
            return (
                <div 
                    key={reminder.id} 
                    className={`relative group flex flex-col p-3 rounded-xl border transition-colors
                        ${past 
                            ? 'bg-gray-50 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800/50 opacity-70' 
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-brand-200 dark:hover:border-brand-800'
                        }
                    `}
                >
                    <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className={`text-sm font-medium leading-snug ${past ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                            {reminder.title}
                        </h4>
                        
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onDelete(reminder.id);
                            }}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 -mr-2 -mt-2 relative z-10 bg-transparent"
                            title="Eliminar recordatorio"
                        >
                            <Trash2 className="w-4 h-4 cursor-pointer" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md
                            ${past 
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300' 
                                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                            }
                        `}>
                            <Calendar className="w-3 h-3" />
                            {dateLabel}
                        </div>
                        
                        {timeLabel !== '00:00' && ( // Asumimos 00:00 como falta de hora en la extraccion IA a veces
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                {timeLabel}
                            </div>
                        )}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}

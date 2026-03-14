import React from 'react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, Trash2 } from 'lucide-react';

export default function RemindersWidget({ reminders, onDelete }) {
  if (!reminders || reminders.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-4 sm:p-5 flex-1 flex flex-col">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Recordatorios</h3>
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
          <Calendar className="w-6 h-6 text-gray-400/50 mb-2" />
          <p className="text-xs text-gray-400 dark:text-gray-500">No hay eventos próximos detectados por la IA.</p>
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
    <div className="glass-panel rounded-xl p-3 sm:p-4 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recordatorios</h3>
        <span className="bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold px-1.5 py-0.5 rounded-full">
            {reminders.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1">
        {reminders.map((reminder) => {
            const { dateLabel, timeLabel, past } = formatReminderDate(reminder.date);
            
            return (
                <div 
                    key={reminder.id} 
                    className={`relative group flex flex-col p-2 rounded-lg transition-colors
                        ${past 
                            ? 'bg-white/10 dark:bg-gray-900/10 border border-transparent opacity-50 backdrop-blur-sm' 
                            : 'glass-card hover:border-brand-200 dark:hover:border-brand-800'
                        }
                    `}
                >
                    <div className="flex justify-between items-start gap-1">
                        <h4 className={`text-xs font-medium leading-snug ${past ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                            {reminder.title}
                        </h4>
                        
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onDelete(reminder.id);
                            }}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 -mr-1 -mt-1 relative z-10 bg-transparent"
                            title="Eliminar recordatorio"
                        >
                            <Trash2 className="w-3 h-3 cursor-pointer" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded
                            ${past 
                                ? 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300' 
                                : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' 
                            }
                        `}>
                            <Calendar className="w-3 h-3" />
                            {dateLabel}
                        </div>
                        
                        {timeLabel !== '00:00' && (
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

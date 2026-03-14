import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';
import { X, Plus, Trash2, CalendarDays } from 'lucide-react';

export default function DayRemindersModal({ isOpen, onClose, selectedDate }) {
  const { currentUser } = useAuth();
  const reminders = useStore((state) => state.reminders);
  const addReminder = useStore((state) => state.addReminder);
  const deleteReminder = useStore((state) => state.deleteReminder);
  
  const [newTitle, setNewTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !selectedDate) return null;

  // Filter reminders matching the exact local date string
  const dayReminders = reminders.filter(
    (r) => new Date(r.date).toDateString() === selectedDate.toDateString()
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Create a date string for the selected day at noon to avoid timezone shift issues
      const isoDate = new Date(selectedDate.setHours(12, 0, 0, 0)).toISOString();
      await addReminder(currentUser.id, newTitle.trim(), isoDate);
      setNewTitle('');
    } catch (error) {
      console.error("Failed to add reminder:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReminder(currentUser.id, id);
    } catch (error) {
      console.error("Failed to delete reminder:", error);
    }
  };

  const formattedDate = new Intl.DateTimeFormat('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  }).format(selectedDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm transition-opacity">
      {/* Modal Container */}
      <div 
        className="w-full max-w-md glass-panel rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/10 rounded-xl rounded-tl-sm">
              <CalendarDays className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                {formattedDate}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {dayReminders.length} {dayReminders.length === 1 ? 'recordatorio' : 'recordatorios'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reminders List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {dayReminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
              <CalendarDays className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No hay recordatorios para este día.</p>
            </div>
          ) : (
            dayReminders.map((reminder) => (
              <div 
                key={reminder.id}
                className="flex items-center justify-between group p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-white/40 dark:border-white/5 backdrop-blur-md shadow-sm"
              >
                <span className="text-gray-900 dark:text-gray-100 font-medium break-words pr-4">
                  {reminder.title}
                </span>
                <button
                  onClick={() => handleDelete(reminder.id)}
                  className="p-2 text-red-400 opacity-50 hover:opacity-100 hover:bg-red-500/10 rounded-xl transition-all flex-shrink-0"
                  title="Eliminar recordatorio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Reminder Form */}
        <div className="p-5 sm:p-6 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-200/50 dark:border-gray-700/50">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Añadir nuevo recordatorio..."
              className="flex-1 px-4 py-3 bg-white/70 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!newTitle.trim() || isSubmitting}
              className="px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

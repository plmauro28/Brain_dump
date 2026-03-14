import React from 'react';
import { format, subDays, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

export default function WeeklyRecap({ stats }) {
  const { completedThisWeek, totalThisWeek, completionRate, completedTasks, incompleteTasks } = stats;
   
  const weekStart = subDays(new Date(), 7);
  const weekEnd = new Date();
   
  return (
    <div className="glass-panel rounded-xl p-4 sm:p-5">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        Resumen Semanal
      </h3>
       
      {/* Progress Ring */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-12 h-12 shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
            <path
              className="text-gray-100 dark:text-gray-800"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-brand-500 transition-all duration-1000 ease-out"
              strokeWidth="2"
              strokeDasharray={`${completionRate > 0 ? completionRate : 0}, 100`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {Math.round(completionRate)}%
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">
            {completedThisWeek} <span className="text-xs text-gray-400 font-normal">/ {totalThisWeek}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">Tareas esta semana</p>
        </div>
      </div>
       
      {/* Details */}
      <div className="space-y-2">
        {/* Completed Tasks */}
        <div className="border-l-2 border-brand-500 pl-2">
          <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">
            ✅ Completadas esta semana ({completedThisWeek})
          </p>
          {completedTasks.length > 0 ? (
            <ul className="text-xs space-y-0.5 pl-1.5">
              {completedTasks.slice(0, 3).map((task, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="flex-shrink-0">•</span>
                  <span className="whitespace-normal break-words max-w-xs truncate">{task.title}</span>
                </li>
              ))}
              {completedTasks.length > 3 && (
                <li className="text-gray-500 italic text-xs">
                  y {completedTasks.length - 3} más...
                </li>
              )}
            </ul>
          ) : (
            <p className="text-gray-500 italic text-xs">No hay tareas completadas esta semana</p>
          )}
        </div>
         
        {/* Incomplete Tasks */}
        <div className="border-l-2 border-amber-500 pl-2">
          <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">
            ⏳ Pendientes esta semana ({incompleteTasks.length})
          </p>
          {incompleteTasks.length > 0 ? (
            <ul className="text-xs space-y-0.5 pl-1.5">
              {incompleteTasks.slice(0, 3).map((task, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="flex-shrink-0">•</span>
                  <span className="whitespace-normal break-words max-w-xs truncate line-through">{task.title}</span>
                </li>
              ))}
              {incompleteTasks.length > 3 && (
                <li className="text-gray-500 italic text-xs">
                  y {incompleteTasks.length - 3} más...
                </li>
              )}
            </ul>
          ) : (
            <p className="text-gray-500 italic text-xs">¡Todas las tareas de esta semana están completadas!</p>
          )}
        </div>
      </div>
       
      {/* Weekly Insight */}
      {completionRate >= 80 && (
        <div className="mt-2 p-2 bg-brand-50 dark:bg-brand-900/20 rounded border-l-2 border-brand-500">
          <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
            ¡Excelente progreso esta semana! Has completado más del 80% de tus tareas planificadas.
          </p>
        </div>
      )}
      {completionRate < 50 && completionRate > 0 && (
        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded border-l-2 border-amber-500">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            Puedes mejorar tu cumplimiento esta semana. Considera dividir tareas grandes en pasos más pequeños.
          </p>
        </div>
      )}
      {completionRate === 0 && totalThisWeek > 0 && (
        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded border-l-2 border-amber-500">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            Esta semana no has completado ninguna tarea planificada. Revisa tus objetivos y ajusta tu planificación.
          </p>
        </div>
      )}
    </div>
  );
}
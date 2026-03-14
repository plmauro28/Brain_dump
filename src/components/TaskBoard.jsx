import React, { useMemo } from 'react';
import { Trash2, CheckCircle2, Circle, Tag } from 'lucide-react';

export default function TaskBoard({ tasks, onToggle, onDelete }) {
    const groupedTasks = useMemo(() => {
        if (!tasks) return {};
        return tasks.reduce((acc, task) => {
            const cat = task.category || 'General';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(task);
            return acc;
        }, {});
    }, [tasks]);

    const categories = Object.keys(groupedTasks);

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-6 px-3 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">Mente en blanco</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mt-1">Escribe arriba todo lo que tienes que hacer y la IA se encargará de extraer las tareas automáticamente.</p>
           </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 pb-12">
            {categories.map(category => (
                <div key={category} className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                        <Tag className="w-3 h-3" /> {category}
                    </h3>
                    
                    <div className="space-y-1">
                        {groupedTasks[category].map(task => (
                            <div 
                                key={task.id}
                                className={`group flex items-center justify-between p-2 sm:p-2.5 rounded-lg border transition-all duration-200 cursor-pointer
                                    ${task.isCompleted 
                                        ? 'bg-white/10 dark:bg-gray-900/10 border-transparent opacity-50 backdrop-blur-sm' 
                                        : 'glass-card hover:border-brand-300 dark:hover:border-brand-600'}
                                `}
                            >
                                <div 
                                    className="flex items-center gap-2 flex-1"
                                    onClick={() => onToggle(task.id, task.isCompleted)}
                                >
                                    <button className={`flex-shrink-0 transition-colors duration-200
                                        ${task.isCompleted ? 'text-brand-500' : 'text-gray-300 dark:text-gray-600 group-hover:text-brand-400'}
                                    `}>
                                        {task.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                    </button>
                                    
                                    <span className={`text-xs sm:text-base transition-all duration-200
                                        ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-700 dark:text-gray-200 font-medium'}
                                    `}>
                                        {task.title}
                                    </span>
                                </div>
                                
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        onDelete(task.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all relative z-10 cursor-pointer pointer-events-auto"
                                    title="Eliminar tarea"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

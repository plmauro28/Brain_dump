import React, { useMemo } from 'react';
import { Trash2, CheckCircle2, Circle, Tag } from 'lucide-react';

export default function TaskBoard({ tasks, onToggle, onDelete }) {
    
    // Agrupar tareas por categoría
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
            <div className="flex flex-col items-center justify-center text-center py-12 px-4 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Mente en blanco</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1">Escribe arriba todo lo que tienes que hacer y la IA se encargará de extraer las tareas automáticamente.</p>
           </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 pb-20">
            {categories.map(category => (
                <div key={category} className="flex flex-col gap-3">
                    <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide flex items-center gap-2">
                        <Tag className="w-4 h-4" /> {category}
                    </h3>
                    
                    <div className="space-y-2">
                        {groupedTasks[category].map(task => (
                            <div 
                                key={task.id}
                                className={`group flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer
                                    ${task.isCompleted 
                                        ? 'bg-white/10 dark:bg-gray-900/10 border-transparent opacity-50 backdrop-blur-sm' 
                                        : 'glass-card hover:border-brand-300 dark:hover:border-brand-600'
                                    }
                                `}
                            >
                                <div 
                                    className="flex items-center gap-3 md:gap-4 flex-1"
                                    onClick={() => onToggle(task.id, task.isCompleted)}
                                >
                                    <button className={`flex-shrink-0 transition-colors duration-200
                                        ${task.isCompleted ? 'text-brand-500' : 'text-gray-300 dark:text-gray-600 group-hover:text-brand-400'}
                                    `}>
                                        {task.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                    </button>
                                    
                                    <span className={`text-base md:text-lg transition-all duration-200
                                        ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800 dark:text-gray-100 font-medium'}
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
                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all relative z-10 cursor-pointer pointer-events-auto"
                                    title="Eliminar tarea"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

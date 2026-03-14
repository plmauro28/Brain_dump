import React from 'react';
import { Trash2, BrainCircuit } from 'lucide-react';

export default function MemoryLane({ memories, onDelete }) {
  if (!memories || memories.length === 0) return null;

  return (
    <div className="glass-panel rounded-xl p-3 sm:p-4 flex flex-col h-[200px] sm:h-[250px]">
      <div className="flex items-center gap-2 mb-2">
        <BrainCircuit className="w-4 h-4 text-indigo-500" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Memoria a Largo Plazo</h3>
      </div>
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
        {memories.map((mem) => (
          <div key={mem.id} className="p-2 glass-card rounded-lg relative group">
            <p className="text-xs text-gray-800 dark:text-gray-200 pr-5 leading-relaxed">
              {mem.text}
            </p>
            <button
              onClick={() => onDelete(mem.id)}
              className="absolute top-1 right-1 p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800 rounded transition-all"
              title="Olvidar"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

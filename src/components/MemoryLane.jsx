import React from 'react';
import { Trash2, BrainCircuit } from 'lucide-react';

export default function MemoryLane({ memories, onDelete }) {
  if (!memories || memories.length === 0) return null;

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 flex flex-col h-full h-[300px]">
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit className="w-5 h-5 text-indigo-500" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Memoria a Largo Plazo</h3>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
        {memories.map((mem) => (
          <div key={mem.id} className="p-3 glass-card rounded-xl relative group">
            <p className="text-sm text-gray-800 dark:text-gray-200 pr-6 leading-relaxed">
              {mem.text}
            </p>
            <button
              onClick={() => onDelete(mem.id)}
              className="absolute top-2 right-2 p-1.5 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-all"
              title="Olvidar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

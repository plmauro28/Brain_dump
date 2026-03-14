import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function SuggestionsPanel({ suggestions = [] }) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-3 sm:p-4 opacity-60">
        <h3 className="text-xs font-semibold text-brand-800 dark:text-brand-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Lightbulb className="w-3 h-3" /> Sugerencia IA
        </h3>
        <p className="text-xs text-brand-700/70 dark:text-brand-400/70 italic">
          "Descarga tus ideas primero, te ayudaré a priorizar después."
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-3 sm:p-4">
      <h3 className="text-xs font-semibold text-brand-800 dark:text-brand-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Lightbulb className="w-3 h-3" /> Consejos para ti
      </h3>
      
      <div className="space-y-2">
        {suggestions.map((sugg) => (
            <p key={sugg.id} className="text-xs text-brand-700 dark:text-brand-200 leading-relaxed font-medium">
                "{sugg.text}"
            </p>
        ))}
      </div>
    </div>
  );
}

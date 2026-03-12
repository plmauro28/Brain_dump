import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function SuggestionsPanel({ suggestions = [] }) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="bg-brand-50 dark:bg-brand-900/10 rounded-3xl border border-brand-100 dark:border-brand-800/30 p-5 sm:p-6 opacity-60">
        <h3 className="text-sm font-semibold text-brand-800 dark:text-brand-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Sugerencia IA
        </h3>
        <p className="text-sm text-brand-700/70 dark:text-brand-400/70 italic">
          "Descarga tus ideas primero, te ayudaré a priorizar después."
        </p>
      </div>
    );
  }

  return (
    <div className="bg-brand-50 dark:bg-brand-900/10 rounded-3xl border border-brand-100 dark:border-brand-800/30 p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-brand-800 dark:text-brand-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" /> Consejos para ti
      </h3>
      
      <div className="space-y-3">
        {suggestions.map((sugg) => (
            <p key={sugg.id} className="text-sm text-brand-700 dark:text-brand-200 leading-relaxed font-medium">
                "{sugg.text}"
            </p>
        ))}
      </div>
    </div>
  );
}

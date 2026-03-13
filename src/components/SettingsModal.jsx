import React from 'react';
import { X, Globe, Palette, Moon, Sun } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../lib/i18n';

const COLORS = [
  { name: 'Emerald', value: 'emerald' },
  { name: 'Blue', value: 'blue' },
  { name: 'Purple', value: 'purple' },
  { name: 'Rose', value: 'rose' },
  { name: 'Amber', value: 'amber' }
];

export default function SettingsModal({ isOpen, onClose }) {
  const { preferences, setPreferences } = useStore();
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-sm sm:max-w-md glass-panel rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-white/10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-brand-500" />
            {t('settings')}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 glass-card rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-8">
          
          {/* Language Selection */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Idioma / Language
            </span>
            <div className="flex glass-card p-1.5 rounded-xl">
               {['es', 'en', 'fr'].map(langCode => (
                   <button
                     key={langCode}
                     onClick={() => setPreferences({ language: langCode })}
                     className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                         preferences.language === langCode 
                         ? 'bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white shadow-sm ring-1 ring-white/50 dark:ring-white/10' 
                         : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-700/30'
                     }`}
                   >
                       {langCode.toUpperCase()}
                   </button>
               ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Tema / Theme
            </span>
            <div className="flex gap-4">
               <button
                 onClick={() => setPreferences({ theme: 'light' })}
                 className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl transition-all ${
                     preferences.theme === 'light' 
                     ? 'ring-2 ring-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300 shadow-sm' 
                     : 'glass-card text-gray-600 dark:text-gray-400'
                 }`}
               >
                 <Sun className="w-7 h-7" />
                 <span className="text-sm font-semibold">Claro</span>
               </button>
               <button
                 onClick={() => setPreferences({ theme: 'dark' })}
                 className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl transition-all ${
                     preferences.theme === 'dark' 
                     ? 'ring-2 ring-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300 shadow-sm' 
                     : 'glass-card text-gray-600 dark:text-gray-400'
                 }`}
               >
                 <Moon className="w-7 h-7" />
                 <span className="text-sm font-semibold">Oscuro</span>
               </button>
            </div>
          </div>

          {/* Color Selection */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4" /> Color Principal
            </span>
            <div className="flex justify-between items-center glass-card p-4 rounded-2xl">
               {COLORS.map(color => (
                   <button
                     key={color.value}
                     onClick={() => setPreferences({ accentColor: color.value })}
                     className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm ${
                         preferences.accentColor === color.value 
                         ? 'ring-4 ring-offset-2 ring-gray-900 dark:ring-white dark:ring-offset-gray-900 scale-110' 
                         : 'ring-1 ring-black/10 dark:ring-white/10'
                     }`}
                     style={{ 
                         backgroundColor: color.value === 'emerald' ? '#10b981' : 
                                          color.value === 'blue' ? '#3b82f6' : 
                                          color.value === 'purple' ? '#8b5cf6' : 
                                          color.value === 'rose' ? '#f43f5e' : 
                                          '#f59e0b'
                     }}
                     title={color.name}
                   />
               ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

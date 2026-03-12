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
      
      <div className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-brand-500" />
            {t('settings')}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
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
            <div className="flex bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
               {['es', 'en', 'fr'].map(langCode => (
                   <button
                     key={langCode}
                     onClick={() => setPreferences({ language: langCode })}
                     className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                         preferences.language === langCode 
                         ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-gray-600' 
                         : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
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
                 className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                     preferences.theme === 'light' 
                     ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 shadow-sm' 
                     : 'border-gray-100 dark:border-gray-800 hover:border-brand-200 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500'
                 }`}
               >
                 <Sun className="w-7 h-7" />
                 <span className="text-sm font-semibold">Claro</span>
               </button>
               <button
                 onClick={() => setPreferences({ theme: 'dark' })}
                 className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                     preferences.theme === 'dark' 
                     ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 shadow-sm' 
                     : 'border-gray-100 dark:border-gray-800 hover:border-brand-200 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500'
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
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
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

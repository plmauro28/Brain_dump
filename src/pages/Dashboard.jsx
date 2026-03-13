import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { processBrainDumpAsJSON } from '../lib/gemini';
import { LogOut, CloudLightning, Loader2, Sparkles, User, AlertCircle } from 'lucide-react';
import TaskBoard from '../components/TaskBoard';
import RemindersWidget from '../components/RemindersWidget';
import SuggestionsPanel from '../components/SuggestionsPanel';
import MemoryLane from '../components/MemoryLane';
import MapWidget from '../components/MapWidget';
import CalendarWidget from '../components/CalendarWidget';
import ExpandModal from '../components/ExpandModal';
import SettingsModal from '../components/SettingsModal';
import { Maximize2, Settings } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  // Widget Expansion State
  const [expandedWidget, setExpandedWidget] = useState(null); // 'map' | 'calendar' | 'memory' | null
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { t } = useTranslation();
  
  const textareaRef = useRef(null);

  const { 
      tasks, reminders, suggestions, stats, memories, locations,
      subscribeToTasks, subscribeToReminders, subscribeToSuggestions, subscribeToMemories,
      toggleTaskStatus, deleteTask, deleteReminder, deleteMemory, saveAiResults
  } = useStore();

  // Suscribirse al backend en tiempo real
  useEffect(() => {
      if (!currentUser?.id) return;
      
      const unsubTasks = subscribeToTasks(currentUser.id);
      const unsubRem = subscribeToReminders(currentUser.id);
      const unsubSugg = subscribeToSuggestions(currentUser.id);
      const unsubMem = subscribeToMemories(currentUser.id);

      return () => {
          unsubTasks();
          unsubRem();
          unsubSugg();
          unsubMem();
      };
  }, [currentUser?.id, subscribeToTasks, subscribeToReminders, subscribeToSuggestions, subscribeToMemories]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  const handleOrganize = async () => {
    if (!text.trim() || !currentUser?.id) return;
    
    setIsLoading(true);
    setError('');
    
    try {
        const jsonData = await processBrainDumpAsJSON(text, { tasks, reminders });
        await saveAiResults(currentUser.id, text, jsonData);
        setText('');
    } catch (err) {
        console.error(err);
        setError(err.message || "Error procesando.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-gray-900 dark:text-white flex flex-col transition-colors duration-500">
      
      {/* Top Navigation */}
      <nav className="glass-panel sticky top-0 z-50 sm:mx-4 sm:mt-4 sm:rounded-2xl border-x-0 sm:border-x">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center border border-brand-200 dark:border-brand-800/50">
                <CloudLightning className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block">Brain-Dump</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium glass-card py-1.5 px-3 rounded-full mr-2">
                <User className="w-4 h-4 text-brand-500" />
                <span>{currentUser?.email}</span>
              </div>
              
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-full transition-colors"
                title={t('settings')}
              >
                <Settings className="w-5 h-5" />
              </button>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 flex-shrink-0 transition-colors"
                title={t('signOut')}
              >
                <LogOut className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('signOut')}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Dashboard */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8 overflow-hidden">
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 auto-rows-min gap-6 lg:gap-8">
            
            {/* -------------------- COLUMNA IZQUIERDA (Input + Tasks) -------------------- */}
            <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8 min-w-0">
                
                {/* Input Dump Area */}
                <div className={`glass-panel rounded-3xl transition-all duration-300 overflow-hidden relative z-10 flex-shrink-0
                    ${isFocused && !error ? 'border-brand-400/50 dark:border-brand-400/50 ring-4 ring-brand-500/10' : ''}
                    ${error ? 'border-red-400/50 ring-4 ring-red-500/10' : ''}
                `}>
                    <div className="p-5 sm:p-6 flex flex-col">
                        <textarea
                            ref={textareaRef}
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                if(error) setError('');
                            }}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder={t('placeholder')}
                            className="w-full bg-transparent text-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500/80 resize-none outline-none focus:ring-0 min-h-[120px] leading-relaxed transition-all"
                            disabled={isLoading}
                            spellCheck="false"
                        />
                        
                        {error && (
                            <div className="mt-2 text-sm text-red-500 flex items-center gap-1.5 animate-in slide-in-from-top-2">
                                <AlertCircle className="w-4 h-4"/>
                                {error}
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800/50 flex justify-between items-center">
                            <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline-block">
                                {t('aiSubtitle')}
                            </span>
                            <button
                                onClick={handleOrganize}
                                disabled={isLoading || !text.trim()}
                                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 group ml-auto
                                    ${isLoading || !text.trim()
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500/50 cursor-not-allowed shadow-none' 
                                    : 'bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40'
                                    }
                                `}
                            >
                                {isLoading ? (
                                    <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t('loadingMagic')}
                                    </>
                                ) : (
                                    <>
                                    <Sparkles className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                                    {t('organizeBtn')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Second Brain Row (Memories + Map) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {/* Memories Component Wrapper */}
                    {memories.length > 0 && (
                        <div className="relative group/widget">
                           <MemoryLane memories={memories} onDelete={(id) => deleteMemory(currentUser.id, id)} />
                           <button onClick={() => setExpandedWidget('memory')} className="absolute top-4 right-4 p-2 glass-card rounded-lg opacity-0 group-hover/widget:opacity-100 transition-opacity z-10 hover:scale-105">
                              <Maximize2 className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                           </button>
                        </div>
                    )}

                    {/* Map Component Wrapper */}
                    {locations.length > 0 && (
                        <div className="relative group/widget">
                           <MapWidget locations={locations} />
                           <button onClick={() => setExpandedWidget('map')} className="absolute top-4 right-4 p-2 glass-card rounded-lg opacity-0 group-hover/widget:opacity-100 transition-opacity z-10 hover:scale-105">
                              <Maximize2 className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                           </button>
                        </div>
                    )}
                </div>

                {/* Tasks Board Widget */}
                <div className="glass-panel rounded-3xl p-5 sm:p-6 overflow-hidden flex flex-col h-[500px]">
                     <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex-shrink-0">Mis Tareas Continuas</h2>
                     <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <TaskBoard 
                            tasks={tasks} 
                            onToggle={(id, isCompleted) => toggleTaskStatus(currentUser.id, id, isCompleted)}
                            onDelete={(id) => deleteTask(currentUser.id, id)}
                        />
                     </div>
                </div>

            </div>

            {/* -------------------- COLUMNA DERECHA (Widgets Laterales) -------------------- */}
            <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8">
                
                {/* Stats Widget */}
                 <div className="glass-panel rounded-3xl p-5 sm:p-6 relative group/widget">
                     <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-5">{t('globalProgress')}</h3>
                     <div className="flex items-center gap-5">
                         <div className="relative w-20 h-20 shrink-0">
                             <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                                <path
                                    className="text-gray-100 dark:text-gray-800"
                                    strokeWidth="3"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="text-brand-500 transition-all duration-1000 ease-out"
                                    strokeWidth="3"
                                    strokeDasharray={`${stats.totalCount > 0 ? (stats.completedCount / stats.totalCount) * 100 : 0}, 100`}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                             </svg>
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <span className="text-xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalCount > 0 ? Math.round((stats.completedCount / stats.totalCount) * 100) : 0}%
                                 </span>
                             </div>
                         </div>
                         <div className="flex flex-col gap-1">
                             <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                                {stats.completedCount} <span className="text-sm text-gray-400 font-normal">/ {stats.totalCount}</span>
                             </p>
                             <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{t('completed')}</p>
                         </div>
                     </div>
                     <button onClick={() => setExpandedWidget('stats')} className="absolute top-4 right-4 p-2 glass-card rounded-lg opacity-0 group-hover/widget:opacity-100 transition-opacity z-10 hover:scale-105">
                        <Maximize2 className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                     </button>
                 </div>
                 
                 {/* Calendar Component Wrapper */}
                 <div className="relative group/widget">
                    <CalendarWidget reminders={reminders} />
                    <button onClick={() => setExpandedWidget('calendar')} className="absolute top-4 right-4 p-2 glass-card rounded-lg opacity-0 group-hover/widget:opacity-100 transition-opacity z-10 hover:scale-105">
                        <Maximize2 className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                    </button>
                 </div>

                 {/* Reminders Widget */}
                 <RemindersWidget 
                    reminders={reminders} 
                    onDelete={(id) => deleteReminder(currentUser.id, id)} 
                 />

                 {/* Suggestions Widget */}
                 <SuggestionsPanel suggestions={suggestions} />

            </div>

        </div>
      </main>

      {/* --- EXPANSION MODALS --- */}
      <ExpandModal 
        isOpen={expandedWidget === 'map'} 
        onClose={() => setExpandedWidget(null)} 
        title="Mapa de Ubicaciones Global"
      >
        <div className="w-full h-[70vh] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-900">
             {expandedWidget === 'map' && <MapWidget locations={locations} isExpanded={true} />}
        </div>
      </ExpandModal>

      <ExpandModal 
        isOpen={expandedWidget === 'calendar'} 
        onClose={() => setExpandedWidget(null)} 
        title="Vista de Calendario Completa"
      >
        <div className="w-full max-w-4xl mx-auto h-[70vh] flex flex-col justify-center items-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl">
             {expandedWidget === 'calendar' && <CalendarWidget reminders={reminders} isExpanded={true} />}
        </div>
      </ExpandModal>

      <ExpandModal 
        isOpen={expandedWidget === 'memory'} 
        onClose={() => setExpandedWidget(null)} 
        title="Cerebro a Largo Plazo"
      >
        <div className="w-full h-[70vh] flex flex-col lg:w-3/4 mx-auto bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
             {expandedWidget === 'memory' && <MemoryLane memories={memories} onDelete={(id) => deleteMemory(currentUser.id, id)} />}
        </div>
      </ExpandModal>

      <ExpandModal 
        isOpen={expandedWidget === 'stats'} 
        onClose={() => setExpandedWidget(null)} 
        title="Estadísticas Detalladas"
      >
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl p-8 sm:p-12 h-auto mt-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">Progreso Global de Tareas</h2>
            
            <div className="flex flex-col sm:flex-row items-center justify-around gap-10">
                {/* Big Circular Chart */}
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 shrink-0">
                    <svg className="w-full h-full -rotate-90 transform drop-shadow-lg" viewBox="0 0 36 36">
                    <path
                        className="text-gray-100 dark:text-gray-800"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                        className="text-brand-500 transition-all duration-1000 ease-out"
                        strokeWidth="3"
                        strokeDasharray={`${stats.totalCount > 0 ? (stats.completedCount / stats.totalCount) * 100 : 0}, 100`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
                        {stats.totalCount > 0 ? Math.round((stats.completedCount / stats.totalCount) * 100) : 0}%
                        </span>
                        <span className="text-gray-500 font-medium mt-2">Completado</span>
                    </div>
                </div>

                {/* Details List */}
                <div className="flex flex-col gap-6 flex-1 w-full border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 pt-8 sm:pt-0 sm:pl-10">
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tareas Totales</span>
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">{stats.totalCount}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-brand-500 dark:text-brand-400 uppercase tracking-wider">Hechas</span>
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">{stats.completedCount}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Por Hacer</span>
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">{stats.totalCount - stats.completedCount}</span>
                    </div>
                    {stats.urgentPercentage > 0 && (
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-amber-500 uppercase tracking-wider">Riesgo Urgente</span>
                            <span className="text-3xl font-bold text-amber-600 dark:text-amber-500">{stats.urgentPercentage}%</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </ExpandModal>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

    </div>
  );
}

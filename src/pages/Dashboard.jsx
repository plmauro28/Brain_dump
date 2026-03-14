import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { processBrainDumpAsJSON } from '../lib/gemini';
import { 
  LogOut, CloudLightning, Loader2, Sparkles, AlertCircle,
  Home, ListTodo, Calendar, Lightbulb, MapPin, Settings, BrainCircuit,
  ChevronDown, ChevronUp, Plus, CheckCircle2, Circle, Trash2, X
} from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import WeeklyRecap from '../components/WeeklyRecap';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [expandedSections, setExpandedSections] = useState({ tasks: true, reminders: true });
  
  const { t } = useTranslation();
  
  const textareaRef = useRef(null);

  const { 
      tasks, reminders, suggestions, stats, memories, locations,
      subscribeToTasks, subscribeToReminders, subscribeToSuggestions, subscribeToMemories,
      toggleTaskStatus, deleteTask, deleteReminder, deleteMemory, saveAiResults
  } = useStore();

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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 80)}px`;
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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    const cat = task.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(task);
    return acc;
  }, {});

  const categories = Object.keys(groupedTasks);

  const formatReminderDate = (isoString) => {
    try {
        const date = new Date(isoString);
        const now = new Date();
        const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Mañana';
        if (diffDays < 7) return date.toLocaleDateString('es', { weekday: 'long' });
        return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
    } catch {
        return 'Fecha inválida';
    }
  };

  const tabs = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'tasks', label: 'Tareas', icon: ListTodo },
    { id: 'calendar', label: 'Fechas', icon: Calendar },
    { id: 'ideas', label: 'Ideas', icon: Lightbulb },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
              <CloudLightning className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">BrainDump</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('settings')}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 px-3 sm:px-4 max-w-2xl mx-auto w-full">
        
        {/* Input Section */}
        <div className="mt-4 mb-6">
          <div className={`relative transition-all duration-300 rounded-2xl overflow-hidden
              ${isFocused ? 'ring-2 ring-brand-500/30' : ''}
              ${error ? 'ring-2 ring-red-500/30' : ''}
          `}>
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => {
                    setText(e.target.value);
                    if(error) setError('');
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="¿Qué tienes en mente? Escribe todo lo que necesites hacer, recordar o planificar..."
                className="w-full bg-transparent text-base text-gray-800 dark:text-gray-200 placeholder-gray-400 resize-none outline-none p-4 min-h-[100px]"
                disabled={isLoading}
              />
              
              {error && (
                  <div className="px-4 pb-2 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3"/> {error}
                  </div>
              )}

              <div className="flex items-center justify-between px-4 pb-3">
                <span className="text-xs text-gray-400 hidden sm:block">La IA organizará todo por ti</span>
                <button
                  onClick={handleOrganize}
                  disabled={isLoading || !text.trim()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
                      ${isLoading || !text.trim()
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98]'
                      }
                  `}
                >
                  {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                      <Sparkles className="w-4 h-4" />
                  )}
                  <span>Organizar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500"
                style={{ width: `${stats.totalCount > 0 ? (stats.completedCount / stats.totalCount) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
              {stats.completedCount}/{stats.totalCount} tareas
            </span>
          </div>
        </div>

        {/* Weekly Recap Mini */}
        <div className="mb-6 p-4 bg-gradient-to-r from-brand-50 to-emerald-50 dark:from-brand-900/30 dark:to-emerald-900/30 rounded-2xl border border-brand-200/50 dark:border-brand-700/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wide">Esta semana</span>
            <span className="text-lg font-bold text-brand-600 dark:text-brand-400">{stats.completionRate || 0}%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {stats.completedThisWeek > 0 
              ? `Has completado ${stats.completedThisWeek} de ${stats.totalThisWeek} tareas esta semana`
              : stats.totalThisWeek > 0 
                ? '¡Vamos! Completa al menos una tarea hoy'
                : 'Escribe tus tareas arriba para empezar'
            }
          </p>
        </div>

        {/* Content by Tab */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Upcoming Reminders */}
            {reminders.length > 0 && (
              <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                <button 
                  onClick={() => toggleSection('reminders')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Próximos eventos</span>
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">{reminders.length}</span>
                  </div>
                  {expandedSections.reminders ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                
                {expandedSections.reminders && (
                  <div className="px-4 pb-4 space-y-2">
                    {reminders.slice(0, 5).map(reminder => (
                      <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{reminder.title}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatReminderDate(reminder.date)}</span>
                      </div>
                    ))}
                    {reminders.length > 5 && (
                      <button onClick={() => setActiveTab('calendar')} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                        Ver todos ({reminders.length})
                      </button>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Consejos</span>
                </div>
                <div className="space-y-2">
                  {suggestions.slice(0, 3).map(sugg => (
                    <p key={sugg.id} className="text-sm text-gray-600 dark:text-gray-400 italic">"{sugg.text}"</p>
                  ))}
                </div>
              </section>
            )}

            {/* Quick Tasks */}
            {tasks.length > 0 && (
              <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                <button 
                  onClick={() => toggleSection('tasks')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
                      <ListTodo className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Tareas</span>
                    <span className="text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full">{tasks.length}</span>
                  </div>
                  {expandedSections.tasks ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                
                {expandedSections.tasks && (
                  <div className="px-4 pb-4 space-y-2">
                    {tasks.slice(0, 6).map(task => (
                      <div 
                        key={task.id} 
                        onClick={() => toggleTaskStatus(currentUser.id, task.id, task.isCompleted)}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-brand-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                    {tasks.length > 6 && (
                      <button onClick={() => setActiveTab('tasks')} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                        Ver todas ({tasks.length})
                      </button>
                    )}
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Todas las tareas</h2>
            
            {categories.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay tareas todavía</p>
                <p className="text-sm mt-1">Escribe arriba para crear una</p>
              </div>
            ) : (
              categories.map(category => (
                <div key={category} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200/50 dark:border-gray-700/50">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{category}</span>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {groupedTasks[category].map(task => (
                      <div 
                        key={task.id} 
                        className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <button 
                          onClick={() => toggleTaskStatus(currentUser.id, task.id, task.isCompleted)}
                          className="flex-shrink-0"
                        >
                          {task.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-brand-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                          )}
                        </button>
                        <span className={`flex-1 ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                          {task.title}
                        </span>
                        <button 
                          onClick={() => deleteTask(currentUser.id, task.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Fechas importantes</h2>
            
            {reminders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay eventos programados</p>
                <p className="text-sm mt-1">La IA detectará fechas de tu texto</p>
              </div>
            ) : (
              reminders.map(reminder => (
                <div 
                  key={reminder.id}
                  className="flex items-center gap-4 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-red-600 dark:text-red-400">
                      {new Date(reminder.date).getDate()}
                    </span>
                    <span className="text-[10px] text-red-500 uppercase">
                      {new Date(reminder.date).toLocaleDateString('es', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-gray-200">{reminder.title}</p>
                    <p className="text-xs text-gray-500">{formatReminderDate(reminder.date)}</p>
                  </div>
                  <button 
                    onClick={() => deleteReminder(currentUser.id, reminder.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Ideas Tab */}
        {activeTab === 'ideas' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Ideas y sugerencias</h2>
            
            {suggestions.length === 0 && memories.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay sugerencias todavía</p>
                <p className="text-sm mt-1">La IA te dará consejos basados en tus tareas</p>
              </div>
            ) : (
              <>
                {suggestions.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Consejos de IA</h3>
                    {suggestions.map(sugg => (
                      <div 
                        key={sugg.id}
                        className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200/50 dark:border-amber-700/30"
                      >
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-800 dark:text-amber-200">{sugg.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {memories.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Notas guardadas</h3>
                    {memories.map(mem => (
                      <div 
                        key={mem.id}
                        className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <BrainCircuit className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-700 dark:text-gray-300">{mem.text}</p>
                          </div>
                          <button 
                            onClick={() => deleteMemory(currentUser.id, mem.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Settings Placeholder */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Configuración</h2>
            
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
              <p className="text-sm text-gray-500 mb-2">Cuenta</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{currentUser?.email}</p>
            </div>

            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
              <p className="text-sm text-gray-500">Cerrar sesión</p>
              <button 
                onClick={handleLogout}
                className="mt-2 text-red-600 dark:text-red-400 font-medium text-sm hover:underline"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 safe-area-pb z-50">
        <div className="flex items-center justify-around px-2 py-2 max-w-2xl mx-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
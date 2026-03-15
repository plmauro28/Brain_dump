import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { processBrainDumpAsJSON } from '../lib/gemini';
import { 
  LogOut, CloudLightning, Loader2, Sparkles, AlertCircle,
  Home, ListTodo, Calendar, Lightbulb, Settings, BrainCircuit,
  CheckCircle2, Circle, Trash2, X, TrendingUp, MapPin, Archive, Plus, Bell
} from 'lucide-react';
import { useTranslation } from '../lib/i18n';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  
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
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 50)}px`;
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
    if (!text.trim() || !currentUser?.id) {
      console.log("No text or no user");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
        console.log("Processing brain dump...");
        const jsonData = await processBrainDumpAsJSON(text, { tasks, reminders });
        console.log("AI Response:", jsonData);
        
        if (!jsonData) {
          throw new Error("La IA no devolvió datos");
        }
        
        console.log("Saving to database...");
        await saveAiResults(currentUser.id, text, jsonData);
        console.log("Saved successfully!");
        setText('');
    } catch (err) {
        console.error("Error organizing:", err);
        setError(err.message || "Error procesando. Revisa la consola.");
    } finally {
        setIsLoading(false);
    }
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    const cat = task.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(task);
    return acc;
  }, {});

  const categories = Object.keys(groupedTasks);
  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

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

  const getCurrentMonth = () => {
    return new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' });
  };

  const getMonthDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push({ day: null, date: null });
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({ 
        day: i, 
        date: date.toISOString(),
        isToday: date.toDateString() === today.toDateString(),
        hasReminder: reminders.some(r => new Date(r.date).toDateString() === date.toDateString())
      });
    }
    
    return days;
  };

  const monthDays = getMonthDays();
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const tabs = [
    { id: 'tasks', label: 'Tareas', icon: ListTodo },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'notes', label: 'Notas', icon: Archive },
    { id: 'settings', label: 'Ajustes', icon: Settings },
    { id: 'stats', label: 'Stats', icon: TrendingUp },
  ];

  // Calculate map center
  const mapCenter = locations.length > 0 
    ? { lat: locations[locations.length - 1].lat, lng: locations[locations.length - 1].lng }
    : { lat: 40.4168, lng: -3.7038 }; // Madrid default

  return (
    <div className="min-h-screen flex flex-col text-gray-900 dark:text-gray-100">
      {/* Header - Invisible */}
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
            <CloudLightning className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-base">BrainDump</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-800/50 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-24 max-w-lg mx-auto w-full overflow-y-auto">
        
        {/* Input Section - Liquid Glass */}
        <div className="sticky top-[52px] z-40 pt-3 pb-4 -mx-4 px-4 mb-4">
          <div className="glass-panel rounded-2xl p-1">
            <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
                setText(e.target.value);
                if(error) setError('');
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="¿Qué tienes en mente? Escríbelo todo..."
            className={`w-full text-sm resize-none outline-none p-2.5 min-h-[50px] bg-transparent transition-all
                ${isFocused ? 'ring-2 ring-brand-500/50' : ''}
                ${error ? 'ring-2 ring-red-500/50' : ''}
            `}
            disabled={isLoading}
          />
          
          {error && (
              <div className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3"/> {error}
              </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${stats.totalCount > 0 ? (stats.completedCount / stats.totalCount) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{stats.completedCount}/{stats.totalCount}</span>
            </div>
            
            <button
              onClick={handleOrganize}
              disabled={isLoading || !text.trim()}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all shadow-lg
                  ${isLoading || !text.trim()
                  ? 'bg-gray-200/50 dark:bg-gray-700/50 text-gray-400 cursor-not-allowed' 
                  : 'bg-brand-500/90 text-white hover:bg-brand-600/90 shadow-brand-500/30'
                  }
              `}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Organizar'}
            </button>
          </div>
        </div>
        </div>

        {/* Tabs Content */}
        <div className="space-y-4">
          {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="py-2">
              <h2 className="text-xs font-medium text-gray-500 uppercase mb-2">Por hacer ({pendingTasks.length})</h2>
              {pendingTasks.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">¡No hay tareas pendientes!</p>
              ) : (
                pendingTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-center gap-2 py-2 group"
                  >
                    <button 
                      onClick={() => toggleTaskStatus(currentUser.id, task.id, task.isCompleted)}
                      className="flex-shrink-0"
                    >
                      <Circle className="w-5 h-5 text-gray-300 hover:text-brand-500" />
                    </button>
                    <span className="flex-1 text-sm">{task.title}</span>
                    <button 
                      onClick={() => deleteTask(currentUser.id, task.id)}
                      className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {completedTasks.length > 0 && (
              <div className="py-2">
                <h2 className="text-xs font-medium text-gray-500 uppercase mb-2">Completadas ({completedTasks.length})</h2>
                {completedTasks.slice(0, 5).map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-center gap-2 py-2 opacity-50 group"
                  >
                    <button 
                      onClick={() => toggleTaskStatus(currentUser.id, task.id, task.isCompleted)}
                      className="flex-shrink-0"
                    >
                      <CheckCircle2 className="w-5 h-5 text-brand-500" />
                    </button>
                    <span className="flex-1 text-sm line-through">{task.title}</span>
                    <button 
                      onClick={() => deleteTask(currentUser.id, task.id)}
                      className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== CALENDAR TAB ===================== */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <div className="py-2">
              <h2 className="text-sm font-medium mb-3 capitalize">{getCurrentMonth()}</h2>
              
              <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map(day => (
                  <div key={day} className="text-[10px] font-medium text-gray-400 py-1">{day}</div>
                ))}
                
                {monthDays.map((d, i) => (
                  <div 
                    key={i} 
                    className={`text-xs py-1.5 rounded flex items-center justify-center
                      ${d.isToday ? 'bg-brand-500 text-white font-bold' : ''}
                      ${d.hasReminder && !d.isToday ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : ''}
                    `}
                  >
                    {d.day}
                  </div>
                ))}
              </div>
            </div>

            <div className="py-2">
              <h2 className="text-xs font-medium text-gray-500 uppercase mb-2">Próximos eventos</h2>
              {reminders.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">No hay eventos programados</p>
              ) : (
                reminders.map(reminder => (
                  <div 
                    key={reminder.id}
                    className="flex items-center gap-3 py-2 group"
                  >
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-red-600 dark:text-red-400">
                        {new Date(reminder.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{reminder.title}</p>
                      <p className="text-xs text-gray-500">{formatReminderDate(reminder.date)}</p>
                    </div>
                    <button 
                      onClick={() => deleteReminder(currentUser.id, reminder.id)}
                      className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ===================== NOTES TAB ===================== */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="py-2">
              <h2 className="text-xs font-medium text-gray-500 uppercase mb-2">Notas importantes</h2>
              {memories.length === 0 ? (
                <div className="py-4 text-center">
                  <BrainCircuit className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">No hay notas guardadas</p>
                </div>
              ) : (
                memories.map(mem => (
                  <div 
                    key={mem.id}
                    className="flex items-start gap-2 py-2 group"
                  >
                    <BrainCircuit className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-1" />
                    <p className="flex-1 text-sm">{mem.text}</p>
                    <button 
                      onClick={() => deleteMemory(currentUser.id, mem.id)}
                      className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {suggestions.length > 0 && (
              <div className="py-2">
                <h2 className="text-xs font-medium text-gray-500 uppercase mb-2">Sugerencias</h2>
                {suggestions.map(sugg => (
                  <div key={sugg.id} className="py-2">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">{sugg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== SETTINGS TAB ===================== */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="py-2">
              <h2 className="text-xs font-medium text-gray-500 uppercase mb-2">Ajustes</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-brand-500" />
                    <div>
                      <p className="font-medium">Tema</p>
                      <p className="text-sm text-gray-500">Claro/Oscuro según sistema</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-brand-500">
                        <div className="absolute inset-0.5 h-5 w-5 bg-white rounded-full shadow peer-checked:translate-x-5 peer-checked:bg-brand-500 transition-transform"></div>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-brand-500" />
                    <div>
                      <p className="font-medium">Notificaciones</p>
                      <p className="text-sm text-gray-500">Recordatorios y sugerencias</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-brand-500">
                        <div className="absolute inset-0.5 h-5 w-5 bg-white rounded-full shadow peer-checked:translate-x-5 peer-checked:bg-brand-500 transition-transform"></div>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium">Eliminar datos</p>
                      <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
                        // TODO: Implement actual data deletion
                        alert('Funcionalidad de eliminación pendiente de implementar');
                      }
                    }}
                    className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors"
                  >
                    Eliminar todo
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                    <div>
                      <p className="font-medium">Versión</p>
                      <p className="text-sm text-gray-500">1.0.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== STATS TAB ===================== */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="py-4 text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200 dark:text-gray-700"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-brand-500"
                    strokeWidth="3"
                    strokeDasharray={`${stats.totalCount > 0 ? (stats.completedCount / stats.totalCount) * 100 : 0}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {stats.totalCount > 0 ? Math.round((stats.completedCount / stats.totalCount) * 100) : 0}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Progreso total</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-brand-500">{tasks.length}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="glass-card rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-500">{stats.completedCount}</p>
                <p className="text-xs text-gray-500">Hechas</p>
              </div>
              <div className="glass-card rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-amber-500">{pendingTasks.length}</p>
                <p className="text-xs text-gray-500">Pendientes</p>
              </div>
              <div className="glass-card rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-500">{reminders.length}</p>
                <p className="text-xs text-gray-500">Eventos</p>
              </div>
            </div>

            <div className="py-2">
              <div className="glass-card rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Esta semana</span>
                  <span className="text-sm font-medium">{stats.completedThisWeek} / {stats.totalThisWeek}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-500 rounded-full transition-all"
                    style={{ width: `${stats.completionRate || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation - Liquid Glass */}
      <nav className="fixed bottom-0 left-0 right-0 px-1 py-1 flex items-center justify-around glass-panel border-t-0 z-50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === tab.id 
                ? 'text-brand-600 dark:text-brand-400 bg-brand-500/20' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[9px]">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { processBrainDumpAsJSON } from '../lib/gemini';
import { 
  LogOut, CloudLightning, Loader2, Sparkles, AlertCircle,
  Home, ListTodo, Calendar, Lightbulb, Settings, BrainCircuit,
  CheckCircle2, Circle, Trash2, X, TrendingUp, MapPin, Archive, Plus
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
    { id: 'map', label: 'Mapa', icon: MapPin },
    { id: 'stats', label: 'Stats', icon: TrendingUp },
  ];

  // Calculate map center
  const mapCenter = locations.length > 0 
    ? { lat: locations[locations.length - 1].lat, lng: locations[locations.length - 1].lng }
    : { lat: 40.4168, lng: -3.7038 }; // Madrid default

  return (
    <div className="min-h-screen flex flex-col text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <CloudLightning className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-base">BrainDump</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-24 max-w-lg mx-auto w-full overflow-y-auto">
        
        {/* Input Section */}
        <div className="sticky top-[57px] z-40 pt-2 pb-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg -mx-4 px-4">
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
            className={`w-full text-sm resize-none outline-none p-2.5 min-h-[50px] rounded-lg transition-all
                ${isFocused ? 'ring-2 ring-brand-500/50' : ''}
                ${error ? 'ring-2 ring-red-500/50' : ''}
                bg-gray-100 dark:bg-gray-800
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
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all
                  ${isLoading || !text.trim()
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-brand-500 text-white'
                  }
              `}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Organizar'}
            </button>
          </div>
        </div>

        {/* ===================== TAREA TAB ===================== */}
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

        {/* ===================== MAP TAB ===================== */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="py-2">
              <h2 className="text-xs font-medium text-gray-500 uppercase mb-2">Ubicaciones ({locations.length})</h2>
              
              {locations.length === 0 ? (
                <div className="py-8 text-center">
                  <MapPin className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-400 mb-1">No hay ubicaciones</p>
                  <p className="text-xs text-gray-500">Escribe nombres de lugares en el cuadro de arriba</p>
                  <p className="text-xs text-gray-500 mt-1">Ej: "Voy a Madrid", "Tengo reunión en Barcelona"</p>
                </div>
              ) : (
                <>
                  {/* Mini Map */}
                  <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <a 
                        href={`https://www.openstreetmap.org/?mlat=${mapCenter.lat}&mlon=${mapCenter.lng}#map=5/${mapCenter.lat}/${mapCenter.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-full flex items-center justify-center bg-cover bg-center"
                        style={{
                          backgroundImage: `url(https://tile.openstreetmap.org/5/${Math.floor((mapCenter.lng + 180) / 360 * Math.pow(2, 5))}/${Math.floor((90 - mapCenter.lat) / 180 * Math.pow(2, 5))}/5.png)`,
                          backgroundSize: 'cover'
                        }}
                      >
                        <div className="bg-white/90 dark:bg-gray-900/90 px-3 py-1.5 rounded-full text-xs font-medium">
                          Abrir en OpenStreetMap ↗
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Location List */}
                  <div className="space-y-2">
                    {locations.map((loc, index) => (
                      <div 
                        key={loc.id || index}
                        className="flex items-center gap-3 py-2 group"
                      >
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{loc.name}</p>
                          <p className="text-xs text-gray-500">
                            {loc.lat?.toFixed(4)}, {loc.lng?.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
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
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-brand-500">{tasks.length}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-500">{stats.completedCount}</p>
                <p className="text-xs text-gray-500">Hechas</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-amber-500">{pendingTasks.length}</p>
                <p className="text-xs text-gray-500">Pendientes</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-500">{reminders.length}</p>
                <p className="text-xs text-gray-500">Eventos</p>
              </div>
            </div>

            <div className="py-2">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
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
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 px-1 py-1 flex items-center justify-around border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg z-50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${
              activeTab === tab.id 
                ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20' 
                : 'text-gray-400'
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

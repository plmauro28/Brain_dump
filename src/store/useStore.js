import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export const useStore = create(persist((set, get) => ({
  preferences: {
    language: 'es',
    theme: 'dark',
    accentColor: '#10b981' // Emerald as default hex
  },
  setPreferences: (newPrefs) => set(state => ({
    preferences: { ...state.preferences, ...newPrefs }
  })),
  tasks: [],
  reminders: [],
  suggestions: [],
  memories: [],
  locations: JSON.parse(localStorage.getItem('brain_dump_locations') || '[]'),
  stats: {
    urgentPercentage: 0,
    completedCount: 0,
    totalCount: 0
  },
  loading: false,

  // Escuchar tareas en tiempo real
  subscribeToTasks: (userId) => {
    if (!userId) return () => {};
    
    set({ loading: true });
    
    const fetchTasks = async () => {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId)
            .order('createdAt', { ascending: false });
            
        if (!error && data) {
            let completed = 0;
            let urgent = 0;
            
            data.forEach(task => {
                if (task.isCompleted) completed++;
                if (task.category?.toLowerCase() === 'urgente') urgent++;
            });
            
            set({ 
                tasks: data,
                stats: {
                    completedCount: completed,
                    totalCount: data.length,
                    urgentPercentage: data.length > 0 ? Math.round((urgent / data.length) * 100) : 0
                },
                loading: false
            });
        }
    };
    
    fetchTasks();

    const channel = supabase.channel('tasks_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` }, fetchTasks)
        .subscribe();
        
    return () => { supabase.removeChannel(channel); };
  },

  // Escuchar recordatorios en tiempo real
  subscribeToReminders: (userId) => {
      if (!userId) return () => {};
      const fetchReminders = async () => {
          const { data } = await supabase.from('reminders').select('*').eq('user_id', userId).order('date', { ascending: true });
          if (data) set({ reminders: data });
      };
      
      fetchReminders();
      const channel = supabase.channel('reminders_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'reminders', filter: `user_id=eq.${userId}` }, fetchReminders)
          .subscribe();
      return () => { supabase.removeChannel(channel); };
  },

  // Escuchar sugerencias 
  subscribeToSuggestions: (userId) => {
    if (!userId) return () => {};
    const fetchSugg = async () => {
        const { data } = await supabase.from('suggestions').select('*').eq('user_id', userId).order('createdAt', { ascending: false });
        if (data) set({ suggestions: data });
    };
    fetchSugg();
    
    const channel = supabase.channel('suggestions_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'suggestions', filter: `user_id=eq.${userId}` }, fetchSugg)
          .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  // Escuchar memorias en tiempo real
  subscribeToMemories: (userId) => {
    if (!userId) return () => {};
    const fetchMemories = async () => {
        const { data } = await supabase.from('memories').select('*').eq('user_id', userId).order('createdAt', { ascending: false });
        if (data) set({ memories: data });
    };
    fetchMemories();
    
    const channel = supabase.channel('memories_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'memories', filter: `user_id=eq.${userId}` }, fetchMemories)
          .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  deleteMemory: async (userId, memoryId) => {
      if (!userId || !memoryId) return;
      await supabase.from('memories').delete().eq('id', memoryId);
      set(state => ({ memories: state.memories.filter(m => m.id !== memoryId) }));
  },

  toggleTaskStatus: async (userId, taskId, isCompleted) => {
      if (!userId || !taskId) return;
      await supabase.from('tasks').update({ isCompleted: !isCompleted }).eq('id', taskId);
      set(state => ({ tasks: state.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !isCompleted } : t) }));
  },

  deleteTask: async (userId, taskId) => {
      if (!userId || !taskId) return;
      await supabase.from('tasks').delete().eq('id', taskId);
      set(state => ({ tasks: state.tasks.filter(t => t.id !== taskId) }));
  },
  
  deleteReminder: async (userId, reminderId) => {
      if (!userId || !reminderId) return;
      await supabase.from('reminders').delete().eq('id', reminderId);
      set(state => ({ reminders: state.reminders.filter(r => r.id !== reminderId) }));
  },

  // Inyectar resultados de la IA a Supabase
  saveAiResults: async (userId, rawText, parsedData) => {
    if (!userId) return;

    try {
        // 1. Guardar el dump (historial conversacional)
        await supabase.from('dumps').insert({ user_id: userId, text: rawText });

        // Procesar Tareas
        if (parsedData.tasks && Array.isArray(parsedData.tasks)) {
            for (const task of parsedData.tasks) {
                if (task.id) {
                    // Update or Delete existing
                    if (task._delete) {
                        await supabase.from('tasks').delete().eq('id', task.id).eq('user_id', userId);
                    } else {
                        await supabase.from('tasks').update({
                            title: task.title,
                            category: task.category
                        }).eq('id', task.id).eq('user_id', userId);
                    }
                } else if (!task._delete && task.title) {
                    // Insert new
                    await supabase.from('tasks').insert({
                        user_id: userId,
                        title: task.title,
                        category: task.category || 'General',
                        isCompleted: false
                    });
                }
            }
        }

        // Procesar Recordatorios
        if (parsedData.reminders && Array.isArray(parsedData.reminders)) {
            for (const rem of parsedData.reminders) {
                if (rem.id) {
                    // Update or delete existing
                    if (rem._delete) {
                        await supabase.from('reminders').delete().eq('id', rem.id).eq('user_id', userId);
                    } else {
                        await supabase.from('reminders').update({
                            title: rem.title,
                            date: rem.date
                        }).eq('id', rem.id).eq('user_id', userId);
                    }
                } else if (!rem._delete && rem.title && rem.date) {
                    // Insert new
                    await supabase.from('reminders').insert({
                        user_id: userId,
                        title: rem.title,
                        date: rem.date
                    });
                }
            }
        }

        // 4. Sugerencias (siempre se reescriben completas)
        if (parsedData.suggestions && Array.isArray(parsedData.suggestions)) {
            await supabase.from('suggestions').delete().eq('user_id', userId);
            
            if (parsedData.suggestions.length > 0) {
                const suggsToInsert = parsedData.suggestions.filter(s => typeof s === 'string').map(sugg => ({
                    user_id: userId,
                    text: sugg
                }));
                if (suggsToInsert.length > 0) {
                    await supabase.from('suggestions').insert(suggsToInsert);
                }
            }
        }

        // 5. Memorias
        if (parsedData.memories && Array.isArray(parsedData.memories)) {
            for (const mem of parsedData.memories) {
                if (mem.id) {
                    if (mem._delete) {
                        await supabase.from('memories').delete().eq('id', mem.id).eq('user_id', userId);
                    } else {
                        await supabase.from('memories').update({ text: mem.text }).eq('id', mem.id).eq('user_id', userId);
                    }
                } else if (!mem._delete && mem.text) {
                    await supabase.from('memories').insert({ user_id: userId, text: mem.text });
                }
            }
        }

        // 6. Localizaciones
        if (parsedData.locations && Array.isArray(parsedData.locations)) {
            // Unimos previas y nuevas, evitando duplicados exactos
            const prevLocs = get().locations;
            let combined = [...prevLocs];
            
            parsedData.locations.forEach(newLoc => {
                 if (!combined.some(loc => loc.name === newLoc.name)) {
                     combined.push({
                         id: crypto.randomUUID(),
                         name: newLoc.name,
                         lat: newLoc.lat || (Math.random() * 180 - 90), // Fake coordinates fallback
                         lng: newLoc.lng || (Math.random() * 360 - 180)
                     });
                 }
            });
            
            // Keep specific length
            if (combined.length > 10) combined = combined.slice(combined.length - 10);
            
            set({ locations: combined });
            localStorage.setItem('brain_dump_locations', JSON.stringify(combined));
        }

        
    } catch (error) {
        console.error("Error saving AI results to Supabase:", error);
        throw error;
    }
  }

}), {
  name: 'brain-dump-preferences',
  partialize: (state) => ({ preferences: state.preferences })
}));

import { useStore } from '../store/useStore';

export const translations = {
  en: {
    appTitle: "Brain Dump",
    placeholder: "Write what's on your mind... (e.g. Call mom tomorrow at 5pm about the flight to Paris)",
    organizeBtn: "Organize my Chaos",
    aiSubtitle: "AI will extract tasks, memories, locations, and dates automatically.",
    loadingMagic: "Loading magic...",
    
    // Categories
    urgent: "Urgent",
    work: "Work",
    personal: "Personal",
    health: "Health",
    general: "General",
    
    // Widgets
    globalProgress: "Global Progress",
    completed: "Completed",
    totalTasks: "Total Tasks",
    done: "Done",
    todo: "To Do",
    urgentRisk: "Urgent Risk",
    
    myCalendar: "My Calendar",
    fullCalendarView: "Full Calendar View",
    
    longTermBrain: "Long Term Brain",
    memories: "Memories",
    
    locationsMap: "Locations Map",
    mentionedLocations: "Mentioned Locations",
    globalLocationsMap: "Global Locations Map",
    
    // Auth & Nav
    settings: "Settings",
    signOut: "Sign Out",
    welcomeBack: "Welcome back",
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?"
  },
  es: {
    appTitle: "Brain Dump",
    placeholder: "Escribe lo que tienes en la cabeza... (ej. Llamar a mamá mañana a las 5pm sobre el vuelo a París)",
    organizeBtn: "Organizar mi Caos",
    aiSubtitle: "La IA extraerá tareas, memorias, ubicaciones y fechas automáticamente.",
    loadingMagic: "Cargando magia...",
    
    // Categories
    urgent: "Urgente",
    work: "Trabajo",
    personal: "Personal",
    health: "Salud",
    general: "General",
    
    // Widgets
    globalProgress: "Progreso Global",
    completed: "Completadas",
    totalTasks: "Tareas Totales",
    done: "Hechas",
    todo: "Por Hacer",
    urgentRisk: "Riesgo Urgente",
    
    myCalendar: "Mi Calendario",
    fullCalendarView: "Vista de Calendario Completa",
    
    longTermBrain: "Cerebro a Largo Plazo",
    memories: "Memorias",
    
    locationsMap: "Mapa de Ubicaciones",
    mentionedLocations: "Ubicaciones Mencionadas",
    globalLocationsMap: "Mapa de Ubicaciones Global",
    
    // Auth & Nav
    settings: "Ajustes",
    signOut: "Cerrar Sesión",
    welcomeBack: "Bienvenido de nuevo",
    signIn: "Iniciar Sesión",
    signUp: "Registrarse",
    email: "Correo",
    password: "Contraseña",
    dontHaveAccount: "¿No tienes cuenta?",
    alreadyHaveAccount: "¿Ya tienes cuenta?"
  },
  fr: {
    appTitle: "Brain Dump",
    placeholder: "Écrivez ce que vous avez en tête... (ex. Appeler maman demain à 17h pour le vol vers Paris)",
    organizeBtn: "Organiser mon Chaos",
    aiSubtitle: "L'IA extraira automatiquement les tâches, les souvenirs, les lieux et les dates.",
    loadingMagic: "Chargement de la magie...",
    
    // Categories
    urgent: "Urgent",
    work: "Travail",
    personal: "Personnel",
    health: "Santé",
    general: "Général",
    
    // Widgets
    globalProgress: "Progrès Global",
    completed: "Terminées",
    totalTasks: "Tâches Totales",
    done: "Fait",
    todo: "À Faire",
    urgentRisk: "Risque Urgent",
    
    myCalendar: "Mon Calendrier",
    fullCalendarView: "Vue Complète du Calendrier",
    
    longTermBrain: "Cerveau à Long Terme",
    memories: "Souvenirs",
    
    locationsMap: "Carte des Lieux",
    mentionedLocations: "Lieux Mentionnés",
    globalLocationsMap: "Carte Globale des Lieux",
    
    // Auth & Nav
    settings: "Paramètres",
    signOut: "Déconnexion",
    welcomeBack: "Bon retour",
    signIn: "Se connecter",
    signUp: "S'inscrire",
    email: "Email",
    password: "Mot de passe",
    dontHaveAccount: "Vous n'avez pas de compte ?",
    alreadyHaveAccount: "Vous avez déjà un compte ?"
  }
};

export function useTranslation() {
  const preferences = useStore(state => state.preferences);
  const lang = preferences?.language || 'es';
  
  const t = (key) => {
    return translations[lang]?.[key] || translations['es']?.[key] || key;
  };
  
  return { t, lang };
}

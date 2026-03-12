import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  
  if (currentUser === undefined) {
      // Si AuthContext todavía está cargando el estado inicial
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500"/>
          </div>
      )
  }

  return currentUser ? children : <Navigate to="/login" />;
}

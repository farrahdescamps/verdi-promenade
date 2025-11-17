import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { clearStoredSessionInfo } from '../services/sessionService';

export const DebugButton: React.FC = () => {
  const navigate = useNavigate();
  const { refreshSession } = useSession();

  const handleReset = () => {
    localStorage.clear();
    sessionStorage.clear(); // Supprimer aussi sessionStorage pour les données de podcast
    
    clearStoredSessionInfo();
    
    navigate('/');
    
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="relative h-full">
      <Outlet />
    </div>
  );
};
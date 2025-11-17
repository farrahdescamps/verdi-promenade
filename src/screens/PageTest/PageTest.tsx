import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearStoredSessionInfo } from '../../services/sessionService';

export const PageTest: React.FC = () => {
  const navigate = useNavigate();
  const hasExecuted = useRef(false);

  useEffect(() => {
    // Éviter les exécutions multiples
    if (hasExecuted.current) {
      return;
    }
    
    hasExecuted.current = true;

    const resetSessionAndRedirect = async () => {
      try {
        // Réinitialiser les données de session en local

        // Nettoyer le localStorage
        clearStoredSessionInfo();
        
        // Nettoyer d'autres données potentielles en localStorage
        const keysToRemove = [
          'session_info',
          'user_preferences',
          'theme_selection',
          'matched_activities',
          'conversation_data',
          'language_preference',
          'onboarding_completed'
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });

        // Ne pas créer de session ici - laisser le flux normal s'en charger après redirection
        
        // Rediriger vers la page d'accueil après un court délai
        setTimeout(() => {

          navigate('/', { replace: true });
        }, 1500);
        
      } catch (error) {

        // Rediriger quand même vers l'accueil en cas d'erreur
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      }
    };

    resetSessionAndRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
        <div className="text-blue-600 text-xl font-semibold mb-3">Réinitialisation en cours...</div>
        <div className="text-gray-600 text-sm mb-2">Vos données de session sont en cours de réinitialisation.</div>
        <div className="text-gray-500 text-xs">Vous allez être redirigé vers la page d'accueil dans quelques secondes.</div>
        
        <div className="mt-6 text-xs text-gray-400">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

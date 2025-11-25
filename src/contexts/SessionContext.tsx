import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  SessionData, 
  MatchedActivity, 
  ensureActiveSession, 
  updateSessionLikedThemes, 
  updateSessionMatchedActivities,
  getStoredSessionInfo,
  isSessionInfoValid,
  clearStoredSessionInfo,
  storeSessionInfo,
  getSession
} from '../services/sessionService';
import { useLanguage } from './LanguageContext';
import { DEFAULT_CITY_ID } from '../constants/cities';
import { Theme, fetchThemes } from '../services/themesService';

interface SessionContextType {
  sessionData: SessionData | null;
  sessionId: string | null;
  isLoadingSession: boolean;
  sessionError: string | null;
  themes: Theme[];
  isLoadingThemes: boolean;
  refreshSession: () => Promise<void>;
  loadThemes: () => Promise<void>;
  updateLikedThemes: (themeIds: string[]) => Promise<void>;
  markThemeSelectionAsCompleted: () => void;
  updateMatchedActivities: (activities: MatchedActivity[]) => Promise<void>;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);
  
  const { currentLanguage, isLanguageSelected } = useLanguage();

  const initializeSession = async () => {
    try {
      setIsLoadingSession(true);
      setSessionError(null);

      // D'abord, vérifier s'il y a une session valide en localStorage
      const storedSessionInfo = getStoredSessionInfo();

      if (storedSessionInfo && isSessionInfoValid(storedSessionInfo)) {

        try {
          const existingSession = await getSession(storedSessionInfo.session_id);

          setSessionData(existingSession);
          return; // Sortir ici, pas besoin de créer une nouvelle session
        } catch (error) {

          clearStoredSessionInfo();
        }
      } else {

        if (storedSessionInfo) {

          clearStoredSessionInfo();
        }
      }

      const session = await ensureActiveSession(currentLanguage, DEFAULT_CITY_ID);
      
      // Log de la session pour debug

      setSessionData(session);
      
      // Stocker la nouvelle session
      storeSessionInfo(session);
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : 'Failed to initialize session');
    } finally {
      setIsLoadingSession(false);
    }
  };

  const refreshSession = useCallback(async () => {
    try {
      setIsLoadingSession(true);
      setSessionError(null);

      // Forcer la création d'une nouvelle session en nettoyant d'abord
      clearStoredSessionInfo();
      setSessionData(null);

      const session = await ensureActiveSession(currentLanguage, DEFAULT_CITY_ID);
      

      setSessionData(session);
      storeSessionInfo(session);
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : 'Failed to refresh session');
    } finally {
      setIsLoadingSession(false);
    }
  }, [currentLanguage]);

  const updateLikedThemes = async (themeIds: string[]) => {
    if (!sessionData) {

      return;
    }


    // Mettre à jour l'état local uniquement
    const updatedSessionData = {
      ...sessionData,
      liked_themes: themeIds
    };
    
    setSessionData(updatedSessionData);
    
    // Mettre à jour le localStorage aussi
    storeSessionInfo(updatedSessionData);
    
  };

  const markThemeSelectionAsCompleted = () => {
    if (!sessionData) {
      return;
    }

    const updatedSessionData = {
      ...sessionData,
      themeSelectionCompleted: true
    };
    
    setSessionData(updatedSessionData);
  };

  const updateMatchedActivities = async (activities: MatchedActivity[]) => {
    if (!sessionData) {

      return;
    }


    // Mettre à jour l'état local uniquement
    const updatedSessionData = {
      ...sessionData,
      matched_activities: activities
    };
    
    setSessionData(updatedSessionData);
    
    // Mettre à jour le localStorage aussi
    storeSessionInfo(updatedSessionData);
    

  };

  const loadThemes = useCallback(async () => {
    // Vérifier d'abord le hotel_session_id dans le localStorage
    const hotelSessionId = localStorage.getItem('hotel_session_id');
    const sessionId = hotelSessionId || sessionData?.session_id;
    
    if (!sessionId) {
      return;
    }

    try {
      setIsLoadingThemes(true);
      const themesResponse = await fetchThemes(sessionId);
      setThemes(themesResponse.themes);
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : 'Failed to load themes');
    } finally {
      setIsLoadingThemes(false);
    }
  }, [sessionData?.session_id]);

  useEffect(() => {
    if (!isLanguageSelected) {
      setIsLoadingSession(false);
      return;
    }

    // Éviter la double initialisation - mais permettre le changement de langue
    if (!sessionData || sessionData.lang_code !== currentLanguage) {

      initializeSession();
    } else {

      setIsLoadingSession(false);
    }
  }, [currentLanguage, isLanguageSelected]);

  const sessionId = sessionData?.session_id || null;

  return (
    <SessionContext.Provider value={{
      sessionData,
      sessionId,
      isLoadingSession,
      sessionError,
      themes,
      isLoadingThemes,
      refreshSession,
      loadThemes,
      updateLikedThemes,
      markThemeSelectionAsCompleted,
      updateMatchedActivities
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
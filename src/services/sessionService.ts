import { API_BASE_URL, apiHeaders, handleApiResponse } from '../config';

export interface SessionData {
  session_id: string;
  lang_code: string;
  city_id: string;
  liked_themes?: string[];
  themeSelectionCompleted?: boolean;
  preferences?: Record<string, any>;
  matched_activities?: MatchedActivity[]; // Updated to use the new MatchedActivity interface
  conversation_data?: {
    slots: Record<string, any>;
  };
  created_at: string;
  expires_at: string;
  last_activity?: string;
}

export interface MatchedActivity {
  activity_id: string;
  name: string;
  color: string;
  photo_url: string;
  secondary_color: string;
  tags: Array<{
    label: string;
    svg_icon: string;
  }>;
  duration: string;
  matching_score: number;
  scoring_details: {
    thematic_score: number;
    preferences_score: number;
    activity_tags_match: number;
    pois_tags_match: number;
    mode: string;
  };
  pois_coordinates: {
    poi_id: string;
    name: string;
    latitude: number;
    longitude: number;
  }[];
}

export interface POI {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  place_type: string;
  config: {
    description: string;
    descriptionTranslations: Record<string, string>;
  };
}

export interface CreateSessionRequest {
  lang_code: string;
  city_id: string;
}

export interface StoredSessionInfo {
  session_id: string;
  expires_at: string;
}

/**
 * Crée une nouvelle session utilisateur
 */
export const createSession = async (lang_code: string, city_id: string): Promise<SessionData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/session/create`, {
      method: 'POST',
      headers: {
        ...apiHeaders(),
        'accept': 'application/json',
      },
      body: JSON.stringify({
        lang_code,
        city_id,
      }),
    });


    const sessionData = await handleApiResponse(response, `${API_BASE_URL}/session/create`);

    return sessionData;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère une session existante par son ID
 */
export const getSession = async (sessionId: string): Promise<SessionData> => {
  try {
    const url = `${API_BASE_URL}/session/${encodeURIComponent(sessionId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...apiHeaders(),
        'accept': 'application/json',
      },
    });


    const sessionData = await handleApiResponse(response, url);

    return sessionData;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère les informations de session stockées localement
 */
export const getStoredSessionInfo = (): StoredSessionInfo | null => {
  try {
    const storedData = localStorage.getItem('session_info');
    if (!storedData) {
      return null;
    }

    const sessionInfo = JSON.parse(storedData) as StoredSessionInfo;

    return sessionInfo;
  } catch (error) {
    localStorage.removeItem('session_info');
    return null;
  }
};

/**
 * Vérifie si les informations de session stockées sont encore valides
 */
export const isSessionInfoValid = (sessionInfo: StoredSessionInfo): boolean => {
  if (!sessionInfo || !sessionInfo.session_id || !sessionInfo.expires_at) {
    return false;
  }

  const expiresAt = new Date(sessionInfo.expires_at);
  const now = new Date();
  
  const isValid = expiresAt.getTime() > (now.getTime() + 5 * 60 * 1000);

  return isValid;
};

/**
 * Stocke les informations de session dans le localStorage
 */
export const storeSessionInfo = (sessionData: SessionData): void => {
  try {
    const sessionInfo: StoredSessionInfo = {
      session_id: sessionData.session_id,
      expires_at: sessionData.expires_at,
    };

    localStorage.setItem('session_info', JSON.stringify(sessionInfo));
  } catch (error) {
  }
};

/**
 * Nettoie les informations de session stockées
 */
export const clearStoredSessionInfo = (): void => {
  localStorage.removeItem('session_info');
};

/**
 * Met à jour les thèmes likés d'une session
 */
export const updateSessionLikedThemes = async (sessionId: string, likedThemes: string[]): Promise<SessionData> => {
  try {
    
    const url = `${API_BASE_URL}/session/${encodeURIComponent(sessionId)}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        ...apiHeaders(),
        'accept': 'application/json',
      },
      body: JSON.stringify({
        liked_themes: likedThemes,
      }),
    });


    const updatedSessionData = await handleApiResponse(response, url);

    return updatedSessionData;
  } catch (error) {
    throw error;
  }
};

/**
 * Met à jour les activités correspondantes d'une session
 */
export const updateSessionMatchedActivities = async (sessionId: string, matchedActivities: MatchedActivity[]): Promise<SessionData> => {
  try {
    
    const url = `${API_BASE_URL}/session/${encodeURIComponent(sessionId)}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        ...apiHeaders(),
        'accept': 'application/json',
      },
      body: JSON.stringify({
        matched_activities: matchedActivities,
      }),
    });


    const updatedSessionData = await handleApiResponse(response, url);

    return updatedSessionData;
  } catch (error) {
    throw error;
  }
};

/**
 * Fonction principale pour s'assurer qu'une session active existe
 */
export const ensureActiveSession = async (lang_code: string, city_id: string): Promise<SessionData> => {
  try {

    const storedSessionInfo = getStoredSessionInfo();
    
    if (storedSessionInfo && isSessionInfoValid(storedSessionInfo)) {
      try {
        const existingSession = await getSession(storedSessionInfo.session_id);

        storeSessionInfo(existingSession);
        
        return existingSession;
      } catch (error) {
        clearStoredSessionInfo();
      }
    } else if (storedSessionInfo) {
      clearStoredSessionInfo();
    }

    const newSession = await createSession(lang_code, city_id);
    
    storeSessionInfo(newSession);

    return newSession;
    
  } catch (error) {
    throw error;
  }
}
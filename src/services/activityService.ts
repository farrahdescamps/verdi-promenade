import { API_BASE_URL, CONCIERGE_API_BASE_URL, apiHeaders, handleApiResponse } from '../config';

export interface ActivityPOI {
  poi_id: string;
  title: string;
  description: string;
  duration: string;
  duration_minutes: number;
  latitude: number;
  longitude: number;
  place_type: string;
  tags: Array<{
    label: string;
    svg_icon: string;
  }>;
  video_url?: string;
  photo_url?: string;
  actions: {
    podcast: {
      available: boolean;
      activity_id: string;
      poi_id: string;
    };
    slideshow: {
      available: boolean;
      activity_id: string;
      poi_id: string;
    };
    guide: {
      available: boolean;
      activity_id: string;
      poi_id: string;
    };
    custom_buttons?: Array<{
      label: string;
      url: string;
    }>;
  };
}

export interface ActivityDetails {
  activity_id: string;
  title: string;
  description: string;
  duration: string;
  duration_minutes: number;
  color: string;
  photo_url: string;
  video_url: string;
  pois: ActivityPOI[];
}

export interface HybridMatchRequest {
  session_id: string; // ID de la session utilisateur
  city_id: string; // ID de la ville (ex: Le Havre)
  liked_themes: string[]; // Liste des IDs de thèmes likés par l'utilisateur
  lang: string; // Code de la langue (ex: 'fr', 'en')
}

export interface MatchedActivityResponse {
  activity_id: string;
  name: string;
  color: string;
  secondary_color: string;
  photo_url: string;
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
}

export interface HybridMatchResponse {
  // Définir la structure de la réponse selon ce que retourne l'API
  // Pour l'instant, on utilise any pour capturer toute la réponse
  matched_activities: MatchedActivityResponse[];
  total_activities: number;
  scoring_mode: string;
  language: string;
  processing_time_ms: number;
}

export interface SlideshowPhoto {
  photo_url: string;
  order: number;
  caption: string;
}

export interface SlideshowData {
  activity_id: string;
  poi_id: string;
  poi_name: string;
  activity_name: string;
  slideshow: {
    photos: SlideshowPhoto[];
  };
}

/**
 * Envoie les données de session et thèmes likés pour obtenir des activités correspondantes
 */
export const sendHybridMatch = async (data: HybridMatchRequest): Promise<HybridMatchResponse> => {
  
  const url = `${API_BASE_URL}/activities-matching/match`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...apiHeaders(),
        'accept': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);


    const responseData = await handleApiResponse(response, url);

    return responseData;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère les détails d'une activité/thème spécifique
 * Utilise l'endpoint theme-display du concierge API
 */
export const fetchActivityDetails = async (activityId: string, lang: string): Promise<ActivityDetails> => {
  
  const url = `${CONCIERGE_API_BASE_URL}/theme-display/${encodeURIComponent(activityId)}?lang=${encodeURIComponent(lang)}`;

  try {
    console.log('%c🎯 FETCH ACTIVITY DETAILS', 'background: #8b5cf6; color: white; font-weight: bold; padding: 4px 8px;', {
      activityId,
      lang,
      url
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...apiHeaders(),
        'accept': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    const responseData = await handleApiResponse(response, url);
    
    // Log détaillé pour voir la structure des POIs
    if (responseData.pois && responseData.pois.length > 0) {
      const firstPoi = responseData.pois[0];
      console.log('%c✅ ACTIVITY DETAILS - FIRST POI COMPLETE', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', firstPoi);
      console.log('%c✅ ACTIVITY DETAILS - FIRST POI KEYS', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', Object.keys(firstPoi));
      console.log('%c✅ ACTIVITY DETAILS - FIRST POI ACTIONS', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', firstPoi.actions);
      console.log('%c✅ ACTIVITY DETAILS - ALL POIS', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', 
        responseData.pois.map(poi => ({
          poi_id: poi.poi_id,
          title: poi.title,
          video_url: poi.video_url,
          photo_url: poi.photo_url,
          main_photo_url: (poi as any).main_photo_url,
          main_video_url: (poi as any).main_video_url,
          hasVideo: !!poi.video_url,
          hasPhoto: !!poi.photo_url,
          allKeys: Object.keys(poi)
        }))
      );
    }

    return responseData;
  } catch (error) {
    console.error('%c❌ ERROR LOADING ACTIVITY', 'background: #ef4444; color: white; font-weight: bold; padding: 4px 8px;', {
      activityId,
      error
    });
    throw error;
  }
};

/**
 * Récupère les détails du slideshow pour un POI spécifique
 */
export const fetchSlideshowDetails = async (themeId: string, poiId: string, lang: string): Promise<SlideshowData> => {
  
  const url = `${CONCIERGE_API_BASE_URL}/slideshow/${encodeURIComponent(themeId)}/${encodeURIComponent(poiId)}?lang=${encodeURIComponent(lang)}`;

  try {
    console.log('%c🎬 FETCH SLIDESHOW DETAILS', 'background: #f59e0b; color: white; font-weight: bold; padding: 4px 8px;', {
      themeId,
      poiId,
      lang,
      url
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...apiHeaders(),
        'accept': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    const responseData = await handleApiResponse(response, url);
    
    console.log('%c✅ SLIDESHOW DETAILS LOADED', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', {
      themeId,
      poiId,
      photosCount: responseData.slideshow?.photos?.length
    });

    return responseData;
  } catch (error) {
    console.error('%c❌ ERROR LOADING SLIDESHOW', 'background: #ef4444; color: white; font-weight: bold; padding: 4px 8px;', {
      themeId,
      poiId,
      error
    });
    throw error;
  }
};

/**
 * Récupère toutes les activités d'une ville spécifique
 */
export const fetchActivitiesByCity = async (cityId: string, lang: string): Promise<MatchedActivityResponse[]> => {
  
  const url = `${API_BASE_URL}/activities/city/${encodeURIComponent(cityId)}?lang=${encodeURIComponent(lang)}`;

  try {


    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...apiHeaders(),
        'accept': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    const responseData = await handleApiResponse(response, url);

    // Transform the response to match MatchedActivityResponse format
    const activities = Array.isArray(responseData.activities) ? responseData.activities.map((activity: any) => ({
      activity_id: activity.activity_id || activity.id,
      name: activity.name || 'Activité sans nom',
      color: activity.color || '#0099CC',
      secondary_color: activity.secondary_color || '#DBEAFE',
      photo_url: activity.photo_url || '',
      tags: activity.tags || [],
      duration: activity.duration || '',
      matching_score: 1.0, // Default score for explorer activities
      scoring_details: {
        thematic_score: 1.0,
        preferences_score: 1.0,
        activity_tags_match: 1.0,
        pois_tags_match: 1.0,
        mode: 'explorer'
      }
    })) : [];

    return activities;
  } catch (error) {

    throw error;
  }
};
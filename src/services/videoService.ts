import { API_BASE_URL, CONCIERGE_API_BASE_URL, apiHeaders, handleApiResponse } from '../config';

// Ancienne interface (deprecated)
export interface VideoAccueilData {
  city_id: string;
  city_name: string;
  intro_video: string;
  outro_video: string;
  has_intro: boolean;
  has_outro: boolean;
  updated_at: string;
}

// Nouvelle interface pour les données de l'hôtel
export interface HotelVideoData {
  success: boolean;
  hotel_id: string;
  hotel_name: string;
  logo_url: string | null;
  logo_group_url: string | null;
  main_photo_url: string | null;
  couleur_primaire: string | null;
  couleur_secondaire: string | null;
  video_intro_url: string | null;
  video_conclusion_url: string | null;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Récupère les données vidéo et visuelles de l'hôtel depuis l'API Concierge
 * @param hotelId - ID de l'hôtel (depuis VITE_HOTEL_ID)
 * @returns Données de l'hôtel (logos, couleurs, vidéos)
 */
export const fetchHotelVideos = async (hotelId: string): Promise<HotelVideoData> => {
  const url = `${CONCIERGE_API_BASE_URL}/hotel-videos?hotel_id=${encodeURIComponent(hotelId)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...apiHeaders(),
        'accept': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    const data = await handleApiResponse(response, url);
    
    return data as HotelVideoData;
  } catch (error) {
    throw error;
  }
};

// Ancienne fonction (deprecated - pour compatibilité)
export const fetchVideoAccueil = async (cityId: string): Promise<VideoAccueilData> => {
  
  const url = `${API_BASE_URL}/video_intro/${encodeURIComponent(cityId)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...apiHeaders(),
        'accept': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);


    const data = await handleApiResponse(response, url);

    const transformedData: VideoAccueilData = {
      city_id: data.city_id,
      city_name: data.city_name,
      intro_video: data.intro_video ? String(data.intro_video).trim() : '',
      outro_video: data.outro_video ? String(data.outro_video).trim() : '',
      has_intro: !!(data.intro_video && data.intro_video.trim()),
      has_outro: !!(data.outro_video && data.outro_video.trim()),
      updated_at: data.updated_at || new Date().toISOString()
    };
    
    return transformedData;
  } catch (error) {
    throw error;
  }
};
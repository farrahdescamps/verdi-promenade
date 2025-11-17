import { CONCIERGE_API_BASE_URL, API_KEY, HOTEL_ID } from '../config';

export interface TinderVideo {
  title: string;
  url: string;
}

export interface TinderResponse {
  success: boolean;
  hotel_id: string;
  hotel_name: string;
  category: string;
  lang: string;
  count: number;
  videos: TinderVideo[];
}

/**
 * Mapping des types vers les catégories de l'API Tinder
 */
const TYPE_TO_CATEGORY: Record<string, string> = {
  'restaurant': 'restaurant',
  'activity': 'activites',
  'itinerary': 'itineraire',
  'hotel': 'hotel',
};

/**
 * Récupère les cartes Tinder pour une catégorie donnée
 */
export const fetchTinderCards = async (
  type: 'restaurant' | 'activity' | 'itinerary' | 'hotel',
  lang: string = 'en'
): Promise<TinderResponse> => {
  const category = TYPE_TO_CATEGORY[type];
  
  if (!category) {
    throw new Error(`Unknown type: ${type}`);
  }

  const url = `${CONCIERGE_API_BASE_URL}/tinder?hotel_id=${HOTEL_ID}&category=${category}&lang=${lang}`;

  console.log('%c🎴 TINDER API CALL', 'background: #8b5cf6; color: white; font-weight: bold; padding: 4px 8px;', {
    type,
    category,
    lang,
    url
  });

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'x-api-key': API_KEY,
    },
  });

  if (!response.ok) {
    console.error('❌ Tinder API Error:', response.statusText);
    throw new Error(`Failed to fetch tinder cards: ${response.statusText}`);
  }

  const data = await response.json();
  
  console.log('%c✅ TINDER API RESPONSE', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', {
    count: data.count,
    videos: data.videos?.length,
    data
  });

  return data;
};


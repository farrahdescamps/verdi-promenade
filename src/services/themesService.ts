import { CONCIERGE_API_BASE_URL, API_KEY } from '../config';

export interface Theme {
  id: string;
  type: 'restaurant' | 'activity' | 'itinerary' | 'hotel';
  name: string;
  photo_url: string | null;
  tags: string[];
}

export interface ThemesResponse {
  success: boolean;
  session_id: string;
  hotel_id: string;
  lang_code: string;
  type: string | null;
  count: number;
  themes: Theme[];
}

/**
 * Récupère les thèmes disponibles pour une session donnée
 */
export const fetchThemes = async (sessionId: string): Promise<ThemesResponse> => {
  const url = `${CONCIERGE_API_BASE_URL}/themes?session_id=${sessionId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'x-api-key': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch themes: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};


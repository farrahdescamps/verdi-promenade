import { CONCIERGE_API_BASE_URL, API_KEY } from '../config';

export interface MiniGuidePart {
  part_number: number;
  title: string;
  content: string;
  word_count: number;
}

export interface MiniGuideResponse {
  success: boolean;
  guide_id: string;
  poi_id: string;
  hotel_id: string;
  session_id: string;
  language: string;
  parts: MiniGuidePart[];
  total_parts: number;
  total_words: number;
  generated_at: string;
  processing_time_ms: number;
}

/**
 * Récupère le mini-guide pour un POI d'hôtel
 */
export const fetchMiniGuide = async (
  poiKey: string,
  sessionId: string
): Promise<MiniGuideResponse> => {
  const url = `${CONCIERGE_API_BASE_URL}/mini-guide/hotel/${poiKey}?session_id=${sessionId}`;

  console.log('%c📖 MINI-GUIDE API CALL', 'background: #3b82f6; color: white; font-weight: bold; padding: 4px 8px;', {
    poiKey,
    sessionId,
    url
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'x-api-key': API_KEY,
    },
    body: ''
  });

  if (!response.ok) {
    console.error('❌ Mini-Guide API Error:', response.statusText);
    throw new Error(`Failed to fetch mini-guide: ${response.statusText}`);
  }

  const data = await response.json();

  console.log('%c✅ MINI-GUIDE API RESPONSE', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', {
    parts: data.parts?.length,
    total_words: data.total_words,
    data
  });

  return data;
};


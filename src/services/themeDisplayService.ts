import { CONCIERGE_API_BASE_URL, API_KEY } from '../config';

export interface ThemeDisplayPOI {
  poi_id: string;
  title: string;
  description: string;
  duration: string;
  duration_minutes: number;
  latitude: number;
  longitude: number;
  place_type: string;
  tags: any[];
  video_url: string;
  tinder: any;
  actions: {
    podcast: {
      available: boolean;
      theme_id: string;
      poi_id: string;
    };
    slideshow: {
      available: boolean;
      theme_id: string;
      poi_id: string;
    };
    guide: {
      available: boolean;
      theme_id: string;
      poi_id: string;
    };
  };
}

export interface ThemeDisplayResponse {
  theme_id: string;
  type: string;
  type_label: string;
  title: string;
  description: string;
  duration: string;
  duration_minutes: number;
  color: string;
  secondary_color: string;
  photo_url: string;
  video_url: string;
  tags: any[];
  pois: ThemeDisplayPOI[];
  language: string;
}

export const fetchThemeDisplay = async (
  themeId: string,
  lang: string = 'fr'
): Promise<ThemeDisplayResponse> => {
  const url = `${CONCIERGE_API_BASE_URL}/theme-display/${themeId}?lang=${lang}`;

  console.log('%c🎨 THEME DISPLAY API CALL', 'background: #8b5cf6; color: white; font-weight: bold; padding: 4px 8px;', {
    themeId,
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
    throw new Error(`Failed to fetch theme display: ${response.status}`);
  }

  const data = await response.json();
  
  console.log('%c✅ THEME DISPLAY RESPONSE', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', {
    theme: data.title,
    poisCount: data.pois?.length,
    data
  });

  return data;
};


import { API_BASE_URL, apiHeaders, handleApiResponse } from '../config';

export interface Theme {
  id: string;
  name: string;
  video_url: string;
}

export const fetchThemes = async (cityId: string, languageCode: string): Promise<Theme[]> => {
  try {
    const url = `${API_BASE_URL}/theme-intro/city/${encodeURIComponent(cityId)}?lang=${encodeURIComponent(languageCode)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...apiHeaders(),
        'accept': 'application/json',
      },
    });


    const data = await handleApiResponse(response, url);

    const themes = Array.isArray(data) ? data.map((theme: any) => ({
      id: theme.name || 'unknown',
      name: theme.name || 'Thème sans nom',
      video_url: theme.video_url || '',
    })) : [];

    return themes;
  } catch (error) {
    throw error;
  }
};
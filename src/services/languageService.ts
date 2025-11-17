import { CONCIERGE_API_BASE_URL, apiHeaders, handleApiResponse } from '../config';

export interface Language {
  id: string;
  name: string;
  subtitle: string;
  code?: string;
}

// Interface pour les traductions d'interface (éléments statiques)
export interface InterfaceTranslations {
  [key: string]: any;
}

export const fetchLanguages = async (): Promise<Language[]> => {
  try {
    const url = `${CONCIERGE_API_BASE_URL}/languages`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...apiHeaders(),
        'accept': 'application/json',
      },
    });

    const data = await handleApiResponse(response, url);
    
    // Transform API response to match our component's expected format
    // La nouvelle API Concierge retourne un tableau de langues
    return data.map((lang: any) => ({
      id: lang.code || lang.id,
      name: lang.label || lang.name,
      subtitle: lang.label || lang.name,
      code: lang.code || lang.id,
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère les traductions d'interface (éléments statiques de l'UI)
 * @param languageCode Code de la langue (ex: 'fr', 'en', etc.)
 * @returns Traductions d'interface
 */
export const fetchInterfaceTranslations = async (languageCode: string): Promise<InterfaceTranslations> => {
  try {
    const url = `${CONCIERGE_API_BASE_URL}/interface/download/${encodeURIComponent(languageCode)}`;
    
    console.log('%c🌍 INTERFACE TRANSLATIONS API', 'background: #3b82f6; color: white; font-weight: bold; padding: 4px 8px;', {
      languageCode,
      url
    });
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...apiHeaders(),
        'accept': 'application/json',
      },
    });

    const data = await handleApiResponse(response, url);
    
    console.log('%c✅ TRANSLATIONS LOADED', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', {
      languageCode,
      labelsCount: data?.labels ? Object.keys(data.labels).length : 0
    });

    // L'API retourne un objet avec language_code et labels
    if (data && data.labels) {

      return data.labels;
    } else {

      throw new Error(`No interface translations found for language code: ${languageCode}`);
    }
  } catch (error) {

    throw error;
  }
};
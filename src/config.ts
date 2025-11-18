// Configuration centralisée pour l'API
// Utilise toujours les chemins relatifs pour que le proxy fonctionne
// En développement: proxy Vite (vite.config.ts)
// En production: proxy Vercel (vercel.json)
const DEFAULT_API = '/api';
const DEFAULT_CONCIERGE_API = '/concierge-api';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API).replace(/\/+$/, '');
export const CONCIERGE_API_BASE_URL = (import.meta.env.VITE_CONCIERGE_API_URL || DEFAULT_CONCIERGE_API).replace(/\/+$/, '');

export const API_KEY = import.meta.env.VITE_API_KEY || '';
export const HOTEL_ID = import.meta.env.VITE_HOTEL_ID || '';
export const HOTEL_NAME = import.meta.env.VITE_HOTEL_NAME || 'Hotel';
export const MAP_THEME = (import.meta.env.VITE_MAP_THEME || 'dark') as 'light' | 'dark';

// Fonction pour générer les headers d'API avec authentification
export function apiHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };

  const apiKey = import.meta.env.VITE_API_KEY;
  
  if (apiKey && apiKey !== '<<ta_clef_api_si_vous_en_utilisez_une>>') {
    h["x-api-key"] = apiKey;
  }

  const bearer = import.meta.env.VITE_AUTH_BEARER;
  if (bearer && bearer !== 'eyJhbGciOi...') {
    h["Authorization"] = `Bearer ${bearer}`;
  }

  return h;
}

// Fonction utilitaire pour gérer les réponses API de manière robuste
export const handleApiResponse = async (response: Response, url: string) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  
  if (!contentType.includes('application/json')) {
    throw new Error('API did not return JSON');
  }
  
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Invalid JSON response from API');
  }
};
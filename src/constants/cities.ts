const FALLBACK_CITY_ID = 'recVzMydIlyUoBvvB';

/**
 * Identifiant de ville utilisé par les appels API.
 * Peut être surchargé via VITE_CITY_ID pour éviter tout nom codé en dur.
 */
export const DEFAULT_CITY_ID =
  (import.meta.env?.VITE_CITY_ID && import.meta.env.VITE_CITY_ID.trim() !== '')
    ? import.meta.env.VITE_CITY_ID.trim()
    : FALLBACK_CITY_ID;
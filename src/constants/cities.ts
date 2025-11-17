// Constantes pour les IDs des villes
export const CITY_IDS = {
  LE_HAVRE: 'recVzMydIlyUoBvvB',
  SAINT_TROPEZ: 'saint-tropez', // ID pour Saint-Tropez
  // Ajouter d'autres villes ici si nécessaire
} as const;

// Export direct pour Le Havre (ville principale de l'app)
export const LE_HAVRE_CITY_ID = CITY_IDS.LE_HAVRE;

// Coordonnées par défaut pour les cartes
export const DEFAULT_MAP_CENTER = {
  lat: 43.2677, // Saint-Tropez
  lng: 6.6407
};
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchHotelVideos } from '../services/videoService';
import { HOTEL_ID } from '../config';

interface ThemeContextType {
  primaryColor: string;
  secondaryColor: string;
  hotelName: string;
  regionName: string | null;
  logoUrl: string | null;
  logoGroupUrl: string | null;
  mainPhotoUrl: string | null;
  hotelLatitude: number | null;
  hotelLongitude: number | null;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Couleurs par défaut (fallback neutre)
const DEFAULT_PRIMARY_COLOR = '#6b7280'; // gray-500
const DEFAULT_SECONDARY_COLOR = '#4b5563'; // gray-600

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [primaryColor, setPrimaryColor] = useState<string>(DEFAULT_PRIMARY_COLOR);
  const [secondaryColor, setSecondaryColor] = useState<string>(DEFAULT_SECONDARY_COLOR);
  const [hotelName, setHotelName] = useState<string>('');
  const [regionName, setRegionName] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoGroupUrl, setLogoGroupUrl] = useState<string | null>(null);
  const [mainPhotoUrl, setMainPhotoUrl] = useState<string | null>(null);
  const [hotelLatitude, setHotelLatitude] = useState<number | null>(null);
  const [hotelLongitude, setHotelLongitude] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      console.log('%c🎨 THEME CONTEXT - START', 'background: #ec4899; color: white; font-weight: bold; padding: 4px 8px;', { 
        HOTEL_ID,
        timestamp: new Date().toISOString() 
      });

      if (!HOTEL_ID) {
        console.log('%c❌ THEME - Pas de HOTEL_ID', 'background: #ef4444; color: white; padding: 4px 8px;');
        setIsLoading(false);
        return;
      }

      try {
        console.log('%c📡 THEME - Fetch API...', 'background: #f59e0b; color: white; padding: 4px 8px;');
        const hotelData = await fetchHotelVideos(HOTEL_ID);
        console.log('%c✅ THEME - API Response', 'background: #10b981; color: white; padding: 4px 8px;', {
          hotel_name: hotelData.hotel_name,
          hasLogo: !!hotelData.logo_url,
          hasPhoto: !!hotelData.main_photo_url,
          logoPreview: hotelData.logo_url ? hotelData.logo_url.substring(0, 50) + '...' : null,
          photoPreview: hotelData.main_photo_url ? hotelData.main_photo_url.substring(0, 50) + '...' : null
        });
        
        // Mettre à jour les couleurs du thème
        if (hotelData.couleur_primaire) {
          setPrimaryColor(hotelData.couleur_primaire);
          console.log('🎨 Primary color:', hotelData.couleur_primaire);
        }
        if (hotelData.couleur_secondaire) {
          setSecondaryColor(hotelData.couleur_secondaire);
          console.log('🎨 Secondary color:', hotelData.couleur_secondaire);
        }
        
        // Mettre à jour les informations de l'hôtel
        console.log('%c📝 THEME - Mise à jour état...', 'background: #8b5cf6; color: white; padding: 4px 8px;');
        setHotelName(hotelData.hotel_name || '');
        setRegionName(hotelData.region || null);
        setLogoUrl(hotelData.logo_url);
        setLogoGroupUrl(hotelData.logo_group_url);
        setMainPhotoUrl(hotelData.main_photo_url);
        setHotelLatitude(hotelData.latitude);
        setHotelLongitude(hotelData.longitude);
        
        // Mettre à jour le titre de la page avec le nom de l'hôtel
        if (hotelData.hotel_name) {
          document.title = `Guest Carte ${hotelData.hotel_name}`;
          console.log('📄 Page title:', document.title);
        }
        
        // Mettre à jour les variables CSS pour Tailwind
        document.documentElement.style.setProperty('--color-primary', hotelData.couleur_primaire || DEFAULT_PRIMARY_COLOR);
        document.documentElement.style.setProperty('--color-secondary', hotelData.couleur_secondaire || DEFAULT_SECONDARY_COLOR);

        console.log('%c✅ THEME CONTEXT - DONE', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;');
      } catch (error) {
        console.log('%c❌ THEME - ERROR', 'background: #ef4444; color: white; font-weight: bold; padding: 4px 8px;', error);
        // En cas d'erreur, garder les couleurs par défaut
      } finally {
        setIsLoading(false);
        console.log('%c🏁 THEME - isLoading = false', 'background: #6b7280; color: white; padding: 4px 8px;');
      }
    };

    loadTheme();
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        primaryColor,
        secondaryColor,
        hotelName,
        regionName,
        logoUrl,
        logoGroupUrl,
        mainPhotoUrl,
        hotelLatitude,
        hotelLongitude,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook pour utiliser le thème dans les composants
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};


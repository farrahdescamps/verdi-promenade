import React, { useMemo } from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { InteractiveMap } from "../../components/Map";
import { CardActivity } from "../../components/CardActivity";
import { useTranslation } from "../../locales";
import { useSession } from "../../contexts/SessionContext";
import { MatchedActivity } from "../../services/sessionService";
import { useTheme } from "../../contexts/ThemeContext";
import { LogoDisplay } from "../../utils/logoUtils";
import { useLanguage } from "../../contexts/LanguageContext";
import { fetchThemeDisplay, ThemeDisplayPOI } from "../../services/themeDisplayService";
import { fetchThemes } from "../../services/themesService";
import { MAP_THEME } from "../../config";
import { BackButton } from "../../components/BackButton";
import { 
  CameraIcon, 
  CompassIcon, 
  FootprintsIcon, 
  HeadphonesIcon, 
  SafariIcon, 
  SeedlingIcon, 
  UtensilsIcon, 
  PaletteIcon 
} from "../../components/icons";

interface TinderTheme {
  id: string;
  type: string;
  name: string;
  photo_url: string | null;
  tags: string[];
}

interface TinderResults {
  success: boolean;
  session_id: string;
  hotel_id: string;
  lang_code: string;
  type: string;
  count: number;
  themes: TinderTheme[];
}

export const PageMonAventure = (): JSX.Element => { // Renamed to avoid conflict
  const { t } = useTranslation();
  const { sessionData } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const { primaryColor, secondaryColor, logoUrl, hotelName, regionName } = useTheme();
  const { currentLanguage } = useLanguage();
  
  // Récupérer les résultats Tinder et la catégorie depuis le state de navigation
  const tinderResultsFromLocation = (location.state as { tinderResults?: TinderResults; category?: string })?.tinderResults;
  const categoryFromLocation = (location.state as { category?: string })?.category;
  
  // État local pour stocker les résultats et la catégorie
  const [tinderResults, setTinderResults] = useState<TinderResults | undefined>(tinderResultsFromLocation);
  const [category, setCategory] = useState<string | undefined>(() => {
    // Initialiser depuis sessionStorage si disponible
    return categoryFromLocation || sessionStorage.getItem('currentCategory') || undefined;
  });
  const [loadingActivities, setLoadingActivities] = useState(false);
  
  // Sauvegarder la catégorie et recharger les données si nécessaire
  useEffect(() => {
    if (categoryFromLocation) {
      setCategory(categoryFromLocation);
      sessionStorage.setItem('currentCategory', categoryFromLocation);
    }
    
    if (tinderResultsFromLocation) {
      setTinderResults(tinderResultsFromLocation);
    }
  }, [categoryFromLocation, tinderResultsFromLocation]);
  
  // Recharger les données depuis l'API si on a une catégorie mais pas de tinderResults
  useEffect(() => {
    const reloadData = async () => {
      // Si on a déjà des tinderResults, pas besoin de recharger
      if (tinderResults) {
        setLoadingActivities(false);
        return;
      }
      
      // Si on n'a pas de catégorie, on ne peut pas recharger
      if (!category) {
        setLoadingActivities(false);
        return;
      }
      
      setLoadingActivities(true);
      
      console.log('%c🔄 RECHARGEMENT DES DONNÉES', 'background: #f59e0b; color: white; font-weight: bold; padding: 4px 8px;', {
        category,
        hasTinderResults: !!tinderResults
      });
      
      try {
        const hotelSessionId = localStorage.getItem('hotel_session_id');
        if (!hotelSessionId) {
          console.warn('⚠️ Pas de session ID trouvé');
          setLoadingActivities(false);
          return;
        }
        
        // Appeler l'API /themes avec le type
        const response = await fetchThemes(hotelSessionId);
        
        console.log('%c✅ DONNÉES RECHARGÉES', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', response);
        
        // Filtrer les thèmes par catégorie et reconstruire le format TinderResults
        const categoryMap: Record<string, string> = {
          'restaurant': 'restaurant',
          'activity': 'activity',
          'itinerary': 'itinerary'
        };
        
        const targetType = categoryMap[category];
        const filteredThemes = response.themes
          .filter(theme => theme.type === targetType)
          .map(theme => ({
            id: theme.id,
            type: theme.type,
            name: theme.name,
            photo_url: theme.photo_url,
            tags: theme.tags
          }));
        
        setTinderResults({
          success: true,
          session_id: response.session_id,
          hotel_id: response.hotel_id,
          lang_code: response.lang_code,
          type: category,
          count: filteredThemes.length,
          themes: filteredThemes
        });
        
        setLoadingActivities(false);
        
      } catch (error) {
        console.error('%c❌ ERREUR RECHARGEMENT', 'background: #ef4444; color: white; font-weight: bold; padding: 4px 8px;', error);
        setLoadingActivities(false);
      }
    };
    
    reloadData();
  }, [category, tinderResults]);
  
  // État pour les POIs chargés depuis l'API theme-display
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [loadingPOIs, setLoadingPOIs] = useState(false);
  
  // État pour contrôler l'expansion de la liste des activités
  const [isExpanded, setIsExpanded] = useState(false);
  
  // État pour gérer le double-clic sur les cartes
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);
  
  console.log('%c📍 PAGE MON AVENTURE - État de navigation', 'background: #8b5cf6; color: white; font-weight: bold; padding: 4px 8px;', {
    'location.state': location.state,
    tinderResults,
    hasTinderResults: !!tinderResults,
    sessionData: sessionData?.matched_activities?.length
  });

  // State to control which POIs are displayed on the map
  const [displayedPois, setDisplayedPois] = useState<Array<{name: string, lat: number, lng: number, color?: string, poi_id?: string, activity_id?: string, video_url?: string, photo_url?: string}>>([]);

  // Function to get icon for a tag
  const getTagIcon = (svgIcon: string, color: string) => {
    if (!svgIcon) {
      return <SafariIcon className="w-2 h-2" style={{ color }} />;
    }

    // Remplacer la couleur dans le SVG par la couleur principale
    const coloredSvg = svgIcon.replace(/fill="[^"]*"/g, `fill="${color}"`);
    
    return (
      <div 
        className="w-2 h-2 flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: coloredSvg }}
      />
    );
  };

  // Function to generate a lighter color for secondary color
  const getLighterColor = (color: string): string => {
    // Remove # if present
    const hex = color.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Make it lighter by blending with white (increase RGB values)
    const lighterR = Math.min(255, Math.round(r + (255 - r) * 0.7));
    const lighterG = Math.min(255, Math.round(g + (255 - g) * 0.7));
    const lighterB = Math.min(255, Math.round(b + (255 - b) * 0.7));
    
    // Convert back to hex
    return `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
  };

  // Log des résultats Tinder pour debug
  useEffect(() => {
    if (tinderResults) {
      console.log('%c🎯 RÉSULTATS TINDER AFFICHÉS', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', tinderResults);
    }
  }, [tinderResults]);

  // Si on a des résultats Tinder, les afficher; sinon afficher les activités de la session
  // Adapter les couleurs selon le thème de la carte
  const mapTextColor = MAP_THEME === 'light' ? (primaryColor || '#690217') : 'white';
  
  const hexToRgb = (color: string) => {
    const hex = color.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  };

  const getLuminance = (color: string) => {
    const { r, g, b } = hexToRgb(color);
    const [R, G, B] = [r, g, b].map((value) => {
      const normalized = value / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };

  const logoVariant = useMemo(() => {
    if (MAP_THEME !== 'light') {
      return { color: '#FFFFFF', useFilter: true };
    }
    const primary = primaryColor || '#690217';
    const secondary = secondaryColor || getLighterColor(primary);
    const primaryLum = getLuminance(primary);
    if (primaryLum > 0.75) {
      const secondaryLum = getLuminance(secondary);
      if (secondaryLum <= 0.8) {
        return { color: secondary, useFilter: false };
      }
      return { color: '#FFFFFF', useFilter: true };
    }
    return { color: primary, useFilter: false };
  }, [primaryColor, secondaryColor]);

  const mapLogoContainerStyle = logoVariant.useFilter ? {} : { color: logoVariant.color };
  const mapLogoImageStyle = logoVariant.useFilter ? { filter: 'brightness(0) invert(1)' } : { filter: 'none' };
  
  // Dégradé adapté au thème - TOUJOURS utiliser primaryColor (jamais en dur)
  const getPrimaryRGB = () => {
    const color = primaryColor || '#456E6B'; // Fallback seulement si primaryColor null
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return { r, g, b };
  };
  
  const rgb = getPrimaryRGB();
  const mapGradient = MAP_THEME === 'light'
    ? `linear-gradient(180deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3) 40%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85) 100%)`
    : `linear-gradient(180deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5) 50%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1) 100%)`;

const baseActivities = tinderResults 
    ? (() => {
        console.log('%c🎯 CONVERSION DES THÈMES TINDER', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', {
          count: tinderResults.themes.length,
          themes: tinderResults.themes
        });
        return tinderResults.themes.map((theme: TinderTheme, index: number) => ({
          id: theme.id,
          title: theme.name,
          imageSrc: theme.photo_url || '',
          duration: '30min', // Durée par défaut
          primaryColor: primaryColor || '#690217',
          secondaryColor: secondaryColor || getLighterColor(primaryColor || '#690217'),
          whiteTags: theme.tags.slice(0, 3).map(tag => ({
            icon: <SafariIcon className="w-2 h-2" style={{ color: primaryColor }} />,
            text: tag
          })),
          tealTags: theme.tags.slice(3, 6).map(tag => ({
            icon: <SafariIcon className="w-2 h-2" style={{ color: 'white' }} />,
            text: tag
          })),
          totalTags: theme.tags.length,
          pois: [] // Pas de POIs pour les résultats Tinder
        }));
      })()
    : (sessionData?.matched_activities || []).map((activity: MatchedActivity) => {
    // Validate activity_id - check for undefined, null, or string versions
    const isValidActivityId = activity.activity_id && 
      activity.activity_id !== 'undefined' && 
      activity.activity_id !== 'null' && 
      String(activity.activity_id).trim() !== '';
    
    const validActivityId = isValidActivityId ? String(activity.activity_id) : '';

    // Use colors from API response with fallbacks
    const primaryColor = activity.color || '#0099CC'; // Use API color or fallback to blue
    const secondaryColor = activity.secondary_color || getLighterColor(primaryColor);

    return {
      id: validActivityId,
      title: activity.name, // Keep original title without line breaks for smaller text
      imageSrc: activity.photo_url, // Use photo_url from API as background image
      duration: activity.duration,
      primaryColor: primaryColor,
      secondaryColor: secondaryColor,
      whiteTags: activity.tags.slice(0, 3).map(tag => ({ // First 3 tags for white tags
        icon: getTagIcon(tag.svg_icon, primaryColor),
        text: tag.label
      })),
      tealTags: activity.tags.slice(3, 6).map(tag => ({ // Next 3 tags for teal tags (removes hardcoded)
        icon: getTagIcon(tag.svg_icon, activity.tags.length > 3 ? 'white' : primaryColor),
        text: tag.label
      })),
      totalTags: activity.tags.length, // Ajouter le nombre total de tags
      pois: (activity.pois_coordinates || []).map(poi => ({
        name: poi.name, // Now using the actual POI name from API
        lat: poi.latitude,
        lng: poi.longitude,
        color: primaryColor, // Add color for map pins
        poi_id: poi.poi_id,
        activity_id: validActivityId,
        video_url: (poi as any).video_url,
        photo_url: (poi as any).photo_url
      }))
    };
  }).filter(activity => activity.id !== ''); // Filter out activities with invalid IDs

  console.log('%c📊 ACTIVITÉS FINALES À AFFICHER', 'background: #f59e0b; color: white; font-weight: bold; padding: 4px 8px;', {
    count: baseActivities.length,
    activities: baseActivities.map(a => ({ id: a.id, title: a.title, hasImage: !!a.imageSrc }))
  });

  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const activities = useMemo(() => {
    if (!baseActivities || baseActivities.length === 0) return [];
    if (!activeCardId) return baseActivities;
    const cloned = [...baseActivities];
    const idx = cloned.findIndex(activity => activity.id === activeCardId);
    if (idx > 0) {
      const [active] = cloned.splice(idx, 1);
      cloned.unshift(active);
    }
    return cloned;
  }, [baseActivities, activeCardId]);

  // Handle card click to toggle active state and display POIs
  const handleCardClick = async (clickedCardId: string) => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;
    
    // Double-clic détecté (moins de 300ms entre les clics sur la même carte)
    if (timeSinceLastClick < 300 && lastClickedId === clickedCardId) {
      console.log('%c🔗 NAVIGATION vers activité', 'background: #3b82f6; color: white; font-weight: bold; padding: 4px 8px;', {
        activityId: clickedCardId,
        category
      });
      
      // Naviguer vers la page activité en passant la catégorie
      navigate(`/activite/${clickedCardId}`, {
        state: { category }
      });
      return;
    }
    
    // Enregistrer le clic pour détecter le prochain double-clic
    setLastClickTime(now);
    setLastClickedId(clickedCardId);
    
    console.log('%c🎯 CLICK SUR THÈME', 'background: #f59e0b; color: white; font-weight: bold; padding: 4px 8px;', {
      themeId: clickedCardId,
      selectedThemeId
    });

    // Si on clique sur le même thème, on désélectionne
    if (selectedThemeId === clickedCardId) {
      setSelectedThemeId(null);
      setActiveCardId(null);
      setDisplayedPois([]);
      return;
    }

    // Charger les POIs pour ce thème
    setSelectedThemeId(clickedCardId);
    setActiveCardId(clickedCardId);
    setLoadingPOIs(true);
    
    // Fermer la liste expandée et revenir à la vue réduite
    setIsExpanded(false);

    try {
      const themeData = await fetchThemeDisplay(clickedCardId, currentLanguage);
      
      // Convertir les POIs de l'API en format pour la carte
      const poisForMap = themeData.pois
        .filter(poi => poi.latitude !== 0 && poi.longitude !== 0) // Filtrer les POIs sans coordonnées
        .map(poi => ({
          name: poi.title,
          lat: poi.latitude,
          lng: poi.longitude,
          color: themeData.color || primaryColor,
          poi_id: poi.poi_id,
          activity_id: clickedCardId,
          video_url: poi.video_url && poi.video_url.trim() !== '' ? poi.video_url : undefined,
          photo_url: poi.photo_url && poi.photo_url.trim() !== '' ? poi.photo_url : undefined
        }));

      console.log('%c🗺️ POIs affichés sur la carte', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', {
        count: poisForMap.length,
        pois: poisForMap
      });

      setDisplayedPois(poisForMap);
    } catch (error) {
      console.error('❌ Erreur chargement POIs:', error);
      setDisplayedPois([]);
    } finally {
      setLoadingPOIs(false);
    }
  };

  // Handle POI click on map - navigate to activity page with POI scroll
  const handleMapPoiClick = (poi: any) => {


    if (poi.activity_id && poi.poi_id) {
      // Navigate to activity page with POI ID in state for auto-scroll
      navigate(`/activite/${poi.activity_id}`, {
        state: { 
          scrollToPoiId: poi.poi_id,
          poiName: poi.name,
          poiVideoUrl: poi.video_url, // Pass video URL to activity page
          poiPhotoUrl: poi.photo_url,
          category // Passer la catégorie pour pouvoir revenir à /journey
        }
      });
    }
  };

  // Déterminer le titre du header basé sur la catégorie
  const getHeaderTitle = () => {
    if (!category) return t('journey.title');
    
    const categoryTitles: Record<string, string> = {
      'restaurant': t('home.restaurant') || 'Find your restaurant!',
      'activity': t('home.experience') || 'Book your experience!',
      'itinerary': t('home.discover', { regionName: regionName || 'la région' }) || 'Découvrez la région!'
    };
    
    return categoryTitles[category] || t('journey.title');
  };

  // Show loading state if no activities are available yet
  // Vérifier à la fois tinderResults et sessionData
  const hasActivities = tinderResults 
    ? tinderResults.themes && tinderResults.themes.length > 0
    : sessionData?.matched_activities && sessionData.matched_activities.length > 0;
  
  // Si on est en train de charger, afficher l'écran de chargement
  const showLoadingScreen = loadingActivities || (!hasActivities && category && !tinderResults);

  if (showLoadingScreen) {
    return (
      <div className="bg-[#f4f9fd] w-full relative overflow-hidden flex flex-col items-center" style={{ height: '100dvh' }}>
        <div className="w-full max-w-[500px] h-full relative">
          {/* Carte interactive en background - espace disponible réel */}
          <div className="absolute top-0 left-0 w-full rounded-[0px_0px_20px_20px] overflow-hidden z-[1]" style={{ height: '80%' }}>
            <InteractiveMap 
              pois={displayedPois} 
              showHotelPin={true}
              mapTheme={MAP_THEME}
            />
          </div>

          {/* Logo de l'hôtel - centré en haut */}
          <div 
            className="absolute top-[30px] left-0 right-0 mx-auto w-[25%] max-w-[100px] z-[2]"
            style={mapLogoContainerStyle}
          >
            {logoUrl && (
              <div className="w-full h-full [&_svg]:w-full [&_svg]:h-full [&_path]:fill-current [&_circle]:fill-current [&_rect]:fill-current [&_polygon]:fill-current">
                <LogoDisplay 
                  logoData={logoUrl} 
                  className="w-full h-full object-contain" 
                  style={mapLogoImageStyle}
                  alt={hotelName} 
                />
              </div>
            )}
          </div>

          {/* Dégradé vers le bas */}
          <div 
            className="absolute w-full h-[138px] z-[3] rounded-[0px_0px_20px_20px]"
            style={{
              top: 'calc(80% - 138px)',
              background: mapGradient
            }}
          />

          {/* Titre centré - juste sous le logo */}
          <h1 
            className="absolute left-0 right-0 mx-auto w-[90%] max-w-[320px] z-[4] text-[25px] text-center tracking-[-0.17px] leading-7"
            style={{ 
              top: '95px', // Logo à 30px + hauteur logo 46px + espace 19px = 95px
              fontFamily: 'Abril Fatface', 
              fontWeight: 400,
              color: mapTextColor
            }}
          >
            {getHeaderTitle()}
          </h1>

          {/* Message de chargement - style moderne */}
          <div 
            className="absolute left-0 right-0 mx-auto w-[90%] max-w-[375px] h-[180px] bg-[#f4f9fd] rounded-xl shadow-md z-[10] flex flex-col items-center justify-center"
            style={{
              bottom: 'max(3rem, calc(3rem + env(safe-area-inset-bottom, 0px)))',
              border: '0.5px solid',
              borderColor: primaryColor || '#690217'
            }}
          >
            <div className="text-center px-6">
              <div 
                className="text-lg mb-6"
                style={{ 
                  color: primaryColor || '#690217',
                  fontWeight: 600
                }}
              >
                {t('loading.personalizedActivities')}
              </div>
              <div className="flex space-x-2 justify-center">
                <div 
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: primaryColor || '#690217' }}
                ></div>
                <div 
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ 
                    backgroundColor: primaryColor || '#690217',
                    animationDelay: '0.1s' 
                  }}
                ></div>
                <div 
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ 
                    backgroundColor: primaryColor || '#690217',
                    animationDelay: '0.2s' 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f9fd] w-full relative overflow-hidden flex flex-col items-center" style={{ height: '100dvh' }}>
      {/* Container centré avec max-width pour éviter les débordements */}
      <div className="w-full max-w-[500px] h-full relative">
        {/* Carte interactive en background - espace disponible réel */}
        <div className="absolute top-0 left-0 w-full rounded-[0px_0px_20px_20px] overflow-hidden z-[1]" style={{ height: '80%' }}>
          <InteractiveMap 
            pois={displayedPois} 
            onPoiClick={handleMapPoiClick}
            showHotelPin={!selectedThemeId} // Cacher le pin de l'hôtel si un thème est sélectionné
            mapTheme={MAP_THEME}
          />
        </div>

        {/* Logo de l'hôtel - centré en haut avec animation */}
        <div 
          className="absolute top-[30px] left-0 right-0 mx-auto w-[25%] max-w-[100px] z-[2] pointer-events-none"
          style={{
            animation: 'fadeIn 0.6s ease-out forwards',
            opacity: 0,
            animationDelay: '0.2s',
            ...mapLogoContainerStyle
          }}
        >
          {logoUrl && (
            <div className="w-full h-full [&_svg]:w-full [&_svg]:h-full [&_path]:fill-current [&_circle]:fill-current [&_rect]:fill-current [&_polygon]:fill-current">
              <LogoDisplay 
                logoData={logoUrl} 
                className="w-full h-full object-contain" 
                style={mapLogoImageStyle}
                alt={hotelName} 
              />
            </div>
          )}
        </div>

        {/* Dégradé vers le bas - adapté à la hauteur de la carte */}
        <div 
          className="absolute w-full h-[138px] z-[3] rounded-[0px_0px_20px_20px] pointer-events-none"
          style={{
            top: 'calc(80% - 138px)',
            background: mapGradient
          }}
        />

        {/* Titre centré avec animation - juste sous le logo, caché si une activité est sélectionnée */}
        {!activeCardId && (
          <h1 
            className="absolute left-0 right-0 mx-auto w-[90%] max-w-[320px] z-[4] text-[25px] text-center tracking-[-0.17px] leading-7 pointer-events-none"
            style={{ 
              top: '95px', // Logo à 30px + hauteur logo 46px + espace 19px = 95px
              fontFamily: "'Abril Fatface', serif",
              fontWeight: 400,
              animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              opacity: 0,
              animationDelay: '0.3s',
              color: mapTextColor
            }}
          >
            {getHeaderTitle()}
          </h1>
        )}

        {/* Bouton retour */}
        <div className="absolute top-[20px] left-[23px] z-[7]">
          <BackButton onClick={() => navigate('/home')} isOnMap={true} />
        </div>

        {/* Indicateur de loading */}
        {loadingPOIs && (
          <div className="absolute top-[300px] left-0 right-0 mx-auto w-fit z-[10] bg-white/90 backdrop-blur-sm rounded-lg px-6 py-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: primaryColor || '#690217', borderTopColor: 'transparent' }} />
              <span className="text-sm font-medium">Chargement des POIs...</span>
            </div>
          </div>
        )}

        {/* Container des options - hauteur max 180px (2 cartes), expandable */}
        <div 
          className="absolute left-0 right-0 mx-auto w-[90%] max-w-[375px] z-[10] bg-[#f4f9fd] rounded-2xl shadow-[0px_5.23px_15.69px_#14132a24] overflow-hidden"
          style={{ 
            bottom: 'max(3rem, calc(3rem + env(safe-area-inset-bottom, 0px)))',
            animation: 'slideInFromBottom 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            opacity: 0,
            animationDelay: '0.5s'
          }}
        >
          {/* Liste des activités - container avec hauteur fixe pour chaque carte */}
          <div 
            className="flex flex-col gap-4 p-4 overflow-hidden"
            style={{ 
              maxHeight: isExpanded ? `${activities.length * 67}px` : '150px', // 51px carte + 16px gap
              transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none'  // IE/Edge
            }}
          >
          {(() => {
            // Afficher toutes les activités dans le DOM, masquer visuellement celles qui dépassent
            return activities.map((activity, index) => (
          <button
            key={activity.id || index}
            onClick={() => handleCardClick(activity.id)}
            className="relative w-full h-[51px] bg-[#f4f9fd] rounded-xl cursor-pointer flex items-center overflow-hidden flex-shrink-0"
            style={{
              border: '0.5px solid',
              borderColor: primaryColor || '#690217',
              boxShadow: `0px 0px 7px ${primaryColor || '#690217'}26`,
              transition: 'opacity 0.3s ease-out',
              opacity: !isExpanded && index >= 2 ? 0 : 1,
              pointerEvents: !isExpanded && index >= 2 ? 'none' : 'auto'
            }}
            aria-label={`Select ${activity.title}`}
          >
            {/* Image à gauche */}
            {activity.imageSrc && (
              <img
                className="w-[19.48%] h-full object-cover flex-shrink-0"
                alt=""
                src={activity.imageSrc}
              />
            )}

            {/* Titre - flex-grow pour prendre l'espace restant, multi-ligne si nécessaire */}
            <div className="flex-grow ml-[12px] flex items-center pr-2">
              <div className="font-semibold text-black text-[15px] tracking-[-0.30px] leading-tight line-clamp-2 text-left">
                {activity.title}
              </div>
            </div>

            {/* Bouton flèche "Explorer" pleine hauteur quand la card est active */}
            {activeCardId === activity.id && (
              <div
                className="h-full w-[50px] flex items-center justify-center cursor-pointer flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation(); // Empêcher la propagation au bouton parent
                  navigate(`/activite/${activity.id}`, {
                    state: { category }
                  });
                }}
                style={{ 
                  backgroundColor: primaryColor || '#690217',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg
                  className="w-[16px] h-[16px]"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 3L11 8L6 13"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </button>
        ));
          })()}
          </div>

          {/* Bouton "Voir plus/moins" - espace respirant uniquement quand ouvert */}
          {activities.length > 2 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`w-full py-2 text-center text-[13px] font-medium tracking-[-0.17px] border-t ${isExpanded ? 'mt-3' : ''}`}
              style={{ 
                color: primaryColor || '#690217',
                borderColor: `${primaryColor || '#690217'}20`,
                transition: 'all 0.2s ease'
              }}
            >
              {isExpanded ? t('common.seeLess') : t('common.seeMore')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
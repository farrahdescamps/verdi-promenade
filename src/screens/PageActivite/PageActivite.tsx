import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { VideoPlayer } from '../../components/VideoPlayer';
import { fetchActivityDetails, ActivityDetails, ActivityPOI } from '../../services/activityService';
import { fetchSlideshowDetails, SlideshowData } from '../../services/activityService';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../locales';
import { useSession } from '../../contexts/SessionContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LogoDisplay } from '../../utils/logoUtils';
import { PodcastView } from './PodcastView';
import { SlideshowView } from './SlideshowView';
import { MiniGuideView } from './MiniGuideView';
import { ReviewsView } from './ReviewsView';
import { DevelopmentModal } from '../../components/DevelopmentModal';
import { BackButton } from '../../components/BackButton';
import { fetchMiniGuide, MiniGuidePart } from '../../services/miniGuideService';
import { 
  HeadphonesIcon, 
  PlayIcon, 
  CompassIcon,
  ParlerIcon,
  BookOpenIcon
} from '../../components/icons';

const PageActivite: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();
  const { sessionData } = useSession();
  const { primaryColor, secondaryColor, logoUrl, hotelName } = useTheme();
  
  // Récupérer la catégorie depuis le state de navigation (passée depuis PageMonAventure)
  const categoryFromLocation = (location.state as { category?: string })?.category;
  
  // Détecter si c'est une catégorie d'hôtel
  const isHotelCategory = (location.state as any)?.isHotelCategory || activityId?.startsWith('hotel_');
  const hotelCategoryKey = (location.state as any)?.categoryKey || activityId?.replace('hotel_', '');
  const hotelCategoryTitle = (location.state as any)?.categoryTitle;
  const hotelStayData = (location.state as any)?.stayData;
  
  // Stocker la catégorie pour éviter de la perdre lors des navigations internes
  const [storedCategory, setStoredCategory] = useState<string | null>(() => {
    // Initialiser depuis sessionStorage si disponible
    return sessionStorage.getItem('currentCategory');
  });

  // Sauvegarder la catégorie dès qu'on l'obtient (dans state ET sessionStorage)
  useEffect(() => {
    if (categoryFromLocation) {
      setStoredCategory(categoryFromLocation);
      sessionStorage.setItem('currentCategory', categoryFromLocation);
    }
  }, [categoryFromLocation]);

  // Utiliser la catégorie stockée si disponible, sinon celle du location
  const categoryFromState = storedCategory || categoryFromLocation;

  // États principaux
  const [activityDetails, setActivityDetails] = useState<ActivityDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // États slideshow global
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const [slideshowDetails, setSlideshowDetails] = useState<SlideshowData | null>(null);
  const [currentSlideshowPoiIndex, setCurrentSlideshowPoiIndex] = useState(0);

  // États podcast
  const [isPodcastPoiActive, setIsPodcastPoiActive] = useState(false);
  const [podcastPoiDetails, setPodcastPoiDetails] = useState<{
    poi_id: string;
    poi_name: string;
    poi_description: string;
  } | null>(null);

  // État modal développement
  const [isDevelopmentModalOpen, setIsDevelopmentModalOpen] = useState(false);

  // États mini-guide
  const [isMiniGuideActive, setIsMiniGuideActive] = useState(false);
  const [miniGuidePoiDetails, setMiniGuidePoiDetails] = useState<{
    poi_id: string;
    poi_name: string;
    poi_description: string;
    poi_key: string;
  } | null>(null);

  // États reviews
  const [isReviewsActive, setIsReviewsActive] = useState(false);
  const [reviewsPoiDetails, setReviewsPoiDetails] = useState<{
    poi_id: string;
    poi_name: string;
  } | null>(null);

  // États pour le swipe
  const [hasManualSwipe, setHasManualSwipe] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  
  // Ref pour l'élément swipable
  const swipeAreaRef = useRef<HTMLDivElement>(null);
  

  // Charger les détails de l'activité
  useEffect(() => {
    if (!activityId) return;

    const loadActivityDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Si c'est une catégorie d'hôtel, construire les données depuis hotelStayData
        if (isHotelCategory && hotelStayData && hotelCategoryKey) {
          const categoryItems = hotelStayData.details[hotelCategoryKey];
          
          // Convertir les items en POIs
          const pois: ActivityPOI[] = Object.entries(categoryItems)
            .filter(([_, item]: [string, any]) => item.description && item.description.trim() !== '')
            .map(([itemKey, item]: [string, any]) => ({
              poi_id: `hotel_poi_${hotelCategoryKey}_${itemKey}`,
              title: itemKey.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              description: item.description,
              duration: '',
              duration_minutes: 0,
              latitude: 0,
              longitude: 0,
              place_type: 'hotel_service',
              tags: [],
              video_url: item.video && item.video.trim() !== '' ? item.video : '', // Vidéo si disponible
              photo_url: item.photo && item.photo.trim() !== '' ? item.photo : '', // Photo si disponible
              tinder: null,
              actions: {
                custom_buttons: item.actions || [],
                podcast: { is_available: false },
                slideshow: { is_available: !!(item.photo || item.video), photos: (item.photo || item.video) ? [{ url: item.photo || item.video, caption: '' }] : [] },
                map: { is_available: false },
                miniguide: { is_available: true, poi_key: itemKey } // Mini-guide toujours disponible pour les POIs d'hotel
              }
            }));
          
          // Récupérer la première vidéo/photo disponible pour le slider principal
          const firstMedia = pois.find(poi => poi.video_url || poi.photo_url);
          const firstPhotoUrl = firstMedia?.photo_url || '';
          const firstVideoUrl = firstMedia?.video_url || '';
          
          // Construire l'objet ActivityDetails
          const hotelActivityDetails: ActivityDetails = {
            theme_id: activityId!,
            type: 'hotel',
            type_label: hotelCategoryTitle || hotelCategoryKey || '',
            title: hotelCategoryTitle || hotelCategoryKey || '',
            description: '', // Pas de description pour les catégories d'hôtel
            duration: '',
            duration_minutes: 0,
            color: primaryColor || '#690217',
            secondary_color: secondaryColor || '#4b5563',
            photo_url: firstPhotoUrl, // Première photo trouvée
            video_url: firstVideoUrl, // Première vidéo trouvée
            tags: [],
            pois: pois,
            language: currentLanguage
          };
          
          setActivityDetails(hotelActivityDetails);
        } else {
          // Cas normal : charger depuis l'API
          const details = await fetchActivityDetails(activityId, currentLanguage);
          setActivityDetails(details);
        }
        
        // Gérer le scroll vers un POI spécifique si fourni dans l'état de navigation
        const locationState = location.state as { 
          scrollToPoiId?: string; 
          poiName?: string; 
          poiVideoUrl?: string;
          poiIndex?: number;
        } | null;
        
        if (locationState?.scrollToPoiId) {

          // Si un index de POI est fourni, définir la slide correspondante
          if (typeof locationState.poiIndex === 'number' && locationState.poiIndex >= 0) {

            setCurrentSlideIndex(locationState.poiIndex);
          }
          
          // Délai pour s'assurer que le DOM est rendu
          setTimeout(() => {
            scrollToPoi(locationState.scrollToPoiId!);
          }, 1000);
        }
        
        // Vérifier si on doit ouvrir la vue podcast automatiquement
        const shouldOpenPodcast = sessionStorage.getItem('podcast_open_view') === 'true';
        const podcastPoiId = sessionStorage.getItem('podcast_poi_id');
        const generatedPodcastData = sessionStorage.getItem('podcast_generated_data');
        const isPodcastGenerating = sessionStorage.getItem('podcast_generating') === 'true';
        

        if (shouldOpenPodcast && podcastPoiId) {
          const poi = details.pois.find(p => p.poi_id === podcastPoiId);

          if (poi) {

            setIsPodcastPoiActive(true);
            setPodcastPoiDetails({
              poi_id: poi.poi_id,
              poi_name: poi.title,
              poi_description: poi.description
            });
            
            // Si le podcast est en cours de génération, marquer l'état de génération
            if (isPodcastGenerating) {

              sessionStorage.setItem(`podcast_generating_${poi.poi_id}`, 'true');
            }
            
            // Si on a des données de podcast générées, les utiliser
            if (generatedPodcastData) {
              try {
                const podcastData = JSON.parse(generatedPodcastData);

              } catch (error) {

              }
            }
            
            // Clean up sessionStorage after use
            sessionStorage.removeItem('podcast_open_view');
            sessionStorage.removeItem('podcast_poi_id');
            sessionStorage.removeItem('podcast_generated_data');
            sessionStorage.removeItem('podcast_generating');
          }
          
          // Nettoyer l'état de navigation pour éviter des déclenchements multiples
          window.history.replaceState({}, document.title);
        }
      } catch (err) {

        setError(err instanceof Error ? err.message : t('error.activityLoad'));
      } finally {
        setLoading(false);
      }
    };

    loadActivityDetails();
  }, [activityId, currentLanguage, location.state, isHotelCategory, hotelStayData, hotelCategoryKey, hotelCategoryTitle, primaryColor, secondaryColor]);

  // Auto-play du slideshow global
  useEffect(() => {
    if (!activityDetails || activityDetails.pois.length <= 1 || isSlideshowActive || isPodcastPoiActive || hasManualSwipe) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % activityDetails.pois.length;
      setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 300);
        return nextIndex;
      });
    }, 8000); // 8 secondes

    return () => clearInterval(interval);
  }, [activityDetails, isSlideshowActive, isPodcastPoiActive, hasManualSwipe]);

  // Réinitialiser l'autoplay après un délai après un swipe manuel
  useEffect(() => {
    if (hasManualSwipe) {
      const timer = setTimeout(() => {
        setHasManualSwipe(false);
      }, 10000); // 10 secondes avant de reprendre l'autoplay

      return () => clearTimeout(timer);
    }
  }, [hasManualSwipe]);

  // Gérer les transitions d'état pour éviter les décalages
  useEffect(() => {
    // Forcer un re-render quand les états de vue changent
    if (isSlideshowActive || isPodcastPoiActive) {
      // Délai pour s'assurer que la transition CSS est terminée
      const timer = setTimeout(() => {
        // Force un re-render en modifiant légèrement l'état
        setIsTransitioning(false);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isSlideshowActive, isPodcastPoiActive]);

  // Navigation entre les slides du slideshow global
  const goToSlide = useCallback((index: number, isManual = false) => {
    if (isTransitioning || !activityDetails?.pois) return;
    
      setIsTransitioning(true);
      setCurrentSlideIndex(index);
      
      // Forcer la vidéo à se remettre à 0 en changeant la key
      setVideoKey(prev => prev + 1);
      
    if (isManual) {
      setHasManualSwipe(true);
    }
    
      setTimeout(() => {
        setIsTransitioning(false);
    }, 300);
  }, [isTransitioning, activityDetails?.pois]);

  // Navigation précédente
  const goToPreviousSlide = useCallback(() => {
    if (!activityDetails?.pois || isTransitioning) return;
    const newIndex = currentSlideIndex > 0 ? currentSlideIndex - 1 : activityDetails.pois.length - 1;
    goToSlide(newIndex);
  }, [currentSlideIndex, activityDetails?.pois, isTransitioning, goToSlide]);

  // Navigation suivante
  const goToNextSlide = useCallback(() => {
    if (!activityDetails?.pois || isTransitioning) return;
    const newIndex = currentSlideIndex < activityDetails.pois.length - 1 ? currentSlideIndex + 1 : 0;
    goToSlide(newIndex, true);
  }, [currentSlideIndex, activityDetails?.pois, isTransitioning, goToSlide]);

  // Gestion du swipe avec event listeners natifs (pour éviter le problème passive)
  useEffect(() => {
    const swipeArea = swipeAreaRef.current;
    if (!swipeArea || !activityDetails?.pois || activityDetails.pois.length <= 1) return;

    let startX = 0;
    let startY = 0;
    let isHorizontalSwipe = false;
    let isVerticalScroll = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isHorizontalSwipe = false;
      isVerticalScroll = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      
      const deltaX = Math.abs(currentX - startX);
      const deltaY = Math.abs(currentY - startY);
      
      // Attendre un mouvement suffisant pour décider (10px)
      if (deltaX < 10 && deltaY < 10) return;
      
      // Si déjà décidé que c'est un scroll vertical, laisser passer
      if (isVerticalScroll) return;
      
      // Si déjà décidé que c'est horizontal, continuer à bloquer le scroll
      if (isHorizontalSwipe) {
        e.preventDefault();
        return;
      }
      
      // Décider maintenant : horizontal si deltaX est clairement supérieur
      if (deltaX > deltaY) {
        isHorizontalSwipe = true;
        e.preventDefault();
      } else {
        // C'est un scroll vertical, ne plus interférer
        isVerticalScroll = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Ne traiter que si c'était un swipe horizontal intentionnel
      if (!isHorizontalSwipe) {
        return;
      }

      const endX = e.changedTouches[0].clientX;
      const deltaX = endX - startX;
      
      // Swipe horizontal avec distance suffisante
      if (Math.abs(deltaX) > 50) {
        // Marquer comme swipe manuel pour stopper l'auto-rotation
        setHasManualSwipe(true);
        
        if (deltaX > 0) {
          // Swipe vers la droite → slide suivant
          goToNextSlide();
        } else {
          // Swipe vers la gauche → slide précédent
          goToPreviousSlide();
        }
      }
    };

    // Attacher les event listeners avec { passive: false } sur touchmove uniquement
    swipeArea.addEventListener('touchstart', handleTouchStart, { passive: true });
    swipeArea.addEventListener('touchmove', handleTouchMove, { passive: false });
    swipeArea.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      swipeArea.removeEventListener('touchstart', handleTouchStart);
      swipeArea.removeEventListener('touchmove', handleTouchMove);
      swipeArea.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activityDetails?.pois, goToPreviousSlide, goToNextSlide, setHasManualSwipe]);

  // Gestion du slideshow spécifique (depuis un POI)
  const handleSlideshowClick = useCallback(async (poiId: string, skipSlideIndexUpdate = false) => {
    if (!activityId) return;

    try {

      // Trouver l'index du POI et le définir comme slide actuel SEULEMENT si pas de bascule de format
      if (!skipSlideIndexUpdate) {
        let poiIndex = -1;
        if (activityDetails?.pois) {
          poiIndex = activityDetails.pois.findIndex(p => p.poi_id === poiId);
          if (poiIndex !== -1) {
            setCurrentSlideIndex(poiIndex);
          }
        }
      }
      
      // Utiliser activityId comme themeId pour l'appel API
      const slideshowData = await fetchSlideshowDetails(activityId, poiId, currentLanguage);
      setSlideshowDetails(slideshowData);
      setCurrentSlideshowPoiIndex(0); // Toujours commencer à 0 pour le slideshow
      setIsSlideshowActive(true);

    } catch (error) {

    }
  }, [activityId, currentLanguage, activityDetails?.pois]);

  // Fermer le slideshow
  const handleSlideshowClose = useCallback(() => {
    // Trouver l'index du POI dans l'activité et le définir comme slide actuel
    if (slideshowDetails?.poi_id && activityDetails?.pois) {
      const poiIndex = activityDetails.pois.findIndex(p => p.poi_id === slideshowDetails.poi_id);
      if (poiIndex !== -1) {
        setCurrentSlideIndex(poiIndex);

      }
    }
    
    setIsSlideshowActive(false);
    setSlideshowDetails(null);
  }, [slideshowDetails?.poi_id, activityDetails?.pois]);


  // Gestion du podcast
  const handlePodcastClick = useCallback((poiId: string, skipSlideIndexUpdate = false) => {

    if (!activityDetails?.pois) {

      return;
    }
    
    const poi = activityDetails.pois.find(p => p.poi_id === poiId);
    if (!poi) {

      return;
    }
    
    // Trouver l'index du POI et le définir comme slide actuel SEULEMENT si pas de bascule de format
    if (!skipSlideIndexUpdate) {
      const poiIndex = activityDetails.pois.findIndex(p => p.poi_id === poiId);
      if (poiIndex !== -1) {

        setCurrentSlideIndex(poiIndex);
      }
    }
    

    setIsPodcastPoiActive(true);
    setPodcastPoiDetails({
      poi_id: poi.poi_id,
      poi_name: poi.title,
      poi_description: poi.description
    });
  }, [activityDetails?.pois]);

  // Fermer la vue podcast
  const handleClosePodcastView = useCallback(() => {
    setIsPodcastPoiActive(false);
    setPodcastPoiDetails(null);
  }, []);

  // Gérer le clic sur "J'ai une question"
  const handleHaveQuestionClick = useCallback(() => {
    // Navigation vers le module de chat
    navigate('/chat');
  }, [navigate]);

  // Fermer le modal de développement
  const handleCloseDevelopmentModal = useCallback(() => {
    setIsDevelopmentModalOpen(false);
  }, []);

  // Gérer le clic sur le bouton "Informations" (Mini-Guide)
  const handleMiniGuideClick = useCallback((poiId: string, poiKey: string) => {
    if (!activityDetails?.pois) return;
    
    const poi = activityDetails.pois.find(p => p.poi_id === poiId);
    if (!poi) return;
    
    console.log('%c📖 OUVERTURE MINI-GUIDE', 'background: #3b82f6; color: white; font-weight: bold; padding: 4px 8px;', {
      poiId,
      poiKey
    });
    
    // Activer immédiatement le format mini-guide (comme le podcast)
    setIsMiniGuideActive(true);
    setMiniGuidePoiDetails({
      poi_id: poiId,
      poi_name: poi.title,
      poi_description: poi.description,
      poi_key: poiKey // Stocker aussi le poi_key pour le MiniGuideView
    });
  }, [activityDetails?.pois]);

  const handleCloseMiniGuide = useCallback(() => {
    setIsMiniGuideActive(false);
    setMiniGuidePoiDetails(null);
  }, []);

  // Gérer le clic sur le bouton "Avis" (Reviews)
  const handleReviewsClick = useCallback((poiId: string) => {
    if (!activityDetails?.pois) return;
    
    const poi = activityDetails.pois.find(p => p.poi_id === poiId);
    if (!poi) return;
    
    console.log('%c⭐ OUVERTURE AVIS', 'background: #f59e0b; color: white; font-weight: bold; padding: 4px 8px;', {
      poiId,
      poiName: poi.title
    });
    
    setIsReviewsActive(true);
    setReviewsPoiDetails({
      poi_id: poiId,
      poi_name: poi.title
    });
  }, [activityDetails?.pois]);

  const handleCloseReviews = useCallback(() => {
    setIsReviewsActive(false);
    setReviewsPoiDetails(null);
  }, []);

  // Vérifier si les coordonnées sont valides (pas 0,0)
  const hasValidCoordinates = useCallback((poi: ActivityPOI): boolean => {
    return poi.latitude !== 0 && poi.longitude !== 0;
  }, []);

  // Ouvrir Google Maps avec les coordonnées du POI
  const handleMapClick = useCallback((poi: ActivityPOI) => {
    if (!hasValidCoordinates(poi)) return;
    
    const { latitude, longitude, title } = poi;
    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    window.open(googleMapsUrl, '_blank');
  }, [hasValidCoordinates]);

  // Gestion des erreurs
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  // Fonction pour scroller vers un POI spécifique
  const scrollToPoi = useCallback((poiId: string) => {

    // Trouver l'élément POI dans le DOM
    const poiElement = document.querySelector(`[data-poi-id="${poiId}"]`);

    if (poiElement) {
      // Approche simple : scrollIntoView avec un petit délai

      // Petit délai pour s'assurer que le DOM est stable
      setTimeout(() => {
        poiElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center', // Centrer au lieu de 'start'
          inline: 'nearest'
        });
        

      }, 50);
      
        } else {

    }
  }, []);


  // Fonction pour obtenir l'icône d'un tag
  const getTagIcon = (svgIcon: string) => {
    return (
      <div 
        className="w-2 h-2 flex-shrink-0 flex items-center justify-center" 
        dangerouslySetInnerHTML={{ 
          __html: svgIcon
            .replace(/fill="[^"]*"/g, `fill="white"`)
            .replace(/stroke="[^"]*"/g, `stroke="white"`)
            .replace(/<path/g, '<path fill="white"')
            .replace(/<circle/g, '<circle fill="white"')
            .replace(/<polyline/g, '<polyline fill="white"')
            .replace(/width="[^"]*"/g, `width="10"`)
            .replace(/height="[^"]*"/g, `height="10"`)
            .replace(/<svg/g, '<svg width="10" height="10"')
        }}
      />
    );
  };

  // Obtenir les tags du POI actuel
  const getCurrentPoiTags = () => {
    if (!activityDetails || !activityDetails.pois[currentSlideIndex]) return [];
    return activityDetails.pois[currentSlideIndex].tags
      .filter(tag => tag && tag.label && typeof tag.label === 'string' && tag.label.trim() !== '')
      .slice(0, 2)
      .map(tag => ({
        icon: getTagIcon(tag.svg_icon),
        label: tag.label
      }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading.activity')}</p>
        </div>
      </div>
    );
  }

  if (error || !activityDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
              <div className="text-red-600 text-lg mb-2">{t('error.general')}</div>
              <div className="text-gray-600 text-sm mb-4">{error || 'Activité non trouvée'}</div>
          <Button onClick={() => navigate('/journey')} className="bg-blue-600 text-white">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  // Le slideshow est maintenant intégré dans la vue principale avec animation

  // Vue normale de l'activité avec slideshow global
  return (
    <div 
      data-scroll-zone="root-scrollable"
      className="w-full h-screen overflow-y-auto bg-gray-50">
      {/* Header fixe avec slideshow global */}
        <div className={`fixed left-0 right-0 rounded-b-[20px] overflow-hidden`}
        style={{ 
          top: 'var(--sat)',
          backgroundColor: 'var(--color-primary)', 
          transition: 'height 500ms ease-in-out',
          height: isPodcastPoiActive 
            ? '60vh' 
            : isSlideshowActive 
              ? '60vh' 
              : isMiniGuideActive 
                ? '75vh' 
                : '280px',
          zIndex: 100 // Header TOUJOURS au-dessus du contenu (était z-10, augmenté pour clarté)
        }}>
          <div className="relative w-full h-full" style={{ backgroundColor: 'var(--color-primary)' }}>
          
          {/* Slideshow POI (quand isSlideshowActive est true) */}
          {isSlideshowActive && slideshowDetails ? (
            <SlideshowView
              activityId={activityId!}
              poiId={slideshowDetails.poi_id}
              currentLanguage={currentLanguage}
              activityColor={primaryColor || "#690217"}
              onClose={handleSlideshowClose}
              onError={handleError}
              onSlideChange={setCurrentSlideshowPoiIndex}
              poiVideoUrl={activityDetails.pois.find(poi => poi.poi_id === slideshowDetails.poi_id)?.video_url}
              poiDescription={activityDetails.pois.find(poi => poi.poi_id === slideshowDetails.poi_id)?.description}
              initialSlideIndex={currentSlideshowPoiIndex}
            />
          ) : isPodcastPoiActive && podcastPoiDetails ? (
            /* Podcast POI (quand isPodcastPoiActive est true) */
            (() => {

              return (
                <PodcastView
                  poiId={podcastPoiDetails.poi_id}
                  activityColor={primaryColor || "#690217"}
                  poiVideoUrl={activityDetails.pois.find(poi => poi.poi_id === podcastPoiDetails.poi_id)?.video_url}
                  activityId={activityId || ''}
                />
              );
            })()
          ) : isMiniGuideActive && miniGuidePoiDetails ? (
            /* Mini-Guide POI (quand isMiniGuideActive est true) */
            <MiniGuideView
              poiKey={miniGuidePoiDetails.poi_key}
              poiVideoUrl={activityDetails.pois.find(poi => poi.poi_id === miniGuidePoiDetails.poi_id)?.video_url}
              activityColor={primaryColor || "#690217"}
              onClose={handleCloseMiniGuide}
            />
          ) : (
            /* Slideshow global des POIs (vue normale) */
            activityDetails.pois && activityDetails.pois.length > 0 ? (
            <>
              {/* Vidéo du POI actuel (ou photo en fallback) */}
              <div
                ref={swipeAreaRef}
                className="w-full h-full relative"
              >
                {(() => {
              const currentPoi = activityDetails.pois[currentSlideIndex];
              const hasPoiVideo = currentPoi && currentPoi.video_url && currentPoi.video_url.trim() !== '';
              const photoUrl = currentPoi?.photo_url || activityDetails.photo_url;
              
              return hasPoiVideo ? (
                <VideoPlayer
                    src={currentPoi.video_url!}
                    className={`w-full h-full object-cover transition-all duration-700 ease-out ${
                      isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                    }`}
                    key={`activity-video-${activityDetails.activity_id}-${videoKey}-${currentPoi.poi_id}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                  poster={photoUrl}
                />
              ) : (
              <div 
                className={`w-full h-full bg-cover bg-center transition-all duration-700 ease-out ${
                  isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                }`}
                style={{ backgroundImage: `url(${photoUrl})` }}
                key={`activity-photo-${activityDetails.activity_id}-${currentPoi?.poi_id}`}
                  />
              );
                })()}
              </div>
              

            {/* Bullets de navigation - masqués en mode podcast et mini-guide */}
            {activityDetails.pois.length > 1 && !isPodcastPoiActive && !isMiniGuideActive && (
              <div className="absolute flex items-center justify-center gap-1 h-1.5 bottom-4 left-0 right-0 opacity-[0.93] z-50">
                  {activityDetails.pois.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index, true)}
                      className={`h-1.5 rounded-[7px] bg-white transition-all duration-200 hover:opacity-100 ${
                        index === currentSlideIndex 
                          ? 'w-[25px] opacity-100' 
                          : 'w-1.5 opacity-70'
                      }`}
                    />
                  ))}
              </div>
              )}
            </>
          ) : (
            /* Vidéo de fond si pas de POIs */
                    <VideoPlayer
              src={activityDetails.video_url}
                      className="w-full h-full object-cover"
              autoPlay
              muted
              loop
            />
          )
          )}
          
          {/* Overlay sombre */}
          <div className="absolute inset-0 bg-black/20" style={{ pointerEvents: 'none' }}></div>
          
          {/* Logo en haut de l'en-tête */}
          {logoUrl && (
            <div className="absolute top-[60px] left-0 right-0 z-[150] flex justify-center">
              <div className="w-12 h-12">
                <LogoDisplay 
                  logoData={logoUrl} 
                  className="w-full h-full object-contain" 
                  style={{ filter: 'brightness(0) invert(1)' }}
                  alt={hotelName} 
                />
              </div>
            </div>
          )}
          
          {/* Titre du POI actuel - cliquable pour scroller, centré et au-dessus du dégradé */}
          {!isSlideshowActive && (
            /* Titre du slideshow global - masqué en mode podcast, slideshow POI et mini-guide */
            activityDetails.pois[currentSlideIndex] && !isPodcastPoiActive && !isMiniGuideActive && (
              <div 
                className={`absolute top-[200px] left-0 right-0 z-[25] transition-all duration-700 ease-out ${
                isTransitioning ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
                } cursor-pointer`}
                onClick={() => scrollToPoi(activityDetails.pois[currentSlideIndex].poi_id)}
              >
                <h3 className="font-['Inter-SemiBold',Helvetica] font-semibold text-white text-base tracking-[-0.17px] leading-[normal] drop-shadow-lg text-center">
                  {activityDetails.pois[currentSlideIndex].title.toUpperCase()}
                </h3>
              </div>
            )
          )}
          
          {/* Dégradé rouge en bas du slider - z-[5] pour passer sous les titres */}
          <div 
            className="absolute left-0 right-0 bottom-0 h-[100px] z-[5] pointer-events-none"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${primaryColor || '#690217'} 100%)`
            }}
          ></div>

          {/* Boutons de format - dans le header, discrets (seulement en mode podcast ou slideshow) */}
          {(isPodcastPoiActive || isSlideshowActive) && (() => {
            const activePoi = isPodcastPoiActive 
              ? activityDetails.pois.find(p => p.poi_id === podcastPoiDetails?.poi_id)
              : activityDetails.pois.find(p => p.poi_id === slideshowDetails?.poi_id);
            
            if (!activePoi) return null;
            
            return (
              <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2 px-4">
                {/* Bouton Slideshow (affiché uniquement en mode podcast) - avec label */}
                {isPodcastPoiActive && activePoi.actions?.slideshow?.available && (
                  <button
                    onClick={() => {
                      handleClosePodcastView();
                      setTimeout(() => {
                        handleSlideshowClick(activePoi.poi_id, true);
                      }, 100);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 h-7 bg-white/40 backdrop-blur-sm rounded-[7px] border border-white/30 hover:bg-white/60 transition-all shadow-sm"
                  >
                    <span style={{ color: secondaryColor || '#4b5563' }}>
                      <PlayIcon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-medium text-white">{t('poi.slideshow')}</span>
                  </button>
                )}

                {/* Bouton Podcast (affiché uniquement en mode slideshow) - avec label */}
                {isSlideshowActive && activePoi.actions?.podcast?.available && (
                  <button
                    onClick={() => {
                      handleSlideshowClose();
                      setTimeout(() => {
                        handlePodcastClick(activePoi.poi_id, true);
                      }, 100);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 h-7 bg-white/40 backdrop-blur-sm rounded-[7px] border border-white/30 hover:bg-white/60 transition-all shadow-sm"
                  >
                    <span style={{ color: secondaryColor || '#4b5563' }}>
                      <HeadphonesIcon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-medium text-white">{t('poi.podcast')}</span>
                  </button>
                )}
              </div>
            );
          })()}
            
          {/* Tags du POI actuel */}
          {isSlideshowActive && slideshowDetails ? (
            /* Pas de tags pour le slideshow POI intégré */
            null
          ) : isPodcastPoiActive ? (
            /* Pas de tags pour le podcast */
            null
          ) : isMiniGuideActive ? (
            /* Pas de tags pour le mini-guide */
            null
          ) : (
            /* Tags du slideshow global */
              <div 
                className={`absolute flex gap-1 top-[220px] left-[29px] transition-all duration-700 ease-out ${
                  isTransitioning ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
                } z-25`}
              >
                {getCurrentPoiTags().map((tag, index) => (
                  <Badge
                    key={index}
                    className="h-[13px] px-[5px] py-0 text-white rounded-[7px] flex items-center gap-[3px] border-none"
                    style={{ backgroundColor: primaryColor || "#690217" }}
                  >
                    {tag.icon}
                    <span className="text-[9px] font-normal tracking-[-0.17px] [font-family:'Inter-Regular',Helvetica]">
                      {tag.label}
                    </span>
                  </Badge>
                ))}
              </div>
            )}

          {/* Bouton retour */}
          <div className="absolute top-[63px] left-[23px] z-[200]">
            <BackButton 
              onClick={isSlideshowActive ? handleSlideshowClose : isPodcastPoiActive ? handleClosePodcastView : isMiniGuideActive ? handleCloseMiniGuide : () => {
                // Récupérer la catégorie depuis location.state ou sessionStorage
                const currentCategory = categoryFromState || sessionStorage.getItem('currentCategory');
                
                console.log('%c🔙 RETOUR depuis activité', 'background: #f59e0b; color: white; font-weight: bold; padding: 4px 8px;', {
                  categoryFromState,
                  categoryFromLocation,
                  storedCategory,
                  sessionStorageCategory: sessionStorage.getItem('currentCategory'),
                  currentCategory,
                  isHotelCategory
                });
                
                // Si c'est une catégorie d'hôtel, retourner à /enjoy-stay
                if (isHotelCategory) {
                  navigate('/enjoy-stay');
                }
                // Si on a une catégorie Tinder, retourner à /journey avec les résultats Tinder
                else if (currentCategory) {
                  navigate('/journey', { state: { category: currentCategory } });
                } 
                // Sinon retour à /home
                else {
                  console.warn('⚠️ Pas de catégorie trouvée, retour à /home');
                  navigate('/home');
                }
              }}
            />
          </div>
          </div>
        </div>

      {/* Contenu principal - DOIT commencer EN DESSOUS du header */}
        <div 
          data-scroll-zone="content-wrapper"
          className="transition-all duration-500 ease-in-out w-full max-w-[375px] mx-auto"
        style={{ 
          // Padding pour que le contenu commence APRÈS le header fixe
          paddingTop: isPodcastPoiActive 
            ? 'calc(60vh + var(--sat))' 
            : isSlideshowActive 
              ? 'calc(60vh + var(--sat))' 
              : isMiniGuideActive 
                ? 'calc(75vh + var(--sat))' 
                : 'calc(280px + var(--sat))',
          paddingBottom: 'max(5rem, calc(5rem + var(--sab)))'
        }}>
          {/* Contenu blanc avec background opaque - z-index inférieur au header */}
          <div 
            data-scroll-zone="white-content"
            className="relative w-full" style={{ 
            paddingTop: '30px', 
            paddingLeft: '20px', 
            paddingRight: '20px', 
            paddingBottom: '20px',
            backgroundColor: '#f9fafb', // Fond opaque
            zIndex: 1 // EN DESSOUS du header (z-100)
          }}>
          {/* Contenu du podcast POI */}
          {isPodcastPoiActive && podcastPoiDetails ? (
            /* Contenu du podcast POI */
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <h2 className="font-['Playfair_Display-Bold',Helvetica] font-bold text-lg leading-[22px] tracking-[-0.17px] flex-1 pr-3"
                style={{ 
                  color: primaryColor || "#690217",
                  fontFamily: 'Playfair Display',
                  fontWeight: 700,
                  letterSpacing: '-0.165px'
                }}>
                  {podcastPoiDetails.poi_name.toUpperCase()}
                </h2>
              </div>
              
              {/* Description du POI */}
              <p className="text-sm text-[#00000099] font-['Inter-Regular',Helvetica] tracking-[-0.17px] mt-2">
                {podcastPoiDetails.poi_description}
              </p>
              
              {/* Boutons "J'ai une question" + Map */}
              {(() => {
                const activePoi = activityDetails.pois.find(p => p.poi_id === podcastPoiDetails.poi_id);
                
                return (
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {/* Bouton "J'ai une question" */}
                    <Button 
                      className="h-6 rounded-[7px] px-[5px] py-0 pr-3"
                      style={{ 
                        backgroundColor: primaryColor || "#690217",
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '500',
                        letterSpacing: '-0.17px'
                      }}
                      onClick={handleHaveQuestionClick}
                    >
                      <ParlerIcon className="w-3 h-3 mr-1" color="white" />
                      {t('talkWithOceane.haveQuestion')}
                    </Button>

                    {/* Bouton Map - seulement si coordonnées valides */}
                    {activePoi && hasValidCoordinates(activePoi) && (
                      <Button
                        onClick={() => handleMapClick(activePoi)}
                        className="flex items-center gap-1 px-3 py-1 h-6 bg-white rounded-[7px] border border-gray-200 hover:bg-gray-50"
                        style={{ 
                          boxShadow: `0px_2px_4px_${primaryColor || "#690217"}26`,
                          color: primaryColor || "#690217"
                        }}
                      >
                        <CompassIcon className="w-3 h-3" />
                        <span className="text-xs font-medium">{t('poi.map')}</span>
                      </Button>
                    )}
                  </div>
                );
              })()}
              
              {/* Custom buttons (boutons d'action) */}
              {(() => {
                const activePoi = activityDetails.pois.find(p => p.poi_id === podcastPoiDetails.poi_id);
                if (!activePoi || !activePoi.actions?.custom_buttons || activePoi.actions.custom_buttons.length === 0) return null;
                
                return (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {activePoi.actions.custom_buttons.map((customBtn, btnIndex) => (
                        <a
                          key={btnIndex}
                          href={customBtn.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            className="flex items-center justify-center gap-1 px-3 py-1 h-6 rounded-[7px] text-white font-medium transition-all hover:opacity-90"
                            style={{ 
                              backgroundColor: secondaryColor || "#4b5563"
                            }}
                          >
                            <span className="text-xs">{customBtn.label}</span>
                          </Button>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : isSlideshowActive && slideshowDetails ? (
            /* Header section pour le slideshow */
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <h2 className="font-['Playfair_Display-Bold',Helvetica] font-bold text-lg leading-[22px] tracking-[-0.17px] flex-1 pr-3"
                  style={{ 
                    color: primaryColor || "#690217",
                    fontFamily: 'Playfair Display',
                    fontWeight: 700,
                    letterSpacing: '-0.165px'
                  }}>
                  {slideshowDetails.poi_name?.toUpperCase() || 'SLIDESHOW'}
                </h2>
              </div>

              <p className="text-sm text-[#00000099] font-['Inter-Regular',Helvetica] tracking-[-0.17px] mt-2">
                {/* Afficher directement la caption de la photo actuelle (plus de vidéo générique) */}
                {slideshowDetails.slideshow?.photos?.[currentSlideshowPoiIndex]?.caption || ''}
              </p>

              {/* Boutons "J'ai une question" + Map */}
              {(() => {
                const activePoi = activityDetails.pois.find(p => p.poi_id === slideshowDetails.poi_id);
                
                return (
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {/* Bouton "J'ai une question" */}
                    <Button 
                      className="h-6 rounded-[7px] px-[5px] py-0 pr-3"
                      style={{ 
                        backgroundColor: primaryColor || "#690217",
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '500',
                        letterSpacing: '-0.17px'
                      }}
                      onClick={handleHaveQuestionClick}
                    >
                      <ParlerIcon className="w-3 h-3 mr-1" color="white" />
                      {t('talkWithOceane.haveQuestion')}
                    </Button>

                    {/* Bouton Map - seulement si coordonnées valides */}
                    {activePoi && hasValidCoordinates(activePoi) && (
                      <Button
                        onClick={() => handleMapClick(activePoi)}
                        className="flex items-center gap-1 px-3 py-1 h-6 bg-white rounded-[7px] border border-gray-200 hover:bg-gray-50"
                        style={{ 
                          boxShadow: `0px_2px_4px_${primaryColor || "#690217"}26`,
                          color: primaryColor || "#690217"
                        }}
                      >
                        <CompassIcon className="w-3 h-3" />
                        <span className="text-xs font-medium">{t('poi.map')}</span>
                      </Button>
                    )}
                  </div>
                );
              })()}
              
              {/* Custom buttons (boutons d'action) */}
              {(() => {
                const activePoi = activityDetails.pois.find(p => p.poi_id === slideshowDetails.poi_id);
                if (!activePoi || !activePoi.actions?.custom_buttons || activePoi.actions.custom_buttons.length === 0) return null;
                
                return (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {activePoi.actions.custom_buttons.map((customBtn, btnIndex) => (
                        <a
                          key={btnIndex}
                          href={customBtn.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            className="flex items-center justify-center gap-1 px-3 py-1 h-6 rounded-[7px] text-white font-medium transition-all hover:opacity-90"
                            style={{ 
                              backgroundColor: secondaryColor || "#4b5563"
                            }}
                          >
                            <span className="text-xs">{customBtn.label}</span>
                          </Button>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : isMiniGuideActive && miniGuidePoiDetails ? (
            /* Header section pour le mini-guide */
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <h2 className="font-['Playfair_Display-Bold',Helvetica] font-bold text-lg leading-[22px] tracking-[-0.17px] flex-1 pr-3"
                  style={{ 
                    color: primaryColor || "#690217",
                    fontFamily: 'Playfair Display',
                    fontWeight: 700,
                    letterSpacing: '-0.165px'
                  }}>
                  {miniGuidePoiDetails.poi_name?.toUpperCase() || 'MINI-GUIDE'}
                </h2>
              </div>

              {/* Boutons "J'ai une question" + Map */}
              {(() => {
                const activePoi = activityDetails.pois.find(p => p.poi_id === miniGuidePoiDetails.poi_id);
                
                return (
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {/* Bouton "J'ai une question" */}
                    <Button 
                      className="h-6 rounded-[7px] px-[5px] py-0 pr-3"
                      style={{ 
                        backgroundColor: primaryColor || "#690217",
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '500',
                        letterSpacing: '-0.17px'
                      }}
                      onClick={handleHaveQuestionClick}
                    >
                      <ParlerIcon className="w-3 h-3 mr-1" color="white" />
                      {t('talkWithOceane.haveQuestion')}
                    </Button>

                    {/* Bouton Map - seulement si coordonnées valides */}
                    {activePoi && hasValidCoordinates(activePoi) && (
                      <Button
                        onClick={() => handleMapClick(activePoi)}
                        className="flex items-center gap-1 px-3 py-1 h-6 bg-white rounded-[7px] border border-gray-200 hover:bg-gray-50"
                        style={{ 
                          boxShadow: `0px_2px_4px_${primaryColor || "#690217"}26`,
                          color: primaryColor || "#690217"
                        }}
                      >
                        <CompassIcon className="w-3 h-3" />
                        <span className="text-xs font-medium">{t('poi.map')}</span>
                      </Button>
                    )}
                  </div>
                );
              })()}
              
              {/* Custom buttons (boutons d'action) */}
              {(() => {
                const activePoi = activityDetails.pois.find(p => p.poi_id === miniGuidePoiDetails.poi_id);
                if (!activePoi || !activePoi.actions?.custom_buttons || activePoi.actions.custom_buttons.length === 0) return null;
                
                return (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {activePoi.actions.custom_buttons.map((customBtn, btnIndex) => (
                        <a
                          key={btnIndex}
                          href={customBtn.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            className="flex items-center justify-center gap-1 px-3 py-1 h-6 rounded-[7px] text-white font-medium transition-all hover:opacity-90"
                            style={{ 
                              backgroundColor: secondaryColor || "#4b5563"
                            }}
                          >
                            <span className="text-xs">{customBtn.label}</span>
                          </Button>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : !isPodcastPoiActive ? (
            /* Header section normale */
            <div className="mb-6">
              <div className="flex justify-between items-start">
              <h2 className="font-['Playfair_Display-Bold',Helvetica] font-bold text-lg leading-[22px] tracking-[-0.17px] flex-1 pr-3"
                style={{ 
                  color: primaryColor || "#690217",
                  fontFamily: 'Playfair Display',
                  fontWeight: 700,
                  letterSpacing: '-0.165px'
                }}>
                {isPodcastPoiActive && podcastPoiDetails
                  ? podcastPoiDetails.poi_name.toUpperCase()
                    : activityDetails.title.toUpperCase()
                  }
                </h2>

                {activityDetails.duration && activityDetails.duration.trim() && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 px-2 py-1 bg-white rounded-[74.56px] backdrop-blur-[10px] border-gray-200 flex-shrink-0 whitespace-nowrap"
                    style={{ boxShadow: `0px_2px_7px_${primaryColor || "#690217"}26` }}
                  >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-[11px] h-[11px]" viewBox="0 0 24 24" fill="none" stroke={primaryColor || "#690217"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                    <span className="text-[10px] text-[#000000cc] font-normal whitespace-nowrap">
                      {activityDetails.duration}
                    </span>
                  </Badge>
                )}
              </div>

            <p className="text-sm text-[#00000099] font-['Inter-Regular',Helvetica] tracking-[-0.17px] mt-2">
              {isPodcastPoiActive && podcastPoiDetails
                ? podcastPoiDetails.poi_description
                : activityDetails.description
              }
              </p>

              <Button 
                className="mt-4 h-6 rounded-[7px] px-[5px] py-0 pr-3"
                style={{ 
                  backgroundColor: primaryColor || "#690217",
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '500',
                  letterSpacing: '-0.17px'
                }}
                onClick={handleHaveQuestionClick}
              >
                <ParlerIcon className="w-3 h-3 mr-1" color="white" />
                {t('talkWithOceane.haveQuestion')}
              </Button>
            </div>
          ) : null}

          {/* Timeline des POIs - masquée quand slideshow, podcast ou mini-guide actif */}
          {!isSlideshowActive && !isPodcastPoiActive && !isMiniGuideActive && (() => {
            return activityDetails.pois && activityDetails.pois.length > 0;
          })() ? (
              <div className="relative">
                {/* Timeline line */}
                <div 
                  className="absolute left-1.5 top-0 w-[3px] h-full rounded-[7px]"
                  style={{ backgroundColor: `${primaryColor || "#690217"}40` }}
                ></div>

                {/* Timeline items */}
              {activityDetails.pois
                .sort((a, b) => {
                  // Mettre le restaurant spécifique en tête de liste
                  const restaurantId = 'restaurant_bar_cafe_55de3bd7-6bbf-4d66-ace9-b18a246cbed4';
                  if (a.poi_id === restaurantId) return -1;
                  if (b.poi_id === restaurantId) return 1;
                  return 0;
                })
                .map((poi) => (
                  <div key={poi.poi_id} className="relative pl-6 mb-12" data-poi-id={poi.poi_id}>
                    {/* Timeline dot - rond simple */}
                    <div
                      className="absolute left-[-2px] top-0 w-[18px] h-[18px] bg-white rounded-full border border-gray-200"
                      style={{ boxShadow: `0px_2px_4px_${primaryColor || "#690217"}26` }}
                    />

                    {/* Location header */}
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-['Inter-Medium',Helvetica] font-medium text-sm tracking-[-0.17px] flex-1"
                          style={{ color: primaryColor || "#690217" }}>
                        {poi.title.toUpperCase()}
                      </h3>

                      <div className="flex items-center gap-2">
                        {/* Badge durée */}
                        {poi.duration && poi.duration.trim() && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 px-2 py-0 h-[13px] bg-white rounded-[74.56px] backdrop-blur-[10px] border-gray-200"
                            style={{ boxShadow: `0px_2px_7px_${primaryColor || "#690217"}26` }}
                          >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke={primaryColor || "#690217"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                          </svg>
                          <span className="text-[10px] text-[#000000cc] font-normal">
                              {poi.duration}
                            </span>
                          </Badge>
                        )}
                        
                        {/* Bouton Map léger - seulement si coordonnées valides */}
                        {hasValidCoordinates(poi) && (
                          <button
                            onClick={() => handleMapClick(poi)}
                            className="flex items-center gap-1 px-2 py-1 h-[20px] rounded-md border transition-all hover:scale-105 bg-white"
                            style={{ 
                              borderColor: secondaryColor || "#F0F0F0",
                              boxShadow: `0px_1px_3px_${secondaryColor || "#F0F0F0"}40`
                            }}
                            title="Voir sur la carte"
                          >
                            <svg 
                              className="w-[14px] h-[14px]" 
                              viewBox="0 0 24 24" 
                              fill="currentColor"
                              style={{ color: secondaryColor || "#F0F0F0" }}
                            >
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            <span className="text-[10px] font-medium" style={{ color: secondaryColor || "#F0F0F0" }}>
                              Map
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                  {/* Description */}
                  <p className="text-sm text-[#00000099] font-['Inter-Regular',Helvetica] tracking-[-0.17px] mb-3">
                    {poi.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {/* Bouton Slideshow - seulement si disponible */}
                    {poi.actions?.slideshow?.available && (
                      <Button
                        onClick={() => handleSlideshowClick(poi.poi_id)}
                        className="flex items-center gap-1 px-3 py-1 h-6 bg-white rounded-[7px] border border-gray-200 hover:bg-gray-50"
                        style={{ 
                          boxShadow: `0px_2px_4px_${primaryColor || "#690217"}26`,
                          color: primaryColor || "#690217"
                        }}
                      >
                        <PlayIcon className="w-3 h-3" />
                        <span className="text-xs font-medium">{t('poi.slideshow')}</span>
                      </Button>
                    )}

                    {/* Bouton Podcast - seulement si disponible */}
                    {poi.actions?.podcast?.available && (
                      <Button
                        onClick={() => handlePodcastClick(poi.poi_id)}
                        className="flex items-center gap-1 px-3 py-1 h-6 bg-white rounded-[7px] border border-gray-200 hover:bg-gray-50"
                        style={{ 
                          boxShadow: `0px_2px_4px_${primaryColor || "#690217"}26`,
                          color: primaryColor || "#690217"
                        }}
                      >
                        <HeadphonesIcon className="w-3 h-3" />
                        <span className="text-xs font-medium">{t('poi.podcast')}</span>
                      </Button>
                    )}

                    {/* Bouton Informations (Mini-Guide) - seulement pour les POIs d'hôtel */}
                    {(poi.actions as any)?.miniguide?.is_available && (
                      <Button
                        onClick={() => handleMiniGuideClick(poi.poi_id, (poi.actions as any).miniguide.poi_key)}
                        className="flex items-center gap-1 px-3 py-1 h-6 bg-white rounded-[7px] hover:bg-gray-50"
                        style={{ 
                          boxShadow: `0px_2px_4px_${primaryColor || "#690217"}26`,
                          border: `1px solid ${primaryColor || "#690217"}`,
                          color: primaryColor || "#690217"
                        }}
                      >
                        <BookOpenIcon className="w-3 h-3" />
                        <span className="text-xs font-medium">{t('miniguide.informations')}</span>
                      </Button>
                    )}

                    {/* Bouton Reviews - TEMPORAIREMENT MASQUÉ (pas prêt) */}
                    {false && poi.poi_id === 'restaurant_bar_cafe_55de3bd7-6bbf-4d66-ace9-b18a246cbed4' && (
                      <Button
                        onClick={() => handleReviewsClick(poi.poi_id)}
                        className="flex items-center gap-1 px-3 py-1 h-6 bg-white rounded-[7px] hover:bg-gray-50"
                        style={{ 
                          boxShadow: `0px_2px_4px_${primaryColor || "#690217"}26`,
                          border: `1px solid ${primaryColor || "#690217"}`,
                          color: primaryColor || "#690217"
                        }}
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="text-xs font-medium">{t('poi.reviews')}</span>
                      </Button>
                    )}

                  </div>
                  
                  {/* Custom buttons (tous) sous les boutons de format - avec styles différents selon le type */}
                  {poi.actions?.custom_buttons && poi.actions.custom_buttons.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {poi.actions.custom_buttons.map((customBtn, btnIndex) => {
                        // Style blanc/primary pour Menu et Informations
                        const isSpecialButton = customBtn.label === "Menu" || customBtn.label === "Informations";
                        return (
                        <a
                          key={btnIndex}
                          href={customBtn.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            className={`flex items-center justify-center gap-1 px-3 py-1 h-6 rounded-[7px] font-medium transition-all ${
                              isSpecialButton ? 'bg-white hover:bg-gray-50' : 'text-white hover:opacity-90'
                            }`}
                            style={isSpecialButton ? {
                              boxShadow: `0px_2px_4px_${primaryColor || "#690217"}26`,
                              border: `1px solid ${primaryColor || "#690217"}`,
                              color: primaryColor || "#690217"
                            } : { 
                              backgroundColor: primaryColor || "#690217"
                            }}
                          >
                            <span className="text-xs">{customBtn.label}</span>
                          </Button>
                        </a>
                        );
                      })}
                    </div>
                  )}
                </div>
                ))}
            </div>
          ) : (
            /* Message si pas de POIs - seulement si pas de slideshow, podcast, mini-guide ou reviews actif */
            !isSlideshowActive && !isPodcastPoiActive && !isMiniGuideActive && !isReviewsActive && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">{t('common.noPOI')}</p>
          </div>
            )
        )}
      </div>
        </div>


      {/* Modal de développement */}
      <DevelopmentModal
        isOpen={isDevelopmentModalOpen}
        onClose={handleCloseDevelopmentModal}
      />

      {/* Reviews View */}
      {isReviewsActive && reviewsPoiDetails && (
        <ReviewsView
          poiName={reviewsPoiDetails.poi_name}
          onClose={handleCloseReviews}
        />
      )}

    </div>
  );
};

export default PageActivite;
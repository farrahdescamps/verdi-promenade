import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Header } from "../../components/Header";
import { InteractiveMap } from "../../components/Map";
import { CardStack } from "../../components/CardStack";
import { TalkWithOceaneModal } from "../../components/TalkWithOceaneModal";
import { useTranslation } from "../../locales";
import { useLanguage } from "../../contexts/LanguageContext";
import { fetchThemes, Theme } from "../../services/themeService";
import { LE_HAVRE_CITY_ID } from "../../constants/cities";
import { useSession } from "../../contexts/SessionContext";
import { sendHybridMatch } from "../../services/activityService";
import { MatchedActivity } from "../../services/sessionService";
import { fetchTinderCards } from "../../services/tinderService";
import { MAP_THEME } from "../../config";
import { useTheme } from "../../contexts/ThemeContext";
import { LogoDisplay } from "../../utils/logoUtils";
import { CONCIERGE_API_BASE_URL, API_KEY } from "../../config";

// Adapter les couleurs selon le thème de la carte
const useMapThemeColors = () => {
  const { primaryColor } = useTheme();
  const mapTextColor = MAP_THEME === 'light' ? (primaryColor || '#690217') : 'white';
  return { mapTextColor };
};

export const PageChoixIntro = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialTextVisible, setIsInitialTextVisible] = useState(false);
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const [showCardStackContent, setShowCardStackContent] = useState(false);
  const [isTextFadingOut, setIsTextFadingOut] = useState(false);
  const [showTalkWithOceaneModal, setShowTalkWithOceaneModal] = useState(false);
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { mapTextColor } = useMapThemeColors();
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const { primaryColor, secondaryColor, logoUrl, logoGroupUrl, hotelName } = useTheme();
  
  // Fonction pour convertir hex en RGB
  const hexToRgb = (color: string) => {
    const hex = color.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  };

  // Fonction pour calculer la luminance relative
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

  // Calculer si le logo doit être en blanc selon le contraste
  const logoVariant = useMemo(() => {
    const primary = primaryColor || '#690217';
    const primaryLum = getLuminance(primary);
    
    // Si la couleur primaire est trop claire (luminance > 0.5), utiliser le logo blanc
    if (primaryLum > 0.5) {
      return { color: '#FFFFFF', useFilter: true };
    }
    
    // Sinon, utiliser la couleur primaire
    return { color: primary, useFilter: false };
  }, [primaryColor]);

  // Accès aux données de session
  const { sessionData, markThemeSelectionAsCompleted, updateMatchedActivities } = useSession();
  
  // Récupérer le paramètre category depuis le state du routeur
  const category = (location.state as { category?: string })?.category as 'restaurant' | 'activity' | 'itinerary' | 'hotel' | undefined;
  
  // États pour la gestion des thèmes
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [themeError, setThemeError] = useState<string | null>(null);
  
  // État pour l'animation de transition de fin
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);
  
  // Prevent double conversation creation in StrictMode
  const conversationStartedRef = useRef(false);

  useEffect(() => {
    // En mode Tinder, afficher l'écran d'intro pendant 4 secondes puis les cartes
    if (category) {
      const introTimer = setTimeout(() => {
        setShowCardStackContent(true);
      }, 4000); // 4 secondes

      return () => clearTimeout(introTimer);
    }

    // Phase 1: Faire apparaître le texte rapidement (mode classique uniquement)
    const textTimer = setTimeout(() => {
      setIsInitialTextVisible(true);
    }, 100);

    return () => clearTimeout(textTimer);
  }, [category]);

  // Charger les thèmes ou les cartes Tinder selon le contexte
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingThemes(true);
        setThemeError(null);

        console.log('%c📋 CHOIX INTRO - Loading Data', 'background: #3b82f6; color: white; font-weight: bold; padding: 4px 8px;', {
          category,
          currentLanguage,
          hasCategory: !!category
        });

        if (category) {
          // Si un category est fourni, charger les cartes Tinder
          const response = await fetchTinderCards(category, currentLanguage);
          
          // Convertir les TinderVideo en Theme pour la compatibilité avec CardStack
          const convertedThemes: Theme[] = (response.videos || []).map((video, index) => ({
            id: `tinder-${category}-${index}`,
            name: video.title,
            video_url: video.url,
          }));
          
          console.log('%c✅ Themes Tinder convertis', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', {
            count: convertedThemes.length,
            themes: convertedThemes
          });

          // Si aucune carte Tinder disponible, skip cet écran
          if (convertedThemes.length === 0) {
            // Pour hotel, on va vers /enjoy-stay, sinon vers /journey
            const destination = category === 'hotel' ? '/enjoy-stay' : '/journey';
            console.log(`%c⚠️ AUCUNE CARTE TINDER - Skip vers ${destination}`, 'background: #f59e0b; color: white; font-weight: bold; padding: 4px 8px;');
            setLoadingThemes(false);
            navigate(destination, { state: { category, skipTinder: true } });
            return;
          }

          setThemes(convertedThemes);
        } else {
          // Sinon, charger les thèmes par défaut (flux original)
          console.log('📥 Chargement des thèmes classiques (pas de category)');
          const fetchedThemes = await fetchThemes(LE_HAVRE_CITY_ID, currentLanguage);
          setThemes(fetchedThemes);
        }
      } catch (error) {
        console.error('❌ Erreur chargement Tinder:', error);
        setThemeError(`${t('error.themeLoad')}: ${error?.message || 'Erreur inconnue'}`);
        
        // En cas d'erreur lors du chargement Tinder, skip l'écran aussi
        if (category) {
          // Pour hotel, on va vers /enjoy-stay, sinon vers /journey
          const destination = category === 'hotel' ? '/enjoy-stay' : '/journey';
          console.log(`%c⚠️ ERREUR TINDER - Skip vers ${destination}`, 'background: #ef4444; color: white; font-weight: bold; padding: 4px 8px;');
          setLoadingThemes(false);
          navigate(destination, { state: { category, skipTinder: true } });
          return;
        }
        
        // En cas d'erreur, utiliser les thèmes par défaut (si disponibles)
        if (!category) {
          // setThemes(fallbackThemes); // Commenté pour l'instant
        }
      } finally {
        setLoadingThemes(false);
      }
    };

    loadData();
  }, [currentLanguage, category]);

  useEffect(() => {
    if (isInitialTextVisible) {
      // Phase 2: Faire disparaître le texte d'abord
      const expandTimer = setTimeout(() => {
        setIsTextFadingOut(true);
      }, 2000); // Le texte reste visible 2 secondes

      return () => clearTimeout(expandTimer);
    }
  }, [isInitialTextVisible]);

  useEffect(() => {
    if (isTextFadingOut) {
      // Phase 3: Après que le texte ait disparu, commencer l'expansion
      const expandTimer = setTimeout(() => {
        setIsCardExpanded(true);
      }, 500); // Attendre que le texte disparaisse complètement

      return () => clearTimeout(expandTimer);
    }
  }, [isTextFadingOut]);

  useEffect(() => {
    if (isCardExpanded) {
      // Phase 3: Après l'expansion, afficher le CardStack
      const contentTimer = setTimeout(() => {
        setShowCardStackContent(true);
      }, 1000); // Durée de l'animation d'expansion

      return () => clearTimeout(contentTimer);
    }
  }, [isCardExpanded]);

  const handleAllCardsSwiped = async () => {
    // Masquer immédiatement les cartes pour éviter tout flash
    setIsTransitioningOut(true);
    
    // Attendre l'animation fade complète (overlay bordeaux)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // En mode Tinder, naviguer selon le type
    if (category) {
      // Si c'est le type "hotel", naviguer vers /enjoy-stay directement
      if (category === 'hotel') {
        console.log('%c🏨 TINDER HOTEL TERMINÉ - Navigation vers /enjoy-stay', 'background: #8b5cf6; color: white; font-weight: bold; padding: 4px 8px;');
        navigate('/enjoy-stay');
        return;
      }
      
      // Pour les autres types (restaurant, activity, itinerary), appeler l'API et naviguer vers journey
      try {
        // Récupérer le session_id depuis localStorage
        const hotelSessionId = localStorage.getItem('hotel_session_id');
        
        if (hotelSessionId) {
          // Appeler l'API pour récupérer les résultats matchés
          const url = `${CONCIERGE_API_BASE_URL}/themes?session_id=${hotelSessionId}&type=${category}`;
          
          console.log('%c🎯 TINDER TERMINÉ - Appel API Résultats', 'background: #f59e0b; color: white; font-weight: bold; padding: 4px 8px;', {
            session_id: hotelSessionId,
            type: category,
            url
          });

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'x-api-key': API_KEY,
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('%c✅ Résultats reçus', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', data);
            
            // Naviguer vers PageMonAventure avec les résultats
            navigate('/journey', { state: { tinderResults: data, category } });
          } else {
            // En cas d'erreur, naviguer quand même
            navigate('/journey');
          }
        } else {
          navigate('/journey');
        }
      } catch (error) {
        console.error('❌ Erreur récupération résultats Tinder:', error);
        navigate('/journey');
      }
      return;
    }

    // Mode classique : afficher la modale
    setTimeout(() => {
      markThemeSelectionAsCompleted();
      setShowTalkWithOceaneModal(true);
    }, 0);
  };

  const handleModalContinue = async () => {
    // Navigation immédiate pour éviter que le CardStack réapparaisse
    navigate("/journey");

    // Lancer le matching des activités avec les thèmes sélectionnés pour le flux "sans profiling"
    if (sessionData?.session_id && sessionData.liked_themes && sessionData.liked_themes.length > 0) {
      try {

        const hybridMatchData = {
          session_id: sessionData.session_id,
          city_id: LE_HAVRE_CITY_ID,
          liked_themes: sessionData.liked_themes,
          lang: currentLanguage,
        };

        const response = await sendHybridMatch(hybridMatchData);

        if (response.matched_activities) {
          await updateMatchedActivities(response.matched_activities as MatchedActivity[]);

        }
      } catch (error) {

        // On continue quand même vers journey, l'utilisateur verra un état de chargement
      }
    }

  };

  const handleModalTalk = async () => {
    if (!sessionData?.session_id || isCreatingConversation) return;
    
    setIsCreatingConversation(true);
    
    try {
      // Lancer le premier matching avec les thèmes sélectionnés AVANT de créer la conversation

      const hybridMatchData = {
        session_id: sessionData.session_id,
        city_id: LE_HAVRE_CITY_ID,
        liked_themes: sessionData.liked_themes || [],
        lang: currentLanguage,
      };

      const response = await sendHybridMatch(hybridMatchData);

      if (response.matched_activities) {
        await updateMatchedActivities(response.matched_activities as MatchedActivity[]);

      }

      setShowTalkWithOceaneModal(false);
      
      // Chat profiling supprimé - naviguer directement vers journey
      navigate("/journey");
    } catch (error) {

      setShowTalkWithOceaneModal(false);
      // En cas d'erreur, naviguer quand même vers journey
      navigate("/journey");
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleModalClose = () => {
    setShowTalkWithOceaneModal(false);
  };

  // Toujours afficher exclusivement le logo principal (logoUrl). Pas de fallback.
  console.log('%c🎯 TINDER LOGO DEBUG', 'background: #3b82f6; color: white; font-weight: bold; padding: 4px 8px;', {
    logoUrlPreview: logoUrl ? `${logoUrl.substring(0, 60)}...` : null,
    hasLogoUrl: !!logoUrl,
    logoGroupUrlPreview: logoGroupUrl ? `${logoGroupUrl.substring(0, 60)}...` : null,
    hasLogoGroupUrl: !!logoGroupUrl
  });

  const tinderLogoUrl = logoUrl || null;

  // Mode Tinder : affichage simplifié avec fond couleur primaire
  if (category) {
    return (
      <div 
        className="w-full overflow-hidden relative flex flex-col"
        style={{ 
          backgroundColor: primaryColor || '#690217',
          height: '100dvh',
          paddingTop: 'var(--sat)',
          paddingBottom: 'var(--sab)',
          boxSizing: 'border-box'
        }}
      >
        {/* Contenu qui disparaît en douceur */}
        <div 
          className={`absolute inset-0 flex flex-col ${
            isTransitioningOut ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ 
            transition: 'opacity 0.4s ease-out',
            pointerEvents: isTransitioningOut ? 'none' : 'auto'
          }}
        >
        {/* Logo en haut - toujours blanc en mode Tinder pour garantir le contraste */}
        {tinderLogoUrl && (
          <div 
            className="absolute top-[62px] left-1/2 -translate-x-1/2 z-10 flex items-center justify-center"
            style={{
              animation: 'fadeIn 0.6s ease-out forwards',
              opacity: 1,
              animationDelay: '0.2s',
              color: '#FFFFFF',
              borderRadius: '12px',
              padding: '8px'
            }}
          >
            <LogoDisplay
              logoData={tinderLogoUrl}
              className="w-[35%] max-w-[140px] object-contain"
              style={{ 
                filter: 'brightness(0) saturate(100%) invert(100%)'
              }}
              alt={hotelName || "Logo"}
            />
          </div>
        )}

        {/* Écran d'intro avant les cartes - avec animations */}
        {!showCardStackContent ? (
          <div 
            className="flex flex-col items-center justify-center h-full px-4 py-6 gap-2.5"
            style={{
              animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              opacity: 0
            }}
          >
            <h1 
              className="text-white text-center font-bold text-[25px] leading-[27px]"
              style={{
                fontFamily: 'Playfair Display',
                fontWeight: 700,
                letterSpacing: '-0.165px',
                animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                opacity: 0,
                animationDelay: '0.3s'
              }}
            >
              {t('tinder.buildYourStay')}
            </h1>

            <p 
              className="text-center text-sm font-normal leading-normal"
              style={{
                color: 'rgba(255, 255, 255, 0.80)',
                fontFamily: 'Inter',
                letterSpacing: '-0.165px',
                animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                opacity: 0,
                animationDelay: '0.5s'
              }}
            >
              {t('tinder.swipeInstructions')}
            </p>

            {/* Lien discret "Posez directement une question" */}
            <div
              className="mt-6 flex items-center gap-2"
              style={{
                animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                opacity: 0,
                animationDelay: '0.7s'
              }}
            >
              <div className="h-px bg-white/40 flex-1" />
              <button
                onClick={() => navigate('/chat')}
                className="text-white/90 hover:text-white text-sm font-normal transition-all"
                style={{
                  fontFamily: 'Inter',
                  letterSpacing: '-0.165px'
                }}
              >
                {t('tinder.askDirectQuestion')}
              </button>
              <div className="h-px bg-white/40 flex-1" />
            </div>
          </div>
        ) : (
          /* Contenu des cartes Tinder avec animation d'entrée */
          <div 
            className="flex flex-col h-full" 
            style={{ 
              paddingTop: '7.5rem',
              paddingBottom: '1.5rem',
              animation: 'slideInFromBottom 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              opacity: 0
            }}
          >
            {loadingThemes ? (
              <div 
                className="flex items-center justify-center h-full w-full px-6"
                style={{
                  animation: 'fadeIn 0.5s ease-out forwards'
                }}
              >
                <div className="text-center">
                  <div 
                    className="text-white text-lg mb-4"
                    style={{
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}
                  >
                    Chargement...
                  </div>
                  <div className="flex space-x-2 justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            ) : themeError ? (
              <div 
                className="flex items-center justify-center h-full w-full px-6"
                style={{
                  animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }}
              >
                <div className="text-center">
                  <div className="text-white text-lg mb-2">Erreur</div>
                  <div className="text-white/80 text-sm mb-4">{themeError}</div>
                </div>
              </div>
            ) : themes.length > 0 ? (
              !isTransitioningOut ? (
                <>
                  <div 
                    className="flex items-center justify-center h-full w-full p-4"
                    style={{
                      animation: 'scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                      opacity: 0
                    }}
                  >
                    <CardStack themes={themes} onAllCardsSwiped={handleAllCardsSwiped} />
                  </div>

                  {/* Lien discret "Posez directement une question" - visible pendant les cartes */}
                  <div
                    className="absolute left-0 right-0 flex items-center gap-2 px-6"
                    style={{
                      bottom: '2rem', // Descendu pour éviter la proximité avec les boutons
                      animation: 'fadeIn 0.8s ease-out forwards',
                      opacity: 0,
                      animationDelay: '1s'
                    }}
                  >
                    <div className="h-px bg-white/30 flex-1" />
                    <button
                      onClick={() => navigate('/chat')}
                      className="text-white/80 hover:text-white text-xs font-normal transition-all"
                      style={{
                        fontFamily: 'Inter',
                        letterSpacing: '-0.165px'
                      }}
                    >
                      {t('tinder.askDirectQuestion')}
                    </button>
                    <div className="h-px bg-white/30 flex-1" />
                  </div>
                </>
              ) : null
            ) : (
              <div 
                className="flex items-center justify-center h-full w-full px-6"
                style={{
                  animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }}
              >
                <div className="text-white text-lg">Aucune carte disponible</div>
              </div>
            )}
          </div>
        )}
        </div>
        
        {/* Overlay fade-out simple et élégant */}
        {isTransitioningOut && (
          <div 
            className="absolute inset-0 z-50 pointer-events-none"
            style={{ 
              backgroundColor: primaryColor || '#690217',
              animation: 'elegantFadeOut 1.0s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            }}
          />
        )}
      </div>
    );
  }

  // Mode classique : avec map et carte animée
  return (
    <div className="bg-transparent w-full h-screen max-h-screen overflow-hidden relative" style={{ paddingTop: 'var(--sat)' }}>
      {/* Interactive Map Background - Full screen */}
      <InteractiveMap mapTheme={MAP_THEME} />

      {/* Header */}
      <Header title={isCardExpanded ? t('choice.title') : t('journey.title')} />

        {/* Animated Card Content */}
        <Card className={`border-none transition-all duration-1000 ease-in-out ${
          isCardExpanded 
            ? 'w-full top-0 left-0 translate-x-0 translate-y-0 rounded-none bg-theme-primary/50 backdrop-blur-[2.5px]'
            : 'w-[276px] h-[172px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-[7px] bg-theme-primary/50 backdrop-blur-[2.5px]'
        } absolute`} 
        style={isCardExpanded ? { 
          height: '100vh',
          paddingTop: '6rem',
          paddingBottom: '1.5rem'
        } : {}}>
          <CardContent className="p-0">
            {showCardStackContent ? (
              loadingThemes ? (
                <div className="flex items-center justify-center h-full w-full px-6">
                  <div className="text-center">
                    <div className="text-white text-lg mb-4">{t('loading.themes')}</div>
                    <div className="flex space-x-2 justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              ) : themeError ? (
                <div className="flex items-center justify-center h-full w-full px-6">
                  <div className="text-center">
                    <div className="text-white text-lg mb-2">{t('error.themeLoading')}</div>
                    <div className="text-white/80 text-sm mb-4">{themeError}</div>
                    <div className="text-white/60 text-xs">Utilisation des thèmes par défaut</div>
                  </div>
                </div>
              ) : themes.length > 0 ? (
                <div className={`flex items-center justify-center h-full w-full p-4 ${showTalkWithOceaneModal ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
                  <CardStack themes={themes} onAllCardsSwiped={handleAllCardsSwiped} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full w-full px-6">
                  <div className="text-white text-lg">Aucun thème disponible</div>
                </div>
              )
            ) : (
              <div className={`flex flex-col items-center justify-center h-full px-4 py-6 gap-2.5 transition-opacity ${
                !isInitialTextVisible
                  ? 'opacity-0'
                  : isTextFadingOut
                    ? 'opacity-0 duration-500'
                    : 'opacity-100 duration-500'
              }`}>
                <h1 
                  className="text-center font-bold text-[25px] leading-[27px]"
                  style={{
                    fontFamily: 'Playfair Display',
                    fontWeight: 700,
                    letterSpacing: '-0.165px',
                    color: mapTextColor
                  }}
                >
                  {t('choice.buildAdventure')}
                </h1>

                <p 
                  className="text-center text-sm font-normal leading-normal"
                  style={{
                    color: mapTextColor,
                    opacity: 0.8,
                    fontFamily: 'Inter',
                    letterSpacing: '-0.165px'
                  }}
                >
                  {t('choice.buildAdventureSubtitle')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>


        {/* Modal "Parler avec Océane" */}
        <TalkWithOceaneModal
          isOpen={showTalkWithOceaneModal}
          isCreatingConversation={isCreatingConversation}
          onClose={handleModalClose}
          onContinue={handleModalContinue}
          onTalk={handleModalTalk}
        />
        
      </div>
  );
};
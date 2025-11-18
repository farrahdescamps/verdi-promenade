import React, { useState, useEffect, useCallback } from 'react';
import { VideoPlayer } from '../../components/VideoPlayer';
import { fetchMiniGuide, MiniGuidePart } from '../../services/miniGuideService';
import { useTranslation } from '../../locales';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/icons';

interface MiniGuideData {
  parts: MiniGuidePart[];
  total_words: number;
  sessionId: string;
}

interface MiniGuideViewProps {
  poiKey: string;
  activityColor: string;
  poiVideoUrl?: string; // Vidéo du POI en arrière-plan
  onClose: () => void;
}

export const MiniGuideView: React.FC<MiniGuideViewProps> = ({
  poiKey,
  activityColor,
  poiVideoUrl,
  onClose
}) => {
  const { t } = useTranslation();
  const { primaryColor } = useTheme();
  
  const [isGenerating, setIsGenerating] = useState(true);
  const [miniGuideParts, setMiniGuideParts] = useState<MiniGuidePart[]>([]);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // États pour le swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Fonctions de gestion du localStorage pour le mini-guide
  const getMiniGuideFromLocalStorage = useCallback((poiKey: string, sessionId: string): MiniGuideData | null => {
    try {
      const key = `miniguide_${sessionId}_${poiKey}`;
      const stored = localStorage.getItem(key);

      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('%c📚 MINI-GUIDE TROUVÉ EN LOCAL', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', {
          poiKey,
          parts: parsed.parts?.length
        });

        // Vérifier que le sessionId correspond
        if (parsed.sessionId === sessionId) {
          return parsed;
        } else {
          console.warn('⚠️ Session ID ne correspond pas, suppression du cache');
          localStorage.removeItem(key);
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur lecture localStorage mini-guide:', error);
      return null;
    }
  }, []);

  const saveMiniGuideToLocalStorage = useCallback((poiKey: string, sessionId: string, miniGuideData: { parts: MiniGuidePart[]; total_words: number }) => {
    try {
      const miniGuideDataWithSession: MiniGuideData = {
        ...miniGuideData,
        sessionId
      };

      const key = `miniguide_${sessionId}_${poiKey}`;
      localStorage.setItem(key, JSON.stringify(miniGuideDataWithSession));
      
      console.log('%c💾 MINI-GUIDE SAUVEGARDÉ EN LOCAL', 'background: #3b82f6; color: white; font-weight: bold; padding: 4px 8px;', {
        poiKey,
        parts: miniGuideData.parts.length
      });
    } catch (error) {
      console.error('❌ Erreur sauvegarde localStorage mini-guide:', error);
    }
  }, []);

  // Mini-guide de fallback local (pour développement/test)
  const getFallbackMiniGuide = useCallback((poiKey: string): { parts: MiniGuidePart[]; total_words: number } => {
    console.log('%c📚 UTILISATION DU MINI-GUIDE LOCAL (FALLBACK)', 'background: #f59e0b; color: white; font-weight: bold; padding: 4px 8px;', { poiKey });
    
    return {
      parts: [
        {
          title: "Bienvenue",
          content: `Découvrez toutes les informations essentielles concernant ${poiKey}.\n\nCe guide vous accompagnera pour profiter pleinement de votre expérience.`
        },
        {
          title: "Horaires & Accès",
          content: "Horaires d'ouverture :\n• Lundi - Vendredi : 7h30 - 10h30\n• Samedi - Dimanche : 8h00 - 11h00\n\nAccès facile depuis toutes les chambres."
        },
        {
          title: "Services & Options",
          content: "Services disponibles :\n• Buffet continental\n• Options végétariennes\n• Service en chambre sur demande\n• Terrasse extérieure (selon météo)"
        },
        {
          title: "Informations Pratiques",
          content: "Informations utiles :\n• Réservation recommandée en haute saison\n• Allergies alimentaires : informez notre équipe\n• Menu enfant disponible\n• Wi-Fi gratuit"
        }
      ],
      total_words: 150
    };
  }, []);

  // Charger le mini-guide au montage du composant
  useEffect(() => {
    const loadMiniGuide = async () => {
      const hotelSessionId = localStorage.getItem('hotel_session_id');
      if (!hotelSessionId) {
        console.warn('⚠️ Pas de session ID trouvé');
        setError('Session introuvable');
        setIsGenerating(false);
        return;
      }

      // 1. Vérifier d'abord le localStorage
      const existingMiniGuide = getMiniGuideFromLocalStorage(poiKey, hotelSessionId);
      if (existingMiniGuide && existingMiniGuide.parts && existingMiniGuide.parts.length > 0) {
        setMiniGuideParts(existingMiniGuide.parts);
        setIsGenerating(false);
        return;
      }

      // 2. Si pas en local, générer via l'API
      console.log('%c📖 GÉNÉRATION MINI-GUIDE', 'background: #3b82f6; color: white; font-weight: bold; padding: 4px 8px;', {
        poiKey,
        sessionId: hotelSessionId
      });

      try {
        const response = await fetchMiniGuide(poiKey, hotelSessionId);
        setMiniGuideParts(response.parts);
        
        // 3. Sauvegarder dans localStorage
        saveMiniGuideToLocalStorage(poiKey, hotelSessionId, response);
        
        console.log('%c✅ MINI-GUIDE GÉNÉRÉ', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', {
          parts: response.parts.length,
          total_words: response.total_words
        });
      } catch (error) {
        console.error('%c❌ ERREUR MINI-GUIDE', 'background: #ef4444; color: white; font-weight: bold; padding: 4px 8px;', error);
        
        // 4. En cas d'erreur, utiliser le mini-guide de fallback local
        const fallbackGuide = getFallbackMiniGuide(poiKey);
        setMiniGuideParts(fallbackGuide.parts);
        
        // Sauvegarder le fallback en local pour ne pas redemander à l'API
        saveMiniGuideToLocalStorage(poiKey, hotelSessionId, fallbackGuide);
        
        console.log('%c✅ MINI-GUIDE LOCAL CHARGÉ', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;');
      } finally {
        setIsGenerating(false);
      }
    };

    loadMiniGuide();
  }, [poiKey, getMiniGuideFromLocalStorage, saveMiniGuideToLocalStorage, getFallbackMiniGuide]);

  // Gestionnaires de swipe
  const minSwipeDistance = 50; // Distance minimale pour déclencher le swipe

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentPartIndex < miniGuideParts.length - 1) {
      // Swipe gauche -> partie suivante
      setCurrentPartIndex(currentPartIndex + 1);
    }
    if (isRightSwipe && currentPartIndex > 0) {
      // Swipe droite -> partie précédente
      setCurrentPartIndex(currentPartIndex - 1);
    }
  };

  const currentPart = miniGuideParts[currentPartIndex];

  return (
    <div className="relative w-full h-full">
      {/* Vidéo du POI en arrière-plan */}
      {poiVideoUrl && (
        <VideoPlayer
          src={poiVideoUrl}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Modal de génération ou contenu du mini-guide */}
      {isGenerating ? (
        /* Modal de génération */
        <div className="absolute inset-0 flex justify-center items-center z-[100] pointer-events-none">
          <div className="relative w-full max-w-[316px] mx-[30px] mt-[30px] pointer-events-auto">
            <div className="bg-[#f4f9fdcc] backdrop-blur-[1.5px] rounded-[7px] px-[21.8px] py-[29px] shadow-xl text-center"
              style={{ 
              backdropFilter: 'blur(1.5px) brightness(100%)',
              WebkitBackdropFilter: 'blur(1.5px) brightness(100%)'
            }}
          >
            <div 
              className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent mx-auto mb-4"
              style={{ borderColor: primaryColor || '#690217', borderTopColor: 'transparent' }}
            ></div>
            <div className="text-base font-semibold mb-2" style={{ color: primaryColor || '#690217', fontFamily: 'Inter' }}>{t('miniguide.generating')}</div>
            <div className="text-sm text-[#00000099]" style={{ fontFamily: 'Inter' }}>{t('miniguide.generatingSubtitle')}</div>
            </div>
          </div>
        </div>
      ) : error ? (
        /* Message d'erreur */
        <div className="absolute inset-0 flex justify-center items-center z-20">
          <div className="bg-white rounded-2xl shadow-2xl p-5 mx-6 max-w-[350px]">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        </div>
      ) : currentPart ? (
        /* Contenu du mini-guide - commence après le logo et reste dans l'en-tête (75vh) */
        <div className="absolute top-[130px] left-0 right-0 flex justify-center z-[100] px-6">
          <div className="relative w-full max-w-[350px]">
            <div 
              className="rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              style={{
                maxHeight: 'calc(75vh - 160px)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)', // Légère transparence
                backdropFilter: 'blur(10px)',
              }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Header avec titre de la partie actuelle - fixe */}
              <div 
                className="px-5 py-4 border-b flex-shrink-0"
                style={{ borderColor: '#f3f4f6' }}
              >
                <h2 
                  className="text-base font-bold text-center"
                  style={{ 
                    color: primaryColor || activityColor || '#690217',
                    fontFamily: 'Playfair Display'
                  }}
                >
                  {currentPart.title}
                </h2>
              </div>

              {/* Contenu scrollable - prend tout l'espace disponible */}
              <div 
                className="px-5 py-5 overflow-y-auto flex-1"
              >
                {/* Contenu de la partie (titre retiré, maintenant dans le header) */}
                <div 
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ 
                    color: '#00000099',
                    fontFamily: 'Inter',
                    lineHeight: '1.6'
                  }}
                >
                  {currentPart.content}
                </div>
              </div>

              {/* Footer avec pagination - discret et détaché - fixe */}
              <div 
                className="px-3 py-2 flex items-center justify-between flex-shrink-0"
              >
                {/* Bouton Précédent - plus petit et discret */}
                <button
                  onClick={() => setCurrentPartIndex(Math.max(0, currentPartIndex - 1))}
                  disabled={currentPartIndex === 0}
                  className="text-xs font-medium py-1 px-2 transition-opacity disabled:opacity-20"
                  style={{ 
                    color: primaryColor || activityColor || '#690217',
                    fontFamily: 'Inter'
                  }}
                >
                  <ChevronLeftIcon className="w-3 h-3 inline-block" style={{ color: primaryColor || activityColor || '#690217' }} />
                </button>

                {/* Points de pagination - plus petits */}
                <div className="flex gap-1">
                  {miniGuideParts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPartIndex(index)}
                      className="w-1 h-1 rounded-full transition-all"
                      style={{
                        backgroundColor: index === currentPartIndex 
                          ? primaryColor || activityColor || '#690217' 
                          : `${primaryColor || activityColor || '#690217'}40`
                      }}
                    />
                  ))}
                </div>

                {/* Bouton Suivant ou Fermer - plus petit et sans fond */}
                {currentPartIndex < miniGuideParts.length - 1 ? (
                  <button
                    onClick={() => setCurrentPartIndex(Math.min(miniGuideParts.length - 1, currentPartIndex + 1))}
                    className="text-xs font-medium py-1 px-2 transition-all"
                    style={{ 
                      color: primaryColor || activityColor || '#690217',
                      fontFamily: 'Inter'
                    }}
                  >
                    <ChevronRightIcon className="w-3 h-3 inline-block" style={{ color: primaryColor || activityColor || '#690217' }} />
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="text-xs font-medium py-1 px-2 transition-all"
                    style={{ 
                      color: primaryColor || activityColor || '#690217',
                      fontFamily: 'Inter'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};


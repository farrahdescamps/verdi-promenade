import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VideoPlayer } from '../../components/VideoPlayer';
import { generatePodcast, fetchPodcastHistory, PodcastGenerationResponse, PodcastHistoryItem } from '../../services/podcastService';
import { useSession } from '../../contexts/SessionContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../locales';
import { LE_HAVRE_CITY_ID } from '../../constants/cities';
import { ClockIcon, ParlerIcon } from '../../components/icons';
import { useTheme } from '../../contexts/ThemeContext';
import { LogoDisplay } from '../../utils/logoUtils';


interface PodcastData {
  podcast_url: string;
  duration?: number;
  title?: string;
}

type PodcastState = 'idle' | 'choosing' | 'generating' | 'ready' | 'playing';

interface PodcastViewProps {
  poiId: string;
  activityColor: string;
  poiVideoUrl?: string; // Vidéo du POI en arrière-plan
  activityId: string;
}

export const PodcastView: React.FC<PodcastViewProps> = ({
  poiId,
  activityColor,
  poiVideoUrl,
  activityId
}) => {
  const { sessionData } = useSession();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();
  const { logoUrl, hotelName } = useTheme();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [podcastState, setPodcastState] = useState<PodcastState>('idle');
  const [currentPodcast, setCurrentPodcast] = useState<PodcastData | null>(null);
  const [podcastGenerationError, setPodcastGenerationError] = useState<string | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [podcastProgress, setPodcastProgress] = useState(0);
  const [podcastDuration, setPodcastDuration] = useState(0);
  const [isPodcastPaused, setIsPodcastPaused] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [podcastType, setPodcastType] = useState<'generic' | 'personalized' | null>(null);
  const [autoGenerateAttempted, setAutoGenerateAttempted] = useState(false);
  
  // États pour le contrôle manuel de la timeline
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [timelineWidth, setTimelineWidth] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Fonctions pour gérer l'état de génération persistant
  const getGeneratingStateKey = useCallback((poiId: string): string => {
    return `podcast_generating_${poiId}`;
  }, []);

  const setGeneratingState = useCallback((poiId: string, isGenerating: boolean) => {
    const key = getGeneratingStateKey(poiId);
    if (isGenerating) {
      sessionStorage.setItem(key, 'true');

    } else {
      sessionStorage.removeItem(key);

    }
  }, [getGeneratingStateKey]);

  const isGeneratingPersisted = useCallback((poiId: string): boolean => {
    const key = getGeneratingStateKey(poiId);
    const isGenerating = sessionStorage.getItem(key) === 'true';

    return isGenerating;
  }, [getGeneratingStateKey]);

  // Fonction pour déterminer le type de podcast basé sur les données
  const determinePodcastType = useCallback((podcast: any): 'generic' | 'personalized' => {
    // Si le podcast a un blueprint_id 'custom_podcast', c'est un podcast personnalisé
    if (podcast.conversation_id && podcast.conversation_id.includes('custom_podcast')) {
      return 'personalized';
    }
    // Sinon, c'est un podcast générique
    return 'generic';
  }, []);

  // Fonction pour récupérer le nom du POI dans la langue de l'utilisateur
  const getPoiName = useCallback((): string => {
    // Essayer de récupérer depuis les données de session
    const poiName = sessionData?.matched_activities
      ?.flatMap(activity => activity.pois_coordinates || [])
      ?.find(poi => poi.poi_id === poiId)?.name;
    
    if (poiName) {
      return poiName;
    }

    // Fallback : utiliser le titre du podcast s'il existe
    if (currentPodcast?.title) {
      return currentPodcast.title;
    }

    // Dernier fallback
    return 'PODCAST';
  }, [sessionData?.matched_activities, poiId, currentPodcast?.title]);

  // Fonctions de gestion du localStorage
  const getPodcastFromLocalStorage = useCallback((poiId: string): PodcastData | null => {
    try {
      if (!sessionData?.session_id) {

        return null;
      }

      const key = `podcast_${sessionData.session_id}_${poiId}`;

      const stored = localStorage.getItem(key);

      if (stored) {
        const parsed = JSON.parse(stored);

        // ✅ Vérifier que le sessionId correspond
        if (parsed.sessionId === sessionData.session_id) {

          return parsed;
        } else {

          localStorage.removeItem(key);
          return null;
        }
      }
      return null;
    } catch (error) {

      return null;
    }
  }, [sessionData?.session_id]);

  const savePodcastToLocalStorage = useCallback((poiId: string, podcastData: PodcastData) => {
    try {
      if (!sessionData?.session_id) {

        return;
      }

      // ✅ Inclure le sessionId dans les données et la clé
      const podcastDataWithSession = {
        ...podcastData,
        sessionId: sessionData.session_id
      };

      const key = `podcast_${sessionData.session_id}_${poiId}`;
      localStorage.setItem(key, JSON.stringify(podcastDataWithSession));

    } catch (error) {

    }
  }, [sessionData?.session_id]);

  // Polling intelligent pour détecter les nouveaux podcasts
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let lastPodcastData: string | null = null;

    const checkForNewPodcast = () => {
      const currentPodcastData = localStorage.getItem(`podcast_${poiId}`);
      
      // Si on a un nouveau podcast et qu'on n'en avait pas avant
      if (currentPodcastData && currentPodcastData !== lastPodcastData) {

        try {
          const podcastData = JSON.parse(currentPodcastData);
          
          // Vérifier que le podcast a bien un URL valide
          if (podcastData.podcast_url && podcastData.success === true) {

            setCurrentPodcast(podcastData);
            setPodcastType(determinePodcastType(podcastData));
            setPodcastState('ready');
            sessionStorage.removeItem(`podcast_generating_${poiId}`);
            lastPodcastData = currentPodcastData;
          } else {

            // Ne pas changer l'état, rester en mode génération
          }
        } catch (error) {

        }
      }
      
      // Si on avait un podcast et qu'il n'y en a plus, revenir au mode choosing
      if (!currentPodcastData && lastPodcastData) {

        setCurrentPodcast(null);
        setPodcastState('choosing');
        lastPodcastData = null;
      }
    };

    // Démarrer le polling toutes les 3 secondes
    pollInterval = setInterval(checkForNewPodcast, 3000);

    // Nettoyer l'interval
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [poiId]);

  // Vérifier si un podcast existe déjà au chargement
  useEffect(() => {
    const checkExistingPodcast = async () => {
      const hotelSessionId = localStorage.getItem('hotel_session_id');
      
      if (!hotelSessionId) {
        console.log('%c⚠️ PAS DE SESSION CONCIERGE AU CHARGEMENT', 'background: #f59e0b; color: white; font-weight: bold; padding: 4px 8px;');
        setPodcastState('choosing');
        return;
      }

      // Vérifier d'abord si une génération est en cours
      if (isGeneratingPersisted(poiId)) {

        setPodcastState('generating');
        
        // Démarrer un polling pour vérifier si le podcast est prêt
        let pollTimeout: NodeJS.Timeout;
        let pollCount = 0;
        const maxPolls = 30; // Maximum 1 minute de polling (30 * 2s)
        
        const pollForPodcast = () => {
          pollCount++;

          const existingPodcast = getPodcastFromLocalStorage(poiId);
          if (existingPodcast) {
            // Vérifier que le podcast est valide
            if (existingPodcast.podcast_url && existingPodcast.success === true) {

              setCurrentPodcast(existingPodcast);
              setPodcastType(determinePodcastType(existingPodcast));
              setPodcastState('ready');
              sessionStorage.removeItem(`podcast_generating_${poiId}`);
              return;
            } else {

              // Continuer le polling
            }
          }
          
          // Vérifier si l'état de génération a été nettoyé
          if (!isGeneratingPersisted(poiId)) {

            // Re-vérifier le localStorage au cas où
            const podcast = getPodcastFromLocalStorage(poiId);
            if (podcast) {
              setCurrentPodcast(podcast);
              setPodcastState('ready');
            } else {
              setPodcastState('choosing');
            }
            return;
          }
          
          // Arrêter le polling après le maximum d'essais
          if (pollCount >= maxPolls) {

            setPodcastState('choosing');
            return;
          }
          
          // Continuer le polling toutes les 2 secondes
          pollTimeout = setTimeout(pollForPodcast, 2000);
        };
        
        // Démarrer le polling après 1 seconde
        pollTimeout = setTimeout(pollForPodcast, 1000);
        
        // Nettoyer le timeout si le composant se démonte
        return () => {
          if (pollTimeout) {
            clearTimeout(pollTimeout);
          }
        };
        return;
      }

      try {
        // Vérifier d'abord le localStorage

        // Debug: Afficher tous les éléments localStorage liés aux podcasts

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes('podcast')) {

          }
        }
        
        const existingPodcast = getPodcastFromLocalStorage(poiId);

        if (existingPodcast) {
          // Vérifier que le podcast est valide avant de l'afficher
          if (existingPodcast.podcast_url && existingPodcast.success === true) {

            setCurrentPodcast(existingPodcast);
            setPodcastType(determinePodcastType(existingPodcast));
            setPodcastState('ready');
            return;
          } else {

            setPodcastState('generating');
            return;
          }
        }

        // Vérifier l'API pour les podcasts existants
        try {
          // ✅ Utiliser la session Concierge
          const hotelSessionId = localStorage.getItem('hotel_session_id');
          
          if (!hotelSessionId) {
            console.log('%c⚠️ PAS DE SESSION CONCIERGE', 'background: #f59e0b; color: white; font-weight: bold; padding: 4px 8px;');
            setPodcastState('choosing');
            return;
          }
          
          console.log('%c📜 RÉCUPÉRATION HISTORIQUE PODCASTS', 'background: #3b82f6; color: white; font-weight: bold; padding: 4px 8px;', {
            hotelSessionId
          });
          
          const history = await fetchPodcastHistory(hotelSessionId);
          
          console.log('%c✅ HISTORIQUE REÇU', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', {
            history,
            totalPodcasts: history.podcasts?.length || 0
          });
          
          // S'assurer que history est un array
          const historyArray = Array.isArray(history) ? history : (history.podcasts || []);
          const existingPodcast = historyArray.find((podcast: PodcastHistoryItem) => podcast.poi_id === poiId);
          
          if (existingPodcast) {
            console.log('%c🎧 PODCAST EXISTANT TROUVÉ', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', {
              poiId,
              podcastUrl: existingPodcast.podcast_url
            });
            setCurrentPodcast(existingPodcast);
            setPodcastType(determinePodcastType(existingPodcast));
            setPodcastState('ready');
          } else {
            console.log('%c⚠️ AUCUN PODCAST TROUVÉ', 'background: #f59e0b; color: white; font-weight: bold; padding: 4px 8px;', {
              poiId,
              message: 'Génération d\'un nouveau podcast'
            });
            setPodcastState('choosing');
          }
        } catch (apiError) {
          console.error('%c❌ ERREUR HISTORIQUE', 'background: #ef4444; color: white; font-weight: bold; padding: 4px 8px;', apiError);
          setPodcastState('choosing');
        }
      } catch (error) {

        setPodcastState('choosing');
      }
    };

    checkExistingPodcast();
  }, [poiId, getPodcastFromLocalStorage, isGeneratingPersisted]);

  // Fonction pour générer un podcast
  const handleGeneratePodcast = useCallback(async () => {
    // ✅ RÉCUPÉRER LA SESSION CONCIERGE au lieu de la session Genie
    const hotelSessionId = localStorage.getItem('hotel_session_id');
    
    if (!hotelSessionId) {
      console.error('%c❌ SESSION CONCIERGE MANQUANTE', 'background: #ef4444; color: white; font-weight: bold; padding: 4px 8px;');
      setPodcastGenerationError('Session concierge non disponible');
      return;
    }

    console.log('%c🎙️ DÉBUT GÉNÉRATION PODCAST', 'background: #8b5cf6; color: white; font-weight: bold; padding: 4px 8px;', {
      activityId,
      poiId,
      hotelSessionId,
      voice: 'nova',
      forceRegenerate: false
    });

    setPodcastType('generic');
    setPodcastState('generating');
    setGeneratingState(poiId, true); // Marquer comme en cours de génération
    setPodcastGenerationError(null);

    try {
      // ✅ Utiliser hotelSessionId au lieu de sessionData.session_id
      const podcastData = await generatePodcast(activityId, poiId, hotelSessionId, 'nova', false);

      // Sauvegarder le podcast
      savePodcastToLocalStorage(poiId, podcastData);
      setCurrentPodcast(podcastData);
      // Le type est déjà défini au début de la fonction (generic)
      
      // Passer à l'état ready immédiatement dès que le podcast est prêt
      setPodcastState('ready');
      setGeneratingState(poiId, false);
      
    } catch (error) {

      setPodcastGenerationError(error instanceof Error ? error.message : t('error.podcastPlay'));
      setPodcastState('choosing');
      setGeneratingState(poiId, false); // Nettoyer en cas d'erreur
    }
  }, [activityId, poiId, savePodcastToLocalStorage, setGeneratingState, t]);

  // Lancer automatiquement la génération du podcast générique si aucun podcast n'existe
  useEffect(() => {
    const hotelSessionId = localStorage.getItem('hotel_session_id');
    if (podcastState === 'choosing' && !autoGenerateAttempted && hotelSessionId) {
      setAutoGenerateAttempted(true);
      handleGeneratePodcast();
    }
  }, [podcastState, autoGenerateAttempted, handleGeneratePodcast]);

  // Fonction pour créer une conversation de podcast personnalisé
  const handlePersonalizedPodcast = useCallback(async () => {
    if (!sessionData?.session_id) {

      setPodcastGenerationError('Session non disponible');
      return;
    }


    setPodcastType('personalized');
    setIsCreatingConversation(true);
    setPodcastGenerationError(null);

    // Store activityId and poiId in sessionStorage with independent keys
    sessionStorage.setItem('podcast_current_activity_id', activityId);
    sessionStorage.setItem('podcast_current_poi_id', poiId);

    try {

      // Récupérer le nom du POI depuis les données de session
      const poiName = sessionData?.matched_activities
        ?.flatMap(activity => activity.pois_coordinates || [])
        ?.find(poi => poi.poi_id === poiId)?.name || 'POI';

      const conversationResponse = await startConversation(
        sessionData.session_id,
        'custom_podcast',
        currentLanguage,
        LE_HAVRE_CITY_ID,
        {
          poiId: poiId,
          activityId: activityId,
          poiName: poiName
        }
      );


      // Naviguer vers la page de chat
      navigate('/chat');

    } catch (error) {

      setPodcastGenerationError(error instanceof Error ? error.message : t('error.conversationCreate'));
    } finally {
      setIsCreatingConversation(false);
    }
  }, [poiId, activityId, sessionData?.session_id, currentLanguage, navigate]);

  // Fonction pour mettre en pause/reprendre le podcast
  const handleTogglePodcastPlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPodcastPaused) {

        audioRef.current.play().catch(error => {

          if (error.name !== 'AbortError') {
            setPodcastGenerationError(t('error.podcastPlay'));
          }
        });
        setIsPodcastPaused(false);
      } else {

        audioRef.current.pause();
        setIsPodcastPaused(true);
      }
    } else {

    }
  }, [isPodcastPaused]);

  // Fonction pour calculer le temps basé sur la position X
  const calculateTimeFromPosition = useCallback((clientX: number, timelineRect: DOMRect): number => {
    const relativeX = clientX - timelineRect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / timelineRect.width));
    return percentage * podcastDuration;
  }, [podcastDuration]);

  // Fonction pour mettre à jour la position du podcast
  const seekToTime = useCallback((time: number) => {
    if (audioRef.current && podcastDuration > 0) {
      const clampedTime = Math.max(0, Math.min(time, podcastDuration));
      audioRef.current.currentTime = clampedTime;
      setPodcastProgress(clampedTime);

    }
  }, [podcastDuration]);

  // Gestionnaires pour le drag de la timeline
  const handleTimelineMouseDown = useCallback((e: React.MouseEvent) => {
    if (!timelineRef.current || !audioLoaded) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStartX(e.clientX);
    
    const rect = timelineRef.current.getBoundingClientRect();
    setTimelineWidth(rect.width);
    
    // Seek immédiatement à la position cliquée
    const newTime = calculateTimeFromPosition(e.clientX, rect);
    seekToTime(newTime);
    

  }, [audioLoaded, calculateTimeFromPosition, seekToTime]);

  const handleTimelineMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;
    
    e.preventDefault();
    const rect = timelineRef.current.getBoundingClientRect();
    const newTime = calculateTimeFromPosition(e.clientX, rect);
    seekToTime(newTime);
  }, [isDragging, calculateTimeFromPosition, seekToTime]);

  const handleTimelineMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);

    }
  }, [isDragging]);

  // Gestionnaires pour le touch (mobile)
  const handleTimelineTouchStart = useCallback((e: React.TouchEvent) => {
    if (!timelineRef.current || !audioLoaded) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
    
    const rect = timelineRef.current.getBoundingClientRect();
    setTimelineWidth(rect.width);
    
    // Seek immédiatement à la position touchée
    const newTime = calculateTimeFromPosition(e.touches[0].clientX, rect);
    seekToTime(newTime);
    

  }, [audioLoaded, calculateTimeFromPosition, seekToTime]);

  const handleTimelineTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !timelineRef.current) return;
    
    e.preventDefault();
    const rect = timelineRef.current.getBoundingClientRect();
    const newTime = calculateTimeFromPosition(e.touches[0].clientX, rect);
    seekToTime(newTime);
  }, [isDragging, calculateTimeFromPosition, seekToTime]);

  const handleTimelineTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);

    }
  }, [isDragging]);

  // Écouteurs d'événements globaux pour gérer le mouseup/touchend en dehors de la timeline
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const newTime = calculateTimeFromPosition(e.clientX, rect);
        seekToTime(newTime);
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && timelineRef.current) {
        e.preventDefault();
        const rect = timelineRef.current.getBoundingClientRect();
        const newTime = calculateTimeFromPosition(e.touches[0].clientX, rect);
        seekToTime(newTime);
      }
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('touchend', handleGlobalTouchEnd);
      window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    }

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
    };
  }, [isDragging, calculateTimeFromPosition, seekToTime]);

  // Gestionnaires d'événements audio
  const handlePodcastTimeUpdate = useCallback(() => {
    if (audioRef.current && !isDragging) {
      setPodcastProgress(audioRef.current.currentTime);
    }
  }, [isDragging]);

  const handlePodcastLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setPodcastDuration(audioRef.current.duration);
      setAudioLoaded(true);
    }
  }, []);

  const handlePodcastEnded = useCallback(() => {

    setPodcastProgress(0);
    setIsPodcastPaused(false);
    setPodcastState('ready');
  }, []);

  const handlePodcastError = useCallback((error: any) => {

    setPodcastGenerationError(t('error.podcastPlay'));
  }, []);

  const handlePodcastCanPlay = useCallback(() => {

    setAudioLoaded(true);
  }, []);

  const handlePodcastPlay = useCallback(() => {

    setIsPodcastPaused(false);
    setPodcastState('playing');
  }, []);

  const handlePodcastPause = useCallback(() => {

    setIsPodcastPaused(true);
  }, []);

  // Fonction pour formater le temps
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full relative" style={{ backgroundColor: 'var(--color-primary)' }}>
      {/* Image fixe du POI (comme slideshow mais image unique) */}
      {poiVideoUrl ? (
        <div className="absolute inset-0 z-0" style={{ backgroundColor: 'var(--color-primary)' }}>
          <VideoPlayer
            src={poiVideoUrl}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
          />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
          <p className="text-gray-500">{t('common.noVideo')}</p>
        </div>
      )}

      

      {/* Modal de choix supprimé - génération automatique du podcast générique */}

      {/* Modal de chargement - centré dans le header */}
      {/* Afficher le modal SI : en train de générer OU si on n'a pas encore de podcast */}
      {(podcastState === 'generating' || !currentPodcast) && (() => {
        console.log('%c🎙️ MODAL GENERATION VISIBLE', 'background: #f59e0b; color: white; font-weight: bold; padding: 4px 8px;', { 
          podcastState, 
          hasPodcast: !!currentPodcast,
          showModal: true 
        });
        return (
          <div className="absolute inset-0 flex justify-center items-center z-[100] pointer-events-none">
            <div className="relative w-full max-w-[316px] mx-[30px] mt-[30px] pointer-events-auto">
              <div className="bg-[#f4f9fdcc] backdrop-blur-[1.5px] rounded-[7px] px-[21.8px] py-[29px] shadow-xl text-center"
                style={{ 
                  backdropFilter: 'blur(1.5px) brightness(100%)',
                  WebkitBackdropFilter: 'blur(1.5px) brightness(100%)'
                }}
              >
                
                
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#690217] border-t-transparent mx-auto mb-4"></div>
                <div className="text-base font-semibold mb-2" style={{ color: '#690217', fontFamily: 'Inter' }}>{t('podcast.generating')}</div>
                <div className="text-sm text-[#00000099]" style={{ fontFamily: 'Inter' }}>{t('podcast.generatingSubtitle')}</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Lecteur de podcast - style Figma translucide et compact, centré dans le header */}
      {(podcastState === 'ready' || podcastState === 'playing') && currentPodcast && (
        <div className="absolute inset-0 flex justify-center items-center z-20">
          {/* Modal encadré - style Figma */}
          <div className="relative w-full max-w-[316px] mx-[30px] mt-[30px]">
            <div className="bg-[#f4f9fdcc] backdrop-blur-[1.5px] rounded-[7px] px-[21.8px] py-[29px] shadow-xl"
              style={{ 
                backdropFilter: 'blur(1.5px) brightness(100%)',
                WebkitBackdropFilter: 'blur(1.5px) brightness(100%)'
              }}
            >
            
            {/* Container principal - Layout Figma : titre à gauche, play à droite */}
            <div className="flex items-start justify-between mb-4">
              {/* Colonne gauche : Titre + durée */}
              <div className="flex-1 pr-2">
                <h3 
                  className="text-base leading-[18px] font-bold mb-[15px]"
                  style={{ 
                    color: activityColor || '#690217',
                    fontFamily: 'Inter',
                    fontWeight: 700,
                    letterSpacing: '0'
                  }}
                >
                  PODCAST
                </h3>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-3.5 h-3.5" style={{ color: '#00000099' }} />
                  <span className="text-sm text-[#00000099] font-normal" style={{ fontFamily: 'Inter' }}>
                    {Math.round(podcastDuration / 60)} {t('common.minPodcast')}
                  </span>
                </div>
              </div>
              
              {/* Colonne droite : Bouton Play/Pause */}
              <button
                onClick={handleTogglePodcastPlayPause}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-105 flex-shrink-0"
              >
                {isPodcastPaused ? (
                  <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: activityColor || '#690217' }}>
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: activityColor || '#690217' }}>
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                )}
              </button>
            </div>
            
            {/* Timeline - en bas */}
            <div className="w-full">
              <div 
                ref={timelineRef}
                className="relative w-full bg-[#eabdc6] rounded-[90px] h-[6px] mb-2.5 cursor-pointer"
                onMouseDown={handleTimelineMouseDown}
                onMouseMove={handleTimelineMouseMove}
                onMouseUp={handleTimelineMouseUp}
                onTouchStart={handleTimelineTouchStart}
                onTouchMove={handleTimelineTouchMove}
                onTouchEnd={handleTimelineTouchEnd}
                style={{ touchAction: 'none' }}
              >
                {/* Progression */}
                <div 
                  className="h-[6px] rounded-[90px] absolute top-0 left-0"
                  style={{ 
                    width: `${podcastDuration > 0 ? (podcastProgress / podcastDuration) * 100 : 0}%`,
                    backgroundColor: '#ffffff'
                  }}
                ></div>
                {/* Thumb */}
                <div 
                  className={`absolute top-1/2 transform -translate-y-1/2 w-[11px] h-[11px] bg-white rounded-[5.5px] shadow-[-1px_0px_1px_#00000066] transition-transform ${
                    isDragging ? 'scale-125' : 'scale-100'
                  } cursor-pointer`}
                  style={{ 
                    left: `${podcastDuration > 0 ? (podcastProgress / podcastDuration) * 100 : 0}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                ></div>
              </div>
              {/* Temps */}
              <div className="flex justify-between text-xs text-[#00000099]" style={{ fontFamily: 'Inter' }}>
                <span>{formatTime(podcastProgress)}</span>
                <span>{formatTime(podcastDuration)}</span>
              </div>
            </div>

            {/* Audio element */}
            <audio
              ref={audioRef}
              src={currentPodcast.podcast_url}
              autoPlay
              onTimeUpdate={handlePodcastTimeUpdate}
              onLoadedMetadata={handlePodcastLoadedMetadata}
              onEnded={handlePodcastEnded}
              onError={handlePodcastError}
              onCanPlay={handlePodcastCanPlay}
              onPlay={handlePodcastPlay}
              onPause={handlePodcastPause}
              preload="metadata"
            />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


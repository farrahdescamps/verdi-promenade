import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import React, { useState, useEffect, useCallback } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { useVideoPreloader } from "../hooks/useVideoPreloader";
import { Theme } from "../services/themeService";
import { useTranslation } from "../locales";
import { useSession } from "../contexts/SessionContext";
import { HeartIcon, XIcon } from "./icons";

interface CardStackProps {
  themes: Theme[];
  onAllCardsSwiped?: () => void;
}

export const CardStack = ({ themes, onAllCardsSwiped }: CardStackProps): JSX.Element => {
  const { currentLanguage } = useTranslation();
  const { sessionData, updateLikedThemes } = useSession();
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [likedThemeIds, setLikedThemeIds] = useState<string[]>(
    sessionData?.liked_themes || []
  );
  
  // Extraire les URLs des vidéos pour le préchargement
  const videoUrls = themes.map(theme => theme.video_url);
  
  // Hook de préchargement des vidéos - Préchargement agressif pour éviter les délais
  const { preloadOnHoverHandler, getPreloadedVideo, queuePreload, preloadMultipleVideos } = useVideoPreloader(
    videoUrls,
    currentCardIndex,
    {
      preloadCount: 5, // Précharger 5 vidéos suivantes
      preloadOnHover: true,
      cacheSize: 8 // Garder 8 vidéos en cache
    }
  );

  // Précharger toutes les vidéos au démarrage pour une expérience fluide
  useEffect(() => {
    if (themes.length > 0) {
      // Utiliser le préchargement en parallèle pour un chargement plus rapide
      preloadMultipleVideos(videoUrls);
    }
  }, [themes, preloadMultipleVideos, videoUrls]);


  
  // États pour la gestion du swipe
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [deltaX, setDeltaX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [cardTransformStyle, setCardTransformStyle] = useState("translateX(0px) rotate(0deg)");
  const [isAnimating, setIsAnimating] = useState(false);
  const [buttonFeedback, setButtonFeedback] = useState<'like' | 'dislike' | null>(null);

  // Fonction pour obtenir le nom du thème dans la langue actuelle
  const getThemeName = (theme: Theme): string => {
    // L'API retourne déjà le nom traduit dans la langue demandée
    return theme.name || 'Thème sans nom';
  };

  const currentTheme = themes[currentCardIndex];

  const handleMouseEnter = useCallback(() => {
    // Précharger la vidéo au survol si la carte existe
    if (currentTheme?.video_url) {
      preloadOnHoverHandler(currentTheme.video_url);
    }
  }, [currentTheme?.video_url, preloadOnHoverHandler]);
  
  const swipeThreshold = 100; // pixels

  // Fonction pour passer à la carte suivante
  const nextCard = useCallback(() => {
    setCurrentCardIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      return nextIndex;
    });
  }, []);

  // Détecter quand toutes les cartes ont été swipées et appeler le callback
  useEffect(() => {
    if (currentCardIndex >= themes.length && onAllCardsSwiped) {
      // Utiliser un timeout pour éviter d'appeler setState pendant le rendu
      const timer = setTimeout(() => {
        onAllCardsSwiped();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentCardIndex, themes.length, onAllCardsSwiped]);

  // Gestionnaires d'événements pour le swipe
  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isAnimating) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setCurrentX(clientX);
    setIsDragging(true);
    setDeltaX(0);
  }, [isAnimating]);

  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || isAnimating) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setCurrentX(clientX);
    const newDeltaX = clientX - startX;
    setDeltaX(newDeltaX);
    
    // Appliquer la transformation en temps réel
    const rotation = newDeltaX / 10; // Ajuster la sensibilité de rotation
    setCardTransformStyle(`translateX(${newDeltaX}px) rotate(${rotation}deg)`);
  }, [isDragging, startX, isAnimating]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging || isAnimating) return;
    
    setIsDragging(false);
    
    if (Math.abs(deltaX) > swipeThreshold) {
      // Swipe significatif - déclencher l'animation de sortie
      const direction = deltaX > 0 ? 'right' : 'left';
      triggerSwipeAnimation(direction);
    } else {
      // Pas assez de mouvement - retour à la position initiale
      setIsAnimating(true);
      setCardTransformStyle("translateX(0px) rotate(0deg)");
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  }, [isDragging, deltaX, isAnimating]);

  // Fonction pour déclencher l'animation de swipe
  const triggerSwipeAnimation = useCallback((direction: 'left' | 'right') => {
    if (!currentTheme) return; // Garde de sécurité
    
    setIsAnimating(true);
    
    // Si c'est un swipe vers la droite (like), ajouter aux thèmes likés
    if (direction === 'right') {
      const currentThemeId = currentTheme.id;
      const newLikedThemes = [...likedThemeIds, currentThemeId];
      setLikedThemeIds(newLikedThemes);
      
      updateLikedThemes(newLikedThemes).catch(error => {
      });
    }
    
    const translateX = direction === 'right' ? 500 : -500;
    const rotation = direction === 'right' ? 30 : -30;
    
    setCardTransformStyle(`translateX(${translateX}px) rotate(${rotation}deg)`);
  }, [currentTheme, likedThemeIds, updateLikedThemes]);

  // Gestionnaire pour la fin de transition
  const handleTransitionEnd = useCallback(() => {
    if (isAnimating && (cardTransformStyle.includes('500px') || cardTransformStyle.includes('-500px'))) {
      // Animation de sortie terminée - passer à la carte suivante
      nextCard();
      setCardTransformStyle("translateX(0px) rotate(0deg)");
      setIsAnimating(false);
      setDeltaX(0);
    }
  }, [isAnimating, cardTransformStyle, nextCard]);

  // Gestionnaires pour les boutons
  const handleLike = useCallback(() => {
    if (isAnimating) return;
    setButtonFeedback('like');
    setTimeout(() => setButtonFeedback(null), 300);
    triggerSwipeAnimation('right');
  }, [isAnimating, triggerSwipeAnimation]);

  const handleDislike = useCallback(() => {
    if (isAnimating) return;
    setButtonFeedback('dislike');
    setTimeout(() => setButtonFeedback(null), 300);
    triggerSwipeAnimation('left');
  }, [isAnimating, triggerSwipeAnimation]);

  // Écouteurs d'événements globaux pour gérer le mouseup/touchend en dehors de la carte
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDragging) {
        handlePointerUp();
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handlePointerMove(e as any);
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault(); // Empêcher le scroll pendant le swipe
        handlePointerMove(e as any);
      }
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalPointerUp);
      window.addEventListener('touchend', handleGlobalPointerUp);
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    }

    return () => {
      window.removeEventListener('mouseup', handleGlobalPointerUp);
      window.removeEventListener('touchend', handleGlobalPointerUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
    };
  }, [isDragging, handlePointerUp, handlePointerMove]);

  // Si pas de thèmes ou index invalide, retourner un div vide (transition en cours)
  if (!themes.length || currentCardIndex >= themes.length || !currentTheme) {
    return <div className="flex items-center justify-center w-full h-full" />;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4">
      {/* Carte principale centrée */}
      <div className="relative w-full max-w-[min(340px,80vw)]">
        <Card 
          className={`w-full rounded-[4px] bg-white shadow-2xl border-[8px] border-white cursor-grab active:cursor-grabbing select-none ${
            isAnimating ? 'transition-transform duration-300 ease-out' : ''
          }`}
          style={{ 
            transform: cardTransformStyle,
            touchAction: 'none' // Empêcher les gestes par défaut du navigateur
          }}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          onMouseEnter={handleMouseEnter}
          onTransitionEnd={handleTransitionEnd}
          key={currentTheme.id}
        >
          <CardContent className="p-0 flex flex-col">
            {/* Container vidéo avec position relative pour les overlays */}
            <div className="relative w-full aspect-[3/4] max-h-[35vh] overflow-hidden rounded-t-[4px]">
              {/* Vidéo optimisée avec préchargement */}
              <VideoPlayer
                src={currentTheme.video_url}
                className="w-full h-full pointer-events-none object-cover"
                autoPlay={true}
                loop={true}
                muted={true}
                playsInline={true}
                preload="metadata"
                priority={currentCardIndex === 0} // Priorité pour la première carte
              />
              
              {/* Indicateurs visuels de swipe */}
              {(isDragging || buttonFeedback) && (
                <>
                  {(deltaX > 50 || buttonFeedback === 'like') && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded-t-[4px]">
                      <div className="w-12 h-12 flex items-center justify-center">
                        <HeartIcon />
                      </div>
                    </div>
                  )}
                  {(deltaX < -50 || buttonFeedback === 'dislike') && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center rounded-t-[4px]">
                      <div className="w-12 h-12 flex items-center justify-center">
                        <XIcon />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Titre qui change selon le thème courant - Dans le flux normal */}
            <div className="bg-white h-[60px] flex items-center justify-center flex-shrink-0 rounded-b-[4px]">
              <h2 className="text-black text-lg font-bold tracking-[1.40px] pointer-events-none text-center px-2">
                {getThemeName(currentTheme)}
              </h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Boutons d'action espacés */}
      <div className="flex justify-center gap-6 mt-4">
        <Button
          onClick={handleDislike}
          variant="default"
          size="icon"
          className="w-[50px] h-[50px] rounded-full bg-black hover:bg-black/90 shadow-lg transition-transform hover:scale-110 flex items-center justify-center p-2"
          disabled={isAnimating}
        >
          <XIcon />
        </Button>

        <Button
          onClick={handleLike}
          variant="ghost"
          size="icon"
          className="w-[50px] h-[50px] rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm shadow-lg transition-transform hover:scale-110 flex items-center justify-center p-2"
          disabled={isAnimating}
        >
          <HeartIcon />
        </Button>
      </div>
    </div>
  );
};
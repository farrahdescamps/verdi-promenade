import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from '../locales';

interface VideoPlayerProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  onLoadStart?: () => void;
  onCanPlay?: () => void;
  onContentReady?: () => void;
  onError?: (error: any) => void;
  poster?: string;
  priority?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  className = '',
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  preload = 'metadata',
  onLoadStart,
  onCanPlay,
  onContentReady,
  onError,
  poster,
  priority = false
}) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  // Don't render anything if no src is provided
  if (!src) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-sm">Aucune vidéo disponible</div>
          </div>
        </div>
      </div>
    );
  }

  // Intersection Observer pour le lazy loading
  useEffect(() => {
    if (!priority && videoRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px', // Commencer à charger 50px avant d'être visible
          threshold: 0.1
        }
      );

      observer.observe(videoRef.current);

      return () => {
        if (videoRef.current) {
          observer.unobserve(videoRef.current);
        }
      };
    } else {
      // Si priorité haute, charger immédiatement
      setIsVisible(true);
    }
  }, [priority]);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    
    // Détecter l'orientation de la vidéo
    if (videoRef.current) {
      const video = videoRef.current;
      const aspectRatio = video.videoWidth / video.videoHeight;
      setIsLandscape(aspectRatio > 1);
    }
    
    onCanPlay?.();
    onContentReady?.();
  }, [onCanPlay]);

  const handleError = useCallback((error: any) => {
    setIsLoading(false);
    setHasError(true);

    onError?.(error);
  }, [onError]);

  // Préchargement intelligent
  const handleMouseEnter = useCallback(() => {
    if (videoRef.current && !isVisible) {
      setIsVisible(true);
    }
  }, [isVisible]);

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      {/* Loading placeholder */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}

      {/* Error placeholder */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-sm">{t('error.loading')}</div>
            <div className="text-xs mt-1">Vidéo indisponible</div>
          </div>
        </div>
      )}

      {/* Video element */}
      {(isVisible || priority) && (
        <div className="w-full h-full bg-gray-900">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            playsInline={playsInline}
            preload={preload}
            poster={poster}
            onLoadStart={handleLoadStart}
            onCanPlay={handleCanPlay}
            onError={handleError}
          >
            <source src={src} type="video/mp4" />
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        </div>
      )}
    </div>
  );
};
import { useEffect, useRef, useState } from 'react';

interface VideoPreloaderOptions {
  preloadCount?: number;
  preloadOnHover?: boolean;
  cacheSize?: number;
}

interface PreloadedVideo {
  url: string;
  element: HTMLVideoElement;
  loaded: boolean;
  error: boolean;
}

export const useVideoPreloader = (
  videoUrls: string[],
  currentIndex: number,
  options: VideoPreloaderOptions = {}
) => {
  const {
    preloadCount = 2,
    preloadOnHover = true,
    cacheSize = 5
  } = options;

  const [preloadedVideos, setPreloadedVideos] = useState<Map<string, PreloadedVideo>>(new Map());
  const preloadQueueRef = useRef<string[]>([]);
  const isPreloadingRef = useRef(false);

  // Fonction pour précharger une vidéo
  const preloadVideo = async (url: string): Promise<HTMLVideoElement> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'auto'; // Chargement complet pour éviter les délais
      video.muted = true;
      video.playsInline = true;

      const handleCanPlay = () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
        resolve(video);
      };

      const handleError = () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
        reject(new Error(`Failed to preload video: ${url}`));
      };

      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);
      video.src = url;
    });
  };

  // Fonction pour gérer la file d'attente de préchargement
  const processPreloadQueue = async () => {
    if (isPreloadingRef.current || preloadQueueRef.current.length === 0) {
      return;
    }

    isPreloadingRef.current = true;
    const url = preloadQueueRef.current.shift()!;

    try {
      const video = await preloadVideo(url);
      setPreloadedVideos(prev => {
        const newMap = new Map(prev);
        newMap.set(url, {
          url,
          element: video,
          loaded: true,
          error: false
        });

        // Limiter la taille du cache
        if (newMap.size > cacheSize) {
          const firstKey = newMap.keys().next().value;
          const firstVideo = newMap.get(firstKey);
          if (firstVideo) {
            firstVideo.element.src = '';
            newMap.delete(firstKey);
          }
        }

        return newMap;
      });
    } catch (error) {
      setPreloadedVideos(prev => {
        const newMap = new Map(prev);
        newMap.set(url, {
          url,
          element: document.createElement('video'),
          loaded: false,
          error: true
        });
        return newMap;
      });
    }

    isPreloadingRef.current = false;
    
    // Traiter le prochain élément de la file
    if (preloadQueueRef.current.length > 0) {
      setTimeout(processPreloadQueue, 100);
    }
  };

  // Ajouter des vidéos à la file de préchargement
  const queuePreload = (urls: string[]) => {
    urls.forEach(url => {
      if (!preloadedVideos.has(url) && !preloadQueueRef.current.includes(url)) {
        preloadQueueRef.current.push(url);
      }
    });
    processPreloadQueue();
  };

  // Précharger plusieurs vidéos en parallèle pour un chargement plus rapide
  const preloadMultipleVideos = async (urls: string[]) => {
    const validUrls = urls.filter(url => !preloadedVideos.has(url));
    if (validUrls.length === 0) return;

    
    // Précharger jusqu'à 3 vidéos en parallèle pour éviter la surcharge
    const batchSize = 3;
    for (let i = 0; i < validUrls.length; i += batchSize) {
      const batch = validUrls.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map(url => 
          preloadVideo(url).then(video => {
            setPreloadedVideos(prev => {
              const newMap = new Map(prev);
              newMap.set(url, {
                url,
                element: video,
                loaded: true,
                error: false
              });
              return newMap;
            });
          }).catch(error => {
            setPreloadedVideos(prev => {
              const newMap = new Map(prev);
              newMap.set(url, {
                url,
                element: document.createElement('video'),
                loaded: false,
                error: true
              });
              return newMap;
            });
          })
        )
      );
      
      // Petite pause entre les batches pour éviter la surcharge
      if (i + batchSize < validUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  };

  // Précharger les vidéos suivantes automatiquement
  useEffect(() => {
    const urlsToPreload: string[] = [];
    
    // Précharger les vidéos suivantes
    for (let i = 1; i <= preloadCount; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < videoUrls.length) {
        urlsToPreload.push(videoUrls[nextIndex]);
      }
    }

    // Précharger aussi la vidéo précédente si elle existe
    if (currentIndex > 0) {
      urlsToPreload.push(videoUrls[currentIndex - 1]);
    }

    queuePreload(urlsToPreload);
  }, [currentIndex, videoUrls, preloadCount]);

  // Fonction pour précharger au survol
  const preloadOnHoverHandler = (url: string) => {
    if (preloadOnHover && !preloadedVideos.has(url)) {
      queuePreload([url]);
    }
  };

  // Obtenir une vidéo préchargée
  const getPreloadedVideo = (url: string): HTMLVideoElement | null => {
    const preloaded = preloadedVideos.get(url);
    return preloaded?.loaded ? preloaded.element : null;
  };

  // Nettoyer les ressources
  useEffect(() => {
    return () => {
      preloadedVideos.forEach(video => {
        if (video.element) {
          video.element.src = '';
        }
      });
    };
  }, []);

  return {
    preloadedVideos,
    preloadOnHoverHandler,
    getPreloadedVideo,
    queuePreload,
    preloadMultipleVideos
  };
};
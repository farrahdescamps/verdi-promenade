import { useEffect, useRef } from 'react';

interface VideoCacheConfig {
  maxCacheSize: number;
  preloadDistance: number;
  cleanupInterval: number;
}

class VideoCache {
  private cache = new Map<string, HTMLVideoElement>();
  private loadingPromises = new Map<string, Promise<HTMLVideoElement>>();
  private config: VideoCacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: VideoCacheConfig) {
    this.config = config;
    this.startCleanupTimer();
  }

  private startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup() {
    if (this.cache.size <= this.config.maxCacheSize) return;

    // Supprimer les vidéos les plus anciennes
    const entries = Array.from(this.cache.entries());
    const toRemove = entries.slice(0, entries.length - this.config.maxCacheSize);
    
    toRemove.forEach(([url, video]) => {
      video.src = '';
      video.load();
      this.cache.delete(url);
    });
  }

  async preloadVideo(url: string): Promise<HTMLVideoElement> {
    // Si déjà en cache, retourner immédiatement
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    // Si déjà en cours de chargement, attendre la promesse existante
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Créer une nouvelle promesse de chargement
    const loadingPromise = new Promise<HTMLVideoElement>((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';

      const handleCanPlay = () => {
        cleanup();
        this.cache.set(url, video);
        this.loadingPromises.delete(url);
        resolve(video);
      };

      const handleError = (error: any) => {
        cleanup();
        this.loadingPromises.delete(url);
        reject(error);
      };

      const cleanup = () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
      };

      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);
      
      // Démarrer le chargement
      video.src = url;
    });

    this.loadingPromises.set(url, loadingPromise);
    return loadingPromise;
  }

  getVideo(url: string): HTMLVideoElement | null {
    return this.cache.get(url) || null;
  }

  preloadBatch(urls: string[]): Promise<HTMLVideoElement[]> {
    return Promise.allSettled(
      urls.map(url => this.preloadVideo(url))
    ).then(results => 
      results
        .filter((result): result is PromiseFulfilledResult<HTMLVideoElement> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value)
    );
  }

  clear() {
    this.cache.forEach(video => {
      video.src = '';
      video.load();
    });
    this.cache.clear();
    this.loadingPromises.clear();
  }

  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// Instance globale du cache
let globalVideoCache: VideoCache | null = null;

export const useVideoCache = (config?: Partial<VideoCacheConfig>) => {
  const defaultConfig: VideoCacheConfig = {
    maxCacheSize: 5,
    preloadDistance: 2,
    cleanupInterval: 30000, // 30 secondes
  };

  const finalConfig = { ...defaultConfig, ...config };

  useEffect(() => {
    if (!globalVideoCache) {
      globalVideoCache = new VideoCache(finalConfig);
    }

    return () => {
      // Ne pas détruire le cache global ici car d'autres composants peuvent l'utiliser
    };
  }, []);

  return globalVideoCache;
};

// Hook pour nettoyer le cache global quand l'app se ferme
export const useGlobalVideoCacheCleanup = () => {
  useEffect(() => {
    return () => {
      if (globalVideoCache) {
        globalVideoCache.destroy();
        globalVideoCache = null;
      }
    };
  }, []);
};
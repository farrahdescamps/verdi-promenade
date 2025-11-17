/**
 * Service SSE (Server-Sent Events) pour le streaming en temps réel
 * Gère la connexion, la reconnexion automatique et les événements
 */

export interface SSEEvent {
  type: string;
  data: any;
  timestamp: number;
}

export interface SSECallbacks {
  onMessage?: (event: SSEEvent) => void;
  onProgress?: (progress: number, message?: string) => void;
  onComplete?: (data: any) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export interface SSEOptions {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  timeout?: number;
  headers?: Record<string, string>;
}

export class SSEService {
  private eventSource: EventSource | null = null;
  private callbacks: SSECallbacks = {};
  private options: Required<SSEOptions>;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isManualDisconnect = false;

  constructor(options: SSEOptions = {}) {
    this.options = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      timeout: 30000,
      headers: {},
      ...options
    };
  }

  /**
   * Connecter au flux SSE
   */
  connect(url: string, callbacks: SSECallbacks = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      this.callbacks = callbacks;
      this.isManualDisconnect = false;

      try {
        this.eventSource = new EventSource(url);

        // Gestion du timeout
        const timeoutId = setTimeout(() => {
          if (this.eventSource?.readyState !== EventSource.OPEN) {
            this.disconnect();
            reject(new Error('SSE connection timeout'));
          }
        }, this.options.timeout);

        // Connexion réussie
        this.eventSource.onopen = () => {
          clearTimeout(timeoutId);
          this.reconnectAttempts = 0;
          this.callbacks.onConnect?.();
          resolve();
        };

        // Réception de messages
        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const sseEvent: SSEEvent = {
              type: data.type || 'message',
              data: data.data || data,
              timestamp: Date.now()
            };
            
            this.handleMessage(sseEvent);
          } catch (error) {
            this.callbacks.onError?.(new Error('Invalid SSE message format'));
          }
        };

        // Gestion des erreurs
        this.eventSource.onerror = (event) => {
          clearTimeout(timeoutId);
          
          if (!this.isManualDisconnect) {
            this.handleReconnect(url);
          }
          
          this.callbacks.onDisconnect?.();
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Déconnecter du flux SSE
   */
  disconnect(): void {
    this.isManualDisconnect = true;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    this.callbacks.onDisconnect?.();
  }

  /**
   * Vérifier si la connexion est active
   */
  get isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  /**
   * Gérer la reconnexion automatique
   */
  private handleReconnect(url: string): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.callbacks.onError?.(new Error('Max reconnection attempts reached'));
      return;
    }

    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      if (!this.isManualDisconnect) {
        this.connect(url, this.callbacks).catch((error) => {
          this.callbacks.onError?.(error);
        });
      }
    }, this.options.reconnectInterval);
  }

  /**
   * Traiter les messages reçus
   */
  private handleMessage(event: SSEEvent): void {
    switch (event.type) {
      case 'progress':
        const progress = event.data.progress || 0;
        const message = event.data.message;
        this.callbacks.onProgress?.(progress, message);
        break;
      
      case 'complete':
        this.callbacks.onComplete?.(event.data);
        break;
      
      case 'error':
        this.callbacks.onError?.(new Error(event.data.message || 'SSE error'));
        break;
      
      default:
        this.callbacks.onMessage?.(event);
        break;
    }
  }
}

/**
 * Instance singleton du service SSE
 */
export const sseService = new SSEService({
  reconnectInterval: 2000,
  maxReconnectAttempts: 3,
  timeout: 15000
});

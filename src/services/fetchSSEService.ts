/**
 * Service SSE utilisant fetch avec AbortController pour les requêtes POST
 * Compatible avec les endpoints backend qui attendent du POST
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
  headers?: Record<string, string>;
  timeout?: number;
}

export class FetchSSEService {
  private abortController: AbortController | null = null;
  private callbacks: SSECallbacks = {};
  private options: Required<SSEOptions>;
  private isConnected = false;

  constructor(options: SSEOptions = {}) {
    this.options = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...options.headers
      },
      timeout: 60000,
      ...options
    };
  }

  /**
   * Connecter au flux SSE avec une requête POST
   */
  async connect(url: string, body: any, callbacks: SSECallbacks = {}): Promise<void> {
    this.callbacks = callbacks;
    this.abortController = new AbortController();


    try {
      // Ajouter la clé API aux headers si disponible
      const apiKey = import.meta.env.VITE_API_KEY;
      const headers = { ...this.options.headers };
      
      if (apiKey && apiKey !== '<<ta_clef_api_si_vous_en_utilisez_une>>') {
        headers['x-api-key'] = apiKey;

      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      this.isConnected = true;

      this.callbacks.onConnect?.();

      // Lire le flux de données
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (this.isConnected && !this.abortController.signal.aborted) {
          const { done, value } = await reader.read();
          
          if (done) {

            break;
          }

          // Décoder les données reçues
          buffer += decoder.decode(value, { stream: true });
          
          // Traiter les messages complets
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Garder la ligne incomplète dans le buffer

          for (const line of lines) {
            if (line.trim() === '') continue;
            
            // Parser les événements SSE
            if (line.startsWith('data: ')) {
              const data = line.slice(6); // Enlever "data: "
              
              if (data === '[DONE]') {

                this.callbacks.onComplete?.({});
                break;
              }

              try {
                const parsedData = JSON.parse(data);
                const sseEvent: SSEEvent = {
                  type: parsedData.type || 'message',
                  data: parsedData,
                  timestamp: Date.now()
                };
                
                this.handleMessage(sseEvent);
              } catch (error) {

              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error) {

      this.isConnected = false;
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Déconnecter du flux SSE
   */
  disconnect(): void {

    this.isConnected = false;
    
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    
    this.callbacks.onDisconnect?.();
  }

  /**
   * Vérifier si la connexion est active
   */
  get connected(): boolean {
    return this.isConnected && !this.abortController?.signal.aborted;
  }

  /**
   * Traiter les messages reçus
   */
  private handleMessage(event: SSEEvent): void {
    switch (event.type) {
      case 'start':

        this.callbacks.onMessage?.(event);
        break;
      
      case 'progress':
        const progress = event.data.progress || 0;
        const message = event.data.message;

        this.callbacks.onProgress?.(progress, message);
        break;
      
      case 'chunk':
        this.callbacks.onMessage?.(event);
        break;
      
      case 'conversation_saved':

        this.callbacks.onMessage?.(event);
        break;
      
      case 'complete':

        this.callbacks.onComplete?.(event.data);
        break;
      
      case 'error':

        this.callbacks.onError?.(new Error(event.data.error || 'SSE error'));
        break;
      
      default:
        this.callbacks.onMessage?.(event);
        break;
    }
  }
}

/**
 * Instance singleton du service SSE avec fetch
 */
export const fetchSSEService = new FetchSSEService({
  timeout: 60000
});

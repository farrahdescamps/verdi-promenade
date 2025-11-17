/**
 * Service d'analyse POI avec support SSE et fallback API
 * Gère le streaming en temps réel avec reconnexion automatique
 */

import { fetchSSEService, SSEEvent } from './fetchSSEService';
import { API_BASE_URL, apiHeaders, handleApiResponse } from '../config';

// Types existants de l'API
export interface POIAnalysisRequest {
  activity_id: string;
  question: string;
  session_id: string;
  activity_name: string;
}

export interface POIAnalysisResponse {
  answer: string;
  conversation_id?: string;
  metadata?: {
    processing_time?: number;
    tokens_used?: number;
    model_version?: string;
  };
}

// Types pour le streaming SSE - Cohérents avec le backend
export interface POIStreamingRequest {
  activity_id: string;
  question: string;
  session_id?: string;            // Optionnel, pour sauvegarder la conversation
  activity_name?: string;         // Optionnel, nom de l'activité
}

// Types de réponse SSE - Cohérents avec le backend
export interface POIStreamingResponse {
  type: 'start' | 'progress' | 'chunk' | 'conversation_saved' | 'complete' | 'error';
  message?: string;                // Message descriptif
  step?: string;                   // Étape en cours
  progress?: number;               // Pourcentage (0-100)
  content?: string;                // Contenu du chunk
  fullResponse?: string;           // Réponse complète accumulée
  tokenCount?: number;             // Nombre de tokens générés
  conversation_id?: string;        // ID de conversation sauvegardée
  is_new_conversation?: boolean;   // Nouvelle conversation ou mise à jour
  metadata?: {                    // Métadonnées finales
    totalTokens?: number;
    processingTime?: number;
    language?: string;
  };
  error?: string;                  // Message d'erreur
  timestamp: string;               // Horodatage ISO
}

export interface POIAnalysisCallbacks {
  onStart?: (event: POIStreamingResponse) => void;
  onProgress?: (progress: number, message?: string, step?: string) => void;
  onChunk?: (content: string, fullResponse?: string, tokenCount?: number) => void;
  onConversationSaved?: (conversationId: string, isNew: boolean) => void;
  onComplete?: (response: POIAnalysisResponse) => void;
  onError?: (error: Error) => void;
}

export class POIAnalysisService {
  private isStreaming = false;
  private currentRequestId: string | null = null;
  private retryCount = 0;
  private maxRetries = 3;

  /**
   * Analyser avec streaming SSE (méthode principale)
   */
  async analyzeWithStreaming(
    request: POIStreamingRequest,
    callbacks: POIAnalysisCallbacks = {}
  ): Promise<POIAnalysisResponse> {
    if (this.isStreaming) {
      throw new Error('Une analyse est déjà en cours');
    }

    this.isStreaming = true;
    this.currentRequestId = `poi_analysis_${Date.now()}`;
    this.retryCount = 0; // Réinitialiser le compteur de retry


    try {
      // Construire l'URL SSE et le body pour POST
      const sseUrl = `${API_BASE_URL}/sse/poi-analysis`;
      const requestBody = this.buildSSEBody(request);
      
      // Variables pour accumuler la réponse
      let fullAnswer = '';
      let conversationId: string | undefined;
      let metadata: any = {};

      // Connexion SSE avec POST
      await fetchSSEService.connect(sseUrl, requestBody, {
        onConnect: () => {
        },

        onProgress: (progress, message) => {
          callbacks.onProgress?.(progress, message);
        },

        onMessage: (event: SSEEvent) => {
          
          const sseData = event.data as POIStreamingResponse;
          
          switch (sseData.type) {
            case 'start':
              callbacks.onStart?.(sseData);
              break;
            
            case 'progress':
              callbacks.onProgress?.(sseData.progress || 0, sseData.message, sseData.step);
              break;
            
            case 'chunk':
              if (sseData.content) {
                fullAnswer += sseData.content;
                callbacks.onChunk?.(sseData.content, sseData.fullResponse, sseData.tokenCount);
              }
              break;
            
            case 'conversation_saved':

              callbacks.onConversationSaved?.(sseData.conversation_id || '', sseData.is_new_conversation || false);
              conversationId = sseData.conversation_id;
              break;
            
            case 'complete':
              conversationId = sseData.conversation_id;
              metadata = sseData.metadata || {};
              break;
            
            case 'error':
              throw new Error(sseData.error || 'Erreur lors de l\'analyse POI');
          }
        },

        onComplete: (data) => {
          
          const response: POIAnalysisResponse = {
            answer: fullAnswer,
            conversation_id: conversationId,
            metadata: {
              processing_time: metadata.processing_time,
              tokens_used: metadata.tokens_used,
              model_version: metadata.model_version,
              ...metadata
            }
          };

          callbacks.onComplete?.(response);
        },

        onError: (error) => {

          throw error;
        },

        onDisconnect: () => {
        }
      });

      // Attendre la réponse complète
      return new Promise<POIAnalysisResponse>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout: Analyse POI non terminée'));
        }, 60000); // 60 secondes timeout

        const originalOnComplete = callbacks.onComplete;
        const originalOnError = callbacks.onError;

        callbacks.onComplete = (response) => {
          clearTimeout(timeout);
          fetchSSEService.disconnect();
          originalOnComplete?.(response);
          resolve(response);
        };

        callbacks.onError = (error) => {
          clearTimeout(timeout);
          fetchSSEService.disconnect();
          originalOnError?.(error);
          reject(error);
        };
      });

    } catch (error) {

      this.isStreaming = false;
      this.currentRequestId = null;
      
      // Retry SSE avec limite
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        return this.analyzeWithStreaming(request, callbacks);
      } else {

        this.retryCount = 0;
        return this.analyzeWithAPI(request, callbacks);
      }
    }
  }

  /**
   * Analyser avec l'API classique (fallback)
   */
  async analyzeWithAPI(
    request: POIStreamingRequest,
    callbacks: POIAnalysisCallbacks = {}
  ): Promise<POIAnalysisResponse> {

    const url = `${API_BASE_URL}/poi-analysis/analyze`;
    
    const apiRequest: POIAnalysisRequest = {
      activity_id: request.activity_id,
      question: request.question,
      session_id: request.session_id,
      activity_name: request.activity_name
    };

    // 🔍 LOG: Paramètres API classique

    // Simuler le progrès pour l'API classique
    callbacks.onProgress?.(10, 'Connexion à l\'API...');
    await this.delay(500);
    
    callbacks.onProgress?.(30, 'Traitement de votre question...');
    await this.delay(1000);
    
    callbacks.onProgress?.(60, 'Génération de la réponse...');
    await this.delay(1500);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify(apiRequest),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      callbacks.onProgress?.(90, 'Finalisation...');

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await handleApiResponse(response, url);
      callbacks.onProgress?.(100, 'Terminé');
      
      callbacks.onComplete?.(result);
      return result;

    } catch (error) {
      clearTimeout(timeoutId);

      callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Analyser avec streaming SSE forcé
   */
  async analyze(
    request: POIStreamingRequest,
    callbacks: POIAnalysisCallbacks = {}
  ): Promise<POIAnalysisResponse> {
    // Forcer l'utilisation du streaming SSE
    return await this.analyzeWithStreaming(request, callbacks);
  }

  /**
   * Construire le body SSE pour la requête POST
   */
  private buildSSEBody(request: POIStreamingRequest): any {
    const body: any = {
      activity_id: request.activity_id,
      question: request.question,
    };

    // Paramètres optionnels
    if (request.session_id) body.session_id = request.session_id;
    if (request.activity_name) body.activity_name = request.activity_name;

    // 🔍 LOG: Paramètres envoyés à poi-analysis

    return body;
  }

  /**
   * Délai utilitaire pour simuler le progrès
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Arrêter l'analyse en cours
   */
  stopAnalysis(): void {
    this.isStreaming = false;
    this.currentRequestId = null;
    fetchSSEService.disconnect();
  }

  /**
   * Vérifier si une analyse est en cours
   */
  get isAnalyzing(): boolean {
    return this.isStreaming;
  }
}

// Instance singleton
export const poiAnalysisService = new POIAnalysisService();

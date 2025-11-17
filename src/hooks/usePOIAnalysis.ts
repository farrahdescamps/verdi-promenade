/**
 * Hook personnalisé pour l'analyse POI avec streaming SSE
 * Gère l'état, les callbacks et l'interface avec le service
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { poiAnalysisService, POIStreamingRequest, POIAnalysisResponse } from '../services/poiAnalysisService';

export interface POIAnalysisState {
  isAnalyzing: boolean;
  progress: number;
  progressMessage: string;
  answer: string;
  conversationId?: string;
  error: string | null;
  metadata?: any;
}

export interface POIAnalysisCallbacks {
  onStart?: (event: any) => void;
  onProgress?: (progress: number, message: string, step?: string) => void;
  onChunk?: (content: string, fullResponse?: string, tokenCount?: number) => void;
  onConversationSaved?: (conversationId: string, isNew: boolean) => void;
  onComplete?: (response: POIAnalysisResponse) => void;
  onError?: (error: Error) => void;
}

export const usePOIAnalysis = () => {
  // État principal
  const [state, setState] = useState<POIAnalysisState>({
    isAnalyzing: false,
    progress: 0,
    progressMessage: '',
    answer: '',
    conversationId: undefined,
    error: null,
    metadata: undefined
  });

  // Refs pour éviter les re-renders inutiles
  const currentRequestRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Démarrer une analyse POI
   */
  const startAnalysis = useCallback(async (
    request: POIStreamingRequest,
    callbacks: POIAnalysisCallbacks = {}
  ): Promise<POIAnalysisResponse> => {
    // Générer un ID unique pour cette requête
    const requestId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    currentRequestRef.current = requestId;

    // Réinitialiser l'état
    setState({
      isAnalyzing: true,
      progress: 0,
      progressMessage: 'Initialisation...',
      answer: '',
      conversationId: undefined,
      error: null,
      metadata: undefined
    });


    try {
      // Créer un AbortController pour cette requête
      abortControllerRef.current = new AbortController();

      const response = await poiAnalysisService.analyze(request, {
        onStart: (event) => {
          if (currentRequestRef.current !== requestId) return;
          
          setState(prev => ({
            ...prev,
            progressMessage: event.message || 'Début de l\'analyse...'
          }));
          
          callbacks.onStart?.(event);
        },

        onProgress: (progress, message, step) => {
          // Vérifier que c'est toujours la requête courante
          if (currentRequestRef.current !== requestId) return;
          
          setState(prev => ({
            ...prev,
            progress,
            progressMessage: message || prev.progressMessage
          }));
          
          callbacks.onProgress?.(progress, message || '', step);
        },

        onChunk: (content, fullResponse, tokenCount) => {
          if (currentRequestRef.current !== requestId) return;
          
          setState(prev => ({
            ...prev,
            answer: fullResponse || prev.answer + content
          }));
          
          callbacks.onChunk?.(content, fullResponse, tokenCount);
        },

        onConversationSaved: (conversationId, isNew) => {
          if (currentRequestRef.current !== requestId) return;
          
          setState(prev => ({
            ...prev,
            conversationId
          }));
          
          callbacks.onConversationSaved?.(conversationId, isNew);
        },

        onComplete: (response) => {
          if (currentRequestRef.current !== requestId) return;
          
          setState(prev => ({
            ...prev,
            isAnalyzing: false,
            progress: 100,
            progressMessage: 'Terminé',
            conversationId: response.conversation_id,
            metadata: response.metadata
          }));
          
          callbacks.onComplete?.(response);
        },

        onError: (error) => {
          if (currentRequestRef.current !== requestId) return;
          
          setState(prev => ({
            ...prev,
            isAnalyzing: false,
            error: error.message
          }));
          
          callbacks.onError?.(error);
        }
      });

      return response;

    } catch (error) {
      // Vérifier que c'est toujours la requête courante
      if (currentRequestRef.current !== requestId) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage
      }));

      callbacks.onError?.(error as Error);
      throw error;

    } finally {
      // Nettoyer les refs si c'est la requête courante
      if (currentRequestRef.current === requestId) {
        currentRequestRef.current = null;
        abortControllerRef.current = null;
      }
    }
  }, []);

  /**
   * Arrêter l'analyse en cours
   */
  const stopAnalysis = useCallback(() => {

    currentRequestRef.current = null;
    poiAnalysisService.stopAnalysis();
    
    setState(prev => ({
      ...prev,
      isAnalyzing: false,
      error: 'Analyse interrompue par l\'utilisateur'
    }));
  }, []);

  /**
   * Réinitialiser l'état
   */
  const resetState = useCallback(() => {

    currentRequestRef.current = null;
    poiAnalysisService.stopAnalysis();
    
    setState({
      isAnalyzing: false,
      progress: 0,
      progressMessage: '',
      answer: '',
      conversationId: undefined,
      error: null,
      metadata: undefined
    });
  }, []);

  /**
   * Nettoyer lors du démontage du composant
   */
  useEffect(() => {
    return () => {
      if (currentRequestRef.current) {

        stopAnalysis();
      }
    };
  }, [stopAnalysis]);

  return {
    // État
    ...state,
    
    // Actions
    startAnalysis,
    stopAnalysis,
    resetState,
    
    // Utilitaires
    isAnalyzing: state.isAnalyzing,
    hasError: !!state.error,
    hasAnswer: !!state.answer,
    isComplete: state.progress === 100 && !state.error
  };
};

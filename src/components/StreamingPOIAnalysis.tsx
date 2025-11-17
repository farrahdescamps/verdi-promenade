/**
 * Composant de streaming POI avec interface moderne
 * Affiche la progression en temps réel avec animations
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useTranslation } from '../locales';
import { usePOIAnalysis, POIStreamingRequest } from '../hooks/usePOIAnalysis';

interface StreamingPOIAnalysisProps {
  request: POIStreamingRequest;
  onComplete?: (answer: string, conversationId?: string) => void;
  onError?: (error: string) => void;
  onStart?: (message?: string) => void;
  onConversationSaved?: (conversationId: string, isNew: boolean) => void;
  className?: string;
  autoStart?: boolean; // Nouveau prop pour contrôler le démarrage automatique
  onReady?: (startAnalysis: () => void) => void; // Callback pour exposer la fonction de démarrage
}

export const StreamingPOIAnalysis: React.FC<StreamingPOIAnalysisProps> = ({
  request,
  onComplete,
  onError,
  onStart,
  onConversationSaved,
  className = '',
  autoStart = true,
  onReady
}) => {
  const { t } = useTranslation();
  const [isRetrying, setIsRetrying] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  const {
    isAnalyzing,
    progress,
    progressMessage,
    answer,
    conversationId,
    error,
    startAnalysis,
    stopAnalysis,
    resetState,
    hasError,
    hasAnswer,
    isComplete
  } = usePOIAnalysis();

  // États pour les nouveaux callbacks
  const [currentStep, setCurrentStep] = useState<string>('');
  const [tokenCount, setTokenCount] = useState<number>(0);
  const [isNewConversation, setIsNewConversation] = useState<boolean>(false);

  // Animation du curseur clignotant
  useEffect(() => {
    if (isAnalyzing && hasAnswer) {
      const interval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setShowCursor(false);
    }
  }, [isAnalyzing, hasAnswer]);

  // Gérer la complétion
  useEffect(() => {
    if (isComplete && hasAnswer) {
      onComplete?.(answer, conversationId);
    }
  }, [isComplete, hasAnswer, answer, conversationId, onComplete]);

  // Gérer les erreurs
  useEffect(() => {
    if (hasError && error) {
      onError?.(error);
    }
  }, [hasError, error, onError]);

  // Démarrer l'analyse automatiquement si autoStart est true
  useEffect(() => {
    if (autoStart && !isAnalyzing && !hasError && !hasAnswer) {
      startAnalysis(request, {
        onStart: (event) => {
          onStart?.(event.message);
        },
        onProgress: (progress, message, step) => {
          setCurrentStep(step || '');
        },
        onChunk: (content, fullResponse, tokenCount) => {
          setTokenCount(tokenCount || 0);
        },
        onConversationSaved: (conversationId, isNew) => {
          setIsNewConversation(isNew);
          onConversationSaved?.(conversationId, isNew);

        },
        onComplete: (response) => {
          // La réponse de l'API a une structure différente
          const answer = response.response || response.answer || '';
          const conversationId = response.conversation?.conversation_id || response.conversation_id;
          onComplete?.(answer, conversationId);
        },
        onError: (error) => {

        }
      });
    }
  }, [autoStart, request, isAnalyzing, hasError, hasAnswer, startAnalysis]);

  // Exposer la fonction de démarrage au composant parent
  useEffect(() => {
    if (onReady) {
      onReady(startManualAnalysis);
    }
  }, [onReady]);

  // Fonction de retry
  const handleRetry = async () => {
    setIsRetrying(true);
    resetState();
    
    try {
      await startAnalysis(request);
    } catch (error) {

    } finally {
      setIsRetrying(false);
    }
  };

  // Fonction d'arrêt
  const handleStop = () => {
    stopAnalysis();
  };

  // Fonction pour démarrer manuellement l'analyse
  const startManualAnalysis = () => {
    if (!isAnalyzing && !hasError && !hasAnswer) {
      startAnalysis(request, {
        onStart: (event) => {
          onStart?.(event.message);
        },
        onProgress: (progress, message, step) => {
          setCurrentStep(step || '');
        },
        onChunk: (content, fullResponse, tokenCount) => {
          setTokenCount(tokenCount || 0);
        },
        onConversationSaved: (conversationId, isNew) => {
          setIsNewConversation(isNew);
          onConversationSaved?.(conversationId, isNew);

        },
        onComplete: (response) => {
          // La réponse de l'API a une structure différente
          const answer = response.response || response.answer || '';
          const conversationId = response.conversation?.conversation_id || response.conversation_id;
          onComplete?.(answer, conversationId);
        },
        onError: (error) => {

        }
      });
    }
  };

  return (
    <div className={`streaming-poi-analysis ${className}`}>
      {/* Indicateur de traitement - style API classique */}
      {isAnalyzing && (
        <div className="flex justify-end mb-4">
          <div className="text-sm text-gray-600 italic font-light flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-gray-600 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="animate-pulse">{t('activity.loadingIndicator')}</span>
          </div>
        </div>
      )}

      {/* Zone de réponse avec streaming */}
      {hasAnswer && (
        <div className="answer-container mb-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="answer-content">
              <div className="text-gray-800 leading-relaxed">
                {answer}
                {isAnalyzing && showCursor && (
                  <span className="typing-cursor text-blue-500 animate-pulse">|</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages d'erreur */}
      {hasError && (
        <div className="error-container mb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Erreur lors de l'analyse
                </h3>
                <div className="mt-1 text-sm text-red-700">
                  {error}
                </div>
                <div className="mt-3">
                  <Button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    {isRetrying ? 'Nouvelle tentative...' : 'Réessayer'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Styles CSS intégrés */}
      <style jsx>{`
        .streaming-poi-analysis {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .typing-cursor {
          font-weight: bold;
          animation: blink 1s infinite;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

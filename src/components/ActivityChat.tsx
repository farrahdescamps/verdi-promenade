import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useTranslation } from '../locales';
import { MessageCircleIcon } from './icons';
import { StreamingPOIAnalysis } from './StreamingPOIAnalysis';
import { POIStreamingRequest } from '../services/poiAnalysisService';

interface ConversationMessage {
  id: string;
  text: string;
  type: 'user' | 'bot';
  timestamp: string;
}

interface ActivityChatProps {
  activityId: string;
  sessionId: string;
  activityName: string;
  conversationId?: string;
  onConversationUpdate?: (id: string, isNew: boolean) => void;
  className?: string;
}

export const ActivityChat: React.FC<ActivityChatProps> = ({
  activityId,
  sessionId,
  activityName,
  conversationId: propConversationId,
  onConversationUpdate,
  className = ''
}) => {
  const { t } = useTranslation();

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(propConversationId || null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingHistory] = useState(false);
  
  // États pour le streaming SSE
  const [streamingRequest, setStreamingRequest] = useState<POIStreamingRequest | null>(null);
  const [startStreamingAnalysis, setStartStreamingAnalysis] = useState<(() => void) | null>(null);
  const [hasStartedStreaming, setHasStartedStreaming] = useState(false);

  // Référence pour le scroll automatique
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automatique vers le bas
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);


  // Afficher le message de bienvenue au montage
  useEffect(() => {
    if (!conversationId && !isLoadingHistory) {
      const welcomeMessage = t('activity.welcomeMessage', { activityTitle: activityName });
      setMessages([{
        id: 'welcome',
        text: welcomeMessage,
        type: 'bot',
        timestamp: new Date().toISOString()
      }]);
    }
  }, [activityName, conversationId, isLoadingHistory, t]);

  // Envoyer un message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) {
      return;
    }

    const userQuestion = inputValue.trim();
    setInputValue('');
    setError(null);

    // Ajouter le message utilisateur immédiatement
    const userMessageObj: ConversationMessage = {
      id: `user-${Date.now()}`,
      text: userQuestion,
      type: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessageObj]);

    // Préparer la requête de streaming avec l'ID de l'activité
    const request: POIStreamingRequest = {
      activity_id: activityId,
      question: userQuestion,
      session_id: sessionId,
      activity_name: activityName
    };

    // 🔍 LOG: Paramètres ActivityChat

    setStreamingRequest(request);
    setHasStartedStreaming(false);
  }, [inputValue, conversationId, sessionId, activityId, activityName, t, onConversationUpdate]);

  // Démarrer l'analyse streaming quand le composant est prêt
  useEffect(() => {
    if (streamingRequest && startStreamingAnalysis && !hasStartedStreaming) {
      setHasStartedStreaming(true);
      startStreamingAnalysis();
    }
  }, [streamingRequest, startStreamingAnalysis, hasStartedStreaming]);

  // Callbacks pour le streaming SSE
  const handleStreamingComplete = useCallback((answer: string, newConversationId?: string) => {
    // Mettre à jour l'ID de conversation si fourni
    if (newConversationId && newConversationId !== conversationId) {
      setConversationId(newConversationId);
      onConversationUpdate?.(newConversationId, false);
    }

    // Ajouter la réponse du bot
    const botResponse: ConversationMessage = {
      id: `bot-${Date.now()}`,
      text: answer,
      type: 'bot',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, botResponse]);
    
    // Nettoyer l'état de streaming
    setStreamingRequest(null);
    setHasStartedStreaming(false);
  }, [conversationId, onConversationUpdate]);

  const handleStreamingError = useCallback((error: string) => {

    // Afficher un message d'erreur
    const errorMessage: ConversationMessage = {
      id: `error-${Date.now()}`,
      text: t('activity.errorProcessingQuestion'),
      type: 'bot',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, errorMessage]);
    
    // Nettoyer l'état de streaming
    setStreamingRequest(null);
    setHasStartedStreaming(false);
  }, [t]);

  // Gérer l'appui sur Entrée
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className={`activity-chat ${className}`}>
      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-h-96">
        {/* Indicateur de chargement de l'historique */}
        {isLoadingHistory && (
          <div className="flex justify-center mb-4">
            <div className="text-sm text-gray-600 italic font-light flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-gray-600 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="animate-pulse">{t('activity.loadingHistory')}</span>
            </div>
          </div>
        )}

        {/* Messages de conversation */}
        {messages.map((message, index) => (
          <div key={message.id || index}>
            <div
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-theme-primary text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.text}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Composant de streaming SSE */}
        {streamingRequest && (
          <div className="mb-4">
            <StreamingPOIAnalysis
              request={streamingRequest}
              onComplete={handleStreamingComplete}
              onError={handleStreamingError}
              onReady={setStartStreamingAnalysis}
              autoStart={false}
              className="streaming-analysis"
            />
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Référence pour le scroll automatique */}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="border-t bg-white p-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('activity.inputPlaceholder')}
              disabled={false}
              className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-4 pr-12 text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-theme-primary hover:bg-theme-primary text-white flex items-center justify-center shadow-sm transition-colors"
              aria-label={t('activity.sendButton')}
            >
              <MessageCircleIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

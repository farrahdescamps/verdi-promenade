import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../../components/BackButton';
import { ChatBubble } from './ChatBubble';
import { WhatsAppModal } from './WhatsAppModal';
import { hotelChatService, ChatMessage } from '../../services/hotelChatService';
import { useTheme } from '../../contexts/ThemeContext';
import { HOTEL_NAME } from '../../config';
import { useTranslation } from '../../locales';

export const PageChat: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { primaryColor, secondaryColor, logoUrl, hotelName, mainPhotoUrl } = useTheme();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scrollViewRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentAssistantRef = useRef('');

  // Récupérer le session_id
  const getSessionId = (): string | null => {
    return localStorage.getItem('hotel_session_id');
  };

  // Pas de chargement d'historique - chaque visite est une nouvelle conversation
  useEffect(() => {
    setIsLoadingHistory(false);
  }, []);

  // Scroll automatique vers le bas
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTop = scrollViewRef.current.scrollHeight;
    }
  }, [messages, currentAssistantMessage]);

  // Envoyer un message
  const handleSendMessage = async () => {
    if (!inputText.trim() || isStreaming) return;

    const sessionId = getSessionId();
    if (!sessionId) {
      setError(t('chat.noSession'));
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsStreaming(true);
    setCurrentAssistantMessage('');
    currentAssistantRef.current = '';
    setError(null);

    // Appel API avec streaming
    await hotelChatService.sendMessage(
      sessionId,
      userMessage.content,
      conversationId,
      // onChunk
      (chunk: string) => {
        currentAssistantRef.current += chunk;
        setCurrentAssistantMessage(currentAssistantRef.current);
      },
      // onComplete
      (newConversationId: string, totalTokens?: number) => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: currentAssistantRef.current,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setCurrentAssistantMessage('');
        currentAssistantRef.current = '';
        setIsStreaming(false);
        setConversationId(newConversationId);
        
        console.log('💬 Conversation complete', {
          conversationId: newConversationId,
          totalTokens,
          messageCount: messages.length + 2
        });
      },
      // onError
      (errorMsg: string) => {
        setError(errorMsg);
        setIsStreaming(false);
        setCurrentAssistantMessage('');
        currentAssistantRef.current = '';
      }
    );
  };

  // Gérer la touche Entrée
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className="w-full flex flex-col"
      style={{ 
        backgroundColor: '#f4f9fd',
        height: '100dvh'
      }}
    >
      {/* Header avec image de fond - version très compacte et luxueuse */}
      <div className="relative flex-shrink-0 overflow-hidden rounded-b-[12px]">
        {/* Image de fond */}
        {mainPhotoUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center rounded-b-[12px]"
            style={{
              backgroundImage: `url(${mainPhotoUrl})`,
              filter: 'brightness(0.8)'
            }}
          />
        )}
        
        {/* Overlay opacité 0.75 */}
        <div
          className="absolute inset-0 rounded-b-[12px]"
          style={{
            backgroundColor: primaryColor || '#690217',
            opacity: 0.65
          }}
        />

        {/* Contenu du header */}
        <div className="relative flex items-center px-6" style={{ paddingTop: 'max(1rem, calc(1rem + env(safe-area-inset-top, 0px)))', paddingBottom: '1rem', minHeight: '100px' }}>
          <BackButton 
            onClick={() => navigate(-1)}
          />
          
          <div className="flex-1 flex items-center justify-center">
            {logoUrl && (
              <div className="flex justify-center">
                {logoUrl.startsWith('<svg') ? (
                  <div
                    className="w-10 h-10 [&>svg]:w-full [&>svg]:h-full [&_path]:fill-white [&_circle]:fill-white [&_rect]:fill-white [&_polygon]:fill-white"
                    style={{ color: 'white' }}
                    dangerouslySetInnerHTML={{ __html: logoUrl }}
                  />
                ) : (
                  <img
                    src={logoUrl}
                    alt={hotelName}
                    className="w-10 h-10 object-contain"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollViewRef}
        className="flex-1 overflow-y-auto px-4 py-6"
        style={{
          scrollBehavior: 'smooth',
          paddingBottom: '1rem'
        }}
      >
        {/* Message de bienvenue de l'assistant (toujours affiché) */}
        {messages.length === 0 && !isStreaming && (
          <div className="flex mb-4 justify-start animate-fadeIn">
            <div className="flex items-start gap-2 max-w-[80%]">
              {/* Logo de l'hôtel en pastille - plus petite */}
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center bg-white"
                style={{ borderColor: primaryColor || '#690217' }}
              >
                {logoUrl && logoUrl.startsWith('<svg') ? (
                  <div
                    className="w-5 h-5 [&>svg]:w-full [&>svg]:h-full [&_path]:fill-current [&_circle]:fill-current [&_rect]:fill-current [&_polygon]:fill-current"
                    style={{ color: primaryColor || '#690217' }}
                    dangerouslySetInnerHTML={{ __html: logoUrl }}
                  />
                ) : logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={HOTEL_NAME}
                    className="w-5 h-5 object-contain"
                    style={{ 
                      filter: `brightness(0) saturate(100%)`,
                      color: primaryColor || '#690217'
                    }}
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: primaryColor || '#690217' }} />
                )}
              </div>

              {/* Bulle de message - design luxueux */}
              <div
                className="rounded-[14px] rounded-bl-[4px] px-4 py-3.5"
                style={{
                  backgroundColor: primaryColor || '#690217',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)'
                }}
              >
                <p className="text-sm leading-relaxed">
                  {t('chat.title')} {t('chat.subtitle')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Messages de la conversation */}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {/* Bulle d'écriture pendant le chargement - disparaît dès que la réponse arrive */}
        {isStreaming && !currentAssistantMessage && (
          <div className="flex mb-4 justify-start animate-fadeIn">
            <div className="flex items-start gap-2 max-w-[80%]">
              {/* Logo de l'hôtel en pastille */}
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center bg-white"
                style={{ borderColor: primaryColor || '#690217' }}
              >
                {logoUrl && logoUrl.startsWith('<svg') ? (
                  <div
                    className="w-5 h-5 [&>svg]:w-full [&>svg]:h-full [&_path]:fill-current [&_circle]:fill-current [&_rect]:fill-current [&_polygon]:fill-current"
                    style={{ color: primaryColor || '#690217' }}
                    dangerouslySetInnerHTML={{ __html: logoUrl }}
                  />
                ) : logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={HOTEL_NAME}
                    className="w-5 h-5 object-contain"
                    style={{ 
                      filter: `brightness(0) saturate(100%)`,
                      color: primaryColor || '#690217'
                    }}
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: primaryColor || '#690217' }} />
                )}
              </div>

              {/* Bulle avec animation de points - design luxueux */}
              <div
                className="rounded-[14px] rounded-bl-[4px] px-4 py-3.5 flex items-center gap-1"
                style={{
                  backgroundColor: primaryColor || '#690217',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)'
                }}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Message en cours de streaming */}
        {isStreaming && currentAssistantMessage && (
          <ChatBubble
            message={{
              id: 'streaming',
              role: 'assistant',
              content: currentAssistantMessage,
              timestamp: new Date()
            }}
            isStreaming
          />
        )}

        {/* Erreur */}
        {error && (
          <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-2xl animate-shake">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Input - Design luxueux et raffiné */}
      <div
        className="flex-shrink-0 bg-white px-4 border-t"
        style={{ 
          borderColor: (primaryColor || '#690217') + '10',
          paddingTop: '1rem',
          paddingBottom: 'max(1rem, calc(1rem + env(safe-area-inset-bottom, 0px)))'
        }}
      >
        <div className="flex items-stretch gap-3 mb-3">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('chat.placeholder')}
            disabled={isStreaming || isLoadingHistory}
            className="flex-1 px-4 py-3 bg-[#f4f9fd] rounded-[10px] focus:outline-none disabled:opacity-50 text-gray-800 placeholder-gray-400 text-sm border border-transparent focus:border-gray-200 transition-all"
            style={{
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isStreaming || isLoadingHistory}
            className="flex-shrink-0 px-5 rounded-[10px] flex items-center justify-center text-white transition-all disabled:opacity-40 hover:opacity-90 active:scale-98 font-medium text-sm"
            style={{
              backgroundColor: primaryColor || '#690217',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
          >
            <svg 
              className="w-4 h-4" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>

        {/* Bouton WhatsApp discret */}
        {messages.length > 0 && !isLoadingHistory && (
          <button
            onClick={() => setShowWhatsAppModal(true)}
            disabled={isStreaming}
            className="w-full py-2.5 text-xs font-normal transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 hover:opacity-80 active:opacity-60"
            style={{
              color: (primaryColor || '#690217') + '99'
            }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="underline">{t('chat.sendToWhatsApp')}</span>
          </button>
        )}
      </div>

      {/* Modal WhatsApp */}
      <WhatsAppModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        messages={messages}
      />

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};


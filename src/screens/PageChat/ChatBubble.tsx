import React from 'react';
import { ChatMessage } from '../../services/hotelChatService';
import { useTheme } from '../../contexts/ThemeContext';
import { HOTEL_NAME } from '../../config';

interface ChatBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isStreaming = false }) => {
  const { primaryColor, secondaryColor, logoUrl } = useTheme();
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
      style={{
        animation: 'fadeInUp 0.3s ease-out'
      }}
    >
      {/* Message Assistant */}
      {!isUser && (
        <div className="flex items-start gap-2 max-w-[80%]">
          {/* Logo de l'hôtel en pastille - plus petite avec bordure légère */}
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

          {/* Bulle bordeau avec texte blanc - design luxueux */}
          <div
            className="rounded-[14px] rounded-bl-[4px] px-4 py-3.5"
            style={{
              backgroundColor: primaryColor || '#690217',
              color: '#FFFFFF',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
              {isStreaming && (
                <span className="inline-block ml-1 animate-pulse">▋</span>
              )}
            </p>
            {!isStreaming && (
              <p className="text-xs mt-1.5 text-white/60">
                {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Message Utilisateur - design luxueux */}
      {isUser && (
        <div
          className="max-w-[80%] rounded-[14px] rounded-br-[4px] px-4 py-3.5"
          style={{
            backgroundColor: secondaryColor || '#F0F0F0',
            color: '#000000',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
          }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <p className="text-xs mt-1.5 text-gray-400">
            {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      )}
    </div>
  );
};


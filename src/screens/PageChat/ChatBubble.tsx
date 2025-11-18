import React from 'react';
import { ChatMessage } from '../../services/hotelChatService';
import { useTheme } from '../../contexts/ThemeContext';
import { HOTEL_NAME } from '../../config';

interface ChatBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

// Fonction pour calculer la luminosité d'une couleur hex
const getLuminance = (hex: string): number => {
  // Convertir hex en RGB
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  
  // Calcul de la luminosité relative (formule W3C)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance;
};

// Fonction pour déterminer la meilleure couleur de texte selon le fond
const getTextColor = (backgroundColor: string): { text: string; time: string } => {
  const luminance = getLuminance(backgroundColor);
  
  // Si la couleur est claire (luminance > 0.5), utiliser du texte foncé
  if (luminance > 0.5) {
    return {
      text: '#000000',      // Noir pour le texte principal
      time: 'rgba(0, 0, 0, 0.5)' // Noir 50% pour l'heure
    };
  }
  // Si la couleur est foncée, utiliser du texte clair
  return {
    text: '#FFFFFF',      // Blanc pour le texte principal
    time: 'rgba(255, 255, 255, 0.6)' // Blanc 60% pour l'heure
  };
};

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isStreaming = false }) => {
  const { primaryColor, secondaryColor, logoUrl } = useTheme();
  const isUser = message.role === 'user';
  
  // Calculer les couleurs de texte selon le fond
  const assistantColors = getTextColor(primaryColor || '#690217');
  const userColors = getTextColor(secondaryColor || '#F0F0F0');

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
          {/* Logo de l'hôtel en pastille - adaptatif avec bordure légère */}
          <div 
            className="flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center bg-white overflow-hidden"
            style={{ borderColor: primaryColor || '#690217' }}
          >
            {logoUrl && logoUrl.startsWith('<svg') ? (
              <div
                className="w-7 h-7 [&>svg]:w-full [&>svg]:h-full [&_path]:fill-current [&_circle]:fill-current [&_rect]:fill-current [&_polygon]:fill-current"
                style={{ color: primaryColor || '#690217' }}
                dangerouslySetInnerHTML={{ __html: logoUrl }}
              />
            ) : logoUrl ? (
              <img
                src={logoUrl}
                alt={HOTEL_NAME}
                className="w-7 h-7 object-cover"
                style={{ 
                  filter: `brightness(0) saturate(100%)`,
                  color: primaryColor || '#690217'
                }}
              />
            ) : (
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: primaryColor || '#690217' }} />
            )}
          </div>

          {/* Bulle assistant avec texte adaptatif - design luxueux */}
          <div
            className="rounded-[14px] rounded-bl-[4px] px-4 py-3.5"
            style={{
              backgroundColor: primaryColor || '#690217',
              color: assistantColors.text,
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
              <p className="text-xs mt-1.5" style={{ color: assistantColors.time }}>
                {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Message Utilisateur avec texte adaptatif - design luxueux */}
      {isUser && (
        <div
          className="max-w-[80%] rounded-[14px] rounded-br-[4px] px-4 py-3.5"
          style={{
            backgroundColor: secondaryColor || '#F0F0F0',
            color: userColors.text,
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
          }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <p className="text-xs mt-1.5" style={{ color: userColors.time }}>
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


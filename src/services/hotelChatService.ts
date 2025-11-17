import { CONCIERGE_API_BASE_URL, API_KEY } from '../config';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatStreamEvent {
  type: 'start' | 'chunk' | 'complete' | 'error' | 'conversation_saved' | 'progress';
  content?: string;
  conversation_id?: string;
  total_tokens?: number;
  error?: string;
  timestamp?: string;
  percentage?: number;
}

export class HotelChatService {
  /**
   * Envoie un message et reçoit la réponse en streaming via SSE
   */
  async sendMessage(
    sessionId: string,
    message: string,
    conversationId: string | null,
    onChunk: (chunk: string) => void,
    onComplete: (conversationId: string, totalTokens?: number) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      console.log('%c💬 SEND CHAT MESSAGE', 'background: #8b5cf6; color: white; font-weight: bold; padding: 4px 8px;', {
        sessionId,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        conversationId
      });

      const response = await fetch(`${CONCIERGE_API_BASE_URL}/hotel-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          session_id: sessionId,
          message,
          ...(conversationId && { conversation_id: conversationId })
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Garder la dernière ligne incomplète dans le buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: ChatStreamEvent = JSON.parse(line.slice(6));

              switch (data.type) {
                case 'start':
                  console.log('🚀 Chat streaming started');
                  break;

                case 'chunk':
                  if (data.content) {
                    onChunk(data.content);
                  }
                  break;

                case 'complete':
                  console.log('%c✅ CHAT COMPLETE', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', {
                    conversationId: data.conversation_id,
                    totalTokens: data.total_tokens
                  });
                  onComplete(data.conversation_id || '', data.total_tokens);
                  break;

                case 'conversation_saved':
                  console.log('💾 Conversation saved:', data.conversation_id);
                  break;

                case 'error':
                  console.error('%c❌ CHAT ERROR', 'background: #ef4444; color: white; font-weight: bold; padding: 4px 8px;', data.error);
                  onError(data.error || 'Une erreur est survenue');
                  break;

                case 'progress':
                  // Optionnel: gérer la progression
                  break;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('%c❌ CHAT SERVICE ERROR', 'background: #ef4444; color: white; font-weight: bold; padding: 4px 8px;', error);
      onError(error.message || 'Erreur de connexion');
    }
  }
}

export const hotelChatService = new HotelChatService();


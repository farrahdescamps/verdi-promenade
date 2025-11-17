import { CONCIERGE_API_BASE_URL } from '../config';
import { ChatMessage } from './hotelChatService';

const AUTH_BEARER = import.meta.env.VITE_AUTH_BEARER || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODJjMzY5MzIxNmJjMzc3Y2ViMDYxYTciLCJlbWFpbCI6Im1hbnVAcmVnaW9ubG92ZXJzLmZyIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwNjgxODg0LCJleHAiOjE3NjA3MjE0ODR9.QcrJEu_OUjUQVtCYOmzuVay7_ThUGbo0FgiY2q2fgm4';

export class WhatsAppService {
  /**
   * Normalise le numéro de téléphone (enlève le +)
   */
  private normalizePhoneNumber(phone: string): string {
    return phone.replace(/^\+/, '').replace(/\s/g, '');
  }

  /**
   * Formate la conversation pour WhatsApp
   */
  private formatConversation(messages: ChatMessage[], hotelName?: string): string {
    let formatted = `🏨 ${hotelName || 'Conversation Hôtel'}\n\n`;
    
    messages.forEach(msg => {
      const emoji = msg.role === 'user' ? '👤' : '🤖';
      const label = msg.role === 'user' ? 'Vous' : 'Assistant';
      formatted += `${emoji} ${label}:\n${msg.content}\n\n`;
    });

    formatted += '---\n';
    formatted += new Date().toLocaleString('fr-FR');

    return formatted;
  }

  /**
   * Envoie la conversation sur WhatsApp
   */
  async sendConversation(
    phoneNumber: string,
    messages: ChatMessage[],
    hotelName?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      const conversationText = this.formatConversation(messages, hotelName);

      console.log('%c📱 SEND WHATSAPP', 'background: #25D366; color: white; font-weight: bold; padding: 4px 8px;', {
        to: `+${normalizedPhone}`,
        messageLength: conversationText.length,
        messageCount: messages.length,
        bearer: AUTH_BEARER ? `${AUTH_BEARER.substring(0, 20)}...` : 'NO BEARER TOKEN',
        url: `${CONCIERGE_API_BASE_URL}/admin/whatsapp/send-test`
      });

      const response = await fetch(
        `${CONCIERGE_API_BASE_URL}/admin/whatsapp/send-test`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_BEARER}`
          },
          body: JSON.stringify({
            to: `+${normalizedPhone}`,
            message: conversationText
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log('%c✅ WHATSAPP SENT', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;');
        return { success: true };
      } else {
        console.error('%c❌ WHATSAPP ERROR', 'background: #ef4444; color: white; font-weight: bold; padding: 4px 8px;', data);
        return {
          success: false,
          error: data.error || 'Erreur lors de l\'envoi'
        };
      }
    } catch (error: any) {
      console.error('%c❌ WHATSAPP SERVICE ERROR', 'background: #ef4444; color: white; font-weight: bold; padding: 4px 8px;', error);
      return {
        success: false,
        error: error.message || 'Erreur de connexion'
      };
    }
  }

  /**
   * Valide le format du numéro
   */
  validatePhoneNumber(phone: string): boolean {
    const normalized = this.normalizePhoneNumber(phone);
    // Valide un numéro international (6-15 chiffres)
    return /^\d{6,15}$/.test(normalized);
  }
}

export const whatsappService = new WhatsAppService();


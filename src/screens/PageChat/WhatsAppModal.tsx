import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../locales';
import { whatsappService } from '../../services/whatsappService';
import { ChatMessage } from '../../services/hotelChatService';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  messages
}) => {
  const { t } = useTranslation();
  const { primaryColor, hotelName } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    setError(null);
    setSuccess(false);

    // Validation
    if (!whatsappService.validatePhoneNumber(phoneNumber)) {
      setError(t('chat.whatsappModal.invalidPhone'));
      return;
    }

    if (messages.length === 0) {
      setError(t('chat.whatsappModal.noMessages'));
      return;
    }

    setIsSending(true);

    const result = await whatsappService.sendConversation(
      phoneNumber,
      messages,
      hotelName
    );

    setIsSending(false);

    if (result.success) {
      setSuccess(true);
      setPhoneNumber('');
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } else {
      setError(result.error || t('chat.whatsappModal.error'));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSending) {
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pb-safe"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[20px] p-8 w-full max-w-md relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'scaleIn 0.3s ease-out',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Accent décoratif en haut */}
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, ${primaryColor || '#690217'}, ${primaryColor || '#690217'}99)`
          }}
        />

        {/* Close button élégant */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
          disabled={isSending}
        >
          <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {success ? (
          <div className="text-center py-12 animate-fadeIn">
            {/* Success animation */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <div 
                className="absolute w-20 h-20 rounded-full animate-ping"
                style={{ backgroundColor: primaryColor + '20' }}
              />
              <svg className="w-20 h-20 relative" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill={primaryColor || '#690217'} />
                <path d="M7 13l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-2" style={{ color: primaryColor }}>
              {t('chat.whatsappModal.success')}
            </h3>
            <p className="text-gray-500 text-sm">
              La conversation a été envoyée avec succès
            </p>
          </div>
        ) : (
          <>
            {/* Header élégant */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-2">
                <svg 
                  className="w-8 h-8 flex-shrink-0" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  style={{ color: primaryColor || '#690217' }}
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t('chat.whatsappModal.title')}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Recevez cette conversation par WhatsApp
                  </p>
                </div>
              </div>
            </div>

            {/* Input luxueux */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                {t('chat.whatsappModal.phoneLabel')}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('chat.whatsappModal.phonePlaceholder')}
                  className="w-full px-4 py-4 bg-gray-50 rounded-[12px] focus:outline-none transition-all text-gray-900 placeholder-gray-400"
                  style={{
                    border: error ? '2px solid #ef4444' : `2px solid ${error ? '#ef4444' : 'transparent'}`,
                    boxShadow: error ? '0 0 0 4px rgba(239, 68, 68, 0.1)' : 'none'
                  }}
                  disabled={isSending}
                  autoFocus
                />
                {phoneNumber && (
                  <button
                    onClick={() => setPhoneNumber('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    <svg className="w-3 h-3 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                {t('chat.whatsappModal.phoneHelp')}
              </p>
            </div>

            {/* Error élégant */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-[12px] animate-shake border border-red-100">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Buttons luxueux */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isSending}
                className="flex-1 px-6 py-4 rounded-[12px] font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('chat.whatsappModal.cancel')}
              </button>
              <button
                onClick={handleSend}
                disabled={isSending || !phoneNumber}
                className="flex-1 px-6 py-4 rounded-[12px] font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor || '#690217'} 0%, ${primaryColor || '#690217'}dd 100%)`,
                  boxShadow: `0 8px 20px ${primaryColor || '#690217'}40`
                }}
              >
                {isSending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('chat.whatsappModal.sending')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                    {t('chat.whatsappModal.send')}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useTranslation } from '../locales';
import { BrandLogoIcon } from './icons';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityTitle: string;
  activityColor: string;
  onReserve: (reservationData: ReservationData) => void;
}

export interface ReservationData {
  customerNumber: string;
  participants: number;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  activityTitle,
  activityColor,
  onReserve
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ReservationData>({
    customerNumber: '',
    participants: 1,
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof ReservationData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onReserve(formData);
      onClose();
    } catch (error) {

    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.customerNumber && formData.cardNumber && formData.expiryDate && formData.cvv;

  // Calculer le prix basé sur le nombre de participants
  const pricePerPerson = 25.90;
  const totalPrice = (pricePerPerson * formData.participants).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-[300px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header avec avatar */}
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-5 text-center border-b border-gray-100">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Avatar */}
          <div className="w-12 h-12 mx-auto mb-3 bg-white rounded-full flex items-center justify-center shadow-sm">
            <BrandLogoIcon className="w-8 h-10" color={activityColor} />
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-800 text-base mb-1">
            {t('reservation.title')}
          </h3>
          <p className="text-xs text-gray-600 truncate">
            {activityTitle}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Numéro client */}
          <Input
            type="text"
            value={formData.customerNumber}
            onChange={(e) => handleInputChange('customerNumber', e.target.value)}
            placeholder={t('reservation.customerNumberPlaceholder')}
            className="h-11 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-sm"
            required
          />

          {/* Nombre de participants */}
          <select
            value={formData.participants}
            onChange={(e) => handleInputChange('participants', parseInt(e.target.value))}
            className="w-full h-11 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-blue-400 px-3 bg-white text-sm text-gray-700"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>
                {num} {num === 1 ? t('reservation.participant') : t('reservation.participants')}
              </option>
            ))}
          </select>

          {/* Section Paiement */}
          <div className="pt-2 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {t('reservation.paymentSection')}
            </h4>
            
            {/* Numéro de carte */}
            <Input
              type="text"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              placeholder={t('reservation.cardNumberPlaceholder')}
              className="h-11 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-sm mb-3"
              maxLength={19}
              required
            />

            {/* Date d'expiration et CVV */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="text"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                placeholder={t('reservation.expiryPlaceholder')}
                className="h-11 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-sm"
                maxLength={5}
                required
              />
              <Input
                type="text"
                value={formData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                placeholder={t('reservation.cvvPlaceholder')}
                className="h-11 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-sm"
                maxLength={4}
                required
              />
            </div>
          </div>

          {/* Submit button avec prix */}
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full h-12 mt-6 text-white font-medium rounded-xl transition-all disabled:opacity-50"
            style={{ backgroundColor: isFormValid ? '#5DADE2' : '#94A3B8' }}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t('reservation.processing')}</span>
              </div>
            ) : (
              `${t('reservation.payNow')} ${totalPrice}€`
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
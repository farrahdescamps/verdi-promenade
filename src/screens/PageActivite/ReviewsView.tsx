import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../locales';

interface Review {
  id: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
}

// Avis mockés pour le restaurant
const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    rating: 5,
    date: 'Avr. 2024',
    title: 'Expérience exceptionnelle !',
    comment: 'Un service impeccable et des plats d\'une qualité remarquable. L\'ambiance est chaleureuse et raffinée. Je recommande vivement !'
  },
  {
    id: '2',
    rating: 5,
    date: 'Mars 2024',
    title: 'Cuisine raffinée',
    comment: 'Les saveurs sont sublimes, la présentation des plats est soignée. Une véritable expérience gastronomique. Nous reviendrons sans hésiter.'
  },
  {
    id: '3',
    rating: 4,
    date: 'Mars 2024',
    title: 'Très bon restaurant',
    comment: 'Excellente cuisine avec des produits frais et de qualité. Service attentif. Le rapport qualité-prix est correct pour le standing.'
  },
  {
    id: '4',
    rating: 5,
    date: 'Févr. 2024',
    title: 'Un délice !',
    comment: 'Chaque plat était un régal. L\'équipe est aux petits soins et le cadre est magnifique. Une adresse à ne pas manquer à Saint-Tropez.'
  },
  {
    id: '5',
    rating: 5,
    date: 'Févr. 2024',
    title: 'Parfait du début à la fin',
    comment: 'De l\'accueil au dessert, tout était parfait. La carte des vins est impressionnante et les conseils du sommelier excellents.'
  }
];

interface ReviewsViewProps {
  poiName: string;
  onClose: () => void;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({ poiName, onClose }) => {
  const { primaryColor, logoUrl } = useTheme();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? MOCK_REVIEWS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === MOCK_REVIEWS.length - 1 ? 0 : prev + 1));
  };

  const currentReview = MOCK_REVIEWS[currentIndex];
  const averageRating = (MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / MOCK_REVIEWS.length).toFixed(1);

  // Render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill={star <= rating ? primaryColor || '#690217' : '#E5E7EB'}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col overflow-hidden">
      {/* Header avec gradient */}
      <div
        className="relative flex-shrink-0 rounded-b-[20px] overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${primaryColor || '#690217'} 0%, ${primaryColor || '#690217'}dd 100%)`
        }}
      >
        {/* Logo en haut */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
          {logoUrl && logoUrl.startsWith('<svg') ? (
            <div
              className="w-12 h-12 [&>svg]:w-full [&>svg]:h-full [&_path]:fill-white"
              dangerouslySetInnerHTML={{ __html: logoUrl }}
            />
          ) : logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="w-12 h-12 object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          ) : null}
        </div>

        {/* Contenu du header */}
        <div className="px-6 pt-24 pb-8">
          {/* Titre "Avis" */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">{t('activite.reviews')}</h2>
            <p className="text-white/80 text-sm">
              Voici un résumé des avis en ligne de ce restaurant.
            </p>
          </div>

          {/* Note moyenne */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="white">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <div className="text-white">
              <div className="text-4xl font-bold">{averageRating}/5</div>
              <div className="text-sm text-white/80">({MOCK_REVIEWS.length} avis)</div>
            </div>
          </div>

          {/* Carte d'avis actuel */}
          <div className="bg-white rounded-[16px] p-6 shadow-xl">
            {/* Date et étoiles */}
            <div className="flex items-center justify-between mb-4">
              {renderStars(currentReview.rating)}
              <span className="text-sm text-gray-500">{currentReview.date}</span>
            </div>

            {/* Titre */}
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {currentReview.title}
            </h3>

            {/* Commentaire */}
            <p className="text-gray-700 leading-relaxed">
              {currentReview.comment}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <button
              onClick={handlePrevious}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all active:scale-95"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Pagination dots */}
            <div className="flex gap-2">
              {MOCK_REVIEWS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className="transition-all"
                >
                  <div
                    className={`rounded-full transition-all ${
                      index === currentIndex ? 'w-8 h-2' : 'w-2 h-2'
                    }`}
                    style={{
                      backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.4)'
                    }}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all active:scale-95"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Bouton close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all z-20"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};


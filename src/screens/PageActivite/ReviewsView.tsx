import { useEffect } from 'react';

/**
 * Fonctionnalité Reviews temporairement désactivée.
 * L'ancien mock de données est conservé ci-dessous pour référence.
 *
 * const MOCK_REVIEWS = [
 *   {
 *     id: '1',
 *     rating: 5,
 *     date: 'Avr. 2024',
 *     title: 'Expérience exceptionnelle !',
 *     comment: 'Un service impeccable et des plats d\'une qualité remarquable. L\'ambiance est chaleureuse et raffinée. Je recommande vivement !'
 *   },
 *   {
 *     id: '2',
 *     rating: 5,
 *     date: 'Mars 2024',
 *     title: 'Cuisine raffinée',
 *     comment: 'Les saveurs sont sublimes, la présentation des plats est soignée. Une véritable expérience gastronomique. Nous reviendrons sans hésiter.'
 *   },
 *   {
 *     id: '3',
 *     rating: 4,
 *     date: 'Mars 2024',
 *     title: 'Très bon restaurant',
 *     comment: 'Excellente cuisine avec des produits frais et de qualité. Service attentif. Le rapport qualité-prix est correct pour le standing.'
 *   },
 *   {
 *     id: '4',
 *     rating: 5,
 *     date: 'Févr. 2024',
 *     title: 'Un délice !',
 *     comment: 'Chaque plat était un régal. L\'équipe est aux petits soins et le cadre est magnifique. Une adresse à ne pas manquer à Malte.'
 *   },
 *   {
 *     id: '5',
 *     rating: 5,
 *     date: 'Févr. 2024',
 *     title: 'Parfait du début à la fin',
 *     comment: 'De l\'accueil au dessert, tout était parfait. La carte des vins est impressionnante et les conseils du sommelier excellents.'
 *   }
 * ];
 */

interface ReviewsViewProps {
  poiName: string;
  onClose: () => void;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({ poiName, onClose }) => {
  useEffect(() => {
    console.warn('ReviewsView is disabled temporarily. Closing the modal.');
    onClose();
  }, [onClose, poiName]);

  return null;
};
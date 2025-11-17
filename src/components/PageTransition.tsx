import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const { primaryColor } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(true); // Démarrer avec true pour l'animation initiale
  const [displayChildren, setDisplayChildren] = useState(children);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Sur le premier montage, juste faire un fade in simple
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
      return () => clearTimeout(timer);
    }

    // Pour les navigations suivantes, faire l'animation complète
    setIsTransitioning(true);

    // Mettre à jour le contenu après un court délai
    const updateTimer = setTimeout(() => {
      setDisplayChildren(children);
    }, 150);

    // Terminer la transition
    const endTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);

    return () => {
      clearTimeout(updateTimer);
      clearTimeout(endTimer);
    };
  }, [location.pathname, children]);

  return (
    <>
      {/* Animation de transition luxueuse */}
      <div
        className={`fixed inset-0 z-[9999] pointer-events-none transition-all duration-300 ease-in-out ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `linear-gradient(135deg, ${primaryColor || '#690217'}ee 0%, ${primaryColor || '#690217'}dd 100%)`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Animation de fade elegant */}
          <div
            className="transition-all duration-300"
            style={{
              transform: isTransitioning ? 'scale(1)' : 'scale(0.95)',
              opacity: isTransitioning ? 1 : 0,
            }}
          >
            {/* Spinner luxueux */}
            <div
              className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"
            />
          </div>
        </div>
      </div>

      {/* Contenu de la page avec fade */}
      <div
        className={`transition-opacity duration-300 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {displayChildren}
      </div>
    </>
  );
};


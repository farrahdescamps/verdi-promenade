import React from 'react';

/**
 * Composant pour afficher un logo qui peut être soit un SVG inline, soit une URL d'image
 */
interface LogoDisplayProps {
  logoData: string;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

export const LogoDisplay: React.FC<LogoDisplayProps> = ({ logoData, className = '', style, alt = 'Logo' }) => {
  // Vérifier si c'est du SVG inline (commence par <svg)
  const isSvgString = logoData.trim().startsWith('<svg');

  if (isSvgString) {
    // Afficher le SVG inline
    return (
      <div
        className={className}
        style={style}
        dangerouslySetInnerHTML={{ __html: logoData }}
      />
    );
  } else {
    // Afficher l'image via URL
    return (
      <img
        src={logoData}
        alt={alt}
        className={className}
        style={style}
      />
    );
  }
};


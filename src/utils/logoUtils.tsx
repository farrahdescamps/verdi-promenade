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
    // Inject width/height styles to ensure the SVG fills its container
    const normalizedSvg = logoData.replace(
      '<svg',
      '<svg style="width:100%;height:100%;display:block"'
    );
    // Afficher le SVG inline
    return (
      <div
        className={className}
        style={style}
        dangerouslySetInnerHTML={{ __html: normalizedSvg }}
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


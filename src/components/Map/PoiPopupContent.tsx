import React, { useState } from 'react';
import { VideoPlayer } from '../VideoPlayer';

interface POI {
  name: string;
  lat: number;
  lng: number;
  color?: string;
  poi_id?: string;
  activity_id?: string;
  video_url?: string;
  photo_url?: string;
}

interface PoiPopupContentProps {
  poi: POI;
  onPoiClick: (poi: POI) => void;
}

export const PoiPopupContent: React.FC<PoiPopupContentProps> = ({ poi, onPoiClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onPoiClick(poi);
  };

  return (
    <div 
      className="flex items-center cursor-pointer" 
      style={{ margin: 0, padding: 0 }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Media preview - Priorité : photo_url > video_url */}
      {poi.photo_url && poi.photo_url.trim() !== '' ? (
        <div className="w-20 h-16 flex-shrink-0 rounded-l-lg overflow-hidden">
          <img
            src={poi.photo_url}
            alt={poi.name}
            className="w-full h-full object-cover block"
            style={{ margin: 0, padding: 0, display: 'block' }}
          />
        </div>
      ) : poi.video_url && poi.video_url.trim() !== '' ? (
        <div className="w-20 h-16 flex-shrink-0 rounded-l-lg overflow-hidden">
          <VideoPlayer
            src={poi.video_url}
            className="w-full h-full object-cover block"
            style={{ margin: 0, padding: 0, display: 'block' }}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          />
        </div>
      ) : null}
      
      {/* POI name - positioned on the right */}
      <div 
        className="font-medium transition-colors duration-200 text-xs leading-tight flex-1 px-2 py-1 max-w-[120px] break-words"
        style={{ 
          color: isHovered ? (poi.color || 'var(--color-primary)') : '#000000'
        }}
      >
        {poi.name}
      </div>
    </div>
  );
};
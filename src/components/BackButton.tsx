import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { MAP_THEME } from '../config';

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, className = '' }) => {
  const navigate = useNavigate();
  const { primaryColor } = useTheme();
  
  // Adapter la couleur selon le thème de la carte
  const buttonColor = MAP_THEME === 'light' ? (primaryColor || '#690217') : 'white';

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-[25px] h-[46px] flex items-center cursor-pointer ${className}`}
      aria-label="Go back"
    >
      <svg
        className="h-[15.63px] ml-[7.5px] mr-[7.5px] flex-1"
        viewBox="0 0 10 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 2L2 8L8 14"
          stroke={buttonColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};


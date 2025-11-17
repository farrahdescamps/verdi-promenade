import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Clock } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../locales";

interface Tag {
  icon: React.ReactNode;
  text: string;
}

interface CardActivityProps {
  id: string;
  isActive: boolean;
  onCardClick: (id: string) => void;
  title: string;
  imageSrc: string;
  duration: string;
  whiteTags: Tag[];
  tealTags: Tag[];
  primaryColor: string;
  secondaryColor: string;
  totalTags?: number; // Nombre total de tags de l'activité
}

export const CardActivity = ({ 
  id,
  isActive,
  onCardClick,
  title, 
  imageSrc, 
  duration, 
  whiteTags, 
  tealTags, 
  primaryColor,
  secondaryColor,
  totalTags
}: CardActivityProps): JSX.Element => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Calculer le nombre total de tags (utiliser totalTags si fourni, sinon calculer)
  const actualTotalTags = totalTags || (whiteTags.length + tealTags.length);
  const shouldUseWhiteIcon = actualTotalTags > 3;
  
  // Debug logs

  // Debug styles
  const innerStyle = shouldUseWhiteIcon 
    ? { backgroundColor: 'white', borderColor: 'white' }
    : isActive 
      ? { backgroundColor: primaryColor, borderColor: primaryColor }
      : { backgroundColor: '#ffffff1a', borderColor: '#ffffff4c' };

  const outerStyle = shouldUseWhiteIcon 
    ? { backgroundColor: 'white', borderColor: 'white' }
    : isActive 
      ? { backgroundColor: 'white', borderColor: primaryColor }
      : { backgroundColor: '#ffffff1a', borderColor: '#ffffff4c' };


  const handleCardClick = () => {
    onCardClick(id);
  };

  const handleExplorerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la propagation vers le clic de la carte
    
    navigate(`/activite/${id}`);
  };

  return (
    <div className="w-[297px] h-[181px]" onClick={handleCardClick}>
      <Card 
        className="relative h-[181px] rounded-[4px] border-none"
        style={{ 
          backgroundColor: secondaryColor,
          boxShadow: `1px 5px 20px ${primaryColor}40`
        }}
      >
        {/* Circular indicator - Active state */}
        <div className="absolute w-[13px] h-[13px] top-3.5 left-4" key={`circle-${id}-${shouldUseWhiteIcon}`}>
          <div className="relative h-[13px] rounded-[6.5px]">
            <div 
              className={`w-2 h-2 top-[3px] left-[3px] rounded-[3.76px] absolute border border-solid ${shouldUseWhiteIcon ? '!bg-white !border-white' : ''}`}
              style={innerStyle}
            />
            <div 
              className={`w-[13px] h-[13px] top-0 left-0 rounded-[6.5px] absolute border border-solid ${shouldUseWhiteIcon ? '!bg-white !border-white' : ''}`}
              style={outerStyle}
            />
          </div>
        </div>

        {/* Duration badge */}
        <div 
          className="absolute top-2.5 right-4 rounded-full"
        >
          <div 
            className={`relative h-[22px] rounded-full flex items-center justify-center px-2 min-w-[58px] overflow-hidden ${shouldUseWhiteIcon ? 'bg-white' : 'bg-white'}`} 
            style={{ boxShadow: `1px 5px 20px ${primaryColor}59` }}
          >
            <Clock className="w-[11px] h-[11px] mr-1 flex-shrink-0" style={{ color: shouldUseWhiteIcon ? primaryColor : primaryColor }} />
            <span className="[font-family:'Inter-Regular',Helvetica] font-normal text-[#000000cc] text-[10px] tracking-[-0.17px] whitespace-nowrap">
              {duration}
            </span>
          </div>
        </div>

        {/* White tags */}
        <div className="absolute flex gap-2 top-9 left-4">
          {whiteTags.map((tag, index) => (
            <Badge
              key={`white-tag-${index}`}
              variant="outline"
              className="h-[13px] px-[5px] py-0 bg-white rounded-[7px] flex items-center gap-[3px]"
            >
              {tag.icon}
              <span className="[font-family:'Inter-Regular',Helvetica] font-normal text-[#00000099] text-[9px] tracking-[-0.17px]">
                {tag.text}
              </span>
            </Badge>
          ))}
        </div>

        {/* Teal tags */}
        <div className="absolute flex gap-2 top-[54px] left-4">
          {tealTags.map((tag, index) => (
            <Badge
              key={`teal-tag-${index}`}
              className="h-[13px] px-[5px] py-0 rounded-[7px] flex items-center gap-[3px] border-none"
              style={{ backgroundColor: primaryColor }}
            >
              <div style={{ color: shouldUseWhiteIcon ? 'white' : 'white' }}>
                {tag.icon}
              </div>
              <span className="[font-family:'Inter-Regular',Helvetica] font-normal text-white text-[9px] tracking-[-0.17px]">
                {tag.text}
              </span>
            </Badge>
          ))}
        </div>

        {/* Image section with title */}
        <CardContent 
          className="absolute w-[265px] h-[91px] top-[76px] left-4 p-0 rounded-[7px] relative overflow-hidden"
          style={{ boxShadow: `1px 5px 20px ${primaryColor}59` }}
        >
          {/* Background image */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: `url(${imageSrc})` }}
          />
          
          {/* Gradient overlay - supprimé */}
          
          {/* Title positioned at top */}
          <h2 className="absolute top-2 left-2 text-xl font-bold text-white leading-[24px] break-words z-10 pointer-events-none">
            {title}
          </h2>
          
          {/* Explorer button - positioned in container */}
          {isActive && (
            <Button 
              onClick={handleExplorerClick}
              className="absolute bottom-2 right-2 h-7 px-4 text-white text-xs font-bold rounded-[4px] shadow-lg z-20 pointer-events-auto hover:brightness-90"
              style={{ backgroundColor: primaryColor }}
            >
              {t('navigation.explorer').toUpperCase()}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
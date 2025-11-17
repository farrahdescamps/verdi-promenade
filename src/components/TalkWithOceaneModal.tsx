import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../locales";
import { ParlerIcon } from "./icons";

interface TalkWithOceaneModalProps {
  isOpen: boolean;
  isCreatingConversation?: boolean;
  onClose: () => void;
  onContinue: () => void;
  onTalk: () => void;
}

export const TalkWithOceaneModal: React.FC<TalkWithOceaneModalProps> = ({
  isOpen,
  isCreatingConversation = false,
  onClose,
  onContinue,
  onTalk,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState({ viewSuggestions: false, personalizeMore: false });

  if (!isOpen) return null;

  const handleViewSuggestionsClick = () => {
    onContinue();
  };

  const handlePersonalizeMoreClick = () => {
    onTalk();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-[320px] mx-4">
        <div className="bg-theme-primary rounded-2xl p-8 text-center shadow-2xl">
          
          <div className="flex flex-col items-center justify-center h-full">
            {/* Icône Parler */}
            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="w-16 h-16 flex-shrink-0">
                <ParlerIcon className="w-16 h-16" color="white" />
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full">
              {/* Bouton "Voir les suggestions" */}
              <div className="w-full">
                <button
                  className="w-full h-[50px] rounded-lg border-2 border-white text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  onClick={handleViewSuggestionsClick}
                  onMouseEnter={() =>
                    setIsHovered((prev) => ({ ...prev, viewSuggestions: true }))
                  }
                  onMouseLeave={() =>
                    setIsHovered((prev) => ({ ...prev, viewSuggestions: false }))
                  }
                  aria-label={t('talkWithOceane.viewSuggestionsAriaLabel')}
                >
                  <span className="font-medium text-white text-base">
                    {t('talkWithOceane.viewSuggestionsButton')}
                  </span>
                </button>
              </div>

              {/* Bouton "Personnaliser encore plus !" */}
              <div className="w-full">
                <button
                  className="w-full h-[50px] bg-white rounded-lg text-theme-primary hover:bg-opacity-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-opacity-50"
                  onClick={handlePersonalizeMoreClick}
                  disabled={isCreatingConversation}
                  onMouseEnter={() =>
                    setIsHovered((prev) => ({ ...prev, personalizeMore: true }))
                  }
                  onMouseLeave={() =>
                    setIsHovered((prev) => ({ ...prev, personalizeMore: false }))
                  }
                  aria-label={t('talkWithOceane.personalizeMoreAriaLabel')}
                >
                  <span className="font-medium text-theme-primary text-base">
                    {isCreatingConversation ? t('actions.creating') : t('talkWithOceane.personalizeMoreButton')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
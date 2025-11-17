import { useTheme } from '../contexts/ThemeContext';

/**
 * Hook pour utiliser les couleurs du thème
 * Retourne les couleurs primaire et secondaire de l'hôtel
 * 
 * Usage:
 * const { primary, secondary } = useThemeColor();
 * <div style={{ backgroundColor: primary }}>...</div>
 * 
 * Ou utiliser les classes Tailwind:
 * <div className="bg-theme-primary hover:bg-theme-secondary">...</div>
 */
export const useThemeColor = () => {
  const { primaryColor, secondaryColor } = useTheme();
  
  return {
    primary: primaryColor,
    secondary: secondaryColor,
  };
};



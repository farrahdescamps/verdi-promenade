import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import frTranslations from './fr.json';

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  
  const { interfaceTranslations, currentLanguage, isLoadingTranslations, translationError } = context;
  
  /**
   * Fonction de traduction qui cherche dans les traductions d'interface
   * Supporte l'interpolation de variables avec un objet de paramètres
   * PRIORITÉ: Si langue française, utiliser fr.json LOCAL en priorité
   */
  const t = (key: string, params?: Record<string, any>): string => {
    let translation = '';
    
    // Si langue française, utiliser fr.json LOCAL en priorité
    if (currentLanguage === 'fr') {
      const localValue = getNestedValue(frTranslations, key);
      if (localValue) {
        translation = localValue;
      }
    }
    
    // Si pas français OU pas trouvé dans fr.json, chercher dans l'API
    if (!translation && interfaceTranslations) {
      const interfaceValue = getNestedValue(interfaceTranslations, key);
      if (interfaceValue) {
        translation = interfaceValue;
      }
    }
    
    // Fallback final vers fr.json si pas trouvé dans l'API
    if (!translation) {
      const fallbackValue = getNestedValue(frTranslations, key);
      if (fallbackValue) {
        translation = fallbackValue;
      }
    }
    
    // Si rien n'est trouvé nulle part, retourner la clé
    if (!translation) {
      console.warn('%c⚠️ TRADUCTION MANQUANTE', 'background: #ef4444; color: white; font-size: 10px; padding: 2px 4px;', {
        key,
        lang: currentLanguage,
        message: 'Clé non trouvée ni dans fr.json ni dans l\'API'
      });
      return key;
    }
    
    // Interpoler les paramètres si fournis
    if (params) {
      Object.keys(params).forEach(paramKey => {
        const placeholder = `{${paramKey}}`;
        translation = translation.replace(new RegExp(placeholder, 'g'), params[paramKey]);
      });
    }
    
    return translation;
  };
  
  /**
   * Fonction utilitaire pour récupérer une valeur imbriquée dans un objet
   * en utilisant une clé avec des points (ex: "common.email")
   */
  const getNestedValue = (obj: Record<string, any>, key: string): string | null => {
    const keys = key.split('.');
    let value: any = obj;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        return null;
      }
    }
    
    return typeof value === 'string' ? value : null;
  };
  
  return {
    t,
    currentLanguage,
    isLoadingTranslations,
    translationError
  };
};

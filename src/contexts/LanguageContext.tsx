import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchInterfaceTranslations, InterfaceTranslations } from '../services/languageService';

export type LanguageCode = 'fr' | 'en-au' | 'en-ca' | 'en-in' | 'en-ie' | 'hi' | 'it' | 'ja' | 'de' | 'es' | 'pt' | 'ru';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  isLanguageSelected: boolean;
  interfaceTranslations: InterfaceTranslations | null;
  isLoadingTranslations: boolean;
  translationError: string | null;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('fr');
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);
  const [interfaceTranslations, setInterfaceTranslations] = useState<InterfaceTranslations | null>(null);
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  useEffect(() => {
    // Charger la langue depuis localStorage au démarrage
    const savedLanguage = localStorage.getItem('selectedLanguage') as LanguageCode;
    const languageSelected = localStorage.getItem('languageSelected') === 'true';
    
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
      setIsLanguageSelected(languageSelected);
      // Charger les traductions pour la langue sauvegardée
      loadTranslations(savedLanguage);
    } else {
      // Charger les traductions pour la langue par défaut
      loadTranslations('fr');
    }
  }, []);

  /**
   * Charge les traductions d'interface pour une langue donnée
   */
  const loadTranslations = async (languageCode: LanguageCode) => {
    setIsLoadingTranslations(true);
    setTranslationError(null);
    
    console.log('%c🌐 CHARGEMENT TRADUCTIONS', 'background: #3b82f6; color: white; font-weight: bold; padding: 4px 8px;', {
      languageCode,
      message: `Appel API /interface/download/${languageCode}`
    });
    
    try {
      // Charger les traductions d'interface
      const interfaceData = await fetchInterfaceTranslations(languageCode);
      setInterfaceTranslations(interfaceData);
      
      console.log('%c✅ TRADUCTIONS CHARGÉES', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', {
        languageCode,
        keys: Object.keys(interfaceData || {}).length,
        sample: Object.keys(interfaceData || {}).slice(0, 5)
      });
    } catch (error) {
      console.error('%c❌ ERREUR TRADUCTIONS', 'background: #ef4444; color: white; font-weight: bold; padding: 4px 8px;', {
        languageCode,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Fallback vers fr.json local en cas d'erreur API
      try {
        console.log('%c🔄 FALLBACK vers fr.json local', 'background: #f59e0b; color: white; font-weight: bold; padding: 4px 8px;');
        // Importer directement le fichier JSON au lieu de faire un fetch
        const frTranslations = await import('../locales/fr.json');
        setInterfaceTranslations(frTranslations.default);
        console.log('%c✅ FALLBACK RÉUSSI', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', {
          keys: Object.keys(frTranslations.default || {}).length
        });
      } catch (fallbackError) {
        console.error('%c❌ FALLBACK ÉCHOUÉ', 'background: #ef4444; color: white; font-weight: bold; padding: 4px 8px;', fallbackError);
        setTranslationError(`Failed to load translations for ${languageCode}`);
        setInterfaceTranslations(null);
      }
    } finally {
      setIsLoadingTranslations(false);
    }
  };

  const setLanguage = async (language: LanguageCode) => {
    setCurrentLanguage(language);
    setIsLanguageSelected(true);
    
    localStorage.setItem('selectedLanguage', language);
    localStorage.setItem('languageSelected', 'true');
    
    await loadTranslations(language);
  };

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      setLanguage, 
      isLanguageSelected,
      interfaceTranslations,
      isLoadingTranslations,
      translationError
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
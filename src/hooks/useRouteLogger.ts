import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Mapping des routes vers les noms d'écrans lisibles
const ROUTE_NAMES: Record<string, string> = {
  '/': 'SplashScreen',
  '/page-langue': 'PageLangue',
  '/page-connexion': 'PageConnexion',
  '/page-creer-un-compte': 'PageCréerUnCompte',
  '/page-password': 'PagePassword',
  '/page-password-u47-reset': 'PagePasswordReset',
  '/onboarding': 'Onboarding',
  '/page-choix-intro': 'PageChoixIntro',
  '/journey': 'PageMonAventure',
  '/chat-profiling': 'PageChatProfiling',
  '/conversations': 'PageConversationList',
  '/explorer': 'PageExplorer',
  '/page-profil-intro': 'PageProfilIntro',
  '/test': 'PageTest',
};

/**
 * Hook pour logger automatiquement les changements d'écran
 * Affiche dans la console: "📱 CHANGEMENT D'ÉCRAN → Nom: [NomDeLécran]"
 */
export const useRouteLogger = () => {
  const location = useLocation();

  useEffect(() => {
    // Extraire le chemin de base sans paramètres
    const pathname = location.pathname;
    
    // Déterminer le nom de l'écran
    let screenName = ROUTE_NAMES[pathname];
    
    // Gérer les routes dynamiques (avec paramètres)
    if (!screenName) {
      if (pathname.startsWith('/activite/') && pathname.endsWith('/chat')) {
        screenName = 'PageActivityChat';
      } else if (pathname.startsWith('/activite/')) {
        screenName = 'PageActivite';
      } else {
        screenName = 'Page inconnue';
      }
    }
    
    // Logger le changement d'écran avec un style visible
    console.log(
      '%c📱 CHANGEMENT D\'ÉCRAN',
      'background: #6b7280; color: white; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
      `→ Nom: ${screenName}`,
      `\n   Path: ${pathname}`,
      location.search ? `\n   Query: ${location.search}` : '',
      location.state ? `\n   State:` : '',
      location.state || ''
    );
  }, [location]);
};


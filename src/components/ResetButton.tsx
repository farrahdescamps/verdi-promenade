import React, { useState } from 'react';

/**
 * Bouton de reset pour le développement
 * Supprime tous les caches et redémarre l'app
 */
export const ResetButton = () => {
  const [isResetting, setIsResetting] = useState(false);

  // Seulement visible en développement
  if (!import.meta.env.DEV) {
    return null;
  }

  const handleReset = () => {
    if (isResetting) return;

    const confirmed = window.confirm(
      '🔄 RESET COMPLET\n\n' +
      'Cette action va :\n' +
      '• Supprimer tous les localStorage\n' +
      '• Supprimer tous les sessionStorage\n' +
      '• Supprimer les cookies de session\n' +
      '• Redémarrer l\'app\n\n' +
      'Confirmer ?'
    );

    if (!confirmed) return;

    setIsResetting(true);

    // Afficher un message de progression
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(220, 38, 38, 0.95);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    overlay.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">🔄</div>
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Reset en cours...</div>
      <div style="font-size: 14px; opacity: 0.9;">Nettoyage des caches</div>
    `;
    document.body.appendChild(overlay);

    // Délai pour que l'utilisateur voie le message
    setTimeout(() => {
      try {
        // 1. Supprimer tous les localStorage
        localStorage.clear();

        // 2. Supprimer tous les sessionStorage
        sessionStorage.clear();

        // 3. Supprimer les cookies (simple suppression des cookies de session)
        document.cookie.split(';').forEach((cookie) => {
          const [name] = cookie.split('=');
          document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });

        // 4. Nettoyer les caches du service worker (si présent)
        if ('caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => {
              caches.delete(name);
            });
          });
        }

        // 5. Message de succès
        overlay.innerHTML = `
          <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
          <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Reset terminé !</div>
          <div style="font-size: 14px; opacity: 0.9;">Redémarrage...</div>
        `;

        // 6. Rediriger vers la racine après un court délai
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } catch (error) {
        console.error('Erreur lors du reset:', error);
        alert('Erreur lors du reset. Vérifiez la console.');
        document.body.removeChild(overlay);
        setIsResetting(false);
      }
    }, 300);
  };

  return (
    <button
      onClick={handleReset}
      disabled={isResetting}
      className="fixed top-4 right-4 z-[9999] w-12 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg transition-all duration-200 flex items-center justify-center"
      style={{
        opacity: isResetting ? 0.5 : 1,
        cursor: isResetting ? 'not-allowed' : 'pointer',
      }}
      title="Reset complet (Dev uniquement)"
    >
      R
    </button>
  );
};



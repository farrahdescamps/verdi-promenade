// Utilitaire pour gérer la hauteur dynamique du viewport
// Cela permet d'obtenir un effet "quasi app" en s'adaptant à la taille réelle de l'écran

let resizeHandler: (() => void) | null = null;

/**
 * Calcule et définit la hauteur réelle du viewport comme variable CSS
 * Prend en compte les barres de navigation du navigateur sur mobile
 */
export const setAppHeight = (): void => {
  const appHeight = window.visualViewport?.height || window.innerHeight;
  
  document.documentElement.style.setProperty('--app-height', `${appHeight}px`);
  
  document.documentElement.offsetHeight;
};

export const initViewportHeight = (): void => {
  setAppHeight();
  
  resizeHandler = debounce(setAppHeight, 100);
  
  window.addEventListener('resize', resizeHandler);
  window.addEventListener('orientationchange', resizeHandler);
  
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resizeHandler);
  }
  
  window.addEventListener('focusin', resizeHandler);
  window.addEventListener('focusout', resizeHandler);
};

export const cleanupViewportHeight = (): void => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    window.removeEventListener('orientationchange', resizeHandler);
    
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', resizeHandler);
    }
    
    window.removeEventListener('focusin', resizeHandler);
    window.removeEventListener('focusout', resizeHandler);
    
    resizeHandler = null;
  }
};

/**
 * Fonction utilitaire de debounce pour éviter trop d'appels lors du redimensionnement
 */
function debounce(func: () => void, wait: number): () => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction() {
    const later = () => {
      clearTimeout(timeout);
      func();
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
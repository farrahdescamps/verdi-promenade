import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../locales";
import { useTheme } from "../../contexts/ThemeContext";
import { LogoDisplay } from "../../utils/logoUtils";
import { useSession } from "../../contexts/SessionContext";

interface MenuItem {
  id: string;
  type: 'restaurant' | 'activity' | 'itinerary' | 'hotel' | 'concierge';
  icon: string;
  textKey: string;
  iconAlt: string;
  path: string;
  category?: string;
}

// Mapping des types vers les configurations de menu.
const TYPE_TO_MENU_CONFIG: Record<string, Omit<MenuItem, 'id' | 'type' | 'category'>> = {
  'hotel': {
    icon: "/img/hotel-icon.svg",
    textKey: "home.enjoyYourStay",
    iconAlt: "Hotel",
    path: "/page-choix-intro", // Passe par Tinder - skip auto si aucune carte
  },
  'restaurant': {
    icon: "/img/restaurant-icon.svg",
    textKey: "home.chooseRestaurant",
    iconAlt: "Restaurant",
    path: "/page-choix-intro", // Passe par Tinder - skip auto si aucune carte
  },
  'itinerary': {
    icon: "/img/ville-icon.svg",
    textKey: "home.discoverCity",
    iconAlt: "Ville",
    path: "/page-choix-intro", // Passe par Tinder - skip auto si aucune carte
  },
  'activity': {
    icon: "/img/reserver-icon.svg",
    textKey: "home.bookExperience",
    iconAlt: "Reserver",
    path: "/page-choix-intro", // Passe par Tinder - skip auto si aucune carte
  },
};

export const PageHome = (): JSX.Element => {
  const { t } = useTranslation();
  const { logoUrl, hotelName, regionName, primaryColor, secondaryColor, mainPhotoUrl, isLoading: isLoadingTheme } = useTheme();
  const { themes, isLoadingThemes, loadThemes } = useSession();
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Forcer un re-render après calcul des safe-areas (problème mobile)
  const [safeAreasReady, setSafeAreasReady] = useState(false);

  useEffect(() => {
    // Attendre que les safe-areas ET le viewport soient stabilisés
    const maxAttempts = 20; // 2 secondes max
    let attemptsRef = { current: 0 }; // Utiliser un objet pour le partager entre fonctions

    const checkReady = () => {
      const sat = getComputedStyle(document.documentElement).getPropertyValue('--sat');
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      
      console.log('%c📏 LAYOUT CHECK', 'background: #f59e0b; color: white; padding: 4px 8px;', { 
        sat, 
        viewportHeight,
        innerHeight: window.innerHeight,
        attempt: attemptsRef.current + 1
      });
      
      attemptsRef.current++;
      
      // Attendre soit qu'on ait des safe-areas, soit qu'on ait atteint le max d'essais
      // (car sur certains mobiles sans notch, sat reste à 0px)
      if (attemptsRef.current >= 5 || (sat && sat !== '0px')) {
        console.log('%c✅ LAYOUT READY', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', { sat, attempts: attemptsRef.current });
        setSafeAreasReady(true);
      } else if (attemptsRef.current < maxAttempts) {
        // Réessayer après 100ms
        setTimeout(checkReady, 100);
      } else {
        // Timeout, on continue quand même
        console.log('%c⚠️ LAYOUT TIMEOUT', 'background: #f59e0b; color: white; padding: 4px 8px;');
        setSafeAreasReady(true);
      }
    };

    // Petite pause pour laisser le navigateur initialiser
    setTimeout(checkReady, 50);

    // Écouter les changements de viewport (quand le clavier apparaît/disparaît)
    let lastViewportHeight = window.visualViewport?.height || window.innerHeight;
    
    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDiff = Math.abs(currentHeight - lastViewportHeight);
      
      console.log('%c🔄 VIEWPORT CHANGE', 'background: #8b5cf6; color: white; padding: 4px 8px;', {
        lastHeight: lastViewportHeight,
        currentHeight: currentHeight,
        diff: heightDiff
      });
      
      // Si le viewport change de plus de 100px (clavier qui s'ouvre/ferme)
      // on force un recalcul complet du layout
      if (heightDiff > 100) {
        console.log('%c🔄 RECALCUL LAYOUT (viewport significatif)', 'background: #ec4899; color: white; font-weight: bold; padding: 4px 8px;');
        
        // Reset le state pour forcer un re-check
        setSafeAreasReady(false);
        
        // Relancer le check après stabilisation
        setTimeout(() => {
          attemptsRef.current = 0; // Reset compteur
          checkReady();
        }, 100);
      }
      
      lastViewportHeight = currentHeight;
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    }
    window.addEventListener('resize', handleViewportChange);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      }
      window.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  // Log au montage du composant
  console.log('%c🏠 PAGE HOME - MONTAGE', 'background: #3b82f6; color: white; font-weight: bold; padding: 8px;', {
    timestamp: new Date().toISOString(),
    logoUrl: logoUrl ? 'EXISTS' : 'NULL',
    mainPhotoUrl: mainPhotoUrl ? 'EXISTS' : 'NULL',
    hotelName: hotelName || 'EMPTY',
    themesCount: themes.length,
    isLoadingTheme,
    isLoadingThemes,
    safeAreasReady
  });

  // Charger le nom du client depuis le localStorage
  useEffect(() => {
    const name = localStorage.getItem('customer_name');
    if (name) {
      setCustomerName(name);
    }
  }, []);

  // Charger les thèmes au montage si pas déjà chargés
  useEffect(() => {
    if (themes.length === 0 && !isLoadingThemes) {
      loadThemes();
    }
  }, [themes, isLoadingThemes, loadThemes]);

  // Précharger les images (logo et photo principale)
  useEffect(() => {
    console.log('%c🖼️ IMAGES - Check', 'background: #8b5cf6; color: white; padding: 4px 8px;', {
      logoUrl: logoUrl ? logoUrl.substring(0, 50) + '...' : 'MANQUANT',
      mainPhotoUrl: mainPhotoUrl ? mainPhotoUrl.substring(0, 50) + '...' : 'MANQUANT'
    });

    if (!logoUrl || !mainPhotoUrl) {
      setImagesLoaded(false);
      return;
    }

    let loadedCount = 0;
    let totalImages = 1; // Au moins la photo principale

    const checkAllLoaded = () => {
      loadedCount++;
      console.log(`%c✅ IMAGE LOADED ${loadedCount}/${totalImages}`, 'background: #10b981; color: white; padding: 4px 8px;');
      if (loadedCount === totalImages) {
        setImagesLoaded(true);
        console.log('%c✅ TOUTES IMAGES CHARGÉES', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;');
      }
    };

    // Si le logo est un SVG inline, pas besoin de le précharger
    const isLogoSvg = logoUrl.trim().startsWith('<svg');
    if (!isLogoSvg) {
      totalImages = 2; // Logo + photo
      console.log('📸 Préchargement logo URL...');
      const logoImg = new Image();
      logoImg.onload = () => {
        console.log('✅ Logo chargé');
        checkAllLoaded();
      };
      logoImg.onerror = () => {
        console.log('❌ Logo erreur');
        checkAllLoaded();
      };
      logoImg.src = logoUrl;
    } else {
      console.log('✅ Logo SVG inline (pas de préchargement)');
      checkAllLoaded();
    }

    // Précharger la photo principale
    console.log('📸 Préchargement photo principale...');
    const photoImg = new Image();
    photoImg.onload = () => {
      console.log('✅ Photo principale chargée');
      checkAllLoaded();
    };
    photoImg.onerror = () => {
      console.log('❌ Photo principale erreur');
      checkAllLoaded();
    };
    photoImg.src = mainPhotoUrl;

  }, [logoUrl, mainPhotoUrl]);

  // Attendre que toutes les données ET les images ET les safe-areas soient prêtes
  useEffect(() => {
    console.log('%c🏠 HOME - Vérification complète', 'background: #3b82f6; color: white; font-weight: bold; padding: 4px 8px;', {
      logoUrl: logoUrl ? 'OK' : 'MANQUANT',
      mainPhotoUrl: mainPhotoUrl ? 'OK' : 'MANQUANT',
      hotelName: hotelName ? 'OK' : 'MANQUANT',
      themesCount: themes.length,
      isLoadingTheme,
      isLoadingThemes,
      imagesLoaded,
      safeAreasReady,
      isInitialLoad
    });

    // mainPhotoUrl est optionnel (peut être null)
    if (logoUrl && hotelName && themes.length > 0 && !isLoadingTheme && !isLoadingThemes && imagesLoaded && safeAreasReady) {
      console.log('%c✅✅✅ TOUT PRÊT - AFFICHAGE !', 'background: #10b981; color: white; font-weight: bold; padding: 8px;');
      setIsInitialLoad(false);
    } else {
      console.log('%c⏳ ATTENTE...', 'background: #f59e0b; color: white; padding: 4px 8px;');
    }
  }, [logoUrl, mainPhotoUrl, hotelName, themes.length, isLoadingTheme, isLoadingThemes, imagesLoaded, safeAreasReady, isInitialLoad]);

  // Ordre fixe des items dans le menu
  const MENU_ORDER: Array<'hotel' | 'restaurant' | 'itinerary' | 'activity'> = [
    'hotel',
    'restaurant', 
    'itinerary',
    'activity'
  ];

  // Créer un map des thèmes par type pour un accès rapide
  const themesByType = new Map(themes.map(theme => [theme.type, theme]));

  // Construire les items du menu dans l'ordre fixe
  const dynamicMenuItems: MenuItem[] = MENU_ORDER
    .map(type => {
      const config = TYPE_TO_MENU_CONFIG[type];
      if (!config) return null;

      // Récupérer le thème correspondant de l'API s'il existe
      const theme = themesByType.get(type);

      return {
        id: theme?.id || `default-${type}`,
        type: type,
        category: type,
        ...config,
      } as MenuItem;
    })
    .filter((item): item is MenuItem => item !== null);

  // Ajouter l'item "Une question?" à la fin
  const menuItems: MenuItem[] = [
    ...dynamicMenuItems,
    {
      id: "any-question",
      type: 'concierge' as const,
      icon: "/img/groom-icon.svg",
      textKey: "home.anyQuestion",
      iconAlt: "Groom",
      path: "/chat",
    },
  ];

  // Afficher un écran de chargement pendant le chargement initial
  if (isInitialLoad) {
    return (
      <div className="bg-[#f4f9fd] w-full h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div 
            className="w-12 h-12 rounded-full animate-spin"
            style={{ 
              border: `4px solid ${primaryColor || '#690217'}`,
              borderTopColor: 'transparent'
            }}
          />
          <p className="text-sm" style={{ color: primaryColor || '#690217' }}>
            {t('common.loading') || 'Chargement...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f9fd] w-full h-screen flex justify-center overflow-y-auto">
      {/* Container centré pour desktop avec max-width */}
      <div
        className="bg-[#f4f9fd] w-full max-w-[500px] relative"
        style={{ 
          minHeight: 'calc(35vh + 450px + var(--sab))',
          paddingBottom: 'max(6rem, calc(6rem + var(--sab)))'
        }}
        data-model-id="16:1016"
      >
        {/* Background image from API */}
        {mainPhotoUrl && (
          <div 
            className="absolute top-0 left-0 w-full rounded-[0px_0px_20px_20px] bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${mainPhotoUrl})`,
              height: '35vh'
            }}
          />
        )}

        {/* Gradient overlay sur toute l'image pour meilleure lisibilité */}
        <div 
          className="absolute top-0 left-0 w-full rounded-[0px_0px_20px_20px]"
          style={{
            height: '35vh',
            background: (() => {
              const color = primaryColor || '#690217';
              const r = parseInt(color.slice(1, 3), 16);
              const g = parseInt(color.slice(3, 5), 16);
              const b = parseInt(color.slice(5, 7), 16);
              return `linear-gradient(180deg, rgba(${r}, ${g}, ${b}, 0.3) 0%, rgba(${r}, ${g}, ${b}, 0.5) 50%, rgba(${r}, ${g}, ${b}, 1) 100%)`;
            })()
          }}
        />

        {/* White card with content inside */}
        <div 
          className="absolute left-[calc(50.00%_-_158px)] w-[317px] bg-[#f4f9fd] rounded-2xl shadow-[0px_5.23px_15.69px_#14132a24]"
          style={{
            top: 'calc(35vh - 50px)',
            padding: '20px 20px 18px 20px'
          }}
        >
          {/* Bienvenue + Nom du client */}
          {customerName && (
            <div 
              className="text-center mb-3"
              style={{
                color: primaryColor || '#690217',
                fontFamily: 'Inter, Helvetica',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: '22px',
                letterSpacing: '-0.3px',
              }}
            >
              Bienvenue,
              <br />
              {customerName}
            </div>
          )}

          {/* Menu navigation */}
          <nav className="flex flex-col gap-[12px]" aria-label="Main navigation">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                state={{ category: item.category }}
                className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity group border-b pb-2"
                style={{ borderColor: `${primaryColor}33` || '#69021733' }}
                aria-label={t(item.textKey)}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-5 h-5"
                    style={{
                      maskImage: `url(${item.icon})`,
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      WebkitMaskImage: `url(${item.icon})`,
                      WebkitMaskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      backgroundColor: secondaryColor || primaryColor || '#690217'
                    }}
                  />
                  <span className="[font-family:'Inter',Helvetica] font-normal text-black text-sm tracking-[-0.17px]">
                    {t(item.textKey, { regionName: regionName || 'la région' })}
                  </span>
                </div>
                <img
                  className="w-2 h-3"
                  alt="Arrow"
                  src="/img/arrow-right.svg"
                />
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom text */}
        <p 
          className="absolute left-[calc(50.00%_-_126px)] w-[252px] [font-family:'Inter',Helvetica] font-normal text-[#00000099] text-[10px] text-center tracking-[0] leading-[normal]"
          style={{
            top: 'calc(35vh + 260px)'
          }}
        >
          {t('home.exploreAtOwnPace')}
          <br />
          {t('home.readCompleteGuide')}
        </p>

        {/* Download button */}
        <button
          className="flex w-[313px] h-[45px] items-center justify-center gap-2.5 px-[61px] py-3.5 absolute left-[calc(50.00%_-_158px)] rounded-[7px] border-[0.5px] border-solid backdrop-blur-[25px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(25px)_brightness(100%)] cursor-pointer hover:opacity-90 transition-opacity"
          style={{ 
            backgroundColor: primaryColor || '#690217',
            top: 'calc(35vh + 305px)'
          }}
          aria-label={t('home.downloadGuide', { hotelName: hotelName })}
        >
          <span className="relative w-fit mt-[-0.50px] ml-[-4.50px] [font-family:'Inter',Helvetica] font-medium text-[#f4f9fd] text-sm text-center tracking-[0] leading-[normal]">
            {t('home.downloadGuide', { hotelName: hotelName })}
          </span>

          <img
            className="relative w-[18px] h-5 mt-[-1.50px] mb-[-1.50px] mr-[-4.50px]"
            alt="Download"
            src="/img/download-icon.svg"
          />
        </button>

        {/* Logo - only show if available from API */}
        {logoUrl && (
          <LogoDisplay
            logoData={logoUrl}
            className="absolute left-1/2 -translate-x-1/2 w-[35%] max-w-[140px] object-contain flex items-center justify-center"
            style={{ 
              filter: 'brightness(0) invert(1)',
              top: 'calc(35vh / 3.5)'
            }}
            alt={hotelName || "Logo"}
          />
        )}

        {/* "À votre façon!" title text - taille réduite pour meilleure lisibilité */}
        {hotelName && (
          <h1 
            className="absolute left-0 right-0 text-center"
            style={{
              color: '#f4f9fd',
              fontFamily: 'Abril Fatface',
              fontSize: '35px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '38px',
              top: 'calc(35vh / 2)'
            }}
          >
            {t('home.yourWay')}
          </h1>
        )}

      </div>
    </div>
  );
};


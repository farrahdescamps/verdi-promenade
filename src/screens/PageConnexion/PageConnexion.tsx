import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useTranslation } from "../../locales";
import { useTheme } from "../../contexts/ThemeContext";
import { ChevronLeftIcon } from "../../components/icons";
import { LogoDisplay } from "../../utils/logoUtils";
import { useSession } from "../../contexts/SessionContext";

export const PageConnexion = (): JSX.Element => {
  const { t } = useTranslation();
  const { logoUrl, hotelName, primaryColor, mainPhotoUrl, isLoading: isLoadingTheme } = useTheme();
  const { loadThemes } = useSession();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  
  // Forcer un re-render quand le viewport change (clavier ouvre/ferme)
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    let lastViewportHeight = window.visualViewport?.height || window.innerHeight;
    
    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDiff = Math.abs(currentHeight - lastViewportHeight);
      
      console.log('%c🔄 LOGIN - VIEWPORT CHANGE', 'background: #8b5cf6; color: white; padding: 4px 8px;', {
        lastHeight: lastViewportHeight,
        currentHeight: currentHeight,
        diff: heightDiff
      });
      
      // Si changement significatif (clavier), forcer re-render
      if (heightDiff > 50) {
        console.log('%c🔄 LOGIN - RECALCUL LAYOUT', 'background: #ec4899; color: white; font-weight: bold; padding: 4px 8px;');
        forceUpdate(prev => prev + 1);
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

  const handleLogin = async () => {
    const email = emailRef.current?.value.trim() || '';
    const name = nameRef.current?.value.trim() || '';

    console.log('%c🔐 LOGIN - START', 'background: #3b82f6; color: white; font-weight: bold; padding: 4px 8px;', {
      email,
      name,
      isLoadingTheme,
      logoUrl: logoUrl ? 'EXISTS' : 'NULL',
      mainPhotoUrl: mainPhotoUrl ? 'EXISTS' : 'NULL'
    });

    setIsLoggingIn(true);
    try {
      // Stocker le nom et l'email dans le localStorage pour affichage
      if (name) {
        localStorage.setItem('customer_name', name);
      }
      if (email) {
        localStorage.setItem('customer_email', email);
      }

      // Fermer le clavier avant de continuer (important sur mobile!)
      if (emailRef.current) emailRef.current.blur();
      if (nameRef.current) nameRef.current.blur();
      
      // Attendre que le clavier se ferme et que le viewport se stabilise
      console.log('%c⌨️ LOGIN - Fermeture clavier...', 'background: #f59e0b; color: white; padding: 4px 8px;', {
        viewportHeight: window.visualViewport?.height || window.innerHeight
      });
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('%c✅ LOGIN - Clavier fermé', 'background: #10b981; color: white; padding: 4px 8px;', {
        viewportHeight: window.visualViewport?.height || window.innerHeight
      });

      // Charger les thèmes depuis l'API après la connexion
      console.log('%c📡 LOGIN - Chargement themes...', 'background: #f59e0b; color: white; padding: 4px 8px;');
      const hotelSessionId = localStorage.getItem('hotel_session_id');
      console.log('%c🔍 LOGIN - hotel_session_id:', 'background: #8b5cf6; color: white; padding: 4px 8px;', hotelSessionId);
      
      if (hotelSessionId) {
        try {
          await loadThemes();
          console.log('%c✅ LOGIN - Themes chargés', 'background: #10b981; color: white; padding: 4px 8px;');
        } catch (themeError) {
          console.log('%c⚠️ LOGIN - Erreur chargement themes (continuer quand même)', 'background: #f59e0b; color: white; padding: 4px 8px;', themeError);
          // Continuer même si le chargement des thèmes échoue
        }
      } else {
        console.log('%c⚠️ LOGIN - Pas de hotel_session_id, skip themes', 'background: #f59e0b; color: white; padding: 4px 8px;');
      }
      
      // Attendre un peu que ThemeContext soit aussi chargé
      // (il se charge en parallèle au montage de l'app)
      console.log('%c⏳ LOGIN - Attente 200ms pour ThemeContext...', 'background: #f59e0b; color: white; padding: 4px 8px;', {
        isLoadingTheme,
        logoUrl: logoUrl ? 'EXISTS' : 'NULL',
        mainPhotoUrl: mainPhotoUrl ? 'EXISTS' : 'NULL'
      });
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('%c✅ LOGIN - Attente terminée', 'background: #10b981; color: white; padding: 4px 8px;', {
        isLoadingTheme,
        logoUrl: logoUrl ? 'EXISTS' : 'NULL',
        mainPhotoUrl: mainPhotoUrl ? 'EXISTS' : 'NULL'
      });
      
      // Rediriger vers la page d'accueil
      console.log('%c🚀 LOGIN - Navigation vers /home', 'background: #3b82f6; color: white; font-weight: bold; padding: 4px 8px;');
      navigate('/home');
    } catch (error) {
      console.error('%c❌ LOGIN - ERROR', 'background: #ef4444; color: white; font-weight: bold; padding: 4px 8px;', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div
      className="flex flex-row justify-center w-full overflow-y-auto"
      style={{ 
        backgroundColor: '#f4f9fd', 
        paddingTop: 'var(--sat)', 
        paddingBottom: 'max(2rem, calc(2rem + var(--sab)))',
        minHeight: '100dvh' // Utiliser dvh au lieu de min-h-screen pour s'adapter au clavier
      }}
      data-model-id="10:216"
    >
      <div className="w-full max-w-[375px] relative" style={{ backgroundColor: '#f4f9fd' }}>
        {/* Back button */}
        <Link 
          to="/" 
          className="absolute w-[50px] h-[50px] left-[20px] flex items-center justify-center z-50 cursor-pointer"
          style={{ top: 'calc(40px + var(--sat))' }}
        >
              <ChevronLeftIcon className="w-8 h-8 text-theme-primary [stroke-width:2.5]" />
        </Link>

        {/* Top gradient overlay - supprimé */}

        {/* Logo */}
        <div 
          className="absolute w-[40%] max-w-[180px] left-1/2 transform -translate-x-1/2 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_path]:fill-current [&_circle]:fill-current [&_rect]:fill-current [&_polygon]:fill-current" 
          style={{ top: 'calc(60px + var(--sat))', color: primaryColor || '#690217' }}
        >
          {logoUrl && (
            <LogoDisplay
              logoData={logoUrl}
              className="max-w-full max-h-full object-contain"
              alt={hotelName || "Hotel Logo"}
            />
          )}
        </div>

        {/* Welcome text */}
        <div className="absolute w-[335px] h-[66px] left-[21px]" style={{ top: 'calc(230px + var(--sat))' }}>
          <div className="absolute w-[335px] top-0 left-0 [font-family:'Playfair_Display',Helvetica] font-bold text-black text-2xl text-center tracking-[0] leading-[53px]">
            {t('login.welcome')}
          </div>
          <div className="absolute w-[269px] h-6 top-[42px] left-8 [font-family:'Inter',Helvetica] font-light text-black text-[13px] text-center tracking-[0] leading-6 whitespace-nowrap">
            {t('login.subtitle')}
          </div>
        </div>

        {/* Login form */}
        <div className="flex flex-col w-[317px] items-start gap-5 absolute left-[29px]" style={{ top: 'calc(320px + var(--sat))', paddingBottom: 'max(7.5rem, calc(7.5rem + var(--sab)))' }}>
          {/* Login fields */}
          <div className="inline-flex flex-col items-start gap-2.5 relative flex-[0_0_auto] w-full">
            <div className="inline-flex flex-col items-start gap-3.5 relative flex-[0_0_auto] w-full">
              {/* Name field */}
              <div className="inline-flex flex-col items-start gap-0.5 relative flex-[0_0_auto] w-full">
                <label className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#b7b7b7] text-xs tracking-[0] leading-[normal]">
                  {t('login.name')}
                </label>
                <div className="w-full">
                  <Input
                    ref={nameRef}
                    type="text"
                    className="h-[52px] rounded-[7px] border border-solid border-[#b7b7b766] pl-[15px] [font-family:'Inter',Helvetica] font-normal text-[#00000099] text-base"
                    placeholder={t('login.namePlaceholder')}
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="inline-flex flex-col items-start gap-0.5 relative flex-[0_0_auto] w-full">
                <label className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#b7b7b7] text-xs tracking-[0] leading-[normal]">
                  {t('login.email')}
                </label>
                <div className="w-full">
                  <Input
                    ref={emailRef}
                    type="email"
                    className="h-[52px] rounded-[7px] border border-solid border-[#b7b7b766] pl-[15px] [font-family:'Inter',Helvetica] font-normal text-[#00000099] text-base"
                    placeholder={t('login.emailPlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Login button */}
            <Button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="h-auto w-full mt-5 px-5 py-[17px] bg-theme-primary rounded-[7px] [font-family:'Inter',Helvetica] font-medium text-white text-sm text-center tracking-[-0.17px] leading-[18px]"
            >
              {isLoggingIn ? 'Connexion...' : t('login.loginButton')}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

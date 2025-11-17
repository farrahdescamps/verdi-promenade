import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../contexts/SessionContext";
import { fetchHotelVideos, HotelVideoData } from "../../services/videoService";
import { fetchLanguages, Language } from "../../services/languageService";
import { createHotelSession } from "../../services/hotelSessionService";
import { useTranslation } from "../../locales";
import { useLanguage, LanguageCode } from "../../contexts/LanguageContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { SearchIcon, MicIcon } from "../../components/icons";
import { Header } from "../../components/Header";
import { LogoDisplay } from "../../utils/logoUtils";
import "../../styles/components.css";

export const SplashScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoadingSession } = useSession();
  const { setLanguage } = useLanguage();
  
  const [fadeOut, setFadeOut] = useState(false);
  const [hotelData, setHotelData] = useState<HotelVideoData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  
  // États pour la sélection de langue
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showExperienceScreen, setShowExperienceScreen] = useState(false);
  const [hideVideo, setHideVideo] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | null>(null);
  const [languagesLoading, setLanguagesLoading] = useState(false);
  
  // Référence pour la vidéo (pour contrôler le son)
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Récupérer l'hotel_id depuis les variables d'environnement
  const hotelId = import.meta.env.VITE_HOTEL_ID || '';

  // Charger les données de l'hôtel depuis l'API
  useEffect(() => {
    const loadHotelData = async () => {
      if (!hotelId) {
        setDataError('Hotel ID not configured');
        setDataLoading(false);
        return;
      }

      try {
        setDataLoading(true);
        setDataError(null);
        
        const data = await fetchHotelVideos(hotelId);
        setHotelData(data);
      } catch (error) {
        setDataError(error instanceof Error ? error.message : 'Failed to load hotel data');
      } finally {
        setDataLoading(false);
      }
    };

    loadHotelData();
  }, [hotelId]);

  // Charger les langues depuis l'API
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        setLanguagesLoading(true);
        const fetchedLanguages = await fetchLanguages();
        const uniqueLanguages = fetchedLanguages.filter((language, index, self) => 
          index === self.findIndex(l => l.id === language.id)
        );
        setLanguages(uniqueLanguages);
      } catch (err) {
        // Fallback languages
        const fallbackLanguages = [
          { id: "en", name: "English", subtitle: "English", code: "en" },
          { id: "fr", name: "Français", subtitle: "French", code: "fr" },
          { id: "es", name: "Español", subtitle: "Spanish", code: "es" },
          { id: "de", name: "Deutsch", subtitle: "German", code: "de" },
          { id: "it", name: "Italiano", subtitle: "Italian", code: "it" },
          { id: "pt", name: "Português", subtitle: "Portuguese", code: "pt" },
        ];
        setLanguages(fallbackLanguages);
      } finally {
        setLanguagesLoading(false);
      }
    };

    loadLanguages();
  }, []);

  // Afficher le sélecteur de langue après 3 secondes
  useEffect(() => {
    if (isLoadingSession) {
      return;
    }

    const timer = setTimeout(() => {
      setShowLanguageSelector(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoadingSession]);

  // Gérer la sélection de langue
  const handleLanguageSelect = async (langCode: LanguageCode) => {
    setSelectedLanguage(langCode);
    setLanguage(langCode);
    
    // Créer la session hôtel avec le code de langue sélectionné
    try {
      if (hotelId) {
        const sessionResponse = await createHotelSession(langCode, hotelId);
        // Stocker le session_id dans le localStorage
        if (sessionResponse.session_id) {
          localStorage.setItem('hotel_session_id', sessionResponse.session_id);
          localStorage.setItem('hotel_session_lang', langCode);
        }
      }
    } catch (error) {
      // En cas d'erreur, on continue quand même le flow
      console.error('Erreur lors de la création de la session:', error);
    }
    
    // Fade out de la sélection de langue et fade in de l'écran "Your experience!"
    setTimeout(() => {
      setShowLanguageSelector(false);
      setTimeout(() => {
        setShowExperienceScreen(true);
        
        // Commencer le fade out du son
        fadeOutAudio();
        
        // Cacher la vidéo après 1 seconde (quand le rideau couvre l'écran)
        setTimeout(() => {
          setHideVideo(true);
        }, 1000);
        
        // Après 2 secondes, naviguer vers la page de connexion
        setTimeout(() => {
          navigate("/page-connexion");
        }, 2000);
      }, 700);
    }, 300);
  };
  
  // Fonction pour faire un fade out progressif du son
  const fadeOutAudio = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const fadeDuration = 2000; // 2 secondes de fade out
    const steps = 50; // Nombre d'étapes
    const stepDuration = fadeDuration / steps;
    const volumeStep = video.volume / steps;
    
    let currentStep = 0;
    
    const fadeInterval = setInterval(() => {
      if (currentStep >= steps || !videoRef.current) {
        clearInterval(fadeInterval);
        if (videoRef.current) {
          videoRef.current.volume = 0;
        }
        return;
      }
      
      videoRef.current.volume = Math.max(0, video.volume - volumeStep);
      currentStep++;
    }, stepDuration);
  };

  // Déterminer la source vidéo à utiliser
  const videoSource = hotelData?.video_intro_url || null;
  
  // Filtrer les langues par terme de recherche
  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`h-app max-h-app overflow-hidden transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'} relative`} style={{ backgroundColor: hideVideo ? '#f4f9fd' : 'transparent', paddingTop: 'var(--sat)', paddingBottom: 'max(1rem, calc(1rem + var(--sab)))' }}>
      {/* Background video - cache après le passage du rideau */}
      {!dataLoading && videoSource && !hideVideo && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={false}
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-0"
          onLoadedMetadata={(e) => {
            // Forcer la lecture si l'autoplay échoue (problème mobile/Vercel)
            const video = e.currentTarget;
            const playPromise = video.play();
            
            if (playPromise !== undefined) {
              playPromise.catch(() => {
                // Si la lecture avec son échoue, réessayer en muet
                video.muted = true;
                video.play().catch(() => {
                  // Ignorer l'erreur si même en muet ça échoue
                });
              });
            }
          }}
        >
          <source src={videoSource} type="video/mp4" />
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      )}

      {/* Fallback background - blanc cassé pour la transition */}

      {/* Logo unique - s'anime une seule fois puis reste en place */}
      {hotelData?.logo_url && !showExperienceScreen && (
        <div 
          className={`absolute z-20 left-1/2 -translate-x-1/2 ${
            showLanguageSelector || selectedLanguage
              ? 'w-[30%] max-w-[120px]'
              : '-translate-y-1/2 w-[50%] max-w-[220px]'
          }`}
          style={{
            top: showLanguageSelector || selectedLanguage 
              ? 'calc(60px + var(--sat))' 
              : '50%',
            transition: 'all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <LogoDisplay
            logoData={hotelData.logo_url}
            className="w-full h-full object-contain [&_svg]:w-full [&_svg]:h-full [&_svg]:fill-white [&_svg_path]:fill-white"
            alt={hotelData.hotel_name || "Hotel Logo"}
          />
        </div>
      )}

      {/* Loading dots - en dessous du logo */}
      {(isLoadingSession || dataLoading) && !showLanguageSelector && (
        <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ marginTop: 'calc(220px + var(--sat))' }}>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}

      {/* Logo group en bas - splash initial uniquement */}
      <div className={`absolute left-0 right-0 z-10 flex justify-center transition-opacity duration-700 ${showLanguageSelector ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ bottom: 'max(4rem, calc(4rem + var(--sab)))' }}>
        {hotelData?.logo_group_url && (
          <LogoDisplay
            logoData={hotelData.logo_group_url}
            className="max-w-[140px] max-h-[70px] object-contain opacity-90 [&_svg]:fill-white [&_svg_path]:fill-white"
            alt="Group Logo"
          />
        )}
      </div>

      {/* Language selector - Design simplifié */}
      <div className={`absolute inset-0 z-10 flex flex-col transition-opacity duration-700 ${showLanguageSelector && !showExperienceScreen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full max-w-[375px] h-full relative mx-auto flex flex-col">
          {/* Espace pour le logo (rendu par le composant unique ci-dessus) */}
          <div className="px-[29px] mb-8 flex-shrink-0 flex justify-center h-[117px]" style={{ paddingTop: 'calc(60px + var(--sat))' }}>
            {/* Le logo est rendu par le composant unique qui se transforme */}
          </div>

          {/* Main title - Nom de l'hôtel + your way */}
          <div className="px-[29px] mb-12 flex-shrink-0">
            <h1 className="text-[45px] leading-[53px]" style={{ fontFamily: 'Playfair Display', fontWeight: 300 }}>
              <span style={{ color: hotelData?.couleur_primaire || 'var(--color-primary)' }}>
                {hotelData?.hotel_name || 'Kube'},
              </span>
              <br />
              <span className="text-white">
                your way!
              </span>
            </h1>
          </div>

          {/* Language selection section */}
          <div className="px-[29px] mb-4 flex-shrink-0">
            <p className="text-white text-sm mb-4">Choose your language</p>
            
            {/* Search bar */}
            <div className="relative mb-6">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-12 py-3 bg-white/90 backdrop-blur-sm border-none rounded-lg text-gray-700 placeholder-gray-400"
              />
              <MicIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {/* Scrollable Language list */}
          <div className="px-[29px] flex-1 flex flex-col min-h-0 pb-8">
            <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden flex flex-col min-h-0 max-h-full">
              {languagesLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-gray-500">Loading...</div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-0 min-h-0">
                  {filteredLanguages.map((language) => (
                    <button
                      key={language.id}
                      onClick={() => handleLanguageSelect(language.id as LanguageCode)}
                      className={`w-full px-4 py-4 text-left border-b border-gray-200/50 last:border-b-0 hover:bg-gray-50/50 transition-colors ${
                        selectedLanguage === language.id ? 'language-item-selected' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900">{language.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Experience Screen - "Your experience!" */}
      <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center ${showExperienceScreen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Overlay bordeaux avec effet rideau qui descend puis remonte */}
        <div 
          className={`absolute inset-0 transition-all ${showExperienceScreen ? 'animate-[slideDownUp_2s_cubic-bezier(0.65,0,0.35,1)_forwards]' : '-translate-y-full'}`}
          style={{
            background: `var(--color-primary)`,
          }}
        />
        
        <div className="w-full max-w-[375px] h-full relative mx-auto flex flex-col items-center justify-between px-6 z-10" style={{ paddingTop: 'calc(3rem + var(--sat))', paddingBottom: 'calc(3rem + var(--sab))' }}>
          {/* Espace pour le logo (rendu par le composant unique ci-dessus) */}
          <div className="flex-shrink-0 h-[117px]" style={{ paddingTop: 'calc(60px + var(--sat))' }}>
            {/* Le logo est rendu par le composant unique qui reste en haut */}
          </div>

          {/* Titre centré "Your experience!" - fades out avec délai */}
          <div className={`flex-1 flex items-center justify-center transition-opacity duration-1000 ${showExperienceScreen ? 'opacity-0 delay-500' : 'opacity-100'}`}>
            <h1 
              className="text-[45px] leading-[53px] text-white text-center"
              style={{ fontFamily: 'Playfair Display', fontWeight: 700 }}
            >
              {t('splash.yourExperience')}
            </h1>
          </div>

          {/* Espace en bas pour équilibrer */}
          <div className="flex-shrink-0 h-[80px]"></div>
        </div>
      </div>
    </div>
  );
};
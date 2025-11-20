import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../locales';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { BackButton } from '../../components/BackButton';
import { API_KEY } from '../../config';

interface StayItem {
  description: string;
  photo: string;
  actions: any[];
  writingGuidelines: string;
}

interface StayCategory {
  [key: string]: StayItem;
}

interface StayHotelResponse {
  success: boolean;
  hotel_id: string;
  lang_code: string;
  details: Record<string, StayCategory>;
}

export const PageEnjoyStay: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { primaryColor, secondaryColor, mainPhotoUrl, logoUrl, hotelName } = useTheme();
  const { currentLanguage } = useLanguage();
  
  const [stayData, setStayData] = useState<StayHotelResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all'); // "all" par défaut

  // Charger les données depuis l'API
  useEffect(() => {
    const loadStayData = async () => {
      const hotelSessionId = localStorage.getItem('hotel_session_id');
      
      if (!hotelSessionId) {
        setError('No session ID found');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const response = await fetch('/concierge-api/stay-hotel-display', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'x-api-key': API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session_id: hotelSessionId
          })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data: StayHotelResponse = await response.json();
        
        console.log('%c✅ STAY DATA LOADED', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', data);
        
        setStayData(data);
        setIsLoading(false);
        
      } catch (err) {
        console.error('%c❌ ERROR LOADING STAY DATA', 'background: #ef4444; color: white; font-weight: bold; padding: 4px 8px;', err);
        setError(err instanceof Error ? err.message : 'Failed to load stay data');
        setIsLoading(false);
      }
    };

    loadStayData();
  }, [currentLanguage]);

  // Fonction pour formater les clés en titres lisibles
  const formatTitle = (key: string): string => {
    return key
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Traduction des noms de catégories
  const getCategoryTitle = (categoryKey: string): string => {
    // L'API retourne déjà les noms formatés correctement (ex: "Restauration", "Bien-être")
    // On normalise la clé pour faire le mapping si nécessaire
    const normalizedKey = categoryKey.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/&/g, '');
    
    const translations: Record<string, string> = {
      'restauration': 'Restauration',
      'plage': 'Plage',
      'bien-etre': 'Bien-être',
      'bienetre': 'Bien-être',
      'animations': 'Animations',
      'services': 'Services',
      'business': 'Business',
      'urgence': 'Urgence & bon à savoir',
      'urgence-bon-a-savoir': 'Urgence & bon à savoir'
    };
    
    // Si la clé existe dans les traductions, l'utiliser
    if (translations[normalizedKey]) {
      return translations[normalizedKey];
    }
    
    // Sinon, utiliser directement la clé de l'API (déjà formatée)
    return categoryKey;
  };

  // Récupérer les catégories avec leurs items (filtrer les items vides)
  const getCategories = () => {
    if (!stayData) return [];
    
    return Object.entries(stayData.details)
      .map(([categoryKey, items]) => {
        // Filtrer les items qui ont une description
        const activeItems = Object.entries(items)
          .filter(([_, item]) => item.description && item.description.trim() !== '');
        
        // Récupérer la première photo disponible dans les items
        const categoryPhoto = activeItems.find(([_, item]) => item.photo)?.[1]?.photo || '';
        
        return {
          key: categoryKey,
          title: getCategoryTitle(categoryKey),
          itemsCount: activeItems.length,
          photo: categoryPhoto
        };
      })
      .filter(category => category.itemsCount > 0); // Garder seulement les catégories avec des items
  };

  // Récupérer les items de la catégorie active (ou toutes si "all")
  const getActiveCategoryItems = () => {
    if (!stayData) return [];
    
    // Si "all", retourner tous les items de toutes les catégories
    if (activeCategory === 'all') {
      const allItems: Array<{ key: string; categoryKey: string; title: string; description: string; photo: string; actions: any[]; writingGuidelines: string }> = [];
      
      Object.entries(stayData.details).forEach(([categoryKey, categoryItems]) => {
        Object.entries(categoryItems)
          .filter(([_, item]) => item.description && item.description.trim() !== '')
          .forEach(([itemKey, item]) => {
            allItems.push({
              key: itemKey,
              categoryKey: categoryKey,
              title: formatTitle(itemKey),
              ...item
            });
          });
      });
      
      return allItems;
    }
    
    // Sinon, retourner seulement les items de la catégorie active
    const categoryItems = stayData.details[activeCategory];
    if (!categoryItems) return [];
    
    return Object.entries(categoryItems)
      .filter(([_, item]) => item.description && item.description.trim() !== '')
      .map(([itemKey, item]) => ({
        key: itemKey,
        categoryKey: activeCategory,
        title: formatTitle(itemKey),
        ...item
      }));
  };

  // Navigation vers le POI spécifique dans PageActivite (avec animation)
  const handleItemClick = (itemKey: string, categoryKey: string) => {
    const activityId = `hotel_${categoryKey}`;
    const poiId = `hotel_poi_${categoryKey}_${itemKey}`;
    
    console.log('%c🏨 CLIC POI ENJOY STAY', 'background: #8b5cf6; color: white; font-weight: bold; padding: 4px 8px;', {
      itemKey,
      categoryKey,
      activityId,
      poiId,
      categoryTitle: getCategoryTitle(categoryKey),
      poiName: formatTitle(itemKey)
    });
    
    // Navigation directe - PageTransition gère l'animation
    navigate(`/activite/${activityId}`, {
      state: {
        isHotelCategory: true,
        categoryKey: categoryKey,
        categoryTitle: getCategoryTitle(categoryKey),
        stayData: stayData,
        scrollToPoiId: poiId,
        poiName: formatTitle(itemKey)
      }
    });
  };

  // Navigation vers la catégorie complète (toute l'activité)
  const handleViewCategory = (categoryKey: string) => {
    const activityId = `hotel_${categoryKey}`;
    
    // Navigation directe - PageTransition gère l'animation
    navigate(`/activite/${activityId}`, {
      state: {
        isHotelCategory: true,
        categoryKey: categoryKey,
        categoryTitle: getCategoryTitle(categoryKey),
        stayData: stayData
      }
    });
  };

  return (
    <div className="bg-[#f4f9fd] w-full relative overflow-hidden flex flex-col" style={{ height: '100dvh' }}>
      {/* Header avec image et logo */}
      <div className="relative w-full overflow-hidden rounded-b-[20px] flex-shrink-0" style={{ paddingTop: 'max(0px, env(safe-area-inset-top, 0px))', minHeight: '300px' }}>
        {/* Image de l'hôtel */}
        {mainPhotoUrl && (
          <div 
            className="absolute inset-0 rounded-b-[20px]"
            style={{
              backgroundImage: `url(${mainPhotoUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              fontSize: 0,
              lineHeight: 0,
              color: 'transparent'
            }}
          />
        )}
        
        {/* Gradient overlay */}
        {/* Gradient overlay - utilise primaryColor converti en RGB */}
        <div 
          className="absolute bottom-0 left-0 w-full h-[100px] rounded-b-[20px]"
          style={{
            background: (() => {
              const color = primaryColor || '#690217';
              const r = parseInt(color.slice(1, 3), 16);
              const g = parseInt(color.slice(3, 5), 16);
              const b = parseInt(color.slice(5, 7), 16);
              return `linear-gradient(180deg, rgba(${r}, ${g}, ${b}, 0) 0%, rgba(${r}, ${g}, ${b}, 1) 100%)`;
            })()
          }}
        />

        {/* Logo de l'hôtel */}
        <div className="absolute left-0 right-0 mx-auto w-[30%] max-w-[120px] flex items-center justify-center" style={{ top: '63px' }}>
          {logoUrl && (
            <div
              dangerouslySetInnerHTML={{ __html: logoUrl }}
              className="w-full h-full"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          )}
        </div>

        {/* Titre */}
        <h1 
          className="absolute bottom-[30px] left-0 right-0 text-center text-white text-[28px] tracking-[-0.17px] leading-8"
          style={{ 
            fontFamily: 'Abril Fatface', 
            fontWeight: 400 
          }}
        >
          {t('home.enjoyYourStay')}
        </h1>

        {/* Bouton retour */}
        <div className="absolute left-[23px] z-20" style={{ top: '63px' }}>
          <BackButton onClick={() => navigate('/home')} />
        </div>
      </div>

      {/* Contenu principal - scrollable */}
      <div className="w-full max-w-[500px] mx-auto flex-1 overflow-y-auto" style={{ paddingBottom: 'max(2rem, calc(2rem + env(safe-area-inset-bottom, 0px)))' }}>
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div 
              className="w-8 h-8 rounded-full animate-spin mb-4"
              style={{ 
                border: `3px solid ${primaryColor || '#690217'}`,
                borderTopColor: 'transparent'
              }}
            />
            <p className="text-gray-600">{t('common.loading') || 'Loading...'}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mx-6">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!isLoading && !error && stayData && (
          <>
            {/* Menu horizontal des catégories - scroll invisible avec ligne horizontale */}
            <div className="relative bg-[#f4f9fd] sticky top-0 z-10">
              <div 
                className="overflow-x-auto px-6 py-4"
                style={{
                  scrollbarWidth: 'none', // Firefox
                  msOverflowStyle: 'none', // IE/Edge
                }}
              >
                <style>{`
                  .overflow-x-auto::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <div className="flex gap-2 min-w-max relative">
                  {/* Option "Tout" */}
                  <button
                    onClick={() => setActiveCategory('all')}
                    className="px-3 py-1.5 rounded-lg text-[9px] font-normal transition-all whitespace-nowrap"
                    style={{
                      backgroundColor: activeCategory === 'all' ? primaryColor || '#690217' : 'transparent',
                      color: activeCategory === 'all' ? 'white' : primaryColor || '#690217',
                      fontFamily: 'Inter'
                    }}
                  >
                    {t('home.all')}
                  </button>

                  {/* Autres catégories */}
                  {getCategories().map((category) => (
                    <button
                      key={category.key}
                      onClick={() => setActiveCategory(category.key)}
                      className="px-3 py-1.5 rounded-lg text-[9px] font-normal transition-all whitespace-nowrap"
                      style={{
                        backgroundColor: activeCategory === category.key ? primaryColor || '#690217' : 'transparent',
                        color: activeCategory === category.key ? 'white' : primaryColor || '#690217',
                        fontFamily: 'Inter'
                      }}
                    >
                      {category.title}
                    </button>
                  ))}
                </div>
              </div>
              {/* Ligne horizontale - commence après "Tout" */}
              <div 
                className="absolute bottom-0 h-[1px]"
                style={{ 
                  backgroundColor: primaryColor || '#690217', 
                  opacity: 0.2,
                  left: '24px', // px-6 = 24px
                  right: 0
                }}
              />
            </div>

            {/* Affichage par catégories si "all", sinon catégorie unique */}
            {activeCategory === 'all' ? (
              // Mode "All" : afficher toutes les catégories avec leurs items
              <div className="space-y-6 pt-6">
                {getCategories().map((category) => {
                  const categoryItems = Object.entries(stayData.details[category.key])
                    .filter(([_, item]) => item.description && item.description.trim() !== '')
                    .map(([itemKey, item]) => ({
                      key: itemKey,
                      categoryKey: category.key,
                      title: formatTitle(itemKey),
                      ...item
                    }));

                  if (categoryItems.length === 0) return null;

                  return (
                    <div key={category.key} className="px-6">
                      {/* Titre de la catégorie avec bouton "Voir plus" */}
                      <div className="flex justify-between items-center mb-4">
                        <button
                          onClick={() => handleViewCategory(category.key)}
                          className="text-base font-bold hover:underline"
                          style={{ 
                            color: '#000000',
                            fontFamily: 'Inter',
                            fontSize: '15px'
                          }}
                        >
                          {category.title}
                        </button>
                        <button
                          onClick={() => handleViewCategory(category.key)}
                          className="text-xs font-normal hover:underline"
                          style={{
                            color: primaryColor || '#690217',
                            fontFamily: 'Inter'
                          }}
                        >
                          Voir plus →
                        </button>
                      </div>

                      {/* Grille des items - 3 colonnes */}
                      <div className="grid grid-cols-3 gap-2">
                        {categoryItems.map((item) => (
                          <button
                            key={item.key}
                            onClick={() => handleItemClick(item.key, category.key)}
                            className="hover:opacity-80 transition-all text-left"
                          >
                            {/* Image - avec bordure arrondie */}
                            {item.photo ? (
                              <img 
                                src={item.photo} 
                                alt={item.title}
                                className="w-full h-20 object-cover rounded-xl mb-1.5"
                              />
                            ) : (
                              <div 
                                className="w-full h-20 flex items-center justify-center rounded-xl mb-1.5"
                                style={{ backgroundColor: `${primaryColor || '#690217'}15` }}
                              >
                                <span 
                                  className="text-xl opacity-30"
                                  style={{ color: primaryColor || '#690217' }}
                                >
                                  ✨
                                </span>
                              </div>
                            )}
                            
                            {/* Titre - multi-ligne */}
                            <h3 
                              className="text-xs font-normal"
                              style={{ 
                                color: '#000000',
                                fontFamily: 'Inter',
                                fontSize: '10px',
                                lineHeight: '1.3',
                                wordBreak: 'break-word'
                              }}
                            >
                              {item.title}
                            </h3>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Mode catégorie unique
              <div className="px-6 py-6 space-y-4">
                {/* Titre de la catégorie avec bouton "Voir plus" */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleViewCategory(activeCategory)}
                    className="text-base font-bold hover:underline"
                    style={{ 
                      color: '#000000',
                      fontFamily: 'Inter',
                      fontSize: '15px'
                    }}
                  >
                    {getCategoryTitle(activeCategory)}
                  </button>
                  <button
                    onClick={() => handleViewCategory(activeCategory)}
                    className="text-xs font-normal hover:underline"
                    style={{
                      color: primaryColor || '#690217',
                      fontFamily: 'Inter'
                    }}
                  >
                    Voir plus →
                  </button>
                </div>

                {/* Grille des items - 3 colonnes */}
                <div className="grid grid-cols-3 gap-2">
                  {getActiveCategoryItems().map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handleItemClick(item.key, item.categoryKey)}
                      className="hover:opacity-80 transition-all text-left"
                    >
                      {/* Image - avec bordure arrondie */}
                      {item.photo ? (
                        <img 
                          src={item.photo} 
                          alt={item.title}
                          className="w-full h-20 object-cover rounded-xl mb-1.5"
                        />
                      ) : (
                        <div 
                          className="w-full h-20 flex items-center justify-center rounded-xl mb-1.5"
                          style={{ backgroundColor: `${primaryColor || '#690217'}15` }}
                        >
                          <span 
                            className="text-xl opacity-30"
                            style={{ color: primaryColor || '#690217' }}
                          >
                            ✨
                          </span>
                        </div>
                      )}
                      
                      {/* Titre - multi-ligne */}
                      <h3 
                        className="text-xs font-normal"
                        style={{ 
                          color: '#000000',
                          fontFamily: 'Inter',
                          fontSize: '10px',
                          lineHeight: '1.3',
                          wordBreak: 'break-word'
                        }}
                      >
                        {item.title}
                      </h3>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};


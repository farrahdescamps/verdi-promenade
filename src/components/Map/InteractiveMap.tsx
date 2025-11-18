import React from 'react';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds, DivIcon } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { PoiPopupContent } from './PoiPopupContent';
import { useTheme } from '../../contexts/ThemeContext';

interface POI {
  name: string;
  lat: number;
  lng: number;
  color?: string;
  poi_id?: string;
  activity_id?: string;
  video_url?: string;
}

interface InteractiveMapProps {
  children?: React.ReactNode;
  pois?: POI[];
  onPoiClick?: (poi: POI) => void;
  showHotelPin?: boolean; // Contrôler l'affichage du pin de l'hôtel
  mapTheme?: 'light' | 'dark'; // Mode clair ou sombre pour la carte
}

// Custom component to handle map bounds adjustment
const MapBoundsController: React.FC<{ pois: POI[] }> = ({ pois }) => {
  const map = useMap();

  useEffect(() => {
    if (pois && pois.length > 0) {
      const bounds = new LatLngBounds([]);
      pois.forEach(poi => {
        bounds.extend([poi.lat, poi.lng]);
      });
      
      // Fit the map to show all POIs with padding
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [pois, map]);

  return null;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ children, pois = [], onPoiClick, showHotelPin = true, mapTheme = 'dark' }) => {
  const navigate = useNavigate();
  const { logoUrl, primaryColor, secondaryColor, hotelLatitude, hotelLongitude, hotelName } = useTheme();
  
  // Coordonnées de l'hôtel (dynamiques depuis l'API, fallback Puerto de Mogan)
  const hotelPosition: [number, number] = [
    hotelLatitude || 27.81534, 
    hotelLongitude || -15.75431
  ];
  const zoom = 14;
  
  // État pour la position de l'utilisateur
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handlePoiClick = (poi: POI) => {

    // Si le POI a un activity_id et un poi_id, naviguer vers l'activité avec scroll
    if (poi.activity_id && poi.poi_id) {

      // Naviguer vers la page d'activité avec les paramètres pour le scroll
      navigate(`/activite/${poi.activity_id}`, {
        state: { 
          scrollToPoiId: poi.poi_id,
          poiName: poi.name,
          poiVideoUrl: poi.video_url,
          // Ajouter l'index du POI pour la slide
          poiIndex: pois.findIndex(p => p.poi_id === poi.poi_id)
        }
      });
    } else if (onPoiClick) {
      // Fallback vers le comportement par défaut
      onPoiClick(poi);
    }
  };

  // Fonction pour obtenir la position de l'utilisateur
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);

        },
        (error) => {

          setLocationError(error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0 // Toujours obtenir une position fraîche
        }
      );
    } else {

      setLocationError('Geolocation not supported');
    }
  };

  // Géolocalisation initiale
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Mise à jour automatique toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      getCurrentLocation();
    }, 300000); // 5 minutes = 300000ms

    return () => clearInterval(interval);
  }, []);

  // Mise à jour au retour sur la page (quand le composant devient visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {

        getCurrentLocation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Create custom colored pin icon using SVG data URL
  const createPoiIcon = (color?: string) => {
    // Pin avec la couleur secondaire de l'hôtel
    const pinColor = secondaryColor || primaryColor || '#690217';
    
    // Reproduire le pin exact de l'image: bordure blanche + fond rouge + point blanc central
    const svgIcon = `
      <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Bordure blanche externe -->
        <path d="M20 0C8.954 0 0 8.954 0 20C0 35 20 48 20 48C20 48 40 35 40 20C40 8.954 31.046 0 20 0Z" fill="white"/>
        <!-- Fond rouge bordeaux interne -->
        <path d="M20 3C10.611 3 3 10.611 3 20C3 32.5 20 45 20 45C20 45 37 32.5 37 20C37 10.611 29.389 3 20 3Z" fill="${pinColor}"/>
        <!-- Point blanc central -->
        <circle cx="20" cy="20" r="6" fill="white"/>
      </svg>
    `;
    
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgIcon)}`;
    
    return new Icon({
      iconUrl: svgDataUrl,
      iconSize: [30, 36],
      iconAnchor: [15, 36], // Point at the bottom of the pin
      popupAnchor: [0, -36], // Popup appears above the pin
    });
  };

  // Créer le pin de l'hôtel (identique aux pins POI)
  const createHotelLocationIcon = () => {
    const pinColor = secondaryColor || primaryColor || '#690217';
    
    // Même design que les pins POI
    const pinSvg = `
      <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Bordure blanche externe -->
        <path d="M20 0C8.954 0 0 8.954 0 20C0 35 20 48 20 48C20 48 40 35 40 20C40 8.954 31.046 0 20 0Z" fill="white"/>
        <!-- Fond rouge bordeaux interne -->
        <path d="M20 3C10.611 3 3 10.611 3 20C3 32.5 20 45 20 45C20 45 37 32.5 37 20C37 10.611 29.389 3 20 3Z" fill="${pinColor}"/>
        <!-- Point blanc central -->
        <circle cx="20" cy="20" r="6" fill="white"/>
      </svg>
    `;
    
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(pinSvg)}`,
      iconSize: [30, 36],
      iconAnchor: [15, 36],
      popupAnchor: [0, -36],
    });
  };

  const createUserLocationIcon = () => {
    const pinColor = '#0099CC'; // App's blue color
    
    // Create SVG with the app's blue color and a pulsing effect
    const svgIcon = `
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer pulsing circle -->
        <circle cx="16" cy="16" r="14" fill="${pinColor}" opacity="0.3">
          <animate attributeName="r" values="14;20;14" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>
        </circle>
        <!-- Inner circle -->
        <circle cx="16" cy="16" r="10" fill="${pinColor}" opacity="0.6">
          <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/>
        </circle>
        <!-- Center dot -->
        <circle cx="16" cy="16" r="6" fill="white"/>
        <circle cx="16" cy="16" r="3" fill="${pinColor}"/>
      </svg>
    `;
    
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgIcon)}`;
    
    return new Icon({
      iconUrl: svgDataUrl,
      iconSize: [32, 40],
      iconAnchor: [16, 40], // Point at the bottom of the pin
      popupAnchor: [0, -40], // Popup appears above the pin
    });
  };

  return (
    <MapContainer
      center={hotelPosition}
      zoom={zoom}
      scrollWheelZoom={true}
      zoomControl={false}
      className="absolute inset-0 w-full h-full z-0"
      style={{ height: '100%', width: '100%' }}
      // Options pour fluidité optimale
      zoomAnimation={true}
      fadeAnimation={true}
      markerZoomAnimation={true}
      zoomSnap={0.5}
      zoomDelta={0.5}
      wheelDebounceTime={40}
      wheelPxPerZoomLevel={60}
    >
      <TileLayer
        url={mapTheme === 'light' 
          ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        }
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        // Options pour préchargement et fluidité
        keepBuffer={4}
        maxZoom={19}
        minZoom={3}
        updateWhenZooming={false}
        updateWhenIdle={true}
        crossOrigin={true}
        fadeAnimation={true}
        zoomAnimation={true}
      />
      
      {/* Map bounds controller */}
      <MapBoundsController pois={pois} />
      
      {/* POI Markers */}
      {pois.map((poi, index) => (
        <Marker 
          key={index} 
          position={[poi.lat, poi.lng]} 
          icon={createPoiIcon(poi.color)}
        >
          <Popup>
            <PoiPopupContent poi={poi} onPoiClick={handlePoiClick} />
          </Popup>
        </Marker>
      ))}
      
      {/* Hotel Location Marker - Logo de l'hôtel (conditionnel) */}
      {showHotelPin && (
        <Marker 
          position={hotelPosition} 
          icon={createHotelLocationIcon()}
        >
          <Popup>
            <div className="text-center">
              <strong>{hotelName || 'Hotel'}</strong>
              <br />
              <span className="text-xs text-gray-600">Puerto de Mogan</span>
            </div>
          </Popup>
        </Marker>
      )}

      {/* User Location Marker - Pin only, no popup */}
      {userLocation && (
        <Marker 
          position={userLocation} 
          icon={createUserLocationIcon()}
        />
      )}
      
      {children}
    </MapContainer>
  );
};
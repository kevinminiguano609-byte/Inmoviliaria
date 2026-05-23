/**
 * PropertyLocationDisplay - Componente para mostrar ubicación en modo lectura
 */

import { useState, useEffect, useRef } from 'react';
import { MapPin, ExternalLink, Navigation, Loader2 } from 'lucide-react';

interface PropertyLocationDisplayProps {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  mapUrl: string | null;
  propertyTitle: string;
  height?: string;
}

export default function PropertyLocationDisplay({
  latitude,
  longitude,
  address,
  mapUrl,
  propertyTitle,
  height = '400px',
}: PropertyLocationDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useStaticMap, setUseStaticMap] = useState(false);

  // Verificar si hay coordenadas válidas
  const hasCoordinates = latitude !== null && longitude !== null;
  const isValidCoordinates = hasCoordinates && 
    latitude >= -90 && latitude <= 90 && 
    longitude >= -180 && longitude <= 180;

  // Inicializar mapa si hay coordenadas válidas
  useEffect(() => {
    if (!isValidCoordinates || !mapRef.current || useStaticMap) return;

    const initMap = async () => {
      try {
        // Verificar si Google Maps API está disponible
        if (!window.google || !window.google.maps) {
          // Intentar cargar la API
          await loadGoogleMapsAPI();
        }

        const mapInstance = new google.maps.Map(mapRef.current!, {
          center: { lat: latitude!, lng: longitude! },
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'transit',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        // Crear marcador
        const markerInstance = new google.maps.Marker({
          position: { lat: latitude!, lng: longitude! },
          map: mapInstance,
          title: propertyTitle,
          animation: google.maps.Animation.DROP,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#E53935',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        });

        // Info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <strong style="color: #333; font-size: 14px;">${propertyTitle}</strong>
              ${address ? `<p style="color: #666; font-size: 12px; margin-top: 4px;">${address}</p>` : ''}
            </div>
          `,
        });

        markerInstance.addListener('click', () => {
          infoWindow.open(mapInstance, markerInstance);
        });

        // Abrir info window automáticamente
        setTimeout(() => {
          infoWindow.open(mapInstance, markerInstance);
        }, 1000);

        setMap(mapInstance);
        setMarker(markerInstance);
        setLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('No se pudo cargar el mapa interactivo');
        setUseStaticMap(true);
        setLoading(false);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [latitude, longitude, isValidCoordinates, useStaticMap, propertyTitle, address]);

  // Cargar Google Maps API
  const loadGoogleMapsAPI = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.VITE_GOOGLE_MAPS_API_KEY || ''}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps API'));
      
      document.head.appendChild(script);
    });
  };

  // Generar URL de Google Maps
  const getGoogleMapsUrl = () => {
    if (isValidCoordinates) {
      return `https://www.google.com/maps?q=${latitude},${longitude}`;
    }
    return null;
  };

  // Generar URL de OpenStreetMap
  const getOpenStreetMapUrl = () => {
    if (isValidCoordinates) {
      return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;
    }
    return null;
  };

  // Generar URL de mapa estático
  const getStaticMapUrl = () => {
    if (!isValidCoordinates) return null;
    
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (!apiKey) return null;

    return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x400&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;
  };

  // Usar ubicación actual para obtener direcciones
  const getDirectionsUrl = () => {
    if (!isValidCoordinates) return null;
    
    if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
      return `http://maps.apple.com/?daddr=${latitude},${longitude}`;
    } else {
      return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    }
  };

  // Fallback a iframe si hay map_url pero no coordenadas
  if (!isValidCoordinates && mapUrl) {
    return (
      <div className="space-y-3">
        <h3 className="text-2xl font-normal text-[#333333] mb-4">Ubicación</h3>
        {address && (
          <div className="flex items-start gap-2 text-[#666] mb-4">
            <MapPin size={16} className="mt-0.5 flex-shrink-0" />
            <span>{address}</span>
          </div>
        )}
        <div className="rounded-xl overflow-hidden" style={{ height }}>
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Ubicación de ${propertyTitle}`}
            allowFullScreen
          />
        </div>
        <div className="text-xs text-[#999] mt-2">
          <p>• Mapa embebido desde URL proporcionada</p>
        </div>
      </div>
    );
  }

  // Sin ubicación
  if (!isValidCoordinates && !mapUrl) {
    return (
      <div className="space-y-3">
        <h3 className="text-2xl font-normal text-[#333333] mb-4">Ubicación</h3>
        <div className="border border-[#E0E0E0] rounded-xl p-8 text-center">
          <MapPin size={48} className="mx-auto text-[#999] mb-3" />
          <p className="text-[#333] font-medium mb-2">Ubicación no disponible</p>
          <p className="text-sm text-[#666]">No se ha proporcionado información de ubicación para esta propiedad.</p>
        </div>
      </div>
    );
  }

  const googleMapsUrl = getGoogleMapsUrl();
  const openStreetMapUrl = getOpenStreetMapUrl();
  const staticMapUrl = getStaticMapUrl();
  const directionsUrl = getDirectionsUrl();

  return (
    <div className="space-y-3">
      <h3 className="text-2xl font-normal text-[#333333] mb-4">Ubicación</h3>
      
      {/* Dirección */}
      {address && (
        <div className="flex items-start gap-2 text-[#666] mb-4">
          <MapPin size={16} className="mt-0.5 flex-shrink-0" />
          <span>{address}</span>
        </div>
      )}

      {/* Coordenadas */}
      <div className="text-sm text-[#666] bg-[#F9F9F9] p-3 rounded-lg mb-4">
        <p className="font-medium mb-1">Coordenadas:</p>
        <p>Latitud: {latitude!.toFixed(6)}</p>
        <p>Longitud: {longitude!.toFixed(6)}</p>
      </div>

      {/* Controles de mapa */}
      <div className="flex flex-wrap gap-2 mb-4">
        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#333] text-sm font-medium rounded-lg transition-colors"
          >
            <ExternalLink size={14} />
            Ver en Google Maps
          </a>
        )}
        
        {openStreetMapUrl && (
          <a
            href={openStreetMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#333] text-sm font-medium rounded-lg transition-colors"
          >
            <ExternalLink size={14} />
            Ver en OpenStreetMap
          </a>
        )}
        
        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#333] text-sm font-medium rounded-lg transition-colors"
          >
            <Navigation size={14} />
            Cómo llegar
          </a>
        )}
        
        {useStaticMap && staticMapUrl && (
          <button
            onClick={() => setUseStaticMap(false)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#333] text-sm font-medium rounded-lg transition-colors"
          >
            Ver mapa interactivo
          </button>
        )}
      </div>

      {/* Mapa */}
      <div className="border border-[#E0E0E0] rounded-xl overflow-hidden">
        {useStaticMap && staticMapUrl ? (
          // Mapa estático
          <div style={{ height }}>
            <img
              src={staticMapUrl}
              alt={`Mapa de ${propertyTitle}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs text-[#333]">
              <p>Mapa estático • <button onClick={() => setUseStaticMap(false)} className="text-[#E53935] hover:underline">Intentar mapa interactivo</button></p>
            </div>
          </div>
        ) : (
          // Mapa interactivo
          <div ref={mapRef} style={{ height }} />
        )}
        
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="text-center">
              <Loader2 size={32} className="mx-auto animate-spin text-[#E53935] mb-3" />
              <p className="text-sm text-[#333]">Cargando mapa...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="text-center p-6">
              <MapPin size={48} className="mx-auto text-[#999] mb-3" />
              <p className="text-[#333] font-medium mb-2">Error al cargar el mapa</p>
              <p className="text-sm text-[#666] mb-4">{error}</p>
              {staticMapUrl && (
                <button
                  onClick={() => setUseStaticMap(true)}
                  className="px-4 py-2 bg-[#E53935] text-white text-sm font-medium rounded-lg hover:bg-[#C62828] transition-colors"
                >
                  Ver mapa estático
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nota sobre API key */}
      {!process.env.VITE_GOOGLE_MAPS_API_KEY && !useStaticMap && (
        <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
          <p className="font-medium mb-1">⚠️ API key no configurada</p>
          <p>Agrega <code className="bg-amber-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> en tu archivo .env para habilitar mapas interactivos.</p>
        </div>
      )}
    </div>
  );
}
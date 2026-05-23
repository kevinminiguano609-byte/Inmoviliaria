/**
 * PropertyMapPicker - Componente de mapa interactivo para seleccionar ubicación
 * Reemplaza el input de map_url por un mapa interactivo
 */

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Navigation } from 'lucide-react';

// Coordenadas por defecto (Buenos Aires)
const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 };
const DEFAULT_ZOOM = 12;

interface PropertyMapPickerProps {
  value?: { lat: number | null; lng: number | null };
  address?: string;
  onChange: (coordinates: { lat: number; lng: number }, address?: string) => void;
  onAddressChange?: (address: string) => void;
  disabled?: boolean;
  height?: string;
  showAddressInput?: boolean;
}

export default function PropertyMapPicker({
  value,
  address = '',
  onChange,
  onAddressChange,
  disabled = false,
  height = '400px',
  showAddressInput = true,
}: PropertyMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAddress, setCurrentAddress] = useState(address);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || disabled) return;

    const initMap = async () => {
      try {
        // Verificar si Google Maps API está disponible
        if (!window.google || !window.google.maps) {
          // Intentar cargar la API si no está disponible
          await loadGoogleMapsAPI();
        }

        const center = value?.lat && value?.lng 
          ? { lat: value.lat, lng: value.lng }
          : DEFAULT_CENTER;

        const mapInstance = new google.maps.Map(mapRef.current!, {
          center,
          zoom: DEFAULT_ZOOM,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        // Crear marcador inicial si hay coordenadas
        let markerInstance: google.maps.Marker | null = null;
        if (value?.lat && value?.lng) {
          markerInstance = new google.maps.Marker({
            position: { lat: value.lat, lng: value.lng },
            map: mapInstance,
            draggable: !disabled,
            title: 'Ubicación de la propiedad',
            animation: google.maps.Animation.DROP,
          });

          // Configurar evento de arrastre
          markerInstance.addListener('dragend', () => {
            const position = markerInstance!.getPosition();
            if (position) {
              const lat = position.lat();
              const lng = position.lng();
              onChange({ lat, lng });
              reverseGeocode(lat, lng);
            }
          });
        }

        // Configurar clic en el mapa
        mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (disabled) return;
          
          const lat = e.latLng!.lat();
          const lng = e.latLng!.lng();
          
          // Mover o crear marcador
          if (markerInstance) {
            markerInstance.setPosition({ lat, lng });
          } else {
            markerInstance = new google.maps.Marker({
              position: { lat, lng },
              map: mapInstance,
              draggable: !disabled,
              title: 'Ubicación de la propiedad',
              animation: google.maps.Animation.DROP,
            });

            // Configurar evento de arrastre
            markerInstance.addListener('dragend', () => {
              const position = markerInstance!.getPosition();
              if (position) {
                const lat = position.lat();
                const lng = position.lng();
                onChange({ lat, lng });
                reverseGeocode(lat, lng);
              }
            });
          }

          setMarker(markerInstance);
          onChange({ lat, lng });
          reverseGeocode(lat, lng);
        });

        setMap(mapInstance);
        setMarker(markerInstance);
        setLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('No se pudo cargar el mapa. Verifica tu conexión o API key.');
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
  }, [disabled]);

  // Actualizar marcador cuando cambian las coordenadas
  useEffect(() => {
    if (!map || !value?.lat || !value?.lng) return;

    const position = { lat: value.lat, lng: value.lng };
    
    if (marker) {
      marker.setPosition(position);
    } else {
      const newMarker = new google.maps.Marker({
        position,
        map,
        draggable: !disabled,
        title: 'Ubicación de la propiedad',
      });

      newMarker.addListener('dragend', () => {
        const pos = newMarker.getPosition();
        if (pos) {
          const lat = pos.lat();
          const lng = pos.lng();
          onChange({ lat, lng });
          reverseGeocode(lat, lng);
        }
      });

      setMarker(newMarker);
    }

    // Centrar mapa en la ubicación
    map.panTo(position);
  }, [value?.lat, value?.lng, map, disabled]);

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

  // Geocodificación inversa (coordenadas → dirección)
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!window.google || !window.google.maps) return;
    
    setIsGeocoding(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      
      if (response.results[0]) {
        const formattedAddress = response.results[0].formatted_address;
        setCurrentAddress(formattedAddress);
        if (onAddressChange) {
          onAddressChange(formattedAddress);
        }
      }
    } catch (err) {
      console.warn('Reverse geocoding failed:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Geocodificación directa (dirección → coordenadas)
  const geocodeAddress = async () => {
    if (!currentAddress.trim() || !window.google || !window.google.maps) return;
    
    setIsGeocoding(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ address: currentAddress });
      
      if (response.results[0]) {
        const location = response.results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        onChange({ lat, lng });
        
        // Mover marcador
        if (marker) {
          marker.setPosition({ lat, lng });
        }
        
        // Centrar mapa
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
      }
    } catch (err) {
      console.warn('Geocoding failed:', err);
      setError('No se pudo encontrar la dirección');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Manejar cambio de dirección manual
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setCurrentAddress(newAddress);
    if (onAddressChange) {
      onAddressChange(newAddress);
    }
  };

  // Manejar búsqueda con Enter
  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      geocodeAddress();
    }
  };

  // Usar ubicación actual
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada por tu navegador');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        onChange({ lat, lng });
        
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
        
        reverseGeocode(lat, lng);
        setLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('No se pudo obtener tu ubicación');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (error) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[#333333]">
          Mapa de ubicación
        </label>
        <div className="border border-[#E0E0E0] rounded-lg p-8 text-center">
          <MapPin size={48} className="mx-auto text-[#999] mb-3" />
          <p className="text-[#333333] font-medium mb-2">Error al cargar el mapa</p>
          <p className="text-sm text-[#666] mb-4">{error}</p>
          <div className="text-xs text-[#999] space-y-1">
            <p>• Verifica tu conexión a internet</p>
            <p>• Asegúrate de tener configurada la API key de Google Maps</p>
            <p>• Puedes usar el campo de dirección manualmente</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[#333333]">
        Mapa de ubicación
      </label>

      {/* Input de dirección con búsqueda */}
      {showAddressInput && (
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={currentAddress}
              onChange={handleAddressChange}
              onKeyDown={handleAddressKeyDown}
              placeholder="Ingresa una dirección o haz clic en el mapa"
              className="w-full border border-[#E0E0E0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#E53935] text-[#333333]"
              disabled={disabled || isGeocoding}
            />
            {isGeocoding && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 size={16} className="animate-spin text-[#999]" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={geocodeAddress}
            disabled={disabled || isGeocoding || !currentAddress.trim()}
            className="px-4 py-2.5 bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#333333] text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={disabled || loading}
            className="px-4 py-2.5 bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#333333] text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Usar mi ubicación actual"
          >
            <Navigation size={16} />
          </button>
        </div>
      )}

      {/* Contenedor del mapa */}
      <div className="relative border border-[#E0E0E0] rounded-lg overflow-hidden">
        <div
          ref={mapRef}
          style={{ height }}
          className="w-full"
        />
        
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="text-center">
              <Loader2 size={32} className="mx-auto animate-spin text-[#E53935] mb-3" />
              <p className="text-sm text-[#333333]">Cargando mapa...</p>
            </div>
          </div>
        )}

        {/* Instrucciones */}
        <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs text-[#333333] shadow-sm max-w-md">
            <p className="font-medium mb-1">Instrucciones:</p>
            <p>• Haz clic en el mapa para seleccionar la ubicación</p>
            <p>• Arrastra el marcador para ajustar la posición</p>
            <p>• Usa la barra de búsqueda para encontrar una dirección</p>
          </div>
        </div>
      </div>

      {/* Coordenadas actuales */}
      {(value?.lat && value?.lng) && (
        <div className="text-xs text-[#666] bg-[#F9F9F9] p-3 rounded-lg">
          <p className="font-medium mb-1">Coordenadas seleccionadas:</p>
          <p>Latitud: {value.lat.toFixed(6)}</p>
          <p>Longitud: {value.lng.toFixed(6)}</p>
          {currentAddress && (
            <p className="mt-1">Dirección: {currentAddress}</p>
          )}
        </div>
      )}

      {/* Nota sobre API key */}
      {!process.env.VITE_GOOGLE_MAPS_API_KEY && (
        <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
          <p className="font-medium mb-1">⚠️ API key no configurada</p>
          <p>Agrega <code className="bg-amber-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> en tu archivo .env para habilitar el mapa interactivo.</p>
        </div>
      )}
    </div>
  );
}
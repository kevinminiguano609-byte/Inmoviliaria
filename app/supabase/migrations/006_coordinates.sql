-- ============================================================
-- INFINITY REAL ESTATE — Agregar campos de coordenadas
-- Migration: 006_coordinates.sql
-- Agrega campos latitude y longitude a tabla properties
-- Mantiene compatibilidad con map_url existente
-- ============================================================

-- Agregar campos de coordenadas geográficas
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 8);

-- Agregar índices para búsqueda por ubicación
CREATE INDEX IF NOT EXISTS idx_properties_latitude ON properties(latitude);
CREATE INDEX IF NOT EXISTS idx_properties_longitude ON properties(longitude);
CREATE INDEX IF NOT EXISTS idx_properties_coordinates ON properties(latitude, longitude);

-- Función para validar coordenadas geográficas
CREATE OR REPLACE FUNCTION validate_coordinates(
  lat DECIMAL(10, 8),
  lng DECIMAL(10, 8)
)
RETURNS BOOLEAN LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  -- Validar rangos geográficos
  RETURN lat IS NULL OR lng IS NULL OR (
    lat >= -90 AND lat <= 90 AND
    lng >= -180 AND lng <= 180
  );
END;
$$;

-- Constraint para validar coordenadas
ALTER TABLE properties
ADD CONSTRAINT chk_properties_coordinates_valid 
CHECK (validate_coordinates(latitude, longitude));

-- Función para intentar extraer coordenadas de map_url existente
CREATE OR REPLACE FUNCTION extract_coordinates_from_map_url()
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  prop RECORD;
  lat_val DECIMAL(10, 8);
  lng_val DECIMAL(10, 8);
BEGIN
  FOR prop IN 
    SELECT id, map_url 
    FROM properties 
    WHERE map_url IS NOT NULL 
      AND (latitude IS NULL OR longitude IS NULL)
  LOOP
    -- Intentar extraer coordenadas de URLs de Google Maps
    -- Formato común: ...!3d-34.59!2d-58.42...
    IF prop.map_url LIKE '%!3d%' AND prop.map_url LIKE '%!2d%' THEN
      -- Extraer latitud (después de !3d)
      lat_val := substring(
        substring(prop.map_url FROM '!3d([^!]+)') 
        FROM '(-?\d+\.?\d*)'
      )::DECIMAL(10, 8);
      
      -- Extraer longitud (después de !2d)  
      lng_val := substring(
        substring(prop.map_url FROM '!2d([^!]+)') 
        FROM '(-?\d+\.?\d*)'
      )::DECIMAL(10, 8);
      
      -- Actualizar si las coordenadas son válidas
      IF lat_val IS NOT NULL AND lng_val IS NOT NULL AND
         lat_val >= -90 AND lat_val <= 90 AND
         lng_val >= -180 AND lng_val <= 180 THEN
        UPDATE properties 
        SET latitude = lat_val, longitude = lng_val
        WHERE id = prop.id;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Ejecutar migración de datos existentes
SELECT extract_coordinates_from_map_url();

-- Comentarios para documentación
COMMENT ON COLUMN properties.latitude IS 'Latitud geográfica de la propiedad (decimal 10,8)';
COMMENT ON COLUMN properties.longitude IS 'Longitud geográfica de la propiedad (decimal 10,8)';
COMMENT ON CONSTRAINT chk_properties_coordinates_valid ON properties IS 'Valida que las coordenadas estén dentro de rangos geográficos válidos';

-- Vista para propiedades con coordenadas válidas
CREATE OR REPLACE VIEW properties_with_coordinates AS
SELECT 
  p.*,
  CASE 
    WHEN p.latitude IS NOT NULL AND p.longitude IS NOT NULL 
    THEN ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)
    ELSE NULL
  END AS geom
FROM properties p
WHERE p.latitude IS NOT NULL 
  AND p.longitude IS NOT NULL
  AND validate_coordinates(p.latitude, p.longitude);

-- Función para buscar propiedades dentro de un radio (en kilómetros)
CREATE OR REPLACE FUNCTION find_properties_near(
  center_lat DECIMAL(10, 8),
  center_lng DECIMAL(10, 8),
  radius_km DECIMAL(10, 2) DEFAULT 10.0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  location TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(10, 8),
  distance_km DECIMAL(10, 2)
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.location,
    p.address,
    p.latitude,
    p.longitude,
    ST_DistanceSphere(
      ST_MakePoint(p.longitude, p.latitude),
      ST_MakePoint(center_lng, center_lat)
    ) / 1000.0 AS distance_km
  FROM properties p
  WHERE p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND p.status = 'publicada'
    AND ST_DistanceSphere(
      ST_MakePoint(p.longitude, p.latitude),
      ST_MakePoint(center_lng, center_lat)
    ) <= radius_km * 1000.0
  ORDER BY distance_km;
END;
$$;
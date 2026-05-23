-- ============================================================
-- INFINITY REAL ESTATE — Agregar campos de coordenadas
-- Migration: 006_coordinates.sql
-- Agrega campos latitude y longitude a tabla properties
-- Mantiene compatibilidad con map_url existente
-- NOTA: NO requiere PostGIS — usa Haversine pura en plpgsql
-- ============================================================

-- Agregar campos de coordenadas geográficas
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS latitude  DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 8);

-- Índices para búsqueda por ubicación
CREATE INDEX IF NOT EXISTS idx_properties_latitude    ON properties(latitude);
CREATE INDEX IF NOT EXISTS idx_properties_longitude   ON properties(longitude);
CREATE INDEX IF NOT EXISTS idx_properties_coordinates ON properties(latitude, longitude);

-- ──────────────────────────────────────────────────────────────
-- Función: validate_coordinates
-- Verifica que lat/lng estén dentro de rangos geográficos válidos
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION validate_coordinates(
  lat DECIMAL(10, 8),
  lng DECIMAL(10, 8)
)
RETURNS BOOLEAN LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  RETURN lat IS NULL OR lng IS NULL OR (
    lat >= -90  AND lat <= 90  AND
    lng >= -180 AND lng <= 180
  );
END;
$$;

-- Constraint de validación (se aplica solo si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_properties_coordinates_valid'
  ) THEN
    ALTER TABLE properties
      ADD CONSTRAINT chk_properties_coordinates_valid
      CHECK (validate_coordinates(latitude, longitude));
  END IF;
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- Función: extract_coordinates_from_map_url
-- Intenta migrar coordenadas embebidas en map_url existentes
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION extract_coordinates_from_map_url()
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  prop    RECORD;
  lat_val DECIMAL(10, 8);
  lng_val DECIMAL(10, 8);
BEGIN
  FOR prop IN
    SELECT id, map_url
    FROM properties
    WHERE map_url IS NOT NULL
      AND (latitude IS NULL OR longitude IS NULL)
  LOOP
    -- Extraer coordenadas de URLs tipo: ...!3d-34.59!2d-58.42...
    IF prop.map_url LIKE '%!3d%' AND prop.map_url LIKE '%!2d%' THEN
      lat_val := substring(
        substring(prop.map_url FROM '!3d([^!]+)')
        FROM '(-?\d+\.?\d*)'
      )::DECIMAL(10, 8);

      lng_val := substring(
        substring(prop.map_url FROM '!2d([^!]+)')
        FROM '(-?\d+\.?\d*)'
      )::DECIMAL(10, 8);

      IF lat_val IS NOT NULL AND lng_val IS NOT NULL
         AND lat_val >= -90 AND lat_val <= 90
         AND lng_val >= -180 AND lng_val <= 180
      THEN
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

-- ──────────────────────────────────────────────────────────────
-- Vista: properties_with_coordinates
-- Sin PostGIS — solo filtra propiedades con coordenadas válidas
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW properties_with_coordinates AS
SELECT *
FROM properties
WHERE latitude  IS NOT NULL
  AND longitude IS NOT NULL
  AND validate_coordinates(latitude, longitude);

-- ──────────────────────────────────────────────────────────────
-- Función: find_properties_near
-- Búsqueda por proximidad usando la fórmula de Haversine
-- (sin PostGIS — compatible con cualquier proyecto Supabase)
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION find_properties_near(
  center_lat DECIMAL(10, 8),
  center_lng DECIMAL(10, 8),
  radius_km  DECIMAL(10, 2) DEFAULT 10.0
)
RETURNS TABLE (
  id          UUID,
  title       TEXT,
  slug        TEXT,
  location    TEXT,
  address     TEXT,
  latitude    DECIMAL(10, 8),
  longitude   DECIMAL(10, 8),
  distance_km DECIMAL(10, 2)
) LANGUAGE plpgsql STABLE AS $$
DECLARE
  earth_radius_km CONSTANT DOUBLE PRECISION := 6371.0;
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
    (
      earth_radius_km *
      2 * ASIN(
        SQRT(
          POWER(SIN(RADIANS((p.latitude  - center_lat) / 2)), 2) +
          COS(RADIANS(center_lat)) *
          COS(RADIANS(p.latitude))  *
          POWER(SIN(RADIANS((p.longitude - center_lng) / 2)), 2)
        )
      )
    )::DECIMAL(10, 2) AS distance_km
  FROM properties p
  WHERE p.latitude  IS NOT NULL
    AND p.longitude IS NOT NULL
    AND p.status    = 'publicada'
    AND (
      earth_radius_km *
      2 * ASIN(
        SQRT(
          POWER(SIN(RADIANS((p.latitude  - center_lat) / 2)), 2) +
          COS(RADIANS(center_lat)) *
          COS(RADIANS(p.latitude))  *
          POWER(SIN(RADIANS((p.longitude - center_lng) / 2)), 2)
        )
      )
    ) <= radius_km
  ORDER BY distance_km;
END;
$$;

-- Comentarios de documentación
COMMENT ON COLUMN properties.latitude  IS 'Latitud geográfica (decimal 10,8). Rango: -90 a 90.';
COMMENT ON COLUMN properties.longitude IS 'Longitud geográfica (decimal 10,8). Rango: -180 a 180.';
COMMENT ON VIEW   properties_with_coordinates IS 'Propiedades con coordenadas geográficas válidas.';
COMMENT ON FUNCTION find_properties_near IS 'Busca propiedades dentro de un radio en km usando Haversine (sin PostGIS).';
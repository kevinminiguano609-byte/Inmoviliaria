-- ============================================================
-- INFINITY REAL ESTATE — Funciones SQL Backend
-- Migration: 004_functions.sql
-- Funciones detectadas como necesarias por el frontend
-- ============================================================

-- ============================================================
-- FUNCTION: search_properties
-- Usada por: propertyService.ts → searchProperties()
-- Parámetros exactos de: Properties.tsx → filters state
--   operation, type, location, priceMin, priceMax
-- + parámetros adicionales del hook useProperties
-- ============================================================
CREATE OR REPLACE FUNCTION search_properties(
  p_query       TEXT            DEFAULT NULL,  -- búsqueda full-text
  p_operation   property_op     DEFAULT NULL,  -- venta | alquiler
  p_type        property_type   DEFAULT NULL,  -- departamento | casa | ...
  p_location    TEXT            DEFAULT NULL,  -- búsqueda en location + address
  p_min_price   NUMERIC         DEFAULT NULL,  -- Properties.tsx → priceMin
  p_max_price   NUMERIC         DEFAULT NULL,  -- Properties.tsx → priceMax
  p_min_area    NUMERIC         DEFAULT NULL,
  p_max_area    NUMERIC         DEFAULT NULL,
  p_bedrooms    SMALLINT        DEFAULT NULL,
  p_bathrooms   SMALLINT        DEFAULT NULL,
  p_featured    BOOLEAN         DEFAULT NULL,  -- Home.tsx → FeaturedProperties
  p_currency    currency_type   DEFAULT NULL,
  p_page        INT             DEFAULT 1,     -- Properties.tsx → currentPage
  p_page_size   INT             DEFAULT 9      -- settings → properties_per_page
)
RETURNS TABLE (
  -- Todos los campos de PropertyRow (src/types/supabase.ts)
  id            UUID,
  agent_id      UUID,
  title         TEXT,
  slug          TEXT,
  description   TEXT,
  price         NUMERIC,
  currency      currency_type,
  operation     property_op,
  type          property_type,
  status        property_status,
  featured      BOOLEAN,
  location      TEXT,
  address       TEXT,
  map_url       TEXT,
  area          NUMERIC,
  covered_area  NUMERIC,
  bedrooms      SMALLINT,
  bathrooms     SMALLINT,
  rooms         SMALLINT,
  parking       SMALLINT,
  age           SMALLINT,
  orientation   TEXT,
  expenses      TEXT,
  disposition   TEXT,
  badge         TEXT,
  badge_color   TEXT,
  meta_title    TEXT,
  meta_desc     TEXT,
  created_at    TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ,
  -- Extra: imagen de portada para PropertyCard
  cover_image   TEXT,
  -- Extra: total para paginación (Properties.tsx → totalPages)
  total_count   BIGINT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_offset INT := (p_page - 1) * p_page_size;
BEGIN
  RETURN QUERY
  WITH filtered AS (
    SELECT
      pr.*,
      (
        SELECT pi.url
        FROM property_images pi
        WHERE pi.property_id = pr.id AND pi.is_cover = TRUE
        LIMIT 1
      ) AS cover_image
    FROM properties pr
    WHERE
      pr.status = 'publicada'
      AND (p_operation IS NULL OR pr.operation = p_operation)
      AND (p_type      IS NULL OR pr.type      = p_type)
      AND (p_currency  IS NULL OR pr.currency  = p_currency)
      AND (p_featured  IS NULL OR pr.featured  = p_featured)
      AND (p_min_price IS NULL OR pr.price    >= p_min_price)
      AND (p_max_price IS NULL OR pr.price    <= p_max_price)
      AND (p_min_area  IS NULL OR pr.area     >= p_min_area)
      AND (p_max_area  IS NULL OR pr.area     <= p_max_area)
      AND (p_bedrooms  IS NULL OR pr.bedrooms >= p_bedrooms)
      AND (p_bathrooms IS NULL OR pr.bathrooms >= p_bathrooms)
      AND (
        p_location IS NULL
        OR pr.location ILIKE '%' || p_location || '%'
        OR pr.address  ILIKE '%' || p_location || '%'
      )
      AND (
        p_query IS NULL
        OR pr.search_vector @@ plainto_tsquery('spanish', p_query)
        OR pr.title ILIKE '%' || p_query || '%'
      )
  )
  SELECT
    f.id, f.agent_id, f.title, f.slug, f.description,
    f.price, f.currency, f.operation, f.type, f.status, f.featured,
    f.location, f.address, f.map_url,
    f.area, f.covered_area, f.bedrooms, f.bathrooms, f.rooms,
    f.parking, f.age, f.orientation, f.expenses, f.disposition,
    f.badge, f.badge_color, f.meta_title, f.meta_desc,
    f.created_at, f.updated_at,
    f.cover_image,
    COUNT(*) OVER() AS total_count
  FROM filtered f
  ORDER BY f.featured DESC, f.created_at DESC
  LIMIT  p_page_size
  OFFSET v_offset;
END;
$$;

-- ============================================================
-- FUNCTION: get_property_detail
-- Usada por: propertyService.ts → getPropertyBySlug()
-- Retorna propiedad completa con imágenes, amenities y agente
-- Necesaria para: PropertyDetail.tsx (gallery + info + sidebar)
-- ============================================================
CREATE OR REPLACE FUNCTION get_property_detail(p_slug TEXT)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_property  JSONB;
  v_images    JSONB;
  v_amenities JSONB;
  v_agent     JSONB;
BEGIN
  -- Propiedad base
  SELECT to_jsonb(p) INTO v_property
  FROM properties p
  WHERE p.slug = p_slug
    AND (p.status = 'publicada' OR is_agent_or_admin());

  IF v_property IS NULL THEN
    RETURN NULL;
  END IF;

  -- Imágenes ordenadas (PropertyDetail → PropertyGallery)
  SELECT jsonb_agg(
    jsonb_build_object(
      'id',          pi.id,
      'url',         pi.url,
      'is_cover',    pi.is_cover,
      'sort_order',  pi.sort_order
    ) ORDER BY pi.sort_order, pi.is_cover DESC
  ) INTO v_images
  FROM property_images pi
  WHERE pi.property_id = (v_property->>'id')::UUID;

  -- Amenities como array de strings (Property.amenities: string[])
  SELECT jsonb_agg(a.name ORDER BY a.name) INTO v_amenities
  FROM property_amenities pa
  JOIN amenities a ON a.id = pa.amenity_id
  WHERE pa.property_id = (v_property->>'id')::UUID;

  -- Agente (PropertyDetail → ContactSidebar → agent info)
  SELECT jsonb_build_object(
    'id',         pr.id,
    'full_name',  pr.full_name,
    'phone',      pr.phone,
    'avatar_url', pr.avatar_url,
    'bio',        pr.bio,
    'role',       pr.role
  ) INTO v_agent
  FROM profiles pr
  WHERE pr.id = (v_property->>'agent_id')::UUID;

  RETURN v_property
    || jsonb_build_object(
         'images',    COALESCE(v_images,    '[]'::JSONB),
         'amenities', COALESCE(v_amenities, '[]'::JSONB),
         'agent',     COALESCE(v_agent,     'null'::JSONB)
       );
END;
$$;

-- ============================================================
-- FUNCTION: get_dashboard_stats
-- Usada por: useDashboard.ts → Dashboard.tsx
-- Retorna exactamente los stats que muestra el dashboard:
-- total propiedades, leads nuevos, artículos publicados
-- ============================================================
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  RETURN jsonb_build_object(
    -- Dashboard.tsx → stats cards
    'total_properties',     (SELECT COUNT(*) FROM properties),
    'published_properties', (SELECT COUNT(*) FROM properties WHERE status = 'publicada'),
    'draft_properties',     (SELECT COUNT(*) FROM properties WHERE status = 'borrador'),
    'archived_properties',  (SELECT COUNT(*) FROM properties WHERE status = 'archivada'),

    -- Dashboard.tsx → "Leads nuevos"
    'total_leads',          (SELECT COUNT(*) FROM leads),
    'new_leads',            (SELECT COUNT(*) FROM leads WHERE status = 'nuevo'),
    'leads_this_month',     (
      SELECT COUNT(*) FROM leads
      WHERE created_at >= date_trunc('month', NOW())
    ),

    -- Dashboard.tsx → "Artículos publicados"
    'total_articles',       (SELECT COUNT(*) FROM blog_articles),
    'published_articles',   (SELECT COUNT(*) FROM blog_articles WHERE status = 'publicado'),

    'total_testimonials',   (SELECT COUNT(*) FROM testimonials WHERE active = TRUE),

    -- Dashboard.tsx → chart "Leads por mes" (últimos 6 meses)
    'leads_by_month',       (
      SELECT jsonb_agg(
        jsonb_build_object(
          'month', to_char(month_date, 'Mon'),
          'value', COALESCE(cnt, 0)
        ) ORDER BY month_date
      )
      FROM (
        SELECT
          date_trunc('month', gs) AS month_date,
          COUNT(l.id) AS cnt
        FROM generate_series(
          date_trunc('month', NOW()) - INTERVAL '5 months',
          date_trunc('month', NOW()),
          '1 month'
        ) gs
        LEFT JOIN leads l ON date_trunc('month', l.created_at) = date_trunc('month', gs)
        GROUP BY month_date
      ) monthly
    ),

    -- Dashboard.tsx → leads recientes (tabla últimos 5)
    'recent_leads',         (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id',             l.id,
          'name',           l.name,
          'email',          l.email,
          'subject',        l.subject,
          'status',         l.status,
          'property_title', l.property_title,
          'created_at',     l.created_at
        ) ORDER BY l.created_at DESC
      )
      FROM (SELECT * FROM leads ORDER BY created_at DESC LIMIT 5) l
    ),

    -- Distribución por estado (para gráficos futuros)
    'leads_by_status',      (
      SELECT jsonb_object_agg(status, cnt)
      FROM (
        SELECT status, COUNT(*) AS cnt FROM leads GROUP BY status
      ) s
    ),

    -- Distribución por tipo de propiedad
    'properties_by_type',   (
      SELECT jsonb_object_agg(type, cnt)
      FROM (
        SELECT type, COUNT(*) AS cnt FROM properties GROUP BY type
      ) t
    ),

    -- Distribución por operación
    'properties_by_op',     (
      SELECT jsonb_object_agg(operation, cnt)
      FROM (
        SELECT operation, COUNT(*) AS cnt FROM properties GROUP BY operation
      ) o
    )
  );
END;
$$;

-- ============================================================
-- FUNCTION: assign_lead
-- Usada por: leadService.ts → assignLead()
-- AdminLeads.tsx → asignar lead a agente (admin only)
-- ============================================================
CREATE OR REPLACE FUNCTION assign_lead(
  p_lead_id   UUID,
  p_agent_id  UUID
)
RETURNS leads LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_lead leads;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: only admins can assign leads';
  END IF;

  UPDATE leads
  SET assigned_to = p_agent_id, updated_at = NOW()
  WHERE id = p_lead_id
  RETURNING * INTO v_lead;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead % not found', p_lead_id;
  END IF;

  RETURN v_lead;
END;
$$;

-- ============================================================
-- FUNCTION: update_lead_status
-- Usada por: leadService.ts → updateLeadStatus()
-- AdminLeads.tsx → select inline de estado
-- ============================================================
CREATE OR REPLACE FUNCTION update_lead_status(
  p_lead_id UUID,
  p_status  lead_status,
  p_notes   TEXT DEFAULT NULL
)
RETURNS leads LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_lead leads;
BEGIN
  -- Admin puede cambiar cualquier lead
  -- Agente solo puede cambiar leads asignados a él
  IF NOT is_admin() THEN
    IF NOT EXISTS (
      SELECT 1 FROM leads
      WHERE id = p_lead_id AND assigned_to = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Unauthorized: lead not assigned to you';
    END IF;
  END IF;

  UPDATE leads
  SET
    status     = p_status,
    notes      = COALESCE(p_notes, notes),
    updated_at = NOW()
  WHERE id = p_lead_id
  RETURNING * INTO v_lead;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead % not found', p_lead_id;
  END IF;

  RETURN v_lead;
END;
$$;

-- ============================================================
-- FUNCTION: get_settings_map
-- Usada por: settingsService.ts → getSettings()
-- Retorna todas las settings como objeto plano key→value
-- ============================================================
CREATE OR REPLACE FUNCTION get_settings_map()
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT jsonb_object_agg(key, value) FROM settings;
$$;

-- ============================================================
-- FUNCTION: upsert_setting
-- Usada por: settingsService.ts → upsertSetting()
-- AdminSettings.tsx → guardar cambios (admin only)
-- ============================================================
CREATE OR REPLACE FUNCTION upsert_setting(p_key TEXT, p_value JSONB)
RETURNS settings LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_row settings;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: only admins can update settings';
  END IF;

  INSERT INTO settings (key, value)
  VALUES (p_key, p_value)
  ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = NOW()
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- ============================================================
-- FUNCTION: get_related_articles
-- Usada por: BlogPost.tsx → related articles (misma categoría)
-- ============================================================
CREATE OR REPLACE FUNCTION get_related_articles(
  p_article_id UUID,
  p_category   TEXT,
  p_limit      INT DEFAULT 3
)
RETURNS SETOF blog_articles LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT *
  FROM blog_articles
  WHERE
    id <> p_article_id
    AND category = p_category
    AND status = 'publicado'
  ORDER BY published_at DESC
  LIMIT p_limit;
$$;

-- ============================================================
-- FUNCTION: get_featured_properties
-- Usada por: Home.tsx → FeaturedProperties (primeras 6)
-- ============================================================
CREATE OR REPLACE FUNCTION get_featured_properties(p_limit INT DEFAULT 6)
RETURNS SETOF properties LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT *
  FROM properties
  WHERE status = 'publicada'
  ORDER BY featured DESC, created_at DESC
  LIMIT p_limit;
$$;

-- ============================================================
-- FUNCTION: export_leads_csv_data
-- Usada por: AdminLeads.tsx → exportCSV()
-- Retorna datos de leads para exportación
-- ============================================================
CREATE OR REPLACE FUNCTION export_leads_csv_data(
  p_status lead_status DEFAULT NULL
)
RETURNS TABLE (
  name           TEXT,
  email          TEXT,
  phone          TEXT,
  subject        TEXT,
  message        TEXT,
  property_title TEXT,
  created_at     TIMESTAMPTZ,
  status         lead_status
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    l.name, l.email, l.phone, l.subject, l.message,
    l.property_title, l.created_at, l.status
  FROM leads l
  WHERE
    is_admin()
    AND (p_status IS NULL OR l.status = p_status)
  ORDER BY l.created_at DESC;
$$;

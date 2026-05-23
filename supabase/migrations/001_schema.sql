-- ============================================================
-- INFINITY REAL ESTATE — Schema completo
-- Basado en análisis exhaustivo del frontend real
-- Migration: 001_schema.sql
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS — exactamente los valores usados en el frontend
-- ============================================================

-- src/types/index.ts → Property.currency
CREATE TYPE currency_type AS ENUM ('USD', 'ARS');

-- src/types/index.ts → Property.operation
CREATE TYPE property_op AS ENUM ('venta', 'alquiler');

-- src/types/index.ts → Property.type
-- AdminProperties.tsx → select options
CREATE TYPE property_type AS ENUM (
  'departamento',
  'casa',
  'oficina',
  'terreno',
  'local'
);

-- Supabase-managed status (no existe en frontend legacy, se agrega)
CREATE TYPE property_status AS ENUM ('publicada', 'borrador', 'archivada');

-- src/types/index.ts → Lead.status
-- AdminLeads.tsx → statusOptions array
CREATE TYPE lead_status AS ENUM (
  'nuevo',
  'contactado',
  'seguimiento',
  'cerrado',
  'descartado'
);

-- src/types/index.ts → Article.status
CREATE TYPE article_status AS ENUM ('publicado', 'borrador');

-- src/services/authService.ts → UserRole
CREATE TYPE user_role AS ENUM ('admin', 'agent');

-- ============================================================
-- HELPER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- HELPER: slugify (genera slug desde texto)
-- Usado en auto_slug_property y auto_slug_article
-- ============================================================
CREATE OR REPLACE FUNCTION slugify(v TEXT)
RETURNS TEXT LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        unaccent(trim(v)),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
END;
$$;

-- ============================================================
-- TABLE: profiles
-- Extiende auth.users con rol y datos de contacto del agente
-- Campos detectados en: AuthContext, authService, AdminSettings (tab Usuarios)
-- ============================================================
CREATE TABLE profiles (
  id          UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        user_role    NOT NULL DEFAULT 'agent',
  full_name   TEXT         NOT NULL DEFAULT '',
  phone       TEXT,                          -- mostrado en PropertyDetail sidebar
  avatar_url  TEXT,                          -- mostrado en PropertyDetail sidebar
  bio         TEXT,                          -- campo extra para agentes
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-crear perfil cuando se registra un usuario en Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'agent')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TABLE: amenities
-- Catálogo de amenities detectados en mock.ts:
-- 'Pileta', 'SUM', 'Parrilla', 'Laundry', 'Seguridad 24hs',
-- 'Ascensor', 'Gimnasio', 'Terraza', 'Jardín', 'Cochera', etc.
-- AdminProperties.tsx → campo "Amenities (separados por coma)"
-- ============================================================
CREATE TABLE amenities (
  id    UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
  name  TEXT  NOT NULL UNIQUE
);

-- Seed con todos los amenities del mock
INSERT INTO amenities (name) VALUES
  ('Pileta'), ('SUM'), ('Parrilla'), ('Laundry'), ('Seguridad 24hs'),
  ('Ascensor'), ('Gimnasio'), ('Terraza'), ('Jardín'), ('Cochera'),
  ('Jacuzzi'), ('Quincho'), ('Vista panorámica'), ('Vista al río'),
  ('Balcón'), ('Vidriera'), ('Iluminación LED'), ('Servicios'),
  ('Ruta pavimentada'), ('Cochera triple'), ('Ascensor privado')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- TABLE: properties
-- Campos exactos de src/types/index.ts → Property interface
-- + campos del formulario AdminProperties.tsx
-- + campos mostrados en PropertyDetail.tsx → PropertyInfo
-- ============================================================
CREATE TABLE properties (
  id            UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id      UUID            REFERENCES profiles(id) ON DELETE SET NULL,

  -- Identificación
  title         TEXT            NOT NULL,
  slug          TEXT            NOT NULL UNIQUE,

  -- Clasificación (filtros en Properties.tsx y Home.tsx hero search)
  operation     property_op     NOT NULL,                    -- venta | alquiler
  type          property_type   NOT NULL,                    -- departamento | casa | ...
  currency      currency_type   NOT NULL DEFAULT 'USD',      -- USD | ARS
  status        property_status NOT NULL DEFAULT 'borrador', -- publicada | borrador | archivada
  featured      BOOLEAN         NOT NULL DEFAULT FALSE,      -- destacada en Home

  -- Precio
  price         NUMERIC(14,2)   NOT NULL CHECK (price >= 0),

  -- Ubicación (filtros en Properties.tsx)
  location      TEXT            NOT NULL DEFAULT '',         -- "Palermo, CABA"
  address       TEXT,                                        -- "Jorge Luis Borges 2400"
  map_url       TEXT,                                        -- iframe embed URL

  -- Descripción
  description   TEXT,

  -- Especificaciones (mostradas en PropertyDetail → PropertyInfo)
  area          NUMERIC(10,2),                               -- m² totales
  covered_area  NUMERIC(10,2),                               -- m² cubiertos
  rooms         SMALLINT        CHECK (rooms >= 0),          -- ambientes
  bedrooms      SMALLINT        CHECK (bedrooms >= 0),       -- dormitorios
  bathrooms     SMALLINT        CHECK (bathrooms >= 0),      -- baños
  parking       SMALLINT        CHECK (parking >= 0),        -- cocheras
  age           SMALLINT        CHECK (age >= 0),            -- antigüedad en años
  orientation   TEXT,                                        -- "Norte", "Sur", etc.
  expenses      TEXT,                                        -- "$35,000/mes"
  disposition   TEXT,                                        -- "Frente", "Contrafrente"

  -- Badge (PropertyCard.tsx → badge overlay)
  badge         TEXT,                                        -- "Nuevo", "Destacado"
  badge_color   TEXT,                                        -- "#E53935"

  -- SEO
  meta_title    TEXT,
  meta_desc     TEXT,

  created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-generar slug desde title si no se provee
CREATE OR REPLACE FUNCTION auto_slug_property()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  base_slug  TEXT;
  final_slug TEXT;
  counter    INT := 0;
BEGIN
  IF NEW.slug IS NULL OR trim(NEW.slug) = '' THEN
    base_slug  := slugify(NEW.title);
    final_slug := base_slug;
    WHILE EXISTS (
      SELECT 1 FROM properties WHERE slug = final_slug AND id <> COALESCE(NEW.id, uuid_generate_v4())
    ) LOOP
      counter    := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_property_slug
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION auto_slug_property();

-- Índices para los filtros de Properties.tsx
CREATE INDEX idx_properties_status   ON properties(status);
CREATE INDEX idx_properties_op       ON properties(operation);
CREATE INDEX idx_properties_type     ON properties(type);
CREATE INDEX idx_properties_price    ON properties(price);
CREATE INDEX idx_properties_location ON properties USING GIN(to_tsvector('spanish', location));
CREATE INDEX idx_properties_featured ON properties(featured) WHERE featured = TRUE;
CREATE INDEX idx_properties_agent    ON properties(agent_id);
CREATE INDEX idx_properties_created  ON properties(created_at DESC);

-- Full-text search (Properties.tsx → location search + title)
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS search_vector TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('spanish',
      coalesce(title, '')       || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(location, '')    || ' ' ||
      coalesce(address, '')
    )
  ) STORED;

CREATE INDEX idx_properties_fts ON properties USING GIN(search_vector);

-- ============================================================
-- TABLE: property_images
-- PropertyDetail.tsx → PropertyGallery (lightbox con prev/next)
-- gallery: ['/assets/detail-main.jpg', '/assets/detail-1.jpg', ...]
-- AdminProperties.tsx → MediaUploader (imagen principal)
-- ============================================================
CREATE TABLE property_images (
  id            UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id   UUID     NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url           TEXT     NOT NULL,
  storage_path  TEXT,                          -- path en Supabase Storage
  is_cover      BOOLEAN  NOT NULL DEFAULT FALSE, -- imagen principal (property.image)
  sort_order    SMALLINT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_images_property ON property_images(property_id);
CREATE INDEX idx_property_images_cover    ON property_images(property_id, is_cover);

-- Solo una imagen de portada por propiedad
CREATE UNIQUE INDEX idx_property_images_one_cover
  ON property_images(property_id)
  WHERE is_cover = TRUE;

-- ============================================================
-- TABLE: property_amenities (junction)
-- Property.amenities: string[] → normalizado en BD
-- AdminProperties.tsx → "Amenities (separados por coma)"
-- PropertyDetail.tsx → PropertyInfo → amenities chips
-- ============================================================
CREATE TABLE property_amenities (
  property_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id   UUID NOT NULL REFERENCES amenities(id)  ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenity_id)
);

CREATE INDEX idx_prop_amenities_property ON property_amenities(property_id);

-- ============================================================
-- TABLE: leads
-- Campos exactos de src/types/index.ts → Lead interface
-- Formularios: Contact.tsx, PropertyDetail.tsx → ContactModal,
--              Home.tsx → ContactHomeSection
-- AdminLeads.tsx → tabla con columnas: nombre, email, teléfono,
--                  asunto, propiedad, fecha, estado
-- ============================================================
CREATE TABLE leads (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id     UUID        REFERENCES properties(id) ON DELETE SET NULL,
  assigned_to     UUID        REFERENCES profiles(id)   ON DELETE SET NULL,

  -- Datos del contacto (Contact.tsx form fields)
  name            TEXT        NOT NULL,
  email           TEXT        NOT NULL,
  phone           TEXT,
  subject         TEXT,       -- "Quiero comprar", "Quiero alquilar", etc.
  message         TEXT,

  -- Estado (AdminLeads.tsx → statusOptions)
  status          lead_status NOT NULL DEFAULT 'nuevo',
  notes           TEXT,       -- notas internas del agente

  -- Origen del lead
  source          TEXT        DEFAULT 'web', -- 'web' | 'property' | 'whatsapp'

  -- Desnormalizado para display rápido en tabla
  property_title  TEXT,       -- Lead.propertyTitle en frontend

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Índices para filtros de AdminLeads.tsx
CREATE INDEX idx_leads_status      ON leads(status);
CREATE INDEX idx_leads_assigned    ON leads(assigned_to);
CREATE INDEX idx_leads_property    ON leads(property_id);
CREATE INDEX idx_leads_created     ON leads(created_at DESC);
CREATE INDEX idx_leads_email       ON leads(email);
-- Búsqueda por nombre o email (AdminLeads.tsx search bar)
CREATE INDEX idx_leads_name_search ON leads USING GIN(to_tsvector('spanish', name || ' ' || email));

-- ============================================================
-- TABLE: blog_articles
-- Campos exactos de src/types/index.ts → Article interface
-- AdminBlog.tsx → formulario: title, category, status, image,
--                 excerpt (max 200), content, readTime
-- Blog.tsx → categorías: Tendencias, Consejos, Inversión, Legal, Decoración
-- BlogPost.tsx → related articles por categoría
-- ============================================================
CREATE TABLE blog_articles (
  id            UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id     UUID           REFERENCES profiles(id) ON DELETE SET NULL,

  title         TEXT           NOT NULL,
  slug          TEXT           NOT NULL UNIQUE,

  -- Blog.tsx → category filter buttons
  category      TEXT,          -- 'Tendencias' | 'Consejos' | 'Inversión' | 'Legal' | 'Decoración'

  excerpt       TEXT,          -- max 200 chars (AdminBlog.tsx constraint)
  content       TEXT,          -- soporta HTML (BlogPost.tsx → dangerouslySetInnerHTML)
  image         TEXT,          -- URL de imagen
  storage_path  TEXT,          -- path en Supabase Storage

  -- Article.readTime → "8 min de lectura"
  read_time     TEXT,

  status        article_status NOT NULL DEFAULT 'borrador',
  published_at  TIMESTAMPTZ,   -- se setea al publicar

  -- Desnormalizado para display (Article.author, Article.date)
  author_name   TEXT,          -- "Admin" o nombre del autor
  display_date  TEXT,          -- "15 de enero de 2024" (formato español)

  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_articles_updated_at
  BEFORE UPDATE ON blog_articles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-generar slug y setear published_at
CREATE OR REPLACE FUNCTION auto_slug_article()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  base_slug  TEXT;
  final_slug TEXT;
  counter    INT := 0;
BEGIN
  -- Slug
  IF NEW.slug IS NULL OR trim(NEW.slug) = '' THEN
    base_slug  := slugify(NEW.title);
    final_slug := base_slug;
    WHILE EXISTS (
      SELECT 1 FROM blog_articles WHERE slug = final_slug AND id <> COALESCE(NEW.id, uuid_generate_v4())
    ) LOOP
      counter    := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := final_slug;
  END IF;

  -- published_at al cambiar a publicado
  IF NEW.status = 'publicado' AND (OLD IS NULL OR OLD.status <> 'publicado') THEN
    NEW.published_at := NOW();
    -- display_date en formato español
    NEW.display_date := to_char(NOW(), 'DD "de" TMMonth "de" YYYY');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_article_slug
  BEFORE INSERT OR UPDATE ON blog_articles
  FOR EACH ROW EXECUTE FUNCTION auto_slug_article();

-- Índices para Blog.tsx filtros y búsqueda
CREATE INDEX idx_articles_status    ON blog_articles(status);
CREATE INDEX idx_articles_published ON blog_articles(published_at DESC);
CREATE INDEX idx_articles_category  ON blog_articles(category);

-- Full-text search
ALTER TABLE blog_articles
  ADD COLUMN IF NOT EXISTS search_vector TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('spanish',
      coalesce(title, '')   || ' ' ||
      coalesce(excerpt, '') || ' ' ||
      coalesce(content, '')
    )
  ) STORED;

CREATE INDEX idx_articles_fts ON blog_articles USING GIN(search_vector);

-- ============================================================
-- TABLE: testimonials
-- Campos exactos de src/types/index.ts → Testimonial interface
-- AdminTestimonials.tsx → formulario: name, role, avatar, quote
-- Home.tsx → TestimonialsSection (carrusel automático)
-- ============================================================
CREATE TABLE testimonials (
  id            UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT     NOT NULL,
  role          TEXT,    -- "compró su departamento en Palermo"
  quote         TEXT     NOT NULL,
  avatar_url    TEXT,    -- URL de imagen
  storage_path  TEXT,    -- path en Supabase Storage
  active        BOOLEAN  NOT NULL DEFAULT TRUE,  -- solo activos se muestran
  sort_order    SMALLINT NOT NULL DEFAULT 0,      -- orden en carrusel
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_testimonials_active ON testimonials(active, sort_order);

-- ============================================================
-- TABLE: settings
-- AdminSettings.tsx → tabs: General, Contacto, Redes sociales, Usuarios
-- Valores hardcodeados en Contact.tsx, Footer.tsx, WhatsAppButton.tsx
-- que deben venir de la BD
-- ============================================================
CREATE TABLE settings (
  key         TEXT    PRIMARY KEY,
  value       JSONB   NOT NULL DEFAULT '""',
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed con todos los valores detectados en el frontend
INSERT INTO settings (key, value, description) VALUES
  -- General (AdminSettings → tab General)
  ('site_name',           '"Infinity Inmobiliaria - Constructora"',  'Nombre del sitio'),
  ('site_tagline',        '"Tu inmobiliaria de confianza"',           'Tagline del sitio'),
  ('currency_default',    '"USD"',                                    'Moneda por defecto'),
  ('language',            '"es"',                                     'Idioma del sitio'),
  ('properties_per_page', '9',                                        'Propiedades por página'),

  -- Contacto (AdminSettings → tab Contacto)
  -- Valores reales detectados en Contact.tsx, Home.tsx, Footer.tsx
  ('contact_phone',       '"+593 990 332 764"',                       'Teléfono principal'),
  ('contact_email',       '"Infinity.inmoconstruct@gmail.com"',       'Email de contacto'),
  ('contact_address',     '"Riobamba Av. Tarqui y Orozco"',           'Dirección física'),
  ('contact_city',        '"Chimborazo, Ecuador"',                    'Ciudad'),
  ('contact_hours',       '"Lun a Vie: 9:00 - 18:00 | Sáb: 10:00 - 14:00"', 'Horario de atención'),
  ('whatsapp_number',     '"593990332764"',                           'Número WhatsApp (sin +)'),
  ('notification_email',  '"Infinity.inmoconstruct@gmail.com"',       'Email para notificaciones de leads'),

  -- Redes sociales (AdminSettings → tab Redes sociales)
  -- URLs reales detectadas en Contact.tsx y Home.tsx
  ('social_instagram',    '"https://www.instagram.com/infinity_inmoconst/"',                          'URL Instagram'),
  ('social_facebook',     '"https://www.facebook.com/infinity.inmobiliaria.constructora.2025"',       'URL Facebook'),
  ('social_linkedin',     '"https://linkedin.com/in/tuusuario"',                                      'URL LinkedIn'),
  ('social_tiktok',       '"https://www.tiktok.com/@infinity.inmobili"',                              'URL TikTok'),
  ('social_youtube',      '""',                                                                        'URL YouTube'),

  -- Hero (Home.tsx → HeroSection)
  ('hero_title',          '"Encuentra tu hogar ideal"',               'Título del hero'),
  ('hero_subtitle',       '"Más de 500 propiedades en las mejores ubicaciones. Te acompañamos en cada paso."', 'Subtítulo del hero'),

  -- Stats (Home.tsx → StatsSection)
  ('stat_properties',     '500',                                      'Propiedades gestionadas'),
  ('stat_clients',        '1200',                                     'Clientes satisfechos'),
  ('stat_years',          '15',                                       'Años de experiencia'),
  ('stat_satisfaction',   '98',                                       'Tasa de satisfacción (%)'),

  -- Footer
  ('footer_description',  '"Tu inmobiliaria de confianza en Buenos Aires. Más de 15 años ayudando a familias y empresas a encontrar su lugar ideal."', 'Descripción del footer'),

  -- Mapa (Contact.tsx → iframe)
  ('map_embed_url',       '"https://www.google.com/maps?q=-1.672636,-78.646671&output=embed"', 'URL del mapa embebido')

ON CONFLICT (key) DO NOTHING;

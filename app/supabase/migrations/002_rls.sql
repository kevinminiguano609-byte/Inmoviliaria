-- ============================================================
-- INFINITY REAL ESTATE — Row Level Security
-- Migration: 002_rls.sql
-- Basado en roles detectados: admin, agent, público
-- ============================================================

-- ─── Helpers de rol ──────────────────────────────────────────
-- Usados en todas las policies para evitar repetición

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION is_agent_or_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'agent')
  );
$$;

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- ============================================================
-- RLS: profiles
-- AuthContext.tsx → getProfile(), updateProfile()
-- AdminSettings.tsx → tab Usuarios
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Cada usuario puede leer su propio perfil
CREATE POLICY "profiles: own read"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins leen todos los perfiles
CREATE POLICY "profiles: admin read all"
  ON profiles FOR SELECT
  USING (is_admin());

-- Cada usuario actualiza su propio perfil
CREATE POLICY "profiles: own update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins actualizan cualquier perfil (cambio de rol, etc.)
CREATE POLICY "profiles: admin update all"
  ON profiles FOR UPDATE
  USING (is_admin());

-- ============================================================
-- RLS: properties
-- Properties.tsx → solo publicadas (público)
-- AdminProperties.tsx → todas (admin/agent)
-- PropertyDetail.tsx → por slug (público si publicada)
-- ============================================================
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Público: leer propiedades publicadas
-- Properties.tsx, Home.tsx → FeaturedProperties, PropertyCard
CREATE POLICY "properties: public read published"
  ON properties FOR SELECT
  USING (status = 'publicada');

-- Agentes: leer sus propias propiedades (cualquier estado)
CREATE POLICY "properties: agent read own"
  ON properties FOR SELECT
  USING (
    is_agent_or_admin() AND agent_id = auth.uid()
  );

-- Admins: leer todas las propiedades
CREATE POLICY "properties: admin read all"
  ON properties FOR SELECT
  USING (is_admin());

-- Agentes: crear propiedades asignadas a sí mismos
CREATE POLICY "properties: agent insert"
  ON properties FOR INSERT
  WITH CHECK (
    is_agent_or_admin() AND agent_id = auth.uid()
  );

-- Admins: crear cualquier propiedad
CREATE POLICY "properties: admin insert"
  ON properties FOR INSERT
  WITH CHECK (is_admin());

-- Agentes: editar sus propias propiedades
CREATE POLICY "properties: agent update own"
  ON properties FOR UPDATE
  USING (is_agent_or_admin() AND agent_id = auth.uid())
  WITH CHECK (is_agent_or_admin() AND agent_id = auth.uid());

-- Admins: editar cualquier propiedad
CREATE POLICY "properties: admin update all"
  ON properties FOR UPDATE
  USING (is_admin());

-- Agentes: eliminar sus propias propiedades
CREATE POLICY "properties: agent delete own"
  ON properties FOR DELETE
  USING (is_agent_or_admin() AND agent_id = auth.uid());

-- Admins: eliminar cualquier propiedad
CREATE POLICY "properties: admin delete all"
  ON properties FOR DELETE
  USING (is_admin());

-- ============================================================
-- RLS: property_images
-- PropertyDetail.tsx → PropertyGallery (lightbox)
-- AdminProperties.tsx → MediaUploader
-- ============================================================
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- Público: ver imágenes de propiedades publicadas
CREATE POLICY "property_images: public read"
  ON property_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_id AND p.status = 'publicada'
    )
  );

-- Agentes: ver imágenes de sus propiedades
CREATE POLICY "property_images: agent read own"
  ON property_images FOR SELECT
  USING (
    is_agent_or_admin() AND
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_id AND p.agent_id = auth.uid()
    )
  );

-- Admins: ver todas las imágenes
CREATE POLICY "property_images: admin read all"
  ON property_images FOR SELECT
  USING (is_admin());

-- Agentes: gestionar imágenes de sus propiedades
CREATE POLICY "property_images: agent manage own"
  ON property_images FOR ALL
  USING (
    is_agent_or_admin() AND
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_id AND p.agent_id = auth.uid()
    )
  );

-- Admins: gestionar todas las imágenes
CREATE POLICY "property_images: admin manage all"
  ON property_images FOR ALL
  USING (is_admin());

-- ============================================================
-- RLS: amenities
-- PropertyDetail.tsx → amenities chips
-- AdminProperties.tsx → campo amenities
-- ============================================================
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;

-- Público: leer catálogo de amenities
CREATE POLICY "amenities: public read"
  ON amenities FOR SELECT
  USING (TRUE);

-- Admins: gestionar catálogo
CREATE POLICY "amenities: admin manage"
  ON amenities FOR ALL
  USING (is_admin());

-- ============================================================
-- RLS: property_amenities
-- PropertyDetail.tsx → amenities chips
-- ============================================================
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;

-- Público: ver amenities de propiedades publicadas
CREATE POLICY "property_amenities: public read"
  ON property_amenities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_id AND p.status = 'publicada'
    )
  );

-- Agentes: gestionar amenities de sus propiedades
CREATE POLICY "property_amenities: agent manage own"
  ON property_amenities FOR ALL
  USING (
    is_agent_or_admin() AND
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_id AND p.agent_id = auth.uid()
    )
  );

-- Admins: gestionar todos
CREATE POLICY "property_amenities: admin manage all"
  ON property_amenities FOR ALL
  USING (is_admin());

-- ============================================================
-- RLS: leads
-- Contact.tsx → formulario público (INSERT sin auth)
-- PropertyDetail.tsx → ContactModal (INSERT sin auth)
-- Home.tsx → ContactHomeSection (INSERT sin auth)
-- AdminLeads.tsx → gestión completa (admin)
-- ============================================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- PÚBLICO: puede crear leads (formularios de contacto)
-- Contact.tsx, PropertyDetail.tsx → ContactModal, Home.tsx
CREATE POLICY "leads: public insert"
  ON leads FOR INSERT
  WITH CHECK (TRUE);

-- Agentes: leer leads asignados a ellos
CREATE POLICY "leads: agent read assigned"
  ON leads FOR SELECT
  USING (
    is_agent_or_admin() AND assigned_to = auth.uid()
  );

-- Agentes: actualizar leads asignados (cambiar estado)
CREATE POLICY "leads: agent update assigned"
  ON leads FOR UPDATE
  USING (is_agent_or_admin() AND assigned_to = auth.uid())
  WITH CHECK (is_agent_or_admin() AND assigned_to = auth.uid());

-- Admins: acceso total a leads
CREATE POLICY "leads: admin full access"
  ON leads FOR ALL
  USING (is_admin());

-- ============================================================
-- RLS: blog_articles
-- Blog.tsx → solo publicados (público)
-- BlogPost.tsx → por slug (público si publicado)
-- AdminBlog.tsx → todos (admin)
-- ============================================================
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;

-- Público: leer artículos publicados
CREATE POLICY "blog_articles: public read published"
  ON blog_articles FOR SELECT
  USING (status = 'publicado');

-- Staff autenticado: leer todos (para admin panel)
CREATE POLICY "blog_articles: staff read all"
  ON blog_articles FOR SELECT
  USING (is_agent_or_admin());

-- Admins: gestión completa
CREATE POLICY "blog_articles: admin manage"
  ON blog_articles FOR ALL
  USING (is_admin());

-- ============================================================
-- RLS: testimonials
-- Home.tsx → TestimonialsSection (solo activos, público)
-- AdminTestimonials.tsx → gestión completa (admin)
-- ============================================================
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Público: leer testimonios activos
CREATE POLICY "testimonials: public read active"
  ON testimonials FOR SELECT
  USING (active = TRUE);

-- Admins: gestión completa
CREATE POLICY "testimonials: admin manage"
  ON testimonials FOR ALL
  USING (is_admin());

-- ============================================================
-- RLS: settings
-- Todos los componentes leen settings (Contact.tsx, Footer.tsx, etc.)
-- AdminSettings.tsx → solo admin puede escribir
-- ============================================================
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Público: leer todas las settings (necesario para configuración del sitio)
CREATE POLICY "settings: public read"
  ON settings FOR SELECT
  USING (TRUE);

-- Admins: gestión completa
CREATE POLICY "settings: admin manage"
  ON settings FOR ALL
  USING (is_admin());

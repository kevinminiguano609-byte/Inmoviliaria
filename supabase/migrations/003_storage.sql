-- ============================================================
-- INFINITY REAL ESTATE — Supabase Storage
-- Migration: 003_storage.sql
-- Buckets detectados en: mediaService.ts, AdminProperties.tsx,
-- AdminBlog.tsx, AdminTestimonials.tsx (MediaUploader)
-- ============================================================

-- ─── Crear buckets ───────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  -- AdminProperties.tsx → MediaUploader (imagen principal + galería)
  ('property-images', 'property-images', TRUE,
   10485760,  -- 10 MB
   ARRAY['image/jpeg','image/jpg','image/png','image/webp']),

  -- AdminBlog.tsx → MediaUploader (imagen del artículo)
  ('blog-images', 'blog-images', TRUE,
   10485760,
   ARRAY['image/jpeg','image/jpg','image/png','image/webp']),

  -- AdminTestimonials.tsx → MediaUploader (avatar)
  -- AuthContext → updateProfile (avatar del agente)
  ('avatars', 'avatars', TRUE,
   5242880,   -- 5 MB
   ARRAY['image/jpeg','image/jpg','image/png','image/webp']),

  -- AdminSettings.tsx → logo, branding del sitio
  ('branding', 'branding', TRUE,
   5242880,
   ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/svg+xml'])

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE POLICIES: property-images
-- Organización: {agent_id}/{timestamp}-{filename}
-- ============================================================

-- Público: leer todas las imágenes (PropertyCard, PropertyDetail)
CREATE POLICY "property-images: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

-- Agentes: subir a su propia carpeta
CREATE POLICY "property-images: agent upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images'
    AND is_agent_or_admin()
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Agentes: actualizar sus propios archivos
CREATE POLICY "property-images: agent update own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'property-images'
    AND is_agent_or_admin()
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Agentes: eliminar sus propios archivos
CREATE POLICY "property-images: agent delete own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-images'
    AND is_agent_or_admin()
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Admins: gestión total
CREATE POLICY "property-images: admin manage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'property-images' AND is_admin());

-- ============================================================
-- STORAGE POLICIES: blog-images
-- Solo admins pueden subir (AdminBlog.tsx)
-- ============================================================

CREATE POLICY "blog-images: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "blog-images: admin manage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'blog-images' AND is_admin());

-- ============================================================
-- STORAGE POLICIES: avatars
-- Cada usuario sube su propio avatar: {user_id}/{filename}
-- AdminTestimonials.tsx → avatar de testimonios (admin)
-- ============================================================

CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Usuarios autenticados: subir a su propia carpeta
CREATE POLICY "avatars: own upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "avatars: own update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "avatars: own delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Admins: gestión total (para avatars de testimonios)
CREATE POLICY "avatars: admin manage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'avatars' AND is_admin());

-- ============================================================
-- STORAGE POLICIES: branding
-- AdminSettings.tsx → logo, favicon, imágenes del sitio
-- ============================================================

CREATE POLICY "branding: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'branding');

CREATE POLICY "branding: admin manage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'branding' AND is_admin());

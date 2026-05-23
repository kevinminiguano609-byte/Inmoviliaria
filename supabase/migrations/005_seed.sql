-- ============================================================
-- INFINITY REAL ESTATE — Seed Data
-- Migration: 005_seed.sql
-- Migra los datos mock del frontend a la base de datos real
-- Basado en: src/data/mock.ts
-- ============================================================

-- NOTA: Este seed requiere que exista al menos un usuario admin.
-- Ejecutar DESPUÉS de crear el primer usuario admin en Supabase Auth
-- y actualizar su rol:
--   UPDATE profiles SET role = 'admin' WHERE id = '<tu-uuid>';

-- ============================================================
-- SEED: amenities (ya insertados en 001_schema.sql)
-- Verificar que estén todos los del mock
-- ============================================================
INSERT INTO amenities (name) VALUES
  ('Pileta'), ('SUM'), ('Parrilla'), ('Laundry'), ('Seguridad 24hs'),
  ('Ascensor'), ('Gimnasio'), ('Terraza'), ('Jardín'), ('Cochera'),
  ('Jacuzzi'), ('Quincho'), ('Vista panorámica'), ('Vista al río'),
  ('Balcón'), ('Vidriera'), ('Iluminación LED'), ('Servicios'),
  ('Ruta pavimentada'), ('Cochera triple'), ('Ascensor privado')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED: properties (12 propiedades del mock.ts)
-- NOTA: agent_id se puede actualizar después con el UUID real del agente
-- ============================================================

-- Propiedad 1: Departamento en Palermo Soho
INSERT INTO properties (
  title, slug, operation, type, currency, status, featured,
  price, location, address, map_url, description,
  area, covered_area, rooms, bedrooms, bathrooms, parking,
  age, orientation, expenses, disposition, badge, badge_color
) VALUES (
  'Departamento en Palermo Soho',
  'departamento-palermo-soho',
  'venta', 'departamento', 'USD', 'publicada', TRUE,
  450000,
  'Palermo, CABA',
  'Jorge Luis Borges 2400, Palermo, CABA',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.5!2d-58.42!3d-34.59!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM1JzI0LjAiUyA1OMKwMjUnMTIuMCJX!5e0!3m2!1ses!2sar!4v1',
  'Espectacular departamento de 3 ambientes en el corazón de Palermo Soho. Totalmente reciclado con diseño contemporáneo y materiales de primera calidad.',
  120, 105, 3, 3, 2, 1, 5, 'Norte', '$35,000/mes', 'Frente', 'Nuevo', '#E53935'
) ON CONFLICT (slug) DO NOTHING;

-- Propiedad 2: Casa en San Isidro
INSERT INTO properties (
  title, slug, operation, type, currency, status, featured,
  price, location, address, map_url, description,
  area, bedrooms, bathrooms, badge, badge_color
) VALUES (
  'Casa en San Isidro',
  'casa-san-isidro',
  'alquiler', 'casa', 'USD', 'publicada', FALSE,
  2800,
  'San Isidro',
  'Av. del Libertador 15000, San Isidro',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3288.0!2d-58.51!3d-34.47!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDI4JzEyLjAiUyA1OMKwMzAnMzYuMCJX!5e0!3m2!1ses!2sar!4v1',
  'Hermosa casa de 4 dormitorios en San Isidro. Amplio jardín con pileta, parrilla y quincho.',
  280, 4, 3, 'En alquiler', '#2196F3'
) ON CONFLICT (slug) DO NOTHING;

-- Propiedad 3: Oficina en Puerto Madero
INSERT INTO properties (
  title, slug, operation, type, currency, status, featured,
  price, location, address, map_url, description,
  area, rooms, bathrooms, badge, badge_color
) VALUES (
  'Oficina en Puerto Madero',
  'oficina-puerto-madero',
  'venta', 'oficina', 'USD', 'publicada', TRUE,
  890000,
  'Puerto Madero, CABA',
  'Olga Cossettini 1500, Puerto Madero, CABA',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3282.0!2d-58.36!3d-34.61!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM2JzM2LjAiUyA1OMKwMjEnMzYuMCJX!5e0!3m2!1ses!2sar!4v1',
  'Oficina premium en Puerto Madero con vista panorámica al dique. 5 ambientes diáfanos, cocina office, 3 baños.',
  350, 5, 3, 'Venta', '#4CAF50'
) ON CONFLICT (slug) DO NOTHING;

-- Propiedad 4: Penthouse en Recoleta
INSERT INTO properties (
  title, slug, operation, type, currency, status, featured,
  price, location, address, map_url, description,
  area, bedrooms, bathrooms, badge, badge_color
) VALUES (
  'Penthouse en Recoleta',
  'penthouse-recoleta',
  'venta', 'departamento', 'USD', 'publicada', TRUE,
  1200000,
  'Recoleta, CABA',
  'Av. Alvear 1800, Recoleta, CABA',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0!2d-58.39!3d-34.59!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM1JzI0LjAiUyA1OMKwMjMnMjQuMCJX!5e0!3m2!1ses!2sar!4v1',
  'Exclusivo penthouse en Recoleta con terraza propia de 200m2. 4 dormitorios en suite, living comedor de doble altura.',
  450, 4, 4, 'Destacado', '#FF9800'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED: blog_articles (9 artículos del mock.ts)
-- ============================================================

INSERT INTO blog_articles (
  title, slug, category, excerpt, content, image,
  read_time, status, author_name, display_date, published_at
) VALUES
(
  'El mercado inmobiliario en 2024: tendencias y proyecciones',
  'mercado-inmobiliario-2024',
  'Tendencias',
  'El año 2024 trae consigo importantes cambios en el mercado inmobiliario argentino. Desde la recuperación de zonas emergentes hasta el auge de los desarrollos sostenibles.',
  'El mercado inmobiliario argentino está atravesando un momento de transformación. En este artículo analizamos las principales tendencias que marcarán el 2024...',
  '/assets/blog-featured.jpg',
  '8 min de lectura', 'publicado', 'Admin', '15 de enero de 2024', NOW() - INTERVAL '30 days'
),
(
  'Guía completa para primeros compradores de propiedades',
  'guia-primeros-compradores',
  'Consejos',
  'Comprar tu primera propiedad puede ser abrumador. Esta guía paso a paso te ayudará a entender el proceso desde la búsqueda hasta la firma.',
  'Comprar tu primera propiedad es una de las decisiones más importantes de tu vida...',
  '/assets/blog-2.jpg',
  '6 min de lectura', 'publicado', 'Admin', '10 de enero de 2024', NOW() - INTERVAL '35 days'
),
(
  'Construcción sustentable: el futuro de la vivienda',
  'construccion-sustentable',
  'Tendencias',
  'Los desarrollos con certificación LEED y tecnologías verdes están revolucionando la industria.',
  'La construcción sustentable ya no es una tendencia, es una necesidad...',
  '/assets/blog-3.jpg',
  '5 min de lectura', 'publicado', 'Admin', '5 de enero de 2024', NOW() - INTERVAL '40 days'
),
(
  'Invertir en propiedades: ¿departamento o terreno?',
  'invertir-departamento-o-terreno',
  'Inversión',
  'Analizamos las ventajas y desventajas de cada tipo de inversión inmobiliaria.',
  'Una de las preguntas más frecuentes entre los inversores inmobiliarios es...',
  '/assets/blog-4.jpg',
  '7 min de lectura', 'publicado', 'Admin', '28 de diciembre de 2023', NOW() - INTERVAL '50 days'
),
(
  'Todo lo que necesitás saber sobre escrituración',
  'todo-sobre-escrituracion',
  'Legal',
  'La escrituración es el paso final y más importante. Te explicamos los requisitos, costos y plazos.',
  'La escrituración es el acto mediante el cual se transfiere la propiedad...',
  '/assets/blog-5.jpg',
  '4 min de lectura', 'publicado', 'Admin', '20 de diciembre de 2023', NOW() - INTERVAL '60 days'
),
(
  'Tendencias de interiorismo para departamentos modernos',
  'tendencias-interiorismo',
  'Decoración',
  'Desde el estilo nórdico hasta el industrial: las tendencias de decoración que están dominando los departamentos.',
  'El interiorismo de los departamentos modernos se caracteriza por...',
  '/assets/blog-6.jpg',
  '5 min de lectura', 'publicado', 'Admin', '15 de diciembre de 2023', NOW() - INTERVAL '65 days'
),
(
  'Los barrios más buscados de Buenos Aires en 2024',
  'barrios-mas-buscados-2024',
  'Tendencias',
  'Palermo, Puerto Madero y Núñez lideran las búsquedas.',
  'El mapa de los barrios más buscados de Buenos Aires está en constante evolución...',
  '/assets/blog-7.jpg',
  '6 min de lectura', 'publicado', 'Admin', '8 de diciembre de 2023', NOW() - INTERVAL '72 days'
),
(
  'Cómo vender tu propiedad en menos de 60 días',
  'vender-propiedad-60-dias',
  'Consejos',
  'Consejos prácticos de nuestros agentes para preparar, precificar y comercializar tu propiedad.',
  'Vender una propiedad en menos de 60 días es posible si sigues estos consejos...',
  '/assets/blog-8.jpg',
  '5 min de lectura', 'publicado', 'Admin', '1 de diciembre de 2023', NOW() - INTERVAL '79 days'
),
(
  'Rentabilidad de alquileres temporarios en CABA',
  'rentabilidad-alquileres-temporarios',
  'Inversión',
  'Los alquileres temporarios se consolidan como una excelente fuente de ingresos.',
  'Los alquileres temporarios en CABA han ganado popularidad como inversión...',
  '/assets/blog-9.jpg',
  '6 min de lectura', 'publicado', 'Admin', '24 de noviembre de 2023', NOW() - INTERVAL '86 days'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED: testimonials (3 del mock.ts)
-- ============================================================
INSERT INTO testimonials (name, role, quote, avatar_url, active, sort_order) VALUES
(
  'María García',
  'compró su departamento en Palermo',
  'El equipo de Lucero hizo que el proceso de compra fuera increíblemente simple. Encontraron exactamente lo que buscábamos en solo dos semanas.',
  '/assets/avatar-1.jpg',
  TRUE, 1
),
(
  'Carlos Mendoza',
  'alquiló oficina en Puerto Madero',
  'Necesitábamos alquilar rápido y Lucero nos presentó 5 opciones en 48 horas. El contrato se firmó sin complicaciones. Un servicio excepcional.',
  '/assets/avatar-2.jpg',
  TRUE, 2
),
(
  'Ana y Roberto Sánchez',
  'vendieron su propiedad en Martínez',
  'Vendimos nuestra casa en Martínez al precio que queríamos. La asesoría en precio y la negociación fueron clave. Los recomendamos al 100%.',
  '/assets/avatar-3.jpg',
  TRUE, 3
)
ON CONFLICT DO NOTHING;

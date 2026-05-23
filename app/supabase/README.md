# Infinity Real Estate — Supabase Backend

## Setup rápido

### 1. Crear proyecto en Supabase
1. Ir a [supabase.com](https://supabase.com) → New Project
2. Copiar **Project URL** y **anon public key** desde Settings → API

### 2. Configurar variables de entorno
Editar `.env` en la raíz del proyecto:
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Ejecutar migraciones (en orden)
En Supabase Dashboard → **SQL Editor**, ejecutar en este orden:

| Archivo | Contenido |
|---------|-----------|
| `migrations/001_schema.sql` | Tablas, enums, triggers, índices, FTS |
| `migrations/002_rls.sql` | Row Level Security policies |
| `migrations/003_storage.sql` | Buckets y policies de Storage |
| `migrations/004_functions.sql` | Funciones SQL (search, stats, etc.) |

### 4. Crear primer usuario admin
En Supabase Dashboard → **Authentication** → Users → Invite user

Luego en SQL Editor:
```sql
UPDATE profiles
SET role = 'admin'
WHERE id = '<user-uuid>';
```

### 5. Habilitar Email Auth
En Authentication → Providers → Email → Enable

---

## Arquitectura

```
src/
├── lib/
│   └── supabase.ts          # Cliente singleton tipado
├── types/
│   └── supabase.ts          # Tipos completos de todas las tablas
├── services/
│   ├── authService.ts       # Login, signup, reset, profiles
│   ├── propertyService.ts   # CRUD + búsqueda avanzada
│   ├── leadService.ts       # CRUD + asignación + estados
│   ├── articleService.ts    # CRUD blog
│   ├── testimonialService.ts
│   ├── mediaService.ts      # Supabase Storage uploads
│   └── settingsService.ts   # Configuración del sitio
├── hooks/
│   ├── useProperties.ts     # Lista con filtros y paginación
│   ├── useLeads.ts          # Gestión de leads
│   ├── useArticles.ts       # Gestión de artículos
│   ├── useDashboard.ts      # Stats del panel admin
│   └── useSettings.ts       # Configuración del sitio
└── contexts/
    └── AuthContext.tsx      # Auth state global (Supabase)
```

## Roles y permisos

| Acción | Público | Agent | Admin |
|--------|---------|-------|-------|
| Ver propiedades publicadas | ✅ | ✅ | ✅ |
| Ver todas las propiedades | ❌ | Solo propias | ✅ |
| Crear/editar propiedades | ❌ | Solo propias | ✅ |
| Ver leads | ❌ | Solo asignados | ✅ |
| Crear lead (formulario) | ✅ | ✅ | ✅ |
| Asignar leads | ❌ | ❌ | ✅ |
| Gestionar blog | ❌ | ❌ | ✅ |
| Gestionar settings | ❌ | ❌ | ✅ |
| Subir imágenes | ❌ | Propias props | ✅ |

## Storage buckets

| Bucket | Público | Quién sube |
|--------|---------|------------|
| `property-images` | ✅ | Agents (carpeta propia) + Admin |
| `blog-images` | ✅ | Admin |
| `avatars` | ✅ | Cada usuario (carpeta propia) |
| `branding` | ✅ | Admin |

## Funciones SQL disponibles

```sql
-- Búsqueda avanzada de propiedades con paginación
SELECT * FROM search_properties(
  p_query := 'palermo',
  p_operation := 'venta',
  p_type := 'departamento',
  p_min_price := 200000,
  p_max_price := 600000,
  p_page := 1,
  p_page_size := 9
);

-- Detalle completo de propiedad (con imágenes, amenities, agente)
SELECT get_property_detail('departamento-palermo-soho');

-- Stats del dashboard
SELECT get_dashboard_stats();

-- Asignar lead a agente
SELECT assign_lead('<lead-uuid>', '<agent-uuid>');

-- Actualizar estado de lead
SELECT update_lead_status('<lead-uuid>', 'contactado', 'Llamé al cliente');

-- Obtener todas las settings como objeto
SELECT get_settings_map();
```

## Regenerar tipos TypeScript

Cuando modifiques el schema, regenerá los tipos automáticamente:

```bash
npx supabase gen types typescript \
  --project-id <your-project-id> \
  > src/types/supabase.ts
```

# Requirements Document: Property Module Improvements

## Overview

Este documento deriva los requisitos funcionales y no funcionales del diseño técnico para las mejoras del módulo de propiedades. Basado en el análisis del sistema actual y las necesidades identificadas.

## Functional Requirements

### FR-1: Sistema de Imágenes Múltiples

**FR-1.1**: El formulario de propiedades debe permitir subir múltiples imágenes
- **Prioridad**: Alta
- **Criterios de aceptación**:
  - Mínimo 1 imagen, máximo 20 imágenes por propiedad
  - Tipos permitidos: JPG, PNG, WEBP
  - Tamaño máximo por archivo: 10MB
  - Previsualización en tiempo real de todas las imágenes
  - Capacidad de eliminar imágenes antes de enviar el formulario

**FR-1.2**: Definir una imagen principal obligatoria
- **Prioridad**: Alta
- **Criterios de aceptación**:
  - La primera imagen subida se marca automáticamente como principal
  - El usuario puede cambiar cuál imagen es la principal
  - Exactamente una imagen debe ser marcada como principal
  - Indicador visual claro de cuál es la imagen principal

**FR-1.3**: Ordenamiento de imágenes
- **Prioridad**: Media
- **Criterios de aceptación**:
  - Las imágenes mantienen el orden de subida por defecto
  - El usuario puede reordenar imágenes mediante drag-and-drop
  - El orden se guarda y se respeta en la visualización

**FR-1.4**: Compatibilidad con propiedades existentes
- **Prioridad**: Alta
- **Criterios de aceptación**:
  - Propiedades existentes con una sola imagen funcionan sin cambios
  - Migración automática: imagen existente se marca como `is_cover: true`
  - No se pierden datos durante la transición

### FR-2: Mapa Interactivo de Ubicación

**FR-2.1**: Reemplazar campo `map_url` por mapa interactivo
- **Prioridad**: Alta
- **Criterios de aceptación**:
  - Integración con Google Maps API
  - Alternativa: Leaflet/OpenStreetMap como fallback
  - El usuario selecciona ubicación haciendo clic en el mapa
  - Marcador visual muestra la ubicación seleccionada

**FR-2.2**: Almacenamiento de coordenadas geográficas
- **Prioridad**: Alta
- **Criterios de aceptación**:
  - Nuevos campos en BD: `latitude` (decimal), `longitude` (decimal)
  - Validación: latitud ∈ [-90, 90], longitud ∈ [-180, 180]
  - Campo `map_url` se mantiene para compatibilidad (puede ser null)

**FR-2.3**: Geocodificación inversa
- **Prioridad**: Media
- **Criterios de aceptación**:
  - Al seleccionar ubicación en mapa, obtener dirección aproximada
  - Mostrar dirección en campo correspondiente
  - Permitir edición manual de la dirección

**FR-2.4**: Carga de ubicación existente
- **Prioridad**: Alta
- **Criterios de aceptación**:
  - Al editar propiedad, cargar marcador en ubicación guardada
  - Si solo hay `map_url`, intentar extraer coordenadas
  - Fallback: centrar mapa en ubicación por defecto

### FR-3: Validaciones y Seguridad

**FR-3.1**: Validación de archivos de imagen
- **Prioridad**: Alta
- **Criterios de aceptación**:
  - Validación de tipo MIME en frontend y backend
  - Validación de tamaño máximo (10MB)
  - Sanitización de nombres de archivo
  - Prevención de archivos maliciosos

**FR-3.2**: Validación de coordenadas
- **Prioridad**: Media
- **Criterios de aceptación**:
  - Coordenadas dentro de rangos geográficos válidos
  - Prevención de ubicaciones imposibles (medio del océano)
  - Validación de formato decimal

### FR-4: Experiencia de Usuario

**FR-4.1**: Previsualización de imágenes
- **Prioridad**: Alta
- **Criterios de aceptación**:
  - Grid responsivo de miniaturas
  - Indicador visual de imagen principal
  - Botones de acción por imagen (eliminar, marcar como principal)
  - Loading states durante subida

**FR-4.2**: Interfaz de mapa intuitiva
- **Prioridad**: Alta
- **Criterios de aceptación**:
  - Mapa responsivo que se adapta al contenedor
  - Controles de zoom y pan
  - Marcador arrastrable para ajustar ubicación
  - Búsqueda por dirección (opcional)

**FR-4.3**: Feedback al usuario
- **Prioridad**: Media
- **Criterios de aceptación**:
  - Mensajes de error claros y específicos
  - Confirmación de acciones (eliminar imagen)
  - Indicadores de progreso durante subida
  - Toast notifications para operaciones exitosas/fallidas

## Non-Functional Requirements

### NFR-1: Rendimiento

**NFR-1.1**: Tiempo de carga de imágenes
- **Métrica**: < 2 segundos para cargar grid de imágenes
- **Criterios**: Lazy loading de miniaturas, optimización de tamaño

**NFR-1.2**: Rendimiento del mapa
- **Métrica**: < 3 segundos para inicializar mapa interactivo
- **Criterios**: Carga diferida de API de mapas, caché de tiles

**NFR-1.3**: Subida de archivos
- **Métrica**: Progreso visible durante subida de múltiples archivos
- **Criterios**: Subida paralela con límite de concurrencia (3-5 archivos)

### NFR-2: Seguridad

**NFR-2.1**: Autenticación y autorización
- **Criterios**: Solo usuarios autenticados (admin/agent) pueden modificar propiedades
- **Implementación**: RLS policies de Supabase, validación de sesión

**NFR-2.2**: Protección de archivos
- **Criterios**: Validación de tipos MIME en backend, sanitización de nombres
- **Implementación**: Supabase Storage con políticas de acceso

**NFR-2.3**: Protección de API de mapas
- **Criterios**: API keys restringidas por dominio, rate limiting
- **Implementación**: Variables de entorno, configuración segura

### NFR-3: Usabilidad

**NFR-3.1**: Accesibilidad
- **Criterios**: WCAG 2.1 AA compliance para componentes críticos
- **Implementación**: ARIA labels, keyboard navigation, contraste adecuado

**NFR-3.2**: Responsividad
- **Criterios**: Funcionalidad completa en dispositivos móviles (≥320px)
- **Implementación**: Design responsive, touch-friendly interfaces

**NFR-3.3**: Internacionalización
- **Criterios**: Soporte para formatos de coordenadas regionales
- **Implementación**: Biblioteca de internacionalización (i18n)

### NFR-4: Mantenibilidad

**NFR-4.1**: Código modular
- **Criterios**: Separación de concerns, componentes reutilizables
- **Implementación**: React components con props bien definidas

**NFR-4.2**: Documentación
- **Criterios**: Documentación de API, componentes y flujos
- **Implementación**: JSDoc, READMEs, comentarios en código crítico

**NFR-4.3**: Testing
- **Criterios**: Cobertura de tests ≥ 80% para nuevas funcionalidades
- **Implementación**: Unit tests, integration tests, E2E tests

### NFR-5: Compatibilidad

**NFR-5.1**: Compatibilidad con navegadores
- **Criterios**: Soporte para Chrome ≥ 90, Firefox ≥ 88, Safari ≥ 14, Edge ≥ 90
- **Implementación**: Polyfills para APIs modernas, testing cross-browser

**NFR-5.2**: Compatibilidad con versiones anteriores
- **Criterios**: No romper funcionalidades existentes
- **Implementación**: Migración gradual, fallbacks, deprecated warnings

## Technical Constraints

### TC-1: Stack Tecnológico

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Storage, Auth)
- **UI Components**: shadcn/ui, Lucide React icons
- **Form Management**: react-hook-form, zod para validación
- **Map Integration**: Google Maps JavaScript API o Leaflet

### TC-2: Base de Datos

- **Esquema existente**: Tabla `property_images` ya soporta múltiples imágenes
- **Modificaciones necesarias**:
  - Agregar campos `latitude` (decimal), `longitude` (decimal) a tabla `properties`
  - Mantener campo `map_url` para compatibilidad
- **Migración**: Script SQL para agregar nuevos campos sin perder datos

### TC-3: Storage

- **Bucket existente**: `property-images` en Supabase Storage
- **Límites**: 10MB por archivo, tipos MIME: image/jpeg, image/png, image/webp
- **Organización**: `/property-images/{property_id}/{filename}`

### TC-4: APIs Externas

- **Google Maps API**: Requiere API key con restricciones
- **Geocoding API**: Para geocodificación inversa (opcional)
- **Rate limits**: Considerar límites de uso gratuito/paid

## Dependencies

### D-1: Dependencias Internas

- `@/services/propertyService`: Funciones existentes para gestión de propiedades
- `@/services/mediaService`: Funciones para subida de archivos
- `@/contexts/PropertyContext`: Estado global de propiedades
- `@/components/admin/MediaUploader`: Componente existente a extender

### D-2: Dependencias Externas

- `@supabase/supabase-js` ≥ 2.49.4: Cliente Supabase
- `react-hook-form` ≥ 7.70.0: Manejo de formularios
- `zod` ≥ 4.3.5: Validación de esquemas
- `@googlemaps/js-api-loader`: Carga de Google Maps API (opcional)
- `leaflet` + `react-leaflet`: Alternativa a Google Maps

### D-3: Configuración Requerida

- Variables de entorno para API keys de mapas
- Configuración de Supabase Storage policies
- CORS configuration para APIs externas

## Assumptions

### A-1: Supuestos Técnicos

1. El proyecto ya tiene autenticación funcionando con Supabase Auth
2. Las RLS policies existentes son adecuadas para las nuevas funcionalidades
3. El bucket `property-images` en Supabase Storage está configurado correctamente
4. El rendimiento actual del sistema es aceptable y no se degradará significativamente

### A-2: Supuestos de Negocio

1. Los usuarios (admin/agent) tienen conocimientos básicos de computación
2. La mayoría de las propiedades tendrán entre 3-10 imágenes
3. La precisión de ubicación a nivel de calle es suficiente (no se requiere precisión de metros)
4. No se requiere integración con sistemas de GPS o tracking en tiempo real

### A-3: Supuestos de Usuario

1. Los usuarios prefieren interfaz visual (mapa) sobre entrada manual de coordenadas
2. La capacidad de previsualizar imágenes antes de guardar es valorada
3. La retroalimentación inmediata sobre errores de validación es importante
4. La consistencia con el diseño existente de la aplicación es deseable

## Out of Scope

### OS-1: Funcionalidades Excluidas

1. **Edición avanzada de imágenes**: Recorte, redimensionamiento, filtros
2. **Sistema de etiquetado de imágenes**: Marcar áreas específicas en fotos
3. **Integración con cámaras móviles**: Captura directa desde dispositivo
4. **Mapas 3D o vistas de satélite en tiempo real**
5. **Sistema de routing o direcciones paso a paso**
6. **Integración con sistemas de valuación automática basada en imágenes/ubicación**

### OS-2: Plataformas Excluidas

1. **Aplicación móvil nativa**: Solo web responsive
2. **Integración con redes sociales**: Compartir propiedades automáticamente
3. **APIs públicas para terceros**: Solo uso interno de la aplicación

## Success Metrics

### SM-1: Métricas de Adopción

1. **Tasa de uso de múltiples imágenes**: % de propiedades con >1 imagen después de 30 días
2. **Tasa de uso de mapa interactivo**: % de propiedades con coordenadas vs map_url después de 30 días
3. **Satisfacción del usuario**: Encuesta NPS después de implementación

### SM-2: Métricas de Rendimiento

1. **Tiempo promedio de subida de imágenes**: Objetivo < 5 segundos por imagen
2. **Tiempo de carga del mapa**: Objetivo < 3 segundos en conexión 4G
3. **Tasa de error de validación**: Objetivo < 5% de intentos de guardado

### SM-3: Métricas de Calidad

1. **Cobertura de tests**: Objetivo ≥ 80% para nuevas funcionalidades
2. **Bugs reportados**: Objetivo < 10 bugs críticos/mayores en primer mes
3. **Tiempo de resolución**: Objetivo < 24 horas para bugs críticos
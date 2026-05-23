# Implementation Plan: Property Module Improvements

## Overview

Implementación de mejoras al módulo de propiedades para soportar múltiples imágenes y mapa interactivo. Basado en el diseño técnico y requisitos documentados.

## Tasks

### Phase 1: Preparación y Configuración

#### task-1.1 Analizar estructura actual de base de datos
- **Descripción**: Revisar esquema existente de tablas `properties` y `property_images`
- **Entradas**: Archivos de migración SQL existentes
- **Salidas**: Documentación de campos actuales, relaciones y constraints
- **Criterios de aceptación**: Lista completa de campos con tipos y restricciones
- **Estimación**: 1 hora

#### 1.2 Configurar variables de entorno para APIs de mapa
- **Descripción**: Agregar API keys de Google Maps/Leaflet a configuración
- **Entradas**: Claves de API, documentación de configuración
- **Salidas**: Variables en `.env` y configuración en Vite
- **Criterios de aceptación**: API cargada correctamente sin errores en consola
- **Estimación**: 30 minutos

#### 1.3 Crear migración SQL para campos de coordenadas
- **Descripción**: Agregar campos `latitude` y `longitude` a tabla `properties`
- **Entradas**: Esquema actual de tabla `properties`
- **Salidas**: Archivo de migración SQL (006_coordinates.sql)
- **Criterios de aceptación**:
  - Campos agregados con tipo `decimal(10, 8)` para precisión
  - Valores por defecto `NULL`
  - Índices para búsqueda por ubicación
  - Compatibilidad con datos existentes
- **Estimación**: 1 hora

### Phase 2: Backend - Servicios y Lógica

#### 2.1 Extender types de Supabase para nuevos campos
- **Descripción**: Actualizar interfaces TypeScript para incluir campos de coordenadas
- **Entradas**: Types existentes en `src/types/supabase.ts`
- **Salidas**: Interfaces `PropertyRow`, `PropertyInsert`, `PropertyUpdate` actualizadas
- **Criterios de aceptación**: Compilación sin errores, tipos correctamente inferidos
- **Estimación**: 45 minutos

#### 2.2 Crear función para subida múltiple de imágenes
- **Descripción**: Implementar `uploadMultiplePropertyImages()` en `propertyService.ts`
- **Entradas**: Diseño de función con pre/post-conditions
- **Salidas**: Función que procesa array de archivos y retorna `PropertyImage[]`
- **Criterios de aceptación**:
  - Subida batch con límite de concurrencia (3-5 archivos)
  - Manejo de errores individuales sin fallar todo el batch
  - Asignación automática de `is_cover` (primera imagen)
  - Retorno de metadata completa de cada imagen
- **Estimación**: 2 horas

#### 2.3 Crear función para actualización de ubicación
- **Descripción**: Implementar `updatePropertyLocation()` en `propertyService.ts`
- **Entradas**: Diseño de función con validación de coordenadas
- **Salidas**: Función que actualiza `latitude`, `longitude` y opcionalmente `address`
- **Criterios de aceptación**:
  - Validación de rangos geográficos (-90 a 90, -180 a 180)
  - Actualización atómica de campos
  - Mantenimiento de `map_url` para compatibilidad
  - Retorno de éxito/error con mensajes descriptivos
- **Estimación**: 1.5 horas

#### 2.4 Extender funciones existentes de propertyService
- **Descripción**: Actualizar `getProperty()`, `createProperty()`, `updateProperty()` para manejar nuevos campos
- **Entradas**: Funciones existentes en `propertyService.ts`
- **Salidas**: Funciones actualizadas que incluyen coordenadas en queries
- **Criterios de aceptación**:
  - Inclusión de `latitude`, `longitude` en selects
  - Inclusión en inserts/updates cuando se proporcionan
  - Compatibilidad con versiones anteriores
- **Estimación**: 1 hora

#### 2.5 Crear validadores para imágenes y coordenadas
- **Descripción**: Implementar funciones de validación en `validationService.ts`
- **Entradas**: Requisitos de validación (FR-3.1, FR-3.2)
- **Salidas**:
  - `validateImageFiles()`: tipo, tamaño, cantidad
  - `validateCoordinates()`: rangos, formato
  - `validatePropertyForm()`: validación completa del formulario
- **Criterios de aceptación**:
  - Validación en frontend (feedback inmediato)
  - Validación en backend (seguridad)
  - Mensajes de error claros y específicos
- **Estimación**: 1.5 horas

### Phase 3: Frontend - Componentes de Imágenes Múltiples

#### 3.1 Crear componente `MultiImageUploader`
- **Descripción**: Componente React para subida y gestión de múltiples imágenes
- **Entradas**: Diseño de interfaz, requisitos FR-1
- **Salidas**: Componente en `src/components/admin/MultiImageUploader.tsx`
- **Criterios de aceptación**:
  - Drag-and-drop para subir múltiples archivos
  - Grid responsivo de miniaturas
  - Indicador visual de imagen principal
  - Botones por imagen: eliminar, marcar como principal
  - Ordenamiento por drag-and-drop
  - Loading states durante subida
  - Validación en tiempo real
- **Estimación**: 3 horas

#### 3.2 Extender componente `MediaUploader` existente
- **Descripción**: Actualizar componente actual para compatibilidad con múltiples imágenes
- **Entradas**: Componente `MediaUploader.tsx` actual
- **Salidas**: Componente actualizado que puede funcionar en modo single/multi
- **Criterios de aceptación**:
  - Prop `mode?: 'single' | 'multiple'`
  - Compatibilidad con uso existente (no breaking changes)
  - Reutilización de lógica de validación y preview
- **Estimación**: 1.5 horas

#### 3.3 Actualizar formulario `AdminProperties.tsx`
- **Descripción**: Reemplazar `MediaUploader` actual por `MultiImageUploader`
- **Entradas**: Componente `AdminProperties.tsx` actual
- **Salidas**: Formulario actualizado que soporta múltiples imágenes
- **Criterios de aceptación**:
  - Estado del formulario maneja array de imágenes
  - Carga de imágenes existentes al editar
  - Guardado batch de nuevas imágenes
  - Eliminación de imágenes marcadas para borrar
  - Actualización de imagen principal
- **Estimación**: 2 horas

#### 3.4 Crear componente `ImageGalleryPreview`
- **Descripción**: Componente para previsualización de galería en modo lectura
- **Entradas**: Diseño de grid responsivo
- **Salidas**: Componente en `src/components/property/ImageGalleryPreview.tsx`
- **Criterios de aceptación**:
  - Grid responsivo (1 col móvil, 2-3 col desktop)
  - Lightbox/modal para ver imagen en tamaño completo
  - Navegación entre imágenes (prev/next)
  - Indicador de imagen principal
  - Lazy loading de imágenes
- **Estimación**: 2 horas

### Phase 4: Frontend - Mapa Interactivo

#### 4.1 Crear componente `PropertyMapPicker`
- **Descripción**: Componente React con mapa interactivo para seleccionar ubicación
- **Entradas**: Integración con Google Maps API o Leaflet
- **Salidas**: Componente en `src/components/admin/PropertyMapPicker.tsx`
- **Criterios de aceptación**:
  - Mapa responsivo que llena contenedor
  - Marcador arrastrable para ajustar ubicación
  - Evento `onLocationChange(lat, lng, address?)`
  - Carga de ubicación existente al editar
  - Controles de zoom y pan
  - Fallback a Leaflet si Google Maps no disponible
- **Estimación**: 3 horas

#### 4.2 Implementar geocodificación inversa
- **Descripción**: Servicio para convertir coordenadas a dirección
- **Entradas**: Google Maps Geocoding API o OpenStreetMap Nominatim
- **Salidas**: Función `reverseGeocode(lat, lng)` en `src/services/geocodingService.ts`
- **Criterios de aceptación**:
  - Retorno de dirección formateada
  - Manejo de errores (API no disponible, límites)
  - Caché de resultados para misma ubicación
  - Opción de usar servicio alternativo
- **Estimación**: 1.5 horas

#### 4.3 Actualizar formulario con mapa interactivo
- **Descripción**: Reemplazar input `map_url` por `PropertyMapPicker`
- **Entradas**: Formulario `AdminProperties.tsx` actual
- **Salidas**: Formulario con mapa interactivo en lugar de input URL
- **Criterios de aceptación**:
  - Campo `map_url` oculto/deprecated pero mantenido en estado
  - Nuevos campos `latitude`, `longitude` en estado del formulario
  - Sincronización automática con campo `address`
  - Validación de coordenadas requeridas
- **Estimación**: 1.5 horas

#### 4.4 Crear componente `PropertyLocationDisplay`
- **Descripción**: Componente para mostrar ubicación en modo lectura (página de detalle)
- **Entradas**: Coordenadas o `map_url` de propiedad
- **Salidas**: Componente en `src/components/property/PropertyLocationDisplay.tsx`
- **Criterios de aceptación**:
  - Mapa estático con marcador en ubicación
  - Fallback a iframe de `map_url` si no hay coordenadas
  - Enlace a Google Maps/OpenStreetMap para direcciones
  - Responsive y accesible
- **Estimación**: 1.5 horas

### Phase 5: Integración y Testing

#### 5.1 Actualizar página de detalle de propiedad
- **Descripción**: Reemplazar galería simple por `ImageGalleryPreview` y mapa por `PropertyLocationDisplay`
- **Entradas**: Página `PropertyDetail.tsx` actual
- **Salidas**: Página actualizada con nuevas funcionalidades
- **Criterios de aceptación**:
  - Galería de múltiples imágenes con lightbox
  - Mapa interactivo/estático según disponibilidad de coordenadas
  - Compatibilidad con propiedades existentes (single image, map_url)
  - Rendimiento aceptable con muchas imágenes
- **Estimación**: 2 horas

#### 5.2 Escribir unit tests para nuevos servicios
- **Descripción**: Tests para funciones en `propertyService.ts` y `validationService.ts`
- **Entradas**: Funciones implementadas en phases 2 y 4
- **Salidas**: Archivos `*.test.ts` con cobertura ≥ 80%
- **Criterios de aceptación**:
  - Tests para casos de éxito y error
  - Mock de Supabase client y APIs externas
  - Validación de pre/post-conditions
  - Tests de integración con base de datos (opcional)
- **Estimación**: 2 horas

#### 5.3 Escribir component tests para nuevos componentes
- **Descripción**: Tests para `MultiImageUploader`, `PropertyMapPicker`, etc.
- **Entradas**: Componentes React implementados
- **Salidas**: Archivos `*.test.tsx` con testing-library
- **Criterios de aceptación**:
  - Tests de renderizado y props
  - Tests de interacción del usuario
  - Tests de eventos y callbacks
  - Tests de estados (loading, error, success)
- **Estimación**: 2.5 horas

#### 5.4 Realizar testing de integración E2E
- **Descripción**: Flujos completos de creación/edición de propiedad
- **Entradas**: Aplicación funcionando localmente
- **Salidas**: Scripts de testing E2E con Cypress/Playwright
- **Criterios de aceptación**:
  - Flujo: crear propiedad con múltiples imágenes y ubicación
  - Flujo: editar propiedad existente
  - Flujo: eliminar imágenes y cambiar ubicación
  - Validación de datos guardados en BD
- **Estimación**: 2 horas

### Phase 6: Optimización y Documentación

#### 6.1 Optimizar rendimiento de imágenes
- **Descripción**: Implementar lazy loading, optimización de tamaño, prefetching
- **Entradas**: Componentes de galería y uploader
- **Salidas**: Mejoras de performance medibles
- **Criterios de aceptación**:
  - Lazy loading de miniaturas fuera de viewport
  - Optimización de imágenes grandes (client-side resizing opcional)
  - Prefetching de siguiente imagen en lightbox
  - Tiempo de carga < 2 segundos para 10 imágenes
- **Estimación**: 1.5 horas

#### 6.2 Mejorar accesibilidad (a11y)
- **Descripción**: Asegurar WCAG 2.1 AA compliance
- **Entradas**: Componentes implementados
- **Salidas**: Mejoras de accesibilidad verificadas
- **Criterios de aceptación**:
  - ARIA labels para todos los controles interactivos
  - Keyboard navigation completa
  - Contraste de colores adecuado
  - Screen reader compatibility
- **Estimación**: 1 hora

#### 6.3 Documentar nuevas funcionalidades
- **Descripción**: Documentación para desarrolladores y usuarios
- **Entradas**: Código implementado, decisiones de diseño
- **Salidas**:
  - JSDoc para todas las funciones públicas
  - README actualizado con nuevas funcionalidades
  - Guía de usuario para admin/agent
  - Changelog/Release notes
- **Criterios de aceptación**: Documentación clara, completa y actualizada
- **Estimación**: 1.5 horas

#### 6.4 Crear migración para datos existentes
- **Descripción**: Script para migrar propiedades existentes al nuevo formato
- **Entradas**: Base de datos con propiedades existentes
- **Salidas**: Script SQL para:
  - Marcar imagen existente como `is_cover: true`
  - Extraer coordenadas de `map_url` si es posible
  - Actualizar relaciones y datos
- **Criterios de aceptación**: Migración reversible, sin pérdida de datos
- **Estimación**: 1 hora

### Phase 7: Despliegue y Monitoreo

#### 7.1 Plan de despliegue gradual
- **Descripción**: Estrategia para desplegar sin interrumpir servicio
- **Entradas**: Ambiente de producción actual
- **Salidas**: Plan con pasos y rollback procedure
- **Criterios de aceptación**:
  - Despliegue en staging primero
  - Feature flags para activar nuevas funcionalidades
  - Monitoreo de errores y performance
  - Rollback plan probado
- **Estimación**: 1 hora

#### 7.2 Configurar monitoreo y alertas
- **Descripción**: Tracking de métricas de éxito definidas
- **Entradas**: Métricas SM-1, SM-2, SM-3
- **Salidas**: Dashboard con métricas clave, alertas configuradas
- **Criterios de aceptación**:
  - Monitoreo de tasa de uso de nuevas funcionalidades
  - Alertas para errores críticos
  - Tracking de performance (tiempos de carga)
  - Reportes semanales de adopción
- **Estimación**: 1 hora

#### 7.3 Realizar pruebas de carga
- **Descripción**: Testing de performance con múltiples usuarios/subidas
- **Entradas**: Ambiente de staging con datos realistas
- **Salidas**: Reporte de performance y bottlenecks identificados
- **Criterios de aceptación**:
  - Sistema soporta 10 usuarios simultáneos subiendo imágenes
  - Tiempos de respuesta aceptables bajo carga
  - Identificación de límites del sistema
  - Recomendaciones de optimización
- **Estimación**: 1.5 horas

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": "wave-1",
      "tasks": ["1.1", "1.2"]
    },
    {
      "id": "wave-2",
      "tasks": ["1.3"],
      "dependsOn": ["1.1"]
    },
    {
      "id": "wave-3",
      "tasks": ["2.1"],
      "dependsOn": ["1.3"]
    },
    {
      "id": "wave-4",
      "tasks": ["2.2", "2.3", "2.4", "2.5"],
      "dependsOn": ["2.1"]
    },
    {
      "id": "wave-5",
      "tasks": ["3.1", "3.2", "4.1", "4.2"],
      "dependsOn": ["2.2", "2.3", "2.5"]
    },
    {
      "id": "wave-6",
      "tasks": ["3.3", "3.4", "4.3", "4.4"],
      "dependsOn": ["3.1", "3.2", "4.1", "4.2"]
    },
    {
      "id": "wave-7",
      "tasks": ["5.1", "5.2", "5.3"],
      "dependsOn": ["3.3", "3.4", "4.3", "4.4"]
    },
    {
      "id": "wave-8",
      "tasks": ["5.4"],
      "dependsOn": ["5.1", "5.2", "5.3"]
    },
    {
      "id": "wave-9",
      "tasks": ["6.1", "6.2", "6.3", "6.4"],
      "dependsOn": ["5.4"]
    },
    {
      "id": "wave-10",
      "tasks": ["7.1", "7.2", "7.3"],
      "dependsOn": ["6.4"]
    }
  ]
}
```

## Notes

### Riesgos y Mitigación

#### R-1: Performance con muchas imágenes
- **Riesgo**: Degradación con propiedades de 20+ imágenes
- **Mitigación**: Lazy loading, paginación, optimización de thumbnails
- **Contingencia**: Límite práctico de 10-15 imágenes, warning al usuario

#### R-2: Dependencia de APIs externas (Google Maps)
- **Riesgo**: API no disponible, límites de rate, costos
- **Mitigación**: Fallback a Leaflet/OpenStreetMap, caching, monitoreo de uso
- **Contingencia**: Modo degradado con input manual de coordenadas

#### R-3: Compatibilidad con datos existentes
- **Riesgo**: Propiedades antiguas no funcionan correctamente
- **Mitigación**: Migración automática, fallbacks, testing exhaustivo
- **Contingencia**: Script de reparación manual, rollback option

#### R-4: Complejidad de UI para usuarios no técnicos
- **Riesgo**: Curva de aprendizaje muy pronunciada
- **Mitigación**: UI intuitiva, tooltips, tutoriales, feedback claro
- **Contingencia**: Modo simple/single-image como alternativa

### Estimación Total

**Total estimado**: 38.75 horas (~5 días laborales)

**Desglose por phase**:
- Phase 1: 2.5 horas
- Phase 2: 6.75 horas
- Phase 3: 9 horas
- Phase 4: 7.5 horas
- Phase 5: 8.5 horas
- Phase 6: 5 horas
- Phase 7: 3.5 horas

**Nota**: Estimaciones asumen desarrollador familiarizado con el codebase. Agregar 20-30% buffer para aprendizaje y problemas inesperados.
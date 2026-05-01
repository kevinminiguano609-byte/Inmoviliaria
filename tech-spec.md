# Tech Spec — LUCERO Plataforma Inmobiliaria

## Dependencias

### Core

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| react | ^19 | Framework UI |
| react-dom | ^19 | Renderizado DOM |
| react-router-dom | ^7 | Routing SPA (Home, Propiedades, Detalle, Blog, Contacto, Admin) |

### Estilos y UI

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| tailwindcss | ^4 | Sistema de utilidades CSS |
| @tailwindcss/vite | ^4 | Plugin Vite para Tailwind |
| lucide-react | ^0.468 | Iconos SVG (usados en todo el sitio: home, building, map-pin, phone, mail, etc.) |

> **Nota sobre shadcn/ui**: Se utilizará como patrón de componentes (estructura, variantes, composition) pero los componentes se implementarán manualmente con Tailwind. No se instala `@shadcn/ui` ni `class-variance-authority` ni `clsx/tailwind-merge`. Esto reduce dependencias y mantiene control total sobre los estilos acordes a la identidad visual del proyecto.

### Animaciones

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| gsap | ^3.12 | Motor de animación — ScrollTrigger para revelaciones con scroll, tweens para contadores y transiciones |

> **¿Por qué GSAP en vez de Framer Motion?**: El diseño requiere ScrollTrigger (revelaciones con stagger, parallax en hero, contadores animados) y GSAP ofrece control más preciso sobre timelines y easing personalizado (cubic-bezier(0.25, 0.1, 0.25, 1)).

### Utilidades

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| typescript | ^5.6 | Tipado estático |
| vite | ^6 | Bundler y dev server |
| @vitejs/plugin-react | ^4 | Plugin React para Vite |
| @types/react | ^19 | Tipos React |
| @types/react-dom | ^19 | Tipos React DOM |

> No se requieren librerías de formularios (React Hook Form) ni gestión de estado externa (Zustand/Redux). Los formularios se manejan con `useState` + validación manual simple. El estado global se gestiona con React Context.

---

## Inventario de Componentes

### Layout (compartidos entre páginas públicas)

| Componente | Fuente | Notas |
|------------|--------|-------|
| Navbar | Custom | Transparente → blanco al scroll (intersection observer con ScrollTrigger). Logo + links + CTA. Drawer mobile. |
| Footer | Custom | 4 columnas, fondo oscuro #1A1A1A. Responsive: 4→2→1 columnas. |
| WhatsAppButton | Custom | Botón flotante fixed. Animación de entrada (GSAP) + pulso idle CSS. |
| PageLayout | Custom | Wrapper que incluye Navbar + Footer + WhatsAppButton. Recibe children. |
| AdminLayout | Custom | Sidebar fijo 260px + topbar + área de contenido. Solo para rutas /admin/*. |

### Secciones (página Home)

| Componente | Fuente | Notas |
|------------|--------|-------|
| HeroSection | Custom | 100vh, imagen fondo con overlay gradiente. Parallax GSAP ScrollTrigger. Barra de búsqueda con 5 campos. |
| FeaturedPropertiesSection | Custom | Header + grid 3 columnas. Usa PropertyCard. ScrollTrigger reveal con stagger. |
| BenefitsSection | Custom | 3 columnas con iconos + texto. Fondo #F5F5F5. Separadores verticales desktop. |
| StatsSection | Custom | 4 estadísticas sobre fondo #333333. Contadores animados GSAP (count from 0). |
| TestimonialsSection | Custom | Carrusel touch/swipe con 3 testimoniales. Indicadores de puntos. Cambio auto 6s. |
| CTASection | Custom | Fondo rojo #E53935, contenido centrado. ScrollTrigger reveal. |
| ContactSection | Custom | 2 columnas: info de contacto (izq) + formulario (der). Form con validación manual. |

### Secciones (página Propiedades)

| Componente | Fuente | Notas |
|------------|--------|-------|
| PageHeader | Custom | Reusable — breadcrumbs + H1 + descripción. Usado en Propiedades, Blog, Contacto. |
| PropertyFilters | Custom | Barra de filtros con 5 selects/inputs. Filtros en tiempo real. Botón "Limpiar" condicional. |
| PropertyResultsHeader | Custom | Contador de resultados + select de ordenamiento. |
| PropertyGrid | Custom | Grid 3 columnas. Fade transition al cambiar filtros. |

### Secciones (página Detalle de Propiedad)

| Componente | Fuente | Notas |
|------------|--------|-------|
| PropertyBreadcrumbs | Custom | Breadcrumbs con nombre de propiedad no-clickable. |
| PropertyHeader | Custom | Título + precio + badges en fila. |
| PropertyGallery | Custom | Imagen principal 16:9 + 4 miniaturas. Click abre Lightbox. |
| Lightbox | Custom | Overlay + imagen centrada + navegación flechas + contador. Escape para cerrar. |
| PropertyInfo | Custom | 2 columnas: descripción + características + amenities + mapa (izq, 66%), sidebar sticky (der, 34%). |
| ContactModal | Custom | Modal con formulario de contacto por propiedad específica. Reusable desde sidebar. |
| SimilarProperties | Custom | Grid 3 columnas de propiedades similares al final. |

### Secciones (página Blog)

| Componente | Fuente | Notas |
|------------|--------|-------|
| FeaturedArticle | Custom | Layout 2 columnas: imagen grande + contenido. Primer artículo destacado. |
| CategoryFilters | Custom | Fila de botones/badge para filtrar por categoría. Estado activo/inactivo. |
| BlogGrid | Custom | Grid 3 columnas de BlogCard. ScrollTrigger reveal con stagger. |

### Secciones (página Contacto)

| Componente | Fuente | Notas |
|------------|--------|-------|
| ContactInfo | Custom | Columna izq: canales de contacto con iconos + redes sociales. |
| ContactForm | Custom | Columna der: formulario con validación, checkbox de privacidad, mensaje de éxito/error. |
| ContactMap | Custom | Google Maps iframe embed, ancho completo, 450px alto. |

### Secciones (Admin — Login)

| Componente | Fuente | Notas |
|------------|--------|-------|
| LoginPage | Custom | Centrado en pantalla, tarjeta con logo + formulario. Credenciales hardcodeadas. |

### Secciones (Admin — Dashboard)

| Componente | Fuente | Notas |
|------------|--------|-------|
| DashboardStats | Custom | 4 tarjetas de estadísticas con icono + valor + tendencia. |
| LeadsChart | Custom | Gráfico de barras CSS puro (6 meses de leads). Sin librería de charts. |
| RecentLeadsTable | Custom | Tabla de 5 leads recientes con estado colorido. Link a página completa. |

### Secciones (Admin — Propiedades)

| Componente | Fuente | Notas |
|------------|--------|-------|
| PropertyToolbar | Custom | Búsqueda + filtros por estado/tipo. |
| PropertyTable | Custom | Tabla con thumbnail, datos, badges de estado, acciones (ver/editar/eliminar). |
| PropertyFormModal | Custom | Modal ancho (800px) con formulario de 2 columnas + subida de imágenes drag-drop. |
| DeleteConfirmModal | Custom | Modal de confirmación reusable. |

### Secciones (Admin — Leads)

| Componente | Fuente | Notas |
|------------|--------|-------|
| LeadsToolbar | Custom | Búsqueda + filtros por estado/fecha + botón exportar CSV. |
| LeadsTable | Custom | Tabla completa con más columnas que RecentLeadsTable. |
| LeadDetailModal | Custom | Modal con información completa del lead + cambio de estado. |

### Secciones (Admin — Blog)

| Componente | Fuente | Notas |
|------------|--------|-------|
| BlogToolbar | Custom | Búsqueda + filtro por categoría. |
| BlogTable | Custom | Tabla de artículos con estado Publicado/Borrador. |
| ArticleFormModal | Custom | Modal con editor WYSIWYG simple (textarea con toolbar de formatting básico). |

### Secciones (Admin — Configuración)

| Componente | Fuente | Notas |
|------------|--------|-------|
| SettingsTabs | Custom | Tabs horizontales: General | Contacto | Redes sociales | Usuarios. |
| SettingsForm | Custom | Formulario por tab con inputs correspondientes. Botón guardar fijado al pie. |

### Componentes Reutilizables

| Componente | Fuente | Usado en |
|------------|--------|----------|
| PropertyCard | Custom | Home, Propiedades, Detalle (similares) — imagen, badge, precio, título, ubicación, metadatos. Hover translateY + shadow. |
| BlogCard | Custom | Blog — imagen, categoría badge, título, extracto, fecha. Hover shadow. |
| Button | Custom | Todo el sitio — 3 variantes (Primary/Secondary/Ghost) con props `variant`, `size`, `icon`. |
| Input | Custom | Formularios — estilo consistente con focus ring rojo, estado error. |
| Select | Custom | Filtros y formularios — dropdown custom o nativo estilizado. |
| Textarea | Custom | Formularios de contacto y blog. |
| Badge | Custom | Estados, categorías, tags — fondo/texto configurables por props. |
| Modal | Custom | Contacto en propiedad, formularios admin, confirmaciones — overlay + contenedor centrado. |
| Toast | Custom | Notificaciones de éxito/error — posición fixed inferior derecha, auto-dismiss 4s. |
| Pagination | Custom | Propiedades, Blog — botones numéricos + flechas. |
| ScrollReveal | Custom | Wrapper reusable — aplica fade-in + translateY con ScrollTrigger + stagger. |
| ImageUpload | Custom | Admin (propiedades + blog) — área drag-drop + preview con botón eliminar. |
| DataTable | Custom | Admin (propiedades, leads, blog) — tabla con header, filas, checkbox, acciones, hover. |

---

## Tabla de Animaciones

| Animación | Librería | Enfoque de Implementación | Complejidad |
|-----------|----------|---------------------------|-------------|
| Revelación con scroll (fade-in + translateY) | GSAP + ScrollTrigger | Hook `useScrollReveal` que crea un ScrollTrigger con `toggleActions: "play none none none"`. Los elementos hijos reciben stagger 0.15s. Umbral 0.2. Reusable via componente `ScrollReveal`. | Media |
| Parallax en Hero | GSAP + ScrollTrigger | ScrollTrigger sobre la imagen de fondo con `scrub: true`, aplicando `yPercent` a 0.5x velocidad del scroll. | Baja |
| Contador de estadísticas | GSAP | `gsap.to()` con `snap` en la propiedad de texto, `duration: 2`, `ease: "power2.out"`. Trigger vía ScrollTrigger `onEnter`. | Baja |
| Hover en tarjetas de propiedad | CSS | `transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)`. Hover: `translateY(-4px)` + sombra aumentada. Imagen interna: `scale(1.05)` con `overflow: hidden`. | Baja |
| Hover en botones | CSS | `transition: 0.3s ease`. Hover: `scale(1.02)` + cambio de fondo. Active: `scale(0.98)`. | Baja |
| Transición de página | CSS + React Router | Clase CSS con `animation` de fade-in en el componente de layout. Transición suave entre rutas. | Baja |
| Carrusel de testimoniales | Custom JS | Estado `activeIndex` + setInterval 6s. Transición CSS `opacity` 0.3s/0.4s entre slides. Touch events para swipe (onTouchStart/onTouchEnd calculando deltaX). Indicadores clickeables. | Media |
| Entrada del botón WhatsApp | GSAP | Timeline con `delay: 2`, animando `x: 100 → 0` + `opacity: 0 → 1`, 0.5s, easing personalizado. | Baja |
| Pulso idle del botón WhatsApp | CSS | `@keyframes` de box-shadow expandiéndose y contrayéndose, 2s infinite. | Baja |
| Navbar transparente → blanco | CSS + ScrollTrigger | ScrollTrigger con `onUpdate` leyendo scroll → clase condicional. Transición CSS `0.3s ease` en background y color. | Baja |
| Lightbox abrir/cerrar | CSS | Overlay: fade-in 0.3s. Imagen: `scale(0.9 → 1)` 0.4s con easing personalizado. Cierre con Escape vía `useEffect` + keydown listener. | Baja |
| Toast entrada/salida | CSS | Slide-in desde abajo + fade-in 0.4s. Auto-dismiss con `setTimeout` 4s. Salida: slide-out + fade-out 0.3s. | Baja |
| Actualización de filtros (fade) | CSS | Al cambiar filtros: grid actual `opacity: 0` (0.2s), nuevo contenido `opacity: 0 → 1` + `translateY` (0.4s). Controlado por estado `isFiltering`. | Baja |
| Loader/esqueleto | CSS | `@keyframes` shimmer horizontal con gradiente lineal sobre fondo #F5F5F5, 1.5s infinite. Rectángulos con border-radius 8px. | Baja |
| Revelación del contenido Hero al cargar | GSAP | Timeline secuencial: título (0s) → subtítulo (0.3s) → barra de búsqueda (0.6s). Cada uno: fade-in + translateY(30px → 0), 0.8s. | Baja |
| Scroll indicator (rebote) | CSS | `@keyframes` de translateY hacia abajo y vuelta, 2s infinite. Icono chevron-down. | Baja |
| Modal entrada/salida | CSS | Entrada: overlay fade-in 0.3s + contenedor `scale(0.95 → 1)` 0.3s cubic-bezier(0.25, 0.1, 0.25, 1). Salida: fade-out 0.2s. | Baja |

---

## Estado y Lógica

### Arquitectura de Estado

El proyecto usa **React Context** para estado global compartido. No se requiere Zustand ni Redux dado el alcance del proyecto.

**Contextos definidos**:

| Contexto | Datos | Responsabilidad |
|----------|-------|-----------------|
| `AuthContext` | `isAuthenticated`, `user`, `login()`, `logout()` | Autenticación del panel admin. Login con credenciales hardcodeadas (admin@lucero.com / admin123). Almacena estado en localStorage para persistencia de sesión. |
| `PropertyContext` | `properties[]`, `filters`, `sortBy`, `addProperty()`, `updateProperty()`, `deleteProperty()` | Gestión del catálogo de propiedades. Datos mock como JSON. Filtros aplicados en tiempo real sobre el array. |
| `LeadContext` | `leads[]`, `addLead()`, `updateLeadStatus()` | Gestión de leads/contactos recibidos. Los formularios de contacto (Home, Contacto, Detalle de propiedad) agregan leads a este contexto. |
| `BlogContext` | `articles[]`, `addArticle()`, `updateArticle()`, `deleteArticle()` | Gestión de artículos del blog. Mock inicial con 9 artículos. |
| `ToastContext` | `toasts[]`, `showToast()`, `removeToast()` | Sistema de notificaciones global. Cualquier componente puede disparar un toast. |

### Lógica de Filtros (Página Propiedades)

- Filtros aplicados en tiempo real sobre `properties[]` vía `useMemo`.
- Campos: operación (venta/alquiler), tipo, ubicación (string includes), precio min/max (rango numérico).
- Ordenamiento: recientes, precio asc/desc, más vistos.
- El contador de resultados se actualiza dinámicamente.
- Botón "Limpiar" aparece condicionalmente (solo si hay filtros activos).

### Lógica de Routing

```
/                          → Home
/propiedades               → Propiedades (listado)
/propiedades/:slug         → Detalle de Propiedad
/blog                      → Blog (listado)
/contacto                  → Contacto
/admin                     → Login (si no auth) o Dashboard (si auth)
/admin/propiedades         → Gestión de Propiedades
/admin/leads               → Gestión de Leads
/admin/blog                → Gestión de Blog
/admin/configuracion       → Configuración
```

- `ProtectedRoute` wrapper para rutas `/admin/*` (excepto `/admin` que es login): redirige a `/admin` si no está autenticado.
- El slug de propiedad se resuelve buscando en el array de propiedades por slug.

### Lógica de Formularios

- Validación manual con `useState` y funciones de validación inline.
- Reglas: campos required, email con regex básico, teléfono opcional.
- Estado del formulario: `idle` → `submitting` → `success` / `error`.
- Al enviar un formulario de contacto: se crea un lead en `LeadContext` + toast de éxito.

### Lógica del Carrusel de Testimoniales

- Estado: `activeIndex` (0-2).
- Auto-advance: `setInterval` cada 6s, reseteado al interactuar manualmente.
- Swipe touch: capturar `touchStartX` y `touchEndX`, calcular delta > 50px para cambiar slide.
- Transición: CSS `opacity` con `transition` de 0.3s/0.4s.

### Persistencia de Datos

- Todo el estado se mantiene en memoria (React Context). No hay backend ni localStorage para datos de negocio (propiedades, leads, artículos).
- **Excepción**: `AuthContext` persente `isAuthenticated` en `localStorage` para mantener la sesión del admin al recargar.
- Los leads generados por formularios se agregan al contexto pero se pierden al recargar la página (aceptable para demo).

---

## Otras Decisiones Clave

### Google Maps

Se usa **iframe embed de Google Maps** en lugar de la API de Google Maps JavaScript. Esto elimina la necesidad de API key y reduce dependencias. El iframe se carga con `loading="lazy"` y la dirección codificada en la URL.

```html
<iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284...."
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
></iframe>
```

### Imágenes

Las imágenes del sitio (propiedades, blog, avatares, hero) se generan vía IA en el pipeline de assets. Se almacenan en `/public/assets/` con nombres descriptivos. En el código se importan como módulos estáticos o se referencian por ruta.

### Gráfico de Leads (Admin Dashboard)

El gráfico de "Leads por mes" se implementa con **barras CSS puras** (divs con `height` proporcional al valor y `transition`). No se instala ninguna librería de charts. Esto es suficiente para un gráfico simple de 6 barras.

### Editor WYSIWYG del Blog

El editor de artículos del blog es un **textarea con toolbar de formatting básico** (bold, italic, headings, lists, links). Al hacer clic en los botones del toolbar se insertan las etiquetas HTML correspondientes en el textarea. No se usa ninguna librería de rich text.

### Exportar Leads a CSV

Función pura de JavaScript que convierte el array de leads a formato CSV y descarga via `Blob` + `URL.createObjectURL` + link temporal. Sin dependencias.

### Imagen de Perfil del Agente

La imagen del agente en el sidebar de la propiedad se genera vía IA (misma pipeline que las demás imágenes). Se almacena como asset estático.

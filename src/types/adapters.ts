/**
 * Type Adapters — Supabase ↔ Frontend
 *
 * Las páginas públicas (PropertyDetail, Properties, Home, Blog, BlogPost)
 * usan los tipos legacy de src/types/index.ts (Property, Article, Testimonial, Lead).
 * Los contextos ahora devuelven tipos de Supabase (PropertyRow, BlogArticleRow, etc.).
 *
 * Estos adaptadores convierten de Supabase → Frontend sin tocar ninguna página.
 *
 * Campos mapeados:
 *
 * PropertyRow → Property
 *   covered_area  → coveredArea
 *   map_url       → mapUrl
 *   badge_color   → badgeColor
 *   created_at    → createdAt
 *   agent_id      → agent (objeto con defaults)
 *   images[]      → image (cover) + gallery[]
 *   amenities[]   → amenities (string[])
 *   (no image/gallery en PropertyRow — vienen de property_images)
 *
 * BlogArticleRow → Article
 *   read_time     → readTime
 *   author_name   → author
 *   display_date  → date
 *   published_at  → date (fallback)
 *
 * TestimonialRow → Testimonial
 *   avatar_url    → avatar
 *
 * LeadRow → Lead
 *   property_title → propertyTitle
 *   property_id    → propertyId
 *   created_at     → date
 */

import type { Property, Article, Testimonial, Lead } from '@/types/index';
import type {
  PropertyRow,
  PropertyImageRow,
  BlogArticleRow,
  TestimonialRow,
  LeadRow,
} from '@/types/supabase';

// ─── Property ────────────────────────────────────────────────

export function propertyRowToProperty(
  row: PropertyRow,
  images: PropertyImageRow[] = [],
  amenityNames: string[] = [],
  agentData?: { full_name: string; phone: string | null; avatar_url: string | null } | null
): Property {
  const coverImage = images.find(i => i.is_cover)?.url ?? images[0]?.url ?? '';
  // Fallback for legacy image_url field if url missing (using any cast for compatibility)
  const cover = coverImage ?? (images.find(i => i.is_cover) as any)?.image_url ?? (images[0] as any)?.image_url ?? '';

  const gallery = images
    .filter(i => !i.is_cover)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(i => i.url ?? (i as any).image_url);

  return {
    id:          row.id,
    slug:        row.slug,
    title:       row.title,
    location:    row.location,
    address:     row.address ?? '',
    price:       row.price,
    currency:    row.currency,
    operation:   row.operation,
    type:        row.type,
    badge:       row.badge ?? undefined,
    badgeColor:  row.badge_color ?? undefined,
    image:       cover,
    bedrooms:    row.bedrooms ?? undefined,
    bathrooms:   row.bathrooms ?? undefined,
    area:        row.area ?? 0,
    coveredArea: row.covered_area ?? undefined,
    rooms:       row.rooms ?? undefined,
    parking:     row.parking ?? undefined,
    age:         row.age ?? undefined,
    orientation: row.orientation ?? undefined,
    expenses:    row.expenses ?? undefined,
    disposition: row.disposition ?? undefined,
    description: row.description ?? '',
    amenities:   amenityNames,
    gallery,
    agent: {
      name:   agentData?.full_name ?? 'Agente Infinity',
      role:   'Agente inmobiliario',
      phone:  agentData?.phone ?? '+593 990 332 764',
      avatar: agentData?.avatar_url ?? '/assets/agent-avatar.jpg',
    },
    mapUrl:    row.map_url ?? '',
    createdAt: row.created_at,
  };
}

/** Convierte un PropertyRow simple (sin imágenes/amenities cargadas) */
export function propertyRowToPropertySimple(row: PropertyRow): Property {
  return propertyRowToProperty(row, [], [], null);
}

// ─── Article ─────────────────────────────────────────────────

export function articleRowToArticle(row: BlogArticleRow): Article {
  // Formatear fecha de display
  let displayDate = row.display_date ?? '';
  if (!displayDate && row.published_at) {
    displayDate = new Date(row.published_at).toLocaleDateString('es-AR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }
  if (!displayDate) {
    displayDate = new Date(row.created_at).toLocaleDateString('es-AR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  return {
    id:       row.id,
    slug:     row.slug,
    title:    row.title,
    category: row.category ?? 'General',
    excerpt:  row.excerpt ?? '',
    content:  row.content ?? '',
    image:    row.image ?? '/assets/blog-featured.jpg',
    author:   row.author_name ?? 'Admin',
    date:     displayDate,
    readTime: row.read_time ?? '5 min de lectura',
    status:   row.status,
  };
}

// ─── Testimonial ─────────────────────────────────────────────

export function testimonialRowToTestimonial(row: TestimonialRow): Testimonial {
  return {
    id:     row.id,
    name:   row.name,
    role:   row.role ?? '',
    quote:  row.quote,
    avatar: row.avatar_url ?? '/assets/agent-avatar.jpg',
  };
}

// ─── Lead ────────────────────────────────────────────────────

export function leadRowToLead(row: LeadRow): Lead {
  const date = new Date(row.created_at).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return {
    id:            row.id,
    name:          row.name,
    email:         row.email,
    phone:         row.phone ?? '',
    subject:       row.subject ?? '',
    message:       row.message ?? '',
    propertyId:    row.property_id ?? undefined,
    propertyTitle: row.property_title ?? undefined,
    date,
    status:        row.status,
  };
}

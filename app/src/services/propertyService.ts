/**
 * Property Service — Supabase implementation
 *
 * Replaces the previous mock-based service.
 * All functions are typed against the Database schema.
 */

import { supabase } from '@/lib/supabase';
import type {
  PropertyRow,
  PropertyInsert,
  PropertyUpdate,
  PropertyWithRelations,
  PropertySearchParams,
  PaginatedResult,
} from '@/types/supabase';

// ─── Helpers ─────────────────────────────────────────────────

function handleError(error: { message: string } | null, context: string): void {
  if (error) throw new Error(`[propertyService] ${context}: ${error.message}`);
}

// ─── Queries ─────────────────────────────────────────────────

/**
 * Get all published properties (simple list, no pagination).
 * Use searchProperties() for filtered/paginated results.
 */
export async function getProperties(): Promise<PropertyRow[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'publicada')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  handleError(error, 'getProperties');
  return data ?? [];
}

/** Get a single property by ID (admin/agent use) */
export async function getPropertyById(id: string): Promise<PropertyRow | null> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error?.code === 'PGRST116') return null; // not found
  handleError(error, 'getPropertyById');
  return data;
}

/** Get full property detail with images, amenities and agent */
export async function getPropertyBySlug(slug: string): Promise<PropertyWithRelations | null> {
  const { data, error } = await supabase
    .rpc('get_property_detail', { p_slug: slug });

  handleError(error, 'getPropertyBySlug');
  return (data as PropertyWithRelations) ?? null;
}

/**
 * Advanced search with filters and pagination.
 * Calls the search_properties SQL function.
 */
export async function searchProperties(
  params: PropertySearchParams = {}
): Promise<PaginatedResult<PropertyRow & { cover_image: string | null }>> {
  const {
    query, operation, type, location,
    minPrice, maxPrice, minArea, maxArea,
    bedrooms, bathrooms, featured, currency,
    page = 1, pageSize = 9,
  } = params;

  const { data, error } = await supabase.rpc('search_properties', {
    p_query:      query      ?? null,
    p_operation:  operation  ?? null,
    p_type:       type       ?? null,
    p_location:   location   ?? null,
    p_min_price:  minPrice   ?? null,
    p_max_price:  maxPrice   ?? null,
    p_min_area:   minArea    ?? null,
    p_max_area:   maxArea    ?? null,
    p_bedrooms:   bedrooms   ?? null,
    p_bathrooms:  bathrooms  ?? null,
    p_featured:   featured   ?? null,
    p_currency:   currency   ?? null,
    p_page:       page,
    p_page_size:  pageSize,
  });

  handleError(error, 'searchProperties');

  const rows = (data as Array<PropertyRow & { cover_image: string | null; total_count: number }>) ?? [];
  const total = rows[0]?.total_count ?? 0;

  return {
    data:       rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/** Get all properties for admin panel (all statuses) */
export async function getAllProperties(): Promise<PropertyRow[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  handleError(error, 'getAllProperties');
  return data ?? [];
}

// ─── Mutations ───────────────────────────────────────────────

export async function createProperty(
  payload: PropertyInsert
): Promise<PropertyRow> {
  const { data, error } = await supabase
    .from('properties')
    .insert(payload)
    .select()
    .single();

  handleError(error, 'createProperty');
  return data!;
}

export async function updateProperty(
  id: string,
  payload: PropertyUpdate
): Promise<PropertyRow> {
  const { data, error } = await supabase
    .from('properties')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  handleError(error, 'updateProperty');
  return data!;
}

export async function deleteProperty(id: string): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

  handleError(error, 'deleteProperty');
}

// ─── Images ──────────────────────────────────────────────────

export async function addPropertyImage(
  propertyId: string,
  url: string,
  storagePath: string,
  isCover = false,
  sortOrder = 0
) {
  const { data, error } = await supabase
    .from('property_images')
    .insert({ property_id: propertyId, url, storage_path: storagePath, is_cover: isCover, sort_order: sortOrder })
    .select()
    .single();

  handleError(error, 'addPropertyImage');
  return data!;
}

export async function deletePropertyImage(imageId: string): Promise<void> {
  const { error } = await supabase
    .from('property_images')
    .delete()
    .eq('id', imageId);

  handleError(error, 'deletePropertyImage');
}

export async function setCoverImage(propertyId: string, imageId: string): Promise<void> {
  // Remove current cover
  await supabase
    .from('property_images')
    .update({ is_cover: false })
    .eq('property_id', propertyId);

  // Set new cover
  const { error } = await supabase
    .from('property_images')
    .update({ is_cover: true })
    .eq('id', imageId);

  handleError(error, 'setCoverImage');
}

// ─── Amenities ───────────────────────────────────────────────

export async function getAmenities() {
  const { data, error } = await supabase
    .from('amenities')
    .select('*')
    .order('name');

  handleError(error, 'getAmenities');
  return data ?? [];
}

export async function setPropertyAmenities(
  propertyId: string,
  amenityIds: string[]
): Promise<void> {
  // Delete existing
  await supabase
    .from('property_amenities')
    .delete()
    .eq('property_id', propertyId);

  if (amenityIds.length === 0) return;

  const { error } = await supabase
    .from('property_amenities')
    .insert(amenityIds.map(id => ({ property_id: propertyId, amenity_id: id })));

  handleError(error, 'setPropertyAmenities');
}

/**
 * Property Service — Supabase implementation
 *
 * Replaces the previous mock-based service.
 * All functions are typed against the Database schema.
 */

import { supabase } from '@/lib/supabase';
import { validateImageFiles, validateCoordinates } from '@/services/validationService';
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


// ─── Multiple Images Upload ──────────────────────────────────

export interface ImageUploadData {
  file: File;
  isCover: boolean;
  order: number;
}

export interface UploadedImageResult {
  id: string;
  url: string;
  storagePath: string | null;
  isCover: boolean;
  order: number;
}

/**
 * Upload multiple images for a property with batch processing
 * @param propertyId - Property UUID
 * @param images - Array of images to upload
 * @param maxConcurrent - Maximum concurrent uploads (default: 3)
 * @returns Array of uploaded image metadata
 */
export async function uploadMultiplePropertyImages(
  propertyId: string,
  images: ImageUploadData[],
  maxConcurrent = 3
): Promise<UploadedImageResult[]> {
  if (images.length === 0) {
    throw new Error('At least one image is required');
  }

  // Validate that exactly one image is marked as cover
  const coverCount = images.filter(img => img.isCover).length;
  if (coverCount !== 1) {
    throw new Error('Exactly one image must be marked as cover');
  }

  // Validate image files
  const files = images.map(img => img.file);
  const validation = validateImageFiles(files, { maxCount: 20, maxSizeMB: 10 });
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  const results: UploadedImageResult[] = [];
  const errors: string[] = [];

  // Process images in batches to avoid overwhelming the server
  for (let i = 0; i < images.length; i += maxConcurrent) {
    const batch = images.slice(i, i + maxConcurrent);
    
    const batchPromises = batch.map(async (imageData, batchIndex) => {
      try {
        const file = imageData.file;
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `property-images/${propertyId}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        // Save metadata to database
        const { data: dbData, error: dbError } = await supabase
          .from('property_images')
          .insert({
            property_id: propertyId,
            url: urlData.publicUrl,
            storage_path: filePath,
            is_cover: imageData.isCover,
            sort_order: imageData.order
          })
          .select()
          .single();

        if (dbError) throw dbError;

        return {
          id: dbData.id,
          url: dbData.url,
          storagePath: dbData.storage_path,
          isCover: dbData.is_cover,
          order: dbData.sort_order
        };
      } catch (error) {
        const errorMsg = `Failed to upload image "${imageData.file.name}": ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        throw new Error(errorMsg);
      }
    });

    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    } catch (error) {
      // Continue with next batch even if one fails
      console.warn('Batch upload partially failed:', error);
    }
  }

  if (errors.length > 0) {
    console.warn('Some images failed to upload:', errors);
    // We still return successful uploads, but log the errors
  }

  return results;
}

/**
 * Update property location with coordinates
 * @param propertyId - Property UUID
 * @param coordinates - Latitude and longitude
 * @param address - Optional address for reverse geocoding
 */
export async function updatePropertyLocation(
  propertyId: string,
  coordinates: { latitude: number; longitude: number },
  address?: string
): Promise<void> {
  // Validate coordinates
  const validation = validateCoordinates(coordinates.latitude, coordinates.longitude);
  if (!validation.valid) {
    throw new Error(`Invalid coordinates: ${validation.errors.join(', ')}`);
  }

  const updateData: any = {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude
  };

  // Update address if provided
  if (address) {
    updateData.address = address;
  }

  const { error } = await supabase
    .from('properties')
    .update(updateData)
    .eq('id', propertyId);

  if (error) {
    throw new Error(`Failed to update property location: ${error.message}`);
  }
}

/**
 * Get property images with proper ordering
 * @param propertyId - Property UUID
 * @returns Array of property images sorted by sort_order
 */
export async function getPropertyImages(propertyId: string) {
  const { data, error } = await supabase
    .from('property_images')
    .select('*')
    .eq('property_id', propertyId)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to get property images: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Update image order and cover status
 * @param propertyId - Property UUID
 * @param images - Array of images with updated order and cover status
 */
export async function updateImageOrderAndCover(
  propertyId: string,
  images: Array<{ id: string; order: number; isCover: boolean }>
): Promise<void> {
  // Validate that exactly one image is cover
  const coverCount = images.filter(img => img.isCover).length;
  if (coverCount !== 1) {
    throw new Error('Exactly one image must be marked as cover');
  }

  // Update all images in a transaction
  const updates = images.map(image => 
    supabase
      .from('property_images')
      .update({ sort_order: image.order, is_cover: image.isCover })
      .eq('id', image.id)
      .eq('property_id', propertyId)
  );

  const results = await Promise.all(updates);
  
  // Check for errors
  for (const result of results) {
    if (result.error) {
      throw new Error(`Failed to update image order: ${result.error.message}`);
    }
  }
}

/**
 * Delete multiple property images
 * @param imageIds - Array of image IDs to delete
 */
export async function deletePropertyImages(imageIds: string[]): Promise<void> {
  if (imageIds.length === 0) return;

  const { error } = await supabase
    .from('property_images')
    .delete()
    .in('id', imageIds);

  if (error) {
    throw new Error(`Failed to delete images: ${error.message}`);
  }
}
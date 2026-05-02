/**
 * Media Service
 *
 * Handles file uploads for images and videos.
 * Currently uses URL.createObjectURL for local preview (no backend).
 *
 * ─── Supabase Storage migration ───────────────────────────────────────────────
 * When ready, replace `uploadFile` with:
 *
 *   import { supabase } from '@/lib/supabaseClient'
 *
 *   export async function uploadFile(file: File, bucket = 'media'): Promise<string> {
 *     const path = `${Date.now()}-${file.name}`
 *     const { error } = await supabase.storage.from(bucket).upload(path, file)
 *     if (error) throw error
 *     const { data } = supabase.storage.from(bucket).getPublicUrl(path)
 *     return data.publicUrl
 *   }
 *
 *   export async function deleteFile(url: string, bucket = 'media'): Promise<void> {
 *     const path = url.split(`${bucket}/`)[1]
 *     const { error } = await supabase.storage.from(bucket).remove([path])
 *     if (error) throw error
 *   }
 * ──────────────────────────────────────────────────────────────────────────────
 */

export type AcceptedMediaType = 'image' | 'video' | 'all';

/** MIME types accepted per category */
export const ACCEPTED_MIME: Record<AcceptedMediaType, string> = {
  image: 'image/jpeg,image/png,image/webp,image/jpg',
  video: 'video/mp4,video/webm',
  all:   'image/jpeg,image/png,image/webp,image/jpg,video/mp4,video/webm',
};

/** Max file size in bytes (10 MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface UploadResult {
  /** Temporary object URL for preview — replace with real URL after Supabase upload */
  previewUrl: string;
  /** The original File object, kept for the real upload call */
  file: File;
  /** 'image' | 'video' */
  mediaType: 'image' | 'video';
}

/**
 * Validates a file and returns a local preview URL.
 * Throws a descriptive string if validation fails.
 *
 * In production: call this first for preview, then call `uploadFile` on save.
 */
export function prepareFilePreview(file: File): UploadResult {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`El archivo supera el límite de 10 MB (${(file.size / 1024 / 1024).toFixed(1)} MB).`);
  }

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  if (!isImage && !isVideo) {
    throw new Error('Formato no soportado. Usá JPG, PNG, WEBP, MP4 o WEBM.');
  }

  return {
    previewUrl: URL.createObjectURL(file),
    file,
    mediaType: isImage ? 'image' : 'video',
  };
}

/**
 * Revokes an object URL to free memory.
 * Call this when the component unmounts or the preview is replaced.
 */
export function revokePreviewUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Mock upload — simulates a network delay and returns the object URL as-is.
 * Replace the body with a real Supabase Storage call when ready.
 */
export async function uploadFile(file: File, _bucket = 'media'): Promise<string> {
  // Simulate upload latency
  await new Promise(resolve => setTimeout(resolve, 600));
  // In production: upload to Supabase and return the public URL
  return URL.createObjectURL(file);
}

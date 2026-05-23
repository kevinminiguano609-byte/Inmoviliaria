/**
 * Media Service — Supabase Storage implementation
 *
 * Handles file uploads to Supabase Storage buckets.
 * Files are organized as: {bucket}/{userId}/{timestamp}-{filename}
 */

import { supabase } from '@/lib/supabase';

export type StorageBucket = 'property-images' | 'blog-images' | 'avatars' | 'branding';
export type AcceptedMediaType = 'image' | 'video' | 'all';

export const ACCEPTED_MIME: Record<AcceptedMediaType, string> = {
  image: 'image/jpeg,image/png,image/webp,image/jpg',
  video: 'video/mp4,video/webm',
  all:   'image/jpeg,image/png,image/webp,image/jpg,video/mp4,video/webm',
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export interface UploadResult {
  url:         string;
  storagePath: string;
  previewUrl:  string;
}

// ─── Validation ──────────────────────────────────────────────

export function validateFile(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `El archivo supera el límite de 10 MB (${(file.size / 1024 / 1024).toFixed(1)} MB).`
    );
  }
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  if (!isImage && !isVideo) {
    throw new Error('Formato no soportado. Usá JPG, PNG, WEBP, MP4 o WEBM.');
  }
}

/** Returns a temporary local preview URL (free with URL.revokeObjectURL) */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokePreviewUrl(url: string): void {
  if (url.startsWith('blob:')) URL.revokeObjectURL(url);
}

// ─── Upload ──────────────────────────────────────────────────

/**
 * Upload a file to Supabase Storage.
 * Returns the public URL and the storage path (needed for deletion).
 */
export async function uploadFile(
  file: File,
  bucket: StorageBucket = 'property-images',
  folder?: string
): Promise<UploadResult> {
  validateFile(file);

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id ?? 'anonymous';
  const prefix = folder ?? userId;
  const ext    = file.name.split('.').pop() ?? 'jpg';
  const path   = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    url:         urlData.publicUrl,
    storagePath: path,
    previewUrl:  urlData.publicUrl,
  };
}

/**
 * Delete a file from Supabase Storage by its storage path.
 */
export async function deleteFile(
  storagePath: string,
  bucket: StorageBucket = 'property-images'
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([storagePath]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

/**
 * Upload multiple files and return all results.
 * Failures are collected and thrown as a single error at the end.
 */
export async function uploadMultiple(
  files: File[],
  bucket: StorageBucket = 'property-images',
  folder?: string
): Promise<UploadResult[]> {
  const results = await Promise.allSettled(
    files.map(f => uploadFile(f, bucket, folder))
  );

  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map(r => r.reason as Error);

  if (errors.length > 0) {
    throw new Error(errors.map(e => e.message).join('; '));
  }

  return results
    .filter((r): r is PromiseFulfilledResult<UploadResult> => r.status === 'fulfilled')
    .map(r => r.value);
}

// ─── Legacy compat (used by existing components) ─────────────
/** @deprecated Use uploadFile() instead */
export function prepareFilePreview(file: File) {
  validateFile(file);
  return {
    previewUrl: createPreviewUrl(file),
    file,
    mediaType: file.type.startsWith('image/') ? 'image' as const : 'video' as const,
  };
}

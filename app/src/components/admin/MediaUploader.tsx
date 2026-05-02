/**
 * MediaUploader
 *
 * Reusable component that lets the user choose between:
 *   - Entering a URL (existing behaviour — untouched)
 *   - Uploading a file from their device (new)
 *
 * Props:
 *   value        — current URL string (controlled by parent form)
 *   onChange     — called with the resolved URL whenever it changes
 *   accept       — 'image' | 'video' | 'all'  (default: 'image')
 *   label        — field label shown above the control
 *   required     — shows a red asterisk
 *   previewRatio — Tailwind aspect-ratio class for the preview box (default 'aspect-video')
 */

import { useRef, useState, useEffect, useId } from 'react';
import { Link2, Upload, X, Film, ImageIcon } from 'lucide-react';
import {
  ACCEPTED_MIME,
  prepareFilePreview,
  revokePreviewUrl,
  type AcceptedMediaType,
  type UploadResult,
} from '@/services/mediaService';
import { adminInputCls } from './AdminFormField';

type InputMode = 'url' | 'file';

interface MediaUploaderProps {
  value: string;
  onChange: (url: string) => void;
  accept?: AcceptedMediaType;
  label?: string;
  required?: boolean;
  previewRatio?: string;
}

export default function MediaUploader({
  value,
  onChange,
  accept = 'image',
  label = 'Imagen',
  required = false,
  previewRatio = 'aspect-video',
}: MediaUploaderProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine initial mode: if value is a blob URL or empty, start in 'url' mode
  const [mode, setMode] = useState<InputMode>('url');
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string>('');
  const [dragging, setDragging] = useState(false);

  // Revoke blob URL on unmount or when upload result changes
  useEffect(() => {
    return () => {
      if (uploadResult) revokePreviewUrl(uploadResult.previewUrl);
    };
  }, [uploadResult]);

  // ── Mode switch ────────────────────────────────────────────
  const switchMode = (next: InputMode) => {
    setMode(next);
    setError('');
    if (next === 'url') {
      // Clear file upload state but keep the URL the parent already has
      if (uploadResult) {
        revokePreviewUrl(uploadResult.previewUrl);
        setUploadResult(null);
      }
    }
  };

  // ── File handling ──────────────────────────────────────────
  const processFile = (file: File) => {
    setError('');
    try {
      const result = prepareFilePreview(file);
      // Revoke previous blob if any
      if (uploadResult) revokePreviewUrl(uploadResult.previewUrl);
      setUploadResult(result);
      // Notify parent with the temporary preview URL.
      // On save, the parent's handleSave should call uploadFile(result.file)
      // and replace this with the real storage URL.
      onChange(result.previewUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const clearFile = () => {
    if (uploadResult) revokePreviewUrl(uploadResult.previewUrl);
    setUploadResult(null);
    onChange('');
    setError('');
  };

  // ── Preview resolution ─────────────────────────────────────
  // Show preview when: file was uploaded (blob URL) OR value is a non-empty URL in url-mode
  const previewSrc = uploadResult?.previewUrl ?? (mode === 'url' && value ? value : '');
  const isVideo = uploadResult?.mediaType === 'video'
    || (previewSrc && /\.(mp4|webm)$/i.test(previewSrc));

  return (
    <div>
      {/* Label */}
      <p className="text-sm font-medium text-[#333333] mb-2">
        {label}
        {required && <span className="text-[#E53935] ml-0.5">*</span>}
      </p>

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-[#F5F5F5] rounded-lg w-fit mb-3">
        <button
          type="button"
          onClick={() => switchMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            mode === 'url'
              ? 'bg-white text-[#333333] shadow-sm'
              : 'text-[#666666] hover:text-[#333333]'
          }`}
        >
          <Link2 size={13} />
          URL
        </button>
        <button
          type="button"
          onClick={() => switchMode('file')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            mode === 'file'
              ? 'bg-white text-[#333333] shadow-sm'
              : 'text-[#666666] hover:text-[#333333]'
          }`}
        >
          <Upload size={13} />
          Subir archivo
        </button>
      </div>

      {/* ── URL mode ── */}
      {mode === 'url' && (
        <input
          id={inputId}
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://ejemplo.com/imagen.jpg"
          className={adminInputCls}
        />
      )}

      {/* ── File mode ── */}
      {mode === 'file' && !uploadResult && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed
            cursor-pointer transition-all py-8 px-4 text-center
            ${dragging
              ? 'border-[#E53935] bg-[#FFF5F5]'
              : 'border-[#E0E0E0] bg-[#FAFAFA] hover:border-[#E53935] hover:bg-[#FFF5F5]'}
          `}
        >
          <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center">
            {accept === 'video'
              ? <Film size={20} className="text-[#999999]" />
              : <ImageIcon size={20} className="text-[#999999]" />}
          </div>
          <div>
            <p className="text-sm font-medium text-[#333333]">
              Arrastrá o hacé clic para seleccionar
            </p>
            <p className="text-xs text-[#999999] mt-0.5">
              {accept === 'image' && 'JPG, PNG, WEBP — máx. 10 MB'}
              {accept === 'video' && 'MP4, WEBM — máx. 10 MB'}
              {accept === 'all'   && 'JPG, PNG, WEBP, MP4, WEBM — máx. 10 MB'}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_MIME[accept]}
            onChange={handleFileChange}
            className="hidden"
            aria-label="Seleccionar archivo"
          />
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <p className="text-xs text-[#F44336] mt-1.5 flex items-center gap-1">
          <X size={12} /> {error}
        </p>
      )}

      {/* ── Preview ── */}
      {previewSrc && (
        <div className={`relative mt-3 rounded-xl overflow-hidden bg-[#F5F5F5] ${previewRatio}`}>
          {isVideo ? (
            <video
              src={previewSrc}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={previewSrc}
              alt="Vista previa"
              className="w-full h-full object-cover"
              onError={e => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          )}

          {/* Clear button — only shown when a file was uploaded */}
          {uploadResult && (
            <button
              type="button"
              onClick={clearFile}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
              title="Quitar archivo"
            >
              <X size={14} />
            </button>
          )}

          {/* File info badge */}
          {uploadResult && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
              {uploadResult.mediaType === 'video'
                ? <Film size={11} />
                : <ImageIcon size={11} />}
              {uploadResult.file.name.length > 24
                ? uploadResult.file.name.slice(0, 22) + '…'
                : uploadResult.file.name}
              <span className="opacity-70 ml-1">
                ({(uploadResult.file.size / 1024).toFixed(0)} KB)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Re-select button after file is chosen */}
      {mode === 'file' && uploadResult && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 text-xs text-[#E53935] hover:underline flex items-center gap-1"
        >
          <Upload size={12} /> Cambiar archivo
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_MIME[accept]}
            onChange={handleFileChange}
            className="hidden"
          />
        </button>
      )}
    </div>
  );
}

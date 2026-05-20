/**
 * MediaUploader — corregido
 *
 * BUG CORREGIDO: onChange solo pasaba la URL (string), pero AdminProperties
 * necesita también el File para subirlo a Supabase Storage.
 * Ahora onChange recibe (url: string, file?: File).
 */

import { useRef, useState, useEffect, useId } from 'react';
import { Link2, Upload, X, Film, ImageIcon } from 'lucide-react';
import {
  ACCEPTED_MIME,
  prepareFilePreview,
  revokePreviewUrl,
  type AcceptedMediaType,
} from '@/services/mediaService';
import { adminInputCls } from './AdminFormField';

type InputMode = 'url' | 'file';

interface MediaUploaderProps {
  value:         string;
  onChange:      (url: string, file?: File) => void;  // ← CORREGIDO: agrega File opcional
  accept?:       AcceptedMediaType;
  label?:        string;
  required?:     boolean;
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
  const inputId     = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode,         setMode]         = useState<InputMode>('url');
  const [previewBlob,  setPreviewBlob]  = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error,        setError]        = useState('');
  const [dragging,     setDragging]     = useState(false);

  // Limpiar blob URL al desmontar
  useEffect(() => {
    return () => { if (previewBlob) revokePreviewUrl(previewBlob); };
  }, [previewBlob]);

  const switchMode = (next: InputMode) => {
    setMode(next);
    setError('');
    if (next === 'url') {
      if (previewBlob) { revokePreviewUrl(previewBlob); setPreviewBlob(''); }
      setSelectedFile(null);
    }
  };

  const processFile = (file: File) => {
    setError('');
    try {
      const result = prepareFilePreview(file);
      if (previewBlob) revokePreviewUrl(previewBlob);
      setPreviewBlob(result.previewUrl);
      setSelectedFile(file);
      // Notifica al padre con la URL de preview Y el File real
      onChange(result.previewUrl, file);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const clearFile = () => {
    if (previewBlob) revokePreviewUrl(previewBlob);
    setPreviewBlob('');
    setSelectedFile(null);
    onChange('', undefined);
    setError('');
  };

  // Preview: blob si hay archivo, o value si es URL
  const previewSrc = previewBlob || (mode === 'url' && value ? value : '');
  const isVideo    = selectedFile?.type.startsWith('video/') ||
                     /\.(mp4|webm)$/i.test(previewSrc);

  return (
    <div>
      <p className="text-sm font-medium text-[#333333] mb-2">
        {label}
        {required && <span className="text-[#E53935] ml-0.5">*</span>}
      </p>

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-[#F5F5F5] rounded-lg w-fit mb-3">
        {(['url', 'file'] as InputMode[]).map(m => (
          <button key={m} type="button" onClick={() => switchMode(m)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === m ? 'bg-white text-[#333333] shadow-sm' : 'text-[#666666] hover:text-[#333333]'
            }`}>
            {m === 'url' ? <><Link2 size={13} /> URL</> : <><Upload size={13} /> Subir archivo</>}
          </button>
        ))}
      </div>

      {/* URL mode */}
      {mode === 'url' && (
        <input id={inputId} type="url" value={value}
          onChange={e => onChange(e.target.value, undefined)}
          placeholder="https://ejemplo.com/imagen.jpg"
          className={adminInputCls} />
      )}

      {/* File mode — drop zone */}
      {mode === 'file' && !selectedFile && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all py-8 px-4 text-center ${
            dragging ? 'border-[#E53935] bg-[#FFF5F5]' : 'border-[#E0E0E0] bg-[#FAFAFA] hover:border-[#E53935] hover:bg-[#FFF5F5]'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center">
            {accept === 'video' ? <Film size={20} className="text-[#999]" /> : <ImageIcon size={20} className="text-[#999]" />}
          </div>
          <div>
            <p className="text-sm font-medium text-[#333333]">Arrastrá o hacé clic para seleccionar</p>
            <p className="text-xs text-[#999] mt-0.5">
              {accept === 'image' && 'JPG, PNG, WEBP — máx. 10 MB'}
              {accept === 'video' && 'MP4, WEBM — máx. 10 MB'}
              {accept === 'all'   && 'JPG, PNG, WEBP, MP4, WEBM — máx. 10 MB'}
            </p>
          </div>
          <input ref={fileInputRef} type="file" accept={ACCEPTED_MIME[accept]}
            onChange={handleFileChange} className="hidden" aria-label="Seleccionar archivo" />
        </div>
      )}

      {error && (
        <p className="text-xs text-[#F44336] mt-1.5 flex items-center gap-1">
          <X size={12} /> {error}
        </p>
      )}

      {/* Preview */}
      {previewSrc && (
        <div className={`relative mt-3 rounded-xl overflow-hidden bg-[#F5F5F5] ${previewRatio}`}>
          {isVideo ? (
            <video src={previewSrc} controls className="w-full h-full object-contain" />
          ) : (
            <img src={previewSrc} alt="Vista previa" className="w-full h-full object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          )}
          {selectedFile && (
            <button type="button" onClick={clearFile}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
              title="Quitar archivo">
              <X size={14} />
            </button>
          )}
          {selectedFile && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
              {isVideo ? <Film size={11} /> : <ImageIcon size={11} />}
              {selectedFile.name.length > 24 ? selectedFile.name.slice(0, 22) + '…' : selectedFile.name}
              <span className="opacity-70 ml-1">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
            </div>
          )}
        </div>
      )}

      {/* Re-select */}
      {mode === 'file' && selectedFile && (
        <button type="button" onClick={() => fileInputRef.current?.click()}
          className="mt-2 text-xs text-[#E53935] hover:underline flex items-center gap-1">
          <Upload size={12} /> Cambiar archivo
          <input ref={fileInputRef} type="file" accept={ACCEPTED_MIME[accept]}
            onChange={handleFileChange} className="hidden" />
        </button>
      )}
    </div>
  );
}

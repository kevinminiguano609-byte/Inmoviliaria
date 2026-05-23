/**
 * MultiImageUploader - Componente para subir y gestionar múltiples imágenes
 * Reemplaza al MediaUploader actual para soportar múltiples imágenes
 */

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Star, GripVertical, Loader2 } from 'lucide-react';
import { uploadFile } from '@/services/mediaService';
import { useToast } from '@/contexts/ToastContext';

export interface ImageItem {
  id?: string;           // Para imágenes existentes de la BD
  url: string;          // URL de preview o imagen existente
  file?: File | null;   // Archivo nuevo para subir
  isCover: boolean;     // Si es la imagen principal
  order: number;        // Orden de visualización
  uploading?: boolean;  // Estado de subida
  error?: string;       // Error de subida
}

interface MultiImageUploaderProps {
  label?: string;
  value: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxImages?: number;
  accept?: string;
  previewRatio?: string;
  disabled?: boolean;
}

export default function MultiImageUploader({
  label = 'Imágenes',
  value = [],
  onChange,
  maxImages = 20,
  accept = 'image/*',
  previewRatio = 'aspect-video',
  disabled = false,
}: MultiImageUploaderProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Validar que siempre haya al menos una imagen como cover
  useEffect(() => {
    const coverCount = value.filter(img => img.isCover).length;
    if (coverCount === 0 && value.length > 0) {
      // Si no hay cover, marcar la primera como cover
      const updated = [...value];
      updated[0].isCover = true;
      onChange(updated);
    }
  }, [value, onChange]);

  const handleFileSelect = async (files: FileList) => {
    if (disabled) return;

    const newImages: ImageItem[] = [];
    const fileArray = Array.from(files);

    // Validar cantidad máxima
    if (value.length + fileArray.length > maxImages) {
      showToast(`Máximo ${maxImages} imágenes permitidas`, 'error');
      return;
    }

    // Validar tipos de archivo
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        showToast(`El archivo "${file.name}" no es una imagen válida`, 'error');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        showToast(`La imagen "${file.name}" excede el tamaño máximo de 10MB`, 'error');
        continue;
      }

      const url = URL.createObjectURL(file);
      newImages.push({
        url,
        file,
        isCover: value.length + newImages.length === 0, // Primera nueva imagen es cover si no hay otras
        order: value.length + newImages.length,
      });
    }

    if (newImages.length > 0) {
      onChange([...value, ...newImages]);
    }

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    const updated = [...value];
    const removed = updated.splice(index, 1)[0];
    
    // Revocar URL de objeto si es una imagen nueva
    if (removed.file && removed.url.startsWith('blob:')) {
      URL.revokeObjectURL(removed.url);
    }
    
    // Si eliminamos la imagen cover, marcar la primera como cover
    if (removed.isCover && updated.length > 0) {
      updated[0].isCover = true;
    }
    
    // Reordenar
    updated.forEach((img, idx) => {
      img.order = idx;
    });
    
    onChange(updated);
  };

  const setAsCover = (index: number) => {
    const updated = value.map((img, idx) => ({
      ...img,
      isCover: idx === index,
    }));
    onChange(updated);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOverItem = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDropItem = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...value];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);

    // Actualizar orden
    updated.forEach((img, idx) => {
      img.order = idx;
    });

    onChange(updated);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-[#333333] mb-1">
          {label} {value.length > 0 && `(${value.length}/${maxImages})`}
        </label>
      )}

      {/* Área de drop */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${dragOver ? 'border-[#E53935] bg-[#FFF5F5]' : 'border-[#E0E0E0] hover:border-[#E53935] hover:bg-[#F9F9F9]'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={triggerFileInput}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload size={24} className="text-[#999]" />
          <div>
            <p className="text-sm text-[#333333] font-medium">
              Arrastra imágenes aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-[#999] mt-1">
              JPG, PNG, WEBP hasta 10MB cada una. Máximo {maxImages} imágenes.
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Grid de imágenes */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {value.map((image, index) => (
            <div
              key={image.id || `new-${index}`}
              className={`relative group rounded-lg overflow-hidden border transition-all
                ${image.isCover ? 'border-2 border-[#E53935]' : 'border-[#E0E0E0]'}
                ${draggedIndex === index ? 'opacity-50' : ''}
                ${image.uploading ? 'opacity-70' : ''}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOverItem(e, index)}
              onDrop={(e) => handleDropItem(e, index)}
              onDragEnd={handleDragEnd}
            >
              {/* Imagen */}
              <div className={`${previewRatio} bg-[#F5F5F5] relative`}>
                <img
                  src={image.url}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGNUY1RjUiLz48cGF0aCBkPSJNNjUgMzVBNzAgNzAgMCAxIDAgNjUgNjVBNzAgNzAgMCAxIDAgNjUgMzVaIiBmaWxsPSIjRUVFRUVFIi8+PHBhdGggZD0iTTY1IDQ1QTUgNSAwIDEgMCA2NSA1NUE1IDUgMCAxIDAgNjUgNDVaIiBmaWxsPSIjQ0NDQ0NDIi8+PHBhdGggZD0iTTQwIDc1TDU1IDYwTDcwIDc1SDQwWiIgZmlsbD0iI0NDQ0NDQyIvPjwvc3ZnPg==';
                  }}
                />

                {/* Overlay de acciones */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAsCover(index);
                    }}
                    className={`p-2 rounded-full ${image.isCover ? 'bg-[#E53935] text-white' : 'bg-white/90 text-[#333] hover:bg-white'}`}
                    title={image.isCover ? 'Imagen principal' : 'Marcar como principal'}
                    disabled={disabled}
                  >
                    <Star size={16} fill={image.isCover ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="p-2 rounded-full bg-white/90 text-[#333] hover:bg-white hover:text-[#E53935]"
                    title="Eliminar"
                    disabled={disabled}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Indicador de arrastre */}
                <div className="absolute top-2 left-2 p-1 rounded bg-black/50 text-white">
                  <GripVertical size={12} />
                </div>

                {/* Indicador de cover */}
                {image.isCover && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-[#E53935] text-white text-xs font-medium">
                    Principal
                  </div>
                )}

                {/* Loading state */}
                {image.uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 size={24} className="text-white animate-spin" />
                  </div>
                )}

                {/* Error state */}
                {image.error && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs p-1">
                    {image.error}
                  </div>
                )}
              </div>

              {/* Orden */}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instrucciones */}
      {value.length > 0 && (
        <div className="text-xs text-[#999] space-y-1">
          <p>• Arrastra imágenes para reordenar</p>
          <p>• Haz clic en la estrella para marcar como imagen principal</p>
          <p>• La imagen principal aparecerá como portada en el sitio</p>
        </div>
      )}
    </div>
  );
}
/**
 * ImageGalleryPreview - Componente para mostrar galería de imágenes en modo lectura
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Star } from 'lucide-react';

interface PropertyImage {
  id: string;
  url: string;
  is_cover: boolean;
  sort_order: number;
}

interface ImageGalleryPreviewProps {
  images: PropertyImage[];
  propertyTitle: string;
}

export default function ImageGalleryPreview({ images, propertyTitle }: ImageGalleryPreviewProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Ordenar imágenes por sort_order
  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order);

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#E0E0E0] flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-[#999]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-[#666]">No hay imágenes disponibles</p>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    if (lightboxIndex !== null) {
      const next = (lightboxIndex + 1) % sortedImages.length;
      setLightboxIndex(next);
    }
  };

  const prevImage = () => {
    if (lightboxIndex !== null) {
      const prev = (lightboxIndex - 1 + sortedImages.length) % sortedImages.length;
      setLightboxIndex(prev);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setCurrentImageIndex(index);
  };

  // Imagen principal (cover)
  const coverImage = sortedImages.find(img => img.is_cover) || sortedImages[0];
  const otherImages = sortedImages.filter(img => img.id !== coverImage.id);

  return (
    <>
      <div className="space-y-3">
        {/* Imagen principal */}
        <div 
          className="aspect-video rounded-xl overflow-hidden cursor-pointer relative group"
          onClick={() => openLightbox(sortedImages.indexOf(coverImage))}
        >
          <img
            src={coverImage.url}
            alt={`${propertyTitle} - Imagen principal`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="eager"
          />
          
          {/* Overlay con indicador de cover */}
          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Star size={10} fill="currentColor" />
            <span>Principal</span>
          </div>

          {/* Overlay hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Miniaturas */}
        {otherImages.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {otherImages.slice(0, 4).map((image, index) => {
              const actualIndex = sortedImages.indexOf(image);
              return (
                <div
                  key={image.id}
                  className="aspect-[4/3] rounded-lg overflow-hidden cursor-pointer relative group"
                  onClick={() => openLightbox(actualIndex)}
                >
                  <img
                    src={image.url}
                    alt={`${propertyTitle} - Imagen ${index + 2}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Overlay hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>

                  {/* Indicador de más imágenes */}
                  {index === 3 && otherImages.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">+{otherImages.length - 3}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Contador de imágenes */}
        <div className="text-sm text-[#666]">
          <p>{sortedImages.length} imagen{sortedImages.length !== 1 ? 'es' : ''} • Haz clic para ampliar</p>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Botón cerrar */}
          <button 
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setLightboxIndex(null)}
          >
            <X size={32} />
          </button>

          {/* Botón anterior */}
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/10 rounded-full transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            <ChevronLeft size={32} />
          </button>

          {/* Botón siguiente */}
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/10 rounded-full transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            <ChevronRight size={32} />
          </button>

          {/* Imagen */}
          <div 
            className="max-w-[90vw] max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={sortedImages[lightboxIndex].url}
              alt={`${propertyTitle} - Imagen ${lightboxIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>

          {/* Indicador de imagen principal */}
          {sortedImages[lightboxIndex].is_cover && (
            <div className="absolute top-4 left-4 bg-[#E53935] text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Star size={12} fill="currentColor" />
              <span>Imagen principal</span>
            </div>
          )}

          {/* Contador */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/50 px-4 py-2 rounded-full">
            {lightboxIndex + 1} / {sortedImages.length}
          </div>

          {/* Miniaturas en lightbox */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
            {sortedImages.slice(0, 8).map((image, index) => (
              <button
                key={image.id}
                className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                  index === lightboxIndex 
                    ? 'border-[#E53935] scale-110' 
                    : 'border-transparent hover:border-white/50'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(index);
                }}
              >
                <img
                  src={image.url}
                  alt={`Miniatura ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {image.is_cover && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[#E53935] rounded-bl" />
                )}
              </button>
            ))}
            {sortedImages.length > 8 && (
              <div className="w-12 h-12 rounded bg-black/50 flex items-center justify-center text-white text-xs">
                +{sortedImages.length - 8}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
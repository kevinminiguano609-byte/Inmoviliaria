/**
 * Validation Service - Funciones de validación para imágenes y coordenadas
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validar archivos de imagen
 * @param files - Array de archivos a validar
 * @param options - Opciones de validación
 * @returns Resultado de validación
 */
export function validateImageFiles(
  files: File[],
  options?: { maxCount?: number; maxSizeMB?: number; allowedTypes?: string[] }
): ValidationResult {
  const errors: string[] = [];
  const maxCount = options?.maxCount || 20;
  const maxSizeMB = options?.maxSizeMB || 10;
  const allowedTypes = options?.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];

  // Validar cantidad
  if (files.length > maxCount) {
    errors.push(`Máximo ${maxCount} imágenes permitidas`);
  }

  // Validar cada archivo
  files.forEach((file, index) => {
    // Validar tipo
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Imagen ${index + 1}: Tipo no permitido. Usa JPG, PNG o WEBP`);
    }

    // Validar tamaño (MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      errors.push(`Imagen ${index + 1}: Tamaño máximo ${maxSizeMB}MB (actual: ${fileSizeMB.toFixed(2)}MB)`);
    }

    // Validar nombre (caracteres seguros)
    const safeName = /^[a-zA-Z0-9._-]+$/;
    if (!safeName.test(file.name.replace(/\.[^/.]+$/, ""))) {
      errors.push(`Imagen ${index + 1}: Nombre contiene caracteres no permitidos`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validar coordenadas geográficas
 * @param latitude - Latitud
 * @param longitude - Longitud
 * @returns Resultado de validación
 */
export function validateCoordinates(
  latitude: number | null,
  longitude: number | null
): ValidationResult {
  const errors: string[] = [];

  if (latitude === null || longitude === null) {
    errors.push('Las coordenadas son requeridas');
    return { valid: false, errors };
  }

  // Validar rangos geográficos
  if (latitude < -90 || latitude > 90) {
    errors.push(`Latitud inválida: ${latitude}. Debe estar entre -90 y 90`);
  }

  if (longitude < -180 || longitude > 180) {
    errors.push(`Longitud inválida: ${longitude}. Debe estar entre -180 y 180`);
  }

  // Validar ubicaciones imposibles (medio del océano)
  // Coordenadas en medio del océano Pacífico (evitar spam)
  const isOceanLocation = 
    (latitude > -60 && latitude < 60 && longitude > -160 && longitude < -100) || // Pacífico central
    (latitude > -60 && latitude < 60 && longitude > 100 && longitude < 160);     // Pacífico oeste

  if (isOceanLocation) {
    errors.push('La ubicación seleccionada parece estar en medio del océano');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validar formulario completo de propiedad
 * @param formData - Datos del formulario
 * @returns Resultado de validación
 */
export interface PropertyFormData {
  title: string;
  price: number | '';
  images: Array<{ url: string; isCover: boolean }>;
  latitude: number | null;
  longitude: number | null;
  [key: string]: any;
}

export function validatePropertyForm(formData: PropertyFormData): ValidationResult {
  const errors: string[] = [];

  // Validar título
  if (!formData.title.trim()) {
    errors.push('El título es obligatorio');
  }

  // Validar precio
  if (formData.price === '' || Number(formData.price) <= 0) {
    errors.push('El precio debe ser mayor a 0');
  }

  // Validar imágenes
  if (formData.images.length === 0) {
    errors.push('Debe subir al menos una imagen');
  } else {
    const coverCount = formData.images.filter(img => img.isCover).length;
    if (coverCount !== 1) {
      errors.push('Debe haber exactamente una imagen marcada como principal');
    }
  }

  // Validar coordenadas
  const coordValidation = validateCoordinates(formData.latitude, formData.longitude);
  if (!coordValidation.valid) {
    errors.push(...coordValidation.errors);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sanitizar nombre de archivo
 * @param filename - Nombre original del archivo
 * @returns Nombre sanitizado
 */
export function sanitizeFilename(filename: string): string {
  // Remover caracteres no seguros
  let sanitized = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // Reemplazar caracteres no permitidos
    .replace(/_+/g, '_')               // Reemplazar múltiples _ por uno solo
    .replace(/^_+|_+$/g, '');          // Remover _ al inicio y final

  // Limitar longitud
  if (sanitized.length > 100) {
    const extIndex = sanitized.lastIndexOf('.');
    if (extIndex > 0) {
      const name = sanitized.substring(0, extIndex);
      const ext = sanitized.substring(extIndex);
      sanitized = name.substring(0, 95) + ext;
    } else {
      sanitized = sanitized.substring(0, 100);
    }
  }

  return sanitized;
}

/**
 * Validar dirección
 * @param address - Dirección a validar
 * @returns Resultado de validación
 */
export function validateAddress(address: string): ValidationResult {
  const errors: string[] = [];

  if (!address.trim()) {
    errors.push('La dirección es requerida');
    return { valid: false, errors };
  }

  // Validar longitud mínima
  if (address.trim().length < 5) {
    errors.push('La dirección es demasiado corta');
  }

  // Validar caracteres (permitir letras, números, espacios y algunos símbolos comunes)
  const addressRegex = /^[a-zA-Z0-9\s.,#°-]+$/;
  if (!addressRegex.test(address)) {
    errors.push('La dirección contiene caracteres no permitidos');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validar que haya al menos una imagen como cover
 * @param images - Array de imágenes
 * @returns true si hay exactamente una imagen cover
 */
export function validateCoverImage(images: Array<{ isCover: boolean }>): boolean {
  const coverCount = images.filter(img => img.isCover).length;
  return coverCount === 1;
}

/**
 * Validar límite de imágenes
 * @param images - Array de imágenes
 * @param maxCount - Máximo permitido
 * @returns true si no excede el límite
 */
export function validateImageCount(images: any[], maxCount: number = 20): boolean {
  return images.length <= maxCount;
}
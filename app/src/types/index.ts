export interface Property {
  id: string;
  slug: string;
  title: string;
  location: string;
  address: string;
  price: number;
  currency: 'USD' | 'ARS';
  operation: 'venta' | 'alquiler';
  type: 'departamento' | 'casa' | 'oficina' | 'terreno' | 'local';
  badge?: string;
  badgeColor?: string;
  image: string;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  coveredArea?: number;
  rooms?: number;
  parking?: number;
  age?: number;
  orientation?: string;
  expenses?: string;
  disposition?: string;
  description: string;
  amenities: string[];
  gallery: string[];
  agent: {
    name: string;
    role: string;
    phone: string;
    avatar: string;
  };
  mapUrl: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  propertyId?: string;
  propertyTitle?: string;
  date: string;
  status: 'nuevo' | 'contactado' | 'seguimiento' | 'cerrado' | 'descartado';
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  status: 'publicado' | 'borrador';
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

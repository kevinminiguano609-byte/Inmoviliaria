import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize, MapPin } from 'lucide-react';
import type { Property } from '@/types';

export default function PropertyCard({ property }: { property: Property }) {
  const formatPrice = () => {
    if (property.operation === 'alquiler') {
      return `$${property.price.toLocaleString('es-AR')}/mes`;
    }
    return `USD ${property.price.toLocaleString('es-AR')}`;
  };

  return (
    <Link
      to={`/propiedades/${property.slug}`}
      className="group bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-[400ms]"
      style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)' }}
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[400ms]"
          style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)' }}
        />
        {property.badge && (
          <span
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: property.badgeColor || '#E53935' }}
          >
            {property.badge}
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-[#E53935] font-semibold text-xl mb-1">{formatPrice()}</p>
        <h3 className="text-[#333333] font-medium text-lg mb-2 line-clamp-1">{property.title}</h3>
        <div className="flex items-center gap-1 text-[#666666] text-sm mb-3">
          <MapPin size={14} />
          <span className="line-clamp-1">{property.location}</span>
        </div>
        <div className="flex items-center gap-4 text-[#666666] text-sm">
          {property.bedrooms !== undefined && (
            <div className="flex items-center gap-1">
              <Bed size={14} />
              <span>{property.bedrooms} hab</span>
            </div>
          )}
          {property.bathrooms !== undefined && (
            <div className="flex items-center gap-1">
              <Bath size={14} />
              <span>{property.bathrooms} baños</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Maximize size={14} />
            <span>{property.area} m²</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

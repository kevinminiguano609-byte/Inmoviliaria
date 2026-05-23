import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, ChevronLeft, ChevronRight, X,
  Phone, Send, CheckCircle
} from 'lucide-react';
import PageLayout from '@/layouts/PageLayout';
import ScrollReveal from '@/components/ScrollReveal';
import PropertyCard from '@/components/PropertyCard';
import ImageGalleryPreview from '@/components/property/ImageGalleryPreview';
import PropertyLocationDisplay from '@/components/property/PropertyLocationDisplay';
import { useProperty } from '@/contexts/PropertyContext';
import { useLead } from '@/contexts/LeadContext';
import { useToast } from '@/contexts/ToastContext';
import { getPropertyBySlug, getPropertyImages } from '@/services/propertyService';
import type { PropertyWithRelations, PropertyImageRow } from '@/types/supabase';

export default function PropertyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { properties } = useProperty();
  const [property, setProperty] = useState<PropertyWithRelations | null>(null);
  const [images, setImages] = useState<PropertyImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPropertyData = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        // Intentar obtener propiedad con relaciones desde Supabase
        const propertyData = await getPropertyBySlug(slug);
        
        if (propertyData) {
          setProperty(propertyData);
          // Cargar imágenes si no vienen en los datos
          if (!propertyData.images || propertyData.images.length === 0) {
            const propertyImages = await getPropertyImages(propertyData.id);
            setImages(propertyImages);
          } else {
            setImages(propertyData.images);
          }
        } else {
          // Fallback a datos del contexto
          const contextProperty = properties.find(p => p.slug === slug);
          if (contextProperty) {
            // Convertir Property a PropertyWithRelations básico
            const basicProperty: PropertyWithRelations = {
              id: contextProperty.id,
              slug: contextProperty.slug,
              title: contextProperty.title,
              location: contextProperty.location,
              address: contextProperty.address,
              price: contextProperty.price,
              currency: contextProperty.currency,
              operation: contextProperty.operation,
              type: contextProperty.type,
              badge: contextProperty.badge ?? null,
              badge_color: contextProperty.badgeColor ?? null,
              area: contextProperty.area,
              covered_area: contextProperty.coveredArea ?? null,
              bedrooms: contextProperty.bedrooms ?? null,
              bathrooms: contextProperty.bathrooms ?? null,
              rooms: contextProperty.rooms ?? null,
              parking: contextProperty.parking ?? null,
              age: contextProperty.age ?? null,
              orientation: contextProperty.orientation ?? null,
              expenses: contextProperty.expenses ?? null,
              disposition: contextProperty.disposition ?? null,
              description: contextProperty.description,
              map_url: contextProperty.mapUrl,
              latitude: null,
              longitude: null,
              featured: false,
              status: 'publicada' as const,
              agent_id: null,
              created_at: contextProperty.createdAt,
              updated_at: contextProperty.createdAt,
              meta_title: null,
              meta_desc: null,
              images: [],
              amenities: [],
              agent: null
            };
            setProperty(basicProperty);
            
            // Cargar imágenes desde servicio
            const propertyImages = await getPropertyImages(contextProperty.id);
            setImages(propertyImages);
          } else {
            setError('Propiedad no encontrada');
          }
        }
      } catch (err) {
        console.error('Error loading property:', err);
        setError('Error al cargar la propiedad');
      } finally {
        setLoading(false);
      }
    };

    loadPropertyData();
  }, [slug, properties]);

  if (loading) {
    return (
      <PageLayout>
        <div className="pt-[70px] min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#E53935] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#333333]">Cargando propiedad...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !property) {
    return (
      <PageLayout>
        <div className="pt-[70px] min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl text-[#333333] mb-4">{error || 'Propiedad no encontrada'}</h1>
            <Link to="/propiedades" className="text-[#E53935] hover:underline">Volver a propiedades</Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const formatPrice = () => {
    if (property.operation === 'alquiler') return `$${property.price.toLocaleString('es-AR')}/mes`;
    return `USD ${property.price.toLocaleString('es-AR')}`;
  };

  const similar = properties.filter(p => p.id !== property.id && p.type === property.type).slice(0, 3);

  return (
    <PageLayout>
      <div className="bg-[#F5F5F5] pt-[70px]">
        <div className="max-w-[1360px] mx-auto px-5 md:px-10 py-8">
          <div className="flex items-center gap-2 text-sm text-[#666666] mb-4">
            <Link to="/" className="hover:text-[#E53935] transition-colors">Inicio</Link>
            <span>&gt;</span>
            <Link to="/propiedades" className="hover:text-[#E53935] transition-colors">Propiedades</Link>
            <span>&gt;</span>
            <span className="text-[#333333] font-medium truncate">{property.title}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-[40px] font-normal text-[#333333]">{property.title}</h1>
              <div className="flex items-center gap-1 text-sm text-[#666666] mt-2">
                <MapPin size={14} /> {property.address || property.location}
              </div>
            </div>
            <div className="text-left md:text-right shrink-0">
              <p className="text-[#E53935] font-semibold text-2xl md:text-3xl">{formatPrice()}</p>
              <div className="flex gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${property.operation === 'venta' ? 'bg-[#4CAF50]' : 'bg-[#2196F3]'}`}>
                  {property.operation === 'venta' ? 'Venta' : 'Alquiler'}
                </span>
                {property.badge && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: property.badge_color || undefined }}>
                    {property.badge}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-5 md:px-10 mt-6">
        <ImageGalleryPreview 
          images={images} 
          propertyTitle={property.title} 
        />
      </div>

      <div className="max-w-[1360px] mx-auto px-5 md:px-10 py-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <PropertyInfo property={property} />
          </div>
          <div className="lg:col-span-1">
            <ContactSidebar property={property} />
          </div>
        </div>
      </div>

      {/* Similar properties */}
      {similar.length > 0 && (
        <div className="bg-[#F5F5F5] py-16 md:py-20">
          <div className="max-w-[1360px] mx-auto px-5 md:px-10">
            <h2 className="text-3xl md:text-[40px] font-normal text-[#333333] mb-12">Propiedades similares</h2>
            <ScrollReveal stagger={0.15}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {similar.map(p => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      )}
    </PageLayout>
  );
}



function PropertyInfo({ property }: { property: PropertyWithRelations }) {
  const features = [
    ...(property.area ? [{ label: 'Superficie total', value: `${property.area} m²` }] : []),
    ...(property.covered_area ? [{ label: 'Superficie cubierta', value: `${property.covered_area} m²` }] : []),
    ...(property.rooms ? [{ label: 'Ambientes', value: `${property.rooms}` }] : []),
    ...(property.bedrooms ? [{ label: 'Dormitorios', value: `${property.bedrooms}` }] : []),
    ...(property.bathrooms ? [{ label: 'Baños', value: `${property.bathrooms}` }] : []),
    ...(property.parking ? [{ label: 'Cocheras', value: `${property.parking}` }] : []),
    ...(property.age ? [{ label: 'Antigüedad', value: `${property.age} años` }] : []),
    ...(property.orientation ? [{ label: 'Orientación', value: property.orientation }] : []),
    ...(property.expenses ? [{ label: 'Expensas', value: property.expenses }] : []),
    ...(property.disposition ? [{ label: 'Disposición', value: property.disposition }] : []),
  ];

  return (
    <div>
      <ScrollReveal>
        <h3 className="text-2xl font-normal text-[#333333] mb-4">Descripción</h3>
        <p className="text-base text-[#333333] leading-relaxed">{property.description || 'No hay descripción disponible.'}</p>
      </ScrollReveal>

      {features.length > 0 && (
        <ScrollReveal>
          <h3 className="text-2xl font-normal text-[#333333] mt-12 mb-6">Características</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#E53935]" />
                <span className="text-sm font-medium text-[#333333]">{f.label}:</span>
                <span className="text-sm text-[#666666]">{f.value}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      )}

      {property.amenities && property.amenities.length > 0 && (
        <ScrollReveal>
          <h3 className="text-2xl font-normal text-[#333333] mt-12 mb-6">Amenities</h3>
          <div className="flex flex-wrap gap-3">
            {property.amenities.map((a, i) => (
              <span key={i} className="bg-[#F5F5F5] text-[#333333] text-sm px-4 py-2 rounded-full">{a}</span>
            ))}
          </div>
        </ScrollReveal>
      )}

      <ScrollReveal>
        <PropertyLocationDisplay
          latitude={property.latitude}
          longitude={property.longitude}
          address={property.address}
          mapUrl={property.map_url}
          propertyTitle={property.title}
          height="400px"
        />
      </ScrollReveal>
    </div>
  );
}

function ContactSidebar({ property }: { property: PropertyWithRelations }) {
  const [showModal, setShowModal] = useState(false);
  const formatPrice = () => {
    if (property.operation === 'alquiler') return `$${property.price.toLocaleString('es-AR')}/mes`;
    return `USD ${property.price.toLocaleString('es-AR')}`;
  };

  return (
    <>
      <div className="sticky top-[90px] bg-white border border-[#E0E0E0] rounded-xl p-6 lg:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
        <p className="text-[#E53935] font-semibold text-3xl">{formatPrice()}</p>
        <p className="text-sm text-[#666666] mb-6">Precio de {property.operation}</p>

        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-[#E53935] hover:bg-[#C62828] text-white font-medium py-3.5 rounded-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mb-3"
        >
          <Phone size={16} /> Contactar
        </button>

        <a
          href={`https://wa.me/593990332764?text=${encodeURIComponent(`Hola! Me interesa la propiedad en ${property.location}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#25D366] hover:bg-[#20BD5C] text-white font-medium py-3.5 rounded-lg transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-2 mb-6"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </a>

        {property.agent && (
          <div className="border-t border-[#E0E0E0] pt-6">
            <div className="flex items-center gap-3">
              {property.agent.avatar_url ? (
                <img src={property.agent.avatar_url} alt={property.agent.full_name} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#999] text-sm">
                  {property.agent.full_name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-medium text-[#333333]">{property.agent.full_name}</p>
                <p className="text-sm text-[#666666]">{property.agent.role === 'admin' ? 'Administrador' : 'Agente'}</p>
                {property.agent.phone && (
                  <p className="text-sm text-[#666666] flex items-center gap-1">
                    <Phone size={12} /> {property.agent.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <p className="text-sm font-medium text-[#333333] mb-3">Compartir</p>
          <div className="flex gap-2">
            {['F', 'X', 'W', 'L'].map((s, i) => (
              <span key={i} className="w-9 h-9 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#666666] text-xs font-medium hover:bg-[#E53935] hover:text-white transition-colors cursor-pointer">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {showModal && <ContactModal property={property} onClose={() => setShowModal(false)} />}
    </>
  );
}

function ContactModal({ property, onClose }: { property: PropertyWithRelations; onClose: () => void }) {
  const { addLead } = useLead();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    addLead({
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: `Consulta por ${property.title}`,
      message: form.message,
      propertyId: property.id,
      propertyTitle: property.title,
    });
    setSubmitted(true);
    showToast('Consulta enviada correctamente', 'success');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#666666] hover:text-[#333333]">
          <X size={24} />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle size={48} className="text-[#4CAF50] mx-auto mb-4" />
            <h3 className="text-xl font-medium text-[#4CAF50] mb-2">&iexcl;Consulta enviada!</h3>
            <p className="text-[#666666]">Te contactaremos a la brevedad.</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-medium text-[#333333] mb-1">Contactar por esta propiedad</h3>
            <p className="text-sm text-[#666666] mb-6">{property.title} - {property.operation === 'alquiler' ? `$${property.price.toLocaleString()}/mes` : `USD ${property.price.toLocaleString()}`}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Tu nombre" required className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-base outline-none placeholder:text-[#999]"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input type="email" placeholder="tu@email.com" required className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-base outline-none placeholder:text-[#999]"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <input type="tel" placeholder="Teléfono" className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-base outline-none placeholder:text-[#999]"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <textarea rows={4} placeholder="Hola, me interesa esta propiedad..." required className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-base outline-none resize-none placeholder:text-[#999]"
                value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
              <button type="submit" className="w-full bg-[#E53935] hover:bg-[#C62828] text-white font-medium py-3.5 rounded-lg transition-all flex items-center justify-center gap-2">
                <Send size={16} /> Enviar consulta
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

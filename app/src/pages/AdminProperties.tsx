/**
 * AdminProperties — conectado a Supabase
 *
 * BUGS CORREGIDOS:
 * 1. Usaba `type Property` del frontend (campos: image, gallery, agent, mapUrl, createdAt)
 *    que NO existen en PropertyRow de Supabase. Ahora usa PropertyRow directamente.
 * 2. El payload enviaba campos inexistentes en la BD (agent, gallery, image, mapUrl).
 * 3. La imagen se guardaba en `form.image` pero la BD usa `property_images` table.
 *    Ahora la imagen principal se guarda en property_images con is_cover=true.
 * 4. Los amenities se enviaban como string[] pero la BD usa tabla junction.
 *    Ahora se guardan correctamente via setPropertyAmenities().
 * 5. El status siempre era undefined → ahora default 'publicada' para que aparezca en el sitio.
 */

import { useState } from 'react';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminSearchBar from '@/components/admin/AdminSearchBar';
import AdminTable from '@/components/admin/AdminTable';
import AdminModal from '@/components/admin/AdminModal';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import AdminFormField, { adminInputCls } from '@/components/admin/AdminFormField';
import MediaUploader from '@/components/admin/MediaUploader';
import { useProperty } from '@/contexts/PropertyContext';
import { useToast } from '@/contexts/ToastContext';
import { addPropertyImage, setPropertyAmenities, getAmenities } from '@/services/propertyService';
import { uploadFile } from '@/services/mediaService';
import type { PropertyRow, PropertyInsert, PropertyUpdate } from '@/types/supabase';
import { useEffect } from 'react';

const operationColors: Record<string, string> = {
  venta:    '#4CAF50',
  alquiler: '#2196F3',
};

interface FormState {
  title:       string;
  operation:   'venta' | 'alquiler';
  type:        'departamento' | 'casa' | 'oficina' | 'terreno' | 'local';
  currency:    'USD' | 'ARS';
  status:      'publicada' | 'borrador' | 'archivada';
  price:       number | '';
  location:    string;
  address:     string;
  area:        number | '';
  bedrooms:    number | '';
  bathrooms:   number | '';
  parking:     number | '';
  badge:       string;
  description: string;
  imageUrl:    string;       // URL o blob para preview
  imageFile:   File | null;  // archivo real para subir
  amenities:   string;       // string separado por comas
  map_url:     string;
  featured:    boolean;
}

const defaultForm: FormState = {
  title: '', operation: 'venta', type: 'departamento', currency: 'USD',
  status: 'publicada', price: '', location: '', address: '',
  area: '', bedrooms: '', bathrooms: '', parking: '',
  badge: '', description: '', imageUrl: '', imageFile: null,
  amenities: '', map_url: '', featured: false,
};

export default function AdminProperties() {
  const { properties, loading, addProperty, updateProperty, deleteProperty, refresh } = useProperty();
  const { showToast } = useToast();

  const [search,     setSearch]     = useState('');
  const [opFilter,   setOpFilter]   = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<PropertyRow | null>(null);
  const [form,     setForm]     = useState<FormState>(defaultForm);
  const [saving,   setSaving]   = useState(false);

  const [deleteId,  setDeleteId]  = useState<string | null>(null);
  const [deleting,  setDeleting]  = useState(false);

  // Catálogo de amenities de la BD
  const [amenityCatalog, setAmenityCatalog] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    getAmenities().then(setAmenityCatalog).catch(() => {});
  }, []);

  // ── Filtering ──────────────────────────────────────────────
  const filtered = (properties as PropertyRow[]).filter(p => {
    if (search    && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (opFilter  && p.operation !== opFilter)  return false;
    if (typeFilter && p.type     !== typeFilter) return false;
    return true;
  });

  // ── Form helpers ───────────────────────────────────────────
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const openNew = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const openEdit = (p: PropertyRow) => {
    setEditing(p);
    setForm({
      title:       p.title,
      operation:   p.operation,
      type:        p.type,
      currency:    p.currency,
      status:      p.status,
      price:       p.price,
      location:    p.location,
      address:     p.address ?? '',
      area:        p.area ?? '',
      bedrooms:    p.bedrooms ?? '',
      bathrooms:   p.bathrooms ?? '',
      parking:     p.parking ?? '',
      badge:       p.badge ?? '',
      description: p.description ?? '',
      imageUrl:    '',   // se carga desde property_images si existe
      imageFile:   null,
      amenities:   '',   // se carga desde property_amenities si existe
      map_url:     p.map_url ?? '',
      featured:    p.featured,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || form.price === '') {
      showToast('Título y precio son obligatorios', 'error');
      return;
    }
    setSaving(true);
    try {
      // 1. Construir payload para la tabla properties
      const payload: PropertyInsert | PropertyUpdate = {
        title:       form.title,
        slug:        editing?.slug ?? '',   // auto-generado por trigger si vacío
        operation:   form.operation,
        type:        form.type,
        currency:    form.currency,
        status:      form.status,
        featured:    form.featured,
        price:       Number(form.price),
        location:    form.location,
        address:     form.address || null,
        area:        form.area !== '' ? Number(form.area) : null,
        bedrooms:    form.bedrooms !== '' ? Number(form.bedrooms) : null,
        bathrooms:   form.bathrooms !== '' ? Number(form.bathrooms) : null,
        parking:     form.parking !== '' ? Number(form.parking) : null,
        badge:       form.badge || null,
        description: form.description || null,
        map_url:     form.map_url || null,
      };

      let propertyId: string;

      if (editing) {
        await updateProperty(editing.id, payload as PropertyUpdate);
        propertyId = editing.id;
        showToast('Propiedad actualizada', 'success');
      } else {
        // addProperty retorna void en el contexto, necesitamos el id
        // Llamamos directamente al servicio para obtenerlo
        const { createProperty } = await import('@/services/propertyService');
        const created = await createProperty(payload as PropertyInsert);
        propertyId = created.id;
        showToast('Propiedad creada', 'success');
      }

      // 2. Subir imagen si hay archivo nuevo
      if (form.imageFile) {
        try {
          const { uploadFile: upload } = await import('@/services/mediaService');
          const result = await upload(form.imageFile, 'property-images');
          await addPropertyImage(propertyId, result.url, result.storagePath, true, 0);
        } catch (imgErr) {
          showToast('Propiedad guardada, pero falló la imagen: ' + (imgErr as Error).message, 'info');
        }
      } else if (form.imageUrl && form.imageUrl.startsWith('http') && !editing) {
        // URL directa (no blob)
        await addPropertyImage(propertyId, form.imageUrl, '', true, 0);
      }

      // 3. Guardar amenities si se especificaron
      if (form.amenities.trim()) {
        const names = form.amenities.split(',').map(s => s.trim()).filter(Boolean);
        const ids = names
          .map(name => amenityCatalog.find(a => a.name.toLowerCase() === name.toLowerCase())?.id)
          .filter((id): id is string => !!id);
        if (ids.length > 0) {
          await setPropertyAmenities(propertyId, ids);
        }
      }

      refresh();
      setShowForm(false);
    } catch (err) {
      showToast('Error: ' + (err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteProperty(deleteId);
      showToast('Propiedad eliminada', 'success');
      setDeleteId(null);
    } catch (err) {
      showToast('Error al eliminar: ' + (err as Error).message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ── Table columns ──────────────────────────────────────────
  const columns = [
    {
      header: 'Propiedad',
      render: (p: PropertyRow) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F5F5F5] flex items-center justify-center shrink-0 text-[#999] text-xs">
            IMG
          </div>
          <div>
            <span className="text-sm text-[#333333] font-medium block">{p.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'publicada' ? 'bg-[#F0FFF0] text-[#4CAF50]' : 'bg-[#F5F5F5] text-[#999]'}`}>
              {p.status}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Tipo',
      render: (p: PropertyRow) => (
        <span className="text-sm text-[#666666] capitalize">{p.type}</span>
      ),
    },
    {
      header: 'Precio',
      render: (p: PropertyRow) => (
        <span className="text-sm text-[#333333] font-medium">
          {p.operation === 'alquiler'
            ? `${p.currency} ${p.price.toLocaleString()}/mes`
            : `${p.currency} ${p.price.toLocaleString()}`}
        </span>
      ),
    },
    {
      header: 'Ubicación',
      render: (p: PropertyRow) => (
        <span className="text-sm text-[#666666]">{p.location}</span>
      ),
    },
    {
      header: 'Operación',
      render: (p: PropertyRow) => (
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: operationColors[p.operation] ?? '#999' }}
        >
          {p.operation === 'venta' ? 'Venta' : 'Alquiler'}
        </span>
      ),
    },
    {
      header: 'Acciones',
      width: '120px',
      render: (p: PropertyRow) => (
        <div className="flex items-center gap-1">
          <a
            href={`/propiedades/${p.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666666] hover:bg-[#F5F5F5] hover:text-[#E53935] transition-colors"
            title="Ver en sitio"
          >
            <Eye size={14} />
          </a>
          <button
            onClick={() => openEdit(p)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666666] hover:bg-[#F5F5F5] hover:text-[#E53935] transition-colors"
            title="Editar"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setDeleteId(p.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666666] hover:bg-[#FFF5F5] hover:text-[#E53935] transition-colors"
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Propiedades"
        subtitle={`${properties.length} propiedades en total`}
        action={{ label: 'Nueva propiedad', icon: <Plus size={16} />, onClick: openNew }}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <AdminSearchBar value={search} onChange={setSearch} placeholder="Buscar propiedad..." />
        <select value={opFilter} onChange={e => setOpFilter(e.target.value)}
          className="border border-[#E0E0E0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#E53935] text-[#333333]">
          <option value="">Todas las operaciones</option>
          <option value="venta">Venta</option>
          <option value="alquiler">Alquiler</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="border border-[#E0E0E0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#E53935] text-[#333333]">
          <option value="">Todos los tipos</option>
          <option value="departamento">Departamento</option>
          <option value="casa">Casa</option>
          <option value="oficina">Oficina</option>
          <option value="terreno">Terreno</option>
          <option value="local">Local</option>
        </select>
      </div>

      <AdminTable
        columns={columns}
        rows={filtered}
        keyExtractor={p => p.id}
        loading={loading}
        emptyMessage="No se encontraron propiedades."
      />

      {/* Create / Edit modal */}
      <AdminModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Editar propiedad' : 'Nueva propiedad'}
        maxWidth="max-w-[800px]"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminFormField label="Título" required>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Ej: Departamento en Palermo" className={adminInputCls} />
          </AdminFormField>

          <AdminFormField label="Estado">
            <select value={form.status} onChange={e => set('status', e.target.value as FormState['status'])}
              className={adminInputCls}>
              <option value="publicada">Publicada</option>
              <option value="borrador">Borrador</option>
              <option value="archivada">Archivada</option>
            </select>
          </AdminFormField>

          <AdminFormField label="Tipo">
            <select value={form.type} onChange={e => set('type', e.target.value as FormState['type'])}
              className={adminInputCls}>
              <option value="departamento">Departamento</option>
              <option value="casa">Casa</option>
              <option value="oficina">Oficina</option>
              <option value="terreno">Terreno</option>
              <option value="local">Local</option>
            </select>
          </AdminFormField>

          <AdminFormField label="Operación">
            <select value={form.operation} onChange={e => set('operation', e.target.value as FormState['operation'])}
              className={adminInputCls}>
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
            </select>
          </AdminFormField>

          <AdminFormField label="Precio" required>
            <input type="number" value={form.price}
              onChange={e => set('price', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ej: 250000" className={adminInputCls} />
          </AdminFormField>

          <AdminFormField label="Moneda">
            <select value={form.currency} onChange={e => set('currency', e.target.value as 'USD' | 'ARS')}
              className={adminInputCls}>
              <option value="USD">USD</option>
              <option value="ARS">ARS</option>
            </select>
          </AdminFormField>

          <AdminFormField label="Ubicación">
            <input value={form.location} onChange={e => set('location', e.target.value)}
              placeholder="Ej: Palermo, CABA" className={adminInputCls} />
          </AdminFormField>

          <AdminFormField label="Dirección">
            <input value={form.address} onChange={e => set('address', e.target.value)}
              placeholder="Ej: Av. Santa Fe 1234" className={adminInputCls} />
          </AdminFormField>

          <AdminFormField label="Superficie (m²)">
            <input type="number" value={form.area}
              onChange={e => set('area', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ej: 120" className={adminInputCls} />
          </AdminFormField>

          <AdminFormField label="Dormitorios">
            <input type="number" value={form.bedrooms}
              onChange={e => set('bedrooms', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ej: 3" className={adminInputCls} />
          </AdminFormField>

          <AdminFormField label="Baños">
            <input type="number" value={form.bathrooms}
              onChange={e => set('bathrooms', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ej: 2" className={adminInputCls} />
          </AdminFormField>

          <AdminFormField label="Cocheras">
            <input type="number" value={form.parking}
              onChange={e => set('parking', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ej: 1" className={adminInputCls} />
          </AdminFormField>

          <AdminFormField label="Badge (etiqueta)">
            <input value={form.badge} onChange={e => set('badge', e.target.value)}
              placeholder="Ej: Nuevo, Destacado" className={adminInputCls} />
          </AdminFormField>

          <AdminFormField label="URL del mapa (embed)">
            <input value={form.map_url} onChange={e => set('map_url', e.target.value)}
              placeholder="https://maps.google.com/..." className={adminInputCls} />
          </AdminFormField>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input type="checkbox" id="featured" checked={form.featured}
            onChange={e => set('featured', e.target.checked)}
            className="w-4 h-4 accent-[#E53935]" />
          <label htmlFor="featured" className="text-sm text-[#333333]">Propiedad destacada (aparece primero en el sitio)</label>
        </div>

        {/* Imagen principal — sube a Supabase Storage */}
        <div className="mt-4">
          <MediaUploader
            label="Imagen principal"
            value={form.imageUrl}
            onChange={(url, file) => {
              set('imageUrl', url);
              set('imageFile', file ?? null);
            }}
            accept="image"
            previewRatio="aspect-video"
          />
        </div>

        <AdminFormField label="Amenities (separados por coma)" className="mt-4">
          <input value={form.amenities}
            onChange={e => set('amenities', e.target.value)}
            placeholder="Pileta, SUM, Parrilla, Gimnasio"
            className={adminInputCls} />
          {amenityCatalog.length > 0 && (
            <p className="text-xs text-[#999] mt-1">
              Disponibles: {amenityCatalog.map(a => a.name).join(', ')}
            </p>
          )}
        </AdminFormField>

        <AdminFormField label="Descripción" className="mt-4">
          <textarea rows={4} value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Descripción detallada de la propiedad..."
            className={`${adminInputCls} resize-none`} />
        </AdminFormField>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowForm(false)}
            className="px-5 py-2.5 text-sm text-[#666666] hover:text-[#333333] transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="bg-[#E53935] hover:bg-[#C62828] text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all hover:scale-[1.02] disabled:opacity-50">
            {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear propiedad'}
          </button>
        </div>
      </AdminModal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="¿Eliminar propiedad?"
        description="Esta acción eliminará la propiedad permanentemente y no se puede deshacer."
        loading={deleting}
      />
    </AdminLayout>
  );
}

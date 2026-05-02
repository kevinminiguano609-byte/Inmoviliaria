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
import type { Property } from '@/types';

const operationColors: Record<string, string> = {
  venta:    '#4CAF50',
  alquiler: '#2196F3',
};

type FormState = Partial<Omit<Property, 'id' | 'createdAt'>>;

const defaultForm: FormState = {
  operation: 'venta',
  type: 'departamento',
  currency: 'USD',
  amenities: [],
  gallery: [],
};

export default function AdminProperties() {
  const { properties, loading, addProperty, updateProperty, deleteProperty } = useProperty();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [opFilter, setOpFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Filtering ──────────────────────────────────────────────
  const filtered = properties.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (opFilter && p.operation !== opFilter) return false;
    if (typeFilter && p.type !== typeFilter) return false;
    return true;
  });

  // ── Form helpers ───────────────────────────────────────────
  const openNew = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const openEdit = (p: Property) => {
    setEditing(p);
    setForm({ ...p });
    setShowForm(true);
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.title?.trim() || !form.price) {
      showToast('Título y precio son obligatorios', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        title: form.title!,
        slug: editing?.slug ?? form.title!.toLowerCase().replace(/\s+/g, '-'),
        image: form.image || '/assets/prop-1.jpg',
        gallery: form.gallery ?? [],
        description: form.description ?? '',
        amenities: form.amenities ?? [],
        agent: form.agent ?? {
          name: 'Lic. Martina López',
          role: 'Agente',
          phone: '+54 11 4567-8901',
          avatar: '/assets/agent-avatar.jpg',
        },
        mapUrl: form.mapUrl ?? '',
        area: form.area ?? 0,
        price: form.price!,
        currency: form.currency ?? 'USD',
        operation: form.operation ?? 'venta',
        type: form.type ?? 'departamento',
        location: form.location ?? '',
        address: form.address ?? '',
      } satisfies Omit<Property, 'id' | 'createdAt'>;

      if (editing) {
        await updateProperty(editing.id, payload);
        showToast('Propiedad actualizada', 'success');
      } else {
        await addProperty(payload);
        showToast('Propiedad creada', 'success');
      }
      setShowForm(false);
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
    } finally {
      setDeleting(false);
    }
  };

  // ── Table columns ──────────────────────────────────────────
  const columns = [
    {
      header: 'Propiedad',
      render: (p: Property) => (
        <div className="flex items-center gap-3">
          <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          <span className="text-sm text-[#333333] font-medium">{p.title}</span>
        </div>
      ),
    },
    {
      header: 'Tipo',
      render: (p: Property) => (
        <span className="text-sm text-[#666666] capitalize">{p.type}</span>
      ),
    },
    {
      header: 'Precio',
      render: (p: Property) => (
        <span className="text-sm text-[#333333] font-medium">
          {p.operation === 'alquiler'
            ? `$${p.price.toLocaleString()}/mes`
            : `USD ${p.price.toLocaleString()}`}
        </span>
      ),
    },
    {
      header: 'Ubicación',
      render: (p: Property) => (
        <span className="text-sm text-[#666666]">{p.location}</span>
      ),
    },
    {
      header: 'Estado',
      render: (p: Property) => (
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
      render: (p: Property) => (
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
        <AdminSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar propiedad..."
        />
        <select
          value={opFilter}
          onChange={e => setOpFilter(e.target.value)}
          className="border border-[#E0E0E0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#E53935] text-[#333333]"
        >
          <option value="">Todas las operaciones</option>
          <option value="venta">Venta</option>
          <option value="alquiler">Alquiler</option>
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="border border-[#E0E0E0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#E53935] text-[#333333]"
        >
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
            <input
              value={form.title ?? ''}
              onChange={e => set('title', e.target.value)}
              placeholder="Ej: Departamento en Palermo"
              className={adminInputCls}
            />
          </AdminFormField>

          <AdminFormField label="Tipo">
            <select
              value={form.type ?? 'departamento'}
              onChange={e => set('type', e.target.value as Property['type'])}
              className={adminInputCls}
            >
              <option value="departamento">Departamento</option>
              <option value="casa">Casa</option>
              <option value="oficina">Oficina</option>
              <option value="terreno">Terreno</option>
              <option value="local">Local</option>
            </select>
          </AdminFormField>

          <AdminFormField label="Operación">
            <select
              value={form.operation ?? 'venta'}
              onChange={e => set('operation', e.target.value as Property['operation'])}
              className={adminInputCls}
            >
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
            </select>
          </AdminFormField>

          <AdminFormField label="Precio" required>
            <input
              type="number"
              value={form.price ?? ''}
              onChange={e => set('price', Number(e.target.value))}
              placeholder="Ej: 250000"
              className={adminInputCls}
            />
          </AdminFormField>

          <AdminFormField label="Ubicación">
            <input
              value={form.location ?? ''}
              onChange={e => set('location', e.target.value)}
              placeholder="Ej: Palermo, CABA"
              className={adminInputCls}
            />
          </AdminFormField>

          <AdminFormField label="Dirección">
            <input
              value={form.address ?? ''}
              onChange={e => set('address', e.target.value)}
              placeholder="Ej: Av. Santa Fe 1234"
              className={adminInputCls}
            />
          </AdminFormField>

          <AdminFormField label="Superficie (m²)">
            <input
              type="number"
              value={form.area ?? ''}
              onChange={e => set('area', Number(e.target.value))}
              placeholder="Ej: 120"
              className={adminInputCls}
            />
          </AdminFormField>

          <AdminFormField label="Dormitorios">
            <input
              type="number"
              value={form.bedrooms ?? ''}
              onChange={e => set('bedrooms', Number(e.target.value))}
              placeholder="Ej: 3"
              className={adminInputCls}
            />
          </AdminFormField>

          <AdminFormField label="Baños">
            <input
              type="number"
              value={form.bathrooms ?? ''}
              onChange={e => set('bathrooms', Number(e.target.value))}
              placeholder="Ej: 2"
              className={adminInputCls}
            />
          </AdminFormField>

          <AdminFormField label="Cocheras">
            <input
              type="number"
              value={form.parking ?? ''}
              onChange={e => set('parking', Number(e.target.value))}
              placeholder="Ej: 1"
              className={adminInputCls}
            />
          </AdminFormField>

          <AdminFormField label="Badge (etiqueta)">
            <input
              value={form.badge ?? ''}
              onChange={e => set('badge', e.target.value)}
              placeholder="Ej: Nuevo, Destacado"
              className={adminInputCls}
            />
          </AdminFormField>
        </div>

        <div className="mt-4">
          <MediaUploader
            label="Imagen principal"
            value={form.image ?? ''}
            onChange={url => set('image', url)}
            accept="image"
            previewRatio="aspect-video"
          />
        </div>

        <AdminFormField label="Amenities (separados por coma)" className="mt-4">
          <input
            value={(form.amenities ?? []).join(', ')}
            onChange={e =>
              set('amenities', e.target.value.split(',').map(s => s.trim()).filter(Boolean))
            }
            placeholder="Pileta, SUM, Parrilla, Gimnasio"
            className={adminInputCls}
          />
        </AdminFormField>

        <AdminFormField label="Descripción" className="mt-4">
          <textarea
            rows={4}
            value={form.description ?? ''}
            onChange={e => set('description', e.target.value)}
            placeholder="Descripción detallada de la propiedad..."
            className={`${adminInputCls} resize-none`}
          />
        </AdminFormField>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowForm(false)}
            className="px-5 py-2.5 text-sm text-[#666666] hover:text-[#333333] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#E53935] hover:bg-[#C62828] text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear propiedad'}
          </button>
        </div>
      </AdminModal>

      {/* Delete confirmation */}
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

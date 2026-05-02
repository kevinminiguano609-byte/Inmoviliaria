import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminModal from '@/components/admin/AdminModal';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import AdminFormField, { adminInputCls } from '@/components/admin/AdminFormField';
import MediaUploader from '@/components/admin/MediaUploader';
import { useTestimonial } from '@/contexts/TestimonialContext';
import { useToast } from '@/contexts/ToastContext';
import type { Testimonial } from '@/types';

type FormState = Omit<Testimonial, 'id'>;

const defaultForm: FormState = { name: '', role: '', quote: '', avatar: '' };

export default function AdminTestimonials() {
  const { testimonials, loading, addTestimonial, updateTestimonial, deleteTestimonial } =
    useTestimonial();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({ name: t.name, role: t.role, quote: t.quote, avatar: t.avatar });
    setShowForm(true);
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.quote.trim()) {
      showToast('Nombre y testimonio son obligatorios', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateTestimonial(editing.id, form);
        showToast('Testimonio actualizado', 'success');
      } else {
        await addTestimonial(form);
        showToast('Testimonio creado', 'success');
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
      await deleteTestimonial(deleteId);
      showToast('Testimonio eliminado', 'success');
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Persona',
      render: (t: Testimonial) => (
        <div className="flex items-center gap-3">
          {t.avatar ? (
            <img
              src={t.avatar}
              alt={t.name}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#E53935] flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {t.name[0]}
            </div>
          )}
          <div>
            <p className="text-sm text-[#333333] font-medium">{t.name}</p>
            <p className="text-xs text-[#999999]">{t.role}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Testimonio',
      render: (t: Testimonial) => (
        <p className="text-sm text-[#666666] line-clamp-2 max-w-[400px]">
          &ldquo;{t.quote}&rdquo;
        </p>
      ),
    },
    {
      header: 'Acciones',
      width: '90px',
      render: (t: Testimonial) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(t)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666666] hover:bg-[#F5F5F5] hover:text-[#E53935] transition-colors"
            title="Editar"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setDeleteId(t.id)}
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
        title="Testimonios"
        subtitle={`${testimonials.length} testimonios`}
        action={{ label: 'Nuevo testimonio', icon: <Plus size={16} />, onClick: openNew }}
      />

      <AdminTable
        columns={columns}
        rows={testimonials}
        keyExtractor={t => t.id}
        loading={loading}
        emptyMessage="No hay testimonios todavía."
      />

      {/* Create / Edit modal */}
      <AdminModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Editar testimonio' : 'Nuevo testimonio'}
      >
        <div className="space-y-4">
          <AdminFormField label="Nombre" required>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Ej: María García"
              className={adminInputCls}
            />
          </AdminFormField>

          <AdminFormField label="Rol / descripción">
            <input
              value={form.role}
              onChange={e => set('role', e.target.value)}
              placeholder="Ej: compró su departamento en Palermo"
              className={adminInputCls}
            />
          </AdminFormField>

          {/* Avatar — URL or file upload */}
          <MediaUploader
            label="Foto / Avatar"
            value={form.avatar}
            onChange={url => set('avatar', url)}
            accept="image"
            previewRatio="aspect-square"
          />

          <AdminFormField label="Testimonio" required>
            <textarea
              rows={4}
              value={form.quote}
              onChange={e => set('quote', e.target.value)}
              placeholder="El texto del testimonio del cliente..."
              className={`${adminInputCls} resize-none`}
            />
          </AdminFormField>
        </div>

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
            {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear testimonio'}
          </button>
        </div>
      </AdminModal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="¿Eliminar testimonio?"
        description="Esta acción eliminará el testimonio permanentemente."
        loading={deleting}
      />
    </AdminLayout>
  );
}

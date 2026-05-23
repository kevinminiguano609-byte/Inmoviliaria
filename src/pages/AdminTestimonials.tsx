/**
 * AdminTestimonials — conectado a Supabase
 *
 * BUGS CORREGIDOS:
 * 1. Usaba `type Testimonial` del frontend (campo: avatar) pero la BD
 *    usa avatar_url. Causaba que el avatar nunca se guardara.
 * 2. addTestimonial/updateTestimonial recibían el tipo incorrecto.
 * 3. La tabla mostraba t.avatar que no existe en TestimonialRow.
 */

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
import type { TestimonialRow, TestimonialInsert, TestimonialUpdate } from '@/types/supabase';

interface FormState {
  name:       string;
  role:       string;
  quote:      string;
  avatar_url: string;
  avatarFile: File | null;
}

const defaultForm: FormState = { name: '', role: '', quote: '', avatar_url: '', avatarFile: null };

export default function AdminTestimonials() {
  const { rawTestimonials: testimonials, loading, addTestimonial, updateTestimonial, deleteTestimonial, refresh } =
    useTestimonial();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<TestimonialRow | null>(null);
  const [form,     setForm]     = useState<FormState>(defaultForm);
  const [saving,   setSaving]   = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const openEdit = (t: TestimonialRow) => {
    setEditing(t);
    setForm({
      name:       t.name,
      role:       t.role ?? '',
      quote:      t.quote,
      avatar_url: t.avatar_url ?? '',
      avatarFile: null,
    });
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
      // Subir avatar si hay archivo
      let avatarUrl = form.avatar_url;
      if (form.avatarFile) {
        try {
          const { uploadFile } = await import('@/services/mediaService');
          const result = await uploadFile(form.avatarFile, 'avatars');
          avatarUrl = result.url;
        } catch (imgErr) {
          showToast('Advertencia: no se pudo subir el avatar. ' + (imgErr as Error).message, 'info');
        }
      }

      if (editing) {
        const payload: TestimonialUpdate = {
          name:       form.name,
          role:       form.role || null,
          quote:      form.quote,
          avatar_url: avatarUrl || null,
        };
        await updateTestimonial(editing.id, payload);
        showToast('Testimonio actualizado', 'success');
      } else {
        const payload: TestimonialInsert = {
          name:       form.name,
          role:       form.role || null,
          quote:      form.quote,
          avatar_url: avatarUrl || null,
          active:     true,
          sort_order: testimonials.length,
          storage_path: null,
        };
        await addTestimonial(payload);
        showToast('Testimonio creado', 'success');
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
      await deleteTestimonial(deleteId);
      showToast('Testimonio eliminado', 'success');
      setDeleteId(null);
    } catch (err) {
      showToast('Error al eliminar: ' + (err as Error).message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Persona',
      render: (t: TestimonialRow) => (
        <div className="flex items-center gap-3">
          {t.avatar_url ? (
            <img src={t.avatar_url} alt={t.name}
              className="w-10 h-10 rounded-full object-cover shrink-0" />
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
      render: (t: TestimonialRow) => (
        <p className="text-sm text-[#666666] line-clamp-2 max-w-[400px]">
          &ldquo;{t.quote}&rdquo;
        </p>
      ),
    },
    {
      header: 'Acciones',
      width: '90px',
      render: (t: TestimonialRow) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(t)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666666] hover:bg-[#F5F5F5] hover:text-[#E53935] transition-colors" title="Editar">
            <Pencil size={14} />
          </button>
          <button onClick={() => setDeleteId(t.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666666] hover:bg-[#FFF5F5] hover:text-[#E53935] transition-colors" title="Eliminar">
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

      <AdminTable columns={columns} rows={testimonials as TestimonialRow[]}
        keyExtractor={t => t.id} loading={loading} emptyMessage="No hay testimonios todavía." />

      <AdminModal open={showForm} onClose={() => setShowForm(false)}
        title={editing ? 'Editar testimonio' : 'Nuevo testimonio'}>
        <div className="space-y-4">
          <AdminFormField label="Nombre" required>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="Ej: María García" className={adminInputCls} />
          </AdminFormField>

          <AdminFormField label="Rol / descripción">
            <input value={form.role} onChange={e => set('role', e.target.value)}
              placeholder="Ej: compró su departamento en Palermo" className={adminInputCls} />
          </AdminFormField>

          <MediaUploader label="Foto / Avatar" value={form.avatar_url}
            onChange={(url, file) => { set('avatar_url', url); set('avatarFile', file ?? null); }}
            accept="image" previewRatio="aspect-square" />

          <AdminFormField label="Testimonio" required>
            <textarea rows={4} value={form.quote}
              onChange={e => set('quote', e.target.value)}
              placeholder="El texto del testimonio del cliente..."
              className={`${adminInputCls} resize-none`} />
          </AdminFormField>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowForm(false)}
            className="px-5 py-2.5 text-sm text-[#666666] hover:text-[#333333] transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="bg-[#E53935] hover:bg-[#C62828] text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all hover:scale-[1.02] disabled:opacity-50">
            {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear testimonio'}
          </button>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="¿Eliminar testimonio?" description="Esta acción eliminará el testimonio permanentemente." loading={deleting} />
    </AdminLayout>
  );
}

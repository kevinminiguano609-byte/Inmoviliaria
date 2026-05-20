/**
 * AdminBlog — conectado a Supabase
 *
 * BUGS CORREGIDOS:
 * 1. Usaba `type Article` del frontend (campos: date, author, readTime)
 *    que NO coinciden con BlogArticleRow (read_time, author_name, display_date).
 * 2. addArticle/updateArticle recibían Omit<Article,...> pero el contexto
 *    ahora espera BlogArticleInsert/BlogArticleUpdate.
 * 3. La tabla mostraba a.author y a.date que no existen en BlogArticleRow.
 *    Ahora usa a.author_name y a.display_date.
 */

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminSearchBar from '@/components/admin/AdminSearchBar';
import AdminTable from '@/components/admin/AdminTable';
import AdminModal from '@/components/admin/AdminModal';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import AdminFormField, { adminInputCls } from '@/components/admin/AdminFormField';
import MediaUploader from '@/components/admin/MediaUploader';
import { useBlog } from '@/contexts/BlogContext';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import type { BlogArticleRow, BlogArticleInsert, BlogArticleUpdate } from '@/types/supabase';

const categories = ['Tendencias', 'Consejos', 'Inversión', 'Legal', 'Decoración'];

interface FormState {
  title:     string;
  category:  string;
  status:    'publicado' | 'borrador';
  image:     string;
  imageFile: File | null;
  excerpt:   string;
  content:   string;
  read_time: string;
}

const defaultForm: FormState = {
  title: '', category: 'Tendencias', status: 'borrador',
  image: '', imageFile: null, excerpt: '', content: '', read_time: '5 min de lectura',
};

export default function AdminBlog() {
  const { rawArticles: articles, loading, addArticle, updateArticle, deleteArticle, refresh } = useBlog();
  const { showToast } = useToast();
  const { profile } = useAuth();

  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<BlogArticleRow | null>(null);
  const [form,     setForm]     = useState<FormState>(defaultForm);
  const [saving,   setSaving]   = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = (articles as BlogArticleRow[]).filter(a => {
    if (search    && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter && a.category !== catFilter) return false;
    return true;
  });

  const openNew = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const openEdit = (a: BlogArticleRow) => {
    setEditing(a);
    setForm({
      title:     a.title,
      category:  a.category ?? 'Tendencias',
      status:    a.status,
      image:     a.image ?? '',
      imageFile: null,
      excerpt:   a.excerpt ?? '',
      content:   a.content ?? '',
      read_time: a.read_time ?? '5 min de lectura',
    });
    setShowForm(true);
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      showToast('Título y contenido son obligatorios', 'error');
      return;
    }
    setSaving(true);
    try {
      // Subir imagen si hay archivo
      let imageUrl = form.image;
      if (form.imageFile) {
        try {
          const { uploadFile } = await import('@/services/mediaService');
          const result = await uploadFile(form.imageFile, 'blog-images');
          imageUrl = result.url;
        } catch (imgErr) {
          showToast('Advertencia: no se pudo subir la imagen. ' + (imgErr as Error).message, 'info');
        }
      }

      const authorName = profile?.full_name || 'Admin';

      if (editing) {
        const payload: BlogArticleUpdate = {
          title:       form.title,
          category:    form.category,
          status:      form.status,
          image:       imageUrl || null,
          excerpt:     form.excerpt || null,
          content:     form.content,
          read_time:   form.read_time || null,
          author_name: authorName,
        };
        await updateArticle(editing.id, payload);
        showToast('Artículo actualizado', 'success');
      } else {
        const payload: BlogArticleInsert = {
          title:       form.title,
          slug:        '',   // auto-generado por trigger
          category:    form.category,
          status:      form.status,
          image:       imageUrl || null,
          excerpt:     form.excerpt || null,
          content:     form.content,
          read_time:   form.read_time || null,
          author_name: authorName,
          author_id:   profile?.id ?? null,
        };
        await addArticle(payload);
        showToast('Artículo creado', 'success');
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
      await deleteArticle(deleteId);
      showToast('Artículo eliminado', 'success');
      setDeleteId(null);
    } catch (err) {
      showToast('Error al eliminar: ' + (err as Error).message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Artículo',
      render: (a: BlogArticleRow) => (
        <div className="flex items-center gap-3">
          {a.image ? (
            <img src={a.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-[#F5F5F5] shrink-0" />
          )}
          <span className="text-sm text-[#333333] font-medium line-clamp-1">{a.title}</span>
        </div>
      ),
    },
    {
      header: 'Categoría',
      render: (a: BlogArticleRow) => <span className="text-sm text-[#666666]">{a.category}</span>,
    },
    {
      header: 'Autor',
      render: (a: BlogArticleRow) => <span className="text-sm text-[#666666]">{a.author_name ?? 'Admin'}</span>,
    },
    {
      header: 'Fecha',
      render: (a: BlogArticleRow) => (
        <span className="text-sm text-[#999999]">
          {a.display_date ?? (a.published_at ? new Date(a.published_at).toLocaleDateString('es-AR') : '—')}
        </span>
      ),
    },
    {
      header: 'Estado',
      render: (a: BlogArticleRow) => (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
          a.status === 'publicado' ? 'bg-[#F0FFF0] text-[#4CAF50]' : 'bg-[#F5F5F5] text-[#999999]'
        }`}>
          {a.status === 'publicado' ? 'Publicado' : 'Borrador'}
        </span>
      ),
    },
    {
      header: 'Acciones',
      width: '90px',
      render: (a: BlogArticleRow) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(a)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666666] hover:bg-[#F5F5F5] hover:text-[#E53935] transition-colors" title="Editar">
            <Pencil size={14} />
          </button>
          <button onClick={() => setDeleteId(a.id)}
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
        title="Blog"
        subtitle={`${articles.length} artículos`}
        action={{ label: 'Nuevo artículo', icon: <Plus size={16} />, onClick: openNew }}
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <AdminSearchBar value={search} onChange={setSearch} placeholder="Buscar artículo..." />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="border border-[#E0E0E0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#E53935] text-[#333333]">
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <AdminTable columns={columns} rows={filtered} keyExtractor={a => a.id}
        loading={loading} emptyMessage="No se encontraron artículos." />

      <AdminModal open={showForm} onClose={() => setShowForm(false)}
        title={editing ? 'Editar artículo' : 'Nuevo artículo'} maxWidth="max-w-[800px]">
        <div className="space-y-4">
          <AdminFormField label="Título" required>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Título del artículo" className={adminInputCls} />
          </AdminFormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminFormField label="Categoría">
              <select value={form.category} onChange={e => set('category', e.target.value)} className={adminInputCls}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </AdminFormField>
            <AdminFormField label="Estado">
              <select value={form.status} onChange={e => set('status', e.target.value as 'publicado' | 'borrador')} className={adminInputCls}>
                <option value="borrador">Borrador</option>
                <option value="publicado">Publicado</option>
              </select>
            </AdminFormField>
          </div>

          <MediaUploader label="Imagen del artículo" value={form.image}
            onChange={(url, file) => { set('image', url); set('imageFile', file ?? null); }}
            accept="image" previewRatio="aspect-video" />

          <AdminFormField label="Extracto (máx 200 caracteres)">
            <textarea rows={2} maxLength={200} value={form.excerpt}
              onChange={e => set('excerpt', e.target.value)}
              placeholder="Breve descripción del artículo..."
              className={`${adminInputCls} resize-none`} />
          </AdminFormField>

          <AdminFormField label="Tiempo de lectura">
            <input value={form.read_time} onChange={e => set('read_time', e.target.value)}
              placeholder="Ej: 5 min de lectura" className={adminInputCls} />
          </AdminFormField>

          <AdminFormField label="Contenido" required>
            <textarea rows={10} value={form.content}
              onChange={e => set('content', e.target.value)}
              placeholder="Contenido completo del artículo..."
              className={`${adminInputCls} resize-none font-mono text-xs`} />
          </AdminFormField>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowForm(false)}
            className="px-5 py-2.5 text-sm text-[#666666] hover:text-[#333333] transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="bg-[#E53935] hover:bg-[#C62828] text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all hover:scale-[1.02] disabled:opacity-50">
            {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear artículo'}
          </button>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="¿Eliminar artículo?" description="Esta acción eliminará el artículo permanentemente." loading={deleting} />
    </AdminLayout>
  );
}

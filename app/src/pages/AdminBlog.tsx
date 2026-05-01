import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { useBlog } from '@/contexts/BlogContext';
import { useToast } from '@/contexts/ToastContext';
import type { Article } from '@/types';

const categories = ['Tendencias', 'Consejos', 'Inversión', 'Legal', 'Decoración'];

export default function AdminBlog() {
  const { articles, addArticle, updateArticle, deleteArticle } = useBlog();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState<Partial<Article>>({});

  const filtered = articles.filter(a => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter && a.category !== catFilter) return false;
    return true;
  });

  const openNew = () => {
    setEditing(null);
    setForm({ category: 'Tendencias', status: 'borrador' });
    setShowModal(true);
  };

  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({ ...a });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title || !form.content) return;
    const data: Article = {
      ...form,
      id: editing?.id || Date.now().toString(),
      slug: editing?.slug || form.title!.toLowerCase().replace(/\s+/g, '-'),
      image: form.image || '/assets/blog-featured.jpg',
      author: 'Admin',
      date: editing?.date || new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }),
      readTime: '5 min de lectura',
    } as Article;

    if (editing) {
      updateArticle(data);
      showToast('Artículo actualizado', 'success');
    } else {
      addArticle(data);
      showToast('Artículo creado', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteArticle(id);
    showToast('Artículo eliminado', 'success');
  };

  const toolbarButtons = [
    { icon: 'B', action: () => setForm(f => ({ ...f, content: (f.content || '') + '<strong></strong>' })) },
    { icon: 'I', action: () => setForm(f => ({ ...f, content: (f.content || '') + '<em></em>' })) },
    { icon: 'H', action: () => setForm(f => ({ ...f, content: (f.content || '') + '<h3></h3>' })) },
    { icon: 'L', action: () => setForm(f => ({ ...f, content: (f.content || '') + '<ul><li></li></ul>' })) },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-[28px] font-medium text-[#333333]">Blog</h2>
        <button onClick={openNew}
          className="bg-[#E53935] hover:bg-[#C62828] text-white font-medium text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:scale-[1.02] shrink-0">
          <Plus size={16} /> Nuevo art&iacute;culo
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
          <input type="text" placeholder="Buscar artículo..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border border-[#E0E0E0] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#E53935]" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="border border-[#E0E0E0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#E53935] text-[#333333]">
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F5F5F5]">
              {['Artículo', 'Categoría', 'Autor', 'Fecha', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-[#333333] uppercase tracking-wider px-6 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-b border-[#E0E0E0] hover:bg-[#FAFAFA] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={a.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <span className="text-sm text-[#333333] font-medium">{a.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[#666666]">{a.category}</td>
                <td className="px-6 py-4 text-sm text-[#666666]">{a.author}</td>
                <td className="px-6 py-4 text-sm text-[#999999]">{a.date}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${a.status === 'publicado' ? 'bg-[#F0FFF0] text-[#4CAF50]' : 'bg-[#F5F5F5] text-[#999999]'}`}>
                    {a.status === 'publicado' ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(a)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666666] hover:bg-[#F5F5F5] hover:text-[#E53935] transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(a.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666666] hover:bg-[#FFF5F5] hover:text-[#E53935] transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-8 w-full max-w-[800px] max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-[#666666] hover:text-[#333333]"><X size={24} /></button>
            <h3 className="text-xl font-medium text-[#333333] mb-6">{editing ? 'Editar artículo' : 'Nuevo artículo'}</h3>
            <div className="space-y-4">
              <input placeholder="Título" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none" />
              <select value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none text-[#333333]">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <textarea placeholder="Extracto (máx 200 caracteres)" rows={3} maxLength={200}
                value={form.excerpt || ''} onChange={e => setForm({ ...form, excerpt: e.target.value })}
                className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none resize-none" />
              <div>
                <div className="flex gap-2 mb-2">
                  {toolbarButtons.map((btn, i) => (
                    <button key={i} onClick={btn.action}
                      className="w-8 h-8 rounded border border-[#E0E0E0] flex items-center justify-center text-xs font-bold text-[#666666] hover:bg-[#F5F5F5]">
                      {btn.icon}
                    </button>
                  ))}
                </div>
                <textarea placeholder="Contenido del artículo..." rows={10}
                  value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })}
                  className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none resize-none font-mono" />
              </div>
              <select value={form.status || ''} onChange={e => setForm({ ...form, status: e.target.value as Article['status'] })}
                className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none text-[#333333]">
                <option value="borrador">Borrador</option>
                <option value="publicado">Publicado</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm text-[#666666]">Cancelar</button>
              <button onClick={handleSave}
                className="bg-[#E53935] hover:bg-[#C62828] text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all hover:scale-[1.02]">
                {editing ? 'Guardar cambios' : 'Guardar artículo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

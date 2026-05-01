import { useState } from 'react';
import { Search, Plus, Eye, Pencil, Trash2, X } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { useProperty } from '@/contexts/PropertyContext';
import { useToast } from '@/contexts/ToastContext';
import type { Property } from '@/types';

const statusColors: Record<string, string> = {
  disponible: '#4CAF50',
  reservado: '#FF9800',
  vendido: '#E53935',
  'en alquiler': '#2196F3',
};

export default function AdminProperties() {
  const { properties, addProperty, updateProperty, deleteProperty } = useProperty();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Property>>({});

  const filtered = properties.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && p.operation !== statusFilter) return false;
    if (typeFilter && p.type !== typeFilter) return false;
    return true;
  });

  const openNew = () => {
    setEditing(null);
    setForm({ operation: 'venta', type: 'departamento', currency: 'USD', amenities: [] });
    setShowModal(true);
  };

  const openEdit = (p: Property) => {
    setEditing(p);
    setForm({ ...p });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title || !form.price) return;
    const data: Property = {
      ...form,
      id: editing?.id || Date.now().toString(),
      slug: editing?.slug || form.title!.toLowerCase().replace(/\s+/g, '-'),
      image: form.image || '/assets/prop-1.jpg',
      gallery: form.gallery || [],
      description: form.description || '',
      amenities: form.amenities || [],
      agent: form.agent || { name: 'Lic. Martina López', role: 'Agente', phone: '+54 11 4567-8901', avatar: '/assets/agent-avatar.jpg' },
      mapUrl: form.mapUrl || '',
      createdAt: editing?.createdAt || new Date().toISOString().split('T')[0],
      area: form.area || 0,
    } as Property;

    if (editing) {
      updateProperty(data);
      showToast('Propiedad actualizada', 'success');
    } else {
      addProperty(data);
      showToast('Propiedad creada', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteProperty(id);
    setShowDelete(null);
    showToast('Propiedad eliminada', 'success');
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-[28px] font-medium text-[#333333]">Propiedades</h2>
        <button onClick={openNew}
          className="bg-[#E53935] hover:bg-[#C62828] text-white font-medium text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:scale-[1.02] shrink-0">
          <Plus size={16} /> Nueva propiedad
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
          <input type="text" placeholder="Buscar propiedad..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border border-[#E0E0E0] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#E53935]" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-[#E0E0E0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#E53935] text-[#333333]">
          <option value="">Todos los estados</option>
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F5F5F5]">
              {['Propiedad', 'Tipo', 'Precio', 'Ubicación', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-[#333333] uppercase tracking-wider px-6 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-[#E0E0E0] hover:bg-[#FAFAFA] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <span className="text-sm text-[#333333] font-medium">{p.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[#666666] capitalize">{p.type}</td>
                <td className="px-6 py-4 text-sm text-[#333333] font-medium">
                  {p.operation === 'alquiler' ? `$${p.price.toLocaleString()}/mes` : `USD ${p.price.toLocaleString()}`}
                </td>
                <td className="px-6 py-4 text-sm text-[#666666]">{p.location}</td>
                <td className="px-6 py-4">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: statusColors[p.operation] || '#999' }}>
                    {p.operation === 'venta' ? 'Disponible' : 'En alquiler'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666666] hover:bg-[#F5F5F5] hover:text-[#E53935] transition-colors">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => openEdit(p)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666666] hover:bg-[#F5F5F5] hover:text-[#E53935] transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setShowDelete(p.id)}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-8 w-full max-w-[800px] max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-[#666666] hover:text-[#333333]"><X size={24} /></button>
            <h3 className="text-xl font-medium text-[#333333] mb-6">{editing ? 'Editar propiedad' : 'Nueva propiedad'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Título" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })}
                className="border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none" />
              <select value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value as Property['type'] })}
                className="border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none text-[#333333]">
                <option value="departamento">Departamento</option><option value="casa">Casa</option><option value="oficina">Oficina</option><option value="terreno">Terreno</option><option value="local">Local</option>
              </select>
              <select value={form.operation || ''} onChange={e => setForm({ ...form, operation: e.target.value as Property['operation'] })}
                className="border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none text-[#333333]">
                <option value="venta">Venta</option><option value="alquiler">Alquiler</option>
              </select>
              <input type="number" placeholder="Precio" value={form.price || ''} onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                className="border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none" />
              <input placeholder="Ubicación" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })}
                className="border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none" />
              <input placeholder="Dirección" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })}
                className="border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none" />
              <input type="number" placeholder="Superficie total (m²)" value={form.area || ''} onChange={e => setForm({ ...form, area: Number(e.target.value) })}
                className="border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none" />
              <input type="number" placeholder="Dormitorios" value={form.bedrooms || ''} onChange={e => setForm({ ...form, bedrooms: Number(e.target.value) })}
                className="border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none" />
              <input type="number" placeholder="Baños" value={form.bathrooms || ''} onChange={e => setForm({ ...form, bathrooms: Number(e.target.value) })}
                className="border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none" />
              <input type="number" placeholder="Cocheras" value={form.parking || ''} onChange={e => setForm({ ...form, parking: Number(e.target.value) })}
                className="border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none" />
            </div>
            <textarea placeholder="Descripción" rows={4} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none mt-4 resize-none" />
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm text-[#666666] hover:text-[#333333] transition-colors">Cancelar</button>
              <button onClick={handleSave} className="bg-[#E53935] hover:bg-[#C62828] text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all hover:scale-[1.02]">
                {editing ? 'Guardar cambios' : 'Guardar propiedad'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDelete(null)} />
          <div className="relative bg-white rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-lg font-medium text-[#333333] mb-2">&iquest;Eliminar propiedad?</h3>
            <p className="text-sm text-[#666666] mb-6">Esta acci&oacute;n no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDelete(null)} className="px-5 py-2.5 text-sm text-[#666666]">Cancelar</button>
              <button onClick={() => handleDelete(showDelete)} className="bg-[#F44336] hover:bg-[#D32F2F] text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

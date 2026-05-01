import { useState } from 'react';
import { Search, Download, Eye } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { useLead } from '@/contexts/LeadContext';
import { useToast } from '@/contexts/ToastContext';

const statusColors: Record<string, { bg: string; text: string }> = {
  nuevo: { bg: '#FFF5F5', text: '#E53935' },
  contactado: { bg: '#F0F8FF', text: '#2196F3' },
  seguimiento: { bg: '#FFF8E1', text: '#FF9800' },
  cerrado: { bg: '#F0FFF0', text: '#4CAF50' },
  descartado: { bg: '#F5F5F5', text: '#999999' },
};

const statusOptions = ['Todos', 'Nuevo', 'Contactado', 'En seguimiento', 'Cerrado', 'Descartado'];

export default function AdminLeads() {
  const { leads, updateLeadStatus } = useLead();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const filtered = leads.filter(l => {
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'Todos' && l.status !== statusFilter.toLowerCase().replace(' en ', '')) return false;
    return true;
  });

  const exportCSV = () => {
    const headers = ['Nombre', 'Email', 'Telefono', 'Asunto', 'Mensaje', 'Propiedad', 'Fecha', 'Estado'];
    const rows = filtered.map(l => [l.name, l.email, l.phone, l.subject, l.message, l.propertyTitle || '', l.date, l.status]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads-lucero.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV descargado', 'success');
  };

  const leadDetail = leads.find(l => l.id === selectedLead);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[28px] font-medium text-[#333333]">Leads</h2>
          <p className="text-base text-[#666666]">{leads.length} leads totales</p>
        </div>
        <button onClick={exportCSV}
          className="border border-[#E53935] text-[#E53935] hover:bg-[#E53935] hover:text-white font-medium text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shrink-0">
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
          <input type="text" placeholder="Buscar lead..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border border-[#E0E0E0] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#E53935]" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-[#E0E0E0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#E53935] text-[#333333]">
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F5F5F5]">
              {['Nombre', 'Email', 'Teléfono', 'Asunto', 'Propiedad', 'Fecha', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-[#333333] uppercase tracking-wider px-6 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(lead => (
              <tr key={lead.id} className="border-b border-[#E0E0E0] hover:bg-[#FAFAFA] transition-colors">
                <td className="px-6 py-4 text-sm text-[#333333] font-medium">{lead.name}</td>
                <td className="px-6 py-4 text-sm text-[#666666]">{lead.email}</td>
                <td className="px-6 py-4 text-sm text-[#666666]">{lead.phone}</td>
                <td className="px-6 py-4 text-sm text-[#666666]">{lead.subject}</td>
                <td className="px-6 py-4 text-sm text-[#666666]">{lead.propertyTitle || '-'}</td>
                <td className="px-6 py-4 text-sm text-[#999999]">{lead.date}</td>
                <td className="px-6 py-4">
                  <select
                    value={lead.status}
                    onChange={e => updateLeadStatus(lead.id, e.target.value as import('@/types').Lead['status'])}
                    className="text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer outline-none"
                    style={{ backgroundColor: statusColors[lead.status]?.bg, color: statusColors[lead.status]?.text }}
                  >
                    {Object.keys(statusColors).map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => setSelectedLead(lead.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666666] hover:bg-[#F5F5F5] hover:text-[#E53935] transition-colors">
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {leadDetail && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedLead(null)} />
          <div className="relative bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-medium text-[#333333] mb-1">Lead de {leadDetail.name}</h3>
            <div className="space-y-3 mt-6 text-sm">
              <div><span className="font-medium text-[#666666]">Email:</span> <a href={`mailto:${leadDetail.email}`} className="text-[#E53935] hover:underline">{leadDetail.email}</a></div>
              <div><span className="font-medium text-[#666666]">Teléfono:</span> <a href={`tel:${leadDetail.phone}`} className="text-[#333333]">{leadDetail.phone}</a></div>
              <div><span className="font-medium text-[#666666]">Asunto:</span> {leadDetail.subject}</div>
              <div><span className="font-medium text-[#666666]">Propiedad:</span> {leadDetail.propertyTitle || 'No especificó'}</div>
              <div><span className="font-medium text-[#666666]">Fecha:</span> {leadDetail.date}</div>
              <div><span className="font-medium text-[#666666]">Mensaje:</span>
                <p className="mt-1 p-3 bg-[#F5F5F5] rounded-lg text-[#333333]">{leadDetail.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setSelectedLead(null)} className="px-5 py-2.5 text-sm text-[#666666]">Cerrar</button>
              <a href={`mailto:${leadDetail.email}`}
                className="bg-[#E53935] hover:bg-[#C62828] text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all">
                Enviar email
              </a>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

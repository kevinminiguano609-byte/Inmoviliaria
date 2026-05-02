import { useState } from 'react';
import { Download, Eye, Trash2 } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminSearchBar from '@/components/admin/AdminSearchBar';
import AdminTable from '@/components/admin/AdminTable';
import AdminModal from '@/components/admin/AdminModal';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useLead } from '@/contexts/LeadContext';
import { useToast } from '@/contexts/ToastContext';
import type { Lead } from '@/types';

const statusColors: Record<Lead['status'], { bg: string; text: string }> = {
  nuevo:       { bg: '#FFF5F5', text: '#E53935' },
  contactado:  { bg: '#F0F8FF', text: '#2196F3' },
  seguimiento: { bg: '#FFF8E1', text: '#FF9800' },
  cerrado:     { bg: '#F0FFF0', text: '#4CAF50' },
  descartado:  { bg: '#F5F5F5', text: '#999999' },
};

const statusOptions: Lead['status'][] = [
  'nuevo', 'contactado', 'seguimiento', 'cerrado', 'descartado',
];

export default function AdminLeads() {
  const { leads, loading, updateLeadStatus, deleteLead } = useLead();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | Lead['status']>('');
  const [viewId, setViewId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = leads.filter(l => {
    if (
      search &&
      !l.name.toLowerCase().includes(search.toLowerCase()) &&
      !l.email.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (statusFilter && l.status !== statusFilter) return false;
    return true;
  });

  const exportCSV = () => {
    const headers = ['Nombre', 'Email', 'Telefono', 'Asunto', 'Mensaje', 'Propiedad', 'Fecha', 'Estado'];
    const rows = filtered.map(l => [
      l.name, l.email, l.phone, l.subject, l.message,
      l.propertyTitle ?? '', l.date, l.status,
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${c}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV descargado', 'success');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteLead(deleteId);
      showToast('Lead eliminado', 'success');
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  const leadDetail = leads.find(l => l.id === viewId);

  const columns = [
    {
      header: 'Nombre',
      render: (l: Lead) => (
        <span className="text-sm text-[#333333] font-medium">{l.name}</span>
      ),
    },
    {
      header: 'Email',
      render: (l: Lead) => (
        <span className="text-sm text-[#666666]">{l.email}</span>
      ),
    },
    {
      header: 'Teléfono',
      render: (l: Lead) => (
        <span className="text-sm text-[#666666]">{l.phone}</span>
      ),
    },
    {
      header: 'Asunto',
      render: (l: Lead) => (
        <span className="text-sm text-[#666666]">{l.subject}</span>
      ),
    },
    {
      header: 'Propiedad',
      render: (l: Lead) => (
        <span className="text-sm text-[#666666]">{l.propertyTitle ?? '-'}</span>
      ),
    },
    {
      header: 'Fecha',
      render: (l: Lead) => (
        <span className="text-sm text-[#999999]">{l.date}</span>
      ),
    },
    {
      header: 'Estado',
      render: (l: Lead) => (
        <select
          value={l.status}
          onChange={e => updateLeadStatus(l.id, e.target.value as Lead['status'])}
          className="text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer outline-none"
          style={{
            backgroundColor: statusColors[l.status]?.bg,
            color: statusColors[l.status]?.text,
          }}
        >
          {statusOptions.map(s => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: 'Acciones',
      width: '90px',
      render: (l: Lead) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewId(l.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666666] hover:bg-[#F5F5F5] hover:text-[#E53935] transition-colors"
            title="Ver detalle"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => setDeleteId(l.id)}
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
        title="Leads"
        subtitle={`${leads.length} leads totales`}
        action={{
          label: 'Exportar CSV',
          icon: <Download size={16} />,
          onClick: exportCSV,
        }}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <AdminSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre o email..."
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as '' | Lead['status'])}
          className="border border-[#E0E0E0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#E53935] text-[#333333]"
        >
          <option value="">Todos los estados</option>
          {statusOptions.map(s => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <AdminTable
        columns={columns}
        rows={filtered}
        keyExtractor={l => l.id}
        loading={loading}
        emptyMessage="No se encontraron leads."
      />

      {/* Detail modal */}
      <AdminModal
        open={!!leadDetail}
        onClose={() => setViewId(null)}
        title={leadDetail ? `Lead — ${leadDetail.name}` : ''}
      >
        {leadDetail && (
          <div className="space-y-3 text-sm">
            {[
              { label: 'Email', value: <a href={`mailto:${leadDetail.email}`} className="text-[#E53935] hover:underline">{leadDetail.email}</a> },
              { label: 'Teléfono', value: <a href={`tel:${leadDetail.phone}`} className="text-[#333333]">{leadDetail.phone}</a> },
              { label: 'Asunto', value: leadDetail.subject },
              { label: 'Propiedad', value: leadDetail.propertyTitle ?? 'No especificó' },
              { label: 'Fecha', value: leadDetail.date },
            ].map(row => (
              <div key={row.label}>
                <span className="font-medium text-[#666666]">{row.label}: </span>
                {row.value}
              </div>
            ))}
            <div>
              <span className="font-medium text-[#666666]">Mensaje:</span>
              <p className="mt-1 p-3 bg-[#F5F5F5] rounded-lg text-[#333333] leading-relaxed">
                {leadDetail.message}
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setViewId(null)}
                className="px-5 py-2.5 text-sm text-[#666666]"
              >
                Cerrar
              </button>
              <a
                href={`mailto:${leadDetail.email}`}
                className="bg-[#E53935] hover:bg-[#C62828] text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all"
              >
                Enviar email
              </a>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="¿Eliminar lead?"
        description="Se eliminará este lead permanentemente."
        loading={deleting}
      />
    </AdminLayout>
  );
}

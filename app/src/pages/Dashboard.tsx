import { Link } from 'react-router-dom';
import { Building2, Users, MessageSquare, Eye } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { useDashboard } from '@/hooks/useDashboard';

const statusColors: Record<string, { bg: string; text: string }> = {
  nuevo:       { bg: '#FFF5F5', text: '#E53935' },
  contactado:  { bg: '#F0F8FF', text: '#2196F3' },
  seguimiento: { bg: '#FFF8E1', text: '#FF9800' },
  cerrado:     { bg: '#F0FFF0', text: '#4CAF50' },
  descartado:  { bg: '#F5F5F5', text: '#999999' },
};

export default function Dashboard() {
  const { stats, loading } = useDashboard();

  const statCards = [
    {
      icon: Building2,
      label: 'Total propiedades',
      value: loading ? '...' : (stats?.total_properties ?? 0),
      trend: '+12%',
      positive: true,
      href: '/admin/propiedades',
    },
    {
      icon: Users,
      label: 'Leads nuevos',
      value: loading ? '...' : (stats?.new_leads ?? 0),
      trend: '+8%',
      positive: true,
      href: '/admin/leads',
    },
    {
      icon: MessageSquare,
      label: 'Artículos publicados',
      value: loading ? '...' : (stats?.published_articles ?? 0),
      trend: '+5%',
      positive: true,
      href: '/admin/blog',
    },
    {
      icon: Eye,
      label: 'Leads este mes',
      value: loading ? '...' : (stats?.leads_this_month ?? 0),
      trend: '+15%',
      positive: true,
      href: null,
    },
  ];

  // Chart data: leads por mes (últimos 6 meses)
  const chartData = (stats?.leads_by_month as Array<{ month: string; value: number }> | undefined) ?? [
    { month: 'Ago', value: 0 },
    { month: 'Sep', value: 0 },
    { month: 'Oct', value: 0 },
    { month: 'Nov', value: 0 },
    { month: 'Dic', value: 0 },
    { month: 'Ene', value: 0 },
  ];
  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  // Recent leads
  const recentLeads = (stats?.recent_leads as Array<{
    id: string; name: string; email: string;
    subject: string; status: string; created_at: string;
  }> | undefined) ?? [];

  return (
    <AdminLayout>
      <h2 className="text-[28px] font-medium text-[#333333] mb-8">Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((s, i) => {
          const card = (
            <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
              <div className="w-10 h-10 rounded-full bg-[#FFF5F5] flex items-center justify-center mb-4">
                <s.icon size={20} className="text-[#E53935]" />
              </div>
              <p className="text-[28px] font-semibold text-[#333333]">{s.value}</p>
              <p className="text-sm text-[#666666] mb-1">{s.label}</p>
              <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                s.positive ? 'bg-[#F0FFF0] text-[#4CAF50]' : 'bg-[#FFF5F5] text-[#F44336]'
              }`}>
                {s.trend} vs mes pasado
              </span>
            </div>
          );
          return s.href ? (
            <Link key={i} to={s.href}>{card}</Link>
          ) : (
            <div key={i}>{card}</div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {[
          { label: 'Nueva propiedad', href: '/admin/propiedades', color: '#E53935' },
          { label: 'Nuevo artículo',  href: '/admin/blog',        color: '#2196F3' },
          { label: 'Ver leads',       href: '/admin/leads',       color: '#4CAF50' },
        ].map(a => (
          <Link
            key={a.href}
            to={a.href}
            className="flex items-center justify-center py-3 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 hover:scale-[1.01]"
            style={{ backgroundColor: a.color }}
          >
            {a.label}
          </Link>
        ))}
      </div>

      {/* Chart: Leads por mes */}
      <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-8">
        <h3 className="font-medium text-base text-[#333333] mb-6">Leads por mes</h3>
        <div className="flex items-end gap-4 md:gap-8 h-[240px] px-4">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center">
                <span className="text-xs text-[#666666] mb-1">{d.value}</span>
                <div
                  className="w-full max-w-[60px] bg-[#E53935] rounded-t-lg transition-all duration-500"
                  style={{ height: `${(d.value / maxValue) * 180}px`, minHeight: d.value > 0 ? '4px' : '0' }}
                />
              </div>
              <span className="text-xs text-[#666666]">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="p-6 flex items-center justify-between border-b border-[#E0E0E0]">
          <h3 className="font-medium text-base text-[#333333]">Leads recientes</h3>
          <Link to="/admin/leads" className="text-sm text-[#E53935] hover:underline font-medium">
            Ver todos
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F5F5]">
                {['Nombre', 'Email', 'Asunto', 'Fecha', 'Estado'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-[#333333] uppercase tracking-wider px-6 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#999999]">
                    Cargando...
                  </td>
                </tr>
              ) : recentLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#999999]">
                    No hay leads todavía.
                  </td>
                </tr>
              ) : (
                recentLeads.map(lead => (
                  <tr key={lead.id} className="border-b border-[#E0E0E0] hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-6 py-4 text-sm text-[#333333] font-medium">{lead.name}</td>
                    <td className="px-6 py-4 text-sm text-[#666666]">{lead.email}</td>
                    <td className="px-6 py-4 text-sm text-[#666666]">{lead.subject}</td>
                    <td className="px-6 py-4 text-sm text-[#999999]">
                      {new Date(lead.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: statusColors[lead.status]?.bg ?? '#F5F5F5',
                          color:           statusColors[lead.status]?.text ?? '#666666',
                        }}
                      >
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

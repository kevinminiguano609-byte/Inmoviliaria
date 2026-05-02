import { Building2, Users, CheckCircle, Eye, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import { useProperty } from '@/contexts/PropertyContext';
import { useLead } from '@/contexts/LeadContext';
import { useBlog } from '@/contexts/BlogContext';

const leadChartData = [
  { month: 'Ago', value: 12 },
  { month: 'Sep', value: 18 },
  { month: 'Oct', value: 15 },
  { month: 'Nov', value: 22 },
  { month: 'Dic', value: 20 },
  { month: 'Ene', value: 24 },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  nuevo:       { bg: '#FFF5F5', text: '#E53935' },
  contactado:  { bg: '#F0F8FF', text: '#2196F3' },
  seguimiento: { bg: '#FFF8E1', text: '#FF9800' },
  cerrado:     { bg: '#F0FFF0', text: '#4CAF50' },
  descartado:  { bg: '#F5F5F5', text: '#999999' },
};

export default function Dashboard() {
  const { properties } = useProperty();
  const { leads } = useLead();
  const { articles } = useBlog();

  const stats = [
    {
      icon: Building2,
      label: 'Total propiedades',
      value: properties.length,
      trend: '+12%',
      positive: true,
      href: '/admin/propiedades',
    },
    {
      icon: Users,
      label: 'Leads nuevos',
      value: leads.filter(l => l.status === 'nuevo').length,
      trend: '+8%',
      positive: true,
      href: '/admin/leads',
    },
    {
      icon: MessageSquare,
      label: 'Artículos publicados',
      value: articles.filter(a => a.status === 'publicado').length,
      trend: '+5%',
      positive: true,
      href: '/admin/blog',
    },
    {
      icon: Eye,
      label: 'Visitas web',
      value: '3,240',
      trend: '+15%',
      positive: true,
      href: null,
    },
  ];

  const maxValue = Math.max(...leadChartData.map(d => d.value));

  return (
    <AdminLayout>
      <h2 className="text-[28px] font-medium text-[#333333] mb-8">Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((s, i) => {
          const card = (
            <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
              <div className="w-10 h-10 rounded-full bg-[#FFF5F5] flex items-center justify-center mb-4">
                <s.icon size={20} className="text-[#E53935]" />
              </div>
              <p className="text-[28px] font-semibold text-[#333333]">{s.value}</p>
              <p className="text-sm text-[#666666] mb-1">{s.label}</p>
              <span
                className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                  s.positive ? 'bg-[#F0FFF0] text-[#4CAF50]' : 'bg-[#FFF5F5] text-[#F44336]'
                }`}
              >
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
          { label: 'Nuevo artículo', href: '/admin/blog', color: '#2196F3' },
          { label: 'Ver leads', href: '/admin/leads', color: '#4CAF50' },
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

      {/* Chart */}
      <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-8">
        <h3 className="font-medium text-base text-[#333333] mb-6">Leads por mes</h3>
        <div className="flex items-end gap-4 md:gap-8 h-[240px] px-4">
          {leadChartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center">
                <span className="text-xs text-[#666666] mb-1">{d.value}</span>
                <div
                  className="w-full max-w-[60px] bg-[#E53935] rounded-t-lg transition-all duration-500"
                  style={{ height: `${(d.value / maxValue) * 180}px` }}
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
          <Link
            to="/admin/leads"
            className="text-sm text-[#E53935] hover:underline font-medium"
          >
            Ver todos
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F5F5]">
                {['Nombre', 'Email', 'Asunto', 'Fecha', 'Estado'].map(h => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-[#333333] uppercase tracking-wider px-6 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 5).map(lead => (
                <tr
                  key={lead.id}
                  className="border-b border-[#E0E0E0] hover:bg-[#FAFAFA] transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-[#333333] font-medium">{lead.name}</td>
                  <td className="px-6 py-4 text-sm text-[#666666]">{lead.email}</td>
                  <td className="px-6 py-4 text-sm text-[#666666]">{lead.subject}</td>
                  <td className="px-6 py-4 text-sm text-[#999999]">{lead.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: statusColors[lead.status]?.bg ?? '#F5F5F5',
                        color: statusColors[lead.status]?.text ?? '#666666',
                      }}
                    >
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

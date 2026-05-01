import { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { useToast } from '@/contexts/ToastContext';

const tabs = ['General', 'Contacto', 'Redes sociales', 'Usuarios'];

export default function AdminSettings() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('General');

  const handleSave = () => {
    showToast('Cambios guardados correctamente', 'success');
  };

  return (
    <AdminLayout>
      <h2 className="text-[28px] font-medium text-[#333333] mb-6">Configuraci&oacute;n</h2>

      {/* Tabs */}
      <div className="flex border-b border-[#E0E0E0] mb-8 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab
                ? 'text-[#E53935] border-[#E53935]'
                : 'text-[#666666] border-transparent hover:text-[#333333]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="max-w-[600px]">
        {activeTab === 'General' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#333333] mb-1 block">Nombre del sitio</label>
              <input defaultValue="LUCERO"
                className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#333333] mb-1 block">Descripci&oacute;n del sitio</label>
              <textarea rows={3} defaultValue="Tu inmobiliaria de confianza en Buenos Aires."
                className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#333333] mb-1 block">Moneda por defecto</label>
              <select defaultValue="USD"
                className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none text-[#333333]">
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#333333] mb-1 block">Idioma</label>
              <select defaultValue="es"
                className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none text-[#333333]">
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'Contacto' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#333333] mb-1 block">Teléfono</label>
              <input defaultValue="+54 11 4567-8900"
                className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#333333] mb-1 block">Email</label>
              <input defaultValue="info@lucero.com"
                className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#333333] mb-1 block">Direcci&oacute;n</label>
              <input defaultValue="Av. Santa Fe 3200, Palermo, CABA"
                className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#333333] mb-1 block">Horario de atenci&oacute;n</label>
              <input defaultValue="Lun a Vie: 9:00 - 18:00 | Sáb: 10:00 - 14:00"
                className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#333333] mb-1 block">Número de WhatsApp</label>
              <input defaultValue="+54 9 11 4567-8900"
                className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#333333] mb-1 block">Email de notificaciones</label>
              <input defaultValue="admin@lucero.com"
                className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none" />
            </div>
          </div>
        )}

        {activeTab === 'Redes sociales' && (
          <div className="space-y-4">
            {['Instagram', 'Facebook', 'LinkedIn', 'YouTube'].map(social => (
              <div key={social}>
                <label className="text-sm font-medium text-[#333333] mb-1 block">{social}</label>
                <input placeholder={`https://${social.toLowerCase()}.com/lucero`}
                  className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none placeholder:text-[#999]" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Usuarios' && (
          <div>
            <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F5F5F5]">
                    {['Nombre', 'Email', 'Rol', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-[#333333] uppercase tracking-wider px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#E0E0E0]">
                    <td className="px-6 py-4 text-sm text-[#333333] font-medium">Admin</td>
                    <td className="px-6 py-4 text-sm text-[#666666]">admin@lucero.com</td>
                    <td className="px-6 py-4 text-sm text-[#666666]">Administrador</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#F0FFF0] text-[#4CAF50]">Activo</span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666666] hover:bg-[#F5F5F5] transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button onClick={handleSave}
            className="bg-[#E53935] hover:bg-[#C62828] text-white font-medium text-sm px-8 py-3 rounded-lg transition-all hover:scale-[1.02]">
            Guardar cambios
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

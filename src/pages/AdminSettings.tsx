import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { useToast } from '@/contexts/ToastContext';
import { useSettings } from '@/hooks/useSettings';

const tabs = ['General', 'Contacto', 'Redes sociales', 'Usuarios'];

export default function AdminSettings() {
  const { showToast } = useToast();
  const { settings, loading, save } = useSettings();
  const [activeTab, setActiveTab] = useState('General');
  const [saving, setSaving] = useState(false);

  // Estado local del formulario
  const [form, setForm] = useState({
    // General
    site_name:           '',
    site_tagline:        '',
    currency_default:    'USD',
    language:            'es',
    // Contacto
    contact_phone:       '',
    contact_email:       '',
    contact_address:     '',
    contact_hours:       '',
    whatsapp_number:     '',
    notification_email:  '',
    // Redes
    social_instagram:    '',
    social_facebook:     '',
    social_linkedin:     '',
    social_youtube:      '',
    social_tiktok:       '',
  });

  // Cargar settings en el formulario cuando llegan de Supabase
  useEffect(() => {
    if (!settings) return;
    setForm({
      site_name:          String(settings.site_name          ?? ''),
      site_tagline:       String(settings.site_tagline       ?? ''),
      currency_default:   String(settings.currency_default   ?? 'USD'),
      language:           String(settings.language           ?? 'es'),
      contact_phone:      String(settings.contact_phone      ?? ''),
      contact_email:      String(settings.contact_email      ?? ''),
      contact_address:    String(settings.contact_address    ?? ''),
      contact_hours:      String(settings.contact_hours      ?? ''),
      whatsapp_number:    String(settings.whatsapp_number    ?? ''),
      notification_email: String(settings.notification_email ?? ''),
      social_instagram:   String(settings.social_instagram   ?? ''),
      social_facebook:    String(settings.social_facebook    ?? ''),
      social_linkedin:    String(settings.social_linkedin    ?? ''),
      social_youtube:     String(settings.social_youtube     ?? ''),
      social_tiktok:      String(settings.social_tiktok      ?? ''),
    });
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await save(form as Record<string, string>);
      showToast('Cambios guardados correctamente', 'success');
    } catch {
      showToast('Error al guardar los cambios', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none transition-colors";

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#E53935] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

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
              <input
                value={form.site_name}
                onChange={e => setForm({ ...form, site_name: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#333333] mb-1 block">Descripci&oacute;n / Tagline</label>
              <textarea
                rows={3}
                value={form.site_tagline}
                onChange={e => setForm({ ...form, site_tagline: e.target.value })}
                className={`${inputCls} resize-none`}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#333333] mb-1 block">Moneda por defecto</label>
              <select
                value={form.currency_default}
                onChange={e => setForm({ ...form, currency_default: e.target.value })}
                className={inputCls}
              >
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#333333] mb-1 block">Idioma</label>
              <select
                value={form.language}
                onChange={e => setForm({ ...form, language: e.target.value })}
                className={inputCls}
              >
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'Contacto' && (
          <div className="space-y-4">
            {[
              { label: 'Teléfono',              key: 'contact_phone',      placeholder: '+593 990 332 764' },
              { label: 'Email',                 key: 'contact_email',      placeholder: 'info@empresa.com' },
              { label: 'Dirección',             key: 'contact_address',    placeholder: 'Av. Principal 123' },
              { label: 'Horario de atención',   key: 'contact_hours',      placeholder: 'Lun a Vie: 9:00 - 18:00' },
              { label: 'Número de WhatsApp',    key: 'whatsapp_number',    placeholder: '593990332764 (sin +)' },
              { label: 'Email de notificaciones', key: 'notification_email', placeholder: 'notif@empresa.com' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="text-sm font-medium text-[#333333] mb-1 block">{label}</label>
                <input
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Redes sociales' && (
          <div className="space-y-4">
            {[
              { label: 'Instagram', key: 'social_instagram', placeholder: 'https://instagram.com/...' },
              { label: 'Facebook',  key: 'social_facebook',  placeholder: 'https://facebook.com/...' },
              { label: 'LinkedIn',  key: 'social_linkedin',  placeholder: 'https://linkedin.com/...' },
              { label: 'TikTok',    key: 'social_tiktok',    placeholder: 'https://tiktok.com/...' },
              { label: 'YouTube',   key: 'social_youtube',   placeholder: 'https://youtube.com/...' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="text-sm font-medium text-[#333333] mb-1 block">{label}</label>
                <input
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Usuarios' && (
          <div>
            <p className="text-sm text-[#666666] mb-4">
              Gestión de usuarios disponible en Supabase Dashboard → Authentication → Users.
            </p>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#E53935] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#C62828] transition-colors"
            >
              Abrir Supabase Dashboard
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
              </svg>
            </a>
          </div>
        )}

        {activeTab !== 'Usuarios' && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#E53935] hover:bg-[#C62828] text-white font-medium text-sm px-8 py-3 rounded-lg transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

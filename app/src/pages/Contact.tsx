import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Send, CheckCircle } from 'lucide-react';
import PageLayout from '@/layouts/PageLayout';
import ScrollReveal from '@/components/ScrollReveal';
import { useLead } from '@/contexts/LeadContext';
import { useToast } from '@/contexts/ToastContext';

export default function Contact() {
  const { addLead } = useLead();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', privacy: false });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'El nombre es requerido';
    if (!form.email.trim()) e.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido';
    if (!form.message.trim()) e.message = 'El mensaje es requerido';
    if (!form.privacy) e.privacy = 'Debes aceptar la política de privacidad';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    addLead({
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: form.subject || 'Consulta general',
      message: form.message,
    });
    setSubmitted(true);
    showToast('¡Mensaje enviado! Te contactaremos en menos de 24 horas.', 'success');
  };

  return (
    <PageLayout>
      {/* Header */}
      <div className="bg-[#F5F5F5] pt-[70px]">
        <div className="max-w-[1360px] mx-auto px-5 md:px-10 py-12">
          <div className="flex items-center gap-2 text-sm text-[#666666] mb-4">
            <Link to="/" className="hover:text-[#E53935] transition-colors">Inicio</Link>
            <span>&gt;</span>
            <span className="text-[#333333] font-medium">Contacto</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-normal text-[#333333]">Contacto</h1>
          <p className="text-lg text-[#666666] mt-2">
            Estamos aqu&iacute; para ayudarte. Escribinos y un agente te responder&aacute; a la brevedad.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white py-16 md:py-20">
        <div className="max-w-[1360px] mx-auto px-5 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
            {/* Info */}
            <ScrollReveal>
              <h2 className="text-3xl md:text-[40px] font-normal text-[#333333] mb-4 leading-tight">
                Estemos en contacto
              </h2>
              <p className="text-base text-[#666666] mb-12 leading-relaxed">
                Nuestro equipo est&aacute; listo para responder tus consultas. Ya sea que quieras comprar, vender o alquilar, te ayudamos en cada paso.
              </p>

              <div className="space-y-8">
                {[
                  { icon: Phone, label: 'Teléfono', value: '+54 11 4567-8900', sub: 'Lun a Vie 9:00 - 18:00 | Sáb 10:00 - 14:00' },
                  { icon: Mail, label: 'Email', value: 'info@lucero.com', sub: 'Respondemos en menos de 24hs', href: 'mailto:info@lucero.com' },
                  { icon: MapPin, label: 'Oficina central', value: 'Av. Santa Fe 3200, Palermo, CABA', sub: 'Buenos Aires, Argentina' },
                  { icon: Phone, label: 'WhatsApp', value: '+54 9 11 4567-8900', sub: 'Respuesta inmediata', href: 'https://wa.me/5491145678900' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <item.icon size={24} className={item.label === 'WhatsApp' ? 'text-[#25D366] shrink-0 mt-0.5' : 'text-[#E53935] shrink-0 mt-0.5'} />
                    <div>
                      <p className="text-sm font-medium text-[#666666] mb-0.5">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-lg text-[#333333] hover:text-[#E53935] transition-colors">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-lg text-[#333333]">{item.value}</p>
                      )}
                      <p className="text-sm text-[#999999] mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <p className="font-medium text-base text-[#333333] mb-5">Seguinos</p>
                <div className="flex gap-3">
                  {['Instagram', 'Facebook', 'LinkedIn', 'YouTube'].map(s => (
                    <span key={s} className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#666666] text-xs font-medium hover:bg-[#E53935] hover:text-white hover:scale-105 transition-all cursor-pointer">
                      {s[0]}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Form */}
            <ScrollReveal delay={0.2}>
              {submitted ? (
                <div className="bg-[#F0FFF0] border border-[#4CAF50] rounded-xl p-8 text-center">
                  <CheckCircle size={48} className="text-[#4CAF50] mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-[#4CAF50] mb-2">&iexcl;Mensaje enviado!</h3>
                  <p className="text-base text-[#333333]">
                    Gracias por contactarnos. Un agente se comunicar&aacute; con vos en menos de 24 horas.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-normal text-[#333333] mb-2">Envianos un mensaje</h3>
                  <p className="text-sm text-[#666666] mb-8">
                    Complet&aacute; el formulario y te contactaremos a la brevedad.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input type="text" placeholder="Ej: María García" required
                          className={`w-full border rounded-lg px-4 py-3.5 text-base outline-none transition-colors placeholder:text-[#999] ${errors.name ? 'border-[#F44336]' : 'border-[#E0E0E0] focus:border-[#E53935]'}`}
                          value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        {errors.name && <p className="text-[#F44336] text-xs mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <input type="email" placeholder="Ej: maria@email.com" required
                          className={`w-full border rounded-lg px-4 py-3.5 text-base outline-none transition-colors placeholder:text-[#999] ${errors.email ? 'border-[#F44336]' : 'border-[#E0E0E0] focus:border-[#E53935]'}`}
                          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        {errors.email && <p className="text-[#F44336] text-xs mt-1">{errors.email}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input type="tel" placeholder="Ej: +54 11 0000-0000"
                        className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3.5 text-base outline-none transition-colors placeholder:text-[#999]"
                        value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                      <select required
                        className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3.5 text-base outline-none transition-colors text-[#333333]"
                        value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                        <option value="">Asunto</option>
                        <option value="Quiero comprar una propiedad">Quiero comprar una propiedad</option>
                        <option value="Quiero alquilar">Quiero alquilar</option>
                        <option value="Quiero vender mi propiedad">Quiero vender mi propiedad</option>
                        <option value="Necesito una tasación">Necesito una tasación</option>
                        <option value="Consulta general">Consulta general</option>
                      </select>
                    </div>
                    <div>
                      <textarea rows={6} placeholder="Contanos en qué podemos ayudarte..." required
                        className={`w-full border rounded-lg px-4 py-3.5 text-base outline-none transition-colors resize-none placeholder:text-[#999] ${errors.message ? 'border-[#F44336]' : 'border-[#E0E0E0] focus:border-[#E53935]'}`}
                        value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                      {errors.message && <p className="text-[#F44336] text-xs mt-1">{errors.message}</p>}
                    </div>
                    <div>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.privacy} onChange={e => setForm({ ...form, privacy: e.target.checked })}
                          className="mt-1 w-4 h-4 rounded border-[#E0E0E0] text-[#E53935] accent-[#E53935]" />
                        <span className="text-sm text-[#666666]">
                          Acepto la <span className="text-[#E53935]">pol&iacute;tica de privacidad</span> y el tratamiento de mis datos
                        </span>
                      </label>
                      {errors.privacy && <p className="text-[#F44336] text-xs mt-1">{errors.privacy}</p>}
                    </div>
                    <button type="submit"
                      className="w-full bg-[#E53935] hover:bg-[#C62828] text-white font-medium text-base py-4 rounded-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2">
                      Enviar mensaje <Send size={16} />
                    </button>
                  </form>
                </>
              )}
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="w-full h-[450px]">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.5120209434044!2d-58.41311168477063!3d-34.58868498046341!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcca83d2aa1521%3A0xc6a8ab5b3b0f5fa8!2sAv.%20Sta.%20Fe%203200%2C%20C1425%20CABA!5e0!3m2!1ses!2sar!4v1700000000000!5m2!1ses!2sar"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicación LUCERO"
        />
      </div>
    </PageLayout>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Home as HomeIcon, Building2, MapPin, DollarSign, Search,
  ShieldCheck, Clock, TrendingUp, ChevronDown, Phone, Mail,
  Send, CheckCircle
} from 'lucide-react';
import PageLayout from '@/layouts/PageLayout';
import ScrollReveal from '@/components/ScrollReveal';
import PropertyCard from '@/components/PropertyCard';
import { useProperty } from '@/contexts/PropertyContext';
import { useLead } from '@/contexts/LeadContext';
import { useToast } from '@/contexts/ToastContext';
import { useTestimonial } from '@/contexts/TestimonialContext';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  return (
    <PageLayout>
      <HeroSection />
      <FeaturedProperties />
      <BenefitsSection />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
      <ContactHomeSection />
    </PageLayout>
  );
}

/* ─── Hero ─── */
function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({ operation: '', type: '', location: '', price: '' });

  useEffect(() => {
    const img = heroRef.current?.querySelector('.hero-bg') as HTMLElement;
    if (img) {
      gsap.to(img, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }
    if (contentRef.current) {
      const els = contentRef.current.children;
      gsap.fromTo(els, { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.3, ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)', delay: 0.3 }
      );
    }
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-[600px] h-screen overflow-hidden flex items-center justify-center">
      <div className="hero-bg absolute inset-0 scale-110">
        <img src="/assets/hero-bg.jpg" alt="Propiedad de lujo" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
      <div ref={contentRef} className="relative z-10 text-center px-5 max-w-[900px] w-[90%]">
        <h1 className="text-white text-3xl md:text-5xl font-normal mb-4">
          Encuentra tu hogar ideal
        </h1>
        <p className="text-white/90 text-lg md:text-xl font-light mb-12 max-w-[600px] mx-auto">
          Más de 500 propiedades en las mejores ubicaciones. Te acompañamos en cada paso.
        </p>
        <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-3 flex flex-col md:flex-row gap-2 md:gap-0">
          <div className="flex-1 flex items-center gap-2 px-3 md:border-r border-[#E0E0E0]">
            <HomeIcon size={18} className="text-[#666666] shrink-0" />
            <select
              className="w-full bg-transparent text-[#333333] text-sm py-2 outline-none cursor-pointer"
              value={formData.operation}
              onChange={e => setFormData({ ...formData, operation: e.target.value })}
            >
              <option value="">&iquest;Qu&eacute; buscas?</option>
              <option value="comprar">Comprar</option>
              <option value="alquilar">Alquilar</option>
            </select>
          </div>
          <div className="flex-1 flex items-center gap-2 px-3 md:border-r border-[#E0E0E0]">
            <Building2 size={18} className="text-[#666666] shrink-0" />
            <select
              className="w-full bg-transparent text-[#333333] text-sm py-2 outline-none cursor-pointer"
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="">Tipo de propiedad</option>
              <option value="departamento">Departamento</option>
              <option value="casa">Casa</option>
              <option value="oficina">Oficina</option>
              <option value="terreno">Terreno</option>
            </select>
          </div>
          <div className="flex-1 flex items-center gap-2 px-3 md:border-r border-[#E0E0E0]">
            <MapPin size={18} className="text-[#666666] shrink-0" />
            <input
              type="text"
              placeholder="&iquest;D&oacute;nde?"
              className="w-full bg-transparent text-[#333333] text-sm py-2 outline-none placeholder:text-[#999999]"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="flex-1 flex items-center gap-2 px-3">
            <DollarSign size={18} className="text-[#666666] shrink-0" />
            <select
              className="w-full bg-transparent text-[#333333] text-sm py-2 outline-none cursor-pointer"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
            >
              <option value="">Precio</option>
              <option value="0-200000">Hasta USD 200.000</option>
              <option value="200000-500000">USD 200.000 - 500.000</option>
              <option value="500000-1000000">USD 500.000 - 1.000.000</option>
              <option value="1000000+">Más de USD 1.000.000</option>
            </select>
          </div>
          <Link
            to={`/propiedades?operation=${formData.operation}&type=${formData.type}&location=${formData.location}&price=${formData.price}`}
            className="bg-[#E53935] hover:bg-[#C62828] text-white font-medium text-sm px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Search size={18} /> Buscar
          </Link>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown size={24} className="text-white/60" />
      </div>
    </section>
  );
}

/* ─── Featured Properties ─── */
function FeaturedProperties() {
  const { properties } = useProperty();
  const featured = properties.slice(0, 6);

  return (
    <section className="bg-white py-20 md:py-32">
      <div className="max-w-[1360px] mx-auto px-5 md:px-10">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 mb-12">
            <h2 className="text-3xl md:text-[40px] font-normal text-[#333333] leading-tight">Propiedades destacadas</h2>
            <Link
              to="/propiedades"
              className="border border-[#E53935] text-[#E53935] hover:bg-[#E53935] hover:text-white font-medium text-base px-7 py-3 rounded-lg transition-all duration-300 text-center"
            >
              Ver todas
            </Link>
          </div>
        </ScrollReveal>
        <ScrollReveal stagger={0.15}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map(p => (
              <div key={p.id}><PropertyCard property={p} /></div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── Benefits ─── */
function BenefitsSection() {
  const benefits = [
    { icon: ShieldCheck, title: 'Seguridad en cada paso', desc: 'Te acompañamos en todo el proceso de compra o alquiler. Nuestros contratos están revisados por expertos legales para tu tranquilidad.' },
    { icon: Clock, title: 'Respuesta inmediata', desc: 'Nuestro equipo está disponible para responder tus consultas en menos de 30 minutos. Sabemos que el tiempo es clave en el mercado inmobiliario.' },
    { icon: TrendingUp, title: 'Asesoramiento profesional', desc: 'Contamos con más de 15 años de experiencia en el mercado. Te ayudamos a tomar la mejor decisión de inversión con análisis de mercado actualizados.' },
  ];

  return (
    <section className="bg-[#F5F5F5] py-20 md:py-32">
      <div className="max-w-[1360px] mx-auto px-5 md:px-10">
        <ScrollReveal>
          <h2 className="text-3xl md:text-[40px] font-normal text-[#333333] text-center mb-16 leading-tight">
            &iquest;Por qu&eacute; elegirnos?
          </h2>
        </ScrollReveal>
        <ScrollReveal stagger={0.2} className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {benefits.map((b, i) => (
            <div key={i} className="text-center md:text-left md:border-r md:last:border-r-0 border-[#E0E0E0] md:px-8 first:md:pl-0 last:md:pr-0">
              <b.icon size={48} className="text-[#E53935] mx-auto md:mx-0 mb-6" />
              <h4 className="text-lg font-medium text-[#333333] mb-3">{b.title}</h4>
              <p className="text-base text-[#666666] leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── Stats ─── */
function StatsSection() {
  const statsRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        if (hasAnimated.current) return;
        hasAnimated.current = true;
        const counters = el.querySelectorAll('.stat-number');
        counters.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-target') || '0');
          const suffix = counter.getAttribute('data-suffix') || '';
          gsap.to(counter, {
            innerText: target,
            duration: 2,
            ease: 'power2.out',
            snap: { innerText: 1 },
            onUpdate: function () {
              const val = Math.round(parseFloat(counter.textContent || '0'));
              counter.textContent = val + suffix;
            },
          });
        });
      },
    });
    return () => st.kill();
  }, []);

  const stats = [
    { target: 500, suffix: '+', label: 'Propiedades gestionadas' },
    { target: 1200, suffix: '+', label: 'Clientes satisfechos' },
    { target: 15, suffix: '+', label: 'Años de experiencia' },
    { target: 98, suffix: '%', label: 'Tasa de satisfacción' },
  ];

  return (
    <section ref={statsRef} className="bg-[#333333] py-16 md:py-20">
      <div className="max-w-[1360px] mx-auto px-5 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i} className={`${i < stats.length - 1 ? 'md:border-r md:border-white/20' : ''}`}>
              <div
                className="stat-number text-4xl md:text-5xl font-light text-white"
                data-target={s.target}
                data-suffix={s.suffix}
              >
                0{s.suffix}
              </div>
              <p className="text-base mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function TestimonialsSection() {
  const { testimonials } = useTestimonial();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActive(prev => (prev + 1) % testimonials.length), 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-[#1A1A1A] py-20 md:py-32">
      <div className="max-w-[1000px] mx-auto px-5 md:px-10 text-center">
        <ScrollReveal>
          <h2 className="text-3xl md:text-[40px] font-normal text-white mb-16 leading-tight">
            Lo que dicen nuestros clientes
          </h2>
        </ScrollReveal>
        <div className="relative min-h-[280px]">
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              className={`transition-opacity duration-500 absolute inset-0 flex flex-col items-center justify-center ${
                i === active ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={t.avatar}
                alt={t.name}
                className="w-20 h-20 rounded-full object-cover border-[3px] border-[#E53935] mb-6"
              />
              <p className="relative text-lg md:text-xl text-white italic max-w-[700px] leading-relaxed px-8">
                <span className="absolute -top-4 -left-2 text-5xl font-light text-[#E53935]/30">&ldquo;</span>
                {t.quote}
              </p>
              <p className="text-base font-medium text-white mt-6">{t.name}</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{t.role}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                i === active ? 'bg-[#E53935]' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTASection() {
  return (
    <section className="bg-[#E53935] py-16 md:py-20">
      <div className="max-w-[800px] mx-auto px-5 text-center">
        <ScrollReveal>
          <h2 className="text-2xl md:text-4xl font-normal text-white mb-4">
            &iquest;Listo para encontrar tu propiedad ideal?
          </h2>
          <p className="text-lg font-light text-white/90 mb-8">
            Nuestro equipo de expertos está listo para ayudarte. Contáctanos hoy y comienza tu búsqueda.
          </p>
          <Link
            to="/contacto"
            className="inline-block bg-white text-[#E53935] font-medium text-base px-8 py-4 rounded-lg hover:bg-[#F5F5F5] transition-all duration-300 hover:scale-[1.02]"
          >
            Contáctanos ahora
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── Contact (Home section) ─── */
function ContactHomeSection() {
  const { addLead } = useLead();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'El nombre es requerido';
    if (!form.email.trim()) e.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido';
    if (!form.message.trim()) e.message = 'El mensaje es requerido';
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
    showToast('¡Mensaje enviado! Te contactaremos pronto.', 'success');
  };

  return (
    <section className="bg-white py-20 md:py-32">
      <div className="max-w-[1360px] mx-auto px-5 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info */}
          <ScrollReveal>
            <h2 className="text-3xl md:text-[40px] font-normal text-[#333333] mb-8 leading-tight">Hablemos</h2>
            <div className="space-y-6">
              {[
                { icon: Phone, text: '+593 990 332 764' },
                { icon: Mail, text: 'Infinity.inmoconstruct@gmail.com' },
                { icon: MapPin, text: 'Riobamba Av. Tarqui y Orozco' },
                { icon: Clock, text: 'Lun a Vie: 9:00 - 18:00 | Sáb: 10:00 - 14:00' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon size={20} className="text-[#E53935] shrink-0" />
                  <span className="text-base text-[#333333]">{item.text}</span>
                </div>
              ))}
            </div>
            <div className="mt-12">
  <p className="font-medium text-base text-[#333333] mb-4">Síguenos</p>
  <div className="flex gap-4">
    {[
      { name: 'Instagram', url: 'https://www.instagram.com/infinity_inmoconst/' },
      { name: 'Facebook', url: 'https://www.facebook.com/infinity.inmobiliaria.constructora.2025' },
      { name: 'LinkedIn', url: 'https://linkedin.com/in/tuusuario' },
      { name: 'Tik Tok', url: 'https://www.tiktok.com/@infinity.inmobili' }
    ].map(s => (
      <a
        key={s.name}
        href={s.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#666666] hover:text-[#E53935] transition-colors cursor-pointer text-sm"
      >
        {s.name}
      </a>
    ))}
  </div>
</div>
          </ScrollReveal>

          {/* Form */}
          <ScrollReveal delay={0.2}>
            {submitted ? (
              <div className="bg-[#F0FFF0] border border-[#4CAF50] rounded-xl p-6 flex items-start gap-3">
                <CheckCircle size={24} className="text-[#4CAF50] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#4CAF50] font-medium mb-1">&iexcl;Mensaje enviado!</p>
                  <p className="text-sm text-[#333333]">Te contactaremos en breve.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      className={`w-full border rounded-lg px-4 py-3.5 text-base outline-none transition-colors placeholder:text-[#999999] ${
                        errors.name ? 'border-[#F44336]' : 'border-[#E0E0E0] focus:border-[#E53935]'
                      }`}
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                    {errors.name && <p className="text-[#F44336] text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      className={`w-full border rounded-lg px-4 py-3.5 text-base outline-none transition-colors placeholder:text-[#999999] ${
                        errors.email ? 'border-[#F44336]' : 'border-[#E0E0E0] focus:border-[#E53935]'
                      }`}
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                    {errors.email && <p className="text-[#F44336] text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="+593 934 234 132"
                    className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3.5 text-base outline-none transition-colors placeholder:text-[#999999]"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                  <select
                    className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3.5 text-base outline-none transition-colors text-[#333333]"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                  >
                    <option value="">Asunto</option>
                    <option value="Quiero comprar">Quiero comprar</option>
                    <option value="Quiero alquilar">Quiero alquilar</option>
                    <option value="Quiero vender">Quiero vender</option>
                    <option value="Consulta general">Consulta general</option>
                  </select>
                </div>
                <div>
                  <textarea
                    rows={5}
                    placeholder="Contanos qu&eacute; est&aacute;s buscando..."
                    className={`w-full border rounded-lg px-4 py-3.5 text-base outline-none transition-colors resize-none placeholder:text-[#999999] ${
                      errors.message ? 'border-[#F44336]' : 'border-[#E0E0E0] focus:border-[#E53935]'
                    }`}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                  />
                  {errors.message && <p className="text-[#F44336] text-xs mt-1">{errors.message}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#E53935] hover:bg-[#C62828] text-white font-medium text-base py-4 rounded-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  Enviar mensaje <Send size={16} />
                </button>
              </form>
            )}
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

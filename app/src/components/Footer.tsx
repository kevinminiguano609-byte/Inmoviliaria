import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="max-w-[1360px] mx-auto px-5 md:px-10 py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Link to="/" className="flex items-center">
              <Logo className="h-10 w-auto object-contain" />
            </Link>
            <p className="text-sm mt-4 max-w-[280px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Tu inmobiliaria de confianza en Buenos Aires. Más de 15 años ayudando a familias y empresas a encontrar su lugar ideal.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-base mb-5">Navegación</h4>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Inicio', path: '/' },
                { label: 'Propiedades', path: '/propiedades' },
                { label: 'Blog', path: '/blog' },
                { label: 'Contacto', path: '/contacto' },
              ].map(link => (
                <Link key={link.path} to={link.path} className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-base mb-5">Servicios</h4>
            <div className="flex flex-col gap-3">
              {['Compra', 'Alquiler', 'Venta', 'Tasaciones', 'Asesoramiento legal'].map(s => (
                <span key={s} className="text-sm cursor-default" style={{ color: 'rgba(255,255,255,0.6)' }}>{s}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-base mb-5">Contacto</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <Phone size={14} /> +593 990332764
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <Mail size={14} /> Infinity.inmoconstruct@gmail.com
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <MapPin size={14} />Riobamba Av. Tarqui y Orozco 
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              {['Instagram', 'Facebook', 'LinkedIn', 'Tik Tok'].map(social => (
                <span key={social} className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#E53935]" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{social[0]}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            &copy; 2026 Infynity Inmobiliaria - Constructora. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span className="hover:text-white cursor-pointer transition-colors">Política de privacidad</span>
            <span className="hover:text-white cursor-pointer transition-colors">Términos de uso</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

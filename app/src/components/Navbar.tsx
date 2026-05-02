import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { label: 'Inicio', path: '/' },
  { label: 'Propiedades', path: '/propiedades' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contacto', path: '/contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isTransparent = isHome && !scrolled;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-[70px] transition-all duration-300"
        style={{
          backgroundColor: isTransparent ? 'transparent' : '#FFFFFF',
          boxShadow: isTransparent ? 'none' : '0 1px 0 rgba(0,0,0,0.05)',
        }}
      >
        <div className="max-w-[1360px] mx-auto px-5 md:px-10 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img
              src="public/assets/logo_3.png"
              alt="Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="text-base font-normal transition-colors duration-200 hover:text-[#E53935]"
                style={{
                  color: location.pathname === link.path ? '#E53935' : isTransparent ? '#fff' : '#333333',
                  borderBottom: location.pathname === link.path ? '2px solid #E53935' : '2px solid transparent',
                  paddingBottom: '4px',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {/* Admin access — icon button, always visible */}
            <Link
              to="/admin"
              title={isAuthenticated ? 'Ir al panel admin' : 'Iniciar sesión en admin'}
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                color: isTransparent ? 'rgba(255,255,255,0.7)' : '#999999',
                backgroundColor: isTransparent ? 'rgba(255,255,255,0.1)' : '#F5F5F5',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#E53935';
                (e.currentTarget as HTMLElement).style.backgroundColor = '#FFF5F5';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = isTransparent ? 'rgba(255,255,255,0.7)' : '#999999';
                (e.currentTarget as HTMLElement).style.backgroundColor = isTransparent ? 'rgba(255,255,255,0.1)' : '#F5F5F5';
              }}
            >
              <LayoutDashboard size={17} />
            </Link>

            <Link
              to="/contacto"
              className="bg-[#E53935] hover:bg-[#C62828] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Contactar
            </Link>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ color: isTransparent ? '#fff' : '#333' }}
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-white pt-[70px]">
          <div className="flex flex-col p-6 gap-4">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="text-lg py-3 border-b border-[#E0E0E0]"
                style={{ color: location.pathname === link.path ? '#E53935' : '#333333' }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/contacto"
              className="bg-[#E53935] text-white text-center font-medium py-3 rounded-lg mt-4"
              onClick={() => setMobileOpen(false)}
            >
              Contactar
            </Link>
            {/* Admin link in mobile menu */}
            <Link
              to="/admin"
              className="flex items-center justify-center gap-2 border border-[#E0E0E0] text-[#666666] text-sm font-medium py-3 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              <LayoutDashboard size={16} />
              {isAuthenticated ? 'Panel Admin' : 'Acceso Admin'}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

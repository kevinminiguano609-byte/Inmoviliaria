import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, FileText, Settings, LogOut,
  Bell, Search, Menu, MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { label: 'Dashboard',     icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Propiedades',   icon: Building2,        path: '/admin/propiedades' },
  { label: 'Leads',         icon: Users,            path: '/admin/leads' },
  { label: 'Blog',          icon: FileText,         path: '/admin/blog' },
  { label: 'Testimonios',   icon: MessageSquare,    path: '/admin/testimonios' },
  { label: 'Configuración', icon: Settings,         path: '/admin/configuracion' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-[90] lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-[260px] bg-white border-r border-[#E0E0E0] z-[100] transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-[#E0E0E0]">
          <Link to="/" className="flex items-center gap-2">
            <img
               src="public/assets/logoCreator_imagetologo_infinity.jpg"
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
          </Link>
          <p className="text-xs text-[#999] mt-1">Panel de administración</p>
        </div>

        <nav className="py-4 flex-1">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#FFF5F5] text-[#E53935] border-l-[3px] border-[#E53935]'
                    : 'text-[#666666] hover:bg-[#F5F5F5] hover:text-[#333333]'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#E0E0E0] p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E53935] flex items-center justify-center text-white text-sm font-semibold">A</div>
            <div>
              <p className="text-sm font-medium text-[#333333]">Admin</p>
              <p className="text-xs text-[#999999]">admin@lucero.com</p>
            </div>
            <button onClick={handleLogout} className="ml-auto text-[#666666] hover:text-[#E53935] transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-[260px] min-h-screen">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-[#E0E0E0] flex items-center justify-between px-6 lg:px-8">
          <button className="lg:hidden p-2 text-[#333333]" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-medium text-[#333333]">
            {menuItems.find(m => m.path === location.pathname)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <button className="text-[#666666] hover:text-[#333333] transition-colors">
              <Search size={20} />
            </button>
            <button className="text-[#666666] hover:text-[#333333] transition-colors relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E53935] text-white text-[10px] rounded-full flex items-center justify-center font-medium">3</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

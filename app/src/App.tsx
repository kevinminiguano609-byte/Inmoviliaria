import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { PropertyProvider } from '@/contexts/PropertyContext';
import { LeadProvider } from '@/contexts/LeadContext';
import { BlogProvider } from '@/contexts/BlogContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

import Home from '@/pages/Home';
import Properties from '@/pages/Properties';
import PropertyDetail from '@/pages/PropertyDetail';
import Blog from '@/pages/Blog';
import Contact from '@/pages/Contact';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import AdminProperties from '@/pages/AdminProperties';
import AdminLeads from '@/pages/AdminLeads';
import AdminBlog from '@/pages/AdminBlog';
import AdminSettings from '@/pages/AdminSettings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function AdminRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;
  return <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <PropertyProvider>
        <LeadProvider>
          <BlogProvider>
            <ToastProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/propiedades" element={<Properties />} />
                <Route path="/propiedades/:slug" element={<PropertyDetail />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/contacto" element={<Contact />} />

                {/* Admin routes */}
                <Route path="/admin" element={<AdminRoute />} />
                <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/admin/propiedades" element={<ProtectedRoute><AdminProperties /></ProtectedRoute>} />
                <Route path="/admin/leads" element={<ProtectedRoute><AdminLeads /></ProtectedRoute>} />
                <Route path="/admin/blog" element={<ProtectedRoute><AdminBlog /></ProtectedRoute>} />
                <Route path="/admin/configuracion" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ToastProvider>
          </BlogProvider>
        </LeadProvider>
      </PropertyProvider>
    </AuthProvider>
  );
}

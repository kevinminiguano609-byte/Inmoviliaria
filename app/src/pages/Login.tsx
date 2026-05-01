import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@lucero.com');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (login(email, password)) {
      navigate('/admin');
    } else {
      setError('Email o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-10 md:p-12 w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12l4 6-10 13L2 9z"/>
            </svg>
            <span className="text-2xl font-semibold text-[#333333] tracking-wide">LUCERO</span>
          </div>
          <p className="text-base text-[#666666]">Panel de administraci&oacute;n</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@lucero.com"
            className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3.5 text-base outline-none transition-colors"
          />
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3.5 text-base outline-none transition-colors pr-12"
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#333333]">
              {showPass ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-[#FFF5F5] border border-[#F44336] rounded-lg px-4 py-3 text-sm text-[#F44336]">
              {error}
            </div>
          )}

          <button type="submit"
            className="w-full bg-[#E53935] hover:bg-[#C62828] text-white font-medium py-3.5 rounded-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]">
            Iniciar sesi&oacute;n
          </button>
        </form>

        <p className="text-xs text-[#999999] text-center mt-6">
          Para acceder: admin@lucero.com / admin123
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';

export default function Login() {
  const { login, sendPasswordReset } = useAuth();
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [resetMode,  setResetMode]  = useState(false);
  const [resetSent,  setResetSent]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        navigate('/admin/dashboard');
      } else {
        setError('Email o contraseña incorrectos');
      }
    } catch {
      setError('Error al iniciar sesión. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Ingresá tu email'); return; }
    setLoading(true);
    setError('');
    try {
      await sendPasswordReset(email);
      setResetSent(true);
    } catch {
      setError('No se pudo enviar el email. Verificá la dirección.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-10 md:p-12 w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <Logo className="h-12 w-auto object-contain" />
          </div>
          <p className="text-base text-[#666666]">Panel de administraci&oacute;n</p>
        </div>

        {resetMode ? (
          /* ── Recuperar contraseña ── */
          resetSent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-[#F0FFF0] flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <p className="text-[#333333] font-medium mb-2">Email enviado</p>
              <p className="text-sm text-[#666666] mb-6">
                Revisá tu bandeja de entrada para restablecer tu contraseña.
              </p>
              <button
                onClick={() => { setResetMode(false); setResetSent(false); }}
                className="text-[#E53935] text-sm font-medium hover:underline"
              >
                Volver al login
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="text-sm text-[#666666] mb-4">
                Ingresá tu email y te enviaremos un link para restablecer tu contraseña.
              </p>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3.5 text-base outline-none transition-colors"
              />
              {error && (
                <div className="bg-[#FFF5F5] border border-[#F44336] rounded-lg px-4 py-3 text-sm text-[#F44336]">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E53935] hover:bg-[#C62828] text-white font-medium py-3.5 rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar link'}
              </button>
              <button
                type="button"
                onClick={() => { setResetMode(false); setError(''); }}
                className="w-full text-sm text-[#666666] hover:text-[#333333] transition-colors"
              >
                Volver al login
              </button>
            </form>
          )
        ) : (
          /* ── Login normal ── */
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3.5 text-base outline-none transition-colors"
            />
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                required
                className="w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3.5 text-base outline-none transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#333333]"
              >
                {showPass ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M3 3l18 18"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-[#FFF5F5] border border-[#F44336] rounded-lg px-4 py-3 text-sm text-[#F44336]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E53935] hover:bg-[#C62828] text-white font-medium py-3.5 rounded-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

            <button
              type="button"
              onClick={() => { setResetMode(true); setError(''); }}
              className="w-full text-sm text-[#666666] hover:text-[#E53935] transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

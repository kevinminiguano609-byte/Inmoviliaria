/**
 * AuthContext — Supabase Auth implementation
 *
 * Replaces the previous localStorage-based mock.
 * Provides: user, profile, role, isAdmin, isAuthenticated, login, logout, etc.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import {
  signIn,
  signOut,
  resetPassword,
  getProfile,
  onAuthStateChange,
} from '@/services/authService';
import type { ProfileRow, UserRole } from '@/types/supabase';

// ─── Context shape ────────────────────────────────────────────
interface AuthContextType {
  // State
  user:            User | null;
  session:         Session | null;
  profile:         ProfileRow | null;
  role:            UserRole | null;
  isAuthenticated: boolean;
  isAdmin:         boolean;
  isAgent:         boolean;
  loading:         boolean;

  // Actions
  login:           (email: string, password: string) => Promise<boolean>;
  logout:          () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  refreshProfile:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  // Load initial session
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        const p = await getProfile(data.session.user.id);
        setProfile(p);
      }
      setLoading(false);
    });

    // Subscribe to auth changes
    const subscription = onAuthStateChange(async (authUser, authSession) => {
      setUser(authUser);
      setSession(authSession);
      if (authUser) {
        const p = await getProfile(authUser.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signIn(email, password);
      setUser(result.user);
      setSession(result.session);
      setProfile(result.profile);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    await resetPassword(email);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await getProfile(user.id);
    setProfile(p);
  }, [user]);

  const role            = profile?.role ?? null;
  const isAuthenticated = !!user && !!session;
  const isAdmin         = role === 'admin';
  const isAgent         = role === 'agent';

  return (
    <AuthContext.Provider value={{
      user, session, profile, role,
      isAuthenticated, isAdmin, isAgent, loading,
      login, logout, sendPasswordReset, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

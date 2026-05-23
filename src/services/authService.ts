/**
 * Auth Service — Supabase Auth implementation
 *
 * Wraps Supabase Auth methods with typed responses.
 */

import { supabase } from '@/lib/supabase';
import type { ProfileRow, ProfileUpdate, UserRole } from '@/types/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  user:    User;
  session: Session;
  profile: ProfileRow | null;
}

function handleError(error: { message: string } | null, context: string): void {
  if (error) throw new Error(`[authService] ${context}: ${error.message}`);
}

// ─── Auth operations ─────────────────────────────────────────

export async function signIn(
  email: string,
  password: string
): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  handleError(error, 'signIn');

  const profile = await getProfile(data.user!.id);
  return { user: data.user!, session: data.session!, profile };
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole = 'agent'
): Promise<{ user: User | null; needsConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
    },
  });

  handleError(error, 'signUp');

  return {
    user:               data.user,
    needsConfirmation:  !data.session, // email confirmation required
  };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  handleError(error, 'signOut');
}

export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/reset-password`,
  });
  handleError(error, 'resetPassword');
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  handleError(error, 'updatePassword');
}

// ─── Session ─────────────────────────────────────────────────

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// ─── Profile ─────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error?.code === 'PGRST116') return null;
  handleError(error, 'getProfile');
  return data;
}

export async function updateProfile(
  userId: string,
  payload: ProfileUpdate
): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select()
    .single();

  handleError(error, 'updateProfile');
  return data!;
}

/** Get all agents (admin only) */
export async function getAgents(): Promise<ProfileRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'agent')
    .order('full_name');

  handleError(error, 'getAgents');
  return data ?? [];
}

/** Get all staff (admin + agents) */
export async function getAllProfiles(): Promise<ProfileRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('role')
    .order('full_name');

  handleError(error, 'getAllProfiles');
  return data ?? [];
}

// ─── Auth state listener ─────────────────────────────────────

export function onAuthStateChange(
  callback: (user: User | null, session: Session | null) => void
) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null, session);
  });
  return data.subscription;
}

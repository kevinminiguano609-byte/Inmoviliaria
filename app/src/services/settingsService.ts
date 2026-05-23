/**
 * Settings Service — Supabase implementation
 *
 * Site-wide configuration stored in the `settings` table.
 * Values are JSONB so they can hold strings, numbers, booleans, or objects.
 */

import { supabase } from '@/lib/supabase';
import type { Json } from '@/types/supabase';

export interface SiteSettings {
  site_name:           string;
  site_tagline:        string;
  contact_email:       string;
  contact_phone:       string;
  contact_address:     string;
  whatsapp_number:     string;
  social_instagram:    string;
  social_facebook:     string;
  social_linkedin:     string;
  hero_title:          string;
  hero_subtitle:       string;
  properties_per_page: number;
  currency_default:    string;
  [key: string]: Json;
}

function handleError(error: { message: string } | null, context: string): void {
  if (error) throw new Error(`[settingsService] ${context}: ${error.message}`);
}

/** Returns all settings as a flat key→value map */
export async function getSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.rpc('get_settings_map');
  handleError(error, 'getSettings');
  return (data ?? {}) as SiteSettings;
}

/** Get a single setting value */
export async function getSetting<T = Json>(key: string): Promise<T | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error?.code === 'PGRST116') return null;
  handleError(error, 'getSetting');
  return data?.value as T ?? null;
}

/** Upsert a single setting (admin only) */
export async function upsertSetting(key: string, value: Json): Promise<void> {
  const { error } = await supabase.rpc('upsert_setting', {
    p_key:   key,
    p_value: value,
  });
  handleError(error, 'upsertSetting');
}

/** Batch-update multiple settings */
export async function updateSettings(
  updates: Partial<SiteSettings>
): Promise<void> {
  const promises = Object.entries(updates).map(([key, value]) =>
    upsertSetting(key, value as Json)
  );
  await Promise.all(promises);
}

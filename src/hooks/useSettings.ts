/**
 * useSettings — hook for site settings management
 */

import { useState, useEffect, useCallback } from 'react';
import { getSettings, updateSettings } from '@/services/settingsService';
import type { SiteSettings } from '@/services/settingsService';

interface UseSettingsReturn {
  settings: SiteSettings | null;
  loading:  boolean;
  error:    string | null;
  save:     (updates: Partial<SiteSettings>) => Promise<void>;
  refresh:  () => void;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [tick,     setTick]     = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getSettings()
      .then(data => { if (!cancelled) setSettings(data); })
      .catch(e  => { if (!cancelled) setError((e as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  const save = useCallback(async (updates: Partial<SiteSettings>) => {
    await updateSettings(updates);
    setSettings(prev => prev ? ({ ...prev, ...updates } as SiteSettings) : null);
  }, []);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  return { settings, loading, error, save, refresh };
}

/**
 * useDashboard — fetches admin dashboard stats
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { DashboardStats } from '@/types/supabase';

interface UseDashboardReturn {
  stats:   DashboardStats | null;
  loading: boolean;
  error:   string | null;
  refresh: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const [stats,   setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    supabase.rpc('get_dashboard_stats')
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) { setError(err.message); return; }
        setStats(data as DashboardStats);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  return { stats, loading, error, refresh };
}

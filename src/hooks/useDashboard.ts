/**
 * useDashboard — fetches admin dashboard stats
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { DashboardStats } from '@/types/supabase';

interface UseDashboardReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: err } = await supabase.rpc('get_dashboard_stats');

        if (cancelled) return;

        if (err) {
          setError(err.message);
          setStats(null);
          return;
        }

        if (!data) {
          setStats(null);
          return;
        }

        setStats(data as DashboardStats);
      } catch (err) {
        if (cancelled) return;

        setError(err instanceof Error ? err.message : String(err));
        setStats(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, [tick]);

  const refresh = useCallback(() => {
    setTick(t => t + 1);
  }, []);

  return { stats, loading, error, refresh };
}
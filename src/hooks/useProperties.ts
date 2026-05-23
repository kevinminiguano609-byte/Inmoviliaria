/**
 * useProperties — hook for property list with search/filter/pagination
 */

import { useState, useEffect, useCallback } from 'react';
import { searchProperties, getAllProperties } from '@/services/propertyService';
import type { PropertyRow, PropertySearchParams, PaginatedResult } from '@/types/supabase';

interface UsePropertiesOptions extends PropertySearchParams {
  adminMode?: boolean; // if true, fetches all statuses
}

interface UsePropertiesReturn {
  properties:  (PropertyRow & { cover_image: string | null })[];
  total:       number;
  totalPages:  number;
  page:        number;
  loading:     boolean;
  error:       string | null;
  setPage:     (page: number) => void;
  setParams:   (params: Partial<PropertySearchParams>) => void;
  refresh:     () => void;
}

export function useProperties(
  initialParams: UsePropertiesOptions = {}
): UsePropertiesReturn {
  const { adminMode = false, ...searchParams } = initialParams;

  const [params, setParamsState] = useState<PropertySearchParams>(searchParams);
  const [page,   setPageState]   = useState(initialParams.page ?? 1);
  const [result, setResult]      = useState<PaginatedResult<PropertyRow & { cover_image: string | null }>>({
    data: [], total: 0, page: 1, pageSize: 9, totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetch = async () => {
      try {
        if (adminMode) {
          const rows = await getAllProperties();
          if (!cancelled) {
            setResult({
              data:       rows as (PropertyRow & { cover_image: string | null })[],
              total:      rows.length,
              page:       1,
              pageSize:   rows.length,
              totalPages: 1,
            });
          }
        } else {
          const res = await searchProperties({ ...params, page });
          if (!cancelled) setResult(res);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [params, page, adminMode, tick]);

  const setPage = useCallback((p: number) => setPageState(p), []);

  const setParams = useCallback((updates: Partial<PropertySearchParams>) => {
    setParamsState(prev => ({ ...prev, ...updates }));
    setPageState(1); // reset to first page on filter change
  }, []);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  return {
    properties: result.data,
    total:      result.total,
    totalPages: result.totalPages,
    page,
    loading,
    error,
    setPage,
    setParams,
    refresh,
  };
}

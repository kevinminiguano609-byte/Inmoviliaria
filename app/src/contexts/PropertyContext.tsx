/**
 * PropertyContext — conectado a Supabase
 *
 * Reemplaza la implementación mock anterior.
 * Usa propertyService.ts que llama a Supabase directamente.
 *
 * NOTA: Los contextos existentes (PropertyContext, LeadContext, BlogContext,
 * TestimonialContext) se mantienen para compatibilidad con las páginas
 * existentes que los consumen. Internamente ahora llaman a Supabase.
 */

import {
  createContext, useContext, useState, useCallback,
  useMemo, useEffect, type ReactNode,
} from 'react';
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from '@/services/propertyService';
import type { PropertyRow, PropertyInsert, PropertyUpdate } from '@/types/supabase';

// Tipo compatible con el frontend existente
// PropertyRow de Supabase es compatible con Property de @/types
interface PropertyContextType {
  properties: PropertyRow[];
  loading:    boolean;
  error:      string | null;
  addProperty:    (p: PropertyInsert) => Promise<void>;
  updateProperty: (id: string, data: PropertyUpdate) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  refresh:        () => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [tick,       setTick]       = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getProperties()
      .then(data => { if (!cancelled) setProperties(data); })
      .catch(e  => { if (!cancelled) setError((e as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  const addProperty = useCallback(async (p: PropertyInsert) => {
    const created = await createProperty(p);
    setProperties(prev => [created, ...prev]);
  }, []);

  const updatePropertyFn = useCallback(async (id: string, data: PropertyUpdate) => {
    const updated = await updateProperty(id, data);
    setProperties(prev => prev.map(x => x.id === id ? updated : x));
  }, []);

  const deletePropertyFn = useCallback(async (id: string) => {
    await deleteProperty(id);
    setProperties(prev => prev.filter(x => x.id !== id));
  }, []);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  const value = useMemo(
    () => ({
      properties, loading, error,
      addProperty,
      updateProperty: updatePropertyFn,
      deleteProperty: deletePropertyFn,
      refresh,
    }),
    [properties, loading, error, addProperty, updatePropertyFn, deletePropertyFn, refresh],
  );

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const ctx = useContext(PropertyContext);
  if (!ctx) throw new Error('useProperty must be used within PropertyProvider');
  return ctx;
}

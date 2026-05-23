/**
 * PropertyContext
 *
 * Devuelve `Property[]` (tipo legacy de src/types/index.ts) para que
 * PropertyDetail, Properties, Home y PropertyCard funcionen sin cambios.
 *
 * Internamente usa PropertyRow de Supabase y aplica el adaptador.
 * Las imágenes y amenities se cargan en el detalle via getPropertyBySlug().
 * Para la lista (PropertyCard) se usa la cover_image de la query.
 */

import {
  createContext, useContext, useState, useCallback,
  useMemo, useEffect, type ReactNode,
} from 'react';
import {
  getAllProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from '@/services/propertyService';
import { propertyRowToPropertySimple } from '@/types/adapters';
import type { Property } from '@/types/index';
import type { PropertyRow, PropertyInsert, PropertyUpdate } from '@/types/supabase';

interface PropertyContextType {
  properties:     Property[];
  rawProperties:  PropertyRow[];
  loading:        boolean;
  error:          string | null;
  addProperty:    (p: PropertyInsert) => Promise<void>;
  updateProperty: (id: string, data: PropertyUpdate) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  refresh:        () => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [rows,    setRows]    = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getAllProperties()
      .then(data => { if (!cancelled) setRows(data); })
      .catch(e  => { if (!cancelled) setError((e as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  // Adaptar PropertyRow[] → Property[] para las páginas públicas
  const properties = useMemo(
    () => rows.map(propertyRowToPropertySimple),
    [rows]
  );

  const addProperty = useCallback(async (p: PropertyInsert) => {
    const created = await createProperty(p);
    setRows(prev => [created, ...prev]);
  }, []);

  const updatePropertyFn = useCallback(async (id: string, data: PropertyUpdate) => {
    const updated = await updateProperty(id, data);
    setRows(prev => prev.map(x => x.id === id ? updated : x));
  }, []);

  const deletePropertyFn = useCallback(async (id: string) => {
    await deleteProperty(id);
    setRows(prev => prev.filter(x => x.id !== id));
  }, []);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  const value = useMemo(
    () => ({
      properties, rawProperties: rows, loading, error,
      addProperty,
      updateProperty: updatePropertyFn,
      deleteProperty: deletePropertyFn,
      refresh,
    }),
    [properties, rows, loading, error, addProperty, updatePropertyFn, deletePropertyFn, refresh],
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

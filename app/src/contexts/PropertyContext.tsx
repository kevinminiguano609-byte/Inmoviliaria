import {
  createContext, useContext, useState, useCallback,
  useMemo, useEffect, type ReactNode,
} from 'react';
import * as propertyService from '@/services/propertyService';
import type { Property } from '@/types';

interface PropertyContextType {
  properties: Property[];
  loading: boolean;
  addProperty: (p: Omit<Property, 'id' | 'createdAt'>) => Promise<void>;
  updateProperty: (id: string, data: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data from service
  useEffect(() => {
    propertyService.getProperties().then(data => {
      setProperties(data);
      setLoading(false);
    });
  }, []);

  const addProperty = useCallback(async (p: Omit<Property, 'id' | 'createdAt'>) => {
    const created = await propertyService.createProperty(p);
    setProperties(prev => [created, ...prev]);
  }, []);

  const updateProperty = useCallback(async (id: string, data: Partial<Property>) => {
    const updated = await propertyService.updateProperty(id, data);
    setProperties(prev => prev.map(x => x.id === id ? updated : x));
  }, []);

  const deleteProperty = useCallback(async (id: string) => {
    await propertyService.deleteProperty(id);
    setProperties(prev => prev.filter(x => x.id !== id));
  }, []);

  const value = useMemo(
    () => ({ properties, loading, addProperty, updateProperty, deleteProperty }),
    [properties, loading, addProperty, updateProperty, deleteProperty],
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

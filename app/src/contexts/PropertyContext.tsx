import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { properties as initialProperties } from '@/data/mock';
import type { Property } from '@/types';

interface PropertyContextType {
  properties: Property[];
  addProperty: (p: Property) => void;
  updateProperty: (p: Property) => void;
  deleteProperty: (id: string) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);

  const addProperty = useCallback((p: Property) => {
    setProperties(prev => [...prev, p]);
  }, []);

  const updateProperty = useCallback((p: Property) => {
    setProperties(prev => prev.map(x => x.id === p.id ? p : x));
  }, []);

  const deleteProperty = useCallback((id: string) => {
    setProperties(prev => prev.filter(x => x.id !== id));
  }, []);

  const value = useMemo(() => ({ properties, addProperty, updateProperty, deleteProperty }),
    [properties, addProperty, updateProperty, deleteProperty]);

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

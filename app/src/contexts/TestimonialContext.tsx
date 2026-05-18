/**
 * TestimonialContext — conectado a Supabase
 */

import {
  createContext, useContext, useState, useCallback,
  useMemo, useEffect, type ReactNode,
} from 'react';
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '@/services/testimonialService';
import type { TestimonialRow, TestimonialInsert, TestimonialUpdate } from '@/types/supabase';

interface TestimonialContextType {
  testimonials:      TestimonialRow[];
  loading:           boolean;
  error:             string | null;
  addTestimonial:    (t: TestimonialInsert) => Promise<void>;
  updateTestimonial: (id: string, data: TestimonialUpdate) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  refresh:           () => void;
}

const TestimonialContext = createContext<TestimonialContextType | undefined>(undefined);

export function TestimonialProvider({ children }: { children: ReactNode }) {
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [tick,         setTick]         = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getTestimonials()
      .then(data => { if (!cancelled) setTestimonials(data); })
      .catch(e  => { if (!cancelled) setError((e as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  const addTestimonial = useCallback(async (t: TestimonialInsert) => {
    const created = await createTestimonial(t);
    setTestimonials(prev => [...prev, created]);
  }, []);

  const updateTestimonialFn = useCallback(async (id: string, data: TestimonialUpdate) => {
    const updated = await updateTestimonial(id, data);
    setTestimonials(prev => prev.map(x => x.id === id ? updated : x));
  }, []);

  const deleteTestimonialFn = useCallback(async (id: string) => {
    await deleteTestimonial(id);
    setTestimonials(prev => prev.filter(x => x.id !== id));
  }, []);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  const value = useMemo(
    () => ({
      testimonials, loading, error,
      addTestimonial,
      updateTestimonial: updateTestimonialFn,
      deleteTestimonial: deleteTestimonialFn,
      refresh,
    }),
    [testimonials, loading, error, addTestimonial, updateTestimonialFn, deleteTestimonialFn, refresh],
  );

  return (
    <TestimonialContext.Provider value={value}>
      {children}
    </TestimonialContext.Provider>
  );
}

export function useTestimonial() {
  const ctx = useContext(TestimonialContext);
  if (!ctx) throw new Error('useTestimonial must be used within TestimonialProvider');
  return ctx;
}

/**
 * TestimonialContext
 *
 * Devuelve `Testimonial[]` (tipo legacy) para que Home.tsx funcione sin cambios.
 * Internamente usa TestimonialRow de Supabase y aplica el adaptador.
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
import { testimonialRowToTestimonial } from '@/types/adapters';
import type { Testimonial } from '@/types/index';
import type { TestimonialRow, TestimonialInsert, TestimonialUpdate } from '@/types/supabase';

interface TestimonialContextType {
  testimonials:      Testimonial[];
  loading:           boolean;
  error:             string | null;
  rawTestimonials:   TestimonialRow[];
  addTestimonial:    (t: TestimonialInsert) => Promise<void>;
  updateTestimonial: (id: string, data: TestimonialUpdate) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  refresh:           () => void;
}

const TestimonialContext = createContext<TestimonialContextType | undefined>(undefined);

export function TestimonialProvider({ children }: { children: ReactNode }) {
  const [rows,    setRows]    = useState<TestimonialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getTestimonials()
      .then(data => { if (!cancelled) setRows(data); })
      .catch(e  => { if (!cancelled) setError((e as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  // Adaptar TestimonialRow[] → Testimonial[] para Home.tsx
  const testimonials = useMemo(
    () => rows.map(testimonialRowToTestimonial),
    [rows]
  );

  const addTestimonial = useCallback(async (t: TestimonialInsert) => {
    const created = await createTestimonial(t);
    setRows(prev => [...prev, created]);
  }, []);

  const updateTestimonialFn = useCallback(async (id: string, data: TestimonialUpdate) => {
    const updated = await updateTestimonial(id, data);
    setRows(prev => prev.map(x => x.id === id ? updated : x));
  }, []);

  const deleteTestimonialFn = useCallback(async (id: string) => {
    await deleteTestimonial(id);
    setRows(prev => prev.filter(x => x.id !== id));
  }, []);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  const value = useMemo(
    () => ({
      testimonials,
      rawTestimonials: rows,
      loading, error,
      addTestimonial,
      updateTestimonial: updateTestimonialFn,
      deleteTestimonial: deleteTestimonialFn,
      refresh,
    }),
    [testimonials, rows, loading, error, addTestimonial, updateTestimonialFn, deleteTestimonialFn, refresh],
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

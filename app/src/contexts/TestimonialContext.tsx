import {
  createContext, useContext, useState, useCallback,
  useMemo, useEffect, type ReactNode,
} from 'react';
import * as testimonialService from '@/services/testimonialService';
import type { Testimonial } from '@/types';

interface TestimonialContextType {
  testimonials: Testimonial[];
  loading: boolean;
  addTestimonial: (t: Omit<Testimonial, 'id'>) => Promise<void>;
  updateTestimonial: (id: string, data: Partial<Testimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
}

const TestimonialContext = createContext<TestimonialContextType | undefined>(undefined);

export function TestimonialProvider({ children }: { children: ReactNode }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testimonialService.getTestimonials().then(data => {
      setTestimonials(data);
      setLoading(false);
    });
  }, []);

  const addTestimonial = useCallback(async (t: Omit<Testimonial, 'id'>) => {
    const created = await testimonialService.createTestimonial(t);
    setTestimonials(prev => [...prev, created]);
  }, []);

  const updateTestimonial = useCallback(async (id: string, data: Partial<Testimonial>) => {
    const updated = await testimonialService.updateTestimonial(id, data);
    setTestimonials(prev => prev.map(x => x.id === id ? updated : x));
  }, []);

  const deleteTestimonial = useCallback(async (id: string) => {
    await testimonialService.deleteTestimonial(id);
    setTestimonials(prev => prev.filter(x => x.id !== id));
  }, []);

  const value = useMemo(
    () => ({ testimonials, loading, addTestimonial, updateTestimonial, deleteTestimonial }),
    [testimonials, loading, addTestimonial, updateTestimonial, deleteTestimonial],
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

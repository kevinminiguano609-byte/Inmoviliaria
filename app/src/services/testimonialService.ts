/**
 * Testimonial Service
 *
 * Mock implementation that mirrors the Supabase client API.
 * To connect to Supabase, replace each function body with the
 * corresponding supabase.from('testimonials')... call.
 */

import { testimonials as mockTestimonials } from '@/data/mock';
import type { Testimonial } from '@/types';

let store: Testimonial[] = [...mockTestimonials];

export async function getTestimonials(): Promise<Testimonial[]> {
  return [...store];
}

export async function createTestimonial(
  data: Omit<Testimonial, 'id'>
): Promise<Testimonial> {
  const newItem: Testimonial = { ...data, id: Date.now().toString() };
  store = [...store, newItem];
  return newItem;
}

export async function updateTestimonial(
  id: string,
  data: Partial<Testimonial>
): Promise<Testimonial> {
  const idx = store.findIndex(t => t.id === id);
  if (idx === -1) throw new Error(`Testimonial ${id} not found`);
  store[idx] = { ...store[idx], ...data };
  return store[idx];
}

export async function deleteTestimonial(id: string): Promise<void> {
  store = store.filter(t => t.id !== id);
}

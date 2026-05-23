/**
 * Testimonial Service — Supabase implementation
 */

import { supabase } from '@/lib/supabase';
import type { TestimonialRow, TestimonialInsert, TestimonialUpdate } from '@/types/supabase';

function handleError(error: { message: string } | null, context: string): void {
  if (error) throw new Error(`[testimonialService] ${context}: ${error.message}`);
}

export async function getTestimonials(): Promise<TestimonialRow[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('active', true)
    .order('sort_order');

  handleError(error, 'getTestimonials');
  return data ?? [];
}

export async function getAllTestimonials(): Promise<TestimonialRow[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('sort_order');

  handleError(error, 'getAllTestimonials');
  return data ?? [];
}

export async function createTestimonial(
  payload: TestimonialInsert
): Promise<TestimonialRow> {
  const { data, error } = await supabase
    .from('testimonials')
    .insert(payload)
    .select()
    .single();

  handleError(error, 'createTestimonial');
  return data!;
}

export async function updateTestimonial(
  id: string,
  payload: TestimonialUpdate
): Promise<TestimonialRow> {
  const { data, error } = await supabase
    .from('testimonials')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  handleError(error, 'updateTestimonial');
  return data!;
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);

  handleError(error, 'deleteTestimonial');
}

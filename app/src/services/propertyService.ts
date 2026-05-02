/**
 * Property Service
 *
 * Mock implementation that mirrors the Supabase client API.
 * To connect to Supabase, replace each function body with the
 * corresponding supabase.from('properties')... call.
 *
 * Example Supabase migration:
 *   import { supabase } from '@/lib/supabaseClient'
 *
 *   export async function getProperties() {
 *     const { data, error } = await supabase.from('properties').select('*')
 *     if (error) throw error
 *     return data as Property[]
 *   }
 */

import { properties as mockProperties } from '@/data/mock';
import type { Property } from '@/types';

// In-memory store (simulates a DB table)
let store: Property[] = [...mockProperties];

export async function getProperties(): Promise<Property[]> {
  return [...store];
}

export async function getPropertyById(id: string): Promise<Property | null> {
  return store.find(p => p.id === id) ?? null;
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  return store.find(p => p.slug === slug) ?? null;
}

export async function createProperty(data: Omit<Property, 'id' | 'createdAt'>): Promise<Property> {
  const newItem: Property = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString().split('T')[0],
  };
  store = [newItem, ...store];
  return newItem;
}

export async function updateProperty(id: string, data: Partial<Property>): Promise<Property> {
  const idx = store.findIndex(p => p.id === id);
  if (idx === -1) throw new Error(`Property ${id} not found`);
  store[idx] = { ...store[idx], ...data };
  return store[idx];
}

export async function deleteProperty(id: string): Promise<void> {
  store = store.filter(p => p.id !== id);
}

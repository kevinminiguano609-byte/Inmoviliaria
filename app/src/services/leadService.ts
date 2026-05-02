/**
 * Lead Service
 *
 * Mock implementation that mirrors the Supabase client API.
 * To connect to Supabase, replace each function body with the
 * corresponding supabase.from('leads')... call.
 */

import { initialLeads } from '@/data/mock';
import type { Lead } from '@/types';

let store: Lead[] = [...initialLeads];

export async function getLeads(): Promise<Lead[]> {
  return [...store];
}

export async function getLeadById(id: string): Promise<Lead | null> {
  return store.find(l => l.id === id) ?? null;
}

export async function createLead(
  data: Omit<Lead, 'id' | 'date' | 'status'>
): Promise<Lead> {
  const newLead: Lead = {
    ...data,
    id: Date.now().toString(),
    date: new Date()
      .toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace(',', ''),
    status: 'nuevo',
  };
  store = [newLead, ...store];
  return newLead;
}

export async function updateLeadStatus(
  id: string,
  status: Lead['status']
): Promise<Lead> {
  const idx = store.findIndex(l => l.id === id);
  if (idx === -1) throw new Error(`Lead ${id} not found`);
  store[idx] = { ...store[idx], status };
  return store[idx];
}

export async function deleteLead(id: string): Promise<void> {
  store = store.filter(l => l.id !== id);
}

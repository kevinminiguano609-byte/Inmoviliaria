/**
 * Lead Service — Supabase implementation
 */

import { supabase } from '@/lib/supabase';
import type { LeadRow, LeadInsert, LeadUpdate, LeadStatus } from '@/types/supabase';

function handleError(error: { message: string } | null, context: string): void {
  if (error) throw new Error(`[leadService] ${context}: ${error.message}`);
}

// ─── Queries ─────────────────────────────────────────────────

/** Get all leads (admin) or assigned leads (agent) */
export async function getLeads(): Promise<LeadRow[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  handleError(error, 'getLeads');
  return data ?? [];
}

export async function getLeadById(id: string): Promise<LeadRow | null> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error?.code === 'PGRST116') return null;
  handleError(error, 'getLeadById');
  return data;
}

export async function getLeadsByStatus(status: LeadStatus): Promise<LeadRow[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  handleError(error, 'getLeadsByStatus');
  return data ?? [];
}

// ─── Mutations ───────────────────────────────────────────────

/** Public: create a lead from the contact form */
export async function createLead(
  payload: Omit<LeadInsert, 'status'>
): Promise<LeadRow> {
  const { data, error } = await supabase
    .from('leads')
    .insert({ ...payload, status: 'nuevo' })
    .select()
    .single();

  handleError(error, 'createLead');
  return data!;
}

export async function updateLead(
  id: string,
  payload: LeadUpdate
): Promise<LeadRow> {
  const { data, error } = await supabase
    .from('leads')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  handleError(error, 'updateLead');
  return data!;
}

/** Update only the status (uses the secure SQL function) */
export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
  notes?: string
): Promise<LeadRow> {
  const { data, error } = await supabase.rpc('update_lead_status', {
    p_lead_id: id,
    p_status:  status,
    p_notes:   notes ?? null,
  });

  handleError(error, 'updateLeadStatus');
  return data as LeadRow;
}

/** Assign a lead to an agent (admin only) */
export async function assignLead(leadId: string, agentId: string): Promise<LeadRow> {
  const { data, error } = await supabase.rpc('assign_lead', {
    p_lead_id:  leadId,
    p_agent_id: agentId,
  });

  handleError(error, 'assignLead');
  return data as LeadRow;
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  handleError(error, 'deleteLead');
}

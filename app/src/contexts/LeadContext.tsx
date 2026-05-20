/**
 * LeadContext
 *
 * Devuelve `Lead[]` (tipo legacy) para que Contact.tsx, PropertyDetail.tsx
 * y Home.tsx funcionen sin cambios.
 *
 * Internamente usa LeadRow de Supabase y aplica el adaptador.
 * AdminLeads usa rawLeads (LeadRow[]) directamente.
 */

import {
  createContext, useContext, useState, useCallback,
  useMemo, useEffect, type ReactNode,
} from 'react';
import {
  getLeads,
  createLead,
  updateLeadStatus,
  deleteLead,
} from '@/services/leadService';
import { leadRowToLead } from '@/types/adapters';
import type { Lead } from '@/types/index';
import type { LeadRow, LeadInsert, LeadStatus } from '@/types/supabase';

// Payload que usan los formularios públicos (Contact.tsx, PropertyDetail.tsx, Home.tsx)
// Usa los nombres del tipo legacy para no tocar esas páginas
export interface PublicLeadPayload {
  name:           string;
  email:          string;
  phone?:         string;
  subject?:       string;
  message?:       string;
  propertyId?:    string;   // legacy name → property_id en BD
  propertyTitle?: string;   // legacy name → property_title en BD
}

interface LeadContextType {
  leads:            Lead[];
  loading:          boolean;
  error:            string | null;
  rawLeads:         LeadRow[];
  addLead:          (l: PublicLeadPayload) => Promise<void>;
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<void>;
  deleteLead:       (id: string) => Promise<void>;
  refresh:          () => void;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: ReactNode }) {
  const [rows,    setRows]    = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getLeads()
      .then(data => { if (!cancelled) setRows(data); })
      .catch(e  => { if (!cancelled) setError((e as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  // Adaptar LeadRow[] → Lead[] para páginas públicas y formularios
  const leads = useMemo(() => rows.map(leadRowToLead), [rows]);

  const addLead = useCallback(async (l: PublicLeadPayload) => {
    // Mapear campos legacy → nombres de columna de Supabase
    const insert: Omit<LeadInsert, 'status'> = {
      name:           l.name,
      email:          l.email,
      phone:          l.phone ?? null,
      subject:        l.subject ?? null,
      message:        l.message ?? null,
      property_id:    l.propertyId ?? null,
      property_title: l.propertyTitle ?? null,
      source:         'web',
      assigned_to:    null,
      notes:          null,
    };
    const created = await createLead(insert);
    setRows(prev => [created, ...prev]);
  }, []);

  const updateStatus = useCallback(async (id: string, status: LeadStatus) => {
    const updated = await updateLeadStatus(id, status);
    setRows(prev => prev.map(r => r.id === id ? updated : r));
  }, []);

  const removeLead = useCallback(async (id: string) => {
    await deleteLead(id);
    setRows(prev => prev.filter(r => r.id !== id));
  }, []);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  const value = useMemo(
    () => ({
      leads,
      rawLeads: rows,
      loading, error,
      addLead,
      updateLeadStatus: updateStatus,
      deleteLead: removeLead,
      refresh,
    }),
    [leads, rows, loading, error, addLead, updateStatus, removeLead, refresh],
  );

  return (
    <LeadContext.Provider value={value}>
      {children}
    </LeadContext.Provider>
  );
}

export function useLead() {
  const ctx = useContext(LeadContext);
  if (!ctx) throw new Error('useLead must be used within LeadProvider');
  return ctx;
}

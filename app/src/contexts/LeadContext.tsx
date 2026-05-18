/**
 * LeadContext — conectado a Supabase
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
import type { LeadRow, LeadInsert, LeadStatus } from '@/types/supabase';

interface LeadContextType {
  leads:            LeadRow[];
  loading:          boolean;
  error:            string | null;
  addLead:          (l: Omit<LeadInsert, 'status'>) => Promise<void>;
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<void>;
  deleteLead:       (id: string) => Promise<void>;
  refresh:          () => void;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: ReactNode }) {
  const [leads,   setLeads]   = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getLeads()
      .then(data => { if (!cancelled) setLeads(data); })
      .catch(e  => { if (!cancelled) setError((e as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  const addLead = useCallback(async (l: Omit<LeadInsert, 'status'>) => {
    const created = await createLead(l);
    setLeads(prev => [created, ...prev]);
  }, []);

  const updateStatus = useCallback(async (id: string, status: LeadStatus) => {
    const updated = await updateLeadStatus(id, status);
    setLeads(prev => prev.map(l => l.id === id ? updated : l));
  }, []);

  const removeLead = useCallback(async (id: string) => {
    await deleteLead(id);
    setLeads(prev => prev.filter(l => l.id !== id));
  }, []);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  const value = useMemo(
    () => ({
      leads, loading, error,
      addLead,
      updateLeadStatus: updateStatus,
      deleteLead: removeLead,
      refresh,
    }),
    [leads, loading, error, addLead, updateStatus, removeLead, refresh],
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

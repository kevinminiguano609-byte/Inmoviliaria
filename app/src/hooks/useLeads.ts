/**
 * useLeads — hook for lead management
 */

import { useState, useEffect, useCallback } from 'react';
import { getLeads, updateLeadStatus, deleteLead, assignLead } from '@/services/leadService';
import type { LeadRow, LeadStatus } from '@/types/supabase';

interface UseLeadsReturn {
  leads:        LeadRow[];
  loading:      boolean;
  error:        string | null;
  updateStatus: (id: string, status: LeadStatus, notes?: string) => Promise<void>;
  assign:       (leadId: string, agentId: string) => Promise<void>;
  remove:       (id: string) => Promise<void>;
  refresh:      () => void;
}

export function useLeads(): UseLeadsReturn {
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

  const updateStatus = useCallback(async (id: string, status: LeadStatus, notes?: string) => {
    const updated = await updateLeadStatus(id, status, notes);
    setLeads(prev => prev.map(l => l.id === id ? updated : l));
  }, []);

  const assign = useCallback(async (leadId: string, agentId: string) => {
    const updated = await assignLead(leadId, agentId);
    setLeads(prev => prev.map(l => l.id === leadId ? updated : l));
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteLead(id);
    setLeads(prev => prev.filter(l => l.id !== id));
  }, []);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  return { leads, loading, error, updateStatus, assign, remove, refresh };
}

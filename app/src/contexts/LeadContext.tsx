import {
  createContext, useContext, useState, useCallback,
  useMemo, useEffect, type ReactNode,
} from 'react';
import * as leadService from '@/services/leadService';
import type { Lead } from '@/types';

interface LeadContextType {
  leads: Lead[];
  loading: boolean;
  addLead: (l: Omit<Lead, 'id' | 'date' | 'status'>) => Promise<void>;
  updateLeadStatus: (id: string, status: Lead['status']) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leadService.getLeads().then(data => {
      setLeads(data);
      setLoading(false);
    });
  }, []);

  const addLead = useCallback(async (l: Omit<Lead, 'id' | 'date' | 'status'>) => {
    const created = await leadService.createLead(l);
    setLeads(prev => [created, ...prev]);
  }, []);

  const updateLeadStatus = useCallback(async (id: string, status: Lead['status']) => {
    const updated = await leadService.updateLeadStatus(id, status);
    setLeads(prev => prev.map(l => l.id === id ? updated : l));
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    await leadService.deleteLead(id);
    setLeads(prev => prev.filter(l => l.id !== id));
  }, []);

  const value = useMemo(
    () => ({ leads, loading, addLead, updateLeadStatus, deleteLead }),
    [leads, loading, addLead, updateLeadStatus, deleteLead],
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

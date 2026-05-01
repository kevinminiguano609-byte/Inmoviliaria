import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { initialLeads } from '@/data/mock';
import type { Lead } from '@/types';

interface LeadContextType {
  leads: Lead[];
  addLead: (l: Omit<Lead, 'id' | 'date' | 'status'>) => void;
  updateLeadStatus: (id: string, status: Lead['status']) => void;
  deleteLead: (id: string) => void;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  const addLead = useCallback((l: Omit<Lead, 'id' | 'date' | 'status'>) => {
    const newLead: Lead = {
      ...l,
      id: Date.now().toString(),
      date: new Date().toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
      status: 'nuevo',
    };
    setLeads(prev => [newLead, ...prev]);
  }, []);

  const updateLeadStatus = useCallback((id: string, status: Lead['status']) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  }, []);

  const value = useMemo(() => ({ leads, addLead, updateLeadStatus, deleteLead }),
    [leads, addLead, updateLeadStatus, deleteLead]);

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

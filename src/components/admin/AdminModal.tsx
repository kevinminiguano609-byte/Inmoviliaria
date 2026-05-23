/**
 * AdminModal — reusable modal wrapper for create/edit/delete dialogs.
 */

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Max width class, e.g. 'max-w-lg' or 'max-w-[800px]' */
  maxWidth?: string;
}

export default function AdminModal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}: AdminModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-8 w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-[#333333]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#666666] hover:text-[#333333] transition-colors"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

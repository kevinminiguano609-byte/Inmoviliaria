/**
 * AdminFormField — labeled input/select/textarea wrapper for admin forms.
 */

import type { ReactNode } from 'react';

interface AdminFormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}

export default function AdminFormField({
  label,
  required,
  error,
  className = '',
  children,
}: AdminFormFieldProps) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-[#333333] mb-1 block">
        {label}
        {required && <span className="text-[#E53935] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[#F44336] text-xs mt-1">{error}</p>}
    </div>
  );
}

/** Shared input className for admin forms */
export const adminInputCls =
  'w-full border border-[#E0E0E0] focus:border-[#E53935] rounded-lg px-4 py-3 text-sm outline-none transition-colors text-[#333333] placeholder:text-[#999]';

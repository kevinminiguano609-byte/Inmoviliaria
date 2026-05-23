/**
 * AdminSearchBar — search input with icon, used in admin toolbars.
 */

import { Search } from 'lucide-react';

interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AdminSearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
  className = '',
}: AdminSearchBarProps) {
  return (
    <div className={`relative flex-1 min-w-[200px] ${className}`}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]"
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-[#E0E0E0] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#E53935] text-[#333333] placeholder:text-[#999]"
      />
    </div>
  );
}

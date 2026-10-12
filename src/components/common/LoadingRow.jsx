'use client';

import { Loader2 } from 'lucide-react';

/**
 * Standardized loading state indicator or skeleton rows for tables, cards, and views.
 */
export default function LoadingRow({
  label = 'Loading institutional records…',
  compact = false,
  className = '',
}) {
  if (compact) {
    return (
      <div className={`flex items-center justify-center gap-2 py-4 text-xs font-medium text-[#33462C] dark:text-[#8FD4AE] ${className}`}>
        <Loader2 size={15} className="animate-spin text-[#33462C] dark:text-[#8FD4AE]" />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div
      className={`p-12 text-center border border-[#E5DFD5] dark:border-[#22352B] rounded-xl bg-white dark:bg-[#131E18] space-y-2.5 ${className}`}
    >
      <Loader2 size={24} className="animate-spin mx-auto text-[#33462C] dark:text-[#8FD4AE]" />
      <p className="text-xs font-medium text-[#7F8781] dark:text-[#889C90]">{label}</p>
    </div>
  );
}

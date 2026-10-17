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
      <div className={`flex items-center justify-center gap-2 py-4 text-xs font-medium text-slate-700 dark:text-slate-300 ${className}`}>
        <Loader2 size={15} className="animate-spin text-[#004B87] dark:text-blue-400" />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div
      className={`p-12 text-center border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#111827] space-y-2.5 ${className}`}
    >
      <Loader2 size={24} className="animate-spin mx-auto text-[#004B87] dark:text-blue-400" />
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

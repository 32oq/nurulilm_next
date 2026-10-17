import { Loader2, AlertTriangle } from "lucide-react";

export const LoadingRow = () => (
  <div className="flex items-center justify-center gap-2.5 text-slate-500 py-10 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl my-3">
    <Loader2 size={16} className="animate-spin text-[#004B87] dark:text-blue-400" />
    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Retrieving records from library system...</span>
  </div>
);

export const ErrorRow = ({ message = "Failed to load data. Please verify your connection." }) => (
  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-4 py-3 rounded-xl text-xs font-medium my-3">
    <AlertTriangle size={15} className="flex-shrink-0" />
    <span>{message}</span>
  </div>
);

export const TxnStatus = ({ ok, label }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border
    ${ok
      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
      : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"}`}>
    {label}
  </span>
);

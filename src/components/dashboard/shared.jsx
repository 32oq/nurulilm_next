import { Loader2, AlertTriangle } from "lucide-react";

export const LoadingRow = () => (
  <div className="flex items-center justify-center gap-2.5 text-[#6D8374] py-10 bg-white dark:bg-[#131E18] border border-[#E5DFD5] dark:border-[#22352B] rounded-xl my-3">
    <Loader2 size={18} className="animate-spin text-[#1C3A2B] dark:text-[#8FD4AE]" />
    <span className="text-xs font-medium dark:text-[#C9D6CE]">Retrieving records from library system...</span>
  </div>
);

export const ErrorRow = ({ message = "Failed to load data. Please verify your connection." }) => (
  <div className="flex items-center gap-2 text-[#A83232] dark:text-[#FCA5A5] bg-[#FAF0F0] dark:bg-[#2D1414] border border-[#F0D5D5] dark:border-[#5C2323] px-4 py-3 rounded-xl text-xs font-medium my-3">
    <AlertTriangle size={16} className="flex-shrink-0" />
    <span>{message}</span>
  </div>
);

export const TxnStatus = ({ ok, label }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
    ${ok
      ? "bg-[#EDF3EE] dark:bg-[#182C21] text-[#1C3A2B] dark:text-[#8FD4AE] border-[#D9E2DC] dark:border-[#264433]"
      : "bg-[#FFFBEB] dark:bg-[#2E2108] text-[#92400E] dark:text-[#FBBF24] border-[#FDE68A] dark:border-[#5C4312]"}`}>
    {label}
  </span>
);

'use client';

import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const VARIANT_STYLES = {
  error: {
    container: 'bg-[#FEF2F2] dark:bg-[#2A1212] border-[#FCA5A5] dark:border-[#7F1D1D] text-[#991B1B] dark:text-[#F87171]',
    icon: AlertCircle,
  },
  success: {
    container: 'bg-[#EFF4EC] dark:bg-[#16291C] border-[#B7D4C0] dark:border-[#2C5237] text-[#1E3E2B] dark:text-[#8FD4AE]',
    icon: CheckCircle2,
  },
  warning: {
    container: 'bg-[#FFFBEB] dark:bg-[#2C2411] border-[#FDE68A] dark:border-[#523B12] text-[#92400E] dark:text-[#FBBF24]',
    icon: AlertTriangle,
  },
  info: {
    container: 'bg-[#F0F5FA] dark:bg-[#12202E] border-[#BFDBFE] dark:border-[#1E3A5F] text-[#1E40AF] dark:text-[#93C5FD]',
    icon: Info,
  },
};

/**
 * Standardized alert banner with zero emoji usage and strict rectangular/subtle-rounded styling.
 */
export default function AlertBanner({
  variant = 'error',
  message,
  onDismiss,
  className = '',
}) {
  if (!message) return null;

  const currentVariant = VARIANT_STYLES[variant] || VARIANT_STYLES.error;
  const Icon = currentVariant.icon;

  return (
    <div
      role="alert"
      className={`flex items-start justify-between gap-3 p-3.5 border rounded-xl text-xs font-medium ${currentVariant.container} ${className}`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <Icon size={16} className="shrink-0 mt-0.5" />
        <p className="leading-relaxed whitespace-pre-line">{message}</p>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition shrink-0 cursor-pointer"
          title="Dismiss notice"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

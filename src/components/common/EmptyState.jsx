'use client';

/**
 * Reusable institutional EmptyState component adhering strictly to design guidelines:
 * - No emojis (accepts Lucide icons)
 * - No pill buttons (uses rounded-lg / rounded-xl)
 * - Muted institutional forest-green/slate palette
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`p-10 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-[#111827] space-y-3 ${className}`}
    >
      {Icon && (
        <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#004B87] dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
          <Icon size={20} />
        </div>
      )}
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAction}
            className="px-4 py-2 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}

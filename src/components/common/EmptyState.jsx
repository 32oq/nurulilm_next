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
      className={`p-10 text-center border border-dashed border-[#DFE6DC] dark:border-[#26362D] rounded-xl bg-white dark:bg-[#131E18] space-y-3 ${className}`}
    >
      {Icon && (
        <div className="w-11 h-11 rounded-xl bg-[#F2F5F0] dark:bg-[#1E2E25] text-[#33462C] dark:text-[#8FD4AE] flex items-center justify-center mx-auto shadow-xs">
          <Icon size={20} />
        </div>
      )}
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-[#1C1E1B] dark:text-[#E8F0EB]">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-[#7F8781] dark:text-[#889C90] max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAction}
            className="px-4 py-2 rounded-lg bg-[#33462C] hover:bg-[#24341E] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="w-full min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center px-4 py-16 text-center bg-[#F6F8FB] dark:bg-[#0B0F19] transition-colors">
      <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#004B87] dark:text-blue-400 flex items-center justify-center mb-4 shadow-xs">
        <BookOpen size={28} />
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        404 • Missing Shelf
      </span>
      <h1 className="font-serif-lib text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-1 mb-3">
        Page Not In Catalog
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed mb-6">
        The requested shelf or study record could not be found in the library directory. It may have been archived or moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold shadow-xs transition"
      >
        <ArrowLeft size={14} />
        <span>Return to Library Entrance</span>
      </Link>
    </div>
  );
}

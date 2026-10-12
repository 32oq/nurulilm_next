'use client';

import Link from 'next/link';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="w-full min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center px-4 py-16 text-center bg-[#FCFCFB] dark:bg-[#0E1411] transition-colors">
      <div className="w-16 h-16 rounded-2xl bg-[#EFF4EC] dark:bg-[#1E2E25] text-[#33462C] dark:text-[#8FD4AE] flex items-center justify-center mb-4 shadow-sm">
        <BookOpen size={28} />
      </div>
      <span className="text-xs font-semibold uppercase tracking-widest text-[#33462C] dark:text-[#88B89C]">
        404 • Missing Chapter
      </span>
      <h1 className="font-serif-lib text-3xl sm:text-4xl font-bold text-[#24341E] dark:text-[#8FD4AE] mt-1 mb-3">
        Page Not In Catalog
      </h1>
      <p className="text-sm text-[#0B0E0A] dark:text-[#9FB1A6] max-w-md leading-relaxed mb-6">
        The requested shelf or study record could not be found in the library directory. It may have been archived or moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#33462C] hover:bg-[#24341E] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white text-xs font-semibold shadow-sm transition active:scale-95"
      >
        <ArrowLeft size={14} />
        <span>Return to Library Entrance</span>
      </Link>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { Bookmark, BookmarkCheck, Trash2, BookOpen, X, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SavedBooksDrawer({ savedBooks, onRemoveBook, onClearAll, setPage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyList = () => {
    if (typeof navigator === 'undefined') return;
    const listText = savedBooks
      .map((b, i) => `${i + 1}. "${b.title}" by ${b.author || 'Unknown'} (Category: ${b.category || 'General'})`)
      .join('\n');
    navigator.clipboard?.writeText(
      `Nurul Ilm Library - My Reserved Reading List:\n\n${listText}\n\nPresent this at the front desk in Handwara.`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!savedBooks || savedBooks.length === 0) return null;

  return (
    <>
      {/* Floating Trigger Pill */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-[#004B87] text-white px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg shadow-lg flex items-center gap-2 hover:bg-[#003865] transition cursor-pointer max-w-[calc(100vw-32px)]"
        title="View your saved reading list"
      >
        <span className="relative">
          <Bookmark size={15} className="fill-white" />
          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-900 text-[9px] font-bold flex items-center justify-center">
            {savedBooks.length}
          </span>
        </span>
        <span className="text-xs font-semibold truncate">
          Saved Reading List ({savedBooks.length})
        </span>
      </button>

      {/* Drawer Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center sm:justify-end p-4 sm:p-0"
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#111827] border-l border-slate-200 dark:border-slate-800 h-full max-h-screen sm:w-[380px] w-full p-5 flex flex-col justify-between shadow-xl overflow-y-auto"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-[#004B87] dark:text-blue-400">
                    <BookmarkCheck size={18} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Saved Reading List
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {savedBooks.length} title{savedBooks.length > 1 ? 's' : ''} saved
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label="Close Drawer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Book Items */}
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {savedBooks.map((book) => (
                  <div
                    key={book._id || book.title}
                    className="bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex items-start justify-between gap-2.5"
                  >
                    <div className="flex gap-2.5">
                      <div className="w-8 h-10 rounded bg-white dark:bg-slate-800 flex items-center justify-center text-[#004B87] dark:text-blue-400 flex-shrink-0 border border-slate-200 dark:border-slate-700">
                        <BookOpen size={14} />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                          {book.category || 'Reference'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight line-clamp-1">
                          {book.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {book.author || 'Author cataloged'}
                        </p>
                        {book.availability !== undefined && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                            <CheckCircle2 size={10} /> {book.availability} in stacks
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveBook(book._id || book.title)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                      title="Remove from list"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 mt-4">
              <button
                onClick={handleCopyList}
                className="w-full py-2 rounded-lg bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Bookmark size={13} />
                <span>{copied ? 'Reading List Copied' : 'Copy List to Clipboard'}</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  if (setPage) setPage('packages');
                }}
                className="w-full py-2 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>View Membership Passes</span>
                <ArrowRight size={12} />
              </button>

              <div className="flex justify-between items-center pt-1 text-[11px] text-slate-500">
                <span>Show list at front desk</span>
                <button onClick={onClearAll} className="hover:text-rose-600 transition underline cursor-pointer">
                  Clear list
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

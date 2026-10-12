"use client";

import { useState } from 'react';
import { Bookmark, BookmarkCheck, Trash2, BookOpen, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      <motion.button
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#1C3A2B] dark:bg-[#346F4F] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 hover:bg-[#142B20] dark:hover:bg-[#3F845F] transition active:scale-95 border border-white/20 cursor-pointer"
        title="View your saved reading list"
      >
        <span className="relative">
          <Bookmark size={18} className="fill-white" />
          <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#E89A3C] text-black text-[10px] font-bold flex items-center justify-center">
            {savedBooks.length}
          </span>
        </span>
        <span className="text-xs font-semibold">
          Saved Study List ({savedBooks.length})
        </span>
      </motion.button>

      {/* Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center sm:justify-end p-4 sm:p-0"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#142019] border-l border-[#DFE6DC] dark:border-[#24382D] h-full max-h-screen sm:w-[420px] w-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#DFE6DC] dark:border-[#24382D] mb-5">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-[#EDF3EE] dark:bg-[#1A2E23] text-[#1C3A2B] dark:text-[#8FD4AE]">
                      <BookmarkCheck size={20} />
                    </span>
                    <div>
                      <h3 className="font-serif-lib text-lg font-bold text-[#1C2E24] dark:text-[#8FD4AE]">
                        My Reserved Reading List
                      </h3>
                      <p className="text-[11px] text-[#5D6B62] dark:text-[#9FB1A6]">
                        {savedBooks.length} title{savedBooks.length > 1 ? 's' : ''} saved for your next study session
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#1C2E24] dark:text-[#8FD4AE] cursor-pointer"
                    aria-label="Close Drawer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Book Items */}
                <div className="space-y-3 max-h-[58vh] overflow-y-auto pr-1">
                  {savedBooks.map((book) => (
                    <div
                      key={book._id || book.title}
                      className="bg-[#FAF8F5] dark:bg-[#18261F] border border-[#DFE6DC] dark:border-[#263D30] rounded-xl p-3.5 flex items-start justify-between gap-3 shadow-xs hover:border-[#1C3A2B]/40 transition"
                    >
                      <div className="flex gap-3">
                        <div className="w-9 h-12 rounded bg-[#EDF3EE] dark:bg-[#1F3327] flex items-center justify-center text-[#1C3A2B] dark:text-[#8FD4AE] flex-shrink-0">
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-[#8C6239] dark:text-[#DFB287] uppercase block">
                            {book.category || 'Reference'}
                          </span>
                          <h4 className="font-serif-lib text-xs font-bold text-[#1C2E24] dark:text-[#F0F5F2] leading-tight line-clamp-1">
                            {book.title}
                          </h4>
                          <p className="text-[11px] text-[#5D6B62] dark:text-[#A1B3A7] mt-0.5">
                            {book.author || 'Author cataloged'}
                          </p>
                          {book.availability !== undefined && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#2E6B3F] dark:text-[#72BE94] font-semibold mt-1">
                              <CheckCircle2 size={10} /> {book.availability} in physical stacks
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveBook(book._id || book.title)}
                        className="text-[#1C3A2B]/50 hover:text-[#C44B4B] p-1 rounded-md transition cursor-pointer"
                        title="Remove from list"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-5 border-t border-[#DFE6DC] dark:border-[#24382D] space-y-2 mt-4">
                <button
                  onClick={handleCopyList}
                  className="w-full py-2.5 rounded-xl bg-white dark:bg-[#18261F] border border-[#DFE6DC] dark:border-[#263D30] text-[#1C2E24] dark:text-[#A1DEBC] text-xs font-semibold hover:bg-[#EDF3EE] dark:hover:bg-[#1F3327] transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bookmark size={14} />
                  <span>{copied ? '✓ Reading List Copied!' : 'Copy Reading List to Clipboard'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (setPage) setPage('packages');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#1C3A2B] dark:bg-[#346F4F] text-white text-xs font-semibold hover:bg-[#142B20] dark:hover:bg-[#3F845F] transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>Get Library Pass to Reserve Titles</span>
                  <ArrowRight size={13} />
                </button>

                <div className="flex justify-between items-center pt-1 text-[11px] text-[#5D6B62] dark:text-[#8E9E93]">
                  <span>Show this list at Handwara front desk</span>
                  <button onClick={onClearAll} className="hover:text-[#C44B4B] transition underline cursor-pointer">
                    Clear all
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

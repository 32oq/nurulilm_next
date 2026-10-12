'use client';

import { useEffect } from "react";
import moment from "moment";
import { BookMarked, RotateCcw, Calendar, CheckCircle2 } from "lucide-react";
import { useOther } from "../../../context/OtherContext";
import { LoadingRow, ErrorRow } from "../shared";

const DueBadge = ({ loan }) => {
  if (loan.status === 'returned') {
    return (
      <span className="text-xs font-semibold text-[#1C3A2B] dark:text-[#8FD4AE] bg-[#EDF3EE] dark:bg-[#1E2E25] border border-[#D9E2DC] dark:border-[#2B4032] px-2.5 py-0.5 rounded-md">
        Returned
      </span>
    );
  }
  const days = moment(loan.due_date).diff(moment(), 'days');
  if (days < 0) {
    return (
      <span className="text-xs font-semibold text-[#A83232] dark:text-[#FCA5A5] bg-[#FAF0F0] dark:bg-[#3D1A1A] border border-[#F0D5D5] dark:border-[#5C2A2A] px-2.5 py-0.5 rounded-md">
        {Math.abs(days)}d Overdue
      </span>
    );
  }
  if (days === 0) {
    return (
      <span className="text-xs font-semibold text-[#92400E] dark:text-[#FDE68A] bg-[#FFFBEB] dark:bg-[#382B14] border border-[#FDE68A] dark:border-[#574019] px-2.5 py-0.5 rounded-md">
        Due Today
      </span>
    );
  }
  if (days <= 3) {
    return (
      <span className="text-xs font-semibold text-[#92400E] dark:text-[#FDE68A] bg-[#FFFBEB] dark:bg-[#382B14] border border-[#FDE68A] dark:border-[#574019] px-2.5 py-0.5 rounded-md">
        Due in {days}d
      </span>
    );
  }
  return (
    <span className="text-xs font-medium text-[#5D645E] dark:text-[#9FB1A6] bg-[#FAF8F5] dark:bg-[#203126] border border-[#E5DFD5] dark:border-[#2C4233] px-2.5 py-0.5 rounded-md">
      Due {moment(loan.due_date).format('DD MMM YYYY')}
    </span>
  );
};

export default function StudentLoans() {
  const { state: { loans, loading, error }, fetchMyLoans } = useOther();

  useEffect(() => { fetchMyLoans(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isOverdue = (loan) => loan.status === 'active' && moment(loan.due_date).isBefore(moment(), 'day');
  const active  = (loans || []).filter(l => l.status === 'active');
  const history = (loans || []).filter(l => l.status === 'returned');

  return (
    <div className="space-y-6 w-full max-w-5xl">

      {/* Header */}
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093]">
          Circulation Record
        </span>
        <h2 className="font-serif-lib text-2xl font-bold text-[#1C3A2B] dark:text-[#FAF8F5] mt-0.5">
          My Borrowed Books
        </h2>
        <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] mt-1">
          Review your active library loans and completed reading history.
        </p>
      </div>

      {/* Stat Strip */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-semibold text-[#6D8374] dark:text-[#8CA093] uppercase tracking-wide mb-1">
            Currently in Possession
          </p>
          <p className="font-serif-lib text-3xl font-bold text-[#1C3A2B] dark:text-[#FAF8F5]">
            {loading ? '-' : active.length}
          </p>
          <p className="text-xs text-[#7F8781] dark:text-[#9FB1A6] mt-1">
            {active.filter(isOverdue).length > 0 ? (
              <span className="text-[#A83232] dark:text-[#F87171] font-semibold">{active.filter(isOverdue).length} book overdue</span>
            ) : (
              'All books on schedule'
            )}
          </p>
        </div>

        <div className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-semibold text-[#6D8374] dark:text-[#8CA093] uppercase tracking-wide mb-1">
            Total Books Returned
          </p>
          <p className="font-serif-lib text-3xl font-bold text-[#2E6B3F] dark:text-[#8FD4AE]">
            {loading ? '-' : history.length}
          </p>
          <p className="text-xs text-[#7F8781] dark:text-[#9FB1A6] mt-1">Lifetime borrowing history</p>
        </div>
      </div>

      {loading && <LoadingRow />}
      {error   && <ErrorRow />}

      {/* Active Loans */}
      {!loading && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#6D8374] dark:text-[#8CA093] uppercase tracking-wider flex items-center gap-2">
            <BookMarked size={14} className="text-[#1C3A2B] dark:text-[#8FD4AE]" /> Currently Issued to You
          </h3>

          {active.length === 0 ? (
            <div className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl py-12 px-6 flex flex-col items-center justify-center gap-2 shadow-xs text-center">
              <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] dark:bg-[#203126] text-[#7F8781] dark:text-[#8FD4AE] flex items-center justify-center">
                <BookMarked size={24} />
              </div>
              <p className="font-serif-lib text-base font-bold text-[#1C3A2B] dark:text-[#FAF8F5]">No active book loans</p>
              <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] max-w-sm">
                You do not currently have any books checked out. Visit the library stacks to borrow reference texts.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {active.map(loan => (
                <div
                  key={loan._id}
                  className={`bg-white dark:bg-[#16211B] border rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition
                    ${isOverdue(loan) ? 'border-[#F0D5D5] dark:border-[#522323] bg-[#FFFBFB] dark:bg-[#2D1616]' : 'border-[#E5DFD5] dark:border-[#26362D]'}`}
                >
                  <div className="min-w-0">
                    <p className="font-serif-lib text-base font-bold text-[#1C3A2B] dark:text-[#FAF8F5] leading-snug">
                      {loan.resource_title}
                    </p>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-[#5D645E] dark:text-[#9FB1A6]">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#6D8374] dark:text-[#8CA093]" />
                        <span>Issued {moment(loan.issued_at).format('DD MMM YYYY')}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 sm:text-right">
                    <DueBadge loan={loan} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Return History */}
      {!loading && history.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-semibold text-[#6D8374] dark:text-[#8CA093] uppercase tracking-wider flex items-center gap-2">
            <RotateCcw size={14} className="text-[#2E6B3F] dark:text-[#8FD4AE]" /> Return History
          </h3>

          <div className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl shadow-xs overflow-hidden">
            <div className="hidden sm:grid grid-cols-3 gap-4 px-5 py-3 border-b border-[#EFEBE4] dark:border-[#26362D] text-[11px] font-semibold text-[#6D8374] dark:text-[#8CA093] uppercase tracking-wider bg-[#FAF8F5] dark:bg-[#1E2E25]">
              <span>Book Title</span>
              <span>Date Issued</span>
              <span>Status</span>
            </div>

            <div className="divide-y divide-[#EFEBE4] dark:divide-[#26362D]">
              {history.map(loan => (
                <div key={loan._id} className="px-5 py-3.5 flex flex-col sm:grid sm:grid-cols-3 sm:gap-4 gap-1 text-xs hover:bg-[#FAF8F5] dark:hover:bg-[#1E2E25]/50 transition">
                  <span className="font-medium text-[#1C1E1B] dark:text-white">{loan.resource_title}</span>
                  <span className="text-[#5D645E] dark:text-[#9FB1A6]">{moment(loan.issued_at).format('DD MMM YYYY')}</span>
                  <div>
                    <span className="inline-flex items-center gap-1 text-[#2E6B3F] dark:text-[#8FD4AE] font-semibold text-xs">
                      <CheckCircle2 size={13} /> Returned to Stacks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

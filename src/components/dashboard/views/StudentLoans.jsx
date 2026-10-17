'use client';

import { useEffect } from "react";
import moment from "moment";
import { BookMarked, RotateCcw, Calendar, CheckCircle2 } from "lucide-react";
import { useOther } from "../../../context/OtherContext";
import { LoadingRow, ErrorRow } from "../shared";

const DueBadge = ({ loan }) => {
  if (loan.status === 'returned') {
    return (
      <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
        Returned
      </span>
    );
  }
  const days = moment(loan.due_date).diff(moment(), 'days');
  if (days < 0) {
    return (
      <span className="text-xs font-semibold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded">
        {Math.abs(days)}d Overdue
      </span>
    );
  }
  if (days === 0) {
    return (
      <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded">
        Due Today
      </span>
    );
  }
  if (days <= 3) {
    return (
      <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded">
        Due in {days}d
      </span>
    );
  }
  return (
    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded">
      Due {moment(loan.due_date).format('DD MMM YYYY')}
    </span>
  );
};

export default function StudentLoans() {
  const { state: { loans, loading, error }, fetchMyLoans } = useOther();

  useEffect(() => { fetchMyLoans(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isOverdue = (loan) => loan?.status === 'active' && moment(loan.due_date).isBefore(moment(), 'day');
  const loansList = Array.isArray(loans) ? loans : (Array.isArray(loans?.data) ? loans.data : (Array.isArray(loans?.loans) ? loans.loans : []));
  const active  = loansList.filter(l => l && (l.status === 'active' || l.status === 'borrowed' || !l.return_date));
  const history = loansList.filter(l => l && (l.status === 'returned' || !!l.return_date));

  return (
    <div className="space-y-6 w-full max-w-5xl">

      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Circulation Record
        </span>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
          My Borrowed Books
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Review your active library loans and completed reading history.
        </p>
      </div>

      {/* Stat Strip */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Currently Issued
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {loading ? '-' : active.length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {active.filter(isOverdue).length > 0 ? (
              <span className="text-rose-700 dark:text-rose-400 font-semibold">{active.filter(isOverdue).length} book overdue</span>
            ) : (
              'All books on schedule'
            )}
          </p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Total Books Returned
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {loading ? '-' : history.length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Lifetime borrowing history</p>
        </div>
      </div>

      {loading && <LoadingRow />}
      {error   && <ErrorRow />}

      {/* Active Loans */}
      {!loading && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <BookMarked size={14} className="text-[#004B87] dark:text-blue-400" />
            <span>Currently Issued to You</span>
          </h3>

          {active.length === 0 ? (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl py-10 px-6 flex flex-col items-center justify-center gap-2 text-center shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                <BookMarked size={20} />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">No active book loans</p>
              <p className="text-xs text-slate-500 max-w-sm">
                You do not currently have any books checked out. Visit the catalog stacks to borrow reference texts.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {active.map(loan => (
                <div
                  key={loan._id}
                  className={`bg-white dark:bg-[#111827] border rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition
                    ${isOverdue(loan) ? 'border-rose-200 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-800'}`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {loan.resource_title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
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
        <div className="space-y-3 pt-3">
          <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <RotateCcw size={14} className="text-slate-500" />
            <span>Return History</span>
          </h3>

          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
            <div className="hidden sm:grid grid-cols-3 gap-4 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50">
              <span>Book Title</span>
              <span>Date Issued</span>
              <span>Status</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {history.map(loan => (
                <div key={loan._id} className="px-4 py-3 flex flex-col sm:grid sm:grid-cols-3 sm:gap-4 gap-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <span className="font-medium text-slate-900 dark:text-slate-100">{loan.resource_title}</span>
                  <span className="text-slate-500">{moment(loan.issued_at).format('DD MMM YYYY')}</span>
                  <div>
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
                      <CheckCircle2 size={12} /> Returned to Stacks
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

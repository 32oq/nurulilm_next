'use client';

import { useState, useEffect } from "react";
import moment from "moment";
import { BookMarked, RefreshCw, Plus, Search, RotateCcw, X, AlertTriangle, Loader2 } from "lucide-react";
import { useOther } from "../../../context/OtherContext";
import { LoadingRow, ErrorRow } from "../shared";

const StatusBadge = ({ status, dueDate }) => {
  const isOverdue = status === 'active' && moment(dueDate).isBefore(moment(), 'day');
  const label = isOverdue ? 'Overdue' : status === 'active' ? 'Active' : 'Returned';
  const cls = isOverdue
    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900"
    : status === 'active'
      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  return <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold border ${cls}`}>{label}</span>;
};

export default function AdminLoans() {
  const {
    state: { loans, resources, students, loading, error },
    fetchLoans, fetchStudents, fetchResources, issueBook, returnBook,
  } = useOther();

  const defaultDue = moment().add(14, 'days').format('YYYY-MM-DD');

  const [loanFilter,     setLoanFilter]     = useState("active");
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm,      setIssueForm]      = useState({ user_id: "", user_name: "", resource_id: "", resource_title: "", due_date: defaultDue });
  const [issueError,     setIssueError]     = useState(null);
  const [issueSaving,    setIssueSaving]    = useState(false);
  const [studentSearch,  setStudentSearch]  = useState('');

  useEffect(() => {
    fetchLoans({ status: "active" });
    fetchStudents();
    fetchResources();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loansList = Array.isArray(loans) ? loans : (Array.isArray(loans?.data) ? loans.data : []);
  const resourcesList = Array.isArray(resources) ? resources : (Array.isArray(resources?.data) ? resources.data : []);
  const filteredLoans   = loansList.filter(l => loanFilter === "all" ? true : l?.status === loanFilter);
  const availableBooks  = resourcesList.filter(r => (r?.availability ?? 0) > 0);

  const openIssue = () => {
    setIssueForm({ user_id: "", user_name: "", resource_id: "", resource_title: "", due_date: defaultDue });
    setStudentSearch("");
    setIssueError(null);
    setShowIssueModal(true);
  };

  const handleIssue = async () => {
    if (!issueForm.user_id || !issueForm.resource_id) { setIssueError("Please select both a student and a book."); return; }
    setIssueSaving(true);
    setIssueError(null);
    const result = await issueBook(issueForm);
    setIssueSaving(false);
    if (result) { setShowIssueModal(false); await fetchLoans({ status: loanFilter === "all" ? undefined : loanFilter }); await fetchResources(); }
    else setIssueError("Failed to issue book. The book may be unavailable.");
  };

  const handleReturn = async (loanId) => {
    if (!window.confirm("Mark this book as returned to library shelves?")) return;
    const result = await returnBook(loanId);
    if (result) { await fetchLoans({ status: loanFilter === "all" ? undefined : loanFilter }); await fetchResources(); }
  };

  const handleStudentSearch = async (val) => {
    setStudentSearch(val);
    setIssueForm(f => ({ ...f, user_id: "", user_name: "" }));
    if (val.length > 1) await fetchStudents(val);
  };

  const switchFilter = (f) => {
    setLoanFilter(f);
    fetchLoans(f !== "all" ? { status: f } : {});
  };

  return (
    <div className="space-y-6 w-full max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white">
            Book Loans &amp; Circulation
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Issue books to verified students, set due dates, and track returns.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => { fetchLoans(loanFilter !== "all" ? { status: loanFilter } : {}); fetchResources(); }}
            disabled={loading}
            className="p-2.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition disabled:opacity-50 shadow-xs cursor-pointer"
            title="Refresh Loans"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={openIssue}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#004B87] hover:bg-[#003B6B] text-white rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            <Plus size={15} /> Issue Book
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["active", "returned", "all"].map(f => (
          <button
            key={f}
            onClick={() => switchFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
              loanFilter === f
                ? "bg-[#004B87] text-white"
                : "bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {f === "active" ? "Active Loans" : f === "returned" ? "Returned" : "All Records"}
          </button>
        ))}
      </div>

      {loading && <LoadingRow />}
      {error   && <ErrorRow />}

      {!loading && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
          {!filteredLoans.length ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-2 text-center">
              <BookMarked size={32} className="text-slate-400" />
              <p className="font-serif-lib text-base font-bold text-slate-900 dark:text-white">No {loanFilter !== "all" ? loanFilter : ""} loans found</p>
              <p className="text-xs text-slate-500">Use "Issue Book" to create a new lending record.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                      <th className="px-5 py-3 text-left">Student Patron</th>
                      <th className="px-5 py-3 text-left">Book Title</th>
                      <th className="px-5 py-3 text-left">Issued</th>
                      <th className="px-5 py-3 text-left">Due Date</th>
                      <th className="px-5 py-3 text-left">Status</th>
                      <th className="px-5 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredLoans.map(loan => (
                      <tr key={loan._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">{loan.user_name}</td>
                        <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 max-w-[220px] truncate">{loan.resource_title}</td>
                        <td className="px-5 py-3.5 text-slate-500">{moment(loan.issued_at).format('DD MMM YYYY')}</td>
                        <td className="px-5 py-3.5 text-slate-500">{moment(loan.due_date).format('DD MMM YYYY')}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={loan.status} dueDate={loan.due_date} /></td>
                        <td className="px-5 py-3.5">
                          {loan.status === 'active' && (
                            <button
                              onClick={() => handleReturn(loan._id)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-[#004B87] text-slate-800 hover:text-white dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded text-xs font-semibold transition cursor-pointer"
                            >
                              <RotateCcw size={12} /> Return Book
                            </button>
                          )}
                          {loan.status === 'returned' && (
                            <span className="text-xs text-slate-400">{moment(loan.returned_at).format('DD MMM')}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLoans.map(loan => (
                  <div key={loan._id} className="p-4 space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-semibold text-xs text-slate-900 dark:text-white">{loan.user_name}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{loan.resource_title}</p>
                      </div>
                      <StatusBadge status={loan.status} dueDate={loan.due_date} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Issued: {moment(loan.issued_at).format('DD MMM')}</span>
                      <span>Due: {moment(loan.due_date).format('DD MMM')}</span>
                    </div>
                    {loan.status === 'active' && (
                      <button
                        onClick={() => handleReturn(loan._id)}
                        className="w-full py-2 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-[#004B87] text-slate-800 hover:text-white dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded text-xs font-semibold transition cursor-pointer"
                      >
                        <RotateCcw size={13} /> Mark Returned
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Issue Book Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-serif-lib text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookMarked size={17} className="text-[#004B87]" /> Issue Book to Student
                </h3>
              </div>
              <button onClick={() => setShowIssueModal(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Student Search */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Student *</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={studentSearch}
                  onChange={e => handleStudentSearch(e.target.value)}
                  placeholder="Type student name to search..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
                />
              </div>
              {issueForm.user_id ? (
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1">Selected: {issueForm.user_name}</p>
              ) : students?.length > 0 && studentSearch.length > 1 ? (
                <div className="mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden max-h-36 overflow-y-auto shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map(s => (
                    <button
                      key={s._id}
                      onClick={() => {
                        setIssueForm(f => ({ ...f, user_id: s._id, user_name: s.full_name || s.email }));
                        setStudentSearch(s.full_name || s.email);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">{s.full_name}</p>
                      <p className="text-[11px] text-slate-500">{s.email}</p>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Book Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Book *</label>
              <select
                value={issueForm.resource_id}
                onChange={e => {
                  const book = availableBooks.find(b => b._id === e.target.value);
                  setIssueForm(f => ({ ...f, resource_id: e.target.value, resource_title: book?.title || "" }));
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
              >
                <option value="">Select an available book title...</option>
                {availableBooks.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.title}{b.author ? ` - ${b.author}` : ''} ({b.availability} copies available)
                  </option>
                ))}
              </select>
              {availableBooks.length === 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">No copies currently available in library catalog.</p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Scheduled Due Date</label>
              <input
                type="date"
                value={issueForm.due_date}
                min={moment().add(1, 'day').format('YYYY-MM-DD')}
                onChange={e => setIssueForm(f => ({ ...f, due_date: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
              />
            </div>

            {issueError && (
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-3 py-2 rounded-lg text-xs">
                <AlertTriangle size={14} /> {issueError}
              </div>
            )}

            <button
              disabled={!issueForm.user_id || !issueForm.resource_id || issueSaving}
              onClick={handleIssue}
              className="w-full py-2.5 rounded-lg bg-[#004B87] hover:bg-[#003B6B] disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {issueSaving ? <Loader2 size={15} className="animate-spin" /> : <BookMarked size={15} />}
              <span>Confirm &amp; Issue Book</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from "react";
import moment from "moment";
import {
  DollarSign, User, ShieldCheck, ShieldAlert,
  BookMarked, BookOpen, AlertTriangle, Clock,
  CreditCard, Loader2, CalendarDays, ArrowRight,
  Timer, Play, Pin, Send, QrCode, MapPin, Brain
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useOther } from "../../../context/OtherContext";
import StudyFocusTimer from "../../StudyFocusTimer";
import DigitalPatronIdCard from "../DigitalPatronIdCard";
import InteractiveDeskMap from "../InteractiveDeskMap";
import StudyStreakTracker from "../StudyStreakTracker";
import ExamRepository from "../ExamRepository";
import ScholarSynapseGame from "../ScholarSynapseGame";

export default function StudentOverview({ setView }) {
  const { state: { user } } = useAuth();
  const { state: { libraryTimings }, fetchMyLoans, fetchTxns, fetchLibraryTimings, submitCommunityNote } = useOther();

  const [loans,     setLoans]     = useState(null);
  const [txns,      setTxns]      = useState(null);
  const [loadStats, setLoadStats] = useState(true);

  // Focus sprint & mind game companion modals
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
  const [isSynapseOpen, setIsSynapseOpen] = useState(false);

  // Patron Platform modals
  const [showIdCard, setShowIdCard] = useState(false);
  const [showDeskMap, setShowDeskMap] = useState(false);
  const [showExamRepo, setShowExamRepo] = useState(false);

  // Community Bulletin Board submitter states
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteTag, setNoteTag] = useState("UPSC & Civil Services");
  const [noteAuthor, setNoteAuthor] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteFeedback, setNoteFeedback] = useState(null);

  useEffect(() => {
    if (fetchLibraryTimings) fetchLibraryTimings();
    Promise.all([fetchMyLoans(), fetchTxns()]).then(([l, t]) => {
      setLoans(Array.isArray(l) ? l : []);
      setTxns(t === true ? [] : (Array.isArray(t) ? t : []));
      setLoadStats(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Patron';
  const initials    = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'M';
  const isVerified  = user?.verified === 1;
  const isPaid      = user?.lastpayment && moment(user.lastpayment).isSameOrAfter(moment(), 'day');
  const daysLeft    = user?.lastpayment ? moment(user.lastpayment).diff(moment(), 'days') : null;

  const loansList = Array.isArray(loans) ? loans : (Array.isArray(loans?.data) ? loans.data : (Array.isArray(loans?.loans) ? loans.loans : []));
  const txnsList  = Array.isArray(txns) ? txns : (Array.isArray(txns?.allPayments) ? txns.allPayments : (Array.isArray(txns?.data) ? txns.data : []));

  const active   = loansList.filter(l => l && (l.status === 'active' || l.status === 'borrowed' || !l.return_date));
  const returned = loansList.filter(l => l && (l.status === 'returned' || !!l.return_date));
  const overdue  = active.filter(l => l?.due_date && moment(l.due_date).isBefore(moment(), 'day'));
  const confirmedPayments = txnsList.filter(t => t?.confirmation);

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteText.trim() || noteText.trim().length < 5) {
      setNoteFeedback({ type: 'error', msg: 'Please enter at least 5 characters for your study resolution.' });
      return;
    }
    setNoteSubmitting(true);
    setNoteFeedback(null);
    try {
      const res = await submitCommunityNote({
        note: noteText.trim(),
        tag: noteTag.trim() || 'Study Focus',
        author: noteAuthor.trim() || displayName
      });
      setNoteFeedback({
        type: 'success',
        msg: res?.results?.msg || '✓ Your note has been submitted for audit. Once approved by library administration, it will be published on the Community Bulletin Board on the landing page.'
      });
      setNoteText('');
      setShowNoteForm(false);
    } catch (err) {
      console.error('Note submit error:', err);
      setNoteFeedback({
        type: 'error',
        msg: err?.message || 'Failed to submit note. Please try again.'
      });
    } finally {
      setNoteSubmitting(false);
    }
  };

  const dash = loadStats ? '-' : undefined;

  return (
    <div className="space-y-6 w-full max-w-5xl">

      {/* ── Welcome Plaque ─────────────────────────────── */}
      <div className="bg-[#0F2D59] text-white rounded-xl p-6 sm:p-7 shadow-xs border border-[#1E3A5F] relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white text-[#0F2D59] flex items-center justify-center text-base font-bold select-none shadow-xs">
              {initials}
            </div>

            <div className="min-w-0">
              <span className="text-slate-300 text-[11px] font-semibold uppercase tracking-wider block">
                Patron Desk
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight truncate">
                {displayName}
              </h2>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold
                  ${isVerified
                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                    : "bg-amber-950/80 text-amber-300 border border-amber-800"}`}>
                  {isVerified ? <ShieldCheck size={11} /> : <ShieldAlert size={11} />}
                  {isVerified ? 'Identity Confirmed' : 'Verification Required'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium bg-white/10 text-slate-200 capitalize">
                  <User size={11} /> {user?.act || 'Active Patron'}
                </span>
                {isPaid && daysLeft !== null && daysLeft <= 7 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-800 text-amber-100">
                    <Clock size={11} /> {daysLeft}d left on pass
                  </span>
                )}
              </div>

              {/* Patron Action Suite Quick Access */}
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowIdCard(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition cursor-pointer shadow-2xs"
                >
                  <QrCode size={13} className="text-sky-300" />
                  <span>Digital Patron Pass</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeskMap(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition cursor-pointer shadow-2xs"
                >
                  <MapPin size={13} className="text-emerald-300" />
                  <span>Reserve Study Desk</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowExamRepo(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition cursor-pointer shadow-2xs"
                >
                  <BookOpen size={13} className="text-amber-300" />
                  <span>Exam PYQ Archive</span>
                </button>
              </div>
            </div>
          </div>

          {(() => {
            let currentlyOpen = true;
            try {
              const openM = moment(libraryTimings?.open_time || '07:00 AM', ['h:mm A', 'hh:mm A', 'H:mm', 'HH:mm']);
              const closeM = moment(libraryTimings?.close_time || '09:00 PM', ['h:mm A', 'hh:mm A', 'H:mm', 'HH:mm']);
              const now = moment();
              if (libraryTimings?.is_open_today === false) {
                currentlyOpen = false;
              } else if (openM.isValid() && closeM.isValid()) {
                const openT = moment().set({ hour: openM.hour(), minute: openM.minute(), second: 0 });
                const closeT = moment().set({ hour: closeM.hour(), minute: closeM.minute(), second: 0 });
                if (closeT.isBefore(openT)) {
                  currentlyOpen = now.isAfter(openT) || now.isBefore(closeT);
                } else {
                  currentlyOpen = now.isBetween(openT, closeT);
                }
              }
            } catch (e) {
              currentlyOpen = true;
            }

            return (
              <div className="sm:text-right border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                <p className="text-[11px] text-slate-300">Center Schedule</p>
                <div className="flex items-center sm:justify-end gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${currentlyOpen ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <p className="text-xs font-semibold text-white">
                    {currentlyOpen ? 'Open Now' : 'Closed'} ({libraryTimings?.open_time || '07:00 AM'} to {libraryTimings?.close_time || '09:00 PM'})
                  </p>
                </div>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  {libraryTimings?.days || 'Monday to Sunday'}
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Aspirant Study Streak & Deep Work Engine ── */}
      <StudyStreakTracker
        user={user}
        onOpenTimer={() => setIsFocusTimerOpen(true)}
        onOpenSynapse={() => setIsSynapseOpen(true)}
      />

      {/* ── Dual Scholar Companion Hub: Focus Sprint + Synapse Mind Break ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Quiet Focus Sprint */}
        <div className="bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 rounded-xl p-5 shadow-2xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004B87] dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Timer size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  Deep Focus
                </span>
                <span className="text-[11px] text-slate-500">25m Pomodoro Protocol</span>
              </div>
              <h3 className="text-sm font-bold mt-1">Quiet Study Focus Sprint</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Log deep study intervals at your physical desk with ambient library acoustics and streak tracking.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
            <button
              onClick={() => setView('focus_sprint')}
              className="px-3.5 py-1.5 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Play size={12} className="fill-white" />
              <span>Open Focus Hub</span>
            </button>
          </div>
        </div>

        {/* Card 2: Scholar Synapse Daily Mind Break */}
        <div className="bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 rounded-xl p-5 shadow-2xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <Brain size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded">
                  Daily Mind Break
                </span>
                <span className="text-[11px] text-slate-500">60s Cognitive Reset</span>
              </div>
              <h3 className="text-sm font-bold mt-1">Scholar Synapse Puzzle</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Take a brief intellectual break to relax stamina. Connect 4 clues to their underlying exam concept.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
            <button
              onClick={() => setIsSynapseOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Brain size={12} />
              <span>Launch Synapse (60s)</span>
            </button>
          </div>
        </div>

      </div>

      {/* ── Desk Activity Grid ───────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Desk Activity Overview
          </span>
          {loadStats && <Loader2 size={13} className="animate-spin text-slate-500" />}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {/* Books borrowed */}
          <div
            onClick={() => setView('loans')}
            className="cursor-pointer rounded-xl p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Currently Borrowed</span>
              <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-950/40 text-[#004B87] dark:text-blue-400 flex items-center justify-center">
                <BookMarked size={14} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{dash ?? active.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">active loans</p>
          </div>

          {/* Overdue */}
          <div
            onClick={() => setView('loans')}
            className={`cursor-pointer rounded-xl p-4 border shadow-2xs transition
              ${overdue.length > 0
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 hover:border-rose-400'
                : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Overdue Books</span>
              <div className={`w-7 h-7 rounded-md flex items-center justify-center ${overdue.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <AlertTriangle size={14} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${overdue.length > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-slate-900 dark:text-slate-100'}`}>
              {dash ?? overdue.length}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">{overdue.length > 0 ? 'return required' : 'all loans on schedule'}</p>
          </div>

          {/* Books read */}
          <div
            onClick={() => setView('loans')}
            className="cursor-pointer rounded-xl p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Books Returned</span>
              <div className="w-7 h-7 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <BookOpen size={14} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{dash ?? returned.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">completed loans</p>
          </div>

          {/* Fee status */}
          <div
            onClick={() => setView('payments')}
            className={`cursor-pointer rounded-xl p-4 border shadow-2xs transition
              ${isPaid
                ? 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 hover:border-amber-400'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Membership Pass</span>
              <div className={`w-7 h-7 rounded-md flex items-center justify-center ${isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                <DollarSign size={14} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${isPaid ? 'text-slate-900 dark:text-slate-100' : 'text-amber-800 dark:text-amber-300'}`}>
              {isPaid ? 'Active' : 'Due'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isPaid && daysLeft !== null
                ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`
                : user?.lastpayment ? 'pass expired' : 'no active pass'}
            </p>
          </div>

          {/* Payments made */}
          <div
            onClick={() => setView('payments')}
            className="cursor-pointer rounded-xl p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Confirmed Receipts</span>
              <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-950/40 text-[#004B87] dark:text-blue-400 flex items-center justify-center">
                <CreditCard size={14} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{dash ?? confirmedPayments.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">verified ledger receipts</p>
          </div>

          {/* Member since */}
          <div className="rounded-xl p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Enrolled</span>
              <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                <CalendarDays size={14} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {user?.lastpayment ? moment(user.lastpayment).subtract(1, 'month').format('MMM YYYY') : 'Member'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 capitalize">{user?.act || 'Patron'}</p>
          </div>
        </div>
      </div>

      {/* ── Active Borrowed Books Callout ─────────────────── */}
      {!loadStats && active.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Currently Issued to You
            </span>
            <button onClick={() => setView('loans')} className="text-xs font-semibold text-[#004B87] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer">
              <span>View All Borrowed Books</span>
              <ArrowRight size={11} />
            </button>
          </div>
          <div className="space-y-2">
            {active.slice(0, 3).map(loan => {
              const days = moment(loan.due_date).diff(moment(), 'days');
              const isOv = days < 0;
              return (
                <div key={loan._id} className="flex items-center justify-between gap-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-950/40 text-[#004B87] dark:text-blue-400 flex-shrink-0 flex items-center justify-center">
                      <BookMarked size={14} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{loan.resource_title}</p>
                      <p className="text-[11px] text-slate-500">Issued {moment(loan.issued_at).format('DD MMM YYYY')}</p>
                    </div>
                  </div>
                  <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded border
                    ${isOv
                      ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                      : days === 0
                        ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}`}>
                    {isOv ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d remaining`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Action Notice Banners ─────────────────────────── */}
      {!isPaid && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div>
            <p className="font-semibold text-xs text-amber-900 dark:text-amber-200">Membership Dues Notice</p>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">Your monthly study pass is due. Renew online to maintain uninterrupted desk access.</p>
          </div>
          <button
            onClick={() => setView('payments')}
            className="flex-shrink-0 px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Pay Monthly Dues
          </button>
        </div>
      )}

      {!isVerified && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div>
            <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">Verification Pending</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Please submit your identity verification form to fulfill library safety compliance.</p>
          </div>
          <button
            onClick={() => setView('Settings')}
            className="flex-shrink-0 px-3.5 py-1.5 bg-[#004B87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Complete Verification
          </button>
        </div>
      )}

      {/* ── Community Bulletin Board: Pin a Study Note ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004B87] dark:text-blue-400">
              <Pin size={16} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Community Bulletin Noticeboard
              </h3>
              <p className="text-xs text-slate-500">
                Share a study goal or encouragement. Pinned notes are verified by library staff before appearing live.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNoteForm(!showNoteForm)}
            className="px-3.5 py-1.5 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
          >
            <Send size={12} />
            <span>{showNoteForm ? "Close Form" : "Submit a Note"}</span>
          </button>
        </div>

        {noteFeedback && (
          <div
            className={`p-3 rounded-lg text-xs font-medium border flex items-center justify-between ${
              noteFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
            }`}
          >
            <span>{noteFeedback.msg}</span>
            <button onClick={() => setNoteFeedback(null)} className="underline cursor-pointer">Dismiss</button>
          </div>
        )}

        {showNoteForm && (
          <form onSubmit={handleNoteSubmit} className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Target Exam or Study Field
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UPSC, NEET 2025, JKAS Aspirant"
                  value={noteTag}
                  onChange={(e) => setNoteTag(e.target.value)}
                  className="w-full bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#004B87]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder={displayName}
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  className="w-full bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#004B87]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Your Study Note or Advice
              </label>
              <textarea
                required
                rows={3}
                placeholder="Share your daily study target or advice for fellow students..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#004B87]"
              />
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  id="note-publication-consent"
                  className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-[#004B87] focus:ring-[#004B87] cursor-pointer"
                />
                <span className="text-[11px] leading-relaxed">
                  I consent to having my study resolution and chosen display name published on the public Community Noticeboard upon administrative review.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Forwarded to administrator queue upon submission
              </span>
              <button
                type="submit"
                disabled={noteSubmitting}
                className="px-4 py-2 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                {noteSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={12} />}
                <span>{noteSubmitting ? "Submitting..." : "Submit for Audit"}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Focus Companion Modal */}
      <StudyFocusTimer
        isOpen={isFocusTimerOpen}
        onClose={() => setIsFocusTimerOpen(false)}
      />

      {/* Digital Patron ID Card Modal */}
      {showIdCard && (
        <DigitalPatronIdCard
          user={user}
          txns={txns}
          onClose={() => setShowIdCard(false)}
        />
      )}

      {/* Interactive Desk Map Modal */}
      {showDeskMap && (
        <InteractiveDeskMap
          user={user}
          onClose={() => setShowDeskMap(false)}
        />
      )}

      {/* Digital Exam Repository Modal */}
      {showExamRepo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full">
            <ExamRepository onClose={() => setShowExamRepo(false)} />
          </div>
        </div>
      )}

      {/* Scholar Synapse Daily Mind Break Modal */}
      <ScholarSynapseGame
        isOpen={isSynapseOpen}
        onClose={() => setIsSynapseOpen(false)}
      />

    </div>
  );
}

'use client';

import { useState, useEffect } from "react";
import moment from "moment";
import axios from "axios";
import {
  DollarSign, User, ShieldCheck, ShieldAlert,
  BookMarked, BookOpen, AlertTriangle, Clock,
  CreditCard, Loader2, CalendarDays, ArrowRight,
  Timer, Play, Pin, Send, QrCode, MapPin, Sparkles
} from "lucide-react";
import { useAuth, getMemoryToken } from "../../../context/AuthContext";
import { useOther } from "../../../context/OtherContext";
import { getApiBase } from "../../../config/api";
import StudyFocusTimer from "../../StudyFocusTimer";
import DigitalPatronIdCard from "../DigitalPatronIdCard";
import InteractiveDeskMap from "../InteractiveDeskMap";
import StudyStreakTracker from "../StudyStreakTracker";
import ExamRepository from "../ExamRepository";

export default function StudentOverview({ setView }) {
  const { state: { user } } = useAuth();
  const { state: { libraryTimings }, fetchMyLoans, fetchTxns, fetchLibraryTimings } = useOther();

  const [loans,     setLoans]     = useState(null);
  const [txns,      setTxns]      = useState(null);
  const [loadStats, setLoadStats] = useState(true);

  // Focus sprint companion modal
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);

  // New Patron Platform modals
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

  const active   = (loans || []).filter(l => l.status === 'active');
  const returned = (loans || []).filter(l => l.status === 'returned');
  const overdue  = active.filter(l => moment(l.due_date).isBefore(moment(), 'day'));
  const confirmedPayments = (txns || []).filter(t => t.confirmation);

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteText.trim() || noteText.trim().length < 5) {
      setNoteFeedback({ type: 'error', msg: 'Please enter at least 5 characters for your study resolution.' });
      return;
    }
    setNoteSubmitting(true);
    setNoteFeedback(null);
    try {
      const token = getMemoryToken();
      const res = await axios.post(
        `${getApiBase()}/dashboard/community-notes/submit`,
        {
          note: noteText.trim(),
          tag: noteTag.trim() || 'Study Focus',
          author: noteAuthor.trim() || displayName
        },
        {
          headers: token ? { 'x-access-token': token, Authorization: `Bearer ${token}` } : {}
        }
      );
      setNoteFeedback({
        type: 'success',
        msg: res?.data?.results?.msg || '✓ Your note has been submitted for audit. Once approved by library administration, it will be published on the Community Bulletin Board on the landing page.'
      });
      setNoteText('');
      setShowNoteForm(false);
    } catch (err) {
      console.error('Note submit error:', err);
      setNoteFeedback({
        type: 'error',
        msg: err?.response?.data?.error?.msg || 'Failed to submit note. Please try again.'
      });
    } finally {
      setNoteSubmitting(false);
    }
  };

  const dash = loadStats ? '-' : undefined;

  return (
    <div className="space-y-6 w-full max-w-5xl">

      {/* ── Welcome Plaque ─────────────────────────────── */}
      <div className="bg-[#1C3A2B] text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-[#244232] relative overflow-hidden">
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white text-[#1C3A2B] flex items-center justify-center text-lg font-bold select-none shadow-sm font-serif-lib">
              {initials}
            </div>

            <div className="min-w-0">
              <span className="text-[#A2B5A8] text-[11px] font-semibold uppercase tracking-wider block">
                Welcome to your desk
              </span>
              <h2 className="font-serif-lib text-2xl font-bold text-white leading-tight truncate">
                {displayName}
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold
                  ${isVerified
                    ? "bg-[#2A4D3B] text-[#D8E6DE] border border-[#3E6B53]"
                    : "bg-[#78350F] text-[#FDE68A] border border-[#B45309]"}`}>
                  {isVerified ? <ShieldCheck size={11} /> : <ShieldAlert size={11} />}
                  {isVerified ? 'Identity Confirmed' : 'Verification Required'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#244232] text-[#C2D1C7] capitalize">
                  <User size={11} /> {user?.act || 'Active Patron'}
                </span>
                {isPaid && daysLeft !== null && daysLeft <= 7 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#B45309] text-[#FEF3C7]">
                    <Clock size={11} /> {daysLeft}d left on pass
                  </span>
                )}
              </div>

              {/* Patron Action Suite Quick Access */}
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowIdCard(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs transition active:scale-95 cursor-pointer shadow-2xs"
                >
                  <QrCode size={14} className="text-[#00B8FF]" />
                  <span>Digital Patron Pass</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeskMap(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs transition active:scale-95 cursor-pointer shadow-2xs"
                >
                  <MapPin size={14} className="text-[#52D38A]" />
                  <span>Reserve Study Desk</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowExamRepo(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs transition active:scale-95 cursor-pointer shadow-2xs"
                >
                  <BookOpen size={14} className="text-[#FBBF24]" />
                  <span>Exam PYQ Library</span>
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
              <div className="sm:text-right border-t sm:border-t-0 border-[#2A4D3B] pt-3 sm:pt-0">
                <p className="text-[11px] text-[#A2B5A8]">Library Center Status</p>
                <div className="flex items-center sm:justify-end gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${currentlyOpen ? 'bg-[#4ADE80] animate-pulse' : 'bg-[#F87171]'}`} />
                  <p className="text-sm font-semibold text-white">
                    {currentlyOpen ? 'Open Now' : 'Closed'} • {libraryTimings?.open_time || '07:00 AM'} – {libraryTimings?.close_time || '09:00 PM'}
                  </p>
                </div>
                <p className="text-[10px] text-[#C2D1C7] mt-0.5">
                  {libraryTimings?.days || 'Monday – Sunday'}
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Aspirant Study Streak & Deep Work Engine (Step 3) ── */}
      <StudyStreakTracker
        user={user}
        onOpenTimer={() => setIsFocusTimerOpen(true)}
      />

      {/* ── Quiet Focus Sprint Launcher (Registered Patrons Only) ── */}
      <div className="bg-gradient-to-r from-[#244232] to-[#1C3A2B] text-white rounded-2xl p-5 shadow-xs border border-[#2E523E] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 text-[#8FD4AE]">
            <Timer size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A2D5B8] bg-black/20 px-2 py-0.5 rounded-md">
                Patron Focus Tool
              </span>
              <span className="text-[11px] text-[#C4DDD0]">· 25m Pomodoro Protocol</span>
            </div>
            <h3 className="font-serif-lib text-base sm:text-lg font-bold mt-0.5">Quiet Study Focus Sprint</h3>
            <p className="text-xs text-[#C4DDD0] mt-0.5">
              Launch your dedicated study focus hub with ambient library sounds, streak counter, and scholarship history journal.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setView('focus_sprint')}
            className="px-5 py-2.5 rounded-xl bg-[#52D38A] hover:bg-[#42B876] text-[#0E1A13] font-bold text-xs shadow-md transition active:scale-95 whitespace-nowrap flex items-center gap-2 cursor-pointer"
          >
            <Play size={14} className="fill-[#0E1A13]" />
            <span>Open Focus Hub &amp; History</span>
          </button>
        </div>
      </div>

      {/* ── Desk Activity Grid ───────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#6D8374] dark:text-[#8CA093] uppercase tracking-wider">
            Desk Activity &amp; Overview
          </span>
          {loadStats && <Loader2 size={14} className="animate-spin text-[#1C3A2B] dark:text-[#8FD4AE]" />}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {/* Books borrowed */}
          <div
            onClick={() => setView('loans')}
            className="cursor-pointer rounded-2xl p-5 bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] shadow-xs hover:border-[#1C3A2B]/40 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#6D8374] dark:text-[#8CA093] uppercase">Currently Borrowed</span>
              <div className="w-8 h-8 rounded-lg bg-[#EDF3EE] dark:bg-[#203126] text-[#1C3A2B] dark:text-[#8FD4AE] flex items-center justify-center">
                <BookMarked size={16} />
              </div>
            </div>
            <p className="font-serif-lib text-3xl font-bold text-[#1C1E1B] dark:text-[#FAF8F5]">{dash ?? active.length}</p>
            <p className="text-xs text-[#7F8781] dark:text-[#9FB1A6] mt-1">active loans</p>
          </div>

          {/* Overdue */}
          <div
            onClick={() => setView('loans')}
            className={`cursor-pointer rounded-2xl p-5 border shadow-xs transition
              ${overdue.length > 0
                ? 'bg-[#FAF0F0] dark:bg-[#2D1616] border-[#F0D5D5] dark:border-[#522323] hover:border-[#A83232]'
                : 'bg-white dark:bg-[#16211B] border-[#E5DFD5] dark:border-[#26362D] hover:border-[#1C3A2B]/40'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#6D8374] dark:text-[#8CA093] uppercase">Overdue Books</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${overdue.length > 0 ? 'bg-[#FDE8E8] text-[#A83232]' : 'bg-[#FAF8F5] dark:bg-[#203126] text-[#7F8781] dark:text-[#8FD4AE]'}`}>
                <AlertTriangle size={16} />
              </div>
            </div>
            <p className={`font-serif-lib text-3xl font-bold ${overdue.length > 0 ? 'text-[#A83232] dark:text-[#F87171]' : 'text-[#1C1E1B] dark:text-[#FAF8F5]'}`}>
              {dash ?? overdue.length}
            </p>
            <p className="text-xs text-[#7F8781] dark:text-[#9FB1A6] mt-1">{overdue.length > 0 ? 'return required' : 'all loans on time'}</p>
          </div>

          {/* Books read */}
          <div
            onClick={() => setView('loans')}
            className="cursor-pointer rounded-2xl p-5 bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] shadow-xs hover:border-[#1C3A2B]/40 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#6D8374] dark:text-[#8CA093] uppercase">Books Returned</span>
              <div className="w-8 h-8 rounded-lg bg-[#EDF3EE] dark:bg-[#203126] text-[#1C3A2B] dark:text-[#8FD4AE] flex items-center justify-center">
                <BookOpen size={16} />
              </div>
            </div>
            <p className="font-serif-lib text-3xl font-bold text-[#1C3A2B] dark:text-[#8FD4AE]">{dash ?? returned.length}</p>
            <p className="text-xs text-[#7F8781] dark:text-[#9FB1A6] mt-1">completed reading</p>
          </div>

          {/* Fee status */}
          <div
            onClick={() => setView('payments')}
            className={`cursor-pointer rounded-2xl p-5 border shadow-xs transition
              ${isPaid
                ? 'bg-white dark:bg-[#16211B] border-[#E5DFD5] dark:border-[#26362D] hover:border-[#1C3A2B]/40'
                : 'bg-[#FFFBEB] dark:bg-[#2D2413] border-[#FDE68A] dark:border-[#573F14] hover:border-[#D97706]'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#6D8374] dark:text-[#8CA093] uppercase">Membership Pass</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPaid ? 'bg-[#EDF3EE] dark:bg-[#203126] text-[#1C3A2B] dark:text-[#8FD4AE]' : 'bg-[#FEF3C7] dark:bg-[#45300F] text-[#92400E] dark:text-[#FDE68A]'}`}>
                <DollarSign size={16} />
              </div>
            </div>
            <p className={`font-serif-lib text-3xl font-bold ${isPaid ? 'text-[#1C3A2B] dark:text-[#8FD4AE]' : 'text-[#92400E] dark:text-[#FDE68A]'}`}>
              {isPaid ? 'Active' : 'Due'}
            </p>
            <p className="text-xs text-[#7F8781] dark:text-[#9FB1A6] mt-1">
              {isPaid && daysLeft !== null
                ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`
                : user?.lastpayment ? 'pass expired' : 'no active pass'}
            </p>
          </div>

          {/* Payments made */}
          <div
            onClick={() => setView('payments')}
            className="cursor-pointer rounded-2xl p-5 bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] shadow-xs hover:border-[#1C3A2B]/40 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#6D8374] dark:text-[#8CA093] uppercase">Confirmed Receipts</span>
              <div className="w-8 h-8 rounded-lg bg-[#EDF3EE] dark:bg-[#203126] text-[#1C3A2B] dark:text-[#8FD4AE] flex items-center justify-center">
                <CreditCard size={16} />
              </div>
            </div>
            <p className="font-serif-lib text-3xl font-bold text-[#1C1E1B] dark:text-[#FAF8F5]">{dash ?? confirmedPayments.length}</p>
            <p className="text-xs text-[#7F8781] dark:text-[#9FB1A6] mt-1">verified ledger payments</p>
          </div>

          {/* Member since */}
          <div className="rounded-2xl p-5 bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#6D8374] dark:text-[#8CA093] uppercase">Enrolled</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] dark:bg-[#203126] text-[#1C3A2B] dark:text-[#8FD4AE] flex items-center justify-center">
                <CalendarDays size={16} />
              </div>
            </div>
            <p className="font-serif-lib text-2xl font-bold text-[#1C1E1B] dark:text-[#FAF8F5]">
              {user?.lastpayment ? moment(user.lastpayment).subtract(1, 'month').format('MMM YYYY') : 'Member'}
            </p>
            <p className="text-xs text-[#7F8781] dark:text-[#9FB1A6] mt-1 capitalize">{user?.act || 'Patron'}</p>
          </div>
        </div>
      </div>

      {/* ── Active Borrowed Books Callout ─────────────────── */}
      {!loadStats && active.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6D8374] dark:text-[#8CA093] uppercase tracking-wider">
              Currently Issued to You
            </span>
            <button onClick={() => setView('loans')} className="text-xs font-semibold text-[#1C3A2B] dark:text-[#8FD4AE] hover:underline flex items-center gap-1 cursor-pointer">
              <span>View All Borrowed Books</span>
              <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2.5">
            {active.slice(0, 3).map(loan => {
              const days = moment(loan.due_date).diff(moment(), 'days');
              const isOv = days < 0;
              return (
                <div key={loan._id} className="flex items-center justify-between gap-3 bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl px-4 py-3.5 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#EDF3EE] dark:bg-[#203126] text-[#1C3A2B] dark:text-[#8FD4AE] flex-shrink-0 flex items-center justify-center">
                      <BookMarked size={16} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] truncate">{loan.resource_title}</p>
                      <p className="text-[11px] text-[#7F8781] dark:text-[#9FB1A6]">Issued {moment(loan.issued_at).format('DD MMM YYYY')}</p>
                    </div>
                  </div>
                  <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-md border
                    ${isOv
                      ? 'bg-[#FAF0F0] dark:bg-[#3D1A1A] text-[#A83232] dark:text-[#FCA5A5] border-[#F0D5D5] dark:border-[#5C2A2A]'
                      : days === 0
                        ? 'bg-[#FFFBEB] dark:bg-[#382B14] text-[#92400E] dark:text-[#FDE68A] border-[#FDE68A] dark:border-[#574019]'
                        : days <= 3
                          ? 'bg-[#FFFBEB] dark:bg-[#382B14] text-[#92400E] dark:text-[#FDE68A] border-[#FDE68A] dark:border-[#574019]'
                          : 'bg-[#EDF3EE] dark:bg-[#1C2C22] text-[#1C3A2B] dark:text-[#8FD4AE] border-[#D9E2DC] dark:border-[#2B4032]'}`}>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFBEB] dark:bg-[#2A2111] border border-[#FDE68A] dark:border-[#5A4217] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div>
            <p className="font-semibold text-sm text-[#92400E] dark:text-[#FDE68A]">Membership Dues Notice</p>
            <p className="text-xs text-[#78350F] dark:text-[#E8BD68] mt-0.5">Your monthly study pass is due. Renew online to maintain uninterrupted desk access.</p>
          </div>
          <button
            onClick={() => setView('payments')}
            className="flex-shrink-0 px-4 py-2 bg-[#92400E] hover:bg-[#78350F] text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            Pay Monthly Dues
          </button>
        </div>
      )}

      {!isVerified && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF8F5] dark:bg-[#16211B] border border-[#D9D3C7] dark:border-[#2A3B30] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div>
            <p className="font-semibold text-sm text-[#1C3A2B] dark:text-[#8FD4AE]">Aadhaar Verification Pending</p>
            <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] mt-0.5">Please submit your identity verification form to fulfill library safety compliance.</p>
          </div>
          <button
            onClick={() => setView('Settings')}
            className="flex-shrink-0 px-4 py-2 bg-[#1C3A2B] hover:bg-[#142C20] text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            Complete Verification
          </button>
        </div>
      )}

      {/* ── Community Bulletin Board: Pin a Study Note / Resolution ── */}
      <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DFE6DC] dark:border-[#26362D]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#EFF4EC] dark:bg-[#1E2E25] text-[#24341E] dark:text-[#8FD4AE]">
              <Pin size={18} />
            </span>
            <div>
              <h3 className="font-serif-lib text-base sm:text-lg font-bold text-[#24341E] dark:text-[#8FD4AE]">
                Voices From The Study Hall · Community Bulletin
              </h3>
              <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6]">
                Share your daily study resolution or advice. Pinned notes go to library administration for audit before appearing live on the landing page bulletin board.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNoteForm(!showNoteForm)}
            className="px-4 py-2 rounded-xl bg-[#33462C] hover:bg-[#24341E] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Send size={13} />
            <span>{showNoteForm ? "Close Form" : "Pin a Note or Goal"}</span>
          </button>
        </div>

        {noteFeedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold border flex items-center justify-between ${
              noteFeedback.type === 'success'
                ? 'bg-[#EFF4EC] border-[#DFE6DC] text-[#24341E] dark:bg-[#1E2E25] dark:text-[#8FD4AE] dark:border-[#2B4032]'
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-900/40 dark:text-red-300'
            }`}
          >
            <span>{noteFeedback.msg}</span>
            <button onClick={() => setNoteFeedback(null)} className="underline cursor-pointer">Dismiss</button>
          </div>
        )}

        {showNoteForm && (
          <form onSubmit={handleNoteSubmit} className="space-y-3.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#24341E] dark:text-[#8FD4AE] mb-1">
                  Target Exam or Study Field
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UPSC & Civil Services, NEET 2025, JKAS Aspirant"
                  value={noteTag}
                  onChange={(e) => setNoteTag(e.target.value)}
                  className="w-full bg-[#FCFCFB] dark:bg-[#111A14] border border-[#DFE6DC] dark:border-[#2A3D30] rounded-xl px-3 py-2 text-xs text-[#0B0E0A] dark:text-white focus:outline-none focus:border-[#33462C]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#24341E] dark:text-[#8FD4AE] mb-1">
                  Pen Name / Display Name
                </label>
                <input
                  type="text"
                  placeholder={displayName}
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  className="w-full bg-[#FCFCFB] dark:bg-[#111A14] border border-[#DFE6DC] dark:border-[#2A3D30] rounded-xl px-3 py-2 text-xs text-[#0B0E0A] dark:text-white focus:outline-none focus:border-[#33462C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#24341E] dark:text-[#8FD4AE] mb-1">
                Your Study Note, Habit Tip, or Encouragement
              </label>
              <textarea
                required
                rows={3}
                placeholder="Share your daily target, favorite study desk tip, or advice for fellow scholars..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full bg-[#FCFCFB] dark:bg-[#111A14] border border-[#DFE6DC] dark:border-[#2A3D30] rounded-xl p-3 text-xs text-[#0B0E0A] dark:text-white focus:outline-none focus:border-[#33462C]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#0B0E0A]/60 dark:text-[#8EA596]">
                🔒 Forwarded to Admin audit queue upon submission
              </span>
              <button
                type="submit"
                disabled={noteSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#33462C] hover:bg-[#24341E] text-white text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {noteSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                <span>{noteSubmitting ? "Submitting..." : "Submit for Librarian Audit"}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Focus Companion Modal ── */}
      <StudyFocusTimer
        isOpen={isFocusTimerOpen}
        onClose={() => setIsFocusTimerOpen(false)}
      />

      {/* ── Step 1: Digital Patron ID Card Modal ── */}
      {showIdCard && (
        <DigitalPatronIdCard
          user={user}
          txns={txns}
          onClose={() => setShowIdCard(false)}
        />
      )}

      {/* ── Step 2: Interactive Desk Map Modal ── */}
      {showDeskMap && (
        <InteractiveDeskMap
          user={user}
          onClose={() => setShowDeskMap(false)}
        />
      )}

      {/* ── Step 4: Digital Exam Repository Modal ── */}
      {showExamRepo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full">
            <ExamRepository onClose={() => setShowExamRepo(false)} />
          </div>
        </div>
      )}

    </div>
  );
}

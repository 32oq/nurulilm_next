'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import moment from 'moment';
import {
  User, ShieldCheck, ShieldAlert,
  BookMarked, BookOpen, AlertTriangle, Clock,
  CreditCard, Loader2, CalendarDays, ArrowRight,
  Timer, Play, Pause, RotateCcw, Volume2, VolumeX,
  Pin, Send, QrCode, MapPin, Brain,
  Wifi, Zap, CheckCircle2, ChevronRight,
  Flame, Trophy, Target, Compass,
  RefreshCw, Layers, Check, Camera, Sparkles
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useOther } from '../../../context/OtherContext';
import { sprintService } from '../../../services/sprintService';
import DigitalPatronIdCard from '../DigitalPatronIdCard';
import InteractiveDeskMap from '../InteractiveDeskMap';
import ExamRepository from '../ExamRepository';
import ScholarSynapseGame from '../ScholarSynapseGame';
import StudyFocusTimer from '../../StudyFocusTimer';
import PatronPhotoCaptureModal from '../PatronPhotoCaptureModal';

// Presets for the embedded desk focus session (Apple HIG 44pt touch cells)
const FOCUS_PRESETS = [
  { label: '25m Focus Block', minutes: 25, tag: 'Standard Pomodoro' },
  { label: '50m Deep Study', minutes: 50, tag: 'Intensive Block' },
  { label: '90m Exam Block', minutes: 90, tag: 'Full Exam Simulation' },
];

// Target competitive exams popular in Kashmir
const COMPETITIVE_EXAMS = [
  { id: 'jkas', name: 'JKAS (Kashmir Civil Services)', targetDate: '2025-08-17', tag: 'State Administrative Service' },
  { id: 'upsc', name: 'UPSC CSE Prelims', targetDate: '2025-05-25', tag: 'Union Civil Services' },
  { id: 'neet', name: 'NEET UG', targetDate: '2025-05-04', tag: 'National Medical Entrance' },
  { id: 'jee', name: 'JEE Advanced', targetDate: '2025-05-18', tag: 'Engineering Entrance' },
  { id: 'jkssb', name: 'JKSSB Graduate Level', targetDate: '2025-09-28', tag: 'State Recruitment' },
];

export default function StudentOverview({ setView }) {
  const { state: { user } } = useAuth();
  const {
    state: { libraryTimings },
    fetchMyLoans,
    fetchTxns,
    fetchMyDesk,
    fetchLibraryTimings,
    submitCommunityNote,
  } = useOther();

  // Core data states
  const [loans, setLoans] = useState(null);
  const [txns, setTxns] = useState(null);
  const [myDesk, setMyDesk] = useState(null);
  const [loadStats, setLoadStats] = useState(true);

  // Live Handwara / Kashmir clock
  const [liveKashmirTime, setLiveKashmirTime] = useState('');

  // Modals
  const [showIdCard, setShowIdCard] = useState(false);
  const [showDeskMap, setShowDeskMap] = useState(false);
  const [showExamRepo, setShowExamRepo] = useState(false);
  const [showSynapse, setShowSynapse] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showPhotoStudio, setShowPhotoStudio] = useState(false);

  // Target Exam state
  const [selectedExamId, setSelectedExamId] = useState('jkas');

  // Embedded Study Focus Cockpit states
  const [targetDuration, setTargetDuration] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [studySubject, setStudySubject] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundType, setSoundType] = useState('rain'); // 'rain' or 'whitenoise'
  const [sprintFeedback, setSprintFeedback] = useState(null);
  const [todayFocusMinutes, setTodayFocusMinutes] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [weeklyFocusMinutes, setWeeklyFocusMinutes] = useState(0);

  // Web Audio ambient sound refs
  const audioCtxRef = useRef(null);
  const noiseSourceRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Community Note Form states
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteTag, setNoteTag] = useState('JKAS & Civil Services');
  const [noteAuthor, setNoteAuthor] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteFeedback, setNoteFeedback] = useState(null);

  // 1. Live Handwara Clock
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        setLiveKashmirTime(timeStr);
      } catch (_) {}
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch Initial Patron Data
  const refreshPatronData = useCallback(async () => {
    if (fetchLibraryTimings) fetchLibraryTimings();
    try {
      const [loansRes, txnsRes, deskRes, sprintRes] = await Promise.allSettled([
        fetchMyLoans ? fetchMyLoans() : Promise.resolve([]),
        fetchTxns ? fetchTxns() : Promise.resolve([]),
        fetchMyDesk ? fetchMyDesk() : Promise.resolve(null),
        sprintService.getHistory ? sprintService.getHistory() : Promise.resolve({ stats: {} })
      ]);

      const l = loansRes.status === 'fulfilled' ? loansRes.value : [];
      const t = txnsRes.status === 'fulfilled' ? txnsRes.value : [];
      const d = deskRes.status === 'fulfilled' ? deskRes.value : null;
      const s = sprintRes.status === 'fulfilled' ? sprintRes.value : null;

      setLoans(Array.isArray(l) ? l : []);
      setTxns(t === true ? [] : (Array.isArray(t) ? t : []));
      setMyDesk(d?.desk_id ? d : null);

      if (s?.stats) {
        setTodayFocusMinutes(s.stats.todayMinutes || 0);
        setStreakDays(s.stats.streakDays || s.stats.streak || 0);
        setWeeklyFocusMinutes(s.stats.totalMinutes || 0);
      }
    } catch (err) {
      console.warn('Patron dashboard fetch error:', err);
    } finally {
      setLoadStats(false);
    }
  }, [fetchLibraryTimings, fetchMyLoans, fetchTxns, fetchMyDesk]);

  useEffect(() => {
    refreshPatronData();
  }, [refreshPatronData]);

  // 3. Embedded Timer Countdown Logic
  useEffect(() => {
    let interval = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && secondsLeft === 0) {
      setIsRunning(false);
      stopAmbientSound();
      playChime();
      handleCompleteSprint();
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  // 4. Web Audio Synthesis for Ambient Focus Sounds
  const startAmbientSound = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      if (soundType === 'rain') {
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555;
          b1 = 0.99332 * b1 + white * 0.0750;
          b2 = 0.96900 * b2 + white * 0.1538;
          data[i] = (b0 + b1 + b2) * 0.035;
        }
      } else {
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.04;
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(soundType === 'rain' ? 440 : 1100, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start();
      noiseSourceRef.current = source;
      gainNodeRef.current = gain;
    } catch (e) {
      console.warn('Audio ambient error:', e);
    }
  };

  const stopAmbientSound = () => {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
      } catch (_) {}
      noiseSourceRef.current = null;
    }
  };

  const playChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2.6);
    } catch (_) {}
  };

  useEffect(() => {
    if (isRunning && soundEnabled) {
      startAmbientSound();
    } else {
      stopAmbientSound();
    }
    return () => stopAmbientSound();
  }, [isRunning, soundEnabled, soundType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectPreset = (minutes) => {
    if (isRunning) return;
    setTargetDuration(minutes);
    setSecondsLeft(minutes * 60);
  };

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    stopAmbientSound();
    setSecondsLeft(targetDuration * 60);
  };

  const handleCompleteSprint = async () => {
    const completedMins = targetDuration;
    try {
      await sprintService.logSprint({
        durationMinutes: completedMins,
        subject: studySubject.trim() || 'General Study Block',
        qualityRating: 5,
        notes: `Completed at carrel desk`
      });
      setSprintFeedback(`✓ ${completedMins}-minute focus session logged to your streak.`);
      setTodayFocusMinutes(prev => prev + completedMins);
      setWeeklyFocusMinutes(prev => prev + completedMins);
      setTimeout(() => setSprintFeedback(null), 5000);
    } catch (err) {
      console.warn('Failed to log sprint:', err);
    }
  };

  // User Profile calculations
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Patron';
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'P';
  const isVerified = user?.verified === 1;
  const isPaid = user?.lastpayment && moment(user.lastpayment).isSameOrAfter(moment(), 'day');
  const daysLeft = user?.lastpayment ? moment(user.lastpayment).diff(moment(), 'days') : null;

  // Loan & Circulation calculations
  const loansList = Array.isArray(loans) ? loans : (Array.isArray(loans?.data) ? loans.data : (Array.isArray(loans?.loans) ? loans.loans : []));
  const activeLoans = loansList.filter(l => l && (l.status === 'active' || l.status === 'borrowed' || !l.return_date));

  // Operating Schedule calculation (Single Administrative Shift)
  const { timingText, currentlyOpen } = useMemo(() => {
    const t = libraryTimings?.data || libraryTimings;
    const openStr = t?.open_time || '';
    const closeStr = t?.close_time || '';
    let isOpen = true;

    try {
      if (t?.is_open_today === false) {
        isOpen = false;
      } else if (openStr && closeStr) {
        const openM = moment(openStr, ['h:mm A', 'hh:mm A', 'H:mm', 'HH:mm']);
        const closeM = moment(closeStr, ['h:mm A', 'hh:mm A', 'H:mm', 'HH:mm']);
        const now = moment();
        if (openM.isValid() && closeM.isValid()) {
          const openT = moment().set({ hour: openM.hour(), minute: openM.minute(), second: 0 });
          const closeT = moment().set({ hour: closeM.hour(), minute: closeM.minute(), second: 0 });
          if (closeT.isBefore(openT)) {
            isOpen = now.isAfter(openT) || now.isBefore(closeT);
          } else {
            isOpen = now.isBetween(openT, closeT);
          }
        }
      }
    } catch (_) {
      isOpen = true;
    }

    const text = (openStr && closeStr) ? `${openStr} – ${closeStr}` : (openStr || closeStr || '7:00 AM – 10:00 PM');
    return {
      timingText: text,
      currentlyOpen: isOpen,
    };
  }, [libraryTimings]);

  // Target Exam Countdown calculation
  const currentExam = COMPETITIVE_EXAMS.find(e => e.id === selectedExamId) || COMPETITIVE_EXAMS[0];
  const daysUntilExam = useMemo(() => {
    const diff = moment(currentExam.targetDate).diff(moment(), 'days');
    return diff > 0 ? diff : 0;
  }, [currentExam]);

  // Study note submit handler
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
        msg: res?.results?.msg || '✓ Your study resolution has been submitted. It will appear on the Community Noticeboard upon staff verification.'
      });
      setNoteText('');
      setShowNoteForm(false);
    } catch (err) {
      setNoteFeedback({
        type: 'error',
        msg: err?.message || 'Failed to submit study note. Please try again.'
      });
    } finally {
      setNoteSubmitting(false);
    }
  };

  // Format timer seconds into mm:ss
  const formattedMinutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const formattedSeconds = String(secondsLeft % 60).padStart(2, '0');
  const progressPercent = Math.round(((targetDuration * 60 - secondsLeft) / (targetDuration * 60)) * 100);

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-16">

      {/* ── ACT I: APPLE HIG HERO COMMAND PLAQUE ──────────────────── */}
      <div className="material-card hairline-border rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden backdrop-blur-2xl">
        {/* Subtle Ambient Depth Lighting */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Identity & Status */}
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => setShowPhotoStudio(true)}
              title="Upload or Change Passport Photo"
              className="relative group flex-shrink-0 w-14 h-14 rounded-2xl overflow-hidden bg-white/95 dark:bg-slate-800 text-[#004B87] dark:text-blue-300 hairline-border flex items-center justify-center text-lg font-bold select-none shadow-sm cursor-pointer hig-spring active:scale-[0.98]"
            >
              {user?.profile_photo ? (
                <img
                  src={user.profile_photo}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-xs">
                <Camera size={16} />
                <span className="text-[8px] uppercase font-bold tracking-wider mt-0.5">Photo</span>
              </div>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-[#004B87] dark:text-blue-400">
                  Academic Command Center
                </span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Handwara Campus</span>
              </div>
              
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate hig-title-2">
                {displayName}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                  isVerified
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                }`}>
                  {isVerified ? <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" /> : <ShieldAlert size={12} className="text-amber-600 dark:text-amber-400" />}
                  <span>{isVerified ? 'Identity Verified' : 'KYC Audit Required'}</span>
                </span>

                {!user?.profile_photo && (
                  <button
                    type="button"
                    onClick={() => setShowPhotoStudio(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 transition hig-spring cursor-pointer"
                  >
                    <Camera size={12} className="text-amber-600" />
                    <span>Upload ID Photo</span>
                  </button>
                )}

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 capitalize hairline-border">
                  <User size={12} className="text-slate-400" />
                  <span>{user?.act || 'Patron'}</span>
                </span>

                {isPaid && daysLeft !== null && daysLeft <= 7 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700/80 tabular-nums">
                    <Clock size={12} />
                    <span>{daysLeft}d left on pass</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Operational Shift & Quick Apple Actions Dock */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 border-slate-200/80 dark:border-slate-800 pt-4 lg:pt-0">
            {/* Center Status */}
            <div className="lg:text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">
                Single Unified Library Shift
              </span>
              <div className="flex items-center lg:justify-end gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${currentlyOpen ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-rose-500 ring-2 ring-rose-500/20'}`} />
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                  {timingText}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">({currentlyOpen ? 'Open Now' : 'Closed'})</span>
              </div>
              {liveKashmirTime && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono tabular-nums">
                  {liveKashmirTime} IST • Handwara
                </p>
              )}
            </div>

            {/* Quick Actions Dock with 44pt Touch Targets */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowIdCard(true)}
                className="h-11 px-4 inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-800/90 text-slate-800 dark:text-white text-xs font-semibold hairline-border shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700/80 transition hig-spring cursor-pointer active:scale-[0.98]"
              >
                <QrCode size={15} className="text-[#004B87] dark:text-blue-400" />
                <span>Patron ID</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDeskMap(true)}
                className="h-11 px-4 inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-800/90 text-slate-800 dark:text-white text-xs font-semibold hairline-border shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700/80 transition hig-spring cursor-pointer active:scale-[0.98]"
              >
                <MapPin size={15} className="text-emerald-600 dark:text-emerald-400" />
                <span>Reading Bays</span>
              </button>
              <button
                type="button"
                onClick={() => setShowExamRepo(true)}
                className="h-11 px-4 inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-800/90 text-slate-800 dark:text-white text-xs font-semibold hairline-border shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700/80 transition hig-spring cursor-pointer active:scale-[0.98]"
              >
                <BookOpen size={15} className="text-amber-600 dark:text-amber-400" />
                <span>PYQ Archive</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── ACT II: TWO-COLUMN ACADEMIC WORKBENCH ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT COLUMN (65%): ACTIVE STUDY WORKSPACE ─────────── */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. EMBEDDED STUDY FOCUS COCKPIT (LIVE ON DESK) */}
          <div className="material-card hairline-border rounded-3xl p-5 sm:p-7 shadow-sm backdrop-blur-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#004B87] dark:text-blue-400 flex items-center gap-1.5">
                    <Target size={13} />
                    <span>Desk Focus Cockpit</span>
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-[11px] text-slate-500">Live Session Engine</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 hig-title-2 mt-0.5 tracking-tight">
                  Deep Work Study Session
                </h2>
              </div>

              {/* Ambient Soundscape Toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`h-10 px-3.5 inline-flex items-center gap-1.5 rounded-xl text-xs font-semibold border transition hig-spring cursor-pointer active:scale-[0.98] ${
                    soundEnabled
                      ? 'bg-blue-50 text-[#004B87] border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                      : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                  }`}
                  title="Toggle background ambient focus audio"
                >
                  {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  <span>{soundEnabled ? 'Ambient Sound Active' : 'Silent Reading'}</span>
                </button>
                {soundEnabled && (
                  <select
                    value={soundType}
                    onChange={(e) => setSoundType(e.target.value)}
                    className="h-10 text-xs py-1 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="rain">Chinar Rain</option>
                    <option value="whitenoise">Library Air</option>
                  </select>
                )}
              </div>
            </div>

            {/* Subject / Target Intention Input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Current Desk Study Goal or Syllabus Chapter
              </label>
              <input
                type="text"
                value={studySubject}
                onChange={(e) => setStudySubject(e.target.value)}
                placeholder="e.g. JKAS Prelims GS-I: Indian Polity Art. 1–51A or NEET Biology Genetics"
                disabled={isRunning}
                className="w-full h-11 sm:h-12 bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl px-4 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#004B87] dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#111827] focus:ring-4 focus:ring-[#004B87]/15 transition hig-spring shadow-2xs"
              />
            </div>

            {/* Presets Row (Apple Inset 44pt Touch Targets) */}
            <div className="grid grid-cols-3 gap-2.5">
              {FOCUS_PRESETS.map((p) => {
                const isSelected = targetDuration === p.minutes;
                return (
                  <button
                    key={p.minutes}
                    type="button"
                    disabled={isRunning}
                    onClick={() => handleSelectPreset(p.minutes)}
                    className={`p-3.5 min-h-[52px] rounded-2xl border text-left transition hig-spring cursor-pointer disabled:opacity-50 active:scale-[0.98] ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/50 border-[#004B87] dark:border-blue-500 ring-2 ring-[#004B87]/15 dark:ring-blue-400/20'
                        : 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span className={`text-xs font-bold block ${isSelected ? 'text-[#004B87] dark:text-blue-300' : 'text-slate-900 dark:text-slate-100'}`}>
                      {p.label}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      {p.tag}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Large Tabular Timer Cockpit */}
            <div className="p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
              <div className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums select-none">
                {formattedMinutes}:{formattedSeconds}
              </div>

              {/* Apple HIG Progress Bar */}
              <div className="w-full max-w-md h-2 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-[#004B87] dark:bg-blue-500 rounded-full transition-all duration-1000 ease-linear shadow-xs"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleToggleTimer}
                  className={`h-11 px-6 inline-flex items-center gap-2 rounded-2xl text-xs font-semibold text-white shadow-sm transition hig-spring cursor-pointer active:scale-[0.98] ${
                    isRunning
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-[#004B87] hover:bg-[#003865] dark:bg-blue-600 dark:hover:bg-blue-500'
                  }`}
                >
                  {isRunning ? <Pause size={15} /> : <Play size={15} className="fill-white" />}
                  <span>{isRunning ? 'Pause Session' : 'Start Focus Sprint'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetTimer}
                  className="h-11 px-4 inline-flex items-center gap-1.5 rounded-2xl border border-slate-300/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition hig-spring cursor-pointer active:scale-[0.98]"
                  title="Reset timer to preset duration"
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  onClick={() => setView('focus_sprint')}
                  className="h-11 px-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition hig-spring cursor-pointer"
                  title="Open Full Focus Hub with History and Zen Mode"
                >
                  <span>Full View</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {sprintFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in duration-200">
                  {sprintFeedback}
                </div>
              )}
            </div>

          </div>

          {/* 2. PHYSICAL READING STACKS: ACTIVE ISSUED BOOKS */}
          <div className="material-card hairline-border rounded-3xl p-5 sm:p-6 shadow-sm backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Reading Stacks Circulation
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 hig-title-2 mt-0.5 tracking-tight">
                  Physical Books Issued to Your Carrel
                </h3>
              </div>
              <button
                onClick={() => setView('loans')}
                className="text-xs font-semibold text-[#004B87] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer hig-spring"
              >
                <span>View All Circulation</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {loadStats ? (
              <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin text-[#004B87] dark:text-blue-400" />
                <span>Auditing active loans from physical stacks...</span>
              </div>
            ) : activeLoans.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeLoans.map((loan) => {
                  const days = moment(loan.due_date).diff(moment(), 'days');
                  const isOv = days < 0;
                  return (
                    <div key={loan._id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#004B87] dark:text-blue-400 flex items-center justify-center flex-shrink-0 hairline-border">
                          <BookOpen size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {loan.resource_title || 'Library Reference Volume'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Accession: <span className="font-mono text-slate-700 dark:text-slate-300">{loan.accession_no || loan._id?.slice(-6) || 'STK-01'}</span> • Issued {moment(loan.issued_at).format('DD MMM YYYY')}
                          </p>
                        </div>
                      </div>

                      <span className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full border tabular-nums ${
                        isOv
                          ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                          : days === 0
                            ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}>
                        {isOv ? `${Math.abs(days)}d Overdue` : days === 0 ? 'Due Today' : `${days}d Remaining`}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center space-y-2.5">
                <BookMarked size={28} className="mx-auto text-slate-400" />
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Desk Surface Clear of Issued Books
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Browse over 3,000+ volumes in the physical library catalog including NCERT, Laxmikanth Polity, Spectrum History, and HC Verma.
                </p>
                <button
                  type="button"
                  onClick={() => setView('resources')}
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#004B87] hover:bg-[#003865] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold transition hig-spring cursor-pointer mt-1 active:scale-[0.98]"
                >
                  <BookOpen size={14} />
                  <span>Browse Reading Stacks</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. ASPIRANT COMMUNITY DESK RESOLUTIONS */}
          <div className="material-card hairline-border rounded-3xl p-5 sm:p-6 shadow-sm backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#004B87] dark:text-blue-400 hairline-border">
                  <Pin size={16} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 hig-title-2 tracking-tight">
                    Aspirant Study Resolutions &amp; Bulletin
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Post your daily target or advice for fellow scholars preparing in Handwara.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNoteForm(!showNoteForm)}
                className="h-10 px-3.5 rounded-xl bg-[#004B87] hover:bg-[#003865] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition hig-spring cursor-pointer self-start sm:self-auto active:scale-[0.98]"
              >
                <Send size={13} />
                <span>{showNoteForm ? 'Close Form' : 'Submit Target'}</span>
              </button>
            </div>

            {noteFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-medium border flex items-center justify-between ${
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
              <form onSubmit={handleNoteSubmit} className="space-y-3.5 pt-1 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      Target Exam or Study Field
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JKAS 2025, UPSC CSE, NEET UG"
                      value={noteTag}
                      onChange={(e) => setNoteTag(e.target.value)}
                      className="w-full h-11 bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-xl px-3.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#004B87]"
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
                      className="w-full h-11 bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-xl px-3.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#004B87]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Your Daily Study Target or Advice
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Share your daily study target or encouragement for fellow aspirants..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#004B87]"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer hig-spring select-none">
                    <div className="hig-touch-target -ml-2 -mt-2">
                      <input
                        type="checkbox"
                        required
                        id="note-publication-consent"
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#004B87] focus:ring-[#004B87] cursor-pointer"
                      />
                    </div>
                    <span className="text-[11px] leading-relaxed -ml-1">
                      I consent to having this study resolution displayed on the Community Noticeboard after library staff review.
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Forwarded to administrative queue upon submission
                  </span>
                  <button
                    type="submit"
                    disabled={noteSubmitting}
                    className="h-11 px-5 rounded-xl bg-[#004B87] hover:bg-[#003865] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition hig-spring cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                  >
                    {noteSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
                    <span>{noteSubmitting ? 'Submitting...' : 'Submit Resolution'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* ── RIGHT COLUMN (35%): TELEMETRY & GUIDANCE ──────────── */}
        <div className="lg:col-span-4 space-y-6">

          {/* 1. ASSIGNED CARREL & HALL TELEMETRY */}
          <div className="material-card hairline-border rounded-3xl p-5 sm:p-6 shadow-sm backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Assigned Study Desk
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#004B87] dark:text-blue-400 flex items-center justify-center hairline-border">
                <MapPin size={16} />
              </div>
            </div>

            {myDesk ? (
              <div className="space-y-3.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
                    Desk {myDesk.desk_id}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Allocated
                  </span>
                </div>
                {(() => {
                  const deskNum = parseInt(myDesk.desk_id, 10) || 0;
                  const isGirls = myDesk.section === 'G' || myDesk.section === 'girls' || (deskNum >= 1 && deskNum <= 15) || (deskNum >= 38 && deskNum <= 43);
                  const isEnclave = deskNum >= 1 && deskNum <= 9;
                  return (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          isGirls
                            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
                            : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900'
                        }`}>
                          {isEnclave ? 'Girls Enclave (G)' : isGirls ? 'Girls Wing (G)' : 'Boys Wing (B)'}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {myDesk.bay_name || myDesk.pod || myDesk.bay || 'Main Study Hall'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Handwara Center • 48-Seat Quiet Study Architecture
                      </p>
                    </div>
                  );
                })()}

                {/* Physical Carrel Telemetry Checklist */}
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Zap size={14} className="text-amber-500" />
                      <span>220V Inverter Power</span>
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Wifi size={14} className="text-sky-500" />
                      <span>Dual Gigabit Fiber</span>
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Wi-Fi 6</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      <span>Daily Shift Allocation</span>
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">Full Day</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDeskMap(true)}
                  className="w-full mt-2 h-11 inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition hig-spring cursor-pointer active:scale-[0.98]"
                >
                  <MapPin size={14} />
                  <span>Change Seat Selection</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                  No Desk Reserved
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Select your reserved individual carrel with uninterrupted power and fiber internet.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeskMap(true)}
                  className="w-full h-11 inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-2xl bg-[#004B87] hover:bg-[#003865] dark:bg-blue-600 dark:hover:bg-blue-500 text-white transition hig-spring cursor-pointer active:scale-[0.98]"
                >
                  <span>Select Carrel Seat</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* 2. TARGET COMPETITIVE EXAM COUNTDOWN */}
          <div className="material-card hairline-border rounded-3xl p-5 sm:p-6 shadow-sm backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass size={14} className="text-[#004B87] dark:text-blue-400" />
                <span>Target Exam Milestone</span>
              </span>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="text-xs py-1 px-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                {COMPETITIVE_EXAMS.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
              <span className="text-4xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {daysUntilExam}
              </span>
              <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                Days Remaining Until Exam
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Target date: {moment(currentExam.targetDate).format('DD MMMM YYYY')}
              </p>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center leading-relaxed">
              &ldquo;Quiet discipline at your reading carrel compounds into institutional mastery.&rdquo;
            </p>
          </div>

          {/* 3. MEMBERSHIP VALIDITY & PASS */}
          <div className="material-card hairline-border rounded-3xl p-5 sm:p-6 shadow-sm backdrop-blur-xl space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Membership Pass
              </span>
              <CreditCard size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {isPaid ? (daysLeft !== null ? `${daysLeft} Days` : 'Active') : 'Dues Pending'}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                isPaid
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}>
                {isPaid ? 'Active Pass' : 'Dues Pending'}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isPaid && user?.lastpayment
                ? `Valid through ${moment(user.lastpayment).format('DD MMM YYYY')}`
                : 'Renew monthly membership pass for carrel privileges'}
            </p>

            <button
              type="button"
              onClick={() => setView('payments')}
              className="w-full h-11 inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition hig-spring cursor-pointer active:scale-[0.98]"
            >
              <span>{isPaid ? 'View Pass Receipts' : 'Pay Monthly Dues'}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* 4. SCHOLAR SYNAPSE COGNITIVE RESET TRIGGER */}
          <div className="material-card hairline-border rounded-3xl p-5 sm:p-6 shadow-sm backdrop-blur-xl space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0 hairline-border">
                <Brain size={20} />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Cognitive Reset
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 hig-title-2">
                  Scholar Synapse Puzzle
                </h4>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Take a structured 60-second mental reset between intensive reading blocks.
            </p>
            <button
              type="button"
              onClick={() => setShowSynapse(true)}
              className="w-full h-11 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition hig-spring cursor-pointer active:scale-[0.98]"
            >
              <Brain size={14} />
              <span>Launch 60s Reset</span>
            </button>
          </div>

        </div>

      </div>

      {/* ── MODALS (CALLED EXPLICITLY ON DEMAND) ────────────────── */}

      {/* Digital Patron ID Card */}
      {showIdCard && (
        <DigitalPatronIdCard
          user={user}
          txns={txns}
          onClose={() => setShowIdCard(false)}
        />
      )}

      {/* Interactive Desk Map */}
      {showDeskMap && (
        <InteractiveDeskMap
          user={user}
          onClose={() => {
            setShowDeskMap(false);
            refreshPatronData();
          }}
        />
      )}

      {/* Digital Exam Repository Archive */}
      {showExamRepo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="max-w-4xl w-full">
            <ExamRepository onClose={() => setShowExamRepo(false)} />
          </div>
        </div>
      )}

      {/* Scholar Synapse Cognitive Reset */}
      <ScholarSynapseGame
        isOpen={showSynapse}
        onClose={() => setShowSynapse(false)}
      />

      {/* Legacy Focus Sprint Timer Modal (if triggered externally) */}
      <StudyFocusTimer
        isOpen={showTimerModal}
        onClose={() => setShowTimerModal(false)}
      />

      {/* Patron Photo Capture & Upload Studio Modal */}
      <PatronPhotoCaptureModal
        isOpen={showPhotoStudio}
        onClose={() => setShowPhotoStudio(false)}
        onSuccess={() => {
          setShowPhotoStudio(false);
          refreshPatronData();
        }}
      />

    </div>
  );
}

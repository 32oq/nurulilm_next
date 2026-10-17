'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import moment from "moment";
import {
  Flame, Play, Pause, RotateCcw, Volume2, VolumeX,
  CheckCircle2, Clock, Maximize2, Minimize2, Trash2, Search,
  ChevronRight, X, BookOpen
} from "lucide-react";
import { sprintService } from "../../../services/sprintService";

const PRESET_DURATIONS = [
  { label: "15 min", value: 15, tag: "Quick Sprint" },
  { label: "25 min", value: 25, tag: "Standard Block" },
  { label: "45 min", value: 45, tag: "Deep Study" },
  { label: "60 min", value: 60, tag: "Extended Session" }
];

const SUBJECT_SUGGESTIONS = [
  "UPSC General Studies",
  "Mathematics Practice",
  "Anatomy & Physiology",
  "English Comprehension",
  "Research & Literature Review",
  "Daily Current Affairs"
];

const STUDY_QUOTES = [
  "“Knowledge is a treasure, but practice is the key to it.”",
  "“Quiet focus and steady repetition compound into mastery.”",
  "“One focused hour accomplishes what ten distracted hours cannot.”",
  "“Consistency in the reading room builds lifelong scholarship.”",
  "“Small disciplined steps yield the deepest understanding.”"
];

export default function FocusSprintView({ setView, isAdmin = false }) {
  const [targetDuration, setTargetDuration] = useState(25);
  const [subject, setSubject] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState("25");

  const [isZenMode, setIsZenMode] = useState(false);

  // Audio state
  const [soundType, setSoundType] = useState("rain");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundVolume, setSoundVolume] = useState(0.2);
  const audioCtxRef = useRef(null);
  const noiseSourceRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionMinutes, setCompletionMinutes] = useState(25);
  const [focusRating, setFocusRating] = useState(5);
  const [reflectionNotes, setReflectionNotes] = useState("");
  const [isSavingLog, setIsSavingLog] = useState(false);

  // History & Metrics
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalMinutes: 0,
    completedCount: 0,
    totalSessions: 0,
    todayMinutes: 0,
    streakDays: 0
  });
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyTab, setHistoryTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);

  const quoteIndex = Math.floor((secondsElapsed / 180) % STUDY_QUOTES.length);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await sprintService.getHistory();
      setHistory(Array.isArray(data.history) ? data.history : []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch focus sprint history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    let interval = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSprintFinished(true);
            return 0;
          }
          return prev - 1;
        });
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, secondsLeft]);

  // Ambient sound synthesis
  const stopAmbientSound = () => {
    try {
      if (noiseSourceRef.current) {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
        noiseSourceRef.current = null;
      }
    } catch (e) {
      // ignore
    }
  };

  const startAmbientSound = () => {
    if (typeof window === 'undefined') return;
    if (!soundEnabled || soundType === "none") {
      stopAmbientSound();
      return;
    }
    try {
      stopAmbientSound();
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      if (soundType === "rain") {
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.153852;
          data[i] = (b0 + b1 + b2) * 0.04;
        }
      } else {
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.05;
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(soundType === "rain" ? 420 : 1200, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(soundVolume, ctx.currentTime);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start();
      noiseSourceRef.current = source;
      gainNodeRef.current = gain;
    } catch (e) {
      console.warn("Audio synthesis error:", e);
    }
  };

  useEffect(() => {
    if (isRunning && soundEnabled) {
      startAmbientSound();
    } else {
      stopAmbientSound();
    }
    return () => stopAmbientSound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, soundEnabled, soundType]);

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(soundVolume, audioCtxRef.current.currentTime);
    }
  }, [soundVolume]);

  const playChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2.6);
    } catch (e) {
      // ignore
    }
  };

  const handleStartSprint = () => {
    if (!isRunning) {
      if (!sessionStartTime) {
        setSessionStartTime(new Date());
      }
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(targetDuration * 60);
    setSecondsElapsed(0);
    setSessionStartTime(null);
  };

  const handleSelectPreset = (minutes) => {
    if (isRunning) return;
    setTargetDuration(minutes);
    setSecondsLeft(minutes * 60);
    setSecondsElapsed(0);
    setSessionStartTime(null);
    setShowCustomInput(false);
    setCustomMinutesInput(String(minutes));
  };

  const handleApplyCustomMinutes = (mins) => {
    if (isRunning) return;
    const parsed = parseInt(mins, 10);
    if (!isNaN(parsed) && parsed > 0) {
      const clamped = Math.min(240, Math.max(1, parsed));
      setTargetDuration(clamped);
      setSecondsLeft(clamped * 60);
      setSecondsElapsed(0);
      setSessionStartTime(null);
    }
  };

  const handleAdjustMinutes = (delta) => {
    if (isRunning) return;
    const newMins = Math.min(240, Math.max(1, targetDuration + delta));
    setTargetDuration(newMins);
    setSecondsLeft(newMins * 60);
    setSecondsElapsed(0);
    setSessionStartTime(null);
    setCustomMinutesInput(String(newMins));
  };

  const handleSprintFinished = (completedFull = true) => {
    setIsRunning(false);
    stopAmbientSound();
    playChime();

    const actualMins = completedFull
      ? targetDuration
      : Math.max(1, Math.round(secondsElapsed / 60));

    setCompletionMinutes(actualMins);
    setShowCompletionModal(true);
  };

  const handleSaveSprintLog = async (status = "completed") => {
    setIsSavingLog(true);
    try {
      const body = {
        subject: subject.trim() || "Deep Study Session",
        target_duration: targetDuration,
        actual_duration: completionMinutes,
        status: status,
        sound: soundEnabled ? soundType : "none",
        notes: reflectionNotes.trim(),
        rating: focusRating,
        started_at: sessionStartTime || new Date()
      };

      await sprintService.logSprint(body);

      setShowCompletionModal(false);
      setReflectionNotes("");
      setIsZenMode(false);
      handleResetTimer();
      setNotification({
        type: "success",
        msg: `Study session of ${completionMinutes} minutes logged to your record.`
      });
      fetchHistory();
    } catch (err) {
      console.error("Failed to save sprint log:", err);
      setNotification({
        type: "error",
        msg: "Could not save sprint log to database. Please check connection."
      });
    } finally {
      setIsSavingLog(false);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm("Are you sure you want to remove this study session record?")) return;
    try {
      await sprintService.deleteSprint(id);
      setHistory((prev) => prev.filter((item) => item._id !== id));
      setNotification({ type: "success", msg: "Session record removed." });
      fetchHistory();
    } catch (err) {
      console.error("Failed to delete sprint log:", err);
    }
  };

  const handleSprintAgain = (pastSession) => {
    setSubject(pastSession.subject || "");
    const dur = pastSession.target_duration || 25;
    setTargetDuration(dur);
    setSecondsLeft(dur * 60);
    setSecondsElapsed(0);
    setCustomMinutesInput(String(dur));
    setShowCustomInput(!PRESET_DURATIONS.some((p) => p.value === dur));
    setIsRunning(false);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const totalTimeSeconds = targetDuration * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalTimeSeconds - secondsLeft) / totalTimeSeconds) * 100));

  const filteredHistory = history.filter((item) => {
    if (historyTab === "completed" && item.status !== "completed") return false;
    if (historyTab === "interrupted" && item.status !== "interrupted") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSub = (item.subject || "").toLowerCase().includes(q);
      const matchNotes = (item.notes || "").toLowerCase().includes(q);
      return matchSub || matchNotes;
    }
    return true;
  });

  return (
    <div className={`space-y-6 w-full max-w-5xl ${isZenMode ? "fixed inset-0 z-50 bg-[#0B0F19] text-white p-6 sm:p-12 overflow-y-auto" : ""}`}>
      {/* Zen Mode Header */}
      {isZenMode && (
        <div className="flex items-center justify-between pb-6 border-b border-slate-800 max-w-3xl mx-auto w-full">
          <div>
            <p className="font-serif-lib text-base font-bold text-white">Full Screen Study Mode</p>
            <p className="text-xs text-slate-400">Distraction-free timer</p>
          </div>
          <button
            onClick={() => setIsZenMode(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs transition cursor-pointer"
          >
            <Minimize2 size={13} />
            <span>Exit Full Screen</span>
          </button>
        </div>
      )}

      {/* Normal Header */}
      {!isZenMode && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif-lib text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Study Focus Timer
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Time your reading and study sessions. Log completed intervals to track your reading hours.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsZenMode(true)}
              className="px-3.5 py-2 rounded-lg bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
            >
              <Maximize2 size={13} />
              <span>Full Screen</span>
            </button>
          </div>
        </div>
      )}

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800"
              : "bg-red-50 text-red-900 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800"
          }`}
        >
          <span>{notification.msg}</span>
          <button onClick={() => setNotification(null)} className="font-bold opacity-60 hover:opacity-100 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      {!isZenMode && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Total Study Time
            </span>
            <p className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalMinutes >= 60
                ? `${(stats.totalMinutes / 60).toFixed(1)} hrs`
                : `${stats.totalMinutes} mins`}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Logged across {stats.totalSessions} sessions
            </p>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Completed Sprints
            </span>
            <p className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white">
              {stats.completedCount}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Full timer completions
            </p>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Active Streak
            </span>
            <p className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white">
              {stats.streakDays} {stats.streakDays === 1 ? "day" : "days"}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Consecutive study days
            </p>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Today's Focus
            </span>
            <p className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white">
              {stats.todayMinutes} mins
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Hours logged today
            </p>
          </div>
        </div>
      )}

      {/* Main Focus Workstation Card */}
      <div className={`bg-[#0A192F] text-white rounded-2xl p-6 sm:p-10 shadow-xs border border-slate-800 relative ${isZenMode ? "max-w-2xl mx-auto my-6" : ""}`}>
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Target Subject / Goal Input */}
          <div className="w-full max-w-md">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
              Study Subject or Goal
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Modern History Ch 4, MCQs Practice..."
              disabled={isRunning}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#004B87] text-center"
            />

            {!isRunning && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                {SUBJECT_SUGGESTIONS.slice(0, 4).map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => setSubject(sugg)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                  >
                    + {sugg}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preset & Custom Duration Buttons */}
          <div className="flex flex-col items-center gap-2.5">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {PRESET_DURATIONS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleSelectPreset(preset.value)}
                  disabled={isRunning}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    !showCustomInput && targetDuration === preset.value
                      ? "bg-[#004B87] text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                  } ${isRunning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {preset.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  if (isRunning) return;
                  setShowCustomInput((prev) => !prev);
                }}
                disabled={isRunning}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  showCustomInput || !PRESET_DURATIONS.some((p) => p.value === targetDuration)
                    ? "bg-[#004B87] text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                } ${isRunning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span>Custom Duration</span>
                {!PRESET_DURATIONS.some((p) => p.value === targetDuration) && (
                  <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded">
                    {targetDuration}m
                  </span>
                )}
              </button>
            </div>

            {(showCustomInput || !PRESET_DURATIONS.some((p) => p.value === targetDuration)) && !isRunning && (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3.5 py-2 rounded-xl text-xs">
                <span className="text-slate-400 text-xs font-medium">Custom Minutes:</span>

                <button
                  type="button"
                  onClick={() => handleAdjustMinutes(-5)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                  title="Minus 5 minutes"
                >
                  -5m
                </button>

                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={customMinutesInput}
                    onChange={(e) => {
                      setCustomMinutesInput(e.target.value);
                      handleApplyCustomMinutes(e.target.value);
                    }}
                    className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-center font-mono font-bold text-sm text-white focus:outline-none focus:border-[#004B87]"
                  />
                  <span className="text-slate-400 text-xs">min</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdjustMinutes(5)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                  title="Plus 5 minutes"
                >
                  +5m
                </button>

                <span className="text-[11px] text-slate-500 ml-1">
                  (1–240 mins)
                </span>
              </div>
            )}
          </div>

          {/* Countdown Display */}
          <div className="relative my-2 flex flex-col items-center justify-center">
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border-2 border-slate-800 flex flex-col items-center justify-center relative bg-slate-950/60 shadow-inner">
              <span className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-white select-none">
                {timeFormatted}
              </span>

              <span className="text-xs font-medium text-slate-400 mt-2 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isRunning ? "bg-emerald-400" : "bg-slate-600"}`} />
                {isRunning ? "Session in progress" : "Ready to begin"}
              </span>

              <span className="text-[11px] text-slate-500 mt-0.5">
                {Math.round(progressPercent)}% elapsed
              </span>
            </div>
          </div>

          {/* Study Quote */}
          <p className="text-xs text-slate-400 italic max-w-md min-h-[32px] px-4">
            {STUDY_QUOTES[quoteIndex]}
          </p>

          {/* Main Action Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleStartSprint}
              className={`px-8 py-3 rounded-lg font-bold text-sm flex items-center gap-2.5 transition cursor-pointer ${
                isRunning
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-[#004B87] hover:bg-[#003B6B] text-white"
              }`}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              <span>{isRunning ? "Pause" : "Start Session"}</span>
            </button>

            {isRunning && (
              <button
                onClick={() => handleSprintFinished(false)}
                className="px-5 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer border border-slate-700"
              >
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Complete Early</span>
              </button>
            )}

            <button
              onClick={handleResetTimer}
              className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              title="Reset timer"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Ambient Sound Controls */}
          <div className="pt-4 border-t border-slate-800 w-full max-w-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  soundEnabled
                    ? "bg-[#004B87] text-white font-semibold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <span>{soundEnabled ? "Ambient Audio: On" : "Ambient Audio: Off"}</span>
              </button>

              {soundEnabled && (
                <select
                  value={soundType}
                  onChange={(e) => setSoundType(e.target.value)}
                  className="bg-slate-900 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="rain">Soft Rain</option>
                  <option value="whitenoise">White Noise</option>
                </select>
              )}
            </div>

            {soundEnabled && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400">Volume:</span>
                <input
                  type="range"
                  min="0"
                  max="0.6"
                  step="0.02"
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                  className="w-24 accent-[#004B87] cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Journal */}
      {!isZenMode && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="font-serif-lib text-lg font-bold text-slate-900 dark:text-white">
                Study Session History
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Completed study sessions recorded to your account.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-lg self-start sm:self-auto">
              <button
                onClick={() => setHistoryTab("all")}
                className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  historyTab === "all"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                All ({history.length})
              </button>
              <button
                onClick={() => setHistoryTab("completed")}
                className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  historyTab === "completed"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Completed ({stats.completedCount})
              </button>
              <button
                onClick={() => setHistoryTab("interrupted")}
                className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  historyTab === "interrupted"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Partial ({history.length - stats.completedCount})
              </button>
            </div>
          </div>

          <div className="relative max-w-sm w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject or note..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#004B87]"
            />
          </div>

          {loadingHistory ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Loading session records…
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
              <Clock size={28} className="mx-auto text-slate-400" />
              <p className="font-serif-lib text-base font-bold text-slate-800 dark:text-slate-200">
                No Session Records Found
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? "No sessions match your search filter."
                  : "Start a study session above to begin logging your reading hours."}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredHistory.map((item) => {
                const isComp = item.status === "completed";
                return (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 transition hover:border-slate-400 dark:hover:border-slate-700"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {item.subject || "Study Session"}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isComp
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                          }`}
                        >
                          {isComp ? "Completed" : "Ended Early"}
                        </span>

                        {item.rating && (
                          <span className="text-[11px] text-amber-500 font-bold">
                            {"★".repeat(Math.min(5, Math.max(1, item.rating)))}
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2">
                          “{item.notes}”
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                        <span>{moment(item.cr_dt).format("DD MMM YYYY, hh:mm A")}</span>
                        <span>{item.actual_duration || 0}m logged ({item.target_duration || 25}m target)</span>
                        {item.sound && item.sound !== "none" && (
                          <span className="capitalize">Audio: {item.sound}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => handleSprintAgain(item)}
                        className="px-3 py-1.5 rounded bg-[#004B87] hover:bg-[#003B6B] text-white text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                        title="Repeat session"
                      >
                        <span>Repeat</span>
                        <ChevronRight size={12} />
                      </button>

                      <button
                        onClick={() => handleDeleteSession(item._id)}
                        className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="text-center space-y-1">
              <h3 className="font-serif-lib text-xl font-bold text-slate-900 dark:text-white">
                Session Complete
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                You logged <strong className="text-slate-900 dark:text-white">{completionMinutes} minutes</strong> of focused reading.
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded inline-block mt-1">
                {subject.trim() || "Deep Study Session"}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-center">
                Focus Rating
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFocusRating(star)}
                    className={`text-2xl transition cursor-pointer ${
                      star <= focusRating ? "text-amber-400" : "text-slate-300 dark:text-slate-600"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Session Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                placeholder="What did you read, practice, or complete?"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#004B87]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCompletionModal(false)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Skip Notes
              </button>
              <button
                type="button"
                disabled={isSavingLog}
                onClick={() => handleSaveSprintLog("completed")}
                className="px-4 py-2 rounded-lg bg-[#004B87] hover:bg-[#003B6B] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSavingLog ? "Saving..." : "Save Record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

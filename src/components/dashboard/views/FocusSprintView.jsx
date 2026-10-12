'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import moment from "moment";
import {
  Flame, Play, Pause, RotateCcw, Volume2, VolumeX,
  Sparkles, CheckCircle2, Award, Clock,
  Maximize2, Minimize2, Trash2, Search, ChevronRight, X
} from "lucide-react";
import { getMemoryToken } from "../../../context/AuthContext";
import { getApiBase } from "../../../config/api";

const PRESET_DURATIONS = [
  { label: "15 min", value: 15, tag: "Quick Sprint" },
  { label: "25 min", value: 25, tag: "Classic Pomodoro" },
  { label: "45 min", value: 45, tag: "Deep Work" },
  { label: "60 min", value: 60, tag: "Scholar Marathon" }
];

const SUBJECT_SUGGESTIONS = [
  "UPSC / GS Revision",
  "Mathematics Problem Set",
  "Medical & Anatomy Notes",
  "Language & Vocabulary",
  "Thesis & Research Reading",
  "Current Affairs & Notes"
];

const STUDY_QUOTES = [
  "“Knowledge is a treasure, but practice is the key to it.”",
  "“The sanctuary of deep quiet yields the clearest thoughts.”",
  "“One focused hour accomplishes what ten distracted hours cannot.”",
  "“Consistency in the study hall builds the scholar of tomorrow.”",
  "“Small steps of deep work compound into mastery.”"
];

export default function FocusSprintView({ setView, isAdmin = false }) {
  // Sprint configuration
  const [targetDuration, setTargetDuration] = useState(25); // in minutes
  const [subject, setSubject] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState("25");

  // Zen / Fullscreen mode
  const [isZenMode, setIsZenMode] = useState(false);

  // Audio state
  const [soundType, setSoundType] = useState("rain"); // 'rain' | 'whitenoise' | 'none'
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
  const [historyTab, setHistoryTab] = useState("all"); // 'all' | 'completed' | 'interrupted'
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);

  const quoteIndex = Math.floor((secondsElapsed / 180) % STUDY_QUOTES.length);

  const getHeaders = () => {
    const token = getMemoryToken();
    return token ? { "x-access-token": token, Authorization: `Bearer ${token}` } : {};
  };

  // ── Fetch History & Stats ──────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${getApiBase()}/dashboard/focus-sprints/history`, {
        headers: getHeaders()
      });
      const data = res?.data?.results?.data || {};
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

  // ── Timer Logic ────────────────────────────────────────────────────────
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

  // ── Audio Synthesis (Gentle Library Rain / White Noise) ─────────────────
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

  // ── Actions ────────────────────────────────────────────────────────────
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

      await axios.post(`${getApiBase()}/dashboard/focus-sprints/log`, body, {
        headers: getHeaders()
      });

      setShowCompletionModal(false);
      setReflectionNotes("");
      setIsZenMode(false);
      handleResetTimer();
      setNotification({
        type: "success",
        msg: `✓ Focus Sprint of ${completionMinutes} mins recorded into your history!`
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
    if (!window.confirm("Are you sure you want to remove this focus session log?")) return;
    try {
      await axios.delete(`${getApiBase()}/dashboard/focus-sprints/${id}`, {
        headers: getHeaders()
      });
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

  // ── Time format helpers ────────────────────────────────────────────────
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const totalTimeSeconds = targetDuration * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalTimeSeconds - secondsLeft) / totalTimeSeconds) * 100));

  // Filtered history list
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
    <div className={`space-y-6 w-full max-w-5xl ${isZenMode ? "fixed inset-0 z-50 bg-[#0E1712] text-white p-6 sm:p-12 overflow-y-auto" : ""}`}>
      {/* ── Zen Mode Header ─────────────────────────────────────────── */}
      {isZenMode && (
        <div className="flex items-center justify-between pb-6 border-b border-[#1C2C22] max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#1F3629] text-[#8FD4AE] flex items-center justify-center">
              <Sparkles size={16} />
            </span>
            <div>
              <p className="font-serif-lib text-base font-bold text-white">Quiet Focus Zen Sanctum</p>
              <p className="text-[11px] text-[#8FD4AE]">Distraction-Free Study Space</p>
            </div>
          </div>
          <button
            onClick={() => setIsZenMode(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F3629] text-[#B9C4BC] hover:text-white text-xs transition cursor-pointer"
          >
            <Minimize2 size={13} />
            <span>Exit Zen Mode</span>
          </button>
        </div>
      )}

      {/* ── Normal Header ───────────────────────────────────────────── */}
      {!isZenMode && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#33462C] dark:text-[#8FD4AE]">
                Patron Focus Station
              </span>
              <span className="text-[10px] bg-[#EFF4EC] dark:bg-[#1E2E25] text-[#24341E] dark:text-[#8FD4AE] px-2 py-0.5 rounded-full font-medium border border-[#DFE6DC] dark:border-[#2C4133]">
                Pomodoro &amp; Deep Work
              </span>
            </div>
            <h1 className="font-serif-lib text-2xl sm:text-3xl font-bold text-[#0B0E0A] dark:text-white">
              Quiet Study Focus Sprint
            </h1>
            <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6] mt-1 max-w-xl">
              Track distraction-free study blocks, configure ambient library acoustics, and maintain a verifiable journal of your scholarship hours.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsZenMode(true)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A261F] text-[#24341E] dark:text-[#A1B3A7] border border-[#DFE6DC] dark:border-[#26362D] text-xs font-semibold flex items-center gap-2 hover:bg-[#EFF4EC] transition shadow-xs cursor-pointer"
            >
              <Maximize2 size={13} />
              <span>Full Screen Zen</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Notification Banner ─────────────────────────────────────── */}
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

      {/* ── KPI Overview Cards ──────────────────────────────────────── */}
      {!isZenMode && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#33462C] dark:text-[#8FD4AE] uppercase tracking-wider">
                Total Focus Time
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EFF4EC] dark:bg-[#1E2E25] text-[#24341E] dark:text-[#8FD4AE] flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <p className="font-serif-lib text-2xl font-bold text-[#0B0E0A] dark:text-white">
              {stats.totalMinutes >= 60
                ? `${(stats.totalMinutes / 60).toFixed(1)} hrs`
                : `${stats.totalMinutes} mins`}
            </p>
            <p className="text-[11px] text-[#0B0E0A] dark:text-[#8EA596] mt-1">
              Logged across {stats.totalSessions} sessions
            </p>
          </div>

          <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#33462C] dark:text-[#8FD4AE] uppercase tracking-wider">
                Completed Sprints
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <p className="font-serif-lib text-2xl font-bold text-[#0B0E0A] dark:text-white">
              {stats.completedCount}
            </p>
            <p className="text-[11px] text-[#0B0E0A] dark:text-[#8EA596] mt-1">
              100% full timer runs
            </p>
          </div>

          <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#33462C] dark:text-[#8FD4AE] uppercase tracking-wider">
                Active Streak
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                <Flame size={16} />
              </div>
            </div>
            <p className="font-serif-lib text-2xl font-bold text-[#0B0E0A] dark:text-white">
              {stats.streakDays} {stats.streakDays === 1 ? "day" : "days"}
            </p>
            <p className="text-[11px] text-[#0B0E0A] dark:text-[#8EA596] mt-1">
              Consecutive study days
            </p>
          </div>

          <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#33462C] dark:text-[#8FD4AE] uppercase tracking-wider">
                Today's Focus
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EFF4EC] dark:bg-[#1E2E25] text-[#24341E] dark:text-[#8FD4AE] flex items-center justify-center">
                <Award size={16} />
              </div>
            </div>
            <p className="font-serif-lib text-2xl font-bold text-[#0B0E0A] dark:text-white">
              {stats.todayMinutes} mins
            </p>
            <p className="text-[11px] text-[#0B0E0A] dark:text-[#8EA596] mt-1">
              Today's dedicated work
            </p>
          </div>
        </div>
      )}

      {/* ── Main Sprint Station ─────────────────────────────────────── */}
      <div className={`bg-gradient-to-b from-[#1C3A2B] to-[#13251C] text-white rounded-3xl p-6 sm:p-10 shadow-lg border border-[#274836] relative overflow-hidden ${isZenMode ? "max-w-2xl mx-auto my-6" : ""}`}>
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#356149]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#1D4430]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          {/* Target Subject / Goal Input */}
          <div className="w-full max-w-md">
            <label className="block text-[11px] uppercase font-semibold tracking-wider text-[#A2D5B8] mb-1.5">
              Current Sprint Focus Goal
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Modern History Ch 4, MCQs Practice, Constitutional Law..."
              disabled={isRunning}
              className="w-full bg-[#0E1A13]/80 border border-[#2B4B38] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#789684] focus:outline-none focus:border-[#8FD4AE] text-center"
            />

            {/* Subject suggestion pills */}
            {!isRunning && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                {SUBJECT_SUGGESTIONS.slice(0, 4).map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => setSubject(sugg)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-[#C1DAC9] border border-white/10 transition cursor-pointer"
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
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                    !showCustomInput && targetDuration === preset.value
                      ? "bg-[#8FD4AE] text-[#13251C] shadow-sm font-bold"
                      : "bg-white/5 text-[#D1E2D7] hover:bg-white/10 border border-white/10"
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  showCustomInput || !PRESET_DURATIONS.some((p) => p.value === targetDuration)
                    ? "bg-[#8FD4AE] text-[#13251C] shadow-sm font-bold"
                    : "bg-white/5 text-[#D1E2D7] hover:bg-white/10 border border-white/10"
                } ${isRunning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span>⚙ Custom Time</span>
                {!PRESET_DURATIONS.some((p) => p.value === targetDuration) && (
                  <span className="text-[10px] bg-black/20 px-1.5 py-0.2 rounded-md">
                    {targetDuration}m
                  </span>
                )}
              </button>
            </div>

            {/* Custom Duration Input & Quick Steppers */}
            {(showCustomInput || !PRESET_DURATIONS.some((p) => p.value === targetDuration)) && !isRunning && (
              <div className="flex items-center gap-2 bg-[#0E1A13]/90 border border-[#2B4B38] px-3.5 py-2 rounded-2xl text-xs shadow-inner">
                <span className="text-[#A2D5B8] text-[11px] font-semibold">Custom Sprint:</span>

                <button
                  type="button"
                  onClick={() => handleAdjustMinutes(-5)}
                  className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#D1E2D7] font-bold text-xs transition cursor-pointer"
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
                    className="w-16 bg-black/50 border border-[#3E6B52] rounded-lg px-2 py-1 text-center font-mono font-bold text-sm text-white focus:outline-none focus:border-[#8FD4AE]"
                  />
                  <span className="text-[#A2D5B8] text-xs font-medium">min</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdjustMinutes(5)}
                  className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#D1E2D7] font-bold text-xs transition cursor-pointer"
                  title="Plus 5 minutes"
                >
                  +5m
                </button>

                <span className="text-[10px] text-[#789684] ml-1">
                  (1–240 mins)
                </span>
              </div>
            )}
          </div>

          {/* ── Large Circular / Display Clock ──────────────────────── */}
          <div className="relative my-4 flex flex-col items-center justify-center">
            {/* Countdown Display */}
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border-4 border-[#244633] flex flex-col items-center justify-center relative bg-[#0C1711]/60 shadow-inner">
              {/* Progress Ring Accent */}
              <div
                className="absolute inset-0 rounded-full border-4 border-[#8FD4AE] transition-all duration-1000"
                style={{
                  clipPath: `polygon(50% 50%, -50% -50%, ${progressPercent}% -50%, ${progressPercent}% ${progressPercent}%)`,
                  opacity: isRunning ? 0.9 : 0.4
                }}
              />

              <span className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-white select-none">
                {timeFormatted}
              </span>

              <span className="text-[11px] font-semibold text-[#A2D5B8] uppercase tracking-wider mt-2 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isRunning ? "bg-[#4ADE80] animate-pulse" : "bg-[#8FD4AE]/50"}`} />
                {isRunning ? "Focus In Progress" : "Ready To Begin"}
              </span>

              {/* Progress percentage */}
              <span className="text-[10px] text-[#789684] mt-0.5">
                {Math.round(progressPercent)}% elapsed
              </span>
            </div>
          </div>

          {/* Dynamic Study Quote */}
          <p className="text-xs text-[#B4D1BF] italic max-w-md min-h-[32px] px-4">
            {STUDY_QUOTES[quoteIndex]}
          </p>

          {/* ── Main Timer Action Controls ─────────────────────────── */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleStartSprint}
              className={`px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2.5 transition shadow-lg cursor-pointer ${
                isRunning
                  ? "bg-amber-500 hover:bg-amber-600 text-black"
                  : "bg-[#8FD4AE] hover:bg-[#A6E6C1] text-[#13251C]"
              }`}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              <span>{isRunning ? "Pause Sprint" : "Begin Focus Sprint"}</span>
            </button>

            {isRunning && (
              <button
                onClick={() => handleSprintFinished(false)}
                className="px-5 py-3.5 rounded-2xl bg-[#2D4D3A] hover:bg-[#395F48] text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer border border-[#3E6B52]"
              >
                <CheckCircle2 size={16} className="text-[#8FD4AE]" />
                <span>Complete &amp; Log Early</span>
              </button>
            )}

            <button
              onClick={handleResetTimer}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-[#C1DAC9] border border-white/10 transition cursor-pointer"
              title="Reset timer"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* ── Ambient Sound Controls ──────────────────────────────── */}
          <div className="pt-4 border-t border-[#244633] w-full max-w-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
                  soundEnabled
                    ? "bg-[#8FD4AE] text-[#13251C] font-semibold"
                    : "bg-white/5 text-[#A2D5B8] hover:bg-white/10 border border-white/10"
                }`}
              >
                {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <span>{soundEnabled ? "Ambient Audio: On" : "Ambient Audio: Off"}</span>
              </button>

              {soundEnabled && (
                <select
                  value={soundType}
                  onChange={(e) => setSoundType(e.target.value)}
                  className="bg-[#0E1A13] text-white border border-[#2B4B38] rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="rain">Soft Library Rain</option>
                  <option value="whitenoise">Smooth White Noise</option>
                </select>
              )}
            </div>

            {soundEnabled && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[10px] text-[#A2D5B8]">Vol:</span>
                <input
                  type="range"
                  min="0"
                  max="0.6"
                  step="0.02"
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                  className="w-24 accent-[#8FD4AE] cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Sprint History & Scholarship Journal ─────────────────────── */}
      {!isZenMode && (
        <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DFE6DC] dark:border-[#26362D]">
            <div>
              <h2 className="font-serif-lib text-lg font-bold text-[#24341E] dark:text-[#8FD4AE]">
                Sprint History &amp; Study Journal
              </h2>
              <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6]">
                Every completed sprint session is logged to your personal library account for progress tracking.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-[#EFF4EC] dark:bg-[#111A15] p-1 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setHistoryTab("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  historyTab === "all"
                    ? "bg-white dark:bg-[#244232] text-[#0B0E0A] dark:text-white shadow-xs"
                    : "text-[#33462C] dark:text-[#8EA596] hover:text-[#0B0E0A]"
                }`}
              >
                All ({history.length})
              </button>
              <button
                onClick={() => setHistoryTab("completed")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  historyTab === "completed"
                    ? "bg-white dark:bg-[#244232] text-[#0B0E0A] dark:text-white shadow-xs"
                    : "text-[#33462C] dark:text-[#8EA596] hover:text-[#0B0E0A]"
                }`}
              >
                Completed ({stats.completedCount})
              </button>
              <button
                onClick={() => setHistoryTab("interrupted")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  historyTab === "interrupted"
                    ? "bg-white dark:bg-[#244232] text-[#0B0E0A] dark:text-white shadow-xs"
                    : "text-[#33462C] dark:text-[#8EA596] hover:text-[#0B0E0A]"
                }`}
              >
                Interrupted ({history.length - stats.completedCount})
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-sm w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#33462C]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by subject or notes..."
              className="w-full bg-[#FAFBF9] dark:bg-[#121A16] border border-[#DFE6DC] dark:border-[#26362D] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#0B0E0A] dark:text-white placeholder-[#33462C]/40 focus:outline-none focus:border-[#33462C]"
            />
          </div>

          {/* History List */}
          {loadingHistory ? (
            <div className="py-12 text-center text-xs text-[#33462C] dark:text-[#8EA596]">
              Loading your study sprint journal…
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-[#DFE6DC] dark:border-[#26362D] rounded-xl">
              <Clock size={28} className="mx-auto text-[#33462C]/30 dark:text-[#8EA596]/30" />
              <p className="font-serif-lib text-base font-bold text-[#24341E] dark:text-[#8FD4AE]">
                No Sprint Logs Found
              </p>
              <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6] max-w-sm mx-auto">
                {searchQuery
                  ? "No sessions match your search filter."
                  : "Begin your first Quiet Focus Sprint above to see your study time, reflections, and streak here."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item) => {
                const isComp = item.status === "completed";
                return (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFBF9] dark:bg-[#131E18] border border-[#DFE6DC] dark:border-[#24362B] rounded-xl p-4 transition hover:border-[#33462C]/40"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-[#0B0E0A] dark:text-white truncate">
                          {item.subject || "Deep Study Session"}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isComp
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                              : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900"
                          }`}
                        >
                          {isComp ? "✓ Completed" : "⏸ Interrupted Early"}
                        </span>

                        {item.rating && (
                          <span className="text-[11px] text-amber-500 font-bold">
                            {"★".repeat(Math.min(5, Math.max(1, item.rating)))}
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-xs text-[#0B0E0A] dark:text-[#C1DAC9] italic line-clamp-2">
                          “{item.notes}”
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#0B0E0A] dark:text-[#8EA596] pt-0.5">
                        <span>📅 {moment(item.cr_dt).format("DD MMM YYYY, hh:mm A")}</span>
                        <span>⏱ {item.actual_duration || 0}m logged ({item.target_duration || 25}m target)</span>
                        {item.sound && item.sound !== "none" && (
                          <span className="capitalize">🎧 {item.sound}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => handleSprintAgain(item)}
                        className="px-3 py-1.5 rounded-lg bg-[#33462C] hover:bg-[#24341E] text-white text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                        title="Repeat sprint with this goal"
                      >
                        <span>Sprint Again</span>
                        <ChevronRight size={12} />
                      </button>

                      <button
                        onClick={() => handleDeleteSession(item._id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
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

      {/* ── Completion & Reflection Modal ────────────────────────────── */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="text-center space-y-1">
              <span className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto mb-2">
                <Award size={24} />
              </span>
              <h3 className="font-serif-lib text-xl font-bold text-[#24341E] dark:text-[#8FD4AE]">
                Sprint Complete!
              </h3>
              <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6]">
                You logged <strong className="text-emerald-700 dark:text-emerald-300">{completionMinutes} minutes</strong> of quiet scholarship on:
              </p>
              <p className="text-xs font-semibold text-[#0B0E0A] dark:text-white bg-[#EFF4EC] dark:bg-[#1E2E25] px-3 py-1 rounded-lg inline-block">
                {subject.trim() || "Deep Study Session"}
              </p>
            </div>

            {/* Focus Rating Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#33462C] dark:text-[#8FD4AE] mb-1.5">
                How Was Your Focus?
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFocusRating(star)}
                    className={`text-2xl transition transform hover:scale-110 cursor-pointer ${
                      star <= focusRating ? "text-amber-400" : "text-gray-300 dark:text-gray-600"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Reflection Note */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#33462C] dark:text-[#8FD4AE] mb-1.5">
                Session Accomplishments / Reflection Notes
              </label>
              <textarea
                rows={3}
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                placeholder="What did you solve, read, or finish? (e.g. Finished 15 practice questions, clarified core doctrine)..."
                className="w-full bg-[#FAFBF9] dark:bg-[#121A16] border border-[#DFE6DC] dark:border-[#26362D] rounded-xl p-3 text-xs text-[#0B0E0A] dark:text-white placeholder-[#33462C]/40 focus:outline-none focus:border-[#33462C]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCompletionModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#33462C] dark:text-[#8EA596] hover:bg-[#EFF4EC] dark:hover:bg-[#1E2E25] transition cursor-pointer"
              >
                Skip Reflection
              </button>
              <button
                type="button"
                disabled={isSavingLog}
                onClick={() => handleSaveSprintLog("completed")}
                className="px-5 py-2.5 rounded-xl bg-[#33462C] hover:bg-[#24341E] text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSavingLog ? "Saving..." : "Save to History ✓"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

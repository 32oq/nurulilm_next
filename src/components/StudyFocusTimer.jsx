"use client";

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, X, Clock, Coffee, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudyFocusTimer({ isOpen, onClose }) {
  const [mode, setMode] = useState('focus'); // 'focus' (25 min) or 'break' (5 min)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const audioCtxRef = useRef(null);
  const noiseNodeRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
      playChime();
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    setSecondsLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  // Play peaceful bell chime using Web Audio API
  const playChime = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2.6);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  };

  // Ambient gentle study rain / library murmur generator using Web Audio
  useEffect(() => {
    if (soundOn) {
      try {
        if (typeof window === 'undefined') return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          output[i] = (b0 + b1 + b2) * 0.04;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.18, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start(0);
        noiseNodeRef.current = whiteNoise;
        gainNodeRef.current = gainNode;
      } catch (e) {
        console.warn('Ambient audio error:', e);
      }
    } else {
      if (noiseNodeRef.current) {
        try {
          noiseNodeRef.current.stop();
          noiseNodeRef.current.disconnect();
        } catch (_) {}
        noiseNodeRef.current = null;
      }
    }

    return () => {
      if (noiseNodeRef.current) {
        try {
          noiseNodeRef.current.stop();
        } catch (_) {}
      }
    };
  }, [soundOn]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercent = mode === 'focus'
    ? ((25 * 60 - secondsLeft) / (25 * 60)) * 100
    : ((5 * 60 - secondsLeft) / (5 * 60)) * 100;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-xl relative text-slate-900 dark:text-slate-100"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
            aria-label="Close Study Focus Tool"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              <Clock size={12} />
              <span>Quiet Desk Focus Companion</span>
            </span>
            <h3 className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white mt-2">
              Pomodoro Study Sprint
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Synchronize your concentration with Nurul Ilm's quiet room rhythm.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg mb-6">
            <button
              onClick={() => handleModeChange('focus')}
              className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'focus'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock size={14} />
              <span>25m Focus Session</span>
            </button>
            <button
              onClick={() => handleModeChange('break')}
              className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'break'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Coffee size={14} />
              <span>5m Quiet Break</span>
            </button>
          </div>

          {/* Radial / Digital Dial Display */}
          <div className="relative w-48 h-48 mx-auto flex flex-col items-center justify-center mb-6">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="84"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-200 dark:text-slate-800"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="84"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray="527"
                strokeDashoffset={527 - (527 * progressPercent) / 100}
                strokeLinecap="round"
                className="text-[#004B87] dark:text-blue-500 transition-all duration-500"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                {isRunning ? (mode === 'focus' ? 'Deep Focus Active' : 'Resting Eyes') : 'Paused'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <button
              onClick={resetTimer}
              className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Reset Timer"
              aria-label="Reset Timer"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-8 py-3.5 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white font-semibold text-sm flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              {isRunning ? (
                <>
                  <Pause size={17} />
                  <span>Pause Session</span>
                </>
              ) : (
                <>
                  <Play size={17} className="fill-white" />
                  <span>{secondsLeft === 25 * 60 ? 'Start Focus Sprint' : 'Resume'}</span>
                </>
              )}
            </button>
            <button
              onClick={playChime}
              className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Test Sanctuary Bell"
              aria-label="Test Bell"
            >
              <Bell size={16} />
            </button>
          </div>

          {/* Ambient Rain Audio Toggle */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Library Window Rain Sound
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Warm noise</span>
            </div>
            <button
              onClick={() => setSoundOn(!soundOn)}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                soundOn
                  ? 'bg-[#004B87] text-white dark:bg-blue-600'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span>{soundOn ? 'Sound On' : 'Muted'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

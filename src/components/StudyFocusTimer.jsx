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
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-[#15201A] border border-[#DFE6DC] dark:border-[#26382D] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative text-[#0B0E0A] dark:text-[#E8EFEA]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl hover:bg-[#EFF4EC] dark:hover:bg-[#1E2E25] text-[#24341E] hover:text-black dark:text-[#8FD4AE] transition cursor-pointer"
            aria-label="Close Study Focus Tool"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#EFF4EC] dark:bg-[#1E2F25] text-[#24341E] dark:text-[#88B89C] text-[11px] font-semibold uppercase tracking-wider">
              <Sparkles size={12} />
              <span>Quiet Desk Focus Companion</span>
            </span>
            <h3 className="font-serif-lib text-2xl font-bold text-[#24341E] dark:text-[#8ED4AB] mt-2">
              Pomodoro Study Sprint
            </h3>
            <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6] mt-1">
              Synchronize your concentration with Nurul Ilm's quiet room rhythm.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-[#EFF4EC] dark:bg-[#1B2921] p-1 rounded-xl mb-6">
            <button
              onClick={() => handleModeChange('focus')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'focus'
                  ? 'bg-white dark:bg-[#25392E] text-[#24341E] dark:text-[#9EE5BC] shadow-xs'
                  : 'text-[#0B0E0A] dark:text-[#8EA195] hover:text-[#24341E]'
              }`}
            >
              <Clock size={14} />
              <span>25m Focus Session</span>
            </button>
            <button
              onClick={() => handleModeChange('break')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'break'
                  ? 'bg-white dark:bg-[#25392E] text-[#24341E] dark:text-[#9EE5BC] shadow-xs'
                  : 'text-[#0B0E0A] dark:text-[#8EA195] hover:text-[#24341E]'
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
                className="text-[#DFE6DC] dark:text-[#233328]"
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
                className="text-[#33462C] dark:text-[#52D38A] transition-all duration-500"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-4xl font-bold tracking-tight text-[#0B0E0A] dark:text-[#F3F7F5]">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-[11px] font-medium text-[#24341E] dark:text-[#9FB1A6] mt-1">
                {isRunning ? (mode === 'focus' ? 'Deep Focus Active' : 'Resting Eyes') : 'Paused'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <button
              onClick={resetTimer}
              className="p-3 rounded-xl bg-white dark:bg-[#1E2E25] border border-[#DFE6DC] dark:border-[#2C4033] text-[#24341E] dark:text-[#A1B8AA] hover:bg-[#EFF4EC] transition active:scale-95 cursor-pointer"
              title="Reset Timer"
              aria-label="Reset Timer"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-8 py-3.5 rounded-2xl bg-[#33462C] hover:bg-[#24341E] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white font-semibold text-sm flex items-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
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
              className="p-3 rounded-xl bg-white dark:bg-[#1E2E25] border border-[#DFE6DC] dark:border-[#2C4033] text-[#24341E] dark:text-[#A1B8AA] hover:bg-[#EFF4EC] transition active:scale-95 cursor-pointer"
              title="Test Sanctuary Bell"
              aria-label="Test Bell"
            >
              <Bell size={16} />
            </button>
          </div>

          {/* Ambient Rain Audio Toggle */}
          <div className="pt-4 border-t border-[#DFE6DC] dark:border-[#26382D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#0B0E0A] dark:text-[#E8EFEA]">
                Library Window Rain Sound
              </span>
              <span className="text-[10px] text-[#24341E]/70 dark:text-[#8E9E93]">Warm noise</span>
            </div>
            <button
              onClick={() => setSoundOn(!soundOn)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                soundOn
                  ? 'bg-[#33462C] text-white dark:bg-[#52D38A] dark:text-[#0D1611]'
                  : 'bg-white dark:bg-[#1E2E25] border border-[#DFE6DC] dark:border-[#2B3E32] text-[#24341E] dark:text-[#9EB3A6]'
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

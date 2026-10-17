"use client";

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ variant = 'icon', className = '' }) {
  const { isDark, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeDark = mounted ? isDark : false;

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        aria-label={activeDark ? 'Switch to daylight mode' : 'Switch to evening dark mode'}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border cursor-pointer select-none ${
          activeDark
            ? 'bg-[#111827] border-slate-700 text-slate-200 hover:bg-slate-800'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
        } ${className}`}
        title={activeDark ? 'Switch to daylight mode' : 'Switch to evening mode'}
      >
        <span className="relative flex items-center justify-center w-4 h-4">
          {activeDark ? (
            <Sun size={14} className="text-amber-400" />
          ) : (
            <Moon size={14} className="text-[#004B87]" />
          )}
        </span>
        <span>{activeDark ? 'Daylight Mode' : 'Evening Mode'}</span>
      </button>
    );
  }

  if (variant === 'sidebar') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        aria-label={activeDark ? 'Switch to daylight mode' : 'Switch to evening mode'}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors border cursor-pointer ${
          activeDark
            ? 'bg-[#071322] border-[#1E3A5F] text-slate-300 hover:bg-white/10 hover:text-white'
            : 'bg-[#0E2442] border-[#1E3A5F] text-slate-200 hover:bg-[#133056] hover:text-white'
        } ${className}`}
        title={activeDark ? 'Switch to daylight mode' : 'Switch to evening mode'}
      >
        <div className="flex items-center gap-2">
          {activeDark ? (
            <Sun size={14} className="text-amber-400" />
          ) : (
            <Moon size={14} className="text-sky-300" />
          )}
          <span>{activeDark ? 'Evening Mode' : 'Daylight Mode'}</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-mono bg-white/10 text-slate-200">
          {activeDark ? 'Dark' : 'Light'}
        </span>
      </button>
    );
  }

  // Default 'icon' button
  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={activeDark ? 'Switch to daylight mode' : 'Switch to evening mode'}
      className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
        activeDark
          ? 'bg-[#111827] border-slate-700 text-amber-400 hover:bg-slate-800 shadow-2xs'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-[#004B87] shadow-2xs'
      } ${className}`}
      title={activeDark ? 'Switch to daylight mode' : 'Switch to evening mode'}
    >
      {activeDark ? (
        <Sun size={15} />
      ) : (
        <Moon size={15} />
      )}
    </button>
  );
}

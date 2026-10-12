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
        aria-label={activeDark ? 'Switch to daylight reading mode' : 'Switch to evening quiet mode'}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border cursor-pointer select-none ${
          activeDark
            ? 'bg-[#142019] border-[#22352B] text-[#C9D6CE] hover:bg-[#1A2C22] hover:text-white'
            : 'bg-white border-[#E5DFD5] text-[#2D3A31] hover:bg-[#F2EFEA] hover:text-[#1C2E24]'
        } ${className}`}
        title={activeDark ? 'Switch to daylight mode' : 'Switch to evening mode'}
      >
        <span className="relative flex items-center justify-center w-4 h-4">
          {activeDark ? (
            <Sun size={15} className="text-[#F59E0B] transition-transform duration-300" />
          ) : (
            <Moon size={15} className="text-[#2D5E44] transition-transform duration-300" />
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
        aria-label={activeDark ? 'Switch to daylight reading mode' : 'Switch to evening quiet mode'}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border cursor-pointer ${
          activeDark
            ? 'bg-[#0F1B15] border-[#1C2E24] text-[#A2B5A8] hover:bg-[#14231B] hover:text-white'
            : 'bg-[#F2EFEA] border-[#E5DFD5] text-[#2D3A31] hover:bg-[#EBE5DB] hover:text-[#1C2E24]'
        } ${className}`}
        title={activeDark ? 'Switch to daylight reading mode' : 'Switch to evening quiet mode'}
      >
        <div className="flex items-center gap-2.5">
          {activeDark ? (
            <Sun size={15} className="text-[#F59E0B]" />
          ) : (
            <Moon size={15} className="text-[#2D5E44]" />
          )}
          <span>{activeDark ? 'Evening Mode Active' : 'Daylight Mode Active'}</span>
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-mono ${
          activeDark ? 'bg-[#182C21] text-[#8FD4AE]' : 'bg-[#E5DFD5] text-[#1C2E24]'
        }`}>
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
      aria-label={activeDark ? 'Switch to daylight reading mode' : 'Switch to evening quiet mode'}
      className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer flex items-center justify-center ${
        activeDark
          ? 'bg-[#142019] border-[#22352B] text-[#F59E0B] hover:bg-[#1A2C22] shadow-xs'
          : 'bg-white border-[#E5DFD5] text-[#2D3A31] hover:bg-[#F2EFEA] hover:text-[#2D5E44] shadow-xs'
      } ${className}`}
      title={activeDark ? 'Switch to daylight reading mode' : 'Switch to evening quiet mode'}
    >
      {activeDark ? (
        <Sun size={17} className="transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon size={17} className="transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}

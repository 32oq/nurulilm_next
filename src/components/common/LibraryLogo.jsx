'use client';

import React from 'react';

/**
 * Nurul Ilm Library Official Institutional Logo
 * 
 * Scalable Vector Graphic (SVG) reproduction of the library crest:
 * - Double concentric circles
 * - Radiant amber glow (the "Nur")
 * - Lit candle with natural wax drip detail & tear-drop flame
 * - Symmetrical open book pages fanning outward
 * 
 * @param {'emblem' | 'full'} variant - 'emblem' (crest badge only) or 'full' (crest + typography)
 * @param {number} size - width/height in px for emblem (default: 40)
 * @param {string} className - optional wrapper classes
 * @param {boolean} showTagline - whether to display "Illuminate your path with knowledge" in full mode
 */
export default function LibraryLogo({
  variant = 'emblem',
  size = 40,
  className = '',
  showTagline = true,
  ...props
}) {
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`} {...props}>
        <svg
          viewBox="0 0 340 340"
          width={size * 2.5}
          height={size * 2.5}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          <CrestPaths />
        </svg>
        <div className="mt-3">
          <h1 className="font-serif-lib text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Nurul Ilm Library
          </h1>
          {showTagline && (
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 tracking-wide">
              Illuminate your path with knowledge
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 340 340"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Nurul Ilm Library Crest"
      {...props}
    >
      <CrestPaths />
    </svg>
  );
}

/**
 * Reusable internal crest vector paths
 */
function CrestPaths() {
  return (
    <>
      <defs>
        <radialGradient id="libraryCandleGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFDE7A" />
          <stop offset="70%" stopColor="#F6C453" />
          <stop offset="100%" stopColor="#EDB338" />
        </radialGradient>
        <linearGradient id="libraryInkDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#282A36" />
          <stop offset="100%" stopColor="#1E202B" />
        </linearGradient>
      </defs>

      <g transform="translate(0, -10)">
        {/* Outer Concentric Circle */}
        <circle cx="170" cy="170" r="122" stroke="#2B2D38" strokeWidth="4.2" strokeMiterlimit="10" />
        
        {/* Inner Concentric Circle */}
        <circle cx="170" cy="170" r="113" stroke="#2B2D38" strokeWidth="2.5" strokeMiterlimit="10" />

        {/* Candle Glow (The "Nur" / Amber Radiance) */}
        <circle cx="170" cy="155" r="44" fill="url(#libraryCandleGlow)" />

        {/* Candle Left Edge */}
        <path d="M 153 152 L 153 208" stroke="#2B2D38" strokeWidth="4.2" strokeLinecap="round" />
        
        {/* Candle Right Edge with Natural Dripping Wax */}
        <path
          d="M 187 152 
             L 187 168 
             C 187 176 181 182 175 182 
             C 170 182 166 177 166 172 
             C 166 167 162 163 158 163
             M 175 182 
             L 175 208 
             M 187 178 
             L 187 208"
          stroke="#2B2D38"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Candle Top Rim */}
        <ellipse cx="170" cy="152" rx="17" ry="4.5" stroke="#2B2D38" strokeWidth="3.6" fill="#FFFFFF" />

        {/* Flame Wick */}
        <path d="M 170 148 Q 169 140 170 134" stroke="#2B2D38" strokeWidth="3.2" strokeLinecap="round" />

        {/* Flame Outline & Inner Luminous Core */}
        <path
          d="M 170 134 
             C 160 126 158 112 166 100 
             C 169 95 170 85 170 85 
             C 170 85 171 95 174 100 
             C 182 112 180 126 170 134 Z"
          stroke="#2B2D38"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="#FFFFFF"
          fillOpacity="0.3"
        />

        {/* Open Book Pages (Symmetrical Fanned Stacks) */}
        {/* Top Left Arched Wing */}
        <path
          d="M 167 212 
             C 135 197 110 186 92 185 
             C 97 192 103 201 108 207 
             C 126 206 146 214 165 223 Z"
          fill="url(#libraryInkDark)"
          stroke="#2B2D38"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Top Right Arched Wing */}
        <path
          d="M 173 212 
             C 205 197 230 186 248 185 
             C 243 192 237 201 232 207 
             C 214 206 194 214 175 223 Z"
          fill="url(#libraryInkDark)"
          stroke="#2B2D38"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Middle Left Arched Wing */}
        <path
          d="M 166 222 
             C 130 209 100 201 72 204 
             C 77 212 82 220 89 227 
             C 114 221 138 228 164 236 Z"
          fill="url(#libraryInkDark)"
          stroke="#2B2D38"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Middle Right Arched Wing */}
        <path
          d="M 174 222 
             C 210 209 240 201 268 204 
             C 263 212 258 220 251 227 
             C 226 221 202 228 176 236 Z"
          fill="url(#libraryInkDark)"
          stroke="#2B2D38"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Bottom Broad Left Wing (Breaks Crest Base) */}
        <path
          d="M 167 234 
             C 122 222 88 219 50 230 
             C 56 238 64 247 71 252 
             C 104 237 137 238 168 246 Z"
          fill="url(#libraryInkDark)"
          stroke="#2B2D38"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Bottom Broad Right Wing (Breaks Crest Base) */}
        <path
          d="M 173 234 
             C 218 222 252 219 290 230 
             C 284 238 276 247 269 252 
             C 236 237 203 238 172 246 Z"
          fill="url(#libraryInkDark)"
          stroke="#2B2D38"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Central Spine Notch */}
        <polygon points="166,210 170,217 174,210 170,205" fill="#2B2D38" />
      </g>
    </>
  );
}

'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  MapPin, CheckCircle2, ShieldCheck, Zap, Wifi,
  LayoutGrid, Compass, ArrowRight, Eye, Sparkles,
  Plus, Minus, RotateCcw, ChevronLeft, ChevronRight, Hand
} from 'lucide-react';

// Representative preview carrel pods across physical zones ("some data" preview without exposing total capacity)
const PREVIEW_CARREL_COORDS = {
  // ── GIRLS ENCLAVE (Enclosed Private Sanctuary Room) ──
  '1': { x: 250, y: 580, w: 55, h: 42, section: 'girls', zone: 'enclave', label: '1', pod: 'Girls Enclave East Pod', window: false },
  '4': { x: 175, y: 460, w: 55, h: 42, section: 'girls', zone: 'enclave', label: '4', pod: 'Girls Enclave Quiet Pod', window: false },
  '7': { x: 60, y: 580, w: 55, h: 42, section: 'girls', zone: 'enclave', label: '7', pod: 'Girls Enclave Garden Wall', window: true },

  // ── MAIN HALL: BAY A (Window Wing) ──
  '13': { x: 190, y: 280, w: 55, h: 42, section: 'girls', zone: 'bay_a', label: '13', pod: 'Bay A Window Pod (Girls)', window: true },
  '14': { x: 125, y: 280, w: 55, h: 42, section: 'girls', zone: 'bay_a', label: '14', pod: 'Bay A Window Pod (Girls)', window: true },
  '16': { x: 60, y: 228, w: 55, h: 42, section: 'boys', zone: 'bay_a', label: '16', pod: 'Bay A Window Pod (Boys)', window: true },
  '36': { x: 125, y: 135, w: 55, h: 42, section: 'boys', zone: 'bay_a', label: '36', pod: 'Bay A Upper Aisle (Boys)', window: true },
  '38': { x: 60, y: 83, w: 55, h: 42, section: 'girls', zone: 'bay_a', label: '38', pod: 'Bay A Daylight Carrel (Girls)', window: true },

  // ── MAIN HALL: BAY C (Central Academic Pods) ──
  '11': { x: 445, y: 280, w: 55, h: 42, section: 'girls', zone: 'bay_c', label: '11', pod: 'Bay C Center Pod (Girls)', window: false },
  '19': { x: 380, y: 228, w: 55, h: 42, section: 'boys', zone: 'bay_c', label: '19', pod: 'Bay C Center Pod (Boys)', window: false },
  '33': { x: 445, y: 135, w: 55, h: 42, section: 'boys', zone: 'bay_c', label: '33', pod: 'Bay C Deep Focus Pod (Boys)', window: false },
  '42': { x: 445, y: 83, w: 55, h: 42, section: 'girls', zone: 'bay_c', label: '42', pod: 'Bay C Deep Focus Pod (Girls)', window: false },

  // ── MAIN HALL: BAY B (Reference Stacks Wing) ──
  '23': { x: 730, y: 280, w: 55, h: 42, section: 'boys', zone: 'bay_b', label: '23', pod: 'Bay B Stacks Front Row', window: false },
  '24': { x: 790, y: 280, w: 55, h: 42, section: 'boys', zone: 'bay_b', label: '24', pod: 'Bay B Stacks Front Row', window: false },
  '29': { x: 790, y: 135, w: 55, h: 42, section: 'boys', zone: 'bay_b', label: '29', pod: 'Bay B Center Quiet Lane', window: false },
  '46': { x: 790, y: 83, w: 55, h: 42, section: 'boys', zone: 'bay_b', label: '46', pod: 'Bay B North Stacks Carrel', window: true },
};

export default function ReadingBayBlueprintMap({ setPage, timingText = '7:00 AM – 10:00 PM' }) {
  const [selectedDeskId, setSelectedDeskId] = useState('14');
  const [activeBayFilter, setActiveBayFilter] = useState('all'); // 'all' | 'enclave' | 'bay_a' | 'bay_c' | 'bay_b'
  const [viewMode, setViewMode] = useState('blueprint'); // 'blueprint' | 'directory'
  const [zoomLevel, setZoomLevel] = useState(1); // 1, 1.25, 1.5, 1.8
  
  // Drag to pan state
  const mapScrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Representative carrel preview list without exposing total seats
  const previewDesks = useMemo(() => {
    return Object.entries(PREVIEW_CARREL_COORDS).map(([id, coord]) => ({
      desk_id: id,
      ...coord,
      status: ['4', '19', '29'].includes(id) ? 'occupied' : 'available',
      plug: true,
    }));
  }, []);

  // Filtered preview carrels
  const filteredDesks = useMemo(() => {
    if (activeBayFilter === 'all') return previewDesks;
    return previewDesks.filter((d) => d.zone === activeBayFilter);
  }, [previewDesks, activeBayFilter]);

  // Currently inspected carrel
  const selectedCarrel = useMemo(() => {
    return previewDesks.find((d) => String(d.desk_id) === String(selectedDeskId)) || previewDesks[0];
  }, [previewDesks, selectedDeskId]);

  // Handle Bay Filter Change and Auto-Scroll to that Section
  const handleBaySelect = (bayId) => {
    setActiveBayFilter(bayId);
    const container = mapScrollRef.current;
    if (!container) return;

    if (bayId === 'all') {
      container.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    } else if (bayId === 'enclave') {
      // Girls Enclave is at bottom-left (x: 20-330, y: 390-660)
      container.scrollTo({ left: 0, top: 320, behavior: 'smooth' });
    } else if (bayId === 'bay_a') {
      // Bay A is top-left
      container.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    } else if (bayId === 'bay_c') {
      // Bay C is center
      const maxScroll = container.scrollWidth - container.clientWidth;
      container.scrollTo({ left: Math.max(0, maxScroll * 0.45), top: 0, behavior: 'smooth' });
    } else if (bayId === 'bay_b') {
      // Bay B is right
      container.scrollTo({ left: container.scrollWidth, top: 0, behavior: 'smooth' });
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(1.8, +(prev + 0.25).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(1, +(prev - 0.25).toFixed(2)));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    if (mapScrollRef.current) {
      mapScrollRef.current.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }
  };

  // Quick navigation buttons (scroll left / right 260px)
  const handleScrollLeft = () => {
    if (mapScrollRef.current) {
      mapScrollRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (mapScrollRef.current) {
      mapScrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  // Mouse Drag-to-Pan Handlers
  const handleMouseDown = (e) => {
    // Only drag with primary mouse button
    if (e.button !== 0) return;
    const container = mapScrollRef.current;
    if (!container) return;
    setIsDragging(true);
    setDragStart({
      x: e.pageX,
      y: e.pageY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const container = mapScrollRef.current;
    if (!container) return;
    e.preventDefault();
    const dx = e.pageX - dragStart.x;
    const dy = e.pageY - dragStart.y;
    container.scrollLeft = dragStart.scrollLeft - dx;
    container.scrollTop = dragStart.scrollTop - dy;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full material-card hairline-border rounded-3xl p-5 sm:p-8 shadow-sm backdrop-blur-xl">
      
      {/* ── HEADER & VIEW SWITCH ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 hairline-b">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#004B87] dark:text-blue-400">
              Verified Architectural Blueprint
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Zoned Study Sanctuary
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white hig-title-2">
            Reading Hall &amp; Sanctuary Floorplan Blueprint
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Handwara Facility • Daily Schedule: <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold tabular-nums">{timingText}</span>
          </p>
        </div>

        {/* View Switch: Blueprint vs Bay Roster */}
        <div className="flex items-center p-1 bg-slate-200/60 dark:bg-slate-800/80 rounded-xl hairline-border backdrop-blur-sm self-start sm:self-auto">
          <button
            onClick={() => setViewMode('blueprint')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer select-none hig-spring ${
              viewMode === 'blueprint'
                ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass size={14} />
            <span>Blueprint Map</span>
          </button>
          <button
            onClick={() => setViewMode('directory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer select-none hig-spring ${
              viewMode === 'directory'
                ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid size={14} />
            <span>Bay Roster</span>
          </button>
        </div>
      </div>

      {/* ── BAY FILTER TABS (No Total Counts Exposed) ── */}
      <div className="flex items-center gap-1.5 py-3 overflow-x-auto blueprint-scrollbar hairline-b text-xs">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
          Study Bays:
        </span>
        {[
          { id: 'all', label: 'All Study Bays' },
          { id: 'enclave', label: 'Girls Private Enclave' },
          { id: 'bay_a', label: 'Bay A (Window Bay)' },
          { id: 'bay_c', label: 'Bay C (Central Pods)' },
          { id: 'bay_b', label: 'Bay B (Reference Stacks)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleBaySelect(tab.id)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer select-none hig-spring ${
              activeBayFilter === tab.id
                ? 'bg-[#004B87] text-white shadow-xs ring-2 ring-[#004B87]/30'
                : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hairline-border hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── MAIN INTERACTIVE DISPLAY ── */}
      <div className="py-5">
        {viewMode === 'blueprint' ? (
          /* ── ARCHITECTURAL SVG FLOORPLAN MAP ── */
          <div className="relative rounded-2xl overflow-hidden bg-[#070F1E] border border-[#1E3A5F] shadow-inner">
            
            {/* Top Bar: Status + Apple Floating Zoom & Navigation Controls */}
            <div className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5 bg-[#0A192F]/80 backdrop-blur-md border-b border-[#1E3A5F] text-[11px] text-slate-300 z-10 relative">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="font-semibold text-white">Interactive Reading Hall Blueprint</span>
                <span className="hidden sm:inline text-slate-400">• Drag or use scroll controls to explore all bays</span>
              </div>

              {/* Floating Zoom & Pan Control Pill */}
              <div className="flex items-center gap-1.5 bg-[#070F1E]/90 px-2 py-1 rounded-xl border border-[#1E3A5F]">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                  title="Zoom Out"
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#1E3A5F] disabled:opacity-30 disabled:pointer-events-none transition hig-spring cursor-pointer"
                >
                  <Minus size={13} />
                </button>

                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="Fit to Screen / Reset"
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-blue-300 hover:text-white hover:bg-[#1E3A5F] transition tabular-nums"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>

                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 1.8}
                  title="Zoom In"
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#1E3A5F] disabled:opacity-30 disabled:pointer-events-none transition hig-spring cursor-pointer"
                >
                  <Plus size={13} />
                </button>

                <div className="w-px h-3.5 bg-[#1E3A5F] mx-0.5" />

                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="Reset Position"
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#1E3A5F] transition hig-spring cursor-pointer"
                >
                  <RotateCcw size={11} />
                </button>
              </div>
            </div>

            {/* Quick Left Chevron Navigation Button */}
            <button
              type="button"
              onClick={handleScrollLeft}
              aria-label="Scroll blueprint left"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#0A192F]/85 hover:bg-[#1E3A5F] border border-[#1E3A5F] text-blue-300 flex items-center justify-center shadow-lg backdrop-blur-md transition hig-spring cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Quick Right Chevron Navigation Button */}
            <button
              type="button"
              onClick={handleScrollRight}
              aria-label="Scroll blueprint right"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#0A192F]/85 hover:bg-[#1E3A5F] border border-[#1E3A5F] text-blue-300 flex items-center justify-center shadow-lg backdrop-blur-md transition hig-spring cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>

            {/* Responsive SVG Map Canvas with Drag-to-Pan and Visible Apple Blueprint Scrollbar */}
            <div
              ref={mapScrollRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`w-full overflow-x-auto overflow-y-auto blueprint-scrollbar py-3 px-2 relative select-none scroll-smooth ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                maxHeight: '620px',
              }}
            >
              <svg
                viewBox="0 0 1000 680"
                style={{
                  width: `${Math.round(zoomLevel * 100)}%`,
                  minWidth: zoomLevel === 1 ? '760px' : `${Math.round(zoomLevel * 760)}px`,
                  height: 'auto',
                }}
                className="block select-none"
              >
                <defs>
                  {/* Subtle Grid Pattern */}
                  <pattern id="lib-blueprint-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#13243F" strokeWidth="0.8" />
                  </pattern>

                  {/* Girls Enclave Diagonal Hatch */}
                  <pattern id="girls-enclave-pattern" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="16" stroke="#581C87" strokeWidth="1.2" strokeOpacity="0.4" />
                  </pattern>
                </defs>

                {/* Base Floor Grid */}
                <rect width="1000" height="680" fill="#070F1E" />
                <rect width="1000" height="680" fill="url(#lib-blueprint-grid)" />

                {/* Outer Wall Boundary */}
                <rect
                  x="20"
                  y="20"
                  width="960"
                  height="640"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                  rx="6"
                />

                {/* ── ZONE 1: GIRLS PRIVATE ENCLAVE (BOTTOM-LEFT) ── */}
                <path
                  d="M 20 390 L 330 390 L 330 660"
                  fill="url(#girls-enclave-pattern)"
                  stroke="#9333EA"
                  strokeWidth="2"
                />
                <rect x="20" y="390" width="310" height="270" fill="#2E1065" fillOpacity="0.35" />

                {/* Enclave Doorway */}
                <line x1="330" y1="390" x2="330" y2="430" stroke="#070F1E" strokeWidth="4" />
                <path d="M 330 430 A 40 40 0 0 1 290 390" fill="none" stroke="#A855F7" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="336" y="415" fill="#C084FC" fontSize="9" fontWeight="600">Acoustic Door</text>

                {/* Corner Architectural Column */}
                <rect x="25" y="605" width="30" height="45" fill="#3B0764" stroke="#9333EA" strokeWidth="1.5" rx="3" />
                <text x="32" y="632" fill="#E9D5FF" fontSize="8" fontWeight="bold">COL</text>

                {/* Girls Enclave Room Title Header (NO seat count exposed) */}
                <text x="35" y="420" fill="#F5D0FE" fontSize="12" fontWeight="bold" letterSpacing="0.8">
                  GIRLS PRIVATE ENCLAVE
                </text>
                <text x="35" y="435" fill="#C084FC" fontSize="9">
                  Enclosed Acoustic Sanctuary • Private Doorway
                </text>

                {/* ── ZONE 2: ADMINISTRATIVE REGISTRY (BOTTOM-RIGHT) ── */}
                <rect
                  x="440"
                  y="420"
                  width="280"
                  height="240"
                  fill="#0B1A30"
                  stroke="#1E3A5F"
                  strokeWidth="2"
                  rx="4"
                />
                <circle cx="500" cy="420" r="14" fill="#0A192F" stroke="#3B82F6" strokeWidth="1.5" />
                <path d="M 500 427 L 500 413 M 496 417 L 500 413 L 504 417" stroke="#38BDF8" strokeWidth="2" fill="none" />
                <text x="530" y="525" fill="#E2E8F0" fontSize="13" fontWeight="bold">ADMINISTRATIVE OFFICE</text>
                <text x="530" y="545" fill="#94A3B8" fontSize="10">Chief Librarian &amp; Patron Registry</text>

                {/* ── ZONE 3: CORRIDOR & MAIN ENTRY ── */}
                <line x1="20" y1="360" x2="980" y2="360" stroke="#1E3A5F" strokeWidth="1" strokeDasharray="4 4" />
                <text x="440" y="385" fill="#38BDF8" fontSize="11" fontWeight="bold" letterSpacing="1">
                  MAIN CIRCULATION CORRIDOR
                </text>

                {/* Main Building Entry Doorway (East Wall) */}
                <rect x="965" y="335" width="15" height="50" fill="#10B981" rx="2" />
                <path d="M 950 360 L 910 360 M 920 355 L 910 360 L 920 365" stroke="#34D399" strokeWidth="2.5" fill="none" />
                <text x="830" y="364" fill="#34D399" fontSize="11" fontWeight="bold">MAIN ENTRY</text>

                {/* ── ZONE 4: MAIN STUDY HALL (BAYS HEADERS - NO COUNTS) ── */}
                <text x="60" y="55" fill="#94A3B8" fontSize="11" fontWeight="bold" letterSpacing="0.8">
                  BAY A: WINDOW READING PODS
                </text>
                <text x="380" y="55" fill="#94A3B8" fontSize="11" fontWeight="bold" letterSpacing="0.8">
                  BAY C: CENTRAL STUDY PODS
                </text>
                <text x="670" y="55" fill="#94A3B8" fontSize="11" fontWeight="bold" letterSpacing="0.8">
                  BAY B: REFERENCE STACKS
                </text>

                {/* Walkway Aisles */}
                <line x1="60" y1="195" x2="245" y2="195" stroke="#1E3A5F" strokeWidth="1" strokeDasharray="3 3" />
                <text x="120" y="200" fill="#64748B" fontSize="8" textAnchor="middle">WALKWAY AISLE</text>

                <line x1="380" y1="195" x2="565" y2="195" stroke="#1E3A5F" strokeWidth="1" strokeDasharray="3 3" />
                <text x="472" y="200" fill="#64748B" fontSize="8" textAnchor="middle">WALKWAY AISLE</text>

                <line x1="670" y1="210" x2="965" y2="210" stroke="#1E3A5F" strokeWidth="1" strokeDasharray="3 3" />
                <text x="817" y="215" fill="#64748B" fontSize="8" textAnchor="middle">CENTRAL AISLE</text>

                {/* ── REPRESENTATIVE PREVIEW CARRELS ("SOME DATA") ── */}
                {previewDesks.map((desk) => {
                  const isSelected = String(desk.desk_id) === String(selectedDeskId);
                  const isOccupied = desk.status === 'occupied';
                  const isGirls = desk.section === 'girls';

                  // Dim desks that don't match active bay filter
                  const isDimmed = activeBayFilter !== 'all' && desk.zone !== activeBayFilter;

                  let fillColor = isGirls ? '#2E1065' : '#0F2744';
                  let strokeColor = isGirls ? '#7C3AED' : '#2563EB';
                  let textColor = isGirls ? '#F5D0FE' : '#BFDBFE';

                  if (isOccupied) {
                    fillColor = '#1E293B';
                    strokeColor = '#334155';
                    textColor = '#64748B';
                  } else if (isSelected) {
                    fillColor = isGirls ? '#4C1D95' : '#1E3A8A';
                    strokeColor = '#F59E0B';
                    textColor = '#FFFFFF';
                  }

                  return (
                    <g
                      key={desk.desk_id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDeskId(desk.desk_id);
                      }}
                      className="cursor-pointer transition-opacity duration-150"
                      opacity={isDimmed ? 0.2 : 1}
                    >
                      {/* Selection Halo */}
                      {isSelected && (
                        <rect
                          x={desk.x - 3}
                          y={desk.y - 3}
                          width={desk.w + 6}
                          height={desk.h + 6}
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="2.5"
                          rx="6"
                        />
                      )}

                      {/* Desk Surface */}
                      <rect
                        x={desk.x}
                        y={desk.y}
                        width={desk.w}
                        height={desk.h}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isSelected ? 2 : 1.2}
                        rx="4"
                      />

                      {/* Gender Color Pip */}
                      <circle
                        cx={desk.x + desk.w - 8}
                        cy={desk.y + 8}
                        r="3"
                        fill={isGirls ? '#D946EF' : '#38BDF8'}
                      />

                      {/* Desk Number */}
                      <text
                        x={desk.x + 8}
                        y={desk.y + 24}
                        fill={textColor}
                        fontSize="14"
                        fontWeight="bold"
                        fontFamily="monospace"
                        className="tabular-nums"
                      >
                        {desk.label}
                      </text>

                      {/* Section / Status Tag */}
                      <text
                        x={desk.x + 8}
                        y={desk.y + 36}
                        fill={isOccupied ? '#64748B' : (isGirls ? '#E879F9' : '#93C5FD')}
                        fontSize="8"
                        fontWeight="600"
                      >
                        {isOccupied ? 'TAKEN' : (isGirls ? 'GIRLS' : 'BOYS')}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Blueprint Legend & Navigation Hint */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#0A192F]/90 border-t border-[#1E3A5F] text-[11px] text-slate-300">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#2E1065] border border-[#7C3AED]" />
                  <span>Girls Section (G)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#0F2744] border border-[#2563EB]" />
                  <span>Boys Section (B)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#1E293B] border border-[#334155]" />
                  <span>Reserved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#1E3A8A] border border-[#F59E0B]" />
                  <span>Selected</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <Hand size={11} className="text-blue-400" />
                <span>Drag to pan • Click any carrel to inspect</span>
              </div>
            </div>
          </div>
        ) : (
          /* ── ACCESSIBLE BAY ROSTER GRID VIEW (Representative Carrels) ── */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredDesks.map((desk) => {
              const isSelected = String(desk.desk_id) === String(selectedDeskId);
              const isOccupied = desk.status === 'occupied';
              const isGirls = desk.section === 'girls';

              return (
                <button
                  key={desk.desk_id}
                  onClick={() => setSelectedDeskId(desk.desk_id)}
                  className={`p-3.5 rounded-2xl hairline-border text-left transition cursor-pointer flex flex-col justify-between hig-spring select-none ${
                    isOccupied
                      ? 'bg-slate-100 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 opacity-60'
                      : isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-[#004B87] dark:border-blue-500 ring-2 ring-blue-500/25 shadow-xs'
                      : isGirls
                      ? 'bg-purple-50/40 dark:bg-purple-950/20 hover:border-purple-300 dark:hover:border-purple-700'
                      : 'bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                      Carrel {desk.desk_id}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                      isGirls ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    }`}>
                      {isGirls ? 'Girls' : 'Boys'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {desk.pod}
                  </span>
                  <div className="mt-2.5 flex items-center justify-between text-[10px]">
                    <span className={isOccupied ? 'text-slate-400' : 'text-emerald-600 dark:text-emerald-400 font-semibold'}>
                      {isOccupied ? 'Reserved' : 'Available'}
                    </span>
                    <Zap size={11} className="text-amber-500" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SELECTED CARREL DETAIL INSPECTOR ── */}
      {selectedCarrel && (
        <div className="mt-3 p-4 sm:p-5 bg-slate-50/90 dark:bg-slate-900/80 hairline-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#004B87] text-white flex flex-col items-center justify-center font-mono font-bold shadow-xs shrink-0">
              <span className="text-[10px] uppercase tracking-wider font-sans font-medium text-blue-200">Carrel</span>
              <span className="text-base leading-none tabular-nums">{selectedCarrel.desk_id}</span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base hig-title-2">
                  Carrel #{selectedCarrel.desk_id} • {selectedCarrel.pod}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  selectedCarrel.section === 'girls'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                }`}>
                  {selectedCarrel.section === 'girls' ? 'Girls Sanctuary Section' : 'Boys Academic Stacks'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Zap size={12} className="text-amber-500" />
                  <span>Dedicated 220V Inverter Plug</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span>Acoustic Partition Divider</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Wifi size={12} className="text-blue-500" />
                  <span>100 Mbps Dual Fiber</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setPage('packages')}
              className="w-full md:w-auto px-6 py-2.5 bg-[#004B87] hover:bg-[#003865] text-white rounded-full font-semibold text-xs transition cursor-pointer hig-spring shadow-xs flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>Reserve Carrel #{selectedCarrel.desk_id}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

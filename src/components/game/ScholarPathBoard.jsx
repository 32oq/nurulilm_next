"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

/**
 * Normalizes wall edge representation
 */
function wallKey(r1, c1, r2, c2) {
  if (r1 > r2 || (r1 === r2 && c1 > c2)) {
    return `${r2},${c2}-${r1},${c1}`;
  }
  return `${r1},${c1}-${r2},${c2}`;
}

export default function ScholarPathBoard({
  size = 6,
  checkpoints = [],
  walls = [],
  path = [],
  onPathChange,
  isLocked = false,
  hintData = null,
  onInvalidMove
}) {
  const boardRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [invalidCell, setInvalidCell] = useState(null);

  // Fast lookups
  const wallSet = React.useMemo(() => {
    const s = new Set();
    for (const w of walls) {
      s.add(wallKey(w.r1, w.c1, w.r2, w.c2));
    }
    return s;
  }, [walls]);

  const checkpointMap = React.useMemo(() => {
    const m = new Map();
    for (const cp of checkpoints) {
      m.set(`${cp.r},${cp.c}`, cp.val);
    }
    return m;
  }, [checkpoints]);

  const pathIndexMap = React.useMemo(() => {
    const m = new Map();
    path.forEach(([r, c], idx) => {
      m.set(`${r},${c}`, idx);
    });
    return m;
  }, [path]);

  // Determine highest visited checkpoint
  const highestVisitedCp = React.useMemo(() => {
    let maxCp = 0;
    for (const [r, c] of path) {
      const val = checkpointMap.get(`${r},${c}`);
      if (val && val > maxCp) {
        maxCp = val;
      }
    }
    return maxCp;
  }, [path, checkpointMap]);

  // Flash invalid cell feedback
  const triggerInvalid = useCallback((r, c, reason) => {
    setInvalidCell({ r, c });
    if (onInvalidMove) onInvalidMove({ r, c, reason });
    setTimeout(() => {
      setInvalidCell((prev) => (prev?.r === r && prev?.c === c ? null : prev));
    }, 450);
  }, [onInvalidMove]);

  // Handle cell entry
  const handleCellHover = useCallback((r, c) => {
    if (isLocked) return;
    if (r < 0 || r >= size || c < 0 || c >= size) return;

    // 1. If path is empty, can only start on checkpoint 1
    if (path.length === 0) {
      const cpVal = checkpointMap.get(`${r},${c}`);
      if (cpVal === 1) {
        onPathChange([[r, c]], false);
      } else {
        triggerInvalid(r, c, "Path must start on checkpoint 1");
      }
      return;
    }

    const currentTip = path[path.length - 1];
    if (currentTip[0] === r && currentTip[1] === c) {
      return; // Already on tip
    }

    // 2. Check if user is backtracking over existing path
    const existingIdx = pathIndexMap.get(`${r},${c}`);
    if (existingIdx !== undefined) {
      if (existingIdx < path.length - 1) {
        // Backtrack to this cell
        const newPath = path.slice(0, existingIdx + 1);
        onPathChange(newPath, true);
      }
      return;
    }

    // 3. Orthogonal movement check
    const dist = Math.abs(r - currentTip[0]) + Math.abs(c - currentTip[1]);
    if (dist !== 1) {
      // Not adjacent
      return;
    }

    // 4. Wall collision check
    const wk = wallKey(currentTip[0], currentTip[1], r, c);
    if (wallSet.has(wk)) {
      triggerInvalid(r, c, "Blocked by wall barrier");
      return;
    }

    // 5. Checkpoint order check
    const cpVal = checkpointMap.get(`${r},${c}`);
    if (cpVal !== undefined) {
      const expectedNext = highestVisitedCp + 1;
      if (cpVal !== expectedNext) {
        triggerInvalid(r, c, `Checkpoint ${cpVal} visited out of order. Expected ${expectedNext}.`);
        return;
      }
    }

    // Valid extension
    onPathChange([...path, [r, c]], false);
  }, [isLocked, size, path, checkpointMap, pathIndexMap, highestVisitedCp, wallSet, onPathChange, triggerInvalid]);

  // Resolve grid coordinates from pointer client position
  const getCellFromPoint = useCallback((clientX, clientY) => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return null;
    }
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const cellWidth = rect.width / size;
    const cellHeight = rect.height / size;
    const c = Math.floor(x / cellWidth);
    const r = Math.floor(y / cellHeight);
    if (r >= 0 && r < size && c >= 0 && c < size) {
      return { r, c };
    }
    return null;
  }, [size]);

  // Pointer event handlers with touch-action isolation
  const handlePointerDown = useCallback((e) => {
    if (isLocked) return;
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // In case element capture isn't supported
    }
    const cell = getCellFromPoint(e.clientX, e.clientY);
    if (cell) {
      handleCellHover(cell.r, cell.c);
    }
  }, [isLocked, getCellFromPoint, handleCellHover]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || isLocked) return;
    const cell = getCellFromPoint(e.clientX, e.clientY);
    if (cell) {
      handleCellHover(cell.r, cell.c);
    }
  }, [isDragging, isLocked, getCellFromPoint, handleCellHover]);

  const handlePointerUp = useCallback((e) => {
    setIsDragging(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Keyboard accessibility: navigate with Arrow keys from current tip
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLocked || path.length === 0) return;
      const [tr, tc] = path[path.length - 1];
      let nr = tr;
      let nc = tc;

      if (e.key === "ArrowUp") nr = tr - 1;
      else if (e.key === "ArrowDown") nr = tr + 1;
      else if (e.key === "ArrowLeft") nc = tc - 1;
      else if (e.key === "ArrowRight") nc = tc + 1;
      else if (e.key === "Backspace" && path.length > 1) {
        e.preventDefault();
        onPathChange(path.slice(0, -1), true);
        return;
      } else {
        return;
      }

      e.preventDefault();
      handleCellHover(nr, nc);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLocked, path, handleCellHover, onPathChange]);

  // Calculate cell center points for SVG line drawing (scale 0 to 100 per cell)
  const svgSize = size * 100;
  const pathD = React.useMemo(() => {
    if (path.length === 0) return "";
    return path
      .map(([r, c], idx) => {
        const cx = c * 100 + 50;
        const cy = r * 100 + 50;
        return `${idx === 0 ? "M" : "L"} ${cx} ${cy}`;
      })
      .join(" ");
  }, [path]);

  const currentTip = path.length > 0 ? path[path.length - 1] : null;

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Board Outer Container - Screen friendly clamped sizing */}
      <div
        ref={boardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: "none" }}
        className={`relative w-[min(92vw,350px,calc(100vh-270px))] aspect-square rounded-2xl p-2 sm:p-2.5 bg-slate-100 dark:bg-[#111827] border-2 border-slate-300 dark:border-slate-800 shadow-md transition-all duration-150 ${
          isLocked ? "cursor-default opacity-95" : "cursor-crosshair"
        }`}
      >
        {/* SVG Drawing Layer (Path Line, Hint Trail & Walls) */}
        <svg
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="absolute inset-2 sm:inset-2.5 w-[calc(100%-1rem)] sm:w-[calc(100%-1.25rem)] h-[calc(100%-1rem)] sm:h-[calc(100%-1.25rem)] pointer-events-none z-10"
        >
          {/* Active Path SVG Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="currentColor"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-500 dark:text-emerald-400 opacity-90 transition-all duration-75"
            />
          )}

          {/* Hint Path Guidance: Dashed path connecting fromCell to toCell */}
          {hintData?.fromCell && hintData?.toCell && (
            <g className="animate-pulse">
              <line
                x1={hintData.fromCell[1] * 100 + 50}
                y1={hintData.fromCell[0] * 100 + 50}
                x2={hintData.toCell[1] * 100 + 50}
                y2={hintData.toCell[0] * 100 + 50}
                stroke="#F59E0B"
                strokeWidth="14"
                strokeDasharray="16 10"
                strokeLinecap="round"
                opacity="0.9"
              />
              <circle
                cx={hintData.toCell[1] * 100 + 50}
                cy={hintData.toCell[0] * 100 + 50}
                r="18"
                className="fill-amber-400/50 stroke-2 stroke-amber-500 animate-ping"
              />
            </g>
          )}

          {/* Active Tip Pulse Marker in SVG */}
          {currentTip && (
            <circle
              cx={currentTip[1] * 100 + 50}
              cy={currentTip[0] * 100 + 50}
              r="20"
              className="fill-emerald-600 dark:fill-emerald-300 animate-pulse"
            />
          )}

          {/* Wall Barriers */}
          {walls.map((w, idx) => {
            const isHorizontal = w.r1 === w.r2; // Cells side by side (wall is vertical)
            if (isHorizontal) {
              const wx = Math.max(w.c1, w.c2) * 100;
              const y1 = w.r1 * 100 + 8;
              const y2 = (w.r1 + 1) * 100 - 8;
              return (
                <line
                  key={`wall-${idx}`}
                  x1={wx}
                  y1={y1}
                  x2={wx}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth="11"
                  strokeLinecap="round"
                  className="text-slate-800 dark:text-slate-200"
                />
              );
            } else {
              // Cells on top of each other (wall is horizontal)
              const wy = Math.max(w.r1, w.r2) * 100;
              const x1 = w.c1 * 100 + 8;
              const x2 = (w.c1 + 1) * 100 - 8;
              return (
                <line
                  key={`wall-${idx}`}
                  x1={x1}
                  y1={wy}
                  x2={x2}
                  y2={wy}
                  stroke="currentColor"
                  strokeWidth="11"
                  strokeLinecap="round"
                  className="text-slate-800 dark:text-slate-200"
                />
              );
            }
          })}
        </svg>

        {/* CSS Grid Cells */}
        <div
          className="w-full h-full grid gap-1 sm:gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`
          }}
        >
          {Array.from({ length: size }).map((_, r) =>
            Array.from({ length: size }).map((__, c) => {
              const cellKey = `${r},${c}`;
              const cpVal = checkpointMap.get(cellKey);
              const pathIdx = pathIndexMap.get(cellKey);
              const isVisited = pathIdx !== undefined;
              const isTip = currentTip && currentTip[0] === r && currentTip[1] === c;
              const isInvalid = invalidCell && invalidCell.r === r && invalidCell.c === c;

              // Hint arrow logic: Display arrow ON the box user is currently on (fromCell)
              const isHintFrom = hintData?.fromCell && hintData.fromCell[0] === r && hintData.fromCell[1] === c;

              return (
                <div
                  key={cellKey}
                  data-r={r}
                  data-c={c}
                  className={`relative flex items-center justify-center rounded-xl font-mono text-sm sm:text-base font-bold transition-all duration-100 ${
                    isInvalid
                      ? "bg-rose-100 dark:bg-rose-950/60 ring-2 ring-rose-500 scale-95"
                      : isVisited
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100"
                      : "bg-white dark:bg-[#1A2234] text-slate-800 dark:text-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  }`}
                >
                  {/* Directional Arrow on the box the player is currently ON */}
                  {isHintFrom && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 text-slate-950 shadow-lg flex items-center justify-center animate-bounce">
                        {hintData.direction === "UP" && <ArrowUp size={20} strokeWidth={3.2} />}
                        {hintData.direction === "DOWN" && <ArrowDown size={20} strokeWidth={3.2} />}
                        {hintData.direction === "LEFT" && <ArrowLeft size={20} strokeWidth={3.2} />}
                        {hintData.direction === "RIGHT" && <ArrowRight size={20} strokeWidth={3.2} />}
                      </div>
                    </div>
                  )}

                  {/* Numbered Checkpoint Badge */}
                  {cpVal !== undefined && (
                    <div
                      className={`z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-black shadow-sm transition-transform ${
                        isVisited
                          ? "bg-emerald-600 text-white ring-2 ring-emerald-300 dark:ring-emerald-700 scale-105"
                          : "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                      }`}
                    >
                      {cpVal}
                    </div>
                  )}

                  {/* Empty cell soft dot when not visited and not a checkpoint */}
                  {cpVal === undefined && !isVisited && (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 opacity-60" />
                  )}

                  {/* Active Endpoint Ring */}
                  {isTip && (
                    <span className="absolute inset-0 rounded-xl ring-2 ring-emerald-500 dark:ring-emerald-400 pointer-events-none" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

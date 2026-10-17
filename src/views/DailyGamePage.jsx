"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Trophy,
  RotateCcw,
  Undo2,
  Lightbulb,
  Clock,
  HelpCircle,
  Share2,
  CheckCircle2,
  Flame,
  X,
  Play,
  Lock,
  LogIn,
  UserPlus,
  Calendar,
  Sparkles
} from "lucide-react";
import ScholarPathBoard from "../components/game/ScholarPathBoard";
import { gameService } from "../services/gameService";
import { useAuth } from "../context/AuthContext";

export default function DailyGamePage({ setPage }) {
  const { state: { user, isAuthenticated } } = useAuth();

  // Difficulty & Grid Selection
  const [size, setSize] = useState(6);
  const [difficulty, setDifficulty] = useState("medium");
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));

  // Puzzle State
  const [puzzle, setPuzzle] = useState(null);
  const [path, setPath] = useState([]);
  const [backtracks, setBacktracks] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintData, setHintData] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // Start & Timer State
  const [hasStarted, setHasStarted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedSecondsRef = useRef(0);

  // Completion & Submission State
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionResult, setCompletionResult] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Additional Modals
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [copiedShare, setCopiedShare] = useState(false);

  // 1. Fetch Daily Puzzle
  const loadDailyPuzzle = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setStatusMessage("Retrieving official daily puzzle…");
      const res = await gameService.getDailyPuzzle({
        date: dateStr,
        size,
        difficulty
      });
      if (res && res.checkpoints) {
        setPuzzle(res);
        setPath([]);
        setBacktracks(0);
        setHintsUsed(0);
        setHintData(null);
        setElapsedSeconds(0);
        setIsTimerRunning(false);
        setHasStarted(false); // Requires explicit start
        setIsCompleted(false);
        setCompletionResult(null);
        setShowCompletionModal(false);
        setStatusMessage("");
      }
    } catch {
      setStatusMessage("Failed to load puzzle. Please check network connection.");
    }
  }, [dateStr, size, difficulty, isAuthenticated]);

  useEffect(() => {
    loadDailyPuzzle();
  }, [loadDailyPuzzle]);

  // 2. Fetch User Stats
  const loadUserStats = useCallback(async () => {
    if (isAuthenticated) {
      const stats = await gameService.getUserStats();
      if (stats) setUserStats(stats);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  // 3. Timer Management
  useEffect(() => {
    if (isTimerRunning && !isCompleted) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now() - (elapsedSecondsRef.current * 1000);
      }
      timerRef.current = setInterval(() => {
        const secs = Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000));
        elapsedSecondsRef.current = secs;
        setElapsedSeconds(secs);
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isCompleted]);

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 4. Start Challenge Pop-up Handler
  const handleStartChallenge = async () => {
    if (!puzzle) return;
    const now = Date.now();
    startTimeRef.current = now;
    elapsedSecondsRef.current = 0;
    setElapsedSeconds(0);
    setHasStarted(true);
    setIsTimerRunning(true);
    setStatusMessage("Timer running! Draw line starting at checkpoint 1.");

    try {
      const att = await gameService.startAttempt(puzzle.puzzle_id);
      if (att?.attempt_id) setAttemptId(att.attempt_id);
    } catch {
      // Proceed gracefully
    }
  };

  // 6. Automatic Submission & Leaderboard Ranking
  const triggerAutomaticSubmission = async (completedPath) => {
    setIsCompleted(true);
    setIsTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const calculatedTime = startTimeRef.current
      ? Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
      : (elapsedSecondsRef.current || 1);

    elapsedSecondsRef.current = calculatedTime;
    setElapsedSeconds(calculatedTime);
    setIsSubmitting(true);
    const patronName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.name || user?.full_name || user?.email || 'Scholar Patron';

    try {
      const result = await gameService.submitSolution({
        puzzleId: puzzle.puzzle_id,
        path: completedPath,
        elapsedSeconds: calculatedTime,
        backtracks,
        hintsUsed,
        attemptId,
        userName: patronName
      });

      setIsSubmitting(false);

      if (result?.valid || result?.success) {
        setCompletionResult(result);
        setShowCompletionModal(true);
        setStatusMessage("Verified! Automatically ranked on today's leaderboard.");
        loadUserStats();
        // Automatically refresh daily leaderboard
        const ld = await gameService.getDailyLeaderboard(puzzle.date || dateStr);
        setLeaderboardData(ld || []);
      } else {
        setIsCompleted(false);
        setIsTimerRunning(true);
        setStatusMessage(result?.reason || "Path is incomplete or crosses a wall.");
      }
    } catch (err) {
      setIsSubmitting(false);
      setIsCompleted(false);
      setIsTimerRunning(true);
      setStatusMessage(err?.message || "Submission verification failed.");
    }
  };

  const triggerSubmissionRef = useRef(triggerAutomaticSubmission);
  useEffect(() => {
    triggerSubmissionRef.current = triggerAutomaticSubmission;
  });

  // 5. Handle Path Drawing Updates
  const handlePathChange = useCallback(
    (newPath, isBacktrack) => {
      if (isCompleted || !hasStarted) return;

      if (isBacktrack) {
        setBacktracks((prev) => prev + 1);
      }

      setPath(newPath);

      // Clear hint once user moves to the suggested step
      if (hintData?.toCell) {
        const lastStep = newPath[newPath.length - 1];
        if (lastStep && lastStep[0] === hintData.toCell[0] && lastStep[1] === hintData.toCell[1]) {
          setHintData(null);
        }
      }

      // Check if puzzle is fully covered: immediately trigger automatic submission
      if (puzzle && newPath.length === puzzle.total_cells) {
        triggerSubmissionRef.current(newPath);
      }
    },
    [isCompleted, hasStarted, hintData, puzzle] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // 7. Hint Request with Directional Arrow
  const handleRequestHint = async () => {
    if (isCompleted || !hasStarted || !puzzle) return;
    try {
      const hintRes = await gameService.getHint({
        puzzleId: puzzle.puzzle_id,
        currentPath: path,
        attemptId
      });

      if (hintRes?.fromCell && hintRes?.toCell) {
        setHintData(hintRes);
        setHintsUsed((prev) => prev + 1);
        setStatusMessage(`Hint: Move ${hintRes.direction.toLowerCase()} from cell [${hintRes.fromCell[0]}, ${hintRes.fromCell[1]}]`);
      } else if (hintRes?.action === "backtrack") {
        setStatusMessage(hintRes.message || "Diverged from path! Backtrack to continue.");
      } else if (hintRes?.action === "start") {
        setStatusMessage("Start by tapping on cell number 1.");
      }
    } catch {
      setStatusMessage("Hint currently unavailable.");
    }
  };

  // 8. Undo Action
  const handleUndo = () => {
    if (isCompleted || !hasStarted || path.length <= 1) return;
    setPath((prev) => prev.slice(0, -1));
    setBacktracks((prev) => prev + 1);
    setHintData(null);
  };

  // 9. Clear Action
  const handleClear = () => {
    if (isCompleted || !hasStarted) return;
    if (path.length > 0) {
      setPath(path.slice(0, 1)); // Retain start
      setBacktracks((prev) => prev + 1);
      setHintData(null);
    }
  };

  // 10. Share Action
  const handleShare = () => {
    const rankText = completionResult?.stats ? `Rank: #${completionResult.stats.rank || 1} Today | ` : "";
    const text = `Nurul Ilm Library • Scholar Path\nDate: ${puzzle?.date || dateStr}\n${rankText}Time: ${formatTime(elapsedSeconds)}\nBacktracks: ${backtracks} | Hints: ${hintsUsed}\nStreak: ${userStats?.current_streak || 1} 🔥\nDaily logic puzzle for library scholars.`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  // 11. Open Leaderboard
  const handleOpenLeaderboard = async () => {
    setShowLeaderboard(true);
    const data = await gameService.getDailyLeaderboard(dateStr);
    setLeaderboardData(data || []);
  };

  // Authentication Guard
  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 mx-auto flex items-center justify-center mb-4 ring-1 ring-amber-300 dark:ring-amber-800">
            <Lock size={26} />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-slate-50 tracking-tight">
            Registered Scholars Only
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Scholar Path is an exclusive daily cognitive exercise reserved for authenticated library patrons. Please sign in or enroll to play today&apos;s puzzle, maintain streaks, and enter the daily leaderboard.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => setPage("login")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-semibold text-xs shadow-sm transition-all"
            >
              <LogIn size={15} />
              <span>Sign In to Library</span>
            </button>
            <button
              onClick={() => setPage("packages")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all"
            >
              <UserPlus size={15} />
              <span>Select Membership</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalCells = puzzle?.total_cells || size * size;
  const filledCells = path.length;

  return (
    <div className="w-full max-w-lg mx-auto px-3 sm:px-4 py-2 sm:py-3 flex flex-col items-center select-none">
      {/* Top Meta Bar */}
      <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage("dashboard")}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
          >
            ← Desk
          </button>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <Calendar size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>{dateStr}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {userStats?.current_streak > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-[11px] font-bold">
              <Flame size={13} className="fill-amber-500 text-amber-500" />
              <span>{userStats.current_streak}d Streak</span>
            </div>
          )}

          <button
            onClick={() => setShowRulesModal(true)}
            aria-label="Rules"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <HelpCircle size={15} />
          </button>

          <button
            onClick={handleOpenLeaderboard}
            aria-label="Leaderboard"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Trophy size={15} />
          </button>
        </div>
      </div>

      {/* Title & Difficulty Chips */}
      <div className="text-center mb-2">
        <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-slate-50">
          Scholar Path
        </h1>
        <div className="flex items-center justify-center gap-1 mt-1.5">
          {[
            { label: "6×6 Normal", s: 6, d: "medium" },
            { label: "7×7 Scholar", s: 7, d: "hard" },
            { label: "8×8 Master", s: 8, d: "expert" }
          ].map((item) => (
            <button
              key={`${item.s}-${item.d}`}
              disabled={isTimerRunning}
              onClick={() => {
                setSize(item.s);
                setDifficulty(item.d);
              }}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                size === item.s
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              } disabled:opacity-50`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live HUD Bar */}
      <div className="w-[min(92vw,350px,calc(100vh-270px))] flex items-center justify-between px-3 py-1.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 mb-2 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
          <Clock size={14} className="text-emerald-600 dark:text-emerald-400" />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <div>
            Cells: <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{filledCells}</span>/{totalCells}
          </div>
          <div className="w-14 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-150"
              style={{ width: `${(filledCells / totalCells) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status / Hint Toast */}
      {statusMessage && (
        <div className="w-[min(92vw,350px,calc(100vh-270px))] mb-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 text-center animate-fadeIn">
          {statusMessage}
        </div>
      )}

      {/* Game Board Container with Start Pop-up Overlay */}
      <div className="relative w-full flex flex-col items-center">
        {puzzle && (
          <ScholarPathBoard
            size={puzzle.size}
            checkpoints={puzzle.checkpoints}
            walls={puzzle.walls}
            path={path}
            onPathChange={handlePathChange}
            isLocked={!hasStarted || isCompleted || isSubmitting}
            hintData={hintData}
            onInvalidMove={({ reason }) => {
              setStatusMessage(reason);
              setTimeout(() => setStatusMessage(""), 2000);
            }}
          />
        )}

        {/* Start Challenge Pop-up Overlay: Appears when entering section */}
        {!hasStarted && puzzle && (
          <div className="absolute inset-0 z-40 rounded-2xl bg-slate-900/75 dark:bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
            <div className="w-11 h-11 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mb-2 shadow-lg animate-pulse">
              <Play size={22} className="ml-0.5 fill-slate-950" />
            </div>
            <h3 className="text-lg font-serif font-black text-white">
              Ready to Solve Today&apos;s Path?
            </h3>
            <p className="text-[11px] text-slate-300 max-w-[260px] mt-1 leading-snug">
              Connect sequential numbers across every cell. Timer begins as soon as you press start. Results are automatically ranked.
            </p>

            <button
              onClick={handleStartChallenge}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Play size={14} className="fill-slate-950" />
              <span>Start Daily Challenge</span>
            </button>
          </div>
        )}
      </div>

      {/* Screen-Friendly Compact Action Buttons */}
      <div className="w-[min(92vw,350px,calc(100vh-270px))] flex items-center justify-between gap-1.5 mt-2.5">
        <button
          onClick={handleUndo}
          disabled={!hasStarted || isCompleted || path.length <= 1}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Undo2 size={14} />
          <span>Undo</span>
        </button>

        <button
          onClick={handleClear}
          disabled={!hasStarted || isCompleted || path.length <= 1}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <RotateCcw size={14} />
          <span>Clear</span>
        </button>

        <button
          onClick={handleRequestHint}
          disabled={!hasStarted || isCompleted}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border border-amber-200 dark:border-amber-800/70 bg-amber-50 dark:bg-amber-950/30 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Lightbulb size={14} className="text-amber-600 dark:text-amber-400" />
          <span>Hint ({hintsUsed})</span>
        </button>
      </div>

      {/* Completion Modal: Automatically Saved & Ranked */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xl text-center max-h-[90vh] overflow-y-auto">
            <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-2">
              <CheckCircle2 size={24} />
            </div>

            <h3 className="text-lg font-serif font-black text-slate-900 dark:text-slate-100">
              Puzzle Solved &amp; Ranked!
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Automatically saved to today&apos;s official Daily Leaderboard.
            </p>

            {/* Performance Breakdown Table */}
            <div className="grid grid-cols-4 gap-1.5 my-3 py-2 px-1 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 font-mono text-center text-xs">
              <div>
                <div className="text-[9px] text-slate-500 uppercase">Time</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">{formatTime(elapsedSeconds)}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase">Backtracks</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">{backtracks} (+{backtracks * 2}s)</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase">Hints</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">{hintsUsed} (+{hintsUsed * 15}s)</div>
              </div>
              <div>
                <div className="text-[9px] text-emerald-600 uppercase font-bold">Adjusted</div>
                <div className="font-black text-emerald-600 dark:text-emerald-400">
                  {formatTime(elapsedSeconds + hintsUsed * 15 + backtracks * 2)}
                </div>
              </div>
            </div>

            {/* Top 5 Leaderboard Snapshot */}
            {leaderboardData.length > 0 && (
              <div className="my-3 text-left">
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Today&apos;s Scholar Standings
                  </span>
                  <span className="text-[10px] text-slate-500">Sorted by Adjusted Score</span>
                </div>
                <div className="space-y-1">
                  {leaderboardData.slice(0, 5).map((row) => {
                    const isMe = row.user_id === user?.user_id || row.player === [user?.first_name, user?.last_name].filter(Boolean).join(' ');
                    return (
                      <div
                        key={row.rank}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] ${
                          isMe
                            ? "bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 font-bold"
                            : "bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500">#{row.rank}</span>
                          <span className="truncate max-w-[140px]">{row.player} {isMe && "(You)"}</span>
                        </div>
                        <span className="font-mono text-emerald-700 dark:text-emerald-400">
                          {formatTime(row.effective_seconds || row.elapsed_seconds)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-1.5 mt-3">
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all"
              >
                <Share2 size={13} />
                <span>{copiedShare ? "Result Copied to Clipboard!" : "Share Daily Performance"}</span>
              </button>

              <button
                onClick={() => setShowCompletionModal(false)}
                className="w-full py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-amber-500" />
                <h2 className="text-sm font-serif font-bold text-slate-900 dark:text-slate-100">
                  Daily Scholar Leaderboard ({dateStr})
                </h2>
              </div>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-3">
              {leaderboardData.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  <Trophy size={26} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                  No completed attempts recorded yet today. Complete today&apos;s path to be ranked #1!
                </div>
              ) : (
                <div className="space-y-1">
                  {leaderboardData.map((row) => {
                    const isMe =
                      (user?.user_id && row.user_id === user.user_id) ||
                      (user?.id && row.user_id === user.id) ||
                      (user?._id && String(row.user_id) === String(user._id)) ||
                      (row.player && row.player === [user?.first_name, user?.last_name].filter(Boolean).join(' '));

                    return (
                      <div
                        key={row.rank}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs ${
                          isMe
                            ? "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 font-semibold"
                            : "bg-slate-50 dark:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold w-5 text-slate-500">#{row.rank}</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {row.player}
                            {isMe && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold ml-1.5">
                                (You)
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                          <span>{formatTime(row.elapsed_seconds)}</span>
                          {row.effective_seconds !== row.elapsed_seconds && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400">
                              (adj: {formatTime(row.effective_seconds)})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowLeaderboard(false)}
                className="w-full py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-serif font-bold text-slate-900 dark:text-slate-100">
                How to Play Scholar Path
              </h2>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-3 space-y-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              <p><strong>1. Start at Cell 1:</strong> Tap &quot;Start Challenge&quot;, then press cell 1 and drag through adjacent cells.</p>
              <p><strong>2. In Order:</strong> Visit checkpoints in exact numerical order (1 → 2 → 3...).</p>
              <p><strong>3. Fill All Cells:</strong> The continuous line must visit every cell in the grid exactly once.</p>
              <p><strong>4. Respect Walls:</strong> Heavy dark lines are walls that cannot be crossed.</p>
              <p><strong>5. Backtrack:</strong> Drag backwards over your line at any time to automatically erase steps.</p>
              <p><strong>6. Automatic Ranking:</strong> Completed puzzles are saved automatically to the leaderboard. Lowest time wins (hints add +15s, backtracks add +2s).</p>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="mt-4 w-full py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Flame, Timer, TrendingUp, Trophy, Calendar,
  Award, Play, CheckCircle2, ChevronRight, Target,
  Loader2, RefreshCw, Brain
} from 'lucide-react';
import { useOther } from '../../context/OtherContext';

export default function StudyStreakTracker({ user, onOpenTimer, onOpenSynapse }) {
  const { fetchFocusSprintHistory, fetchFocusSprintLeaderboard } = useOther();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    streak: 0,
    todayMinutes: 0,
    weeklyMinutes: 0,
    targetWeeklyHours: 35,
    examGoal: 'Civil Services & State Exams'
  });
  const [topScholars, setTopScholars] = useState([]);

  const loadSprintStats = useCallback(async () => {
    setLoading(true);
    try {
      const [historyRes, boardRes] = await Promise.allSettled([
        fetchFocusSprintHistory(),
        fetchFocusSprintLeaderboard()
      ]);

      if (historyRes.status === 'fulfilled' && historyRes.value?.stats) {
        const s = historyRes.value.stats;
        setStats(prev => ({
          ...prev,
          streak: s.streakDays || 0,
          todayMinutes: s.todayMinutes || 0,
          weeklyMinutes: s.totalMinutes || 0
        }));
      }

      if (boardRes.status === 'fulfilled' && Array.isArray(boardRes.value)) {
        setTopScholars(boardRes.value.slice(0, 3));
      }
    } catch (err) {
      console.warn('Study streak API fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFocusSprintHistory, fetchFocusSprintLeaderboard]);

  useEffect(() => {
    loadSprintStats();
  }, [loadSprintStats]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIdx = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  const todayHours = Math.floor((stats.todayMinutes || 0) / 60);
  const todayMins = (stats.todayMinutes || 0) % 60;
  const weeklyHours = ((stats.weeklyMinutes || 0) / 60).toFixed(1);
  const targetHours = stats.targetWeeklyHours || 35;
  const progressPercent = Math.min(Math.round((weeklyHours / targetHours) * 100), 100);

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#004B87] dark:text-blue-400 flex items-center gap-1.5">
              <Target size={13} />
              <span>Aspirant Deep Work Engine</span>
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Daily Desk Track
            </span>
          </div>
          <h3 className="font-serif-lib text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            Study Streak &amp; Focus Discipline
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Target: <strong className="text-slate-700 dark:text-slate-200">{stats.examGoal}</strong> • Library Desk Track
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadSprintStats}
            title="Refresh statistics"
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#004B87] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#004B87]' : ''} />
          </button>
          {onOpenSynapse && (
            <button
              onClick={onOpenSynapse}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 text-xs font-semibold shadow-2xs transition active:scale-[0.98] cursor-pointer"
              title="Daily 60-second mind break puzzle"
            >
              <Brain size={13} className="text-amber-600 dark:text-amber-400" />
              <span>Synapse (60s Break)</span>
            </button>
          )}
          <button
            onClick={onOpenTimer}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#004B87] hover:bg-[#003865] dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition active:scale-[0.98] cursor-pointer"
          >
            <Play size={12} />
            <span>Start Focus Sprint</span>
          </button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* Streak Counter */}
        <div className="p-3.5 rounded-lg bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 flex items-center justify-center text-lg font-bold">
            🔥
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Consecutive Streak</span>
            <span className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {stats.streak} Days
            </span>
          </div>
        </div>

        {/* Today's Deep Work */}
        <div className="p-3.5 rounded-lg bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-[#004B87] dark:text-blue-400 flex items-center justify-center">
            <Timer size={20} />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Today's Focus Log</span>
            <span className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {todayHours}h {todayMins}m
            </span>
          </div>
        </div>

        {/* Weekly Goal Progress */}
        <div className="p-3.5 rounded-lg bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Logged This Week</span>
            <span className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {weeklyHours} / {targetHours}h
            </span>
          </div>
        </div>
      </div>

      {/* 7-Day Habit Consistency Stepper & Weekly Progress Bar */}
      <div className="space-y-3 pt-1">
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-900 dark:text-white mb-1.5">
            <span>Weekly Target Completion ({progressPercent}%)</span>
            <span className="text-[#004B87] dark:text-blue-400 font-mono tabular-nums">{weeklyHours} hours completed</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#004B87] dark:bg-blue-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Weekly calendar dots */}
        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-2 font-medium">
            Weekly Attendance &amp; Focus Consistency Stepper:
          </span>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekDays.map((day, idx) => {
              const isPastOrToday = idx <= todayIdx;
              const isToday = idx === todayIdx;

              return (
                <div
                  key={day}
                  className={`p-2 rounded-lg text-center border transition-all ${
                    isToday
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-[#004B87] text-[#004B87] dark:text-blue-300 font-bold'
                      : isPastOrToday
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
                      : 'bg-[#F6F8FB] dark:bg-[#0B0F19] border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] block uppercase font-medium">{day}</span>
                  <span className="text-xs mt-0.5 flex items-center justify-center">
                    {isToday ? <Flame size={13} className="text-[#004B87] dark:text-blue-400" /> : isPastOrToday ? '✓' : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mini Scholar Leaderboard */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Trophy size={14} className="text-amber-600 dark:text-amber-400" />
            <span>Library Scholars Leaderboard</span>
          </span>
          <span className="text-[11px] text-slate-500">Weekly Aggregation</span>
        </div>

        {topScholars.length === 0 ? (
          <div className="py-3 px-4 rounded-lg bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              Complete a quiet focus sprint at your desk to appear on the weekly scholars leaderboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {topScholars.map(scholar => (
              <div
                key={scholar.rank || scholar.name}
                className="p-2.5 rounded-lg bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    scholar.rank === 1 ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    #{scholar.rank || 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">{scholar.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{scholar.exam || 'Civil Services'}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[#004B87] dark:text-blue-400 flex-shrink-0 tabular-nums">
                  {scholar.hours}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

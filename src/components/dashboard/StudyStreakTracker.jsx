'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Flame, Timer, TrendingUp, Trophy, Calendar,
  Award, Play, CheckCircle2, ChevronRight, Target,
  Loader2, RefreshCw
} from 'lucide-react';
import { useOther } from '../../context/OtherContext';

export default function StudyStreakTracker({ user, onOpenTimer }) {
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
    <div className="bg-white dark:bg-[#0B1726] border border-[#DCE3EC] dark:border-[#18283A] rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7ECF2] dark:border-[#18283A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1677FF] dark:text-[#00B8FF] flex items-center gap-1.5">
              <Target size={13} />
              <span>Aspirant Deep Work Engine</span>
            </span>
            <span className="text-xs text-[#64748B]">•</span>
            <span className="text-[11px] text-[#138A5B] font-semibold">
              Live Session Tracking Active
            </span>
          </div>
          <h3 className="font-serif-lib text-xl font-bold text-[#0B1B2B] dark:text-white mt-0.5">
            Study Streak &amp; Focus Discipline
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#A0ACBA]">
            Target: <strong>{stats.examGoal}</strong> • Library Desk Track
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadSprintStats}
            title="Refresh statistics"
            className="p-1.5 rounded-xl text-[#64748B] hover:text-[#1677FF] hover:bg-[#EEF2F7] dark:hover:bg-[#0F1D2E] transition cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#1677FF]' : ''} />
          </button>
          <button
            onClick={onOpenTimer}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-[#1264E8] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Play size={13} />
            <span>Start Focus Sprint</span>
          </button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Streak Counter */}
        <div className="p-4 rounded-xl bg-[#F6F8FB] dark:bg-[#081321] border border-[#DCE3EC] dark:border-[#18283A] flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FFF7E6] dark:bg-[#2C2108] border border-[#F5B942]/30 text-[#A66A00] dark:text-[#F5B942] flex items-center justify-center text-xl font-bold">
            🔥
          </div>
          <div>
            <span className="text-[11px] text-[#64748B] block font-medium">Consecutive Streak</span>
            <span className="font-serif-lib text-2xl font-bold text-[#0B1B2B] dark:text-white">
              {stats.streak} Days
            </span>
          </div>
        </div>

        {/* Today's Deep Work */}
        <div className="p-4 rounded-xl bg-[#F6F8FB] dark:bg-[#081321] border border-[#DCE3EC] dark:border-[#18283A] flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] dark:bg-[#0F1D2E] border border-[#1677FF]/20 text-[#1677FF] dark:text-[#00B8FF] flex items-center justify-center">
            <Timer size={24} />
          </div>
          <div>
            <span className="text-[11px] text-[#64748B] block font-medium">Today's Focus Log</span>
            <span className="font-serif-lib text-2xl font-bold text-[#0B1B2B] dark:text-white">
              {todayHours}h {todayMins}m
            </span>
          </div>
        </div>

        {/* Weekly Goal Progress */}
        <div className="p-4 rounded-xl bg-[#F6F8FB] dark:bg-[#081321] border border-[#DCE3EC] dark:border-[#18283A] flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#EAF8F1] dark:bg-[#0B251B] border border-[#138A5B]/30 text-[#138A5B] dark:text-[#19D68C] flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-[11px] text-[#64748B] block font-medium">Logged This Week</span>
            <span className="font-serif-lib text-2xl font-bold text-[#0B1B2B] dark:text-white">
              {weeklyHours} / {targetHours}h
            </span>
          </div>
        </div>
      </div>

      {/* 7-Day Habit Consistency Stepper & Weekly Progress Bar */}
      <div className="space-y-4 pt-1">
        <div>
          <div className="flex justify-between text-xs font-semibold text-[#0B1B2B] dark:text-white mb-1.5">
            <span>Weekly Target Completion ({progressPercent}%)</span>
            <span className="text-[#1677FF] dark:text-[#00B8FF]">{weeklyHours} hours completed</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#E7ECF2] dark:bg-[#18283A] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#1677FF] to-[#00A8E8] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Weekly calendar dots */}
        <div>
          <span className="text-[11px] text-[#64748B] block mb-2 font-medium">
            This Week's Attendance &amp; Consistency Stepper:
          </span>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, idx) => {
              const isPastOrToday = idx <= todayIdx;
              const isToday = idx === todayIdx;

              return (
                <div
                  key={day}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    isToday
                      ? 'bg-[#EAF2FF] dark:bg-[#0F1D2E] border-[#1677FF] text-[#1677FF] dark:text-[#00B8FF] font-bold'
                      : isPastOrToday
                      ? 'bg-[#EAF8F1] dark:bg-[#081812] border-[#138A5B]/30 text-[#138A5B] dark:text-[#19D68C]'
                      : 'bg-[#F6F8FB] dark:bg-[#081321] border-[#DCE3EC] dark:border-[#18283A] text-[#64748B]'
                  }`}
                >
                  <span className="text-[10px] block uppercase font-medium">{day}</span>
                  <span className="text-xs mt-0.5 flex items-center justify-center">
                    {isToday ? <Flame size={13} className="text-[#1677FF]" /> : isPastOrToday ? '✓' : '-'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mini Scholar Leaderboard */}
      <div className="pt-4 border-t border-[#E7ECF2] dark:border-[#18283A]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[#0B1B2B] dark:text-white flex items-center gap-1.5">
            <Trophy size={14} className="text-[#A66A00] dark:text-[#F5B942]" />
            <span>Library Scholars Leaderboard (API Powered)</span>
          </span>
          <span className="text-[11px] text-[#64748B]">Weekly Aggregation</span>
        </div>

        {topScholars.length === 0 ? (
          <div className="py-4 px-4 rounded-xl bg-[#F6F8FB] dark:bg-[#081321] border border-[#DCE3EC] dark:border-[#18283A] text-center">
            <p className="text-xs text-[#64748B] dark:text-[#8CA093]">
              No focus sprint sessions logged yet this week. Complete a quiet focus sprint to take the lead on the leaderboard!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {topScholars.map(scholar => (
              <div
                key={scholar.rank || scholar.name}
                className="p-3 rounded-xl bg-[#F6F8FB] dark:bg-[#081321] border border-[#DCE3EC] dark:border-[#18283A] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    scholar.rank === 1 ? 'bg-[#FFF7E6] text-[#A66A00] border border-[#F5B942]/40' : 'bg-[#E7ECF2] dark:bg-[#0F1D2E] text-[#64748B]'
                  }`}>
                    #{scholar.rank || 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#0B1B2B] dark:text-white leading-tight">{scholar.name}</p>
                    <p className="text-[10px] text-[#64748B]">{scholar.exam || 'Civil Services'}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[#1677FF] dark:text-[#00B8FF]">
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import {
  Flame, Clock, TrendingUp, Sparkles, Target, RefreshCw,
  Award, BookOpen, User, CheckCircle2, AlertCircle
} from 'lucide-react';
import adminService from '../../../services/adminService';

export default function AdminEngagementView({ setView }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    focus_sprints: {
      total_hours: '0.0',
      total_sessions: 0,
      today_hours: '0.0',
      today_sessions: 0,
      avg_session_minutes: 0,
      top_scholars: [],
      recent_sessions: []
    },
    scholar_path: {
      total_solves: 0,
      today_solves: 0,
      top_streaks: []
    }
  });

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getEngagementMetrics();
      if (data) {
        setMetrics({
          focus_sprints: {
            total_hours: data?.focus_sprints?.total_hours || '0.0',
            total_sessions: data?.focus_sprints?.total_sessions || 0,
            today_hours: data?.focus_sprints?.today_hours || '0.0',
            today_sessions: data?.focus_sprints?.today_sessions || 0,
            avg_session_minutes: data?.focus_sprints?.avg_session_minutes || 0,
            top_scholars: Array.isArray(data?.focus_sprints?.top_scholars) ? data.focus_sprints.top_scholars : [],
            recent_sessions: Array.isArray(data?.focus_sprints?.recent_sessions) ? data.focus_sprints.recent_sessions : []
          },
          scholar_path: {
            total_solves: data?.scholar_path?.total_solves || 0,
            today_solves: data?.scholar_path?.today_solves || 0,
            top_streaks: Array.isArray(data?.scholar_path?.top_streaks) ? data.scholar_path.top_streaks : []
          }
        });
      }
    } catch (err) {
      console.error('Failed to load engagement metrics:', err);
      setError(err.message || 'Failed to fetch student engagement metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const { focus_sprints, scholar_path } = metrics;

  return (
    <div className="space-y-6 w-full max-w-5xl">
      {/* Admin Header Plaque */}
      <div className="bg-[#0A192F] text-white rounded-xl p-6 sm:p-7 shadow-xs border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded">
              Library Analytics
            </span>
            <span className="text-xs text-slate-400">Handwara Main Reading Rooms</span>
          </div>
          <h2 className="font-serif-lib text-2xl font-bold text-white">Student Study &amp; Engagement Metrics</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of cumulative study sprint hours, reading room discipline, and daily logic challenges.
          </p>
        </div>

        <button
          onClick={loadMetrics}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Study Hours
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Flame size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {focus_sprints.total_hours} <span className="text-xs font-normal text-slate-500">hrs</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Across {focus_sprints.total_sessions} completed sprints
          </p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today's Study Time
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#004B87] dark:text-blue-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {focus_sprints.today_hours} <span className="text-xs font-normal text-slate-500">hrs</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {focus_sprints.today_sessions} session{focus_sprints.today_sessions !== 1 ? 's' : ''} logged today
          </p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Avg Session Length
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Target size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {focus_sprints.avg_session_minutes} <span className="text-xs font-normal text-slate-500">min</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Focus blocks standard: 25–60 min
          </p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Scholar Path Solves
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {scholar_path.total_solves} <span className="text-xs font-normal text-slate-500">solved</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {scholar_path.today_solves} completed today
          </p>
        </div>
      </div>

      {/* Main Grid: Study Leaderboard & Recent Sprints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Dedicated Scholars Leaderboard */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                <Award size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Top Dedicated Scholars (Study Hours)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Members with the highest verified quiet focus study hours in reading rooms.
                </p>
              </div>
            </div>
          </div>

          {focus_sprints.top_scholars.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <p>No student focus sprint records logged yet.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                When students use the Quiet Study Focus Sprint timer, their aggregated hours will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Scholar</th>
                    <th className="py-2.5 px-3">Primary Focus / Subject</th>
                    <th className="py-2.5 px-3 text-right">Total Hours</th>
                    <th className="py-2.5 px-3 text-right">Sessions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {focus_sprints.top_scholars.map((s) => (
                    <tr key={s.user_id + s.rank} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                          s.rank === 1
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                            : s.rank === 2
                            ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                            : s.rank === 3
                            ? 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-400'
                            : 'text-slate-500'
                        }`}>
                          {s.rank}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-[#004B87] dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
                            {s.name?.[0]?.toUpperCase() || 'S'}
                          </div>
                          <span className="truncate max-w-[140px]">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] truncate max-w-[150px]">
                          {s.subject}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {s.hours} hrs
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 font-medium">
                        {s.sessions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 1 Col: Live Study Room Activity Stream */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#004B87] dark:text-blue-400 flex items-center justify-center">
              <Clock size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                Recent Study Sessions
              </h3>
              <p className="text-[11px] text-slate-500">Latest completed focus blocks</p>
            </div>
          </div>

          {focus_sprints.recent_sessions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs my-auto">
              No recent study blocks recorded.
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
              {focus_sprints.recent_sessions.map((sess) => (
                <div
                  key={sess._id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {sess.student_name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {sess.subject}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {moment(sess.completed_at).fromNow()}
                    </span>
                  </div>

                  <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    {sess.duration_minutes} min
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Scholar Path Logic Challenge Summary */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Logic Game Engagement
              </span>
              <span className="text-xs font-bold text-purple-700 dark:text-purple-400">
                {scholar_path.total_solves} Total Solves
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {scholar_path.today_solves} students successfully solved today's Scholar Path daily puzzle.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

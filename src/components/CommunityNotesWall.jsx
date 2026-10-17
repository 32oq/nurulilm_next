"use client";

import { useState, useEffect } from 'react';
import { Pin, Heart, Loader2 } from 'lucide-react';
import { communityService } from '../services/communityService';
import EmptyState from './common/EmptyState';

export default function CommunityNotesWall() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedMap, setLikedMap] = useState({});

  useEffect(() => {
    let isMounted = true;
    const fetchPublishedNotes = async () => {
      try {
        const data = await communityService.getLiveNotes();
        if (isMounted && Array.isArray(data)) {
          setNotes(data);
        }
      } catch (err) {
        console.warn('Could not fetch published community notes:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPublishedNotes();
    return () => { isMounted = false; };
  }, []);

  const handleLike = async (id) => {
    if (likedMap[id]) return;
    setLikedMap((prev) => ({ ...prev, [id]: true }));
    setNotes((prev) =>
      prev.map((n) => (n._id === id || n.id === id ? { ...n, likes: (n.likes || 0) + 1 } : n))
    );
    try {
      await communityService.likeNote(id);
    } catch (_) {}
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <section className="py-14 px-4 sm:px-8 max-w-5xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Pin size={13} className="text-[#004B87] dark:text-blue-400" />
            <span>Student Noticeboard</span>
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Community Bulletin Board
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Notes and study advice submitted by students reading at Nurul Ilm Library.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-xs text-slate-500">
          <Loader2 size={16} className="animate-spin text-[#004B87] dark:text-blue-400" />
          <span>Loading bulletin notes...</span>
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={Pin}
          title="Noticeboard Ledger Clear"
          description="No public community notes are currently pinned. Verified patrons can share study insights, revision routines, and book recommendations from their dashboard."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((n, idx) => (
            <div
              key={n._id || n.id || idx}
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {n.tag || 'Study Focus'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatDate(n.cr_dt)}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  "{n.note}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {n.author || 'Anonymous Patron'}
                </span>
                <button
                  onClick={() => handleLike(n._id || n.id)}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded transition cursor-pointer ${
                    likedMap[n._id || n.id]
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-400 hover:text-rose-600'
                  }`}
                  aria-label="Applaud note"
                >
                  <Heart
                    size={13}
                    className={likedMap[n._id || n.id] ? 'fill-current' : ''}
                  />
                  <span>{n.likes || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

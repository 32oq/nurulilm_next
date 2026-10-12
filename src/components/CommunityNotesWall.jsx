"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pin, Heart, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getApiBase } from '../config/api';

const FALLBACK_NOTES = [
  {
    _id: '1',
    author: 'Irfan M.',
    tag: 'NEET Aspirant',
    note: 'Desk 14 in the morning slot is peaceful. The quiet focus and zero phone distractions helped me finish 120 NCERT questions daily.',
    cr_dt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 18,
  },
  {
    _id: '2',
    author: 'Mehak Jan',
    tag: 'JKAS Candidate',
    note: 'The communal silence here keeps you motivated when stamina drops during long revision hours.',
    cr_dt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 24,
  },
  {
    _id: '3',
    author: 'Zubair Peerzada',
    tag: 'Founder & Librarian',
    note: 'Consistency outlasts talent. Keep your phones in the lockers, drink warm water, and honor your study commitments.',
    cr_dt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 42,
  },
];

export default function CommunityNotesWall() {
  const [notes, setNotes] = useState(FALLBACK_NOTES);
  const [loading, setLoading] = useState(true);
  const [likedMap, setLikedMap] = useState({});

  useEffect(() => {
    let isMounted = true;
    const fetchPublishedNotes = async () => {
      try {
        const res = await axios.get(`${getApiBase()}/dashboard/community-notes/published`);
        const data = res?.data?.results?.data;
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setNotes(data);
        }
      } catch (err) {
        console.warn('Could not fetch published community notes, using curated cache:', err);
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
      await axios.post(`${getApiBase()}/dashboard/community-notes/like/${id}`);
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
    <section className="py-16 px-4 sm:px-8 max-w-6xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#1C3A2B] dark:text-[#88B89C]">
            <Pin size={13} className="text-[#1C3A2B] dark:text-[#52D38A]" />
            <span>Voices From The Study Hall</span>
          </span>
          <h2 className="font-serif-lib text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C2E24] dark:text-[#8FD4AE] mt-1">
            The Community Bulletin Board
          </h2>
          <p className="text-sm text-[#2D3A31] dark:text-[#A1B3A7] mt-1.5 max-w-xl">
            Real notes, advice, and daily study resolutions pinned by fellow students and scholars reading at Nurul Ilm.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-xs text-[#5D6B62] dark:text-[#8FD4AE]">
          <Loader2 size={18} className="animate-spin text-[#1C3A2B] dark:text-[#8FD4AE]" />
          <span>Retrieving pinned notes from study halls...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((n, idx) => (
            <motion.div
              key={n._id || n.id || idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-[#FAF8F5] dark:bg-[#142019] border border-[#DFE6DC] dark:border-[#22352B] p-6 rounded-2xl relative shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#EDF3EE] dark:bg-[#1A2E23] text-[#1C3A2B] dark:text-[#8FD4AE] border border-[#DFE6DC] dark:border-[#263D30]">
                    {n.tag || 'Study Focus'}
                  </span>
                  <span className="text-[11px] text-[#7F8781] dark:text-[#889C90]">
                    {formatDate(n.cr_dt)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#2D3A31] dark:text-[#CAD6CF] leading-relaxed italic mb-4">
                  "{n.note}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#DFE6DC] dark:border-[#22352B] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1C2E24] dark:text-[#E8F0EB]">
                  - {n.author || 'Anonymous Patron'}
                </span>
                <button
                  onClick={() => handleLike(n._id || n.id)}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg transition cursor-pointer ${
                    likedMap[n._id || n.id]
                      ? 'text-[#B91C1C] dark:text-[#F87171]'
                      : 'text-[#5D6B62] dark:text-[#889C90] hover:text-[#B91C1C]'
                  }`}
                  aria-label="Applaud note"
                >
                  <Heart
                    size={14}
                    className={likedMap[n._id || n.id] ? 'fill-current' : ''}
                  />
                  <span>{n.likes || 0}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

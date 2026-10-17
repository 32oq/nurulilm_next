'use client';

import { useState, useEffect } from "react";
import { Newspaper, Pin, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import moment from "moment";
import { useOther } from "../../../context/OtherContext";

const TAG_COLORS = {
  Announcement: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700",
  Holiday:      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  Event:        "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Result:       "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  Exam:         "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900",
  Schedule:     "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  Other:        "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
};

function UpdateCard({ post }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-white dark:bg-[#111827] border rounded-xl overflow-hidden transition shadow-xs ${
        post.pinned ? "border-amber-300 dark:border-amber-700/60" : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700"
      }`}
    >
      {post.image_url && (
        <div className="w-full h-44 bg-slate-100 dark:bg-slate-900 overflow-hidden border-b border-slate-200 dark:border-slate-800">
          <img
            src={post.image_url}
            alt=""
            className="w-full h-full object-cover"
            onError={e => { e.currentTarget.parentElement.style.display = "none"; }}
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-2 flex-wrap mb-2.5">
          {post.pinned && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded text-[10px] font-bold uppercase tracking-wide">
              <Pin size={10} /> Pinned Notice
            </span>
          )}
          {post.tags?.map(tag => (
            <span
              key={tag}
              className={`px-2.5 py-0.5 border rounded text-[10px] font-medium ${
                TAG_COLORS[tag] || TAG_COLORS.Other
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="font-serif-lib text-base font-bold text-slate-900 dark:text-white leading-snug">
          {post.title}
        </h3>

        <p className={`text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed ${!expanded ? "line-clamp-3" : ""}`}>
          {post.body}
        </p>

        {post.body?.length > 160 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-xs font-semibold text-[#004B87] dark:text-blue-400 hover:underline mt-1.5 transition cursor-pointer"
          >
            {expanded ? "Show less" : "Read full notice →"}
          </button>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          <span>
            Posted by <strong className="text-slate-800 dark:text-slate-200">{post.posted_by || "Administration"}</strong>
          </span>
          <span>{moment(post.cr_dt).fromNow()}</span>
        </div>
      </div>
    </div>
  );
}

export default function LibraryUpdates() {
  const { fetchLibraryNews } = useOther();

  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLibraryNews();
      const sorted = [...(data || [])].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.cr_dt) - new Date(a.cr_dt);
      });
      setPosts(sorted);
    } catch {
      setError("Could not load library notices. Please check your connection.");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6 w-full max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white">
            Library Notices
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Official circulars, holiday schedules, and desk announcements.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 transition disabled:opacity-50 self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {loading && posts.length === 0 && (
        <div className="flex items-center justify-center gap-2.5 text-slate-500 py-16 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <Loader2 size={18} className="animate-spin text-[#004B87]" />
          <span className="text-xs font-medium">Loading circulars…</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-4 py-3 rounded-xl text-xs font-medium">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center py-16 px-6 gap-2 text-center shadow-xs">
          <Newspaper size={32} className="text-slate-400" />
          <p className="font-serif-lib text-base font-bold text-slate-900 dark:text-white">No notices posted yet</p>
          <p className="text-xs text-slate-500">Check back soon for announcements and scheduling updates.</p>
        </div>
      )}

      <div className="space-y-4">
        {posts.map(post => (
          <UpdateCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}

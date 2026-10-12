'use client';

import { useState, useEffect } from "react";
import { Newspaper, Pin, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import moment from "moment";
import { useOther } from "../../../context/OtherContext";

const TAG_COLORS = {
  Announcement: "bg-[#EDF3EE] dark:bg-[#1E2E25] text-[#1C3A2B] dark:text-[#8FD4AE] border-[#D9E2DC] dark:border-[#2B4032]",
  Holiday:      "bg-[#EDF3EE] dark:bg-[#1E2E25] text-[#2E6B3F] dark:text-[#8FD4AE] border-[#D9E2DC] dark:border-[#2B4032]",
  Event:        "bg-[#FAF8F5] dark:bg-[#203126] text-[#1C3A2B] dark:text-[#8FD4AE] border-[#E5DFD5] dark:border-[#2B4032]",
  Result:       "bg-[#FFFBEB] dark:bg-[#382B14] text-[#92400E] dark:text-[#FDE68A] border-[#FDE68A] dark:border-[#574019]",
  Exam:         "bg-[#FAF0F0] dark:bg-[#3D1A1A] text-[#A83232] dark:text-[#FCA5A5] border-[#F0D5D5] dark:border-[#5C2A2A]",
  Schedule:     "bg-[#FAF8F5] dark:bg-[#203126] text-[#5D645E] dark:text-[#8CA093] border-[#E5DFD5] dark:border-[#2B4032]",
  Other:        "bg-[#FAF8F5] dark:bg-[#203126] text-[#5D645E] dark:text-[#8CA093] border-[#E5DFD5] dark:border-[#2B4032]",
};

function UpdateCard({ post }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-white dark:bg-[#16211B] border rounded-2xl overflow-hidden transition-all duration-200 shadow-xs ${
        post.pinned ? "border-[#1C3A2B] dark:border-[#8FD4AE] ring-1 ring-[#1C3A2B]/20 dark:ring-[#8FD4AE]/20" : "border-[#E5DFD5] dark:border-[#26362D] hover:border-[#1C3A2B]/40"
      }`}
    >
      {post.image_url && (
        <div className="w-full h-44 bg-[#FAF8F5] dark:bg-[#111A14] overflow-hidden border-b border-[#E5DFD5] dark:border-[#26362D]">
          <img
            src={post.image_url}
            alt=""
            className="w-full h-full object-cover"
            onError={e => { e.currentTarget.parentElement.style.display = "none"; }}
          />
        </div>
      )}

      <div className="p-5">
        {/* Badges Row */}
        <div className="flex items-center gap-2 flex-wrap mb-2.5">
          {post.pinned && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 bg-[#EDF3EE] dark:bg-[#1E2E25] text-[#1C3A2B] dark:text-[#8FD4AE] border border-[#D9E2DC] dark:border-[#2B4032] rounded-md text-[10px] font-bold uppercase tracking-wide">
              <Pin size={10} /> Pinned Notice
            </span>
          )}
          {post.tags?.map(tag => (
            <span
              key={tag}
              className={`px-2.5 py-0.5 border rounded-md text-[10px] font-medium ${
                TAG_COLORS[tag] || TAG_COLORS.Other
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="font-serif-lib text-base font-bold text-[#1C3A2B] dark:text-[#FAF8F5] leading-snug">
          {post.title}
        </h3>

        <p className={`text-xs text-[#5D645E] dark:text-[#9FB1A6] mt-2 leading-relaxed ${!expanded ? "line-clamp-3" : ""}`}>
          {post.body}
        </p>

        {post.body?.length > 160 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-xs font-semibold text-[#1C3A2B] dark:text-[#8FD4AE] hover:underline mt-1.5 transition cursor-pointer"
          >
            {expanded ? "Show less" : "Read full notice →"}
          </button>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#EFEBE4] dark:border-[#26362D] text-[11px] text-[#7F8781] dark:text-[#8CA093]">
          <span>
            Posted by <strong className="text-[#1C1E1B] dark:text-white">{post.posted_by || "Administration"}</strong>
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
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093]">
            Official Announcements
          </span>
          <h2 className="font-serif-lib text-2xl font-bold text-[#1C3A2B] dark:text-[#FAF8F5] mt-0.5">
            Library Notices &amp; Updates
          </h2>
          <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] mt-1">Official circulars, holiday schedules, and event announcements.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] text-[#5D645E] dark:text-[#9FB1A6] hover:text-[#1C3A2B] hover:bg-[#FAF8F5] dark:hover:bg-[#1E2E25] transition disabled:opacity-50 self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Refresh Notices</span>
        </button>
      </div>

      {/* Loading */}
      {loading && posts.length === 0 && (
        <div className="flex items-center justify-center gap-2.5 text-[#6D8374] dark:text-[#8CA093] py-16 bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl shadow-xs">
          <Loader2 size={18} className="animate-spin text-[#1C3A2B] dark:text-[#8FD4AE]" />
          <span className="text-xs font-medium">Loading circulars…</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-[#A83232] dark:text-[#FCA5A5] bg-[#FAF0F0] dark:bg-[#3D1A1A] border border-[#F0D5D5] dark:border-[#5C2A2A] px-4 py-3 rounded-2xl text-xs font-medium">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && posts.length === 0 && (
        <div className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl flex flex-col items-center justify-center py-16 px-6 gap-2 text-center shadow-xs">
          <Newspaper size={32} className="text-[#A2AAA3]" />
          <p className="font-serif-lib text-base font-bold text-[#1C3A2B] dark:text-[#FAF8F5]">No circulars posted yet</p>
          <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6]">Check back soon for announcements and scheduling updates.</p>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {posts.map(post => (
          <UpdateCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}

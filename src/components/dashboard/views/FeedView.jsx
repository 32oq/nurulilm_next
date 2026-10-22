'use client';

import { useState, useEffect } from "react";
import moment from "moment";
import { Rss, Pin, ArrowRight, Search, X, Loader2, AlertTriangle, Tag, Calendar, User } from "lucide-react";
import { useOther } from "../../../context/OtherContext";

const TAG_OPTIONS = ["Announcement", "Holiday", "Event", "Result", "Exam", "Schedule", "Other"];

export default function FeedView() {
  const { fetchLibraryNews } = useOther();

  const [posts,        setPosts]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [activeTag,    setActiveTag]    = useState('');

  useEffect(() => {
    fetchLibraryNews()
      .then(data => setPosts(data || []))
      .catch(() => setError("Unable to load announcements from the library desk."))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const q = searchQuery.trim().toLowerCase();
  const filtered = posts.filter(p => {
    const matchTag    = !activeTag || p.tags?.includes(activeTag);
    const matchSearch = !q || p.title?.toLowerCase().includes(q) || p.body?.toLowerCase().includes(q);
    return matchTag && matchSearch;
  });

  const pinned  = filtered.filter(p => p.pinned);
  const regular = filtered.filter(p => !p.pinned);

  /* ── Detail view ── */
  if (selectedPost) {
    return (
      <div className="w-full max-w-3xl space-y-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 md:p-8 shadow-xs">
        <button onClick={() => setSelectedPost(null)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#004B87] dark:hover:text-white transition group cursor-pointer">
          <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" /> Back to Notice Board
        </button>

        {selectedPost.image_url && (
          <div className="w-full rounded-lg overflow-hidden aspect-video bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <img src={selectedPost.image_url} alt={selectedPost.title} className="w-full h-full object-cover"
              onError={e => { e.currentTarget.parentElement.style.display = 'none'; }} />
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {selectedPost.pinned && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded text-xs font-semibold">
              <Pin size={11} /> Pinned Notice
            </span>
          )}
          {selectedPost.tags?.map(tag => (
            <span key={tag} className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium">{tag}</span>
          ))}
        </div>

        <div className="space-y-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><User size={12} /> Issued by: <strong className="text-slate-900 dark:text-white font-medium">{selectedPost.posted_by || "Administration"}</strong></span>
            <span>·</span>
            <span className="flex items-center gap-1"><Calendar size={12} /> {moment(selectedPost.cr_dt).format('DD MMMM YYYY [·] HH:mm')}</span>
          </div>
          <h1 className="text-2xl font-serif-lib font-bold text-slate-900 dark:text-white leading-tight pt-1">{selectedPost.title}</h1>
        </div>

        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line font-sans">{selectedPost.body}</p>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button onClick={() => setSelectedPost(null)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-900 dark:text-white rounded-lg transition cursor-pointer">
            Close Notice
          </button>
        </div>
      </div>
    );
  }

  /* ── Feed view ── */
  return (
    <div className="space-y-6 w-full max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-serif-lib font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Rss size={22} className="text-[#004B87]" /> Library Bulletins
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Official notifications, holiday advisories, and study hall updates.</p>
      </div>

      {!loading && posts.length > 0 && (
        <div className="space-y-3">
          <div className="relative max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search circulars and notices…"
              className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-9 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 shadow-xs focus:border-[#004B87] focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button
              onClick={() => setActiveTag('')}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition border shadow-xs flex-shrink-0 cursor-pointer ${
                !activeTag
                  ? 'bg-[#004B87] border-[#004B87] text-white'
                  : 'bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 hover:text-slate-900'
              }`}>
              All Categories
            </button>
            {TAG_OPTIONS.map(tag => (
              <button key={tag}
                onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition border shadow-xs flex-shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeTag === tag
                    ? 'bg-[#004B87] border-[#004B87] text-white'
                    : 'bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 hover:text-slate-900'
                }`}>
                <Tag size={10} /> {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-slate-500 py-12 justify-center">
          <Loader2 size={18} className="animate-spin text-[#004B87]" />
          <span className="text-xs">Loading notices…</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-3 rounded-xl text-xs">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-[#111827] text-center p-6">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
            <Rss size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">No announcements posted yet</p>
            <p className="text-xs text-slate-500 mt-0.5">Check back soon for notifications from the library desk.</p>
          </div>
        </div>
      )}

      {!loading && filtered.length === 0 && posts.length > 0 && (
        <div className="flex flex-col items-center justify-center py-14 gap-2 text-center">
          <Search size={26} className="text-slate-400" />
          <p className="text-xs text-slate-500">No announcements match your search criteria</p>
          <button onClick={() => { setSearchQuery(''); setActiveTag(''); }} className="text-xs font-semibold text-[#004B87] hover:underline cursor-pointer">Clear filters</button>
        </div>
      )}

      {pinned.length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Pin size={11} /> Pinned Notices
          </p>
          <div className="space-y-2.5">
            {pinned.map(post => <PostCard key={post._id} post={post} onSelect={setSelectedPost} />)}
          </div>
        </div>
      )}

      {regular.length > 0 && (
        <div className="space-y-3">
          {pinned.length > 0 && (
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recent Notices</p>
          )}
          <div className="space-y-2.5">
            {regular.map(post => <PostCard key={post._id} post={post} onSelect={setSelectedPost} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, onSelect }) {
  return (
    <button
      onClick={() => onSelect(post)}
      className="group w-full text-left bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-xs transition duration-150 cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        {post.image_url ? (
          <div className="w-full sm:w-28 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <img src={post.image_url} alt="" className="w-full h-full object-cover"
              onError={e => { e.currentTarget.parentElement.style.display = 'none'; }} />
          </div>
        ) : (
          <div className="w-full sm:w-28 h-20 rounded-lg flex-shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
            <Rss size={22} />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {post.pinned && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded text-[10px] font-bold uppercase tracking-wide">
                <Pin size={9} /> Pinned
              </span>
            )}
            {post.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-medium">{tag}</span>
            ))}
            <span className="text-[11px] text-slate-400 ml-auto flex-shrink-0">{moment(post.cr_dt).fromNow()}</span>
          </div>
          <h3 className="font-serif-lib font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#004B87] transition-colors line-clamp-1">{post.title}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">{post.body}</p>
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
            <span>Issued by {post.posted_by || "Administration"}</span>
            <span className="text-[#004B87] dark:text-blue-400 font-semibold flex items-center gap-1 group-hover:underline">Read notice <ArrowRight size={11} /></span>
          </div>
        </div>
      </div>
    </button>
  );
}

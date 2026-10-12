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
      <div className="w-full max-w-3xl space-y-6 bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl p-6 md:p-8 shadow-xs">
        <button onClick={() => setSelectedPost(null)}
          className="flex items-center gap-2 text-xs font-semibold text-[#5D645E] dark:text-[#9FB1A6] hover:text-[#1C3A2B] dark:hover:text-[#8FD4AE] transition group cursor-pointer">
          <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" /> Back to Notice Board
        </button>

        {selectedPost.image_url && (
          <div className="w-full rounded-2xl overflow-hidden aspect-video bg-[#FAF8F5] dark:bg-[#111A14] border border-[#E5DFD5] dark:border-[#26362D]">
            <img src={selectedPost.image_url} alt={selectedPost.title} className="w-full h-full object-cover"
              onError={e => { e.currentTarget.parentElement.style.display = 'none'; }} />
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {selectedPost.pinned && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 bg-[#FFFBEB] dark:bg-[#382B14] text-[#92400E] dark:text-[#FDE68A] border border-[#FDE68A] dark:border-[#574019] rounded-lg text-xs font-semibold">
              <Pin size={11} /> Pinned Notice
            </span>
          )}
          {selectedPost.tags?.map(tag => (
            <span key={tag} className="px-2.5 py-0.5 bg-[#F4EFE6] dark:bg-[#203126] text-[#2D312E] dark:text-[#8FD4AE] border border-[#E5DFD5] dark:border-[#2B4032] rounded-lg text-xs font-medium">{tag}</span>
          ))}
        </div>

        <div className="space-y-1.5 pb-2 border-b border-[#F4EFE6] dark:border-[#26362D]">
          <div className="flex items-center gap-3 text-xs text-[#5D645E] dark:text-[#9FB1A6]">
            <span className="flex items-center gap-1"><User size={12} /> Issued by: <strong className="text-[#1C1E1B] dark:text-white font-medium">{selectedPost.posted_by || "Administration"}</strong></span>
            <span>·</span>
            <span className="flex items-center gap-1"><Calendar size={12} /> {moment(selectedPost.cr_dt).format('DD MMMM YYYY [·] HH:mm')}</span>
          </div>
          <h1 className="text-2xl font-serif-lib font-bold text-[#1C1E1B] dark:text-white leading-tight pt-1">{selectedPost.title}</h1>
        </div>

        <p className="text-[#2D312E] dark:text-[#E2ECE5] text-sm leading-relaxed whitespace-pre-line font-sans">{selectedPost.body}</p>

        <div className="pt-4 border-t border-[#E5DFD5] dark:border-[#26362D] flex items-center justify-between">
          <button onClick={() => setSelectedPost(null)}
            className="px-4 py-2 bg-[#FAF8F5] dark:bg-[#203126] border border-[#E5DFD5] dark:border-[#2B4032] hover:bg-[#F4EFE6] text-xs font-semibold text-[#1C1E1B] dark:text-white rounded-xl transition cursor-pointer">
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
      <div className="pb-4 border-b border-[#E5DFD5] dark:border-[#26362D]">
        <h2 className="text-xl font-serif-lib font-bold text-[#1C1E1B] dark:text-white flex items-center gap-2.5">
          <Rss size={22} className="text-[#1C3A2B] dark:text-[#8FD4AE]" /> Library Bulletins &amp; Circulars
        </h2>
        <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] mt-1">Official notifications, holiday advisories, and study hall updates from the library desk.</p>
      </div>

      {!loading && posts.length > 0 && (
        <div className="space-y-3">
          <div className="relative max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A948D]" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search circulars and notices…"
              className="w-full bg-white dark:bg-[#16211B] border border-[#D9D2C5] dark:border-[#26362D] rounded-xl pl-9 pr-9 py-2 text-xs text-[#1C1E1B] dark:text-white placeholder-[#9CA3AF] shadow-xs"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A948D] hover:text-[#1C1E1B] dark:hover:text-white transition cursor-pointer">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button
              onClick={() => setActiveTag('')}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition border shadow-xs flex-shrink-0 cursor-pointer ${
                !activeTag
                  ? 'bg-[#1C3A2B] border-[#1C3A2B] text-white dark:bg-[#2A4D3B]'
                  : 'bg-white dark:bg-[#16211B] border-[#E5DFD5] dark:border-[#26362D] text-[#5D645E] dark:text-[#9FB1A6] hover:border-[#1C3A2B]/40 hover:text-[#1C1E1B]'
              }`}>
              All Categories
            </button>
            {TAG_OPTIONS.map(tag => (
              <button key={tag}
                onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition border shadow-xs flex-shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeTag === tag
                    ? 'bg-[#1C3A2B] border-[#1C3A2B] text-white dark:bg-[#2A4D3B]'
                    : 'bg-white dark:bg-[#16211B] border-[#E5DFD5] dark:border-[#26362D] text-[#5D645E] dark:text-[#9FB1A6] hover:border-[#1C3A2B]/40 hover:text-[#1C1E1B]'
                }`}>
                <Tag size={10} /> {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-[#5D645E] dark:text-[#9FB1A6] py-12 justify-center">
          <Loader2 size={18} className="animate-spin text-[#1C3A2B] dark:text-[#8FD4AE]" />
          <span className="text-xs">Loading notices…</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-3 rounded-2xl text-xs">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed border-[#D9D2C5] dark:border-[#26362D] rounded-2xl bg-white dark:bg-[#16211B] text-center p-6">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] dark:bg-[#203126] border border-[#E5DFD5] dark:border-[#2B4032] flex items-center justify-center text-[#6D8374] dark:text-[#8FD4AE]">
            <Rss size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1C1E1B] dark:text-white">No announcements posted yet</p>
            <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] mt-0.5">Check back soon for notifications from the library desk.</p>
          </div>
        </div>
      )}

      {!loading && filtered.length === 0 && posts.length > 0 && (
        <div className="flex flex-col items-center justify-center py-14 gap-2 text-center">
          <Search size={26} className="text-[#8A948D]" />
          <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6]">No announcements match your search criteria</p>
          <button onClick={() => { setSearchQuery(''); setActiveTag(''); }} className="text-xs font-semibold text-[#1C3A2B] dark:text-[#8FD4AE] hover:underline cursor-pointer">Clear filters</button>
        </div>
      )}

      {pinned.length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-[#92400E] dark:text-[#FDE68A] uppercase tracking-wider flex items-center gap-1.5">
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
            <p className="text-[11px] font-bold text-[#5D645E] dark:text-[#8CA093] uppercase tracking-wider">Recent Notices</p>
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
      className="group w-full text-left bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl overflow-hidden hover:border-[#1C3A2B] hover:shadow-xs transition duration-200 cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        {post.image_url ? (
          <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#FAF8F5] dark:bg-[#111A14] border border-[#E5DFD5] dark:border-[#26362D]">
            <img src={post.image_url} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              onError={e => { e.currentTarget.parentElement.style.display = 'none'; }} />
          </div>
        ) : (
          <div className="w-full sm:w-28 h-20 rounded-xl flex-shrink-0 bg-[#FAF8F5] dark:bg-[#203126] border border-[#E5DFD5] dark:border-[#2B4032] flex items-center justify-center text-[#6D8374] dark:text-[#8FD4AE]">
            <Rss size={22} />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {post.pinned && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[#FFFBEB] dark:bg-[#382B14] text-[#92400E] dark:text-[#FDE68A] border border-[#FDE68A] dark:border-[#574019] rounded-md text-[10px] font-bold uppercase tracking-wide">
                <Pin size={9} /> Pinned
              </span>
            )}
            {post.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-[#F4EFE6] dark:bg-[#203126] text-[#2D312E] dark:text-[#8FD4AE] border border-[#E5DFD5] dark:border-[#2B4032] rounded-md text-[10px] font-medium">{tag}</span>
            ))}
            <span className="text-[11px] text-[#5D645E] dark:text-[#9FB1A6] ml-auto flex-shrink-0">{moment(post.cr_dt).fromNow()}</span>
          </div>
          <h3 className="font-serif-lib font-bold text-sm text-[#1C1E1B] dark:text-white group-hover:text-[#1C3A2B] dark:group-hover:text-[#8FD4AE] transition-colors line-clamp-1">{post.title}</h3>
          <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] leading-relaxed line-clamp-2">{post.body}</p>
          <div className="flex items-center justify-between pt-1 text-[11px] text-[#8A948D]">
            <span>Issued by {post.posted_by || "Administration"}</span>
            <span className="text-[#1C3A2B] dark:text-[#8FD4AE] font-semibold flex items-center gap-1 group-hover:underline">Read notice <ArrowRight size={11} /></span>
          </div>
        </div>
      </div>
    </button>
  );
}

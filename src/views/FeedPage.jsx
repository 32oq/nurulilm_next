'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOther } from '../context/OtherContext';
import PostCard from '../components/PostCard';
import { ShieldCheck, ShieldAlert, CreditCard, BookOpen, BookMarked, Settings, ArrowRight, Loader2, RefreshCw, Bell } from 'lucide-react';
import { getErrorMessage } from '../utils/errors';
import { formatPatronName, formatPatronInitials } from '../utils/formatters';

const FeedPage = ({ setPage }) => {
  const { state: { user, isAuthenticated } } = useAuth();
  const { fetchLibraryNews } = useOther();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLibraryNews();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to retrieve notices.'));
    } finally {
      setLoading(false);
    }
  }, [fetchLibraryNews]);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  if (!isAuthenticated || !user) return null;

  const initials = formatPatronInitials(user);
  const displayName = formatPatronName(user);
  const isVerified = user?.verified === 1;

  const quickLinks = [
    { label: 'My Borrowed Books', Icon: BookMarked, view: 'loans' },
    { label: 'Library Catalog',    Icon: BookOpen,   view: 'resources' },
    { label: 'Membership Dues',   Icon: CreditCard, view: 'payments' },
    { label: 'Account Settings',  Icon: Settings,   view: 'Settings' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-24 sm:pb-12 bg-[#F6F8FB] dark:bg-[#0B0F19] transition-colors">
      <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">

        {/* ── Feed Column ── */}
        <div className="w-full lg:max-w-[560px] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-2">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#004B87] dark:text-blue-400">Community Desk</span>
              <h1 className="font-serif-lib text-xl font-bold text-slate-900 dark:text-white">Library Bulletin &amp; Notices</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">{posts.length} notices</span>
              <button
                onClick={loadNotices}
                disabled={loading}
                title="Refresh notices"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#111827] space-y-2">
              <Loader2 size={24} className="animate-spin mx-auto text-[#004B87] dark:text-blue-400" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Fetching library notices…</p>
            </div>
          ) : error ? (
            <div className="p-6 border border-rose-200 dark:border-rose-900/60 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-center space-y-2">
              <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
              <button
                onClick={loadNotices}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-[#111827] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#004B87] dark:text-blue-400 flex items-center justify-center mx-auto">
                <Bell size={18} />
              </div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">No Announcements Posted Yet</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Official notices, reading schedule alerts, and administrative updates will appear here once published.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => <PostCard key={post._id || post.id} post={post} />)}
            </div>
          )}
        </div>

        {/* ── Sidebar: Member Overview ── */}
        <aside className="w-full lg:w-[280px] flex-shrink-0 space-y-4">

          {/* Member Profile Plaque */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#004B87] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0 select-none shadow-xs">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{displayName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.act || 'Active Member'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border
                ${isVerified
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'}`}>
                {isVerified ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                {isVerified ? 'Identity Confirmed' : 'Verification Pending'}
              </span>
            </div>

            <button
              onClick={() => setPage('dashboard')}
              className="w-full py-2.5 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Open Study Desk</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Quick Access Menu */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              Quick Shortcuts
            </p>
            <div className="space-y-1">
              {quickLinks.map(({ label, Icon, view }) => (
                <button
                  key={view}
                  onClick={() => setPage('dashboard')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition text-left cursor-pointer"
                >
                  <Icon size={15} className="text-[#004B87] dark:text-blue-400" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 text-center">
            <p className="text-[11px] text-slate-500">
              Nurul Ilm Library  • Handwara, Kashmir
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default FeedPage;

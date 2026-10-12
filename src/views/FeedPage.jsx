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
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-24 sm:pb-12 bg-[#FCFCFB] dark:bg-[#0E1411] transition-colors">
      <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">

        {/* ── Feed Column ── */}
        <div className="w-full lg:max-w-[560px] space-y-4">
          <div className="flex items-center justify-between border-b border-[#DFE6DC] dark:border-[#26362D] pb-3 mb-2">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#33462C] dark:text-[#88B89C]">Community Desk</span>
              <h1 className="font-serif-lib text-xl font-bold text-[#24341E] dark:text-[#8FD4AE]">Library Bulletin &amp; Notices</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#7F8781] font-medium">{posts.length} notices</span>
              <button
                onClick={loadNotices}
                disabled={loading}
                title="Refresh notices"
                className="p-1.5 rounded-lg border border-[#DFE6DC] dark:border-[#26362D] text-[#33462C] dark:text-[#8FD4AE] hover:bg-[#F2F5F0] dark:hover:bg-[#1A2820] transition disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center border border-[#E5DFD5] dark:border-[#22352B] rounded-xl bg-white dark:bg-[#131E18] space-y-2">
              <Loader2 size={24} className="animate-spin mx-auto text-[#33462C] dark:text-[#8FD4AE]" />
              <p className="text-xs text-[#7F8781] dark:text-[#889C90]">Fetching library notices…</p>
            </div>
          ) : error ? (
            <div className="p-6 border border-[#FCA5A5] dark:border-[#7F1D1D] rounded-xl bg-[#FEF2F2] dark:bg-[#2A1212] text-center space-y-2">
              <p className="text-xs text-[#991B1B] dark:text-[#F87171]">{error}</p>
              <button
                onClick={loadNotices}
                className="px-3 py-1.5 rounded-lg bg-[#991B1B] text-white text-xs font-medium hover:bg-[#7F1D1D] transition"
              >
                Retry
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[#DFE6DC] dark:border-[#26362D] rounded-xl bg-white dark:bg-[#131E18] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#F2F5F0] dark:bg-[#1E2E25] text-[#33462C] dark:text-[#8FD4AE] flex items-center justify-center mx-auto">
                <Bell size={18} />
              </div>
              <h3 className="text-xs font-semibold text-[#1C1E1B] dark:text-[#E8F0EB]">No Announcements Posted Yet</h3>
              <p className="text-[11px] text-[#7F8781] dark:text-[#889C90] max-w-xs mx-auto">
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
          <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#33462C] dark:bg-[#346F4F] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0 select-none shadow-sm">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[#24341E] dark:text-white truncate">{displayName}</p>
                <p className="text-xs text-[#33462C] dark:text-[#88B89C] capitalize">{user?.act || 'Active Member'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-[#DFE6DC] dark:border-[#26362D]">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border
                ${isVerified
                  ? 'bg-[#EFF4EC] dark:bg-[#1E2E25] text-[#24341E] dark:text-[#8FD4AE] border-[#DFE6DC] dark:border-[#2C4133]'
                  : 'bg-[#FFFBEB] dark:bg-[#2C2411] text-[#92400E] dark:text-[#FBBF24] border-[#FDE68A] dark:border-[#523B12]'}`}>
                {isVerified ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                {isVerified ? 'Identity Confirmed' : 'Verification Pending'}
              </span>
            </div>

            <button
              onClick={() => setPage('dashboard')}
              className="w-full py-2.5 rounded-xl bg-[#33462C] hover:bg-[#24341E] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white text-xs font-semibold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Open Study Desk</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Quick Access Menu */}
          <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] font-semibold text-[#33462C] dark:text-[#88B89C] uppercase tracking-wider mb-2.5">
              Quick Shortcuts
            </p>
            <div className="space-y-1">
              {quickLinks.map(({ label, Icon, view }) => (
                <button
                  key={view}
                  onClick={() => setPage('dashboard')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#0B0E0A] dark:text-[#D5E1D9] hover:bg-[#EFF4EC] dark:hover:bg-[#1E2E25] hover:text-[#24341E] dark:hover:text-[#8FD4AE] transition text-left cursor-pointer"
                >
                  <Icon size={15} className="text-[#33462C] dark:text-[#8FD4AE]" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 text-center">
            <p className="text-[11px] text-[#7F8781]">
              Nurul Ilm Library • Handwara, Kashmir
            </p>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default FeedPage;

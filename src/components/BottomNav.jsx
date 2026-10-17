'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Rss, LayoutDashboard, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROUTE_MAP = {
  feed: '/feed',
  dashboard: '/dashboard',
  daily_puzzle: '/daily-puzzle',
};

const BottomNav = ({ currentPage, setPage }) => {
  const { state: { isAuthenticated }, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '/';

  if (!isAuthenticated) return null;

  const getActiveKey = () => {
    if (currentPage) return currentPage;
    if (pathname.startsWith('/feed')) return 'feed';
    if (pathname.startsWith('/dashboard')) return 'dashboard';
    if (pathname.startsWith('/daily-puzzle')) return 'daily_puzzle';
    return '';
  };

  const activeKey = getActiveKey();

  const handleNav = (target) => {
    if (setPage) setPage(target);
    const route = ROUTE_MAP[target] || (target.startsWith('/') ? target : `/${target}`);
    router.push(route);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const Item = ({ page, label, Icon }) => {
    const isActive = activeKey === page;
    return (
      <button
        onClick={() => handleNav(page)}
        className={`flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors flex-1 py-2 cursor-pointer
          ${isActive ? 'text-[#004B87] dark:text-blue-400 font-semibold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
      >
        <div className={`p-1 rounded-md transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-950/50' : ''}`}>
          <Icon size={18} strokeWidth={isActive ? 2.2 : 1.7} />
        </div>
        <span className="text-[11px] leading-tight">{label}</span>
      </button>
    );
  };

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800 shadow-md">
      <div className="flex items-stretch h-14 max-w-md mx-auto">
        <Item page="feed" label="Feed" Icon={Rss} />
        <Item page="daily_puzzle" label="Logic" Icon={Sparkles} />
        <Item page="dashboard" label="Desk" Icon={LayoutDashboard} />
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors flex-1 py-2 cursor-pointer"
        >
          <div className="p-1 rounded-md">
            <LogOut size={18} strokeWidth={1.7} />
          </div>
          <span className="text-[11px] leading-tight">Sign Out</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;

"use client";

import { Rss, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const BottomNav = ({ currentPage, setPage }) => {
  const { state: { isAuthenticated }, logout } = useAuth();

  if (!isAuthenticated) return null;

  const Item = ({ page, label, Icon }) => {
    const isActive = currentPage === page;
    return (
      <button
        onClick={() => setPage && setPage(page)}
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
        <Item page="dashboard" label="Desk" Icon={LayoutDashboard} />
        <button
          onClick={logout}
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

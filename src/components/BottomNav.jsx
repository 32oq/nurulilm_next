"use client";

import { Rss, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const BottomNav = ({ currentPage, setPage }) => {
  const { state: { isAuthenticated, user }, logout } = useAuth();

  if (!isAuthenticated) return null;

  const Item = ({ page, label, Icon }) => {
    const isActive = currentPage === page;
    return (
      <button
        onClick={() => setPage && setPage(page)}
        className={`flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all flex-1 py-2 cursor-pointer
          ${isActive ? 'text-[#1C3A2B] dark:text-[#8FD4AE]' : 'text-[#5D6B62] dark:text-[#9FB1A6] hover:text-[#1C2E24]'}`}
      >
        <div className={`p-1 rounded-md transition-colors ${isActive ? 'bg-[#EDF3EE] dark:bg-[#1A2E23]' : ''}`}>
          <Icon size={20} strokeWidth={isActive ? 2.2 : 1.7} />
        </div>
        <span className={`text-[11px] leading-tight ${isActive ? 'font-semibold text-[#1C3A2B] dark:text-[#8FD4AE]' : ''}`}>{label}</span>
      </button>
    );
  };

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#131E18]/95 backdrop-blur-md border-t border-[#DFE6DC] dark:border-[#22352B] shadow-lg">
      <div className="flex items-stretch h-16 max-w-md mx-auto">
        <Item page="feed" label="Feed" Icon={Rss} />
        <Item page="dashboard" label="Desk" Icon={LayoutDashboard} />
        <button
          onClick={logout}
          className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-[#5D6B62] dark:text-[#9FB1A6] hover:text-[#B91C1C] transition-all flex-1 py-2 cursor-pointer"
        >
          <div className="p-1 rounded-md">
            <LogOut size={20} strokeWidth={1.7} />
          </div>
          <span className="text-[11px] leading-tight">Sign Out</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;

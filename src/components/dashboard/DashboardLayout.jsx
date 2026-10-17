"use client";

import { useState, useEffect } from "react";
import { Menu, CreditCard, Users, LogOut } from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardContent from "./DashboardContent";
import ThemeToggle from "../ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { useOther } from "../../context/OtherContext";

const VIEW_TITLES = {
  overview: "Study Desk Overview",
  payments: "Membership Dues and Receipts",
  resources: "Library Book Catalog",
  Settings: "Account and Verification",
  news: "Daily News and Current Affairs",
  library_updates: "Library Announcements and Notices",
  focus_sprint: "Quiet Study Focus Sprint",
  focus_sprint_admin: "Quiet Study Focus Sprint",
  scholar_path: "Scholar Path Daily Logic Puzzle",
  payments_admin: "Pending Fee Submissions",
  packages_admin: "Membership Packages and Offers",
  community_notes_admin: "Community Bulletin Notes Audit",
  overview_admin: "Administration Overview",
  resources_admin: "Catalog Management",
  loans: "My Borrowed Books",
  loans_admin: "Book Circulation and Loans",
  Settings_admin: "Administrator Settings",
  users_admin: "Student Registry",
  news_admin: "Library Noticeboard",
};

export default function DashboardLayout({ navTo, type }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState(navTo || (type === "admin" ? "overview_admin" : "overview"));
  const { state: { user }, logout } = useAuth();
  const { state: { pendingCounts }, fetchPendingCounts } = useOther();

  useEffect(() => {
    if (type === "admin" && fetchPendingCounts) {
      fetchPendingCounts();
    }
  }, [type, fetchPendingCounts]);

  return (
    <div className="w-full h-screen overflow-hidden bg-[#F6F8FB] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex relative">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <DashboardSidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        view={view}
        setView={setView}
        type={type}
        user={user}
        logout={logout}
        pendingCounts={pendingCounts}
      />

      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Top Header Bar - Solid Institutional Navbar without glassmorphism */}
        <header className="flex-shrink-0 z-30 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 h-16 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={18} />
            </button>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                {type === "admin" ? "Library Administration Console" : "Member Study Desk"}
              </span>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">
                {VIEW_TITLES[view] || "Dashboard"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {type === "admin" && pendingCounts?.pendingPayments > 0 && (
              <button
                onClick={() => setView("payments_admin")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition shadow-2xs cursor-pointer"
                title="Review pending payments"
              >
                <CreditCard size={13} className="text-amber-600" />
                <span>{pendingCounts.pendingPayments} Pending Payment{pendingCounts.pendingPayments > 1 ? 's' : ''}</span>
              </button>
            )}
            {type === "admin" && pendingCounts?.pendingUsers > 0 && (
              <button
                onClick={() => setView("users_admin")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-[#004B87] dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition shadow-2xs cursor-pointer"
                title="Review pending user approvals"
              >
                <Users size={13} className="text-[#004B87] dark:text-blue-400" />
                <span>{pendingCounts.pendingUsers} Pending User{pendingCounts.pendingUsers > 1 ? 's' : ''}</span>
              </button>
            )}
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              Handwara Branch
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" title="System Online" />
            <ThemeToggle className="ml-1" />
            <button
              onClick={logout}
              className="flex items-center gap-1.5 p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 sm:border-transparent transition cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={16} />
              <span className="text-xs font-medium hidden lg:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content View */}
        <main
          className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 sm:p-8 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <DashboardContent view={view} setView={setView} />
        </main>
      </div>
    </div>
  );
}

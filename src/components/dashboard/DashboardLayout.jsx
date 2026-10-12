"use client";

import { useState, useEffect } from "react";
import { Menu, CreditCard, Users } from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardContent from "./DashboardContent";
import ThemeToggle from "../ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { useOther } from "../../context/OtherContext";

const VIEW_TITLES = {
  overview: "Study Desk Overview",
  payments: "Membership Dues & Receipts",
  resources: "Library Book Catalog",
  Settings: "Account & Verification",
  news: "Daily News & Current Affairs",
  library_updates: "Library Announcements & Notices",
  focus_sprint: "Quiet Study Focus Sprint",
  focus_sprint_admin: "Quiet Study Focus Sprint",
  payments_admin: "Pending Fee Submissions",
  packages_admin: "Membership Packages & Offers",
  community_notes_admin: "Community Bulletin Notes Audit",
  overview_admin: "Administration Overview",
  resources_admin: "Catalog Management",
  loans: "My Borrowed Books",
  loans_admin: "Book Circulation & Loans",
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
    <div className="w-full h-screen overflow-hidden bg-[#FAF8F5] dark:bg-[#0C1410] text-[#1C1E1B] dark:text-[#E8F0EB] flex relative">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#1C1E1B]/50 z-40 md:hidden backdrop-blur-xs"
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
        {/* Top Header Bar */}
        <header className="flex-shrink-0 z-30 bg-white/95 dark:bg-[#131E18]/95 backdrop-blur-md border-b border-[#E5DFD5] dark:border-[#22352B] px-4 sm:px-8 h-16 flex items-center justify-between gap-3 shadow-[0_1px_2px_rgba(28,30,27,0.03)]">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg bg-[#FAF8F5] dark:bg-[#1A2620] border border-[#E5DFD5] dark:border-[#263D30] text-[#3C423D] dark:text-[#CAD6CF] hover:bg-[#EDF3EE] transition cursor-pointer"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar navigation"
            >
              <Menu size={18} />
            </button>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#88B89C] block">
                {type === "admin" ? "Library Management Console" : "Member Study Workstation"}
              </span>
              <h1 className="font-serif-lib text-base sm:text-lg font-bold text-[#1C2E24] dark:text-[#8FD4AE] leading-none">
                {VIEW_TITLES[view] || "Dashboard"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {type === "admin" && pendingCounts?.pendingPayments > 0 && (
              <button
                onClick={() => setView("payments_admin")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#FFFBEB] dark:bg-[#35260C] text-[#92400E] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#5C4312] hover:bg-[#FEF3C7] transition shadow-xs cursor-pointer"
                title="Review pending payments"
              >
                <CreditCard size={13} className="text-[#D97706]" />
                <span>{pendingCounts.pendingPayments} Pending Payment{pendingCounts.pendingPayments > 1 ? 's' : ''}</span>
              </button>
            )}
            {type === "admin" && pendingCounts?.pendingUsers > 0 && (
              <button
                onClick={() => setView("users_admin")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#EFF6FF] dark:bg-[#11243B] text-[#1E40AF] dark:text-[#93C5FD] border border-[#BFDBFE] dark:border-[#1E3A5F] hover:bg-[#DBEAFE] transition shadow-xs cursor-pointer"
                title="Review pending user approvals"
              >
                <Users size={13} className="text-[#2563EB] dark:text-[#60A5FA]" />
                <span>{pendingCounts.pendingUsers} Pending User{pendingCounts.pendingUsers > 1 ? 's' : ''}</span>
              </button>
            )}
            <span className="text-xs text-[#6F7770] dark:text-[#889C90] hidden sm:inline">
              Handwara Branch
            </span>
            <span className="w-2 h-2 rounded-full bg-[#347648]" title="System Online" />
            <ThemeToggle className="ml-1" />
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

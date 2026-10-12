"use client";

import { Home, CreditCard, BookOpen, Settings, LogOut, BookMarked, Users, Newspaper, Bell, Layers, Pin, Timer, MapPin } from "lucide-react";
import ThemeToggle from "../ThemeToggle";

const NavItem = ({ icon: Icon, label, isActive, onClick, showDot, dotCount }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all duration-150 text-left cursor-pointer
      ${isActive
        ? "bg-[#244232] dark:bg-[#2D5E44] text-white font-semibold shadow-xs"
        : "text-[#B9C4BC] hover:bg-[#1A2E23] hover:text-white"
      }
    `}
  >
    <div className="relative flex-shrink-0">
      <Icon size={17} strokeWidth={isActive ? 2.2 : 1.7} />
      {showDot && (
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-[#D97706] text-white text-[9px] font-bold">
          {dotCount}
        </span>
      )}
    </div>
    <span className="text-xs whitespace-nowrap">{label}</span>
  </button>
);

export default function DashboardSidebar({ view, setView, open, setOpen, type, user, logout, pendingCounts }) {
  const verificationPending = !user?.verified;
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'M';
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Library Member';

  const nav = (base) => {
    setView(base + (type ? '_' + type : ''));
    if (setOpen) setOpen(false);
  };

  return (
    <aside
      className={`
        flex-shrink-0 flex flex-col
        bg-[#13221A] text-white border-r border-[#1C3A2B]
        fixed md:static top-0 z-50 md:z-auto
        h-screen
        transition-transform duration-200 ease-in-out md:transition-none
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        w-60 shadow-xl md:shadow-none
      `}
    >
      {/* Brand Crest */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[#1C3A2B] flex-shrink-0">
        <img
          src="/assets/logo.jpeg"
          alt="Library Crest"
          className="w-8 h-8 rounded-full object-cover ring-2 ring-[#244232]"
        />
        <div className="flex flex-col min-w-0">
          <span className="font-serif-lib text-sm font-bold text-white whitespace-nowrap truncate">
            Nurul Ilm Library
          </span>
          <span className="text-[10px] text-[#8EA295] tracking-wider uppercase">
            {type === 'admin' ? 'Admin Desk' : 'Patron Desk'}
          </span>
        </div>
      </div>

      {/* Member Plaque */}
      <div className="flex items-center gap-3 px-3.5 py-4 border-b border-[#1C3A2B] min-w-0 bg-[#0F1B15]">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#FAF8F5] text-[#13221A] flex items-center justify-center text-xs font-bold select-none">
          {initials}
        </div>
        <div className="min-w-0 overflow-hidden">
          <p className="text-xs font-semibold text-white truncate">{fullName}</p>
          <span className="inline-block text-[10px] text-[#A2B5A8] capitalize truncate mt-0.5">
            {user?.act || 'Patron'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto no-scrollbar">
        <NavItem
          icon={Home}
          label="Desk Overview"
          isActive={view === "overview" || view === "overview_admin"}
          onClick={() => nav("overview")}
        />
        <NavItem
          icon={Timer}
          label="Quiet Focus Sprint"
          isActive={view === "focus_sprint" || view === "focus_sprint_admin"}
          onClick={() => nav("focus_sprint")}
        />
        <NavItem
          icon={CreditCard}
          label={type === 'admin' ? "Fee Submissions" : "Membership Dues"}
          isActive={view === "payments" || view === "payments_admin"}
          showDot={type === 'admin' && Boolean(pendingCounts?.pendingPayments > 0)}
          dotCount={pendingCounts?.pendingPayments || 0}
          onClick={() => nav("payments")}
        />
        <NavItem
          icon={BookOpen}
          label="Catalog & Books"
          isActive={view === "resources" || view === "resources_admin"}
          onClick={() => nav("resources")}
        />
        <NavItem
          icon={BookMarked}
          label={type === 'admin' ? "Book Circulation" : "My Borrowed Books"}
          isActive={view === "loans" || view === "loans_admin"}
          onClick={() => nav("loans")}
        />
        {type === 'admin' && (
          <NavItem
            icon={Users}
            label="Student Registry"
            isActive={view === "users_admin"}
            showDot={Boolean(pendingCounts?.pendingUsers > 0)}
            dotCount={pendingCounts?.pendingUsers || 0}
            onClick={() => nav("users")}
          />
        )}
        {type === 'admin' && (
          <NavItem
            icon={Layers}
            label="Packages & Offers"
            isActive={view === "packages_admin"}
            onClick={() => nav("packages")}
          />
        )}
        {type === 'admin' && (
          <NavItem
            icon={Pin}
            label="Bulletin Notes Audit"
            isActive={view === "community_notes_admin"}
            showDot={Boolean(pendingCounts?.pendingNotes > 0)}
            dotCount={pendingCounts?.pendingNotes || 0}
            onClick={() => nav("community_notes")}
          />
        )}
        {type === 'admin' && (
          <NavItem
            icon={MapPin}
            label="Study Carrels & Desks"
            isActive={view === "desks_admin"}
            onClick={() => nav("desks")}
          />
        )}
        {type !== 'admin' && (
          <NavItem
            icon={Bell}
            label="Announcements"
            isActive={view === "library_updates"}
            onClick={() => { setView("library_updates"); if (setOpen) setOpen(false); }}
          />
        )}
        <NavItem
          icon={Newspaper}
          label="Daily Affairs & News"
          isActive={view === "news" || view === "news_admin"}
          onClick={() => nav("news")}
        />
        <NavItem
          icon={Settings}
          label="Settings & Aadhaar"
          isActive={view === "Settings" || view === "Settings_admin"}
          showDot={verificationPending}
          dotCount={1}
          onClick={() => nav("Settings")}
        />
      </nav>

      {/* Theme Toggle & Sign Out */}
      <div className="p-2 border-t border-[#1C3A2B] space-y-1">
        <ThemeToggle variant="sidebar" />
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-xs font-medium text-[#C2CBC4] hover:bg-[#341818] hover:text-[#FFA0A0] transition duration-150 cursor-pointer"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

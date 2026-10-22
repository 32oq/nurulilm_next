"use client";

import {
  Home, CreditCard, BookOpen, Settings, LogOut,
  BookMarked, Users, Newspaper, Bell, Layers,
  Pin, Timer, MapPin, Brain, X, Activity, Sparkles
} from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import { LibraryLogo } from "../common";

const NavItem = ({ icon: Icon, label, isActive, onClick, showDot, dotCount }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left cursor-pointer text-xs hig-spring active:scale-[0.98] transition-all
      ${isActive
        ? "bg-[#004B87] text-white font-semibold shadow-sm"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
      }
    `}
  >
    <div className="relative flex-shrink-0">
      <Icon size={16} strokeWidth={isActive ? 2.2 : 1.7} />
      {showDot && (
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-amber-500 text-slate-900 text-[9px] font-bold">
          {dotCount}
        </span>
      )}
    </div>
    <span className="whitespace-nowrap font-medium">{label}</span>
  </button>
);

export default function DashboardSidebar({ view, setView, open, setOpen, type, user, logout, pendingCounts }) {
  const verificationPending = !user?.verified;
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'P';
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Library Member';

  const nav = (base) => {
    setView(base + (type ? '_' + type : ''));
    if (setOpen) setOpen(false);
  };

  return (
    <aside
      className={`
        flex-shrink-0 flex flex-col
        bg-[#0A192F] text-white border-r border-[#1E3A5F]
        fixed md:static top-0 z-50 md:z-auto
        h-screen h-[100dvh] max-h-[100dvh]
        transition-transform duration-200 ease-in-out md:transition-none
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        w-60 shadow-xl md:shadow-none
      `}
    >
      {/* Brand Crest */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-[#1E3A5F] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white/95 flex items-center justify-center p-1 shadow-xs shrink-0 ring-1 ring-white/20">
            <LibraryLogo variant="emblem" size={24} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white whitespace-nowrap truncate tracking-tight">
              Nurul Ilm Library
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
              {type === 'admin' ? 'Administration' : 'Patron Portal'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setOpen && setOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition hig-spring cursor-pointer"
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      {/* Member Plaque */}
      <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-[#1E3A5F] min-w-0 bg-[#071322] flex-shrink-0">
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white text-[#0A192F] flex items-center justify-center text-xs font-bold select-none shadow-xs">
          {initials}
        </div>
        <div className="min-w-0 overflow-hidden">
          <p className="text-xs font-semibold text-white truncate">{fullName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-slate-400 capitalize truncate font-medium">
              {user?.act || 'Patron'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 min-h-0 p-2 space-y-0.5 overflow-y-auto no-scrollbar">
        <NavItem
          icon={Home}
          label="Desk Overview"
          isActive={view === "overview" || view === "overview_admin"}
          onClick={() => nav("overview")}
        />
        {type !== 'admin' && (
          <NavItem
            icon={Timer}
            label="Quiet Focus Sprint"
            isActive={view === "focus_sprint"}
            onClick={() => nav("focus_sprint")}
          />
        )}
        {type !== 'admin' && (
          <NavItem
            icon={Brain}
            label="Scholar Path Daily"
            isActive={view === "scholar_path"}
            onClick={() => { setView("scholar_path"); if (setOpen) setOpen(false); }}
          />
        )}
        {type === 'admin' && (
          <NavItem
            icon={Activity}
            label="Student Engagement"
            isActive={view === "engagement_admin"}
            onClick={() => nav("engagement")}
          />
        )}
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
          label="Settings & Verification"
          isActive={view === "Settings" || view === "Settings_admin"}
          showDot={verificationPending}
          dotCount={1}
          onClick={() => nav("Settings")}
        />
      </nav>

      {/* Theme Toggle & Sign Out */}
      <div className="p-2 border-t border-[#1E3A5F] space-y-1 flex-shrink-0 pb-[max(8px,env(safe-area-inset-bottom))]">
        <ThemeToggle variant="sidebar" />
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl w-full text-xs font-medium text-slate-300 hover:bg-rose-950/40 hover:text-rose-300 transition hig-spring cursor-pointer"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

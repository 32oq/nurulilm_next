"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LogIn, UserPlus, LogOut, LayoutDashboard, Menu, X, Rss, BookOpen, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import LibraryLogo from './common/LibraryLogo';

const ROUTE_MAP = {
  home: '/',
  feed: '/feed',
  dashboard: '/dashboard',
  daily_puzzle: '/daily-puzzle',
  game: '/daily-puzzle',
  login: '/login',
  packages: '/packages',
  register: '/packages',
  checkout: '/packages',
  payment_pending: '/payment-pending',
  police_verification: '/verification',
  verification: '/verification',
  forgot_password: '/forgot-password',
};

const Header = ({ currentPage, setPage, isVerified = true, hasPendingPayment = false, hasNoPackage = false }) => {
  const { state: { isAuthenticated, user }, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || '/';

  const getActivePage = () => {
    if (currentPage) return currentPage;
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/feed')) return 'feed';
    if (pathname.startsWith('/dashboard')) return 'dashboard';
    if (pathname.startsWith('/daily-puzzle')) return 'daily_puzzle';
    if (pathname.startsWith('/login')) return 'login';
    if (pathname.startsWith('/packages') || pathname.startsWith('/register')) return 'packages';
    if (pathname.startsWith('/payment-pending')) return 'payment_pending';
    if (pathname.startsWith('/verification')) return 'police_verification';
    if (pathname.startsWith('/forgot-password')) return 'forgot_password';
    return '';
  };

  const activePage = getActivePage();

  const handleNav = (p) => {
    if (setPage) setPage(p);
    const targetRoute = ROUTE_MAP[p] || (p.startsWith('/') ? p : `/${p}`);
    router.push(targetRoute);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'M';
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Member';

  const NavPill = ({ page, icon: Icon, label }) => (
    <button
      onClick={() => handleNav(page)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer
        ${activePage === page
          ? 'bg-blue-900 text-white dark:bg-blue-600'
          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'}`}
    >
      {Icon && <Icon size={14} />}
      <span>{label}</span>
    </button>
  );

  const MobileItem = ({ page, icon: Icon, label }) => (
    <button
      onClick={() => handleNav(page)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer
        ${activePage === page
          ? 'bg-blue-900 text-white dark:bg-blue-600'
          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}`}
    >
      {Icon && <Icon size={16} />}
      <span>{label}</span>
    </button>
  );

  return (
    <header className="bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 fixed top-0 left-0 right-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Brand Crest & Title */}
        <button
          onClick={() => handleNav(isAuthenticated ? 'feed' : 'home')}
          className="flex items-center gap-3 flex-shrink-0 text-left cursor-pointer focus-visible:outline-blue-800"
          aria-label="Nurul Ilm Library  Home"
        >
          <LibraryLogo size={36} className="w-9 h-9" />
          <div className="flex flex-col">
            <span className="font-serif-lib text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Nurul Ilm Library 
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans leading-none">
              Handwara, Kashmir
            </span>
          </div>
        </button>

        {/* Center Nav - Authenticated Member */}
        {isAuthenticated && isVerified && (
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Member Navigation">
            <NavPill page="feed" icon={Rss} label="Notices & Bulletins" />
            <NavPill page="daily_puzzle" icon={Sparkles} label="Scholar Path" />
            <NavPill page="dashboard" icon={LayoutDashboard} label="Desk & Reading Room" />
          </nav>
        )}
        {isAuthenticated && !isVerified && hasPendingPayment && (
          <div className="hidden sm:flex items-center">
            <button
              onClick={() => handleNav('payment_pending')}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 transition cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Dues Verification Pending</span>
            </button>
          </div>
        )}
        {isAuthenticated && !isVerified && hasNoPackage && (
          <div className="hidden sm:flex items-center">
            <button
              onClick={() => handleNav('packages')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 transition cursor-pointer"
            >
              <span>Select Membership Plan</span>
            </button>
          </div>
        )}

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {/* User badge + logout desktop */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1">
                  <div className="w-6 h-6 rounded bg-blue-900 text-white flex items-center justify-center text-[11px] font-semibold select-none flex-shrink-0">
                    {initials}
                  </div>
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 max-w-[140px] truncate">{displayName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                  title="Sign out"
                >
                  <LogOut size={14} />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </div>

              {/* Mobile quick sign out */}
              <button
                onClick={handleLogout}
                className="sm:hidden p-2 rounded-md text-slate-700 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition border border-slate-200 dark:border-slate-700 cursor-pointer"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>

              {/* Mobile hamburger */}
              <button
                className="sm:hidden p-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700 cursor-pointer"
                onClick={() => setMenuOpen(o => !o)}
                aria-expanded={menuOpen}
                aria-label="Toggle navigation menu"
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </>
          ) : (
            <>
              {/* Guest navigation desktop */}
              <nav className="hidden sm:flex items-center gap-2" aria-label="Account Access">
                <button
                  onClick={() => handleNav('packages')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer
                    ${activePage === 'packages'
                      ? 'bg-blue-900 text-white dark:bg-blue-600'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}`}
                >
                  Membership Plans
                </button>
                <button
                  onClick={() => handleNav('login')}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-blue-900 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white transition shadow-2xs cursor-pointer"
                >
                  Register
                </button>
              </nav>

              {/* Mobile hamburger */}
              <button
                className="sm:hidden p-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700 cursor-pointer"
                onClick={() => setMenuOpen(o => !o)}
                aria-expanded={menuOpen}
                aria-label="Toggle navigation menu"
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800 px-4 py-4 shadow-lg">
          {isAuthenticated ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-[#004B87] flex items-center justify-center text-sm font-semibold text-white select-none flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.act || 'member'}</p>
                </div>
              </div>
              <MobileItem page="feed" icon={Rss} label="Bulletin Feed" />
              <MobileItem page="daily_puzzle" icon={Sparkles} label="Scholar Path (Daily Logic)" />
              <MobileItem page="dashboard" icon={LayoutDashboard} label="Desk &amp; Catalog" />
              {hasPendingPayment && <MobileItem page="payment_pending" icon={Clock} label="Verification Pending" />}
              {hasNoPackage && <MobileItem page="packages" icon={BookOpen} label="Select Membership Tier" />}
              <div className="pt-2.5 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">Appearance Theme</span>
                <ThemeToggle variant="pill" />
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition mt-2 cursor-pointer"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <MobileItem page="home" icon={BookOpen} label="Overview &amp; Facilities" />
              <button
                onClick={() => handleNav('packages')}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Membership Tiers
              </button>
              <MobileItem page="login" icon={LogIn} label="Sign In" />
              <button
                onClick={() => handleNav('register')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#004B87] text-white hover:bg-[#003865] transition cursor-pointer"
              >
                <UserPlus size={16} /> Join Library
              </button>
              <div className="pt-2.5 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">Appearance Theme</span>
                <ThemeToggle variant="pill" />
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;

"use client";

import { useState } from 'react';
import { LogIn, UserPlus, LogOut, LayoutDashboard, Menu, X, Rss, BookOpen, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Header = ({ currentPage, setPage, isVerified = true, hasPendingPayment = false, hasNoPackage = false }) => {
  const { state: { isAuthenticated, user }, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (p) => {
    if (setPage) setPage(p);
    setMenuOpen(false);
  };

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'M';
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Member';

  const NavPill = ({ page, icon: Icon, label }) => (
    <button
      onClick={() => handleNav(page)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer
        ${currentPage === page
          ? 'bg-[#1C3A2B] text-white shadow-xs dark:bg-[#346F4F]'
          : 'text-[#2D3A31] hover:bg-[#EDF3EE] hover:text-[#1C3A2B] dark:text-[#E2E9E4] dark:hover:bg-[#1E2E25]'}`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  const MobileItem = ({ page, icon: Icon, label }) => (
    <button
      onClick={() => handleNav(page)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer
        ${currentPage === page
          ? 'bg-[#1C3A2B] text-white dark:bg-[#346F4F]'
          : 'text-[#2D3A31] hover:bg-[#EDF3EE] hover:text-[#1C3A2B] dark:text-[#E2E9E4]'}`}
    >
      <Icon size={17} /> {label}
    </button>
  );

  return (
    <header className="bg-white/95 dark:bg-[#0E1411]/95 backdrop-blur-md border-b border-[#DFE6DC] dark:border-[#22352B] fixed top-0 left-0 right-0 z-30 shadow-[0_1px_4px_rgba(20,40,30,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-6">

        {/* Brand Crest & Title */}
        <button
          onClick={() => handleNav(isAuthenticated ? 'feed' : 'home')}
          className="flex items-center gap-3 group flex-shrink-0 text-left focus-visible:outline-[#1C3A2B] cursor-pointer"
          aria-label="Nurul Ilm Library Home"
        >
          <img
            src="/assets/logo.jpeg"
            alt="Nurul Ilm Crest"
            className="w-11 h-11 rounded-xl object-cover ring-2 ring-[#DFE6DC] dark:ring-[#22352B] group-hover:ring-[#1C3A2B]/40 transition-all duration-200"
          />
          <div className="flex flex-col items-start">
            <span className="font-serif-lib text-lg sm:text-xl font-bold text-[#1C2E24] dark:text-[#8FD4AE] leading-tight tracking-tight">
              Nurul Ilm Library
            </span>
            <span className="text-[11px] text-[#5D6B62] dark:text-[#9FB3A6] font-sans-lib font-medium tracking-wider uppercase">
              Handwara, J&amp;K
            </span>
          </div>
        </button>

        {/* Center Nav - Authenticated */}
        {isAuthenticated && isVerified && (
          <nav className="hidden sm:flex items-center gap-1.5 flex-1 justify-center" aria-label="Member Navigation">
            <NavPill page="feed" icon={Rss} label="Bulletin Feed" />
            <NavPill page="dashboard" icon={LayoutDashboard} label="Desk &amp; Catalog" />
          </nav>
        )}
        {isAuthenticated && !isVerified && hasPendingPayment && (
          <div className="hidden sm:flex items-center flex-1 justify-center">
            <button
              onClick={() => handleNav('payment_pending')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                currentPage === 'payment_pending'
                  ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A] dark:bg-[#35260C] dark:text-[#FBBF24] dark:border-[#5C4312]'
                  : 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A] hover:bg-[#FEF3C7] dark:bg-[#2A1D08] dark:text-[#FBBF24] dark:border-[#5C4312]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
              <span>Verification Pending</span>
            </button>
          </div>
        )}
        {isAuthenticated && !isVerified && hasNoPackage && (
          <div className="hidden sm:flex items-center flex-1 justify-center">
            <button
              onClick={() => handleNav('packages')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                currentPage === 'packages'
                  ? 'bg-[#1C3A2B] text-white border-[#1C3A2B]'
                  : 'bg-[#EDF3EE] text-[#1C3A2B] border-[#D9E2DC] hover:bg-[#E2EDE4] dark:bg-[#1A2E23] dark:text-[#8FD4AE] dark:border-[#263D30]'
              }`}
            >
              <span>Select Membership Tier</span>
            </button>
          </div>
        )}

        {/* Right side controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {/* User badge + logout desktop */}
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="flex items-center gap-2.5 bg-white dark:bg-[#142019] border border-[#DFE6DC] dark:border-[#22352B] rounded-xl px-3.5 py-1.5 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-[#1C3A2B] dark:bg-[#2D5E44] flex items-center justify-center text-xs font-semibold text-white select-none flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex flex-col items-start leading-none pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#1C2E24] dark:text-[#E8F0EB]">{displayName}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#347648]" title="Active" />
                    </div>
                    <span className="text-[10px] text-[#5D6B62] dark:text-[#889C90] capitalize mt-1 tracking-wide">{user?.act || 'member'}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#5D6B62] hover:bg-[#FAF0F0] hover:text-[#B91C1C] border border-transparent hover:border-[#FEE2E2] dark:hover:bg-[#2D1414] dark:hover:border-[#5C2323] transition-all cursor-pointer"
                  title="Sign out of account"
                >
                  <LogOut size={15} />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </div>

              {/* Mobile hamburger */}
              <button
                className="sm:hidden p-2 rounded-lg text-[#2D3A31] dark:text-[#C9D6CE] hover:bg-[#EDF3EE] dark:hover:bg-[#1A2E23] transition border border-[#DFE6DC] dark:border-[#22352B] cursor-pointer"
                onClick={() => setMenuOpen(o => !o)}
                aria-expanded={menuOpen}
                aria-label="Toggle navigation menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          ) : (
            <>
              {/* Guest navigation desktop */}
              <nav className="hidden sm:flex items-center gap-2.5" aria-label="Account Access">
                <button
                  onClick={() => handleNav('packages')}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer
                    ${currentPage === 'packages'
                      ? 'bg-[#1C3A2B] text-white'
                      : 'text-[#2D3A31] hover:bg-[#EDF3EE] hover:text-[#1C3A2B] dark:text-[#C9D6CE] dark:hover:bg-[#1A2E23] dark:hover:text-[#8FD4AE]'}`}
                >
                  Membership Tiers
                </button>
                <button
                  onClick={() => handleNav('login')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer
                    ${currentPage === 'login'
                      ? 'bg-[#1C3A2B] text-white border-[#1C3A2B]'
                      : 'bg-white dark:bg-[#142019] text-[#1C3A2B] dark:text-[#8FD4AE] border-[#DFE6DC] dark:border-[#22352B] hover:border-[#1C3A2B] shadow-xs'}`}
                >
                  <LogIn size={15} /> Sign In
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#1C3A2B] hover:bg-[#142B20] text-white transition-all shadow-xs cursor-pointer"
                >
                  <UserPlus size={15} /> Join Library
                </button>
              </nav>

              {/* Mobile hamburger */}
              <button
                className="sm:hidden p-2 rounded-lg text-[#2D3A31] dark:text-[#C9D6CE] hover:bg-[#EDF3EE] dark:hover:bg-[#1A2E23] transition border border-[#DFE6DC] dark:border-[#22352B] cursor-pointer"
                onClick={() => setMenuOpen(o => !o)}
                aria-expanded={menuOpen}
                aria-label="Toggle navigation menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden bg-[#FAF8F5] dark:bg-[#131E18] border-t border-[#DFE6DC] dark:border-[#22352B] px-4 py-4 shadow-lg">
          {isAuthenticated ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-white dark:bg-[#18261F] rounded-xl border border-[#DFE6DC] dark:border-[#263D30]">
                <div className="w-10 h-10 rounded-lg bg-[#1C3A2B] flex items-center justify-center text-sm font-semibold text-white select-none flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1C2E24] dark:text-[#E8F0EB]">{displayName}</p>
                  <p className="text-xs text-[#5D6B62] dark:text-[#889C90] capitalize">{user?.act || 'member'}</p>
                </div>
              </div>
              <MobileItem page="feed" icon={Rss} label="Bulletin Feed" />
              <MobileItem page="dashboard" icon={LayoutDashboard} label="Desk &amp; Catalog" />
              {hasPendingPayment && <MobileItem page="payment_pending" icon={Clock} label="Verification Pending" />}
              {hasNoPackage && <MobileItem page="packages" icon={BookOpen} label="Select Membership Tier" />}
              <div className="pt-2.5 mt-2 border-t border-[#DFE6DC] dark:border-[#22352B] flex items-center justify-between px-1">
                <span className="text-xs text-[#5D6B62] dark:text-[#889C90]">Appearance Theme</span>
                <ThemeToggle variant="pill" />
              </div>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-[#B91C1C] hover:bg-[#FEE2E2] dark:hover:bg-[#2D1414] transition mt-2 cursor-pointer"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <MobileItem page="home" icon={BookOpen} label="Overview &amp; Facilities" />
              <button
                onClick={() => handleNav('packages')}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#2D3A31] dark:text-[#C9D6CE] hover:bg-[#EDF3EE] dark:hover:bg-[#1A2E23] cursor-pointer"
              >
                Membership Tiers
              </button>
              <MobileItem page="login" icon={LogIn} label="Sign In" />
              <button
                onClick={() => handleNav('register')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#1C3A2B] text-white hover:bg-[#142B20] transition cursor-pointer"
              >
                <UserPlus size={16} /> Join Library
              </button>
              <div className="pt-2.5 mt-2 border-t border-[#DFE6DC] dark:border-[#22352B] flex items-center justify-between px-1">
                <span className="text-xs text-[#5D6B62] dark:text-[#889C90]">Appearance Theme</span>
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

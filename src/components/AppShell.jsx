'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from './Header';
import BottomNav from './BottomNav';
import PolicePendingBanner from './PolicePendingBanner';
import CookieConsentBanner from './common/CookieConsentBanner';
import { usePatronStatus } from '../hooks/usePatronStatus';
import Link from 'next/link';

export default function AppShell({ children }) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const {
    isAuthenticated,
    user,
    isStudent,
    isVerified,
    hasPendingPayment,
    hasNoPackage
  } = usePatronStatus();

  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDashboard
          ? 'bg-[#F6F8FB] dark:bg-[#0B0F19]'
          : 'bg-[#F6F8FB] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 pt-16'
      }`}
      style={{ overflowX: 'hidden' }}
    >
      {/* Institutional Top Header (Hidden on dashboard) */}
      {!isDashboard && (
        <Header
          isVerified={isVerified}
          hasPendingPayment={hasPendingPayment}
          hasNoPackage={hasNoPackage}
        />
      )}

      {/* Police / KYC Pending Document Audit Banner */}
      {isAuthenticated && isStudent && isVerified && !isDashboard && !user?.verified && (
        <PolicePendingBanner
          status={user?.verified ? 'verified' : 'pending'}
          setPage={(page) => router.push(`/${page === 'home' ? '' : page}`)}
        />
      )}

      {/* Main Dynamic View Content */}
      <main className={`flex-1 ${isDashboard ? '' : 'flex justify-center w-full pb-20 sm:pb-8'}`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (Hidden on dashboard) */}
      {!isDashboard && (
        <BottomNav
          isVerified={isVerified}
          hasPendingPayment={hasPendingPayment}
          hasNoPackage={hasNoPackage}
        />
      )}

      {/* Public Institutional Footer (Hidden on dashboard) */}
      {!isDashboard && (
        <footer className="mt-auto py-8 bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <span className="font-serif-lib text-base font-bold text-slate-900 dark:text-white">
                Nurul Ilm Library 
              </span>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
              <span className="text-slate-600 dark:text-slate-400">
                New Bus Stand Rd, Handwara, J&amp;K
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <Link href="/privacy" className="text-[#004B87] dark:text-blue-400 hover:underline">
                Privacy Policy
              </Link>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <Link href="/terms" className="text-[#004B87] dark:text-blue-400 hover:underline">
                Terms &amp; Regulations
              </Link>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-slate-500">© {new Date().getFullYear()} All Rights Reserved</span>
            </div>
          </div>
        </footer>
      )}

      {/* Cookie / Privacy Consent Banner */}
      <CookieConsentBanner />
    </div>
  );
}

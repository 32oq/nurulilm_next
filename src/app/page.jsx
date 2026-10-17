'use client';

import { use, useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOther } from '../context/OtherContext';
import Header from '../components/Header';
import LandingPage from '../views/LandingPage';
import LoginPage from '../views/LoginPage';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import FeedPage from '../views/FeedPage';
import ForgotPasswordPage from '../views/ForgotPasswordPage';
import BottomNav from '../components/BottomNav';
import VerificationPage from '../views/VerificationPage';
import PolicePendingBanner from '../components/PolicePendingBanner';
import EnrollmentWizard from '../views/EnrollmentWizard';
import PatronStatusHub from '../views/PatronStatusHub';
import CookieConsentBanner from '../components/common/CookieConsentBanner';
import DailyGamePage from '../views/DailyGamePage';
import { Loader2 } from 'lucide-react';

export default function Home(props) {
  const { state: { isAuthenticated, act, user, authRestoring } } = useAuth();
  const { state: { txns }, fetchTxns, fetchLibraryTimings } = useOther();

  // Safely resolve Next.js 15 searchParams on both server and client to guarantee identical hydration tree
  const resolvedParams = props?.searchParams
    ? (typeof props.searchParams.then === 'function' ? use(props.searchParams) : props.searchParams)
    : null;
  const initialPage = resolvedParams?.page || 'home';

  const [page, setPageState] = useState(initialPage);
  const [selectedPackage, setPackage] = useState({});
  const [additionalParams, setAddParams] = useState({});

  const navigateTo = useCallback((targetPage, extraParams = null) => {
    if (typeof targetPage === 'function') {
      setPageState(prev => {
        const next = targetPage(prev);
        if (typeof window !== 'undefined' && typeof next === 'string') {
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set('page', next);
          window.history.pushState({ page: next }, '', currentUrl.toString());
        }
        return next;
      });
      return;
    }

    if (extraParams && typeof extraParams === 'object') {
      if (extraParams.name || extraParams.recurring_payment || extraParams.id || extraParams._id) {
        setPackage(extraParams);
      } else {
        setAddParams(extraParams);
      }
    }

    setPageState(targetPage);
    if (typeof window !== 'undefined') {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('page', targetPage);
      window.history.pushState({ page: targetPage }, '', currentUrl.toString());
    }
  }, []);

  const setPage = navigateTo;

  useEffect(() => {
    if (fetchLibraryTimings) fetchLibraryTimings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlPage = params.get('page') || 'home';
        setPageState(urlPage);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (resolvedParams?.page && resolvedParams.page !== page) {
      setPageState(resolvedParams.page);
    }
  }, [resolvedParams?.page, page]);

  const hasFetchedRef = useRef(false);
  const isStudent = isAuthenticated && act !== 'admin';

  // Verification status calculations
  const isVerified = Boolean(
    !isStudent ||
    user?.paid === 1 ||
    (Array.isArray(txns) && txns.some(t => Number(t?.confirmation) === 1))
  );

  const hasPendingPayment = Boolean(
    isStudent &&
    !isVerified &&
    Array.isArray(txns) &&
    txns.length > 0 &&
    txns.some(t => Number(t?.confirmation) === 0)
  );

  const hasNoPackage = Boolean(
    isStudent &&
    !isVerified &&
    Array.isArray(txns) &&
    txns.length === 0
  );

  // Initial authentication & session restoration - fetch once per auth session
  useEffect(() => {
    if (isAuthenticated) {
      if (act === 'admin') {
        setPage('dashboard');
      } else if (isStudent) {
        if (!hasFetchedRef.current) {
          hasFetchedRef.current = true;
          fetchTxns();
        }
      }
    } else if (!authRestoring) {
      hasFetchedRef.current = false;
      if (page === 'dashboard') {
        setPage('home');
      }
      setPackage({});
    }
  }, [isAuthenticated, act, isStudent, authRestoring]); // eslint-disable-line react-hooks/exhaustive-deps

  // Route protection & state progression for student patrons
  useEffect(() => {
    if (!isStudent) return;
    if (txns === null) return; // Still resolving transactions from backend

    if (hasNoPackage) {
      // User signed up, but has not opted for any package: send to Enrollment Wizard
      if (page !== 'packages' && page !== 'checkout' && page !== 'register') {
        setPage('packages');
      }
    } else if (hasPendingPayment) {
      // Opted for package, but payment not verified yet: show Patron Status Hub
      if (page !== 'payment_pending' && page !== 'feed') {
        setPage('payment_pending');
      }
    } else if (isVerified) {
      // Payment verified! Direct to dashboard if they were on onboarding screens
      if (page === 'payment_pending' || page === 'packages' || page === 'home' || page === 'register') {
        setPage('dashboard');
      }
    }
  }, [isStudent, txns, hasNoPackage, hasPendingPayment, isVerified, page]);

  const renderPage = () => {
    // 1. Handling student membership gating
    if (isStudent) {
      // If transactions are resolving on initial mount
      if (txns === null && (page === 'dashboard' || page === 'packages' || page === 'payment_pending')) {
        return (
          <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
            <Loader2 size={24} className="animate-spin text-[#004B87] dark:text-blue-400" />
            <p className="text-xs text-slate-600 dark:text-slate-400">Verifying membership credentials…</p>
          </div>
        );
      }

      // If user has not opted for any package: enforce EnrollmentWizard
      if (hasNoPackage) {
        return <EnrollmentWizard setPage={setPage} selectedPackage={selectedPackage} />;
      }

      // If payment is pending: enforce PatronStatusHub
      if (hasPendingPayment && (page === 'dashboard' || page === 'payment_pending')) {
        return <PatronStatusHub setPage={setPage} txns={txns} onRefresh={fetchTxns} />;
      }
    }

    // 2. Standard page routing
    if (page === 'packages' || page === 'checkout' || page === 'register') {
      return <EnrollmentWizard setPage={setPage} selectedPackage={selectedPackage} />;
    }
    if (page === 'payment_pending') {
      return <PatronStatusHub setPage={setPage} txns={txns} onRefresh={fetchTxns} />;
    }
    if (isAuthenticated && page === 'feed') return <FeedPage setPage={setPage} />;
    if (isAuthenticated && page === 'dashboard') {
      return act === 'admin'
        ? <AdminDashboard />
        : <DashboardLayout {...additionalParams} />;
    }
    if (page === 'daily_puzzle' || page === 'game') return <DailyGamePage setPage={setPage} />;
    if (page === 'login') return <LoginPage setPage={setPage} />;
    if (page === 'police_verification') return <VerificationPage setPage={setPage} />;
    if (page === 'forgot_password') return <ForgotPasswordPage setPage={setPage} />;
    return <LandingPage setPage={setPage} />;
  };

  if (authRestoring) {
    return (
      <div className="w-full min-h-screen bg-[#F6F8FB] dark:bg-[#0B0F19] flex flex-col items-center justify-center gap-3 transition-colors">
        <div className="w-14 h-14 rounded-2xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm bg-white dark:bg-[#111827] p-1 flex items-center justify-center">
          <img src="/assets/logo-crest.svg" alt="Nurul Ilm Crest" className="w-full h-full object-contain" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#004B87] dark:text-blue-400 mt-2">
          <Loader2 size={16} className="animate-spin text-[#004B87] dark:text-blue-400" />
          <span>Restoring library session…</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">Nurul Ilm Library  • Handwara</p>
      </div>
    );
  }

  const isDashboard = page === 'dashboard';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${isDashboard ? 'bg-[#F6F8FB] dark:bg-[#0B0F19]' : 'bg-[#F6F8FB] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 pt-20'}`} style={{ overflowX: 'hidden' }}>
      {!isDashboard && <Header currentPage={page} setPage={setPage} isVerified={isVerified} hasPendingPayment={hasPendingPayment} hasNoPackage={hasNoPackage} />}
      {isAuthenticated && act !== 'admin' && isVerified && page !== 'dashboard' && !user?.verified && (
        <PolicePendingBanner
          status={user?.verified ? 'verified' : 'pending'}
          setPage={setPage}
          setAddParams={setAddParams}
        />
      )}
      <main className={`flex-1 ${isDashboard ? "" : "flex justify-center w-full pb-20 sm:pb-8"}`}>
        {renderPage()}
      </main>
      {!isDashboard && <BottomNav currentPage={page} setPage={setPage} isVerified={isVerified} hasPendingPayment={hasPendingPayment} hasNoPackage={hasNoPackage} />}
      {!isDashboard && (
        <footer className="mt-auto py-8 bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <span className="font-serif-lib text-base font-bold text-slate-900 dark:text-white">Nurul Ilm Library </span>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
              <span className="text-slate-600 dark:text-slate-400">New Bus Stand Rd, Handwara, J&amp;K</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <a href="/privacy" className="text-[#004B87] dark:text-blue-400 hover:underline">
                Privacy Policy
              </a>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <a href="/terms" className="text-[#004B87] dark:text-blue-400 hover:underline">
                Terms &amp; Conditions
              </a>
            </div>
            <p className="text-center sm:text-right text-slate-500 dark:text-slate-400 text-[11px]">
              © {new Date().getFullYear()} Nurul Ilm Library. Dedicated to student scholarship and community knowledge.
            </p>
          </div>
        </footer>
      )}
      <CookieConsentBanner />
    </div>
  );
}

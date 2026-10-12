'use client';

import { useEffect, useState, useRef } from 'react';
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
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { state: { isAuthenticated, act, user, authRestoring } } = useAuth();
  const { state: { txns }, fetchTxns, fetchLibraryTimings } = useOther();

  const [page, setPage] = useState('home');
  const [selectedPackage, setPackage] = useState({});
  const [additionalParams, setAddParams] = useState({});

  useEffect(() => {
    if (fetchLibraryTimings) fetchLibraryTimings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      setPage('home');
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
            <Loader2 size={24} className="animate-spin text-[#33462C] dark:text-[#8FD4AE]" />
            <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6]">Verifying membership credentials…</p>
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
    if (page === 'login') return <LoginPage setPage={setPage} />;
    if (page === 'police_verification') return <VerificationPage setPage={setPage} />;
    if (page === 'forgot_password') return <ForgotPasswordPage setPage={setPage} />;
    return <LandingPage setPage={setPage} />;
  };

  if (authRestoring) {
    return (
      <div className="w-full min-h-screen bg-[#FCFCFB] dark:bg-[#0E1411] flex flex-col items-center justify-center gap-3 transition-colors">
        <div className="w-14 h-14 rounded-2xl overflow-hidden ring-1 ring-[#33462C]/20 shadow-sm bg-white p-1 flex items-center justify-center">
          <img src="/assets/logo.jpeg" alt="Nurul Ilm Crest" className="w-full h-full object-cover rounded-xl" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#33462C] dark:text-[#8FD4AE] mt-2">
          <Loader2 size={16} className="animate-spin text-[#33462C] dark:text-[#8FD4AE]" />
          <span>Restoring library session…</span>
        </div>
        <p className="text-[11px] text-[#0B0E0A] dark:text-[#9FB1A6]">Nurul Ilm Public Library • Handwara</p>
      </div>
    );
  }

  const isDashboard = page === 'dashboard';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${isDashboard ? 'bg-[#FCFCFB] dark:bg-[#0E1411]' : 'bg-[#FCFCFB] dark:bg-[#0E1411] text-[#0B0E0A] dark:text-[#E5EBE7] pt-20'}`} style={{ overflowX: 'hidden' }}>
      {!isDashboard && <Header currentPage={page} setPage={setPage} isVerified={isVerified} hasPendingPayment={hasPendingPayment} hasNoPackage={hasNoPackage} />}
      {isAuthenticated && act !== 'admin' && isVerified && page !== 'dashboard' && !user?.verified && (
        <PolicePendingBanner
          status={user?.verified ? 'verified' : 'pending'}
          setPage={setPage}
          setAddParams={setAddParams}
        />
      )}
      <main className={`flex-1 ${isDashboard ? "" : "flex justify-center w-full"}`}>
        {renderPage()}
      </main>
      {!isDashboard && <BottomNav currentPage={page} setPage={setPage} isVerified={isVerified} hasPendingPayment={hasPendingPayment} hasNoPackage={hasNoPackage} />}
      {!isDashboard && (
        <footer className="mt-auto py-8 bg-white dark:bg-[#0E1411] text-[#0B0E0A] dark:text-[#9FB1A6] border-t border-[#DFE6DC] dark:border-[#26362D]">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <span className="font-serif-lib text-base font-semibold text-[#24341E] dark:text-[#8FD4AE]">Nurul Ilm Library</span>
              <span className="hidden sm:inline text-[#33462C]/40 dark:text-[#8FD4AE]/40">•</span>
              <span className="text-[#0B0E0A] dark:text-[#9FB1A6]">New Bus Stand Rd, Handwara, J&amp;K</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <a href="/privacy" className="text-[#33462C] dark:text-[#8FD4AE] hover:underline">
                Privacy Policy
              </a>
              <span className="text-[#DFE6DC] dark:text-[#26362D]">•</span>
              <a href="/terms" className="text-[#33462C] dark:text-[#8FD4AE] hover:underline">
                Terms &amp; Conditions
              </a>
            </div>
            <p className="text-center sm:text-right text-[#0B0E0A] dark:text-[#9FB1A6] text-[11px]">
              © {new Date().getFullYear()} Nurul Ilm Library. Dedicated to student scholarship and community knowledge.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

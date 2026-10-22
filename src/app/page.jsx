'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LandingPage from '../views/LandingPage';
import { usePatronStatus } from '../hooks/usePatronStatus';
import { Loader2 } from 'lucide-react';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    isAuthenticated,
    isAdmin,
    isStudent,
    isVerified,
    hasNoPackage,
    hasPendingPayment,
    authRestoring
  } = usePatronStatus();

  // Legacy query parameter routing support (?page=...)
  useEffect(() => {
    const pageParam = searchParams?.get('page');
    if (!pageParam) return;

    const pageMap = {
      login: '/login',
      dashboard: '/dashboard',
      feed: '/feed',
      packages: '/packages',
      register: '/register',
      signup: '/register',
      checkout: '/packages',
      payment_pending: '/payment-pending',
      police_verification: '/verification',
      verification: '/verification',
      forgot_password: '/forgot-password',
      daily_puzzle: '/daily-puzzle',
      game: '/daily-puzzle',
      terms: '/terms',
      privacy: '/privacy'
    };

    if (pageMap[pageParam]) {
      router.replace(pageMap[pageParam]);
    }
  }, [searchParams, router]);

  // Authenticated patron auto-routing to their respective hub
  useEffect(() => {
    if (authRestoring) return;
    if (isAuthenticated) {
      if (isAdmin || isVerified) {
        router.replace('/dashboard');
      } else if (isStudent) {
        if (hasNoPackage) {
          router.replace('/packages');
        } else if (hasPendingPayment) {
          router.replace('/payment-pending');
        }
      }
    }
  }, [
    authRestoring,
    isAuthenticated,
    isAdmin,
    isStudent,
    isVerified,
    hasNoPackage,
    hasPendingPayment,
    router
  ]);

  const handleNavigate = (targetPage) => {
    if (!targetPage) return;
    if (typeof targetPage === 'function') return;

    const pageRoutes = {
      home: '/',
      login: '/login',
      dashboard: '/dashboard',
      feed: '/feed',
      packages: '/packages',
      register: '/register',
      signup: '/register',
      checkout: '/packages',
      payment_pending: '/payment-pending',
      police_verification: '/verification',
      verification: '/verification',
      forgot_password: '/forgot-password',
      daily_puzzle: '/daily-puzzle',
      game: '/daily-puzzle',
      terms: '/terms',
      privacy: '/privacy'
    };

    const targetRoute = pageRoutes[targetPage] || `/${targetPage === 'home' ? '' : targetPage}`;
    router.push(targetRoute);
  };

  if (authRestoring) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-[#004B87] dark:text-blue-400" />
        <span className="text-xs text-slate-500 dark:text-slate-400">Verifying session…</span>
      </div>
    );
  }

  return <LandingPage setPage={handleNavigate} />;
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[50vh] flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[#004B87] dark:text-blue-400" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

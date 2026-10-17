'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePatronStatus } from '../../hooks/usePatronStatus';
import { Loader2 } from 'lucide-react';

/**
 * RouteGuard
 * 
 * Protects pages according to institutional security and patron state:
 * - 'guest_only': Only unauthenticated visitors (e.g. /login). Redirects logged in users to /dashboard or onboarding.
 * - 'authenticated': Any logged in patron/admin (e.g. /feed, /verification).
 * - 'verified_patron': Verified patrons or admins (e.g. /dashboard). Redirects unverified students to their respective onboarding step.
 * - 'admin_only': Only admin patrons.
 */
export default function RouteGuard({
  children,
  requirement = 'authenticated',
  redirectTo = '/login'
}) {
  const router = useRouter();
  const {
    isAuthenticated,
    isAdmin,
    isStudent,
    authRestoring,
    txnsLoading,
    isVerified,
    hasNoPackage,
    hasPendingPayment,
    fetchTxns,
    txns
  } = usePatronStatus();

  // If user is a student, ensure transactions are fetched
  useEffect(() => {
    if (isAuthenticated && isStudent && txns === null) {
      fetchTxns();
    }
  }, [isAuthenticated, isStudent, txns, fetchTxns]);

  useEffect(() => {
    if (authRestoring) return; // wait for session check

    if (requirement === 'guest_only') {
      if (isAuthenticated) {
        if (isAdmin || isVerified) {
          router.replace('/dashboard');
        } else if (hasNoPackage) {
          router.replace('/packages');
        } else if (hasPendingPayment) {
          router.replace('/payment-pending');
        } else {
          router.replace('/dashboard');
        }
      }
      return;
    }

    if (requirement === 'authenticated') {
      if (!isAuthenticated) {
        router.replace(redirectTo);
      }
      return;
    }

    if (requirement === 'admin_only') {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (!isAdmin) {
        router.replace('/dashboard');
      }
      return;
    }

    if (requirement === 'verified_patron') {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (isStudent) {
        if (txnsLoading) return; // wait for txns resolution
        if (hasNoPackage) {
          router.replace('/packages');
        } else if (hasPendingPayment) {
          router.replace('/payment-pending');
        }
      }
      return;
    }
  }, [
    authRestoring,
    isAuthenticated,
    isAdmin,
    isStudent,
    isVerified,
    hasNoPackage,
    hasPendingPayment,
    txnsLoading,
    requirement,
    redirectTo,
    router
  ]);

  // Loading state while checking authentication or student dues
  if (authRestoring || (requirement === 'verified_patron' && isStudent && txnsLoading)) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-[#004B87] dark:text-blue-400" />
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Verifying security clearance and credentials…
        </p>
      </div>
    );
  }

  // Guard enforcement checks before rendering children
  if (requirement === 'guest_only' && isAuthenticated) {
    return null;
  }
  if (requirement === 'authenticated' && !isAuthenticated) {
    return null;
  }
  if (requirement === 'admin_only' && (!isAuthenticated || !isAdmin)) {
    return null;
  }
  if (requirement === 'verified_patron' && (!isAuthenticated || (isStudent && !isVerified))) {
    return null;
  }

  return children;
}

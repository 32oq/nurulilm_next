'use client';

import RouteGuard from '../../components/auth/RouteGuard';
import PatronStatusHub from '../../views/PatronStatusHub';
import { usePatronStatus } from '../../hooks/usePatronStatus';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PaymentPendingClient() {
  const router = useRouter();
  const { txns, fetchTxns, isVerified, isAuthenticated } = usePatronStatus();

  // If verified, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && isVerified) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isVerified, router]);

  const handleNavigate = (page) => {
    if (page === 'dashboard') router.push('/dashboard');
    else if (page === 'packages') router.push('/packages');
    else if (page === 'login') router.push('/login');
    else router.push(`/${page === 'home' ? '' : page}`);
  };

  return (
    <RouteGuard requirement="authenticated">
      <PatronStatusHub
        setPage={handleNavigate}
        txns={txns || []}
        onRefresh={fetchTxns}
      />
    </RouteGuard>
  );
}

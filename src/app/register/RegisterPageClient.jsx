'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import RouteGuard from '../../components/auth/RouteGuard';
import SignupPage from '../../views/SignupPage';
import { Loader2 } from 'lucide-react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPackage = searchParams?.get('package') || null;

  const handleNavigate = (page) => {
    if (page === 'login') router.push('/login');
    else if (page === 'packages') router.push('/packages');
    else if (page === 'dashboard') router.push('/dashboard');
    else router.push(`/${page === 'home' ? '' : page}`);
  };

  return (
    <SignupPage
      setPage={handleNavigate}
      initialPackage={initialPackage}
    />
  );
}

export default function RegisterPageClient() {
  return (
    <RouteGuard requirement="guest_only">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-[#004B87] dark:text-blue-400" size={28} />
        </div>
      }>
        <RegisterContent />
      </Suspense>
    </RouteGuard>
  );
}

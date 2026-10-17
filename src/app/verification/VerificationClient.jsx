'use client';

import RouteGuard from '../../components/auth/RouteGuard';
import VerificationPage from '../../views/VerificationPage';
import { useRouter } from 'next/navigation';

export default function VerificationClient() {
  const router = useRouter();

  return (
    <RouteGuard requirement="authenticated">
      <VerificationPage
        setPage={(page) => router.push(`/${page === 'home' ? '' : page}`)}
        onSuccess={() => router.push('/dashboard')}
      />
    </RouteGuard>
  );
}

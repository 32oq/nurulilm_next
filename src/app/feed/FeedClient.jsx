'use client';

import RouteGuard from '../../components/auth/RouteGuard';
import FeedPageView from '../../views/FeedPage';
import { useRouter } from 'next/navigation';

export default function FeedClient() {
  const router = useRouter();
  return (
    <RouteGuard requirement="authenticated">
      <FeedPageView
        setPage={(page) => {
          if (page === 'dashboard') router.push('/dashboard');
          else router.push(`/${page === 'home' ? '' : page}`);
        }}
      />
    </RouteGuard>
  );
}

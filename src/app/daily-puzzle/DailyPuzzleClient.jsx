'use client';

import DailyGamePageView from '../../views/DailyGamePage';
import { useRouter } from 'next/navigation';

export default function DailyPuzzleClient() {
  const router = useRouter();
  return (
    <DailyGamePageView
      setPage={(page) => {
        if (page === 'login') router.push('/login');
        else if (page === 'packages') router.push('/packages');
        else if (page === 'dashboard') router.push('/dashboard');
        else router.push(`/${page === 'home' ? '' : page}`);
      }}
    />
  );
}

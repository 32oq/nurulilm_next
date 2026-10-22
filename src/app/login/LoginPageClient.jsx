'use client';

import RouteGuard from '../../components/auth/RouteGuard';
import LoginPageView from '../../views/LoginPage';
import { useRouter } from 'next/navigation';

export default function LoginPageClient() {
  const router = useRouter();
  return (
    <RouteGuard requirement="guest_only">
      <LoginPageView
        setPage={(page) => {
          if (page === 'forgot_password') router.push('/forgot-password');
          else if (page === 'register' || page === 'signup') router.push('/register');
          else if (page === 'packages') router.push('/packages');
          else if (page === 'dashboard') router.push('/dashboard');
          else router.push(`/${page === 'home' ? '' : page}`);
        }}
      />
    </RouteGuard>
  );
}

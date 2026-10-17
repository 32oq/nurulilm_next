'use client';

import ForgotPasswordPageView from '../../views/ForgotPasswordPage';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordClient() {
  const router = useRouter();
  return (
    <ForgotPasswordPageView
      setPage={(page) => {
        if (page === 'login') router.push('/login');
        else router.push(`/${page === 'home' ? '' : page}`);
      }}
    />
  );
}

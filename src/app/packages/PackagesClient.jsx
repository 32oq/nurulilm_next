'use client';

import EnrollmentWizard from '../../views/EnrollmentWizard';
import { useRouter } from 'next/navigation';

export default function PackagesClient() {
  const router = useRouter();

  const handleNavigate = (page) => {
    if (page === 'dashboard') router.push('/dashboard');
    else if (page === 'login') router.push('/login');
    else if (page === 'payment_pending') router.push('/payment-pending');
    else if (page === 'police_verification') router.push('/verification');
    else router.push(`/${page === 'home' ? '' : page}`);
  };

  return (
    <EnrollmentWizard
      setPage={handleNavigate}
    />
  );
}

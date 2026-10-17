'use client';

import RouteGuard from '../../components/auth/RouteGuard';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import AdminDashboard from '../../components/dashboard/AdminDashboard';
import { usePatronStatus } from '../../hooks/usePatronStatus';

export default function DashboardClient() {
  const { act } = usePatronStatus();

  return (
    <RouteGuard requirement="verified_patron">
      {act === 'admin' ? (
        <AdminDashboard />
      ) : (
        <DashboardLayout />
      )}
    </RouteGuard>
  );
}

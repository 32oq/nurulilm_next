'use client';

import { useAuth } from '../context/AuthContext';
import { useOther } from '../context/OtherContext';

/**
 * Custom hook to encapsulate patron authorization, role detection,
 * dues status, and verification level.
 */
export function usePatronStatus() {
  const { state: { isAuthenticated, act, user, authRestoring, loading: authLoading }, logout } = useAuth();
  const { state: { txns }, fetchTxns } = useOther();

  const normalizedAct = String(act || '').toLowerCase();
  const isAdmin = Boolean(isAuthenticated && (normalizedAct === 'admin' || normalizedAct === 'super_admin'));
  const isStudent = Boolean(isAuthenticated && !isAdmin);

  // Verification status calculations:
  // - Admin is always verified
  // - Student is verified if user.paid === 1 OR at least one confirmed transaction exists
  const isVerified = Boolean(
    !isStudent ||
    user?.paid === 1 ||
    (Array.isArray(txns) && txns.some(t => Number(t?.confirmation) === 1))
  );

  // Student has pending payment awaiting administrative verification
  const hasPendingPayment = Boolean(
    isStudent &&
    !isVerified &&
    Array.isArray(txns) &&
    txns.length > 0 &&
    txns.some(t => Number(t?.confirmation) === 0)
  );

  // Student is signed up, but has not selected/submitted any package yet
  const hasNoPackage = Boolean(
    isStudent &&
    !isVerified &&
    Array.isArray(txns) &&
    txns.length === 0
  );

  const txnsLoading = Boolean(isStudent && txns === null);

  return {
    isAuthenticated,
    isStudent,
    isAdmin,
    user,
    act,
    authRestoring,
    authLoading,
    isVerified,
    hasPendingPayment,
    hasNoPackage,
    txns,
    txnsLoading,
    fetchTxns,
    logout
  };
}

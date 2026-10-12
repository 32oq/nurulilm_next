'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import loansService from '../services/loansService';
import { getErrorMessage } from '../utils/errors';

/**
 * Reusable hook for patron active book loans, borrowing limits, and due date monitoring.
 */
export function useStudentLoans(options = { autoFetch: true }) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshLoans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loansService.getMyLoans();
      setLoans(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch borrowed books.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.autoFetch) {
      refreshLoans();
    }
  }, [refreshLoans, options.autoFetch]);

  const activeLoans = useMemo(() => {
    return loans.filter((l) => l.status === 'borrowed' || !l.return_date);
  }, [loans]);

  const returnedLoans = useMemo(() => {
    return loans.filter((l) => l.status === 'returned' || !!l.return_date);
  }, [loans]);

  return {
    loans,
    activeLoans,
    returnedLoans,
    loading,
    error,
    refreshLoans,
  };
}

export default useStudentLoans;

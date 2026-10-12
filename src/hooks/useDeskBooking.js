'use client';

import { useState, useEffect, useCallback } from 'react';
import deskService from '../services/deskService';
import { getErrorMessage } from '../utils/errors';

/**
 * Reusable hook for patron desk layout, reservations, and carrel swap requests.
 */
export function useDeskBooking(options = { autoFetch: true }) {
  const [desks, setDesks] = useState([]);
  const [myDesk, setMyDesk] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshDesks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [deskList, claimed, requests] = await Promise.allSettled([
        deskService.getDesks(),
        deskService.getMyDesk(),
        deskService.getMyChangeRequests(),
      ]);

      if (deskList.status === 'fulfilled') {
        setDesks(Array.isArray(deskList.value) ? deskList.value : []);
      }
      if (claimed.status === 'fulfilled') {
        setMyDesk(claimed.value || null);
      }
      if (requests.status === 'fulfilled') {
        setMyRequests(Array.isArray(requests.value) ? requests.value : []);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch desk allocations.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.autoFetch) {
      refreshDesks();
    }
  }, [refreshDesks, options.autoFetch]);

  const reserve = useCallback(async (deskId) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await deskService.reserveDesk(deskId);
      await refreshDesks();
      return res;
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to claim desk.');
      setError(msg);
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  }, [refreshDesks]);

  const requestSwap = useCallback(async (desiredDeskId, reason = '') => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await deskService.requestDeskChange(desiredDeskId, reason);
      await refreshDesks();
      return res;
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to submit desk change request.');
      setError(msg);
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  }, [refreshDesks]);

  return {
    desks,
    myDesk,
    myRequests,
    loading,
    actionLoading,
    error,
    reserveDesk: reserve,
    requestSwap,
    refreshDesks,
  };
}

export default useDeskBooking;

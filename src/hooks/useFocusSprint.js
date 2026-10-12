'use client';

import { useState, useEffect, useCallback } from 'react';
import sprintService from '../services/sprintService';
import { getErrorMessage } from '../utils/errors';

/**
 * Reusable hook for library focus sprints, Pomodoro sessions, and student leaderboard.
 */
export function useFocusSprint(options = { autoFetch: true }) {
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshSprintData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [historyData, leadersData] = await Promise.allSettled([
        sprintService.getHistory(),
        sprintService.getLeaderboard(),
      ]);

      if (historyData.status === 'fulfilled') {
        setHistory(Array.isArray(historyData.value) ? historyData.value : []);
      }
      if (leadersData.status === 'fulfilled') {
        setLeaderboard(Array.isArray(leadersData.value) ? leadersData.value : []);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch focus sprint data.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.autoFetch) {
      refreshSprintData();
    }
  }, [refreshSprintData, options.autoFetch]);

  const logSprint = useCallback(async (sprintData) => {
    try {
      const result = await sprintService.logSprint(sprintData);
      await refreshSprintData();
      return result;
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to log focus sprint session.');
      throw new Error(msg);
    }
  }, [refreshSprintData]);

  const removeSprint = useCallback(async (sprintId) => {
    try {
      const result = await sprintService.deleteSprint(sprintId);
      await refreshSprintData();
      return result;
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to remove focus sprint record.');
      throw new Error(msg);
    }
  }, [refreshSprintData]);

  return {
    history,
    leaderboard,
    loading,
    error,
    logSprint,
    removeSprint,
    refreshSprintData,
  };
}

export default useFocusSprint;

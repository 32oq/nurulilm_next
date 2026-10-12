/**
 * @file sprintService.js
 * @description Pomodoro study focus sprints, study streak tracking, and scholar leaderboard.
 * 100% matched to Express backend routes.
 */

import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config/api';

export const sprintService = {
  /**
   * Logs a completed focus sprint session
   */
  async logSprint(payload) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.FOCUS_SPRINT_LOG, payload);
    return response?.data;
  },

  /**
   * Fetches sprint history and streak statistics for current student
   */
  async getHistory() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.FOCUS_SPRINT_HISTORY);
    return response?.data?.results?.data || response?.data?.results || { history: [], stats: { streak: 0, todayMinutes: 0, totalMinutes: 0 } };
  },

  /**
   * Fetches top dedicated scholars for the focus leaderboard
   */
  async getLeaderboard() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.FOCUS_SPRINT_LEADERBOARD);
    return response?.data?.results || [];
  },

  /**
   * Deletes a focus session log
   */
  async deleteSprint(id) {
    const response = await apiClient.delete(ENDPOINTS.DASHBOARD.FOCUS_SPRINT_DELETE(id));
    return response?.data;
  },
};

export default sprintService;

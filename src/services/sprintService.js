/**
 * @file sprintService.js
 * @description Pomodoro study focus sprints, study streak tracking, and scholar leaderboard.
 */

import { apiClient } from './apiClient';
import { DASHBOARD_API_BASE } from '../config/api';

export const sprintService = {
  /**
   * Starts a focus sprint session
   */
  async startSprint(payload = {}) {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/focus_sprint/start`, payload);
    return response?.data?.results;
  },

  /**
   * Completes a focus sprint session with minutes studied and topic
   */
  async completeSprint(payload) {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/focus_sprint/complete`, payload);
    return response?.data?.results;
  },

  /**
   * Fetches sprint history and streak statistics for the logged-in student
   */
  async getHistory() {
    const response = await apiClient.get(`${DASHBOARD_API_BASE}/focus_sprint/history`);
    return response?.data?.results || { sprints: [], stats: { streakDays: 0, todayMinutes: 0, totalMinutes: 0 } };
  },

  /**
   * Fetches top dedicated scholars for the week/month
   */
  async getLeaderboard() {
    const response = await apiClient.get(`${DASHBOARD_API_BASE}/focus_sprint/leaderboard`);
    return response?.data?.results || [];
  },
};

export default sprintService;

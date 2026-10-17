/**
 * @file gameService.js
 * @description API service for Scholar Path (logic puzzle game)
 * Connects to backend /game endpoints for daily puzzles, validation, hints, streaks, and leaderboards.
 */

import { apiClient } from './apiClient';

export const gameService = {
  /**
   * Fetch today's official deterministic daily puzzle
   */
  async getDailyPuzzle({ date, size = 6, difficulty = 'medium' } = {}) {
    const params = {};
    if (date) params.date = date;
    if (size) params.size = size;
    if (difficulty) params.difficulty = difficulty;

    const res = await apiClient.get('/game/daily', { params });
    return res.data?.results || res.data;
  },

  /**
   * Start a new puzzle attempt
   */
  async startAttempt(puzzleId) {
    const res = await apiClient.post('/game/start', { puzzle_id: puzzleId });
    return res.data?.results || res.data;
  },

  /**
   * Request a hint for the active puzzle path
   */
  async getHint({ puzzleId, currentPath, attemptId }) {
    const res = await apiClient.post('/game/hint', {
      puzzle_id: puzzleId,
      current_path: currentPath,
      attempt_id: attemptId
    });
    return res.data?.results || res.data;
  },

  /**
   * Authoritatively submit and validate the completed puzzle path
   */
  async submitSolution({ puzzleId, path, elapsedSeconds, backtracks, hintsUsed, attemptId, userName }) {
    const res = await apiClient.post('/game/submit', {
      puzzle_id: puzzleId,
      path,
      elapsed_seconds: elapsedSeconds,
      backtracks,
      hints_used: hintsUsed,
      attempt_id: attemptId,
      user_name: userName
    });
    return res.data?.results || res.data;
  },

  /**
   * Fetch authenticated user's game stats (streak, best time, completions)
   */
  async getUserStats() {
    try {
      const res = await apiClient.get('/game/stats');
      return res.data?.results || res.data;
    } catch {
      return null;
    }
  },

  /**
   * Fetch user's completed game history
   */
  async getUserHistory(limit = 30) {
    try {
      const res = await apiClient.get('/game/history', { params: { limit } });
      return res.data?.results || [];
    } catch {
      return [];
    }
  },

  /**
   * Fetch daily leaderboard
   */
  async getDailyLeaderboard(date) {
    try {
      const params = date ? { date } : {};
      const res = await apiClient.get('/game/leaderboard', { params });
      return res.data?.results || [];
    } catch {
      return [];
    }
  }
};

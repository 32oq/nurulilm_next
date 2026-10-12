/**
 * @file communityService.js
 * @description Pinned bulletin board notes, patron tips, and administrative moderation.
 */

import { apiClient } from './apiClient';
import { DASHBOARD_API_BASE } from '../config/api';

export const communityService = {
  /**
   * Fetches published live community notes for landing page and student view
   */
  async getLiveNotes() {
    const response = await apiClient.get(`${DASHBOARD_API_BASE}/community_notes/fetch_live`);
    return response?.data?.results || [];
  },

  /**
   * Submits a study resolution or advice note from a student
   */
  async submitNote(notePayload) {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/community_notes/submit`, notePayload);
    return response?.data;
  },

  /**
   * Fetches all notes across all audit statuses (admin)
   */
  async getAllNotes(params = {}) {
    const response = await apiClient.get(`${DASHBOARD_API_BASE}/community_notes/fetch_all`, { params });
    return response?.data?.results || [];
  },

  /**
   * Approves or rejects a submitted note (admin)
   */
  async auditNote(noteId, status) {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/community_notes/audit`, {
      note_id: noteId,
      status,
    });
    return response?.data;
  },
};

export default communityService;

/**
 * @file communityService.js
 * @description Pinned bulletin board notes, patron tips, and administrative moderation.
 * 100% matched to Express backend routes.
 */

import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config/api';

export const communityService = {
  /**
   * Fetches published live community notes for landing page and student view
   */
  async getLiveNotes() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.COMMUNITY_NOTES_PUBLISHED);
    const data = response?.data?.results?.data || response?.data?.results || [];
    return Array.isArray(data) ? data : [];
  },

  /**
   * Submits a study resolution or advice note from a student
   */
  async submitNote(notePayload) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.COMMUNITY_NOTES_SUBMIT, notePayload);
    return response?.data;
  },

  /**
   * Likes a community note
   */
  async likeNote(id) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.COMMUNITY_NOTES_LIKE(id));
    return response?.data;
  },

  /**
   * Fetches all notes across all audit statuses (admin)
   */
  async getAllNotes(params = {}) {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.COMMUNITY_NOTES_ADMIN_ALL, { params });
    const data = response?.data?.results?.data || response?.data?.results || [];
    return Array.isArray(data) ? data : [];
  },

  /**
   * Approves or rejects a submitted note (admin)
   */
  async auditNote(noteId, status) {
    const response = await apiClient.put(ENDPOINTS.DASHBOARD.COMMUNITY_NOTES_AUDIT(noteId), { status });
    return response?.data;
  },

  /**
   * Deletes a community note (admin)
   */
  async deleteNote(noteId) {
    const response = await apiClient.delete(ENDPOINTS.DASHBOARD.COMMUNITY_NOTES_DELETE(noteId));
    return response?.data;
  },
};

export default communityService;

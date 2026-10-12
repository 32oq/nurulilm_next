/**
 * @file deskService.js
 * @description Study carrel layout, reservations, desk locking and swap request management.
 * 100% matched to Express backend routes.
 */

import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config/api';

export const deskService = {
  /**
   * Fetches the entire study hall desk roster with real occupancy
   */
  async getDesks() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.DESKS_LIST);
    const data = response?.data?.results?.data || response?.data?.results || [];
    return Array.isArray(data) ? data : [];
  },

  /**
   * Claims / reserves a specific desk carrel for current student
   */
  async claimDesk(deskId) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.DESK_RESERVE, { desk_id: deskId });
    return response?.data;
  },

  /**
   * Fetches the current student's active desk
   */
  async getMyDesk() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.DESK_MY);
    return response?.data?.results;
  },

  /**
   * Submits student request to swap or change study carrel
   */
  async requestDeskChange(payload) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.DESK_CHANGE_REQUEST, payload);
    return response?.data;
  },

  /**
   * Fetches the current student's change requests
   */
  async getMyDeskChangeRequests() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.DESK_CHANGE_REQUESTS_MY);
    return response?.data?.results || [];
  },

  /**
   * Fetches pending desk change requests for admin review
   */
  async getDeskRequestsAdmin() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.DESKS_ADMIN_CHANGE_REQUESTS);
    return response?.data?.results || [];
  },

  /**
   * Approves a desk swap request (admin)
   */
  async approveDeskRequest(requestId) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.DESK_ADMIN_APPROVE_REQUEST(requestId));
    return response?.data;
  },

  /**
   * Rejects a desk swap request (admin)
   */
  async rejectDeskRequest(requestId, adminNote = '') {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.DESK_ADMIN_REJECT_REQUEST(requestId), {
      admin_note: adminNote,
    });
    return response?.data;
  },

  /**
   * Reassigns a desk to a student directly (admin)
   */
  async reassignDesk(payload) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.DESK_ADMIN_REASSIGN, payload);
    return response?.data;
  },

  /**
   * Releases an allocated study desk (admin)
   */
  async releaseDesk(deskId) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.DESK_ADMIN_RELEASE(deskId));
    return response?.data;
  },

  /**
   * Creates a new desk (admin)
   */
  async createDesk(deskData) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.DESK_ADMIN_CREATE, deskData);
    return response?.data;
  },

  /**
   * Toggles desk availability/maintenance status (admin)
   */
  async toggleDeskStatus(deskId, status) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.DESK_ADMIN_TOGGLE_STATUS(deskId), { status });
    return response?.data;
  },
};

export default deskService;

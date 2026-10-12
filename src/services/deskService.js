/**
 * @file deskService.js
 * @description Study carrel layout, reservations, desk locking and swap request management.
 */

import { apiClient } from './apiClient';
import { DASHBOARD_API_BASE } from '../config/api';

export const deskService = {
  /**
   * Fetches the entire study hall desk roster with real occupancy
   */
  async getDesks() {
    const response = await apiClient.get(`${DASHBOARD_API_BASE}/desks/fetch_all`);
    return response?.data?.results || [];
  },

  /**
   * Claims / reserves a specific desk carrel for current student
   */
  async claimDesk(deskId) {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/desks/claim`, { desk_id: deskId });
    return response?.data;
  },

  /**
   * Releases an allocated study desk
   */
  async releaseDesk(deskId) {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/desks/release`, { desk_id: deskId });
    return response?.data;
  },

  /**
   * Submits student request to swap or change study carrel
   */
  async requestDeskChange(payload) {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/desks/request_change`, payload);
    return response?.data;
  },

  /**
   * Fetches pending desk change requests
   */
  async getDeskRequests(params = {}) {
    const response = await apiClient.get(`${DASHBOARD_API_BASE}/desks/requests`, { params });
    return response?.data?.results || [];
  },

  /**
   * Audits (approve/reject) a desk swap request (admin)
   */
  async auditDeskRequest(requestId, status, adminNote = '') {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/desks/audit_request`, {
      request_id: requestId,
      status,
      admin_note: adminNote,
    });
    return response?.data;
  },
};

export default deskService;

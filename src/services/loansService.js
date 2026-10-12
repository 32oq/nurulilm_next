/**
 * @file loansService.js
 * @description Book lending, borrowing history, renewal, and circulation returns.
 * 100% matched to Express backend routes.
 */

import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config/api';

export const loansService = {
  /**
   * Fetches active and historical book loans for current student
   */
  async getMyLoans() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.LOANS_MY);
    return response?.data?.results || [];
  },

  /**
   * Fetches all circulation loans (admin)
   */
  async getAllLoans(params = {}) {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.LOANS_LIST, { params });
    return response?.data?.results || [];
  },

  /**
   * Fetches students list for loans issuing (admin)
   */
  async getStudentsForLoans() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.LOANS_STUDENTS);
    return response?.data?.results || [];
  },

  /**
   * Issues a book loan to a student (admin)
   */
  async issueLoan(payload) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.LOANS_ISSUE, payload);
    return response?.data;
  },

  /**
   * Marks a borrowed book as returned (admin)
   */
  async returnLoan(loanId) {
    const response = await apiClient.put(ENDPOINTS.DASHBOARD.LOANS_RETURN(loanId));
    return response?.data;
  },
};

export default loansService;

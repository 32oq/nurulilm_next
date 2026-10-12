/**
 * @file loansService.js
 * @description Book lending, borrowing history, renewal, and circulation returns.
 */

import { apiClient } from './apiClient';
import { DASHBOARD_API_BASE } from '../config/api';

export const loansService = {
  /**
   * Fetches active and historical book loans for the logged-in student
   */
  async getMyLoans() {
    const response = await apiClient.get(`${DASHBOARD_API_BASE}/loans/my_loans`);
    return response?.data?.results || [];
  },

  /**
   * Fetches all loans across the library (admin)
   */
  async getAllLoans(params = {}) {
    const response = await apiClient.get(`${DASHBOARD_API_BASE}/loans/fetch_all`, { params });
    return response?.data?.results || [];
  },

  /**
   * Issues a book loan to a student (admin)
   */
  async issueLoan(payload) {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/loans/issue`, payload);
    return response?.data;
  },

  /**
   * Marks a borrowed book as returned (admin)
   */
  async returnLoan(loanId) {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/loans/return`, { loan_id: loanId });
    return response?.data;
  },

  /**
   * Extends the loan duration by another cycle
   */
  async extendLoan(loanId) {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/loans/extend`, { loan_id: loanId });
    return response?.data;
  },
};

export default loansService;

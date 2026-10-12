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
    const res = response?.data?.results;
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.loans)) return res.loans;
    return [];
  },

  /**
   * Fetches all circulation loans (admin)
   */
  async getAllLoans(params = {}) {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.LOANS_LIST, { params });
    const res = response?.data?.results;
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.loans)) return res.loans;
    return [];
  },

  /**
   * Fetches students list for loans issuing (admin)
   */
  async getStudentsForLoans() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.LOANS_STUDENTS);
    const res = response?.data?.results;
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.students)) return res.students;
    return [];
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

/**
 * @file paymentService.js
 * @description Subscription billing, UTR verification, transaction logs, and revenue metrics.
 * 100% matched to Express backend routes (/payments/* and /dashboard/*).
 */

import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config/api';

export const paymentService = {
  /**
   * Fetches transaction history for current logged-in patron
   */
  async getMyTransactions() {
    const response = await apiClient.get(ENDPOINTS.PAYMENTS.FETCH);
    const res = response?.data?.results;
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.allPayments)) return res.allPayments;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  },

  /**
   * Submits a new payment / subscription enrollment
   */
  async checkout(paymentPayload) {
    const response = await apiClient.post(ENDPOINTS.PAYMENTS.CHECKOUT, paymentPayload);
    return response?.data;
  },

  /**
   * Updates an existing pending transaction (UTR correction)
   */
  async updatePendingTxn(payload) {
    const response = await apiClient.put(ENDPOINTS.PAYMENTS.UPDATE_TXN, payload);
    return response?.data;
  },

  /**
   * Fetches unconfirmed pending transactions for admin audit
   */
  async getTransactionsForConfirmation(params = {}) {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.PENDING_PAYMENTS, { params });
    const res = response?.data?.results;
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.payments)) return res.payments;
    return [];
  },

  /**
   * Confirms a student payment receipt (admin)
   */
  async confirmPayment(txnId, confirmationStatus = 1, remarks = '') {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.APPROVE_PAYMENT(txnId), {
      confirmation: confirmationStatus,
      remarks,
    });
    return response?.data;
  },

  /**
   * Records a direct offline / cash payment (admin)
   */
  async recordPayment(payload) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.RECORD_PAYMENT, payload);
    return response?.data;
  },

  /**
   * Fetches cumulative fee collections and analytics (admin)
   */
  async getEarnings(params = {}) {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.EARNINGS, { params });
    return response?.data?.results || { total: 0, count: 0 };
  },
};

export default paymentService;

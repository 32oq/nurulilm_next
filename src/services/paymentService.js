/**
 * @file paymentService.js
 * @description Subscription billing, UTR verification, transaction logs, and revenue metrics.
 */

import { apiClient } from './apiClient';
import { PAYMENTS_API_BASE } from '../config/api';

export const paymentService = {
  /**
   * Fetches transaction history for current logged-in patron
   */
  async getMyTransactions() {
    const response = await apiClient.get(`${PAYMENTS_API_BASE}/fetch_all`);
    return response?.data?.results || [];
  },

  /**
   * Submits a new payment / subscription enrollment
   */
  async checkout(paymentPayload) {
    const response = await apiClient.post(`${PAYMENTS_API_BASE}/checkout`, paymentPayload);
    return response?.data;
  },

  /**
   * Updates an existing pending transaction (e.g. UTR correction or note)
   */
  async updatePendingTxn(payload) {
    const response = await apiClient.post(`${PAYMENTS_API_BASE}/update_pending`, payload);
    return response?.data;
  },

  /**
   * Fetches unconfirmed pending transactions for admin audit
   */
  async getTransactionsForConfirmation(params = {}) {
    const response = await apiClient.get(`${PAYMENTS_API_BASE}/fetch_unconfirmed`, { params });
    return response?.data?.results || [];
  },

  /**
   * Confirms or rejects a student payment receipt (admin)
   */
  async confirmPayment(txnId, confirmationStatus = 1, remarks = '') {
    const response = await apiClient.post(`${PAYMENTS_API_BASE}/confirm`, {
      txn_id: txnId,
      confirmation: confirmationStatus,
      remarks,
    });
    return response?.data;
  },

  /**
   * Fetches cumulative fee collections and analytics (admin)
   */
  async getEarnings(params = {}) {
    const response = await apiClient.get(`${PAYMENTS_API_BASE}/earnings`, { params });
    return response?.data?.results || { total: 0, count: 0 };
  },
};

export default paymentService;

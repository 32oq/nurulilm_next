/**
 * @file adminService.js
 * @description Administrative operations: student roster, KYC audits, operational hours, membership packages, notices, and digital patron cards.
 */

import { apiClient } from './apiClient';
import { DASHBOARD_API_BASE, USER_API_BASE } from '../config/api';

export const adminService = {
  /**
   * Fetches official library operational timings and seasonal note
   */
  async getLibraryTimings() {
    const response = await apiClient.get(`${DASHBOARD_API_BASE}/timings`);
    return response?.data?.results || {
      open_time: '07:00 AM',
      close_time: '09:00 PM',
      days: 'Monday - Sunday',
      status_note: 'Open 7 days a week • Winter heating & quiet cabins active',
      is_open_today: true,
    };
  },

  /**
   * Updates library operational timings (admin)
   */
  async updateLibraryTimings(timingsData) {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/timings/update`, timingsData);
    return response?.data;
  },

  /**
   * Fetches all membership tiers/packages
   */
  async getPackages() {
    const response = await apiClient.get(`${DASHBOARD_API_BASE}/packages/fetch_all`);
    return response?.data?.results || [];
  },

  /**
   * Creates a new membership package (admin)
   */
  async createPackage(packageData) {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/packages/create`, packageData);
    return response?.data;
  },

  /**
   * Updates a membership package (admin)
   */
  async updatePackage(packageData) {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/packages/update`, packageData);
    return response?.data;
  },

  /**
   * Deletes a membership package (admin)
   */
  async deletePackage(packageId) {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/packages/delete`, { id: packageId });
    return response?.data;
  },

  /**
   * Fetches verified active student roster (admin)
   */
  async getStudents(params = {}) {
    const response = await apiClient.get(`${DASHBOARD_API_BASE}/students/fetch_all`, { params });
    return response?.data?.results || [];
  },

  /**
   * Fetches complete student roster including unverified registrations (admin)
   */
  async getAllStudents(params = {}) {
    const response = await apiClient.get(`${DASHBOARD_API_BASE}/students/fetch_roster`, { params });
    return response?.data?.results || [];
  },

  /**
   * Fetches student aggregate counts (total, verified, pending KYC, paid)
   */
  async getStudentStats() {
    const response = await apiClient.get(`${DASHBOARD_API_BASE}/students/stats`);
    return response?.data?.results || { total: 0, verified: 0, pending_kyc: 0, paid: 0 };
  },

  /**
   * Fetches pending action counts for admin badge alerts
   */
  async getPendingCounts() {
    const response = await apiClient.get(`${DASHBOARD_API_BASE}/pending_counts`);
    return response?.data?.results || { pendingPayments: 0, pendingUsers: 0 };
  },

  /**
   * Audits student KYC/Police verification status (admin)
   */
  async verifyStudentKyc(studentId, isVerified) {
    const response = await apiClient.post(`${USER_API_BASE}/verify-kyc`, {
      user_id: studentId,
      verified: isVerified ? 1 : 0,
    });
    return response?.data;
  },

  /**
   * Fetches library administrative announcements and notices
   */
  async getLibraryNews(params = {}) {
    const response = await apiClient.get(`${DASHBOARD_API_BASE}/news`, { params });
    return response?.data?.data || response?.data?.results || [];
  },

  /**
   * Posts a new library notice (admin)
   */
  async createLibraryNews(newsPayload) {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/news/create`, newsPayload);
    return response?.data;
  },

  /**
   * Updates a library notice (admin)
   */
  async updateLibraryNews(newsId, newsPayload) {
    const response = await apiClient.put(`${DASHBOARD_API_BASE}/news/update/${newsId}`, newsPayload);
    return response?.data;
  },

  /**
   * Deletes a library notice (admin)
   */
  async deleteLibraryNews(newsId) {
    const response = await apiClient.delete(`${DASHBOARD_API_BASE}/news/delete/${newsId}`);
    return response?.data;
  },

  /**
   * Fetches the digital patron ID card data and barcode credentials
   */
  async getPatronCard(studentId = null) {
    const params = studentId ? { student_id: studentId } : {};
    const response = await apiClient.get(`${DASHBOARD_API_BASE}/patron_card`, { params });
    return response?.data?.results;
  },
};

export default adminService;

/**
 * @file adminService.js
 * @description Administrative operations: student roster, KYC audits, operational hours, membership packages, notices, and digital patron cards.
 * 100% matched to Express backend routes.
 */

import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config/api';

export const adminService = {
  /**
   * Fetches official library operational timings and seasonal note
   */
  async getLibraryTimings() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.TIMINGS);
    const results = response?.data?.results;
    const data = results?.data || results;
    return (data && (data.open_time || data.close_time)) ? data : {
      open_time: '07:00 AM',
      close_time: '09:00 PM',
      days: 'Monday – Sunday',
      status_note: 'Open 7 days a week • Winter heating & quiet cabins active',
      is_open_today: true,
    };
  },

  /**
   * Updates library operational timings (admin)
   */
  async updateLibraryTimings(timingsData) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.TIMINGS_UPDATE, timingsData);
    const results = response?.data?.results;
    return results?.data || results || response?.data;
  },

  /**
   * Fetches all membership tiers/packages
   */
  async getPackages() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.PACKAGES);
    const list = response?.data?.results?.data || response?.data?.results || [];
    return Array.isArray(list) ? list : [];
  },

  /**
   * Creates a new membership package (admin)
   */
  async createPackage(packageData) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.PACKAGE_CREATE, packageData);
    return response?.data;
  },

  /**
   * Updates a membership package (admin)
   */
  async updatePackage(packageData) {
    const id = packageData._id || packageData.id;
    const response = await apiClient.put(ENDPOINTS.DASHBOARD.PACKAGE_UPDATE(id), packageData);
    return response?.data;
  },

  /**
   * Deletes a membership package (admin)
   */
  async deletePackage(packageId) {
    const response = await apiClient.delete(ENDPOINTS.DASHBOARD.PACKAGE_DELETE(packageId));
    return response?.data;
  },

  /**
   * Fetches active student roster (admin)
   */
  async getStudents(params = {}) {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.STUDENTS_LIST, { params });
    return response?.data?.results?.data || response?.data?.results || [];
  },

  /**
   * Fetches complete student roster including unverified registrations (admin)
   */
  async getAllStudents(params = {}) {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.STUDENTS_LIST, { params });
    return response?.data?.results?.data || response?.data?.results || [];
  },

  /**
   * Creates a new student record manually (admin)
   */
  async createStudent(studentData) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.STUDENT_CREATE, studentData);
    return response?.data;
  },

  /**
   * Fetches student aggregate counts (total, verified, pending KYC, paid)
   */
  async getStudentStats() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.STUDENT_STATS);
    return response?.data?.results || { total: 0, verified: 0, pending_kyc: 0, paid: 0 };
  },

  /**
   * Fetches pending action counts for admin badge alerts
   */
  async getPendingCounts() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.PENDING_COUNTS);
    return response?.data?.results || { pendingPayments: 0, pendingUsers: 0 };
  },

  /**
   * Verifies/Audits student KYC status (admin)
   */
  async verifyStudentKyc(studentId, isVerified) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.STUDENT_VERIFY(studentId), {
      verified: isVerified ? 1 : 0,
    });
    return response?.data;
  },

  /**
   * Toggles student active/suspended status (admin)
   */
  async toggleStudentStatus(studentId, status) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.STUDENT_TOGGLE_STATUS(studentId), { status });
    return response?.data;
  },

  /**
   * Resets student password (admin)
   */
  async resetStudentPassword(studentId, newPassword) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.STUDENT_CHANGE_PASSWORD(studentId), {
      password: newPassword,
    });
    return response?.data;
  },

  /**
   * Fetches library administrative news bulletins
   */
  async getNews() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.NEWS);
    return response?.data?.results || [];
  },

  /**
   * Creates news bulletin (admin)
   */
  async createNews(payload) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.NEWS_CREATE, payload);
    return response?.data;
  },

  /**
   * Updates news bulletin (admin)
   */
  async updateNews(id, payload) {
    const response = await apiClient.put(ENDPOINTS.DASHBOARD.NEWS_UPDATE(id), payload);
    return response?.data;
  },

  /**
   * Deletes news bulletin (admin)
   */
  async deleteNews(id) {
    const response = await apiClient.delete(ENDPOINTS.DASHBOARD.NEWS_DELETE(id));
    return response?.data;
  },

  /**
   * Fetches digital patron library pass card for logged-in user
   */
  async getPatronCard() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.PATRON_CARD);
    return response?.data?.results;
  },
};

export default adminService;

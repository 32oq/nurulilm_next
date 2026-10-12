/**
 * @file catalogService.js
 * @description Catalog, books, categories, and exam repository service.
 */

import { apiClient } from './apiClient';
import { DASHBOARD_API_BASE } from '../config/api';

export const catalogService = {
  /**
   * Fetches books catalog with optional search, category and pagination filters
   */
  async getBooks(params = {}) {
    const response = await apiClient.get(`${DASHBOARD_API_BASE}/resources/fetch_all`, { params });
    return response?.data?.results || [];
  },

  /**
   * Fetches single resource by ID
   */
  async getResourceById(id) {
    const response = await apiClient.get(`${DASHBOARD_API_BASE}/resources/fetch`, { params: { id } });
    return response?.data?.results;
  },

  /**
   * Adds new catalog book (admin)
   */
  async addResource(bookData) {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/resources/add`, bookData);
    return response?.data;
  },

  /**
   * Edits catalog book (admin)
   */
  async editResource(bookData) {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/resources/edit`, bookData);
    return response?.data;
  },

  /**
   * Removes catalog book (admin)
   */
  async removeResource(id) {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/resources/delete`, { id });
    return response?.data;
  },

  /**
   * Fetches verified competitive exam papers and mock test sets
   */
  async getExams(params = {}) {
    const response = await apiClient.get(`${DASHBOARD_API_BASE}/exams/fetch_all`, { params });
    return response?.data?.results || [];
  },

  /**
   * Increments paper download counter
   */
  async incrementExamDownload(examId) {
    const response = await apiClient.post(`${DASHBOARD_API_BASE}/exams/increment_download`, { id: examId });
    return response?.data;
  },
};

export default catalogService;

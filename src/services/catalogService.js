/**
 * @file catalogService.js
 * @description Catalog, books, categories, and exam repository service.
 * 100% matched to Express backend routes.
 */

import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config/api';

export const catalogService = {
  /**
   * Fetches books catalog with optional search, category and pagination filters
   */
  async getBooks(params = {}, options = {}) {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.RESOURCES, { params, ...options });
    const data = response?.data?.results?.data || response?.data?.results || [];
    return Array.isArray(data) ? data : [];
  },

  /**
   * Adds new catalog book (admin)
   */
  async addResource(bookData) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.RESOURCE_CREATE, bookData);
    return response?.data;
  },

  /**
   * Edits catalog book (admin)
   */
  async editResource(id, bookData) {
    const response = await apiClient.put(ENDPOINTS.DASHBOARD.RESOURCE_UPDATE(id), bookData);
    return response?.data;
  },

  /**
   * Removes catalog book (admin)
   */
  async removeResource(id) {
    const response = await apiClient.delete(ENDPOINTS.DASHBOARD.RESOURCE_DELETE(id));
    return response?.data;
  },

  /**
   * Fetches verified competitive exam papers and mock test sets
   */
  async getExams(params = {}) {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.EXAMS_LIST, { params });
    return response?.data?.results || [];
  },

  /**
   * Fetches single exam paper by ID
   */
  async getExamById(id) {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.EXAM_BY_ID(id));
    return response?.data?.results;
  },

  /**
   * Increments paper download counter
   */
  async incrementExamDownload(examId) {
    const response = await apiClient.post(ENDPOINTS.DASHBOARD.EXAM_DOWNLOAD(examId));
    return response?.data;
  },
};

export default catalogService;

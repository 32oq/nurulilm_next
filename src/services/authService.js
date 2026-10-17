/**
 * @file authService.js
 * @description Dedicated business logic and API service for authentication & identity operations.
 */

import { apiClient, setClientToken, getClientToken } from './apiClient';
import { USER_API_BASE } from '../config/api';

export const authService = {
  /**
   * Refreshes JWT session token using HttpOnly cookie
   */
  async refreshSession() {
    try {
      const response = await apiClient.post(`${USER_API_BASE}/token/refresh`, {});
      const results = response?.data?.results;
      const token = results?.access_token;
      const user = results?.user || results;
      if (token) {
        setClientToken(token);
      }
      return { token, user };
    } catch {
      setClientToken(null);
      return { token: null, user: null };
    }
  },

  /**
   * Authenticates patron with credentials
   * @param {{ unique_id: string, value: string, password?: string }} credentials
   */
  async login(credentials) {
    const response = await apiClient.post(`${USER_API_BASE}/login`, credentials);
    const results = response?.data?.results;
    const user = results?.user || results;
    const token = results?.access_token;
    if (token) {
      setClientToken(token);
    }
    return { user, token };
  },

  /**
   * Registers a new student patron
   */
  async register(credentials) {
    const response = await apiClient.post(`${USER_API_BASE}/create`, credentials);
    if (response?.data?.error?.code) {
      throw new Error(response.data.error.msg || 'Registration failed');
    }
    return response?.data?.results;
  },

  /**
   * Invalidates session and clears credentials
   */
  async logout(token = null) {
    try {
      const activeToken = token || getClientToken();
      await apiClient.post(
        `${USER_API_BASE}/logout`,
        {},
        activeToken ? { headers: { 'x-access-token': activeToken } } : {}
      );
    } finally {
      setClientToken(null);
    }
  },

  /**
   * Checks if user ID or email exists
   */
  async validateUserId(userId) {
    const response = await apiClient.post(`${USER_API_BASE}/valid-uid`, { user_id: userId });
    const data = response?.data?.results;
    return data?.data || false;
  },

  /**
   * Requests password reset OTP
   */
  async requestOtp(email) {
    const response = await apiClient.post(`${USER_API_BASE}/otp/get`, { email });
    return response?.data?.results?.token || null;
  },

  /**
   * Verifies OTP code
   */
  async verifyOtp(data) {
    const response = await apiClient.post(`${USER_API_BASE}/otp/validate`, {
      id: data?.id,
      otp: data?.otp,
    });
    return response?.data?.results?.valid_otp;
  },

  /**
   * Updates password after verification
   */
  async updatePassword({ id, pswd }) {
    const response = await apiClient.post(`${USER_API_BASE}/pswd/update`, {
      id,
      password: pswd,
    });
    return !response?.data?.error?.code;
  },

  /**
   * Updates user demographic info
   */
  async updateUserInfo(data) {
    const token = getClientToken();
    const response = await apiClient.post(
      `${USER_API_BASE}/update`,
      data,
      token ? { headers: { 'x-access-token': token } } : {}
    );
    return !response?.data?.error?.code;
  },

  /**
   * Uploads passport profile photo
   */
  async uploadPhoto(photoData) {
    const token = getClientToken();
    const response = await apiClient.post(
      `${USER_API_BASE}/upload-photo`,
      { photo: photoData },
      token ? { headers: { 'x-access-token': token } } : {}
    );
    return response?.data?.results?.profile_photo;
  },

  /**
   * Completes onboarding registration step
   */
  async completeOnboarding(data) {
    const token = getClientToken();
    const response = await apiClient.post(
      `${USER_API_BASE}/onboarding/complete`,
      data,
      token ? { headers: { 'x-access-token': token } } : {}
    );
    return response?.data?.results;
  },

  /**
   * Refreshes active user profile data
   */
  async refreshUser() {
    const token = getClientToken();
    if (!token) return null;
    const response = await apiClient.get(`${USER_API_BASE}/me`, {
      headers: { 'x-access-token': token },
    });
    return response?.data?.results?.user || response?.data?.results;
  },

  /**
   * Submits police/KYC verification with photo
   */
  async submitVerification(formData) {
    const response = await apiClient.post(
      `${USER_API_BASE}/police-verification`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response?.data;
  },

  /**
   * Fetches a cryptographic human verification challenge
   */
  async getCaptcha() {
    const response = await apiClient.get(`${USER_API_BASE}/captcha/generate`);
    return response?.data?.results;
  },
};

export default authService;

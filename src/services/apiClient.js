/**
 * @file apiClient.js
 * @description Centralized HTTP client using Axios for Nurul Ilm Library.
 * Handles withCredentials, memory authorization headers, timeout, and response error normalization.
 */

import axios from 'axios';
import { ENV } from '../config/env';
import { AppError, NetworkError, AuthenticationError } from '../utils/errors';

// Memory token store exported for auth context interoperability
let memoryToken = null;

export const setClientToken = (token) => {
  memoryToken = token;
};

export const getClientToken = () => memoryToken;

/**
 * Pre-configured Axios instance
 */
export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.REQUEST_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach authorization token if available
apiClient.interceptors.request.use(
  (config) => {
    if (memoryToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${memoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalize error responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(new NetworkError());
    }

    const { status, data } = error.response;
    const message = data?.message || data?.error || data?.msg || error.message || 'Server error';

    if (status === 401) {
      return Promise.reject(new AuthenticationError(message));
    }

    return Promise.reject(new AppError(message, `HTTP_${status}`, status, data));
  }
);

export default apiClient;

/**
 * @file apiClient.js
 * @description Centralized HTTP client using Axios for Nurul Ilm Library.
 * 
 * Security & Tokenization Architecture:
 * 1. Proxy Routing: All requests route through the Next.js same-origin proxy (/api/*).
 * 2. In-Memory Tokenization: Access token is stored strictly in volatile JavaScript RAM (never in localStorage/sessionStorage).
 * 3. HttpOnly Refresh Token: The refresh token is maintained exclusively in an HttpOnly, Secure, SameSite=Lax cookie set by the server.
 * 4. Silent Refresh Interceptor: Automatically refreshes expired access tokens and seamlessly replays queued requests without session dropouts.
 */

import axios from 'axios';
import { ENV } from '../config/env';
import { AppError, NetworkError, AuthenticationError } from '../utils/errors';

// In-memory token store: accessible only to active runtime, never persisted to disk or Web Storage
let memoryToken = null;

export const setClientToken = (token) => {
  memoryToken = token || null;
};

export const getClientToken = () => memoryToken;

/**
 * Pre-configured Axios instance communicating through the Next.js reverse proxy
 */
export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.REQUEST_TIMEOUT_MS,
  withCredentials: true, // Guarantees browser attaches HttpOnly cookies across the proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach volatile in-memory authorization bearer if present
apiClient.interceptors.request.use(
  (config) => {
    // Prevent accidental duplicate /api/api prefixing if URL already starts with /api
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api/, '');
    }
    if (memoryToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${memoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Concurrency queue for silent refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: silent token refresh and error normalization
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(new NetworkError());
    }

    const { status, data } = error.response;
    const message = data?.message || data?.error?.msg || data?.error || data?.msg || error.message || 'Server error';

    // Handle 401 Unauthorized with silent token refresh
    if (status === 401 && originalRequest) {
      const requestUrl = originalRequest.url || '';
      const isAuthEndpoint =
        requestUrl.includes('/user/login') ||
        requestUrl.includes('/user/token/refresh') ||
        requestUrl.includes('/user/create');

      // Do not attempt refresh on auth endpoints or already-retried requests
      if (isAuthEndpoint || originalRequest._retry) {
        if (requestUrl.includes('/user/token/refresh')) {
          setClientToken(null);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nurulilm:auth-expired'));
          }
        }
        return Promise.reject(new AuthenticationError(message));
      }

      // If already refreshing, queue the request until refresh completes
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Direct un-intercepted refresh call via same-origin proxy with HttpOnly cookie
        const refreshResponse = await axios.post(
          `${ENV.API_BASE_URL}/user/token/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken =
          refreshResponse?.data?.results?.access_token ||
          refreshResponse?.data?.access_token;

        if (newAccessToken) {
          setClientToken(newAccessToken);
          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh response did not return an access token');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setClientToken(null);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('nurulilm:auth-expired'));
        }
        return Promise.reject(new AuthenticationError('Session expired. Please log in again.'));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(new AppError(message, `HTTP_${status}`, status, data));
  }
);

export default apiClient;

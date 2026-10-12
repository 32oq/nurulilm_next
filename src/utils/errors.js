/**
 * @file errors.js
 * @description Standardized error normalization and application error primitives.
 * Guarantees human-readable error messages for UI components while preserving stack traces.
 */

export class AppError extends Error {
  constructor(message, code = 'APP_ERROR', status = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network connection failed. Please verify your internet or try again.') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Your session has expired. Please sign in again.') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Normalizes any error object, Axios error, or string into a clean user-facing message.
 * @param {unknown} error - The caught error
 * @param {string} fallback - Fallback message if extraction yields nothing
 * @returns {string} Human-readable error message
 */
export function getErrorMessage(error, fallback = 'An unexpected error occurred. Please try again.') {
  if (!error) return fallback;

  if (typeof error === 'string') return error;

  // Axios response error structure
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string' && data.length < 200) return data;
    if (data.message) return data.message;
    if (data.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
    if (data.msg) return data.msg;
  }

  // Axios network error without response
  if (error.request && !error.response) {
    return 'Unable to reach library server. Please check your network connection.';
  }

  // Standard Error object
  if (error.message && typeof error.message === 'string') {
    // Avoid raw Axios internal message dumps
    if (error.message.includes('Network Error')) {
      return 'Network connection issue. Please check your connection and try again.';
    }
    return error.message;
  }

  return fallback;
}

/**
 * Safe asynchronous execution wrapper
 * @template T
 * @param {() => Promise<T>} fn
 * @returns {Promise<[T | null, string | null]>} Tuple of [data, errorMessage]
 */
export async function tryCatch(fn) {
  try {
    const data = await fn();
    return [data, null];
  } catch (err) {
    return [null, getErrorMessage(err)];
  }
}

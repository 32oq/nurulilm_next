/**
 * @file env.js
 * @description Centralized, validated environment configuration for Nurul Ilm Library.
 * Isolates process.env access and provides predictable defaults with runtime safety.
 */

const isBrowser = typeof window !== 'undefined';

/**
 * Validated environment settings
 */
export const ENV = Object.freeze({
  /**
   * Node environment: 'development' | 'production' | 'test'
   */
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  IS_DEV: process.env.NODE_ENV !== 'production',

  /**
   * Base URL for API requests.
   * In browser client: defaults to empty string '' to leverage Next.js rewrites proxy.
   * On server side: defaults to direct local backend port 6001.
   */
  API_BASE_URL: isBrowser
    ? (process.env.NEXT_PUBLIC_API_URL !== undefined ? process.env.NEXT_PUBLIC_API_URL : '/api')
    : (process.env.BACKEND_URL || 'http://127.0.0.1:6001'),

  /**
   * Canonical site URL for metadata, SEO, and social shares.
   */
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://nurulilmlibrary.com',

  /**
   * Institutional defaults
   */
  LIBRARY_NAME: 'Nurul Ilm Library',
  LIBRARY_LOCATION: 'New Bus Stand Road, Handwara, Jammu & Kashmir 193221',
  LIBRARY_PHONE: '+91 9906000000',
  LIBRARY_SUPPORT_EMAIL: 'support@nurulilmlibrary.com',

  /**
   * Request timeout in milliseconds
   */
  REQUEST_TIMEOUT_MS: 15000,
});

export default ENV;

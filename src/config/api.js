/**
 * @file api.js
 * @description API endpoint contracts and route base resolver for Nurul Ilm Library.
 * Consumes validated environment settings from config/env.js.
 */

import { ENV } from './env';

export const getApiBase = () => ENV.API_BASE_URL;

export const API_BASE = getApiBase();
export const USER_API_BASE = `${API_BASE}/user`;
export const DASHBOARD_API_BASE = `${API_BASE}/dashboard`;
export const PAYMENTS_API_BASE = `${API_BASE}/payments`;

export const ENDPOINTS = Object.freeze({
  AUTH: {
    LOGIN: `${USER_API_BASE}/login`,
    REGISTER: `${USER_API_BASE}/register`,
    SESSION: `${USER_API_BASE}/session`,
    LOGOUT: `${USER_API_BASE}/logout`,
    FORGOT_PASSWORD: `${USER_API_BASE}/forgot-password`,
    RESET_PASSWORD: `${USER_API_BASE}/reset-password`,
    POLICE_VERIFICATION: `${USER_API_BASE}/police-verification`,
  },
  DASHBOARD: {
    TIMINGS: `${DASHBOARD_API_BASE}/timings`,
    PACKAGES: `${DASHBOARD_API_BASE}/packages`,
    STUDENTS: `${DASHBOARD_API_BASE}/students`,
    DESKS: `${DASHBOARD_API_BASE}/desks`,
    RESOURCES: `${DASHBOARD_API_BASE}/resources`,
    LOANS: `${DASHBOARD_API_BASE}/loans`,
    FOCUS_SPRINT: `${DASHBOARD_API_BASE}/focus_sprint`,
    COMMUNITY_NOTES: `${DASHBOARD_API_BASE}/community_notes`,
    NEWS: `${DASHBOARD_API_BASE}/news`,
    EXAMS: `${DASHBOARD_API_BASE}/exams`,
    PATRON_CARD: `${DASHBOARD_API_BASE}/patron_card`,
  },
  PAYMENTS: {
    CHECKOUT: `${PAYMENTS_API_BASE}/checkout`,
    FETCH_ALL: `${PAYMENTS_API_BASE}/fetch_all`,
    VERIFY: `${PAYMENTS_API_BASE}/verify`,
    EARNINGS: `${PAYMENTS_API_BASE}/earnings`,
  },
});

export default {
  API_BASE,
  USER_API_BASE,
  DASHBOARD_API_BASE,
  PAYMENTS_API_BASE,
  ENDPOINTS,
  getApiBase,
};

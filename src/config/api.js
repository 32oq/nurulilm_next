/**
 * @file api.js
 * @description API endpoint contracts and route base resolver for Nurul Ilm Library.
 * 100% matched to Express backend routes (nurulilm_be).
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
    REGISTER: `${USER_API_BASE}/create`,
    REFRESH: `${USER_API_BASE}/token/refresh`,
    LOGOUT: `${USER_API_BASE}/logout`,
    ME: `${USER_API_BASE}/me`,
    UPDATE: `${USER_API_BASE}/update`,
    UPLOAD_PHOTO: `${USER_API_BASE}/upload-photo`,
    ONBOARDING_COMPLETE: `${USER_API_BASE}/onboarding/complete`,
    ONBOARDING_STATUS: `${USER_API_BASE}/onboarding/status`,
    VALID_UID: `${USER_API_BASE}/valid-uid`,
    OTP_GET: `${USER_API_BASE}/otp/get`,
    OTP_VALIDATE: `${USER_API_BASE}/otp/validate`,
    PASSWORD_UPDATE: `${USER_API_BASE}/pswd/update`,
  },
  DASHBOARD: {
    TIMINGS: `${DASHBOARD_API_BASE}/library/timings`,
    TIMINGS_UPDATE: `${DASHBOARD_API_BASE}/library/timings/update`,
    PACKAGES: `${DASHBOARD_API_BASE}/package/fetch`,
    PACKAGE_CREATE: `${DASHBOARD_API_BASE}/package/new`,
    PACKAGE_UPDATE: (id) => `${DASHBOARD_API_BASE}/package/update/${id}`,
    PACKAGE_DELETE: (id) => `${DASHBOARD_API_BASE}/package/delete/${id}`,
    PENDING_PAYMENTS: `${DASHBOARD_API_BASE}/pending/payments`,
    APPROVE_PAYMENT: (id) => {
      const validId = (id && id !== 'undefined') ? id : null;
      if (!validId) throw new Error('APPROVE_PAYMENT requires a valid payment or reference ID');
      return `${DASHBOARD_API_BASE}/payments/approve/${validId}`;
    },
    RESOURCES: `${DASHBOARD_API_BASE}/resources`,
    RESOURCE_CREATE: `${DASHBOARD_API_BASE}/resources/new`,
    RESOURCE_UPDATE: (id) => `${DASHBOARD_API_BASE}/resources/update/${id}`,
    RESOURCE_DELETE: (id) => `${DASHBOARD_API_BASE}/resources/delete/${id}`,
    LOANS_LIST: `${DASHBOARD_API_BASE}/loans/list`,
    LOANS_MY: `${DASHBOARD_API_BASE}/loans/my`,
    LOANS_STUDENTS: `${DASHBOARD_API_BASE}/loans/students`,
    LOANS_ISSUE: `${DASHBOARD_API_BASE}/loans/issue`,
    LOANS_RETURN: (id) => `${DASHBOARD_API_BASE}/loans/return/${id}`,
    PENDING_COUNTS: `${DASHBOARD_API_BASE}/pending/counts`,
    STUDENTS_LIST: `${DASHBOARD_API_BASE}/users/list`,
    STUDENT_CREATE: `${DASHBOARD_API_BASE}/users/create`,
    STUDENT_VERIFY: (id) => `${DASHBOARD_API_BASE}/users/verify/${id}`,
    STUDENT_CHANGE_PASSWORD: (id) => `${DASHBOARD_API_BASE}/users/change-password/${id}`,
    STUDENT_TOGGLE_STATUS: (id) => `${DASHBOARD_API_BASE}/users/toggle-status/${id}`,
    STUDENT_STATS: `${DASHBOARD_API_BASE}/users/stats`,
    NEWS: `${DASHBOARD_API_BASE}/news`,
    NEWS_CREATE: `${DASHBOARD_API_BASE}/news/create`,
    NEWS_UPDATE: (id) => `${DASHBOARD_API_BASE}/news/update/${id}`,
    NEWS_DELETE: (id) => `${DASHBOARD_API_BASE}/news/delete/${id}`,
    RECORD_PAYMENT: `${DASHBOARD_API_BASE}/payments/record`,
    EARNINGS: `${DASHBOARD_API_BASE}/payments/earnings`,
    COMMUNITY_NOTES_PUBLISHED: `${DASHBOARD_API_BASE}/community-notes/published`,
    COMMUNITY_NOTES_SUBMIT: `${DASHBOARD_API_BASE}/community-notes/submit`,
    COMMUNITY_NOTES_LIKE: (id) => `${DASHBOARD_API_BASE}/community-notes/like/${id}`,
    COMMUNITY_NOTES_ADMIN_ALL: `${DASHBOARD_API_BASE}/community-notes/admin/all`,
    COMMUNITY_NOTES_AUDIT: (id) => `${DASHBOARD_API_BASE}/community-notes/audit/${id}`,
    COMMUNITY_NOTES_DELETE: (id) => `${DASHBOARD_API_BASE}/community-notes/${id}`,
    FOCUS_SPRINT_LOG: `${DASHBOARD_API_BASE}/focus-sprints/log`,
    FOCUS_SPRINT_HISTORY: `${DASHBOARD_API_BASE}/focus-sprints/history`,
    FOCUS_SPRINT_LEADERBOARD: `${DASHBOARD_API_BASE}/focus-sprints/leaderboard`,
    FOCUS_SPRINT_DELETE: (id) => `${DASHBOARD_API_BASE}/focus-sprints/${id}`,
    DESKS_LIST: `${DASHBOARD_API_BASE}/desks/list`,
    DESK_RESERVE: `${DASHBOARD_API_BASE}/desks/reserve`,
    DESK_MY: `${DASHBOARD_API_BASE}/desks/my`,
    DESK_CHANGE_REQUEST: `${DASHBOARD_API_BASE}/desks/change-request`,
    DESK_CHANGE_REQUESTS_MY: `${DASHBOARD_API_BASE}/desks/change-requests/my`,
    DESKS_ADMIN_CHANGE_REQUESTS: `${DASHBOARD_API_BASE}/desks/admin/change-requests`,
    DESK_ADMIN_APPROVE_REQUEST: (id) => `${DASHBOARD_API_BASE}/desks/admin/change-requests/${id}/approve`,
    DESK_ADMIN_REJECT_REQUEST: (id) => `${DASHBOARD_API_BASE}/desks/admin/change-requests/${id}/reject`,
    DESK_ADMIN_REASSIGN: `${DASHBOARD_API_BASE}/desks/admin/reassign`,
    DESK_ADMIN_RELEASE: (id) => `${DASHBOARD_API_BASE}/desks/admin/release/${id}`,
    DESK_ADMIN_CREATE: `${DASHBOARD_API_BASE}/desks/admin/create`,
    DESK_ADMIN_TOGGLE_STATUS: (id) => `${DASHBOARD_API_BASE}/desks/admin/status/${id}`,
    EXAMS_LIST: `${DASHBOARD_API_BASE}/exams/list`,
    EXAM_BY_ID: (id) => `${DASHBOARD_API_BASE}/exams/paper/${id}`,
    EXAM_DOWNLOAD: (id) => `${DASHBOARD_API_BASE}/exams/download/${id}`,
    PATRON_CARD: `${DASHBOARD_API_BASE}/patron/card`,
  },
  PAYMENTS: {
    CHECKOUT: `${PAYMENTS_API_BASE}/checkout`,
    FETCH: `${PAYMENTS_API_BASE}/fetch`,
    UPDATE_TXN: `${PAYMENTS_API_BASE}/update-txn`,
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

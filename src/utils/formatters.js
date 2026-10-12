/**
 * @file formatters.js
 * @description Standardized data, currency, date, and text formatting utilities.
 */

import moment from 'moment';

/**
 * Formats a numeric amount in Indian Rupees (₹)
 * @param {number|string} amount
 * @returns {string} Formatted INR string (e.g., '₹1,500')
 */
export function formatINR(amount) {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
}

/**
 * Formats a date string into standard institutional format
 * @param {string|Date|number} date
 * @param {string} formatPattern - Default 'DD MMM YYYY'
 * @returns {string} Formatted date string
 */
export function formatDate(date, formatPattern = 'DD MMM YYYY') {
  if (!date) return '-';
  const m = moment(date);
  return m.isValid() ? m.format(formatPattern) : '-';
}

/**
 * Formats a relative timestamp (e.g., '2 hours ago', 'Yesterday')
 * @param {string|Date|number} date
 * @returns {string}
 */
export function formatRelativeDate(date) {
  if (!date) return '-';
  const m = moment(date);
  return m.isValid() ? m.fromNow() : '-';
}

/**
 * Formats duration in minutes to readable hours and minutes
 * @param {number} minutes
 * @returns {string} e.g. '2h 15m' or '45m'
 */
export function formatDuration(minutes) {
  const m = Math.max(0, Number(minutes) || 0);
  const hrs = Math.floor(m / 60);
  const mins = m % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

/**
 * Formats patron's full name with proper fallbacks
 * @param {object} user
 * @returns {string}
 */
export function formatPatronName(user) {
  if (!user) return 'Patron';
  if (user.full_name) return user.full_name;
  const parts = [user.first_name, user.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : (user.username || user.email || 'Patron');
}

/**
 * Extracts patron initials for crest avatars
 * @param {object} user
 * @returns {string}
 */
export function getPatronInitials(user) {
  if (!user) return 'P';
  const first = user.first_name?.[0] || '';
  const last = user.last_name?.[0] || '';
  const combined = (first + last).toUpperCase();
  return combined || (user.full_name?.[0]?.toUpperCase() || 'P');
}

export const formatPatronInitials = getPatronInitials;

/**
 * Formats phone number into standard display
 * @param {string} phone
 * @returns {string}
 */
export function formatPhone(phone) {
  if (!phone) return '-';
  const clean = String(phone).replace(/\s+/g, '');
  if (clean.length === 10) return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  return clean;
}

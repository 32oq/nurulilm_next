/**
 * @file storage.js
 * @description Safe localStorage and sessionStorage helpers with SSR tolerance and JSON parsing guards.
 */

const isBrowser = typeof window !== 'undefined';

export const storage = {
  get(key, defaultValue = null) {
    if (!isBrowser) return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[storage.set] Failed to persist key "${key}":`, e);
    }
  },

  remove(key) {
    if (!isBrowser) return;
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[storage.remove] Failed to remove key "${key}":`, e);
    }
  },

  getString(key, defaultValue = '') {
    if (!isBrowser) return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? item : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  setString(key, value) {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(key, String(value));
    } catch (e) {
      console.warn(`[storage.setString] Failed to set key "${key}":`, e);
    }
  },
};

export default storage;

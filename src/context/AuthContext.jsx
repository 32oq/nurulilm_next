/**
 * @file AuthContext.jsx
 * @description Authentication and Patron Session State Provider.
 * Delegates API communications to authService and keeps access tokens securely in runtime memory.
 */

"use client";

import React, { createContext, useReducer, useContext, useEffect, useMemo, useCallback } from 'react';
import { authService } from '../services/authService';
import { setClientToken, getClientToken } from '../services/apiClient';
import { storage } from '../utils/storage';
import { getErrorMessage } from '../utils/errors';

export const getMemoryToken = () => getClientToken();
export const setMemoryToken = (token) => setClientToken(token);

export const initialAuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  authRestoring: true,
  error: null,
  act: null,
  id: null,
};

export const AUTH_ACTIONS = Object.freeze({
  REQUEST_START: 'AUTH/REQUEST_START',
  RESTORE_START: 'AUTH/RESTORE_START',
  LOGIN_SUCCESS: 'AUTH/LOGIN_SUCCESS',
  REGISTER_SUCCESS: 'AUTH/REGISTER_SUCCESS',
  LOGOUT: 'AUTH/LOGOUT',
  VALIDATE_USER_ID: 'AUTH/VALIDATE_USER_ID',
  REQUEST_FAILURE: 'AUTH/REQUEST_FAILURE',
  REQUEST_OTP: 'AUTH/REQUEST_OTP',
  VERIFY_OTP: 'AUTH/VERIFY_OTP',
  UPDATE_PSWD: 'AUTH/UPDATE_PSWD',
  PATCH_USER: 'AUTH/PATCH_USER',
  RESTORE_FINISHED: 'AUTH/RESTORE_FINISHED',
});

function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.REQUEST_START:
      return { ...state, loading: true, error: null };

    case AUTH_ACTIONS.RESTORE_START:
      return { ...state, loading: true, authRestoring: true, error: null };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        loading: false,
        authRestoring: false,
        error: null,
        act: action.payload?.user?.act,
      };

    case AUTH_ACTIONS.RESTORE_FINISHED:
      return {
        ...state,
        loading: false,
        authRestoring: false,
        isAuthenticated: false,
        user: null,
        act: null,
      };

    case AUTH_ACTIONS.VALIDATE_USER_ID:
      return { ...state, exist: false };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialAuthState,
        loading: false,
        authRestoring: false,
        isAuthenticated: false,
        user: null,
        act: null,
      };

    case AUTH_ACTIONS.REQUEST_FAILURE:
      return { ...state, loading: false, error: action.payload.error };

    case AUTH_ACTIONS.REQUEST_OTP:
      return { ...state, otp: true, id: action.payload?.id };

    case AUTH_ACTIONS.UPDATE_PSWD:
    case AUTH_ACTIONS.VERIFY_OTP:
      return { ...state };

    case AUTH_ACTIONS.PATCH_USER:
      return { ...state, user: { ...state.user, ...action.payload } };

    default:
      throw new Error(`Unknown auth action type: ${action.type}`);
  }
}

const AuthContext = createContext(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Restore session via secure HttpOnly cookie on initial mount
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const { token, user } = await authService.refreshSession();
        if (token && user && isMounted) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user },
          });
        } else if (isMounted) {
          setClientToken(null);
          dispatch({ type: AUTH_ACTIONS.RESTORE_FINISHED });
        }
      } catch {
        if (isMounted) {
          setClientToken(null);
          dispatch({ type: AUTH_ACTIONS.RESTORE_FINISHED });
        }
      }
    };

    restoreSession();

    // Global listener for silent refresh failure or session expiration
    const handleAuthExpired = () => {
      if (isMounted) {
        setClientToken(null);
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    window.addEventListener('nurulilm:auth-expired', handleAuthExpired);

    return () => {
      isMounted = false;
      window.removeEventListener('nurulilm:auth-expired', handleAuthExpired);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.REQUEST_START });
    try {
      const { user } = await authService.login(credentials);
      // Clean up any legacy storage keys to guarantee zero sensitive data in Web Storage
      storage.remove('user');
      storage.remove('has_session');
      storage.remove('last_act');
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user } });
      return true;
    } catch (error) {
      const message = getErrorMessage(error, 'Login failed. Please check your credentials.');
      dispatch({ type: AUTH_ACTIONS.REQUEST_FAILURE, payload: { error: message } });
      return false;
    }
  }, []);

  const register = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.REQUEST_START });
    try {
      const createdUser = await authService.register(credentials);
      const loginValue = credentials?.email || createdUser?.email || createdUser?.user_id || credentials?.user_id;
      const loginKey = loginValue && String(loginValue).includes('@') ? 'email' : 'user_id';
      await login({ unique_id: loginKey, value: loginValue, password: credentials?.password });
      return true;
    } catch (error) {
      const message = getErrorMessage(error, 'Registration failed. Please try again.');
      dispatch({ type: AUTH_ACTIONS.REQUEST_FAILURE, payload: { error: message } });
      return false;
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Best-effort server invalidation
    } finally {
      setClientToken(null);
      storage.remove('user');
      storage.remove('has_session');
      storage.remove('last_act');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  const validateUserId = useCallback(async (userId) => {
    dispatch({ type: AUTH_ACTIONS.VALIDATE_USER_ID });
    try {
      return await authService.validateUserId(userId);
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to validate user ID.');
      dispatch({ type: AUTH_ACTIONS.REQUEST_FAILURE, payload: { error: message } });
      return false;
    }
  }, []);

  const requestOtp = useCallback(async (email) => {
    dispatch({ type: AUTH_ACTIONS.REQUEST_OTP });
    try {
      const id = await authService.requestOtp(email);
      dispatch({ type: AUTH_ACTIONS.REQUEST_OTP, payload: { id } });
      return Boolean(id);
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to request OTP. Please try again.');
      dispatch({ type: AUTH_ACTIONS.REQUEST_FAILURE, payload: { error: message } });
      return false;
    }
  }, []);

  const verifyOtp = useCallback(async (data) => {
    dispatch({ type: AUTH_ACTIONS.VERIFY_OTP });
    try {
      return await authService.verifyOtp(data);
    } catch (error) {
      const message = getErrorMessage(error, 'Invalid OTP code.');
      dispatch({ type: AUTH_ACTIONS.REQUEST_FAILURE, payload: { error: message } });
      return false;
    }
  }, []);

  const updatePassword = useCallback(async (params) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_PSWD });
    try {
      return await authService.updatePassword(params);
    } catch (error) {
      const message = getErrorMessage(error, 'Password update failed. Please try again.');
      dispatch({ type: AUTH_ACTIONS.REQUEST_FAILURE, payload: { error: message } });
      return false;
    }
  }, []);

  const updateUserInfo = useCallback(async (data) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_PSWD });
    try {
      const ok = await authService.updateUserInfo(data);
      if (ok) {
        dispatch({ type: AUTH_ACTIONS.PATCH_USER, payload: { verified: 1, ...data } });
      }
      return ok;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to update patron information.');
      dispatch({ type: AUTH_ACTIONS.REQUEST_FAILURE, payload: { error: message } });
      return false;
    }
  }, []);

  const uploadPhoto = useCallback(async (photoData) => {
    try {
      const photoUrl = await authService.uploadPhoto(photoData);
      if (photoUrl) {
        dispatch({ type: AUTH_ACTIONS.PATCH_USER, payload: { profile_photo: photoUrl } });
      }
      return photoUrl;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Photo upload failed.'));
    }
  }, []);

  const completeOnboarding = useCallback(async (data) => {
    try {
      const results = await authService.completeOnboarding(data);
      if (results?.user) {
        dispatch({ type: AUTH_ACTIONS.PATCH_USER, payload: results.user });
      }
      return results;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Onboarding submission failed.'));
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.refreshUser();
      if (user) {
        dispatch({ type: AUTH_ACTIONS.PATCH_USER, payload: user });
      }
      return user;
    } catch {
      return null;
    }
  }, []);

  const patchUser = useCallback((updates) => {
    dispatch({ type: AUTH_ACTIONS.PATCH_USER, payload: updates });
  }, []);

  const contextValue = useMemo(() => ({
    state,
    login,
    register,
    logout,
    validateUserId,
    requestOtp,
    verifyOtp,
    updatePassword,
    updateUserInfo,
    uploadPhoto,
    completeOnboarding,
    refreshUser,
    patchUser,
  }), [
    state,
    login,
    register,
    logout,
    validateUserId,
    requestOtp,
    verifyOtp,
    updatePassword,
    updateUserInfo,
    uploadPhoto,
    completeOnboarding,
    refreshUser,
    patchUser,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

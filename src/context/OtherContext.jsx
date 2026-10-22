/**
 * @file OtherContext.jsx
 * @description Central Domain State Provider for Nurul Ilm Library.
 * Manages reactive UI state while delegating network communications and business rules
 * to domain services (catalogService, deskService, loansService, paymentService, sprintService, communityService, adminService).
 */

"use client";

import { createContext, useReducer, useContext, useMemo, useCallback, useEffect } from "react";
import { catalogService } from "../services/catalogService";
import { deskService } from "../services/deskService";
import { loansService } from "../services/loansService";
import { paymentService } from "../services/paymentService";
import { sprintService } from "../services/sprintService";
import { communityService } from "../services/communityService";
import { adminService } from "../services/adminService";
import { getErrorMessage } from "../utils/errors";

const getStoredTimings = () => {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('nurulilm_library_timings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.open_time || parsed.close_time)) return parsed;
      }
    } catch {}
  }
  return null;
};

/* ---------- Initial State ---------- */
export const initialState = {
  packages: [],
  loading: false,
  error: null,
  checkout_flag: null,
  txns: [],
  resources: [],
  loans: [],
  students: [],
  allStudents: [],
  earnings: { total: 0, count: 0 },
  studentStats: { total: 0, verified: 0, pending_kyc: 0, paid: 0 },
  pendingCounts: { pendingPayments: 0, pendingUsers: 0 },
  libraryTimings: getStoredTimings(),
};

/* ---------- Action Types ---------- */
export const ACTION_TYPES = Object.freeze({
  REQUEST_START: "REQUEST_START",
  FETCH_SUCCESS: "FETCH_SUCCESS",
  FETCH_ERROR: "FETCH_ERROR",
  CHECKOUT_SUCCESS: "CHECKOUT_SUCCESS",
  TXN_FETCH: "TXN_FETCH",
  TXN_FETCH_CONFIRMATION: 'TXN_FETCH_CONFIRMATION',
  TXN_CONFIRMATION: 'TXN_CONFIRMATION',
  RESOURCES_FETCH: 'RESOURCES_FETCH',
  LOANS_FETCH: 'LOANS_FETCH',
  STUDENTS_FETCH: 'STUDENTS_FETCH',
  ALL_STUDENTS_FETCH: 'ALL_STUDENTS_FETCH',
  EARNINGS_FETCH: 'EARNINGS_FETCH',
  STUDENT_STATS_FETCH: 'STUDENT_STATS_FETCH',
  PENDING_COUNTS_FETCH: 'PENDING_COUNTS_FETCH',
  LIBRARY_TIMINGS_FETCH: 'LIBRARY_TIMINGS_FETCH',
});

/* ---------- Reducer ---------- */
export const dataReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.REQUEST_START:
      return { ...state, loading: true, error: null };

    case ACTION_TYPES.FETCH_SUCCESS:
      return { ...state, packages: action.payload, loading: false };

    case ACTION_TYPES.FETCH_ERROR:
      return { ...state, loading: false, error: action.payload };

    case ACTION_TYPES.CHECKOUT_SUCCESS:
      return { ...state, checkout_flag: action.payload, loading: false };

    case ACTION_TYPES.TXN_FETCH:
      return { ...state, txns: action.payload, loading: false };

    case ACTION_TYPES.TXN_FETCH_CONFIRMATION:
      return { ...state, unconfirmedTxns: action.payload, loading: false };

    case ACTION_TYPES.TXN_CONFIRMATION:
      return { ...state, confirmation: action.payload, loading: false };

    case ACTION_TYPES.RESOURCES_FETCH:
      return { ...state, resources: action.payload, loading: false };

    case ACTION_TYPES.LOANS_FETCH:
      return { ...state, loans: action.payload, loading: false };

    case ACTION_TYPES.STUDENTS_FETCH:
      return { ...state, students: action.payload, loading: false };

    case ACTION_TYPES.ALL_STUDENTS_FETCH:
      return { ...state, allStudents: action.payload, loading: false };

    case ACTION_TYPES.EARNINGS_FETCH:
      return { ...state, earnings: action.payload, loading: false };

    case ACTION_TYPES.STUDENT_STATS_FETCH:
      return { ...state, studentStats: action.payload, loading: false };

    case ACTION_TYPES.PENDING_COUNTS_FETCH:
      return { ...state, pendingCounts: action.payload, loading: false };

    case ACTION_TYPES.LIBRARY_TIMINGS_FETCH:
      return { ...state, libraryTimings: action.payload, loading: false };

    default:
      return state;
  }
};

const OtherContext = createContext(null);
export const useOther = () => {
  const context = useContext(OtherContext);
  if (!context) {
    throw new Error('useOther must be used within an OtherProvider');
  }
  return context;
};

// Clean alias for new modules
export const useLibrary = useOther;

export const OtherProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  /* ── 1. Packages & Subscriptions ────────────────────────── */
  const getPackages = useCallback(async () => {
    dispatch({ type: ACTION_TYPES.REQUEST_START });
    try {
      const data = await adminService.getPackages();
      dispatch({ type: ACTION_TYPES.FETCH_SUCCESS, payload: data });
      return data;
    } catch (error) {
      const msg = getErrorMessage(error, 'Failed to fetch membership packages.');
      dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: msg });
      return [];
    }
  }, []);

  const createPackage = useCallback(async (packageData) => {
    try {
      const result = await adminService.createPackage(packageData);
      await getPackages();
      return result;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to create membership package.'));
    }
  }, [getPackages]);

  const updatePackage = useCallback(async (packageData) => {
    try {
      const result = await adminService.updatePackage(packageData);
      await getPackages();
      return result;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update membership package.'));
    }
  }, [getPackages]);

  const deletePackage = useCallback(async (packageId) => {
    try {
      const result = await adminService.deletePackage(packageId);
      await getPackages();
      return result;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to delete membership package.'));
    }
  }, [getPackages]);

  /* ── 2. Payments & Billing ──────────────────────────────── */
  const checkout = useCallback(async (payload) => {
    dispatch({ type: ACTION_TYPES.REQUEST_START });
    try {
      const data = await paymentService.checkout(payload);
      dispatch({ type: ACTION_TYPES.CHECKOUT_SUCCESS, payload: data });
      return data;
    } catch (error) {
      const msg = getErrorMessage(error, 'Checkout submission failed.');
      dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: msg });
      throw new Error(msg);
    }
  }, []);

  const fetchTxns = useCallback(async () => {
    dispatch({ type: ACTION_TYPES.REQUEST_START });
    try {
      const data = await paymentService.getMyTransactions();
      const list = Array.isArray(data) ? data : (Array.isArray(data?.allPayments) ? data.allPayments : (Array.isArray(data?.data) ? data.data : []));
      dispatch({ type: ACTION_TYPES.TXN_FETCH, payload: list });
      return list;
    } catch (error) {
      const msg = getErrorMessage(error, 'Failed to fetch transactions.');
      dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: msg });
      return [];
    }
  }, []);

  const updatePendingTxn = useCallback(async (payload) => {
    try {
      const result = await paymentService.updatePendingTxn(payload);
      await fetchTxns();
      return result;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update transaction.'));
    }
  }, [fetchTxns]);

  const fetchTxnsForConfirmation = useCallback(async () => {
    dispatch({ type: ACTION_TYPES.REQUEST_START });
    try {
      const data = await paymentService.getTransactionsForConfirmation();
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.payments) ? data.payments : []));
      dispatch({ type: ACTION_TYPES.TXN_FETCH_CONFIRMATION, payload: list });
      return list;
    } catch (error) {
      const msg = getErrorMessage(error, 'Failed to fetch unconfirmed transactions.');
      dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: msg });
      return [];
    }
  }, []);

  const updateConfirmation = useCallback(async (payload) => {
    dispatch({ type: ACTION_TYPES.REQUEST_START });
    try {
      const targetId = typeof payload === 'object'
        ? (payload?.id || payload?.ref_id || payload?.ref || payload?.payment_id || payload?._id || payload?.txn_id)
        : payload;

      const confirmationStatus = typeof payload === 'object' && payload?.confirmation !== undefined
        ? payload.confirmation
        : 1;

      const remarks = typeof payload === 'object' ? (payload?.remarks || '') : '';

      const data = await paymentService.confirmPayment(targetId, confirmationStatus, remarks);
      dispatch({ type: ACTION_TYPES.TXN_CONFIRMATION, payload: data });
      return data;
    } catch (error) {
      const msg = getErrorMessage(error, 'Failed to update transaction confirmation.');
      dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: msg });
      throw new Error(msg);
    }
  }, []);

  const fetchEarnings = useCallback(async (params) => {
    try {
      const data = await paymentService.getEarnings(params);
      dispatch({ type: ACTION_TYPES.EARNINGS_FETCH, payload: data });
      return data;
    } catch (error) {
      console.warn('[fetchEarnings] Failed:', error);
      return { total: 0, count: 0 };
    }
  }, []);

  /* ── 3. Resources & Catalog ─────────────────────────────── */
  const fetchResources = useCallback(async () => {
    dispatch({ type: ACTION_TYPES.REQUEST_START });
    try {
      const data = await catalogService.getBooks();
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      dispatch({ type: ACTION_TYPES.RESOURCES_FETCH, payload: list });
      return list;
    } catch (error) {
      const msg = getErrorMessage(error, 'Failed to fetch catalog resources.');
      dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: msg });
      return [];
    }
  }, []);

  const addResource = useCallback(async (payload) => {
    try {
      const result = await catalogService.addResource(payload);
      await fetchResources();
      return result;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to add catalog resource.'));
    }
  }, [fetchResources]);

  const editResource = useCallback(async (payload) => {
    try {
      const result = await catalogService.editResource(payload);
      await fetchResources();
      return result;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to edit catalog resource.'));
    }
  }, [fetchResources]);

  const removeResource = useCallback(async (id) => {
    try {
      const result = await catalogService.removeResource(id);
      await fetchResources();
      return result;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to delete catalog resource.'));
    }
  }, [fetchResources]);

  /* ── 4. Loans & Book Circulation ────────────────────────── */
  const fetchMyLoans = useCallback(async () => {
    dispatch({ type: ACTION_TYPES.REQUEST_START });
    try {
      const data = await loansService.getMyLoans();
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.loans) ? data.loans : []));
      dispatch({ type: ACTION_TYPES.LOANS_FETCH, payload: list });
      return list;
    } catch (error) {
      const msg = getErrorMessage(error, 'Failed to fetch borrowed books.');
      dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: msg });
      return [];
    }
  }, []);

  const fetchLoans = useCallback(async (params) => {
    dispatch({ type: ACTION_TYPES.REQUEST_START });
    try {
      const data = await loansService.getAllLoans(params);
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.loans) ? data.loans : []));
      dispatch({ type: ACTION_TYPES.LOANS_FETCH, payload: list });
      return list;
    } catch (error) {
      const msg = getErrorMessage(error, 'Failed to fetch library loans.');
      dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: msg });
      return [];
    }
  }, []);

  const createLoan = useCallback(async (payload) => {
    try {
      const result = await loansService.issueLoan(payload);
      return result;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to issue book loan.'));
    }
  }, []);

  const returnLoan = useCallback(async (loanId) => {
    try {
      const result = await loansService.returnLoan(loanId);
      return result;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to return book.'));
    }
  }, []);

  const extendLoan = useCallback(async (loanId) => {
    try {
      const result = await loansService.extendLoan(loanId);
      return result;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to extend loan cycle.'));
    }
  }, []);

  /* ── 5. Students & Roster ───────────────────────────────── */
  const fetchStudents = useCallback(async () => {
    dispatch({ type: ACTION_TYPES.REQUEST_START });
    try {
      const data = await adminService.getStudents();
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.students) ? data.students : []));
      dispatch({ type: ACTION_TYPES.STUDENTS_FETCH, payload: list });
      return list;
    } catch (error) {
      const msg = getErrorMessage(error, 'Failed to fetch student roster.');
      dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: msg });
      return [];
    }
  }, []);

  const fetchAllStudents = useCallback(async () => {
    dispatch({ type: ACTION_TYPES.REQUEST_START });
    try {
      const data = await adminService.getAllStudents();
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.students) ? data.students : []));
      dispatch({ type: ACTION_TYPES.ALL_STUDENTS_FETCH, payload: list });
      return list;
    } catch (error) {
      const msg = getErrorMessage(error, 'Failed to fetch all students.');
      dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: msg });
      return [];
    }
  }, []);

  const fetchStudentStats = useCallback(async () => {
    try {
      const data = await adminService.getStudentStats();
      dispatch({ type: ACTION_TYPES.STUDENT_STATS_FETCH, payload: data });
      return data;
    } catch (error) {
      console.warn('[fetchStudentStats] Failed:', error);
      return { total: 0, verified: 0, pending_kyc: 0, paid: 0 };
    }
  }, []);

  const fetchPendingCounts = useCallback(async () => {
    try {
      const data = await adminService.getPendingCounts();
      dispatch({ type: ACTION_TYPES.PENDING_COUNTS_FETCH, payload: data });
      return data;
    } catch (error) {
      console.warn('[fetchPendingCounts] Failed:', error);
      return { pendingPayments: 0, pendingUsers: 0 };
    }
  }, []);

  const verifyStudentKYC = useCallback(async (studentId, isVerified) => {
    try {
      return await adminService.verifyStudentKyc(studentId, isVerified);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update student KYC status.'));
    }
  }, []);

  const createStudent = useCallback(async (studentData) => {
    try {
      const res = await adminService.createStudent(studentData);
      await fetchAllStudents();
      return res;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to create student.'));
    }
  }, [fetchAllStudents]);

  const recordPayment = useCallback(async (payload) => {
    try {
      const res = await paymentService.recordPayment(payload);
      await fetchAllStudents();
      return res;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to record payment.'));
    }
  }, [fetchAllStudents]);

  const changeStudentPassword = useCallback(async (studentId, newPassword) => {
    try {
      return await adminService.resetStudentPassword(studentId, newPassword);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update student password.'));
    }
  }, []);

  const toggleStudentStatus = useCallback(async (studentId, status) => {
    try {
      const res = await adminService.toggleStudentStatus(studentId, status);
      await fetchAllStudents();
      return res;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update student status.'));
    }
  }, [fetchAllStudents]);

  /* ── 6. Desks & Reservations ────────────────────────────── */
  const fetchDesks = useCallback(async () => {
    try {
      return await deskService.getDesks();
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch study desks.'));
    }
  }, []);

  const fetchMyDesk = useCallback(async () => {
    try {
      return await deskService.getMyDesk();
    } catch (error) {
      console.warn('Failed to fetch patron desk:', error);
      return null;
    }
  }, []);

  const claimDesk = useCallback(async (deskId) => {
    try {
      return await deskService.claimDesk(deskId);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to claim study desk.'));
    }
  }, []);

  const releaseDesk = useCallback(async (deskId) => {
    try {
      return await deskService.releaseDesk(deskId);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to release study desk.'));
    }
  }, []);

  const fetchDeskRequests = useCallback(async () => {
    try {
      return await deskService.getMyDeskChangeRequests();
    } catch (error) {
      console.warn('Failed to fetch desk requests:', error);
      return [];
    }
  }, []);

  const requestDeskChange = useCallback(async (payload) => {
    try {
      return await deskService.requestDeskChange(payload);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to request desk change.'));
    }
  }, []);

  const auditDeskRequest = useCallback(async (requestId, status, note = '') => {
    try {
      return await deskService.auditDeskRequest(requestId, status, note);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to audit desk request.'));
    }
  }, []);

  const fetchAllDeskChangeRequestsAdmin = useCallback(async () => {
    try {
      const data = await deskService.getDeskRequestsAdmin();
      return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.warn('Failed to fetch admin desk change requests:', error);
      return [];
    }
  }, []);

  const approveDeskChangeRequest = useCallback(async (requestId) => {
    try {
      return await deskService.approveDeskRequest(requestId);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to approve desk request.'));
    }
  }, []);

  const rejectDeskChangeRequest = useCallback(async (requestId, note = '') => {
    try {
      return await deskService.rejectDeskRequest(requestId, note);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to reject desk request.'));
    }
  }, []);

  const adminReleaseDesk = useCallback(async (deskId) => {
    try {
      return await deskService.releaseDesk(deskId);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to release desk.'));
    }
  }, []);

  const adminCreateDesk = useCallback(async (deskData) => {
    try {
      return await deskService.createDesk(deskData);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to create desk.'));
    }
  }, []);

  const adminToggleDeskStatus = useCallback(async (deskId, status) => {
    try {
      return await deskService.toggleDeskStatus(deskId, status);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to toggle desk status.'));
    }
  }, []);

  const adminReassignDesk = useCallback(async (studentId, deskId) => {
    try {
      return await deskService.reassignDesk({ student_id: studentId, desk_id: deskId });
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to reassign desk.'));
    }
  }, []);

  /* ── 7. Focus Sprints & Streak ──────────────────────────── */
  const startFocusSprint = useCallback(async (payload) => {
    try {
      return await sprintService.startSprint(payload);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to start focus sprint.'));
    }
  }, []);

  const completeFocusSprint = useCallback(async (payload) => {
    try {
      return await sprintService.completeSprint(payload);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to complete focus sprint.'));
    }
  }, []);

  const fetchFocusSprintHistory = useCallback(async () => {
    try {
      return await sprintService.getHistory();
    } catch (error) {
      console.warn('[fetchFocusSprintHistory] Failed:', error);
      return { sprints: [], stats: { streakDays: 0, todayMinutes: 0, totalMinutes: 0 } };
    }
  }, []);

  const fetchFocusSprintLeaderboard = useCallback(async () => {
    try {
      return await sprintService.getLeaderboard();
    } catch (error) {
      console.warn('[fetchFocusSprintLeaderboard] Failed:', error);
      return [];
    }
  }, []);

  /* ── 8. Community Notes Wall ────────────────────────────── */
  const fetchCommunityNotes = useCallback(async () => {
    try {
      return await communityService.getLiveNotes();
    } catch (error) {
      console.warn('[fetchCommunityNotes] Failed:', error);
      return [];
    }
  }, []);

  const submitCommunityNote = useCallback(async (notePayload) => {
    try {
      return await communityService.submitNote(notePayload);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to submit community note.'));
    }
  }, []);

  const fetchAllCommunityNotes = useCallback(async (params) => {
    try {
      return await communityService.getAllNotes(params);
    } catch (error) {
      console.warn('[fetchAllCommunityNotes] Failed:', error);
      return [];
    }
  }, []);

  const auditCommunityNote = useCallback(async (noteId, status) => {
    try {
      return await communityService.auditNote(noteId, status);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to audit community note.'));
    }
  }, []);

  /* ── 9. Library Operational Timings ─────────────────────── */
  const fetchLibraryTimings = useCallback(async () => {
    try {
      const data = await adminService.getLibraryTimings();
      const timings = data?.data || data;
      if (timings && (timings.open_time || timings.close_time)) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('nurulilm_library_timings', JSON.stringify(timings));
          } catch {}
        }
        dispatch({ type: ACTION_TYPES.LIBRARY_TIMINGS_FETCH, payload: timings });
      }
      return timings;
    } catch (error) {
      console.warn('[fetchLibraryTimings] Failed:', error);
      return null;
    }
  }, []);

  const updateLibraryTimings = useCallback(async (timingsData) => {
    try {
      const res = await adminService.updateLibraryTimings(timingsData);
      const updated = res?.data || res;
      if (updated && (updated.open_time || updated.close_time)) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('nurulilm_library_timings', JSON.stringify(updated));
          } catch {}
        }
        dispatch({ type: ACTION_TYPES.LIBRARY_TIMINGS_FETCH, payload: updated });
      }
      await fetchLibraryTimings();
      return res;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update library timings.'));
    }
  }, [fetchLibraryTimings]);

  // Automatically fetch fresh library timings from MongoDB on provider mount
  useEffect(() => {
    fetchLibraryTimings();
  }, [fetchLibraryTimings]);

  /* ── 10. News & Bulletins ───────────────────────────────── */
  const fetchLibraryNews = useCallback(async (params) => {
    try {
      return await adminService.getLibraryNews(params);
    } catch (error) {
      console.warn('[fetchLibraryNews] Failed:', error);
      return [];
    }
  }, []);

  const createLibraryNews = useCallback(async (newsPayload) => {
    try {
      return await adminService.createLibraryNews(newsPayload);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to create announcement.'));
    }
  }, []);

  const updateLibraryNews = useCallback(async (newsId, newsPayload) => {
    try {
      return await adminService.updateLibraryNews(newsId, newsPayload);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update announcement.'));
    }
  }, []);

  const deleteLibraryNews = useCallback(async (newsId) => {
    try {
      return await adminService.deleteLibraryNews(newsId);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to delete announcement.'));
    }
  }, []);

  /* ── 11. Exams & Digital Cards ──────────────────────────── */
  const fetchExams = useCallback(async (params) => {
    try {
      return await catalogService.getExams(params);
    } catch (error) {
      console.warn('[fetchExams] Failed:', error);
      return [];
    }
  }, []);

  const fetchExamById = useCallback(async (id) => {
    try {
      return await catalogService.getExamById(id);
    } catch (error) {
      console.warn('[fetchExamById] Failed:', error);
      return null;
    }
  }, []);

  const incrementExamDownload = useCallback(async (examId) => {
    try {
      return await catalogService.incrementExamDownload(examId);
    } catch (error) {
      console.warn('[incrementExamDownload] Failed:', error);
    }
  }, []);

  const fetchPatronCard = useCallback(async (studentId) => {
    try {
      return await adminService.getPatronCard(studentId);
    } catch (error) {
      console.warn('[fetchPatronCard] Failed:', error);
      return null;
    }
  }, []);

  const contextValue = useMemo(() => ({
    state,
    // Packages
    getPackages, createPackage, updatePackage, deletePackage,
    // Payments
    checkout, fetchTxns, updatePendingTxn, fetchTxnsForConfirmation, updateConfirmation, fetchEarnings, recordPayment,
    // Catalog Resources
    fetchResources, addResource, editResource, removeResource,
    // Loans
    fetchMyLoans, fetchLoans, createLoan, issueBook: createLoan, returnLoan, returnBook: returnLoan, extendLoan,
    // Students
    fetchStudents, fetchAllStudents, fetchStudentStats, fetchPendingCounts, verifyStudentKYC, verifyStudent: verifyStudentKYC,
    createStudent, changeStudentPassword, toggleStudentStatus,
    // Desks
    fetchDesks, claimDesk, reserveDesk: claimDesk, fetchMyDesk, releaseDesk, fetchDeskRequests,
    fetchMyDeskChangeRequests: fetchDeskRequests, requestDeskChange, submitDeskChangeRequest: requestDeskChange, auditDeskRequest,
    fetchAllDeskChangeRequestsAdmin, approveDeskChangeRequest, rejectDeskChangeRequest,
    adminReleaseDesk, adminCreateDesk, adminToggleDeskStatus, adminReassignDesk,
    // Focus Sprints
    startFocusSprint, completeFocusSprint, fetchFocusSprintHistory, fetchFocusSprintLeaderboard,
    // Community Notes
    fetchCommunityNotes, submitCommunityNote, fetchAllCommunityNotes, auditCommunityNote,
    // Timings
    fetchLibraryTimings, updateLibraryTimings,
    // News
    fetchLibraryNews, createLibraryNews, updateLibraryNews, deleteLibraryNews,
    // Exams & Cards
    fetchExams, fetchExamById, incrementExamDownload, fetchPatronCard,
  }), [
    state,
    getPackages, createPackage, updatePackage, deletePackage,
    checkout, fetchTxns, updatePendingTxn, fetchTxnsForConfirmation, updateConfirmation, fetchEarnings, recordPayment,
    fetchResources, addResource, editResource, removeResource,
    fetchMyLoans, fetchLoans, createLoan, returnLoan, extendLoan,
    fetchStudents, fetchAllStudents, fetchStudentStats, fetchPendingCounts, verifyStudentKYC,
    createStudent, changeStudentPassword, toggleStudentStatus,
    fetchDesks, claimDesk, fetchMyDesk, releaseDesk, fetchDeskRequests, requestDeskChange, auditDeskRequest,
    fetchAllDeskChangeRequestsAdmin, approveDeskChangeRequest, rejectDeskChangeRequest,
    adminReleaseDesk, adminCreateDesk, adminToggleDeskStatus, adminReassignDesk,
    startFocusSprint, completeFocusSprint, fetchFocusSprintHistory, fetchFocusSprintLeaderboard,
    fetchCommunityNotes, submitCommunityNote, fetchAllCommunityNotes, auditCommunityNote,
    fetchLibraryTimings, updateLibraryTimings,
    fetchLibraryNews, createLibraryNews, updateLibraryNews, deleteLibraryNews,
    fetchExams, fetchExamById, incrementExamDownload, fetchPatronCard,
  ]);

  return (
    <OtherContext.Provider value={contextValue}>
      {children}
    </OtherContext.Provider>
  );
};

export default OtherContext;

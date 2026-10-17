'use client';

import { useState } from 'react';
import moment from 'moment';
import { useAuth } from '../context/AuthContext';
import { useOther } from '../context/OtherContext';
import {
  Clock, RefreshCw, CheckCircle2, Edit2, ShieldAlert, ShieldCheck,
  Phone, BookOpen, LogOut
} from 'lucide-react';

export default function PatronStatusHub({ setPage, txns = [], onRefresh }) {
  const { logout, updateUserInfo, state: { user } } = useAuth();
  const { updatePendingTxn } = useOther();

  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState('');

  // Edit Txn ID Modal
  const [editingTxn, setEditingTxn] = useState(false);
  const [newTxnId, setNewTxnId] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Inline Identity KYC form
  const [showKyc, setShowKyc] = useState(false);
  const [kycForm, setKycForm] = useState({
    full_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
    father_name: '',
    aadhaar_id: '',
    police_station: '',
    city: 'Handwara',
    consent: 1
  });
  const [kycLoading, setKycLoading] = useState(false);
  const [kycSuccess, setKycSuccess] = useState(Boolean(user?.verified));
  const [kycError, setKycError] = useState('');

  const latestTxn = Array.isArray(txns) && txns.length > 0 ? txns[0] : null;

  const handleCheck = async () => {
    setChecking(true);
    setCheckMessage('');
    try {
      if (onRefresh) await onRefresh();
      setCheckMessage('Status updated from library server.');
    } finally {
      setTimeout(() => setChecking(false), 500);
    }
  };

  const handleStartEditTxn = () => {
    setNewTxnId(latestTxn?.txn_id || '');
    setEditError('');
    setEditingTxn(true);
  };

  const handleSaveTxn = async (e) => {
    e.preventDefault();
    if (!newTxnId.trim() || newTxnId.trim().length < 4) {
      setEditError('Please enter a valid UPI Reference ID.');
      return;
    }

    setEditLoading(true);
    setEditError('');
    try {
      if (updatePendingTxn) {
        await updatePendingTxn({
          id: latestTxn?._id,
          txn_id: newTxnId.trim()
        });
      }
      setEditingTxn(false);
      if (onRefresh) await onRefresh();
    } catch (err) {
      setEditError(err?.message || 'Could not update Reference ID.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!kycForm.aadhaar_id || !kycForm.father_name) {
      setKycError("Please fill Father's Name and Aadhaar Number.");
      return;
    }

    setKycLoading(true);
    setKycError('');
    try {
      const ok = await updateUserInfo(kycForm);
      if (ok) {
        setKycSuccess(true);
        setShowKyc(false);
      } else {
        setKycError('Could not save identity records. Please retry.');
      }
    } catch (err) {
      setKycError(err?.message || 'Failed to submit identity records.');
    } finally {
      setKycLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] bg-[#F6F8FB] dark:bg-[#0B0F19] py-8 sm:py-12 px-4 sm:px-6 transition-colors">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Status Header Card */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-7 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Review in Progress</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Admission Status
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Welcome, <strong>{user?.first_name || 'Member'}</strong>. Your admission dues have been received and are currently undergoing desk ledger verification.
                </p>
              </div>
            </div>

            <button
              onClick={handleCheck}
              disabled={checking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold shadow-2xs transition disabled:opacity-50 self-start cursor-pointer"
            >
              <RefreshCw size={13} className={checking ? "animate-spin" : ""} />
              <span>Check Status</span>
            </button>
          </div>

          {checkMessage && (
            <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 text-right mt-2">
              ✓ {checkMessage}
            </p>
          )}

          {/* 4-Stage Progress Stepper */}
          <div className="pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Admission Progress
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              {/* Stage 1 */}
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-0.5">
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  <CheckCircle2 size={13} />
                  <span>1. Account</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">Registered</p>
              </div>

              {/* Stage 2 */}
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-0.5">
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  <CheckCircle2 size={13} />
                  <span>2. Payment</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">Reference Submitted</p>
              </div>

              {/* Stage 3 */}
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-0.5">
                <div className="flex items-center gap-1 text-xs font-bold text-amber-900 dark:text-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>3. Reconciliation</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">Desk Review</p>
              </div>

              {/* Stage 4 */}
              <div className="p-3 rounded-lg bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 space-y-0.5 text-slate-400">
                <div className="flex items-center gap-1 text-xs font-semibold">
                  <span>○ 4. Admission</span>
                </div>
                <p className="text-[11px]">Full Desk Access</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Details Card */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Submitted Reference
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Payment Submission Summary
              </h3>
            </div>
            <button
              onClick={handleStartEditTxn}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#004B87] dark:text-blue-400 hover:underline cursor-pointer"
            >
              <Edit2 size={12} /> Edit Reference Number
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block text-[11px]">UPI / Bank Reference</span>
              <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 break-all">
                {latestTxn?.txn_id || 'Not specified'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block text-[11px]">Amount</span>
              <span className="font-bold text-sm text-[#004B87] dark:text-blue-400">
                ₹{latestTxn?.amount || '0'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block text-[11px]">Requested Term</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {latestTxn?.from ? moment(latestTxn.from).format('DD MMM') : 'Today'} to {latestTxn?.to ? moment(latestTxn.to).format('DD MMM YYYY') : '1 Month'}
              </span>
            </div>
          </div>

          {/* Edit Txn ID Inline Form */}
          {editingTxn && (
            <form onSubmit={handleSaveTxn} className="mt-3 p-3.5 rounded-lg bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 space-y-2.5">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Update Your UPI / Bank Reference ID
              </p>
              {editError && (
                <p className="text-xs text-rose-700 dark:text-rose-400">{editError}</p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Enter 12-digit reference number"
                  value={newTxnId}
                  onChange={(e) => setNewTxnId(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:border-[#004B87]"
                />
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-3.5 py-1.5 bg-[#004B87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {editLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTxn(false)}
                  className="px-3 py-1.5 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Identity Record (Aadhaar KYC) */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                kycSuccess
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
              }`}>
                {kycSuccess ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Identity Verification Record
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {kycSuccess
                    ? 'Identity records submitted and verified for carrel allocation.'
                    : 'Submit your compliance details now while your payment is being reconciled to enable access immediately upon approval.'}
                </p>
              </div>
            </div>

            {!kycSuccess && (
              <button
                onClick={() => setShowKyc(!showKyc)}
                className="text-xs font-semibold px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {showKyc ? 'Close Form' : 'Submit Details'}
              </button>
            )}
          </div>

          {/* Inline KYC Form */}
          {showKyc && !kycSuccess && (
            <form onSubmit={handleKycSubmit} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {kycError && (
                <p className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg">{kycError}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Father's Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohammad Rafiq"
                    value={kycForm.father_name}
                    onChange={(e) => setKycForm({ ...kycForm, father_name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Aadhaar ID (12 digits) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="xxxx xxxx xxxx"
                    value={kycForm.aadhaar_id}
                    onChange={(e) => setKycForm({ ...kycForm, aadhaar_id: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Local Police Station
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Handwara Police Station"
                    value={kycForm.police_station}
                    onChange={(e) => setKycForm({ ...kycForm, police_station: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    City / Town
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Handwara"
                    value={kycForm.city}
                    onChange={(e) => setKycForm({ ...kycForm, city: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowKyc(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={kycLoading}
                  className="px-3.5 py-1.5 bg-[#004B87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {kycLoading ? 'Saving...' : 'Submit Verification'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Helpline & Action Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
              <Phone size={14} />
              <span>Need Immediate Desk Access?</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              If you are at the library entrance or require immediate desk reconciliation:
            </p>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Coordinator: Owais Rafiq • <a href="tel:9906000000" className="text-[#004B87] dark:text-blue-400 underline">+91 9906000000</a>
            </p>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-1.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                <BookOpen size={14} />
                <span>Noticeboard &amp; Rules</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Review library rules of silence, study carrel guidelines, and notices.
              </p>
            </div>
            <button
              onClick={() => setPage('feed')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#004B87] dark:text-blue-400 hover:underline cursor-pointer"
            >
              <span>View Noticeboard</span>
              <span className="text-sm">→</span>
            </button>
          </div>
        </div>

        {/* Footer sign out */}
        <div className="text-center pt-1">
          <button
            onClick={logout}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-rose-600 cursor-pointer"
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}

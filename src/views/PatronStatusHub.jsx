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
    <div className="w-full min-h-[calc(100vh-5rem)] bg-[#FCFCFB] dark:bg-[#0E1411] py-8 sm:py-12 px-4 sm:px-6 transition-colors">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Status Header Card ── */}
        <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#DFE6DC] dark:border-[#26362D] pb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] dark:bg-[#2C2411] border border-[#FDE68A] dark:border-[#523B12] text-[#92400E] dark:text-[#FBBF24] flex items-center justify-center flex-shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FFFBEB] dark:bg-[#2C2411] text-[#92400E] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#523B12] text-[11px] font-semibold mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
                  <span>Verification in Progress</span>
                </div>
                <h1 className="font-serif-lib text-2xl font-bold text-[#24341E] dark:text-[#8FD4AE]">
                  Patron Admission Status
                </h1>
                <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6] mt-1 leading-relaxed">
                  Welcome, <strong>{user?.first_name || 'Member'}</strong>. Your admission dues have been received and are currently undergoing desk ledger reconciliation.
                </p>
              </div>
            </div>

            <button
              onClick={handleCheck}
              disabled={checking}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] text-[#24341E] dark:text-[#8FD4AE] hover:bg-[#EFF4EC] dark:hover:bg-[#1A261F] rounded-xl text-xs font-semibold shadow-2xs transition disabled:opacity-50 self-start cursor-pointer"
            >
              <RefreshCw size={14} className={checking ? "animate-spin" : ""} />
              <span>Check Status</span>
            </button>
          </div>

          {checkMessage && (
            <p className="text-[11px] font-medium text-[#2E6B3F] dark:text-[#6BC68F] text-right mt-2">
              ✓ {checkMessage}
            </p>
          )}

          {/* ── 4-Stage Progress Stepper ── */}
          <div className="pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#33462C] dark:text-[#88B89C] mb-4">
              Admission Stages
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Stage 1 */}
              <div className="p-3.5 rounded-xl bg-[#EFF4EC] dark:bg-[#1E2E25] border border-[#DFE6DC] dark:border-[#2C4133] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#24341E] dark:text-[#8FD4AE]">
                  <CheckCircle2 size={15} className="text-[#2E6B3F] dark:text-[#6BC68F]" />
                  <span>1. Account</span>
                </div>
                <p className="text-[11px] text-[#0B0E0A] dark:text-[#9FB1A6]">Registered</p>
              </div>

              {/* Stage 2 */}
              <div className="p-3.5 rounded-xl bg-[#EFF4EC] dark:bg-[#1E2E25] border border-[#DFE6DC] dark:border-[#2C4133] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#24341E] dark:text-[#8FD4AE]">
                  <CheckCircle2 size={15} className="text-[#2E6B3F] dark:text-[#6BC68F]" />
                  <span>2. Payment</span>
                </div>
                <p className="text-[11px] text-[#0B0E0A] dark:text-[#9FB1A6]">UTR Submitted</p>
              </div>

              {/* Stage 3 */}
              <div className="p-3.5 rounded-xl bg-[#FFFBEB] dark:bg-[#2C2411] border border-[#FDE68A] dark:border-[#523B12] space-y-1 ring-1 ring-[#D97706]/30">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#92400E] dark:text-[#FBBF24]">
                  <span className="w-2 h-2 rounded-full bg-[#D97706] animate-ping" />
                  <span>3. Reconciliation</span>
                </div>
                <p className="text-[11px] text-[#B45309] dark:text-[#FCD34D]">Desk Review</p>
              </div>

              {/* Stage 4 */}
              <div className="p-3.5 rounded-xl bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#26362D] space-y-1 text-[#7F8781]">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span>○ 4. Admission</span>
                </div>
                <p className="text-[11px]">Full Access</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Transaction Details Card ── */}
        <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#DFE6DC] dark:border-[#26362D] pb-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#33462C] dark:text-[#88B89C]">
                Submitted Reference
              </span>
              <h3 className="font-serif-lib text-base font-bold text-[#24341E] dark:text-[#8FD4AE]">
                Payment Submission Summary
              </h3>
            </div>
            <button
              onClick={handleStartEditTxn}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#33462C] dark:text-[#8FD4AE] hover:underline cursor-pointer"
            >
              <Edit2 size={13} /> Edit Reference ID
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#26362D]">
              <span className="text-[#7F8781] block">UPI Reference / UTR</span>
              <span className="font-mono font-bold text-sm text-[#24341E] dark:text-white break-all">
                {latestTxn?.txn_id || 'Not specified'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#26362D]">
              <span className="text-[#7F8781] block">Total Amount</span>
              <span className="font-serif-lib font-bold text-base text-[#33462C] dark:text-[#8FD4AE]">
                ₹{latestTxn?.amount || '0'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#26362D]">
              <span className="text-[#7F8781] block">Enrollment Term</span>
              <span className="font-medium text-[#24341E] dark:text-white">
                {latestTxn?.from ? moment(latestTxn.from).format('DD MMM') : 'Today'} → {latestTxn?.to ? moment(latestTxn.to).format('DD MMM YYYY') : '1 Month'}
              </span>
            </div>
          </div>

          {/* Edit Txn ID Inline Form */}
          {editingTxn && (
            <form onSubmit={handleSaveTxn} className="mt-4 p-4 rounded-xl bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] space-y-3">
              <p className="text-xs font-semibold text-[#24341E] dark:text-white">
                Correct Your 12-Digit UPI Reference ID
              </p>
              {editError && (
                <p className="text-xs text-[#A83232] dark:text-[#F87171]">{editError}</p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Enter 12-digit UTR ID"
                  value={newTxnId}
                  onChange={(e) => setNewTxnId(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl text-xs font-mono text-[#0B0E0A] dark:text-[#E8EFEA] focus:border-[#33462C] dark:focus:border-[#8FD4AE]"
                />
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-[#33462C] hover:bg-[#24341E] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white rounded-xl text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {editLoading ? 'Saving...' : 'Update UTR'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTxn(false)}
                  className="px-3.5 py-2 bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] text-[#0B0E0A] dark:text-[#9FB1A6] rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Productive KYC Waiting Opportunity ── */}
        <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                kycSuccess
                  ? 'bg-[#EFF4EC] dark:bg-[#1E2E25] text-[#2E6B3F] dark:text-[#6BC68F]'
                  : 'bg-[#FFFBEB] dark:bg-[#2C2411] text-[#92400E] dark:text-[#FBBF24]'
              }`}>
                {kycSuccess ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
              </div>
              <div>
                <h3 className="font-serif-lib text-base font-bold text-[#24341E] dark:text-[#8FD4AE]">
                  Patron Identity Record (Aadhaar &amp; Police Verification)
                </h3>
                <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6] mt-0.5 leading-relaxed">
                  {kycSuccess
                    ? 'Identity records submitted and verified for carrel allocation.'
                    : 'Complete your compliance KYC now while your dues are being reconciled so you get access immediately upon approval.'}
                </p>
              </div>
            </div>

            {!kycSuccess && (
              <button
                onClick={() => setShowKyc(!showKyc)}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-[#33462C] dark:border-[#8FD4AE] text-[#33462C] dark:text-[#8FD4AE] hover:bg-[#EFF4EC] dark:hover:bg-[#1E2E25] transition cursor-pointer"
              >
                {showKyc ? 'Close Form' : 'Complete KYC'}
              </button>
            )}
          </div>

          {/* Inline KYC Form */}
          {showKyc && !kycSuccess && (
            <form onSubmit={handleKycSubmit} className="pt-4 border-t border-[#DFE6DC] dark:border-[#26362D] space-y-3">
              {kycError && (
                <p className="text-xs text-[#A83232] dark:text-[#F87171] bg-[#FAF0F0] dark:bg-[#281616] p-2.5 rounded-xl">{kycError}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#24341E] dark:text-[#E5EBE7] mb-1">
                    Father's Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohammad Rafiq"
                    value={kycForm.father_name}
                    onChange={(e) => setKycForm({ ...kycForm, father_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl text-xs text-[#0B0E0A] dark:text-[#E8EFEA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#24341E] dark:text-[#E5EBE7] mb-1">
                    Aadhaar ID (12 digits) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="xxxx xxxx xxxx"
                    value={kycForm.aadhaar_id}
                    onChange={(e) => setKycForm({ ...kycForm, aadhaar_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl text-xs font-mono text-[#0B0E0A] dark:text-[#E8EFEA]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#24341E] dark:text-[#E5EBE7] mb-1">
                    Local Police Station
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Handwara Police Station"
                    value={kycForm.police_station}
                    onChange={(e) => setKycForm({ ...kycForm, police_station: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl text-xs text-[#0B0E0A] dark:text-[#E8EFEA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#24341E] dark:text-[#E5EBE7] mb-1">
                    Town / City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Handwara"
                    value={kycForm.city}
                    onChange={(e) => setKycForm({ ...kycForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl text-xs text-[#0B0E0A] dark:text-[#E8EFEA]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowKyc(false)}
                  className="px-3.5 py-2 text-xs text-[#0B0E0A] dark:text-[#9FB1A6] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={kycLoading}
                  className="px-4 py-2 bg-[#33462C] hover:bg-[#24341E] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white rounded-xl text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {kycLoading ? 'Saving...' : 'Submit Identity Record'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Coordinator Helpline & Action Links ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#24341E] dark:text-[#8FD4AE]">
              <Phone size={15} />
              <span>Need Urgent Desk Access?</span>
            </div>
            <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6] leading-relaxed">
              If you are at the library entrance or require immediate desk reconciliation:
            </p>
            <p className="text-xs font-semibold text-[#24341E] dark:text-white">
              Coordinator: Owais Rafiq · <a href="tel:9906000000" className="text-[#33462C] dark:text-[#8FD4AE] underline">+91 9906000000</a>
            </p>
          </div>

          <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-5 shadow-sm space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#24341E] dark:text-[#8FD4AE]">
                <BookOpen size={15} />
                <span>Noticeboard &amp; Rules</span>
              </div>
              <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6] mt-1 leading-relaxed">
                Browse official library guidelines, rules of silence, and updates while waiting.
              </p>
            </div>
            <button
              onClick={() => setPage('feed')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#33462C] dark:text-[#8FD4AE] hover:underline cursor-pointer"
            >
              <span>View Noticeboard Feed</span>
              <span className="text-sm">→</span>
            </button>
          </div>
        </div>

        {/* Footer sign out */}
        <div className="text-center pt-2">
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A83232] dark:text-[#F87171] hover:underline cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out of Account</span>
          </button>
        </div>

      </div>
    </div>
  );
}

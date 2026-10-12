'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MapPin, CheckCircle2, XCircle, ArrowRightLeft, Plus,
  ShieldCheck, AlertCircle, Loader2, RefreshCw, Lock,
  Sparkles, Search, Check, X, Users, Settings
} from 'lucide-react';
import { useOther } from '../../../context/OtherContext';

export default function AdminDesks() {
  const {
    fetchDesks,
    fetchAllDeskChangeRequestsAdmin,
    approveDeskChangeRequest,
    rejectDeskChangeRequest,
    adminReleaseDesk,
    adminCreateDesk,
    adminToggleDeskStatus,
    adminReassignDesk,
    fetchAllStudents
  } = useOther();

  const [activeTab, setActiveTab] = useState('inventory'); // inventory | requests | reassign
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [desks, setDesks] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState(false);

  // New desk form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDesk, setNewDesk] = useState({
    desk_id: '',
    bay: 'Bay A',
    bay_name: 'Heated Silent Zone',
    amenities: '230V Socket, Heated Zone, Task Lamp',
    floor: 'Floor 1'
  });

  // Rejection modal
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Manual reassign state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedNewDeskId, setSelectedNewDeskId] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [desksRes, reqsRes, studentsRes] = await Promise.allSettled([
        fetchDesks(),
        fetchAllDeskChangeRequestsAdmin(),
        fetchAllStudents()
      ]);

      if (desksRes.status === 'fulfilled' && Array.isArray(desksRes.value)) {
        setDesks(desksRes.value);
      }
      if (reqsRes.status === 'fulfilled' && Array.isArray(reqsRes.value)) {
        setChangeRequests(reqsRes.value);
      }
      if (studentsRes.status === 'fulfilled' && Array.isArray(studentsRes.value)) {
        setStudents(studentsRes.value);
      }
    } catch (err) {
      console.warn('Error loading admin desks:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchDesks, fetchAllDeskChangeRequestsAdmin, fetchAllStudents]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (msg, isErr = false) => {
    setToastMsg(msg);
    setToastError(isErr);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleCreateDesk = async (e) => {
    e.preventDefault();
    if (!newDesk.desk_id) return;
    setSubmitting(true);
    try {
      const payload = {
        ...newDesk,
        amenities: newDesk.amenities.split(',').map(s => s.trim()).filter(Boolean)
      };
      await adminCreateDesk(payload);
      showToast(`✓ Desk ${newDesk.desk_id} created successfully`);
      setShowCreateModal(false);
      setNewDesk({
        desk_id: '',
        bay: 'Bay A',
        bay_name: 'Heated Silent Zone',
        amenities: '230V Socket, Heated Zone, Task Lamp',
        floor: 'Floor 1'
      });
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to create desk', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReleaseDesk = async (deskId) => {
    if (!confirm(`Are you sure you want to release and unreserve desk ${deskId}?`)) return;
    setSubmitting(true);
    try {
      await adminReleaseDesk(deskId);
      showToast(`✓ Desk ${deskId} released to available status`);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to release desk', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (deskId, currentStatus) => {
    const nextStatus = currentStatus === 'unavailable' ? 'available' : 'unavailable';
    setSubmitting(true);
    try {
      await adminToggleDeskStatus(deskId, nextStatus);
      showToast(`✓ Desk ${deskId} set to ${nextStatus}`);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update desk status', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveRequest = async (id) => {
    setSubmitting(true);
    try {
      await approveDeskChangeRequest(id);
      showToast('✓ Desk change request approved and seat reassigned');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to approve change request', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectRequest = async (e) => {
    e.preventDefault();
    if (!rejectingId) return;
    setSubmitting(true);
    try {
      await rejectDeskChangeRequest(rejectingId, rejectionReason);
      showToast('✓ Desk change request rejected');
      setRejectingId(null);
      setRejectionReason('');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to reject change request', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualReassign = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedNewDeskId) return;
    setSubmitting(true);
    try {
      await adminReassignDesk(selectedStudentId, selectedNewDeskId);
      showToast(`✓ Student successfully assigned to Desk ${selectedNewDeskId}`);
      setSelectedStudentId('');
      setSelectedNewDeskId('');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to reassign desk', true);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingRequestsCount = changeRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6 max-w-6xl w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093]">
            Spatial &amp; Physical Infrastructure
          </span>
          <h2 className="font-serif-lib text-2xl font-bold text-[#1C3A2B] dark:text-[#FAF8F5] mt-0.5">
            Study Carrels &amp; Desk Allocation
          </h2>
          <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] mt-1">
            Manage physical reading desks, enforce locked allocations, and approve student desk change requests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            title="Refresh desk data"
            className="p-2 rounded-xl bg-white dark:bg-[#16211B] border border-[#D9D3C7] dark:border-[#26362D] text-[#5D645E] dark:text-[#9FB1A6] hover:text-[#1C3A2B] dark:hover:text-white transition cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#1C3A2B] hover:bg-[#142C20] dark:bg-[#2A4D3B] dark:hover:bg-[#37614B] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Carrel Desk</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
          toastError
            ? 'bg-[#FAF0F0] dark:bg-[#3D1A1A] border-[#F0D5D5] text-[#A83232] dark:text-[#FCA5A5]'
            : 'bg-[#EDF8F2] dark:bg-[#142A1D] border-[#138A5B]/30 text-[#138A5B] dark:text-[#8FD4AE]'
        }`}>
          {toastError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5DFD5] dark:border-[#26362D] pb-1">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-[#1C3A2B] text-white dark:bg-[#2A4D3B]'
              : 'text-[#5D645E] dark:text-[#9FB1A6] hover:bg-[#FAF8F5] dark:hover:bg-[#16211B]'
          }`}
        >
          Carrel Inventory ({desks.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-[#1C3A2B] text-white dark:bg-[#2A4D3B]'
              : 'text-[#5D645E] dark:text-[#9FB1A6] hover:bg-[#FAF8F5] dark:hover:bg-[#16211B]'
          }`}
        >
          <span>Change Requests</span>
          {pendingRequestsCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
              {pendingRequestsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('reassign')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === 'reassign'
              ? 'bg-[#1C3A2B] text-white dark:bg-[#2A4D3B]'
              : 'text-[#5D645E] dark:text-[#9FB1A6] hover:bg-[#FAF8F5] dark:hover:bg-[#16211B]'
          }`}
        >
          Direct Reassign Seat
        </button>
      </div>

      {/* ── TAB 1: CARREL INVENTORY ── */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 bg-white dark:bg-[#16211B] rounded-2xl border border-[#E5DFD5] dark:border-[#26362D]">
              <Loader2 className="animate-spin text-[#1C3A2B] dark:text-[#8FD4AE]" size={28} />
              <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6]">Loading provisioned study desks...</p>
            </div>
          ) : desks.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3 bg-white dark:bg-[#16211B] rounded-2xl border border-[#E5DFD5] dark:border-[#26362D]">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] dark:bg-[#111A14] text-[#6D8374] mx-auto flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <h3 className="font-serif-lib text-base font-bold text-[#1C1E1B] dark:text-white">
                No Desks Configured Yet
              </h3>
              <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] max-w-sm mx-auto">
                No physical carrels have been provisioned in the database yet. Click "Add Carrel Desk" above to create real seats.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {desks.map(d => {
                const isOccupied = d.status === 'occupied' || d.status === 'reserved';
                return (
                  <div
                    key={d.desk_id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-base text-[#1C3A2B] dark:text-[#8FD4AE]">
                            Desk {d.desk_id}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                            isOccupied
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                              : d.status === 'unavailable'
                              ? 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30'
                              : 'bg-[#138A5B]/15 text-[#138A5B] dark:text-[#8FD4AE] border-[#138A5B]/30'
                          }`}>
                            {d.status}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#1C1E1B] dark:text-white mt-0.5">
                          {d.bay_name || d.bay}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-[#8A928C]">
                        {d.floor || 'Floor 1'}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#5D645E] dark:text-[#9FB1A6] space-y-1 bg-[#FAF8F5] dark:bg-[#111A14] p-2.5 rounded-xl border border-[#EFEBE4] dark:border-[#223328]">
                      {isOccupied && (
                        <p className="font-semibold text-[#1C3A2B] dark:text-[#8FD4AE]">
                          Reserved By: {d.reserved_by_name || d.reserved_by || 'Patron'}
                        </p>
                      )}
                      <p>
                        Features: {Array.isArray(d.amenities) ? d.amenities.join(', ') : d.amenities || 'Standard Socket'}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#F0ECE6] dark:border-[#26362D]">
                      {isOccupied && (
                        <button
                          disabled={submitting}
                          onClick={() => handleReleaseDesk(d.desk_id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                        >
                          Release Seat
                        </button>
                      )}
                      <button
                        disabled={submitting}
                        onClick={() => handleToggleStatus(d.desk_id, d.status)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#5D645E] dark:text-[#9FB1A6] hover:bg-[#FAF8F5] dark:hover:bg-[#203126] transition cursor-pointer"
                      >
                        {d.status === 'unavailable' ? 'Make Available' : 'Take Offline'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: CHANGE REQUESTS ── */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 bg-white dark:bg-[#16211B] rounded-2xl border border-[#E5DFD5] dark:border-[#26362D]">
              <Loader2 className="animate-spin text-[#1C3A2B] dark:text-[#8FD4AE]" size={28} />
              <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6]">Loading change requests...</p>
            </div>
          ) : changeRequests.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3 bg-white dark:bg-[#16211B] rounded-2xl border border-[#E5DFD5] dark:border-[#26362D]">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] dark:bg-[#111A14] text-[#6D8374] mx-auto flex items-center justify-center">
                <ArrowRightLeft size={24} />
              </div>
              <h3 className="font-serif-lib text-base font-bold text-[#1C1E1B] dark:text-white">
                No Desk Change Requests
              </h3>
              <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] max-w-sm mx-auto">
                No patrons have submitted requests to move desks. When students request seat transfers, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {changeRequests.map(req => (
                <div
                  key={req._id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#1C1E1B] dark:text-white">
                        {req.student_name || req.student_id}
                      </span>
                      <span className="text-xs text-[#8A928C]">•</span>
                      <span className="font-mono font-bold text-xs text-[#1C3A2B] dark:text-[#8FD4AE]">
                        Desk {req.current_desk_id} → Desk {req.requested_desk_id}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                        req.status === 'approved'
                          ? 'bg-[#138A5B]/15 text-[#138A5B] dark:text-[#8FD4AE] border-[#138A5B]/30'
                          : req.status === 'rejected'
                          ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6]">
                      <span className="font-semibold">Reason:</span> {req.reason}
                    </p>
                    {req.rejection_reason && (
                      <p className="text-[11px] text-red-600 dark:text-red-400">
                        Rejection note: {req.rejection_reason}
                      </p>
                    )}
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                      <button
                        disabled={submitting}
                        onClick={() => handleApproveRequest(req._id)}
                        className="px-3.5 py-2 rounded-xl bg-[#138A5B] hover:bg-[#0E6C47] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <Check size={14} />
                        <span>Approve &amp; Reassign</span>
                      </button>
                      <button
                        disabled={submitting}
                        onClick={() => setRejectingId(req._id)}
                        className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <X size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: DIRECT REASSIGN ── */}
      {activeTab === 'reassign' && (
        <div className="max-w-lg bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="space-y-1">
            <h3 className="font-serif-lib text-lg font-bold text-[#1C1E1B] dark:text-white">
              Direct Seat Reassignment
            </h3>
            <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6]">
              Administratively assign or move any enrolled student to a designated carrel seat.
            </p>
          </div>

          <form onSubmit={handleManualReassign} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#1C1E1B] dark:text-white mb-1">
                Select Patron Scholar *
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl text-xs"
              >
                <option value="">Select student</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.full_name || [s.first_name, s.last_name].filter(Boolean).join(' ') || s.email} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1E1B] dark:text-white mb-1">
                Select Destination Desk *
              </label>
              <select
                value={selectedNewDeskId}
                onChange={(e) => setSelectedNewDeskId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl text-xs"
              >
                <option value="">Select desk</option>
                {desks
                  .filter(d => d.status === 'available' || d.status === 'active')
                  .map(d => (
                    <option key={d.desk_id} value={d.desk_id}>
                      Desk {d.desk_id} ({d.bay_name || d.bay})
                    </option>
                  ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedStudentId || !selectedNewDeskId}
              className="w-full py-2.5 rounded-xl bg-[#1C3A2B] hover:bg-[#142C20] dark:bg-[#2A4D3B] dark:hover:bg-[#37614B] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50 mt-2"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <span>Confirm Seat Assignment</span>
            </button>
          </form>
        </div>
      )}

      {/* ── CREATE DESK MODAL ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#16211B] border border-[#D9D3C7] dark:border-[#26362D] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] dark:border-[#26362D] pb-3">
              <h3 className="font-serif-lib text-base font-bold text-[#1C1E1B] dark:text-white">
                Add Real Study Carrel Desk
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-[#5D645E] dark:text-[#9FB1A6]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateDesk} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1C1E1B] dark:text-white mb-1">
                  Desk ID (e.g. A-01, B-04) *
                </label>
                <input
                  required
                  placeholder="e.g. A-01"
                  value={newDesk.desk_id}
                  onChange={(e) => setNewDesk(prev => ({ ...prev, desk_id: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 bg-white dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1E1B] dark:text-white mb-1">
                  Bay Zone *
                </label>
                <select
                  value={newDesk.bay}
                  onChange={(e) => setNewDesk(prev => ({ ...prev, bay: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl text-xs"
                >
                  <option value="Bay A">Bay A (Silent Zone)</option>
                  <option value="Bay B">Bay B (Window Alcoves)</option>
                  <option value="Bay C">Bay C (Digital &amp; Power)</option>
                  <option value="Bay D">Bay D (General Reading)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1E1B] dark:text-white mb-1">
                  Bay Name / Description
                </label>
                <input
                  value={newDesk.bay_name}
                  onChange={(e) => setNewDesk(prev => ({ ...prev, bay_name: e.target.value }))}
                  placeholder="e.g. Heated Silent Zone"
                  className="w-full px-3 py-2 bg-white dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1E1B] dark:text-white mb-1">
                  Amenities (comma-separated)
                </label>
                <input
                  value={newDesk.amenities}
                  onChange={(e) => setNewDesk(prev => ({ ...prev, amenities: e.target.value }))}
                  placeholder="230V Socket, Heated Zone, Task Lamp"
                  className="w-full px-3 py-2 bg-white dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5D645E] dark:text-[#9FB1A6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newDesk.desk_id}
                  className="px-5 py-2 rounded-xl bg-[#1C3A2B] hover:bg-[#142C20] dark:bg-[#2A4D3B] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  {submitting && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Desk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── REJECTION MODAL ── */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#16211B] border border-[#D9D3C7] dark:border-[#26362D] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-serif-lib text-base font-bold text-[#1C1E1B] dark:text-white">
              Reject Desk Change Request
            </h3>
            <form onSubmit={handleRejectRequest} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1C1E1B] dark:text-white mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Desk already allocated for senior researcher"
                  className="w-full px-3 py-2 bg-white dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5D645E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !rejectionReason.trim()}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

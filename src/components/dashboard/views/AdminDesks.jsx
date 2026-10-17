'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MapPin, CheckCircle2, ArrowRightLeft, Plus,
  AlertCircle, Loader2, RefreshCw, Check, X
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

  const [activeTab, setActiveTab] = useState('inventory');
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
    bay_name: 'Silent Reading Zone',
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
      showToast(`Desk ${newDesk.desk_id} added successfully`);
      setShowCreateModal(false);
      setNewDesk({
        desk_id: '',
        bay: 'Bay A',
        bay_name: 'Silent Reading Zone',
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
      showToast(`Desk ${deskId} released to available status`);
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
      showToast(`Desk ${deskId} status updated to ${nextStatus}`);
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
      showToast('Desk change request approved and seat reassigned');
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
      showToast('Desk change request rejected');
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
      showToast(`Student successfully assigned to Desk ${selectedNewDeskId}`);
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
          <h2 className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white">
            Study Carrels &amp; Desk Allocation
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Manage physical reading carrels, review allocations, and process desk change requests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            title="Refresh desk data"
            className="p-2 rounded-lg bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg bg-[#004B87] hover:bg-[#003B6B] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Carrel Desk</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
          toastError
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
        }`}>
          {toastError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-[#004B87] text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Carrel Inventory ({desks.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-[#004B87] text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Change Requests</span>
          {pendingRequestsCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center">
              {pendingRequestsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('reassign')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'reassign'
              ? 'bg-[#004B87] text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Direct Reassign Seat
        </button>
      </div>

      {/* TAB 1: CARREL INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800">
              <Loader2 className="animate-spin text-[#004B87]" size={28} />
              <p className="text-xs text-slate-500">Loading carrel desks...</p>
            </div>
          ) : desks.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <h3 className="font-serif-lib text-base font-bold text-slate-900 dark:text-white">
                No Desks Configured
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No carrels have been provisioned in the database yet. Click "Add Carrel Desk" above to create seats.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {desks.map(d => {
                const isOccupied = d.status === 'occupied' || d.status === 'reserved';
                return (
                  <div
                    key={d.desk_id}
                    className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                            Desk {d.desk_id}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            isOccupied
                              ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                              : d.status === 'unavailable'
                              ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                          }`}>
                            {d.status}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                          {d.bay_name || d.bay}
                        </p>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {d.floor || 'Floor 1'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      {isOccupied && (
                        <p className="font-semibold text-slate-900 dark:text-white">
                          Reserved: {d.reserved_by_name || d.reserved_by || 'Patron'}
                        </p>
                      )}
                      <p>
                        Features: {Array.isArray(d.amenities) ? d.amenities.join(', ') : d.amenities || 'Standard Socket'}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      {isOccupied && (
                        <button
                          disabled={submitting}
                          onClick={() => handleReleaseDesk(d.desk_id)}
                          className="px-3 py-1.5 rounded text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                        >
                          Release Seat
                        </button>
                      )}
                      <button
                        disabled={submitting}
                        onClick={() => handleToggleStatus(d.desk_id, d.status)}
                        className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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

      {/* TAB 2: CHANGE REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800">
              <Loader2 className="animate-spin text-[#004B87]" size={28} />
              <p className="text-xs text-slate-500">Loading change requests...</p>
            </div>
          ) : changeRequests.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <ArrowRightLeft size={24} />
              </div>
              <h3 className="font-serif-lib text-base font-bold text-slate-900 dark:text-white">
                No Desk Change Requests
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No student requests to change desks are currently pending.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {changeRequests.map(req => (
                <div
                  key={req._id}
                  className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">
                        {req.student_name || req.student_id}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        Desk {req.current_desk_id} → Desk {req.requested_desk_id}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                          : req.status === 'rejected'
                          ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                          : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">Reason:</span> {req.reason}
                    </p>
                    {req.rejection_reason && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400">
                        Rejection note: {req.rejection_reason}
                      </p>
                    )}
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                      <button
                        disabled={submitting}
                        onClick={() => handleApproveRequest(req._id)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <Check size={14} />
                        <span>Approve</span>
                      </button>
                      <button
                        disabled={submitting}
                        onClick={() => setRejectingId(req._id)}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
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

      {/* TAB 3: DIRECT REASSIGN */}
      {activeTab === 'reassign' && (
        <div className="max-w-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="space-y-1">
            <h3 className="font-serif-lib text-lg font-bold text-slate-900 dark:text-white">
              Direct Seat Reassignment
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Administratively assign or move any enrolled student to a designated carrel seat.
            </p>
          </div>

          <form onSubmit={handleManualReassign} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Student *
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none"
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Destination Desk *
              </label>
              <select
                value={selectedNewDeskId}
                onChange={(e) => setSelectedNewDeskId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none"
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
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-[#004B87] hover:bg-[#003B6B] text-white text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {submitting ? 'Reassigning...' : 'Confirm Reassignment'}
            </button>
          </form>
        </div>
      )}

      {/* Create Desk Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-serif-lib text-lg font-bold text-slate-900 dark:text-white">
                Add Carrel Desk
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDesk} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Desk ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. D101, A12..."
                  value={newDesk.desk_id}
                  onChange={(e) => setNewDesk(prev => ({ ...prev, desk_id: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bay
                  </label>
                  <select
                    value={newDesk.bay}
                    onChange={(e) => setNewDesk(prev => ({ ...prev, bay: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none"
                  >
                    <option value="Bay A">Bay A</option>
                    <option value="Bay B">Bay B</option>
                    <option value="Bay C">Bay C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Floor
                  </label>
                  <select
                    value={newDesk.floor}
                    onChange={(e) => setNewDesk(prev => ({ ...prev, floor: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none"
                  >
                    <option value="Floor 1">Floor 1</option>
                    <option value="Floor 2">Floor 2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Zone Description
                </label>
                <input
                  type="text"
                  value={newDesk.bay_name}
                  onChange={(e) => setNewDesk(prev => ({ ...prev, bay_name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={newDesk.amenities}
                  onChange={(e) => setNewDesk(prev => ({ ...prev, amenities: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#004B87] hover:bg-[#003B6B] text-white text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submitting ? 'Creating...' : 'Create Desk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Request Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="font-serif-lib text-lg font-bold text-slate-900 dark:text-white">
              Reject Desk Change Request
            </h3>
            <form onSubmit={handleRejectRequest} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rejection Reason (optional)
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Requested desk is currently booked for a full-term scholar."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submitting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

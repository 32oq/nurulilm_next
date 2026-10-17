'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MapPin, CheckCircle2,
  Users, Clock, ShieldCheck, X, Check,
  Loader2, RefreshCw, Lock, AlertCircle, ArrowRightLeft
} from 'lucide-react';
import { useOther } from '../../context/OtherContext';

export default function InteractiveDeskMap({ user, onClose }) {
  const {
    fetchDesks,
    reserveDesk,
    fetchMyDesk,
    submitDeskChangeRequest,
    fetchMyDeskChangeRequests
  } = useOther();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [desksList, setDesksList] = useState([]);
  const [selectedDesk, setSelectedDesk] = useState(null);
  const [filter, setFilter] = useState('all'); // all | available | quiet
  const [claimedDesk, setClaimedDesk] = useState(null);
  const [claimedDeskDoc, setClaimedDeskDoc] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState(false);

  // Desk change request modal state
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeTargetDesk, setChangeTargetDesk] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [myRequests, setMyRequests] = useState([]);

  const isUserOnboarded = Boolean(user?.profile_photo && (user?.onboarding_completed || user?.verified));

  const loadDesksFromApi = useCallback(async () => {
    setLoading(true);
    try {
      const [resDesks, myDeskRes, changeReqsRes] = await Promise.allSettled([
        fetchDesks(),
        fetchMyDesk(),
        fetchMyDeskChangeRequests()
      ]);

      if (resDesks.status === 'fulfilled' && Array.isArray(resDesks.value)) {
        setDesksList(resDesks.value);
      } else {
        setDesksList([]);
      }

      if (myDeskRes.status === 'fulfilled' && myDeskRes.value?.desk_id) {
        setClaimedDesk(myDeskRes.value.desk_id);
        setClaimedDeskDoc(myDeskRes.value);
      } else {
        setClaimedDesk(null);
        setClaimedDeskDoc(null);
      }

      if (changeReqsRes.status === 'fulfilled' && Array.isArray(changeReqsRes.value)) {
        setMyRequests(changeReqsRes.value);
      }
    } catch (err) {
      console.warn('Desk fetch:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchDesks, fetchMyDesk, fetchMyDeskChangeRequests]);

  useEffect(() => {
    loadDesksFromApi();
  }, [loadDesksFromApi]);

  const handleClaimDesk = async (desk) => {
    if (!isUserOnboarded) {
      setToastError(true);
      setToastMsg('Photo & Onboarding verification required before reserving a carrel seat.');
      setTimeout(() => setToastMsg(''), 4000);
      return;
    }

    if (claimedDesk) {
      setToastError(true);
      setToastMsg(`You already hold reserved Desk ${claimedDesk}. Seat assignments are locked; please submit a Desk Change Request.`);
      setTimeout(() => setToastMsg(''), 4000);
      return;
    }

    if (desk.status === 'occupied') {
      setToastError(true);
      setToastMsg(`Desk ${desk.desk_id} is currently occupied.`);
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }

    setSubmitting(true);
    setToastError(false);
    try {
      await reserveDesk(desk.desk_id);
      setClaimedDesk(desk.desk_id);
      setClaimedDeskDoc(desk);
      setToastMsg(`Desk ${desk.desk_id} successfully reserved for your active semester session.`);
      await loadDesksFromApi();
    } catch (err) {
      setToastError(true);
      setToastMsg(err.message || 'Failed to reserve desk');
    } finally {
      setSubmitting(false);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const handleSubmitChangeRequest = async (e) => {
    e.preventDefault();
    if (!changeTargetDesk || !changeReason.trim()) return;

    setSubmitting(true);
    setToastError(false);
    try {
      await submitDeskChangeRequest({
        requested_desk_id: changeTargetDesk,
        reason: changeReason.trim()
      });
      setToastMsg(`Desk change request submitted. Library administrator will review and reassign your seat.`);
      setShowChangeModal(false);
      setChangeReason('');
      setChangeTargetDesk('');
      await loadDesksFromApi();
    } catch (err) {
      setToastError(true);
      setToastMsg(err.message || 'Failed to submit desk change request');
    } finally {
      setSubmitting(false);
      setTimeout(() => setToastMsg(''), 4500);
    }
  };

  const occupiedCount = desksList.filter(d => d.status === 'occupied' || (d.status === 'reserved' && d.desk_id !== claimedDesk)).length;
  const availableCount = desksList.filter(d => d.status === 'available' || d.status === 'active').length;

  const filteredDesks = desksList.filter(d => {
    const isMine = d.desk_id === claimedDesk;
    if (filter === 'available') return d.status === 'available' || isMine;
    if (filter === 'quiet') return d.bay === 'Bay A';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl relative p-4 sm:p-7 space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                Carrel Allocation
              </span>
              <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {availableCount} Available • {occupiedCount} Occupied
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              Study Desks and Carrel Seating
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an available carrel to reserve your study workspace. Once reserved, your seat is locked.
            </p>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={loadDesksFromApi}
              title="Refresh live availability"
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Locked Active Reservation Plaque */}
        {claimedDesk && (
          <div className="p-3.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[#004B87] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                <Lock size={15} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#004B87] dark:text-blue-300">
                    Your Reserved Seat: Desk {claimedDesk}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-[#004B87] dark:text-blue-300 font-semibold uppercase">
                    Locked
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Seats are assigned per active term. If you require a different bay or lighting alcove, submit a change request.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setChangeTargetDesk('');
                setShowChangeModal(true);
              }}
              className="px-3 py-1.5 rounded-md bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-xs font-semibold text-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center gap-1.5 self-end sm:self-auto shadow-2xs"
            >
              <ArrowRightLeft size={13} />
              <span>Request Seat Change</span>
            </button>
          </div>
        )}

        {/* Toast alert */}
        {toastMsg && (
          <div className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
            toastError
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
          }`}>
            <AlertCircle size={14} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Filter Pills & Legend */}
        {desksList.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  filter === 'all'
                    ? 'bg-[#004B87] text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                All Desks ({desksList.length})
              </button>
              <button
                onClick={() => setFilter('available')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  filter === 'available'
                    ? 'bg-[#004B87] text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Available ({availableCount})
              </button>
              <button
                onClick={() => setFilter('quiet')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  filter === 'quiet'
                    ? 'bg-[#004B87] text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Bay A Quiet Zone
              </button>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-white dark:bg-[#111827] border border-slate-300" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#004B87]" />
                <span>Your Desk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-slate-200 dark:bg-slate-800" />
                <span>Occupied</span>
              </div>
            </div>
          </div>
        )}

        {/* Desk Grid */}
        <div className="p-4 rounded-lg bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800">
          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-2">
              <Loader2 className="animate-spin text-[#004B87]" size={22} />
              <p className="text-xs text-slate-500">Loading carrel status...</p>
            </div>
          ) : desksList.length === 0 ? (
            <div className="py-10 px-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
                <MapPin size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                No Desks Configured
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No study desks are registered yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {filteredDesks.map(desk => {
                const isClaimed = desk.desk_id === claimedDesk;
                const isOccupied = (desk.status === 'occupied' || desk.status === 'reserved') && !isClaimed;
                const isSelected = selectedDesk?.desk_id === desk.desk_id;

                return (
                  <button
                    key={desk.desk_id}
                    onClick={() => setSelectedDesk(desk)}
                    className={`h-12 rounded-lg text-xs font-mono font-bold transition flex flex-col items-center justify-center p-1 cursor-pointer border ${
                      isClaimed
                        ? 'bg-[#004B87] text-white border-[#004B87] shadow-2xs'
                        : isOccupied
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'bg-white dark:bg-[#111827] border-[#004B87] text-[#004B87] ring-1 ring-[#004B87]'
                        : 'bg-white dark:bg-[#111827] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-[#004B87]'
                    }`}
                  >
                    <span className="text-xs leading-none">{desk.desk_id}</span>
                    <span className="text-[9px] uppercase font-sans font-normal opacity-70 mt-0.5">
                      {isClaimed ? 'Yours' : isOccupied ? 'Occupied' : 'Free'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Desk Action Drawer */}
        {selectedDesk && (
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-[#004B87] dark:text-blue-400">
                  Desk {selectedDesk.desk_id}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {selectedDesk.bay_name || selectedDesk.bay || 'General Bay'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Amenities: {(selectedDesk.amenities || ['Power Socket', 'Heated Zone']).join(' • ')}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {selectedDesk.desk_id === claimedDesk ? (
                <span className="px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                  <Check size={13} /> Your Locked Desk
                </span>
              ) : (selectedDesk.status === 'occupied' || selectedDesk.status === 'reserved') ? (
                <span className="px-3 py-1.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-500 text-xs font-medium">
                  Occupied
                </span>
              ) : claimedDesk ? (
                <button
                  onClick={() => {
                    setChangeTargetDesk(selectedDesk.desk_id);
                    setShowChangeModal(true);
                  }}
                  className="px-3 py-1.5 rounded-md bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <ArrowRightLeft size={13} />
                  <span>Request Move to {selectedDesk.desk_id}</span>
                </button>
              ) : (
                <button
                  disabled={submitting}
                  onClick={() => handleClaimDesk(selectedDesk)}
                  className="px-4 py-1.5 rounded-md bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <Loader2 size={13} className="animate-spin" />}
                  <span>Reserve Desk {selectedDesk.desk_id}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Change Request History */}
        {myRequests.length > 0 && (
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Seat Change Requests
            </h4>
            <div className="space-y-1.5">
              {myRequests.map(req => (
                <div
                  key={req._id}
                  className="p-2.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Desk {req.current_desk_id} to Desk {req.requested_desk_id}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Reason: {req.reason}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    req.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : req.status === 'rejected'
                      ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                      : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                  }`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desk Change Request Modal */}
        {showChangeModal && (
          <div className="fixed inset-0 z-60 bg-slate-900/70 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft size={15} className="text-[#004B87] dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Submit Desk Change Request
                  </h3>
                </div>
                <button
                  onClick={() => setShowChangeModal(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleSubmitChangeRequest} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Current Assigned Desk
                  </label>
                  <input
                    disabled
                    value={claimedDesk || 'None'}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-700 dark:text-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Requested New Desk *
                  </label>
                  <select
                    value={changeTargetDesk}
                    onChange={(e) => setChangeTargetDesk(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Select an available desk</option>
                    {desksList
                      .filter(d => (d.status === 'available' || d.status === 'active') && d.desk_id !== claimedDesk)
                      .map(d => (
                        <option key={d.desk_id} value={d.desk_id}>
                          Desk {d.desk_id} ({d.bay_name || d.bay || 'General'})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Reason for Desk Change *
                  </label>
                  <textarea
                    rows={3}
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    placeholder="e.g. Need direct power socket or prefer quieter bay"
                    required
                    className="w-full px-3 py-1.5 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowChangeModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !changeTargetDesk || !changeReason.trim()}
                    className="px-4 py-1.5 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                  >
                    {submitting && <Loader2 size={13} className="animate-spin" />}
                    <span>Submit Request</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

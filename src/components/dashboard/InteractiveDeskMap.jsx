'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MapPin, CheckCircle2, Flame, Wifi, Zap,
  Coffee, Users, Clock, ShieldCheck, Sparkles, X, Check,
  Loader2, RefreshCw, Lock, AlertCircle, ArrowRightLeft, FileText, Send
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
      setToastMsg(`✓ Desk ${desk.desk_id} successfully reserved and locked for your active semester session!`);
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
      setToastMsg(`✓ Desk change request submitted. Library administrator will review and reassign your seat.`);
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0B1726] border border-[#DCE3EC] dark:border-[#18283A] rounded-3xl max-w-3xl w-full shadow-2xl relative p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E7ECF2] dark:border-[#18283A] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1677FF] dark:text-[#00B8FF] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#138A5B] animate-pulse"></span>
                Carrel Allocation System
              </span>
              <span className="text-xs text-[#64748B]">•</span>
              <span className="text-xs text-[#138A5B] font-semibold">
                {availableCount} Available • {occupiedCount} Occupied
              </span>
            </div>
            <h2 className="font-serif-lib text-2xl font-bold text-[#0B1B2B] dark:text-white mt-1">
              Study Carrel &amp; Reading Desks
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#A0ACBA] mt-0.5">
              Strict seat reservation with concurrency protection. Once reserved, your seat is locked to protect your workspace.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={loadDesksFromApi}
              title="Refresh live availability"
              className="p-1.5 rounded-xl text-[#64748B] hover:text-[#1677FF] hover:bg-[#EEF2F7] dark:hover:bg-[#0F1D2E] transition cursor-pointer"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin text-[#1677FF]' : ''} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0B1B2B] dark:hover:text-white hover:bg-[#EEF2F7] dark:hover:bg-[#0F1D2E] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Locked Active Reservation Plaque */}
        {claimedDesk && (
          <div className="p-4 rounded-2xl bg-[#EAF8F1] dark:bg-[#142A1D] border border-[#138A5B]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#138A5B] text-white flex items-center justify-center font-mono font-bold text-sm shadow-xs flex-shrink-0">
                <Lock size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#138A5B] dark:text-[#8FD4AE]">
                    Your Reserved &amp; Locked Seat: Desk {claimedDesk}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#138A5B]/20 text-[#138A5B] dark:text-[#8FD4AE] font-semibold uppercase">
                    Locked
                  </span>
                </div>
                <p className="text-[11px] text-[#2F6B4C] dark:text-[#9FB1A6] mt-0.5">
                  Seats cannot be arbitrarily changed. If you require a different bay or lighting alcove, submit a request to administration.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setChangeTargetDesk('');
                setShowChangeModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#0B1726] border border-[#138A5B]/40 hover:bg-[#F2FBF6] text-xs font-semibold text-[#138A5B] dark:text-[#8FD4AE] transition cursor-pointer flex items-center gap-1.5 self-end sm:self-auto shadow-xs"
            >
              <ArrowRightLeft size={14} />
              <span>Request Desk Change</span>
            </button>
          </div>
        )}

        {/* Toast alert */}
        {toastMsg && (
          <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            toastError
              ? 'bg-[#FAF0F0] dark:bg-[#3D1A1A] border-[#F0D5D5] text-[#A83232] dark:text-[#FCA5A5]'
              : 'bg-[#EAF2FF] dark:bg-[#0F1D2E] border-[#1677FF]/30 text-[#1677FF] dark:text-[#00B8FF]'
          }`}>
            {toastError ? <AlertCircle size={15} /> : <Sparkles size={15} />}
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Filter Pills & Legend */}
        {desksList.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  filter === 'all'
                    ? 'bg-[#1677FF] text-white shadow-xs'
                    : 'bg-[#EEF2F7] dark:bg-[#081321] text-[#475569] dark:text-[#A0ACBA]'
                }`}
              >
                All Provisioned Desks ({desksList.length})
              </button>
              <button
                onClick={() => setFilter('available')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  filter === 'available'
                    ? 'bg-[#1677FF] text-white shadow-xs'
                    : 'bg-[#EEF2F7] dark:bg-[#081321] text-[#475569] dark:text-[#A0ACBA]'
                }`}
              >
                Available ({availableCount})
              </button>
              <button
                onClick={() => setFilter('quiet')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  filter === 'quiet'
                    ? 'bg-[#1677FF] text-white shadow-xs'
                    : 'bg-[#EEF2F7] dark:bg-[#081321] text-[#475569] dark:text-[#A0ACBA]'
                }`}
              >
                Bay A Quiet Zone
              </button>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#EAF8F1] border border-[#138A5B]/30" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#1677FF] border border-[#1677FF]" />
                <span>Your Desk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#EEF2F7] dark:bg-[#081321] border border-[#DCE3EC] dark:border-[#18283A]" />
                <span>Occupied</span>
              </div>
            </div>
          </div>
        )}

        {/* ── DESK GRID OR HONEST EMPTY STATE ── */}
        <div className="p-5 rounded-2xl bg-[#F6F8FB] dark:bg-[#081321] border border-[#DCE3EC] dark:border-[#18283A]">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="animate-spin text-[#1677FF]" size={28} />
              <p className="text-xs text-[#64748B]">Querying database for real carrel desks...</p>
            </div>
          ) : desksList.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF2F7] dark:bg-[#16211B] text-[#64748B] mx-auto flex items-center justify-center">
                <MapPin size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif-lib text-base font-bold text-[#0B1B2B] dark:text-white">
                  No Desks Configured Yet
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#8CA093] max-w-sm mx-auto leading-relaxed">
                  No study desks have been provisioned in the database yet. Library administration will add carrels shortly.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
              {filteredDesks.map(desk => {
                const isClaimed = desk.desk_id === claimedDesk;
                const isOccupied = (desk.status === 'occupied' || desk.status === 'reserved') && !isClaimed;
                const isSelected = selectedDesk?.desk_id === desk.desk_id;

                return (
                  <button
                    key={desk.desk_id}
                    onClick={() => setSelectedDesk(desk)}
                    className={`h-14 rounded-xl text-xs font-bold font-mono transition-all flex flex-col items-center justify-center p-1.5 cursor-pointer border ${
                      isClaimed
                        ? 'bg-[#1677FF] text-white border-[#1677FF] shadow-sm ring-2 ring-[#1677FF]/40'
                        : isOccupied
                        ? 'bg-[#E7ECF2] dark:bg-[#0F1D2E] text-[#64748B] border-[#DCE3EC] dark:border-[#18283A] cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'bg-white dark:bg-[#0B1726] border-[#1677FF] text-[#1677FF] ring-2 ring-[#1677FF]'
                        : 'bg-white dark:bg-[#0B1726] border-[#DCE3EC] dark:border-[#18283A] text-[#0B1B2B] dark:text-[#F5F7FA] hover:border-[#1677FF] hover:shadow-xs'
                    }`}
                  >
                    <span className="text-xs">{desk.desk_id}</span>
                    <span className="text-[9px] uppercase font-sans font-normal opacity-70">
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
          <div className="p-4 rounded-2xl bg-[#EEF2F7] dark:bg-[#0F1D2E] border border-[#DCE3EC] dark:border-[#18283A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base text-[#1677FF] dark:text-[#00B8FF]">
                  Desk {selectedDesk.desk_id}
                </span>
                <span className="text-xs text-[#64748B]">•</span>
                <span className="text-xs font-semibold text-[#0B1B2B] dark:text-white">
                  {selectedDesk.bay_name || selectedDesk.bay || 'General Bay'}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Amenities: {(selectedDesk.amenities || ['Power Socket', 'Heated Zone']).join(' • ')}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {selectedDesk.desk_id === claimedDesk ? (
                <span className="px-3.5 py-2 rounded-xl bg-[#138A5B]/15 text-[#138A5B] dark:text-[#19D68C] border border-[#138A5B]/30 text-xs font-bold flex items-center gap-1.5">
                  <Check size={14} /> Currently Your Locked Desk
                </span>
              ) : (selectedDesk.status === 'occupied' || selectedDesk.status === 'reserved') ? (
                <span className="px-4 py-2 rounded-xl bg-[#64748B]/15 text-[#64748B] text-xs font-medium">
                  Occupied by Fellow Scholar
                </span>
              ) : claimedDesk ? (
                <button
                  onClick={() => {
                    setChangeTargetDesk(selectedDesk.desk_id);
                    setShowChangeModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-[#1264E8] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <ArrowRightLeft size={14} />
                  <span>Request Move to {selectedDesk.desk_id}</span>
                </button>
              ) : (
                <button
                  disabled={submitting}
                  onClick={() => handleClaimDesk(selectedDesk)}
                  className="px-5 py-2.5 rounded-xl bg-[#1677FF] hover:bg-[#1264E8] text-white text-xs font-semibold transition active:scale-95 shadow-sm cursor-pointer flex items-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>Reserve Desk {selectedDesk.desk_id}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Change Request History (if any) */}
        {myRequests.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A0ACBA]">
              Your Desk Change Requests
            </h4>
            <div className="space-y-2">
              {myRequests.map(req => (
                <div
                  key={req._id}
                  className="p-3 rounded-xl bg-white dark:bg-[#111A14] border border-[#E5DFD5] dark:border-[#26362D] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-[#1C1E1B] dark:text-white">
                      Desk {req.current_desk_id} → Desk {req.requested_desk_id}
                    </span>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Reason: {req.reason}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    req.status === 'approved'
                      ? 'bg-[#138A5B]/15 text-[#138A5B] dark:text-[#8FD4AE] border-[#138A5B]/30'
                      : req.status === 'rejected'
                      ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DESK CHANGE REQUEST MODAL ── */}
        {showChangeModal && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0B1726] border border-[#DCE3EC] dark:border-[#18283A] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#E7ECF2] dark:border-[#18283A] pb-3">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft size={16} className="text-[#1677FF]" />
                  <h3 className="font-serif-lib text-base font-bold text-[#0B1B2B] dark:text-white">
                    Submit Desk Change Request
                  </h3>
                </div>
                <button
                  onClick={() => setShowChangeModal(false)}
                  className="p-1 rounded-lg text-[#64748B] hover:text-[#0B1B2B] dark:hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitChangeRequest} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1E1B] dark:text-white mb-1">
                    Current Assigned Desk
                  </label>
                  <input
                    disabled
                    value={claimedDesk || 'None'}
                    className="w-full px-3 py-2 bg-[#F6F8FB] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1E1B] dark:text-white mb-1">
                    Requested New Desk *
                  </label>
                  <select
                    value={changeTargetDesk}
                    onChange={(e) => setChangeTargetDesk(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl text-xs"
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
                  <label className="block text-xs font-semibold text-[#1C1E1B] dark:text-white mb-1">
                    Reason for Desk Change *
                  </label>
                  <textarea
                    rows={3}
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    placeholder="e.g. Need direct power socket for laptop research or prefer quieter bay"
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowChangeModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#EEF2F7] dark:hover:bg-[#16211B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !changeTargetDesk || !changeReason.trim()}
                    className="px-5 py-2 rounded-xl bg-[#1677FF] hover:bg-[#1264E8] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
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

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MapPin, CheckCircle2, Users, Clock, ShieldCheck, X, Check,
  Loader2, RefreshCw, Lock, AlertCircle, ArrowRightLeft,
  Zap, Wifi, Eye, LayoutGrid, Compass, Info
} from 'lucide-react';
import { useOther } from '../../context/OtherContext';

// Exact 48-desk physical layout coordinates based on verified blueprint
// Canvas viewBox: 0 0 1000 680
const DESK_BLUEPRINT_COORDS = {
  // ── GIRLS ENCLAVE (Enclosed Private Room, Bottom-Left: x: 30 to 330, y: 390 to 650) ──
  // East pod (facing West)
  '1': { x: 250, y: 580, w: 55, h: 42, section: 'girls', zone: 'enclave', label: '1', pod: 'Girls Enclave Pod East' },
  '2': { x: 250, y: 520, w: 55, h: 42, section: 'girls', zone: 'enclave', label: '2', pod: 'Girls Enclave Pod East' },
  '3': { x: 250, y: 460, w: 55, h: 42, section: 'girls', zone: 'enclave', label: '3', pod: 'Girls Enclave Pod East' },
  // West pod (back-to-back with 1-3, facing East)
  '6': { x: 175, y: 580, w: 55, h: 42, section: 'girls', zone: 'enclave', label: '6', pod: 'Girls Enclave Pod West' },
  '5': { x: 175, y: 520, w: 55, h: 42, section: 'girls', zone: 'enclave', label: '5', pod: 'Girls Enclave Pod West' },
  '4': { x: 175, y: 460, w: 55, h: 42, section: 'girls', zone: 'enclave', label: '4', pod: 'Girls Enclave Pod West' },
  // West wall row
  '7': { x: 60, y: 580, w: 55, h: 42, section: 'girls', zone: 'enclave', label: '7', pod: 'Girls Enclave Wall Row' },
  '8': { x: 60, y: 520, w: 55, h: 42, section: 'girls', zone: 'enclave', label: '8', pod: 'Girls Enclave Wall Row' },
  '9': { x: 60, y: 460, w: 55, h: 42, section: 'girls', zone: 'enclave', label: '9', pod: 'Girls Enclave Wall Row' },

  // ── MAIN HALL: CLUSTER 1 (Left Column) ──
  // Lower pod (13-15 Girls south-facing, 16-18 Boys north-facing)
  '15': { x: 60, y: 280, w: 55, h: 42, section: 'girls', zone: 'main_hall', label: '15', pod: 'Cluster 1 Lower (Girls)' },
  '14': { x: 125, y: 280, w: 55, h: 42, section: 'girls', zone: 'main_hall', label: '14', pod: 'Cluster 1 Lower (Girls)' },
  '13': { x: 190, y: 280, w: 55, h: 42, section: 'girls', zone: 'main_hall', label: '13', pod: 'Cluster 1 Lower (Girls)' },

  '16': { x: 60, y: 228, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '16', pod: 'Cluster 1 Lower (Boys)' },
  '17': { x: 125, y: 228, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '17', pod: 'Cluster 1 Lower (Boys)' },
  '18': { x: 190, y: 228, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '18', pod: 'Cluster 1 Lower (Boys)' },

  // Upper pod (35-37 Boys south-facing, 38-40 Girls north-facing)
  '37': { x: 60, y: 135, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '37', pod: 'Cluster 1 Upper (Boys)' },
  '36': { x: 125, y: 135, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '36', pod: 'Cluster 1 Upper (Boys)' },
  '35': { x: 190, y: 135, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '35', pod: 'Cluster 1 Upper (Boys)' },

  '38': { x: 60, y: 83, w: 55, h: 42, section: 'girls', zone: 'main_hall', label: '38', pod: 'Cluster 1 Upper (Girls)' },
  '39': { x: 125, y: 83, w: 55, h: 42, section: 'girls', zone: 'main_hall', label: '39', pod: 'Cluster 1 Upper (Girls)' },
  '40': { x: 190, y: 83, w: 55, h: 42, section: 'girls', zone: 'main_hall', label: '40', pod: 'Cluster 1 Upper (Girls)' },

  // ── MAIN HALL: CLUSTER 2 (Center Column) ──
  // Lower pod (10-12 Girls south-facing, 19-21 Boys north-facing)
  '12': { x: 380, y: 280, w: 55, h: 42, section: 'girls', zone: 'main_hall', label: '12', pod: 'Cluster 2 Lower (Girls)' },
  '11': { x: 445, y: 280, w: 55, h: 42, section: 'girls', zone: 'main_hall', label: '11', pod: 'Cluster 2 Lower (Girls)' },
  '10': { x: 510, y: 280, w: 55, h: 42, section: 'girls', zone: 'main_hall', label: '10', pod: 'Cluster 2 Lower (Girls)' },

  '19': { x: 380, y: 228, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '19', pod: 'Cluster 2 Lower (Boys)' },
  '20': { x: 445, y: 228, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '20', pod: 'Cluster 2 Lower (Boys)' },
  '21': { x: 510, y: 228, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '21', pod: 'Cluster 2 Lower (Boys)' },

  // Upper pod (32-34 Boys south-facing, 41-43 Girls north-facing)
  '34': { x: 380, y: 135, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '34', pod: 'Cluster 2 Upper (Boys)' },
  '33': { x: 445, y: 135, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '33', pod: 'Cluster 2 Upper (Boys)' },
  '32': { x: 510, y: 135, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '32', pod: 'Cluster 2 Upper (Boys)' },

  '41': { x: 380, y: 83, w: 55, h: 42, section: 'girls', zone: 'main_hall', label: '41', pod: 'Cluster 2 Upper (Girls)' },
  '42': { x: 445, y: 83, w: 55, h: 42, section: 'girls', zone: 'main_hall', label: '42', pod: 'Cluster 2 Upper (Girls)' },
  '43': { x: 510, y: 83, w: 55, h: 42, section: 'girls', zone: 'main_hall', label: '43', pod: 'Cluster 2 Upper (Girls)' },

  // ── MAIN HALL: CLUSTER 3 (Right Column, 5 Desks Wide, Boys) ──
  // Lower row fronting the corridor
  '22': { x: 670, y: 280, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '22', pod: 'Cluster 3 Corridor Front (Boys)' },
  '23': { x: 730, y: 280, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '23', pod: 'Cluster 3 Corridor Front (Boys)' },
  '24': { x: 790, y: 280, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '24', pod: 'Cluster 3 Corridor Front (Boys)' },
  '25': { x: 850, y: 280, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '25', pod: 'Cluster 3 Corridor Front (Boys)' },
  '26': { x: 910, y: 280, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '26', pod: 'Cluster 3 Corridor Front (Boys)' },

  // Upper pod: 27-31 south-facing
  '31': { x: 670, y: 135, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '31', pod: 'Cluster 3 Center (Boys)' },
  '30': { x: 730, y: 135, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '30', pod: 'Cluster 3 Center (Boys)' },
  '29': { x: 790, y: 135, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '29', pod: 'Cluster 3 Center (Boys)' },
  '28': { x: 850, y: 135, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '28', pod: 'Cluster 3 Center (Boys)' },
  '27': { x: 910, y: 135, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '27', pod: 'Cluster 3 Center (Boys)' },

  // Upper pod: 44-48 north-facing back-to-back
  '44': { x: 670, y: 83, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '44', pod: 'Cluster 3 North Wall (Boys)' },
  '45': { x: 730, y: 83, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '45', pod: 'Cluster 3 North Wall (Boys)' },
  '46': { x: 790, y: 83, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '46', pod: 'Cluster 3 North Wall (Boys)' },
  '47': { x: 850, y: 83, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '47', pod: 'Cluster 3 North Wall (Boys)' },
  '48': { x: 910, y: 83, w: 55, h: 42, section: 'boys', zone: 'main_hall', label: '48', pod: 'Cluster 3 North Wall (Boys)' },
};

export default function InteractiveDeskMap({ user, onClose, isAdmin = false }) {
  const {
    fetchDesks,
    reserveDesk,
    fetchMyDesk,
    submitDeskChangeRequest,
    fetchMyDeskChangeRequests,
    adminReleaseDesk,
    adminToggleDeskStatus
  } = useOther();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [desksList, setDesksList] = useState([]);
  const [selectedDeskId, setSelectedDeskId] = useState(null);
  const [filterSection, setFilterSection] = useState('all'); // 'all' | 'boys' | 'girls' | 'available'
  const [viewMode, setViewMode] = useState('blueprint'); // 'blueprint' | 'directory'
  const [claimedDesk, setClaimedDesk] = useState(null);
  const [claimedDeskDoc, setClaimedDeskDoc] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState(false);

  // Admin action handlers
  const handleAdminRelease = async (deskId) => {
    if (!confirm(`Release desk ${deskId} back to available inventory?`)) return;
    setSubmitting(true);
    try {
      await adminReleaseDesk(deskId);
      setToastMsg(`Carrel ${deskId} released to inventory`);
      setToastError(false);
      await loadDesksFromApi();
    } catch (err) {
      setToastMsg(err.message || 'Failed to release carrel');
      setToastError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminToggle = async (deskId, currentStatus) => {
    const nextStatus = currentStatus === 'unavailable' ? 'available' : 'unavailable';
    setSubmitting(true);
    try {
      await adminToggleDeskStatus(deskId, nextStatus);
      setToastMsg(`Carrel ${deskId} status updated to ${nextStatus}`);
      setToastError(false);
      await loadDesksFromApi();
    } catch (err) {
      setToastMsg(err.message || 'Failed to update carrel status');
      setToastError(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Seat change request modal
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
        setClaimedDesk(String(myDeskRes.value.desk_id));
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

  // Merge backend data with physical blueprint coordinates
  const mergedDesks = useMemo(() => {
    const backendMap = {};
    desksList.forEach(d => {
      backendMap[String(d.desk_id)] = d;
    });

    const result = [];
    for (let i = 1; i <= 48; i++) {
      const idStr = String(i);
      const coord = DESK_BLUEPRINT_COORDS[idStr] || { x: 0, y: 0, w: 50, h: 40, section: 'boys', label: idStr };
      const apiDoc = backendMap[idStr] || {};

      result.push({
        desk_id: idStr,
        ...coord,
        ...apiDoc,
        status: apiDoc.status || 'available',
        section: apiDoc.section || coord.section,
        bay: apiDoc.bay || (coord.section === 'girls' ? 'Girls Section' : 'Boys Section'),
        bay_name: apiDoc.bay_name || coord.pod || 'Main Study Hall'
      });
    }
    return result;
  }, [desksList]);

  // Active Desk Document for inspection
  const activeSelectedDesk = useMemo(() => {
    if (!selectedDeskId) return null;
    return mergedDesks.find(d => d.desk_id === selectedDeskId) || null;
  }, [selectedDeskId, mergedDesks]);

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

    if (desk.status === 'occupied' || desk.status === 'reserved') {
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
      setToastMsg(`✓ Desk ${desk.desk_id} successfully reserved for your active academic semester.`);
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

  const boysCount = mergedDesks.filter(d => d.section === 'boys').length;
  const girlsCount = mergedDesks.filter(d => d.section === 'girls').length;
  const availableCount = mergedDesks.filter(d => d.status === 'available').length;
  const occupiedCount = mergedDesks.filter(d => d.status === 'occupied' || (d.status === 'reserved' && d.desk_id !== claimedDesk)).length;

  const filteredDesks = useMemo(() => {
    return mergedDesks.filter(d => {
      const isMine = d.desk_id === claimedDesk;
      if (filterSection === 'boys') return d.section === 'boys' || isMine;
      if (filterSection === 'girls') return d.section === 'girls' || isMine;
      if (filterSection === 'available') return d.status === 'available' || isMine;
      return true;
    });
  }, [mergedDesks, filterSection, claimedDesk]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full max-h-[94vh] overflow-y-auto shadow-2xl relative p-4 sm:p-6 space-y-4">

        {/* ── HEADER ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#004B87] dark:text-blue-400 flex items-center gap-1.5">
                <MapPin size={13} />
                <span>Handwara Center Seating Blueprint</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                48 Physical Carrels (27 Boys • 21 Girls)
              </span>
            </div>
            <h2 className="font-serif-lib text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {isAdmin ? 'Architectural Floorplan & Carrel Management' : 'Interactive Library Seating Blueprint'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAdmin
                ? 'Direct spatial carrel control. Manage 48 physical desks across Girls & Boys zones with instant release/status actions.'
                : 'Exact spatial floor layout. Single full-day shift • 220V power & dual fiber active at each carrel.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={loadDesksFromApi}
              title="Refresh live seat statuses"
              className="p-1.5 rounded-lg text-slate-500 hover:text-[#004B87] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-[#004B87]' : ''} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* ── MY ACTIVE CARREL BANNER (IF RESERVED) ────────────────── */}
        {claimedDesk && (
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#004B87] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                <Lock size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-[#004B87] dark:text-blue-300">
                    Your Assigned Study Carrel: Desk {claimedDesk}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold uppercase border border-emerald-300 dark:border-emerald-800">
                    Locked
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Assigned for your active semester session. To relocate to another bay, submit an official Seat Change Request.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setChangeTargetDesk('');
                setShowChangeModal(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center gap-1.5 self-end sm:self-auto shadow-2xs active:scale-[0.98]"
            >
              <ArrowRightLeft size={13} />
              <span>Request Seat Relocation</span>
            </button>
          </div>
        )}

        {/* ── TOAST NOTIFICATIONS ─────────────────────────────────── */}
        {toastMsg && (
          <div className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
            toastError
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
          }`}>
            <AlertCircle size={15} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* ── SECTION FILTERS & VIEW MODE CONTROLS ─────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Section Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterSection('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterSection === 'all'
                  ? 'bg-[#004B87] text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Carrels (48)
            </button>
            <button
              type="button"
              onClick={() => setFilterSection('boys')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterSection === 'boys'
                  ? 'bg-[#004B87] text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Boys Section ({boysCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterSection('girls')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterSection === 'girls'
                  ? 'bg-purple-900 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Girls Section ({girlsCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterSection('available')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterSection === 'available'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Available Only ({availableCount})
            </button>
          </div>

          {/* Blueprint vs Directory Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('blueprint')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'blueprint'
                  ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Compass size={13} />
              <span>Architectural Blueprint</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('directory')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'directory'
                  ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <LayoutGrid size={13} />
              <span>Carrel Directory</span>
            </button>
          </div>
        </div>

        {/* ── BLUEPRINT CANVAS / SEATING MAP ───────────────────────── */}
        {viewMode === 'blueprint' ? (
          <div className="relative rounded-2xl bg-[#070F1E] border border-[#1E3A5F] p-3 sm:p-5 overflow-hidden shadow-inner">
            
            {/* Compass Orientation Indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#0A192F]/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#1E3A5F] text-[10px] text-slate-300 font-mono">
              <Compass size={12} className="text-blue-400" />
              <span>North ▲ (Quiet Wall)</span>
            </div>

            {/* SVG Seating Blueprint */}
            <div className="w-full overflow-x-auto no-scrollbar py-2">
              <svg
                viewBox="0 0 1000 680"
                className="w-full min-w-[760px] h-auto select-none font-sans"
              >
                <defs>
                  <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E3A5F" strokeWidth="0.4" strokeOpacity="0.4" />
                  </pattern>
                </defs>

                {/* Blueprint Background Grid */}
                <rect width="1000" height="680" fill="url(#blueprint-grid)" />

                {/* Outer Perimeter Building Wall */}
                <rect
                  x="20"
                  y="20"
                  width="960"
                  height="640"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                  rx="6"
                />

                {/* ── ZONE 1: GIRLS PRIVATE ENCLAVE (ROOM BOTTOM-LEFT) ── */}
                {/* Room Walls: from x: 20, y: 390 to x: 330, y: 660 */}
                <path
                  d="M 20 390 L 330 390 L 330 660"
                  fill="#1E1430"
                  fillOpacity="0.6"
                  stroke="#9333EA"
                  strokeWidth="2"
                  strokeDasharray="none"
                />

                {/* Door Opening into Hallway */}
                <line x1="330" y1="390" x2="330" y2="430" stroke="#070F1E" strokeWidth="4" />
                <path d="M 330 430 A 40 40 0 0 1 290 390" fill="none" stroke="#A855F7" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="336" y="415" fill="#C084FC" fontSize="9" fontWeight="600">Doorway</text>

                {/* Corner Architectural Column / Pillar */}
                <rect x="25" y="605" width="30" height="45" fill="#3B0764" stroke="#9333EA" strokeWidth="1.5" rx="3" />
                <text x="32" y="632" fill="#E9D5FF" fontSize="8" fontWeight="bold">COL</text>

                {/* Girls Enclave Room Title Header */}
                <text x="35" y="420" fill="#E9D5FF" fontSize="12" fontWeight="bold" letterSpacing="0.5">
                  GIRLS PRIVATE READING ENCLAVE
                </text>
                <text x="35" y="435" fill="#A855F7" fontSize="9">
                  9 Dedicated Carrels (Desks 1–9) • Quiet Sanctuary
                </text>

                {/* ── ZONE 2: ADMINISTRATIVE OFFICE (BOTTOM-RIGHT) ── */}
                {/* Office Walls: from x: 440, y: 390 to x: 980, y: 660 */}
                <rect
                  x="440"
                  y="420"
                  width="280"
                  height="240"
                  fill="#0B1A30"
                  stroke="#1E3A5F"
                  strokeWidth="2"
                  rx="4"
                />
                {/* Office Door with Arrow pointing North into corridor */}
                <circle cx="500" cy="420" r="14" fill="#0A192F" stroke="#3B82F6" strokeWidth="1.5" />
                <path d="M 500 427 L 500 413 M 496 417 L 500 413 L 504 417" stroke="#38BDF8" strokeWidth="2" fill="none" />

                <text x="530" y="525" fill="#E2E8F0" fontSize="13" fontWeight="bold">ADMINISTRATIVE OFFICE</text>
                <text x="530" y="545" fill="#94A3B8" fontSize="10">Chief Librarian &amp; Patron Registry Desk</text>

                {/* ── ZONE 3: CORRIDOR & MAIN ENTRY ── */}
                {/* Corridor space between y: 330 and 420 */}
                <line x1="20" y1="360" x2="980" y2="360" stroke="#1E3A5F" strokeWidth="1" strokeDasharray="4 4" />
                <text x="440" y="385" fill="#38BDF8" fontSize="11" fontWeight="bold" letterSpacing="1">
                  MAIN CIRCULATION CORRIDOR
                </text>

                {/* Main Building Entry Doorway (East wall) */}
                <rect x="965" y="335" width="15" height="50" fill="#10B981" rx="2" />
                <path d="M 950 360 L 910 360 M 920 355 L 910 360 L 920 365" stroke="#34D399" strokeWidth="2.5" fill="none" />
                <text x="830" y="364" fill="#34D399" fontSize="11" fontWeight="bold">MAIN ENTRY</text>

                {/* ── ZONE 4: MAIN STUDY HALL (TOP HEADERS) ── */}
                <text x="60" y="55" fill="#94A3B8" fontSize="11" fontWeight="bold" letterSpacing="0.8">
                  BAY A: CLUSTER 1 (6G / 6B)
                </text>
                <text x="380" y="55" fill="#94A3B8" fontSize="11" fontWeight="bold" letterSpacing="0.8">
                  BAY C: CLUSTER 2 (6G / 6B)
                </text>
                <text x="670" y="55" fill="#94A3B8" fontSize="11" fontWeight="bold" letterSpacing="0.8">
                  BAY B: CLUSTER 3 (15B MAIN BANK)
                </text>

                {/* Walkway Aisle Guidelines */}
                <line x1="60" y1="195" x2="245" y2="195" stroke="#1E3A5F" strokeWidth="1" strokeDasharray="3 3" />
                <text x="120" y="200" fill="#64748B" fontSize="8" textAnchor="middle">WALKWAY AISLE</text>

                <line x1="380" y1="195" x2="565" y2="195" stroke="#1E3A5F" strokeWidth="1" strokeDasharray="3 3" />
                <text x="472" y="200" fill="#64748B" fontSize="8" textAnchor="middle">WALKWAY AISLE</text>

                <line x1="670" y1="210" x2="965" y2="210" stroke="#1E3A5F" strokeWidth="1" strokeDasharray="3 3" />
                <text x="817" y="215" fill="#64748B" fontSize="8" textAnchor="middle">CENTRAL AISLE</text>

                {/* ── RENDER ALL 48 CARRELS ── */}
                {mergedDesks.map(desk => {
                  const isClaimed = String(desk.desk_id) === String(claimedDesk);
                  const isOccupied = (desk.status === 'occupied' || desk.status === 'reserved') && !isClaimed;
                  const isSelected = selectedDeskId === desk.desk_id;
                  const isGirls = desk.section === 'girls';

                  // Apply filter dimming
                  const isDimmed = (filterSection === 'boys' && isGirls && !isClaimed) ||
                                   (filterSection === 'girls' && !isGirls && !isClaimed) ||
                                   (filterSection === 'available' && isOccupied && !isClaimed);

                  // Color scheme
                  let fillColor = isGirls ? '#2E1065' : '#0F2744';
                  let strokeColor = isGirls ? '#7C3AED' : '#2563EB';
                  let textColor = isGirls ? '#F5D0FE' : '#BFDBFE';

                  if (isClaimed) {
                    fillColor = '#004B87';
                    strokeColor = '#38BDF8';
                    textColor = '#FFFFFF';
                  } else if (isOccupied) {
                    fillColor = '#1E293B';
                    strokeColor = '#334155';
                    textColor = '#64748B';
                  } else if (isSelected) {
                    fillColor = isGirls ? '#4C1D95' : '#1E3A8A';
                    strokeColor = '#F59E0B';
                    textColor = '#FFFFFF';
                  }

                  return (
                    <g
                      key={desk.desk_id}
                      onClick={() => setSelectedDeskId(desk.desk_id)}
                      className="cursor-pointer transition-transform duration-150 ease-out"
                      opacity={isDimmed ? 0.2 : 1}
                    >
                      {/* Selection Glow */}
                      {isSelected && (
                        <rect
                          x={desk.x - 3}
                          y={desk.y - 3}
                          width={desk.w + 6}
                          height={desk.h + 6}
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="2"
                          rx="6"
                        />
                      )}

                      {/* Desk Surface */}
                      <rect
                        x={desk.x}
                        y={desk.y}
                        width={desk.w}
                        height={desk.h}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isClaimed || isSelected ? 2 : 1.2}
                        rx="4"
                      />

                      {/* Gender Badge Dot / Flag */}
                      <circle
                        cx={desk.x + desk.w - 8}
                        cy={desk.y + 8}
                        r="3.5"
                        fill={isGirls ? '#D946EF' : '#38BDF8'}
                      />

                      {/* Desk Number Label */}
                      <text
                        x={desk.x + 8}
                        y={desk.y + 24}
                        fill={textColor}
                        fontSize="14"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {desk.label}
                      </text>

                      {/* Status / Section Sub-label */}
                      <text
                        x={desk.x + 8}
                        y={desk.y + 36}
                        fill={isClaimed ? '#BAE6FD' : (isOccupied ? '#64748B' : (isGirls ? '#E879F9' : '#93C5FD'))}
                        fontSize="8"
                        fontWeight="600"
                      >
                        {isClaimed ? 'YOURS' : (isOccupied ? 'TAKEN' : (isGirls ? 'GIRLS' : 'BOYS'))}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Map Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1E3A5F] text-[11px] text-slate-300">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#2E1065] border border-[#7C3AED]" />
                  <span>Girls Section (G)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#0F2744] border border-[#2563EB]" />
                  <span>Boys Section (B)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#004B87] border border-[#38BDF8]" />
                  <span>Your Carrel</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#1E293B] border border-[#334155]" />
                  <span>Occupied</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400">
                Tip: Click any carrel to inspect power, Wi-Fi &amp; claim seat.
              </div>
            </div>

          </div>
        ) : (
          /* ── ACCESSIBLE DIRECTORY LIST VIEW ──────────────────────── */
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
              {filteredDesks.map(desk => {
                const isClaimed = String(desk.desk_id) === String(claimedDesk);
                const isOccupied = (desk.status === 'occupied' || desk.status === 'reserved') && !isClaimed;
                const isSelected = selectedDeskId === desk.desk_id;
                const isGirls = desk.section === 'girls';

                return (
                  <button
                    key={desk.desk_id}
                    type="button"
                    onClick={() => setSelectedDeskId(desk.desk_id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isClaimed
                        ? 'bg-[#004B87] text-white border-[#004B87] shadow-sm'
                        : isOccupied
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 opacity-60'
                        : isSelected
                        ? 'bg-white dark:bg-[#111827] border-[#004B87] dark:border-blue-500 ring-2 ring-[#004B87]'
                        : isGirls
                        ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 hover:border-purple-400'
                        : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-bold">Desk {desk.desk_id}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        isGirls ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                      }`}>
                        {isGirls ? 'G' : 'B'}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 mt-2">
                      {isClaimed ? 'Your Seat' : isOccupied ? 'Occupied' : 'Available'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SELECTED CARREL INSPECTION TRAY ─────────────────────── */}
        {activeSelectedDesk && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-lg text-slate-900 dark:text-slate-100">
                  Desk {activeSelectedDesk.desk_id}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                  activeSelectedDesk.section === 'girls'
                    ? 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                    : 'bg-blue-50 text-[#004B87] border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                }`}>
                  {activeSelectedDesk.section === 'girls' ? 'Girls Section (G)' : 'Boys Section (B)'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {activeSelectedDesk.bay_name || activeSelectedDesk.bay}
                </span>
              </div>

              {/* Physical Carrel Specifications */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Zap size={13} />
                  <span>220V Inverter Power Active</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
                  <Wifi size={13} />
                  <span>Dual Gigabit Wi-Fi 6</span>
                </span>
                <span>•</span>
                <span className="text-slate-600 dark:text-slate-400">
                  Single Full-Day Shift
                </span>
              </div>
            </div>

            {/* Action CTA for Selected Carrel */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              {isAdmin ? (
                <>
                  {(activeSelectedDesk.status === 'occupied' || activeSelectedDesk.status === 'reserved') ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        Patron: {activeSelectedDesk.reserved_by_name || activeSelectedDesk.reserved_by || 'Assigned'}
                      </span>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleAdminRelease(activeSelectedDesk.desk_id)}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                      >
                        Release Carrel
                      </button>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleAdminToggle(activeSelectedDesk.desk_id, activeSelectedDesk.status)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  >
                    {activeSelectedDesk.status === 'unavailable' ? 'Make Available' : 'Take Offline'}
                  </button>
                </>
              ) : (
                <>
                  {String(activeSelectedDesk.desk_id) === String(claimedDesk) ? (
                    <span className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shadow-2xs">
                      <Check size={14} />
                      <span>Your Active Carrel</span>
                    </span>
                  ) : (activeSelectedDesk.status === 'occupied' || activeSelectedDesk.status === 'reserved') ? (
                    <span className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs font-medium">
                      Carrel Occupied
                    </span>
                  ) : claimedDesk ? (
                    <button
                      type="button"
                      onClick={() => {
                        setChangeTargetDesk(activeSelectedDesk.desk_id);
                        setShowChangeModal(true);
                      }}
                      className="px-4 py-2 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-[0.98]"
                    >
                      <ArrowRightLeft size={13} />
                      <span>Request Relocation to Desk {activeSelectedDesk.desk_id}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleClaimDesk(activeSelectedDesk)}
                      className="px-5 py-2 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold transition shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50 active:scale-[0.98]"
                    >
                      {submitting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                      <span>Reserve Desk {activeSelectedDesk.desk_id}</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── DESK CHANGE REQUEST MODAL ────────────────────────────── */}
        {showChangeModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft size={16} className="text-[#004B87] dark:text-blue-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Request Seat Relocation
                  </h3>
                </div>
                <button
                  onClick={() => setShowChangeModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitChangeRequest} className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Your current carrel is <strong>Desk {claimedDesk}</strong>. Desk moves are verified by the chief librarian to maintain quiet study bay discipline.
                </p>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Requested New Desk Number
                  </label>
                  <input
                    type="text"
                    required
                    value={changeTargetDesk}
                    onChange={(e) => setChangeTargetDesk(e.target.value)}
                    placeholder="e.g. 14 or 24"
                    className="w-full bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#004B87]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Reason for Relocation Request
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    placeholder="e.g. Need window lighting alcove for reading or closer to heating zone..."
                    className="w-full bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#004B87]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowChangeModal(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Relocation Request'}
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

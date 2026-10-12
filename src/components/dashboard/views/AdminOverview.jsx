"use client";

import { useState, useEffect } from "react";
import moment from "moment";
import {
  BookOpen, BookMarked, CreditCard, AlertCircle, Clock,
  Users, CheckCircle2, ArrowRight, Library, Layers,
  Edit2, X, Loader2, Check
} from "lucide-react";
import { useOther } from "../../../context/OtherContext";
import { LoadingRow, ErrorRow } from "../shared";

const StatCard = ({ icon: Icon, label, value, sub, alert = false, loading, onClick }) => (
  <div
    onClick={onClick}
    className={`rounded-2xl p-5 border bg-white dark:bg-[#142019] shadow-xs transition ${onClick ? 'cursor-pointer hover:border-[#1C3A2B] dark:hover:border-[#346F4F] hover:shadow-md' : ''} ${alert ? 'border-[#F0D5D5] bg-[#FFFBFB] dark:bg-[#2D1414] dark:border-[#5C2323]' : 'border-[#E5DFD5] dark:border-[#22352B]'}`}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-[11px] font-semibold text-[#6D8374] dark:text-[#88B89C] uppercase tracking-wider">{label}</span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${alert ? 'bg-[#FAF0F0] text-[#B91C1C] dark:bg-[#3D1A1A] dark:text-[#F87171]' : 'bg-[#EDF3EE] text-[#1C3A2B] dark:bg-[#1A2E23] dark:text-[#8FD4AE]'}`}>
        <Icon size={16} />
      </div>
    </div>
    <p className={`font-serif-lib text-3xl font-bold ${alert ? 'text-[#B91C1C] dark:text-[#F87171]' : 'text-[#1C2E24] dark:text-[#E8F0EB]'}`}>
      {loading ? '-' : value}
    </p>
    {sub && <p className="text-xs text-[#7F8781] dark:text-[#889C90] mt-1">{sub}</p>}
  </div>
);

const TIMING_PRESETS = [
  { label: 'Standard Hours', open: '07:00 AM', close: '09:00 PM', days: 'Monday – Sunday', note: 'Standard daily quiet hours' },
  { label: 'Extended Summer', open: '06:00 AM', close: '11:00 PM', days: 'Monday – Sunday', note: 'Extended summer study slots' },
  { label: 'Exam Intensive', open: '06:00 AM', close: '12:00 AM', days: 'Monday – Sunday', note: 'Midnight access for competitive aspirants' },
  { label: '24x7 Round the Clock', open: '12:00 AM', close: '11:59 PM', days: 'Monday – Sunday (24 Hours)', note: 'Unrestricted 24-hour reading rooms' },
];

function checkLibraryOpen(openStr = '07:00 AM', closeStr = '09:00 PM', isOpenToday = true) {
  if (isOpenToday === false) return false;
  try {
    const now = moment();
    const openM = moment(openStr, ['h:mm A', 'hh:mm A', 'H:mm', 'HH:mm']);
    const closeM = moment(closeStr, ['h:mm A', 'hh:mm A', 'H:mm', 'HH:mm']);
    if (!openM.isValid() || !closeM.isValid()) return true;

    const openTime = moment().set({ hour: openM.hour(), minute: openM.minute(), second: 0 });
    const closeTime = moment().set({ hour: closeM.hour(), minute: closeM.minute(), second: 0 });

    if (closeTime.isBefore(openTime)) {
      return now.isAfter(openTime) || now.isBefore(closeTime);
    }
    return now.isBetween(openTime, closeTime);
  } catch {
    return true;
  }
}

export default function AdminOverview({ setView }) {
  const {
    state: { loans, resources, earnings, studentStats, pendingCounts, libraryTimings, loading, error },
    fetchResources, fetchLoans, fetchTxnsForConfirmation,
    fetchEarnings, fetchStudentStats, fetchPendingCounts,
    fetchLibraryTimings, updateLibraryTimings,
  } = useOther();

  const [pending, setPending] = useState([]);
  const [timingsModalOpen, setTimingsModalOpen] = useState(false);
  const [timingForm, setTimingForm] = useState({
    open_time: '07:00 AM',
    close_time: '09:00 PM',
    days: 'Monday – Sunday',
    status_note: 'Open 7 days a week • Winter heating & quiet cabins active',
    is_open_today: true
  });
  const [savingTimings, setSavingTimings] = useState(false);
  const [timingSuccess, setTimingSuccess] = useState('');
  const [timingError, setTimingError] = useState('');

  useEffect(() => {
    fetchResources();
    fetchLoans({});
    fetchEarnings();
    fetchStudentStats();
    if (fetchPendingCounts) fetchPendingCounts();
    if (fetchLibraryTimings) fetchLibraryTimings();
    fetchTxnsForConfirmation().then(dt => {
      if (dt?.length) setPending(dt.map(el => ({ ...el, id: el._id })));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (libraryTimings) {
      setTimingForm({
        open_time: libraryTimings.open_time || '07:00 AM',
        close_time: libraryTimings.close_time || '09:00 PM',
        days: libraryTimings.days || 'Monday – Sunday',
        status_note: libraryTimings.status_note || '',
        is_open_today: libraryTimings.is_open_today !== false
      });
    }
  }, [libraryTimings]);

  const allLoans      = Array.isArray(loans) ? loans : (Array.isArray(loans?.data) ? loans.data : []);
  const allResources  = Array.isArray(resources) ? resources : (Array.isArray(resources?.data) ? resources.data : []);
  const activeLoans   = allLoans.filter(l => l.status === 'active');
  const returnedLoans = allLoans.filter(l => l.status === 'returned');
  const overdueLoans  = activeLoans.filter(l => moment(l.due_date).isBefore(moment(), 'day'));
  const pendingCount  = pendingCounts?.pendingPayments ?? pending.filter(p => !p.confirmation).length;
  const pendingUsersCount = pendingCounts?.pendingUsers ?? (studentStats?.pending_kyc || 0);
  const totalCopies   = allResources.reduce((s, r) => s + (r.availability ?? 0), 0);
  const checkedOutCopies = activeLoans.length;
  const unavailTitles = allResources.filter(r => (r.availability ?? 0) === 0).length;

  const isOpenNow = checkLibraryOpen(
    libraryTimings?.open_time || timingForm.open_time,
    libraryTimings?.close_time || timingForm.close_time,
    libraryTimings?.is_open_today !== false
  );

  const recentLoans = [...allLoans]
    .sort((a, b) => new Date(b.cr_dt) - new Date(a.cr_dt))
    .slice(0, 6);

  const handleOpenTimingsModal = () => {
    setTimingSuccess('');
    setTimingError('');
    if (libraryTimings) {
      setTimingForm({
        open_time: libraryTimings.open_time || '07:00 AM',
        close_time: libraryTimings.close_time || '09:00 PM',
        days: libraryTimings.days || 'Monday – Sunday',
        status_note: libraryTimings.status_note || '',
        is_open_today: libraryTimings.is_open_today !== false
      });
    }
    setTimingsModalOpen(true);
  };

  const handleSaveTimings = async (e) => {
    e.preventDefault();
    if (!timingForm.open_time.trim() || !timingForm.close_time.trim()) {
      setTimingError('Both opening time and closing time are required');
      return;
    }
    setSavingTimings(true);
    setTimingError('');
    setTimingSuccess('');

    try {
      if (updateLibraryTimings) {
        await updateLibraryTimings(timingForm);
      }
      setTimingSuccess('Library operating hours updated successfully!');
      setTimeout(() => {
        setTimingsModalOpen(false);
      }, 700);
    } catch (err) {
      setTimingError(err.message || 'Failed to update operating hours');
    } finally {
      setSavingTimings(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-5xl">

      {/* Admin Hero Plaque */}
      <div className="bg-[#1C3A2B] text-white rounded-2xl p-6 sm:p-7 shadow-xs border border-[#244232] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#A2B5A8] text-xs font-semibold uppercase tracking-wider mb-1">
            <Library size={16} />
            <span>Library Administration Command</span>
          </div>
          <h2 className="font-serif-lib text-2xl font-bold text-white">Daily Operational Overview</h2>
          <p className="text-xs text-[#C2D1C7] mt-1">{moment().format('dddd, MMMM D, YYYY')}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#244232] text-[#D8E6DE] border border-[#3E6B53] px-3 py-1.5 rounded-lg font-medium">
            Handwara Central Registry
          </span>
        </div>
      </div>

      {/* Operating Hours Banner */}
      <div className="bg-white dark:bg-[#142019] border border-[#E5DFD5] dark:border-[#22352B] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#EDF3EE] dark:bg-[#1A2E23] text-[#1C3A2B] dark:text-[#8FD4AE] flex items-center justify-center flex-shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#88B89C]">
                Library Operating Schedule
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                isOpenNow
                  ? 'bg-[#EDF3EE] text-[#2E6B3F] border border-[#D9E2DC] dark:bg-[#1A2E23] dark:text-[#8FD4AE] dark:border-[#263D30]'
                  : 'bg-[#FAF0F0] text-[#B91C1C] border border-[#FEE2E2] dark:bg-[#2D1414] dark:text-[#F87171] dark:border-[#5C2323]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOpenNow ? 'bg-[#2E6B3F] animate-pulse' : 'bg-[#B91C1C]'}`} />
                <span>{isOpenNow ? 'Open Now' : 'Closed Now'}</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
              <h3 className="font-serif-lib text-lg font-bold text-[#1C2E24] dark:text-[#E8F0EB]">
                {libraryTimings?.open_time || '07:00 AM'} to {libraryTimings?.close_time || '09:00 PM'}
              </h3>
              <span className="text-xs text-[#5D6B62] dark:text-[#9FB1A6]">
                ({libraryTimings?.days || 'Monday to Sunday'})
              </span>
            </div>
            {libraryTimings?.status_note && (
              <p className="text-[11px] text-[#7F8781] dark:text-[#889C90] mt-0.5">
                {libraryTimings.status_note}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleOpenTimingsModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#FAF8F5] dark:bg-[#18261F] text-[#1C3A2B] dark:text-[#8FD4AE] border border-[#DFE6DC] dark:border-[#263D30] hover:bg-[#EDF3EE] hover:border-[#1C3A2B] transition shadow-xs self-start md:self-auto cursor-pointer"
        >
          <Edit2 size={13} />
          <span>Edit Open &amp; Close Time</span>
        </button>
      </div>

      {/* Pending Approvals Action Banner */}
      {(pendingCount > 0 || pendingUsersCount > 0) && (
        <div className="bg-[#FFFBEB] dark:bg-[#2E2108] border border-[#FDE68A] dark:border-[#5C4312] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FEF3C7] dark:bg-[#3D2C0A] text-[#B45309] dark:text-[#FBBF24] flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#92400E] dark:text-[#FDE68A]">
                Approvals Pending Attention
              </h3>
              <p className="text-xs text-[#78350F] dark:text-[#FCD34D] mt-0.5">
                {[
                  pendingCount > 0 && `${pendingCount} fee submission${pendingCount > 1 ? 's' : ''}`,
                  pendingUsersCount > 0 && `${pendingUsersCount} student verification${pendingUsersCount > 1 ? 's' : ''}`
                ].filter(Boolean).join(' and ')} awaiting administrator action.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {pendingCount > 0 && (
              <button
                onClick={() => setView('payments_admin')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#92400E] hover:bg-[#78350F] text-white text-xs font-semibold transition shadow-xs cursor-pointer"
              >
                <span>Verify Dues ({pendingCount})</span>
                <ArrowRight size={13} />
              </button>
            )}
            {pendingUsersCount > 0 && (
              <button
                onClick={() => setView('users_admin')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1A2620] border border-[#FDE68A] dark:border-[#5C4312] text-[#92400E] dark:text-[#FDE68A] hover:bg-[#FEF3C7] text-xs font-semibold transition shadow-xs cursor-pointer"
              >
                <span>Verify Students ({pendingUsersCount})</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {loading && <LoadingRow />}
      {error   && <ErrorRow message={error} />}

      {/* Primary Key Metrics */}
      <div>
        <span className="text-xs font-semibold text-[#6D8374] dark:text-[#88B89C] uppercase tracking-wider mb-3 block">
          Key Circulation &amp; Operational Metrics
        </span>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={BookOpen}
            label="Total Titles"
            value={allResources.length}
            sub={`${totalCopies} physical copies`}
            loading={loading}
          />
          <StatCard
            icon={BookMarked}
            label="Active Loans"
            value={activeLoans.length}
            sub={`${returnedLoans.length} returned total`}
            loading={loading}
          />
          <StatCard
            icon={AlertCircle}
            label="Overdue Books"
            value={overdueLoans.length}
            sub="past return date"
            alert={overdueLoans.length > 0}
            loading={loading}
          />
          <StatCard
            icon={CreditCard}
            label="Pending Approvals"
            value={pendingCount}
            sub={pendingCount > 0 ? "click to review dues" : "all receipts verified"}
            alert={pendingCount > 0}
            loading={loading}
            onClick={() => setView('payments_admin')}
          />
        </div>

        {/* Monthly Earnings Strip */}
        <div className="mt-5">
          <span className="text-xs font-semibold text-[#6D8374] dark:text-[#88B89C] uppercase tracking-wider mb-2.5 block">
            Fee Revenue This Month
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#142019] border border-[#E5DFD5] dark:border-[#22352B] rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-semibold text-[#6D8374] dark:text-[#88B89C] uppercase">Total Dues Received</span>
              <p className="font-serif-lib text-3xl font-bold text-[#1C2E24] dark:text-[#8FD4AE] mt-1">
                {loading ? '-' : `₹${(earnings?.total || 0).toLocaleString('en-IN')}`}
              </p>
              <p className="text-xs text-[#7F8781] dark:text-[#889C90] mt-0.5">{moment().format('MMMM YYYY')}</p>
            </div>
            <div className="bg-white dark:bg-[#142019] border border-[#E5DFD5] dark:border-[#22352B] rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-semibold text-[#6D8374] dark:text-[#88B89C] uppercase">Verified Transactions</span>
              <p className="font-serif-lib text-3xl font-bold text-[#2E6B3F] dark:text-[#52D38A] mt-1">
                {loading ? '-' : earnings?.count || 0}
              </p>
              <p className="text-xs text-[#7F8781] dark:text-[#889C90] mt-0.5">student receipts confirmed</p>
            </div>
            <div className="bg-white dark:bg-[#142019] border border-[#E5DFD5] dark:border-[#22352B] rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-semibold text-[#6D8374] dark:text-[#88B89C] uppercase">Average per Transaction</span>
              <p className="font-serif-lib text-3xl font-bold text-[#1C2E24] dark:text-[#E8F0EB] mt-1">
                {loading ? '-' : earnings?.count ? `₹${Math.round((earnings.total || 0) / earnings.count).toLocaleString('en-IN')}` : '₹0'}
              </p>
              <p className="text-xs text-[#7F8781] dark:text-[#889C90] mt-0.5">monthly average</p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Roster Status */}
      <div>
        <span className="text-xs font-semibold text-[#6D8374] dark:text-[#88B89C] uppercase tracking-wider mb-3 block">
          Student Roster Status
        </span>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Students"
            value={studentStats?.total ?? '-'}
            sub="enrolled patrons"
            loading={loading}
            onClick={() => setView('users_admin')}
          />
          <StatCard
            icon={CheckCircle2}
            label="Verified KYC"
            value={studentStats?.verified ?? '-'}
            sub="Aadhaar confirmed"
            loading={loading}
            onClick={() => setView('users_admin')}
          />
          <StatCard
            icon={AlertCircle}
            label="Pending Verification"
            value={studentStats?.pending_kyc ?? '-'}
            sub="needs review"
            alert={(studentStats?.pending_kyc || 0) > 0}
            loading={loading}
            onClick={() => setView('users_admin')}
          />
          <StatCard
            icon={CreditCard}
            label="Active Subscriptions"
            value={studentStats?.paid ?? '-'}
            sub="current active passes"
            loading={loading}
            onClick={() => setView('users_admin')}
          />
        </div>
      </div>

      {/* Inventory Breakdown */}
      <div>
        <span className="text-xs font-semibold text-[#6D8374] dark:text-[#88B89C] uppercase tracking-wider mb-2.5 block">
          Inventory Breakdown
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#142019] border border-[#E5DFD5] dark:border-[#22352B] rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-[#7F8781] dark:text-[#889C90]">Total Copies in Library</p>
              <p className="font-serif-lib text-2xl font-bold text-[#1C2E24] dark:text-[#E8F0EB] mt-0.5">{totalCopies}</p>
            </div>
            <span className="text-xs font-semibold text-[#1C3A2B] dark:text-[#8FD4AE] bg-[#EDF3EE] dark:bg-[#1A2E23] px-2.5 py-1 rounded-md">
              {allResources.length} titles
            </span>
          </div>

          <div className="bg-white dark:bg-[#142019] border border-[#E5DFD5] dark:border-[#22352B] rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-[#7F8781] dark:text-[#889C90]">Currently Checked Out</p>
              <p className="font-serif-lib text-2xl font-bold text-[#1C2E24] dark:text-[#E8F0EB] mt-0.5">{checkedOutCopies}</p>
            </div>
            <span className="text-xs font-semibold text-[#2E6B3F] dark:text-[#52D38A] bg-[#EDF3EE] dark:bg-[#1A2E23] px-2.5 py-1 rounded-md">
              {totalCopies > 0 ? Math.round((checkedOutCopies / totalCopies) * 100) : 0}% in use
            </span>
          </div>

          <div className="bg-white dark:bg-[#142019] border border-[#E5DFD5] dark:border-[#22352B] rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-[#7F8781] dark:text-[#889C90]">Zero Stock Titles</p>
              <p className="font-serif-lib text-2xl font-bold text-[#B91C1C] dark:text-[#F87171] mt-0.5">{unavailTitles}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${unavailTitles > 0 ? 'bg-[#FAF0F0] text-[#B91C1C] dark:bg-[#2D1414] dark:text-[#F87171]' : 'bg-[#EDF3EE] text-[#2E6B3F] dark:bg-[#1A2E23] dark:text-[#8FD4AE]'}`}>
              {unavailTitles > 0 ? 're-stock needed' : 'all in stock'}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Circulation Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#6D8374] dark:text-[#88B89C] uppercase tracking-wider">
            Recent Circulation Activity
          </span>
          <button
            onClick={() => setView('loans_admin')}
            className="text-xs font-semibold text-[#1C3A2B] dark:text-[#8FD4AE] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all circulation records</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {recentLoans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D9D3C7] dark:border-[#263D30] p-8 text-center text-xs text-[#7F8781] dark:text-[#889C90] bg-white dark:bg-[#142019]">
            No circulation records logged yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-[#142019] rounded-2xl border border-[#E5DFD5] dark:border-[#22352B] divide-y divide-[#EFEBE4] dark:divide-[#22352B] overflow-hidden shadow-xs">
            {recentLoans.map(loan => {
              const res = allResources.find(r => r._id === loan.resource_id);
              const isOverdue = loan.status === 'active' && moment(loan.due_date).isBefore(moment(), 'day');

              return (
                <div key={loan._id} className="p-4 flex items-center justify-between text-xs hover:bg-[#FAF8F5] dark:hover:bg-[#18261F] transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#EDF3EE] dark:bg-[#1A2E23] text-[#1C3A2B] dark:text-[#8FD4AE] flex items-center justify-center flex-shrink-0">
                      <BookMarked size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1C2E24] dark:text-[#E8F0EB] truncate">{res?.title || 'Unknown Title'}</p>
                      <p className="text-[11px] text-[#7F8781] dark:text-[#889C90] truncate">
                        Patron: {loan.user_name || 'Member'} • Due: {moment(loan.due_date).format('DD MMM YYYY')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold border
                      ${loan.status === 'returned'
                        ? 'bg-[#EDF3EE] text-[#1C3A2B] border-[#D9E2DC] dark:bg-[#1A2E23] dark:text-[#8FD4AE] dark:border-[#263D30]'
                        : isOverdue
                          ? 'bg-[#FAF0F0] text-[#B91C1C] border-[#FEE2E2] dark:bg-[#2D1414] dark:text-[#F87171] dark:border-[#5C2323]'
                          : 'bg-[#FAF8F5] text-[#5D645E] border-[#E5DFD5] dark:bg-[#18261F] dark:text-[#CAD6CF] dark:border-[#263D30]'}`}>
                      {loan.status === 'returned' ? 'Returned' : isOverdue ? 'Overdue' : 'Active'}
                    </span>
                    <p className="text-[10px] text-[#7F8781] dark:text-[#889C90] mt-0.5">{moment(loan.cr_dt).format('DD MMM')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Direct Workflows */}
      <div>
        <span className="text-xs font-semibold text-[#6D8374] dark:text-[#88B89C] uppercase tracking-wider mb-2.5 block">
          Direct Workflows
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {[
            { label: "Issue a Book",   icon: BookMarked, target: "loans_admin" },
            { label: "Catalog Book",   icon: BookOpen,   target: "resources_admin" },
            { label: "Approve Dues",   icon: CreditCard, target: "payments_admin", count: pendingCount },
            { label: "Student Roster", icon: Users,      target: "users_admin",    count: pendingUsersCount },
            { label: "Plans & Offers", icon: Layers,     target: "packages_admin" },
            { label: "Operating Hours", icon: Clock,     onClick: handleOpenTimingsModal },
          ].map(({ label, icon: Icon, target, onClick, count }) => (
            <button
              key={label}
              onClick={onClick || (() => setView(target))}
              className="relative flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-[#142019] border border-[#E5DFD5] dark:border-[#22352B] hover:border-[#1C3A2B] hover:shadow-xs transition text-center shadow-xs cursor-pointer group"
            >
              {count > 0 && (
                <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D97706] text-white">
                  {count}
                </span>
              )}
              <div className="w-9 h-9 rounded-lg bg-[#EDF3EE] dark:bg-[#1A2E23] group-hover:bg-[#1C3A2B] text-[#1C3A2B] group-hover:text-white transition flex items-center justify-center">
                <Icon size={18} />
              </div>
              <span className="text-xs font-semibold text-[#1C2E24] dark:text-[#E8F0EB]">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Edit Timings Modal */}
      {timingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1C1E1B]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#142019] rounded-2xl max-w-lg w-full border border-[#E5DFD5] dark:border-[#22352B] shadow-xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFEBE4] dark:border-[#22352B] bg-[#FAF8F5] dark:bg-[#18261F]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EDF3EE] dark:bg-[#1A2E23] text-[#1C3A2B] dark:text-[#8FD4AE] flex items-center justify-center">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="font-serif-lib text-base font-bold text-[#1C2E24] dark:text-[#8FD4AE]">
                    Edit Library Open &amp; Close Hours
                  </h3>
                  <p className="text-[11px] text-[#7F8781] dark:text-[#889C90]">
                    Configure daily operational hours visible to students and visitors
                  </p>
                </div>
              </div>

              <button
                onClick={() => setTimingsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#7F8781] hover:bg-[#EFEBE4] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTimings} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {timingError && (
                <div className="p-3 rounded-lg bg-[#FAF0F0] dark:bg-[#2D1414] border border-[#F0D5D5] dark:border-[#5C2323] text-[#B91C1C] dark:text-[#FCA5A5] text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{timingError}</span>
                </div>
              )}

              {timingSuccess && (
                <div className="p-3 rounded-lg bg-[#EDF3EE] dark:bg-[#1A2E23] border border-[#D9E2DC] dark:border-[#263D30] text-[#2E6B3F] dark:text-[#52D38A] text-xs flex items-center gap-2">
                  <CheckCircle2 size={15} className="flex-shrink-0" />
                  <span>{timingSuccess}</span>
                </div>
              )}

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#88B89C] block mb-2">
                  Quick Timings Presets
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {TIMING_PRESETS.map((preset) => {
                    const isSelected = timingForm.open_time === preset.open && timingForm.close_time === preset.close;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setTimingForm(f => ({
                          ...f,
                          open_time: preset.open,
                          close_time: preset.close,
                          days: preset.days,
                          status_note: preset.note
                        }))}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#EDF3EE] border-[#1C3A2B] text-[#1C3A2B] dark:bg-[#1A2E23] dark:border-[#346F4F] dark:text-[#8FD4AE] ring-1 ring-[#1C3A2B]'
                            : 'bg-[#FAF8F5] dark:bg-[#18261F] border-[#D9D3C7] dark:border-[#263D30] text-[#2D3A31] dark:text-[#CAD6CF]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{preset.label}</span>
                          {isSelected && <Check size={12} className="text-[#1C3A2B] dark:text-[#8FD4AE]" />}
                        </div>
                        <span className="text-[10px] text-[#7F8781] dark:text-[#889C90] mt-1 font-mono">
                          {preset.open} – {preset.close}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-[#1C2E24] dark:text-[#CAD6CF] block mb-1">
                    Opening Time *
                  </label>
                  <input
                    required
                    value={timingForm.open_time}
                    onChange={e => setTimingForm(f => ({ ...f, open_time: e.target.value }))}
                    placeholder="e.g. 07:00 AM"
                    className="w-full bg-[#FAF8F5] dark:bg-[#18261F] border border-[#D9D3C7] dark:border-[#263D30] rounded-lg px-3.5 py-2 text-xs text-[#1C2E24] dark:text-[#E8F0EB] focus:bg-white focus:border-[#1C3A2B] transition font-medium"
                  />
                  <span className="text-[10px] text-[#7F8781] dark:text-[#889C90] mt-0.5 block">Format: 07:00 AM</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1C2E24] dark:text-[#CAD6CF] block mb-1">
                    Closing Time *
                  </label>
                  <input
                    required
                    value={timingForm.close_time}
                    onChange={e => setTimingForm(f => ({ ...f, close_time: e.target.value }))}
                    placeholder="e.g. 09:00 PM"
                    className="w-full bg-[#FAF8F5] dark:bg-[#18261F] border border-[#D9D3C7] dark:border-[#263D30] rounded-lg px-3.5 py-2 text-xs text-[#1C2E24] dark:text-[#E8F0EB] focus:bg-white focus:border-[#1C3A2B] transition font-medium"
                  />
                  <span className="text-[10px] text-[#7F8781] dark:text-[#889C90] mt-0.5 block">Format: 09:00 PM</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1C2E24] dark:text-[#CAD6CF] block mb-1">
                  Operating Days / Schedule
                </label>
                <input
                  value={timingForm.days}
                  onChange={e => setTimingForm(f => ({ ...f, days: e.target.value }))}
                  placeholder="e.g. Monday – Sunday (7 days a week)"
                  className="w-full bg-[#FAF8F5] dark:bg-[#18261F] border border-[#D9D3C7] dark:border-[#263D30] rounded-lg px-3.5 py-2 text-xs text-[#1C2E24] dark:text-[#E8F0EB] focus:bg-white focus:border-[#1C3A2B] transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1C2E24] dark:text-[#CAD6CF] block mb-1">
                  Status Note / Seasonal Announcement
                </label>
                <textarea
                  rows={2}
                  value={timingForm.status_note}
                  onChange={e => setTimingForm(f => ({ ...f, status_note: e.target.value }))}
                  placeholder="e.g. Open 7 days a week • Heated cabins active throughout winter"
                  className="w-full bg-[#FAF8F5] dark:bg-[#18261F] border border-[#D9D3C7] dark:border-[#263D30] rounded-lg px-3.5 py-2 text-xs text-[#1C2E24] dark:text-[#E8F0EB] focus:bg-white focus:border-[#1C3A2B] transition"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#18261F] border border-[#D9D3C7] dark:border-[#263D30] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(timingForm.is_open_today)}
                    onChange={e => setTimingForm(f => ({ ...f, is_open_today: e.target.checked }))}
                    className="w-4 h-4 text-[#1C3A2B] rounded border-[#D9D3C7]"
                  />
                  <div>
                    <span className="text-xs font-semibold text-[#1C2E24] dark:text-[#E8F0EB] block">
                      Library Center Open for Study
                    </span>
                    <span className="text-[10px] text-[#7F8781] dark:text-[#889C90]">
                      Uncheck to mark library as temporarily closed for today (holiday / maintenance)
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-[#EFEBE4] dark:border-[#22352B] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setTimingsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5D6B62] dark:text-[#9FB1A6] hover:bg-[#FAF8F5] dark:hover:bg-[#18261F] border border-[#D9D3C7] dark:border-[#263D30] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTimings}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-[#1C3A2B] hover:bg-[#142B20] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {savingTimings ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Save &amp; Update Hours</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

'use client';

import { useState, useEffect } from "react";
import moment from "moment";
import {
  Users, Search, Plus, CreditCard, KeyRound, UserCheck, UserX,
  AlertTriangle, Loader2, X, ShieldCheck, ShieldAlert
} from "lucide-react";
import { useOther } from "../../../context/OtherContext";
import { LoadingRow, ErrorRow } from "../shared";

export default function AdminStudents() {
  const {
    state: { allStudents, loading, error },
    fetchAllStudents, createStudent, recordPayment,
    changeStudentPassword, toggleStudentStatus, verifyStudent,
  } = useOther();

  const [studentSearch,   setStudentSearch]   = useState('');
  const [filterTab,       setFilterTab]       = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm,      setCreateForm]      = useState({ first_name: '', last_name: '', email: '', phone_number: '', password: '' });
  const [createSaving,    setCreateSaving]    = useState(false);
  const [createError,     setCreateError]     = useState(null);
  const [showPayModal,    setShowPayModal]    = useState(false);
  const [payTarget,       setPayTarget]       = useState(null);
  const [payForm,         setPayForm]         = useState({ amount: '', fromdate: '', todate: '', note: '' });
  const [paySaving,       setPaySaving]       = useState(false);
  const [payError,        setPayError]        = useState(null);
  const [showPwModal,     setShowPwModal]     = useState(false);
  const [pwTarget,        setPwTarget]        = useState(null);
  const [pwNewPw,         setPwNewPw]         = useState('');
  const [pwSaving,        setPwSaving]        = useState(false);
  const [pwError,         setPwError]         = useState(null);
  const [verifyingId,     setVerifyingId]     = useState(null);

  useEffect(() => { fetchAllStudents(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isPaidUp = (s) => s.lastpayment && moment(s.lastpayment).isSameOrAfter(moment(), 'day');

  const studentsList = Array.isArray(allStudents) ? allStudents : (Array.isArray(allStudents?.data) ? allStudents.data : (Array.isArray(allStudents?.students) ? allStudents.students : []));

  const pendingStudentsCount = studentsList.filter(s => !s?.verified || !s?.registration || !s?.paid).length;

  const displayedStudents = studentsList.filter(s => {
    if (filterTab === 'pending') return !s?.verified || !s?.registration || !s?.paid;
    if (filterTab === 'paid') return isPaidUp(s);
    if (filterTab === 'overdue') return !isPaidUp(s);
    return true;
  });

  const handleSearchChange = async (val) => { setStudentSearch(val); await fetchAllStudents(val); };

  const handleVerifyStudent = async (s) => {
    setVerifyingId(s._id);
    try {
      await verifyStudent(s._id, 1);
      await fetchAllStudents(studentSearch);
    } finally {
      setVerifyingId(null);
    }
  };

  const openCreate = () => {
    setCreateForm({ first_name: '', last_name: '', email: '', phone_number: '', password: '' });
    setCreateError(null);
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    setCreateSaving(true);
    setCreateError(null);
    const result = await createStudent(createForm);
    setCreateSaving(false);
    if (result) { setShowCreateModal(false); await fetchAllStudents(); }
    else setCreateError('Failed to create student. Check details and try again.');
  };

  const openPay = (s) => {
    setPayTarget(s);
    setPayForm({ amount: '', fromdate: moment().format('YYYY-MM-DD'), todate: moment().add(1, 'month').format('YYYY-MM-DD'), note: '' });
    setPayError(null);
    setShowPayModal(true);
  };

  const handleRecordPayment = async () => {
    setPaySaving(true);
    setPayError(null);
    const result = await recordPayment({ ...payForm, user_id: payTarget._id });
    setPaySaving(false);
    if (result) { setShowPayModal(false); await fetchAllStudents(); }
    else setPayError('Failed to record payment. Please try again.');
  };

  const openPwModal = (s) => {
    setPwTarget(s);
    setPwNewPw('');
    setPwError(null);
    setShowPwModal(true);
  };

  const handleChangePw = async () => {
    if (pwNewPw.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    setPwSaving(true);
    setPwError(null);
    const result = await changeStudentPassword(pwTarget._id, pwNewPw);
    setPwSaving(false);
    if (result) setShowPwModal(false);
    else setPwError('Failed to change password. Please try again.');
  };

  const handleToggleStatus = async (s) => {
    await toggleStudentStatus(s._id, !s.is_active);
    await fetchAllStudents(studentSearch);
  };

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white hig-title-2 tracking-tight">
            Student Roster
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            {allStudents ? `${allStudents.length} registered patrons enrolled` : 'Manage student accounts'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="h-11 px-5 inline-flex items-center gap-2 bg-[#004B87] hover:bg-[#003865] dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-2xl text-xs font-semibold transition hig-spring self-start sm:self-auto shadow-sm cursor-pointer active:scale-[0.98]"
        >
          <Plus size={15} />
          <span>Add Student</span>
        </button>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Apple Inset Segmented Tabs */}
        <div className="flex p-1 bg-slate-100/90 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xs overflow-x-auto text-xs max-w-xl">
          {[
            { id: 'all', label: `All (${(allStudents || []).length})` },
            { id: 'pending', label: `Pending (${pendingStudentsCount})`, alert: pendingStudentsCount > 0 },
            { id: 'paid', label: 'Active Pass' },
            { id: 'overdue', label: 'Overdue' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition hig-spring cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                filterTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : tab.alert
                    ? 'text-amber-700 dark:text-amber-400 font-bold hover:bg-amber-100/50 dark:hover:bg-amber-950/40'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={studentSearch}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search patron name or email..."
            className="w-full h-11 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#004B87] dark:focus:border-blue-400 focus:ring-4 focus:ring-[#004B87]/15 focus:outline-none transition hig-spring shadow-2xs"
          />
        </div>
      </div>

      {loading && <LoadingRow />}
      {error   && <ErrorRow />}

      {!loading && (
        <div className="material-card hairline-border rounded-3xl shadow-sm overflow-hidden backdrop-blur-xl">
          {!displayedStudents?.length ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-2 text-center">
              <Users size={32} className="text-slate-400" />
              <p className="font-serif-lib text-base font-bold text-slate-900 dark:text-white">No students found</p>
              <p className="text-xs text-slate-500">
                {filterTab === 'pending'
                  ? 'All student registrations and KYC credentials are up to date.'
                  : 'Try modifying your search or select a different filter tab.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                      <th className="px-5 py-3 text-left">Patron Name</th>
                      <th className="px-5 py-3 text-left">Email Address</th>
                      <th className="px-5 py-3 text-left">Contact</th>
                      <th className="px-5 py-3 text-left">Pass Status</th>
                      <th className="px-5 py-3 text-left">Identity</th>
                      <th className="px-5 py-3 text-left">Status</th>
                      <th className="px-5 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {displayedStudents.map(s => {
                      const paid = isPaidUp(s);
                      const name = s.full_name || [s.first_name, s.last_name].filter(Boolean).join(' ') || '-';
                      return (
                        <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 text-[#004B87] dark:text-slate-300 flex items-center justify-center text-xs font-bold flex-shrink-0 font-serif-lib">
                                {name[0]?.toUpperCase() || 'M'}
                              </div>
                              <span className="font-medium text-slate-900 dark:text-white">{name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{s.email}</td>
                          <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{s.contact?.number || s.phone_number || '-'}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                              paid
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                            }`}>
                              {paid ? `Paid (${moment(s.lastpayment).format('DD MMM')})` : 'Overdue'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${s.verified ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                              {s.verified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                              <span>{s.verified ? 'Verified' : 'Pending'}</span>
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => handleToggleStatus(s)}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold border transition cursor-pointer ${
                                s.is_active
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 hover:bg-rose-50 hover:text-rose-800'
                                  : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 hover:bg-emerald-50 hover:text-emerald-800'
                              }`}
                            >
                              {s.is_active ? <><UserCheck size={11} /> Active</> : <><UserX size={11} /> Inactive</>}
                            </button>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {!s.verified && (
                                <button
                                  onClick={() => handleVerifyStudent(s)}
                                  disabled={verifyingId === s._id}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#004B87] hover:bg-[#003B6B] text-white rounded text-xs font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
                                  title="Approve / Verify Student KYC"
                                >
                                  {verifyingId === s._id ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                                  <span>Verify</span>
                                </button>
                              )}
                              <button
                                onClick={() => openPay(s)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded text-xs font-medium transition cursor-pointer"
                                title="Record Payment"
                              >
                                <CreditCard size={12} /> Fee
                              </button>
                              <button
                                onClick={() => openPwModal(s)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded text-xs font-medium transition cursor-pointer"
                                title="Reset Password"
                              >
                                <KeyRound size={12} /> Key
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {displayedStudents.map(s => {
                  const paid = isPaidUp(s);
                  const name = s.full_name || [s.first_name, s.last_name].filter(Boolean).join(' ') || '-';
                  return (
                    <div key={s._id} className="p-4 space-y-3 text-xs">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-semibold text-sm text-slate-900 dark:text-white">{name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{s.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${s.verified ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                              {s.verified ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                              <span>{s.verified ? 'Verified' : 'Pending KYC'}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            paid
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                          }`}>
                            {paid ? 'Paid' : 'Overdue'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {!s.verified && (
                          <button
                            onClick={() => handleVerifyStudent(s)}
                            disabled={verifyingId === s._id}
                            className="flex-1 min-w-[120px] py-1.5 flex items-center justify-center gap-1 bg-[#004B87] hover:bg-[#003B6B] text-white rounded text-xs font-semibold cursor-pointer disabled:opacity-50"
                          >
                            {verifyingId === s._id ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                            <span>Verify KYC</span>
                          </button>
                        )}
                        <button
                          onClick={() => openPay(s)}
                          className="flex-1 min-w-[80px] py-1.5 flex items-center justify-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          <CreditCard size={12} /> Fee
                        </button>
                        <button
                          onClick={() => openPwModal(s)}
                          className="flex-1 min-w-[80px] py-1.5 flex items-center justify-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          <KeyRound size={12} /> Pass
                        </button>
                        <button
                          onClick={() => handleToggleStatus(s)}
                          className="flex-1 min-w-[90px] py-1.5 flex items-center justify-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          {s.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Create Student Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-serif-lib text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users size={16} className="text-[#004B87]" /> Add Student Account
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[['first_name', 'First Name *'], ['last_name', 'Last Name']].map(([k, l]) => (
                <div key={k} className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{l}</label>
                  <input
                    value={createForm[k]}
                    onChange={e => setCreateForm(f => ({ ...f, [k]: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
                  />
                </div>
              ))}
            </div>

            {[['email', 'Email Address *', 'email'], ['phone_number', 'Phone Number (10 digits) *', 'text'], ['password', 'Initial Password * (min 8 chars)', 'password']].map(([k, l, t]) => (
              <div key={k} className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{l}</label>
                <input
                  type={t}
                  value={createForm[k]}
                  onChange={e => setCreateForm(f => ({ ...f, [k]: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
                />
              </div>
            ))}

            {createError && (
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-3 py-2 rounded-lg text-xs">
                <AlertTriangle size={14} /> {createError}
              </div>
            )}

            <button
              disabled={!createForm.first_name || !createForm.email || !createForm.password || createSaving}
              onClick={handleCreate}
              className="w-full py-2.5 rounded-lg bg-[#004B87] hover:bg-[#003B6B] disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {createSaving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              <span>Create Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPwModal && pwTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-serif-lib text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <KeyRound size={16} className="text-[#004B87]" /> Reset Password
                </h3>
              </div>
              <button onClick={() => setShowPwModal(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
              <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-800 text-[#004B87] flex items-center justify-center text-xs font-bold font-serif-lib">
                {(pwTarget.full_name || pwTarget.first_name || 'M')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{pwTarget.full_name || [pwTarget.first_name, pwTarget.last_name].filter(Boolean).join(' ')}</p>
                <p className="text-[11px] text-slate-500">{pwTarget.email}</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Password * (min 8 chars)</label>
              <input
                type="password"
                value={pwNewPw}
                onChange={e => setPwNewPw(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
              />
            </div>

            {pwError && (
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-3 py-2 rounded-lg text-xs">
                <AlertTriangle size={14} /> {pwError}
              </div>
            )}

            <button
              disabled={!pwNewPw || pwSaving}
              onClick={handleChangePw}
              className="w-full py-2.5 rounded-lg bg-[#004B87] hover:bg-[#003B6B] disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {pwSaving ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
              <span>Update Password</span>
            </button>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPayModal && payTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-serif-lib text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard size={16} className="text-[#004B87]" /> Record Fee Payment
                </h3>
              </div>
              <button onClick={() => setShowPayModal(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
              <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-800 text-[#004B87] flex items-center justify-center text-xs font-bold font-serif-lib">
                {(payTarget.full_name || payTarget.first_name || 'M')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{payTarget.full_name || [payTarget.first_name, payTarget.last_name].filter(Boolean).join(' ')}</p>
                <p className="text-[11px] text-slate-500">{payTarget.email}</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Amount (₹) *</label>
              <input
                type="number"
                min="1"
                value={payForm.amount}
                onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="e.g. 1200"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[['fromdate', 'From Date *'], ['todate', 'To Date *']].map(([k, l]) => (
                <div key={k} className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{l}</label>
                  <input
                    type="date"
                    value={payForm[k]}
                    onChange={e => setPayForm(f => ({ ...f, [k]: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ledger Note (optional)</label>
              <input
                value={payForm.note}
                onChange={e => setPayForm(f => ({ ...f, note: e.target.value }))}
                placeholder="e.g. Cash received at reception desk"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
              />
            </div>

            {payError && (
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-3 py-2 rounded-lg text-xs">
                <AlertTriangle size={14} /> {payError}
              </div>
            )}

            <button
              disabled={!payForm.amount || !payForm.fromdate || !payForm.todate || paySaving}
              onClick={handleRecordPayment}
              className="w-full py-2.5 rounded-lg bg-[#004B87] hover:bg-[#003B6B] disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {paySaving ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
              <span>Record Fee Payment</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [filterTab,       setFilterTab]       = useState('all'); // 'all', 'pending', 'paid', 'overdue'
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

  const pendingStudentsCount = (allStudents || []).filter(s => !s.verified || !s.registration || !s.paid).length;

  const displayedStudents = (allStudents || []).filter(s => {
    if (filterTab === 'pending') return !s.verified || !s.registration || !s.paid;
    if (filterTab === 'paid') return isPaidUp(s);
    if (filterTab === 'overdue') return !isPaidUp(s);
    return true;
  });

  /* ── Handlers ── */
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
    <div className="space-y-6 w-full max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093]">
            Patron Management
          </span>
          <h2 className="font-serif-lib text-2xl font-bold text-[#1C3A2B] dark:text-[#FAF8F5] mt-0.5">
            Student Roster &amp; Members
          </h2>
          <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] mt-1">
            {allStudents ? `${allStudents.length} registered patrons enrolled` : 'Manage student accounts'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1C3A2B] hover:bg-[#142C20] dark:bg-[#2A4D3B] dark:hover:bg-[#37614B] text-white rounded-xl text-xs font-semibold transition self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <Plus size={15} /> Add Student
        </button>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'all', label: `All Patrons (${(allStudents || []).length})` },
            { id: 'pending', label: `Pending Approval (${pendingStudentsCount})`, alert: pendingStudentsCount > 0 },
            { id: 'paid', label: 'Pass Active' },
            { id: 'overdue', label: 'Overdue / Due' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === tab.id
                  ? 'bg-[#1C3A2B] text-white shadow-xs dark:bg-[#2A4D3B]'
                  : tab.alert
                    ? 'bg-[#FEF3C7] dark:bg-[#3B2C13] text-[#92400E] dark:text-[#FDE68A] border border-[#FDE68A] dark:border-[#574019] hover:bg-[#FDE68A]'
                    : 'bg-white dark:bg-[#16211B] text-[#5D645E] dark:text-[#9FB1A6] border border-[#E5DFD5] dark:border-[#26362D] hover:bg-[#FAF8F5] dark:hover:bg-[#1E2E25]'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7F8781]" />
          <input
            value={studentSearch}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search patron name or email..."
            className="w-full bg-white dark:bg-[#16211B] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1C1E1B] dark:text-white placeholder-[#8A928C] focus:border-[#1C3A2B] dark:focus:border-[#8FD4AE] transition shadow-xs"
          />
        </div>
      </div>

      {loading && <LoadingRow />}
      {error   && <ErrorRow />}

      {!loading && (
        <div className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl shadow-xs overflow-hidden">
          {!displayedStudents?.length ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-2 text-center">
              <Users size={32} className="text-[#A2AAA3]" />
              <p className="font-serif-lib text-base font-bold text-[#1C3A2B] dark:text-[#FAF8F5]">No students found</p>
              <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6]">
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
                    <tr className="border-b border-[#EFEBE4] dark:border-[#26362D] bg-[#FAF8F5] dark:bg-[#1E2E25] text-[#6D8374] dark:text-[#8CA093] text-[11px] font-semibold uppercase tracking-wider">
                      <th className="px-5 py-3 text-left">Patron Name</th>
                      <th className="px-5 py-3 text-left">Email Address</th>
                      <th className="px-5 py-3 text-left">Contact</th>
                      <th className="px-5 py-3 text-left">Pass Status</th>
                      <th className="px-5 py-3 text-left">Verified</th>
                      <th className="px-5 py-3 text-left">Account</th>
                      <th className="px-5 py-3 text-left">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEBE4] dark:divide-[#26362D]">
                    {displayedStudents.map(s => {
                      const paid = isPaidUp(s);
                      const name = s.full_name || [s.first_name, s.last_name].filter(Boolean).join(' ') || '-';
                      return (
                        <tr key={s._id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#1E2E25]/50 transition">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-[#EDF3EE] dark:bg-[#203126] text-[#1C3A2B] dark:text-[#8FD4AE] flex items-center justify-center text-xs font-bold flex-shrink-0 font-serif-lib">
                                {name[0]?.toUpperCase() || 'M'}
                              </div>
                              <span className="font-medium text-[#1C1E1B] dark:text-white">{name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-[#5D645E] dark:text-[#9FB1A6]">{s.email}</td>
                          <td className="px-5 py-3.5 text-[#5D645E] dark:text-[#9FB1A6]">{s.contact?.number || s.phone_number || '-'}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                              paid
                                ? 'bg-[#EDF3EE] dark:bg-[#1E2E25] text-[#1C3A2B] dark:text-[#8FD4AE] border-[#D9E2DC] dark:border-[#2B4032]'
                                : 'bg-[#FAF0F0] dark:bg-[#3D1A1A] text-[#A83232] dark:text-[#FCA5A5] border-[#F0D5D5] dark:border-[#5C2A2A]'
                            }`}>
                              {paid ? `Paid (${moment(s.lastpayment).format('DD MMM')})` : 'Overdue'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${s.verified ? 'text-[#2E6B3F] dark:text-[#8FD4AE]' : 'text-[#92400E] dark:text-[#FDE68A]'}`}>
                              {s.verified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                              <span>{s.verified ? 'Verified' : 'Pending'}</span>
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => handleToggleStatus(s)}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border transition cursor-pointer ${
                                s.is_active
                                  ? 'bg-[#EDF3EE] dark:bg-[#1E2E25] text-[#1C3A2B] dark:text-[#8FD4AE] border-[#D9E2DC] dark:border-[#2B4032] hover:bg-[#FAF0F0] hover:text-[#A83232]'
                                  : 'bg-[#FAF0F0] dark:bg-[#3D1A1A] text-[#A83232] dark:text-[#FCA5A5] border-[#F0D5D5] dark:border-[#5C2A2A] hover:bg-[#EDF3EE] hover:text-[#1C3A2B]'
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
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1C3A2B] hover:bg-[#142C20] dark:bg-[#2A4D3B] text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
                                  title="Approve / Verify Student KYC"
                                >
                                  {verifyingId === s._id ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                                  <span>Verify KYC</span>
                                </button>
                              )}
                              <button
                                onClick={() => openPay(s)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF8F5] dark:bg-[#203126] hover:bg-[#EDF3EE] text-[#1C3A2B] dark:text-[#8FD4AE] border border-[#E5DFD5] dark:border-[#2C4233] rounded-xl text-xs font-medium transition cursor-pointer"
                                title="Record Payment"
                              >
                                <CreditCard size={12} /> Pay
                              </button>
                              <button
                                onClick={() => openPwModal(s)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF8F5] dark:bg-[#203126] hover:bg-[#EDF3EE] text-[#5D645E] dark:text-[#C2D1C7] border border-[#E5DFD5] dark:border-[#2C4233] rounded-xl text-xs font-medium transition cursor-pointer"
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
              <div className="md:hidden divide-y divide-[#EFEBE4] dark:divide-[#26362D]">
                {displayedStudents.map(s => {
                  const paid = isPaidUp(s);
                  const name = s.full_name || [s.first_name, s.last_name].filter(Boolean).join(' ') || '-';
                  return (
                    <div key={s._id} className="p-4 space-y-3 text-xs">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-semibold text-sm text-[#1C1E1B] dark:text-white">{name}</p>
                          <p className="text-[11px] text-[#7F8781] dark:text-[#9FB1A6] mt-0.5">{s.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${s.verified ? 'text-[#2E6B3F] dark:text-[#8FD4AE]' : 'text-[#92400E] dark:text-[#FDE68A]'}`}>
                              {s.verified ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                              <span>{s.verified ? 'Verified' : 'Pending KYC'}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            paid ? 'bg-[#EDF3EE] dark:bg-[#1E2E25] text-[#1C3A2B] dark:text-[#8FD4AE] border-[#D9E2DC] dark:border-[#2B4032]' : 'bg-[#FAF0F0] dark:bg-[#3D1A1A] text-[#A83232] dark:text-[#FCA5A5] border-[#F0D5D5] dark:border-[#5C2A2A]'
                          }`}>
                            {paid ? 'Paid' : 'Overdue'}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {!s.verified && (
                          <button
                            onClick={() => handleVerifyStudent(s)}
                            disabled={verifyingId === s._id}
                            className="py-1.5 flex items-center justify-center gap-1 bg-[#1C3A2B] text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                          >
                            {verifyingId === s._id ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                            <span>Verify KYC</span>
                          </button>
                        )}
                        <button
                          onClick={() => openPay(s)}
                          className="py-1.5 flex items-center justify-center gap-1 bg-[#FAF8F5] dark:bg-[#203126] border border-[#E5DFD5] dark:border-[#2C4233] rounded-xl text-xs font-medium text-[#1C3A2B] dark:text-[#8FD4AE] cursor-pointer"
                        >
                          <CreditCard size={12} /> Pay
                        </button>
                        <button
                          onClick={() => openPwModal(s)}
                          className="py-1.5 flex items-center justify-center gap-1 bg-[#FAF8F5] dark:bg-[#203126] border border-[#E5DFD5] dark:border-[#2C4233] rounded-xl text-xs font-medium text-[#5D645E] dark:text-[#C2D1C7] cursor-pointer"
                        >
                          <KeyRound size={12} /> Pass
                        </button>
                        <button
                          onClick={() => handleToggleStatus(s)}
                          className="py-1.5 flex items-center justify-center gap-1 bg-[#FAF8F5] dark:bg-[#203126] border border-[#E5DFD5] dark:border-[#2C4233] rounded-xl text-xs font-medium text-[#5D645E] dark:text-[#C2D1C7] cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-[#1C1E1B]/60 flex items-center justify-center px-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#EFEBE4] dark:border-[#26362D] pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093]">Admission</span>
                <h3 className="font-serif-lib text-lg font-bold text-[#1C3A2B] dark:text-[#FAF8F5] flex items-center gap-2">
                  <Users size={16} className="text-[#1C3A2B] dark:text-[#8FD4AE]" /> Add New Student
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-[#7F8781] hover:text-[#1C1E1B] dark:hover:text-white rounded-lg transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[['first_name', 'First Name *'], ['last_name', 'Last Name']].map(([k, l]) => (
                <div key={k} className="space-y-1">
                  <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5]">{l}</label>
                  <input
                    value={createForm[k]}
                    onChange={e => setCreateForm(f => ({ ...f, [k]: e.target.value }))}
                    className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
                  />
                </div>
              ))}
            </div>

            {[['email', 'Email Address *', 'email'], ['phone_number', 'Phone Number (10 digits) *', 'text'], ['password', 'Initial Password * (min 8 chars)', 'password']].map(([k, l, t]) => (
              <div key={k} className="space-y-1">
                <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5]">{l}</label>
                <input
                  type={t}
                  value={createForm[k]}
                  onChange={e => setCreateForm(f => ({ ...f, [k]: e.target.value }))}
                  className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
                />
              </div>
            ))}

            {createError && (
              <div className="flex items-center gap-2 text-[#A83232] dark:text-[#FCA5A5] bg-[#FAF0F0] dark:bg-[#3D1A1A] border border-[#F0D5D5] dark:border-[#5C2A2A] px-3 py-2 rounded-xl text-xs">
                <AlertTriangle size={14} /> {createError}
              </div>
            )}

            <button
              disabled={!createForm.first_name || !createForm.email || !createForm.password || createSaving}
              onClick={handleCreate}
              className="w-full py-2.5 rounded-xl bg-[#1C3A2B] hover:bg-[#142C20] dark:bg-[#2A4D3B] dark:hover:bg-[#37614B] disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {createSaving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              <span>Create Student Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPwModal && pwTarget && (
        <div className="fixed inset-0 z-50 bg-[#1C1E1B]/60 flex items-center justify-center px-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#EFEBE4] dark:border-[#26362D] pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093]">Credentials</span>
                <h3 className="font-serif-lib text-lg font-bold text-[#1C3A2B] dark:text-[#FAF8F5] flex items-center gap-2">
                  <KeyRound size={16} className="text-[#1C3A2B] dark:text-[#8FD4AE]" /> Reset Student Password
                </h3>
              </div>
              <button onClick={() => setShowPwModal(false)} className="p-1 text-[#7F8781] hover:text-[#1C1E1B] dark:hover:text-white rounded-lg transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-[#FAF8F5] dark:bg-[#111A14] border border-[#E5DFD5] dark:border-[#26362D] rounded-xl p-3">
              <div className="w-8 h-8 rounded-lg bg-[#EDF3EE] dark:bg-[#203126] text-[#1C3A2B] dark:text-[#8FD4AE] flex items-center justify-center text-xs font-bold font-serif-lib">
                {(pwTarget.full_name || pwTarget.first_name || 'M')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1C1E1B] dark:text-white">{pwTarget.full_name || [pwTarget.first_name, pwTarget.last_name].filter(Boolean).join(' ')}</p>
                <p className="text-[11px] text-[#7F8781] dark:text-[#9FB1A6]">{pwTarget.email}</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5]">New Password * (min 8 chars)</label>
              <input
                type="password"
                value={pwNewPw}
                onChange={e => setPwNewPw(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
              />
            </div>

            {pwError && (
              <div className="flex items-center gap-2 text-[#A83232] dark:text-[#FCA5A5] bg-[#FAF0F0] dark:bg-[#3D1A1A] border border-[#F0D5D5] dark:border-[#5C2A2A] px-3 py-2 rounded-xl text-xs">
                <AlertTriangle size={14} /> {pwError}
              </div>
            )}

            <button
              disabled={!pwNewPw || pwSaving}
              onClick={handleChangePw}
              className="w-full py-2.5 rounded-xl bg-[#1C3A2B] hover:bg-[#142C20] dark:bg-[#2A4D3B] dark:hover:bg-[#37614B] disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {pwSaving ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
              <span>Update Password</span>
            </button>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPayModal && payTarget && (
        <div className="fixed inset-0 z-50 bg-[#1C1E1B]/60 flex items-center justify-center px-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#EFEBE4] dark:border-[#26362D] pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093]">Manual Ledger Entry</span>
                <h3 className="font-serif-lib text-lg font-bold text-[#1C3A2B] dark:text-[#FAF8F5] flex items-center gap-2">
                  <CreditCard size={16} className="text-[#1C3A2B] dark:text-[#8FD4AE]" /> Record Student Payment
                </h3>
              </div>
              <button onClick={() => setShowPayModal(false)} className="p-1 text-[#7F8781] hover:text-[#1C1E1B] dark:hover:text-white rounded-lg transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-[#FAF8F5] dark:bg-[#111A14] border border-[#E5DFD5] dark:border-[#26362D] rounded-xl p-3">
              <div className="w-8 h-8 rounded-lg bg-[#EDF3EE] dark:bg-[#203126] text-[#1C3A2B] dark:text-[#8FD4AE] flex items-center justify-center text-xs font-bold font-serif-lib">
                {(payTarget.full_name || payTarget.first_name || 'M')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1C1E1B] dark:text-white">{payTarget.full_name || [payTarget.first_name, payTarget.last_name].filter(Boolean).join(' ')}</p>
                <p className="text-[11px] text-[#7F8781] dark:text-[#9FB1A6]">{payTarget.email}</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5]">Amount (₹) *</label>
              <input
                type="number"
                min="1"
                value={payForm.amount}
                onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="e.g. 1200"
                className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[['fromdate', 'From Date *'], ['todate', 'To Date *']].map(([k, l]) => (
                <div key={k} className="space-y-1">
                  <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5]">{l}</label>
                  <input
                    type="date"
                    value={payForm[k]}
                    onChange={e => setPayForm(f => ({ ...f, [k]: e.target.value }))}
                    className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5]">Ledger Note (optional)</label>
              <input
                value={payForm.note}
                onChange={e => setPayForm(f => ({ ...f, note: e.target.value }))}
                placeholder="e.g. Cash received at desk"
                className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
              />
            </div>

            {payError && (
              <div className="flex items-center gap-2 text-[#A83232] dark:text-[#FCA5A5] bg-[#FAF0F0] dark:bg-[#3D1A1A] border border-[#F0D5D5] dark:border-[#5C2A2A] px-3 py-2 rounded-xl text-xs">
                <AlertTriangle size={14} /> {payError}
              </div>
            )}

            <button
              disabled={!payForm.amount || !payForm.fromdate || !payForm.todate || paySaving}
              onClick={handleRecordPayment}
              className="w-full py-2.5 rounded-xl bg-[#1C3A2B] hover:bg-[#142C20] dark:bg-[#2A4D3B] dark:hover:bg-[#37614B] disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {paySaving ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
              <span>Record Fee in Ledger</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

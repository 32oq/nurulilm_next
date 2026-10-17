'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOther } from '../context/OtherContext';
import moment from 'moment';
import {
  CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, QrCode,
  Loader2, AlertCircle, Sparkles, User, Mail, Phone, Lock, Eye, EyeOff, Clock
} from 'lucide-react';
import { CaptchaField } from '../components/common';

export default function EnrollmentWizard({ setPage, selectedPackage: initialPackage = null }) {
  const { state: { isAuthenticated, user }, register } = useAuth();
  const { state: { packages, libraryTimings }, getPackages, checkout, fetchTxns } = useOther();

  const fullDaySchedule = libraryTimings?.open_time && libraryTimings?.close_time
    ? `Full Day (${libraryTimings.open_time} – ${libraryTimings.close_time})`
    : 'Full Day (07:00 AM – 09:00 PM)';
  const resolveTiming = (t) => (!t || t === 'Full Day' || (typeof t === 'string' && t.includes('6:00 AM – 11:00 PM')))
    ? fullDaySchedule
    : t;

  // Wizard Step: 1 = Tier, 2 = Account/KYC, 3 = Payment
  const [step, setStep] = useState(initialPackage?.name ? (isAuthenticated ? 3 : 2) : 1);
  const [selectedPlan, setSelectedPlan] = useState(initialPackage || null);

  // Registration Form State
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.contact?.phone_number || '',
    password: '',
    father_name: '',
    aadhaar_id: '',
    police_station: '',
    city: 'Handwara',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [captchaData, setCaptchaData] = useState({ captcha_id: '', captcha_solution: '' });
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentData, setConsentData] = useState(false);

  // Payment State
  const [txnId, setTxnId] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Load packages on mount if not loaded
  useEffect(() => {
    if (!packages || packages.length === 0) {
      getPackages();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select package only if explicitly passed via props
  useEffect(() => {
    if (initialPackage?.name) {
      setSelectedPlan(initialPackage);
    }
  }, [initialPackage]);

  // Visual lock-in state when user selects a plan
  const [lockingPlanId, setLockingPlanId] = useState(null);
  const lockTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, []);

  // When authentication status changes
  useEffect(() => {
    if (isAuthenticated && step === 2) {
      setStep(3);
    }
  }, [isAuthenticated, step]);

  const handlePlanSelect = (pkg) => {
    const pkgId = pkg._id || pkg.id;
    setSelectedPlan(pkg);
    setLockingPlanId(pkgId);

    // Provide a brief high-satisfaction moment (500ms) showing the plan is locked, then advance
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    lockTimerRef.current = setTimeout(() => {
      setLockingPlanId(null);
      if (isAuthenticated) {
        setStep(3);
      } else {
        setStep(2);
      }
    }, 550);
  };

  const handleNextFromPlan = () => {
    if (!selectedPlan || lockingPlanId) return;
    if (isAuthenticated) {
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!consentTerms) {
      setAuthError('Please review and accept the Terms of Use and Privacy Policy to proceed.');
      return;
    }
    if (!consentData) {
      setAuthError('Please provide consent for institutional record verification and library identity card generation.');
      return;
    }
    if (!captchaData.captcha_id || !captchaData.captcha_solution) {
      setAuthError('Please complete the security challenge.');
      return;
    }

    setAuthLoading(true);
    try {
      const payload = {
        ...form,
        captcha_id: captchaData.captcha_id,
        captcha_solution: captchaData.captcha_solution,
        user_type: 'Patron',
        paid: '0'
      };

      const success = await register(payload);
      if (success) {
        setStep(3);
      }
    } catch (err) {
      setAuthError(err?.message || 'Registration failed. Please check your information.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentError('');

    if (!txnId.trim() || txnId.trim().length < 4) {
      setPaymentError('Please enter a valid UPI Reference ID or UTR number from your payment app.');
      return;
    }

    setPaymentSubmitting(true);
    try {
      await checkout({
        package: selectedPlan?.id || selectedPlan?._id,
        amount: total,
        type: 'siginup',
        payment_type: 'online',
        txn_id: txnId.trim(),
        fromdate: moment().format('YYYY-MM-DD'),
        todate: moment().add(selectedPlan?.term_months || 1, 'months').format('YYYY-MM-DD')
      });

      if (fetchTxns) {
        await fetchTxns();
      }
      setPage('payment_pending');
    } catch (err) {
      setPaymentError(err?.message || 'Payment submission failed. Please verify your reference ID.');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const subtotal = Number(selectedPlan?.recurring_payment || 0);
  const regFee = Number(selectedPlan?.registration_fee || 0);
  const total = subtotal + regFee;

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] bg-[#F6F8FB] dark:bg-[#0B0F19] py-8 sm:py-12 px-4 sm:px-6 transition-colors">
      <div className="max-w-4xl mx-auto">

        {/* Stepper Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Patron Enrollment
            </span>
            <span className="text-xs font-medium text-slate-500">
              Step {step} of 3
            </span>
          </div>

          {/* Step Badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* Step 1 */}
            <button
              onClick={() => setStep(1)}
              className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                step === 1
                  ? 'bg-white dark:bg-[#111827] border-[#004B87] dark:border-blue-500 shadow-2xs'
                  : step > 1
                  ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                  : 'bg-white/60 dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                step > 1 ? 'bg-[#004B87] text-white' : step === 1 ? 'bg-[#004B87] text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Select Plan</p>
                <p className="text-[10px] text-slate-500">Membership tier</p>
              </div>
            </button>

            {/* Step 2 */}
            <button
              onClick={() => { if (selectedPlan) setStep(2); }}
              disabled={!selectedPlan}
              className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                step === 2
                  ? 'bg-white dark:bg-[#111827] border-[#004B87] dark:border-blue-500 shadow-2xs'
                  : step > 2
                  ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                  : 'bg-white/60 dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                step > 2 ? 'bg-[#004B87] text-white' : step === 2 ? 'bg-[#004B87] text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {step > 2 ? '✓' : '2'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Account Details</p>
                <p className="text-[10px] text-slate-500">Patron credentials</p>
              </div>
            </button>

            {/* Step 3 */}
            <button
              onClick={() => { if (selectedPlan && isAuthenticated) setStep(3); }}
              disabled={!selectedPlan || !isAuthenticated}
              className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                step === 3
                  ? 'bg-white dark:bg-[#111827] border-[#004B87] dark:border-blue-500 shadow-2xs'
                  : 'bg-white/60 dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 3 ? 'bg-[#004B87] text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                3
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Fee Submission</p>
                <p className="text-[10px] text-slate-500">Scan QR and submit UTR</p>
              </div>
            </button>
          </div>
        </div>

        {/* ── STEP 1: CHOOSE MEMBERSHIP TIER ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                Choose Your Membership Plan
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your preferred study pass duration. All plans include quiet carrel desk access, high-speed Wi-Fi, and reference materials.
              </p>
            </div>

            {/* Tier Grid */}
            {(!packages || packages.length === 0) ? (
              <div className="w-full py-16 flex flex-col items-center justify-center gap-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#111827]">
                <Loader2 size={22} className="animate-spin text-[#004B87] dark:text-blue-400" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading available membership passes…</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(packages || []).map((pkg) => {
                const pkgId = pkg._id || pkg.id;
                const isSelected = selectedPlan?._id === pkgId || selectedPlan?.id === pkgId;
                const isLocking = lockingPlanId === pkgId;
                const isOtherLocking = Boolean(lockingPlanId && !isLocking);
                const pkgTotal = Number(pkg.recurring_payment || 0) + Number(pkg.registration_fee || 0);

                return (
                  <div
                    key={pkgId}
                    onClick={() => !lockingPlanId && handlePlanSelect(pkg)}
                    className={`relative rounded-xl p-5 border cursor-pointer transition-all duration-300 flex flex-col justify-between select-none ${
                      isLocking
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-2 border-[#004B87] dark:border-blue-500 ring-4 ring-[#004B87]/25 dark:ring-blue-500/30 scale-[1.02] shadow-md z-10'
                        : isSelected
                        ? 'bg-white dark:bg-[#111827] border-2 border-[#004B87] dark:border-blue-500 shadow-xs ring-2 ring-[#004B87]/15'
                        : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 hover:border-[#004B87]/50 dark:hover:border-slate-700 hover:shadow-xs'
                    } ${isOtherLocking ? 'opacity-50 scale-[0.99] pointer-events-none' : ''}`}
                  >
                    {/* Badge: Locking vs Popular vs Selected */}
                    <div className="absolute -top-2.5 right-4 flex items-center gap-1.5">
                      {isLocking ? (
                        <span className="inline-flex items-center gap-1.5 bg-[#004B87] dark:bg-blue-600 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded shadow-xs animate-pulse">
                          <CheckCircle2 size={11} className="animate-spin text-white" />
                          <span>Locked</span>
                        </span>
                      ) : isSelected ? (
                        <span className="inline-flex items-center gap-1 bg-[#004B87] dark:bg-blue-600 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-2xs">
                          <CheckCircle2 size={10} />
                          <span>Selected</span>
                        </span>
                      ) : pkg.isPopular === 1 ? (
                        <span className="bg-slate-800 text-white dark:bg-slate-700 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-2xs">
                          Recommended
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>{pkg.name}</span>
                          {isSelected && !isLocking && (
                            <CheckCircle2 size={15} className="text-[#004B87] dark:text-blue-400" />
                          )}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {pkg.tagline || pkg.description}
                      </p>

                      {/* Shift Timing Badge */}
                      <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-[#004B87] dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 text-[11px] font-medium w-fit">
                        <Clock size={11} className="flex-shrink-0" />
                        <span>{resolveTiming(pkg.timing)}</span>
                      </div>

                      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            ₹{pkg.recurring_payment}
                          </span>
                          <span className="text-xs text-slate-500">
                            / {pkg.term_months > 1 ? `${pkg.term_months} mos` : 'month'}
                          </span>
                        </div>
                        {pkg.registration_fee > 0 ? (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            + ₹{pkg.registration_fee} one-time registration
                          </p>
                        ) : (
                          <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                            Registration fee waived
                          </p>
                        )}
                      </div>

                      {/* Feature List */}
                      <ul className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                        {(pkg.features || []).slice(0, 3).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#004B87] dark:text-blue-400 font-bold text-xs">✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">Total Payable:</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          ₹{pkgTotal}
                        </span>
                      </div>

                      {/* Tactile Card Action Button */}
                      <button
                        type="button"
                        disabled={Boolean(lockingPlanId)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                          isLocking
                            ? 'bg-[#004B87] text-white shadow-sm ring-2 ring-[#004B87]/30'
                            : isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-[#004B87] dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-[#004B87] hover:text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#004B87] hover:text-white dark:hover:bg-blue-600 dark:hover:text-white'
                        }`}
                      >
                        {isLocking ? (
                          <>
                            <Loader2 size={13} className="animate-spin text-white" />
                            <span>Locked! Advancing to Step 2...</span>
                          </>
                        ) : isSelected ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>Selected • Click to Advance</span>
                          </>
                        ) : (
                          <>
                            <span>Select & Lock Plan</span>
                            <ArrowRight size={13} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            )}

            {/* Step 1 Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setPage('home')}
                className="text-xs font-semibold text-[#004B87] dark:text-blue-400 hover:underline transition cursor-pointer"
              >
                Cancel and return to home
              </button>
              <button
                onClick={handleNextFromPlan}
                disabled={!selectedPlan || Boolean(lockingPlanId)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold shadow-2xs transition disabled:opacity-40 cursor-pointer"
              >
                {lockingPlanId ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-white" />
                    <span>Advancing…</span>
                  </>
                ) : selectedPlan ? (
                  <>
                    <span>Continue with {selectedPlan.name}</span>
                    <ArrowRight size={13} />
                  </>
                ) : (
                  <>
                    <span>Select a Plan to Continue</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: PATRON PROFILE & KYC ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Patron Account Details
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Create your library membership credentials. Selected tier: <strong>{selectedPlan?.name}</strong>.
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-[#004B87] dark:text-blue-400 hover:underline transition flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={12} /> Change Plan
              </button>
            </div>

            {/* If user is already authenticated */}
            {isAuthenticated ? (
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004B87] dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Signed in as {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xs">
                {authError && (
                  <div className="mb-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Name Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        First Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <User size={14} />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Zubair"
                          value={form.first_name}
                          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#111827] focus:border-[#004B87] transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Peerzada"
                        value={form.last_name}
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                        className="w-full px-3 py-2 bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#111827] focus:border-[#004B87] transition"
                      />
                    </div>
                  </div>

                  {/* Contact Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Mail size={14} />
                        </div>
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#111827] focus:border-[#004B87] transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Phone size={14} />
                        </div>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 9906000000"
                          value={form.phone_number}
                          onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#111827] focus:border-[#004B87] transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      Create Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock size={14} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Create account password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full pl-8 pr-9 py-2 bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#111827] focus:border-[#004B87] transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* CAPTCHA */}
                  <CaptchaField
                    onChange={setCaptchaData}
                    disabled={authLoading}
                  />

                  {/* Explicit Consent */}
                  <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-start gap-2">
                      <input
                        id="consent-terms"
                        type="checkbox"
                        required
                        checked={consentTerms}
                        onChange={(e) => setConsentTerms(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-[#004B87] focus:ring-[#004B87] cursor-pointer"
                      />
                      <label htmlFor="consent-terms" className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer">
                        I have read and agree to the{' '}
                        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#004B87] dark:text-blue-400 font-semibold underline">
                          Terms of Use
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#004B87] dark:text-blue-400 font-semibold underline">
                          Privacy Policy
                        </a>.
                      </label>
                    </div>

                    <div className="flex items-start gap-2">
                      <input
                        id="consent-data"
                        type="checkbox"
                        required
                        checked={consentData}
                        onChange={(e) => setConsentData(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-[#004B87] focus:ring-[#004B87] cursor-pointer"
                      />
                      <label htmlFor="consent-data" className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer">
                        I consent to the collection of my details for library attendance records and digital identity card issuance.
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-semibold text-[#004B87] dark:text-blue-400 hover:underline transition cursor-pointer"
                    >
                      Back to Plans
                    </button>
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                    >
                      {authLoading && <Loader2 size={13} className="animate-spin" />}
                      <span>Create Account and Proceed to Payment</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: OFFICIAL UPI QR & UTR SUBMISSION ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Submit Membership Dues
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scan the official UPI QR code and submit your 12-digit transaction reference for verification.
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-[#004B87] dark:text-blue-400 hover:underline transition flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={12} /> Change Plan
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left Column: QR Code + Input Form */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <QrCode size={16} className="text-[#004B87] dark:text-blue-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Official Library Payment QR
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5 justify-center">
                    {/* QR Box */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl shadow-2xs text-center">
                      <img
                        src="/assets/paymentqr.jpeg"
                        alt="UPI QR Code"
                        className="w-40 h-40 object-contain rounded-lg"
                      />
                      <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">OWAIS RAFIQ</p>
                        <p className="text-[10px] text-slate-500">Accounts Coordinator</p>
                      </div>
                    </div>

                    {/* Step-by-Step Instructions */}
                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 max-w-sm">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Payment Steps:</p>
                      <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
                        <li>Open any UPI application (GPay, PhonePe, Paytm).</li>
                        <li>Scan the QR code and pay exactly <strong>₹{total}</strong>.</li>
                        <li>Copy the 12-digit <strong>UPI Reference / UTR Number</strong> from your receipt.</li>
                        <li>Paste the number below and submit.</li>
                      </ol>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handlePaymentSubmit} className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
                    {paymentError && (
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs">
                        <AlertCircle size={14} />
                        <span>{paymentError}</span>
                      </div>
                    )}

                    <div>
                      <label htmlFor="txnId" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        UPI Transaction / Reference ID (12 digits) *
                      </label>
                      <input
                        id="txnId"
                        type="text"
                        required
                        placeholder="e.g. 430129482190"
                        value={txnId}
                        onChange={(e) => setTxnId(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#111827] focus:border-[#004B87] transition"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-xs font-semibold text-[#004B87] dark:text-blue-400 hover:underline transition cursor-pointer"
                      >
                        Back to Profile
                      </button>
                      <button
                        type="submit"
                        disabled={paymentSubmitting}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                      >
                        {paymentSubmitting && <Loader2 size={13} className="animate-spin" />}
                        <span>Submit Payment Reference</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="space-y-3.5">
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Summary
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {selectedPlan?.name || 'Membership Pass'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedPlan?.term_months || 1} Month Access
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-[#004B87] dark:text-blue-400 text-[11px] font-medium w-fit">
                      <Clock size={11} />
                      <span>{resolveTiming(selectedPlan?.timing)}</span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Subscription Fee</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Registration</span>
                      <span>{regFee > 0 ? `₹${regFee}` : 'Waived (Free)'}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold text-xs text-slate-900 dark:text-slate-100">
                      <span>Total Payable</span>
                      <span className="text-[#004B87] dark:text-blue-400">₹{total}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <ShieldCheck size={16} className="text-[#004B87] dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Official payment receipts are generated upon coordinator review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

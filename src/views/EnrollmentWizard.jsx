'use client';

import { useState, useEffect } from 'react';
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

  // Auto-select package if passed or set default
  useEffect(() => {
    if (initialPackage?.name) {
      setSelectedPlan(initialPackage);
    } else if (packages && packages.length > 0 && !selectedPlan) {
      const popular = packages.find(p => p.isPopular) || packages[0];
      setSelectedPlan(popular);
    }
  }, [initialPackage, packages]); // eslint-disable-line react-hooks/exhaustive-deps

  // When authentication status changes
  useEffect(() => {
    if (isAuthenticated && step === 2) {
      setStep(3);
    }
  }, [isAuthenticated, step]);

  const handlePlanSelect = (pkg) => {
    setSelectedPlan(pkg);
  };

  const handleNextFromPlan = () => {
    if (!selectedPlan) return;
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
    if (!captchaData.captcha_solution) {
      setAuthError('Please complete the security verification challenge.');
      return;
    }

    setAuthLoading(true);

    try {
      const regPayload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
        password: form.password,
        user_type: 'Patron',
        paid: '0',
        captcha_id: captchaData.captcha_id,
        captcha_solution: captchaData.captcha_solution,
      };

      const ok = await register(regPayload);
      if (ok) {
        setStep(3);
      } else {
        setAuthError('Could not complete registration. Please check your inputs.');
      }
    } catch (err) {
      setAuthError(err?.message || 'Registration could not be completed. Please check the information provided.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentError('');

    if (!txnId.trim() || txnId.trim().length < 4) {
      setPaymentError('Please enter a valid 12-digit UPI Transaction / Reference ID.');
      return;
    }

    const subtotal = Number(selectedPlan?.recurring_payment || 0);
    const regFee = Number(selectedPlan?.registration_fee || 0);
    const total = subtotal + regFee;

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
    <div className="w-full min-h-[calc(100vh-5rem)] bg-[#FCFCFB] dark:bg-[#0E1411] py-8 sm:py-12 px-4 sm:px-6 transition-colors">
      <div className="max-w-4xl mx-auto">

        {/* Stepper Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#33462C] dark:text-[#88B89C]">
              Patron Enrollment Workflow
            </span>
            <span className="text-xs font-medium text-[#7F8781]">
              Step {step} of 3
            </span>
          </div>

          {/* Step Badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {/* Step 1 */}
            <button
              onClick={() => setStep(1)}
              className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                step === 1
                  ? 'bg-white dark:bg-[#16211B] border-[#33462C] dark:border-[#8FD4AE] shadow-sm'
                  : step > 1
                  ? 'bg-[#EFF4EC] dark:bg-[#1E2E25] border-[#DFE6DC] dark:border-[#2C4133] text-[#24341E] dark:text-[#8FD4AE]'
                  : 'bg-white/60 dark:bg-[#121B16] border-[#DFE6DC] dark:border-[#26362D] text-[#7F8781]'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step > 1 ? 'bg-[#33462C] dark:bg-[#346F4F] text-white' : step === 1 ? 'bg-[#33462C] dark:bg-[#346F4F] text-white' : 'bg-[#DFE6DC] dark:bg-[#26362D] text-[#7F8781]'
              }`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-[#24341E] dark:text-white">Select Tier</p>
                <p className="text-[10px] text-[#7F8781]">Membership plan</p>
              </div>
            </button>

            {/* Step 2 */}
            <button
              onClick={() => { if (selectedPlan) setStep(2); }}
              disabled={!selectedPlan}
              className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                step === 2
                  ? 'bg-white dark:bg-[#16211B] border-[#33462C] dark:border-[#8FD4AE] shadow-sm'
                  : step > 2
                  ? 'bg-[#EFF4EC] dark:bg-[#1E2E25] border-[#DFE6DC] dark:border-[#2C4133] text-[#24341E] dark:text-[#8FD4AE]'
                  : 'bg-white/60 dark:bg-[#121B16] border-[#DFE6DC] dark:border-[#26362D] text-[#7F8781]'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step > 2 ? 'bg-[#33462C] dark:bg-[#346F4F] text-white' : step === 2 ? 'bg-[#33462C] dark:bg-[#346F4F] text-white' : 'bg-[#DFE6DC] dark:bg-[#26362D] text-[#7F8781]'
              }`}>
                {step > 2 ? '✓' : '2'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-[#24341E] dark:text-white">Account Details</p>
                <p className="text-[10px] text-[#7F8781]">Patron profile</p>
              </div>
            </button>

            {/* Step 3 */}
            <button
              onClick={() => { if (selectedPlan && isAuthenticated) setStep(3); }}
              disabled={!selectedPlan || !isAuthenticated}
              className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                step === 3
                  ? 'bg-white dark:bg-[#16211B] border-[#33462C] dark:border-[#8FD4AE] shadow-sm'
                  : 'bg-white/60 dark:bg-[#121B16] border-[#DFE6DC] dark:border-[#26362D] text-[#7F8781]'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 3 ? 'bg-[#33462C] dark:bg-[#346F4F] text-white' : 'bg-[#DFE6DC] dark:bg-[#26362D] text-[#7F8781]'
              }`}>
                3
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-[#24341E] dark:text-white">UPI Dues</p>
                <p className="text-[10px] text-[#7F8781]">Payment scan &amp; UTR</p>
              </div>
            </button>
          </div>
        </div>

        {/* ── STEP 1: CHOOSE MEMBERSHIP TIER ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-left">
              <h1 className="font-serif-lib text-2xl sm:text-3xl font-bold text-[#24341E] dark:text-[#8FD4AE]">
                Choose Your Membership Tier
              </h1>
              <p className="text-xs sm:text-sm text-[#0B0E0A] dark:text-[#9FB1A6] mt-1">
                Select your preferred study pass duration. All tiers include quiet carrel desk access, high-speed Wi-Fi, and reference materials.
              </p>
            </div>

            {/* Tier Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(packages || []).map((pkg) => {
                const isSelected = selectedPlan?._id === pkg._id || selectedPlan?.id === pkg.id;
                const pkgTotal = Number(pkg.recurring_payment || 0) + Number(pkg.registration_fee || 0);

                return (
                  <div
                    key={pkg._id || pkg.id}
                    onClick={() => handlePlanSelect(pkg)}
                    className={`relative rounded-2xl p-5 border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white dark:bg-[#16211B] border-[#33462C] dark:border-[#8FD4AE] ring-2 ring-[#33462C] dark:ring-[#8FD4AE] shadow-md'
                        : 'bg-white dark:bg-[#16211B] border-[#DFE6DC] dark:border-[#26362D] hover:border-[#33462C]/40 hover:shadow-sm'
                    }`}
                  >
                    {pkg.isPopular === 1 && (
                      <span className="absolute -top-2.5 right-4 bg-[#33462C] dark:bg-[#346F4F] text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                        <Sparkles size={10} /> Popular
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif-lib text-lg font-bold text-[#24341E] dark:text-[#8FD4AE]">
                          {pkg.name}
                        </h3>
                        {isSelected && <CheckCircle2 size={18} className="text-[#33462C] dark:text-[#8FD4AE]" />}
                      </div>
                      <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6] mt-1 line-clamp-2">
                        {pkg.tagline || pkg.description}
                      </p>

                      {/* Shift Timing Badge */}
                      <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EFF4EC] dark:bg-[#1E2E25] text-[#24341E] dark:text-[#8FD4AE] border border-[#DFE6DC] dark:border-[#2C4133] text-[11px] font-semibold w-fit">
                        <Clock size={11} className="text-[#33462C] dark:text-[#8FD4AE] flex-shrink-0" />
                        <span>{resolveTiming(pkg.timing)}</span>
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#DFE6DC] dark:border-[#26362D]">
                        <div className="flex items-baseline gap-1">
                          <span className="font-serif-lib text-2xl font-bold text-[#24341E] dark:text-[#8FD4AE]">
                            ₹{pkg.recurring_payment}
                          </span>
                          <span className="text-xs text-[#7F8781]">
                            / {pkg.term_months > 1 ? `${pkg.term_months} mos` : 'month'}
                          </span>
                        </div>
                        {pkg.registration_fee > 0 ? (
                          <p className="text-[11px] text-[#7F8781] mt-0.5">
                            + ₹{pkg.registration_fee} one-time admission fee
                          </p>
                        ) : (
                          <p className="text-[11px] font-semibold text-[#2E6B3F] dark:text-[#6BC68F] mt-0.5">
                            Admission fee waived (Free)
                          </p>
                        )}
                      </div>

                      {/* Feature List */}
                      <ul className="mt-4 space-y-2 text-xs text-[#0B0E0A] dark:text-[#9FB1A6]">
                        {(pkg.features || []).slice(0, 3).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#33462C] dark:text-[#8FD4AE] font-bold text-xs">✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#DFE6DC] dark:border-[#26362D] flex items-center justify-between">
                      <span className="text-[11px] text-[#7F8781]">Total Payable:</span>
                      <span className="font-serif-lib text-base font-bold text-[#24341E] dark:text-[#8FD4AE]">
                        ₹{pkgTotal}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step 1 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#DFE6DC] dark:border-[#26362D]">
              <button
                onClick={() => setPage('home')}
                className="text-xs font-semibold text-[#33462C] dark:text-[#8FD4AE] hover:underline transition cursor-pointer"
              >
                Cancel and return to home
              </button>
              <button
                onClick={handleNextFromPlan}
                disabled={!selectedPlan}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#33462C] hover:bg-[#24341E] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer active:scale-95"
              >
                <span>Continue to Step 2</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: PATRON PROFILE & KYC ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif-lib text-2xl sm:text-3xl font-bold text-[#24341E] dark:text-[#8FD4AE]">
                  Patron Account Details
                </h1>
                <p className="text-xs sm:text-sm text-[#0B0E0A] dark:text-[#9FB1A6] mt-1">
                  Create your library membership credentials. Selected tier: <strong>{selectedPlan?.name}</strong>.
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-[#33462C] dark:text-[#8FD4AE] hover:underline transition flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={13} /> Change Tier
              </button>
            </div>

            {/* If user is already authenticated */}
            {isAuthenticated ? (
              <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF4EC] dark:bg-[#1E2E25] text-[#33462C] dark:text-[#8FD4AE] flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="font-serif-lib text-base font-bold text-[#24341E] dark:text-[#8FD4AE]">
                      Signed in as {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6]">{user?.email}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#DFE6DC] dark:border-[#26362D] flex justify-end">
                  <button
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#33462C] hover:bg-[#24341E] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white text-xs font-semibold shadow-sm transition cursor-pointer active:scale-95"
                  >
                    <span>Proceed to UPI Payment</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-6 sm:p-8 shadow-sm">
                {authError && (
                  <div className="mb-5 p-3 rounded-xl bg-[#FAF0F0] dark:bg-[#281616] border border-[#F0D5D5] dark:border-[#4B1E1E] text-[#A83232] dark:text-[#F87171] text-xs flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Name Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#24341E] dark:text-[#E5EBE7] mb-1">
                        First Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7F8781]">
                          <User size={15} />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Owais"
                          value={form.first_name}
                          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                          className="w-full pl-9 pr-3 py-2.5 bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl text-xs text-[#0B0E0A] dark:text-[#E8EFEA] focus:bg-white dark:focus:bg-[#16211B] focus:border-[#33462C] dark:focus:border-[#8FD4AE] transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#24341E] dark:text-[#E5EBE7] mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rafiq"
                        value={form.last_name}
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl text-xs text-[#0B0E0A] dark:text-[#E8EFEA] focus:bg-white dark:focus:bg-[#16211B] focus:border-[#33462C] dark:focus:border-[#8FD4AE] transition"
                      />
                    </div>
                  </div>

                  {/* Contact Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#24341E] dark:text-[#E5EBE7] mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7F8781]">
                          <Mail size={15} />
                        </div>
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full pl-9 pr-3 py-2.5 bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl text-xs text-[#0B0E0A] dark:text-[#E8EFEA] focus:bg-white dark:focus:bg-[#16211B] focus:border-[#33462C] dark:focus:border-[#8FD4AE] transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#24341E] dark:text-[#E5EBE7] mb-1">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7F8781]">
                          <Phone size={15} />
                        </div>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 9906000000"
                          value={form.phone_number}
                          onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                          className="w-full pl-9 pr-3 py-2.5 bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl text-xs text-[#0B0E0A] dark:text-[#E8EFEA] focus:bg-white dark:focus:bg-[#16211B] focus:border-[#33462C] dark:focus:border-[#8FD4AE] transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-[#24341E] dark:text-[#E5EBE7] mb-1">
                      Choose Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7F8781]">
                        <Lock size={15} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Create strong account password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full pl-9 pr-10 py-2.5 bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl text-xs text-[#0B0E0A] dark:text-[#E8EFEA] focus:bg-white dark:focus:bg-[#16211B] focus:border-[#33462C] dark:focus:border-[#8FD4AE] transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7F8781] cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <p className="text-[11px] text-[#7F8781] mt-1">
                      Must contain at least 8 characters with uppercase, lowercase, number, and special symbol.
                    </p>
                  </div>

                  {/* Security Challenge (CAPTCHA) */}
                  <CaptchaField
                    onChange={setCaptchaData}
                    disabled={authLoading}
                  />

                  {/* Explicit Unbundled Privacy & Terms Consent */}
                  <div className="pt-2 space-y-2.5 border-t border-[#DFE6DC] dark:border-[#26362D]">
                    <div className="flex items-start gap-2.5">
                      <input
                        id="consent-terms"
                        type="checkbox"
                        required
                        checked={consentTerms}
                        onChange={(e) => setConsentTerms(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-[#DFE6DC] text-[#33462C] focus:ring-[#33462C] cursor-pointer"
                      />
                      <label htmlFor="consent-terms" className="text-xs text-[#0B0E0A] dark:text-[#CAD6CF] leading-relaxed cursor-pointer">
                        I have read and agree to the{' '}
                        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#33462C] dark:text-[#8FD4AE] font-semibold underline">
                          Terms of Use
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#33462C] dark:text-[#8FD4AE] font-semibold underline">
                          Privacy Policy
                        </a>.
                      </label>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <input
                        id="consent-data"
                        type="checkbox"
                        required
                        checked={consentData}
                        onChange={(e) => setConsentData(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-[#DFE6DC] text-[#33462C] focus:ring-[#33462C] cursor-pointer"
                      />
                      <label htmlFor="consent-data" className="text-xs text-[#0B0E0A] dark:text-[#CAD6CF] leading-relaxed cursor-pointer">
                        I consent to the collection and institutional verification of my personal admission details for library attendance records and digital identity card issuance.
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-[#DFE6DC] dark:border-[#26362D] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-semibold text-[#33462C] dark:text-[#8FD4AE] hover:underline transition cursor-pointer"
                    >
                      Back to Tiers
                    </button>
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#33462C] hover:bg-[#24341E] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer active:scale-95"
                    >
                      {authLoading && <Loader2 size={14} className="animate-spin" />}
                      <span>Create Account &amp; Proceed to Payment</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: OFFICIAL UPI QR & UTR SUBMISSION ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif-lib text-2xl sm:text-3xl font-bold text-[#24341E] dark:text-[#8FD4AE]">
                  Submit Membership Dues
                </h1>
                <p className="text-xs sm:text-sm text-[#0B0E0A] dark:text-[#9FB1A6] mt-1">
                  Pay directly via official UPI QR code and submit your reference ID for library ledger verification.
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-[#33462C] dark:text-[#8FD4AE] hover:underline transition flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={13} /> Change Plan
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: QR Code + Input Form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 border-b border-[#DFE6DC] dark:border-[#26362D] pb-3">
                    <QrCode size={18} className="text-[#33462C] dark:text-[#8FD4AE]" />
                    <h3 className="font-serif-lib text-base font-bold text-[#24341E] dark:text-[#8FD4AE]">
                      Official Library UPI QR
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                    {/* QR Box */}
                    <div className="bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#26362D] p-3 rounded-2xl shadow-sm text-center">
                      <img
                        src="/assets/paymentqr.jpeg"
                        alt="Official UPI QR Code"
                        className="w-44 h-44 object-contain rounded-xl"
                      />
                      <div className="mt-2.5 pt-2 border-t border-[#DFE6DC] dark:border-[#26362D]">
                        <p className="text-xs font-semibold text-[#24341E] dark:text-white">OWAIS RAFIQ</p>
                        <p className="text-[10px] text-[#33462C] dark:text-[#88B89C]">Library Accounts Coordinator</p>
                      </div>
                    </div>

                    {/* Step-by-Step Instructions */}
                    <div className="space-y-3 text-xs text-[#0B0E0A] dark:text-[#9FB1A6] max-w-sm">
                      <p className="font-semibold text-[#24341E] dark:text-white">How to complete payment:</p>
                      <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
                        <li>Open <strong>Google Pay, PhonePe, Paytm</strong>, or any UPI app.</li>
                        <li>Scan the QR code and pay exactly <strong>₹{total}</strong>.</li>
                        <li>Copy the 12-digit <strong>UPI Reference ID / Transaction ID</strong> from your receipt.</li>
                        <li>Paste the ID below and click Submit to confirm your admission.</li>
                      </ol>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handlePaymentSubmit} className="pt-2 border-t border-[#DFE6DC] dark:border-[#26362D] space-y-4">
                    {paymentError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF0F0] dark:bg-[#281616] border border-[#F0D5D5] dark:border-[#4B1E1E] text-[#A83232] dark:text-[#F87171] text-xs">
                        <AlertCircle size={15} />
                        <span>{paymentError}</span>
                      </div>
                    )}

                    <div>
                      <label htmlFor="txnId" className="block text-xs font-semibold text-[#24341E] dark:text-[#E5EBE7] mb-1.5">
                        UPI Transaction / Reference ID (12 digits) *
                      </label>
                      <input
                        id="txnId"
                        type="text"
                        required
                        placeholder="e.g. 430129482190 or UPI-Ref-ID"
                        value={txnId}
                        onChange={(e) => setTxnId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl text-xs font-mono text-[#0B0E0A] dark:text-[#E8EFEA] focus:bg-white dark:focus:bg-[#16211B] focus:border-[#33462C] dark:focus:border-[#8FD4AE] transition"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-xs font-semibold text-[#33462C] dark:text-[#8FD4AE] hover:underline transition cursor-pointer"
                      >
                        Back to Profile
                      </button>
                      <button
                        type="submit"
                        disabled={paymentSubmitting}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#33462C] hover:bg-[#24341E] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer active:scale-95"
                      >
                        {paymentSubmitting && <Loader2 size={14} className="animate-spin" />}
                        <span>Complete &amp; Submit Dues</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-5 shadow-sm space-y-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#33462C] dark:text-[#88B89C]">
                    Enrollment Summary
                  </span>
                  <div>
                    <h3 className="font-serif-lib text-lg font-bold text-[#24341E] dark:text-[#8FD4AE]">
                      {selectedPlan?.name || 'Membership Pass'}
                    </h3>
                    <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6] mt-1">
                      {selectedPlan?.term_months || 1} Month Access
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EFF4EC] dark:bg-[#1E2E25] text-[#24341E] dark:text-[#8FD4AE] text-[11px] font-semibold w-fit">
                      <Clock size={11} className="text-[#33462C] dark:text-[#8FD4AE]" />
                      <span>{resolveTiming(selectedPlan?.timing)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#DFE6DC] dark:border-[#26362D] space-y-2 text-xs">
                    <div className="flex justify-between text-[#0B0E0A] dark:text-[#9FB1A6]">
                      <span>Recurring Fee</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-[#0B0E0A] dark:text-[#9FB1A6]">
                      <span>Registration / Admission</span>
                      <span>{regFee > 0 ? `₹${regFee}` : 'Waived (Free)'}</span>
                    </div>
                    <div className="pt-2 border-t border-[#DFE6DC] dark:border-[#26362D] flex justify-between font-bold text-sm text-[#24341E] dark:text-white">
                      <span>Total Payable</span>
                      <span className="font-serif-lib text-base text-[#33462C] dark:text-[#8FD4AE]">₹{total}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#EFF4EC] dark:bg-[#1E2E25] border border-[#DFE6DC] dark:border-[#2C4133] text-xs text-[#24341E] dark:text-[#8FD4AE] flex items-start gap-2.5">
                  <ShieldCheck size={18} className="text-[#33462C] dark:text-[#8FD4AE] flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Official admission receipts are issued upon desk ledger reconciliation.
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

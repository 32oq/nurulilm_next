'use client';

import { useState, useEffect } from "react";
import { Mail, Lock, KeyRound, ArrowLeft, Eye, EyeOff, CheckCircle2, RotateCcw, Clock, ShieldCheck } from "lucide-react";
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage({ setPage, call_src }) {
  const { state: { user, isAuthenticated, error, id }, requestOtp, verifyOtp, updatePassword, logout } = useAuth();

  const isLoggedIn = Boolean((isAuthenticated && user?.email) || call_src === "dashboard" || user?.email);

  const [email, setEmail] = useState(user?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // 1-minute cooldown (60s)
  const [otpExpiresIn, setOtpExpiresIn] = useState(300); // 5-minute validity timer (300s)
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [localError, setLocalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sync logged-in user email
  useEffect(() => {
    if (isLoggedIn && user?.email) {
      setEmail(user.email);
    }
  }, [isLoggedIn, user?.email]);

  // 1-minute cooldown timer for resend OTP
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // 5-minute countdown timer for OTP expiration
  useEffect(() => {
    let timer;
    if (step === 2 && otpExpiresIn > 0) {
      timer = setTimeout(() => setOtpExpiresIn(t => t - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, otpExpiresIn]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Step 1: Send OTP to Registered Mailbox
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    const emailToUse = isLoggedIn && user?.email ? user.email : email.trim();

    if (!emailToUse) {
      setLocalError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const success = await requestOtp(emailToUse);
      if (success) {
        setStep(2);
        setResendCooldown(60); // 1-minute resend cooldown
        setOtpExpiresIn(300);  // 5-minute OTP validity timer
      } else {
        setLocalError("Unable to locate a patron account with this email. Please verify your address.");
      }
    } catch (err) {
      setLocalError(err.message || "Failed to dispatch verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP (1-minute cooldown + resets 5-minute validity)
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setLocalError("");
    const emailToUse = isLoggedIn && user?.email ? user.email : email.trim();
    setLoading(true);
    try {
      const success = await requestOtp(emailToUse);
      if (success) {
        setResendCooldown(60); // 1-minute cooldown
        setOtpExpiresIn(300);  // 5-minute validity
        setOtp("");
      }
    } catch (err) {
      setLocalError(err.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!otp.trim() || otp.trim().length < 4) {
      setLocalError("Please enter the complete 4-digit code.");
      return;
    }
    if (otpExpiresIn <= 0) {
      setLocalError("Verification code has expired. Please request a new code.");
      return;
    }

    setLoading(true);
    try {
      const success = await verifyOtp({ id, otp: otp.trim() });
      if (success) {
        setStep(3);
      } else {
        setLocalError("Invalid or expired verification code. Please check your inbox or request a new code.");
      }
    } catch (err) {
      setLocalError(err.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Establish New Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccessMsg("");

    if (newPassword.length < 6) {
      setLocalError("Password must be at least 6 characters in length.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match. Please re-enter both fields.");
      return;
    }

    setLoading(true);
    try {
      const success = await updatePassword({ id, pswd: newPassword });
      if (success) {
        setSuccessMsg("Password successfully reset! Returning to scholar sign in...");
        if (logout) await logout();
        setTimeout(() => {
          if (setPage) setPage('login');
          else if (typeof window !== 'undefined') window.location.reload();
        }, 1800);
      } else {
        setLocalError("Unable to update password. Your session may have expired.");
      }
    } catch (err) {
      setLocalError(err.message || "Password update failed.");
    } finally {
      setLoading(false);
    }
  };

  const displayedError = localError || error;
  const activeEmailDisplay = isLoggedIn && user?.email ? user.email : email;

  return (
    <div className={`w-full flex items-center justify-center ${call_src === 'dashboard' ? 'p-0' : 'min-h-[calc(100vh-6rem)] px-4 py-10 bg-[#F8F9F8] dark:bg-[#0B0F0D]'}`}>
      <div className={`w-full max-w-sm bg-white dark:bg-[#141A16] border border-[#DFE6DC] dark:border-[#223028] rounded-xl p-6 sm:p-7 shadow-xs ${call_src === 'dashboard' ? 'border-0 shadow-none p-0 bg-transparent dark:bg-transparent' : ''}`}>

        {/* Institutional Header */}
        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-lg bg-[#EBF4EE] dark:bg-[#1C3A2B]/40 text-[#2E6B3F] dark:text-[#8FD4AE] mx-auto flex items-center justify-center mb-2.5 shadow-2xs">
            <KeyRound size={19} strokeWidth={2.2} />
          </div>
          <h2 className="text-xl font-bold font-serif-lib text-[#1C1E1B] dark:text-[#F3F4F6] tracking-tight">
            Account Security
          </h2>
          <p className="text-xs text-[#5D645E] dark:text-[#9EAEA3] mt-1">
            {step === 1 && (isLoggedIn ? "Verify your identity via one-time code to update password." : "Enter your registered patron email to receive a verification OTP.")}
            {step === 2 && `Enter the 4-digit verification code sent to ${activeEmailDisplay}.`}
            {step === 3 && "Establish a secure new password for your patron account."}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1.5 mb-5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-sm transition-all duration-300 ${
                s === step ? 'w-8 bg-[#33462C] dark:bg-[#8FD4AE]' : s < step ? 'w-4 bg-[#8FD4AE] dark:bg-[#2E6B3F]' : 'w-4 bg-[#E2E8E2] dark:bg-[#223028]'
              }`}
            />
          ))}
        </div>

        {displayedError && (
          <div className="mb-4 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 p-2.5 rounded-lg text-xs text-center font-medium leading-relaxed">
            {displayedError}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 p-2.5 rounded-lg text-xs text-center font-medium leading-relaxed flex items-center justify-center gap-1.5">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Enter Email / Locked User Email */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1E1B] dark:text-[#E2E8E2] mb-1.5">
                {isLoggedIn ? "Account Email (Locked)" : "Registered Email Address"}
              </label>

              {isLoggedIn ? (
                <div className="flex items-center gap-2.5 p-3 bg-[#F8FAF8] dark:bg-[#1A231C] border border-[#DFE6DC] dark:border-[#2A3B30] rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-[#EBF4EE] dark:bg-[#2E6B3F]/30 text-[#2E6B3F] dark:text-[#8FD4AE] flex items-center justify-center shrink-0">
                    <ShieldCheck size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#7F8781] uppercase font-semibold tracking-wider">Logged-in Patron</p>
                    <p className="text-xs font-mono font-semibold text-[#1C1E1B] dark:text-[#F3F4F6] truncate">
                      {user.email}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-[#2E6B3F] dark:text-[#8FD4AE] bg-[#EBF4EE] dark:bg-[#2E6B3F]/20 px-2 py-0.5 rounded-full">
                    Protected
                  </span>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7F8781]">
                    <Mail size={15} />
                  </div>
                  <input
                    id="recoveryEmail"
                    type="email"
                    required
                    autoFocus
                    placeholder="e.g. scholar@nurulilmlibrary.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8F9F8] dark:bg-[#0B0F0D] border border-[#DFE6DC] dark:border-[#2A3B30] rounded-lg text-xs text-[#1C1E1B] dark:text-[#F3F4F6] placeholder-[#A0AEC0] focus:bg-white dark:focus:bg-[#141A16] focus:border-[#33462C] dark:focus:border-[#8FD4AE] focus:ring-1 focus:ring-[#33462C] transition shadow-2xs outline-none"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#33462C] hover:bg-[#253520] text-white rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? "Dispatching OTP Code..." : isLoggedIn ? "Send Verification Code to My Email" : "Send Verification OTP"}
            </button>
          </form>
        )}

        {/* STEP 2: Enter 4-Digit OTP with Live 5-Minute Timer */}
        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="otpField" className="block text-xs font-semibold text-[#1C1E1B] dark:text-[#E2E8E2]">
                  4-Digit Verification Code
                </label>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-colors ${
                  otpExpiresIn <= 0
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 ring-1 ring-rose-300 dark:ring-rose-800'
                    : otpExpiresIn < 60
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 ring-1 ring-amber-400 animate-pulse'
                    : 'bg-[#EBF4EE] dark:bg-[#1C3A2B]/60 text-[#2E6B3F] dark:text-[#8FD4AE] ring-1 ring-[#8FD4AE]/40'
                }`}>
                  <Clock size={12} className="shrink-0" />
                  <span>{otpExpiresIn > 0 ? `Time Left: ${formatTimer(otpExpiresIn)}` : 'Expired'}</span>
                </div>
              </div>

              <input
                id="otpField"
                type="text"
                required
                autoFocus
                maxLength={4}
                placeholder="• • • •"
                value={otp}
                disabled={otpExpiresIn <= 0}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[12px] text-2xl font-mono py-2.5 bg-[#F8F9F8] dark:bg-[#0B0F0D] border border-[#DFE6DC] dark:border-[#2A3B30] rounded-lg text-[#1C3A2B] dark:text-[#8FD4AE] font-bold focus:bg-white dark:focus:bg-[#141A16] focus:border-[#33462C] dark:focus:border-[#8FD4AE] focus:ring-1 focus:ring-[#33462C] transition shadow-2xs outline-none disabled:opacity-50"
              />

              {otpExpiresIn <= 0 ? (
                <div className="mt-2 p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-md text-center">
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 font-semibold">
                    ⚠️ Verification code has expired. Please request a new code using the button below.
                  </p>
                </div>
              ) : (
                <div className="mt-2 flex items-center justify-between text-[11px] text-[#7F8781] px-1">
                  <span>Sent to <strong className="text-[#1C1E1B] dark:text-[#E2E8E2]">{activeEmailDisplay}</strong></span>
                  <span className="font-mono text-[#2E6B3F] dark:text-[#8FD4AE] font-medium">Valid for 5 mins</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!isLoggedIn && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2 px-3 border border-[#DFE6DC] dark:border-[#2A3B30] text-[#5D645E] dark:text-[#9EAEA3] rounded-lg text-xs font-medium hover:bg-[#F8F9F8] dark:hover:bg-[#1C261F] transition cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading || otp.length < 4 || otpExpiresIn <= 0}
                className={`${isLoggedIn ? 'w-full' : 'flex-1'} py-2 px-4 bg-[#33462C] hover:bg-[#253520] text-white rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer disabled:opacity-50`}
              >
                {loading ? "Verifying..." : otpExpiresIn <= 0 ? "Code Expired" : "Verify Code"}
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleResendOtp}
                className="inline-flex items-center gap-1.5 text-xs text-[#2E6B3F] dark:text-[#8FD4AE] hover:underline cursor-pointer disabled:opacity-50 disabled:no-underline"
              >
                <RotateCcw size={12} />
                <span>
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Verification Code"}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Create New Password */}
        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="newPasswordField" className="block text-xs font-semibold text-[#1C1E1B] dark:text-[#E2E8E2] mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7F8781]">
                  <Lock size={15} />
                </div>
                <input
                  id="newPasswordField"
                  type={showPassword ? "text" : "password"}
                  required
                  autoFocus
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-[#F8F9F8] dark:bg-[#0B0F0D] border border-[#DFE6DC] dark:border-[#2A3B30] rounded-lg text-xs text-[#1C1E1B] dark:text-[#F3F4F6] placeholder-[#A0AEC0] focus:bg-white dark:focus:bg-[#141A16] focus:border-[#33462C] dark:focus:border-[#8FD4AE] focus:ring-1 focus:ring-[#33462C] transition shadow-2xs outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7F8781] hover:text-[#1C1E1B] dark:hover:text-[#F3F4F6] cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPasswordField" className="block text-xs font-semibold text-[#1C1E1B] dark:text-[#E2E8E2] mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7F8781]">
                  <Lock size={15} />
                </div>
                <input
                  id="confirmPasswordField"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F9F8] dark:bg-[#0B0F0D] border border-[#DFE6DC] dark:border-[#2A3B30] rounded-lg text-xs text-[#1C1E1B] dark:text-[#F3F4F6] placeholder-[#A0AEC0] focus:bg-white dark:focus:bg-[#141A16] focus:border-[#33462C] dark:focus:border-[#8FD4AE] focus:ring-1 focus:ring-[#33462C] transition shadow-2xs outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#33462C] hover:bg-[#253520] text-white rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? "Updating Credentials..." : "Update Password & Return to Sign In"}
            </button>
          </form>
        )}

        {call_src !== 'dashboard' && !isLoggedIn && (
          <div className="mt-5 pt-3.5 border-t border-[#DFE6DC] dark:border-[#223028] text-center">
            <button
              type="button"
              onClick={() => setPage('login')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5D645E] hover:text-[#1C1E1B] dark:hover:text-[#F3F4F6] cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back to Member Sign In</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from "react";
import { Mail, Lock, KeyRound, ArrowLeft } from "lucide-react";
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage({ setPage, call_src }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [step, setStep] = useState(1); 
  // step 1 = email, step 2 = otp, step 3 = new password

  const { state: { error, id }, requestOtp, verifyOtp, updatePassword, logout } = useAuth();

  // Step 1 → Send OTP
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const success = await requestOtp(email.trim());
    if (success) setStep(2);
  };

  // Step 2 → Verify OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const success = await verifyOtp({ id, otp: otp.trim() });
    if (success) setStep(3);
  };

  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 3 → Update Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    const success = await updatePassword({ id, pswd: newPassword });

    if (success) {
      setSuccessMsg("Your password has been updated successfully. Redirecting to sign in...");
      if (logout) await logout();
      setTimeout(() => {
        if (setPage) setPage('login');
        else if (typeof window !== 'undefined') window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className={`w-full flex items-center justify-center ${call_src === 'dashboard' ? 'p-0' : 'min-h-[calc(100vh-6rem)] px-4 py-10 bg-[#FAF8F5] dark:bg-[#0E1511]'}`}>
      <div className={`w-full max-w-sm bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl p-7 shadow-xs ${call_src === 'dashboard' ? 'border-0 shadow-none p-0 bg-transparent dark:bg-transparent' : ''}`}>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#EDF3EE] dark:bg-[#203126] text-[#1C3A2B] dark:text-[#8FD4AE] mx-auto flex items-center justify-center mb-2.5">
            <KeyRound size={20} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#6D8374] dark:text-[#8CA093]">
            Security &amp; Recovery
          </span>
          <h2 className="font-serif-lib text-2xl font-bold text-[#1C3A2B] dark:text-[#FAF8F5] mt-0.5">
            Reset Password
          </h2>
          <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] mt-1">
            {step === 1 && "Enter your registered email address to receive a verification OTP."}
            {step === 2 && "Enter the 4-digit verification code sent to your email."}
            {step === 3 && "Choose a strong new password for your account."}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-sm transition-all ${
                s === step ? 'w-8 bg-[#1C3A2B] dark:bg-[#8FD4AE]' : s < step ? 'w-4 bg-[#6D8374]' : 'w-4 bg-[#E5DFD5] dark:bg-[#26362D]'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 bg-[#FAF0F0] dark:bg-[#3D1A1A] text-[#A83232] dark:text-[#FCA5A5] border border-[#F0D5D5] dark:border-[#5C2A2A] p-2.5 rounded-xl text-xs text-center font-medium leading-relaxed">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 bg-[#EFF4EC] dark:bg-[#1E2E25] text-[#24341E] dark:text-[#8FD4AE] border border-[#DFE6DC] dark:border-[#2C4133] p-2.5 rounded-xl text-xs text-center font-medium leading-relaxed">
            {successMsg}
          </div>
        )}

        {/* STEP 1 → Enter Email */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="recoveryEmail" className="block text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7F8781]">
                  <Mail size={16} />
                </div>
                <input
                  id="recoveryEmail"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl text-xs text-[#1C1E1B] dark:text-white placeholder-[#8A928C] focus:border-[#1C3A2B] transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1C3A2B] hover:bg-[#142C20] dark:bg-[#2A4D3B] text-white font-semibold text-xs py-2.5 rounded-xl transition shadow-xs cursor-pointer"
            >
              Send 4-Digit OTP
            </button>
          </form>
        )}

        {/* STEP 2 → Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label htmlFor="recoveryOtp" className="block text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] mb-1.5 text-center">
                Enter 4-Digit Verification Code
              </label>
              <input
                id="recoveryOtp"
                type="text"
                maxLength={4}
                required
                pattern="\d{4}"
                placeholder="••••"
                className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3 py-2.5 text-[#1C1E1B] dark:text-white text-center tracking-widest text-xl font-mono focus:border-[#1C3A2B] transition"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#1C3A2B] hover:bg-[#142C20] dark:bg-[#2A4D3B] text-white font-semibold text-xs py-2.5 rounded-xl transition shadow-xs cursor-pointer"
            >
              Verify Code
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xs text-[#6D8374] dark:text-[#8FD4AE] hover:text-[#1C3A2B] text-center cursor-pointer"
            >
              Re-enter email
            </button>
          </form>
        )}

        {/* STEP 3 → Enter New Password */}
        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPasswordInput" className="block text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7F8781]">
                  <Lock size={16} />
                </div>
                <input
                  id="newPasswordInput"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter new password"
                  className="w-full pl-9 pr-10 py-2.5 bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl text-xs text-[#1C1E1B] dark:text-white placeholder-[#8A928C] focus:border-[#1C3A2B] transition"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                Must be at least 8 characters with upper, lower, digit, and symbol.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1C3A2B] hover:bg-[#142C20] dark:bg-[#2A4D3B] text-white font-semibold text-xs py-2.5 rounded-xl transition shadow-xs cursor-pointer"
            >
              Update Password
            </button>
          </form>
        )}

        {!call_src && call_src !== 'dashboard' && (
          <div className="mt-6 pt-4 border-t border-[#EFEBE4] dark:border-[#26362D] text-center">
            <button
              type="button"
              onClick={() => setPage('login')}
              className="inline-flex items-center gap-1.5 text-xs text-[#5D645E] dark:text-[#9FB1A6] hover:text-[#1C3A2B] font-medium cursor-pointer"
            >
              <ArrowLeft size={13} /> Back to Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

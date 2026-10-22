'use client';

import { useState } from 'react';
import {
  LogIn, Loader2, Mail, Lock, Eye, EyeOff,
  Clock, ShieldCheck, ArrowRight, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CaptchaField, LibraryLogo } from '../components/common';

const LoginPage = ({ setPage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaData, setCaptchaData] = useState({ captcha_id: '', captcha_solution: '' });
  const { state: { loading, error }, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedVal = username.trim();
    let uniqueId = 'user_id';
    if (trimmedVal.includes('@')) {
      uniqueId = 'email';
    } else if (/^\+?[0-9]{7,15}$/.test(trimmedVal.replace(/[\s-]/g, ''))) {
      uniqueId = 'mobiles';
    } else {
      uniqueId = 'user_id';
    }

    const payload = {
      unique_id: uniqueId,
      value: trimmedVal,
      password: password,
      captcha_id: captchaData.captcha_id,
      captcha_solution: captchaData.captcha_solution,
    };
    const success = await login(payload);
    if (success) setPage('dashboard');
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-[#F8FAFC] dark:bg-[#070B14] transition-colors relative overflow-hidden">
      
      {/* Apple Dynamic Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[360px] bg-gradient-to-tr from-blue-500/12 via-indigo-500/8 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full material-card hairline-border rounded-3xl p-6 sm:p-9 shadow-xl backdrop-blur-2xl relative z-10">
        
        {/* Apple Segmented Control Switcher */}
        <div className="flex p-1 bg-slate-100/90 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-white/10 mb-6 shadow-2xs">
          <button
            type="button"
            className="flex-1 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs transition cursor-default"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setPage('register')}
            className="flex-1 py-2 text-xs font-medium rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition hig-spring cursor-pointer"
          >
            Register
          </button>
        </div>

        {/* Brand Crest & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/95 dark:bg-slate-800/90 hairline-border shadow-sm flex items-center justify-center p-2 mb-3.5 backdrop-blur-md">
            <LibraryLogo variant="emblem" size={38} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white hig-title-1 tracking-tight">
            Patron Sign In
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
            Access your reserved study carrel, catalog loans, and digital academic portal.
          </p>
        </div>

        {/* Status / Error Banner (Apple Callout) */}
        {error && (
          <div className={`mb-5 p-3.5 rounded-2xl text-xs font-medium border text-left flex items-start gap-2.5 animate-in fade-in duration-200 ${
            error.toLowerCase().includes('verification pending')
              ? 'bg-amber-50/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-900/60'
              : 'bg-rose-50/90 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
          }`}>
            {error.toLowerCase().includes('verification pending') ? (
              <>
                <Clock size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-950 dark:text-amber-200">Verification Pending</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                    Your dues reference is currently awaiting administrator review. Please check back shortly.
                  </p>
                </div>
              </>
            ) : (
              <div className="w-full text-center leading-relaxed">{error}</div>
            )}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email / Mobile / Patron ID */}
          <div>
            <label htmlFor="login_username" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email or Mobile Number
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Mail size={16} />
              </div>
              <input
                id="login_username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full h-11 sm:h-12 pl-10 pr-3.5 bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-[#111827] focus:border-[#004B87] dark:focus:border-blue-400 focus:ring-4 focus:ring-[#004B87]/15 transition hig-spring shadow-2xs outline-none"
                placeholder="e.g. name@example.com or 9906000000"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login_password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setPage('forgot_password')}
                className="text-xs text-[#004B87] dark:text-blue-400 hover:underline font-medium cursor-pointer hig-spring"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Lock size={16} />
              </div>
              <input
                id="login_password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="w-full h-11 sm:h-12 pl-10 pr-11 bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-[#111827] focus:border-[#004B87] dark:focus:border-blue-400 focus:ring-4 focus:ring-[#004B87]/15 transition hig-spring shadow-2xs outline-none"
                placeholder="Enter account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer hig-spring"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* CAPTCHA Human Verification */}
          <div className="pt-1">
            <CaptchaField
              onChange={setCaptchaData}
              disabled={loading}
            />
          </div>

          {/* Submit button (Tactile 44pt+ spring button) */}
          <button
            disabled={loading}
            type="submit"
            className="w-full h-11 sm:h-12 mt-2 px-6 rounded-2xl bg-[#004B87] hover:bg-[#003865] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 cursor-pointer hig-spring active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                <span>Authenticating Credentials…</span>
              </>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-7 pt-5 border-t border-slate-200/80 dark:border-slate-800 text-center space-y-2.5">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            New to Nurul Ilm Library?{' '}
            <button
              onClick={() => setPage('register')}
              className="font-semibold text-[#004B87] dark:text-blue-400 hover:underline ml-1 cursor-pointer hig-spring"
            >
              Register for Admission
            </button>
          </p>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
            By signing in, you agree to the{' '}
            <a href="/terms" className="underline hover:text-slate-600 dark:hover:text-slate-300">
              Terms of Use
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-slate-600 dark:hover:text-slate-300">
              Privacy Policy
            </a>.
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Nurul Ilm Handwara • Encrypted &amp; Verified Access</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;

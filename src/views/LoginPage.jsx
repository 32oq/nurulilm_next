'use client';

import { useState } from 'react';
import { LogIn, Loader2, Mail, Lock, Eye, EyeOff, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CaptchaField } from '../components/common';

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
    <div className="w-full min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-12 bg-[#F6F8FB] dark:bg-[#0B0F19] transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs">
        
        {/* Header without decorative eyebrows */}
        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004B87] dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
            <LogIn size={20} strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Member Sign In
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            Access your library desk, active loans, and study resources.
          </p>
        </div>

        {/* Status / Error message */}
        {error && (
          <div className={`mb-4 p-3 rounded-lg text-xs font-medium border text-left flex items-start gap-2.5 ${
            error.toLowerCase().includes('verification pending')
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
          }`}>
            {error.toLowerCase().includes('verification pending') ? (
              <>
                <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-200">Verification Pending</p>
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

        <form className="space-y-3.5" onSubmit={handleSubmit}>
          {/* Username / Identifier */}
          <div>
            <label htmlFor="username" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Email or Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={15} />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full pl-9 pr-3 py-2 bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-[#111827] focus:border-[#004B87] dark:focus:border-blue-400 focus:ring-1 focus:ring-[#004B87] transition shadow-2xs"
                placeholder="e.g. name@example.com or 9906000000"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                Password
              </label>
              <button
                type="button"
                onClick={() => setPage('forgot_password')}
                className="text-xs text-[#004B87] dark:text-blue-400 hover:underline font-medium cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={15} />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="w-full pl-9 pr-9 py-2 bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-[#111827] focus:border-[#004B87] dark:focus:border-blue-400 focus:ring-1 focus:ring-[#004B87] transition shadow-2xs"
                placeholder="Enter account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* CAPTCHA */}
          <CaptchaField
            onChange={setCaptchaData}
            disabled={loading}
          />

          {/* Submit button */}
          <button
            disabled={loading}
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#004B87] hover:bg-[#003865] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition disabled:opacity-50 text-xs shadow-2xs mt-3 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <LogIn size={15} />
                <span>Sign In to Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            New to Nurul Ilm Library?{' '}
            <button
              onClick={() => setPage('register')}
              className="font-semibold text-[#004B87] dark:text-blue-400 hover:underline ml-1 cursor-pointer"
            >
              Register for Admission
            </button>
          </p>

          <p className="text-[11px] text-slate-400">
            By continuing, you agree to our{' '}
            <a href="/terms" className="underline hover:text-slate-600 dark:hover:text-slate-300">
              Terms of Use
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-slate-600 dark:hover:text-slate-300">
              Privacy Policy
            </a>.
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;

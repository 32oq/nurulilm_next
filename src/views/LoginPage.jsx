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
    const payload = {
      unique_id: username.includes('@') ? 'email' : 'mobiles',
      value: username.trim(),
      password: password,
      captcha_id: captchaData.captcha_id,
      captcha_solution: captchaData.captcha_solution,
    };
    const success = await login(payload);
    if (success) setPage('dashboard');
  };

  return (
    <div className="w-full min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-12 bg-[#FCFCFB] dark:bg-[#0E1411] transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-7 sm:p-9 shadow-sm transition-all">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#EFF4EC] dark:bg-[#1E2E25] text-[#33462C] dark:text-[#8FD4AE] mx-auto flex items-center justify-center mb-3 shadow-2xs">
            <LogIn size={22} strokeWidth={2} />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#33462C] dark:text-[#88B89C]">
            Patron Portal
          </span>
          <h1 className="font-serif-lib text-2xl sm:text-3xl font-bold text-[#24341E] dark:text-[#8FD4AE] mt-0.5">
            Member Sign In
          </h1>
          <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6] mt-1.5 leading-relaxed">
            Access your library desk, active loans, and study resources.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className={`mb-5 p-3.5 rounded-xl text-xs font-medium border text-left flex items-start gap-2.5 transition-all ${
            error.toLowerCase().includes('verification pending')
              ? 'bg-[#FFFBEB] dark:bg-[#2C2411] text-[#92400E] dark:text-[#FBBF24] border-[#FDE68A] dark:border-[#523B12]'
              : 'bg-[#FAF0F0] dark:bg-[#281616] text-[#A83232] dark:text-[#F87171] border-[#F0D5D5] dark:border-[#4B1E1E]'
          }`}>
            {error.toLowerCase().includes('verification pending') ? (
              <>
                <Clock size={16} className="text-[#D97706] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#92400E] dark:text-[#FBBF24]">Verification Pending</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[#B45309] dark:text-[#FCD34D]">
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
          {/* Username / Identifier */}
          <div>
            <label htmlFor="username" className="block text-xs font-semibold text-[#24341E] dark:text-[#E5EBE7] mb-1.5">
              Email or Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7F8781]">
                <Mail size={16} />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl text-sm text-[#0B0E0A] dark:text-[#E8EFEA] placeholder-[#8A928C] focus:bg-white dark:focus:bg-[#16211B] focus:border-[#33462C] dark:focus:border-[#8FD4AE] focus:ring-1 focus:ring-[#33462C] transition shadow-2xs"
                placeholder="e.g. name@example.com or 9906000000"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-[#24341E] dark:text-[#E5EBE7]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setPage('forgot_password')}
                className="text-xs text-[#33462C] dark:text-[#8FD4AE] hover:underline font-medium cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7F8781]">
                <Lock size={16} />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl text-sm text-[#0B0E0A] dark:text-[#E8EFEA] placeholder-[#8A928C] focus:bg-white dark:focus:bg-[#16211B] focus:border-[#33462C] dark:focus:border-[#8FD4AE] focus:ring-1 focus:ring-[#33462C] transition shadow-2xs"
                placeholder="Enter account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7F8781] hover:text-[#24341E] dark:hover:text-white cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Human Verification (CAPTCHA) */}
          <CaptchaField
            onChange={setCaptchaData}
            disabled={loading}
          />

          {/* Submit button */}
          <button
            disabled={loading}
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#33462C] hover:bg-[#24341E] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white font-semibold py-2.5 px-4 rounded-xl transition duration-150 disabled:opacity-50 text-sm shadow-sm mt-3 cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign In to Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-6 pt-5 border-t border-[#DFE6DC] dark:border-[#26362D] text-center space-y-2">
          <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6]">
            New to Nurul Ilm Library?{' '}
            <button
              onClick={() => setPage('register')}
              className="font-semibold text-[#33462C] dark:text-[#8FD4AE] hover:underline ml-1 cursor-pointer"
            >
              Register for Admission
            </button>
          </p>

          <p className="text-[11px] text-[#7F8781]">
            By continuing, you agree to our{' '}
            <a href="/terms" className="underline hover:text-[#24341E] dark:hover:text-[#8FD4AE]">
              Terms of Use
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-[#24341E] dark:hover:text-[#8FD4AE]">
              Privacy Policy
            </a>.
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;

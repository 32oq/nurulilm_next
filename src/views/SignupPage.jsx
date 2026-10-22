'use client';

import { useState, useMemo } from 'react';
import {
  UserPlus, User, Mail, Phone, Lock, Eye, EyeOff,
  CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck,
  Sparkles, Check, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CaptchaField, LibraryLogo } from '../components/common';

export default function SignupPage({ setPage, initialPackage = null }) {
  const { register } = useAuth();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [captchaData, setCaptchaData] = useState({ captcha_id: '', captcha_solution: '' });
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentData, setConsentData] = useState(false);

  // Real-time password validation matching backend security rules
  const passwordCriteria = useMemo(() => {
    const p = form.password;
    return {
      length: p.length >= 8 && p.length <= 128,
      lower: /[a-z]/.test(p),
      upper: /[A-Z]/.test(p),
      digit: /\d/.test(p),
      special: /[^a-zA-Z0-9]/.test(p),
    };
  }, [form.password]);

  // Overall password strength calculation (0 to 4)
  const strengthScore = useMemo(() => {
    if (!form.password) return 0;
    let score = 0;
    if (passwordCriteria.length) score += 1;
    if (passwordCriteria.lower && passwordCriteria.upper) score += 1;
    if (passwordCriteria.digit) score += 1;
    if (passwordCriteria.special) score += 1;
    return score;
  }, [form.password, passwordCriteria]);

  const strengthLabel = useMemo(() => {
    switch (strengthScore) {
      case 1: return { text: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-600 dark:text-rose-400' };
      case 2: return { text: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400' };
      case 3: return { text: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' };
      case 4: return { text: 'Strong (Security Met)', color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' };
      default: return { text: 'Enter password', color: 'bg-slate-200 dark:bg-slate-800', textColor: 'text-slate-400' };
    }
  }, [strengthScore]);

  const isPasswordValid = strengthScore === 4;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!isPasswordValid) {
      setAuthError('Please create a stronger password meeting all security requirements below.');
      return;
    }

    if (!consentTerms) {
      setAuthError('Please review and accept the Terms of Use and Privacy Policy.');
      return;
    }

    if (!consentData) {
      setAuthError('Please provide consent for institutional record verification and Digital Patron ID card generation.');
      return;
    }

    if (!captchaData.captcha_id || !captchaData.captcha_solution) {
      setAuthError('Please solve the security challenge.');
      return;
    }

    setAuthLoading(true);
    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone_number: form.phone_number.trim(),
        password: form.password,
        user_type: 'Patron',
        paid: '0',
        captcha_id: captchaData.captcha_id,
        captcha_solution: captchaData.captcha_solution,
      };

      const success = await register(payload);
      if (success) {
        if (initialPackage) {
          setPage('packages');
        } else {
          setPage('packages');
        }
      }
    } catch (err) {
      setAuthError(err?.message || 'Registration failed. Please review your details and try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-[#F8FAFC] dark:bg-[#070B14] transition-colors relative overflow-hidden">
      
      {/* Apple Dynamic Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[380px] bg-gradient-to-tr from-blue-500/12 via-indigo-500/8 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full material-card hairline-border rounded-3xl p-6 sm:p-10 shadow-xl backdrop-blur-2xl relative z-10">
        
        {/* Apple Segmented Control Switcher */}
        <div className="flex p-1 bg-slate-100/90 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-white/10 mb-6 shadow-2xs">
          <button
            type="button"
            onClick={() => setPage('login')}
            className="flex-1 py-2 text-xs font-medium rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition hig-spring cursor-pointer"
          >
            Sign In
          </button>
          <button
            type="button"
            className="flex-1 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs transition cursor-default"
          >
            Create Account
          </button>
        </div>

        {/* Brand Crest & Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-white/95 dark:bg-slate-800/90 hairline-border shadow-sm flex items-center justify-center p-2 mb-3.5 backdrop-blur-md">
            <LibraryLogo variant="emblem" size={38} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white hig-title-1 tracking-tight">
            Create Patron Account
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-md mx-auto">
            Reserve dedicated study carrels, check out academic catalog volumes, and obtain your Digital Patron ID.
          </p>
        </div>

        {/* Error Notification Banner (Apple Callout) */}
        {authError && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <span className="leading-relaxed">{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Inset Section 1: Scholar Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="first_name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                First Name *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <User size={16} />
                </div>
                <input
                  id="first_name"
                  type="text"
                  required
                  autoComplete="given-name"
                  placeholder="e.g. Zubair"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="w-full h-11 sm:h-12 pl-10 pr-3.5 bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-[#111827] focus:border-[#004B87] dark:focus:border-blue-400 focus:ring-4 focus:ring-[#004B87]/15 transition hig-spring shadow-2xs outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="last_name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Last Name
              </label>
              <div className="relative flex items-center">
                <input
                  id="last_name"
                  type="text"
                  autoComplete="family-name"
                  placeholder="e.g. Peerzada"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="w-full h-11 sm:h-12 px-3.5 bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-[#111827] focus:border-[#004B87] dark:focus:border-blue-400 focus:ring-4 focus:ring-[#004B87]/15 transition hig-spring shadow-2xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* Inset Section 2: Contact Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="signup_email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail size={16} />
                </div>
                <input
                  id="signup_email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="scholar@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-11 sm:h-12 pl-10 pr-3.5 bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-[#111827] focus:border-[#004B87] dark:focus:border-blue-400 focus:ring-4 focus:ring-[#004B87]/15 transition hig-spring shadow-2xs outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup_phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Mobile Number *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Phone size={16} />
                </div>
                <div className="absolute left-10 text-slate-500 font-mono text-xs select-none pointer-events-none">
                  +91
                </div>
                <input
                  id="signup_phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="9906000000"
                  maxLength={10}
                  value={form.phone_number}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setForm({ ...form, phone_number: clean });
                  }}
                  className="w-full h-11 sm:h-12 pl-18 pr-3.5 bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl text-xs font-mono tabular-nums text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-[#111827] focus:border-[#004B87] dark:focus:border-blue-400 focus:ring-4 focus:ring-[#004B87]/15 transition hig-spring shadow-2xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* Inset Section 3: Passphrase & Security */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="signup_password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Create Strong Password *
              </label>
              {form.password && (
                <span className={`text-[11px] font-semibold ${strengthLabel.textColor}`}>
                  {strengthLabel.text}
                </span>
              )}
            </div>
            
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Lock size={16} />
              </div>
              <input
                id="signup_password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Create account passphrase"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full h-11 sm:h-12 pl-10 pr-11 bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-[#111827] focus:border-[#004B87] dark:focus:border-blue-400 focus:ring-4 focus:ring-[#004B87]/15 transition hig-spring shadow-2xs outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer hig-spring"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Apple 4-Segment Strength Bar */}
            <div className="mt-2.5 grid grid-cols-4 gap-1.5 h-1.5">
              {[1, 2, 3, 4].map((stepIndex) => (
                <div
                  key={stepIndex}
                  className={`h-full rounded-full transition-all duration-300 ${
                    strengthScore >= stepIndex ? strengthLabel.color : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Live Security Criteria Checklist */}
            <div className="mt-3 p-3 bg-slate-50/90 dark:bg-slate-900/70 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-[11px] grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                {passwordCriteria.length ? (
                  <Check size={13} className="text-emerald-500 font-bold" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700" />
                )}
                <span className={passwordCriteria.length ? 'text-slate-900 dark:text-white font-medium' : ''}>
                  8+ characters
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {passwordCriteria.upper && passwordCriteria.lower ? (
                  <Check size={13} className="text-emerald-500 font-bold" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700" />
                )}
                <span className={passwordCriteria.upper && passwordCriteria.lower ? 'text-slate-900 dark:text-white font-medium' : ''}>
                  Upper &amp; lowercase
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {passwordCriteria.digit ? (
                  <Check size={13} className="text-emerald-500 font-bold" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700" />
                )}
                <span className={passwordCriteria.digit ? 'text-slate-900 dark:text-white font-medium' : ''}>
                  At least 1 number
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {passwordCriteria.special ? (
                  <Check size={13} className="text-emerald-500 font-bold" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700" />
                )}
                <span className={passwordCriteria.special ? 'text-slate-900 dark:text-white font-medium' : ''}>
                  Special symbol (!@#$)
                </span>
              </div>
            </div>
          </div>

          {/* Inset Section 4: CAPTCHA Human Verification */}
          <div className="pt-1">
            <CaptchaField
              onChange={setCaptchaData}
              disabled={authLoading}
            />
          </div>

          {/* Inset Section 5: Institutional Consent Checkboxes with 44pt Touch Targets */}
          <div className="pt-2.5 space-y-2 border-t border-slate-200/80 dark:border-slate-800 text-xs">
            <label className="flex items-start gap-2.5 cursor-pointer hig-spring select-none">
              <div className="hig-touch-target -ml-2 -mt-2">
                <input
                  type="checkbox"
                  required
                  checked={consentTerms}
                  onChange={(e) => setConsentTerms(e.target.checked)}
                  className="w-4 h-4 rounded-md border-slate-300 dark:border-slate-700 text-[#004B87] dark:text-blue-500 focus:ring-[#004B87] cursor-pointer"
                />
              </div>
              <span className="text-slate-600 dark:text-slate-300 leading-relaxed -ml-1 text-[12px]">
                I agree to the{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#004B87] dark:text-blue-400 font-semibold underline underline-offset-2"
                >
                  Terms of Use
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#004B87] dark:text-blue-400 font-semibold underline underline-offset-2"
                >
                  Privacy Policy
                </a>.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer hig-spring select-none">
              <div className="hig-touch-target -ml-2 -mt-2">
                <input
                  type="checkbox"
                  required
                  checked={consentData}
                  onChange={(e) => setConsentData(e.target.checked)}
                  className="w-4 h-4 rounded-md border-slate-300 dark:border-slate-700 text-[#004B87] dark:text-blue-500 focus:ring-[#004B87] cursor-pointer"
                />
              </div>
              <span className="text-slate-600 dark:text-slate-300 leading-relaxed -ml-1 text-[12px]">
                I consent to identity verification and institutional record keeping for my official Digital Patron ID card.
              </span>
            </label>
          </div>

          {/* Submit Button (Tactile 44pt+ spring button) */}
          <button
            type="submit"
            disabled={authLoading || !isPasswordValid || !consentTerms || !consentData}
            className="w-full h-11 sm:h-12 mt-3 px-6 rounded-2xl bg-[#004B87] hover:bg-[#003865] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 cursor-pointer hig-spring active:scale-[0.98]"
          >
            {authLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating Patron Account…</span>
              </>
            ) : (
              <>
                <span>Complete Admission Registration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-7 pt-5 border-t border-slate-200/80 dark:border-slate-800 text-center space-y-2.5">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Already enrolled as a patron?{' '}
            <button
              type="button"
              onClick={() => setPage('login')}
              className="font-semibold text-[#004B87] dark:text-blue-400 hover:underline cursor-pointer hig-spring ml-1"
            >
              Sign In to your account
            </button>
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Nurul Ilm Handwara • Encrypted &amp; Verified Institutional Admission</span>
          </div>
        </div>

      </div>
    </div>
  );
}

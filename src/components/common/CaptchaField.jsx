'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Shield, Loader2 } from 'lucide-react';
import authService from '../../services/authService';

/**
 * Institutional Human Verification (CAPTCHA) Component
 * Renders a server-generated cryptographic SVG challenge with client solution input.
 * Fully accessible, zero emojis, zero third-party script leakage.
 */
export default function CaptchaField({
  onChange,
  disabled = false,
  error = null,
  className = '',
}) {
  const [captchaData, setCaptchaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [solution, setSolution] = useState('');
  const [fetchError, setFetchError] = useState(null);

  const fetchChallenge = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    setSolution('');
    try {
      const data = await authService.getCaptcha();
      setCaptchaData(data);
      if (onChange) {
        onChange({ captcha_id: data?.captcha_id, captcha_solution: '' });
      }
    } catch (err) {
      setFetchError('Unable to load security verification. Click retry.');
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  useEffect(() => {
    fetchChallenge();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSolutionChange = (e) => {
    const val = e.target.value.trim();
    setSolution(val);
    if (onChange && captchaData?.captcha_id) {
      onChange({ captcha_id: captchaData.captcha_id, captcha_solution: val });
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor="captcha-input"
          className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
        >
          Security Verification *
        </label>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">Solve the arithmetic challenge</span>
      </div>

      <div className="flex items-center gap-2">
        {/* SVG Challenge Container */}
        <div className="h-10 border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 w-40">
          {loading ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Loader2 size={14} className="animate-spin text-[#004B87] dark:text-blue-400" />
              <span>Loading...</span>
            </div>
          ) : fetchError ? (
            <button
              type="button"
              onClick={fetchChallenge}
              className="text-[11px] text-rose-600 hover:underline"
            >
              Retry
            </button>
          ) : captchaData?.captcha_svg ? (
            <img
              src={captchaData.captcha_svg}
              alt="Security challenge calculation"
              className="w-full h-full object-contain select-none"
            />
          ) : (
            <span className="text-xs text-slate-500">Challenge ready</span>
          )}
        </div>

        {/* Refresh Challenge Button */}
        <button
          type="button"
          onClick={fetchChallenge}
          disabled={loading || disabled}
          title="Refresh challenge"
          className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer shrink-0"
          aria-label="Generate new security challenge"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>

        {/* Answer Input */}
        <div className="relative flex-1 min-w-[80px]">
          <input
            id="captcha-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            disabled={disabled || loading}
            placeholder="Result"
            value={solution}
            onChange={handleSolutionChange}
            className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-[#004B87] dark:focus:ring-blue-500 focus:border-[#004B87] dark:focus:border-blue-500 transition placeholder:text-slate-400"
          />
        </div>
      </div>

      {error && (
        <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

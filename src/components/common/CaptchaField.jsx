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
          className="block text-xs font-semibold text-[#24341E] dark:text-[#E5EBE7]"
        >
          Security Verification *
        </label>
        <span className="text-[11px] text-[#7F8781]">Solve the arithmetic challenge</span>
      </div>

      <div className="flex items-center gap-2">
        {/* SVG Challenge Container */}
        <div className="h-10 border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl overflow-hidden bg-[#F2F5F0] dark:bg-[#121B16] flex items-center justify-center shrink-0 w-40">
          {loading ? (
            <div className="flex items-center gap-1.5 text-xs text-[#7F8781]">
              <Loader2 size={14} className="animate-spin text-[#33462C] dark:text-[#8FD4AE]" />
              <span>Loading...</span>
            </div>
          ) : fetchError ? (
            <button
              type="button"
              onClick={fetchChallenge}
              className="text-[11px] text-[#991B1B] hover:underline"
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
            <span className="text-xs text-[#7F8781]">Challenge ready</span>
          )}
        </div>

        {/* Refresh Challenge Button */}
        <button
          type="button"
          onClick={fetchChallenge}
          disabled={loading || disabled}
          title="Refresh challenge"
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-[#DFE6DC] dark:border-[#2C3E32] text-[#33462C] dark:text-[#8FD4AE] hover:bg-[#F2F5F0] dark:hover:bg-[#1E2E25] transition disabled:opacity-50 cursor-pointer shrink-0"
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
            className="w-full h-10 px-3 bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl text-xs font-semibold text-[#0B0E0A] dark:text-[#E8EFEA] text-center focus:bg-white dark:focus:bg-[#16211B] focus:border-[#33462C] dark:focus:border-[#8FD4AE] transition placeholder:text-[#8A928C]"
          />
        </div>
      </div>

      {error && (
        <p className="text-[11px] text-[#991B1B] dark:text-[#F87171] mt-1 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

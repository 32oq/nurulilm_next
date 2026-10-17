'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Lock } from 'lucide-react';

export default function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasConsented = localStorage.getItem('nurulilm_cookie_consent');
    if (!hasConsented) {
      setDismissed(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('nurulilm_cookie_consent', new Date().toISOString());
    setDismissed(true);
  };

  if (!mounted || dismissed) return null;

  return (
    <aside
      aria-label="Institutional Data & Session Consent"
      className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-700/80 text-white shadow-2xl animate-in fade-in slide-in-from-bottom duration-300"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-8 h-8 rounded-lg bg-[#004B87]/30 border border-[#004B87] flex items-center justify-center shrink-0 mt-0.5 text-blue-300">
            <Lock size={16} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Data Privacy & Session Storage Notice
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 font-mono">
                DPDP Compliant
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Nurul-Ilm Library uses an encrypted, HTTP-only authentication token (<code className="text-blue-300 font-mono text-[11px]">rtkn</code>) to preserve your verified study session across shifts, and minimal local device storage for theme preferences. We strictly do not utilize commercial advertising trackers or monetize patron reading records.
            </p>

            {showDetails && (
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5 animate-in fade-in duration-200">
                <p>
                  <strong className="text-slate-200">Essential Session Token:</strong> Required for secure patron desk reservations, KYC identity verification, and fee ledger audit trails under Indian Digital Personal Data Protection (DPDP) standards.
                </p>
                <p>
                  <strong className="text-slate-200">Local Device Cache:</strong> Stores interface theme mode, desk preference, and daily study streak continuity offline on your current browser.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition flex items-center gap-1 cursor-pointer"
          >
            <span>{showDetails ? 'Hide' : 'Details'}</span>
            {showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="px-4 py-1.5 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold transition cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <ShieldCheck size={14} />
            <span>Acknowledge & Continue</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

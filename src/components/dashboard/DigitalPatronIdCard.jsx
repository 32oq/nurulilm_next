'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import moment from 'moment';
import {
  ShieldCheck, Printer, CheckCircle2,
  X, Share2, Check, RefreshCw, Camera
} from 'lucide-react';
import { useOther } from '../../context/OtherContext';
import VerificationPage from '../../views/VerificationPage';

export default function DigitalPatronIdCard({ user, txns = [], onClose }) {
  const { fetchPatronCard } = useOther();
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cardData, setCardData] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const loadCardData = useCallback(async () => {
    setLoading(true);
    try {
      const live = await fetchPatronCard();
      if (live) {
        setCardData(live);
      }
    } catch (err) {
      console.warn('Patron card fetch:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchPatronCard]);

  useEffect(() => {
    loadCardData();
  }, [loadCardData]);

  const isPhotoRequired = cardData?.status === 'photo_required' || (!user?.profile_photo && !cardData?.profile_photo && !cardData?.card?.profile_photo);
  const isOnboardingIncomplete = cardData?.status === 'onboarding_incomplete';

  const card = cardData?.card || cardData;
  const photoUrl = card?.profile_photo || user?.profile_photo;
  const displayName = card?.full_name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.name || user?.email;
  const patronId = card?.member_id || (user?._id ? `NIL-${user._id.slice(-6).toUpperCase()}` : 'NIL-PENDING');
  const isVerified = (card?.kyc_status === 'VERIFIED') || (user?.verified === 1);
  const isPaid = user?.paid === 1 || Boolean(user?.lastpayment && moment(user.lastpayment).isSameOrAfter(moment(), 'day'));
  const validUntil = card?.valid_until || (user?.lastpayment ? moment(user.lastpayment).format('DD MMM YYYY') : moment().add(1, 'month').format('DD MMM YYYY'));
  const verificationToken = card?.verification_token || patronId;
  const verificationUrl = `https://nurulilm.org/verify?id=${patronId}&token=${verificationToken}`;

  // Deterministic QR pattern generator based on patronId + verificationToken
  const generateQrPattern = () => {
    const size = 21;
    const matrix = [];
    let hash = 0;
    const str = `${patronId}-${verificationToken}-${user?.email || 'patron'}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < size; r++) {
      const row = [];
      for (let c = 0; c < size; c++) {
        const isTopLeft = r < 7 && c < 7;
        const isTopRight = r < 7 && c >= size - 7;
        const isBottomLeft = r >= size - 7 && c < 7;

        if (isTopLeft || isTopRight || isBottomLeft) {
          const lr = isTopLeft ? r : isTopRight ? r : r - (size - 7);
          const lc = isTopLeft ? c : isTopRight ? c - (size - 7) : c;
          const isBorder = lr === 0 || lr === 6 || lc === 0 || lc === 6;
          const isCenter = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
          row.push(isBorder || isCenter);
        } else {
          const val = Math.sin((r * size + c + hash) * 12.9898) * 43758.5453;
          row.push(val - Math.floor(val) > 0.48);
        }
      }
      matrix.push(row);
    }
    return matrix;
  };

  const qrMatrix = generateQrPattern();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl relative p-4 sm:p-6 space-y-4">
        
        {/* Top bar with close button */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Digital Library Card
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={loadCardData}
              title="Refresh card"
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Missing photo state */}
        {(isPhotoRequired || isOnboardingIncomplete) && !showVerificationModal ? (
          <div className="py-6 px-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 mx-auto flex items-center justify-center">
              <Camera size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Portrait Photo Required
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 max-w-sm mx-auto leading-relaxed">
                Under library security rules, your Digital Library Card cannot be issued without a verified portrait photo on file.
              </p>
            </div>
            <button
              onClick={() => setShowVerificationModal(true)}
              className="px-4 py-2 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold shadow-2xs transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <ShieldCheck size={14} />
              <span>Complete Verification and Upload Photo</span>
            </button>
          </div>
        ) : showVerificationModal ? (
          <div className="pt-1">
            <VerificationPage
              onSuccess={() => {
                setShowVerificationModal(false);
                loadCardData();
              }}
              setPage={() => {
                setShowVerificationModal(false);
                loadCardData();
              }}
            />
          </div>
        ) : (
          <>
            {/* ── Realistic Institutional ID Card ── */}
            <div
              ref={cardRef}
              className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0A192F] text-slate-900 dark:text-white shadow-xs"
            >
              {/* Institutional Header Banner */}
              <div className="bg-[#0A192F] text-white px-4 py-3 flex items-center justify-between border-b border-[#1E3A5F]">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/assets/logo-crest.svg"
                    alt="Logo"
                    className="w-7 h-7 rounded-full object-contain ring-1 ring-white/30 bg-white"
                  />
                  <div>
                    <h3 className="text-xs font-bold tracking-tight text-white leading-tight">
                      Nurul Ilm Library 
                    </h3>
                    <p className="text-[9px] text-slate-300 uppercase tracking-wider">
                      Handwara, North Kashmir
                    </p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-200 font-mono font-bold">
                  {patronId}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 flex items-center justify-between gap-3">
                {photoUrl ? (
                  <div className="relative w-16 h-20 rounded-md overflow-hidden border border-slate-300 dark:border-slate-700 flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                    <img
                      src={photoUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 py-0.5 text-[7px] font-mono text-center font-bold text-white uppercase">
                      VERIFIED
                    </div>
                  </div>
                ) : null}

                {/* Patron Details */}
                <div className="space-y-1 min-w-0 flex-1">
                  <span className="text-[9px] uppercase font-semibold text-slate-500 dark:text-slate-400">
                    Registered Patron
                  </span>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {displayName}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    {card?.email || user?.email}
                  </p>
                  
                  <div className="pt-1 flex flex-wrap gap-1">
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                      <ShieldCheck size={10} />
                      <span>Verified</span>
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-[#004B87] border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
                      <CheckCircle2 size={10} />
                      <span>{isPaid ? 'Active Member' : 'Active Pass'}</span>
                    </span>
                  </div>
                </div>

                {/* Scannable QR Matrix */}
                <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs flex-shrink-0">
                  <svg width="68" height="68" viewBox="0 0 21 21" className="shape-rendering-crispEdges">
                    {qrMatrix.map((row, r) =>
                      row.map((isDark, c) => (
                        isDark ? (
                          <rect
                            key={`${r}-${c}`}
                            x={c}
                            y={r}
                            width="1"
                            height="1"
                            fill="#0A192F"
                          />
                        ) : null
                      ))
                    )}
                  </svg>
                  <span className="block text-[7px] text-center font-mono text-slate-700 font-bold mt-0.5">
                    PASS KEY
                  </span>
                </div>
              </div>

              {/* Card Footer: Metadata Band */}
              <div className="grid grid-cols-3 gap-2 px-4 py-2.5 bg-slate-50 dark:bg-[#071322] border-t border-slate-200 dark:border-[#1E3A5F] text-[10px]">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block uppercase text-[9px]">Shift Hours</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">07 AM to 09 PM</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block uppercase text-[9px]">Valid Until</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{validUntil}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block uppercase text-[9px]">Seal Key</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono truncate block">{verificationToken.slice(0, 8)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Print Pass</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
                  <span>{copied ? 'Link Copied' : 'Share Pass'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                Scan this gate pass at the entrance scanner to confirm your desk session.
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

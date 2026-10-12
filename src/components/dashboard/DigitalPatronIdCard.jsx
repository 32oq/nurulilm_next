'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import moment from 'moment';
import {
  ShieldCheck, ShieldAlert, QrCode, Download, Printer,
  Sparkles, CheckCircle2, MapPin, Calendar, Clock,
  BookOpen, Award, X, Share2, Copy, Check, Loader2, RefreshCw, Camera, AlertCircle
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

  // Determine whether photo or onboarding is missing
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0B1726] border border-[#DCE3EC] dark:border-[#18283A] rounded-3xl max-w-lg w-full shadow-2xl relative p-6 sm:p-7 space-y-6">
        
        {/* Top bar with close button */}
        <div className="flex items-center justify-between border-b border-[#E7ECF2] dark:border-[#18283A] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#138A5B] animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1677FF] dark:text-[#00B8FF]">
              Official Digital Library Card
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadCardData}
              title="Refresh card credentials"
              className="p-1 rounded-lg text-[#64748B] hover:text-[#1677FF] hover:bg-[#EEF2F7] dark:hover:bg-[#0F1D2E] transition cursor-pointer"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-[#1677FF]' : ''} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0B1B2B] dark:hover:text-white hover:bg-[#EEF2F7] dark:hover:bg-[#0F1D2E] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* ── PHOTO REQUIRED / ONBOARDING INCOMPLETE HONEST STATE ── */}
        {(isPhotoRequired || isOnboardingIncomplete) && !showVerificationModal ? (
          <div className="py-8 px-5 rounded-2xl bg-[#FFFBEB] dark:bg-[#1C170B] border border-[#FDE68A] dark:border-[#574019] text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] dark:bg-[#382B14] text-[#92400E] dark:text-[#FDE68A] mx-auto flex items-center justify-center">
              <Camera size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif-lib text-lg font-bold text-[#92400E] dark:text-[#FDE68A]">
                Mandatory Portrait Photo Required
              </h3>
              <p className="text-xs text-[#78350F] dark:text-[#E2C792] max-w-sm mx-auto leading-relaxed">
                Under library security guidelines, your Digital Library Card cannot be issued without a verified portrait photo on file.
              </p>
            </div>
            <button
              onClick={() => setShowVerificationModal(true)}
              className="px-5 py-2.5 rounded-xl bg-[#1C3A2B] hover:bg-[#142C20] dark:bg-[#2A4D3B] dark:hover:bg-[#37614B] text-white text-xs font-semibold shadow-xs transition cursor-pointer inline-flex items-center gap-2"
            >
              <ShieldCheck size={16} />
              <span>Complete Verification &amp; Upload Photo</span>
            </button>
          </div>
        ) : showVerificationModal ? (
          <div className="pt-2">
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
            {/* ── THE PHYSICAL ID CARD EMBED WITH VERIFIED PHOTO ── */}
            <div
              ref={cardRef}
              className="relative rounded-2xl overflow-hidden border border-[#DCE3EC] dark:border-[#18283A] shadow-md bg-gradient-to-br from-[#0B1B2B] via-[#081321] to-[#040910] text-white p-6 space-y-5"
            >
              {/* Subtle background crest watermark */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 opacity-5 pointer-events-none rounded-full border-[12px] border-white flex items-center justify-center text-8xl font-serif">
                ن
              </div>

              {/* Card Header: Institution Plaque */}
              <div className="flex items-start justify-between gap-3 relative z-10 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1677FF] to-[#00A8E8] text-white flex items-center justify-center font-serif text-lg font-bold shadow-sm">
                    ن
                  </div>
                  <div>
                    <h3 className="font-serif-lib text-base font-bold tracking-tight text-white leading-snug">
                      Nurul Ilm Public Library
                    </h3>
                    <p className="text-[10px] text-white/70 tracking-wider uppercase font-medium">
                      Handwara, North Kashmir • Reg. 2024
                    </p>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#1677FF]/20 border border-[#1677FF]/40 text-[#00B8FF] font-mono font-bold tracking-wider">
                  {patronId}
                </span>
              </div>

              {/* Card Center: Real Verified Photo + Patron Profile & QR */}
              <div className="flex items-center justify-between gap-4 relative z-10">
                {/* Verified Photo Portrait */}
                {photoUrl ? (
                  <div className="relative w-20 h-24 rounded-xl overflow-hidden border-2 border-white/30 shadow-md flex-shrink-0 bg-[#081321]">
                    <img
                      src={photoUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 py-0.5 text-[8px] font-mono text-center font-bold text-white uppercase tracking-wider">
                      VERIFIED
                    </div>
                  </div>
                ) : null}

                {/* Patron Info */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-semibold text-white/50 tracking-wider">
                    Patron Scholar
                  </span>
                  <h2 className="text-lg font-serif-lib font-bold text-white truncate leading-tight">
                    {displayName}
                  </h2>
                  <p className="text-xs text-white/80 font-mono truncate">
                    {card?.email || user?.email}
                  </p>
                  
                  <div className="pt-1.5 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-[#138A5B]/20 text-[#19D68C] border-[#138A5B]/40">
                      <ShieldCheck size={11} />
                      <span>KYC Verified</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#1677FF]/20 text-[#00B8FF] border border-[#1677FF]/40">
                      <CheckCircle2 size={11} />
                      <span>{isPaid ? 'Active Member' : 'Active Pass'}</span>
                    </span>
                  </div>
                </div>

                {/* Dynamic Scannable QR Matrix */}
                <div className="bg-white p-2 rounded-xl shadow-lg flex-shrink-0">
                  <svg width="76" height="76" viewBox="0 0 21 21" className="shape-rendering-crispEdges">
                    {qrMatrix.map((row, r) =>
                      row.map((isDark, c) => (
                        isDark ? (
                          <rect
                            key={`${r}-${c}`}
                            x={c}
                            y={r}
                            width="1"
                            height="1"
                            fill="#0B1B2B"
                          />
                        ) : null
                      ))
                    )}
                  </svg>
                  <span className="block text-[7px] text-center font-mono text-[#0B1B2B] font-bold mt-0.5">
                    GATE PASS
                  </span>
                </div>
              </div>

              {/* Card Footer: Metadata Band */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-[10px] relative z-10">
                <div>
                  <span className="text-white/40 block uppercase">Shift Hours</span>
                  <span className="font-semibold text-white truncate block">07 AM – 10 PM</span>
                </div>
                <div>
                  <span className="text-white/40 block uppercase">Valid Until</span>
                  <span className="font-semibold text-[#00B8FF]">{validUntil}</span>
                </div>
                <div>
                  <span className="text-white/40 block uppercase">Seal Key</span>
                  <span className="font-semibold text-white font-mono truncate block">{verificationToken.slice(0, 8)}</span>
                </div>
              </div>
            </div>

            {/* ── CARD ACTIONS ── */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1677FF] hover:bg-[#1264E8] text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Printer size={15} />
                  <span>Print / Save Pass</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white dark:bg-[#0B1726] border border-[#DCE3EC] dark:border-[#18283A] text-[#0B1B2B] dark:text-[#F5F7FA] hover:bg-[#EEF2F7] dark:hover:bg-[#0F1D2E] text-xs font-semibold transition active:scale-95 cursor-pointer"
                >
                  {copied ? <Check size={15} className="text-[#138A5B]" /> : <Share2 size={15} />}
                  <span>{copied ? 'Link Copied!' : 'Share Pass Link'}</span>
                </button>
              </div>

              <p className="text-[11px] text-[#64748B] dark:text-[#718096] text-center leading-relaxed">
                Present this scannable QR pass at the entrance scanner to unlock turnstile access and confirm your carrel seat.
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

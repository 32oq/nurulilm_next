"use client";

import { useState } from 'react';
import { ArrowRight, Check, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import * as lucide from 'lucide-react';
import { useOther } from '../context/OtherContext';

const PackageCard = ({ data, redirect }) => {
  const { state: { libraryTimings } } = useOther();
  const {
    _id,
    name,
    icon,
    tagline,
    recurring_payment,
    description,
    isPopular,
    saving,
    registration_fee,
    initial_payment,
    term_months,
    timing,
  } = data;

  const timings = libraryTimings?.data || libraryTimings;
  const fullDaySchedule = timings?.open_time && timings?.close_time
    ? `Full Day (${timings.open_time} – ${timings.close_time})`
    : 'Full Day (07:00 AM – 09:00 PM)';
  const displayTiming = (!timing || timing === 'Full Day' || (typeof timing === 'string' && timing.includes('6:00 AM – 11:00 PM')))
    ? fullDaySchedule
    : timing;

  const Icon = lucide[icon] || ArrowRight;
  const [isLocking, setIsLocking] = useState(false);

  return (
    <div
      className={`bg-white dark:bg-[#111827] rounded-xl p-6 transition-all duration-300 flex flex-col h-full relative ${
        isLocking
          ? 'border-2 border-[#004B87] dark:border-blue-500 ring-4 ring-[#004B87]/25 dark:ring-blue-500/30 scale-[1.02] shadow-md z-10'
          : isPopular
          ? 'border-2 border-[#004B87] dark:border-blue-500 shadow-sm'
          : 'border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Recommended Tag */}
      {isPopular && (
        <div className="absolute -top-3 right-6 px-3 py-0.5 bg-[#004B87] dark:bg-blue-600 text-white font-semibold text-[11px] rounded shadow-2xs">
          Recommended Plan
        </div>
      )}

      {/* Header & Icon */}
      <div className="flex items-start gap-3.5 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004B87] dark:text-blue-400 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5" strokeWidth={1.8} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
            {name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{tagline}</p>
        </div>
      </div>

      {/* Fee Breakdown */}
      <div className="my-2 pb-3.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ₹{recurring_payment}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            / {term_months && term_months > 1 ? `${term_months} months` : 'month'}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {registration_fee > 0 ? (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              + ₹{registration_fee} one-time registration
            </span>
          ) : (
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              Zero registration fee
            </span>
          )}

          {saving > 0 && (
            <span className="text-[11px] font-semibold text-[#004B87] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
              Save ₹{saving}
            </span>
          )}
        </div>
      </div>

      {/* Reading Room Access Timing */}
      <div className="flex items-center gap-1.5 text-xs text-[#004B87] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 px-2.5 py-1 rounded-md mb-3 font-medium">
        <Clock size={12} className="flex-shrink-0" />
        <span>{displayTiming}</span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
        {description}
      </p>

      {/* Included checklist */}
      <div className="space-y-2 mb-6 text-xs text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Check size={13} className="text-[#004B87] dark:text-blue-400 flex-shrink-0" />
          <span>Full access to quiet study carrels and desk lighting</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={13} className="text-[#004B87] dark:text-blue-400 flex-shrink-0" />
          <span>Generator power backup and high-speed Wi-Fi</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={13} className="text-[#004B87] dark:text-blue-400 flex-shrink-0" />
          <span>Winter heating and air ventilation</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={13} className="text-[#004B87] dark:text-blue-400 flex-shrink-0" />
          <span>Access to physical library stacks and reference collection</span>
        </div>
      </div>

      {/* Enroll Button */}
      <button
        disabled={isLocking}
        className={`w-full mt-auto py-2.5 px-4 text-white font-semibold text-xs rounded-lg transition-all duration-200 flex justify-center items-center gap-1.5 shadow-2xs cursor-pointer ${
          isLocking
            ? 'bg-[#004B87] dark:bg-blue-600 ring-2 ring-[#004B87]/30 scale-[0.99]'
            : 'bg-[#004B87] hover:bg-[#003865] dark:bg-blue-600 dark:hover:bg-blue-700'
        }`}
        onClick={() => {
          if (isLocking) return;
          setIsLocking(true);
          setTimeout(() => {
            if (redirect) {
              redirect('checkout', {
                id: _id,
                name,
                tagline,
                recurring_payment,
                description,
                registration_fee: registration_fee,
                initial_payment: initial_payment,
                term_months: term_months || 1,
                timing: displayTiming,
              });
            }
          }, 450);
        }}
      >
        {isLocking ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Locking {name}…</span>
          </>
        ) : (
          <>
            <span>Enroll in {name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </div>
  );
};

export default PackageCard;

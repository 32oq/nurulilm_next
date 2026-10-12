"use client";

import { ArrowRight, Check, Clock } from 'lucide-react';
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

  const fullDaySchedule = libraryTimings?.open_time && libraryTimings?.close_time
    ? `Full Day (${libraryTimings.open_time} – ${libraryTimings.close_time})`
    : 'Full Day (07:00 AM – 09:00 PM)';
  const displayTiming = (!timing || timing === 'Full Day' || (typeof timing === 'string' && timing.includes('6:00 AM – 11:00 PM')))
    ? fullDaySchedule
    : timing;

  const Icon = lucide[icon] || ArrowRight;

  return (
    <div
      className={`bg-white dark:bg-[#142019] rounded-2xl p-7 transition-all duration-200 flex flex-col h-full relative ${
        isPopular
          ? 'border-2 border-[#1C3A2B] dark:border-[#387352] shadow-md'
          : 'border border-[#DFE6DC] dark:border-[#22352B] shadow-xs hover:border-[#1C3A2B]/40 hover:shadow-md'
      }`}
    >
      {/* Recommended Tag */}
      {isPopular && (
        <div className="absolute -top-3.5 right-6 px-3.5 py-1 bg-[#1C3A2B] dark:bg-[#346F4F] text-white font-semibold text-xs rounded-md shadow-sm">
          Recommended Plan
        </div>
      )}

      {/* Header & Icon */}
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-xl bg-[#EDF3EE] dark:bg-[#1A2E23] text-[#1C3A2B] dark:text-[#8FD4AE] flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6" strokeWidth={1.8} />
        </div>
        <div>
          <h3 className="font-serif-lib text-2xl font-bold text-[#1C2E24] dark:text-[#8FD4AE] leading-tight">
            {name}
          </h3>
          <p className="text-xs text-[#5D6B62] dark:text-[#9EAEA3] font-medium mt-0.5">{tagline}</p>
        </div>
      </div>

      {/* Fee Breakdown */}
      <div className="my-3 pb-4 border-b border-[#DFE6DC] dark:border-[#22352B]">
        <div className="flex items-baseline gap-1.5">
          <span className="font-serif-lib text-3xl font-bold text-[#1C2E24] dark:text-[#F1F6F3]">
            ₹{recurring_payment}
          </span>
          <span className="text-xs text-[#5D6B62] dark:text-[#9EAEA3]">
            / {term_months && term_months > 1 ? `${term_months} months` : 'month'}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {registration_fee > 0 ? (
            <span className="text-[11px] text-[#5D6B62] dark:text-[#9EAEA3]">
              + ₹{registration_fee} one-time registration
            </span>
          ) : (
            <span className="text-[11px] text-[#1C3A2B] dark:text-[#72BE94] font-medium">
              Zero registration fee
            </span>
          )}

          {saving > 0 && (
            <span className="text-[11px] font-semibold text-[#1C3A2B] bg-[#EDF3EE] dark:bg-[#1A2E23] px-2 py-0.5 rounded-md">
              Save ₹{saving}
            </span>
          )}
        </div>
      </div>

      {/* Reading Room Access Timing */}
      <div className="flex items-center gap-1.5 text-xs text-[#1C2E24] dark:text-[#8FD4AE] bg-[#EDF3EE] dark:bg-[#1A2E23] border border-[#DFE6DC] dark:border-[#263D30] px-3 py-1.5 rounded-xl mb-3 font-semibold">
        <Clock size={13} className="text-[#1C3A2B] dark:text-[#8FD4AE] flex-shrink-0" />
        <span>{displayTiming}</span>
      </div>

      {/* Description */}
      <p className="text-xs text-[#2D3A31] dark:text-[#9FB1A6] leading-relaxed mb-5">
        {description}
      </p>

      {/* Included checklist */}
      <div className="space-y-2 mb-8 text-xs text-[#2D3A31] dark:text-[#D5E3DB]">
        <div className="flex items-center gap-2">
          <Check size={14} className="text-[#1C3A2B] dark:text-[#8FD4AE] flex-shrink-0" />
          <span>Full access to quiet study carrels &amp; lighting</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={14} className="text-[#1C3A2B] dark:text-[#8FD4AE] flex-shrink-0" />
          <span>24/7 Power backup &amp; high-speed Wi-Fi</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={14} className="text-[#1C3A2B] dark:text-[#8FD4AE] flex-shrink-0" />
          <span>Winter heating &amp; ventilation included</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={14} className="text-[#1C3A2B] dark:text-[#8FD4AE] flex-shrink-0" />
          <span>Access to physical library stacks &amp; reference catalog</span>
        </div>
      </div>

      {/* Enroll Button */}
      <button
        className="w-full mt-auto py-3 px-5 bg-[#1C3A2B] hover:bg-[#142B20] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white font-semibold text-xs rounded-xl transition-all flex justify-center items-center gap-2 shadow-xs hover:shadow-sm active:scale-95 cursor-pointer"
        onClick={() => {
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
        }}
      >
        <span>Enroll in {name}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PackageCard;

"use client";

import { ShieldAlert, ArrowRight } from "lucide-react";

const PolicePendingBanner = ({ status = "not_verified", setPage, setAddParams }) => {
  if (status !== "pending") return null;

  return (
    <div className="fixed top-20 left-0 right-0 w-full bg-[#FFFBEB] dark:bg-[#2E2108] text-[#92400E] dark:text-[#FDE68A] border-b border-[#FDE68A] dark:border-[#5C4312] z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-medium">
          <ShieldAlert className="h-4 w-4 text-[#D97706] flex-shrink-0" />
          <span>
            Identity verification is pending. Please submit your Aadhaar records to complete membership onboarding.
          </span>
        </div>

        <button
          onClick={() => {
            if (setPage) setPage('dashboard');
            if (setAddParams) setAddParams({ navTo: "Settings" });
          }}
          className="inline-flex items-center gap-1.5 bg-[#92400E] dark:bg-[#D97706] text-white px-3 py-1 rounded-md font-semibold hover:bg-[#78350F] transition cursor-pointer"
        >
          <span>Complete Verification</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default PolicePendingBanner;

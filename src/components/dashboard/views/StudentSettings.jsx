'use client';

import { useState } from "react";
import { ShieldCheck, ShieldAlert, ChevronDown, Lock } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import VerificationPage from "../../../views/VerificationPage";
import ForgotPasswordPage from "../../../views/ForgotPasswordPage";

export default function StudentSettings() {
  const { state: { user } } = useAuth();
  const [pwOpen, setPwOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-xl w-full">
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093]">
          Account Security &amp; Records
        </span>
        <h2 className="font-serif-lib text-2xl font-bold text-[#1C3A2B] dark:text-[#FAF8F5] mt-0.5">
          Patron Settings
        </h2>
        <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] mt-1">
          Manage your Aadhaar identity records and security credentials.
        </p>
      </div>

      {/* Verification status card */}
      {user?.verified && user?.profile_photo ? (
        <div className="flex items-center gap-4 bg-white dark:bg-[#16211B] border border-[#D9E2DC] dark:border-[#26362D] rounded-2xl p-5 shadow-xs">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#1C3A2B] dark:border-[#8FD4AE] flex-shrink-0 bg-[#EDF3EE] dark:bg-[#203126]">
            <img
              src={user.profile_photo}
              alt={user.full_name || "Verified Patron"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-[#1C3A2B] dark:text-[#8FD4AE]">
                Identity &amp; Photo Verified
              </span>
              <ShieldCheck size={14} className="text-[#138A5B] dark:text-[#19D68C]" />
            </div>
            <p className="text-xs font-bold text-[#1C1E1B] dark:text-white mt-0.5 truncate">
              {user?.full_name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email}
            </p>
            <p className="text-[11px] text-[#5D645E] dark:text-[#9FB1A6] mt-0.5">
              Aadhaar &amp; portrait verified. Digital Library Card active.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#FDE68A] dark:border-[#574019] bg-white dark:bg-[#16211B] overflow-hidden shadow-xs">
          <div className="flex items-center gap-2.5 bg-[#FFFBEB] dark:bg-[#382B14] px-5 py-3 border-b border-[#FDE68A] dark:border-[#574019]">
            <ShieldAlert size={16} className="text-[#92400E] dark:text-[#FDE68A]" />
            <p className="text-xs font-semibold text-[#92400E] dark:text-[#FDE68A]">
              Statutory Verification &amp; Photo Required
            </p>
          </div>
          <div className="p-5">
            <VerificationPage setPage={() => {}} />
          </div>
        </div>
      )}

      {/* Change password accordion */}
      <div className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl overflow-hidden shadow-xs">
        <button
          onClick={() => setPwOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAF8F5] dark:hover:bg-[#1E2E25] transition text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-[#6D8374] dark:text-[#8CA093]" />
            <span>Update Account Password</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-[#7F8781] transition-transform duration-200 ${pwOpen ? "rotate-180" : ""}`}
          />
        </button>
        {pwOpen && (
          <div className="border-t border-[#EFEBE4] dark:border-[#26362D] p-5 bg-[#FAF8F5] dark:bg-[#111A14]">
            <ForgotPasswordPage call_src="dashboard" />
          </div>
        )}
      </div>
    </div>
  );
}

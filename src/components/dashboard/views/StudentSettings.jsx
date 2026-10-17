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
        <h2 className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white">
          Account Settings
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Manage your student verification records and account credentials.
        </p>
      </div>

      {/* Verification status card */}
      {user?.verified && user?.profile_photo ? (
        <div className="flex items-center gap-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 flex-shrink-0 bg-slate-100 dark:bg-slate-800">
            <img
              src={user.profile_photo}
              alt={user.full_name || "Verified Patron"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-emerald-700 dark:text-emerald-400">
                Identity &amp; Photo Verified
              </span>
              <ShieldCheck size={14} className="text-emerald-600" />
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {user?.full_name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Digital Library Card is active with confirmed identity.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-300 dark:border-amber-900/60 bg-white dark:bg-[#111827] overflow-hidden shadow-xs">
          <div className="flex items-center gap-2.5 bg-amber-50 dark:bg-amber-950/40 px-5 py-3 border-b border-amber-200 dark:border-amber-900/50">
            <ShieldAlert size={16} className="text-amber-800 dark:text-amber-300" />
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
              Identity Verification &amp; Photo Required
            </p>
          </div>
          <div className="p-5">
            <VerificationPage setPage={() => {}} />
          </div>
        </div>
      )}

      {/* Change password accordion */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <button
          onClick={() => setPwOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-slate-400" />
            <span>Update Account Password</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${pwOpen ? "rotate-180" : ""}`}
          />
        </button>
        {pwOpen && (
          <div className="border-t border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-900">
            <ForgotPasswordPage call_src="dashboard" />
          </div>
        )}
      </div>
    </div>
  );
}

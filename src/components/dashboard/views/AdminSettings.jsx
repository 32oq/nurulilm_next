'use client';

import { useState } from "react";
import { ChevronDown, Lock } from "lucide-react";
import ForgotPasswordPage from "../../../views/ForgotPasswordPage";

export default function AdminSettings() {
  const [pwOpen, setPwOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-xl w-full">
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093]">
          Administration Credentials
        </span>
        <h2 className="font-serif-lib text-2xl font-bold text-[#1C3A2B] dark:text-[#FAF8F5] mt-0.5">
          Admin Settings
        </h2>
        <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] mt-1">
          Manage administrator security credentials and access permissions.
        </p>
      </div>

      <div className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl overflow-hidden shadow-xs">
        <button
          onClick={() => setPwOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAF8F5] dark:hover:bg-[#1E2E25] transition text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-[#6D8374] dark:text-[#8CA093]" />
            <span>Change Administrator Password</span>
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

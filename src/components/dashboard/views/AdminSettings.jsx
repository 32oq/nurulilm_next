'use client';

import { useState } from "react";
import { ChevronDown, Lock } from "lucide-react";
import ForgotPasswordPage from "../../../views/ForgotPasswordPage";

export default function AdminSettings() {
  const [pwOpen, setPwOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-xl w-full">
      <div>
        <h2 className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white">
          Admin Settings
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Manage administrator security credentials and access permissions.
        </p>
      </div>

      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <button
          onClick={() => setPwOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-slate-400" />
            <span>Change Administrator Password</span>
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

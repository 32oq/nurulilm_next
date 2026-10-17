"use client";

import { X, Calendar, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import moment from "moment";

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

export default function PayMonthsModal({ onClose, onPay, joiningDate }) {
  const [selected, setSelected] = useState([]);
  const [txnId, setTxnId] = useState("");
  const FEE = 1200;

  const joiningMonthIndex = moment(joiningDate).month();

  const toggle = (m, index) => {
    if (index < joiningMonthIndex) return;
    setSelected(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  };

  const handlePay = () => {
    const year = moment(joiningDate).year();

    const monthDetails = selected.map(m => {
      const monthIndex = MONTHS.indexOf(m);
      return {
        month: m,
        fromDate: moment().year(year).month(monthIndex).startOf("month").format("YYYY-MM-DD"),
        toDate: moment().year(year).month(monthIndex).endOf("month").format("YYYY-MM-DD"),
      };
    });

    onPay({
      months: monthDetails,
      amount: selected.length * FEE,
      txnId: txnId.trim(),
    });
  };

  const isValid = selected.length > 0 && txnId.trim().length > 3;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-xl space-y-4 text-slate-800 dark:text-slate-200">

        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Fee Collection
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar size={16} className="text-[#004B87] dark:text-blue-400" />
              <span>Pay Monthly Study Dues</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Month Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
            Select Months to Pay (₹{FEE} / month)
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
            {MONTHS.map((m, index) => {
              const disabled = index < joiningMonthIndex;
              const active = selected.includes(m);

              return (
                <button
                  key={m}
                  disabled={disabled}
                  onClick={() => toggle(m, index)}
                  className={`py-1.5 px-1 rounded-md text-xs font-semibold border transition text-center cursor-pointer ${
                    disabled
                      ? "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed opacity-60"
                      : active
                      ? "bg-[#004B87] border-[#004B87] text-white shadow-2xs"
                      : "bg-white dark:bg-[#111827] border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#004B87]"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* QR Code and Payee Info */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg p-3.5 flex flex-col sm:flex-row items-center gap-3.5">
          <div className="bg-white p-1.5 rounded-md border border-slate-200 flex-shrink-0">
            <img
              src="/assets/paymentqr.jpeg"
              alt="Official Library QR"
              className="w-20 h-20 object-contain"
            />
          </div>
          <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
            <p className="font-semibold text-slate-900 dark:text-slate-100">Scan to Pay via UPI</p>
            <p className="text-[11px]">Payee: <strong>OWAIS RAFIQ</strong> (Library Accounts)</p>
            <p className="text-[11px] text-slate-500">
              Scan using any UPI app and transfer ₹{selected.length * FEE || FEE}.
            </p>
          </div>
        </div>

        {/* Transaction ID input */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
            UPI Transaction / Reference ID *
          </label>
          <input
            value={txnId}
            onChange={(e) => setTxnId(e.target.value)}
            placeholder="e.g. 430129482190"
            className="w-full bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-[#111827] focus:border-[#004B87] transition"
          />
        </div>

        {/* Total & Submit */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2.5">
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-slate-500">Selected Months ({selected.length})</span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              ₹{selected.length * FEE}
            </span>
          </div>

          <button
            disabled={!isValid}
            onClick={handlePay}
            className={`w-full py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition text-xs font-semibold shadow-2xs cursor-pointer ${
              isValid
                ? "bg-[#004B87] hover:bg-[#003865] text-white"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            }`}
          >
            <CheckCircle2 size={14} />
            <span>Submit Payment for Approval</span>
          </button>
        </div>

      </div>
    </div>
  );
}

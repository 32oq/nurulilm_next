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
    <div className="fixed inset-0 z-50 bg-[#1C1E1B]/60 dark:bg-black/70 flex items-center justify-center px-4 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#142019] border border-[#E5DFD5] dark:border-[#22352B] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-xl space-y-5 text-[#2D3A31] dark:text-[#E8F0EB]">

        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#EFEBE4] dark:border-[#263D30] pb-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#88B89C]">
              Fee Collection
            </span>
            <h3 className="font-serif-lib text-lg font-bold text-[#1C2E24] dark:text-[#8FD4AE] flex items-center gap-2">
              <Calendar size={18} className="text-[#1C3A2B] dark:text-[#8FD4AE]" /> Pay Monthly Study Dues
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#7F8781] hover:text-[#1C1E1B] dark:hover:text-white rounded-lg transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Month Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#1C2E24] dark:text-[#CAD6CF] mb-2">
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
                  className={`py-2 px-1 rounded-lg text-xs font-semibold border transition text-center cursor-pointer ${
                    disabled
                      ? "bg-[#FAF8F5] dark:bg-[#1A2620] border-[#E5DFD5] dark:border-[#24342B] text-[#A2AAA3] dark:text-[#64746A] cursor-not-allowed opacity-60"
                      : active
                      ? "bg-[#1C3A2B] dark:bg-[#346F4F] border-[#1C3A2B] dark:border-[#346F4F] text-white shadow-xs"
                      : "bg-white dark:bg-[#18261F] border-[#E5DFD5] dark:border-[#283E31] text-[#2D3A31] dark:text-[#CAD6CF] hover:border-[#1C3A2B] hover:bg-[#FAF8F5]"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* QR Code and Payee Info */}
        <div className="bg-[#FAF8F5] dark:bg-[#18261F] border border-[#E5DFD5] dark:border-[#263D30] rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-white p-2 rounded-lg border border-[#E5DFD5] flex-shrink-0">
            <img
              src="/assets/paymentqr.jpeg"
              alt="Official Library QR"
              className="w-24 h-24 object-contain"
            />
          </div>
          <div className="space-y-1 text-xs text-[#5D6B62] dark:text-[#A1B3A7]">
            <p className="font-semibold text-[#1C2E24] dark:text-[#E8F0EB]">Scan to Pay via UPI</p>
            <p className="text-[11px]">Payee: <strong>OWAIS RAFIQ</strong> (Library Accounts)</p>
            <p className="text-[11px] text-[#7F8781] dark:text-[#889C90]">
              Scan using Google Pay, PhonePe, or Paytm and transfer ₹{selected.length * FEE || FEE}.
            </p>
          </div>
        </div>

        {/* Transaction ID input */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[#1C2E24] dark:text-[#CAD6CF]">
            UPI Transaction / Reference ID *
          </label>
          <input
            value={txnId}
            onChange={(e) => setTxnId(e.target.value)}
            placeholder="e.g. 430129482190 or UPI-Ref-ID"
            className="w-full bg-[#FAF8F5] dark:bg-[#18261F] border border-[#D9D3C7] dark:border-[#2A3E32] rounded-lg px-3 py-2 text-xs text-[#1C2E24] dark:text-[#E8F0EB] placeholder-[#8A928C] focus:bg-white dark:focus:bg-[#1E2E25] focus:border-[#1C3A2B] focus:ring-1 focus:ring-[#1C3A2B] transition"
          />
        </div>

        {/* Total & Submit */}
        <div className="border-t border-[#EFEBE4] dark:border-[#263D30] pt-4 space-y-3">
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-[#5D6B62] dark:text-[#A1B3A7]">Selected Months ({selected.length})</span>
            <span className="font-serif-lib text-xl font-bold text-[#1C2E24] dark:text-[#8FD4AE]">
              ₹{selected.length * FEE}
            </span>
          </div>

          <button
            disabled={!isValid}
            onClick={handlePay}
            className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition text-xs font-semibold shadow-xs cursor-pointer ${
              isValid
                ? "bg-[#1C3A2B] hover:bg-[#142B20] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white"
                : "bg-[#E5DFD5] dark:bg-[#25352C] text-[#A2AAA3] dark:text-[#64746A] cursor-not-allowed"
            }`}
          >
            <CheckCircle2 size={15} />
            <span>Submit Payment for Approval</span>
          </button>
        </div>

      </div>
    </div>
  );
}

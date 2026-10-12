"use client";

import { useState, useEffect } from "react";
import moment from "moment";
import { CreditCard, PlusCircle, RefreshCw, Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useOther } from "../../../context/OtherContext";
import PayMonthsModal from "../PayMonthsModal";
import { LoadingRow, ErrorRow } from "../shared";

export default function StudentPayments() {
  const { state: { user }, patchUser } = useAuth();
  const { state: { txns, loading, error }, fetchTxns, checkout } = useOther();

  const txnsList = Array.isArray(txns) ? txns : (Array.isArray(txns?.allPayments) ? txns.allPayments : (Array.isArray(txns?.data) ? txns.data : []));

  const [showPay, setShowPay] = useState(false);

  useEffect(() => {
    fetchTxns();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePay = async (data) => {
    const fromdate = data?.months[0]?.fromDate;
    const todate   = data?.months[data?.months?.length - 1]?.toDate;
    await checkout({
      package: '',
      amount: data?.amount,
      type: "monthly",
      payment_type: "online",
      txn_id: data?.txnId,
      fromdate,
      todate,
      bifurcation: data?.months,
    });
    patchUser({ lastpayment: todate });
    await fetchTxns();
    setShowPay(false);
  };

  const formatPeriod = (item) => {
    const from = item?.fromdate || item?.from;
    const to = item?.todate || item?.to;
    if (!from && !to) return "Monthly Study Pass";

    const fromM = moment(from);
    const toM = moment(to);

    if (fromM.isValid() && toM.isValid()) {
      if (fromM.isSame(toM, 'month')) {
        return fromM.format("MMMM YYYY");
      }
      return `${fromM.format("DD MMM YYYY")} – ${toM.format("DD MMM YYYY")}`;
    }
    if (fromM.isValid()) return fromM.format("DD MMM YYYY");
    if (toM.isValid()) return toM.format("DD MMM YYYY");
    return `${from || ""} – ${to || ""}`;
  };

  const formatPaidVia = (type) => {
    if (!type) return "Online UPI";
    const s = String(type).trim().toLowerCase();
    if (s === "online" || s === "upi") return "UPI / QR";
    if (s === "cash") return "Cash at Desk";
    if (s === "bank" || s === "bank_transfer" || s === "neft" || s === "rtgs") return "Bank Transfer";
    if (s === "card") return "Debit / Credit Card";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getReferenceId = (item) => {
    return item?.txn_id || item?.ref || item?.transaction_id || "N/A";
  };

  const renderStatusBadge = (item) => {
    const isOk = item?.confirmation === 1 || item?.confirmation === true;
    const isRejected = item?.confirmation === 2;

    if (isOk) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#EDF3EE] text-[#1C3A2B] border border-[#D9E2DC] dark:bg-[#1A2E23] dark:text-[#8FD4AE] dark:border-[#263D30] whitespace-nowrap">
          <CheckCircle2 size={12} className="text-[#1C3A2B] dark:text-[#8FD4AE]" />
          <span>Confirmed on Ledger</span>
        </span>
      );
    }
    if (isRejected) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FAF0F0] text-[#B91C1C] border border-[#FEE2E2] dark:bg-[#2D1414] dark:text-[#FCA5A5] dark:border-[#5C2323] whitespace-nowrap">
          <XCircle size={12} className="text-[#B91C1C] dark:text-[#F87171]" />
          <span>Rejected / Review</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] dark:bg-[#2E2108] dark:text-[#FBBF24] dark:border-[#5C4312] whitespace-nowrap">
        <Clock size={12} className="text-[#D97706] dark:text-[#F59E0B]" />
        <span>Awaiting Coordinator Approval</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 w-full max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#88B89C]">
            Membership Ledger
          </span>
          <h2 className="font-serif-lib text-2xl font-bold text-[#1C2E24] dark:text-[#8FD4AE] mt-0.5">
            Membership Dues &amp; Payment History
          </h2>
          <p className="text-xs text-[#5D6B62] dark:text-[#9FB1A6] mt-1">
            Review your monthly reading pass receipts and ledger confirmations.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchTxns}
            disabled={loading}
            className="p-2.5 rounded-lg bg-white dark:bg-[#142019] border border-[#DFE6DC] dark:border-[#22352B] text-[#5D6B62] dark:text-[#A1B3A7] hover:text-[#1C2E24] dark:hover:text-white hover:bg-[#FAF8F5] transition disabled:opacity-50 shadow-xs cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowPay(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1C3A2B] hover:bg-[#142B20] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            <PlusCircle size={15} /> Pay Monthly Dues
          </button>
        </div>
      </div>

      {loading && <LoadingRow />}
      {error   && <ErrorRow message={error} />}

      {!loading && (
        <div className="bg-white dark:bg-[#142019] border border-[#DFE6DC] dark:border-[#22352B] rounded-2xl shadow-xs overflow-hidden">
          {!txnsList?.length ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-2 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] dark:bg-[#18261F] text-[#7F8781] dark:text-[#8FD4AE] flex items-center justify-center mb-1">
                <CreditCard size={24} />
              </div>
              <p className="font-serif-lib text-base font-bold text-[#1C2E24] dark:text-[#8FD4AE]">No payment records found</p>
              <p className="text-xs text-[#5D6B62] dark:text-[#9FB1A6] max-w-sm">
                You have not submitted any fee records yet. Use the button below to submit monthly dues.
              </p>
              <button
                onClick={() => setShowPay(true)}
                className="mt-3 px-4 py-2 bg-[#1C3A2B] hover:bg-[#142B20] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
              >
                Submit Monthly Pass Payment
              </button>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#EFEBE4] dark:border-[#22352B] bg-[#FAF8F5] dark:bg-[#18261F] text-[#6D8374] dark:text-[#88B89C] text-[11px] font-semibold uppercase tracking-wider">
                      <th className="px-5 py-3.5 text-left">Period Covered</th>
                      <th className="px-5 py-3.5 text-left">UPI / Bank Reference</th>
                      <th className="px-5 py-3.5 text-left">Payed Via</th>
                      <th className="px-5 py-3.5 text-left">Amount</th>
                      <th className="px-5 py-3.5 text-left">Ledger Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEBE4] dark:divide-[#22352B]">
                    {txnsList.map((item, i) => {
                      const period = formatPeriod(item);
                      const refId = getReferenceId(item);
                      const paidVia = formatPaidVia(item.payment_type || item.type);
                      const amount = item.amount ? `₹${item.amount}` : "-";
                      const dateSubmitted = item.cr_dt ? moment(item.cr_dt).format("DD MMM YYYY") : null;

                      return (
                        <tr key={item._id || i} className="hover:bg-[#FAF8F5] dark:hover:bg-[#18261F]/60 transition">
                          <td className="px-5 py-3.5 text-[#1C2E24] dark:text-[#E8F0EB] font-medium">
                            <div className="flex items-center gap-2">
                              <span className="p-1 rounded-md bg-[#EDF3EE] dark:bg-[#18261F] text-[#1C3A2B] dark:text-[#8FD4AE]">
                                <Calendar size={13} />
                              </span>
                              <div>
                                <span className="block font-semibold text-xs">{period}</span>
                                {dateSubmitted && (
                                  <span className="text-[10px] text-[#6D8374] dark:text-[#889C90]">Submitted: {dateSubmitted}</span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <span
                              className="font-mono text-xs text-[#1C3A2B] dark:text-[#8FD4AE] bg-[#FAF8F5] dark:bg-[#18261F] px-2 py-0.5 rounded-md border border-[#DFE6DC] dark:border-[#22352B] inline-block max-w-[200px] truncate"
                              title={refId}
                            >
                              {refId}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#EDF3EE] dark:bg-[#18261F] text-[#1C3A2B] dark:text-[#8FD4AE] border border-[#DFE6DC] dark:border-[#22352B]">
                              <CreditCard size={11} className="text-[#1C3A2B] dark:text-[#8FD4AE]" />
                              <span>{paidVia}</span>
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-xs font-bold text-[#1C2E24] dark:text-[#8FD4AE]">
                            {amount}
                          </td>

                          <td className="px-5 py-3.5">
                            {renderStatusBadge(item)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-[#EFEBE4] dark:divide-[#22352B]">
                {txnsList.map((item, i) => {
                  const period = formatPeriod(item);
                  const refId = getReferenceId(item);
                  const paidVia = formatPaidVia(item.payment_type || item.type);
                  const amount = item.amount ? `₹${item.amount}` : "-";
                  const dateSubmitted = item.cr_dt ? moment(item.cr_dt).format("DD MMM YYYY") : null;

                  return (
                    <div key={item._id || i} className="p-4 space-y-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-[#6D8374] dark:text-[#889C90] block">
                            Period Covered
                          </span>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C2E24] dark:text-[#E8F0EB] mt-0.5">
                            <Calendar size={13} className="text-[#6D8374]" />
                            <span>{period}</span>
                          </div>
                          {dateSubmitted && (
                            <span className="text-[10px] text-[#6D8374] dark:text-[#889C90]">Submitted: {dateSubmitted}</span>
                          )}
                        </div>
                        <span className="text-sm font-bold text-[#1C3A2B] dark:text-[#8FD4AE]">{amount}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div>
                          <span className="text-[10px] text-[#6D8374] dark:text-[#889C90] block">Payed Via:</span>
                          <span className="font-medium text-[#1C2E24] dark:text-[#CAD6CF] flex items-center gap-1 mt-0.5">
                            <CreditCard size={12} className="text-[#1C3A2B] dark:text-[#8FD4AE]" />
                            {paidVia}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-[#6D8374] dark:text-[#889C90] block">Ledger Status:</span>
                          <div className="mt-0.5">
                            {renderStatusBadge(item)}
                          </div>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-[#EFEBE4] dark:border-[#22352B] flex items-center justify-between text-[11px]">
                        <span className="text-[#6D8374] dark:text-[#889C90]">UPI / Bank Ref:</span>
                        <span className="font-mono text-[#1C3A2B] dark:text-[#8FD4AE] bg-[#FAF8F5] dark:bg-[#18261F] px-2 py-0.5 rounded border border-[#DFE6DC] dark:border-[#22352B]">
                          {refId}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {showPay && (
        <PayMonthsModal
          onClose={() => setShowPay(false)}
          onPay={handlePay}
          joiningDate={user?.lastpayment}
        />
      )}
    </div>
  );
}

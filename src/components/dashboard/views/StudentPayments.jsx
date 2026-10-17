"use client";

import { useState, useEffect } from "react";
import moment from "moment";
import { CreditCard, PlusCircle, RefreshCw, Calendar, CheckCircle2, Clock, XCircle, Printer } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useOther } from "../../../context/OtherContext";
import PayMonthsModal from "../PayMonthsModal";
import PrintableReceiptModal from "../PrintableReceiptModal";
import { LoadingRow, ErrorRow } from "../shared";

export default function StudentPayments() {
  const { state: { user }, patchUser } = useAuth();
  const { state: { txns, loading, error }, fetchTxns, checkout } = useOther();

  const txnsList = Array.isArray(txns) ? txns : (Array.isArray(txns?.allPayments) ? txns.allPayments : (Array.isArray(txns?.data) ? txns.data : []));

  const [showPay, setShowPay] = useState(false);
  const [receiptTxn, setReceiptTxn] = useState(null);

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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 whitespace-nowrap">
          <CheckCircle2 size={11} className="text-emerald-600 dark:text-emerald-400" />
          <span>Confirmed</span>
        </span>
      );
    }
    if (isRejected) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 whitespace-nowrap">
          <XCircle size={11} className="text-rose-600 dark:text-rose-400" />
          <span>Rejected</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 whitespace-nowrap">
        <Clock size={11} className="text-amber-600 dark:text-amber-400" />
        <span>Pending Review</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 w-full max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Membership Ledger
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            Membership Dues and Receipts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review your monthly reading pass receipts and ledger confirmations.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchTxns}
            disabled={loading}
            className="p-2 rounded-lg bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition disabled:opacity-50 shadow-2xs cursor-pointer"
            title="Refresh Ledger"
            aria-label="Refresh Ledger"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowPay(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#004B87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold transition shadow-2xs cursor-pointer"
          >
            <PlusCircle size={14} />
            <span>Pay Monthly Dues</span>
          </button>
        </div>
      </div>

      {loading && <LoadingRow />}
      {error   && <ErrorRow message={error} />}

      {!loading && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
          {!txnsList?.length ? (
            <div className="flex flex-col items-center justify-center py-14 px-6 gap-2 text-center">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mb-1">
                <CreditCard size={20} />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">No payment records found</p>
              <p className="text-xs text-slate-500 max-w-sm">
                You have not submitted any fee records yet.
              </p>
              <button
                onClick={() => setShowPay(true)}
                className="mt-2 px-3.5 py-1.5 bg-[#004B87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold transition shadow-2xs cursor-pointer"
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
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">Period Covered</th>
                      <th className="px-4 py-3 text-left">Reference Number</th>
                      <th className="px-4 py-3 text-left">Payment Method</th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-right">Receipt Voucher</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {txnsList.map((item, i) => {
                      const period = formatPeriod(item);
                      const refId = getReferenceId(item);
                      const paidVia = formatPaidVia(item.payment_type || item.type);
                      const amount = item.amount ? `₹${item.amount}` : "-";
                      const dateSubmitted = item.cr_dt ? moment(item.cr_dt).format("DD MMM YYYY") : null;

                      return (
                        <tr key={item._id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3 text-slate-900 dark:text-slate-100 font-medium">
                            <div className="flex items-center gap-2">
                              <span className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                <Calendar size={12} />
                              </span>
                              <div>
                                <span className="block font-semibold text-xs">{period}</span>
                                {dateSubmitted && (
                                  <span className="text-[10px] text-slate-500">Submitted: {dateSubmitted}</span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 inline-block max-w-[200px] truncate"
                              title={refId}
                            >
                              {refId}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              <CreditCard size={11} />
                              <span>{paidVia}</span>
                            </span>
                          </td>

                          <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-slate-100">
                            {amount}
                          </td>

                          <td className="px-4 py-3">
                            {renderStatusBadge(item)}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {item.confirmation ? (
                              <button
                                type="button"
                                onClick={() => setReceiptTxn(item)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#004B87] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition cursor-pointer"
                                aria-label="View Printable Fee Voucher"
                              >
                                <Printer size={12} />
                                <span>Voucher</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Pending Audit</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {txnsList.map((item, i) => {
                  const period = formatPeriod(item);
                  const refId = getReferenceId(item);
                  const paidVia = formatPaidVia(item.payment_type || item.type);
                  const amount = item.amount ? `₹${item.amount}` : "-";
                  const dateSubmitted = item.cr_dt ? moment(item.cr_dt).format("DD MMM YYYY") : null;

                  return (
                    <div key={item._id || i} className="p-4 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                            Period Covered
                          </span>
                          <div className="flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                            <Calendar size={12} className="text-slate-400" />
                            <span>{period}</span>
                          </div>
                          {dateSubmitted && (
                            <span className="text-[10px] text-slate-500">Submitted: {dateSubmitted}</span>
                          )}
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{amount}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Method:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                            <CreditCard size={11} className="text-slate-400" />
                            {paidVia}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 block">Status:</span>
                          <div className="mt-0.5">
                            {renderStatusBadge(item)}
                          </div>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Ref:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {refId}
                        </span>
                      </div>

                      {item.confirmation && (
                        <button
                          type="button"
                          onClick={() => setReceiptTxn(item)}
                          className="w-full mt-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#004B87] dark:text-blue-400 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <Printer size={12} />
                          <span>Print Fee Voucher</span>
                        </button>
                      )}
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

      <PrintableReceiptModal
        isOpen={!!receiptTxn}
        onClose={() => setReceiptTxn(null)}
        txn={receiptTxn}
        studentName={[user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Patron'}
        studentPhone={user?.phone_number || ''}
      />
    </div>
  );
}

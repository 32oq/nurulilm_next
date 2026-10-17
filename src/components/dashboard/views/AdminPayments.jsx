"use client";

import { useState, useEffect } from "react";
import moment from "moment";
import { RefreshCw, CheckCircle2, Printer } from "lucide-react";
import { useOther } from "../../../context/OtherContext";
import { LoadingRow, ErrorRow, TxnStatus } from "../shared";
import PrintableReceiptModal from "../PrintableReceiptModal";

export default function AdminPayments() {
  const { state: { loading, error }, fetchTxnsForConfirmation, updateConfirmation } = useOther();
  const [pending, setPending] = useState([]);
  const [approvingId, setApprovingId] = useState(null);
  const [receiptTxn, setReceiptTxn] = useState(null);

  const load = async () => {
    const dt = await fetchTxnsForConfirmation();
    if (dt?.length) setPending(dt.map((el, idx) => {
      const recordId = el?.ref || el?.ref_id || el?._id || el?.id || `txn_${idx}`;
      return {
        fromdate:     moment(el?.fromdate).format('YYYY-MM-DD'),
        todate:       moment(el?.todate).format('YYYY-MM-DD'),
        payment_type: el?.payment_type || 'online',
        txn_id:       el?.txn_id || 'N/A',
        type:         el?.type || 'siginup',
        amount:       el?.amount || 0,
        confirmation: el?.confirmation,
        id:           recordId,
        ref_id:       el?.ref_id || el?.ref || el?._id,
        ref:          el?.ref || el?._id || el?.ref_id,
        payment_id:   el?._id,
        user_name:    el?.user_name || el?.user_id || 'Student Patron',
        user_email:   el?.user_email || '',
        user_contact: el?.user_contact || '',
        package_name: el?.package_name || el?.package || 'Membership Tier',
        raw:          el
      };
    }));
    else setPending([]);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async (item) => {
    const targetId = typeof item === 'object'
      ? (item?.ref || item?.ref_id || item?.id || item?.payment_id || item?._id)
      : item;
    if (!targetId) return;

    setApprovingId(targetId);
    try {
      await updateConfirmation({
        id: targetId,
        ref_id: item?.ref_id || targetId,
        ref: item?.ref || targetId,
        txn_id: item?.txn_id,
        confirmation: 1
      });
      await load();
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white">
            Pending Fee Submissions
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Review student UPI transaction submissions and confirm membership periods.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 transition disabled:opacity-50 self-start sm:self-auto shadow-xs cursor-pointer"
          title="Refresh Pending Transactions"
          aria-label="Refresh Pending Transactions"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading && <LoadingRow />}
      {error   && <ErrorRow message={error} />}

      {!loading && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
          {!pending?.length ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-2 text-center">
              <CheckCircle2 size={32} className="text-emerald-600" />
              <p className="font-serif-lib text-base font-bold text-slate-900 dark:text-white">All student payments reconciled</p>
              <p className="text-xs text-slate-500">No pending fee submissions waiting for confirmation.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                      <th className="px-5 py-3 text-left">Student Patron</th>
                      <th className="px-5 py-3 text-left">Plan</th>
                      <th className="px-5 py-3 text-left">Period</th>
                      <th className="px-5 py-3 text-left">UPI / Reference ID</th>
                      <th className="px-5 py-3 text-left">Amount</th>
                      <th className="px-5 py-3 text-left">Status</th>
                      <th className="px-5 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pending.map(item => {
                      const isPaid = !!item.confirmation;
                      const isApproving = approvingId === item.id;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-slate-900 dark:text-white">{item.user_name}</p>
                            <p className="text-[11px] text-slate-500">
                              {item.user_email}{item.user_contact ? ` • ${item.user_contact}` : ''}
                            </p>
                          </td>
                          <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-medium max-w-[160px] truncate" title={item.package_name}>
                            {item.package_name}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">
                            <span>{item.fromdate}</span>
                            <span className="mx-1">→</span>
                            <span>{item.todate}</span>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-xs font-semibold max-w-[160px] truncate text-slate-800 dark:text-slate-200">
                            {item.txn_id}
                          </td>
                          <td className="px-5 py-3.5 font-serif-lib text-sm font-bold text-slate-900 dark:text-white">
                            ₹{item.amount}
                          </td>
                          <td className="px-5 py-3.5">
                            <TxnStatus ok={isPaid} label={isPaid ? "Approved" : "Awaiting Review"} />
                          </td>
                          <td className="px-5 py-3.5 flex items-center gap-2">
                            {!isPaid ? (
                              <button
                                onClick={() => handleApprove(item)}
                                disabled={isApproving}
                                className="px-3.5 py-1.5 bg-[#004B87] hover:bg-[#003B6B] text-white rounded text-xs font-semibold transition shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                {isApproving && <RefreshCw size={12} className="animate-spin" />}
                                <span>{isApproving ? "Approving..." : "Approve Fee"}</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setReceiptTxn(item.raw || item)}
                                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[#004B87] dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/80 rounded text-xs font-semibold transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                                aria-label="Print voucher"
                              >
                                <Printer size={12} />
                                <span>Voucher</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {pending.map(item => {
                  const isPaid = !!item.confirmation;
                  const isApproving = approvingId === item.id;
                  return (
                    <div key={item.id} className="p-4 space-y-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.user_name}</p>
                          <p className="text-[11px] text-slate-500">
                            {item.user_email}{item.user_contact ? ` • ${item.user_contact}` : ''}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">{item.package_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-serif-lib text-base font-bold text-slate-900 dark:text-white">₹{item.amount}</p>
                          <TxnStatus ok={isPaid} label={isPaid ? "Approved" : "Pending"} />
                        </div>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Period:</span>
                          <span>{item.fromdate} → {item.todate}</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span className="text-slate-500">UPI ID:</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{item.txn_id}</span>
                        </div>
                      </div>
                      {!isPaid ? (
                        <button
                          onClick={() => handleApprove(item)}
                          disabled={isApproving}
                          className="w-full py-2.5 bg-[#004B87] hover:bg-[#003B6B] text-white rounded text-xs font-semibold transition shadow-xs disabled:opacity-50 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {isApproving && <RefreshCw size={12} className="animate-spin" />}
                          <span>{isApproving ? "Approving Fee..." : "Approve Fee Payment"}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setReceiptTxn(item.raw || item)}
                          className="w-full py-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[#004B87] dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/80 rounded text-xs font-semibold transition shadow-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Printer size={12} />
                          <span>Print Official Fee Voucher</span>
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

      <PrintableReceiptModal
        isOpen={!!receiptTxn}
        onClose={() => setReceiptTxn(null)}
        txn={receiptTxn}
        studentName={receiptTxn?.user_name || receiptTxn?.user?.first_name || 'Registered Patron'}
        studentPhone={receiptTxn?.user_contact || receiptTxn?.user?.phone_number || ''}
      />
    </div>
  );
}

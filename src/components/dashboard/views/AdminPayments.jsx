"use client";

import { useState, useEffect } from "react";
import moment from "moment";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { useOther } from "../../../context/OtherContext";
import { LoadingRow, ErrorRow, TxnStatus } from "../shared";

export default function AdminPayments() {
  const { state: { loading, error }, fetchTxnsForConfirmation, updateConfirmation } = useOther();
  const [pending, setPending] = useState([]);
  const [approvingId, setApprovingId] = useState(null);

  const load = async () => {
    const dt = await fetchTxnsForConfirmation();
    if (dt?.length) setPending(dt.map(el => ({
      fromdate:     moment(el?.fromdate).format('YYYY-MM-DD'),
      todate:       moment(el?.todate).format('YYYY-MM-DD'),
      payment_type: el?.payment_type || 'online',
      txn_id:       el?.txn_id || 'N/A',
      type:         el?.type || 'siginup',
      amount:       el?.amount || 0,
      confirmation: el?.confirmation,
      id:           el?._id,
      user_name:    el?.user_name || el?.user_id || 'Student Patron',
      user_email:   el?.user_email || '',
      user_contact: el?.user_contact || '',
      package_name: el?.package_name || el?.package || 'Membership Tier'
    })));
    else setPending([]);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      await updateConfirmation({ id });
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
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#88B89C]">
            Ledger Reconciliation
          </span>
          <h2 className="font-serif-lib text-2xl font-bold text-[#1C2E24] dark:text-[#8FD4AE] mt-0.5">
            Pending Fee Submissions
          </h2>
          <p className="text-xs text-[#5D6B62] dark:text-[#9FB1A6] mt-1">
            Review student UPI transaction submissions and confirm membership periods.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2.5 rounded-lg bg-white dark:bg-[#142019] border border-[#E5DFD5] dark:border-[#22352B] text-[#5D6B62] dark:text-[#A1B3A7] hover:text-[#1C2E24] dark:hover:text-white hover:bg-[#FAF8F5] transition disabled:opacity-50 self-start sm:self-auto shadow-xs cursor-pointer"
          title="Refresh Pending Transactions"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading && <LoadingRow />}
      {error   && <ErrorRow message={error} />}

      {!loading && (
        <div className="bg-white dark:bg-[#142019] border border-[#DFE6DC] dark:border-[#22352B] rounded-2xl shadow-xs overflow-hidden">
          {!pending?.length ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-2 text-center">
              <CheckCircle2 size={32} className="text-[#2E6B3F] dark:text-[#52D38A]" />
              <p className="font-serif-lib text-base font-bold text-[#1C2E24] dark:text-[#8FD4AE]">All student payments reconciled</p>
              <p className="text-xs text-[#5D6B62] dark:text-[#9FB1A6]">No pending UPI submissions waiting for coordinator confirmation.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#EFEBE4] dark:border-[#22352B] bg-[#FAF8F5] dark:bg-[#18261F] text-[#6D8374] dark:text-[#88B89C] text-[11px] font-semibold uppercase tracking-wider">
                      <th className="px-5 py-3 text-left">Student Patron</th>
                      <th className="px-5 py-3 text-left">Tier / Package</th>
                      <th className="px-5 py-3 text-left">Period Covered</th>
                      <th className="px-5 py-3 text-left">UPI / Reference ID</th>
                      <th className="px-5 py-3 text-left">Amount</th>
                      <th className="px-5 py-3 text-left">Status</th>
                      <th className="px-5 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEBE4] dark:divide-[#22352B]">
                    {pending.map(item => {
                      const isPaid = !!item.confirmation;
                      const isApproving = approvingId === item.id;
                      return (
                        <tr key={item.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#18261F]/60 transition">
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-[#1C2E24] dark:text-[#E8F0EB]">{item.user_name}</p>
                            <p className="text-[11px] text-[#7F8781] dark:text-[#889C90]">
                              {item.user_email}{item.user_contact ? ` • ${item.user_contact}` : ''}
                            </p>
                          </td>
                          <td className="px-5 py-3.5 text-[#2D3A31] dark:text-[#CAD6CF] font-medium max-w-[160px] truncate" title={item.package_name}>
                            {item.package_name}
                          </td>
                          <td className="px-5 py-3.5 text-[#5D6B62] dark:text-[#9FB1A6]">
                            <span>{item.fromdate}</span>
                            <span className="text-[#9CA3AF] mx-1">→</span>
                            <span>{item.todate}</span>
                          </td>
                          <td className="px-5 py-3.5 text-[#1C2E24] dark:text-[#8FD4AE] font-mono text-xs font-semibold max-w-[160px] truncate">
                            {item.txn_id}
                          </td>
                          <td className="px-5 py-3.5 font-serif-lib text-sm font-bold text-[#1C3A2B] dark:text-[#8FD4AE]">
                            ₹{item.amount}
                          </td>
                          <td className="px-5 py-3.5">
                            <TxnStatus ok={isPaid} label={isPaid ? "Approved" : "Awaiting Review"} />
                          </td>
                          <td className="px-5 py-3.5">
                            {!isPaid && (
                              <button
                                onClick={() => handleApprove(item.id)}
                                disabled={isApproving}
                                className="px-3.5 py-1.5 bg-[#1C3A2B] hover:bg-[#142B20] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white rounded-lg text-xs font-semibold transition shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                {isApproving && <RefreshCw size={12} className="animate-spin" />}
                                <span>{isApproving ? "Approving..." : "Approve Receipt"}</span>
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
              <div className="lg:hidden divide-y divide-[#EFEBE4] dark:divide-[#22352B]">
                {pending.map(item => {
                  const isPaid = !!item.confirmation;
                  const isApproving = approvingId === item.id;
                  return (
                    <div key={item.id} className="p-4 space-y-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-semibold text-[#1C2E24] dark:text-[#E8F0EB] text-sm">{item.user_name}</p>
                          <p className="text-[11px] text-[#7F8781] dark:text-[#889C90]">
                            {item.user_email}{item.user_contact ? ` • ${item.user_contact}` : ''}
                          </p>
                          <p className="text-xs text-[#2D4536] dark:text-[#8FD4AE] font-medium mt-0.5">{item.package_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-serif-lib text-base font-bold text-[#1C3A2B] dark:text-[#8FD4AE]">₹{item.amount}</p>
                          <TxnStatus ok={isPaid} label={isPaid ? "Approved" : "Pending"} />
                        </div>
                      </div>
                      <div className="text-xs text-[#5D6B62] dark:text-[#CAD6CF] bg-[#FAF8F5] dark:bg-[#18261F] p-2.5 rounded-lg border border-[#DFE6DC] dark:border-[#263D30] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#7F8781] dark:text-[#889C90]">Period:</span>
                          <span>{item.fromdate} → {item.todate}</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span className="text-[#7F8781] dark:text-[#889C90]">UPI ID:</span>
                          <span className="font-semibold text-[#1C2E24] dark:text-[#8FD4AE]">{item.txn_id}</span>
                        </div>
                      </div>
                      {!isPaid && (
                        <button
                          onClick={() => handleApprove(item.id)}
                          disabled={isApproving}
                          className="w-full py-2.5 bg-[#1C3A2B] hover:bg-[#142B20] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white rounded-lg text-xs font-semibold transition shadow-xs disabled:opacity-50 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {isApproving && <RefreshCw size={12} className="animate-spin" />}
                          <span>{isApproving ? "Approving Receipt..." : "Approve Fee Payment"}</span>
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
    </div>
  );
}

'use client';

import { useRef } from 'react';
import moment from 'moment';
import { X, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function PrintableReceiptModal({ isOpen, onClose, txn, studentName, studentPhone }) {
  const receiptRef = useRef(null);

  if (!isOpen || !txn) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNo = `VCH-NIL-${moment(txn.cr_dt || txn.fromdate || undefined).format('YYMM')}-${(txn._id || txn.id || '000000').slice(-6).toUpperCase()}`;
  const issueDate = moment(txn.cr_dt || txn.fromdate || undefined).format('DD MMMM YYYY, hh:mm A');
  const validFrom = moment(txn.fromdate || undefined).format('DD MMM YYYY');
  const validTo = moment(txn.todate || undefined).format('DD MMM YYYY');
  const amount = Number(txn.amount || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#111827] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden print:border-none print:shadow-none print:w-full print:max-w-none print:max-h-none">
        
        {/* Modal Top Bar - Hidden during print */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <Printer size={15} className="text-[#004B87] dark:text-blue-400" />
            <span>Official Accession Fee Voucher</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Printer size={13} />
              <span>Print Voucher</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Paper Voucher */}
        <div ref={receiptRef} className="p-8 sm:p-10 text-slate-900 bg-white font-sans text-xs print:p-6 print:m-0">
          
          {/* Institutional Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center relative">
            <div className="inline-block uppercase tracking-widest text-[10px] font-bold text-slate-600 mb-1">
              Registered Non-Profit Educational Institution • Est. Handwara
            </div>
            <h1 className="text-xl sm:text-2xl font-serif-lib font-bold text-slate-950 tracking-wide uppercase">
              Nurul Ilm Library 
            </h1>
            <p className="text-[11px] text-slate-600 mt-1">
              Main Bus Stand Corridor, Handwara, Dist. Kupwara, Jammu & Kashmir — 193221
            </p>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
              Govt. Library Reg: JK/KUP/HND/2024 • Institutional Desk Access Voucher
            </p>
          </div>

          {/* Voucher Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-300 rounded-lg mb-6">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-500">Voucher Reference</span>
              <span className="font-mono text-xs font-bold text-slate-900">{receiptNo}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-500">Date &amp; Time</span>
              <span className="text-xs font-medium text-slate-900">{issueDate}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-500">Verification Status</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                <CheckCircle2 size={12} className="text-emerald-700" />
                <span>Confirmed &amp; Audited</span>
              </span>
            </div>
          </div>

          {/* Patron Particulars */}
          <div className="mb-6">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2.5">
              Patron &amp; Subscription Particulars
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs">
              <div>
                <span className="text-slate-500">Patron Name:</span>{' '}
                <strong className="text-slate-950 font-semibold">{studentName || 'Registered Student'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Contact Number:</span>{' '}
                <span className="font-mono text-slate-900">{studentPhone || 'On Library File'}</span>
              </div>
              <div>
                <span className="text-slate-500">Assigned Plan:</span>{' '}
                <strong className="text-slate-950">{txn.package_name || txn.package?.name || 'Standard Scholar Membership'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Desk / Bay:</span>{' '}
                <span className="text-slate-900">{txn.desk_label || 'Allocated Reading Carrel'}</span>
              </div>
              <div>
                <span className="text-slate-500">Tenure Window:</span>{' '}
                <span className="font-mono text-slate-900">{validFrom} to {validTo}</span>
              </div>
              <div>
                <span className="text-slate-500">Payment Channel:</span>{' '}
                <span className="uppercase font-semibold text-slate-900">{txn.payment_type || 'UPI Digital Transfer'}</span>
              </div>
            </div>
          </div>

          {/* Fee Breakdown Table */}
          <div className="mb-6">
            <table className="w-full text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-left font-bold text-slate-800">
                  <th className="p-2.5">Particulars / Fee Schedule</th>
                  <th className="p-2.5 text-center">Tenure</th>
                  <th className="p-2.5 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5">
                    <strong className="block text-slate-950">{txn.package_name || 'Library Desk Fee'}</strong>
                    <span className="text-[10px] text-slate-500">Unrestricted reading hall access, high-speed WiFi, silent carrel reservation</span>
                  </td>
                  <td className="p-2.5 text-center font-mono text-slate-700">1 Month</td>
                  <td className="p-2.5 text-right font-mono font-semibold text-slate-950">₹{amount.toFixed(2)}</td>
                </tr>
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-900">
                  <td colSpan={2} className="p-2.5 text-right uppercase tracking-wider text-xs">Total Net Remitted:</td>
                  <td className="p-2.5 text-right font-mono text-sm text-slate-950">₹{amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Audit Reference and Endorsement */}
          <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded mb-8 text-[11px] text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-slate-800">Bank / UPI Transaction Reference (UTR):</span>
              <p className="font-mono text-xs font-bold text-slate-900 mt-0.5">{txn.txn_id || 'CASH-LEDGER-VERIFIED'}</p>
            </div>
            <div className="text-[10px] text-slate-500 sm:text-right">
              <span>Electronic Audit Hash</span>
              <p className="font-mono text-[9px] text-slate-400">{(txn._id || '000000000000').toUpperCase()}</p>
            </div>
          </div>

          {/* Signatures & Institutional Seal */}
          <div className="pt-4 border-t border-slate-300 flex items-end justify-between">
            {/* Left Seal */}
            <div className="border border-slate-400 p-2.5 rounded-lg text-center w-36 bg-slate-50/60">
              <div className="text-[8px] uppercase tracking-wider font-bold text-slate-600">Institutional Seal</div>
              <div className="my-1 text-slate-800 font-serif-lib text-xs font-bold leading-tight">
                NURUL-ILM<br />LIBRARY
              </div>
              <div className="text-[7px] text-emerald-700 font-semibold uppercase">✓ Fee Verified</div>
            </div>

            {/* Right Signature */}
            <div className="text-center w-48">
              <div className="h-8 border-b border-slate-500 mb-1 flex items-end justify-center">
                <span className="font-serif-lib italic text-slate-500 text-xs">M. Zubair P.</span>
              </div>
              <span className="block text-[10px] font-bold text-slate-800 uppercase tracking-wider">Authorized Bursar</span>
              <span className="block text-[9px] text-slate-500">Nurul-Ilm Reading Hall Handwara</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[9px] text-slate-400">
            This voucher serves as valid proof of library membership and desk reservation. Please preserve this receipt for carrel identification.
          </div>

        </div>

      </div>
    </div>
  );
}

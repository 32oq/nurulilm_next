'use client';

import { useEffect } from 'react';
import PackageCard from '../components/PackagesCard';
import { useOther } from '../context/OtherContext';
import { ShieldCheck, CalendarCheck, HelpCircle } from 'lucide-react';

const PackagesPage = ({ setPage }) => {
  const { state: { packages }, getPackages } = useOther();

  useEffect(() => {
    getPackages();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Membership Plans
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1 mb-2">
          Reading Passes and Subscriptions
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Select a membership duration for your study routine. All passes include quiet desk access, winter heating, and book borrowing privileges.
        </p>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {packages?.map((pkg) => (
          <PackageCard
            key={pkg._id || pkg.id}
            data={{ ...pkg, isPopular: !!pkg.isPopular }}
            redirect={setPage}
          />
        ))}
      </div>

      {/* Trust & Policy Notes */}
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-start gap-2.5">
          <ShieldCheck size={16} className="text-[#004B87] dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">Official Patron ID</p>
            <p className="text-slate-500 dark:text-slate-400">Verified identity with transparent fee receipts and status tracking.</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <CalendarCheck size={16} className="text-[#004B87] dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">Simple Monthly Renewals</p>
            <p className="text-slate-500 dark:text-slate-400">Renew monthly or choose seasonal terms to lock your study desk.</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <HelpCircle size={16} className="text-[#004B87] dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">On-Desk Support</p>
            <p className="text-slate-500 dark:text-slate-400">Questions about seat allocation? Inquire directly at the reception desk.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagesPage;

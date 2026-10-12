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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#33462C] dark:text-[#8FD4AE]">
          Patron Membership Plans
        </span>
        <h1 className="font-serif-lib text-3xl sm:text-4xl lg:text-5xl font-bold text-[#24341E] dark:text-[#8FD4AE] mt-1 mb-3">
          Reading Passes &amp; Subscriptions
        </h1>
        <p className="text-sm sm:text-base text-[#0B0E0A] dark:text-[#9FB1A6] leading-relaxed">
          Choose a membership duration that aligns with your study schedule.
          All passes grant complete access to library facilities, heated cabins, and digital resources.
        </p>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {packages?.map((pkg) => (
          <PackageCard
            key={pkg._id || pkg.id}
            data={{ ...pkg, isPopular: !!pkg.isPopular }}
            redirect={setPage}
          />
        ))}
      </div>

      {/* Trust & Guarantee Notes */}
      <div className="mt-14 pt-8 border-t border-[#DFE6DC] dark:border-[#26362D] grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[#0B0E0A] dark:text-[#9FB1A6]">
        <div className="flex items-start gap-2.5">
          <ShieldCheck size={18} className="text-[#33462C] dark:text-[#8FD4AE] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#24341E] dark:text-white">Verified Library Registry</p>
            <p className="text-[#0B0E0A]/80 dark:text-[#9FB1A6]">Transparent dues tracking with instant digital receipts.</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <CalendarCheck size={18} className="text-[#33462C] dark:text-[#8FD4AE] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#24341E] dark:text-white">Flexible Renewals</p>
            <p className="text-[#0B0E0A]/80 dark:text-[#9FB1A6]">Pay monthly or choose quarterly terms for extended peace of mind.</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <HelpCircle size={18} className="text-[#33462C] dark:text-[#8FD4AE] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#24341E] dark:text-white">Student Inquiries</p>
            <p className="text-[#0B0E0A]/80 dark:text-[#9FB1A6]">Need assistance? Contact library desk on premise anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagesPage;

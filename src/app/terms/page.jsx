import Link from 'next/link';
import { BookOpen, ArrowLeft, VolumeX, AlertTriangle, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | Nurul Ilm Library',
  description: 'Official library terms, reading room rules, quiet hours policy, and study desk regulations for patrons at Nurul Ilm Library in Handwara.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[#F6F8FB] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Navigation & Header */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#004B87] dark:text-blue-400 hover:underline mb-4 cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Return to Library Home</span>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004B87] dark:text-blue-400 flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Institutional Regulations
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                Terms and Library Regulations
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Effective Date: January 1, 2025 | Operating Authority: Nurul Ilm Library, Handwara
          </p>
        </div>

        {/* Document Body */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs space-y-6 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#004B87] dark:text-blue-400" />
              <span>1. Admission and Membership Validity</span>
            </h2>
            <p>
              Admission to the reading rooms and lending services of Nurul Ilm Library is restricted to verified, registered patrons. Each patron receives an official Digital Patron ID card upon successful document audit. Memberships are non-transferable and can only be used by the enrolled individual.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <VolumeX size={16} className="text-[#004B87] dark:text-blue-400" />
              <span>2. Strict Silence and Study Floor Etiquette</span>
            </h2>
            <p>
              To maintain quiet study conditions for competitive exam preparation, reading rooms operate under a strict silence policy:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Mobile phones and devices must remain on silent mode at all times inside the library hall. Phone calls must be taken outside the main entrance.</li>
              <li>Group conversations and whispering are not permitted in silent study zones.</li>
              <li>Headphones must be kept at a volume that does not disturb adjacent reading carrels.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock size={16} className="text-[#004B87] dark:text-blue-400" />
              <span>3. Study Carrels and Desk Allocation Rules</span>
            </h2>
            <p>
              Desks are assigned for the library operating shift established by the administration.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Assigned desks are reserved exclusively for the registered patron during active library operating hours.</li>
              <li>Patrons must clear their study desks of personal trash upon completing their study session.</li>
              <li>The library accepts no liability for personal electronics left unattended on reading carrels.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen size={16} className="text-[#004B87] dark:text-blue-400" />
              <span>4. Book Circulation and Stacks Care</span>
            </h2>
            <p>
              Patrons with an active membership may borrow reference books from the physical collection under the following terms:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Standard loan duration is 14 calendar days per title, renewable if no reserve hold exists.</li>
              <li>Reference volumes and rare single-copy texts are designated for reading room consultation only.</li>
              <li>Patrons are responsible for returning materials in the condition received. Markings or damage will incur replacement cost assessment.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#004B87] dark:text-blue-400" />
              <span>5. Winter Heating, Electricity, and Wi-Fi Usage</span>
            </h2>
            <p>
              Electrical outlets are provided at each carrel for laptops, tablets, and mobile devices.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>High-power appliances such as individual immersion heaters or kettles are strictly prohibited.</li>
              <li>Central climate control and winter radiators are managed by staff to ensure uniform room warmth.</li>
              <li>High-speed fiber connectivity is provided for academic lectures, online mock tests, and research.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#004B87] dark:text-blue-400" />
              <span>6. Membership Fees and Renewals</span>
            </h2>
            <p>
              Membership subscriptions are payable monthly in advance. Patrons should settle renewal dues before their active pass expires to maintain their seat assignment.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-2">
          <p>© {new Date().getFullYear()} Nurul Ilm Library. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}

import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, Eye, FileText, Database, Phone } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Nurul Ilm Library',
  description: 'Official patron data protection, CCTV surveillance, and identity privacy policy for Nurul Ilm Library in Handwara, Jammu & Kashmir.',
};

export default function PrivacyPolicyPage() {
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
              <ShieldCheck size={18} />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Institutional Policy
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                Privacy and Data Protection Policy
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Effective Date: January 1, 2025 | Governing Body: Nurul Ilm Library Administration, Handwara
          </p>
        </div>

        {/* Document Body */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs space-y-6 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText size={16} className="text-[#004B87] dark:text-blue-400" />
              <span>1. Overview and Scope</span>
            </h2>
            <p>
              Nurul Ilm Library is dedicated to cultivating a quiet, secure, and academically disciplined reading room for students and competitive exam aspirants in Handwara and Kupwara District. This Privacy Policy details the guidelines governing patron records collected for admission, library card verification, and building security.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Database size={16} className="text-[#004B87] dark:text-blue-400" />
              <span>2. Patron Information We Collect</span>
            </h2>
            <p>
              To maintain academic discipline, statutory safety compliance, and seat reservations, we collect the following details upon membership registration:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Identity Details:</strong> Full name, residential address, date of birth, and portrait photograph.</li>
              <li><strong>Contact Information:</strong> Phone number and email address for seat confirmations and dues receipts.</li>
              <li><strong>Verification Records:</strong> Government photo identification (Aadhaar or Student ID) for identity confirmation.</li>
              <li><strong>Circulation &amp; Desk History:</strong> Book loan records, study carrel assignments, and attendance logs.</li>
              <li><strong>Payment Records:</strong> UPI transaction reference numbers and monthly subscription validity dates.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Eye size={16} className="text-[#004B87] dark:text-blue-400" />
              <span>3. CCTV Surveillance and Safety Monitoring</span>
            </h2>
            <p>
              For the personal safety of all male and female patrons and to protect physical book stacks, public reading halls and entrance foyers are monitored by Closed-Circuit Television (CCTV) cameras.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>CCTV camera coverage is confined to public study halls, corridors, reception areas, and perimeter points. No cameras are installed in private washrooms or ablution areas.</li>
              <li>Access to security footage is strictly restricted to certified library supervisory staff.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Lock size={16} className="text-[#004B87] dark:text-blue-400" />
              <span>4. Data Security and Confidentiality</span>
            </h2>
            <p>
              We implement standard administrative and technical safeguards to protect patron records against unauthorized disclosure or theft. Member portal sessions are secured with encryption, and passwords are salted and hashed. We do not sell or monetize student contact lists to third-party commercial marketing firms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Phone size={16} className="text-[#004B87] dark:text-blue-400" />
              <span>5. Patron Rights and Administrative Contact</span>
            </h2>
            <p>
              Enrolled members retain the right to inspect their personal registration records and update contact information. For inquiries, contact library administration:
            </p>
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs space-y-0.5">
              <p><strong>Office of Library Administration</strong></p>
              <p>Nurul Ilm Library</p>
              <p>New Bus Stand Road, Handwara, Kupwara District, Jammu &amp; Kashmir 193221</p>
              <p>In-person hours: Daily during library operating schedule</p>
            </div>
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

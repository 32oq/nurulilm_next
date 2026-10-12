import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, Eye, FileText, Database, Phone } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Nurul Ilm Public Library',
  description: 'Official patron data protection, CCTV surveillance, and identity privacy policy for Nurul Ilm Public Library in Handwara, Jammu & Kashmir.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FCFCFB] dark:bg-[#0E1411] text-[#0B0E0A] dark:text-[#E5EBE7] font-sans antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Navigation & Header */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#1C3A2B] dark:text-[#8FD4AE] hover:underline mb-6 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Return to Library Home</span>
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF4EC] dark:bg-[#1E2E25] text-[#1C3A2B] dark:text-[#8FD4AE] flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1C3A2B] dark:text-[#88B89C]">
                Institutional Governance
              </span>
              <h1 className="font-serif-lib text-2xl sm:text-4xl font-bold text-[#1C2E24] dark:text-[#8FD4AE]">
                Privacy &amp; Data Protection Policy
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#5D6B62] dark:text-[#9FB1A6]">
            Effective Date: January 1, 2025 | Governing Body: Nurul Ilm Public Library Administration, Handwara, J&amp;K
          </p>
        </div>

        {/* Document Body */}
        <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm leading-relaxed text-[#2D3A31] dark:text-[#D5E1D9]">

          <section className="space-y-3">
            <h2 className="font-serif-lib text-lg sm:text-xl font-bold text-[#1C2E24] dark:text-[#8FD4AE] flex items-center gap-2">
              <FileText size={16} className="text-[#1C3A2B] dark:text-[#8FD4AE]" />
              <span>1. Overview and Scope</span>
            </h2>
            <p>
              Nurul Ilm Public Library ("the Library", "we", "our") is dedicated to cultivating a peaceful, secure, and academically rigorous study haven for competitive aspirants, scholars, and students in Handwara and Kupwara District. This Privacy Policy details the policies governing the collection, utilization, safeguarding, and disclosure of patron information obtained through physical enrollment, our digital membership portal, CCTV surveillance, and RFID desk check-ins.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif-lib text-lg sm:text-xl font-bold text-[#1C2E24] dark:text-[#8FD4AE] flex items-center gap-2">
              <Database size={16} className="text-[#1C3A2B] dark:text-[#8FD4AE]" />
              <span>2. Patron Information We Collect</span>
            </h2>
            <p>
              To maintain academic discipline, statutory compliance, and physical safety across our reading rooms, we collect the following categories of information upon membership registration:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong>Identity Details:</strong> Legal name, parentage/guardian name, residential address, date of birth, and enrollment photograph.</li>
              <li><strong>Contact Information:</strong> Active phone number and email address for seat confirmation, fee notifications, and administrative alerts.</li>
              <li><strong>Verification Records:</strong> Government photo identification (Aadhaar Card, Student ID, or Passport) for mandatory identity confirmation and safety protocols.</li>
              <li><strong>Circulation &amp; Desk History:</strong> Book loan histories, study carrel allocations, reservation timestamps, and focus sprint records.</li>
              <li><strong>Payment Evidence:</strong> Bank transfer receipts, UPI transaction reference numbers (UTR), and subscription validity dates. We do not store raw debit/credit card numbers or UPI PINs.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif-lib text-lg sm:text-xl font-bold text-[#1C2E24] dark:text-[#8FD4AE] flex items-center gap-2">
              <Eye size={16} className="text-[#1C3A2B] dark:text-[#8FD4AE]" />
              <span>3. CCTV Surveillance &amp; Safety Monitoring</span>
            </h2>
            <p>
              For the personal safety of all male and female patrons and to prevent unauthorized entry or vandalism of reference materials, public reading rooms and entry foyers are monitored 24 hours a day by Closed-Circuit Television (CCTV) cameras.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>CCTV camera coverage is strictly confined to public study halls, corridors, reception zones, and exterior perimeter areas. No cameras are installed in private washrooms or ablution areas.</li>
              <li>Footage is encrypted and stored locally with access restricted to certified library administrators and authorized law enforcement upon lawful request.</li>
              <li>Video recordings are routinely overwritten on a 30-day cyclical retention basis unless required for an ongoing inquiry or safety verification.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif-lib text-lg sm:text-xl font-bold text-[#1C2E24] dark:text-[#8FD4AE] flex items-center gap-2">
              <Lock size={16} className="text-[#1C3A2B] dark:text-[#8FD4AE]" />
              <span>4. Data Security and Confidentiality</span>
            </h2>
            <p>
              We implement industry-standard administrative, technical, and physical security safeguards to protect patron records against unauthorized disclosure, alteration, or theft. Member portal sessions are secured with TLS encryption, and patron passwords are cryptographically salted and hashed using bcrypt. We never sell, rent, or monetize patron contact lists or study habits to third-party commercial marketing firms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif-lib text-lg sm:text-xl font-bold text-[#1C2E24] dark:text-[#8FD4AE] flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#1C3A2B] dark:text-[#8FD4AE]" />
              <span>5. Statutory and Police Verification Disclosures</span>
            </h2>
            <p>
              In accordance with regional library safety mandates in the Union Territory of Jammu &amp; Kashmir, patron rosters and verification records may be presented to municipal or law enforcement authorities upon lawful administrative audit. Such disclosures are strictly confined to verifying authorized presence and security in public commercial spaces.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif-lib text-lg sm:text-xl font-bold text-[#1C2E24] dark:text-[#8FD4AE] flex items-center gap-2">
              <Phone size={16} className="text-[#1C3A2B] dark:text-[#8FD4AE]" />
              <span>6. Patron Rights and Administrative Contact</span>
            </h2>
            <p>
              Enrolled members retain the right to inspect their personal registration records, request rectification of erroneous phone or address entries, and review their digital reading history. For inquiries regarding this policy or data management, please contact library administration:
            </p>
            <div className="bg-[#EFF4EC] dark:bg-[#1A261F] border border-[#DFE6DC] dark:border-[#26362D] rounded-xl p-4 text-xs space-y-1">
              <p><strong>Office of Library Administration</strong></p>
              <p>Nurul Ilm Public Library</p>
              <p>New Bus Stand Road, Handwara, Kupwara District, Jammu &amp; Kashmir 193221</p>
              <p>Official Helpline: +91 9906000000 | In-person hours: 07:00 AM - 09:00 PM</p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[#5D6B62] dark:text-[#889C90] pt-4">
          <p>© {new Date().getFullYear()} Nurul Ilm Public Library. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}

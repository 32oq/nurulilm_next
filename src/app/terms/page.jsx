import Link from 'next/link';
import { BookOpen, ArrowLeft, VolumeX, AlertTriangle, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | Nurul Ilm Public Library',
  description: 'Official library terms, reading room rules, quiet hours policy, and study desk regulations for patrons at Nurul Ilm Public Library in Handwara.',
};

export default function TermsAndConditionsPage() {
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
              <BookOpen size={20} />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1C3A2B] dark:text-[#88B89C]">
                Institutional Code of Conduct
              </span>
              <h1 className="font-serif-lib text-2xl sm:text-4xl font-bold text-[#1C2E24] dark:text-[#8FD4AE]">
                Terms &amp; Library Regulations
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#5D6B62] dark:text-[#9FB1A6]">
            Effective Date: January 1, 2025 | Operating Authority: Nurul Ilm Public Library, Handwara
          </p>
        </div>

        {/* Document Body */}
        <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm leading-relaxed text-[#2D3A31] dark:text-[#D5E1D9]">

          <section className="space-y-3">
            <h2 className="font-serif-lib text-lg sm:text-xl font-bold text-[#1C2E24] dark:text-[#8FD4AE] flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#1C3A2B] dark:text-[#8FD4AE]" />
              <span>1. Admission &amp; Membership Validity</span>
            </h2>
            <p>
              Admission to the reading rooms and lending services of Nurul Ilm Public Library is restricted to verified, paid registered patrons. Each patron receives a personal Digital Patron ID card upon successful document audit. Memberships are non-transferable and can only be used by the enrolled individual. Sharing digital credentials or access cards with non-members is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif-lib text-lg sm:text-xl font-bold text-[#1C2E24] dark:text-[#8FD4AE] flex items-center gap-2">
              <VolumeX size={16} className="text-[#1C3A2B] dark:text-[#8FD4AE]" />
              <span>2. Strict Silence &amp; Study Floor Etiquette</span>
            </h2>
            <p>
              To maintain the highest standard of academic focus for competitive exam aspirants, our reading rooms operate under an uncompromising strict silence code:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Mobile phones and cellular communication devices must remain on silent mode at all times inside the library hall. Telephone calls must be taken outside the main entrance lobby.</li>
              <li>Loud discussions, group debates, and verbal whispering are strictly prohibited in the silent study zones. Designated discussion areas or the terrace foyer may be utilized for collaborative queries.</li>
              <li>Headphones and earphones must be kept at a volume level that does not leak sound to adjacent reading carrels.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif-lib text-lg sm:text-xl font-bold text-[#1C2E24] dark:text-[#8FD4AE] flex items-center gap-2">
              <Clock size={16} className="text-[#1C3A2B] dark:text-[#8FD4AE]" />
              <span>3. Study Carrels &amp; Desk Allocation Rules</span>
            </h2>
            <p>
              Desks are assigned based on selected membership shift (Morning Shift, Evening Shift, Full Day, or 24x7 Pass).
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>A student's assigned desk is reserved exclusively for their registered shift. Changing desks without prior administrative logging is not permitted.</li>
              <li>Patrons must clear their study desks of personal trash and empty beverage containers upon completion of their daily study block.</li>
              <li>The library accepts no liability for personal electronics (laptops, tablets, chargers) left unattended overnight on reading carrels.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif-lib text-lg sm:text-xl font-bold text-[#1C2E24] dark:text-[#8FD4AE] flex items-center gap-2">
              <BookOpen size={16} className="text-[#1C3A2B] dark:text-[#8FD4AE]" />
              <span>4. Book Circulation &amp; Stacks Care</span>
            </h2>
            <p>
              Patrons with an active subscription may borrow reference books and competitive study volumes from the physical catalog under the following terms:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Standard borrowing duration is 14 calendar days per title, renewable once if no reserve hold exists by another candidate.</li>
              <li>Reference dictionaries, past-year UPSC/JKAS physical question files, and single-copy rare texts are designated for reading room consultation only and cannot be removed from the premises.</li>
              <li>Patrons are responsible for returning materials in the same condition as issued. Markings, pen highlighting, torn folios, or water damage will incur full replacement cost assessment.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif-lib text-lg sm:text-xl font-bold text-[#1C2E24] dark:text-[#8FD4AE] flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#1C3A2B] dark:text-[#8FD4AE]" />
              <span>5. Winter Heating, Electricity &amp; Wi-Fi Usage</span>
            </h2>
            <p>
              Dedicated electrical charging points are provided at each reading carrel exclusively for laptops, tablets, and mobile phones.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>High-draw personal appliances such as individual electric immersion rods, electric heaters, or kettles are strictly prohibited from connection to desk carrel outlets.</li>
              <li>Central climate control and winter heating are managed systematically by library caretakers to ensure uniform room warmth.</li>
              <li>High-speed fiber connectivity is provided for academic lectures, online mock tests, and research. Torrents, heavy bandwidth streaming of recreational media, or illegal downloads are prohibited and will result in network blacklisting.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif-lib text-lg sm:text-xl font-bold text-[#1C2E24] dark:text-[#8FD4AE] flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#1C3A2B] dark:text-[#8FD4AE]" />
              <span>6. Membership Fees, Renewal &amp; Cancellations</span>
            </h2>
            <p>
              Membership subscriptions are payable monthly in advance. Patrons must clear their renewal fees before the expiration of their current active pass to maintain seat reservation lock. Fees paid are non-refundable once the monthly billing cycle has commenced, as desk capacity is allocated on a reserved seat basis.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif-lib text-lg sm:text-xl font-bold text-[#1C2E24] dark:text-[#8FD4AE] flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#1C3A2B] dark:text-[#8FD4AE]" />
              <span>7. Disciplinary Action &amp; Termination</span>
            </h2>
            <p>
              The library administration reserves the right to suspend or cancel the membership of any patron found guilty of:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Repeated violations of the silence policy after initial written or verbal warning.</li>
              <li>Disrespectful conduct toward fellow students, female scholars, or library supervisory staff.</li>
              <li>Intentional damage to library furnishings, climate equipment, or book stacks.</li>
            </ul>
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

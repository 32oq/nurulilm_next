'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Wifi, Users, ShieldCheck,
  Instagram, Facebook, Youtube,
  Search, Clock, MapPin, CheckCircle2,
  ArrowRight, BookOpen, Coffee, Flame,
  X, Loader2, Bookmark,
  Lightbulb, Landmark, Stethoscope, Compass,
  ChevronDown, ChevronUp, Zap, HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useOther } from '../context/OtherContext';
import { catalogService } from '../services/catalogService';
import PackagesPage from './PackagesPage';
import CommunityNotesWall from '../components/CommunityNotesWall';
import SavedBooksDrawer from '../components/SavedBooksDrawer';
import ReadingBayBlueprintMap from '../components/ReadingBayBlueprintMap';


const FacilityCard = ({ icon: Icon, title, text, specification }) => (
  <div className="bg-white dark:bg-[#111827] hairline-border rounded-2xl p-6 flex flex-col h-full shadow-2xs hover:shadow-md transition-all duration-200 hig-spring">
    <div className="flex items-center justify-between mb-4">
      <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-[#004B87] dark:text-blue-400 flex items-center justify-center border border-blue-500/15">
        <Icon size={22} strokeWidth={2} />
      </div>
      {specification && (
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 hairline-border px-2.5 py-1 rounded-full">
          {specification}
        </span>
      )}
    </div>
    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 leading-snug hig-title-2">
      {title}
    </h3>
    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-auto">
      {text}
    </p>
  </div>
);

const FACILITIES = [
  {
    icon: Users,
    title: 'Individual Study Carrels',
    text: 'Dedicated reading carrels with acoustic partition dividers, task lighting, and individual power sockets for uninterrupted concentration.',
    specification: 'Bay 1 & Bay 2'
  },
  {
    icon: Flame,
    title: 'Winter Climate Control',
    text: 'Continuous heating throughout cold Himalayan winters and cross-ventilation in summer to ensure comfortable reading hours year-round.',
    specification: 'Continuous Heating'
  },
  {
    icon: BookOpen,
    title: 'Physical & Digital Reference Stacks',
    text: 'Curated references across competitive exams (UPSC, JKAS, NEET, JEE), academic textbooks, literature, and solved question papers.',
    specification: 'Curated Stacks'
  },
  {
    icon: Wifi,
    title: 'Dual Fiber Broadband',
    text: 'Low-latency Wi-Fi tailored for academic video lectures, digital research papers, syllabus downloads, and online mock tests.',
    specification: '100 Mbps Dual ISP'
  },
  {
    icon: Coffee,
    title: 'Drinking Water & Prayer Space',
    text: 'Reverse-osmosis filtered drinking water, sanitary facilities, and a dedicated, peaceful prayer space on premise.',
    specification: 'On Premise'
  },
  {
    icon: ShieldCheck,
    title: 'Safe & Monitored Study Halls',
    text: 'CCTV monitored environment for male and female students with strict silence guidelines maintained by on-site library staff.',
    specification: 'Staff Supervised'
  },
];

/* ── FAQ Objection-Busting Data ───────────────────────────── */
const FAQS = [
  {
    q: 'Can I visit and inspect the reading hall before subscribing?',
    a: 'Yes, prospective students are welcome to visit during operating hours. You can tour the facility, inspect the carrel dividers, test the Wi-Fi speed, or start with a 1-day pass before committing to a monthly membership.'
  },
  {
    q: 'How does winter heating operate during severe snow in Handwara?',
    a: 'Heating runs continuously throughout all reading hours from November through March. Temperature is maintained at an optimal level for long study sessions without drowsiness.'
  },
  {
    q: 'What happens if there is a power outage in Handwara?',
    a: 'The library is equipped with a dedicated inverter and power backup system that keeps Wi-Fi, individual desk lighting, and essential hall illumination active without interruption.'
  },
  {
    q: 'Is the environment safe and quiet for female scholars?',
    a: 'Yes, safety and dignity are foundational. The library features continuous CCTV supervision, dedicated carrel bays, clean on-premise sanitary facilities, and strict silence enforced by library management.'
  },
  {
    q: 'Can members borrow physical books to take home?',
    a: 'Registered members with active passes can borrow up to two books at a time for a standard 14-day loan period, with instant online renewal available from the student dashboard.'
  }
];

export default function LandingPage({ setPage }) {
  const { state: { libraryTimings }, fetchLibraryTimings } = useOther();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Saved books study bag (in-memory & session-safe)
  const [savedBooks, setSavedBooks] = useState([]);
  const isLoadedRef = useRef(false);

  // Live Handwara / Kashmir time
  const [liveKashmirTime, setLiveKashmirTime] = useState('');

  // Study focus tracks
  const [selectedStudyTrack, setSelectedStudyTrack] = useState(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  // Act II Video ref (always muted ambient loop)
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playsInline = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          setTimeout(() => {
            if (video) video.play().catch(() => {});
          }, 500);
        });
      }
    }
  }, []);

  const STUDY_TRACKS = [
    {
      id: 'upsc',
      label: 'Civil Services & JKAS',
      icon: Landmark,
      category: 'Civil Services',
      tip: 'Full-day dedicated desk access allows deep, uninterrupted study routines for serious syllabus completion.',
    },
    {
      id: 'neet',
      label: 'NEET & Medical',
      icon: Stethoscope,
      category: 'Sciences',
      tip: 'Climate-controlled desks maintain energy through demanding question practice sessions.',
    },
    {
      id: 'jee',
      label: 'JEE & Engineering',
      icon: Compass,
      category: 'Sciences',
      tip: 'Dual fiber Wi-Fi and individual power sockets ensure reliable connectivity for video lectures.',
    },
    {
      id: 'readers',
      label: 'Literature & Research',
      icon: BookOpen,
      category: 'Literature',
      tip: 'Natural light desks and reference stacks provide a peaceful environment for serious reading.',
    },
  ];

  // Live Handwara / Kashmir time
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        setLiveKashmirTime(timeStr);
      } catch (_) {}
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (fetchLibraryTimings) fetchLibraryTimings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search with cancellation
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoadingBooks(true);
      try {
        const params = {};
        if (searchTerm && searchTerm.trim()) params.search = searchTerm.trim();
        if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
        const data = await catalogService.getBooks(params, { signal: controller.signal });
        setBooks(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
          console.error("Failed to load catalog from backend:", err);
        }
      } finally {
        setLoadingBooks(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const defaults = ["All", "Competitive Exams", "Sciences", "Regional History", "Civil Services", "NEET & JEE", "Literature"];
    const fromData = books.map(b => b.category).filter(Boolean);
    return Array.from(new Set([...defaults, ...fromData]));
  }, [books]);

  const activeTimings = libraryTimings?.data || libraryTimings;
  const openTime = activeTimings?.open_time || '';
  const closeTime = activeTimings?.close_time || '';
  const timingText = (openTime && closeTime) ? `${openTime} to ${closeTime}` : (openTime || closeTime || 'Open Daily');

  const toggleSaveBook = (book) => {
    const exists = savedBooks.some((b) => (b._id && b._id === book._id) || b.title === book.title);
    if (exists) {
      setSavedBooks(savedBooks.filter((b) => (b._id ? b._id !== book._id : b.title !== book.title)));
    } else {
      setSavedBooks([...savedBooks, book]);
    }
  };

  const isBookSaved = (book) => {
    return savedBooks.some((b) => (b._id && b._id === book._id) || b.title === book.title);
  };

  return (
    <div className="w-full bg-[#F6F8FB] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col min-h-screen transition-colors duration-150">

      {/* ── ACT I: THE HOOK & REALITY (HERO SECTION) ───────────── */}
      <section className="relative px-4 sm:px-8 lg:px-12 pt-12 sm:pt-16 pb-16 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Institutional Heritage Masthead Capsule */}
          <div className="inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-50/80 dark:bg-blue-950/60 text-[#004B87] dark:text-blue-300 hairline-border backdrop-blur-md shadow-2xs">
            <span className="uppercase tracking-widest text-[11px] font-bold">
              Nurul Ilm Library
            </span>
            <span className="text-slate-300 dark:text-slate-700 select-none">•</span>
            <span>Handwara, Kashmir</span>
            <span className="text-slate-300 dark:text-slate-700 select-none">•</span>
            <span className="text-slate-700 dark:text-slate-300">Open Daily ({timingText})</span>
            {liveKashmirTime && (
              <>
                <span className="text-slate-300 dark:text-slate-700 select-none">•</span>
                <span className="tabular-nums font-mono text-slate-500 dark:text-slate-400">
                  {liveKashmirTime} IST
                </span>
              </>
            )}
          </div>

          {/* Hero Headline with Apple Negative Optical Tracking */}
          <h1 className="hig-large-title text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.08] max-w-4xl mx-auto">
            The Quiet Academic Reading Room in Handwara.
          </h1>

          {/* Concrete, Grounded Subheadline */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto font-normal">
            Dedicated partitioned reading carrels, winter climate control, dual fiber broadband, and curated competitive exam stacks. Purpose-built for UPSC, JKAS, NEET, and serious scholars in Kupwara district.
          </p>

          {/* Hero CTA Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => setPage('packages')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#004B87] hover:bg-[#003865] text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer hig-spring"
            >
              <span>Explore Membership Passes</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('catalog-discovery');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/80 dark:bg-[#111827]/80 hairline-border text-slate-800 dark:text-slate-200 font-semibold text-sm hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition shadow-2xs cursor-pointer hig-spring backdrop-blur-md"
            >
              Browse Book Catalog
            </button>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Daily, shift &amp; monthly passes available • Physical center verification on first visit
          </p>
        </div>

        {/* ── TANGIBLE PRODUCT PROOF: VERIFIED READING BAY FLOORPLAN MAP ── */}
        <div className="mt-14 max-w-5xl mx-auto w-full">
          <ReadingBayBlueprintMap setPage={setPage} timingText={timingText} />
        </div>
      </section>

      {/* ── ACT II: INSTITUTIONAL TRUST & BLUEPRINT GRID BAND ── */}
      <section className="hairline-t hairline-b material-chrome">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="border-l-2 border-[#004B87] pl-4">
            <span className="text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider block mb-1">
              Study Hall Hours
            </span>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
              {(openTime && closeTime) ? `${openTime} – ${closeTime}` : '7:00 AM – 10:00 PM'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Monday through Sunday</p>
          </div>
          <div className="border-l-2 border-emerald-600 pl-4">
            <span className="text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider block mb-1">
              Physical Location
            </span>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              New Bus Stand Rd
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Handwara, 193221</p>
          </div>
          <div className="border-l-2 border-blue-600 pl-4">
            <span className="text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider block mb-1">
              Study Capacity
            </span>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Dedicated Carrels
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Partitioned desks with individual plugs</p>
          </div>
          <div className="border-l-2 border-amber-600 pl-4">
            <span className="text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider block mb-1">
              Utilities
            </span>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Dual Fiber + Heating
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Inverter backup &amp; hot water</p>
          </div>
        </div>
      </section>

      {/* ── ACT II: PROBLEM-AWARE AGITATION & PHYSICAL SANCTUARY PROOF (FOLD 2) ── */}
      <section className="px-4 sm:px-8 py-14 max-w-5xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#004B87] dark:text-blue-400">
            The Reality of Preparing in Kashmir
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1.5">
            Your Rank Shouldn’t Depend on Power Cuts or Freezing Rooms
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Every winter in North Kashmir, serious aspirants lose hundreds of hours to sub-zero temperatures, sudden power cuts, and noisy domestic interruptions. Competing against candidates across India requires continuous warmth, reliable dual-fiber connectivity, and unbroken silence.
          </p>
        </div>

        {/* Video & Sanctuary Card */}
        <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
          {/* Real Video Player */}
          <div className="relative w-full aspect-video sm:aspect-[16/8] md:aspect-[21/9] overflow-hidden bg-black group">
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover brightness-[0.78] contrast-[1.06]"
            >
              <source src="/lib.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/30 pointer-events-none" />

            {/* Physical Facility Verification Badge */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-1.5 bg-slate-950/40 sm:bg-slate-900/90 backdrop-blur-xs sm:backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 sm:border-slate-700/70 text-slate-200 text-[11px]">
              <MapPin size={13} className="text-blue-400 flex-shrink-0" />
              <span className="font-semibold text-white">Physical Study Hall</span>
              <span className="text-slate-300 sm:text-slate-400 hidden sm:inline">• Handwara Center</span>
            </div>

            {/* Bottom Floating Bar: Apple Translucent Glass Bar */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-6 sm:right-6 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/40 sm:bg-slate-950/70 backdrop-blur-xl saturate-180 border border-white/10 rounded-2xl px-4 py-3 shadow-xl">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Quiet Reading Hall &amp; Partitioned Carrels</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 sm:text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">Quiet Floor</span>
                </p>
                <p className="text-[10.5px] sm:text-[11px] text-slate-200 sm:text-slate-400 mt-0.5 leading-snug">
                  Climate-controlled, continuous heating, and dedicated inverter power for full-day study sessions.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setPage('packages')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#004B87] hover:bg-[#003B6A] text-white text-xs font-semibold px-5 py-2.5 rounded-full transition cursor-pointer hig-spring shadow-xs"
                >
                  <span>Reserve a Carrel</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* 3 Agitation & Relief Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 bg-[#0A192F]/95 p-5 sm:p-6 text-slate-300">
            <div className="py-3 md:py-0 md:px-4 first:pt-0 first:pl-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-rose-500/20 text-rose-300 font-mono text-[11px] font-bold flex items-center justify-center">01</span>
                <h3 className="text-xs font-bold text-white">The Sub-Zero Winter Barrier</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Freezing rooms sap mental stamina and slow handwriting. Nurul Ilm maintains continuous heating from November through March so your focus never drops.
              </p>
            </div>

            <div className="py-3 md:py-0 md:px-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold flex items-center justify-center">02</span>
                <h3 className="text-xs font-bold text-white">Erratic Power &amp; Wi-Fi Drops</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Dedicated inverter backup and dual 100 Mbps fiber ensure your online test series and video lectures run without a single disconnect.
              </p>
            </div>

            <div className="py-3 md:py-0 md:px-4 last:pb-0 last:pr-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-300 font-mono text-[11px] font-bold flex items-center justify-center">03</span>
                <h3 className="text-xs font-bold text-white">Domestic Noise &amp; Friction</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                48 partitioned reading carrels with strict silence enforced by staff. Your desk, your books, undisturbed for 10+ hours a day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ACT III: STUDY FIELD ALIGNMENT (TRACK SELECTOR) ──── */}
      <section className="px-4 sm:px-8 py-14 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Aspirant Tracks
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 hig-title-2">
            Tailored for Your Syllabus and Exam Routine
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Choose your academic track for recommended study shifts, desk arrangements, and catalog references.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {STUDY_TRACKS.map((track) => {
            const isSelected = selectedStudyTrack?.id === track.id;
            const TrackIcon = track.icon;
            return (
              <button
                key={track.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedStudyTrack(null);
                    setSelectedCategory('All');
                  } else {
                    setSelectedStudyTrack(track);
                    setSelectedCategory(track.category);
                  }
                }}
                className={`p-5 rounded-2xl hairline-border text-left transition-all duration-150 cursor-pointer hig-spring select-none ${
                  isSelected
                    ? 'bg-[#004B87] text-white border-[#004B87] shadow-sm'
                    : 'bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-500/10 text-[#004B87] dark:text-blue-400'
                }`}>
                  <TrackIcon size={19} />
                </div>
                <h3 className="text-sm font-bold block leading-snug">{track.label}</h3>
                <p className={`text-[11px] mt-1.5 line-clamp-2 leading-relaxed ${
                  isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {track.tip}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── ACT IV: PHYSICAL STUDY FACILITIES & SPECIFICATIONS ─ */}
      <section className="px-4 sm:px-8 py-14 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Study Infrastructure
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Standard of Study Facilities
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">
            Engineered to eliminate domestic distractions with dependable utilities in Handwara.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FACILITIES.map((f, i) => (
            <FacilityCard key={i} {...f} />
          ))}
        </div>
      </section>

      {/* ── ACT V: INTERACTIVE CATALOG & DISCOVERY ───────────── */}
      <section id="catalog-discovery" className="bg-white dark:bg-[#0B0F19] hairline-t hairline-b py-16 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Library Stacks
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 hig-title-2">
                Browse Books and Reference Materials
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Search available titles in our physical collection and digital reference archive.
              </p>
            </div>
            <button
              onClick={() => setPage('login')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#004B87] dark:text-blue-400 hover:underline cursor-pointer hig-spring"
            >
              <span>Sign in to reserve books</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Search bar & Category filters */}
          <div className="space-y-3.5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-lg">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, author, subject, or ISBN..."
                  className="w-full h-11 bg-slate-100/80 dark:bg-slate-900/80 hairline-border rounded-full pl-10 pr-10 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 shadow-2xs backdrop-blur-sm"
                />
                {loadingBooks ? (
                  <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
                ) : searchTerm ? (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer hig-spring-press"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                ) : null}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                {loadingBooks ? (
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Loader2 size={12} className="animate-spin" />
                    Searching catalog...
                  </span>
                ) : (
                  <span>
                    Found <strong className="text-slate-800 dark:text-slate-200 tabular-nums">{books.length}</strong> title{books.length === 1 ? '' : 's'}
                  </span>
                )}
                {searchTerm && (
                  <button
                    onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                    className="text-xs font-semibold text-[#004B87] dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    (Reset)
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer select-none hig-spring ${
                    selectedCategory === cat
                      ? "bg-[#004B87] text-white shadow-2xs"
                      : "bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hairline-border hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Books grid */}
          {loadingBooks && books.length === 0 ? (
            <div className="w-full py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin text-[#004B87] dark:text-blue-400" />
              <p className="text-xs text-slate-500">Loading catalog titles...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="material-card hairline-border rounded-2xl p-8 text-center max-w-md mx-auto my-6 space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center mx-auto">
                <BookOpen size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 hig-title-2">No Titles Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                No matching books found for "{searchTerm || selectedCategory}".
              </p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#004B87] text-white text-xs font-semibold rounded-full hover:bg-[#003865] transition cursor-pointer hig-spring shadow-xs"
              >
                Clear Filters &amp; View All Books
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {books.map((book, idx) => (
                <div
                  key={book._id || idx}
                  onClick={() => setSelectedBook(book)}
                  className="bg-white dark:bg-[#111827] hairline-border rounded-2xl p-4.5 flex flex-col justify-between hover:shadow-md transition-all duration-200 cursor-pointer group hig-spring select-none"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className="font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hairline-border px-2.5 py-0.5 rounded-full text-[10px] truncate max-w-[130px]">
                        {book.category || 'General'}
                      </span>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveBook(book);
                        }}
                        className={`p-1 rounded-full transition hig-spring-press ${
                          isBookSaved(book)
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                        title={isBookSaved(book) ? 'Saved in Study Bag' : 'Save for later'}
                      >
                        <Bookmark size={14} className={isBookSaved(book) ? 'fill-amber-600 dark:fill-amber-400' : ''} />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 group-hover:text-[#004B87] dark:group-hover:text-blue-400 hig-title-2">
                      {book.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{book.author}</p>
                    {book.description && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {book.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 hairline-t flex items-center justify-between text-[11px]">
                    {Number(book.availability ?? 1) > 0 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold text-[10px] tabular-nums">
                        <CheckCircle2 size={11} /> {book.availability} Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 font-semibold text-[10px]">
                        Checked Out
                      </span>
                    )}
                    <span className="font-semibold text-[#004B87] dark:text-blue-400 group-hover:underline flex items-center gap-1 text-[11px]">
                      <span>Details</span>
                      <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Book Detail Modal ─────────────────────────────── */}
      {selectedBook && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedBook(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="material-card hairline-border rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150"
          >
            <button
              onClick={() => setSelectedBook(null)}
              className="hig-touch-target absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer hig-spring-press"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hairline-border">
                {selectedBook.category || 'Reference'}
              </span>
              {Number(selectedBook.availability ?? 1) > 0 ? (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 tabular-nums">
                  <CheckCircle2 size={12} /> {selectedBook.availability} Copies Available
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Currently Checked Out
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug hig-title-2">
                {selectedBook.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Authored by <strong className="text-slate-900 dark:text-slate-100">{selectedBook.author}</strong>
              </p>
              {selectedBook.isbn && (
                <p className="text-xs text-slate-500 font-mono mt-0.5 tabular-nums">
                  ISBN: {selectedBook.isbn}
                </p>
              )}
            </div>

            {selectedBook.description && (
              <div className="p-3.5 bg-slate-50/80 dark:bg-slate-900/60 hairline-border rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Book Summary / Notes:</p>
                <p>{selectedBook.description}</p>
              </div>
            )}

            <div className="pt-3 hairline-t flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => toggleSaveBook(selectedBook)}
                className={`w-full sm:w-auto py-2.5 px-5 rounded-full text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer hig-spring ${
                  isBookSaved(selectedBook)
                    ? 'bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800'
                    : 'bg-white dark:bg-[#111827] hairline-border text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs'
                }`}
              >
                <Bookmark size={13} className={isBookSaved(selectedBook) ? 'fill-amber-600' : ''} />
                <span>{isBookSaved(selectedBook) ? 'Saved' : 'Save in Bag'}</span>
              </button>
              <button
                onClick={() => { setSelectedBook(null); setPage('login'); }}
                className="w-full sm:flex-1 py-2.5 px-5 bg-[#004B87] hover:bg-[#003865] text-white rounded-full text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer hig-spring"
              >
                <BookOpen size={13} />
                <span>Sign In to Borrow</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ACT VII: MEMBERSHIP PACKAGES ─────────────────────── */}
      <section className="bg-white dark:bg-[#111827] hairline-t hairline-b py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <PackagesPage setPage={setPage} />
        </div>
      </section>

      {/* ── ACT VIII: COMMUNITY NOTES BULLETIN ───────────────── */}
      <CommunityNotesWall />

      {/* ── ACT IX: OBJECTION-BUSTING INTERACTIVE FAQS ───────── */}
      <section className="px-4 sm:px-8 py-16 max-w-3xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Common Inquiries
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 hig-title-2">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Operational details regarding study hours, winter climate, and memberships.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#111827] hairline-border rounded-2xl overflow-hidden shadow-2xs transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer select-none hig-spring"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    {faq.q}
                  </span>
                  <div className={`p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#004B87] dark:text-blue-400' : ''}`}>
                    <ChevronDown size={16} />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed hairline-t">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── ACT X: INSTITUTION HERITAGE & LOCATION ──────────── */}
      <section className="px-4 sm:px-8 pb-16 max-w-5xl mx-auto w-full">
        <div className="bg-white dark:bg-[#111827] hairline-border rounded-3xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="p-6 sm:p-8 space-y-5 lg:border-r hairline-border border-y-0 border-l-0 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Our Mission
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 hig-title-2">
                    Nurul Ilm Library
                  </h3>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Founded in 2024 by <strong>Zubair Peerzada</strong>, a software engineer from Handwara,
                  Nurul Ilm was established to solve a pressing educational constraint: the lack of peaceful, climate-controlled study desks with dependable electricity in North Kashmir.
                </p>

                <div className="space-y-3 pt-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-[#004B87] dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Main Facility</p>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">New Bus Stand Road, Handwara, 193221</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock size={16} className="text-[#004B87] dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Operating Schedule</p>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] font-mono tabular-nums">
                        {activeTimings?.days || 'Monday – Sunday'}: {timingText}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 hairline-t">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2.5">Official Social Channels</p>
                <div className="flex gap-2.5">
                  <a
                    href="https://www.instagram.com/nurililmlibrary/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#004B87] hover:text-white flex items-center justify-center transition-all hig-spring shadow-2xs"
                    aria-label="Instagram"
                  >
                    <Instagram size={17} />
                  </a>
                  <a
                    href="https://www.facebook.com/nurulilmlibrary"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#004B87] hover:text-white flex items-center justify-center transition-all hig-spring shadow-2xs"
                    aria-label="Facebook"
                  >
                    <Facebook size={17} />
                  </a>
                  <a
                    href="https://www.youtube.com/@nurulilmlibrary/shorts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#004B87] hover:text-white flex items-center justify-center transition-all hig-spring shadow-2xs"
                    aria-label="YouTube"
                  >
                    <Youtube size={17} />
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 h-[340px] lg:h-auto bg-slate-100 dark:bg-slate-800">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3292.080113091947!2d74.2849025!3d34.399309599999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38e11d004a779b3f%3A0x3f8b1439d4793aac!2sNurul%20Ilm%20Library!5e0!3m2!1sen!2sin!4v1766295492374!5m2!1sen!2sin"
                referrerPolicy="no-referrer-when-downgrade"
                loading="lazy"
                className="w-full h-full border-0"
                title="Nurul Ilm Library Location Map"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Saved Books Study Bag Drawer ───────────────────── */}
      <SavedBooksDrawer
        savedBooks={savedBooks}
        onRemoveBook={(bookIdOrTitle) => {
          setSavedBooks((prev) =>
            prev.filter((b) => ((b._id && b._id !== bookIdOrTitle) || (!b._id && b.title !== bookIdOrTitle)))
          );
        }}
        onClearAll={() => setSavedBooks([])}
        setPage={setPage}
      />

    </div>
  );
}

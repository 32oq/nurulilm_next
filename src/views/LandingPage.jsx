'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  Wifi, Users, ShieldCheck,
  Instagram, Facebook, Youtube,
  Search, Clock, MapPin, CheckCircle2,
  ArrowRight, BookOpen, Coffee, Flame,
  X, Loader2, Bookmark,
  Lightbulb, Landmark, Stethoscope, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOther } from '../context/OtherContext';
import { getApiBase } from '../config/api';
import PackagesPage from './PackagesPage';
import EmotionalHook from '../components/EmotionalHook';
import CommunityNotesWall from '../components/CommunityNotesWall';
import SavedBooksDrawer from '../components/SavedBooksDrawer';

/* ── Shared animation presets ─────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay },
});

/* ── Feature card ─────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, text, tag, index }) => (
  <motion.div
    {...fadeUp(index * 0.06)}
    className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-6 sm:p-7 shadow-xs hover:border-[#33462C]/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="w-11 h-11 rounded-xl bg-[#EFF4EC] dark:bg-[#1E2E25] text-[#33462C] dark:text-[#8FD4AE] flex items-center justify-center">
        <Icon size={22} strokeWidth={1.8} />
      </div>
      {tag && (
        <span className="text-[11px] font-semibold tracking-wide text-[#24341E] dark:text-[#8FD4AE] bg-[#EFF4EC] dark:bg-[#1E2E25] border border-[#DFE6DC] dark:border-[#2C4133] px-2.5 py-0.5 rounded-md">
          {tag}
        </span>
      )}
    </div>
    <h3 className="font-serif-lib text-lg font-bold text-[#24341E] dark:text-[#8FD4AE] mb-2 leading-snug">
      {title}
    </h3>
    <p className="text-sm text-[#0B0E0A] dark:text-[#9FB1A6] leading-relaxed mt-auto">
      {text}
    </p>
  </motion.div>
);

const FEATURES = [
  {
    icon: Users,
    title: 'Dedicated Quiet Study Desks',
    text: 'Individual reading carrels with ergonomic seating, personal task lighting, and individual power sockets for non-stop focus.',
    tag: 'Quiet Zone'
  },
  {
    icon: Flame,
    title: 'Winter Climate Control',
    text: 'Thoughtfully heated during cold Himalayan winters and ventilated in summer to ensure uninterrupted, comfortable study hours.',
    tag: 'All Season'
  },
  {
    icon: BookOpen,
    title: 'Comprehensive Physical & Digital Catalog',
    text: 'Curated references across competitive exams (UPSC, JKSSB, NEET, JEE), academic textbooks, literature, and digital study resources.',
    tag: 'Study Resources'
  },
  {
    icon: Wifi,
    title: 'High-Speed Fiber Connectivity',
    text: 'Reliable, low-latency Wi-Fi tailored for online research, recorded lectures, digital journals, and document downloads.',
    tag: 'Uninterrupted'
  },
  {
    icon: Coffee,
    title: 'Hygienic Facilities & Prayer Room',
    text: 'Clean reverse-osmosis drinking water, clean sanitary facilities, and a dedicated, peaceful prayer area on premise.',
    tag: 'Comfort'
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Disciplined Environment',
    text: 'CCTV monitored, safe for male and female students with strict silence guidelines maintained by on-site library administration.',
    tag: 'Safe & Monitored'
  },
];

/* ── Main component ───────────────────────────────────── */
const LandingPage = ({ setPage }) => {
  const { state: { libraryTimings }, fetchLibraryTimings } = useOther();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Human interactive states: saved reading list, study track, live time
  const [selectedStudyTrack, setSelectedStudyTrack] = useState(null);
  const [liveKashmirTime, setLiveKashmirTime] = useState('');
  const [savedBooks, setSavedBooks] = useState([]);
  const isLoadedRef = useRef(false);

  const STUDY_TRACKS = [
    {
      id: 'upsc',
      label: 'Civil Services & JKAS',
      icon: Landmark,
      category: 'Civil Services',
      tip: 'Morning study desks (7:00 AM - 1:00 PM) offer deep quiet favored by syllabus completers.',
    },
    {
      id: 'neet',
      label: 'NEET & Medical',
      icon: Stethoscope,
      category: 'Sciences',
      tip: 'Climate-controlled desks maintain energy through demanding 10-hour question marathons.',
    },
    {
      id: 'jee',
      label: 'JEE & Engineering',
      icon: Compass,
      category: 'Sciences',
      tip: 'High-speed Wi-Fi and individual power bays ensure zero lag for lectures and mock tests.',
    },
    {
      id: 'readers',
      label: 'Literature & Research',
      icon: BookOpen,
      category: 'Literature',
      tip: 'Natural light alcoves and reference stacks provide a peaceful sanctuary for contemplative reading.',
    },
  ];

  // Load saved books once on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nurulilm_saved_books');
      if (saved) setSavedBooks(JSON.parse(saved));
    } catch {
      // ignore
    } finally {
      isLoadedRef.current = true;
    }
  }, []);

  // Save books to localStorage after initial mount
  useEffect(() => {
    if (!isLoadedRef.current) return;
    try {
      localStorage.setItem('nurulilm_saved_books', JSON.stringify(savedBooks));
    } catch (e) {
      console.warn('Could not save reading list:', e);
    }
  }, [savedBooks]);

  // Live Kashmir / Handwara time
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
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    if (fetchLibraryTimings) fetchLibraryTimings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Live debounced search from backend with cancellation
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoadingBooks(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm && searchTerm.trim()) params.append('search', searchTerm.trim());
        if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
        const qs = params.toString();
        const url = `${getApiBase()}/dashboard/resources${qs ? '?' + qs : ''}`;
        const response = await axios.get(url, { signal: controller.signal });
        const data = response?.data?.results?.data || [];
        setBooks(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!axios.isCancel(err) && err?.name !== 'CanceledError') {
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

  const openTime = libraryTimings?.open_time || '07:00 AM';
  const closeTime = libraryTimings?.close_time || '09:00 PM';

  return (
    <div className="w-full bg-[#FCFCFB] dark:bg-[#0E1411] text-[#0B0E0A] dark:text-[#E5EBE7] flex flex-col min-h-screen transition-colors duration-200">

      {/* ── Editorial Hero ─────────────────────────────────── */}
      <section className="relative px-4 sm:px-8 lg:px-12 pt-10 sm:pt-16 pb-16 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1E2B23] border border-[#DFE6DC] dark:border-[#2B3D31] text-xs text-[#0B0E0A] dark:text-[#9FB3A6] shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#52D38A] animate-pulse"></span>
              <span className="font-semibold text-[#24341E] dark:text-white">Study Halls Open Daily</span>
              <span className="text-[#33462C]/30">·</span>
              <span>{openTime} - {closeTime}</span>
              {liveKashmirTime && (
                <>
                  <span className="text-[#33462C]/30">·</span>
                  <span className="font-mono text-[#33462C] dark:text-[#8FD4AE] font-semibold">{liveKashmirTime} Handwara</span>
                </>
              )}
            </motion.div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif-lib text-3xl sm:text-5xl lg:text-6xl font-bold text-[#24341E] dark:text-[#8FD4AE] leading-[1.15] tracking-tight"
          >
            Nurul Ilm Public Library &amp; Academic Reading Room
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-[#0B0E0A] dark:text-[#9FB1A6] leading-relaxed"
          >
            Handwara's dedicated study centre in North Kashmir. Equipped with individual quiet carrels,
            climate-controlled winter heating, high-speed fiber connectivity, and curated reference stacks for competitive exam aspirants.
          </motion.p>

          {/* Quick CTA Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <button
              onClick={() => setPage('packages')}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#33462C] dark:bg-[#346F4F] text-white font-semibold text-sm hover:bg-[#24341E] dark:hover:bg-[#3F845F] transition shadow-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>Explore Memberships</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setPage('login')}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white dark:bg-[#16221B] border border-[#DFE6DC] dark:border-[#2C3F33] text-[#24341E] dark:text-[#8FD4AE] font-semibold text-sm hover:border-[#33462C] hover:bg-[#EFF4EC] transition shadow-xs active:scale-95 cursor-pointer"
            >
              Member Sign In
            </button>
          </motion.div>

          {/* Interactive Human Study Track Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-6 max-w-2xl mx-auto"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#33462C] dark:text-[#88B89C] block mb-2.5">
              Personalize Your Study Track
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                    className={`p-3 rounded-2xl text-left border transition-all active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-[#33462C] text-white border-[#33462C] shadow-md dark:bg-[#346F4F] dark:border-[#52D38A]'
                        : 'bg-white dark:bg-[#17241C] border-[#DFE6DC] dark:border-[#283A2E] text-[#0B0E0A] dark:text-[#E8EFEA] hover:border-[#33462C]/40 hover:shadow-xs hover:bg-[#EFF4EC]/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#EFF4EC] dark:bg-[#1E2E25] text-[#33462C] dark:text-[#8FD4AE]'
                    }`}>
                      <TrackIcon size={16} />
                    </div>
                    <span className="text-xs font-bold block leading-snug">{track.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Personalized Librarian Tip */}
            {selectedStudyTrack && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3.5 p-3.5 rounded-2xl bg-[#EFF4EC] dark:bg-[#1E2E25] border border-[#DFE6DC] dark:border-[#2C4134] text-xs text-[#24341E] dark:text-[#A1DEBC] text-left flex items-start gap-2.5 shadow-2xs"
              >
                <Lightbulb size={16} className="text-[#33462C] dark:text-[#52D38A] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{selectedStudyTrack.label} Study Insight:</p>
                  <p className="text-[11px] text-[#0B0E0A] dark:text-[#8CBBA0] mt-0.5">{selectedStudyTrack.tip}</p>
                </div>
                <button
                  onClick={() => {
                    const el = document.getElementById('catalog-discovery');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="underline text-[11px] font-semibold text-[#33462C] dark:text-[#52D38A] hover:text-[#0B0E0A] whitespace-nowrap cursor-pointer"
                >
                  View Books ↓
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* ── Key Library Facts Band ──────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 mt-12 pt-8 border-t border-[#DFE6DC] dark:border-[#26362D]">
          <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-4.5 text-center shadow-xs hover:shadow-sm transition-all">
            <span className="text-[11px] uppercase font-semibold text-[#33462C] dark:text-[#8EA596] tracking-wider block mb-1">Operating Hours</span>
            <p className="font-serif-lib text-lg sm:text-xl font-bold text-[#24341E] dark:text-[#8FD4AE]">{openTime} - {closeTime}</p>
            <p className="text-[11px] text-[#0B0E0A] dark:text-[#9EAEA3] mt-0.5">{libraryTimings?.days || 'Open 7 days a week'}</p>
          </div>
          <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-4.5 text-center shadow-xs hover:shadow-sm transition-all">
            <span className="text-[11px] uppercase font-semibold text-[#33462C] dark:text-[#8EA596] tracking-wider block mb-1">Campus Location</span>
            <p className="font-serif-lib text-lg sm:text-xl font-bold text-[#24341E] dark:text-[#8FD4AE]">New Bus Stand Rd</p>
            <p className="text-[11px] text-[#0B0E0A] dark:text-[#9EAEA3] mt-0.5">Handwara, 193221</p>
          </div>
          <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-4.5 text-center shadow-xs hover:shadow-sm transition-all">
            <span className="text-[11px] uppercase font-semibold text-[#33462C] dark:text-[#8EA596] tracking-wider block mb-1">Study Facilities</span>
            <p className="font-serif-lib text-lg sm:text-xl font-bold text-[#24341E] dark:text-[#8FD4AE]">Dedicated Carrels</p>
            <p className="text-[11px] text-[#0B0E0A] dark:text-[#9EAEA3] mt-0.5">Power sockets &amp; winter heating</p>
          </div>
          <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-4.5 text-center shadow-xs hover:shadow-sm transition-all">
            <span className="text-[11px] uppercase font-semibold text-[#33462C] dark:text-[#8EA596] tracking-wider block mb-1">Curated Stacks</span>
            <p className="font-serif-lib text-lg sm:text-xl font-bold text-[#24341E] dark:text-[#8FD4AE]">Exam &amp; Reference</p>
            <p className="text-[11px] text-[#0B0E0A] dark:text-[#9EAEA3] mt-0.5">JKAS, UPSC, NEET &amp; Academics</p>
          </div>
        </div>
      </section>

      {/* ── Practical Book Discovery / Catalog Preview ─────── */}
      <section id="catalog-discovery" className="bg-white dark:bg-[#121B16] border-y border-[#DFE6DC] dark:border-[#24362B] py-14 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#33462C] dark:text-[#8EA596]">Catalog Discovery</span>
              <h2 className="font-serif-lib text-2xl sm:text-3xl font-bold text-[#24341E] dark:text-[#8FD4AE] mt-1">
                Explore Available Books &amp; Study Materials
              </h2>
              <p className="text-sm text-[#0B0E0A] dark:text-[#9FB1A6] mt-1">
                Browse curated collections available for reading and borrowing at Nurul Ilm Library.
              </p>
            </div>
            <button
              onClick={() => setPage('login')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#33462C] dark:text-[#8FD4AE] hover:text-[#24341E] self-start md:self-auto group cursor-pointer"
            >
              <span>Sign in to reserve titles</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Search bar & Category filters */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-xl">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#33462C]/50" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, author, subject, or ISBN..."
                  className="w-full bg-[#FCFCFB] dark:bg-[#15201A] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#0B0E0A] dark:text-[#E8EFEA] placeholder-[#8A928C] focus:outline-none focus:border-[#33462C] focus:ring-2 focus:ring-[#33462C]/10 transition-colors shadow-2xs"
                />
                {loadingBooks ? (
                  <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#33462C] dark:text-[#8FD4AE] animate-spin" />
                ) : searchTerm ? (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#33462C]/60 hover:text-[#24341E] p-0.5 cursor-pointer"
                    title="Clear search"
                  >
                    <X size={15} />
                  </button>
                ) : null}
              </div>

              <div className="text-xs text-[#33462C] dark:text-[#8EA596] flex items-center gap-2">
                {loadingBooks ? (
                  <span className="flex items-center gap-1.5 text-[#33462C] dark:text-[#8FD4AE] font-medium">
                    <Loader2 size={12} className="animate-spin" />
                    Searching database...
                  </span>
                ) : (
                  <span>
                    Found <strong className="text-[#24341E] dark:text-[#8FD4AE]">{books.length}</strong> title{books.length === 1 ? '' : 's'} in catalog
                  </span>
                )}
                {searchTerm && (
                  <button
                    onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                    className="text-xs font-semibold text-[#33462C] dark:text-[#8FD4AE] hover:underline cursor-pointer"
                  >
                    (Reset)
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#33462C] text-white shadow-xs dark:bg-[#346F4F]"
                      : "bg-white dark:bg-[#1A261F] text-[#0B0E0A] dark:text-[#A1B3A7] border border-[#DFE6DC] dark:border-[#2B3D31] hover:bg-[#EFF4EC] hover:text-[#24341E]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Books grid */}
          {loadingBooks && books.length === 0 ? (
            <div className="w-full py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 size={24} className="animate-spin text-[#33462C]" />
              <p className="text-xs text-[#33462C]">Searching Nurul Ilm Library catalog...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto my-6 space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#EFF4EC] dark:bg-[#1E2E25] text-[#33462C] dark:text-[#8FD4AE] flex items-center justify-center mx-auto">
                <BookOpen size={24} />
              </div>
              <h3 className="font-serif-lib text-xl font-bold text-[#24341E] dark:text-[#8FD4AE]">No Titles Found</h3>
              <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6] leading-relaxed">
                We couldn't find any books matching <span className="font-semibold text-[#24341E] dark:text-white">"{searchTerm || selectedCategory}"</span> in the central catalog.
              </p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#33462C] text-white text-xs font-semibold rounded-xl hover:bg-[#24341E] transition shadow-xs cursor-pointer"
              >
                <span>Clear Filters &amp; View All Books</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {books.map((book, idx) => (
                <div
                  key={book._id || idx}
                  onClick={() => setSelectedBook(book)}
                  className="bg-white dark:bg-[#17231B] border border-[#DFE6DC] dark:border-[#273B2E] rounded-2xl p-4.5 flex flex-col justify-between shadow-xs hover:border-[#33462C]/40 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group relative"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#33462C] dark:text-[#88B89C] mb-2.5">
                      <span className="font-medium bg-[#EFF4EC] dark:bg-[#1D2D23] text-[#24341E] dark:text-[#8FD4AE] border border-[#DFE6DC] dark:border-[#2D4234] px-2.5 py-0.5 rounded-md truncate max-w-[130px]">
                        {book.category || 'General'}
                      </span>
                      
                      {/* Interactive Bookmark Ribbon */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveBook(book);
                        }}
                        className={`p-1.5 rounded-lg transition active:scale-90 ${
                          isBookSaved(book)
                            ? 'text-[#C4704B] bg-[#FFF2EB] dark:bg-[#2F241C]'
                            : 'text-[#33462C]/40 hover:text-[#24341E] dark:hover:text-white hover:bg-[#EFF4EC] dark:hover:bg-white/5'
                        }`}
                        title={isBookSaved(book) ? 'Saved in Study Bag' : 'Save to Study Bag'}
                      >
                        <Bookmark size={15} className={isBookSaved(book) ? 'fill-[#C4704B]' : ''} />
                      </button>
                    </div>

                    <h4 className="font-serif-lib text-base font-bold text-[#24341E] dark:text-[#E8F1EC] leading-snug line-clamp-2 group-hover:text-[#33462C] dark:group-hover:text-[#8FD4AE]">
                      {book.title}
                    </h4>
                    <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6] mt-1 font-medium">{book.author}</p>
                    {book.description && (
                      <p className="text-[11px] text-[#0B0E0A]/80 dark:text-[#7A8C81] mt-2 line-clamp-2 leading-relaxed">
                        {book.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#DFE6DC] dark:border-[#263A2E] flex items-center justify-between text-[11px]">
                    {Number(book.availability ?? 1) > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[#2E6B3F] dark:text-[#6BC68F] font-semibold text-[10px]">
                        <CheckCircle2 size={11} /> {book.availability} Copies
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#A83232] dark:text-[#E06D6D] font-semibold text-[10px]">
                        Checked Out
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBook(book);
                      }}
                      className="font-semibold text-[#33462C] dark:text-[#8FD4AE] group-hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Details</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Book Detail Modal ─────────────────────────────── */}
      <AnimatePresence>
        {selectedBook && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setSelectedBook(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#273B2E] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5"
            >
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute top-5 right-5 p-1.5 text-[#24341E] hover:text-black dark:text-[#8FD4AE] rounded-lg hover:bg-[#EFF4EC] dark:hover:bg-[#1E2E25] transition cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#EFF4EC] dark:bg-[#1E2E25] text-[#24341E] dark:text-[#8FD4AE] border border-[#DFE6DC] dark:border-[#2C4133]">
                  {selectedBook.category || 'Reference'}
                </span>
                {Number(selectedBook.availability ?? 1) > 0 ? (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#EFF4EC] text-[#2E6B3F] border border-[#DFE6DC] flex items-center gap-1">
                    <CheckCircle2 size={12} /> {selectedBook.availability} Copies Available
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#FAF0F0] text-[#A83232] border border-[#F0D5D5]">
                    Currently Checked Out
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-serif-lib text-2xl font-bold text-[#24341E] dark:text-[#8FD4AE] leading-tight">
                  {selectedBook.title}
                </h3>
                <p className="text-sm text-[#0B0E0A] dark:text-[#9FB1A6] mt-1 font-medium">
                  Authored by <strong className="text-[#24341E] dark:text-white">{selectedBook.author}</strong>
                </p>
                {selectedBook.isbn && (
                  <p className="text-xs text-[#0B0E0A]/70 dark:text-[#8EA596] font-mono mt-0.5">
                    ISBN: {selectedBook.isbn}
                  </p>
                )}
              </div>

              {selectedBook.description && (
                <div className="p-3.5 bg-[#EFF4EC]/60 dark:bg-[#19241E] border border-[#DFE6DC] dark:border-[#273B2E] rounded-xl text-xs text-[#0B0E0A] dark:text-[#D5E1D9] leading-relaxed">
                  <p className="font-semibold text-[#24341E] dark:text-[#8FD4AE] mb-1">Book Summary / Notes:</p>
                  <p>{selectedBook.description}</p>
                </div>
              )}

              <div className="pt-3 border-t border-[#DFE6DC] dark:border-[#26362D] flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleSaveBook(selectedBook)}
                  className={`w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                    isBookSaved(selectedBook)
                      ? 'bg-[#FFF2EB] text-[#C4704B] border-[#F2DACB]'
                      : 'bg-white dark:bg-[#1E2E25] border-[#DFE6DC] dark:border-[#2B3E32] text-[#24341E] dark:text-[#8FD4AE] hover:bg-[#EFF4EC]'
                  }`}
                >
                  <Bookmark size={14} className={isBookSaved(selectedBook) ? 'fill-[#C4704B]' : ''} />
                  <span>{isBookSaved(selectedBook) ? 'Saved in Study Bag' : 'Save to Study Bag'}</span>
                </button>
                <button
                  onClick={() => { setSelectedBook(null); setPage('login'); }}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-[#33462C] hover:bg-[#24341E] text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <BookOpen size={14} />
                  <span>Sign In to Borrow / Issue</span>
                </button>
                <button
                  onClick={() => { setSelectedBook(null); setPage('register'); }}
                  className="w-full sm:w-auto py-2.5 px-4 bg-white dark:bg-[#16221B] border border-[#DFE6DC] dark:border-[#2B3E32] hover:border-[#33462C] text-[#24341E] dark:text-[#8FD4AE] rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Join Membership
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Architectural Showcase / Video Plaque ────────── */}
      <EmotionalHook />

      {/* ── Library Facilities & Standard of Study ────────── */}
      <section className="px-4 sm:px-8 lg:px-12 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#33462C] dark:text-[#8EA596]">Study Facilities</span>
          <h2 className="font-serif-lib text-2xl sm:text-4xl font-bold text-[#24341E] dark:text-[#8FD4AE] mt-1">
            Engineered for Deep, Unbroken Concentration
          </h2>
          <p className="text-sm text-[#0B0E0A] dark:text-[#9FB1A6] mt-2">
            Every facility at Nurul Ilm has been designed to eliminate friction so you can focus entirely on learning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} index={i} {...f} />
          ))}
        </div>
      </section>

      {/* ── Membership Packages ───────────────────────────── */}
      <section className="bg-white dark:bg-[#121B16] border-y border-[#DFE6DC] dark:border-[#26362D] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <PackagesPage setPage={setPage} />
        </div>
      </section>

      {/* ── Community Bulletin Board / Pinned Notes ──────── */}
      <CommunityNotesWall />

      {/* ── Heritage & Mission ────────────────────────────── */}
      <section className="px-4 sm:px-8 lg:px-12 py-16 max-w-4xl mx-auto w-full">
        <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-8 sm:p-12 shadow-xs space-y-6">
          <div className="border-b border-[#DFE6DC] dark:border-[#26362D] pb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#33462C] dark:text-[#8EA596]">Our Mission</span>
            <h2 className="font-serif-lib text-2xl sm:text-3xl font-bold text-[#24341E] dark:text-[#8FD4AE] mt-1">
              About Nurul Ilm Library
            </h2>
          </div>

          <p className="text-sm sm:text-base text-[#0B0E0A] dark:text-[#D5E1D9] leading-relaxed">
            Founded in 2024 by <strong>Zubair Peerzada</strong>, a software engineer from Handwara,
            <strong> Nurul Ilm Library</strong> was established to provide local youth with a serene,
            disciplined, and resourceful environment. In a region where quiet study spaces with stable electricity,
            heating, and internet can be difficult to find, Nurul Ilm stands as an academic anchor.
          </p>

          <p className="text-sm sm:text-base text-[#0B0E0A] dark:text-[#D5E1D9] leading-relaxed">
            Guided by the foundational motto <em>"Illuminate your path with knowledge"</em>, the library serves
            hundreds of civil services aspirants, medical and engineering candidates, university students, and avid readers
            from across North Kashmir.
          </p>

          <div className="bg-[#EFF4EC] dark:bg-[#19241E] border border-[#DFE6DC] dark:border-[#273B2E] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-sm text-[#24341E] dark:text-[#8FD4AE]">Ready to begin your study journey?</p>
              <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6]">Reserve your quiet study carrel and explore the reference stacks.</p>
            </div>
            <button
              onClick={() => setPage('register')}
              className="px-5 py-2.5 rounded-xl bg-[#33462C] hover:bg-[#24341E] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white text-xs font-semibold transition active:scale-95 whitespace-nowrap shadow-xs cursor-pointer"
            >
              Register for Membership
            </button>
          </div>
        </div>
      </section>

      {/* ── Directions, Hours & Verification ──────────────── */}
      <section className="px-4 sm:px-8 lg:px-12 pb-16 max-w-6xl mx-auto w-full">
        <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="p-6 sm:p-8 space-y-6 lg:border-r border-[#DFE6DC] dark:border-[#26362D]">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#33462C] dark:text-[#8EA596]">Visit Us</span>
                <h3 className="font-serif-lib text-xl font-bold text-[#24341E] dark:text-[#8FD4AE] mt-1">Location &amp; Timings</h3>
              </div>

              <div className="space-y-4 text-xs text-[#0B0E0A] dark:text-[#D5E1D9]">
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-[#33462C] dark:text-[#8FD4AE] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#24341E] dark:text-white">Main Branch</p>
                    <p className="text-[#0B0E0A] dark:text-[#9FB1A6]">New Bus Stand Road, Handwara</p>
                    <p className="text-[#0B0E0A] dark:text-[#9FB1A6]">Kupwara District, Jammu &amp; Kashmir 193221</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock size={16} className="text-[#33462C] dark:text-[#8FD4AE] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#24341E] dark:text-white">Operating Hours</p>
                    <p className="text-[#0B0E0A] dark:text-[#9FB1A6]">
                      {libraryTimings?.days || 'Monday - Sunday'}: {openTime} - {closeTime}
                    </p>
                    <p className="text-[#2E6B3F] dark:text-[#6BC68F] font-medium">
                      {libraryTimings?.status_note || 'Open throughout all winter months'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#DFE6DC] dark:border-[#26362D]">
                <p className="text-xs font-semibold text-[#24341E] dark:text-white mb-3">Official Social Channels</p>
                <div className="flex gap-3">
                  <a
                    href="https://www.instagram.com/nurililmlibrary/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-[#EFF4EC] dark:bg-[#1E2E25] border border-[#DFE6DC] dark:border-[#2C4133] text-[#24341E] hover:bg-[#33462C] hover:text-white dark:hover:text-[#8FD4AE] hover:border-[#33462C]/30 flex items-center justify-center transition"
                    aria-label="Instagram"
                  >
                    <Instagram size={17} />
                  </a>
                  <a
                    href="https://www.facebook.com/nurulilmlibrary"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-[#EFF4EC] dark:bg-[#1E2E25] border border-[#DFE6DC] dark:border-[#2C4133] text-[#24341E] hover:bg-[#33462C] hover:text-white dark:hover:text-[#8FD4AE] hover:border-[#33462C]/30 flex items-center justify-center transition"
                    aria-label="Facebook"
                  >
                    <Facebook size={17} />
                  </a>
                  <a
                    href="https://www.youtube.com/@nurulilmlibrary/shorts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-[#EFF4EC] dark:bg-[#1E2E25] border border-[#DFE6DC] dark:border-[#2C4133] text-[#24341E] hover:bg-[#33462C] hover:text-white dark:hover:text-[#8FD4AE] hover:border-[#33462C]/30 flex items-center justify-center transition"
                    aria-label="YouTube"
                  >
                    <Youtube size={17} />
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 h-[340px] lg:h-auto bg-[#F4EFE6]">
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
};

export default LandingPage;

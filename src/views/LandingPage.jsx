'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Wifi, Users, ShieldCheck,
  Instagram, Facebook, Youtube,
  Search, Clock, MapPin, CheckCircle2,
  ArrowRight, BookOpen, Coffee, Flame,
  X, Loader2, Bookmark,
  Lightbulb, Landmark, Stethoscope, Compass
} from 'lucide-react';
import { useOther } from '../context/OtherContext';
import { catalogService } from '../services/catalogService';
import PackagesPage from './PackagesPage';
import EmotionalHook from '../components/EmotionalHook';
import CommunityNotesWall from '../components/CommunityNotesWall';
import SavedBooksDrawer from '../components/SavedBooksDrawer';

/* ── Practical Library Study Facilities ────────────────────────── */
const FacilityCard = ({ icon: Icon, title, text, specification }) => (
  <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col h-full shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004B87] dark:text-blue-400 flex items-center justify-center">
        <Icon size={20} strokeWidth={2} />
      </div>
      {specification && (
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-md">
          {specification}
        </span>
      )}
    </div>
    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 leading-snug">
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
    text: 'Dedicated reading carrels with partition dividers, task lighting, and individual power sockets for uninterrupted concentration.',
    specification: 'Bay 1 & Bay 2'
  },
  {
    icon: Flame,
    title: 'Winter Climate Control',
    text: 'Heated study rooms during cold Himalayan winters and cross-ventilation in summer to ensure comfortable reading hours throughout the year.',
    specification: 'Continuous Heating'
  },
  {
    icon: BookOpen,
    title: 'Physical & Digital Reference Stacks',
    text: 'Curated references across competitive exams (UPSC, JKAS, NEET, JEE), academic textbooks, literature, and previous year question papers.',
    specification: 'Catalog Stacks'
  },
  {
    icon: Wifi,
    title: 'Dual Fiber Broadband',
    text: 'Low-latency Wi-Fi tailored for academic video lectures, digital research papers, syllabus downloads, and online mock tests.',
    specification: 'High Speed'
  },
  {
    icon: Coffee,
    title: 'Drinking Water & Prayer Space',
    text: 'Reverse-osmosis filtered drinking water, sanitary facilities, and a dedicated, peaceful prayer room on premise.',
    specification: 'On Premise'
  },
  {
    icon: ShieldCheck,
    title: 'Safe & Monitored Study Halls',
    text: 'CCTV monitored environment for male and female students with strict silence guidelines maintained by library staff.',
    specification: 'Staff Supervised'
  },
];

export default function LandingPage({ setPage }) {
  const { state: { libraryTimings }, fetchLibraryTimings } = useOther();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Saved books study bag
  const [savedBooks, setSavedBooks] = useState([]);
  const isLoadedRef = useRef(false);

  // Study focus tracks
  const [selectedStudyTrack, setSelectedStudyTrack] = useState(null);
  const [liveKashmirTime, setLiveKashmirTime] = useState('');

  const STUDY_TRACKS = [
    {
      id: 'upsc',
      label: 'Civil Services & JKAS',
      icon: Landmark,
      category: 'Civil Services',
      tip: 'Morning study desks (7:00 AM - 1:00 PM) offer deep quiet preferred by syllabus completers.',
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

  // Save books to localStorage
  useEffect(() => {
    if (!isLoadedRef.current) return;
    try {
      localStorage.setItem('nurulilm_saved_books', JSON.stringify(savedBooks));
    } catch (e) {
      console.warn('Could not save reading list:', e);
    }
  }, [savedBooks]);

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

  const openTime = libraryTimings?.open_time || '07:00 AM';
  const closeTime = libraryTimings?.close_time || '09:00 PM';

  return (
    <div className="w-full bg-[#F6F8FB] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col min-h-screen transition-colors duration-150">

      {/* ── Solid Institutional Hero ────────────────────────────── */}
      <section className="px-4 sm:px-8 lg:px-12 pt-10 sm:pt-14 pb-14 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          
          {/* Operating hours label without decorative glowing pills */}
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 py-1 rounded-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Study Halls Open Daily</span>
            <span className="text-slate-300 dark:text-slate-700 hidden xs:inline">|</span>
            <span>{openTime} to {closeTime}</span>
            {liveKashmirTime && (
              <>
                <span className="text-slate-300 dark:text-slate-700 hidden xs:inline">|</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{liveKashmirTime} Handwara</span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight tracking-tight">
            Nurul Ilm Library  and Academic Reading Room
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            A quiet study centre in Handwara, North Kashmir. Equipped with individual reading carrels, winter heating, dual fiber connectivity, and curated reference stacks for competitive exam aspirants.
          </p>

          {/* Direct, clear CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={() => setPage('packages')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white font-semibold text-sm transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Membership Passes</span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => setPage('login')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs cursor-pointer"
            >
              Member Sign In
            </button>
          </div>

          {/* Study Track Filter Bar */}
          <div className="pt-8 max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3 text-center">
              Select Your Field of Study
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
                    className={`p-3 rounded-lg text-left border transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#004B87] text-white border-[#004B87] shadow-xs'
                        : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center mb-2 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      <TrackIcon size={15} />
                    </div>
                    <span className="text-xs font-semibold block leading-tight">{track.label}</span>
                  </button>
                );
              })}
            </div>

            {selectedStudyTrack && (
              <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-xs text-slate-800 dark:text-slate-200 text-left flex items-start gap-2.5">
                <Lightbulb size={16} className="text-[#004B87] dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedStudyTrack.label} Advice:</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{selectedStudyTrack.tip}</p>
                </div>
                <button
                  onClick={() => {
                    const el = document.getElementById('catalog-discovery');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-[11px] font-semibold text-[#004B87] dark:text-blue-400 hover:underline whitespace-nowrap cursor-pointer"
                >
                  View Books
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Key Library Facts Band ──────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
            <span className="text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider block mb-1">Operating Hours</span>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{openTime} - {closeTime}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{libraryTimings?.days || 'Open 7 days a week'}</p>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
            <span className="text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider block mb-1">Location</span>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">New Bus Stand Rd</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Handwara, 193221</p>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
            <span className="text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider block mb-1">Study Facilities</span>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">Dedicated Carrels</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Power sockets and winter heating</p>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
            <span className="text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider block mb-1">Reference Stacks</span>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">Exam Stacks</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">JKAS, UPSC, NEET and Academics</p>
          </div>
        </div>
      </section>

      {/* ── Book Catalog & Discovery ────────────────────────── */}
      <section id="catalog-discovery" className="bg-white dark:bg-[#111827] border-y border-slate-200 dark:border-slate-800 py-12 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Book Collection</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                Browse Books and Reference Materials
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Search available titles in our physical collection and digital reference archive.
              </p>
            </div>
            <button
              onClick={() => setPage('login')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#004B87] dark:text-blue-400 hover:underline cursor-pointer"
            >
              <span>Sign in to reserve books</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Search bar & Category filters */}
          <div className="space-y-3 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-lg">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, author, subject, or ISBN..."
                  className="w-full bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-9 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#004B87] dark:focus:border-blue-400 focus:ring-1 focus:ring-[#004B87]"
                />
                {loadingBooks ? (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
                ) : searchTerm ? (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
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
                    Found <strong className="text-slate-800 dark:text-slate-200">{books.length}</strong> title{books.length === 1 ? '' : 's'}
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
                  className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#004B87] text-white shadow-2xs"
                      : "bg-[#F6F8FB] dark:bg-[#0B0F19] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
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
              <p className="text-xs text-slate-500">Searching Nurul Ilm Library catalog...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center max-w-md mx-auto my-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center mx-auto">
                <BookOpen size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">No Titles Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                No matching books found for "{searchTerm || selectedCategory}".
              </p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#004B87] text-white text-xs font-semibold rounded-md hover:bg-[#003865] transition cursor-pointer"
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
                  className="bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className="font-medium bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-[10px] truncate max-w-[130px]">
                        {book.category || 'General'}
                      </span>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveBook(book);
                        }}
                        className={`p-1 rounded transition ${
                          isBookSaved(book)
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                        title={isBookSaved(book) ? 'Saved' : 'Save for later'}
                      >
                        <Bookmark size={14} className={isBookSaved(book) ? 'fill-amber-600 dark:fill-amber-400' : ''} />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 group-hover:text-[#004B87] dark:group-hover:text-blue-400">
                      {book.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{book.author}</p>
                    {book.description && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {book.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    {Number(book.availability ?? 1) > 0 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold text-[10px]">
                        <CheckCircle2 size={11} /> {book.availability} Copies
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
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
          onClick={() => setSelectedBook(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl relative space-y-4"
          >
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {selectedBook.category || 'Reference'}
              </span>
              {Number(selectedBook.availability ?? 1) > 0 ? (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 size={12} /> {selectedBook.availability} Copies Available
                </span>
              ) : (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Currently Checked Out
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {selectedBook.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Authored by <strong className="text-slate-900 dark:text-slate-100">{selectedBook.author}</strong>
              </p>
              {selectedBook.isbn && (
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ISBN: {selectedBook.isbn}
                </p>
              )}
            </div>

            {selectedBook.description && (
              <div className="p-3 bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Book Summary / Notes:</p>
                <p>{selectedBook.description}</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => toggleSaveBook(selectedBook)}
                className={`w-full sm:w-auto py-2 px-3.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                  isBookSaved(selectedBook)
                    ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800'
                    : 'bg-white dark:bg-[#111827] border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Bookmark size={13} className={isBookSaved(selectedBook) ? 'fill-amber-600' : ''} />
                <span>{isBookSaved(selectedBook) ? 'Saved' : 'Save for Later'}</span>
              </button>
              <button
                onClick={() => { setSelectedBook(null); setPage('login'); }}
                className="w-full sm:flex-1 py-2 px-3.5 bg-[#004B87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <BookOpen size={13} />
                <span>Sign In to Borrow</span>
              </button>
              <button
                onClick={() => { setSelectedBook(null); setPage('register'); }}
                className="w-full sm:w-auto py-2 px-3.5 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                New Admission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Library Video Showcase ────────────────────────── */}
      <EmotionalHook />

      {/* ── Library Facilities & Standard of Study ────────── */}
      <section className="px-4 sm:px-8 lg:px-12 py-14 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Library Amenities</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Study Facilities
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">
            Designed to provide quiet study conditions and dependable utilities in Handwara.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FACILITIES.map((f, i) => (
            <FacilityCard key={i} {...f} />
          ))}
        </div>
      </section>

      {/* ── Membership Packages ───────────────────────────── */}
      <section className="bg-white dark:bg-[#111827] border-y border-slate-200 dark:border-slate-800 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <PackagesPage setPage={setPage} />
        </div>
      </section>

      {/* ── Community Bulletin Board ──────────────────────── */}
      <CommunityNotesWall />

      {/* ── About the Library ─────────────────────────────── */}
      <section className="px-4 sm:px-8 lg:px-12 py-14 max-w-3xl mx-auto w-full">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">About the Institution</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Nurul Ilm Library 
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Founded in 2024 by <strong>Zubair Peerzada</strong>, a software engineer from Handwara,
            <strong> Nurul Ilm Library</strong> was established to provide students and competitive exam aspirants with a dependable, quiet place to study. In a region where quiet study spaces with stable electricity, winter heating, and internet can be difficult to find, Nurul Ilm serves as an academic reading room.
          </p>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            The reading hall accommodates civil services aspirants (UPSC and JKAS), medical and engineering candidates, university scholars, and general readers from Handwara and surrounding villages of Kupwara district.
          </p>

          <div className="bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">Need a dedicated study desk?</p>
              <p className="text-[11px] text-slate-500">Visit our center or register online to reserve your carrel.</p>
            </div>
            <button
              onClick={() => setPage('register')}
              className="px-4 py-2 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold transition whitespace-nowrap cursor-pointer shadow-2xs"
            >
              Register for Admission
            </button>
          </div>
        </div>
      </section>

      {/* ── Location & Timings ────────────────────────────── */}
      <section className="px-4 sm:px-8 lg:px-12 pb-14 max-w-5xl mx-auto w-full">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="p-6 space-y-5 lg:border-r border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Visit Us</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">Location and Hours</h3>
              </div>

              <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-[#004B87] dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Main Center</p>
                    <p className="text-slate-600 dark:text-slate-400">New Bus Stand Road, Handwara</p>
                    <p className="text-slate-600 dark:text-slate-400">Kupwara District, Jammu &amp; Kashmir 193221</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock size={15} className="text-[#004B87] dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Operating Hours</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {libraryTimings?.days || 'Monday to Sunday'}: {openTime} to {closeTime}
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                      {libraryTimings?.status_note || 'Open throughout winter months'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">Social Channels</p>
                <div className="flex gap-2">
                  <a
                    href="https://www.instagram.com/nurililmlibrary/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#004B87] hover:text-white flex items-center justify-center transition"
                    aria-label="Instagram"
                  >
                    <Instagram size={15} />
                  </a>
                  <a
                    href="https://www.facebook.com/nurulilmlibrary"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#004B87] hover:text-white flex items-center justify-center transition"
                    aria-label="Facebook"
                  >
                    <Facebook size={15} />
                  </a>
                  <a
                    href="https://www.youtube.com/@nurulilmlibrary/shorts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#004B87] hover:text-white flex items-center justify-center transition"
                    aria-label="YouTube"
                  >
                    <Youtube size={15} />
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 h-[300px] lg:h-auto bg-slate-100 dark:bg-slate-800">
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

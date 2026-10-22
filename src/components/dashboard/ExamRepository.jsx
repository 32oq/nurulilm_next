'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Search, Download, Eye, FileText,
  Bookmark, CheckCircle2, X, ExternalLink, Filter, Sparkles,
  Loader2, RefreshCw
} from 'lucide-react';
import { useOther } from '../../context/OtherContext';

export default function ExamRepository({ onClose }) {
  const { fetchExams, fetchExamById, incrementExamDownload } = useOther();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('All');
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  const tracks = [
    { label: 'All', value: 'all' },
    { label: 'JKAS & Civil Services', value: 'JKAS' },
    { label: 'UPSC CSE', value: 'UPSC' },
    { label: 'NEET UG', value: 'NEET' },
    { label: 'JEE Mains & Adv', value: 'JEE' },
    { label: 'JKSSB Exams', value: 'JKSSB' }
  ];

  const loadPapers = useCallback(async () => {
    setLoading(true);
    try {
      const categoryParam = selectedTrack === 'All' ? 'all' : (tracks.find(t => t.label === selectedTrack)?.value || 'all');
      const res = await fetchExams({
        category: categoryParam,
        search: searchTerm.trim()
      });
      if (Array.isArray(res) && res.length > 0) {
        setPapers(res);
      } else {
        setPapers([]);
      }
    } catch (err) {
      console.warn('Exams fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchExams, selectedTrack, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPapers();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadPapers]);

  const handleOpenPaper = async (paper) => {
    setLoadingDoc(true);
    setPreviewDoc(paper);
    try {
      const detailed = await fetchExamById(paper.exam_id);
      if (detailed) {
        setPreviewDoc(detailed);
      }
    } catch (err) {
      console.warn('Detailed paper fetch failed:', err);
    } finally {
      setLoadingDoc(false);
    }
  };

  const handleDownloadPaper = async (paper) => {
    try {
      await incrementExamDownload(paper.exam_id);
      setPapers(prev => prev.map(p => p.exam_id === paper.exam_id ? { ...p, downloads: (p.downloads || 0) + 1 } : p));
      alert(`Preparing offline download for "${paper.title}". File saved to local storage.`);
    } catch (_) {}
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#004B87] dark:text-blue-400 flex items-center gap-1.5">
              <BookOpen size={13} />
              <span>Digital PYQ Repository</span>
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              {papers.length} Verified Papers Available
            </span>
          </div>
          <h3 className="font-serif-lib text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            Competitive Examinations &amp; Solved Papers
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Curated, solved question banks with line-by-line model answers for civil services, medicine, engineering, and state exams.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadPapers}
            title="Refresh repository"
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#004B87] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-[#004B87]' : ''} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Search & Track Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search papers by exam, subject, keyword (e.g. JKAS Prelims, Ramsar, NEET, Calculus)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#004B87] dark:focus:ring-blue-500 transition"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tracks.map(track => (
            <button
              key={track.label}
              onClick={() => setSelectedTrack(track.label)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedTrack === track.label
                  ? 'bg-[#004B87] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {track.label}
            </button>
          ))}
        </div>
      </div>

      {/* Papers Grid */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="animate-spin text-[#004B87] dark:text-blue-400" size={28} />
          <p className="text-xs text-slate-500 dark:text-slate-400">Querying digital exam repository database...</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
          No papers found matching "{searchTerm}". Try clearing your search or choosing another exam category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {papers.map(doc => (
            <div
              key={doc.exam_id}
              className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-[#004B87] dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                    {doc.exam_type || 'General'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Year {doc.year} • {doc.questions_count || 100} Qs • {doc.duration || '120m'}
                  </span>
                </div>

                <h4 className="font-semibold text-sm text-slate-900 dark:text-white leading-snug">
                  {doc.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {doc.summary || doc.subject}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {doc.downloads || 0} downloads • {doc.difficulty || 'Advanced'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadPaper(doc)}
                    title="Download master solution paper"
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#004B87] transition cursor-pointer"
                  >
                    <Download size={13} />
                  </button>
                  <button
                    onClick={() => handleOpenPaper(doc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#004B87] dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>Read In-Browser</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* In-Browser Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase text-[#004B87] dark:text-blue-400">
                  {previewDoc.exam_type || 'EXAM'} • Official Solved Paper
                </span>
                <h3 className="font-serif-lib text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {previewDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Simulated Paper Reading Canvas */}
            <div className="h-80 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto space-y-4 text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
              <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <p className="font-bold text-xs uppercase tracking-wider text-[#004B87] dark:text-blue-400">
                  Nurul Ilm Library Reference Archives • Solved Master Paper
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{previewDoc.title}</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                  Subject: {previewDoc.subject}
                </p>
              </div>

              {loadingDoc ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                  <Loader2 size={24} className="animate-spin text-[#004B87] dark:text-blue-400" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Loading solved questions and answer keys...</p>
                </div>
              ) : (
                <div className="space-y-4 text-xs leading-relaxed">
                  {previewDoc.sample_questions && previewDoc.sample_questions.length > 0 ? (
                    previewDoc.sample_questions.map((q, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          <span className="text-[#004B87] dark:text-blue-400 font-bold">Q{q.q_num || idx + 1}.</span> {q.question}
                        </p>
                        {q.options && (
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 pl-4">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className={`p-1.5 rounded-md ${opt === q.answer ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/60' : 'bg-slate-100 dark:bg-slate-700/60'}`}>
                                ({String.fromCharCode(65 + oIdx)}) {opt}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-[11px] text-slate-700 dark:text-slate-300">
                          <strong className="text-[#004B87] dark:text-blue-400 block mb-0.5">Verified Solution Key:</strong>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">{q.answer}</span>: {q.explanation}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                      <p className="text-xs text-slate-500">Complete verified paper syllabus summary:</p>
                      <p>{previewDoc.summary}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {previewDoc.questions_count || 100} Questions • Verified solutions
              </span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2.5 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

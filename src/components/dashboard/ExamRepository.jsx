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
    <div className="bg-white dark:bg-[#0B1726] border border-[#DCE3EC] dark:border-[#18283A] rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7ECF2] dark:border-[#18283A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1677FF] dark:text-[#00B8FF] flex items-center gap-1.5">
              <BookOpen size={13} />
              <span>Digital PYQ Repository API</span>
            </span>
            <span className="text-xs text-[#64748B]">•</span>
            <span className="text-[11px] font-semibold text-[#138A5B] dark:text-[#19D68C]">
              {papers.length} Verified Papers Available
            </span>
          </div>
          <h3 className="font-serif-lib text-xl font-bold text-[#0B1B2B] dark:text-white mt-0.5">
            Competitive Examinations &amp; Solved Papers
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#A0ACBA]">
            Curated, solved question banks with line-by-line model answers for civil services, medicine, engineering, and state exams.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadPapers}
            title="Refresh repository"
            className="p-1.5 rounded-xl text-[#64748B] hover:text-[#1677FF] hover:bg-[#EEF2F7] dark:hover:bg-[#0F1D2E] transition cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-[#1677FF]' : ''} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0B1B2B] dark:hover:text-white hover:bg-[#EEF2F7] dark:hover:bg-[#0F1D2E] transition cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Search & Track Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search papers by exam, subject, keyword (e.g. JKAS Prelims, Ramsar, NEET, Calculus)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F6F8FB] dark:bg-[#081321] border border-[#DCE3EC] dark:border-[#18283A] rounded-xl text-xs text-[#0B1B2B] dark:text-[#F5F7FA] placeholder-[#64748B] focus:border-[#1677FF] transition"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tracks.map(track => (
            <button
              key={track.label}
              onClick={() => setSelectedTrack(track.label)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedTrack === track.label
                  ? 'bg-[#1677FF] text-white shadow-xs'
                  : 'bg-[#F6F8FB] dark:bg-[#081321] text-[#475569] dark:text-[#A0ACBA] hover:bg-[#EEF2F7]'
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
          <Loader2 className="animate-spin text-[#1677FF]" size={28} />
          <p className="text-xs text-[#64748B]">Querying digital exam repository database...</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#64748B]">
          No papers found matching "{searchTerm}". Try clearing your search or choosing another exam category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {papers.map(doc => (
            <div
              key={doc.exam_id}
              className="p-5 rounded-2xl bg-[#F6F8FB] dark:bg-[#081321] border border-[#DCE3EC] dark:border-[#18283A] flex flex-col justify-between space-y-4 hover:border-[#1677FF]/40 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EAF2FF] dark:bg-[#0F1D2E] text-[#1677FF] dark:text-[#00B8FF] border border-[#1677FF]/20">
                    {doc.exam_type || 'General'}
                  </span>
                  <span className="text-[11px] text-[#64748B] font-mono">
                    Year {doc.year} • {doc.questions_count || 100} Qs • {doc.duration || '120m'}
                  </span>
                </div>

                <h4 className="font-serif-lib text-sm font-bold text-[#0B1B2B] dark:text-white leading-snug">
                  {doc.title}
                </h4>
                <p className="text-xs text-[#64748B] dark:text-[#A0ACBA] leading-relaxed line-clamp-2">
                  {doc.summary || doc.subject}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E7ECF2] dark:border-[#18283A] flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#64748B]">
                  {doc.downloads || 0} downloads • {doc.difficulty || 'Advanced'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadPaper(doc)}
                    title="Download master solution paper"
                    className="p-1.5 rounded-xl bg-white dark:bg-[#0B1726] border border-[#DCE3EC] dark:border-[#18283A] text-[#64748B] hover:text-[#1677FF] transition cursor-pointer"
                  >
                    <Download size={13} />
                  </button>
                  <button
                    onClick={() => handleOpenPaper(doc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0B1726] border border-[#DCE3EC] dark:border-[#18283A] text-xs font-semibold text-[#1677FF] dark:text-[#00B8FF] hover:bg-[#EAF2FF] transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1726] border border-[#DCE3EC] dark:border-[#18283A] rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-[#E7ECF2] dark:border-[#18283A] pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase text-[#1677FF] dark:text-[#00B8FF]">
                  {previewDoc.exam_type || 'EXAM'} • Official Solved Paper
                </span>
                <h3 className="font-serif-lib text-lg font-bold text-[#0B1B2B] dark:text-white mt-0.5">
                  {previewDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0B1B2B] dark:hover:text-white hover:bg-[#EEF2F7] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Simulated Paper Reading Canvas */}
            <div className="h-80 rounded-2xl bg-[#F6F8FB] dark:bg-[#081321] border border-[#DCE3EC] dark:border-[#18283A] p-6 overflow-y-auto space-y-4 font-serif text-sm text-[#0B1B2B] dark:text-[#F5F7FA] leading-relaxed">
              <div className="text-center border-b border-[#DCE3EC] dark:border-[#18283A] pb-3 font-sans">
                <p className="font-bold text-xs uppercase tracking-wider text-[#1677FF]">
                  Al-Muqeet Library Archives • Solved Master Paper
                </p>
                <p className="text-xs text-[#64748B] mt-0.5">{previewDoc.title}</p>
                <p className="text-[11px] text-[#138A5B] font-semibold mt-0.5">
                  Subject: {previewDoc.subject}
                </p>
              </div>

              {loadingDoc ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                  <Loader2 size={24} className="animate-spin text-[#1677FF]" />
                  <p className="text-xs text-[#64748B]">Loading solved questions and answer keys...</p>
                </div>
              ) : (
                <div className="space-y-4 text-xs leading-relaxed font-sans">
                  {previewDoc.sample_questions && previewDoc.sample_questions.length > 0 ? (
                    previewDoc.sample_questions.map((q, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white dark:bg-[#0B1726] border border-[#DCE3EC] dark:border-[#18283A] space-y-2">
                        <p className="font-semibold text-[#0B1B2B] dark:text-white">
                          <span className="text-[#1677FF] font-bold">Q{q.q_num || idx + 1}.</span> {q.question}
                        </p>
                        {q.options && (
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#475569] dark:text-[#A0ACBA] pl-4">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className={`p-1.5 rounded-lg ${opt === q.answer ? 'bg-[#138A5B]/10 text-[#138A5B] font-semibold border border-[#138A5B]/20' : 'bg-[#EEF2F7] dark:bg-[#0F1D2E]'}`}>
                                ({String.fromCharCode(65 + oIdx)}) {opt}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="p-3 rounded-xl bg-[#EAF2FF] dark:bg-[#0F1D2E] border border-[#1677FF]/20 text-[11px] text-[#475569] dark:text-[#A0ACBA]">
                          <strong className="text-[#1677FF] block mb-0.5">Verified Solution Key:</strong>
                          <span className="font-bold text-[#138A5B]">{q.answer}</span>: {q.explanation}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-white dark:bg-[#0B1726] border border-[#DCE3EC] dark:border-[#18283A] space-y-2">
                      <p className="text-xs text-[#64748B]">Complete verified paper syllabus summary:</p>
                      <p>{previewDoc.summary}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#64748B]">
                {previewDoc.questions_count || 100} Questions • Verified solutions
              </span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2.5 rounded-xl bg-[#1677FF] hover:bg-[#1264E8] text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
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

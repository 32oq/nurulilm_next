'use client';

import { useState, useEffect } from 'react';
import moment from 'moment';
import {
  Brain, Sparkles, CheckCircle2, XCircle, Timer,
  RotateCcw, Trophy, ArrowRight, Lightbulb, X, HelpCircle, Flame
} from 'lucide-react';

const PUZZLE_BANK = [
  {
    id: 'passes',
    topic: 'Geography & Regional Landscapes',
    clues: ['Pir Panjal', 'Zoji La', 'Banihal Pass', 'Khardung La'],
    hint: 'Critical transit arteries connecting mountain valleys in Jammu, Kashmir & Ladakh.',
    correct: 'Himalayan Mountain Passes',
    options: [
      'Himalayan Mountain Passes',
      'Tributary River Valleys',
      'Ancient Silk Road Caravanserais',
      'Glacial Moraines of Ladakh'
    ],
    explanation: 'These are the major strategic mountain passes crossing the Pir Panjal and Great Himalayan ranges, historically connecting Kashmir with Ladakh, Punjab, and Central Asia.'
  },
  {
    id: 'constitution',
    topic: 'Indian Polity & Governance',
    clues: ['Election Commission (Art. 324)', 'UPSC (Art. 315)', 'CAG (Art. 148)', 'Finance Commission (Art. 280)'],
    hint: 'Institutions that derive their powers directly from the Constitution rather than an Act of Parliament.',
    correct: 'Constitutional Bodies of India',
    options: [
      'Constitutional Bodies of India',
      'Statutory Regulatory Tribunals',
      'Parliamentary Standing Committees',
      'Autonomous Executive Think Tanks'
    ],
    explanation: 'Unlike statutory bodies created by ordinary legislation, Constitutional Bodies derive their mandate and independence directly from specific constitutional provisions.'
  },
  {
    id: 'kashmir-lakes',
    topic: 'Jammu & Kashmir Heritage & Ecology',
    clues: ['Wular Lake', 'Dal Lake', 'Manasbal Lake', 'Nigeen Lake'],
    hint: 'Crucial wetland ecosystems fed by the Jhelum river basin.',
    correct: 'Freshwater Lakes of the Kashmir Valley',
    options: [
      'Freshwater Lakes of the Kashmir Valley',
      'High-Altitude Saline Tarns',
      'Artificial Hydroelectric Reservoirs',
      'Seasonal Glacial Cirques'
    ],
    explanation: 'Wular is one of Asia’s largest freshwater lakes, and together with Dal and Manasbal, forms the ecological and cultural lifeline of Kashmir Valley.'
  },
  {
    id: 'space-missions',
    topic: 'Science, Technology & Discovery',
    clues: ['Chandrayaan (Moon)', 'Mangalyaan (Mars)', 'Aditya-L1 (Sun)', 'Gaganyaan (Human Spaceflight)'],
    hint: 'Flagship deep-space exploration milestones engineered by ISRO.',
    correct: 'ISRO Deep Space Exploration Missions',
    options: [
      'ISRO Deep Space Exploration Missions',
      'Low Earth Orbit Satellite Constellations',
      'Defense Missile Interceptors',
      'Commercial Communication Transponders'
    ],
    explanation: 'India’s premier space initiatives spanning lunar exploration, Mars orbit, solar corona observation at the L1 Lagrange point, and crewed orbital flight.'
  },
  {
    id: 'fundamental-rights',
    topic: 'Indian Constitution',
    clues: ['Article 14 (Equality)', 'Article 19 (Freedoms)', 'Article 21 (Life & Liberty)', 'Article 32 (Constitutional Remedies)'],
    hint: 'Dr. B.R. Ambedkar called Article 32 the "Heart and Soul" of the Constitution.',
    correct: 'Fundamental Rights (Part III)',
    options: [
      'Fundamental Rights (Part III)',
      'Directive Principles of State Policy',
      'Fundamental Duties (Part IVA)',
      'Union Executive Powers'
    ],
    explanation: 'Part III of the Indian Constitution enshrines the basic human and civil liberties guaranteed to all citizens, enforceable directly before the Supreme Court.'
  },
  {
    id: 'rivers-indus',
    topic: 'Physical Geography & Hydrology',
    clues: ['Jhelum (Vitasta)', 'Chenab (Asikni)', 'Ravi (Purushni)', 'Beas (Vipasa)'],
    hint: 'Rivers whose ancient Vedic names are listed in Rigvedic hymns.',
    correct: 'Tributaries of the Indus River System',
    options: [
      'Tributaries of the Indus River System',
      'Peninsular East-Flowing Rivers',
      'Ganges Basin Northern Tributaries',
      'Brahmaputra Valley Braided Channels'
    ],
    explanation: 'These rivers constitute the Punjab and Kashmir drainage systems flowing into the Arabian Sea through the Indus basin.'
  },
  {
    id: 'mughal-gardens',
    topic: 'Architecture & Historical Monuments',
    clues: ['Shalimar Bagh', 'Nishat Bagh', 'Chashme Shahi', 'Pari Mahal'],
    hint: 'Persian-inspired terraced gardens built during Jahangir and Shah Jahan’s reigns.',
    correct: 'Mughal Gardens of Srinagar',
    options: [
      'Mughal Gardens of Srinagar',
      'Medieval Buddhist Monasteries',
      'Dogra Dynasty Fortresses',
      'Sufi Khanqahs of Handwara'
    ],
    explanation: 'Classic examples of Charbagh terraced architecture flanking the Zabarwan mountain range and Dal Lake.'
  }
];

export default function ScholarSynapseGame({ isOpen, onClose, onStreakIncrement }) {
  const todayKey = moment().format('YYYY-MM-DD');
  const dayOfYear = moment().dayOfYear();
  const currentPuzzle = PUZZLE_BANK[dayOfYear % PUZZLE_BANK.length];

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`nurulilm_synapse_${todayKey}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCompletedToday(true);
        setIsAnswered(true);
        setIsCorrect(data.isCorrect);
        setSelectedAnswer(data.selectedAnswer);
      } catch (_) {}
    } else if (isOpen) {
      setTimerActive(true);
    }
  }, [isOpen, todayKey]);

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0 && !isAnswered) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, isAnswered]);

  if (!isOpen) return null;

  const handleSelect = (option) => {
    if (isAnswered) return;
    const correct = option === currentPuzzle.correct;
    setSelectedAnswer(option);
    setIsAnswered(true);
    setIsCorrect(correct);
    setTimerActive(false);

    localStorage.setItem(
      `nurulilm_synapse_${todayKey}`,
      JSON.stringify({
        isCorrect: correct,
        selectedAnswer: option,
        completedAt: new Date().toISOString()
      })
    );
    setCompletedToday(true);

    if (correct && onStreakIncrement) {
      onStreakIncrement();
    }
  };

  const handleResetForPractice = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setTimeLeft(60);
    setTimerActive(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#004B87] text-white flex items-center justify-center shadow-xs">
              <Brain size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-lib text-base font-bold text-slate-900 dark:text-white">
                  Scholar Synapse
                </h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1 border border-amber-300 dark:border-amber-800">
                  <Flame size={11} className="fill-current text-amber-600" />
                  <span>Daily Mind Break</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                A 60-second cognitive refresh between deep reading blocks • {currentPuzzle.topic}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAnswered && (
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                timeLeft < 15
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                <Timer size={13} />
                <span>{timeLeft}s</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close synapse modal"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Puzzle Content */}
        <div className="p-6 space-y-5">
          
          {/* Daily Banner */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Challenge Date: <strong className="text-slate-700 dark:text-slate-300">{moment().format('MMMM DD, YYYY')}</strong></span>
            <span>4 Clues • 1 Common Academic Theme</span>
          </div>

          {/* 4 Clues Quadrant */}
          <div className="grid grid-cols-2 gap-2.5">
            {currentPuzzle.clues.map((clue, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 transition"
              >
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                  {clue}
                </span>
              </div>
            ))}
          </div>

          {/* Hint disclosure */}
          {showHint ? (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
              <Lightbulb size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <span><strong>Hint:</strong> {currentPuzzle.hint}</span>
            </div>
          ) : !isAnswered && (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="text-[11px] font-medium text-[#004B87] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle size={12} />
              <span>Need an architectural clue? Reveal hint</span>
            </button>
          )}

          {/* Choices Grid */}
          <div className="space-y-2 pt-1">
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              What connects these 4 concepts?
            </span>
            <div className="grid grid-cols-1 gap-2">
              {currentPuzzle.options.map((option, idx) => {
                const isChosen = selectedAnswer === option;
                const isTheCorrectOne = option === currentPuzzle.correct;
                
                let btnStyle = 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-800 dark:text-slate-200';
                
                if (isAnswered) {
                  if (isTheCorrectOne) {
                    btnStyle = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500 font-bold';
                  } else if (isChosen && !isTheCorrectOne) {
                    btnStyle = 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 text-rose-900 dark:text-rose-200';
                  } else {
                    btnStyle = 'opacity-50 border-slate-200 dark:border-slate-800 text-slate-400';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelect(option)}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && isTheCorrectOne && (
                      <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && isChosen && !isTheCorrectOne && (
                      <XCircle size={15} className="text-rose-600 dark:text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result & Explanation Card */}
          {isAnswered && (
            <div className={`p-4 rounded-xl border space-y-2 animate-in fade-in duration-300 ${
              isCorrect
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <>
                    <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      Synapse Solved • Daily Focus Streak Advanced!
                    </span>
                  </>
                ) : (
                  <>
                    <HelpCircle size={16} className="text-slate-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Good Try • Knowledge Expanded
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {currentPuzzle.explanation}
              </p>
            </div>
          )}

          {/* Actions Bar */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {completedToday ? '✓ Recorded in today’s study ledger' : 'One quick break to recharge your stamina'}
            </span>

            <div className="flex items-center gap-2">
              {isAnswered && (
                <button
                  type="button"
                  onClick={handleResetForPractice}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Retry</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                Back to Desk
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

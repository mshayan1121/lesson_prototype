"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import Link from "next/link";
import {
  TrendingUp,
  BarChart2,
  Smartphone,
  PieChart,
  Star,
  CheckCircle2,
  CheckCircle,
  XCircle,
  DollarSign,
  Check,
  ChevronLeft,
} from "lucide-react";
import { LessonsDropdown } from "@/components/LessonsDropdown";

// ─── Dynamic chart import (SSR-unsafe) ───────────────────────────────────────
const AaplChart = dynamic(() => import("@/components/AaplChart"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full rounded-xl bg-brand-light animate-pulse flex items-center justify-center min-h-[280px]">
      <span className="text-sm text-gray-400">Loading chart…</span>
    </div>
  ),
});

// ─── Types ────────────────────────────────────────────────────────────────────
type AgeGroup = "8-10" | "11-13" | "14-17";
type Step = 1 | 2 | 3 | 4 | 5;

interface LessonContent {
  intro: string;
  p1: string;
  p2: string;
  p3: string;
  chartNote: string;
  quizFeedbackCorrect: string;
  quizFeedbackWrong: string;
}

// ─── Content ──────────────────────────────────────────────────────────────────
const LESSON_CONTENT: Record<AgeGroup, LessonContent> = {
  "8-10": {
    intro: "A stock is like owning a tiny slice of a pizza — except the pizza is a company like Apple!",
    p1: "Your friend needs $10 for a lemonade stand. You chip in $5 and own half. If it earns $20, you get $10 back. Stocks work the same way — but the company is Apple.",
    p2: "When you buy one tiny piece of Apple (a stock), you own a bit of all those iPhones. If Apple earns more money, your slice becomes worth more too.",
    p3: "Apple needs a lot of money to build new things. Instead of borrowing from a bank, they sell tiny pieces of themselves — so everyone can be a co-owner.",
    chartNote: "When the line goes up, your slice is worth more!",
    quizFeedbackCorrect: "Woohoo! You got it right!",
    quizFeedbackWrong: "Almost! The green answer is correct.",
  },
  "11-13": {
    intro: "A stock is a share of ownership in a company. Buy a stock, become a part-owner.",
    p1: "Think of owning a piece of your favorite sports team. If the team gets more popular, your piece becomes more valuable. Stocks work the same way.",
    p2: "Apple earns ~$383B a year. The stock price reflects what people expect Apple to earn in the future — when expectations rise, the price rises.",
    p3: "To fund a new factory or 10,000 engineers, Apple sells shares to the public (an IPO). You give money; you get part ownership and a share of future profits.",
    chartNote: "Notice the 2022 dip — tough year for the market. Apple bounced back hard.",
    quizFeedbackCorrect: "Correct! You understand how stocks work.",
    quizFeedbackWrong: "Not quite. The green answer is correct.",
  },
  "14-17": {
    intro: "A stock is equity — partial ownership with a proportional claim on assets and earnings.",
    p1: "When Apple's net income rises, EPS increases, so investors pay more per share. The P/E ratio tells you how many dollars investors pay per dollar of earnings.",
    p2: "Apple's ~$3T market cap reflects the present value of all expected future cash flows (DCF). When growth expectations rise, so does the price — even without a change in today's earnings.",
    p3: "Equity doesn't require repayment like debt, offering higher potential returns with more volatility. Apple's ~35% profit margin drives its premium valuation multiple.",
    chartNote: "Price only — reinvested dividends and buybacks push real returns even higher.",
    quizFeedbackCorrect: "Correct. Solid understanding of equity valuation.",
    quizFeedbackWrong: "Incorrect. The correct answer is highlighted in green.",
  },
};

const QUIZ_QUESTIONS: Array<{
  question: string;
  options: string[];
  correctIndex: number;
}> = [
  {
    question: "What is a stock?",
    options: [
      "A loan you give to a company",
      "A small piece of ownership in a company",
      "The price of a product in a store",
    ],
    correctIndex: 1,
  },
  {
    question: "If Apple's stock price goes up, what happens?",
    options: [
      "Apple gives you a free iPhone",
      "Nothing — it doesn't affect you",
      "Your share is worth more money",
    ],
    correctIndex: 2,
  },
];

const SUMMARY_POINTS = [
  "A stock is a small ownership piece of a company",
  "When a company grows, your stock can be worth more",
  "Companies sell stocks to raise money to grow",
];

const LESSON_LABEL = "Lesson 1 — Stocks";

// ─── Shared primitives ────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-xs font-semibold uppercase tracking-widest text-brand-mid mb-1">
      {children}
    </p>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-sans rounded-full bg-brand-dark text-white px-8 py-3 font-bold text-sm
                 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150
                 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100
                 cursor-pointer shadow-sm ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Step pill bar ────────────────────────────────────────────────────────────

const STEP_LABELS = ["Hook", "Concept", "Chart", "Quiz", "Badge"] as const;

function StepPillBar({ step }: { step: Step }) {
  return (
    <div className="flex items-start">
      {([1, 2, 3, 4, 5] as Step[]).map((n, i) => {
        const isCompleted = n < step;
        const isActive = n === step;

        return (
          <div key={n} className="flex items-center">
            {/* Step node */}
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={{
                  backgroundColor: isCompleted
                    ? "#3B6D11"
                    : isActive
                    ? "#639922"
                    : "rgba(0,0,0,0)",
                  borderColor:
                    isCompleted || isActive ? "rgba(0,0,0,0)" : "#D1D5DB",
                }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center shrink-0"
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <motion.span
                    animate={{ color: isActive ? "#ffffff" : "#9CA3AF" }}
                    transition={{ duration: 0.35 }}
                    className="font-sans text-xs font-bold"
                  >
                    {n}
                  </motion.span>
                )}
              </motion.div>
              <motion.span
                animate={{ color: isActive ? "#639922" : "#9CA3AF" }}
                transition={{ duration: 0.35 }}
                className={`font-sans text-xs ${isActive ? "font-bold" : "font-medium"} ${isActive ? "" : "invisible md:visible"}`}
              >
                {STEP_LABELS[i]}
              </motion.span>
            </div>

            {/* Connector line */}
            {i < 4 && <div className="w-4 md:w-10 h-px bg-gray-200 mx-0.5 md:mx-1 mb-4 md:mb-5" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Top header bar ───────────────────────────────────────────────────────────

function TopBar({ step }: { step: Step }) {
  return (
    <header className="shrink-0 bg-white border-b border-gray-100">
      <div className="px-4 md:px-8 py-4 flex items-center justify-between md:grid md:grid-cols-3">
        <Link
          href="/dashboard/modules"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-150"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <div className="hidden md:flex justify-center">
          <StepPillBar step={step} />
        </div>
        <div className="flex justify-end">
          <LessonsDropdown />
        </div>
      </div>
      {/* Progress bar row — mobile only */}
      <div className="md:hidden px-4 pb-3 flex justify-center">
        <StepPillBar step={step} />
      </div>
    </header>
  );
}

// ─── Step 1 — Hook ────────────────────────────────────────────────────────────
function Step1({
  ageGroup,
  setAgeGroup,
  onNext,
}: {
  ageGroup: AgeGroup | null;
  setAgeGroup: (a: AgeGroup) => void;
  onNext: () => void;
}) {
  const stats: Array<{ icon: React.ReactNode; value: string; label: string }> =
    [
      {
        icon: <DollarSign className="w-4 h-4 text-brand-dark" />,
        value: "$383B",
        label: "Apple revenue (2023)",
      },
      {
        icon: <TrendingUp className="w-4 h-4 text-brand-dark" />,
        value: "$3T",
        label: "What investors say it's worth",
      },
      {
        icon: <Smartphone className="w-4 h-4 text-brand-dark" />,
        value: "2.2B",
        label: "iPhones in use worldwide",
      },
      {
        icon: <BarChart2 className="w-4 h-4 text-brand-dark" />,
        value: "~35%",
        label: "Goes straight to profit",
      },
    ];

  return (
    <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12 items-start md:items-center w-full max-w-5xl">
      {/* Left */}
      <div className="space-y-5">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 leading-tight mt-1">
            How does Apple make $383 billion a year?
          </h1>
          <p className="font-sans text-base text-gray-500 mt-2 leading-relaxed">
            Start with something you know — work backwards to understand investing.
          </p>
        </div>

        <p className="font-sans text-base font-semibold text-gray-800 bg-brand-light rounded-xl px-4 py-3 leading-snug">
          You didn&rsquo;t build Apple. Can you still own a piece of it?{" "}
          <span className="text-brand-dark">Yes. That&rsquo;s what a stock is.</span>
        </p>

        <div>
          <p className="font-sans text-xs text-gray-500 mb-2 font-medium">
            Pick your age group for the right explanation:
          </p>
          <div className="flex gap-2">
            {(["8-10", "11-13", "14-17"] as AgeGroup[]).map((ag) => (
              <button
                key={ag}
                onClick={() => setAgeGroup(ag)}
                className={`font-sans flex-1 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 cursor-pointer
                  ${
                    ageGroup === ag
                      ? "bg-brand-dark text-white border-brand-dark shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-brand-mid hover:text-brand-dark"
                  }`}
              >
                {ag}
              </button>
            ))}
          </div>
        </div>

        <PrimaryButton onClick={onNext} disabled={!ageGroup} className="!w-full !font-semibold !text-base">
          Let&rsquo;s go →
        </PrimaryButton>
      </div>

      {/* Right — stat grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-1.5
                       hover:-translate-y-0.5 transition-transform duration-200 cursor-default"
          >
            <div className="w-7 h-7 rounded-full bg-brand-light flex items-center justify-center">
              {s.icon}
            </div>
            <p className="font-heading text-3xl font-bold text-brand-dark leading-none">{s.value}</p>
            <p className="font-sans text-xs text-gray-500 leading-snug">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2 — Concept ─────────────────────────────────────────────────────────
function Step2({
  content,
  onNext,
}: {
  content: LessonContent;
  onNext: () => void;
}) {
  const blocks: Array<{ icon: React.ReactNode; title: string; text: string }> =
    [
      {
        icon: <PieChart className="w-4 h-4 text-brand-dark" />,
        title: "The pizza slice idea",
        text: content.p1,
      },
      {
        icon: <Smartphone className="w-4 h-4 text-brand-dark" />,
        title: "Back to Apple",
        text: content.p2,
      },
      {
        icon: <TrendingUp className="w-4 h-4 text-brand-dark" />,
        title: "Why would Apple share ownership?",
        text: content.p3,
      },
    ];

  return (
    <div className="flex flex-col md:grid md:grid-cols-5 gap-8 md:gap-12 items-start w-full max-w-5xl">
      {/* Left — heading, intro, button */}
      <div className="md:col-span-2 space-y-5 pt-1">
        <div>
          <Label>The concept</Label>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mt-1">What is a stock?</h2>
          <p className="font-sans text-lg text-gray-600 mt-2 leading-relaxed">{content.intro}</p>
        </div>
        <PrimaryButton onClick={onNext}>Got it — show me the chart →</PrimaryButton>
      </div>

      {/* Right — concept blocks */}
      <div className="md:col-span-3 space-y-3">
        {blocks.map((b) => (
          <div
            key={b.title}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-full bg-brand-light flex items-center justify-center shrink-0">
                {b.icon}
              </div>
              <p className="font-heading text-sm font-bold text-gray-800">{b.title}</p>
            </div>
            <p className="font-sans text-sm text-gray-600 leading-relaxed">{b.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 3 — Chart ───────────────────────────────────────────────────────────
function Step3({
  content,
  onNext,
}: {
  content: LessonContent;
  onNext: () => void;
}) {
  return (
    <div className="w-full max-w-5xl">
      {/* On mobile: flex column (heading → chart → stats → button).
          On desktop: 2-col grid with chart spanning both rows on the right. */}
      <div className="flex flex-col md:grid md:grid-cols-2 md:gap-12 md:items-center">
        {/* Left row 1 — heading */}
        <div className="mb-4 md:mb-0">
          <Label>See it in action</Label>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mt-1">
            Apple&rsquo;s stock price over time
          </h2>
          <p className="font-sans text-base text-gray-500 mt-2 leading-relaxed">
            When the price goes up, your slice is worth more.
          </p>
        </div>

        {/* Right — chart (row-span-2 on desktop; sits between heading and stats on mobile) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4 md:p-8 md:row-span-2 mb-4 md:mb-0">
          <AaplChart />
        </div>

        {/* Left row 2 — stats + button */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center hover:-translate-y-0.5 transition-transform duration-200">
              <p className="font-sans text-xs text-gray-400 mb-1">If you bought in 2019</p>
              <p className="font-heading text-3xl font-bold text-gray-700">$1,000</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center hover:-translate-y-0.5 transition-transform duration-200">
              <p className="font-sans text-xs text-gray-400 mb-1">Value today (~6 yrs later)</p>
              <p className="font-heading text-3xl font-bold text-brand-dark">~$5,200</p>
            </div>
          </div>

          <p className="font-sans text-sm text-gray-500 italic leading-relaxed">{content.chartNote}</p>

          <PrimaryButton onClick={onNext}>I&rsquo;m ready for the quiz →</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4 — Quiz ────────────────────────────────────────────────────────────
function getOptionStyle(
  answers: (number | null)[],
  questionIndex: number,
  optionIndex: number
): string {
  const answered = answers[questionIndex];
  const correctIndex = QUIZ_QUESTIONS[questionIndex].correctIndex;

  if (answered === null) {
    return "border-gray-200 bg-white hover:bg-brand-light hover:border-brand-mid cursor-pointer";
  }
  if (optionIndex === correctIndex)
    return "border-green-500 bg-green-50 text-green-800 cursor-default";
  if (optionIndex === answered)
    return "border-red-400 bg-red-50 text-red-700 cursor-default";
  return "border-gray-100 bg-gray-50 text-gray-400 cursor-default";
}

function QuestionBlock({
  questionIndex,
  answers,
  content,
  onAnswer,
}: {
  questionIndex: number;
  answers: (number | null)[];
  content: LessonContent;
  onAnswer: (qIdx: number, optIdx: number) => void;
}) {
  const q = QUIZ_QUESTIONS[questionIndex];
  const answered = answers[questionIndex];
  const isCorrect = answered === q.correctIndex;

  return (
    <div className="space-y-3">
      <p className="font-heading text-base font-bold text-gray-800 whitespace-nowrap">{q.question}</p>
      <div className="space-y-2">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => answered === null && onAnswer(questionIndex, i)}
            disabled={answered !== null}
            className={`font-sans w-full text-left rounded-xl border py-5 md:py-4 px-4 md:px-6 text-sm font-medium
                        min-h-[44px] transition-colors duration-200 leading-snug
                        ${getOptionStyle(answers, questionIndex, i)}`}
          >
            {opt}
          </button>
        ))}
      </div>
      {answered !== null && (
        <div
          className={`font-sans inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full ${
            isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isCorrect
            ? <CheckCircle className="w-4 h-4 shrink-0" />
            : <XCircle className="w-4 h-4 shrink-0" />}
          {isCorrect ? content.quizFeedbackCorrect : content.quizFeedbackWrong}
        </div>
      )}
    </div>
  );
}

function Step4({
  answers,
  content,
  onAnswer,
  onNext,
}: {
  answers: (number | null)[];
  content: LessonContent;
  onAnswer: (qIdx: number, optIdx: number) => void;
  onNext: () => void;
}) {
  const q1Answered = answers[0] !== null;
  const bothAnswered = q1Answered && answers[1] !== null;

  return (
    <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 md:gap-12 items-start">
      {/* Left — title + button */}
      <div className="md:w-56 md:shrink-0 space-y-5 pt-1">
        <div>
          <Label>Quick check</Label>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mt-1">
            Let&rsquo;s see what you remember
          </h2>
        </div>
        <div className={bothAnswered ? "visible" : "invisible"}>
          <PrimaryButton onClick={onNext}>Claim your badge →</PrimaryButton>
        </div>
      </div>

      {/* Right — Q1 always visible, Q2 slides in horizontally */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuestionBlock questionIndex={0} answers={answers} content={content} onAnswer={onAnswer} />

        <AnimatePresence>
          {q1Answered && (
            <motion.div
              key="q2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <QuestionBlock questionIndex={1} answers={answers} content={content} onAnswer={onAnswer} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Step 5 — Badge ───────────────────────────────────────────────────────────
function Step5({
  xpDisplay,
  checksVisible,
  onRestart,
}: {
  score: number;
  xpDisplay: number;
  checksVisible: boolean[];
  onRestart: () => void;
}) {
  return (
    <div className="w-full max-w-md flex flex-col items-center text-center space-y-7">
      {/* Badge with Framer Motion pulse ring */}
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute rounded-full border-4 border-brand-mid w-[116px] h-[116px] md:w-[148px] md:h-[148px]"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-brand-dark flex items-center justify-center z-10 shadow-md">
          <Star className="text-white w-10 h-10 md:w-12 md:h-12" fill="white" />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900">Stock Explorer</h2>
        <p className="font-sans text-sm text-gray-500">
          You completed Lesson 1 — What is a stock?
        </p>
      </div>

      {/* XP bar */}
      <div className="w-full space-y-1.5">
        <div className="flex justify-between items-center">
          <p className="font-sans text-xs font-semibold text-gray-600 uppercase tracking-wide">
            XP earned
          </p>
          <p className="font-heading text-xs font-bold text-brand-dark">
            {xpDisplay} / 100 XP
          </p>
        </div>
        <div className="h-2.5 rounded-full bg-brand-light overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-dark transition-none"
            style={{ width: `${xpDisplay}%` }}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="w-full space-y-3 text-left">
        <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-widest">
          What you learned
        </p>
        {SUMMARY_POINTS.map((point, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 transition-all duration-300 ${
              checksVisible[i] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <CheckCircle2 className="text-brand-dark w-5 h-5 shrink-0 mt-0.5" />
            <span className="font-sans text-sm text-gray-700 leading-snug">{point}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 w-full">
        <Link
          href="/lesson/2"
          className="font-sans flex-1 text-center rounded-full bg-brand-dark text-white px-6 py-3 font-bold text-sm
                     hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150 shadow-sm"
        >
          Next Lesson →
        </Link>
        <button
          onClick={onRestart}
          className="font-sans rounded-full bg-transparent border border-gray-200 text-gray-500
                     px-6 py-2.5 text-sm font-medium hover:border-gray-300 hover:text-gray-700
                     transition-colors duration-200 cursor-pointer"
        >
          Restart
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LessonPage() {
  const [step, setStep] = useState<Step>(1);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null]);
  const [score, setScore] = useState(0);
  const [xpDisplay, setXpDisplay] = useState(0);
  const [checksVisible, setChecksVisible] = useState([false, false, false]);

  const content =
    ageGroup != null ? LESSON_CONTENT[ageGroup] : LESSON_CONTENT["11-13"];

  // Scroll to top on every step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Badge animations
  useEffect(() => {
    if (step !== 5) return;

    const target = score;
    const duration = 900;

    // XP counter starts after 300ms
    const xpTimer = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setXpDisplay(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 300);

    [0, 1, 2].forEach((i) => {
      setTimeout(() => {
        setChecksVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 500 + i * 200);
    });

    // Confetti burst — green palette only
    const confettiTimer = setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 65,
        colors: ["#3B6D11", "#639922", "#EAF3DE", "#a8d85a"],
        origin: { y: 0.45 },
      });
    }, 150);

    return () => {
      clearTimeout(xpTimer);
      clearTimeout(confettiTimer);
    };
  }, [step, score]);

  function handleAnswer(questionIndex: number, selectedOption: number) {
    if (answers[questionIndex] !== null) return;
    const isCorrect =
      selectedOption === QUIZ_QUESTIONS[questionIndex].correctIndex;
    const next = [...answers];
    next[questionIndex] = selectedOption;
    setAnswers(next);
    if (isCorrect) setScore((prev) => prev + 50);
  }

  function restartDemo() {
    setStep(1);
    setAgeGroup(null);
    setAnswers([null, null]);
    setScore(0);
    setXpDisplay(0);
    setChecksVisible([false, false, false]);
  }

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen md:h-screen">
      <TopBar step={step} />

      {/* Persistent lesson indicator */}
      <div className="shrink-0 px-4 md:px-8 pt-5">
        <p className="font-sans text-xs font-semibold uppercase tracking-wide text-[#639922]">
          {LESSON_LABEL}
        </p>
      </div>

      {/* Content area — vertically + horizontally centered */}
      <main className="flex-1 flex items-start md:items-center justify-center px-4 md:px-8 py-5 md:py-8 overflow-y-auto">
        <div key={step} className="animate-fade-up w-full flex justify-center">
          {step === 1 && (
            <Step1
              ageGroup={ageGroup}
              setAgeGroup={setAgeGroup}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step2 content={content} onNext={() => setStep(3)} />
          )}
          {step === 3 && (
            <Step3 content={content} onNext={() => setStep(4)} />
          )}
          {step === 4 && (
            <Step4
              answers={answers}
              content={content}
              onAnswer={handleAnswer}
              onNext={() => setStep(5)}
            />
          )}
          {step === 5 && (
            <Step5
              score={score}
              xpDisplay={xpDisplay}
              checksVisible={checksVisible}
              onRestart={restartDemo}
            />
          )}
        </div>
      </main>
    </div>
  );
}

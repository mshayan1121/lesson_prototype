"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  BarChart3,
  TrendingUp,
  ArrowUpDown,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Check,
  Wallet,
  Users,
  RefreshCw,
  Clock,
} from "lucide-react";
import { LessonsDropdown } from "@/components/LessonsDropdown";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
type AgeGroup = "8-10" | "11-13" | "14-17";
type Step = 1 | 2 | 3 | 4 | 5;

interface LessonContent {
  intro: string;
  p1: string;
  p2: string;
  p3: string;
  sliderNote: string;
  quizFeedbackCorrect: string;
  quizFeedbackWrong: string;
}

// ─── Content ──────────────────────────────────────────────────────────────────
const LESSON_CONTENT: Record<AgeGroup, LessonContent> = {
  "8-10": {
    intro:
      "A portfolio is like your collection of stocks — like a sticker collection but worth real money.",
    p1: "A portfolio is all the stocks you own at once. Imagine a bag where you keep all your stickers — your portfolio is that bag, but instead of stickers it holds pieces of real companies.",
    p2: "Stock prices go up and down every day because of how many people want to buy or sell. If lots of people want a stock, the price goes up. If people don't want it, the price goes down.",
    p3: "Profit means your stock is now worth more than you paid — you made money! Loss means it's worth less — but only if you sell. If you wait, prices can go back up.",
    sliderNote:
      "Move the slider to see how your portfolio changes when the market goes up or down. Don't worry about the red — it happens to every investor!",
    quizFeedbackCorrect: "Woohoo! You got it right!",
    quizFeedbackWrong: "Almost! The green answer is correct.",
  },
  "11-13": {
    intro:
      "A portfolio is all the stocks you own. When prices go up your portfolio grows, when they go down it shrinks.",
    p1: "A portfolio is everything you've invested in. You might own Apple for tech, Nike for sports brands, and Tesla for electric cars — together that's your portfolio and it's diversified across different industries.",
    p2: "Prices change based on supply and demand. If Apple announces record profits, more people want to buy so the price rises. If there's bad news, people sell and the price drops. This happens every trading day.",
    p3: "Profit (gain) is when your stock price is higher than what you paid. Loss is when it's lower. You only truly profit or lose when you actually sell — until then, it's just 'on paper'.",
    sliderNote:
      "This slider simulates a market move. Real portfolios move like this every day — up or down based on news, economic data, and investor sentiment.",
    quizFeedbackCorrect: "Correct! You understand how stocks work.",
    quizFeedbackWrong: "Not quite. The green answer is correct.",
  },
  "14-17": {
    intro:
      "A portfolio is the total collection of your investments. Its value fluctuates based on the market price of each asset you hold.",
    p1: "A portfolio represents your total invested capital across different securities. Diversification across sectors (tech, consumer, EV) reduces unsystematic risk — when one sector underperforms, others may compensate.",
    p2: "Stock prices reflect the market's collective forecast of future earnings. Prices move on earnings reports, macro data (CPI, Fed rates), geopolitical events, and sentiment shifts. Price discovery happens continuously via the bid-ask mechanism on exchanges.",
    p3: "Unrealised P&L is the change in market value versus your cost basis — it's theoretical until you sell. Realised P&L is locked in at point of sale. Tax treatment differs: short-term gains (<1 year) are taxed as income; long-term gains get preferential rates.",
    sliderNote:
      "This simulates a uniform market beta move. In reality, each stock has its own beta (sensitivity to market moves) — TSLA typically moves more than AAPL on any given market swing.",
    quizFeedbackCorrect: "Correct. Solid understanding of portfolio mechanics.",
    quizFeedbackWrong: "Incorrect. The correct answer is highlighted in green.",
  },
};

// ─── Quiz ─────────────────────────────────────────────────────────────────────
const QUIZ_QUESTIONS: Array<{
  question: string;
  options: string[];
  correctIndex: number;
}> = [
  {
    question: "What is a portfolio?",
    options: [
      "A type of stock",
      "All the investments you own",
      "A broker app",
    ],
    correctIndex: 1,
  },
  {
    question: "If a stock price goes up, what happens to your portfolio?",
    options: ["Nothing changes", "It loses value", "It gains value"],
    correctIndex: 2,
  },
];

const SUMMARY_POINTS = [
  "A portfolio is all the stocks you own",
  "Stock prices change based on supply and demand",
  "Profit means your stock is worth more than you paid",
];

const LESSON_LABEL = "Lesson 3 — Your Portfolio";

// ─── Holdings ─────────────────────────────────────────────────────────────────
interface Holding {
  ticker: string;
  company: string;
  shares: number;
  buyPrice: number;
}

const HOLDINGS: Holding[] = [
  { ticker: "AAPL", company: "Apple Inc.", shares: 2, buyPrice: 150 },
  { ticker: "NKE", company: "Nike Inc.", shares: 5, buyPrice: 95 },
  { ticker: "TSLA", company: "Tesla Inc.", shares: 1, buyPrice: 200 },
];

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

// ─── Step pill bar (4 steps) ──────────────────────────────────────────────────
const STEP_LABELS = ["Hook", "Portfolio", "Slider", "Quiz", "Badge"] as const;

function StepPillBar({ step }: { step: Step }) {
  return (
    <div className="flex items-start">
      {([1, 2, 3, 4, 5] as Step[]).map((n, i) => {
        const isCompleted = n < step;
        const isActive = n === step;

        return (
          <div key={n} className="flex items-center">
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
                className={`font-sans text-xs ${isActive ? "font-bold" : "font-medium"} whitespace-nowrap ${isActive ? "" : "invisible md:visible"}`}
              >
                {STEP_LABELS[i]}
              </motion.span>
            </div>
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
        <span className="font-heading text-sm font-bold text-brand-dark tracking-tight">
          Trading Academy
        </span>
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
        icon: <Wallet className="w-4 h-4 text-brand-dark" />,
        value: "$1.3T",
        label: "Total value of retail investor portfolios in the US",
      },
      {
        icon: <Users className="w-4 h-4 text-brand-dark" />,
        value: "47%",
        label: "Americans who own at least one stock",
      },
      {
        icon: <RefreshCw className="w-4 h-4 text-brand-dark" />,
        value: "24hrs",
        label: "How often market prices update (continuously)",
      },
      {
        icon: <Clock className="w-4 h-4 text-brand-dark" />,
        value: "10 yrs",
        label: "Average holding period for long term investors",
      },
    ];

  return (
    <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12 items-start md:items-center w-full max-w-5xl">
      {/* Left */}
      <div className="space-y-5">
        <div>
          <Label>Lesson 3 — Your Portfolio</Label>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 leading-tight mt-1">
            You bought your first stock. Now what?
          </h1>
          <p className="font-sans text-base text-gray-500 mt-2 leading-relaxed">
            Every investor watches their portfolio. Let&rsquo;s see what yours looks like.
          </p>
        </div>

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

        <PrimaryButton
          onClick={onNext}
          disabled={!ageGroup}
          className="!w-full !font-semibold !text-base"
        >
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
            <p className="font-heading text-3xl font-bold text-brand-dark leading-none">
              {s.value}
            </p>
            <p className="font-sans text-xs text-gray-500 leading-snug">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2 — Portfolio Concept ───────────────────────────────────────────────
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
        icon: <BarChart3 className="w-4 h-4 text-brand-dark" />,
        title: "What is a portfolio?",
        text: content.p1,
      },
      {
        icon: <TrendingUp className="w-4 h-4 text-brand-dark" />,
        title: "Why do stock prices change?",
        text: content.p2,
      },
      {
        icon: <ArrowUpDown className="w-4 h-4 text-brand-dark" />,
        title: "What is profit and loss?",
        text: content.p3,
      },
    ];

  return (
    <div className="flex flex-col md:grid md:grid-cols-5 gap-8 md:gap-12 items-start w-full max-w-5xl">
      {/* Left — heading, intro, button */}
      <div className="md:col-span-2 space-y-5 pt-1">
        <div>
          <Label>The Concept</Label>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mt-1">
            What is a portfolio?
          </h2>
          <p className="font-sans text-lg text-gray-600 mt-2 leading-relaxed">
            {content.intro}
          </p>
        </div>
        <PrimaryButton onClick={onNext}>
          Show me my portfolio →
        </PrimaryButton>
      </div>

      {/* Right — concept blocks */}
      <div className="md:col-span-3 space-y-3">
        {blocks.map((b) => (
          <div
            key={b.title}
            className="bg-white border-l-4 border-brand-mid rounded-r-2xl shadow-sm p-4"
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

// ─── Step 3 — Portfolio + Slider ──────────────────────────────────────────────
function formatDelta(amount: number): string {
  const sign = amount >= 0 ? "+" : "";
  return `${sign}$${Math.abs(amount).toFixed(2)}`;
}

function formatPct(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function getSliderMessage(marketChange: number): string {
  if (marketChange < -20)
    return "Market crash! Stay calm — long term investors don't panic sell.";
  if (marketChange < 0)
    return "Market dip. This is normal. Many investors buy more here.";
  if (marketChange <= 30)
    return "Steady growth. Your portfolio is doing well!";
  return "Bull market! Your investments are growing fast.";
}

function getSliderMessageColor(marketChange: number): string {
  if (marketChange < -20) return "text-red-700 bg-red-50 border-red-200";
  if (marketChange < 0) return "text-amber-700 bg-amber-50 border-amber-200";
  if (marketChange <= 30) return "text-green-700 bg-green-50 border-green-200";
  return "text-brand-dark bg-brand-light border-green-200";
}

function Step3({
  content,
  onNext,
}: {
  content: LessonContent;
  onNext: () => void;
}) {
  const [marketChange, setMarketChange] = useState(0);
  const sliderRef = useRef<HTMLInputElement>(null);

  const totalCost = HOLDINGS.reduce(
    (sum, h) => sum + h.shares * h.buyPrice,
    0
  );
  const totalCurrent = HOLDINGS.reduce((sum, h) => {
    const currentPrice = h.buyPrice * (1 + marketChange / 100);
    return sum + h.shares * currentPrice;
  }, 0);
  const totalDelta = totalCurrent - totalCost;
  const totalPct = (totalDelta / totalCost) * 100;

  const isPositive = marketChange >= 0;

  return (
    <div className="w-full max-w-5xl space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <Label>See it in action</Label>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900">
          Your portfolio
        </h2>
        <p className="font-sans text-base text-gray-500">
          You invested $1,000. Here&rsquo;s what happened over the past year.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        {/* Portfolio card */}
        <div className="col-span-1 md:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <div className="min-w-[420px]">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
            <p className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Stock
            </p>
            <p className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-widest text-right">
              Shares
            </p>
            <p className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-widest text-right">
              Buy
            </p>
            <p className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-widest text-right">
              Now
            </p>
            <p className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-widest text-right">
              P/L
            </p>
          </div>

          {/* Rows */}
          {HOLDINGS.map((h) => {
            const currentPrice = h.buyPrice * (1 + marketChange / 100);
            const delta = h.shares * (currentPrice - h.buyPrice);
            const pct = ((currentPrice - h.buyPrice) / h.buyPrice) * 100;
            const isUp = delta >= 0;

            return (
              <div
                key={h.ticker}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-5 py-3.5 border-b border-gray-50 items-center"
              >
                {/* Ticker + company */}
                <div>
                  <p className="font-heading text-sm font-bold text-gray-800">
                    {h.ticker}
                  </p>
                  <p className="font-sans text-xs text-gray-400">{h.company}</p>
                </div>
                <p className="font-sans text-sm text-gray-600 text-right">
                  {h.shares}
                </p>
                <p className="font-sans text-sm text-gray-600 text-right">
                  ${h.buyPrice.toFixed(2)}
                </p>
                <p className="font-sans text-sm font-semibold text-gray-800 text-right tabular-nums">
                  ${currentPrice.toFixed(2)}
                </p>
                <div className="text-right">
                  <p
                    className={`font-sans text-sm font-bold tabular-nums ${
                      isUp ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {formatDelta(delta)}
                  </p>
                  <p
                    className={`font-sans text-xs tabular-nums ${
                      isUp ? "text-green-500" : "text-red-400"
                    }`}
                  >
                    {formatPct(pct)}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Total row */}
          <div className="px-5 py-4 flex items-center justify-between">
            <p className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Total portfolio
            </p>
            <div className="text-right">
              <motion.p
                key={totalCurrent.toFixed(2)}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                className="font-heading text-2xl font-bold text-gray-900 tabular-nums"
              >
                ${totalCurrent.toFixed(2)}
              </motion.p>
              <p
                className={`font-sans text-sm font-bold tabular-nums ${
                  totalDelta >= 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {formatDelta(totalDelta)} ({formatPct(totalPct)})
              </p>
            </div>
          </div>
          </div>
          </div>
        </div>

        {/* Right panel — slider + note + button */}
        <div className="col-span-1 md:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <p className="font-heading text-sm font-bold text-gray-800 mb-0.5">
                Move the market
              </p>
              <p className="font-sans text-xs text-gray-400">
                Drag the slider to simulate a market move
              </p>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-sans text-xs text-gray-400">−50%</span>
                <span
                  className={`font-heading text-lg font-bold tabular-nums ${
                    isPositive ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {formatPct(marketChange)}
                </span>
                <span className="font-sans text-xs text-gray-400">+100%</span>
              </div>

              <div className="relative">
                {/* Colored track fill */}
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  {/* Zero point is at 33.33% of slider width (50 / 150 total range) */}
                  {isPositive ? (
                    <div
                      className="absolute h-2 bg-green-500 rounded-full transition-none"
                      style={{
                        left: "33.33%",
                        width: `${(marketChange / 150) * 100}%`,
                      }}
                    />
                  ) : (
                    <div
                      className="absolute h-2 bg-red-400 rounded-full transition-none"
                      style={{
                        right: `${100 - 33.33}%`,
                        width: `${(Math.abs(marketChange) / 150) * 100}%`,
                      }}
                    />
                  )}
                </div>
                <input
                  ref={sliderRef}
                  type="range"
                  min={-50}
                  max={100}
                  step={1}
                  value={marketChange}
                  onChange={(e) => setMarketChange(Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
                  style={{ zIndex: 10 }}
                />
                {/* Visible thumb */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-md transition-colors duration-200 pointer-events-none ${
                    isPositive ? "bg-green-500" : "bg-red-400"
                  }`}
                  style={{
                    left: `calc(${((marketChange + 50) / 150) * 100}% - 10px)`,
                  }}
                />
              </div>
            </div>

            {/* Dynamic message */}
            <div
              className={`font-sans text-xs font-medium px-3 py-2.5 rounded-xl border leading-snug ${getSliderMessageColor(
                marketChange
              )}`}
            >
              {getSliderMessage(marketChange)}
            </div>
          </div>

          {/* Age note */}
          <p className="font-sans text-xs text-gray-400 italic leading-relaxed">
            {content.sliderNote}
          </p>

          <PrimaryButton onClick={onNext} className="!w-full">
            I get it — take the quiz →
          </PrimaryButton>
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
            isCorrect
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isCorrect ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0" />
          )}
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
      {/* Left — title + xp + button */}
      <div className="md:w-56 md:shrink-0 space-y-5 pt-1">
        <div>
          <Label>Quick check</Label>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mt-1">
            Let&rsquo;s see what you remember
          </h2>
        </div>
        <p className="font-sans text-xs text-gray-400">
          +50 XP per correct answer
        </p>
        <div className={bothAnswered ? "visible" : "invisible"}>
          <PrimaryButton onClick={onNext}>Claim your badge →</PrimaryButton>
        </div>
      </div>

      {/* Right — Q1 always visible, Q2 slides in */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuestionBlock
          questionIndex={0}
          answers={answers}
          content={content}
          onAnswer={onAnswer}
        />
        <AnimatePresence>
          {q1Answered && (
            <motion.div
              key="q2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <QuestionBlock
                questionIndex={1}
                answers={answers}
                content={content}
                onAnswer={onAnswer}
              />
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
      {/* Badge with pulse ring */}
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute rounded-full border-4 border-brand-mid w-[116px] h-[116px] md:w-[148px] md:h-[148px]"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-brand-dark flex items-center justify-center z-10 shadow-md">
          <BarChart3 className="text-white w-10 h-10 md:w-12 md:h-12" />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900">
          Portfolio Pro
        </h2>
        <p className="font-sans text-sm text-gray-500">
          You completed Lesson 3 — What happens after you buy?
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

      {/* Summary checklist */}
      <div className="w-full space-y-3 text-left">
        <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-widest">
          What you learned
        </p>
        {SUMMARY_POINTS.map((point, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 transition-all duration-300 ${
              checksVisible[i]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
          >
            <CheckCircle2 className="text-brand-dark w-5 h-5 shrink-0 mt-0.5" />
            <span className="font-sans text-sm text-gray-700 leading-snug">
              {point}
            </span>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 w-full">
        <Link
          href="/lesson/4"
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
export default function Lesson3Page() {
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

  function restartLesson() {
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
              onRestart={restartLesson}
            />
          )}
        </div>
      </main>
    </div>
  );
}

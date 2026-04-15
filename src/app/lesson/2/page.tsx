"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Building2,
  ShoppingCart,
  SlidersHorizontal,
  TrendingUp,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Check,
  Users,
  DollarSign,
  Clock,
  Percent,
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
  quizFeedbackCorrect: string;
  quizFeedbackWrong: string;
  orderNote: string;
}

// ─── Content ──────────────────────────────────────────────────────────────────
const LESSON_CONTENT: Record<AgeGroup, LessonContent> = {
  "8-10": {
    intro:
      "A broker is like a shopkeeper for stocks. You tell them what you want to buy and they get it for you.",
    p1: "A broker is like a shopkeeper for stocks — you walk in, say 'I want one share of Apple', and they get it for you. Without a broker, you can't buy stocks.",
    p2: "A buy order is like a shopping list. You write down what you want (Apple stock), how many (1 share), and your broker goes and gets it from someone who wants to sell.",
    p3: "A market order says 'buy right now at whatever price it is'. A limit order says 'only buy if the price is this low or lower'. It's like saying you'll only buy a toy if it goes on sale.",
    quizFeedbackCorrect: "Woohoo! You got it right!",
    quizFeedbackWrong: "Almost! The green answer is correct.",
    orderNote:
      "You just told a broker 'buy me some Apple!' — and they did it instantly. That's all investing really is.",
  },
  "11-13": {
    intro:
      "A broker is a platform or app where you can buy and sell stocks. Examples are apps like Robinhood or eToro.",
    p1: "A broker is a platform like Robinhood, eToro, or Fidelity where you create an account, add money, and then buy or sell stocks. You need a broker account to access the stock market.",
    p2: "A buy order tells your broker: 'buy X shares of this stock'. Once you submit it, your broker finds a seller on the stock exchange and completes the trade — usually in milliseconds.",
    p3: "A market order buys immediately at the current price. A limit order lets you set a maximum price you're willing to pay — your order only executes if the stock drops to that price.",
    quizFeedbackCorrect: "Correct! You understand how stocks work.",
    quizFeedbackWrong: "Not quite. The green answer is correct.",
    orderNote:
      "That's a real broker screen. You just placed a simulated market order — in a real app, your trade would execute in under a second.",
  },
  "14-17": {
    intro:
      "A broker is a licensed intermediary that executes buy and sell orders on your behalf on the stock exchange. They charge a small fee called a commission.",
    p1: "A broker is a licensed intermediary — FINRA-regulated in the US — that routes your orders to exchanges like NYSE or NASDAQ. Modern retail brokers (Robinhood, Fidelity) operate on a PFOF (Payment For Order Flow) model, which is how they offer $0 commissions.",
    p2: "A buy order creates a trade request specifying ticker, quantity, and order type. It goes through your broker's OMS (Order Management System) to the exchange, where it matches with a sell order in the order book, usually within milliseconds.",
    p3: "A market order executes immediately at the best available ask price — guaranteed fill, but price may vary in volatile markets (slippage). A limit order only fills at your specified price or better — guaranteed price, but execution is not guaranteed.",
    quizFeedbackCorrect: "Correct. Solid understanding of brokerage mechanics.",
    quizFeedbackWrong: "Incorrect. The correct answer is highlighted in green.",
    orderNote:
      "Market orders guarantee execution but not price. In high-volume stocks like AAPL, slippage is typically sub-cent. Limit orders protect against slippage but risk non-execution.",
  },
};

const QUIZ_QUESTIONS: Array<{
  question: string;
  options: string[];
  correctIndex: number;
}> = [
  {
    question: "What is a broker?",
    options: [
      "A type of stock",
      "A platform where you buy and sell stocks",
      "A company like Apple",
    ],
    correctIndex: 1,
  },
  {
    question: "What do you need to buy a stock?",
    options: [
      "A broker account and money",
      "Just a phone",
      "Permission from Apple",
    ],
    correctIndex: 0,
  },
];

const SUMMARY_POINTS = [
  "A broker is where you buy and sell stocks",
  "A market order buys at the current price",
  "You can start investing with as little as $1",
];

const STOCK_PRICE = 213.5;

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

const STEP_LABELS = ["Hook", "How to Buy", "Order Screen", "Quiz", "Badge"] as const;

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
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0"
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
                className={`font-sans text-xs ${isActive ? "font-bold" : "font-medium"} whitespace-nowrap`}
              >
                {STEP_LABELS[i]}
              </motion.span>
            </div>

            {i < 4 && <div className="w-10 h-px bg-gray-200 mx-1 mb-5" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Top header bar ───────────────────────────────────────────────────────────

function TopBar({ step }: { step: Step }) {
  return (
    <header className="shrink-0 bg-white border-b border-gray-100 px-8 py-4 grid grid-cols-3 items-center">
      <span className="font-heading text-sm font-bold text-brand-dark tracking-tight">
        Trading Academy
      </span>
      <div className="flex justify-center">
        <StepPillBar step={step} />
      </div>
      <div className="flex justify-end">
        <LessonsDropdown />
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
        icon: <Users className="w-4 h-4 text-brand-dark" />,
        value: "10M+",
        label: "People who own Apple stock",
      },
      {
        icon: <DollarSign className="w-4 h-4 text-brand-dark" />,
        value: "$1",
        label: "Minimum you can invest on some platforms",
      },
      {
        icon: <Clock className="w-4 h-4 text-brand-dark" />,
        value: "3 mins",
        label: "How long it takes to place an order",
      },
      {
        icon: <Percent className="w-4 h-4 text-brand-dark" />,
        value: "0%",
        label: "Commission on many modern brokers",
      },
    ];

  return (
    <div className="grid grid-cols-2 gap-12 items-center w-full max-w-5xl">
      {/* Left */}
      <div className="space-y-5">
        <div>
          <Label>Lesson 2 — Buying Stocks</Label>
          <h1 className="font-heading text-4xl font-bold text-gray-900 leading-tight mt-1">
            You know what a stock is. But how do you actually buy one?
          </h1>
          <p className="font-sans text-base text-gray-500 mt-2 leading-relaxed">
            Millions of people own Apple stock. Let&rsquo;s find out exactly how they got it.
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

// ─── Step 2 — How to Buy ──────────────────────────────────────────────────────
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
        icon: <Building2 className="w-4 h-4 text-brand-dark" />,
        title: "What is a broker?",
        text: content.p1,
      },
      {
        icon: <ShoppingCart className="w-4 h-4 text-brand-dark" />,
        title: "What does a buy order look like?",
        text: content.p2,
      },
      {
        icon: <SlidersHorizontal className="w-4 h-4 text-brand-dark" />,
        title: "Market price vs limit price",
        text: content.p3,
      },
    ];

  return (
    <div className="grid grid-cols-5 gap-12 items-start w-full max-w-5xl">
      {/* Left — heading, intro, button */}
      <div className="col-span-2 space-y-5 pt-1">
        <div>
          <Label>The Concept</Label>
          <h2 className="font-heading text-4xl font-bold text-gray-900 mt-1">
            What do you need to buy a stock?
          </h2>
          <p className="font-sans text-lg text-gray-600 mt-2 leading-relaxed">
            {content.intro}
          </p>
        </div>
        <PrimaryButton onClick={onNext}>Show me the order screen →</PrimaryButton>
      </div>

      {/* Right — concept blocks */}
      <div className="col-span-3 space-y-3">
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

// ─── Step 3 — Order Screen ────────────────────────────────────────────────────
function Step3({
  content,
  onNext,
}: {
  content: LessonContent;
  onNext: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [ordered, setOrdered] = useState(false);
  const orderConfettiRef = useRef(false);

  const total = (quantity * STOCK_PRICE).toFixed(2);

  function handleBuy() {
    if (ordered) return;
    setOrdered(true);
    if (!orderConfettiRef.current) {
      orderConfettiRef.current = true;
      confetti({
        particleCount: 70,
        spread: 55,
        colors: ["#3B6D11", "#639922", "#EAF3DE", "#a8d85a"],
        origin: { y: 0.5 },
      });
    }
  }

  return (
    <div className="grid grid-cols-2 gap-12 items-start w-full max-w-5xl">
      {/* Left */}
      <div className="space-y-5 pt-1">
        <div>
          <Label>See it in action</Label>
          <h2 className="font-heading text-4xl font-bold text-gray-900 mt-1">
            Place your first order
          </h2>
          <p className="font-sans text-base text-gray-500 mt-2 leading-relaxed">
            This is what a real broker screen looks like. Try placing a buy order.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!ordered ? (
            <motion.p
              key="note-pre"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-sans text-sm text-gray-500 italic leading-relaxed bg-brand-light rounded-xl px-4 py-3"
            >
              {content.intro}
            </motion.p>
          ) : (
            <motion.div
              key="note-post"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="font-sans text-sm text-gray-600 leading-relaxed bg-brand-light rounded-xl px-4 py-3"
            >
              {content.orderNote}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {ordered && (
            <motion.div
              key="next-btn"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <PrimaryButton onClick={onNext} className="!w-full !font-semibold !text-base">
                I get it — take the quiz →
              </PrimaryButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right — broker card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        {/* Card header */}
        <div className="bg-brand-dark px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading text-lg font-bold text-white leading-none">
                AAPL
              </p>
              <p className="font-sans text-xs text-green-200 mt-0.5">Apple Inc.</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                <span className="font-sans text-xs font-semibold text-green-400">
                  +2.4% today
                </span>
              </div>
              <p className="font-heading text-2xl font-bold text-white mt-0.5">
                $213.50
              </p>
            </div>
          </div>
        </div>

        {/* Card body */}
        <AnimatePresence mode="wait">
          {!ordered ? (
            <motion.div
              key="order-form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-5 space-y-4"
            >
              {/* Order type toggle */}
              <div>
                <p className="font-sans text-xs text-gray-400 font-medium mb-1.5">
                  Order type
                </p>
                <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                  {(["market", "limit"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type)}
                      className={`flex-1 py-2.5 text-sm font-semibold font-sans transition-colors duration-200 cursor-pointer
                        ${
                          orderType === type
                            ? "bg-brand-dark text-white"
                            : "bg-white text-gray-500 hover:bg-brand-light"
                        }`}
                    >
                      {type === "market" ? "Market Order" : "Limit Order"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <p className="font-sans text-xs text-gray-400 font-medium mb-1.5">
                  Quantity (shares)
                </p>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={quantity}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v >= 1 && v <= 100) setQuantity(v);
                  }}
                  className="font-sans w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800
                             focus:outline-none focus:ring-2 focus:ring-brand-mid focus:border-transparent transition"
                />
              </div>

              {/* Estimated total */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <p className="font-sans text-xs text-gray-500 font-medium">
                  Estimated total
                </p>
                <p className="font-heading text-lg font-bold text-gray-800">
                  ${total}
                </p>
              </div>

              {/* Available balance */}
              <div className="flex items-center justify-between px-1">
                <p className="font-sans text-xs text-gray-400">
                  Available balance
                </p>
                <p className="font-sans text-xs font-semibold text-gray-600">
                  $1,000.00
                </p>
              </div>

              {/* Buy button */}
              <button
                onClick={handleBuy}
                className="font-sans w-full rounded-xl bg-green-600 text-white py-3.5 font-bold text-sm
                           hover:bg-green-700 active:scale-[0.99] transition-all duration-150 cursor-pointer shadow-sm"
              >
                Buy AAPL
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="order-success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="p-5 flex flex-col items-center text-center gap-4 py-10"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-600" />
              </div>
              <div>
                <p className="font-heading text-2xl font-bold text-gray-900">
                  Order placed!
                </p>
                <p className="font-sans text-sm text-gray-500 mt-1 leading-relaxed">
                  You just bought{" "}
                  <span className="font-bold text-brand-dark">
                    {quantity} share{quantity !== 1 ? "s" : ""}
                  </span>{" "}
                  of Apple for{" "}
                  <span className="font-bold text-brand-dark">${total}</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-green-50 rounded-full px-4 py-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-sans text-xs font-semibold text-green-700">
                  You&rsquo;re now an Apple investor
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
      <p className="font-heading text-base font-bold text-gray-800">{q.question}</p>
      <div className="space-y-2">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => answered === null && onAnswer(questionIndex, i)}
            disabled={answered !== null}
            className={`font-sans w-full text-left rounded-xl border py-4 px-6 text-sm font-medium
                        transition-colors duration-200 leading-snug
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
          {isCorrect
            ? content.quizFeedbackCorrect
            : content.quizFeedbackWrong}
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
    <div className="w-full max-w-5xl flex gap-12 items-start">
      {/* Left — title + button */}
      <div className="w-56 shrink-0 space-y-5 pt-1">
        <div>
          <Label>Quick check</Label>
          <h2 className="font-heading text-4xl font-bold text-gray-900 mt-1">
            Let&rsquo;s see what you remember
          </h2>
        </div>
        <div className={bothAnswered ? "visible" : "invisible"}>
          <PrimaryButton onClick={onNext}>Claim your badge →</PrimaryButton>
        </div>
      </div>

      {/* Right — Q1 always visible, Q2 slides in */}
      <div className="flex-1 grid grid-cols-2 gap-6">
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
          className="absolute rounded-full border-4 border-brand-mid"
          style={{ width: 148, height: 148 }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
        <div className="w-32 h-32 rounded-full bg-brand-dark flex items-center justify-center z-10 shadow-md">
          <ShoppingCart className="text-white w-12 h-12" />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-heading text-4xl font-bold text-gray-900">
          First Buyer
        </h2>
        <p className="font-sans text-sm text-gray-500">
          You completed Lesson 2 — How to buy a stock
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

      {/* Actions */}
      <div className="flex gap-3 w-full">
        <Link
          href="/lesson/3"
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
export default function Lesson2Page() {
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
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <TopBar step={step} />

      <main className="flex-1 flex items-center justify-center px-8 py-12 overflow-hidden">
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

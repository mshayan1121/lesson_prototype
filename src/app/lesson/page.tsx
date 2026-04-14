"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  BarChart2,
  Smartphone,
  PieChart,
  Star,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

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
    intro:
      "A stock is like owning a tiny slice of a pizza — except the pizza is a company like Apple!",
    p1: "Imagine your friend wants to open a lemonade stand but needs $10 to buy lemons and cups. You give them $5, so now you own HALF the stand. If it makes $20, you get $10 back! Stocks work the same way — except the company is Apple, not a lemonade stand.",
    p2: "Apple makes billions of iPhones, iPads, and MacBooks every year. When you buy one tiny piece of Apple (called a stock), you own a teeny-tiny bit of all that! If Apple sells more stuff and makes more money, your little slice becomes worth more too.",
    p3: "Big companies like Apple need LOTS of money to build new things — new iPhone factories, new apps, new countries to sell in. Instead of borrowing from a bank, they sell tiny pieces of themselves to people like you and me. That way, everyone can be a co-owner!",
    chartNote:
      "Each dot is a year. When the line goes up, investors made more money on their slice!",
    quizFeedbackCorrect: "Woohoo! You got it right!",
    quizFeedbackWrong: "Almost! The green answer is the correct one.",
  },
  "11-13": {
    intro:
      "A stock is a share of ownership in a company. When you buy a stock, you become a part-owner — even if it's a tiny part.",
    p1: "Think about owning a piece of your favorite sports team. If the team wins the championship and becomes more popular, your piece becomes more valuable. Stocks work exactly like that — you buy a slice of a company, and if the company does well, your slice grows in value.",
    p2: "Apple earns around $383 billion a year. Investors who bought Apple stock years ago are now sitting on huge gains. The stock price isn't just about what Apple earns today — it's about what people think Apple will earn in the future. When expectations go up, the price goes up.",
    p3: "When Apple wants to build a new factory or hire 10,000 engineers, they need hundreds of billions of dollars. One way to raise that money is to sell shares to the public (an IPO). In exchange for your money, you get part ownership — and a share of any future profits.",
    chartNote:
      "Notice the dip in 2022 — that was a tough year for the whole market. But Apple bounced back hard.",
    quizFeedbackCorrect: "Correct! Great thinking — you understand how stocks work.",
    quizFeedbackWrong: "Not quite. The highlighted answer in green is correct.",
  },
  "14-17": {
    intro:
      "A stock represents equity — partial ownership of a company. When you hold shares, you have a proportional claim on the company's assets and earnings.",
    p1: "Equity ownership means you participate in the company's upside and downside. If Apple's net income rises, the stock price typically rises — because earnings per share (EPS) increases, and investors pay a premium for those earnings. The P/E ratio tells you how many dollars investors pay per dollar of earnings.",
    p2: "Apple's ~$3T market cap means investors collectively believe Apple's future cash flows are worth $3 trillion in today's dollars. This is the DCF concept — you're buying the present value of all future profits. When growth expectations rise, so does the price, even if current earnings haven't changed.",
    p3: "Companies raise capital through equity because it doesn't require repayment like debt. For investors, equity offers higher potential returns than bonds — but with more volatility. Apple's ~35% profit margin means they keep $0.35 per $1 of revenue, which is exceptional and drives their high valuation multiple.",
    chartNote:
      "Price appreciation only — add reinvested dividends and Apple's buybacks, and the real return is even higher.",
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

// ─── Shared primitives ────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-brand-mid mb-1">
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
      className={`rounded-full bg-brand-dark text-white px-8 py-3 font-bold text-sm
                 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150
                 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100
                 cursor-pointer shadow-sm ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Top header bar ───────────────────────────────────────────────────────────

function TopBar({ step }: { step: Step }) {
  const labels = ["Hook", "Concept", "Chart", "Quiz", "Badge"];
  return (
    <header className="shrink-0 bg-white border-b border-gray-100 px-8 h-14 flex items-center justify-between">
      <span className="text-sm font-bold text-brand-dark tracking-tight">
        Trading Academy
      </span>

      {/* Progress dots */}
      <div className="flex items-center gap-2">
        {([1, 2, 3, 4, 5] as Step[]).map((n) => (
          <div
            key={n}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              n < step
                ? "bg-brand-dark"
                : n === step
                ? "bg-brand-mid"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <span className="text-xs text-gray-400 font-medium">
        Step {step} of 5 — {labels[step - 1]}
      </span>
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
    <div className="grid grid-cols-2 gap-12 items-center w-full max-w-4xl">
      {/* Left */}
      <div className="space-y-5">
        <div>
          <Label>Lesson 1 — Stocks</Label>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mt-1">
            How does Apple make $383 billion a year?
          </h1>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            Let&rsquo;s start with something you already know — and work
            backwards to understand how investing works.
          </p>
        </div>

        <p className="text-sm font-semibold text-gray-800 bg-brand-light rounded-xl px-4 py-3 leading-snug">
          You didn&rsquo;t build Apple. Can you still own a piece of it?{" "}
          <span className="text-brand-dark">Yes. That&rsquo;s what a stock is.</span>
        </p>

        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">
            Pick your age group for the right explanation:
          </p>
          <div className="flex gap-2">
            {(["8-10", "11-13", "14-17"] as AgeGroup[]).map((ag) => (
              <button
                key={ag}
                onClick={() => setAgeGroup(ag)}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 cursor-pointer
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

        <PrimaryButton onClick={onNext} disabled={!ageGroup}>
          Let&rsquo;s go →
        </PrimaryButton>
      </div>

      {/* Right — stat grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2
                       hover:-translate-y-0.5 transition-transform duration-200 cursor-default"
          >
            <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center">
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-brand-dark leading-none">{s.value}</p>
            <p className="text-xs text-gray-500 leading-snug">{s.label}</p>
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
    <div className="grid grid-cols-5 gap-12 items-start w-full max-w-4xl">
      {/* Left */}
      <div className="col-span-2 space-y-5 pt-1">
        <div>
          <Label>The concept</Label>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">What is a stock?</h2>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">{content.intro}</p>
        </div>
        <PrimaryButton onClick={onNext}>Got it — show me the chart →</PrimaryButton>
      </div>

      {/* Right — lesson blocks */}
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
              <p className="text-sm font-bold text-gray-800">{b.title}</p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{b.text}</p>
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
    <div className="grid grid-cols-2 gap-12 items-center w-full max-w-4xl">
      {/* Left */}
      <div className="space-y-5">
        <div>
          <Label>See it in action</Label>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">
            Apple&rsquo;s stock price over time
          </h2>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            This is what investors watch. When the price goes up, your slice is
            worth more.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center hover:-translate-y-0.5 transition-transform duration-200">
            <p className="text-xs text-gray-400 mb-1">If you bought in 2019</p>
            <p className="text-2xl font-bold text-gray-700">$1,000</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center hover:-translate-y-0.5 transition-transform duration-200">
            <p className="text-xs text-gray-400 mb-1">Value today (~6 yrs later)</p>
            <p className="text-2xl font-bold text-brand-dark">~$5,200</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 italic leading-relaxed">{content.chartNote}</p>

        <PrimaryButton onClick={onNext}>I&rsquo;m ready for the quiz →</PrimaryButton>
      </div>

      {/* Right — chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 h-full flex items-center">
        <div className="w-full">
          <AaplChart />
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
  const q2Answered = answers[1] !== null;
  const bothAnswered = q1Answered && q2Answered;

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div>
        <Label>Quick check</Label>
        <h2 className="text-3xl font-bold text-gray-900 mt-1">
          Let&rsquo;s see what you remember
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Q1 */}
        <div className="space-y-3">
          <p className="text-sm font-bold text-gray-800">
            {QUIZ_QUESTIONS[0].question}
          </p>
          <div className="space-y-2">
            {QUIZ_QUESTIONS[0].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => answers[0] === null && onAnswer(0, i)}
                disabled={answers[0] !== null}
                className={`w-full text-left rounded-xl border px-4 py-2.5 text-sm font-medium
                            transition-colors duration-200 leading-snug
                            ${getOptionStyle(answers, 0, i)}`}
              >
                {opt}
              </button>
            ))}
          </div>
          {answers[0] !== null && (
            <p
              className={`text-xs font-semibold px-3 py-2 rounded-lg ${
                answers[0] === QUIZ_QUESTIONS[0].correctIndex
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {answers[0] === QUIZ_QUESTIONS[0].correctIndex
                ? content.quizFeedbackCorrect
                : content.quizFeedbackWrong}
            </p>
          )}
        </div>

        {/* Q2 — fades in after Q1 answered */}
        <div
          className={`space-y-3 transition-all duration-500 ${
            q1Answered
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3 pointer-events-none"
          }`}
        >
          <p className="text-sm font-bold text-gray-800">
            {QUIZ_QUESTIONS[1].question}
          </p>
          <div className="space-y-2">
            {QUIZ_QUESTIONS[1].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => answers[1] === null && onAnswer(1, i)}
                disabled={answers[1] !== null}
                className={`w-full text-left rounded-xl border px-4 py-2.5 text-sm font-medium
                            transition-colors duration-200 leading-snug
                            ${getOptionStyle(answers, 1, i)}`}
              >
                {opt}
              </button>
            ))}
          </div>
          {answers[1] !== null && (
            <p
              className={`text-xs font-semibold px-3 py-2 rounded-lg ${
                answers[1] === QUIZ_QUESTIONS[1].correctIndex
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {answers[1] === QUIZ_QUESTIONS[1].correctIndex
                ? content.quizFeedbackCorrect
                : content.quizFeedbackWrong}
            </p>
          )}
        </div>
      </div>

      <div className={bothAnswered ? "visible" : "invisible"}>
        <PrimaryButton onClick={onNext}>Claim your badge →</PrimaryButton>
      </div>
    </div>
  );
}

// ─── Step 5 — Badge ───────────────────────────────────────────────────────────
function Step5({
  score,
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
    <div className="w-full max-w-xl">
      <div className="grid grid-cols-2 gap-10 items-center">
        {/* Left — badge + title */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative flex items-center justify-center w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-brand-mid animate-pulse-ring" />
            <div className="w-20 h-20 rounded-full bg-brand-dark flex items-center justify-center z-10 shadow-md">
              <Star className="text-white w-9 h-9" fill="white" />
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Stock Explorer</h2>
            <p className="text-xs text-gray-500 mt-1">
              You completed Lesson 1 — What is a stock?
            </p>
          </div>

          {/* XP bar */}
          <div className="w-full space-y-1.5">
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                XP earned
              </p>
              <p className="text-xs font-bold text-brand-dark">
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
        </div>

        {/* Right — summary */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            What you learned
          </p>
          <div className="space-y-3">
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
                <span className="text-sm text-gray-700 leading-snug">{point}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onRestart}
            className="mt-4 rounded-full bg-transparent border border-gray-200 text-gray-500
                       px-6 py-2.5 text-sm font-medium hover:border-gray-300 hover:text-gray-700
                       transition-colors duration-200 cursor-pointer"
          >
            Restart demo
          </button>
        </div>
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

  // Badge animations
  useEffect(() => {
    if (step !== 5) return;

    const target = score;
    const duration = 900;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setXpDisplay(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    [0, 1, 2].forEach((i) => {
      setTimeout(() => {
        setChecksVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 350 + i * 200);
    });
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
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <TopBar step={step} />

      {/* Content area — vertically + horizontally centered */}
      <main className="flex-1 flex items-center justify-center px-8 py-6 overflow-hidden">
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

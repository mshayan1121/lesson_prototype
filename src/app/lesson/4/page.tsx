"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  TrendingUp,
  Check,
  CheckCircle2,
} from "lucide-react";
import { LessonsDropdown } from "@/components/LessonsDropdown";

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3;

// ─── Stock data ───────────────────────────────────────────────────────────────
const STOCKS = [
  {
    id: "aapl",
    ticker: "AAPL",
    name: "Apple Inc.",
    description: "Makes iPhones, MacBooks, and the App Store.",
    risk: "Low" as const,
    startPrice: 150,
    endPrice: 213,
    history: [150, 158, 145, 162, 170, 155, 180, 195, 188, 200, 210, 213],
  },
  {
    id: "nke",
    ticker: "NKE",
    name: "Nike Inc.",
    description: "Makes sports shoes, clothes, and equipment.",
    risk: "Medium" as const,
    startPrice: 95,
    endPrice: 78,
    history: [95, 98, 102, 99, 88, 85, 80, 76, 82, 79, 75, 78],
  },
  {
    id: "spx",
    ticker: "SPDX",
    name: "SpeedX Corp.",
    description: "A fast-growing fictional tech startup.",
    risk: "High" as const,
    startPrice: 50,
    endPrice: 120,
    history: [50, 45, 38, 55, 70, 65, 80, 95, 88, 105, 115, 120],
  },
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const LESSON_LABEL = "Lesson 4 — The Simulation";

// ─── Lazy chart ───────────────────────────────────────────────────────────────
const SimChart = dynamic(() => import("./_SimChart"), { ssr: false });

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

// ─── Risk badge ───────────────────────────────────────────────────────────────
function RiskBadge({ risk }: { risk: "Low" | "Medium" | "High" }) {
  const styles = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-amber-100 text-amber-700",
    High: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`font-sans text-xs font-semibold px-2.5 py-0.5 rounded-full ${styles[risk]}`}
    >
      {risk} risk
    </span>
  );
}

// ─── Step pill bar (3 steps) ──────────────────────────────────────────────────
const STEP_LABELS = ["Intro", "Simulation", "Badge"] as const;

function StepPillBar({ step }: { step: Step }) {
  return (
    <div className="flex items-start">
      {([1, 2, 3] as Step[]).map((n, i) => {
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
            {i < 2 && (
              <div className="w-8 md:w-16 h-px bg-gray-200 mx-0.5 md:mx-1 mb-4 md:mb-5" />
            )}
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
      <div className="md:hidden px-4 pb-3 flex justify-center">
        <StepPillBar step={step} />
      </div>
    </header>
  );
}

// ─── Step 1 — Intro ───────────────────────────────────────────────────────────
function Step1({
  selectedId,
  setSelectedId,
  quantity,
  setQuantity,
  onStart,
}: {
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  onStart: () => void;
}) {
  const selected = STOCKS.find((s) => s.id === selectedId) ?? null;
  const maxShares = selected ? Math.floor(1000 / selected.startPrice) : 1;
  const totalCost = selected ? quantity * selected.startPrice : 0;

  return (
    <div className="w-full max-w-5xl space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <Label>Lesson 4 — The Simulation</Label>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          You have $1,000. Ready to invest?
        </h1>
        <p className="font-sans text-base text-gray-500 leading-relaxed">
          This is a simulation — no real money involved. Make your pick and see
          what happens over 1 year.
        </p>
      </div>

      {/* Stock cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STOCKS.map((stock) => {
          const isSelected = selectedId === stock.id;
          return (
            <motion.div
              key={stock.id}
              whileHover={{ y: -2 }}
              onClick={() => {
                setSelectedId(stock.id);
                setQuantity(1);
              }}
              className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 shadow-sm space-y-3 ${
                isSelected
                  ? "border-green-500 shadow-green-100 shadow-md"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="space-y-0.5">
                <p className="font-heading text-xl font-bold text-gray-900">
                  {stock.ticker}
                </p>
                <p className="font-sans text-xs text-gray-500 font-medium">
                  {stock.name}
                </p>
              </div>
              <p className="font-sans text-sm text-gray-600 leading-relaxed">
                {stock.description}
              </p>
              <div className="flex items-center justify-between">
                <p className="font-sans text-xs text-gray-500">
                  <span className="font-heading text-base font-bold text-gray-900">
                    ${stock.startPrice.toFixed(2)}
                  </span>{" "}
                  per share
                </p>
                <RiskBadge risk={stock.risk} />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(stock.id);
                  setQuantity(1);
                }}
                className={`font-sans w-full py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-green-500 text-white"
                    : "bg-brand-light text-brand-dark hover:bg-green-200"
                }`}
              >
                {isSelected ? "✓ Selected" : "Pick this stock"}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Quantity picker */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="qty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
          >
            <p className="font-sans text-sm font-semibold text-gray-700">
              You have{" "}
              <span className="font-heading text-brand-dark font-bold">
                $1,000
              </span>{" "}
              to invest. How many shares of{" "}
              <span className="font-heading font-bold">{selected.ticker}</span>{" "}
              do you want to buy?
            </p>

            <div className="flex items-center gap-4">
              <input
                type="number"
                min={1}
                max={maxShares}
                value={quantity}
                onChange={(e) => {
                  const v = Math.max(1, Math.min(maxShares, Number(e.target.value)));
                  setQuantity(v);
                }}
                className="font-heading w-24 text-2xl font-bold text-center border-2 border-gray-200 rounded-xl py-2 focus:outline-none focus:border-brand-mid"
              />
              <div className="flex flex-col gap-1">
                <span className="font-sans text-xs text-gray-400">
                  Max: {maxShares} shares (${(maxShares * selected.startPrice).toFixed(0)})
                </span>
                <span className="font-sans text-xs text-gray-400">
                  Remaining: ${(1000 - totalCost).toFixed(0)} unspent
                </span>
              </div>
            </div>

            <div className="bg-brand-light rounded-xl px-4 py-3">
              <p className="font-sans text-sm font-semibold text-brand-dark">
                You are buying{" "}
                <span className="font-heading font-bold">{quantity}</span> shares
                of{" "}
                <span className="font-heading font-bold">{selected.ticker}</span>{" "}
                for{" "}
                <span className="font-heading font-bold">
                  ${totalCost.toFixed(2)}
                </span>
              </p>
            </div>

            <PrimaryButton onClick={onStart} className="!w-full !text-base">
              Start simulation →
            </PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>

      {!selected && (
        <p className="font-sans text-xs text-gray-400 text-center">
          Pick a stock above to continue
        </p>
      )}
    </div>
  );
}

// ─── Step 2 — Simulation Game ─────────────────────────────────────────────────
function Step2({
  stockId,
  quantity,
  onClaim,
}: {
  stockId: string;
  quantity: number;
  onClaim: () => void;
}) {
  const stock = STOCKS.find((s) => s.id === stockId)!;
  const [monthsRevealed, setMonthsRevealed] = useState(0);
  const [simRunning, setSimRunning] = useState(false);
  const [simDone, setSimDone] = useState(false);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startInvestment = quantity * stock.startPrice;
  const currentPrice =
    monthsRevealed > 0 ? stock.history[monthsRevealed - 1] : stock.startPrice;
  const currentValue = quantity * currentPrice;
  const isProfit = stock.endPrice > stock.startPrice;
  const priceDiff = stock.endPrice - stock.startPrice;
  const pctChange = (priceDiff / stock.startPrice) * 100;
  const dollarGain = quantity * priceDiff;

  // chart data up to monthsRevealed
  const chartPoints = stock.history.slice(0, monthsRevealed);

  function runSimulation() {
    if (simRunning) return;
    setSimRunning(true);
    setMonthsRevealed(0);

    let month = 0;
    function tick() {
      month += 1;
      setMonthsRevealed(month);
      if (month < 12) {
        animRef.current = setTimeout(tick, 250);
      } else {
        setSimRunning(false);
        setSimDone(true);
        // confetti
        if (stock.endPrice > stock.startPrice) {
          confetti({
            particleCount: 100,
            spread: 65,
            colors: ["#3B6D11", "#639922", "#EAF3DE", "#a8d85a"],
            origin: { y: 0.5 },
          });
        }
      }
    }
    animRef.current = setTimeout(tick, 250);
  }

  useEffect(() => {
    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div>
        <Label>Lesson 4 — The Simulation</Label>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900">
          Watch your investment unfold
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        {/* LEFT — game panel */}
        <div className="md:col-span-2 space-y-4">
          {/* Stock info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-heading text-2xl font-bold text-gray-900">
                  {stock.ticker}
                </p>
                <p className="font-sans text-xs text-gray-500">{stock.name}</p>
              </div>
              <RiskBadge risk={stock.risk} />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-sans text-xs text-gray-400 mb-0.5">Starting investment</p>
                <p className="font-heading text-lg font-bold text-gray-900">
                  ${startInvestment.toFixed(0)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-sans text-xs text-gray-400 mb-0.5">Current value</p>
                <p
                  className={`font-heading text-lg font-bold ${
                    currentValue >= startInvestment
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  ${currentValue.toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <p className="font-heading text-sm font-bold text-gray-700">
              Timeline — Jan to Dec
            </p>
            <div className="grid grid-cols-6 gap-1.5">
              {MONTHS.map((m, i) => {
                const isActive = i < monthsRevealed;
                const price = isActive ? stock.history[i] : null;
                const prevPrice = i > 0 && isActive ? stock.history[i - 1] : null;
                const up = price !== null && prevPrice !== null ? price >= prevPrice : null;

                return (
                  <div key={m} className="flex flex-col items-center gap-0.5">
                    <motion.div
                      animate={{
                        backgroundColor: isActive
                          ? up === false
                            ? "#FCA5A5"
                            : "#86EFAC"
                          : "#F3F4F6",
                      }}
                      transition={{ duration: 0.2 }}
                      className="w-full h-8 rounded-lg flex items-center justify-center relative overflow-hidden"
                    >
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`font-heading text-xs font-bold ${
                            up === false ? "text-red-700" : "text-green-700"
                          }`}
                        >
                          ${price?.toFixed(0)}
                        </motion.span>
                      )}
                    </motion.div>
                    <span className="font-sans text-[10px] text-gray-400">{m}</span>
                  </div>
                );
              })}
            </div>

            <PrimaryButton
              onClick={runSimulation}
              disabled={simRunning || simDone}
              className="!w-full"
            >
              {simRunning
                ? "Simulating..."
                : simDone
                ? "Simulation complete"
                : "Fast forward →"}
            </PrimaryButton>
          </div>
        </div>

        {/* RIGHT — live chart */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="font-heading text-sm font-bold text-gray-700 mb-3">
              {stock.ticker} — Live price chart
            </p>
            <div className="h-56 md:h-72">
              <SimChart
                points={chartPoints}
                startPrice={stock.startPrice}
                months={MONTHS}
              />
            </div>
          </div>

          {/* Result card */}
          <AnimatePresence>
            {simDone && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`rounded-2xl border p-5 space-y-3 ${
                  isProfit
                    ? "bg-green-50 border-green-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <h3
                  className={`font-heading text-2xl font-bold ${
                    isProfit ? "text-green-800" : "text-amber-700"
                  }`}
                >
                  {isProfit ? "You made a profit! 🎉" : "You made a loss. Here's what to learn."}
                </h3>

                <p className="font-sans text-sm text-gray-700">
                  Your{" "}
                  <span className="font-heading font-bold">
                    ${startInvestment.toFixed(0)}
                  </span>{" "}
                  {isProfit ? "grew" : "dropped"} to{" "}
                  <span className="font-heading font-bold">
                    ${(quantity * stock.endPrice).toFixed(0)}
                  </span>{" "}
                  — that&rsquo;s{" "}
                  <span
                    className={`font-heading font-bold ${
                      isProfit ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {isProfit ? "+" : ""}${dollarGain.toFixed(0)} ({isProfit ? "+" : ""}{pctChange.toFixed(1)}%)
                  </span>
                </p>

                {!isProfit && (
                  <p className="font-sans text-xs text-amber-700 bg-amber-100 rounded-xl px-3 py-2 leading-relaxed">
                    Even experienced investors lose sometimes. The key is to diversify — spread money across multiple stocks.
                  </p>
                )}

                {/* Comparison table */}
                <div className="pt-2 space-y-1.5">
                  <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-widest">
                    What would have happened with other stocks?
                  </p>
                  <div className="overflow-hidden rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="font-sans text-xs font-semibold text-gray-400 text-left px-3 py-2">Stock</th>
                          <th className="font-sans text-xs font-semibold text-gray-400 text-right px-3 py-2">Start</th>
                          <th className="font-sans text-xs font-semibold text-gray-400 text-right px-3 py-2">End</th>
                          <th className="font-sans text-xs font-semibold text-gray-400 text-right px-3 py-2">Return</th>
                        </tr>
                      </thead>
                      <tbody>
                        {STOCKS.map((s) => {
                          const ret = ((s.endPrice - s.startPrice) / s.startPrice) * 100;
                          const isPicked = s.id === stockId;
                          const retPositive = ret >= 0;
                          return (
                            <tr
                              key={s.id}
                              className={`border-b border-gray-50 last:border-0 ${
                                isPicked ? "bg-brand-light" : "bg-white"
                              }`}
                            >
                              <td className="px-3 py-2.5">
                                <span className="font-heading text-sm font-bold text-gray-800">
                                  {s.ticker}
                                </span>
                                {isPicked && (
                                  <span className="font-sans ml-1.5 text-[10px] bg-brand-dark text-white px-1.5 py-0.5 rounded-full">
                                    your pick
                                  </span>
                                )}
                              </td>
                              <td className="font-heading text-right px-3 py-2.5 text-gray-700 font-semibold text-sm">
                                ${s.startPrice}
                              </td>
                              <td className="font-heading text-right px-3 py-2.5 text-gray-700 font-semibold text-sm">
                                ${s.endPrice}
                              </td>
                              <td
                                className={`font-heading text-right px-3 py-2.5 font-bold text-sm ${
                                  retPositive ? "text-green-600" : "text-red-500"
                                }`}
                              >
                                {retPositive ? "+" : ""}{ret.toFixed(1)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <PrimaryButton onClick={onClaim} className="!w-full !text-base">
                  Claim your badge →
                </PrimaryButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3 — Badge ───────────────────────────────────────────────────────────
const SUMMARY_POINTS = [
  "You know what a stock is",
  "You know how to buy a stock",
  "You understand profit and loss",
  "You ran your first investment simulation",
];

const TOTAL_XP = 150;

function Step3({
  onRestart,
}: {
  onRestart: () => void;
}) {
  const [xpDisplay, setXpDisplay] = useState(0);
  const [checksVisible, setChecksVisible] = useState([false, false, false, false]);

  useEffect(() => {
    // Double confetti burst
    const burst = (delay: number, colors: string[]) =>
      setTimeout(() => {
        confetti({
          particleCount: 140,
          spread: 80,
          colors,
          origin: { y: 0.4 },
          startVelocity: 38,
        });
      }, delay);

    const t1 = burst(0, ["#3B6D11", "#639922", "#EAF3DE", "#a8d85a", "#ffffff"]);
    const t2 = burst(600, ["#fbbf24", "#3B6D11", "#639922", "#EAF3DE", "#a8d85a"]);
    const t3 = burst(1200, ["#3B6D11", "#EAF3DE", "#ffffff", "#a8d85a", "#639922"]);

    // XP counter
    const xpTimer = setTimeout(() => {
      const duration = 1100;
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setXpDisplay(Math.round(TOTAL_XP * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 350);

    // Staggered checklist
    [0, 1, 2, 3].forEach((i) => {
      setTimeout(() => {
        setChecksVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 600 + i * 220);
    });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(xpTimer);
    };
  }, []);

  return (
    <div className="w-full max-w-lg flex flex-col items-center text-center space-y-8">
      {/* Badge */}
      <div className="relative flex items-center justify-center">
        {/* Outer pulse rings */}
        <motion.div
          className="absolute rounded-full border-4 border-brand-mid"
          style={{ width: 200, height: 200 }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full border-2 border-brand-light"
          style={{ width: 220, height: 220 }}
          animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 0.4 }}
        />
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.1 }}
          className="w-40 h-40 rounded-full bg-brand-dark flex items-center justify-center z-10 shadow-xl"
        >
          <TrendingUp className="text-white w-16 h-16" strokeWidth={1.8} />
        </motion.div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="font-heading text-4xl md:text-5xl font-bold text-gray-900"
        >
          Junior Investor
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-sans text-sm text-gray-500"
        >
          You completed the Stock Market Module
        </motion.p>
      </div>

      {/* XP bar */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full space-y-2"
      >
        <div className="flex justify-between items-center">
          <p className="font-sans text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Total XP earned
          </p>
          <p className="font-heading text-sm font-bold text-brand-dark">
            {xpDisplay} / {TOTAL_XP} XP
          </p>
        </div>
        <div className="h-3 rounded-full bg-brand-light overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-dark transition-none"
            style={{ width: `${(xpDisplay / TOTAL_XP) * 100}%` }}
          />
        </div>
        <p className="font-sans text-xs text-gray-500 text-center">
          Module complete! You earned{" "}
          <span className="font-heading font-bold text-brand-dark">
            {xpDisplay} total XP
          </span>
        </p>
      </motion.div>

      {/* Checklist */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full space-y-3 text-left"
      >
        <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-widest">
          What you learned
        </p>
        {SUMMARY_POINTS.map((point, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 transition-all duration-400 ${
              checksVisible[i]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
          >
            <CheckCircle2
              className="text-brand-dark w-5 h-5 shrink-0 mt-0.5"
            />
            <span className="font-sans text-sm text-gray-700 leading-snug">
              {point}
            </span>
          </div>
        ))}
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="w-full flex flex-col gap-3"
      >
        <button
          disabled
          className="font-sans w-full rounded-full bg-gray-100 text-gray-400 px-6 py-3.5 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
        >
          Start next module →
          <span className="font-sans text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
            Coming soon
          </span>
        </button>
        <button
          onClick={onRestart}
          className="font-sans rounded-full bg-transparent border border-gray-200 text-gray-500
                     px-6 py-2.5 text-sm font-medium hover:border-gray-300 hover:text-gray-700
                     transition-colors duration-200 cursor-pointer"
        >
          Restart simulation
        </button>
      </motion.div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Lesson4Page() {
  const [step, setStep] = useState<Step>(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const goTo = useCallback((s: Step) => setStep(s), []);

  function restart() {
    setSelectedId(null);
    setQuantity(1);
    goTo(1);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar step={step} />

      {/* Persistent lesson indicator */}
      <div className="shrink-0 px-4 md:px-8 pt-5">
        <p className="font-sans text-xs font-semibold uppercase tracking-wide text-[#639922]">
          {LESSON_LABEL}
        </p>
      </div>

      <main className="flex-1 flex justify-center px-4 md:px-8 py-7 md:py-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="w-full flex justify-center"
            >
              <Step1
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                quantity={quantity}
                setQuantity={setQuantity}
                onStart={() => goTo(2)}
              />
            </motion.div>
          )}

          {step === 2 && selectedId && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="w-full flex justify-center"
            >
              <Step2
                stockId={selectedId}
                quantity={quantity}
                onClaim={() => goTo(3)}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="w-full flex justify-center"
            >
              <Step3 onRestart={restart} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

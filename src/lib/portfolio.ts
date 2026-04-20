import type { Ticker } from "./marketData";

export interface Trade {
  id: string;
  action: "BUY" | "SELL";
  ticker: Ticker;
  shares: number;
  price: number;
  timestamp: number;
}

export interface Holding {
  shares: number;
  avgPrice: number;
}

export interface PortfolioState {
  cash: number;
  holdings: Partial<Record<Ticker, Holding>>;
  trades: Trade[];
}

export const INITIAL_CASH = 10000;

export const initialPortfolio: PortfolioState = {
  cash: INITIAL_CASH,
  holdings: {},
  trades: [],
};

export type PortfolioAction =
  | { type: "BUY"; ticker: Ticker; shares: number; price: number }
  | { type: "SELL"; ticker: Ticker; shares: number; price: number }
  | { type: "RESET" }
  | { type: "HYDRATE"; state: PortfolioState };

function makeTrade(action: "BUY" | "SELL", ticker: Ticker, shares: number, price: number): Trade {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    ticker,
    shares,
    price,
    timestamp: Date.now(),
  };
}

export function portfolioReducer(state: PortfolioState, action: PortfolioAction): PortfolioState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "RESET":
      return { ...initialPortfolio, trades: [] };

    case "BUY": {
      const { ticker, shares, price } = action;
      const cost = shares * price;
      if (shares <= 0 || cost > state.cash) return state;

      const existing = state.holdings[ticker];
      const newShares = (existing?.shares ?? 0) + shares;
      const newAvg = existing
        ? (existing.avgPrice * existing.shares + price * shares) / newShares
        : price;

      return {
        cash: round2(state.cash - cost),
        holdings: {
          ...state.holdings,
          [ticker]: { shares: newShares, avgPrice: round2(newAvg) },
        },
        trades: [makeTrade("BUY", ticker, shares, price), ...state.trades].slice(0, 100),
      };
    }

    case "SELL": {
      const { ticker, shares, price } = action;
      const existing = state.holdings[ticker];
      if (!existing || shares <= 0 || shares > existing.shares) return state;

      const remaining = existing.shares - shares;
      const proceeds = shares * price;
      const nextHoldings = { ...state.holdings };
      if (remaining === 0) {
        delete nextHoldings[ticker];
      } else {
        nextHoldings[ticker] = { shares: remaining, avgPrice: existing.avgPrice };
      }

      return {
        cash: round2(state.cash + proceeds),
        holdings: nextHoldings,
        trades: [makeTrade("SELL", ticker, shares, price), ...state.trades].slice(0, 100),
      };
    }

    default:
      return state;
  }
}

export function totalHoldingsValue(
  state: PortfolioState,
  prices: Partial<Record<Ticker, number>>
): number {
  let total = 0;
  for (const [ticker, h] of Object.entries(state.holdings)) {
    if (!h) continue;
    const p = prices[ticker as Ticker] ?? h.avgPrice;
    total += h.shares * p;
  }
  return round2(total);
}

export function totalPortfolioValue(
  state: PortfolioState,
  prices: Partial<Record<Ticker, number>>
): number {
  return round2(state.cash + totalHoldingsValue(state, prices));
}

export function totalPnL(
  state: PortfolioState,
  prices: Partial<Record<Ticker, number>>
): number {
  return round2(totalPortfolioValue(state, prices) - INITIAL_CASH);
}

export function computeStats(state: PortfolioState): {
  winRate: number;
  best: number;
  worst: number;
  totalTrades: number;
} {
  const sells = state.trades.filter((t) => t.action === "SELL");
  if (sells.length === 0) return { winRate: 0, best: 0, worst: 0, totalTrades: state.trades.length };

  const pnls: number[] = [];
  const avgBuyAt = new Map<Ticker, { shares: number; avg: number }>();

  for (const t of [...state.trades].reverse()) {
    const entry = avgBuyAt.get(t.ticker) ?? { shares: 0, avg: 0 };
    if (t.action === "BUY") {
      const newShares = entry.shares + t.shares;
      const newAvg = newShares === 0 ? 0 : (entry.avg * entry.shares + t.price * t.shares) / newShares;
      avgBuyAt.set(t.ticker, { shares: newShares, avg: newAvg });
    } else {
      const pnl = (t.price - entry.avg) * t.shares;
      pnls.push(pnl);
      const remaining = entry.shares - t.shares;
      avgBuyAt.set(t.ticker, { shares: remaining, avg: remaining === 0 ? 0 : entry.avg });
    }
  }

  const wins = pnls.filter((p) => p > 0).length;
  return {
    winRate: Math.round((wins / pnls.length) * 100),
    best: round2(Math.max(...pnls)),
    worst: round2(Math.min(...pnls)),
    totalTrades: state.trades.length,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

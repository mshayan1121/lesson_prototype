export type Ticker = "AAPL" | "TSLA" | "GOOGL" | "AMZN" | "NVDA";

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TickerConfig {
  seed: number;
  startPrice: number;
  volatility: number;
  drift: number;
}

export const TICKER_INFO: Record<Ticker, { name: string; config: TickerConfig }> = {
  AAPL:  { name: "Apple Inc.",         config: { seed: 101, startPrice: 185, volatility: 0.018, drift: 0.0008 } },
  TSLA:  { name: "Tesla, Inc.",        config: { seed: 223, startPrice: 240, volatility: 0.035, drift: 0.0004 } },
  GOOGL: { name: "Alphabet Inc.",      config: { seed: 347, startPrice: 140, volatility: 0.020, drift: 0.0006 } },
  AMZN:  { name: "Amazon.com, Inc.",   config: { seed: 461, startPrice: 175, volatility: 0.022, drift: 0.0007 } },
  NVDA:  { name: "NVIDIA Corporation", config: { seed: 577, startPrice: 495, volatility: 0.030, drift: 0.0015 } },
};

export const TICKERS: Ticker[] = ["AAPL", "TSLA", "GOOGL", "AMZN", "NVDA"];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number): number {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function formatDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function generateOHLCV(ticker: Ticker, days = 90): Candle[] {
  const { seed, startPrice, volatility, drift } = TICKER_INFO[ticker].config;
  const rand = mulberry32(seed);
  const candles: Candle[] = [];

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let price = startPrice;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - i);

    const open = price;
    const shockClose = gaussian(rand) * volatility + drift;
    const close = Math.max(1, open * (1 + shockClose));

    const intradayRange = Math.abs(gaussian(rand)) * volatility * open;
    const high = Math.max(open, close) + Math.abs(gaussian(rand)) * intradayRange * 0.5;
    const low = Math.min(open, close) - Math.abs(gaussian(rand)) * intradayRange * 0.5;

    const volume = Math.round(1_000_000 + rand() * 5_000_000);

    candles.push({
      time: formatDate(date),
      open: round2(open),
      high: round2(Math.max(high, open, close)),
      low: round2(Math.max(0.01, Math.min(low, open, close))),
      close: round2(close),
      volume,
    });

    price = close;
  }

  return candles;
}

export function currentPrice(ticker: Ticker, candles?: Candle[]): number {
  const data = candles ?? generateOHLCV(ticker);
  return data[data.length - 1].close;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

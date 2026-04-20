'use client'

import { useState, useEffect, useReducer, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import {
  TrendingUp, TrendingDown, RefreshCw, DollarSign,
  BarChart2, Wallet, AlertCircle, Trophy, X,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type AgeGroup = '7-10' | '11-13' | '14-17'
type Ticker = 'AAPL' | 'TSLA' | 'GOOGL' | 'AMZN' | 'NVDA'
type OrderSide = 'BUY' | 'SELL'
type OrderType = 'MARKET' | 'LIMIT'

interface Holding {
  ticker: Ticker
  shares: number
  avgPrice: number
}

interface Trade {
  action: OrderSide
  ticker: Ticker
  shares: number
  price: number
  timestamp: number
  avgBuyPrice?: number
}

interface PortfolioHistoryEntry {
  timestamp: number
  value: number
}

interface PortfolioState {
  cash: number
  holdings: Holding[]
  trades: Trade[]
  portfolioHistory: PortfolioHistoryEntry[]
}

type PortfolioAction =
  | { type: 'BUY'; ticker: Ticker; shares: number; price: number }
  | { type: 'SELL'; ticker: Ticker; shares: number; price: number; avgBuyPrice: number }
  | { type: 'RESET' }
  | { type: 'LOAD'; state: PortfolioState }

// ─── Stock Config ─────────────────────────────────────────────────────────────

const TICKERS: Ticker[] = ['AAPL', 'TSLA', 'GOOGL', 'AMZN', 'NVDA']

const STOCK_META: Record<Ticker, { name: string; basePrice: number; color: string }> = {
  AAPL:  { name: 'Apple Inc.',    basePrice: 185,  color: '#3b82f6' },
  TSLA:  { name: 'Tesla Inc.',    basePrice: 245,  color: '#f59e0b' },
  GOOGL: { name: 'Alphabet Inc.', basePrice: 175,  color: '#8b5cf6' },
  AMZN:  { name: 'Amazon.com',    basePrice: 195,  color: '#f97316' },
  NVDA:  { name: 'NVIDIA Corp.',  basePrice: 875,  color: '#22c55e' },
}

// ─── Age Config ───────────────────────────────────────────────────────────────

const AGE_CONFIG: Record<AgeGroup, {
  mode: string
  subtitle: string
  labels: Record<string, string>
  showLimit: boolean
  explorerSlider: boolean
}> = {
  '7-10': {
    mode: 'Explorer Mode',
    subtitle: 'Practice investing with pretend money',
    labels: {
      cash: 'Your Money', portfolioValue: 'Total Value',
      pnl: 'Profit/Loss', trades: 'Trades Made',
      perfChart: 'My Money Over Time', allocChart: 'Where My Money Is',
    },
    showLimit: false,
    explorerSlider: true,
  },
  '11-13': {
    mode: 'Trader Mode',
    subtitle: 'Trade stocks risk-free',
    labels: {
      cash: 'Cash Balance', portfolioValue: 'Portfolio Value',
      pnl: 'Total P&L', trades: 'Number of Trades',
      perfChart: 'Portfolio Performance', allocChart: 'Portfolio Allocation',
    },
    showLimit: false,
    explorerSlider: false,
  },
  '14-17': {
    mode: 'Pro Mode',
    subtitle: 'Simulate real market trades',
    labels: {
      cash: 'Cash Balance', portfolioValue: 'Portfolio Value',
      pnl: 'Total P&L', trades: 'Number of Trades',
      perfChart: 'Portfolio Performance', allocChart: 'Portfolio Allocation',
    },
    showLimit: true,
    explorerSlider: false,
  },
}

// ─── Price Data Generation ────────────────────────────────────────────────────

function seededRNG(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

type OHLCData = { time: string; open: number; high: number; low: number; close: number }

const PRICE_CACHE: Partial<Record<Ticker, OHLCData[]>> = {}
const SEEDS: Record<Ticker, number> = { AAPL: 42, TSLA: 1337, GOOGL: 999, AMZN: 7777, NVDA: 12345 }

function generatePriceData(ticker: Ticker): OHLCData[] {
  if (PRICE_CACHE[ticker]) return PRICE_CACHE[ticker]!
  const rng = seededRNG(SEEDS[ticker])
  const data: OHLCData[] = []
  let price = STOCK_META[ticker].basePrice
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 90; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (d.getDay() === 0 || d.getDay() === 6) continue
    const change = price * ((rng() - 0.49) * 0.026)
    const open = +price.toFixed(2)
    const close = +Math.max(1, price + change).toFixed(2)
    const hi = +(Math.max(open, close) * (1 + rng() * 0.008)).toFixed(2)
    const lo = +(Math.min(open, close) * (1 - rng() * 0.008)).toFixed(2)
    data.push({ time: d.toISOString().split('T')[0], open, high: hi, low: lo, close })
    price = close
  }
  PRICE_CACHE[ticker] = data
  return data
}

function getPrice(ticker: Ticker): number {
  const d = generatePriceData(ticker)
  return d[d.length - 1].close
}

function getPriceChange(ticker: Ticker) {
  const d = generatePriceData(ticker)
  const prev = d[d.length - 2]?.close ?? d[d.length - 1].close
  const curr = d[d.length - 1].close
  return {
    change: +(curr - prev).toFixed(2),
    pct: +((curr - prev) / prev * 100).toFixed(2),
  }
}

// ─── Portfolio Reducer ────────────────────────────────────────────────────────

const INITIAL_STATE: PortfolioState = {
  cash: 10000,
  holdings: [],
  trades: [],
  portfolioHistory: [{ timestamp: Date.now(), value: 10000 }],
}

function calcPortfolioValue(state: PortfolioState) {
  return state.cash + state.holdings.reduce((s, h) => s + h.shares * getPrice(h.ticker), 0)
}

function portfolioReducer(state: PortfolioState, action: PortfolioAction): PortfolioState {
  switch (action.type) {
    case 'BUY': {
      const cost = action.shares * action.price
      if (cost > state.cash) return state
      const idx = state.holdings.findIndex(h => h.ticker === action.ticker)
      let holdings: Holding[]
      if (idx >= 0) {
        const h = state.holdings[idx]
        const total = h.shares + action.shares
        const avg = (h.shares * h.avgPrice + action.shares * action.price) / total
        holdings = state.holdings.map((x, i) => i === idx ? { ...x, shares: total, avgPrice: +avg.toFixed(4) } : x)
      } else {
        holdings = [...state.holdings, { ticker: action.ticker, shares: action.shares, avgPrice: action.price }]
      }
      const next = { ...state, cash: +(state.cash - cost).toFixed(2), holdings }
      const trade: Trade = { action: 'BUY', ticker: action.ticker, shares: action.shares, price: action.price, timestamp: Date.now() }
      return { ...next, trades: [trade, ...state.trades].slice(0, 20), portfolioHistory: [...state.portfolioHistory, { timestamp: Date.now(), value: calcPortfolioValue(next) }] }
    }
    case 'SELL': {
      const h = state.holdings.find(x => x.ticker === action.ticker)
      if (!h || h.shares < action.shares) return state
      const proceeds = action.shares * action.price
      const remaining = h.shares - action.shares
      const holdings = remaining > 0
        ? state.holdings.map(x => x.ticker === action.ticker ? { ...x, shares: remaining } : x)
        : state.holdings.filter(x => x.ticker !== action.ticker)
      const next = { ...state, cash: +(state.cash + proceeds).toFixed(2), holdings }
      const trade: Trade = { action: 'SELL', ticker: action.ticker, shares: action.shares, price: action.price, timestamp: Date.now(), avgBuyPrice: action.avgBuyPrice }
      return { ...next, trades: [trade, ...state.trades].slice(0, 20), portfolioHistory: [...state.portfolioHistory, { timestamp: Date.now(), value: calcPortfolioValue(next) }] }
    }
    case 'RESET':
      return { cash: 10000, holdings: [], trades: [], portfolioHistory: [{ timestamp: Date.now(), value: 10000 }] }
    case 'LOAD':
      return action.state
    default:
      return state
  }
}

// ─── Candlestick Chart (client-only, dynamic lightweight-charts import) ───────

function CandlestickChartPanel({ ticker }: { ticker: Ticker }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    let mounted = true
    let chartInstance: { remove: () => void } | null = null

    ;(async () => {
      try {
        const lc = await import('lightweight-charts')
        if (!mounted || !containerRef.current) return

        const chart = lc.createChart(containerRef.current, {
          autoSize: true,
          layout: {
            background: { type: lc.ColorType.Solid, color: '#0f0f0f' },
            textColor: '#6b7280',
          },
          grid: {
            vertLines: { color: '#1a1a1a' },
            horzLines: { color: '#1a1a1a' },
          },
          rightPriceScale: { borderColor: '#262626' },
          timeScale: { borderColor: '#262626', timeVisible: true },
        })

        chartInstance = chart

        if (!mounted) {
          chart.remove()
          return
        }

        const series = chart.addSeries(lc.CandlestickSeries, {
          upColor: '#22c55e',
          downColor: '#ef4444',
          borderUpColor: '#22c55e',
          borderDownColor: '#ef4444',
          wickUpColor: '#22c55e',
          wickDownColor: '#ef4444',
        })

        series.setData(generatePriceData(ticker))
        chart.timeScale().fitContent()
      } catch (e) {
        console.error('Chart init error:', e)
      }
    })()

    return () => {
      mounted = false
      chartInstance?.remove()
      chartInstance = null
    }
  }, [ticker])

  return <div ref={containerRef} className="w-full h-full" />
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon, iconColor, iconBg, valueColor,
}: {
  label: string; value: string; icon: React.ReactNode
  iconColor: string; iconBg: string; valueColor?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', iconBg)}>
          <span className={iconColor}>{icon}</span>
        </div>
        <p className="text-xs text-gray-400 font-medium leading-tight">{label}</p>
      </div>
      <p className={cn('font-heading font-bold text-xl text-gray-900 truncate', valueColor)}>{value}</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SimulatorPage() {
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('11-13')
  const [activeTab, setActiveTab] = useState<'trading' | 'portfolio'>('trading')
  const [selectedTicker, setSelectedTicker] = useState<Ticker>('AAPL')
  const [orderSide, setOrderSide] = useState<OrderSide>('BUY')
  const [orderType, setOrderType] = useState<OrderType>('MARKET')
  const [quantity, setQuantity] = useState(1)
  const [limitPrice, setLimitPrice] = useState('')
  const [orderError, setOrderError] = useState('')
  const [toast, setToast] = useState({ msg: '', visible: false })
  const [resetOpen, setResetOpen] = useState(false)
  const [portfolio, dispatch] = useReducer(portfolioReducer, INITIAL_STATE)

  // Load age group + portfolio from localStorage
  useEffect(() => {
    const age = localStorage.getItem('trading_academy_age_group') as AgeGroup | null
    if (age && ['7-10', '11-13', '14-17'].includes(age)) setAgeGroup(age)
    const saved = localStorage.getItem('trading_academy_portfolio')
    if (saved) {
      try { dispatch({ type: 'LOAD', state: JSON.parse(saved) }) } catch {}
    }
  }, [])

  // Persist portfolio
  useEffect(() => {
    localStorage.setItem('trading_academy_portfolio', JSON.stringify(portfolio))
  }, [portfolio])

  const config = AGE_CONFIG[ageGroup]
  const currentPrice = getPrice(selectedTicker)
  const priceChange = getPriceChange(selectedTicker)
  const holding = portfolio.holdings.find(h => h.ticker === selectedTicker)
  const totalValue = calcPortfolioValue(portfolio)
  const totalPnL = totalValue - 10000
  const execPrice = orderType === 'LIMIT' ? (parseFloat(limitPrice) || currentPrice) : currentPrice
  const estimatedTotal = quantity * execPrice

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000)
  }

  function handleOrder() {
    setOrderError('')
    if (!quantity || quantity <= 0) { setOrderError('Enter a valid quantity'); return }
    if (orderType === 'LIMIT' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      setOrderError('Enter a valid limit price'); return
    }
    if (orderSide === 'BUY') {
      if (estimatedTotal > portfolio.cash) {
        setOrderError(`Insufficient funds. Need $${estimatedTotal.toFixed(2)}, have $${portfolio.cash.toFixed(2)}`)
        return
      }
      dispatch({ type: 'BUY', ticker: selectedTicker, shares: quantity, price: execPrice })
      showToast(`Bought ${quantity} ${selectedTicker} ✓`)
    } else {
      if (!holding || holding.shares < quantity) {
        setOrderError(`Not enough shares. You hold ${holding?.shares ?? 0} ${selectedTicker}`)
        return
      }
      dispatch({ type: 'SELL', ticker: selectedTicker, shares: quantity, price: execPrice, avgBuyPrice: holding.avgPrice })
      showToast(`Sold ${quantity} ${selectedTicker} ✓`)
    }
    setQuantity(1)
    setLimitPrice('')
  }

  // Win rate for 14-17
  const sellTrades = portfolio.trades.filter(t => t.action === 'SELL')
  const winRate = sellTrades.length > 0
    ? Math.round(sellTrades.filter(t => t.avgBuyPrice !== undefined && t.price > t.avgBuyPrice).length / sellTrades.length * 100)
    : 0

  // Pie chart data
  const allocationData = [
    ...portfolio.holdings.map(h => ({
      name: h.ticker,
      value: +(h.shares * getPrice(h.ticker)).toFixed(2),
      color: STOCK_META[h.ticker].color,
    })),
    { name: 'Cash', value: +portfolio.cash.toFixed(2), color: '#e5e7eb' },
  ]

  // Performance history data
  const perfData = portfolio.portfolioHistory.map((e, i) => ({
    x: i === 0 ? 'Start' : `T${i}`,
    value: +e.value.toFixed(2),
  }))

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">
            Paper Trading Simulator
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{config.subtitle}</p>
          <span className="inline-flex mt-2 px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white">
            {config.mode}
          </span>
        </div>
        <button
          onClick={() => setResetOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors duration-150 cursor-pointer shrink-0 mt-1"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:inline">Reset Portfolio</span>
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 w-fit">
        {(['trading', 'portfolio'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer capitalize',
              activeTab === tab
                ? 'bg-[#3B6D11] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            )}
          >
            {tab === 'trading' ? 'Trading' : 'Portfolio'}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">

        {/* ━━━━━━━━━━━━ TRADING TAB ━━━━━━━━━━━━ */}
        {activeTab === 'trading' && (
          <motion.div
            key="trading"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

              {/* Left: Chart panel */}
              <div className="bg-[#0f0f0f] rounded-2xl overflow-hidden flex flex-col">
                {/* Ticker pills */}
                <div className="flex items-center gap-2 p-4 flex-wrap">
                  {TICKERS.map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTicker(t)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer',
                        selectedTicker === t
                          ? 'bg-green-500 text-white'
                          : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a] hover:text-white'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Price header */}
                <div className="px-4 pb-3 flex flex-wrap items-end gap-3">
                  <div>
                    <p className="text-gray-500 text-xs">{STOCK_META[selectedTicker].name}</p>
                    <p className="font-heading text-3xl font-bold text-white leading-tight">
                      ${currentPrice.toFixed(2)}
                    </p>
                  </div>
                  <span className={cn(
                    'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold mb-0.5',
                    priceChange.change >= 0 ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                  )}>
                    {priceChange.change >= 0
                      ? <ArrowUpRight size={12} />
                      : <ArrowDownRight size={12} />}
                    {priceChange.change >= 0 ? '+' : ''}{priceChange.change}
                    {' '}({priceChange.pct >= 0 ? '+' : ''}{priceChange.pct}%)
                  </span>
                </div>

                {/* Chart */}
                <div className="h-64 sm:h-80 md:h-96 flex-1">
                  <CandlestickChartPanel ticker={selectedTicker} />
                </div>
              </div>

              {/* Right: Order panel */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
                <div className="mb-4">
                  <p className="text-xs text-gray-400 font-medium">
                    {selectedTicker} — {STOCK_META[selectedTicker].name}
                  </p>
                  <p className="font-heading text-2xl font-bold text-gray-900">${currentPrice.toFixed(2)}</p>
                </div>

                {/* Buy / Sell toggle */}
                <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4">
                  {(['BUY', 'SELL'] as const).map(side => (
                    <button
                      key={side}
                      onClick={() => { setOrderSide(side); setOrderError('') }}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-150 cursor-pointer',
                        orderSide === side
                          ? side === 'BUY' ? 'bg-green-500 text-white shadow' : 'bg-red-500 text-white shadow'
                          : 'text-gray-500 hover:text-gray-700'
                      )}
                    >
                      {side}
                    </button>
                  ))}
                </div>

                {/* Order type (14-17 only) */}
                {config.showLimit && (
                  <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4">
                    {(['MARKET', 'LIMIT'] as const).map(ot => (
                      <button
                        key={ot}
                        onClick={() => setOrderType(ot)}
                        className={cn(
                          'flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer',
                          orderType === ot ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        )}
                      >
                        {ot}
                      </button>
                    ))}
                  </div>
                )}

                {/* Limit price input */}
                {config.showLimit && orderType === 'LIMIT' && (
                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-500 block mb-1">Limit Price ($)</label>
                    <input
                      type="number"
                      value={limitPrice}
                      onChange={e => setLimitPrice(e.target.value)}
                      placeholder={currentPrice.toFixed(2)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                    />
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">
                    {config.explorerSlider ? 'Number of Shares (max 10)' : 'Quantity (shares)'}
                  </label>
                  {config.explorerSlider ? (
                    <div className="space-y-2">
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={quantity}
                        onChange={e => setQuantity(parseInt(e.target.value))}
                        className="w-full accent-green-500"
                      />
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">1</span>
                        <span className="font-bold text-gray-700">{quantity} share{quantity !== 1 ? 's' : ''}</span>
                        <span className="text-gray-400">10</span>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                    />
                  )}
                </div>

                {/* Est. total */}
                <div className="flex justify-between items-center py-3 border-t border-gray-100 mb-3">
                  <span className="text-sm text-gray-500">Estimated Total</span>
                  <span className="font-bold text-gray-900">${estimatedTotal.toFixed(2)}</span>
                </div>

                {/* Info rows */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Cash available</span>
                    <span className="font-medium text-gray-600">${portfolio.cash.toFixed(2)}</span>
                  </div>
                  {holding && (
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Shares held</span>
                      <span className="font-medium text-gray-600">{holding.shares}</span>
                    </div>
                  )}
                </div>

                {/* Error */}
                <AnimatePresence>
                  {orderError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-4"
                    >
                      <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-600 font-medium leading-snug">{orderError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  onClick={handleOrder}
                  className={cn(
                    'mt-auto w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-150 cursor-pointer',
                    orderSide === 'BUY'
                      ? 'bg-green-500 hover:bg-green-600 active:bg-green-700'
                      : 'bg-red-500 hover:bg-red-600 active:bg-red-700'
                  )}
                >
                  {orderSide === 'BUY' ? 'Buy' : 'Sell'} {selectedTicker}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ━━━━━━━━━━━━ PORTFOLIO TAB ━━━━━━━━━━━━ */}
        {activeTab === 'portfolio' && (
          <motion.div
            key="portfolio"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Stats row */}
            <div className={cn(
              'grid gap-4',
              ageGroup === '14-17'
                ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-5'
                : 'grid-cols-2 sm:grid-cols-4'
            )}>
              <StatCard
                label={config.labels.cash}
                value={`$${portfolio.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<Wallet size={14} />}
                iconColor="text-blue-600"
                iconBg="bg-blue-50"
              />
              <StatCard
                label={config.labels.portfolioValue}
                value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<DollarSign size={14} />}
                iconColor="text-[#3B6D11]"
                iconBg="bg-[#EAF3DE]"
              />
              <StatCard
                label={config.labels.pnl}
                value={`${totalPnL >= 0 ? '+' : '-'}$${Math.abs(totalPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={totalPnL >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                iconColor={totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}
                iconBg={totalPnL >= 0 ? 'bg-green-50' : 'bg-red-50'}
                valueColor={totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}
              />
              <StatCard
                label={config.labels.trades}
                value={portfolio.trades.length.toString()}
                icon={<BarChart2 size={14} />}
                iconColor="text-purple-600"
                iconBg="bg-purple-50"
              />
              {ageGroup === '14-17' && (
                <StatCard
                  label="Win Rate"
                  value={`${winRate}%`}
                  icon={<Trophy size={14} />}
                  iconColor="text-amber-600"
                  iconBg="bg-amber-50"
                />
              )}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Performance line chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-heading font-semibold text-gray-900 mb-4 text-sm">
                  {config.labels.perfChart}
                </h3>
                {perfData.length <= 1 ? (
                  <div className="h-48 flex items-center justify-center">
                    <p className="text-sm text-gray-400 text-center px-4">
                      Make your first trade to see your performance
                    </p>
                  </div>
                ) : (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={perfData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="x" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#9ca3af' }}
                          domain={['auto', 'auto']}
                          tickFormatter={v => `$${(v as number).toLocaleString()}`}
                          width={65}
                        />
                        <Tooltip
                          formatter={(v: unknown) => [`$${(v as number).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Value']}
                          contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#22c55e"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 4, fill: '#22c55e' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Allocation pie chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-heading font-semibold text-gray-900 mb-4 text-sm">
                  {config.labels.allocChart}
                </h3>
                {portfolio.holdings.length === 0 ? (
                  <div className="h-48 flex items-center justify-center">
                    <p className="text-sm text-gray-400">No holdings yet</p>
                  </div>
                ) : (
                  <div>
                    <div className="h-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={allocationData}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {allocationData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(v: unknown) => [`$${(v as number).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, '']}
                            contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                      {allocationData.map(d => {
                        const pct = ((d.value / totalValue) * 100).toFixed(1)
                        return (
                          <div key={d.name} className="flex items-center gap-1.5 text-xs">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                            <span className="text-gray-500">{d.name}</span>
                            <span className="font-semibold text-gray-800">{pct}%</span>
                            <span className="text-gray-400">${d.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Holdings table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-heading font-semibold text-gray-900 mb-4 text-sm">Holdings</h3>
              {portfolio.holdings.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">
                  No holdings yet — go to the Trading tab to buy your first stock
                </p>
              ) : (
                <div className="overflow-x-auto -mx-5">
                  <table className="w-full min-w-[480px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {[
                          'Stock', 'Shares', 'Avg Buy', 'Current Price', 'P&L',
                          ...(ageGroup === '14-17' ? ['P&L %'] : []),
                        ].map(h => (
                          <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold text-gray-400 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.holdings.map(h => {
                        const curr = getPrice(h.ticker)
                        const pnl = (curr - h.avgPrice) * h.shares
                        const pnlPct = ((curr - h.avgPrice) / h.avgPrice) * 100
                        return (
                          <tr key={h.ticker} className="border-b border-gray-50 hover:bg-gray-50 transition-colors duration-100">
                            <td className="px-5 py-3">
                              <span
                                className="px-2 py-0.5 rounded-md text-xs font-bold"
                                style={{
                                  background: STOCK_META[h.ticker].color + '22',
                                  color: STOCK_META[h.ticker].color,
                                }}
                              >
                                {h.ticker}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-sm font-medium text-gray-700">{h.shares}</td>
                            <td className="px-5 py-3 text-sm text-gray-600">${h.avgPrice.toFixed(2)}</td>
                            <td className="px-5 py-3 text-sm font-medium text-gray-900">${curr.toFixed(2)}</td>
                            <td className={cn('px-5 py-3 text-sm font-semibold', pnl >= 0 ? 'text-green-600' : 'text-red-600')}>
                              {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
                            </td>
                            {ageGroup === '14-17' && (
                              <td className={cn('px-5 py-3 text-sm font-semibold', pnlPct >= 0 ? 'text-green-600' : 'text-red-600')}>
                                {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                              </td>
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Trade history */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-heading font-semibold text-gray-900 mb-4 text-sm">Trade History</h3>
              {portfolio.trades.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">No trades yet</p>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {portfolio.trades.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0"
                    >
                      <span className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-bold shrink-0',
                        t.action === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      )}>
                        {t.action}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded text-xs font-bold shrink-0"
                        style={{
                          background: STOCK_META[t.ticker].color + '22',
                          color: STOCK_META[t.ticker].color,
                        }}
                      >
                        {t.ticker}
                      </span>
                      <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">
                        {t.shares} share{t.shares !== 1 ? 's' : ''} @ ${t.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                        {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Success Toast ── */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-4 sm:right-6 flex items-center gap-2.5 px-4 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl text-sm font-semibold z-50"
          >
            <TrendingUp size={15} className="text-green-400 shrink-0" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reset Confirmation Dialog ── */}
      <AnimatePresence>
        {resetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
              onClick={() => setResetOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl p-6 shadow-2xl z-50"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <RefreshCw size={18} className="text-red-500" />
                </div>
                <button
                  onClick={() => setResetOpen(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors p-1"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <h3 className="font-heading font-bold text-gray-900 text-lg mb-2">Reset Portfolio?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                This will reset your portfolio back to <strong>$10,000</strong> cash and clear all holdings, trades, and history. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setResetOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    dispatch({ type: 'RESET' })
                    localStorage.removeItem('trading_academy_portfolio')
                    setResetOpen(false)
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors duration-150 cursor-pointer"
                >
                  Reset Portfolio
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

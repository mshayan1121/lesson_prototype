'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, TrendingUp, Users, UserMinus, RotateCcw,
  CircleDollarSign, TrendingDown, Star, XCircle,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts'
import {
  BILLING_STATS, REVENUE_TREND, SUBSCRIPTION_PLANS,
  TRANSACTIONS, REFUNDS,
} from '@/lib/admin-data'

/* ── Animation variants ────────────────────────────────────────── */
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } } }

/* ── Metric card config ────────────────────────────────────────── */
const METRIC_CARDS = [
  {
    label: 'Total Revenue',
    value: `$${BILLING_STATS.totalRevenue.toLocaleString()}`,
    icon: DollarSign,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-700',
    alert: false,
  },
  {
    label: 'MRR',
    value: `$${BILLING_STATS.mrr.toLocaleString()}`,
    icon: TrendingUp,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-700',
    alert: false,
  },
  {
    label: 'Active Subscriptions',
    value: BILLING_STATS.activeSubscriptions.toLocaleString(),
    icon: Users,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    alert: false,
  },
  {
    label: 'Cancelled This Month',
    value: BILLING_STATS.cancelledThisMonth.toLocaleString(),
    icon: UserMinus,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-700',
    alert: true,
  },
  {
    label: 'Refunds Issued',
    value: BILLING_STATS.refundsIssued.toLocaleString(),
    icon: RotateCcw,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    alert: false,
  },
  {
    label: 'Avg Revenue / User',
    value: `$${BILLING_STATS.avgRevenuePerUser}`,
    icon: CircleDollarSign,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-700',
    alert: false,
  },
  {
    label: 'Churn Rate',
    value: `${BILLING_STATS.churnRate.toFixed(1)}%`,
    icon: TrendingDown,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-700',
    alert: true,
  },
  {
    label: 'LTV',
    value: `$${BILLING_STATS.ltv}`,
    icon: Star,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
    alert: false,
  },
  {
    label: 'Failed Payments',
    value: BILLING_STATS.failedPayments.toLocaleString(),
    icon: XCircle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-700',
    alert: true,
  },
]

/* ── Revenue tooltip ───────────────────────────────────────────── */
function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs space-y-1">
      <p className="font-semibold text-gray-900">{label}</p>
      <p className="text-gray-600">Revenue: <span className="font-medium text-gray-900">${payload[0].value.toLocaleString()}</span></p>
    </div>
  )
}

/* ── Pie centre label ──────────────────────────────────────────── */
function PieCentreLabel({ viewBox }: { viewBox?: { cx: number; cy: number } }) {
  if (!viewBox) return null
  const { cx, cy } = viewBox
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-8" fontSize={22} fontWeight={700} fill="#111827">284</tspan>
      <tspan x={cx} dy={22} fontSize={11} fill="#6b7280">active</tspan>
    </text>
  )
}

/* ── Plan badge ────────────────────────────────────────────────── */
function PlanBadge({ plan }: { plan: string }) {
  if (plan === 'Premium') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#EAF3DE] text-[#3B6D11]">Premium</span>
  if (plan === 'Basic') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Basic</span>
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-400">Free</span>
}

/* ── Status pill ───────────────────────────────────────────────── */
function StatusPill({ status }: { status: string }) {
  if (status === 'paid') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Paid</span>
  if (status === 'refunded') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Refunded</span>
  if (status === 'failed') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Failed</span>
  if (status === 'approved') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>
  if (status === 'pending') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Pending</span>
  if (status === 'rejected') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Rejected</span>
  return null
}

/* ── Avatar ────────────────────────────────────────────────────── */
function Avatar({ initials }: { initials: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-[#EAF3DE] flex items-center justify-center text-[#3B6D11] font-heading font-bold text-xs shrink-0 select-none">
      {initials}
    </div>
  )
}

/* ── Main component ────────────────────────────────────────────── */
export default function AdminBilling() {
  const [mounted, setMounted] = useState(false)
  const [txFilter, setTxFilter] = useState<'all' | 'paid' | 'refunded' | 'failed'>('all')
  const [refundStatuses, setRefundStatuses] = useState<Record<string, string>>(
    () => Object.fromEntries(REFUNDS.map((r) => [r.id, r.status]))
  )

  useEffect(() => setMounted(true), [])

  const filteredTx = txFilter === 'all'
    ? TRANSACTIONS
    : TRANSACTIONS.filter((t) => t.status === txFilter)

  const pendingRefunds = Object.values(refundStatuses).filter((s) => s === 'pending').length

  function handleRefundAction(id: string, action: 'approved' | 'rejected') {
    setRefundStatuses((prev) => ({ ...prev, [id]: action }))
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* Page heading */}
      <motion.div variants={item}>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Billing & Revenue</h1>
        <p className="text-sm text-gray-500 mt-0.5">Financial overview, subscriptions, and transaction history</p>
      </motion.div>

      {/* ── Section 1: Metric cards ──────────────────────────────── */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-3"
      >
        {METRIC_CARDS.map(({ label, value, icon: Icon, iconBg, iconColor, alert }) => (
          <div
            key={label}
            className={`rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3 lg:col-span-1 ${alert ? 'bg-red-50' : 'bg-white'}`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
              <Icon size={17} className={iconColor} />
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-gray-900 leading-tight">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Section 2: Charts ───────────────────────────────────── */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Revenue trend */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="font-heading text-base font-semibold text-gray-900">Monthly Revenue</p>
          <p className="text-xs text-gray-400 mt-0.5 mb-5">Last 12 months</p>
          {mounted && (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={REVENUE_TREND} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#639922" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#639922" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<RevenueTooltip />} cursor={{ stroke: '#639922', strokeWidth: 1, strokeDasharray: '4 2' }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#639922"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: '#639922' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Subscription breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="font-heading text-base font-semibold text-gray-900">Subscription Plans</p>
          <p className="text-xs text-gray-400 mt-0.5 mb-4">Active subscribers by plan</p>
          {mounted && (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={SUBSCRIPTION_PLANS}
                  dataKey="students"
                  nameKey="plan"
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={84}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {SUBSCRIPTION_PLANS.map((entry) => (
                    <Cell key={entry.plan} fill={entry.color} />
                  ))}
                  <PieCentreLabel />
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0', fontSize: 12 }}
                  formatter={(val, name) => [Number(val).toLocaleString() + ' students', name]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          {/* Legend */}
          <div className="mt-3 space-y-2">
            {SUBSCRIPTION_PLANS.map((p) => (
              <div key={p.plan} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
                  <span className="text-gray-700 font-medium">{p.plan}</span>
                  <span className="text-gray-400">{p.students.toLocaleString()} students</span>
                </div>
                <span className="font-heading font-semibold text-gray-900">
                  {p.revenue === 0 ? '—' : `$${p.revenue.toLocaleString()}/mo`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Section 3: Recent Transactions ─────────────────────── */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-heading text-lg font-bold text-gray-900">Recent Transactions</h2>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', 'paid', 'refunded', 'failed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTxFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer capitalize min-h-[32px] ${
                  txFilter === f
                    ? 'bg-[#3B6D11] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Transaction ID</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Student</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Plan</th>
                  <th className="text-right text-xs font-medium text-gray-400 px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors duration-100">
                    <td className="px-5 py-3 text-xs font-mono text-gray-500">{tx.id}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={tx.avatar} />
                        <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{tx.student}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><PlanBadge plan={tx.plan} /></td>
                    <td className="px-5 py-3 text-right font-heading font-bold text-gray-900">${tx.amount}</td>
                    <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">{tx.date}</td>
                    <td className="px-5 py-3"><StatusPill status={tx.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTx.length === 0 && (
              <div className="py-10 text-center text-sm text-gray-400">No transactions match this filter.</div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Section 4: Refund Requests ──────────────────────────── */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2.5 mb-3">
          <h2 className="font-heading text-lg font-bold text-gray-900">Refund Requests</h2>
          {pendingRefunds > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              {pendingRefunds} pending
            </span>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Refund ID</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Student</th>
                  <th className="text-right text-xs font-medium text-gray-400 px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Reason</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {REFUNDS.map((ref) => {
                  const status = refundStatuses[ref.id]
                  return (
                    <tr key={ref.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors duration-100">
                      <td className="px-5 py-3 text-xs font-mono text-gray-500">{ref.id}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar initials={ref.avatar} />
                          <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{ref.student}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-heading font-bold text-gray-900">${ref.amount}</td>
                      <td className="px-5 py-3 text-sm text-gray-500 max-w-[180px]">{ref.reason}</td>
                      <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">{ref.date}</td>
                      <td className="px-5 py-3"><StatusPill status={status} /></td>
                      <td className="px-5 py-3">
                        {status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRefundAction(ref.id, 'approved')}
                              className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors duration-150 cursor-pointer min-h-[32px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRefundAction(ref.id, 'rejected')}
                              className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors duration-150 cursor-pointer min-h-[32px]"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* ── Section 5: Investor Metrics ─────────────────────────── */}
      <motion.div variants={item}>
        <h2 className="font-heading text-lg font-bold text-gray-900 mb-1">Investor Metrics</h2>
        <p className="text-sm text-gray-500 mb-4">Key financial indicators for stakeholders</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* MRR Growth */}
          <div className="rounded-2xl border-2 border-[#EAF3DE] bg-[#f6faf0] p-6">
            <p className="text-xs font-medium text-gray-500 mb-2">MRR Growth</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-heading text-4xl font-bold text-[#3B6D11]">+24%</span>
            </div>
            <p className="text-sm font-medium text-[#639922]">vs last month</p>
            <p className="text-xs text-gray-400 mt-2">Monthly recurring revenue grew from $10,340 to $12,800</p>
          </div>

          {/* Churn Rate */}
          <div className="rounded-2xl border-2 border-amber-100 bg-amber-50 p-6">
            <p className="text-xs font-medium text-gray-500 mb-2">Churn Rate</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-heading text-4xl font-bold text-amber-600">4.2%</span>
            </div>
            <p className="text-sm font-medium text-amber-600">monthly churn</p>
            <p className="text-xs text-gray-400 mt-2">Industry avg is 5–7% — you&apos;re doing well</p>
          </div>

          {/* LTV:CAC */}
          <div className="rounded-2xl border-2 border-[#EAF3DE] bg-[#f6faf0] p-6">
            <p className="text-xs font-medium text-gray-500 mb-2">LTV:CAC Ratio</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-heading text-4xl font-bold text-[#3B6D11]">3.2x</span>
            </div>
            <p className="text-sm font-medium text-[#639922]">healthy ratio</p>
            <p className="text-xs text-gray-400 mt-2">Above 3x is considered healthy for SaaS growth</p>
          </div>

        </div>
      </motion.div>

    </motion.div>
  )
}

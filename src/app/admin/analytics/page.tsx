'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer,
} from 'recharts'
import { COMPLETION_FUNNEL, AGE_BREAKDOWN, MODULE_POPULARITY, SIGNUP_TREND } from '@/lib/admin-data'

const XP_TREND = SIGNUP_TREND.map((d) => ({ date: d.date, xp: d.students * 83 }))

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } } }

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="font-heading text-base font-semibold text-gray-900">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5 mb-5">{subtitle}</p>
      {children}
    </div>
  )
}

const FUNNEL_WITH_DROPOFF = COMPLETION_FUNNEL.map((d, i, arr) => ({
  ...d,
  dropoff: i === 0 ? 0 : Math.round(((arr[i - 1].completed - d.completed) / arr[i - 1].completed) * 100),
}))

function FunnelTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof FUNNEL_WITH_DROPOFF[number] }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs space-y-1">
      <p className="font-semibold text-gray-900">{d.step}</p>
      <p className="text-gray-600">Completed: <span className="font-medium text-gray-900">{d.completed.toLocaleString()}</span></p>
      {d.dropoff > 0 && <p className="text-red-500">Drop-off: {d.dropoff}%</p>}
    </div>
  )
}

function PieLegend({ data }: { data: typeof AGE_BREAKDOWN }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  return (
    <div className="flex justify-center gap-4 mt-3">
      {data.map((d) => (
        <div key={d.group} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
          <span className="text-xs text-gray-600">
            {d.group} <span className="font-medium text-gray-900">({Math.round((d.count / total) * 100)}%)</span>
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AdminAnalytics() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">

      <motion.div variants={item}>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Deep-dive into platform engagement and learning outcomes</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Chart 1 — Completion Funnel */}
        <motion.div variants={item}>
          <ChartCard title="Lesson Completion Funnel" subtitle="How many students complete each step">
            {mounted && <ResponsiveContainer width="100%" height={260}>
              <BarChart data={FUNNEL_WITH_DROPOFF} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="step"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<FunnelTooltip />} cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="completed" radius={[6, 6, 0, 0]}>
                  {FUNNEL_WITH_DROPOFF.map((entry, index) => (
                    <Cell
                      key={entry.step}
                      fill={`hsl(${95 - index * 8}, ${60 - index * 4}%, ${35 + index * 3}%)`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>}
          </ChartCard>
        </motion.div>

        {/* Chart 2 — Age Group Breakdown */}
        <motion.div variants={item}>
          <ChartCard title="Age Group Breakdown" subtitle="Distribution of students by age group">
            {mounted && <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={AGE_BREAKDOWN}
                  dataKey="count"
                  nameKey="group"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {AGE_BREAKDOWN.map((entry) => (
                    <Cell key={entry.group} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0', fontSize: 12 }}
                  formatter={(val) => [Number(val).toLocaleString(), 'Students']}
                />
              </PieChart>
            </ResponsiveContainer>}
            <PieLegend data={AGE_BREAKDOWN} />
          </ChartCard>
        </motion.div>

        {/* Chart 3 — Module Popularity (bigger) */}
        <motion.div variants={item}>
          <ChartCard title="Module Popularity" subtitle="Total lesson completions per module">
            {mounted && <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={MODULE_POPULARITY}
                layout="vertical"
                margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="module"
                  type="category"
                  width={110}
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0', fontSize: 12 }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Bar dataKey="completions" fill="#639922" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>}
          </ChartCard>
        </motion.div>

        {/* Chart 4 — XP per day */}
        <motion.div variants={item}>
          <ChartCard title="XP Earned Per Day" subtitle="Total XP awarded across all students — last 21 days">
            {mounted && <ResponsiveContainer width="100%" height={280}>
              <LineChart data={XP_TREND} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0', fontSize: 12 }}
                  cursor={{ stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '4 2' }}
                  formatter={(val) => [Number(val).toLocaleString(), 'XP']}
                />
                <Line
                  type="monotone"
                  dataKey="xp"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>}
          </ChartCard>
        </motion.div>

      </div>
    </motion.div>
  )
}

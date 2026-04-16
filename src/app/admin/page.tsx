'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Activity, BookCheck, Zap, Medal, Percent,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  PLATFORM_STATS, SIGNUP_TREND, MODULE_POPULARITY, RECENT_ACTIVITY,
} from '@/lib/admin-data'

const METRIC_CARDS = [
  { label: 'Total Students',    value: PLATFORM_STATS.totalStudents,     icon: Users,      iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { label: 'Active This Week',  value: PLATFORM_STATS.activeThisWeek,    icon: Activity,   iconBg: 'bg-[#EAF3DE]',  iconColor: 'text-[#3B6D11]' },
  { label: 'Lessons Completed', value: PLATFORM_STATS.lessonsCompleted,  icon: BookCheck,  iconBg: 'bg-blue-100',   iconColor: 'text-blue-600' },
  { label: 'Total XP',          value: PLATFORM_STATS.totalXP,           icon: Zap,        iconBg: 'bg-amber-100',  iconColor: 'text-amber-600' },
  { label: 'Badges Awarded',    value: PLATFORM_STATS.badgesAwarded,     icon: Medal,      iconBg: 'bg-[#EAF3DE]',  iconColor: 'text-[#639922]' },
  { label: 'Avg Completion',    value: `${PLATFORM_STATS.avgCompletionRate}%`, icon: Percent, iconBg: 'bg-teal-100', iconColor: 'text-teal-600' },
]

const ACTIVITY_COLORS: Record<string, string> = {
  completion: 'bg-[#639922]',
  badge:      'bg-purple-500',
  start:      'bg-blue-500',
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

export default function AdminOverview() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* Page heading */}
      <motion.div variants={item}>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform performance at a glance</p>
      </motion.div>

      {/* Metric cards */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {METRIC_CARDS.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg} shrink-0`}>
              <Icon size={18} className={iconColor} />
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-gray-900 leading-tight">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Signups trend */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="font-heading text-base font-semibold text-gray-900">New Students</p>
          <p className="text-xs text-gray-400 mb-4 mt-0.5">Daily signups — last 21 days</p>
          {mounted && <ResponsiveContainer width="100%" height={220}>
            <LineChart data={SIGNUP_TREND} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
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
                cursor={{ stroke: '#639922', strokeWidth: 1, strokeDasharray: '4 2' }}
              />
              <Line
                type="monotone"
                dataKey="students"
                stroke="#639922"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: '#639922' }}
              />
            </LineChart>
          </ResponsiveContainer>}
        </div>

        {/* Module popularity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="font-heading text-base font-semibold text-gray-900">Module Popularity</p>
          <p className="text-xs text-gray-400 mb-4 mt-0.5">Completions by module</p>
          {mounted && <ResponsiveContainer width="100%" height={220}>
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
                width={100}
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
        </div>
      </motion.div>

      {/* Recent activity */}
      <motion.div variants={item}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="font-heading text-base font-semibold text-gray-900 mb-4">Recent Activity</p>
          <div className="divide-y divide-gray-50">
            {RECENT_ACTIVITY.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${ACTIVITY_COLORS[activity.type] ?? 'bg-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-gray-900">{activity.student}</span>
                  <span className="text-sm text-gray-500"> — {activity.action}</span>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

    </motion.div>
  )
}

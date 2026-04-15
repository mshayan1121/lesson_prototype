'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Zap,
  BookCheck,
  Medal,
  Flame,
  CheckCircle,
  Lock,
  Trophy,
  Wallet,
  TrendingUp,
  FileText,
  Coins,
  PieChart,
  Globe,
  BarChart2,
  CreditCard,
  Building,
  Rocket,
  Hand,
  type LucideIcon,
} from 'lucide-react'
import { STUDENT, MODULES, ACTIVITY } from '@/lib/dashboard-data'

const MODULE_ICONS: Record<string, LucideIcon> = {
  Wallet, TrendingUp, FileText, Coins, PieChart, Globe, BarChart2, CreditCard, Building, Rocket,
}

const MODULE_COLORS = [
  'bg-green-100 text-green-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
]

const ACTIVITY_STYLES: Record<string, { bg: string; iconColor: string }> = {
  lesson: { bg: 'bg-[#EAF3DE]', iconColor: 'text-[#3B6D11]' },
  xp: { bg: 'bg-amber-100', iconColor: 'text-amber-600' },
  badge: { bg: 'bg-purple-100', iconColor: 'text-purple-600' },
}

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  CheckCircle, Zap, Trophy,
}

const STATS = [
  { label: 'Total XP', value: STUDENT.xp, Icon: Zap },
  { label: 'Lessons Done', value: 4, Icon: BookCheck },
  { label: 'Badges Earned', value: 4, Icon: Medal },
  { label: 'Day Streak', value: STUDENT.streak, Icon: Flame },
]

export default function DashboardHome() {
  const prefersReducedMotion = useReducedMotion()

  const container = {
    hidden: {},
    show: {
      transition: prefersReducedMotion ? {} : { staggerChildren: 0.08 },
    },
  }
  const item = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome header */}
      <motion.div variants={item}>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {STUDENT.name.split(' ')[0]}! <Hand size={24} className="inline-block align-middle ml-1 text-gray-700" />
        </h1>
        <p className="text-gray-500 mt-1">
          You&apos;re on a <span className="font-semibold text-amber-600">{STUDENT.streak} day streak</span>. Keep it up!
        </p>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {STATS.map(({ label, value, Icon }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EAF3DE] flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-[#3B6D11]" />
            </div>
            <div>
              <p className="font-heading text-3xl font-bold text-[#3B6D11] leading-none">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Continue learning card */}
      <motion.div variants={item} className="bg-brand-light/40 rounded-2xl border border-brand-mid/20 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#639922] mb-1">Continue where you left off</p>
          <h2 className="font-heading text-lg font-bold text-gray-900 flex items-center gap-2">Stock Market Module — Completed <CheckCircle size={18} className="text-[#3B6D11]" /></h2>
          <p className="text-sm text-gray-500 mt-0.5">Ready to tackle the next module?</p>
        </div>
        <Link
          href="/dashboard/modules"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3B6D11] text-white rounded-full font-medium text-sm hover:bg-[#2d5409] active:scale-[0.98] transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0"
        >
          Start next module →
        </Link>
      </motion.div>

      {/* Module progress grid */}
      <motion.div variants={item}>
        <h2 className="font-heading text-lg font-bold text-gray-900 mb-3">Your modules</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {MODULES.map((mod, i) => {
            const Icon = MODULE_ICONS[mod.icon] ?? Wallet
            const colorClass = MODULE_COLORS[i % MODULE_COLORS.length]
            const isCompleted = mod.completed === mod.lessons && !mod.locked
            const isLocked = mod.locked

            return (
              <div
                key={mod.id}
                className={`relative rounded-xl p-3 border transition-all duration-200 ${
                  isCompleted
                    ? 'bg-[#EAF3DE] border-[#c5e3a4]'
                    : isLocked
                    ? 'bg-gray-50 border-gray-100 cursor-not-allowed'
                    : 'bg-white border-gray-100 hover:shadow-md cursor-pointer'
                }`}
                title={isLocked ? 'Complete previous modules to unlock' : undefined}
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${isLocked ? 'bg-gray-100 text-gray-400' : colorClass}`}>
                  <Icon size={15} />
                </div>

                {/* Title */}
                <p className={`text-xs font-semibold leading-tight mb-2 ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
                  {mod.title}
                </p>

                {/* Mini progress bar */}
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#639922] rounded-full"
                    style={{ width: `${(mod.completed / mod.lessons) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{mod.completed}/{mod.lessons} lessons</p>

                {/* Overlays */}
                {isCompleted && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle size={14} className="text-[#3B6D11]" />
                  </div>
                )}
                {isLocked && (
                  <div className="absolute top-2 right-2">
                    <Lock size={12} className="text-gray-300" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Recent activity */}
      <motion.div variants={item}>
        <h2 className="font-heading text-lg font-bold text-gray-900 mb-3">Recent activity</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {ACTIVITY.map((act) => {
            const style = ACTIVITY_STYLES[act.type] ?? ACTIVITY_STYLES.lesson
            const Icon = ACTIVITY_ICONS[act.icon] ?? CheckCircle
            return (
              <div key={act.id} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                  <Icon size={15} className={style.iconColor} />
                </div>
                <p className="text-sm text-gray-700 flex-1">{act.message}</p>
                <span className="text-xs text-gray-400 whitespace-nowrap">{act.time}</span>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

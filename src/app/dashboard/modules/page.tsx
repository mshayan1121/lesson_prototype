'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Zap,
  CheckCircle,
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
  type LucideIcon,
} from 'lucide-react'
import { MODULES } from '@/lib/dashboard-data'

const MODULE_ICONS: Record<string, LucideIcon> = {
  Wallet, TrendingUp, FileText, Coins, PieChart, Globe, BarChart2, CreditCard, Building, Rocket,
}

const MODULE_BG_COLORS = [
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

// Lesson links for the unlocked module
const MODULE_LESSON_HREF: Record<number, string> = {
  2: '/lesson',
}

export default function ModulesPage() {
  const prefersReducedMotion = useReducedMotion()

  const container = {
    hidden: {},
    show: { transition: prefersReducedMotion ? {} : { staggerChildren: 0.08 } },
  }
  const item = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">All Modules</h1>
        <p className="text-gray-500 mt-1">Complete modules in order to unlock the next one</p>
      </div>

      {/* Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {MODULES.map((mod, i) => {
          const Icon = MODULE_ICONS[mod.icon] ?? Wallet
          const colorClass = MODULE_BG_COLORS[i % MODULE_BG_COLORS.length]
          const isCompleted = mod.completed === mod.lessons && !mod.locked
          const isLocked = mod.locked
          const pct = (mod.completed / mod.lessons) * 100
          const lessonHref = MODULE_LESSON_HREF[mod.id] ?? '/lesson'

          return (
            <motion.div
              key={mod.id}
              variants={item}
              className={`relative rounded-2xl border p-6 overflow-hidden flex flex-col gap-4 transition-all duration-200 ${
                isLocked
                  ? 'bg-gray-50 border-gray-100 opacity-70'
                  : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Completed ribbon */}
              {isCompleted && (
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#3B6D11] text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  <CheckCircle size={11} />
                  Done
                </div>
              )}

              {/* Module number badge (top-right if not completed) */}
              {!isCompleted && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                  {mod.id}
                </div>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${isLocked ? 'bg-gray-100 text-gray-300' : colorClass}`}>
                <Icon size={24} />
              </div>

              {/* Title + description */}
              <div className="flex-1">
                <h2 className={`font-heading text-xl font-bold leading-tight ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                  {mod.title}
                </h2>
                <p className={`text-sm mt-1 ${isLocked ? 'text-gray-300' : 'text-gray-500'}`}>
                  {mod.description}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{mod.completed}/{mod.lessons} lessons</span>
                  <span>{Math.round(pct)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#639922] rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Footer: XP + button */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-full">
                  <Zap size={12} />
                  {mod.xpReward} XP
                </div>

                {isLocked ? (
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-100 text-gray-400 rounded-full text-sm font-medium cursor-not-allowed"
                  >
                    Locked 🔒
                  </button>
                ) : (
                  <Link
                    href={lessonHref}
                    className="px-4 py-2 bg-[#3B6D11] text-white rounded-full text-sm font-medium hover:bg-[#2d5409] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                  >
                    {isCompleted ? 'Review →' : 'Start →'}
                  </Link>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

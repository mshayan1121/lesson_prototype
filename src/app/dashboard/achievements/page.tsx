'use client'

import { motion, useReducedMotion } from 'framer-motion'
import {
  Star,
  ShoppingCart,
  BarChart3,
  TrendingUp,
  Wallet,
  Coins,
  FileText,
  Trophy,
  Lock,
  type LucideIcon,
} from 'lucide-react'
import { BADGES } from '@/lib/dashboard-data'

const BADGE_ICONS: Record<string, LucideIcon> = {
  Star, ShoppingCart, BarChart3, TrendingUp, Wallet, Coins, FileText, Trophy,
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function AchievementsPage() {
  const prefersReducedMotion = useReducedMotion()

  const earned = BADGES.filter((b) => b.earned)
  const locked = BADGES.filter((b) => !b.earned)
  const pct = (earned.length / BADGES.length) * 100

  const container = {
    hidden: {},
    show: { transition: prefersReducedMotion ? {} : { staggerChildren: 0.08 } },
  }
  const item = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">Achievements</h1>
        <p className="text-gray-500 mt-1">Collect badges by completing modules and lessons</p>
      </div>

      {/* Summary bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-heading font-bold text-gray-900">
            <span className="text-[#3B6D11]">{earned.length}</span> of {BADGES.length} badges earned
          </p>
          <span className="text-sm font-semibold text-[#639922]">{Math.round(pct)}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#639922] rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Earned section */}
      <div className="mb-8">
        <h2 className="font-heading text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#639922] inline-block" />
          Earned
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {earned.map((badge) => {
            const Icon = BADGE_ICONS[badge.icon] ?? Star
            return (
              <motion.div
                key={badge.id}
                variants={item}
                className="bg-white border-2 border-[#639922] rounded-2xl p-5 text-center shadow-sm hover:-translate-y-0.5 transition-transform duration-200 cursor-default"
              >
                <div className="w-16 h-16 rounded-full bg-[#EAF3DE] flex items-center justify-center mx-auto mb-3">
                  <Icon size={28} className="text-[#3B6D11]" />
                </div>
                <p className="font-heading font-bold text-gray-900 text-sm leading-tight">{badge.name}</p>
                <p className="text-xs text-gray-400 mt-1.5 leading-snug">{badge.description}</p>
                {badge.earnedDate && (
                  <p className="text-xs font-semibold text-[#639922] mt-2">
                    Earned {formatDate(badge.earnedDate)}
                  </p>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Locked section */}
      <div>
        <h2 className="font-heading text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
          Locked
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {locked.map((badge, i) => {
            const Icon = BADGE_ICONS[badge.icon] ?? Star
            return (
              <motion.div
                key={badge.id}
                variants={{ ...item, hidden: { ...item.hidden, transition: { delay: i * 0.06 } } }}
                className="relative bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center opacity-70 cursor-default"
              >
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Icon size={28} className="text-gray-300" />
                </div>
                <p className="font-heading font-bold text-gray-400 text-sm leading-tight">{badge.name}</p>
                <p className="text-xs text-gray-300 mt-1.5 leading-snug">{badge.description}</p>

                {/* Lock overlay */}
                <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <Lock size={11} className="text-gray-400" />
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}

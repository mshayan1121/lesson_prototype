'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Crown, Medal, Zap } from 'lucide-react'
import { LEADERBOARD } from '@/lib/dashboard-data'
import { cn } from '@/lib/utils'

const PODIUM_STYLES = {
  1: { ring: 'ring-2 ring-[#F5C842]', bg: 'bg-[#F5C842]/10', text: 'text-[#b8890a]', height: 'h-24 md:h-32' },
  2: { ring: 'ring-2 ring-gray-300', bg: 'bg-gray-100', text: 'text-gray-500', height: 'h-16 md:h-24' },
  3: { ring: 'ring-2 ring-amber-700', bg: 'bg-amber-700/10', text: 'text-amber-700', height: 'h-12 md:h-20' },
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'week' | 'all'>('week')
  const prefersReducedMotion = useReducedMotion()

  const top3 = LEADERBOARD.slice(0, 3)
  const rest = LEADERBOARD.slice(3)

  const currentUser = LEADERBOARD.find((u) => u.isCurrentUser)!
  const above = LEADERBOARD[currentUser.rank - 2]
  const xpGap = above ? above.xp - currentUser.xp : 0

  const container = {
    hidden: {},
    show: { transition: prefersReducedMotion ? {} : { staggerChildren: 0.06 } },
  }
  const item = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  // Display order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-500 mt-1">See how you stack up against other students</p>
        </div>

        {/* Toggle pills */}
        <div className="flex items-center bg-gray-100 rounded-full p-1 gap-1">
          {(['week', 'all'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer',
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {t === 'week' ? 'This Week' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {/* Podium */}
        <motion.div variants={item} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-end justify-center gap-3 md:gap-6">
            {podiumOrder.map((player, idx) => {
              const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3
              const style = PODIUM_STYLES[rank as 1 | 2 | 3]
              return (
                <div key={player.rank} className="flex flex-col items-center gap-2">
                  {rank === 1 && (
                    <Crown size={20} className="text-[#F5C842] mb-1" />
                  )}
                  <div
                    className={cn(
                      'w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-heading font-bold text-sm md:text-base select-none',
                      player.isCurrentUser ? 'bg-[#639922] text-white' : 'bg-gray-100 text-gray-700',
                      style.ring
                    )}
                  >
                    {player.avatar}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-800 leading-tight">{player.name}</p>
                    <p className="text-xs text-gray-400">{player.xp} XP</p>
                  </div>
                  {/* Podium base */}
                  <div className={cn('w-16 md:w-20 rounded-t-lg flex items-center justify-center', style.height, style.bg)}>
                    <span className={cn('font-heading text-xl font-bold', style.text)}>#{rank}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Ranks 4–10 list */}
        <motion.div variants={item} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {rest.map((player) => (
            <div
              key={player.rank}
              className={cn(
                'flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors duration-150',
                player.isCurrentUser ? 'bg-[#EAF3DE]' : 'hover:bg-gray-50'
              )}
            >
              {/* Rank */}
              <span className={cn(
                'w-7 text-center text-sm font-bold font-heading flex-shrink-0',
                player.isCurrentUser ? 'text-[#3B6D11]' : 'text-gray-400'
              )}>
                #{player.rank}
              </span>

              {/* Avatar */}
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-sm flex-shrink-0 select-none',
                  player.isCurrentUser ? 'bg-[#639922] text-white ring-2 ring-[#3B6D11]' : 'bg-gray-100 text-gray-600'
                )}
              >
                {player.avatar}
              </div>

              {/* Name */}
              <p className={cn(
                'flex-1 text-sm',
                player.isCurrentUser ? 'font-bold text-[#3B6D11]' : 'font-medium text-gray-700'
              )}>
                {player.name}
                {player.isCurrentUser && <span className="ml-2 text-xs font-normal text-[#639922]">You</span>}
              </p>

              {/* XP */}
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                <Zap size={10} />
                {player.xp}
              </div>

              {/* Badges */}
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Medal size={12} />
                {player.badges}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Your rank summary */}
        <motion.div variants={item} className="bg-[#3B6D11] text-white rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#EAF3DE]/70 mb-1">Your rank</p>
              <p className="font-heading text-2xl font-bold">#{currentUser.rank} <span className="text-base font-normal text-[#EAF3DE]/80">of {LEADERBOARD.length} students</span></p>
              {xpGap > 0 && (
                <p className="text-sm text-[#EAF3DE]/80 mt-1">
                  <span className="font-semibold text-[#EAF3DE]">{xpGap} XP</span> to reach #{currentUser.rank - 1}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-2 rounded-xl text-sm">
                <Zap size={14} className="text-amber-300" />
                <span className="font-bold">{currentUser.xp} XP</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-2 rounded-xl text-sm">
                <Medal size={14} className="text-[#EAF3DE]" />
                <span className="font-bold">{currentUser.badges} badges</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

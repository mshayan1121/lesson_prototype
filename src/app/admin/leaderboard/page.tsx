'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Download, Zap } from 'lucide-react'
import { USERS } from '@/lib/admin-data'
import { cn } from '@/lib/utils'

const AGE_FILTERS = ['All', '7-10', '11-13', '14-17']

const RANK_STYLES: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-l-4 border-l-amber-400' },
  2: { bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-l-4 border-l-gray-400' },
  3: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-l-4 border-l-orange-400' },
}

const AGE_COLORS: Record<string, { bg: string; text: string; avatar: string }> = {
  '7-10':  { bg: 'bg-blue-100',   text: 'text-blue-700',   avatar: 'bg-blue-500' },
  '11-13': { bg: 'bg-purple-100', text: 'text-purple-700', avatar: 'bg-purple-500' },
  '14-17': { bg: 'bg-[#EAF3DE]',  text: 'text-[#3B6D11]',  avatar: 'bg-[#639922]' },
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } } }

export default function AdminLeaderboard() {
  const [filter, setFilter] = useState('All')

  const ranked = useMemo(() => {
    const list = filter === 'All'
      ? [...USERS]
      : USERS.filter((u) => u.ageGroup === filter)
    return list.sort((a, b) => b.xp - a.xp)
  }, [filter])

  const topXP = ranked[0]?.xp ?? 1

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">

      {/* Heading */}
      <motion.div variants={item}>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Students ranked by XP earned</p>
      </motion.div>

      {/* Filter bar */}
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {AGE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-150 cursor-pointer',
                filter === f
                  ? 'bg-[#639922] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
          <Download size={13} />
          Export CSV
        </button>
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100">
                {['Rank', 'Student', 'Age Group', 'XP', 'Badges', 'Modules', 'Last Active'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranked.map((user, idx) => {
                const rank = idx + 1
                const rankStyle = RANK_STYLES[rank]
                const colors = AGE_COLORS[user.ageGroup]
                const xpPct = (user.xp / topXP) * 100

                return (
                  <tr
                    key={user.id}
                    className={cn(
                      'border-b border-gray-50 last:border-0 transition-colors duration-100',
                      rankStyle?.border ?? '',
                    )}
                  >
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold',
                        rankStyle ? `${rankStyle.bg} ${rankStyle.text}` : 'bg-gray-50 text-gray-500',
                      )}>
                        {rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${colors.avatar} flex items-center justify-center text-white text-xs font-heading font-bold shrink-0 select-none`}>
                          {user.avatar}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                        {user.ageGroup}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Zap size={12} className="text-amber-500 shrink-0" />
                        <span className="text-sm font-medium text-gray-900 w-12 shrink-0">{user.xp.toLocaleString()}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#639922] rounded-full"
                            style={{ width: `${xpPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.badges}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.modulesCompleted}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.lastActive}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

    </motion.div>
  )
}

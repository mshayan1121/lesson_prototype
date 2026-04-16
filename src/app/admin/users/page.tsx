'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Zap, X } from 'lucide-react'
import { USERS } from '@/lib/admin-data'
import { cn } from '@/lib/utils'

type User = typeof USERS[number]

const AGE_COLORS: Record<string, { bg: string; text: string; avatar: string }> = {
  '7-10':  { bg: 'bg-blue-100',   text: 'text-blue-700',   avatar: 'bg-blue-500' },
  '11-13': { bg: 'bg-purple-100', text: 'text-purple-700', avatar: 'bg-purple-500' },
  '14-17': { bg: 'bg-[#EAF3DE]',  text: 'text-[#3B6D11]',  avatar: 'bg-[#639922]' },
}

const FILTERS = ['All', '7-10', '11-13', '14-17', 'Active', 'Inactive']

const MODULES_LIST = [
  'Money Basics', 'Stock Market', 'Bonds', 'Crypto', 'ETFs & Funds',
  'Forex', 'Options & Futures', 'Personal Finance', 'Economics', 'Big Simulation',
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } } }

export default function AdminUsers() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<User | null>(null)

  const filtered = useMemo(() => {
    return USERS.filter((u) => {
      const matchSearch = u.name.toLowerCase().includes(query.toLowerCase())
      if (!matchSearch) return false
      if (filter === 'All') return true
      if (filter === 'Active') return u.status === 'active'
      if (filter === 'Inactive') return u.status === 'inactive'
      return u.ageGroup === filter
    })
  }, [query, filter])

  const maxXP = Math.max(...USERS.map((u) => u.xp))

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">

      {/* Heading */}
      <motion.div variants={item}>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">{USERS.length.toLocaleString()} students enrolled</p>
      </motion.div>

      {/* Search + filter */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-9 pl-8 pr-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#639922] placeholder:text-gray-400"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
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
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100">
                {['Student', 'Age Group', 'Modules', 'XP', 'Badges', 'Last Active', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const colors = AGE_COLORS[user.ageGroup]
                return (
                  <tr
                    key={user.id}
                    onClick={() => setSelected(user)}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors duration-100 cursor-pointer"
                  >
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
                    <td className="px-4 py-3 text-sm text-gray-600">{user.modulesCompleted}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Zap size={12} className="text-amber-500 shrink-0" />
                        {user.xp.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.badges}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.lastActive}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        user.status === 'active'
                          ? 'bg-[#EAF3DE] text-[#3B6D11]'
                          : 'bg-gray-100 text-gray-500',
                      )}>
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Slide-in detail panel */}
      <AnimatePresence>
        {selected && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 bg-black/20 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed right-0 top-0 h-full w-full sm:w-80 bg-white shadow-2xl border-l border-gray-100 z-50 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {/* Panel header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
                <p className="font-heading text-base font-bold text-gray-900">Student Details</p>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors cursor-pointer text-gray-500"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Avatar + info */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${AGE_COLORS[selected.ageGroup].avatar} flex items-center justify-center text-white font-heading font-bold text-base select-none shrink-0`}>
                    {selected.avatar}
                  </div>
                  <div>
                    <p className="font-heading text-base font-bold text-gray-900">{selected.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${AGE_COLORS[selected.ageGroup].bg} ${AGE_COLORS[selected.ageGroup].text}`}>
                        Ages {selected.ageGroup}
                      </span>
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        selected.status === 'active' ? 'bg-[#EAF3DE] text-[#3B6D11]' : 'bg-gray-100 text-gray-500',
                      )}>
                        {selected.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'XP', value: selected.xp.toLocaleString() },
                    { label: 'Badges', value: selected.badges },
                    { label: 'Modules', value: selected.modulesCompleted },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="font-heading text-lg font-bold text-gray-900">{value}</p>
                      <p className="text-xs text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>

                {/* XP progress */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span className="font-medium">XP Progress</span>
                    <span>{selected.xp.toLocaleString()} / {maxXP.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#639922] rounded-full transition-all duration-700"
                      style={{ width: `${(selected.xp / maxXP) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Last active */}
                <div className="text-xs text-gray-500">
                  Last active: <span className="font-medium text-gray-700">{selected.lastActive}</span>
                </div>

                {/* Module progress */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Module Progress</p>
                  <div className="space-y-1.5">
                    {MODULES_LIST.map((mod, i) => {
                      const done = i < selected.modulesCompleted
                      return (
                        <div key={mod} className="flex items-center gap-2">
                          <div className={cn(
                            'w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold',
                            done ? 'bg-[#639922] text-white' : 'bg-gray-100 text-gray-400',
                          )}>
                            {done ? '✓' : i + 1}
                          </div>
                          <span className={cn('text-sm', done ? 'text-gray-900 font-medium' : 'text-gray-400')}>
                            {mod}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Badges */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Badges Earned</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: selected.badges }).map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-sm"
                        title={`Badge ${i + 1}`}
                      >
                        🏅
                      </div>
                    ))}
                    {selected.badges === 0 && (
                      <p className="text-xs text-gray-400">No badges yet</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  )
}

'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { STUDENT } from '@/lib/dashboard-data'
import { cn } from '@/lib/utils'

const AGE_GROUPS = ['7-10', '11-13', '14-17'] as const

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 focus-visible:ring-2 focus-visible:ring-[#3B6D11] focus-visible:outline-none',
        checked ? 'bg-[#3B6D11]' : 'bg-gray-200'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-6' : 'translate-x-0'
        )}
      />
    </button>
  )
}

export default function SettingsPage() {
  const prefersReducedMotion = useReducedMotion()

  const [name, setName] = useState(STUDENT.name)
  const [ageGroup, setAgeGroup] = useState(STUDENT.ageGroup)
  const [saved, setSaved] = useState(false)

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [streakReminders, setStreakReminders] = useState(true)
  const [leaderboardVisibility, setLeaderboardVisibility] = useState(true)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const container = {
    hidden: {},
    show: { transition: prefersReducedMotion ? {} : { staggerChildren: 0.1 } },
  }
  const item = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  }

  return (
    <div className="max-w-lg">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your profile and preferences</p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        {/* Profile card */}
        <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="font-heading text-lg font-bold text-gray-900">Profile</h2>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-[#639922] flex items-center justify-center text-white font-heading text-2xl font-bold select-none">
              {STUDENT.avatar}
            </div>
            <button className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors duration-150 cursor-pointer px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300">
              Change avatar
            </button>
          </div>

          {/* Name field */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#639922] focus:border-transparent transition-all duration-150"
            />
          </div>

          {/* Age group pills */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Age group</label>
            <div className="flex gap-2 flex-wrap">
              {AGE_GROUPS.map((group) => (
                <button
                  key={group}
                  onClick={() => setAgeGroup(group)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer min-h-[44px]',
                    ageGroup === group
                      ? 'bg-[#3B6D11] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className={cn(
              'w-full py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer',
              saved
                ? 'bg-[#EAF3DE] text-[#3B6D11]'
                : 'bg-[#3B6D11] text-white hover:bg-[#2d5409] active:scale-[0.98]'
            )}
          >
            {saved ? '✓ Changes saved' : 'Save changes'}
          </button>
        </motion.div>

        {/* Preferences card */}
        <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="font-heading text-lg font-bold text-gray-900">Preferences</h2>

          <div className="space-y-4">
            {[
              {
                label: 'Email notifications',
                description: 'Get updates about your progress and new content',
                value: emailNotifications,
                onChange: setEmailNotifications,
              },
              {
                label: 'Streak reminders',
                description: 'Daily reminders to keep your streak alive',
                value: streakReminders,
                onChange: setStreakReminders,
              },
              {
                label: 'Leaderboard visibility',
                description: 'Allow other students to see you on the leaderboard',
                value: leaderboardVisibility,
                onChange: setLeaderboardVisibility,
              },
            ].map(({ label, description, value, onChange }) => (
              <div key={label} className="flex items-center justify-between gap-4 py-1">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                </div>
                <Toggle checked={value} onChange={onChange} />
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

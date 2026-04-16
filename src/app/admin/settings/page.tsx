'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Pencil } from 'lucide-react'
import { ALL_MODULES } from '@/lib/admin-data'
import { cn } from '@/lib/utils'

const AGE_GROUPS = [
  { label: 'Ages 7–10',  description: 'Young learners — simplified language, visual-first' },
  { label: 'Ages 11–13', description: 'Middle school — conceptual depth with analogies' },
  { label: 'Ages 14–17', description: 'Teens — technical accuracy, real-world context' },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } } }

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={cn(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#639922]',
        enabled ? 'bg-[#639922]' : 'bg-gray-200',
      )}
    >
      <span
        className={cn(
          'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200',
          enabled ? 'translate-x-4.5' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

export default function AdminSettings() {
  const [platform, setPlatform] = useState({ name: 'Trading Academy', tagline: 'Finance for the next generation' })
  const [platformSaved, setPlatformSaved] = useState(false)
  const [moduleEnabled, setModuleEnabled] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(ALL_MODULES.map((m) => [m.id, m.id === 2]))
  )

  function savePlatform() {
    setPlatformSaved(true)
    setTimeout(() => setPlatformSaved(false), 2000)
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 max-w-2xl">

      <motion.div variants={item}>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure the Trading Academy platform</p>
      </motion.div>

      {/* Platform card */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <div>
          <p className="font-heading text-base font-semibold text-gray-900">Platform</p>
          <p className="text-xs text-gray-400 mt-0.5">Basic branding settings</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5" htmlFor="platform-name">
              Platform Name
            </label>
            <input
              id="platform-name"
              type="text"
              value={platform.name}
              onChange={(e) => setPlatform((p) => ({ ...p, name: e.target.value }))}
              className="w-full h-9 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#639922]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5" htmlFor="platform-tagline">
              Tagline
            </label>
            <input
              id="platform-tagline"
              type="text"
              value={platform.tagline}
              onChange={(e) => setPlatform((p) => ({ ...p, tagline: e.target.value }))}
              className="w-full h-9 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#639922]"
            />
          </div>
        </div>
        <button
          onClick={savePlatform}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-colors duration-150 cursor-pointer',
            platformSaved
              ? 'bg-[#EAF3DE] text-[#3B6D11]'
              : 'bg-[#639922] text-white hover:bg-[#3B6D11]',
          )}
        >
          {platformSaved && <Check size={14} />}
          {platformSaved ? 'Saved ✓' : 'Save'}
        </button>
      </motion.div>

      {/* Module settings */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <div>
          <p className="font-heading text-base font-semibold text-gray-900">Modules</p>
          <p className="text-xs text-gray-400 mt-0.5">Enable or disable modules for students</p>
        </div>
        <div className="divide-y divide-gray-50">
          {ALL_MODULES.map((mod) => (
            <div key={mod.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-heading font-bold text-gray-500 shrink-0">
                  {mod.id}
                </div>
                <span className={cn('text-sm font-medium', moduleEnabled[mod.id] ? 'text-gray-900' : 'text-gray-400')}>
                  {mod.title}
                </span>
              </div>
              <Toggle
                enabled={!!moduleEnabled[mod.id]}
                onToggle={() => setModuleEnabled((prev) => ({ ...prev, [mod.id]: !prev[mod.id] }))}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Age group card */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <div>
          <p className="font-heading text-base font-semibold text-gray-900">Age Groups</p>
          <p className="text-xs text-gray-400 mt-0.5">Configure content tiers for each age range</p>
        </div>
        <div className="divide-y divide-gray-50">
          {AGE_GROUPS.map(({ label, description }) => (
            <div key={label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{description}</p>
              </div>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-150 cursor-pointer"
                aria-label={`Edit ${label}`}
              >
                <Pencil size={12} />
                Edit
              </button>
            </div>
          ))}
        </div>
      </motion.div>

    </motion.div>
  )
}

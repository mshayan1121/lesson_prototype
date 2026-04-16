'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Check } from 'lucide-react'
import { CONTENT } from '@/lib/admin-data'
import { cn } from '@/lib/utils'

type AgeKey = 'content_7_10' | 'content_11_13' | 'content_14_17'
const AGE_TABS: { label: string; key: AgeKey }[] = [
  { label: 'Ages 7-10',  key: 'content_7_10' },
  { label: 'Ages 11-13', key: 'content_11_13' },
  { label: 'Ages 14-17', key: 'content_14_17' },
]

const PLACEHOLDER_MODULES = [
  'Money Basics', 'Bonds', 'Crypto', 'ETFs & Funds', 'Forex',
  'Options & Futures', 'Personal Finance', 'Economics', 'Big Simulation',
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } } }

export default function AdminContent() {
  const [expandedModule, setExpandedModule] = useState<number | null>(2)
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<AgeKey>('content_7_10')
  const [drafts, setDrafts] = useState<Record<string, Record<AgeKey, string>>>(() => {
    const init: Record<string, Record<AgeKey, string>> = {}
    for (const mod of CONTENT) {
      for (const lesson of mod.lessons) {
        init[`${mod.moduleId}-${lesson.id}`] = {
          content_7_10:  lesson.content_7_10,
          content_11_13: lesson.content_11_13,
          content_14_17: lesson.content_14_17,
        }
      }
    }
    return init
  })
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set())

  function handleSave(moduleId: number, lessonId: number) {
    const key = `${moduleId}-${lessonId}`
    setSavedKeys((prev) => new Set(prev).add(key))
    setTimeout(() => {
      setSavedKeys((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }, 2000)
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">

      <motion.div variants={item}>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Content Manager</h1>
        <p className="text-sm text-gray-500 mt-0.5">Edit lesson content for each age group without touching code</p>
      </motion.div>

      {/* Real modules (Stock Market) */}
      {CONTENT.map((mod) => (
        <motion.div key={mod.moduleId} variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Module header */}
          <button
            onClick={() => setExpandedModule(expandedModule === mod.moduleId ? null : mod.moduleId)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EAF3DE] flex items-center justify-center">
                <span className="text-xs font-heading font-bold text-[#3B6D11]">{mod.moduleId}</span>
              </div>
              <div className="text-left">
                <p className="font-heading text-sm font-semibold text-gray-900">{mod.moduleTitle}</p>
                <p className="text-xs text-gray-400">{mod.lessons.length} lessons</p>
              </div>
            </div>
            {expandedModule === mod.moduleId
              ? <ChevronDown size={16} className="text-gray-400 shrink-0" />
              : <ChevronRight size={16} className="text-gray-400 shrink-0" />
            }
          </button>

          {/* Lessons */}
          <AnimatePresence initial={false}>
            {expandedModule === mod.moduleId && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="border-t border-gray-100">
                  {mod.lessons.map((lesson) => {
                    const key = `${mod.moduleId}-${lesson.id}`
                    const isOpen = expandedLesson === lesson.id
                    const saved = savedKeys.has(key)

                    return (
                      <div key={lesson.id} className="border-b border-gray-50 last:border-0">
                        {/* Lesson row */}
                        <button
                          onClick={() => setExpandedLesson(isOpen ? null : lesson.id)}
                          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 font-medium w-5 text-right shrink-0">{lesson.id}</span>
                            <span className="text-sm font-medium text-gray-700 text-left">{lesson.title}</span>
                          </div>
                          {isOpen
                            ? <ChevronDown size={14} className="text-gray-400 shrink-0" />
                            : <ChevronRight size={14} className="text-gray-400 shrink-0" />
                          }
                        </button>

                        {/* Inline editor */}
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 space-y-3">
                                {/* Age tabs */}
                                <div className="flex gap-1.5">
                                  {AGE_TABS.map(({ label, key: tabKey }) => (
                                    <button
                                      key={tabKey}
                                      onClick={() => setActiveTab(tabKey)}
                                      className={cn(
                                        'px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-150 cursor-pointer',
                                        activeTab === tabKey
                                          ? 'bg-[#639922] text-white'
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                                      )}
                                    >
                                      {label}
                                    </button>
                                  ))}
                                </div>

                                {/* Textarea */}
                                <textarea
                                  value={drafts[key]?.[activeTab] ?? ''}
                                  onChange={(e) =>
                                    setDrafts((prev) => ({
                                      ...prev,
                                      [key]: { ...prev[key], [activeTab]: e.target.value },
                                    }))
                                  }
                                  className="min-h-32 w-full rounded-xl border border-gray-200 p-3 font-sans text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#639922] placeholder:text-gray-400"
                                />

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleSave(mod.moduleId, lesson.id)}
                                    className={cn(
                                      'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-colors duration-150 cursor-pointer',
                                      saved
                                        ? 'bg-[#EAF3DE] text-[#3B6D11]'
                                        : 'bg-[#639922] text-white hover:bg-[#3B6D11]',
                                    )}
                                  >
                                    {saved && <Check size={14} />}
                                    {saved ? 'Saved ✓' : 'Save changes'}
                                  </button>
                                  <button
                                    onClick={() => setExpandedLesson(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      {/* Placeholder modules */}
      {PLACEHOLDER_MODULES.map((title, i) => (
        <motion.div key={title} variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 opacity-60 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                <span className="text-xs font-heading font-bold text-gray-500">{i === 0 ? 1 : i + 2}</span>
              </div>
              <div>
                <p className="font-heading text-sm font-semibold text-gray-700">{title}</p>
                <p className="text-xs text-gray-400">Content coming soon</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300 shrink-0" />
          </div>
        </motion.div>
      ))}

    </motion.div>
  )
}

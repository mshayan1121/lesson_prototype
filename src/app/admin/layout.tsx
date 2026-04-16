'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, BookOpen, Trophy, BarChart2, Settings,
  ChevronLeft, ChevronRight, CandlestickChart, LogOut, User, CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Overview',    icon: LayoutDashboard, href: '/admin' },
  { label: 'Users',       icon: Users,           href: '/admin/users' },
  { label: 'Content',     icon: BookOpen,        href: '/admin/content' },
  { label: 'Leaderboard', icon: Trophy,          href: '/admin/leaderboard' },
  { label: 'Analytics',   icon: BarChart2,       href: '/admin/analytics' },
  { label: 'Billing',     icon: CreditCard,      href: '/admin/billing' },
  { label: 'Settings',    icon: Settings,        href: '/admin/settings' },
]

const STORAGE_KEY = 'admin-sidebar-collapsed'
const W_EXPANDED = 224
const W_COLLAPSED = 56

function isActive(href: string, pathname: string) {
  if (href === '/admin') return pathname === '/admin'
  return pathname.startsWith(href)
}

/* Floating dropdown that pops above its anchor — same mechanic as student dashboard */
function DropdownMenu({
  open,
  onClose,
  anchorRef,
  children,
}: {
  open: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLDivElement | null>
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open, onClose, anchorRef])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.97 }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) setCollapsed(saved === 'true')
    setMounted(true)
  }, [])

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(STORAGE_KEY, String(next))
  }

  const sw = mounted ? (collapsed ? W_COLLAPSED : W_EXPANDED) : W_EXPANDED

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

      {/* ── Top Navbar ──────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 h-14 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#3B6D11] flex items-center justify-center shrink-0">
            <CandlestickChart size={14} className="text-white" />
          </div>
          <span className="font-heading text-base font-bold text-[#3B6D11]">Trading Academy</span>
          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500 hidden sm:block">Shaun (Admin)</span>
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-sm font-heading font-bold select-none">
            SA
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-14 min-h-0">

        {/* ── Sidebar — desktop only ───────────────────────────── */}
        <motion.aside
          animate={{ width: sw }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="hidden md:flex flex-col fixed left-0 top-14 bottom-0 bg-white border-r border-gray-100 z-30 overflow-visible"
        >
          {/* Nav links */}
          <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
            {NAV.map(({ label, icon: Icon, href }) => {
              const active = isActive(href, pathname)
              return (
                <Link key={href} href={href} className="block">
                  <div className={cn(
                    'relative flex items-center rounded-lg h-9 transition-colors duration-150 cursor-pointer group',
                    collapsed ? 'justify-center w-9 mx-auto' : 'px-3 gap-3',
                    active
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                  )}>
                    <Icon size={18} className="shrink-0" />
                    <AnimatePresence initial={false}>
                      {!collapsed && (
                        <motion.span
                          key="lbl"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.12 }}
                          className={cn(
                            'text-sm whitespace-nowrap overflow-hidden',
                            active ? 'font-bold' : 'font-medium',
                          )}
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {/* Tooltip when collapsed */}
                    {collapsed && (
                      <div className="pointer-events-none absolute left-full ml-3 z-50 hidden group-hover:flex items-center">
                        <div className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                          {label}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* ── Profile section ───────────────────────────────── */}
          <div ref={profileRef} className="relative border-t border-gray-100 py-3 px-2 shrink-0">

            {/* Dropdown */}
            <DropdownMenu open={profileOpen} onClose={() => setProfileOpen(false)} anchorRef={profileRef}>
              <div className="px-1 py-1">
                {/* Admin info header */}
                <div className="px-3 pt-3 pb-3">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-heading font-bold text-sm select-none shrink-0">
                      SA
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">Shaun</p>
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        Administrator
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-1" />

                <Link
                  href="/admin/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <Settings size={15} className="text-gray-400 shrink-0" />
                  Settings
                </Link>

                <div className="my-1 border-t border-gray-100" />

                <button
                  onClick={() => router.push('/')}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
                >
                  <LogOut size={15} className="shrink-0" />
                  Log out
                </button>
              </div>
            </DropdownMenu>

            {/* Trigger row */}
            <div
              onClick={() => setProfileOpen(p => !p)}
              className={cn(
                'flex items-center cursor-pointer rounded-xl hover:bg-gray-50 transition-colors duration-150 group',
                collapsed ? 'justify-center py-1' : 'gap-3 px-2 py-1.5',
              )}
              title={collapsed ? 'Shaun (Admin)' : undefined}
            >
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-heading font-bold text-sm select-none shrink-0 group-hover:ring-2 group-hover:ring-amber-300/50 transition-all duration-150">
                SA
              </div>

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div
                    key="profile-info"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.14 }}
                    className="min-w-0 overflow-hidden flex-1"
                  >
                    <p className="text-sm font-semibold text-gray-900 truncate leading-tight">Shaun</p>
                    <span className="text-xs font-medium text-amber-600">Administrator</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Collapse toggle — floating button on right edge */}
          <button
            onClick={toggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="absolute top-1/2 -translate-y-1/2 -right-3.5 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors duration-150 cursor-pointer text-gray-400 hover:text-gray-700 z-40"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </motion.aside>

        {/* ── Main content — desktop ───────────────────────────── */}
        <motion.div
          animate={{ marginLeft: sw }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="hidden md:block flex-1 min-h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <main className="p-6">{children}</main>
        </motion.div>

        {/* ── Main content — mobile ────────────────────────────── */}
        <div className="flex-1 md:hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <main className="p-4 pb-20">{children}</main>
        </div>
      </div>

      {/* ── Mobile bottom tab bar ────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex items-center justify-around px-1 h-16">
        {NAV.map(({ label, icon: Icon, href }) => {
          const active = isActive(href, pathname)
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl min-w-[44px] min-h-[44px] justify-center transition-colors duration-150 cursor-pointer',
                active ? 'text-[#3B6D11]' : 'text-gray-400',
              )}
            >
              <Icon size={20} />
              <span className="text-[9px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </nav>

    </div>
  )
}

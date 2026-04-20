'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  Medal,
  Settings,
  Bell,
  Flame,
  ChevronLeft,
  ChevronRight,
  CandlestickChart,
  LogOut,
  User,
} from 'lucide-react'
import { STUDENT } from '@/lib/dashboard-data'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Home',         icon: LayoutDashboard, href: '/dashboard' },
  { label: 'My Modules',   icon: BookOpen,         href: '/dashboard/modules' },
  { label: 'Simulator',    icon: CandlestickChart, href: '/dashboard/simulator' },
  { label: 'Leaderboard',  icon: Trophy,           href: '/dashboard/leaderboard' },
  { label: 'Achievements', icon: Medal,            href: '/dashboard/achievements' },
]


function isActive(href: string, pathname: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname.startsWith(href)
}

/* Icon-only row with hover tooltip when sidebar is collapsed */
function SidebarItem({
  collapsed,
  active,
  children,
  title,
  className,
  onClick,
}: {
  collapsed: boolean
  active?: boolean
  children: React.ReactNode
  title: string
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative flex items-center rounded-xl transition-colors duration-150 cursor-pointer group',
        collapsed ? 'justify-center w-10 h-10 mx-auto' : 'px-3 py-2.5 gap-3',
        active
          ? 'bg-[#EAF3DE] text-[#3B6D11]'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
        className
      )}
    >
      {children}
      {/* Tooltip — only when collapsed */}
      {collapsed && (
        <div className="pointer-events-none absolute left-full ml-3 z-50 hidden group-hover:flex items-center">
          <div className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
            {title}
          </div>
        </div>
      )}
    </div>
  )
}

/* Floating dropdown that pops above its anchor */
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
  // Close on outside click
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
          className="absolute bottom-full left-0 mb-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const xpPct = (STUDENT.xp / STUDENT.xpToNextLevel) * 100
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed') === 'true'
    setCollapsed(saved)
    // Enable transitions only after the sidebar has snapped to the saved position
    requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)))
  }, [])

  useEffect(() => {
    if (mounted) localStorage.setItem('sidebar-collapsed', String(collapsed))
  }, [collapsed, mounted])

  const profileRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

  function handleLogout() {
    router.push('/')
  }

  return (
    <div
      className="min-h-screen bg-[#f4f7f2] flex group/root"
      data-collapsed={String(collapsed)}
      suppressHydrationWarning
    >

      {/* ─── Sidebar — desktop only ───────────────────────────────── */}
      <aside className={cn(
        'hidden md:flex flex-col fixed left-0 top-0 bottom-0 bg-white border-r border-gray-100 z-30 overflow-visible',
        'w-[268px] group-data-[collapsed=true]/root:w-[60px]',
        mounted ? 'transition-[width] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]' : ''
      )}>

        {/* ── Logo ──────────────────────────────────────────────────── */}
        <div className={cn(
          'flex items-center h-16 border-b border-gray-100 shrink-0 overflow-hidden',
          collapsed ? 'justify-center px-0' : 'px-4'
        )}>
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center gap-2 cursor-pointer min-w-0',
              collapsed && 'pointer-events-none'
            )}
            tabIndex={collapsed ? -1 : 0}
          >
            {/* Trading icon — always visible */}
            <div className="w-8 h-8 rounded-lg bg-[#3B6D11] flex items-center justify-center shrink-0">
              <CandlestickChart size={16} className="text-white" />
            </div>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  key="brand"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.14 }}
                  className="font-heading text-base font-bold text-[#3B6D11] whitespace-nowrap overflow-hidden"
                >
                  Trading Academy
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

        </div>

        {/* Toggle button — vertically centred on the sidebar's right edge */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute top-1/2 -translate-y-1/2 -right-3.5 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors duration-150 cursor-pointer text-gray-400 hover:text-gray-700 z-40"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* ── Main nav ──────────────────────────────────────────────── */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto overflow-x-hidden space-y-0.5">
          {NAV.map(({ label, icon: Icon, href }) => {
            const active = isActive(href, pathname)
            return (
              <Link key={href} href={href} className="block mb-0.5">
                <SidebarItem collapsed={collapsed} active={active} title={label}>
                  <Icon
                    size={18}
                    className={cn('shrink-0', active ? 'text-[#3B6D11]' : 'text-gray-400 group-hover:text-gray-700')}
                  />
                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.span
                        key="lbl"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.14 }}
                        className={cn(
                          'text-sm font-medium whitespace-nowrap overflow-hidden',
                          active ? 'text-[#3B6D11] font-semibold' : 'text-gray-600'
                        )}
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </SidebarItem>
              </Link>
            )
          })}
        </nav>

        {/* ── Bottom section ────────────────────────────────────────── */}
        <div className="border-t border-gray-100 py-3 px-2 space-y-0.5 shrink-0">

          {/* Streak */}
          <SidebarItem collapsed={collapsed} title={`${STUDENT.streak} day streak`}>
            <Flame size={18} className="text-amber-500 shrink-0" />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  key="streak-text"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.14 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs font-bold text-amber-700 whitespace-nowrap">{STUDENT.streak} day streak</p>
                  <p className="text-xs text-amber-400 whitespace-nowrap">Keep it up!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </SidebarItem>

          {/* Notifications */}
          <SidebarItem collapsed={collapsed} title="Notifications">
            <Bell size={18} className="text-gray-400 group-hover:text-gray-700 shrink-0" />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  key="notif-lbl"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.14 }}
                  className="text-sm font-medium text-gray-600 whitespace-nowrap overflow-hidden"
                >
                  Notifications
                </motion.span>
              )}
            </AnimatePresence>
          </SidebarItem>

          {/* ── Settings (with logout dropdown) ───────────────────── */}
          <div ref={settingsRef} className="relative">
            <DropdownMenu open={settingsOpen} onClose={() => setSettingsOpen(false)} anchorRef={settingsRef}>
              <div className="px-1 py-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setSettingsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <Settings size={15} className="text-gray-400 shrink-0" />
                  Settings
                </Link>
                <div className="my-1 border-t border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
                >
                  <LogOut size={15} className="shrink-0" />
                  Log out
                </button>
              </div>
            </DropdownMenu>

            <SidebarItem
              collapsed={collapsed}
              active={isActive('/dashboard/settings', pathname) && !settingsOpen}
              title="Settings"
              onClick={() => { setSettingsOpen(p => !p); setProfileOpen(false) }}
            >
              <Settings
                size={18}
                className={cn(
                  'shrink-0',
                  isActive('/dashboard/settings', pathname) ? 'text-[#3B6D11]' : 'text-gray-400 group-hover:text-gray-700'
                )}
              />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    key="settings-lbl"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.14 }}
                    className={cn(
                      'text-sm font-medium whitespace-nowrap overflow-hidden',
                      isActive('/dashboard/settings', pathname) ? 'text-[#3B6D11] font-semibold' : 'text-gray-600'
                    )}
                  >
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </SidebarItem>
          </div>

          {/* ── Profile (with logout dropdown) ────────────────────── */}
          <div ref={profileRef} className="relative mt-1 pt-2 border-t border-gray-100">
            <DropdownMenu open={profileOpen} onClose={() => setProfileOpen(false)} anchorRef={profileRef}>
              <div className="px-1 py-1">
                {/* User info header */}
                <div className="px-3 pt-2 pb-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-full bg-[#639922] flex items-center justify-center text-white font-heading font-bold text-sm select-none shrink-0">
                      {STUDENT.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{STUDENT.name}</p>
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-[#EAF3DE] text-[#3B6D11]">
                        {STUDENT.level}
                      </span>
                    </div>
                  </div>
                  {/* XP bar in popup */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>XP Progress</span>
                      <span>{STUDENT.xp} / {STUDENT.xpToNextLevel}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#639922] rounded-full transition-all duration-700"
                        style={{ width: `${xpPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-1" />

                <Link
                  href="/dashboard/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <User size={15} className="text-gray-400 shrink-0" />
                  View Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
                >
                  <LogOut size={15} className="shrink-0" />
                  Log out
                </button>
              </div>
            </DropdownMenu>

            {/* Trigger row */}
            <div
              onClick={() => { setProfileOpen(p => !p); setSettingsOpen(false) }}
              className={cn(
                'flex items-center cursor-pointer rounded-xl hover:bg-gray-50 transition-colors duration-150 group',
                collapsed ? 'justify-center py-1' : 'gap-3 px-2 py-1.5'
              )}
              title={collapsed ? STUDENT.name : undefined}
            >
              <div className="w-9 h-9 rounded-full bg-[#639922] flex items-center justify-center text-white font-heading font-bold text-sm select-none shrink-0 group-hover:ring-2 group-hover:ring-[#639922]/30 transition-all duration-150">
                {STUDENT.avatar}
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
                    <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{STUDENT.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-[#EAF3DE] text-[#3B6D11] whitespace-nowrap">
                        {STUDENT.level}
                      </span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{STUDENT.xp} XP</span>
                    </div>
                    <div className="mt-1.5 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#639922] rounded-full"
                        style={{ width: `${xpPct}%` }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </aside>

      {/* ─── Main content — desktop ───────────────────────────────── */}
      <div className={cn(
        'flex-1 min-h-screen hidden md:block',
        'ml-[268px] group-data-[collapsed=true]/root:ml-[60px]',
        mounted ? 'transition-[margin] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]' : ''
      )}>
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* ─── Mobile layout ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:hidden min-h-screen">
        <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#3B6D11] flex items-center justify-center">
              <CandlestickChart size={14} className="text-white" />
            </div>
            <span className="font-heading text-base font-bold text-[#3B6D11]">Trading Academy</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer" aria-label="Notifications">
              <Bell size={18} className="text-gray-500" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#639922] flex items-center justify-center text-white text-sm font-heading font-bold select-none">
              {STUDENT.avatar}
            </div>
          </div>
        </header>

        <main className="flex-1 pt-14 pb-16 p-4 overflow-y-auto">
          {children}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex items-center justify-around px-2 h-16">
          {[...NAV, { label: 'Settings', icon: Settings, href: '/dashboard/settings' }].map(({ label, icon: Icon, href }) => {
            const active = isActive(href, pathname)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-[44px] min-h-[44px] justify-center transition-colors duration-150 cursor-pointer',
                  active ? 'text-[#3B6D11] bg-[#EAF3DE]' : 'text-gray-400 hover:text-gray-600'
                )}
                aria-label={label}
              >
                <Icon size={20} />
                <span className="text-[9px] font-medium leading-none">{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

    </div>
  )
}

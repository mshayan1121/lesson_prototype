'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  Medal,
  Settings,
  Bell,
  Flame,
} from 'lucide-react'
import { STUDENT } from '@/lib/dashboard-data'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'My Modules', icon: BookOpen, href: '/dashboard/modules' },
  { label: 'Leaderboard', icon: Trophy, href: '/dashboard/leaderboard' },
  { label: 'Achievements', icon: Medal, href: '/dashboard/achievements' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
]

function isActive(href: string, pathname: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname.startsWith(href)
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const xpPct = (STUDENT.xp / STUDENT.xpToNextLevel) * 100

  return (
    <div className="min-h-screen bg-[#f4f7f2]">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6">
        <Link href="/dashboard" className="font-heading text-lg font-bold text-[#3B6D11] cursor-pointer">
          Trading Academy
        </Link>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer" aria-label="Notifications">
            <Bell size={18} className="text-gray-500" />
          </button>
          <div className="w-9 h-9 rounded-full bg-[#639922] flex items-center justify-center text-white text-sm font-heading font-bold select-none">
            {STUDENT.avatar}
          </div>
          <span className="hidden md:block text-sm font-medium text-gray-700">{STUDENT.name}</span>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Left Sidebar — desktop only */}
        <aside className="hidden md:flex flex-col fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-100 z-20">
          {/* Student card */}
          <div className="px-4 py-5 border-b border-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-[#639922] flex items-center justify-center text-white font-heading font-bold text-lg select-none flex-shrink-0">
                {STUDENT.avatar}
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-gray-900 text-sm truncate">{STUDENT.name}</p>
                <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-[#EAF3DE] text-[#3B6D11] mt-0.5">
                  {STUDENT.level}
                </span>
              </div>
            </div>
            {/* XP bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>XP</span>
                <span>{STUDENT.xp} / {STUDENT.xpToNextLevel}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#639922] rounded-full transition-all duration-700"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 py-3 px-2 overflow-y-auto">
            {NAV.map(({ label, icon: Icon, href }) => {
              const active = isActive(href, pathname)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-colors duration-150 cursor-pointer',
                    active
                      ? 'bg-[#EAF3DE] text-[#3B6D11] font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon size={18} className={active ? 'text-[#3B6D11]' : 'text-gray-400'} />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Streak badge */}
          <div className="px-4 py-4 border-t border-gray-50">
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-100">
              <Flame size={18} className="text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-700">{STUDENT.streak} day streak</p>
                <p className="text-xs text-amber-500">Keep it up!</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-64 mb-16 md:mb-0 min-h-[calc(100vh-4rem)]">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex items-center justify-around px-2 h-16">
        {NAV.map(({ label, icon: Icon, href }) => {
          const active = isActive(href, pathname)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-[48px] min-h-[48px] justify-center transition-colors duration-150 cursor-pointer',
                active ? 'text-[#3B6D11] bg-[#EAF3DE]' : 'text-gray-400 hover:text-gray-600'
              )}
              aria-label={label}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

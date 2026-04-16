'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CandlestickChart, GraduationCap, ShieldCheck, ArrowRight } from 'lucide-react'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const ACCOUNTS = [
  {
    key: 'student',
    label: 'Student',
    name: 'Alex Johnson',
    initials: 'AJ',
    description: 'Continue your learning journey',
    href: '/dashboard',
    avatarBg: 'bg-[#639922]',
    avatarText: 'text-white',
    iconBg: 'bg-[#EAF3DE]',
    iconColor: 'text-[#3B6D11]',
    badgeBg: 'bg-[#EAF3DE]',
    badgeText: 'text-[#3B6D11]',
    hoverBorder: 'hover:border-[#639922]',
    hoverShadow: 'hover:shadow-[0_8px_32px_rgba(99,153,34,0.15)]',
    Icon: GraduationCap,
  },
  {
    key: 'admin',
    label: 'Administrator',
    name: 'Shaun',
    initials: 'SA',
    description: 'Manage platform and content',
    href: '/admin',
    avatarBg: 'bg-amber-400',
    avatarText: 'text-white',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    hoverBorder: 'hover:border-amber-400',
    hoverShadow: 'hover:shadow-[0_8px_32px_rgba(251,191,36,0.18)]',
    Icon: ShieldCheck,
  },
]

export default function AccountSelectPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#f4f7f2] flex flex-col items-center justify-center px-4 py-12">

      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex items-center gap-2.5 mb-10"
      >
        <div className="w-9 h-9 rounded-xl bg-[#3B6D11] flex items-center justify-center shadow-sm">
          <CandlestickChart size={18} className="text-white" />
        </div>
        <span className="font-heading text-xl font-bold text-[#3B6D11]">Trading Academy</span>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.07, ease: 'easeOut' }}
        className="text-center mb-8"
      >
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Who&apos;s logging in?
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">Select your account to continue</p>
      </motion.div>

      {/* Account cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col sm:flex-row gap-4 w-full max-w-xl"
      >
        {ACCOUNTS.map(({
          key, label, name, initials, description, href,
          avatarBg, avatarText, iconBg, iconColor,
          badgeBg, badgeText, hoverBorder, hoverShadow, Icon,
        }) => (
          <motion.button
            key={key}
            variants={item}
            onClick={() => router.push(href)}
            className={`
              group flex-1 bg-white rounded-2xl border-2 border-gray-100 p-6
              flex flex-col items-center text-center gap-4
              transition-all duration-200 cursor-pointer
              ${hoverBorder} ${hoverShadow}
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#639922]
            `}
          >
            {/* Avatar */}
            <div className={`w-16 h-16 rounded-full ${avatarBg} flex items-center justify-center shadow-sm`}>
              <span className={`font-heading font-bold text-xl select-none ${avatarText}`}>{initials}</span>
            </div>

            {/* Name + badge */}
            <div className="space-y-1.5">
              <p className="font-heading text-lg font-bold text-gray-900">{name}</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeBg} ${badgeText}`}>
                <div className={`w-5 h-5 rounded-full ${iconBg} flex items-center justify-center`}>
                  <Icon size={11} className={iconColor} />
                </div>
                {label}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-400 leading-snug">{description}</p>

            {/* CTA */}
            <div className={`
              flex items-center gap-1.5 text-sm font-semibold mt-1
              transition-colors duration-150
              ${key === 'student' ? 'text-[#3B6D11] group-hover:text-[#2d5209]' : 'text-amber-600 group-hover:text-amber-700'}
            `}>
              Enter
              <ArrowRight
                size={15}
                className="transition-transform duration-150 group-hover:translate-x-0.5"
              />
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="mt-10 text-xs text-gray-400"
      >
        Trading Academy &copy; 2026 — All accounts are demo only
      </motion.p>

    </div>
  )
}

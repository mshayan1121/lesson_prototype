import { cookies } from 'next/headers'

import DashboardLayoutClient from './DashboardLayoutClient'

const SIDEBAR_PREFERENCE_KEY = 'sidebar-collapsed'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sidebarPreference = cookieStore.get(SIDEBAR_PREFERENCE_KEY)

  return (
    <DashboardLayoutClient
      initialCollapsed={sidebarPreference?.value === 'true'}
      hasPersistedPreference={sidebarPreference !== undefined}
    >
      {children}
    </DashboardLayoutClient>
  )
}

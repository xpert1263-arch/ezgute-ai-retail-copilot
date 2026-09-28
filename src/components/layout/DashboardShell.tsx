import type { ReactNode } from 'react'
import { Sidebar, type PageKey } from './Sidebar'

interface DashboardShellProps {
  active: PageKey
  onNavigate: (key: PageKey) => void
  children: ReactNode
}

export function DashboardShell({ active, onNavigate, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-base-black">
      <Sidebar active={active} onNavigate={onNavigate} />
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}

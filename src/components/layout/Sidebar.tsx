import { motion } from 'framer-motion'
import {
  LayoutGrid,
  MessagesSquare,
  Package,
  Sparkles,
  BrainCircuit,
  type LucideIcon,
} from 'lucide-react'

export type PageKey = 'home' | 'seller' | 'ceo' | 'products'

interface NavItem {
  key: PageKey
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Bosh sahifa', icon: LayoutGrid },
  { key: 'seller', label: 'Sotuvchi AI', icon: MessagesSquare },
  { key: 'ceo', label: 'CEO AI', icon: BrainCircuit },
  { key: 'products', label: 'Mahsulotlar', icon: Package },
]

interface SidebarProps {
  active: PageKey
  onNavigate: (key: PageKey) => void
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-base-border bg-base-panel-deep">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-blue/15">
          <Sparkles className="h-3.5 w-3.5 text-accent-blue" size={14} />
        </div>
        <div className="leading-tight">
          <p className="text-[13px] font-semibold text-text-primary">AI Retail</p>
          <p className="text-[13px] font-semibold text-text-primary -mt-0.5">Copilot</p>
        </div>
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === active
          const Icon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-white/[0.06]"
                  transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                />
              )}
              {isActive && (
                <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent-blue" />
              )}
              <Icon
                className={`relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5 ${isActive ? 'text-accent-blue' : ''}`}
                size={16}
              />
              <span className="relative z-10">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="border-t border-base-border px-5 py-4">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          AI Online
        </div>
      </div>
    </aside>
  )
}

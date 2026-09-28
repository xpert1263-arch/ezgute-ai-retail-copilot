import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface KpiCardProps {
  label: string
  value: string
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  delay?: number
}

export function KpiCard({ label, value, icon: Icon, trend, trendUp, delay = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="rounded-xl border border-base-border bg-base-panel p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-text-muted">{label}</p>
        <Icon className="h-3.5 w-3.5 text-text-muted" size={14} />
      </div>
      <p className="tabular-nums mt-3 text-[26px] font-semibold leading-none tracking-tight text-text-primary">
        {value}
      </p>
      {trend && (
        <p className={`mt-2 text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>{trend}</p>
      )}
    </motion.div>
  )
}

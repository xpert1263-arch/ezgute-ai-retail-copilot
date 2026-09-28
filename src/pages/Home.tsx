import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { KpiCard } from '../components/KpiCard'
import { ResponseBlocks } from '../components/ai/ResponseBlocks'
import { getBranchRanking, getRevenueTrend, getTodayKpis, generateHomeInsights } from '../data/analytics'
import { CURRENT_USER_NAME } from '../data/products'
import { getAIResponse, type AIResponse } from '../services/localAI'
import { askBusinessAI } from '../services/geminiClient'
import { formatCompactSum, formatSum } from '../lib/format'

const EXAMPLE_PROMPTS = [
  'Bugungi daromad qancha?',
  "Qaysi filial yaxshi ishlayapti?",
  "Qoldig'i kam mahsulotlar qaysilar?",
]

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Xayrli tong'
  if (hour >= 12 && hour < 18) return 'Xayrli kun'
  return 'Xayrli kech'
}

const insightIcon = {
  positive: TrendingUp,
  warning: ArrowUpRight,
  negative: TrendingDown,
} as const

const insightColor = {
  positive: 'text-emerald-400',
  warning: 'text-amber-400',
  negative: 'text-rose-400',
} as const

export function Home() {
  const kpis = getTodayKpis()
  const revenueTrend = getRevenueTrend()
  const branchRanking = getBranchRanking()
  const insights = generateHomeInsights()

  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<AIResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const requestIdRef = useRef(0)

  async function handleAsk(text?: string) {
    const question = text ?? query
    if (!question.trim()) return
    const requestId = ++requestIdRef.current

    setQuery(question)
    setLoading(true)
    setResponse(null)

    await new Promise((resolve) => window.setTimeout(resolve, 500))
    const local = getAIResponse(question)
    if (requestId !== requestIdRef.current) return
    setResponse(local)
    setLoading(false)

    const aiText = await askBusinessAI(question, { factsSummary: local.summary, details: local.blocks })
    if (requestId !== requestIdRef.current) return
    if (aiText) setResponse({ ...local, summary: aiText })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          {getGreeting()}, {CURRENT_USER_NAME}
        </h1>
        <p className="mt-1 text-sm text-text-muted">Bugungi biznes holati</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="ai-command-glow rounded-xl border border-accent-blue/25 bg-base-panel p-5"
      >
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-accent-blue">
          <Sparkles className="h-3.5 w-3.5" size={14} />
          AI Copilot
        </div>
        <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Biznesingiz haqida istalgan savolni bering..."
            className="w-full rounded-lg border border-base-border bg-black/30 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/70 outline-none focus:border-accent-blue/60"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading}
            className="shrink-0 rounded-lg bg-accent-blue px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Tahlil qilinmoqda...' : "So'rash"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => handleAsk(p)}
              className="rounded-full border border-base-border px-3 py-1 text-[11px] text-text-muted transition-colors hover:border-accent-blue/40 hover:text-text-primary"
            >
              {p}
            </button>
          ))}
        </div>

        {loading && (
          <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent-blue [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent-blue [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent-blue" />
            </span>
            AI tahlil qilmoqda
          </div>
        )}

        {response && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-text-primary/90">
              {response.summary}
            </p>
            <ResponseBlocks blocks={response.blocks} />
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Bugungi savdo" value={formatSum(kpis.revenue)} icon={Wallet} trend="+12.4% kechagiga nisbatan" trendUp delay={0} />
        <KpiCard label="Savdolar soni" value={`${kpis.salesCount} ta`} icon={TrendingUp} trend="+6 ta kechagiga nisbatan" trendUp delay={0.05} />
        <KpiCard label="O'rtacha chek" value={formatSum(kpis.averageOrderValue)} icon={ArrowUpRight} trend="-2.1% kechagiga nisbatan" delay={0.1} />
        <KpiCard label="Faol mijozlar" value={`${kpis.activeCustomers}`} icon={Users} trend="+18 ta bu hafta" trendUp delay={0.15} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="rounded-xl border border-base-border bg-base-panel p-5 xl:col-span-2"
        >
          <p className="text-sm font-medium text-text-primary">Haftalik daromad</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ left: -20, right: 10, top: 5 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3e7bfa" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3e7bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1b212c" vertical={false} />
                <XAxis dataKey="day" stroke="#8a93a3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8a93a3" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatCompactSum(v)} width={90} />
                <Tooltip
                  contentStyle={{ background: '#10151d', border: '1px solid #1b212c', borderRadius: 10, fontSize: 12, color: '#f5f7fa' }}
                  formatter={(value) => [formatSum(Number(value)), 'Daromad']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3e7bfa" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="rounded-xl border border-base-border bg-base-panel p-5"
        >
          <p className="text-sm font-medium text-text-primary">AI tahlil</p>
          <div className="mt-3 space-y-2.5">
            {insights.map((insight, i) => {
              const Icon = insightIcon[insight.type]
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 + i * 0.05 }}
                  className="flex items-start gap-2.5"
                >
                  <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${insightColor[insight.type]}`} size={14} />
                  <p className="text-xs leading-relaxed text-text-primary/85">{insight.title}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="rounded-xl border border-base-border bg-base-panel p-5"
      >
        <p className="text-sm font-medium text-text-primary">Filiallar ko'rsatkichi</p>
        <div className="mt-4 space-y-3">
          {branchRanking.map((b, i) => {
            const max = branchRanking[0].revenue || 1
            return (
              <div key={b.branch}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-text-primary">{b.branch}</span>
                  <span className="tabular-nums text-text-muted">
                    {formatSum(b.revenue)} · {b.sales} ta savdo · {b.conversion}% konversiya
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(b.revenue / max) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }}
                    className="h-full rounded-full bg-accent-blue"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

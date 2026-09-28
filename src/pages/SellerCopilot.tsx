import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, MessageSquareText, Scale, Sparkles } from 'lucide-react'
import {
  bestBranchForStock,
  generatePitch,
  getRecommendations,
  parseCustomerRequest,
  type ScoredProduct,
} from '../services/sellerCopilot'
import { BRANCHES } from '../data/products'
import { totalStock } from '../data/analytics'
import { generateAiPitch } from '../services/geminiClient'
import { formatSum } from '../lib/format'

const EXAMPLE_PROMPTS = [
  "Menga kamerasi yaxshi, batareyasi uzoq ishlaydigan, 10 million so'm atrofida telefon kerak.",
  "8 million so'mgacha Samsung telefoni bor-yo'qligini ayting.",
  "Ish uchun kuchli noutbuk kerak, byudjet 9 million so'm.",
]

const COMPARE_ROWS: { label: string; get: (p: ScoredProduct['product']) => string }[] = [
  { label: 'Narxi', get: (p) => formatSum(p.price) },
  { label: 'Xotira', get: (p) => p.storage ?? '—' },
  { label: 'Kamera', get: (p) => p.camera ?? '—' },
  { label: 'Batareya', get: (p) => p.battery ?? '—' },
  { label: 'Ekran', get: (p) => p.display ?? '—' },
  { label: 'Chip', get: (p) => p.chip ?? '—' },
  { label: 'Qoldiq', get: (p) => `${totalStock(p)} dona` },
]

export function SellerCopilot() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ScoredProduct[] | null>(null)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [pitch, setPitch] = useState<{ productId: string; text: string } | null>(null)
  const [pitchLoadingId, setPitchLoadingId] = useState<string | null>(null)

  function handleSearch(text?: string) {
    const question = text ?? query
    if (!question.trim()) return
    setQuery(question)
    setLoading(true)
    setResults(null)
    setCompareIds([])
    setPitch(null)
    window.setTimeout(() => {
      const request = parseCustomerRequest(question)
      setResults(getRecommendations(request))
      setLoading(false)
    }, 800)
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  async function handlePitch(scored: ScoredProduct) {
    setPitchLoadingId(scored.product.id)
    setPitch(null)

    const fallback = generatePitch(scored)
    const p = scored.product
    const branch = bestBranchForStock(p)
    const aiText = await generateAiPitch({
      customerRequest: query,
      product: {
        name: p.name,
        brand: p.brand,
        price: formatSum(p.price),
        storage: p.storage,
        camera: p.camera,
        battery: p.battery,
        display: p.display,
        chip: p.chip,
        availableBranch: branch.stock > 0 ? branch.branch : null,
        availableStock: branch.stock,
      },
      reasons: scored.reasons,
    })

    setPitch({ productId: scored.product.id, text: aiText ?? fallback })
    setPitchLoadingId(null)
  }

  const compareProducts = results?.filter((r) => compareIds.includes(r.product.id)) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Sotuvchi AI</h1>
        <p className="mt-1 text-sm text-text-muted">
          Mijoz ehtiyojini tushuning va eng mos mahsulotni soniyalar ichida toping.
        </p>
      </div>

      <div className="ai-command-glow rounded-xl border border-accent-blue/25 bg-base-panel p-5">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-accent-blue">
          <Sparkles className="h-3.5 w-3.5" size={14} />
          Mijoz talabi
        </div>
        <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSearch()
              }
            }}
            placeholder="Menga kamerasi yaxshi, batareyasi uzoq ishlaydigan, 10 million so'm atrofida telefon kerak."
            rows={2}
            className="w-full resize-none rounded-lg border border-base-border bg-black/30 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/70 outline-none focus:border-accent-blue/60"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="shrink-0 rounded-lg bg-accent-blue px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Qidirilmoqda...' : 'Mos mahsulot topish'}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => handleSearch(p)}
              className="rounded-full border border-base-border px-3 py-1 text-[11px] text-text-muted transition-colors hover:border-accent-blue/40 hover:text-text-primary"
            >
              {p.length > 46 ? `${p.slice(0, 46)}…` : p}
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
            Mijoz talabi tahlil qilinmoqda
          </div>
        )}
      </div>

      {results && results.length === 0 && (
        <div className="rounded-xl border border-base-border bg-base-panel p-6 text-center text-sm text-text-muted">
          Talabga mos mahsulot topilmadi. Boshqa mezonlar bilan urinib ko'ring.
        </div>
      )}

      {results && results.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {results.map((scored, i) => {
            const p = scored.product
            const isSelected = compareIds.includes(p.id)
            const availableBranches = BRANCHES.filter((b) => p.stockByBranch[b] > 0)
            const stock = totalStock(p)

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className={`rounded-xl border bg-base-panel p-4 ${isSelected ? 'border-accent-blue/50' : 'border-base-border'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] text-text-muted">{p.brand} · {p.storage ?? p.category}</p>
                    <p className="mt-0.5 text-sm font-semibold text-text-primary">{p.name}</p>
                  </div>
                  <span className="tabular-nums shrink-0 rounded-md bg-accent-blue/15 px-2 py-1 text-xs font-semibold text-accent-blue">
                    {scored.matchPercent}% mos
                  </span>
                </div>

                <p className="tabular-nums mt-3 text-xl font-semibold text-text-primary">{formatSum(p.price)}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[p.camera, p.battery, p.chip].filter(Boolean).map((spec) => (
                    <span key={spec} className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-text-muted">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="mt-3 rounded-lg border border-base-border bg-black/20 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">Nega mos?</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-primary/85">
                    {scored.reasons.length > 0
                      ? `${scored.reasons.slice(0, 2).join(', ')}.`
                      : 'Mavjud talablarga asosiy jihatlari bo\'yicha mos keladi.'}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-text-muted">
                  <span>Jami qoldiq: {stock} dona</span>
                  <span>{availableBranches.length} ta filialda mavjud</span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => toggleCompare(p.id)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      isSelected
                        ? 'border-accent-blue/50 bg-accent-blue/10 text-accent-blue'
                        : 'border-base-border text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {isSelected ? <Check className="h-3.5 w-3.5" size={14} /> : <Scale className="h-3.5 w-3.5" size={14} />}
                    Taqqoslash
                  </button>
                  <button
                    onClick={() => handlePitch(scored)}
                    disabled={pitchLoadingId === p.id}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent-blue px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <MessageSquareText className="h-3.5 w-3.5" size={14} />
                    {pitchLoadingId === p.id ? 'Tayyorlanmoqda...' : 'Taklif tayyorlash'}
                  </button>
                </div>

                <AnimatePresence>
                  {pitch && pitch.productId === p.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 rounded-lg border border-accent-blue/20 bg-accent-blue/[0.06] p-3 text-xs leading-relaxed text-blue-100/90">
                        {pitch.text}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {compareProducts.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="rounded-xl border border-base-border bg-base-panel p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-primary">Taqqoslash</p>
              <button onClick={() => setCompareIds([])} className="text-xs text-text-muted hover:text-text-primary">
                Tozalash
              </button>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-base-border text-text-muted">
                    <th className="py-2 pr-4 font-medium"> </th>
                    {compareProducts.map((c) => (
                      <th key={c.product.id} className="py-2 pr-4 font-medium text-text-primary">
                        {c.product.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row) => (
                    <tr key={row.label} className="border-b border-base-border/60 last:border-b-0">
                      <td className="py-2.5 pr-4 font-medium text-text-muted">{row.label}</td>
                      {compareProducts.map((c) => (
                        <td key={c.product.id} className="tabular-nums py-2.5 pr-4 text-text-primary/90">
                          {row.get(c.product)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

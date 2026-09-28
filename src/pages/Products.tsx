import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Search, X } from 'lucide-react'
import { BRANCHES, CATEGORIES, PRODUCTS } from '../data/products'
import { getFlattenedInventory, totalSalesMonth, totalSalesToday, totalStock } from '../data/analytics'
import type { Branch, Category, InventoryRow, StockStatus } from '../types'
import { formatSum } from '../lib/format'

const STOCK_STATUSES: StockStatus[] = ['Yaxshi', 'Kam qoldi', 'Tugagan']

const STATUS_STYLE: Record<StockStatus, string> = {
  Yaxshi: 'bg-emerald-500/15 text-emerald-400',
  'Kam qoldi': 'bg-amber-500/15 text-amber-400',
  Tugagan: 'bg-rose-500/15 text-rose-400',
}

const BRANDS = Array.from(new Set(PRODUCTS.map((p) => p.brand))).sort()

export function Products() {
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState<string>('all')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [branch, setBranch] = useState<Branch | 'all'>('all')
  const [status, setStatus] = useState<StockStatus | 'all'>('all')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  const rows = useMemo(() => {
    const all = getFlattenedInventory()
    const min = priceMin ? Number(priceMin) * 1000 : undefined
    const max = priceMax ? Number(priceMax) * 1000 : undefined

    return all.filter((row) => {
      if (search && !row.name.toLowerCase().includes(search.toLowerCase())) return false
      if (brand !== 'all' && row.brand !== brand) return false
      if (category !== 'all' && row.category !== category) return false
      if (branch !== 'all' && row.branch !== branch) return false
      if (status !== 'all' && row.status !== status) return false
      if (min !== undefined && row.price < min) return false
      if (max !== undefined && row.price > max) return false
      return true
    })
  }, [search, brand, category, branch, status, priceMin, priceMax])

  const selectedProduct = selectedProductId ? PRODUCTS.find((p) => p.id === selectedProductId) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Mahsulotlar</h1>
        <p className="mt-1 text-sm text-text-muted">To'liq mahsulot katalogi va qoldiqlar nazorati</p>
      </div>

      <div className="rounded-xl border border-base-border bg-base-panel p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mahsulot nomi bo'yicha qidirish..."
            className="w-full rounded-lg border border-base-border bg-black/20 py-2.5 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted/70 outline-none focus:border-accent-blue/50"
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="rounded-lg border border-base-border bg-black/20 px-2.5 py-2 text-xs text-text-primary outline-none focus:border-accent-blue/50"
          >
            <option value="all">Barcha brendlar</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | 'all')}
            className="rounded-lg border border-base-border bg-black/20 px-2.5 py-2 text-xs text-text-primary outline-none focus:border-accent-blue/50"
          >
            <option value="all">Barcha kategoriyalar</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value as Branch | 'all')}
            className="rounded-lg border border-base-border bg-black/20 px-2.5 py-2 text-xs text-text-primary outline-none focus:border-accent-blue/50"
          >
            <option value="all">Barcha filiallar</option>
            {BRANCHES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StockStatus | 'all')}
            className="rounded-lg border border-base-border bg-black/20 px-2.5 py-2 text-xs text-text-primary outline-none focus:border-accent-blue/50"
          >
            <option value="all">Barcha holatlar</option>
            {STOCK_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <input
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="Min narx (ming)"
            type="number"
            className="rounded-lg border border-base-border bg-black/20 px-2.5 py-2 text-xs text-text-primary placeholder:text-text-muted/70 outline-none focus:border-accent-blue/50"
          />
          <input
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="Max narx (ming)"
            type="number"
            className="rounded-lg border border-base-border bg-black/20 px-2.5 py-2 text-xs text-text-primary placeholder:text-text-muted/70 outline-none focus:border-accent-blue/50"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-base-border bg-base-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-base-border text-[11px] uppercase tracking-wide text-text-muted">
                <th className="px-4 py-3 font-medium">Mahsulot</th>
                <th className="px-4 py-3 font-medium">Kategoriya</th>
                <th className="px-4 py-3 font-medium">Narx</th>
                <th className="px-4 py-3 font-medium">Qoldiq</th>
                <th className="px-4 py-3 font-medium">Filial</th>
                <th className="px-4 py-3 font-medium">Bugungi savdo</th>
                <th className="px-4 py-3 font-medium">Oylik savdo</th>
                <th className="px-4 py-3 font-medium">Holat</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: InventoryRow, i) => (
                <tr
                  key={`${row.productId}-${row.branch}`}
                  onClick={() => setSelectedProductId(row.productId)}
                  className={`cursor-pointer border-b border-base-border/60 text-text-primary/90 transition-colors hover:bg-white/[0.03] ${i === rows.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3 text-text-muted">{row.category}</td>
                  <td className="tabular-nums px-4 py-3">{formatSum(row.price)}</td>
                  <td className="tabular-nums px-4 py-3">{row.stock} dona</td>
                  <td className="px-4 py-3 text-text-muted">{row.branch}</td>
                  <td className="tabular-nums px-4 py-3">{row.salesToday}</td>
                  <td className="tabular-nums px-4 py-3">{row.salesMonth}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-text-muted">
                    Filtrlarga mos mahsulot topilmadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProductId(null)}
              className="fixed inset-0 z-40 bg-black/60"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed right-0 top-0 z-50 h-screen w-full max-w-md overflow-y-auto border-l border-base-border bg-base-panel-deep p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-text-muted">{selectedProduct.brand} · {selectedProduct.category}</p>
                  <h2 className="mt-1 text-lg font-semibold text-text-primary">{selectedProduct.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedProductId(null)}
                  className="rounded-lg border border-base-border p-1.5 text-text-muted hover:text-text-primary"
                >
                  <X className="h-4 w-4" size={16} />
                </button>
              </div>

              <p className="tabular-nums mt-4 text-2xl font-semibold text-text-primary">{formatSum(selectedProduct.price)}</p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {[
                  ['Xotira', selectedProduct.storage],
                  ['Kamera', selectedProduct.camera],
                  ['Batareya', selectedProduct.battery],
                  ['Ekran', selectedProduct.display],
                  ['Chip', selectedProduct.chip],
                ]
                  .filter(([, v]) => v)
                  .map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-base-border bg-black/20 px-3 py-2">
                      <p className="text-[11px] text-text-muted">{label}</p>
                      <p className="mt-0.5 text-xs font-medium text-text-primary">{value}</p>
                    </div>
                  ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-base-border bg-black/20 px-3 py-2">
                  <p className="text-[11px] text-text-muted">Bugungi savdo</p>
                  <p className="tabular-nums mt-0.5 text-sm font-semibold text-text-primary">{totalSalesToday(selectedProduct)} dona</p>
                </div>
                <div className="rounded-lg border border-base-border bg-black/20 px-3 py-2">
                  <p className="text-[11px] text-text-muted">Oylik savdo</p>
                  <p className="tabular-nums mt-0.5 text-sm font-semibold text-text-primary">{totalSalesMonth(selectedProduct)} dona</p>
                </div>
              </div>

              <p className="mt-6 text-xs font-medium uppercase tracking-wide text-text-muted">Filiallar bo'yicha qoldiq</p>
              <div className="mt-2.5 space-y-2">
                {BRANCHES.map((b) => {
                  const stock = selectedProduct.stockByBranch[b]
                  const st = stock <= 0 ? 'Tugagan' : stock <= 5 ? 'Kam qoldi' : 'Yaxshi'
                  return (
                    <div key={b} className="flex items-center justify-between rounded-lg border border-base-border bg-black/20 px-3 py-2">
                      <span className="text-xs text-text-primary">{b}</span>
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[st as StockStatus]}`}>
                        {stock} dona
                      </span>
                    </div>
                  )
                })}
              </div>

              {totalStock(selectedProduct) <= 10 && (
                <div className="mt-5 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2.5">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" size={14} />
                  <p className="text-xs text-amber-200/90">
                    Jami qoldiq {totalStock(selectedProduct)} dona — qayta buyurtma qilishni ko'rib chiqing.
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

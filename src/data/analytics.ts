import type {
  AiInsight,
  Branch,
  BranchStat,
  CategoryStat,
  InventoryRow,
  Product,
  RevenuePoint,
  StockStatus,
} from '../types'
import { BRANCHES, CATEGORIES, PRODUCTS } from './products'

export const LOW_STOCK_THRESHOLD = 5

export function totalStock(product: Product): number {
  return BRANCHES.reduce((sum, b) => sum + product.stockByBranch[b], 0)
}

export function totalSalesToday(product: Product): number {
  return BRANCHES.reduce((sum, b) => sum + product.salesByBranch[b].today, 0)
}

export function totalSalesMonth(product: Product): number {
  return BRANCHES.reduce((sum, b) => sum + product.salesByBranch[b].month, 0)
}

export function revenueToday(product: Product): number {
  return totalSalesToday(product) * product.price
}

export function revenueMonth(product: Product): number {
  return totalSalesMonth(product) * product.price
}

export function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return 'Tugagan'
  if (stock <= LOW_STOCK_THRESHOLD) return 'Kam qoldi'
  return 'Yaxshi'
}

export function getFlattenedInventory(): InventoryRow[] {
  const rows: InventoryRow[] = []
  for (const product of PRODUCTS) {
    for (const branch of BRANCHES) {
      const stock = product.stockByBranch[branch]
      const sales = product.salesByBranch[branch]
      rows.push({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        branch,
        stock,
        salesToday: sales.today,
        salesMonth: sales.month,
        status: stockStatus(stock),
      })
    }
  }
  return rows
}

export function getLowStockRows(): InventoryRow[] {
  return getFlattenedInventory()
    .filter((row) => row.stock <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock)
}

export function getTodayKpis() {
  const revenue = PRODUCTS.reduce((sum, p) => sum + revenueToday(p), 0)
  const salesCount = PRODUCTS.reduce((sum, p) => sum + totalSalesToday(p), 0)
  const averageOrderValue = salesCount > 0 ? revenue / salesCount : 0
  const activeCustomers = Math.round(salesCount * 3.1 + 42)

  return { revenue, salesCount, averageOrderValue, activeCustomers }
}

export function getBranchStats(): BranchStat[] {
  return BRANCHES.map((branch) => {
    let revenue = 0
    let sales = 0
    let stockUnits = 0

    for (const product of PRODUCTS) {
      const branchSales = product.salesByBranch[branch]
      revenue += branchSales.today * product.price
      sales += branchSales.today
      stockUnits += product.stockByBranch[branch]
    }

    const conversion = Math.round((sales / Math.max(sales + stockUnits, 1)) * 100 * 2.4)

    return { branch, revenue, sales, conversion: Math.min(conversion, 98), stockUnits }
  })
}

export function getCategoryStats(): CategoryStat[] {
  const totals = CATEGORIES.map((category) => {
    const value = PRODUCTS.filter((p) => p.category === category).reduce(
      (sum, p) => sum + revenueMonth(p),
      0,
    )
    return { category, value }
  })

  const sum = totals.reduce((acc, t) => acc + t.value, 0) || 1

  return totals.map((t) => ({ category: t.category, value: Math.round((t.value / sum) * 100) }))
}

const TREND_WEIGHTS = [0.62, 0.74, 0.68, 0.83, 0.9, 1.08, 1.0]
const TREND_LABELS = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak']

export function getRevenueTrend(): RevenuePoint[] {
  const today = getTodayKpis().revenue
  const base = today / TREND_WEIGHTS[TREND_WEIGHTS.length - 1]

  return TREND_LABELS.map((day, i) => ({
    day,
    revenue: Math.round(base * TREND_WEIGHTS[i]),
  }))
}

export function getTopProductToday(): { product: Product; sales: number; revenue: number } | null {
  let best: { product: Product; sales: number; revenue: number } | null = null
  for (const product of PRODUCTS) {
    const sales = totalSalesToday(product)
    const revenue = sales * product.price
    if (!best || revenue > best.revenue) {
      best = { product, sales, revenue }
    }
  }
  return best
}

export function getBranchRanking(): BranchStat[] {
  return [...getBranchStats()].sort((a, b) => b.revenue - a.revenue)
}

export function getBranchStat(branch: Branch): BranchStat | undefined {
  return getBranchStats().find((b) => b.branch === branch)
}

export function getBranchLowStock(branch: Branch): InventoryRow[] {
  return getLowStockRows().filter((row) => row.branch === branch)
}

export function getCategoryRanking(): CategoryStat[] {
  return [...getCategoryStats()].sort((a, b) => b.value - a.value)
}

export function getProductsNotSellingRecently(): Product[] {
  return PRODUCTS.filter((p) => totalSalesMonth(p) <= 6).sort(
    (a, b) => totalSalesMonth(a) - totalSalesMonth(b),
  )
}

export function getReorderCandidates(): Product[] {
  return PRODUCTS.filter((p) => totalStock(p) <= LOW_STOCK_THRESHOLD * 2 && totalSalesMonth(p) >= 20).sort(
    (a, b) => totalStock(a) - totalStock(b),
  )
}

export function generateHomeInsights(): AiInsight[] {
  const insights: AiInsight[] = []
  const top = getTopProductToday()
  const branches = getBranchRanking()
  const lowStock = getLowStockRows()

  if (top) {
    insights.push({
      id: 'top-product',
      title: `${top.product.name} bugun eng ko'p sotilgan mahsulot (${top.sales} dona)`,
      type: 'positive',
    })
  }

  if (lowStock.length > 0) {
    insights.push({
      id: 'low-stock',
      title: `${lowStock.length} ta mahsulot qoldig'i kritik darajada kamaygan`,
      type: 'warning',
    })
  }

  const worstBranch = branches[branches.length - 1]
  if (worstBranch) {
    insights.push({
      id: 'worst-branch',
      title: `${worstBranch.branch} bugungi savdosi odatdagidan past (konversiya ${worstBranch.conversion}%)`,
      type: 'negative',
    })
  }

  const bestBranch = branches[0]
  if (bestBranch) {
    insights.push({
      id: 'best-branch',
      title: `${bestBranch.branch} bugun eng yuqori daromadli filial bo'lmoqda`,
      type: 'positive',
    })
  }

  return insights
}

import type { Branch, Product } from '../types'
import { PRODUCTS } from '../data/products'
import {
  getBranchLowStock,
  getBranchRanking,
  getBranchStat,
  getCategoryRanking,
  getLowStockRows,
  getProductsNotSellingRecently,
  getReorderCandidates,
  getRevenueTrend,
  getTodayKpis,
  getTopProductToday,
  totalSalesMonth,
  totalStock,
} from '../data/analytics'
import { formatSum } from '../lib/format'

export type IntentKey =
  | 'TODAY_REVENUE'
  | 'TOP_PRODUCT'
  | 'BEST_BRANCH'
  | 'BRANCH_STATUS'
  | 'LOW_STOCK'
  | 'CATEGORY_PERFORMANCE'
  | 'SALES_COUNT'
  | 'AVERAGE_ORDER'
  | 'PRODUCT_SEARCH'
  | 'GENERAL_BUSINESS_SUMMARY'
  | 'REORDER'
  | 'STALE_PRODUCTS'
  | 'UNKNOWN'

export interface AIBlockKpi {
  type: 'kpi'
  items: { label: string; value: string }[]
}
export interface AIBlockChart {
  type: 'chart'
  chartType: 'bar' | 'line'
  unit: 'currency' | 'percent'
  data: { label: string; value: number }[]
}
export interface AIBlockProductList {
  type: 'productList'
  items: { name: string; branch?: string; stock?: number; extra?: string }[]
}
export interface AIBlockBranchComparison {
  type: 'branchComparison'
  items: { branch: string; revenue: number; sales: number; conversion: number }[]
}
export interface AIBlockWarning {
  type: 'warning'
  text: string
}
export interface AIBlockRecommendation {
  type: 'recommendation'
  text: string
}

export type AIBlock =
  | AIBlockKpi
  | AIBlockChart
  | AIBlockProductList
  | AIBlockBranchComparison
  | AIBlockWarning
  | AIBlockRecommendation

export interface AIResponse {
  intent: IntentKey
  summary: string
  blocks: AIBlock[]
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ʻʼ'`’‘]/g, '')
    .replace(/[^a-z0-9Ѐ-ӿ\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function hasAny(q: string, ...words: string[]): boolean {
  return words.some((w) => q.includes(w))
}

function hasAll(q: string, ...words: string[]): boolean {
  return words.every((w) => q.includes(w))
}

function findBranch(q: string): Branch | undefined {
  if (q.includes('gijduvon') && q.includes('bek')) return "G'ijduvon Bek"
  if (q.includes('gijduvon') && q.includes('markaz')) return "G'ijduvon Markaz"
  if (q.includes('shofirkon')) return 'Shofirkon'
  if (q.includes('qiziltepa')) return 'Qiziltepa'
  return undefined
}

const BRAND_MATCHERS: [string, (p: Product) => boolean][] = [
  ['iphone', (p) => p.name.toLowerCase().includes('iphone')],
  ['macbook', (p) => p.name.toLowerCase().includes('macbook')],
  ['apple', (p) => p.brand === 'Apple'],
  ['galaxy', (p) => p.name.toLowerCase().includes('galaxy')],
  ['samsung', (p) => p.brand === 'Samsung'],
  ['redmi', (p) => p.name.toLowerCase().includes('redmi')],
  ['poco', (p) => p.name.toLowerCase().includes('poco')],
  ['xiaomi', (p) => p.brand === 'Xiaomi'],
  ['asus', (p) => p.brand === 'Asus'],
  ['lenovo', (p) => p.brand === 'Lenovo'],
  ['hp', (p) => p.brand === 'HP'],
  ['noutbuk', (p) => p.category === 'Noutbuklar'],
  ['laptop', (p) => p.category === 'Noutbuklar'],
  ['airpods', (p) => p.name.toLowerCase().includes('airpods')],
  ['powerbank', (p) => p.name.toLowerCase().includes('powerbank')],
  ['zaryad', (p) => p.name.toLowerCase().includes('zaryad')],
  ['aksessuar', (p) => p.category === 'Aksessuarlar'],
]

function searchProducts(q: string): Product[] {
  for (const [keyword, predicate] of BRAND_MATCHERS) {
    if (q.includes(keyword)) {
      const matches = PRODUCTS.filter(predicate)
      if (matches.length > 0) return matches
    }
  }
  return PRODUCTS.filter((p) => q.includes(normalize(p.name.split(' ')[0])))
}

function unknownResponse(): AIResponse {
  return {
    intent: 'UNKNOWN',
    summary:
      "Bu savolni hozircha aniq tahlil qila olmadim. Savdo, filial, mahsulot yoki qoldiq haqida so'rashingiz mumkin.",
    blocks: [],
  }
}

function buildTodayRevenue(branch?: Branch): AIResponse {
  if (branch) {
    const stat = getBranchStat(branch)!
    return {
      intent: 'TODAY_REVENUE',
      summary: `${branch} filialida bugungi daromad ${formatSum(stat.revenue)}, ${stat.sales} ta savdo orqali.`,
      blocks: [
        {
          type: 'kpi',
          items: [
            { label: `${branch} daromadi`, value: formatSum(stat.revenue) },
            { label: 'Savdolar soni', value: `${stat.sales} ta` },
          ],
        },
      ],
    }
  }

  const kpis = getTodayKpis()
  return {
    intent: 'TODAY_REVENUE',
    summary: `Bugungi umumiy daromad ${formatSum(kpis.revenue)}. Jami ${kpis.salesCount} ta savdo amalga oshirildi.`,
    blocks: [
      {
        type: 'kpi',
        items: [
          { label: 'Bugungi daromad', value: formatSum(kpis.revenue) },
          { label: 'Savdolar soni', value: `${kpis.salesCount} ta` },
        ],
      },
      {
        type: 'chart',
        chartType: 'line',
        unit: 'currency',
        data: getRevenueTrend().map((r) => ({ label: r.day, value: r.revenue })),
      },
    ],
  }
}

function buildTopProduct(branch?: Branch): AIResponse {
  if (branch) {
    let best: { product: Product; sales: number } | null = null
    for (const p of PRODUCTS) {
      const sales = p.salesByBranch[branch].today
      if (!best || sales > best.sales) best = { product: p, sales }
    }
    if (!best || best.sales === 0) {
      return {
        intent: 'TOP_PRODUCT',
        summary: `${branch} filialida bugun hali sezilarli savdo qayd etilmagan.`,
        blocks: [],
      }
    }
    return {
      intent: 'TOP_PRODUCT',
      summary: `${branch} filialida bugun eng ko'p sotilgan mahsulot — ${best.product.name} (${best.sales} dona).`,
      blocks: [
        {
          type: 'productList',
          items: [{ name: best.product.name, extra: `${best.sales} dona · ${branch}` }],
        },
      ],
    }
  }

  const top = getTopProductToday()
  if (!top || top.sales === 0) {
    return { intent: 'TOP_PRODUCT', summary: 'Bugun hali sezilarli savdo qayd etilmagan.', blocks: [] }
  }
  return {
    intent: 'TOP_PRODUCT',
    summary: `Bugun eng ko'p sotilgan mahsulot — ${top.product.name}: ${top.sales} dona, ${formatSum(top.revenue)} daromad keltirdi.`,
    blocks: [
      {
        type: 'productList',
        items: [{ name: top.product.name, extra: `${top.sales} dona · ${formatSum(top.revenue)}` }],
      },
    ],
  }
}

function buildBestBranch(): AIResponse {
  const ranking = getBranchRanking()
  const best = ranking[0]
  return {
    intent: 'BEST_BRANCH',
    summary: `${best.branch} eng yaxshi ishlayotgan filial: bugun ${formatSum(best.revenue)} daromad, ${best.sales} ta savdo, konversiya ${best.conversion}%.`,
    blocks: [
      {
        type: 'branchComparison',
        items: ranking.map((b) => ({ branch: b.branch, revenue: b.revenue, sales: b.sales, conversion: b.conversion })),
      },
    ],
  }
}

function buildBranchStatus(branch: Branch): AIResponse {
  const stat = getBranchStat(branch)!
  const lowStock = getBranchLowStock(branch)
  const summary = `${branch} filialida bugun ${formatSum(stat.revenue)} daromad, ${stat.sales} ta savdo, konversiya ${stat.conversion}%. ${
    lowStock.length > 0
      ? `${lowStock.length} ta mahsulot qoldig'i kam yoki tugagan.`
      : "Qoldiqlar barqaror darajada."
  }`

  const blocks: AIBlock[] = [
    {
      type: 'kpi',
      items: [
        { label: 'Daromad', value: formatSum(stat.revenue) },
        { label: 'Savdolar', value: `${stat.sales} ta` },
        { label: 'Konversiya', value: `${stat.conversion}%` },
      ],
    },
  ]

  if (lowStock.length > 0) {
    blocks.push({
      type: 'warning',
      text: `${lowStock.length} ta mahsulot qoldig'i kam: ${lowStock
        .slice(0, 3)
        .map((r) => r.name)
        .join(', ')}.`,
    })
  }

  return { intent: 'BRANCH_STATUS', summary, blocks }
}

function buildLowStock(branch?: Branch): AIResponse {
  const rows = branch ? getBranchLowStock(branch) : getLowStockRows()

  if (rows.length === 0) {
    return {
      intent: 'LOW_STOCK',
      summary: branch
        ? `${branch} filialida hozircha qoldig'i kam mahsulot yo'q.`
        : "Hozircha qoldig'i kam mahsulot yo'q.",
      blocks: [],
    }
  }

  const summary = branch
    ? `${branch} filialida ${rows.length} ta mahsulot qoldig'i kam yoki tugagan.`
    : `${rows.length} ta mahsulot qoldig'i kam yoki tugagan. Eng kritiklari: ${rows
        .slice(0, 3)
        .map((r) => r.name)
        .join(', ')}.`

  return {
    intent: 'LOW_STOCK',
    summary,
    blocks: [
      {
        type: 'productList',
        items: rows.slice(0, 6).map((r) => ({ name: r.name, branch: r.branch, stock: r.stock, extra: r.status })),
      },
    ],
  }
}

function buildCategoryPerformance(): AIResponse {
  const ranking = getCategoryRanking()
  const best = ranking[0]
  return {
    intent: 'CATEGORY_PERFORMANCE',
    summary: `${best.category} kategoriyasi oylik daromadning ${best.value}% ulushini tashkil qiladi — eng yuqori ko'rsatkich.`,
    blocks: [
      { type: 'chart', chartType: 'bar', unit: 'percent', data: ranking.map((r) => ({ label: r.category, value: r.value })) },
    ],
  }
}

function buildSalesCount(branch?: Branch): AIResponse {
  if (branch) {
    const stat = getBranchStat(branch)!
    return {
      intent: 'SALES_COUNT',
      summary: `${branch} filialida bugun ${stat.sales} ta savdo amalga oshirildi.`,
      blocks: [{ type: 'kpi', items: [{ label: 'Savdolar soni', value: `${stat.sales} ta` }] }],
    }
  }
  const kpis = getTodayKpis()
  return {
    intent: 'SALES_COUNT',
    summary: `Bugun jami ${kpis.salesCount} ta savdo amalga oshirildi.`,
    blocks: [{ type: 'kpi', items: [{ label: 'Savdolar soni', value: `${kpis.salesCount} ta` }] }],
  }
}

function buildAverageOrder(branch?: Branch): AIResponse {
  if (branch) {
    const stat = getBranchStat(branch)!
    const avg = stat.sales > 0 ? stat.revenue / stat.sales : 0
    return {
      intent: 'AVERAGE_ORDER',
      summary: `${branch} filialida bugungi o'rtacha chek ${formatSum(avg)}.`,
      blocks: [{ type: 'kpi', items: [{ label: "O'rtacha chek", value: formatSum(avg) }] }],
    }
  }
  const kpis = getTodayKpis()
  return {
    intent: 'AVERAGE_ORDER',
    summary: `Bugungi o'rtacha chek ${formatSum(kpis.averageOrderValue)}.`,
    blocks: [{ type: 'kpi', items: [{ label: "O'rtacha chek", value: formatSum(kpis.averageOrderValue) }] }],
  }
}

function buildReorder(): AIResponse {
  const candidates = getReorderCandidates()
  if (candidates.length === 0) {
    return { intent: 'REORDER', summary: "Hozircha qayta buyurtma talab qiladigan mahsulot yo'q.", blocks: [] }
  }
  return {
    intent: 'REORDER',
    summary: `${candidates.length} ta mahsulotni qayta buyurtma qilish tavsiya etiladi — savdosi yaxshi, ammo qoldig'i kam.`,
    blocks: [
      {
        type: 'productList',
        items: candidates
          .slice(0, 6)
          .map((p) => ({ name: p.name, extra: `Qoldiq: ${totalStock(p)} dona · Oylik savdo: ${totalSalesMonth(p)} dona` })),
      },
      { type: 'recommendation', text: 'Ushbu mahsulotlarni tezroq buyurtma qilish savdo yo\'qotishning oldini oladi.' },
    ],
  }
}

function buildStaleProducts(): AIResponse {
  const stale = getProductsNotSellingRecently()
  if (stale.length === 0) {
    return { intent: 'STALE_PRODUCTS', summary: 'Barcha mahsulotlar barqaror sotilmoqda.', blocks: [] }
  }
  return {
    intent: 'STALE_PRODUCTS',
    summary: `${stale.length} ta mahsulot so'nggi oyda deyarli sotilmagan.`,
    blocks: [
      {
        type: 'productList',
        items: stale.slice(0, 6).map((p) => ({ name: p.name, extra: `Oylik savdo: ${totalSalesMonth(p)} dona` })),
      },
    ],
  }
}

function buildProductSearch(q: string): AIResponse {
  const matches = searchProducts(q)
  if (matches.length === 0) return unknownResponse()

  const ranked = [...matches].sort((a, b) => totalSalesMonth(b) - totalSalesMonth(a)).slice(0, 5)

  return {
    intent: 'PRODUCT_SEARCH',
    summary: `"${q}" bo'yicha ${matches.length} ta mahsulot topildi. Eng mashhuri: ${ranked[0].name} — ${formatSum(ranked[0].price)}.`,
    blocks: [
      {
        type: 'productList',
        items: ranked.map((p) => ({ name: p.name, extra: `${formatSum(p.price)} · Jami qoldiq: ${totalStock(p)} dona` })),
      },
    ],
  }
}

function buildGeneralSummary(): AIResponse {
  const kpis = getTodayKpis()
  const top = getTopProductToday()
  const ranking = getBranchRanking()
  const lowStock = getLowStockRows()
  const best = ranking[0]
  const worst = ranking[ranking.length - 1]

  const parts: string[] = [`Bugungi daromad ${formatSum(kpis.revenue)}, jami ${kpis.salesCount} ta savdo.`]
  if (top) parts.push(`Eng ko'p sotilgan mahsulot — ${top.product.name}.`)
  if (best) parts.push(`${best.branch} eng yaxshi natija ko'rsatmoqda.`)
  if (worst && worst.branch !== best?.branch) parts.push(`${worst.branch} filialiga e'tibor qaratish tavsiya etiladi.`)
  if (lowStock.length > 0) parts.push(`${lowStock.length} ta mahsulot qoldig'i kam.`)

  const blocks: AIBlock[] = [
    {
      type: 'kpi',
      items: [
        { label: 'Daromad', value: formatSum(kpis.revenue) },
        { label: 'Savdolar', value: `${kpis.salesCount} ta` },
        { label: "O'rtacha chek", value: formatSum(kpis.averageOrderValue) },
      ],
    },
    {
      type: 'branchComparison',
      items: ranking.map((b) => ({ branch: b.branch, revenue: b.revenue, sales: b.sales, conversion: b.conversion })),
    },
  ]

  if (lowStock.length > 0) {
    blocks.push({
      type: 'warning',
      text: `${lowStock.length} ta mahsulot qoldig'i kam yoki tugagan — birinchi navbatda ${lowStock[0].name}.`,
    })
  }

  return { intent: 'GENERAL_BUSINESS_SUMMARY', summary: parts.join(' '), blocks }
}

export function getAIResponse(rawQuery: string): AIResponse {
  const q = normalize(rawQuery)
  if (!q) return unknownResponse()

  const branch = findBranch(q)

  if (hasAny(q, 'sotilmayapti', 'sotilmagan', 'harakatsiz')) return buildStaleProducts()
  if (hasAny(q, 'buyurtma')) return buildReorder()
  if (hasAny(q, 'qoldi', 'qolgan', 'tugagan', 'zaxira')) return buildLowStock(branch)
  if (hasAll(q, 'eng', 'kop') && hasAny(q, 'sot')) return buildTopProduct(branch)
  if (!branch && q.includes('filial') && hasAny(q, 'yaxshi', 'eng', 'ishlayapti')) return buildBestBranch()
  if (hasAny(q, 'kategoriya', 'turkum')) return buildCategoryPerformance()
  if (hasAny(q, 'necha', 'nechta')) return buildSalesCount(branch)
  if (hasAny(q, 'ortacha chek', 'ortacha buyurtma', 'average order')) return buildAverageOrder(branch)
  if (hasAny(q, 'daromad', 'tushum', 'foyda')) return buildTodayRevenue(branch)
  if (hasAny(q, 'etibor', 'umumiy holat', 'biznes qanday', 'holat qanday')) return buildGeneralSummary()
  if (branch) return buildBranchStatus(branch)

  const searchResult = buildProductSearch(q)
  if (searchResult.intent !== 'UNKNOWN') return searchResult

  return unknownResponse()
}

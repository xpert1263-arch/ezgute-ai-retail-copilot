import type { Branch, Category, Product } from '../types'
import { BRANCHES, PRODUCTS } from '../data/products'
import { totalStock } from '../data/analytics'
import { formatSum } from '../lib/format'

export interface ParsedRequest {
  budget?: number
  category?: Category
  brand?: string
  wantsCamera: boolean
  wantsBattery: boolean
  storage?: string
}

export interface ScoredProduct {
  product: Product
  score: number
  matchPercent: number
  reasons: string[]
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ʻʼ'`’‘]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseBudget(text: string): number | undefined {
  const lower = normalize(text)

  const millionMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(mln|million|milion)/)
  if (millionMatch) {
    return Math.round(parseFloat(millionMatch[1].replace(',', '.')) * 1_000_000)
  }

  const mingMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*ming/)
  if (mingMatch) {
    return Math.round(parseFloat(mingMatch[1].replace(',', '.')) * 1_000)
  }

  const rawNumberMatch = lower.match(/(\d[\d\s.,]{5,})\s*som/) ?? lower.match(/(\d[\d\s.,]{5,})/)
  if (rawNumberMatch) {
    const digits = rawNumberMatch[1].replace(/[^\d]/g, '')
    if (digits.length >= 6) return parseInt(digits, 10)
  }

  return undefined
}

function detectCategoryAndBrand(text: string): { category?: Category; brand?: string } {
  const lower = normalize(text)

  if (lower.includes('macbook')) return { category: 'Noutbuklar', brand: 'Apple' }
  if (lower.includes('noutbuk') || lower.includes('laptop')) return { category: 'Noutbuklar' }
  if (lower.includes('airpods') || lower.includes('quloqchin') || lower.includes('powerbank') || lower.includes('aksessuar')) {
    return { category: 'Aksessuarlar' }
  }
  if (lower.includes('iphone')) return { category: 'Apple', brand: 'Apple' }
  if (lower.includes('samsung') || lower.includes('galaxy')) return { category: 'Samsung', brand: 'Samsung' }
  if (lower.includes('xiaomi') || lower.includes('redmi') || lower.includes('poco')) return { category: 'Xiaomi', brand: 'Xiaomi' }
  if (lower.includes('apple')) return { brand: 'Apple' }

  return {}
}

function parseStorage(text: string): string | undefined {
  const match = text.toLowerCase().match(/(\d{2,4})\s*gb/)
  return match ? `${match[1]}GB` : undefined
}

export function parseCustomerRequest(text: string): ParsedRequest {
  const lower = normalize(text)
  const { category, brand } = detectCategoryAndBrand(text)

  return {
    budget: parseBudget(text),
    category,
    brand,
    wantsCamera: lower.includes('kamera'),
    wantsBattery: lower.includes('batareya') || lower.includes('zaryad'),
    storage: parseStorage(text),
  }
}

function extractMegapixels(camera?: string): number {
  if (!camera) return 0
  const match = camera.match(/(\d+)\s*mp/i)
  return match ? parseInt(match[1], 10) : 0
}

function extractHours(battery?: string): number {
  if (!battery) return 0
  const match = battery.match(/(\d+)\s*soat/)
  return match ? parseInt(match[1], 10) : 0
}

function scoreProduct(product: Product, request: ParsedRequest): ScoredProduct {
  let score = 40
  const reasons: string[] = []
  const stock = totalStock(product)

  if (stock <= 0) score -= 60

  if (request.budget) {
    const diffRatio = (product.price - request.budget) / request.budget
    if (diffRatio <= 0) {
      const closeness = 1 - Math.min(Math.abs(diffRatio), 1)
      score += 30 * closeness
      if (diffRatio > -0.15) reasons.push('narxi belgilagan budjetga juda mos')
    } else {
      score -= Math.min(diffRatio, 1.5) * 45
      if (diffRatio < 0.12) reasons.push('narxi budjetdan sal yuqori, lekin yaqin variant')
    }
  }

  if (request.wantsCamera) {
    const mp = extractMegapixels(product.camera)
    if (mp >= 48) {
      score += 15
      reasons.push(`kamerasi kuchli (${product.camera})`)
    } else if (mp > 0) {
      score += 5
    }
  }

  if (request.wantsBattery) {
    const hours = extractHours(product.battery)
    if (hours >= 24) {
      score += 15
      reasons.push(`batareyasi uzoq ishlaydi (${product.battery})`)
    } else if (hours > 0) {
      score += 5
    }
  }

  if (request.brand && product.brand.toLowerCase() === request.brand.toLowerCase()) {
    score += 10
    reasons.push(`${request.brand} brendiga mos`)
  }

  if (request.storage && product.storage?.toLowerCase().includes(request.storage.toLowerCase())) {
    score += 8
    reasons.push(`${request.storage} xotira hajmi`)
  }

  if (stock > 0) {
    reasons.push('hozirda do\'konda mavjud')
  }

  const matchPercent = Math.max(30, Math.min(96, Math.round(score)))
  return { product, score, matchPercent, reasons }
}

export function getRecommendations(request: ParsedRequest, limit = 3): ScoredProduct[] {
  const pool = PRODUCTS.filter((p) => {
    if (request.category) return p.category === request.category
    if (request.brand) return p.brand === request.brand
    return p.category === 'Apple' || p.category === 'Samsung' || p.category === 'Xiaomi'
  })

  return pool
    .map((p) => scoreProduct(p, request))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function bestBranchForStock(product: Product): { branch: Branch; stock: number } {
  return [...BRANCHES]
    .map((branch) => ({ branch, stock: product.stockByBranch[branch] }))
    .sort((a, b) => b.stock - a.stock)[0]
}

export function generatePitch(scored: ScoredProduct): string {
  const { product, reasons } = scored
  const branch = bestBranchForStock(product)
  const reasonText = reasons.length > 0 ? reasons.slice(0, 2).join(', ') : 'talablaringizga mos xususiyatlarga ega'

  if (branch.stock <= 0) {
    return `Siz uchun ${product.name} yaxshi variant: ${reasonText}. Narxi ${formatSum(product.price)}. Hozircha barcha filiallarda qoldiq tugagan, yetkazib berish muddatini aniqlashtirish kerak.`
  }

  return `Siz uchun ${product.name} yaxshi variant: ${reasonText}. Narxi ${formatSum(product.price)}, hozir ${branch.branch} filialida ${branch.stock} dona mavjud.`
}

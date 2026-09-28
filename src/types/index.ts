export type Branch =
  | "G'ijduvon Bek"
  | "G'ijduvon Markaz"
  | 'Shofirkon'
  | 'Qiziltepa'

export type Category = 'Apple' | 'Samsung' | 'Xiaomi' | 'Noutbuklar' | 'Aksessuarlar'

export type BranchSales = Record<Branch, { today: number; month: number }>
export type BranchStock = Record<Branch, number>

export interface Product {
  id: string
  name: string
  brand: string
  category: Category
  price: number
  storage?: string
  camera?: string
  battery?: string
  display?: string
  chip?: string
  specs: string[]
  stockByBranch: BranchStock
  salesByBranch: BranchSales
}

export type StockStatus = 'Yaxshi' | 'Kam qoldi' | 'Tugagan'

export interface InventoryRow {
  productId: string
  name: string
  brand: string
  category: Category
  price: number
  branch: Branch
  stock: number
  salesToday: number
  salesMonth: number
  status: StockStatus
}

export interface BranchStat {
  branch: Branch
  revenue: number
  sales: number
  conversion: number
  stockUnits: number
}

export interface RevenuePoint {
  day: string
  revenue: number
}

export interface CategoryStat {
  category: Category
  value: number
}

export interface AiInsight {
  id: string
  title: string
  type: 'positive' | 'warning' | 'negative'
}

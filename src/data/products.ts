import type { Branch, BranchSales, BranchStock, Category, Product } from '../types'

export const BRANCHES: Branch[] = [
  "G'ijduvon Bek",
  "G'ijduvon Markaz",
  'Shofirkon',
  'Qiziltepa',
]

export const CATEGORIES: Category[] = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'Noutbuklar',
  'Aksessuarlar',
]

export const CURRENT_USER_NAME = 'Mirjahon'

interface BaseProduct {
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
  demand: number
}

const BASE_PRODUCTS: BaseProduct[] = [
  {
    name: 'iPhone 17 Pro Max 256GB',
    brand: 'Apple',
    category: 'Apple',
    price: 21_000_000,
    storage: '256GB',
    camera: '48MP Pro triple kamera',
    battery: '33 soat video',
    display: '6.9" Super Retina XDR',
    chip: 'A19 Pro',
    specs: ['48MP Pro kamera', 'Batareya: 33 soat', 'A19 Pro chip', 'Titanium korpus'],
    demand: 1.4,
  },
  {
    name: 'iPhone 16 Pro 128GB',
    brand: 'Apple',
    category: 'Apple',
    price: 15_500_000,
    storage: '128GB',
    camera: '48MP Pro kamera',
    battery: '27 soat video',
    display: '6.3" Super Retina XDR',
    chip: 'A18 Pro',
    specs: ['48MP kamera', 'Batareya: 27 soat', 'A18 Pro chip'],
    demand: 1.2,
  },
  {
    name: 'iPhone 16 128GB',
    brand: 'Apple',
    category: 'Apple',
    price: 11_800_000,
    storage: '128GB',
    camera: '48MP kamera',
    battery: '22 soat video',
    display: '6.1" Super Retina XDR',
    chip: 'A18',
    specs: ['48MP kamera', 'Batareya: 22 soat', 'A18 chip'],
    demand: 1.6,
  },
  {
    name: 'iPhone 15 128GB',
    brand: 'Apple',
    category: 'Apple',
    price: 9_800_000,
    storage: '128GB',
    camera: '48MP kamera',
    battery: '20 soat video',
    display: '6.1" Super Retina XDR',
    chip: 'A16',
    specs: ['48MP kamera', 'Batareya: 20 soat', 'A16 chip'],
    demand: 1.3,
  },
  {
    name: 'iPhone SE 4 128GB',
    brand: 'Apple',
    category: 'Apple',
    price: 7_200_000,
    storage: '128GB',
    camera: '12MP kamera',
    battery: '18 soat video',
    display: '6.1" Retina',
    chip: 'A18',
    specs: ['12MP kamera', 'Batareya: 18 soat', 'A18 chip'],
    demand: 0.8,
  },
  {
    name: 'Samsung Galaxy S24 Ultra 512GB',
    brand: 'Samsung',
    category: 'Samsung',
    price: 18_500_000,
    storage: '512GB',
    camera: '200MP kamera',
    battery: '28 soat video',
    display: '6.8" Dynamic AMOLED',
    chip: 'Snapdragon 8 Gen 3',
    specs: ['200MP kamera', 'Batareya: 28 soat', 'S Pen', 'Snapdragon 8 Gen 3'],
    demand: 1.1,
  },
  {
    name: 'Samsung Galaxy S24 256GB',
    brand: 'Samsung',
    category: 'Samsung',
    price: 11_900_000,
    storage: '256GB',
    camera: '50MP kamera',
    battery: '24 soat video',
    display: '6.2" Dynamic AMOLED',
    chip: 'Snapdragon 8 Gen 3',
    specs: ['50MP kamera', 'Batareya: 24 soat', 'Snapdragon 8 Gen 3'],
    demand: 1.0,
  },
  {
    name: 'Samsung Galaxy A55 128GB',
    brand: 'Samsung',
    category: 'Samsung',
    price: 5_900_000,
    storage: '128GB',
    camera: '50MP kamera',
    battery: '26 soat video',
    display: '6.6" AMOLED',
    chip: 'Exynos 1480',
    specs: ['50MP kamera', 'Batareya: 26 soat', 'AMOLED ekran'],
    demand: 1.5,
  },
  {
    name: 'Samsung Galaxy A35 128GB',
    brand: 'Samsung',
    category: 'Samsung',
    price: 4_600_000,
    storage: '128GB',
    camera: '50MP kamera',
    battery: '25 soat video',
    display: '6.6" AMOLED',
    chip: 'Exynos 1380',
    specs: ['50MP kamera', 'Batareya: 25 soat'],
    demand: 1.3,
  },
  {
    name: 'Xiaomi 14 256GB',
    brand: 'Xiaomi',
    category: 'Xiaomi',
    price: 10_400_000,
    storage: '256GB',
    camera: '50MP Leica kamera',
    battery: '24 soat video',
    display: '6.36" AMOLED',
    chip: 'Snapdragon 8 Gen 3',
    specs: ['50MP Leica kamera', 'Batareya: 24 soat', 'Snapdragon 8 Gen 3'],
    demand: 0.9,
  },
  {
    name: 'Redmi Note 13 Pro 256GB',
    brand: 'Xiaomi',
    category: 'Xiaomi',
    price: 4_900_000,
    storage: '256GB',
    camera: '200MP kamera',
    battery: '30 soat video',
    display: '6.67" AMOLED',
    chip: 'Snapdragon 7s Gen 2',
    specs: ['200MP kamera', 'Batareya: 30 soat'],
    demand: 1.7,
  },
  {
    name: 'Poco X6 Pro 256GB',
    brand: 'Xiaomi',
    category: 'Xiaomi',
    price: 4_300_000,
    storage: '256GB',
    camera: '64MP kamera',
    battery: '27 soat video',
    display: '6.67" AMOLED',
    chip: 'Dimensity 8300 Ultra',
    specs: ['64MP kamera', 'Batareya: 27 soat', 'Tezkor zaryadlash 67W'],
    demand: 1.2,
  },
  {
    name: 'MacBook Air M3 13" 256GB',
    brand: 'Apple',
    category: 'Noutbuklar',
    price: 17_000_000,
    storage: '256GB SSD',
    battery: '18 soat',
    display: '13.6" Liquid Retina',
    chip: 'Apple M3',
    specs: ['Apple M3 chip', 'Batareya: 18 soat', '8GB RAM'],
    demand: 0.9,
  },
  {
    name: 'MacBook Pro 14" M4 512GB',
    brand: 'Apple',
    category: 'Noutbuklar',
    price: 28_500_000,
    storage: '512GB SSD',
    battery: '22 soat',
    display: '14.2" Liquid Retina XDR',
    chip: 'Apple M4',
    specs: ['Apple M4 chip', 'Batareya: 22 soat', '16GB RAM'],
    demand: 0.5,
  },
  {
    name: 'Asus Vivobook 15 i5',
    brand: 'Asus',
    category: 'Noutbuklar',
    price: 8_500_000,
    storage: '512GB SSD',
    battery: '10 soat',
    display: '15.6" FHD',
    chip: 'Intel Core i5',
    specs: ['Intel Core i5', '16GB RAM', '512GB SSD'],
    demand: 1.1,
  },
  {
    name: 'Lenovo IdeaPad Slim 3',
    brand: 'Lenovo',
    category: 'Noutbuklar',
    price: 7_200_000,
    storage: '256GB SSD',
    battery: '9 soat',
    display: '15.6" FHD',
    chip: 'Intel Core i3',
    specs: ['Intel Core i3', '8GB RAM', '256GB SSD'],
    demand: 1.0,
  },
  {
    name: 'HP Pavilion 15 Ryzen 5',
    brand: 'HP',
    category: 'Noutbuklar',
    price: 9_100_000,
    storage: '512GB SSD',
    battery: '11 soat',
    display: '15.6" FHD',
    chip: 'AMD Ryzen 5',
    specs: ['AMD Ryzen 5', '16GB RAM', '512GB SSD'],
    demand: 0.8,
  },
  {
    name: 'AirPods Pro 2',
    brand: 'Apple',
    category: 'Aksessuarlar',
    price: 3_200_000,
    battery: '6 soat (30 soat case bilan)',
    specs: ["Shovqinni bostirish", 'Batareya: 6 soat'],
    demand: 1.3,
  },
  {
    name: 'AirPods 4',
    brand: 'Apple',
    category: 'Aksessuarlar',
    price: 1_700_000,
    battery: '5 soat',
    specs: ['Batareya: 5 soat', 'USB-C zaryadlash'],
    demand: 1.4,
  },
  {
    name: 'Samsung Galaxy Buds 3',
    brand: 'Samsung',
    category: 'Aksessuarlar',
    price: 1_950_000,
    battery: '6 soat',
    specs: ["Shovqinni bostirish", 'Batareya: 6 soat'],
    demand: 1.0,
  },
  {
    name: 'Anker PowerBank 20000mAh',
    brand: 'Anker',
    category: 'Aksessuarlar',
    price: 590_000,
    battery: '20000mAh',
    specs: ['20000mAh', 'Tezkor zaryadlash 22.5W'],
    demand: 1.6,
  },
  {
    name: 'Baseus 65W Zaryad qurilmasi',
    brand: 'Baseus',
    category: 'Aksessuarlar',
    price: 380_000,
    specs: ['65W GaN', 'USB-C'],
    demand: 1.2,
  },
]

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

const BRANCH_WEIGHT: Record<Branch, number> = {
  "G'ijduvon Bek": 1.05,
  "G'ijduvon Markaz": 1.3,
  Shofirkon: 0.7,
  Qiziltepa: 0.9,
}

function priceTierFactor(price: number): number {
  if (price >= 15_000_000) return 0.3
  if (price >= 8_000_000) return 0.55
  if (price >= 3_000_000) return 0.95
  return 1.5
}

function buildProducts(): Product[] {
  const rand = seededRandom(1337)

  return BASE_PRODUCTS.map((base, index) => {
    const stockByBranch = {} as BranchStock
    const salesByBranch = {} as BranchSales
    const tierFactor = priceTierFactor(base.price)

    BRANCHES.forEach((branch) => {
      const branchWeight = BRANCH_WEIGHT[branch]
      const lowStockRoll = rand()
      const isLow = lowStockRoll < 0.2
      const isOut = lowStockRoll < 0.06

      const stock = isOut
        ? 0
        : isLow
          ? Math.floor(rand() * 4) + 1
          : Math.floor(rand() * 18 * base.demand) + 4

      const salesToday = Math.round(rand() * 2.1 * base.demand * branchWeight * tierFactor)
      const salesMonth = salesToday * (Math.floor(rand() * 16) + 9) + Math.floor(rand() * 6)

      stockByBranch[branch] = stock
      salesByBranch[branch] = { today: salesToday, month: salesMonth }
    })

    return {
      id: `p-${index + 1}`,
      name: base.name,
      brand: base.brand,
      category: base.category,
      price: base.price,
      storage: base.storage,
      camera: base.camera,
      battery: base.battery,
      display: base.display,
      chip: base.chip,
      specs: base.specs,
      stockByBranch,
      salesByBranch,
    } satisfies Product
  })
}

export const PRODUCTS: Product[] = buildProducts()

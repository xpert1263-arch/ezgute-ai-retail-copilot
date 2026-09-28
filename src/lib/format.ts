export function formatSum(value: number): string {
  return `${Math.round(value).toLocaleString('uz-UZ').replace(/,/g, ' ')} so'm`
}

export function formatCompactSum(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} mln so'm`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)} ming so'm`
  }
  return `${value} so'm`
}

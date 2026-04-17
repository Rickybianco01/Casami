export function formatEuro(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const euros = Math.floor(abs / 100)
  const rem = abs % 100
  const eurosStr = euros.toLocaleString('it-IT')
  const centsStr = rem.toString().padStart(2, '0')
  return `${sign}${eurosStr},${centsStr} \u20AC`
}

export function formatEuroCompact(cents: number): string {
  const abs = Math.abs(cents)
  if (abs >= 100000) {
    return `${(abs / 100000).toFixed(1).replace('.', ',')}k \u20AC`
  }
  return formatEuro(cents)
}

export function parseAmountToCents(raw: string): number | null {
  if (!raw) return null
  const cleaned = raw
    .replace(/\u20AC/g, '')
    .replace(/eur/gi, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim()
  if (!cleaned) return null
  if (!/^-?\d+(\.\d{1,2})?$/.test(cleaned)) return null
  const n = Number(cleaned)
  if (!Number.isFinite(n)) return null
  return Math.round(n * 100)
}

export function centsToInputString(cents: number): string {
  const abs = Math.abs(cents)
  const euros = Math.floor(abs / 100)
  const rem = abs % 100
  if (rem === 0) return euros.toString()
  return `${euros},${rem.toString().padStart(2, '0')}`
}

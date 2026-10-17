export function formatMoney(amount: number, decimals = true): string {
  const value = Number.isFinite(amount) ? amount : 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(value)
}

export function parseMoney(input: string): number | null {
  const cleaned = input.replace(/[$,\s]/g, '')
  if (!cleaned) return null
  const value = Number(cleaned)
  if (!Number.isFinite(value) || value < 0) return null
  return Math.round(value * 100) / 100
}

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100
}

export function nextMinimumBid(currentBid: number, increment: number): number {
  return roundMoney(currentBid + increment)
}

export function suggestedBids(currentBid: number, increment: number): number[] {
  const minimum = nextMinimumBid(currentBid, increment)
  return [minimum, roundMoney(minimum + increment), roundMoney(minimum + increment * 3)]
}

export function formatBidCount(count: number): string {
  return `${count} bid${count === 1 ? '' : 's'}`
}

export type CountdownParts = {
  hours: string
  minutes: string
  seconds: string
  totalSeconds: number
  label: string
}

export function splitCountdown(totalSeconds: number): CountdownParts {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60
  const pad = (value: number) => String(value).padStart(2, '0')
  return {
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
    totalSeconds: safe,
    label: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`,
  }
}

export function timeLeftToMinutes(label: string): number {
  const days = Number(label.match(/(\d+)\s*d/)?.[1] ?? 0)
  const hours = Number(label.match(/(\d+)\s*h/)?.[1] ?? 0)
  const minutes = Number(label.match(/(\d+)\s*m/)?.[1] ?? 0)
  const seconds = Number(label.match(/(\d+)\s*s/)?.[1] ?? 0)
  return days * 24 * 60 + hours * 60 + minutes + seconds / 60
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'A'
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '')
  return letters.join('') || 'A'
}

export function characterCount(value: string, max: number): string {
  return `${Math.min(value.length, max)}/${max} characters`
}

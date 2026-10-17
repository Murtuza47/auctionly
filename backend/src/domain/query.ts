export type SortKey = 'ending' | 'newest' | 'price-asc' | 'price-desc' | 'bids'
export type EndingWindow = '1h' | '6h' | '24h' | '3d' | ''
export type BidTab = 'active' | 'won' | 'lost'
export type BidSort = 'ending' | 'highest' | 'recent'

export type AuctionQuery = {
  search: string
  categories: string[]
  conditions: string[]
  location: string
  minPrice: number | null
  maxPrice: number | null
  ending: EndingWindow
  sort: SortKey
  page: number
  pageSize: number
  savedIds?: string[] | null
}

export type BidQuery = {
  status: BidTab
  category: string
  sort: BidSort
  page: number
  pageSize: number
}

const endingLimits: Record<Exclude<EndingWindow, ''>, number> = {
  '1h': 60,
  '6h': 360,
  '24h': 1440,
  '3d': 4320,
}

export function minutesUntil(endsAt: string, now = Date.now()): number {
  const end = new Date(endsAt).getTime()
  if (!Number.isFinite(end)) return Number.POSITIVE_INFINITY
  return Math.max(0, (end - now) / 60000)
}

export function formatTimeLeft(endsAt: string, now = Date.now()): string {
  const total = Math.round(minutesUntil(endsAt, now))
  const days = Math.floor(total / 1440)
  const hours = Math.floor((total % 1440) / 60)
  const minutes = total % 60
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function endsAtFromLabel(label: string, now = Date.now()): string {
  const days = Number(label.match(/(\d+)\s*d/)?.[1] ?? 0)
  const hours = Number(label.match(/(\d+)\s*h/)?.[1] ?? 0)
  const minutes = Number(label.match(/(\d+)\s*m/)?.[1] ?? 0)
  const seconds = Number(label.match(/(\d+)\s*s/)?.[1] ?? 0)
  const ms = (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000
  return new Date(now + ms).toISOString()
}

export type SearchableAuction = {
  id: string
  title: string
  location: string
  currentBid: number
  bidCount: number
  category: string
  condition: string
  recentlyAdded: boolean
  endsAt: string
  homeSection?: 'ending' | 'recent'
}

export function matchesAuction(item: SearchableAuction, query: AuctionQuery, now = Date.now()): boolean {
  const search = query.search.trim().toLowerCase()
  const location = query.location.trim().toLowerCase()
  if (search && !`${item.title} ${item.location} ${item.category}`.toLowerCase().includes(search)) return false
  if (query.categories.length > 0 && !query.categories.includes(item.category)) return false
  if (query.conditions.length > 0 && !query.conditions.includes(item.condition)) return false
  if (location && !item.location.toLowerCase().includes(location)) return false
  if (query.minPrice !== null && item.currentBid < query.minPrice) return false
  if (query.maxPrice !== null && item.currentBid > query.maxPrice) return false
  if (query.ending && minutesUntil(item.endsAt, now) > endingLimits[query.ending]) return false
  if (query.savedIds && !query.savedIds.includes(item.id)) return false
  return true
}

export function sortAuctions<T extends SearchableAuction>(items: T[], sort: SortKey, now = Date.now()): T[] {
  return [...items].sort((a, b) => {
    if (sort === 'price-asc') return a.currentBid - b.currentBid
    if (sort === 'price-desc') return b.currentBid - a.currentBid
    if (sort === 'bids') return b.bidCount - a.bidCount
    if (sort === 'newest') {
      return Number(b.recentlyAdded) - Number(a.recentlyAdded) || minutesUntil(b.endsAt, now) - minutesUntil(a.endsAt, now)
    }
    return minutesUntil(a.endsAt, now) - minutesUntil(b.endsAt, now)
  })
}

export function paginate<T>(items: T[], page: number, pageSize: number): { page: number; pages: number; total: number; items: T[] } {
  const total = items.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), pages)
  const start = (safePage - 1) * pageSize
  return { page: safePage, pages, total, items: items.slice(start, start + pageSize) }
}

export function nextMinimumBid(currentBid: number, increment: number): number {
  return Math.round((currentBid + increment) * 100) / 100
}

export function suggestedBids(currentBid: number, increment: number): number[] {
  const minimum = nextMinimumBid(currentBid, increment)
  return [minimum, roundMoney(minimum + increment), roundMoney(minimum + increment * 3)]
}

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100
}

export function activeBidStatuses(): string[] {
  return ['leading', 'outbid', 'ending']
}

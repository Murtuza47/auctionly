import { timeLeftToMinutes } from './format'

export type AuctionRecord = {
  id: string
  title: string
  location: string
  currentBid: number
  bidCount: number
  timeLeft: string
  category: string
  condition: string
  recentlyAdded: boolean
}

export type SortKey = 'ending' | 'newest' | 'price-asc' | 'price-desc' | 'bids'
export type EndingWindow = '1h' | '6h' | '24h' | '3d' | ''

export type AuctionQuery = {
  search: string
  categories: string[]
  conditions: string[]
  location: string
  minPrice: number | null
  maxPrice: number | null
  ending: EndingWindow
  sort: SortKey
}

export const emptyAuctionQuery: AuctionQuery = {
  search: '',
  categories: [],
  conditions: [],
  location: '',
  minPrice: null,
  maxPrice: null,
  ending: '',
  sort: 'ending',
}

const endingLimits: Record<Exclude<EndingWindow, ''>, number> = {
  '1h': 60,
  '6h': 360,
  '24h': 1440,
  '3d': 4320,
}

export function filterAuctions<T extends AuctionRecord>(items: T[], query: AuctionQuery): T[] {
  const search = query.search.trim().toLowerCase()
  const location = query.location.trim().toLowerCase()
  return items.filter((item) => {
    if (search && !`${item.title} ${item.location} ${item.category}`.toLowerCase().includes(search)) return false
    if (query.categories.length > 0 && !query.categories.includes(item.category)) return false
    if (query.conditions.length > 0 && !query.conditions.includes(item.condition)) return false
    if (location && !item.location.toLowerCase().includes(location)) return false
    if (query.minPrice !== null && item.currentBid < query.minPrice) return false
    if (query.maxPrice !== null && item.currentBid > query.maxPrice) return false
    if (query.ending && timeLeftToMinutes(item.timeLeft) > endingLimits[query.ending]) return false
    return true
  })
}

export function sortAuctions<T extends AuctionRecord>(items: T[], sort: SortKey): T[] {
  const copy = [...items]
  copy.sort((a, b) => {
    if (sort === 'price-asc') return a.currentBid - b.currentBid
    if (sort === 'price-desc') return b.currentBid - a.currentBid
    if (sort === 'bids') return b.bidCount - a.bidCount
    if (sort === 'newest') return Number(b.recentlyAdded) - Number(a.recentlyAdded) || timeLeftToMinutes(b.timeLeft) - timeLeftToMinutes(a.timeLeft)
    return timeLeftToMinutes(a.timeLeft) - timeLeftToMinutes(b.timeLeft)
  })
  return copy
}

export function paginate<T>(items: T[], page: number, pageSize: number): { page: number; pages: number; items: T[] } {
  const pages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(Math.max(1, page), pages)
  const start = (safePage - 1) * pageSize
  return { page: safePage, pages, items: items.slice(start, start + pageSize) }
}

export function pageList(current: number, pages: number): Array<number | '…'> {
  if (pages <= 5) return Array.from({ length: pages }, (_, index) => index + 1)
  const list: Array<number | '…'> = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(pages - 1, current + 1)
  if (start > 2) list.push('…')
  for (let page = start; page <= end; page += 1) list.push(page)
  if (end < pages - 1) list.push('…')
  list.push(pages)
  return list
}

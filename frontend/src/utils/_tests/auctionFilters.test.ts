import { describe, expect, it } from 'vitest'
import { filterAuctions, pageList, paginate, sortAuctions, type AuctionRecord } from '../auctionFilters'

const items: AuctionRecord[] = [
  { id: 'a', title: 'Leather Chair', location: 'Portland, OR', currentBid: 320, bidCount: 14, timeLeft: '2h 45m', category: 'Furniture', condition: 'Used', recentlyAdded: false },
  { id: 'b', title: 'Sony Camera', location: 'Seattle, WA', currentBid: 850, bidCount: 28, timeLeft: '4h 12m', category: 'Electronics', condition: 'Used', recentlyAdded: false },
  { id: 'c', title: 'Oak Table', location: 'Denver, CO', currentBid: 420, bidCount: 5, timeLeft: '1d 3h', category: 'Furniture', condition: 'New', recentlyAdded: true },
]

describe('filterAuctions', () => {
  const base = {
    search: '',
    categories: [],
    conditions: [],
    location: '',
    minPrice: null,
    maxPrice: null,
    ending: '' as const,
    sort: 'ending' as const,
  }

  it('filters by search, category, price, and ending window', () => {
    expect(filterAuctions(items, { ...base, search: 'sony' }).map((item) => item.id)).toEqual(['b'])
    expect(filterAuctions(items, { ...base, categories: ['Furniture'] })).toHaveLength(2)
    expect(filterAuctions(items, { ...base, minPrice: 400, maxPrice: 500 }).map((item) => item.id)).toEqual(['c'])
    expect(filterAuctions(items, { ...base, ending: '6h' }).map((item) => item.id)).toEqual(['a', 'b'])
    expect(filterAuctions(items, { ...base, location: 'denver', conditions: ['New'] })).toHaveLength(1)
  })
})

describe('sortAuctions', () => {
  it('sorts by ending time, price, and bid count', () => {
    expect(sortAuctions(items, 'ending').map((item) => item.id)).toEqual(['a', 'b', 'c'])
    expect(sortAuctions(items, 'price-desc')[0]?.id).toBe('b')
    expect(sortAuctions(items, 'price-asc')[0]?.id).toBe('a')
    expect(sortAuctions(items, 'bids')[0]?.id).toBe('b')
    expect(sortAuctions(items, 'newest')[0]?.id).toBe('c')
  })
})

describe('pagination', () => {
  it('clamps the page and slices items', () => {
    const result = paginate([1, 2, 3, 4, 5], 2, 2)
    expect(result).toMatchObject({ page: 2, pages: 3, items: [3, 4] })
    expect(paginate([1], 9, 4).page).toBe(1)
  })

  it('builds a compact page list', () => {
    expect(pageList(1, 8)).toEqual([1, 2, '…', 8])
    expect(pageList(4, 8)).toEqual([1, '…', 3, 4, 5, '…', 8])
    expect(pageList(1, 3)).toEqual([1, 2, 3])
  })
})

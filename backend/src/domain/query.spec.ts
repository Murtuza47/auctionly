import { endsAtFromLabel, matchesAuction, paginate, sortAuctions, suggestedBids } from './query'
import { emptyAuctionQuery, seedAuctions } from './seed'

const now = Date.parse('2026-10-17T07:00:00.000Z')

describe('auction query', () => {
  const items = seedAuctions()

  it('filters by search, category, price, location, ending window, and watchlist', () => {
    const base = emptyAuctionQuery()
    expect(items.filter((item) => matchesAuction(item, { ...base, search: 'sony' }, now)).map((item) => item.id)).toEqual(['sony-a7', 'sony-headphones'])
    expect(items.filter((item) => matchesAuction(item, { ...base, categories: ['Furniture'] }, now))).toHaveLength(3)
    expect(items.filter((item) => matchesAuction(item, { ...base, minPrice: 400, maxPrice: 500 }, now)).map((item) => item.id)).toEqual(['oak-table'])
    expect(items.filter((item) => matchesAuction(item, { ...base, location: 'denver', conditions: ['Used'] }, now))).toHaveLength(1)
    expect(items.filter((item) => matchesAuction(item, { ...base, ending: '1h' }, now)).map((item) => item.id)).toEqual(['canon-ae1'])
    expect(items.filter((item) => matchesAuction(item, { ...base, savedIds: ['oak-table'] }, now)).map((item) => item.id)).toEqual(['oak-table'])
  })

  it('sorts by ending time, price, bids, and newest', () => {
    const sample = items.filter((item) => ['leather-club-chair', 'sony-a7', 'oak-table'].includes(item.id))
    expect(sortAuctions(sample, 'ending', now).map((item) => item.id)).toEqual(['leather-club-chair', 'sony-a7', 'oak-table'])
    expect(sortAuctions(sample, 'price-desc', now)[0]?.id).toBe('sony-a7')
    expect(sortAuctions(sample, 'price-asc', now)[0]?.id).toBe('leather-club-chair')
    expect(sortAuctions(sample, 'bids', now)[0]?.id).toBe('sony-a7')
    expect(sortAuctions(sample, 'newest', now)[0]?.id).toBe('oak-table')
  })

  it('paginates and suggests the next bids', () => {
    expect(paginate([1, 2, 3, 4, 5], 2, 2)).toMatchObject({ page: 2, pages: 3, total: 5, items: [3, 4] })
    expect(paginate([1], 9, 4).page).toBe(1)
    expect(suggestedBids(650, 25)).toEqual([675, 700, 750])
  })

  it('turns a time label into a future end date', () => {
    const ends = endsAtFromLabel('2h 45m', now)
    expect(new Date(ends).getTime() - now).toBe((2 * 60 + 45) * 60000)
  })
})

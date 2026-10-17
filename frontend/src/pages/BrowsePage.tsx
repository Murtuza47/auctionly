import { ChevronDown, MapPin } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { AuctionCard } from '../components/AuctionCard'
import { useSession } from '../context/SessionContext'
import { auctions, categories, conditions, withImages, type Auction } from '../data/catalog'
import { emptyAuctionQuery, filterAuctions, pageList, sortAuctions, type EndingWindow, type SortKey } from '../utils/auctionFilters'
import { parseMoney } from '../utils/format'

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'ending', label: 'Ending Soon' },
  { value: 'newest', label: 'Newly Listed' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'bids', label: 'Most Bids' },
]

const windows: { value: EndingWindow; label: string }[] = [
  { value: '1h', label: 'Ending in 1h' },
  { value: '6h', label: 'Ending in 6h' },
  { value: '24h', label: 'Ending in 24h' },
  { value: '3d', label: 'Ending in 3d' },
]

export function BrowsePage() {
  const [params] = useSearchParams()
  const { isSaved, toggleSaved, savedIds, token } = useSession()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState(() => ({
    ...emptyAuctionQuery,
    search: params.get('q') ?? '',
    categories: params.get('category') ? [params.get('category') as string] : [],
    sort: (params.get('sort') as SortKey) || 'ending',
  }))
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [remote, setRemote] = useState<{ items: Auction[]; total: number; pages: number } | null>(null)
  const savedOnly = params.get('saved') === '1'

  useEffect(() => {
    setQuery((current) => ({
      ...current,
      search: params.get('q') ?? '',
      categories: params.get('category') ? [params.get('category') as string] : current.categories,
      sort: (params.get('sort') as SortKey) || current.sort,
    }))
    setPage(1)
  }, [params])

  const source = auctions.filter((item) => (!savedOnly || savedIds.includes(item.id)))
  const localVisible = useMemo(() => sortAuctions(filterAuctions(source, query), query.sort), [query, source])

  useEffect(() => {
    const search = new URLSearchParams()
    if (query.search) search.set('q', query.search)
    query.categories.forEach((category) => search.append('category', category))
    query.conditions.forEach((condition) => search.append('condition', condition))
    if (query.location) search.set('location', query.location)
    if (query.minPrice !== null) search.set('minPrice', String(query.minPrice))
    if (query.maxPrice !== null) search.set('maxPrice', String(query.maxPrice))
    if (query.ending) search.set('ending', query.ending)
    search.set('sort', query.sort)
    search.set('page', String(page))
    search.set('pageSize', '9')
    if (savedOnly) search.set('saved', '1')
    let ignore = false
    void api<{ items: Auction[]; total: number; pages: number }>(`/auctions?${search}`, { token }).then((result) => {
      if (ignore) return
      setRemote(result.ok ? { items: result.data.items.map((item) => withImages(item)), total: result.data.total, pages: result.data.pages } : null)
    })
    return () => {
      ignore = true
    }
  }, [page, query, savedOnly, token])

  const pageSize = 9
  const visibleCount = remote?.total ?? localVisible.length
  const pages = remote?.pages ?? Math.max(1, Math.ceil(localVisible.length / pageSize))
  const safePage = Math.min(Math.max(1, page), pages)
  const pageItems = remote?.items ?? localVisible.slice((safePage - 1) * pageSize, safePage * pageSize)

  function toggleList(key: 'categories' | 'conditions', value: string) {
    setPage(1)
    setQuery((current) => {
      const list = current[key]
      return { ...current, [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value] }
    })
  }

  function clearAll() {
    setQuery({ ...emptyAuctionQuery, search: query.search })
    setMin('')
    setMax('')
    setPage(1)
  }

  const filters = (
    <aside className="filters">
      <div className="section-head">
        <h2>Filters</h2>
        <button type="button" className="linkish" onClick={clearAll}>Clear All</button>
      </div>
      <fieldset>
        <legend>Category</legend>
        {categories.map((category) => (
          <label key={category}><input type="checkbox" checked={query.categories.includes(category)} onChange={() => toggleList('categories', category)} /> {category}</label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Location</legend>
        <label className="input-shell">
          <MapPin size={16} />
          <input value={query.location} placeholder="Enter location or postcode" onChange={(event) => { setPage(1); setQuery({ ...query, location: event.target.value }) }} />
        </label>
      </fieldset>
      <fieldset>
        <legend>Price Range</legend>
        <div className="price-range">
          <label className="input-shell"><span>$</span><input inputMode="decimal" placeholder="Min" value={min} onChange={(event) => setMin(event.target.value)} onBlur={() => { setPage(1); setQuery({ ...query, minPrice: parseMoney(min) }) }} /></label>
          <span>to</span>
          <label className="input-shell"><span>$</span><input inputMode="decimal" placeholder="Max" value={max} onChange={(event) => setMax(event.target.value)} onBlur={() => { setPage(1); setQuery({ ...query, maxPrice: parseMoney(max) }) }} /></label>
        </div>
      </fieldset>
      <fieldset>
        <legend>Condition</legend>
        {conditions.filter((condition) => condition !== 'Excellent').map((condition) => (
          <label key={condition}><input type="checkbox" checked={query.conditions.includes(condition)} onChange={() => toggleList('conditions', condition)} /> {condition}</label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Ending Time</legend>
        {windows.map((window) => (
          <label key={window.value}><input type="radio" name="ending" checked={query.ending === window.value} onChange={() => { setPage(1); setQuery({ ...query, ending: window.value }) }} /> {window.label}</label>
        ))}
      </fieldset>
    </aside>
  )

  return (
    <div className="browse-page">
      <div className="title-strip">
        <div>
          <h1>Browse Auctions</h1>
          <p>{visibleCount} active auctions found</p>
        </div>
        <label className="sort-area">
          Sort by:
          <span>
            <select value={query.sort} onChange={(event) => setQuery({ ...query, sort: event.target.value as SortKey })}>
              {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <ChevronDown size={16} />
          </span>
        </label>
      </div>
      <div className="mobile-controls">
        <button type="button" className="btn btn-ghost" onClick={() => setFiltersOpen((open) => !open)}>Filters</button>
        <label className="sort-area">
          <select aria-label="Sort auctions" value={query.sort} onChange={(event) => setQuery({ ...query, sort: event.target.value as SortKey })}>
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>
      {filtersOpen ? <div className="filters-mobile">{filters}</div> : null}
      <div className="browse-columns">
        {filters}
        <div>
          {pageItems.length === 0 ? <p className="empty">No auctions match these filters.</p> : null}
          <div className="card-grid browse-grid">
            {pageItems.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} decimals saved={isSaved(auction.id)} onToggleSave={() => toggleSaved(auction.id)} />
            ))}
          </div>
          <Pager page={safePage} pages={pages} onPage={setPage} />
        </div>
      </div>
    </div>
  )
}

export function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) {
  const items = pageList(page, pages)
  return (
    <nav className="pager" aria-label="Pagination">
      <button type="button" onClick={() => onPage(page - 1)} disabled={page === 1}>Previous</button>
      {items.map((item, index) => item === '…' ? <span key={`gap-${index}`}>…</span> : (
        <button type="button" key={item} className={item === page ? 'active' : ''} onClick={() => onPage(item)}>{item}</button>
      ))}
      <button type="button" onClick={() => onPage(page + 1)} disabled={page === pages}>Next</button>
    </nav>
  )
}

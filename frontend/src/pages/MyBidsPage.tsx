import { AlertTriangle, Check, ChevronDown, Clock, LayoutGrid, List } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { Pager } from './BrowsePage'
import { useSession } from '../context/SessionContext'
import { categories, resolveImage, userBids, type BidStatus, type UserBid } from '../data/catalog'
import { formatMoney } from '../utils/format'

type Tab = 'active' | 'won' | 'lost'

const extraBids: UserBid[] = [
  { ...userBids[0], id: 'won-1', status: 'won', title: 'Herman Miller Aeron Chair - Size B', timeLeft: 'Ended Oct 2', yourBid: 620, currentBid: 620 },
  { ...userBids[2], id: 'won-2', status: 'won', title: 'Vintage Mechanical Chronograph Watch', timeLeft: 'Ended Sep 28', yourBid: 950, currentBid: 950 },
  { ...userBids[1], id: 'lost-1', status: 'lost', title: 'Fujifilm X100V Digital Camera - Silver', timeLeft: 'Ended Oct 8', yourBid: 1100, currentBid: 1450 },
]

const sortMap: Record<string, string> = {
  'Ending Soonest': 'ending',
  'Highest Bid': 'highest',
  'Recently Updated': 'recent',
}

export function MyBidsPage() {
  const { token } = useSession()
  const [tab, setTab] = useState<Tab>('active')
  const [category, setCategory] = useState('All Categories')
  const [sort, setSort] = useState('Ending Soonest')
  const [view, setView] = useState<'grid' | 'list'>('list')
  const [page, setPage] = useState(1)
  const [remote, setRemote] = useState<{ items: UserBid[]; pages: number; counts: { active: number; won: number; lost: number } } | null>(null)

  const rows = useMemo(() => {
    const pool = tab === 'active' ? userBids : extraBids.filter((bid) => bid.status === tab)
    const filtered = pool.filter((bid) => category === 'All Categories' || bid.category === category)
    if (sort === 'Highest Bid') return [...filtered].sort((a, b) => b.currentBid - a.currentBid)
    if (sort === 'Recently Updated') return filtered
    return filtered
  }, [category, sort, tab])

  useEffect(() => {
    const search = new URLSearchParams({
      status: tab,
      category,
      sort: sortMap[sort] ?? 'ending',
      page: String(page),
      pageSize: '4',
    })
    let ignore = false
    void api<{ items: UserBid[]; pages: number; counts: { active: number; won: number; lost: number } }>(`/me/bids?${search}`, { token }).then((result) => {
      if (ignore) return
      setRemote(result.ok ? { ...result.data, items: result.data.items.map((bid) => ({ ...bid, image: resolveImage(bid.image) })) } : null)
    })
    return () => {
      ignore = true
    }
  }, [category, page, sort, tab, token])

  const pageSize = 4
  const counts = remote?.counts ?? { active: 8, won: 12, lost: 3 }
  const pages = remote?.pages ?? (tab === 'active' ? 8 : Math.max(1, Math.ceil(rows.length / pageSize)))
  const visible = remote?.items ?? rows.slice((page - 1) * pageSize, page * pageSize)
  const tabCounts = [
    { id: 'active' as const, label: 'Active', count: counts.active },
    { id: 'won' as const, label: 'Won', count: counts.won },
    { id: 'lost' as const, label: 'Lost', count: counts.lost },
  ]

  return (
    <div className="bids-page">
      <div className="bids-heading">
        <div>
          <h1>My Bids</h1>
          <p>Track and manage all your auction activity</p>
        </div>
        <div className="stat-pills">
          <span><b>{counts.active}</b> Active Bids</span>
          <span><b>{counts.won}</b> Won</span>
          <span><b>{counts.lost}</b> Lost</span>
        </div>
      </div>
      <div className="tab-bar" role="tablist">
        {tabCounts.map((item) => (
          <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? 'active' : ''} onClick={() => { setTab(item.id); setPage(1) }}>
            {item.label} ({item.count})
          </button>
        ))}
      </div>
      <div className="filters-row">
        <label className="select-shell">
          <select aria-label="Category" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>All Categories</option>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <ChevronDown size={16} />
        </label>
        <label className="select-shell">
          <select aria-label="Sort bids" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option>Ending Soonest</option>
            <option>Highest Bid</option>
            <option>Recently Updated</option>
          </select>
          <ChevronDown size={16} />
        </label>
        <div className="view-toggles">
          <button type="button" aria-label="List view" className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><List size={16} /></button>
          <button type="button" aria-label="Grid view" className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><LayoutGrid size={16} /></button>
        </div>
      </div>
      {visible.length === 0 ? <p className="empty">No {tab} bids on this page.</p> : null}
      <div className={view === 'grid' ? 'bid-grid' : 'bid-stack'}>
        {visible.map((bid) => <BidCard key={bid.id} bid={bid} />)}
      </div>
      <Pager page={page} pages={pages} onPage={setPage} />
    </div>
  )
}

function BidCard({ bid }: { bid: UserBid }) {
  return (
    <article className="bid-card">
      <img src={resolveImage(bid.image)} alt="" />
      <div>
        <div className="bid-card-top">
          <Status status={bid.status} />
          <span className="time-left"><Clock size={14} /> {bid.timeLeft}</span>
        </div>
        <h2>{bid.title}</h2>
        <p className="eyebrow">{bid.category}</p>
        <div className="bid-figures">
          <div>
            <p className="eyebrow">Current Bid</p>
            <strong>{formatMoney(bid.currentBid)}</strong>
            <span>({bid.bidCount} bids)</span>
          </div>
          <div>
            <p className="eyebrow">Your Bid</p>
            <strong>{formatMoney(bid.yourBid)}</strong>
          </div>
        </div>
        <div className="bid-actions">
          <Link className="btn btn-ghost" to={`/auction/${bid.auctionId}`}>View Auction</Link>
          {bid.status === 'outbid' || bid.status === 'ending' ? <Link className="btn btn-primary" to={`/auction/${bid.auctionId}`}>Increase Bid</Link> : null}
        </div>
      </div>
    </article>
  )
}

function Status({ status }: { status: BidStatus }) {
  const map = {
    leading: { label: 'Leading', icon: <Check size={14} /> },
    outbid: { label: 'Outbid', icon: <AlertTriangle size={14} /> },
    ending: { label: 'Ending Soon', icon: <Clock size={14} /> },
    won: { label: 'Won', icon: <Check size={14} /> },
    lost: { label: 'Lost', icon: <AlertTriangle size={14} /> },
  } as const
  const item = map[status]
  return <span className={`status ${status}`}>{item.icon} {item.label}</span>
}

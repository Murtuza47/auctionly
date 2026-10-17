import { Check, ChevronRight, Clock, Heart, MapPin, Truck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useSession } from '../context/SessionContext'
import { bidHistory, getAuction, resolveImage, sellerAvatar, withImages, type Auction } from '../data/catalog'
import { formatBidCount, formatMoney, splitCountdown, suggestedBids, timeLeftToMinutes } from '../utils/format'
import { validateBid } from '../utils/validation'

export function AuctionDetailsPage() {
  const { id } = useParams()
  const [auction, setAuction] = useState<Auction | undefined>(() => getAuction(id) ?? getAuction('macbook-pro-14'))
  const { isSaved, toggleSaved, token } = useSession()
  const [photo, setPhoto] = useState(0)
  const [amount, setAmount] = useState('700.00')
  const [currentBid, setCurrentBid] = useState(auction?.currentBid ?? 0)
  const [bidCount, setBidCount] = useState(auction?.bidCount ?? 0)
  const [message, setMessage] = useState('You are the highest bidder')
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState(auction?.history?.length ? auction.history : bidHistory)
  const [showAll, setShowAll] = useState(false)
  const seconds = useMemo(() => Math.round(timeLeftToMinutes(auction?.timeLeft ?? '0') * 60), [auction?.timeLeft])
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    const fallback = getAuction(id) ?? (id ? undefined : getAuction('macbook-pro-14'))
    if (fallback) {
      setAuction(fallback)
      setCurrentBid(fallback.currentBid)
      setBidCount(fallback.bidCount)
      setHistory(fallback.id === 'macbook-pro-14' ? bidHistory : fallback.history ?? [])
      setAmount((fallback.currentBid + fallback.increment).toFixed(2))
    }
    if (!id) return
    let ignore = false
    void api<Auction>(`/auctions/${id}`).then((result) => {
      if (ignore || !result.ok) return
      const next = withImages(result.data)
      setAuction(next)
      setCurrentBid(next.currentBid)
      setBidCount(next.bidCount)
      setHistory(next.history ?? [])
      setAmount((next.suggestedBids?.[1] ?? next.currentBid).toFixed(2))
      setMessage(next.history?.some((row) => row.highest && row.bidder.includes('(You)')) || !next.history?.length ? 'You are the highest bidder' : 'Place a bid to take the lead')
    })
    return () => {
      ignore = true
    }
  }, [id])

  useEffect(() => {
    setRemaining(seconds)
    setPhoto(0)
  }, [auction?.id, seconds])

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [])

  if (!auction) return null
  const images = auction.images ?? [auction.image]
  const clock = splitCountdown(remaining)
  const chips = suggestedBids(currentBid, auction.increment)
  const saved = isSaved(auction.id)

  async function placeBid(nextAmount?: number) {
    const input = nextAmount !== undefined ? nextAmount.toFixed(2) : amount
    const problem = validateBid(input, currentBid, auction!.increment)
    if (problem) {
      setError(problem)
      return
    }
    const value = Number(input)
    if (token) {
      const result = await api<Auction>(`/auctions/${auction!.id}/bids`, { method: 'POST', token, body: { amount: value } })
      if (result.ok) {
        const next = withImages(result.data)
        setAuction(next)
        setCurrentBid(next.currentBid)
        setBidCount(next.bidCount)
        setHistory(next.history ?? [])
        setAmount(value.toFixed(2))
        setMessage('You are the highest bidder')
        setError(null)
        return
      }
      if (result.status !== 0) {
        setError(result.errors.amount ?? 'Bid was not accepted')
        return
      }
    }
    setCurrentBid(value)
    setBidCount((count) => count + 1)
    setAmount(value.toFixed(2))
    setMessage('You are the highest bidder')
    setError(null)
    setHistory((rows) => [{ bidder: 'you_user2024 (You)', amount: value, time: 'Just now', highest: true }, ...rows.map((row) => ({ ...row, highest: false }))])
  }

  return (
    <div className="details-page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <Link to={`/browse?category=${encodeURIComponent(auction.category)}`}>{auction.category}</Link>
        <ChevronRight size={14} />
        <span>Laptops</span>
        <ChevronRight size={14} />
        <span>{auction.title}</span>
      </nav>
      <div className="details-top">
        <div className="gallery">
          <div className="hero-shot">
            <img src={resolveImage(images[photo])} alt="" />
            <span>{photo + 1}/{images.length}</span>
          </div>
          <div className="thumbs">
            {images.map((image, index) => (
              <button type="button" key={`${image}-${index}`} className={index === photo ? 'active' : ''} onClick={() => setPhoto(index)}>
                <img src={resolveImage(image)} alt="" />
              </button>
            ))}
          </div>
        </div>
        <section className="bid-panel">
          <h1>{auction.title}</h1>
          <p className="location-line"><MapPin size={16} /> {auction.location}</p>
          <div className="seller-line">
            <img src={auction.sellerAvatar ? resolveImage(auction.sellerAvatar) : sellerAvatar} alt="" />
            <div>
              <strong>{auction.seller}</strong>
              <span><Check size={14} /> ★ {auction.rating ?? 4.9} ({auction.reviews ?? 24} reviews)</span>
            </div>
          </div>
          <div className="status-banner"><Check size={16} /> {message}</div>
          <div className="bid-stats">
            <div>
              <p className="eyebrow">Current Bid</p>
              <strong>{formatMoney(currentBid)}</strong>
              <span>{formatBidCount(bidCount)} placed</span>
            </div>
            <div>
              <p className="eyebrow">Time Remaining</p>
              <div className="clock" aria-live="polite">
                <b>{clock.hours}<small>h</small></b>
                <b>{clock.minutes}<small>m</small></b>
                <b>{clock.seconds}<small>s</small></b>
              </div>
            </div>
          </div>
          <form className="bid-form" onSubmit={(event) => { event.preventDefault(); placeBid() }}>
            <label>
              Your bid
              <span className="input-shell money">
                <span>$</span>
                <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" aria-label="Bid amount" />
              </span>
            </label>
            <p className="hint">Min Next Bid {formatMoney(chips[0] ?? currentBid, false)}</p>
            {error ? <p className="form-error">{error}</p> : null}
            <div className="chip-row">
              {chips.map((chip) => (
                <button type="button" key={chip} onClick={() => { setAmount(chip.toFixed(2)); placeBid(chip) }}>{formatMoney(chip, false)}</button>
              ))}
            </div>
            <button className="btn btn-primary" type="submit">Place Bid</button>
            <button className="btn btn-ghost" type="button" onClick={() => toggleSaved(auction.id)}>
              <Heart size={16} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Watching' : 'Watch This Item'}
            </button>
          </form>
          <p className="ship-note"><Truck size={16} /> Seller ships Australia-wide — $15 flat rate</p>
        </section>
      </div>
      <section className="detail-block">
        <h2>Product Description</h2>
        <p>{auction.description}</p>
      </section>
      <section className="detail-block">
        <h2>Auction Information</h2>
        <dl className="info-grid">
          <div><dt>Start Price</dt><dd>{formatMoney(auction.startPrice ?? 50)}</dd></div>
          <div><dt>Bid Increment</dt><dd>{formatMoney(auction.increment)}</dd></div>
          <div><dt>Started</dt><dd>{auction.started ?? 'Oct 12, 2026, 9:00 AM'}</dd></div>
          <div><dt>Ends</dt><dd>{auction.ends ?? 'Oct 16, 2026, 6:00 PM'}</dd></div>
          <div><dt>Condition</dt><dd>{auction.condition}</dd></div>
          <div><dt>Shipping</dt><dd>{auction.shipping ?? 'Local pickup'}</dd></div>
          <div><dt>Returns</dt><dd>{auction.returns ?? 'Pickup inspection on collection'}</dd></div>
          <div><dt>Payment</dt><dd>{auction.payment ?? 'Auctionly Secure Pay'}</dd></div>
        </dl>
      </section>
      <section className="detail-block">
        <div className="section-head">
          <h2>Bid History</h2>
          <span>{bidCount} bids total</span>
        </div>
        <div className="history-table">
          <div className="history-head"><span>Bidder</span><span>Amount</span><span>Time</span></div>
          {(showAll ? history : history.slice(0, 5)).map((row) => (
            <div key={`${row.bidder}-${row.time}`} className="history-row">
              <span>{row.bidder} {row.highest ? <em>HIGHEST</em> : null}</span>
              <span>{formatMoney(row.amount)}</span>
              <span><Clock size={14} /> {row.time}</span>
            </div>
          ))}
        </div>
        <button type="button" className="linkish" onClick={() => setShowAll((value) => !value)}>
          {showAll ? 'Show fewer bids' : `View all ${bidCount} bids`}
        </button>
      </section>
      <div className="sticky-bid">
        <div>
          <small>Current Bid</small>
          <strong>{formatMoney(currentBid)}</strong>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => placeBid()}>Place Bid</button>
      </div>
    </div>
  )
}

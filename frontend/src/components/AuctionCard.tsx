import { Clock, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { resolveImage, type Auction } from '../data/catalog'
import { formatBidCount, formatMoney } from '../utils/format'

type CardProps = {
  auction: Auction
  saved: boolean
  onToggleSave: () => void
  decimals?: boolean
  useHomePrice?: boolean
}

export function AuctionCard({ auction, saved, onToggleSave, decimals = false, useHomePrice = false }: CardProps) {
  const price = useHomePrice ? auction.homeBid ?? auction.currentBid : auction.currentBid
  const bids = useHomePrice ? auction.homeBidCount ?? auction.bidCount : auction.bidCount
  return (
    <article className="auction-card">
      <div className="card-media">
        <img src={resolveImage(auction.image)} alt="" />
        <button type="button" className={`save-badge ${saved ? 'saved' : ''}`} aria-label={saved ? 'Remove from watchlist' : 'Save to watchlist'} onClick={onToggleSave}>
          <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <span className={`time-badge ${auction.endingSoon ? 'urgent' : ''}`}>
          <Clock size={12} />
          {auction.timeLeft}
        </span>
      </div>
      <div className="card-body">
        <div>
          <p className="eyebrow">{auction.location}</p>
          <h3>
            <Link to={`/auction/${auction.id}`}>{auction.title}</Link>
          </h3>
        </div>
        <hr />
        <div className="bid-row">
          <div>
            <p className="eyebrow">Current Bid</p>
            <strong>{formatMoney(price, decimals)}</strong>
          </div>
          <div className="activity">
            <p className="eyebrow">Activity</p>
            <span>{formatBidCount(bids)}</span>
          </div>
        </div>
        <Link className="btn btn-primary" to={`/auction/${auction.id}`}>Place Bid</Link>
      </div>
    </article>
  )
}

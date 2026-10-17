import { Armchair, Award, BookOpen, HousePlus, Laptop, Shirt, Trophy } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { AuctionCard } from '../components/AuctionCard'
import { auctions, categories, heroImage, withImages, type Auction } from '../data/catalog'
import { useSession } from '../context/SessionContext'

const categoryIcons: Record<string, ReactNode> = {
  Electronics: <Laptop size={18} />,
  Furniture: <Armchair size={18} />,
  Books: <BookOpen size={18} />,
  Clothing: <Shirt size={18} />,
  Sports: <Trophy size={18} />,
  'Home & Garden': <HousePlus size={18} />,
  Collectibles: <Award size={18} />,
}

export function HomePage() {
  const { isSaved, toggleSaved } = useSession()
  const localEnding = auctions.filter((item) => item.endingSoon && item.id !== 'macbook-pro-14').slice(0, 3)
  const localRecent = auctions.filter((item) => item.recentlyAdded).slice(0, 3)
  const [ending, setEnding] = useState(localEnding)
  const [recent, setRecent] = useState(localRecent)

  useEffect(() => {
    let ignore = false
    void api<{ endingSoon: Auction[]; recentlyAdded: Auction[] }>('/auctions/home').then((result) => {
      if (ignore || !result.ok) return
      setEnding(result.data.endingSoon.map((item) => withImages(item)))
      setRecent(result.data.recentlyAdded.map((item) => withImages(item)))
    })
    return () => {
      ignore = true
    }
  }, [])

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="pill">Local Online Auctions Reimagined</span>
          <h1>Find great items.<br />Bid locally.</h1>
          <p className="only-desktop">Discover, bid, and win high-quality items from trusted neighbors in your community. No shipping headaches. Simple, secure local pickups.</p>
          <p className="only-tablet">Discover and bid on unique, high-quality items from your local community. Secure pickups, zero shipping hassle.</p>
          <p className="only-mobile">Discover and bid on curated items from local sellers in your area. Safe pickups, no shipping stress.</p>
          <div className="hero-ctas">
            <Link className="btn btn-primary" to="/browse">Browse Auctions</Link>
            <Link className="btn btn-ghost" to="/sell">Start Selling</Link>
          </div>
        </div>
        <img className="hero-image only-desktop" src={heroImage} alt="Vintage camera and turntable on a wooden cabinet" />
        <form className="hero-search below-desktop" action="/browse">
          <input name="q" placeholder="Search local auctions..." aria-label="Search local auctions" />
        </form>
      </section>

      <section className="section">
        <h2 className="section-label">
          <span className="hide-mobile">Popular Categories</span>
          <span className="only-mobile">Explore Categories</span>
        </h2>
        <div className="category-row">
          {categories.map((category) => (
            <Link key={category} to={`/browse?category=${encodeURIComponent(category)}`} className="category-chip">
              <span>{categoryIcons[category]}</span>
              {category}
            </Link>
          ))}
        </div>
      </section>

      <CardSection title="Ending Soon" urgent href="/browse?sort=ending" link="View All Ending Soon" shortLink="See All" items={ending} saved={isSaved} onToggle={toggleSaved} />
      <CardSection title="Recently Added" href="/browse?sort=newest" link="View All Recent" shortLink="See All" items={recent} saved={isSaved} onToggle={toggleSaved} />
    </div>
  )
}

function CardSection({
  title,
  urgent,
  href,
  link,
  shortLink,
  items,
  saved,
  onToggle,
}: {
  title: string
  urgent?: boolean
  href: string
  link: string
  shortLink: string
  items: Auction[]
  saved: (id: string) => boolean
  onToggle: (id: string) => void
}) {
  return (
    <section className="section">
      <div className="section-head">
        <h2>
          {title}
          {urgent ? <span className="urgent">Urgent</span> : null}
        </h2>
        <Link to={href}>
          <span className="hide-mobile">{link}</span>
          <span className="only-mobile">{shortLink}</span>
        </Link>
      </div>
      <div className="card-grid">
        {items.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} saved={saved(auction.id)} onToggleSave={() => onToggle(auction.id)} useHomePrice />
        ))}
      </div>
    </section>
  )
}

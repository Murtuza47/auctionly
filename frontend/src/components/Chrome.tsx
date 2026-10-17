import { BadgeDollarSign, Bell, CircleUser, Gavel, House, Menu, Plus, Search, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'

const links = [
  { to: '/browse', label: 'Browse Auctions' },
  { to: '/sell', label: 'Sell an Item' },
  { to: '/my-bids', label: 'My Bids' },
]

export function SiteHeader() {
  const { user, notifications } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const authRoute = location.pathname === '/login' || location.pathname === '/signup'
  const showAccount = Boolean(user) && !authRoute
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [notices, setNotices] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    navigate(`/browse?q=${encodeURIComponent(query)}`)
    setOpen(false)
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-left">
          <Link to="/" className="brand" aria-label="Auctionly home">
            <span className="logo-mark">
              <Gavel size={18} />
            </span>
            <span>Auctionly</span>
          </Link>
          <nav className="header-nav" aria-label="Primary">
            {links.map((link) => (
              <NavLink key={link.label} to={link.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <form className="header-search" onSubmit={submit}>
          <Search size={18} aria-hidden />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for items near you..." aria-label="Search auctions" />
          <button type="submit">Search</button>
        </form>
        <div className="header-actions">
          {showAccount ? (
            <>
              <button type="button" className="icon-btn" aria-label="Notifications" onClick={() => setNotices((value) => !value)}>
                <Bell size={20} />
                <span className="dot" />
              </button>
              {notices ? (
                <div className="notice-pop">
                  <strong>Notifications</strong>
                  {notifications.map((text) => <p key={text}>{text}</p>)}
                </div>
              ) : null}
              <Link to="/profile" className="avatar" aria-label="Profile">
                {user?.initials ?? 'AM'}
              </Link>
            </>
          ) : (
            <div className="auth-actions">
              <Link to="/login" className="text-btn">Sign In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
          <button type="button" className="icon-btn menu-btn" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
        </div>
      </div>
      {open ? (
        <div className="drawer-backdrop" onClick={() => setOpen(false)}>
          <nav className="drawer" onClick={(event) => event.stopPropagation()} aria-label="Mobile">
            <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
            <form onSubmit={submit}>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for items near you..." aria-label="Search auctions" />
            </form>
            <Link to="/" onClick={() => setOpen(false)}>Home</Link>
            <Link to="/browse" onClick={() => setOpen(false)}>Browse Auctions</Link>
            <Link to="/sell" onClick={() => setOpen(false)}>Sell an Item</Link>
            <Link to="/my-bids" onClick={() => setOpen(false)}>My Bids</Link>
            <Link to="/profile" onClick={() => setOpen(false)}>Profile</Link>
            <Link to="/how-it-works" onClick={() => setOpen(false)}>How It Works</Link>
            {showAccount ? null : <Link to="/login" onClick={() => setOpen(false)}>Sign In</Link>}
          </nav>
        </div>
      ) : null}
    </header>
  )
}

const footerColumns = [
  { title: 'Platform', links: [
    { label: 'Browse Auctions', to: '/browse' },
    { label: 'Sell An Item', to: '/sell' },
    { label: 'Watchlist', to: '/browse?saved=1' },
  ] },
  { title: 'Support', links: [
    { label: 'Trust & Safety', to: '/trust' },
    { label: 'Local Pickups', to: '/how-it-works' },
    { label: 'Help Center', to: '/help' },
  ] },
  { title: 'Company', links: [
    { label: 'About Us', to: '/about' },
    { label: 'Community Guidelines', to: '/guidelines' },
    { label: 'Contact Support', to: '/help' },
  ] },
]

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="brand">
            <span className="logo-mark sm"><Gavel size={14} /></span>
            <span>Auctionly</span>
          </div>
          <p>We&apos;re rebuilding local marketplace bidding. Buy and sell with total confidence right in your neighborhood.</p>
        </div>
        <div className="footer-links">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3>{column.title}</h3>
              {column.links.map((link) => (
                <Link key={link.label} to={link.to}>{link.label}</Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Auctionly Inc. All rights reserved.</span>
        <span className="legal-links">
          <Link to="/privacy">Privacy Policy</Link>
          <span aria-hidden> • </span>
          <Link to="/terms">Terms of Service</Link>
          <span aria-hidden> • </span>
          <Link to="/guidelines">Community Guidelines</Link>
        </span>
      </div>
    </footer>
  )
}

const bottomLinks = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/browse', label: 'Browse', icon: 'gavel' },
  { to: '/sell', label: 'Sell', icon: 'sell' },
  { to: '/my-bids', label: 'Bids', icon: 'bids' },
  { to: '/profile', label: 'Profile', icon: 'user' },
] as const

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Mobile">
      {bottomLinks.map((link) => (
        <NavLink key={link.label} to={link.to} end={link.to === '/'}>
          <BottomIcon name={link.icon} />
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function BottomIcon({ name }: { name: (typeof bottomLinks)[number]['icon'] }) {
  if (name === 'home') return <House size={18} />
  if (name === 'gavel') return <Gavel size={18} />
  if (name === 'sell') return <span className="sell-fab"><Plus size={16} /></span>
  if (name === 'bids') return <BadgeDollarSign size={18} />
  return <CircleUser size={18} />
}

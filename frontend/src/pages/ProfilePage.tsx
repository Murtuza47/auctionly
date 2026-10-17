import { Award, Bell, Box, Calendar, Camera, Check, ChevronRight, CircleDollarSign, Gavel, Heart, LogOut, MapPin, Pencil, Settings, Share2, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useSession } from '../context/SessionContext'
import { profile as fallbackProfile, resolveImage } from '../data/catalog'

type ProfileData = typeof fallbackProfile & { avatar?: string }

const nav = [
  { label: 'My Auctions', to: '/sell', icon: <Gavel size={18} />, count: '' },
  { label: 'My Bids', to: '/my-bids', icon: <ArrowMark />, count: '8' },
  { label: 'Watchlist', to: '/browse?saved=1', icon: <Heart size={18} />, count: '23' },
  { label: 'Notifications', to: '/profile', icon: <Bell size={18} />, count: '3' },
  { label: 'Settings', to: '/profile', icon: <Settings size={18} />, count: '' },
  { label: 'Help Center', to: '/help', icon: <Star size={18} />, count: '' },
]

function ArrowMark() {
  return <span className="mini-arrow">↑</span>
}

export function ProfilePage() {
  const { signOut, user, token } = useSession()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileData>(fallbackProfile)
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState(fallbackProfile.bio)
  const [name, setName] = useState(fallbackProfile.name)
  const [shared, setShared] = useState(false)

  useEffect(() => {
    let ignore = false
    void api<ProfileData>('/me/profile', { token }).then((result) => {
      if (ignore || !result.ok) return
      setProfile(result.data)
      setName(result.data.name)
      setBio(result.data.bio)
    })
    return () => {
      ignore = true
    }
  }, [token])

  async function saveProfile() {
    const result = await api<ProfileData>('/me/profile', { method: 'PATCH', token, body: { name, bio } })
    if (result.ok) {
      setProfile(result.data)
      setName(result.data.name)
      setBio(result.data.bio)
    } else if (result.status === 0) {
      setProfile((current) => ({ ...current, name, bio }))
    }
    setEditing(false)
  }

  return (
    <div className="profile-page">
      <section className="profile-panel">
        <div className="avatar-column">
          <img src={resolveImage(profile.avatar) || resolveImage('profile')} alt="" />
          <button type="button" className="icon-btn camera" aria-label="Change photo"><Camera size={16} /></button>
          <span className="verified"><Check size={12} /></span>
        </div>
        <div className="profile-meta">
          {editing ? (
            <form className="edit-form" onSubmit={(event) => { event.preventDefault(); void saveProfile() }}>
              <label>Display name<input value={name} onChange={(event) => setName(event.target.value)} /></label>
              <label>Bio<textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} /></label>
              <button className="btn btn-primary" type="submit">Save Profile</button>
            </form>
          ) : (
            <>
              <div className="identity">
                <h1>{name}</h1>
                <p>{profile.handle}</p>
              </div>
              <div className="profile-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShared(true)}><Share2 size={16} /> {shared ? 'Link copied' : 'Share Profile'}</button>
                <button type="button" className="btn btn-primary" onClick={() => setEditing(true)}><Pencil size={16} /> Edit Profile</button>
              </div>
              <ul className="micro-details">
                <li><Calendar size={16} /> Member since {profile.memberSince}</li>
                <li><MapPin size={16} /> {profile.location}</li>
                <li className="stars"><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /> {profile.rating} ({profile.reviews} reviews)</li>
              </ul>
              <p>{bio}</p>
            </>
          )}
        </div>
      </section>
      <section className="stats-grid">
        {profile.stats.map((stat) => (
          <article key={stat.label}>
            <span>{statIcon(stat.label)}</span>
            <strong>{stat.value}</strong>
            <p>{stat.label}</p>
          </article>
        ))}
      </section>
      <div className="profile-split">
        <section className="panel">
          <div className="section-head"><h2>Recent Activity</h2></div>
          <ul className="activity-list">
            {profile.activity.map((item) => (
              <li key={item.title}>
                <i className={item.tone} />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.amount}</span>
                </div>
                <time>{item.when}</time>
              </li>
            ))}
          </ul>
          <Link to="/my-bids">View All Activity</Link>
        </section>
        <section className="panel account-nav">
          {nav.map((item) => (
            <Link key={item.label} to={item.to}>
              <span>{item.icon} {item.label}</span>
              <span>{item.count} <ChevronRight size={16} /></span>
            </Link>
          ))}
          <button type="button" onClick={() => { signOut(); navigate('/login') }}>
            <span><LogOut size={18} /> Log Out</span>
            <ChevronRight size={16} />
          </button>
          {user ? <p className="hint">Signed in as {user.email}</p> : <p className="hint">You are signed out.</p>}
        </section>
      </div>
    </div>
  )
}

function statIcon(label: string) {
  if (label.startsWith('Active')) return <Box size={18} />
  if (label.startsWith('Auctions')) return <Award size={18} />
  if (label.startsWith('Completed')) return <Check size={18} />
  return <CircleDollarSign size={18} />
}

import { endsAtFromLabel, formatTimeLeft, matchesAuction, paginate, sortAuctions, suggestedBids, type AuctionQuery, type BidQuery } from './query'
import { seedAuctions, type ActivityRecord, type AuctionRecord, type UserBidRecord, type UserRecord } from './seed'
import { initialsFromName, validateAuctionDraft, validateBidAmount, validateLogin, validateSignup, type FieldErrors } from './validation'

export type PublicUser = {
  id: string
  name: string
  email: string
  initials: string
  displayName: string
  handle: string
}

export type AuctionView = Omit<AuctionRecord, 'endsAt'> & {
  timeLeft: string
  suggestedBids: number[]
}

const DEMO_ID = 'user-alex'

export function seedUser(passwordHash: string): UserRecord {
  return {
    id: DEMO_ID,
    name: 'Alex Morgan',
    email: 'alex@auctionly.com',
    passwordHash,
    initials: 'AM',
    displayName: 'TechTrader_AU',
    handle: '@techtrader_au',
    bio: 'Tech enthusiast and gadget collector. Buying and selling quality electronics since 2023. Fast shipping, careful packaging guaranteed.',
    location: 'Melbourne, VIC',
    memberSince: 'March 2023',
    rating: 4.9,
    reviews: 127,
    avatar: 'profile',
    watchIds: [],
    bids: [
      { id: 'bid-macbook', auctionId: 'macbook-pro-14', status: 'leading', yourBid: 650, updatedAt: '2026-10-17T04:00:00.000Z' },
      { id: 'bid-sony', auctionId: 'sony-headphones', status: 'outbid', yourBid: 255, updatedAt: '2026-10-16T04:00:00.000Z' },
      { id: 'bid-canon', auctionId: 'canon-ae1', status: 'ending', yourBid: 185, updatedAt: '2026-10-17T06:00:00.000Z' },
      { id: 'bid-keychron', auctionId: 'keychron-q1', status: 'outbid', yourBid: 130, updatedAt: '2026-10-15T04:00:00.000Z' },
      { id: 'won-aeron', auctionId: 'aeron-chair', status: 'won', yourBid: 620, updatedAt: '2026-10-02T04:00:00.000Z' },
      { id: 'won-watch', auctionId: 'chronograph', status: 'won', yourBid: 950, updatedAt: '2026-09-28T04:00:00.000Z' },
      { id: 'lost-fuji', auctionId: 'fuji-x100v', status: 'lost', yourBid: 1100, updatedAt: '2026-10-08T04:00:00.000Z' },
    ],
    activity: [
      { title: 'Sony WH-1000XM5 Headphones', amount: '$265.00', when: '2 hours ago', tone: 'bid' },
      { title: 'MacBook Pro 14-inch', amount: '$650.00', when: '3 hours ago', tone: 'bid' },
      { title: 'Canon AE-1 Film Camera', amount: '$50.00', when: 'Yesterday', tone: 'won' },
      { title: 'Keychron Q1 Pro', amount: '@bargain_hunter', when: '2 days ago', tone: 'outbid' },
    ],
    notifications: [
      { id: 'n1', text: 'You are the highest bidder on MacBook Pro 14-inch.' },
      { id: 'n2', text: 'You were outbid on Sony WH-1000XM5 Headphones.' },
      { id: 'n3', text: 'Canon AE-1 Film Camera ends in 12 minutes.' },
    ],
    stats: [
      { label: 'Active Listings', value: '14' },
      { label: 'Auctions Won', value: '47' },
      { label: 'Completed Tx', value: '89' },
      { label: 'Total Earnings', value: '$12,450' },
    ],
  }
}

export class CatalogService {
  auctions: AuctionRecord[] = seedAuctions()
  users: UserRecord[] = []

  replaceAll(auctions: AuctionRecord[], users: UserRecord[]) {
    this.auctions = auctions
    this.users = users
  }

  toView(auction: AuctionRecord, now = Date.now()): AuctionView {
    const { endsAt, ...rest } = auction
    const ended = new Date(endsAt).getTime() <= now
    return {
      ...rest,
      timeLeft: ended ? 'Ended' : formatTimeLeft(endsAt, now),
      suggestedBids: suggestedBids(auction.currentBid, auction.increment),
    }
  }

  home() {
    return {
      endingSoon: this.auctions.filter((item) => item.homeSection === 'ending').map((item) => this.toView(item)),
      recentlyAdded: this.auctions.filter((item) => item.homeSection === 'recent').map((item) => this.toView(item)),
    }
  }

  search(query: AuctionQuery, now = Date.now()) {
    const live = this.auctions.filter((item) => item.status === 'live')
    const matched = sortAuctions(live.filter((item) => matchesAuction(item, query, now)), query.sort, now)
    const page = paginate(matched, query.page, query.pageSize)
    return { ...page, items: page.items.map((item) => this.toView(item, now)) }
  }

  getAuction(id: string) {
    const auction = this.auctions.find((item) => item.id === id)
    return auction ? this.toView(auction) : null
  }

  findUserByEmail(email: string) {
    return this.users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase()) ?? null
  }

  findUser(id: string) {
    return this.users.find((user) => user.id === id) ?? null
  }

  publicUser(user: UserRecord): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      initials: user.initials,
      displayName: user.displayName,
      handle: user.handle,
    }
  }

  addUser(user: UserRecord) {
    this.users.push(user)
  }

  checkLogin(input: { email?: string; password?: string }): FieldErrors {
    return validateLogin(input)
  }

  checkSignup(input: Parameters<typeof validateSignup>[0]): FieldErrors {
    const errors = validateSignup(input)
    if (!errors.email && input.email && this.findUserByEmail(input.email)) errors.email = 'An account with that email already exists'
    return errors
  }

  createListing(userId: string, input: {
    title?: string
    category?: string
    condition?: string
    description?: string
    startingPrice?: number | null
    reservePrice?: number | null
    location?: string
    pickup?: boolean
    domestic?: boolean
    international?: boolean
    pickupNotes?: string
    durationDays?: number
    photos?: string[]
    publish?: boolean
  }): { errors: FieldErrors } | { auction: AuctionView } {
    const errors = validateAuctionDraft(input)
    if (Object.keys(errors).length > 0) return { errors }
    const user = this.findUser(userId)
    const id = `auction-${Date.now()}`
    const days = input.durationDays && input.durationDays > 0 ? input.durationDays : 7
    const record: AuctionRecord = {
      id,
      title: input.title!.trim(),
      location: input.location!.trim(),
      currentBid: input.startingPrice!,
      bidCount: 0,
      endsAt: endsAtFromLabel(`${days}d`, Date.now()),
      image: input.photos?.[0] || 'upload-a',
      images: input.photos?.length ? input.photos : undefined,
      category: input.category!,
      condition: input.condition!,
      seller: user?.displayName || user?.name || 'You',
      sellerHandle: user?.handle,
      sellerAvatar: user?.avatar,
      recentlyAdded: true,
      endingSoon: days <= 1,
      description: input.description!.trim(),
      increment: 5,
      startPrice: input.startingPrice!,
      reservePrice: input.reservePrice ?? undefined,
      shipping: input.pickup ? 'Local pickup' : input.domestic ? 'Domestic shipping' : 'International shipping',
      payment: 'Auctionly Secure Pay',
      history: [],
      ownerId: userId,
      status: input.publish === false ? 'draft' : 'live',
      durationDays: days,
      pickup: input.pickup,
      domestic: input.domestic,
      international: input.international,
      pickupNotes: input.pickupNotes,
    }
    this.auctions.unshift(record)
    return { auction: this.toView(record) }
  }

  placeBid(userId: string, auctionId: string, amount: number | null): { error: string } | { auction: AuctionView } {
    const auction = this.auctions.find((item) => item.id === auctionId)
    if (!auction || auction.status !== 'live') return { error: 'Auction not found' }
    const problem = validateBidAmount(amount, auction.currentBid, auction.increment)
    if (problem || amount === null) return { error: problem ?? 'Enter a valid bid amount' }
    const user = this.findUser(userId)
    auction.history = auction.history.map((row) => ({ ...row, highest: false }))
    auction.history.unshift({
      bidder: `${user?.handle?.replace('@', '') || 'you'} (You)`,
      amount,
      time: 'Just now',
      highest: true,
      userId,
    })
    auction.currentBid = amount
    auction.bidCount += 1
    if (user) {
      for (const other of this.users) {
        if (other.id === userId) continue
        other.bids = other.bids.map((bid) => bid.auctionId === auctionId && bid.status !== 'won' && bid.status !== 'lost' ? { ...bid, status: 'outbid' } : bid)
      }
      const existing = user.bids.find((bid) => bid.auctionId === auctionId && bid.status !== 'won' && bid.status !== 'lost')
      if (existing) {
        existing.yourBid = amount
        existing.status = 'leading'
        existing.updatedAt = new Date().toISOString()
      } else {
        user.bids.unshift({ id: `bid-${Date.now()}`, auctionId, status: 'leading', yourBid: amount, updatedAt: new Date().toISOString() })
      }
      const activity: ActivityRecord = { title: auction.title, amount: `$${amount.toFixed(2)}`, when: 'Just now', tone: 'bid' }
      user.activity = [activity, ...user.activity].slice(0, 8)
    }
    return { auction: this.toView(auction) }
  }

  myBids(userId: string, query: BidQuery) {
    const user = this.findUser(userId)
    if (!user) return { page: 1, pages: 1, total: 0, items: [] }
    const active = new Set(['leading', 'outbid', 'ending'])
    let rows = user.bids.filter((bid) => (query.status === 'active' ? active.has(bid.status) : bid.status === query.status))
    if (query.category && query.category !== 'All Categories') {
      rows = rows.filter((bid) => this.auctions.find((auction) => auction.id === bid.auctionId)?.category === query.category)
    }
    const sorted = [...rows].sort((a, b) => compareBids(a, b, query.sort, this.auctions))
    const page = paginate(sorted, query.page, query.pageSize)
    return {
      ...page,
      counts: {
        active: user.bids.filter((bid) => active.has(bid.status)).length,
        won: user.bids.filter((bid) => bid.status === 'won').length,
        lost: user.bids.filter((bid) => bid.status === 'lost').length,
      },
      items: page.items.map((bid) => this.bidView(bid)),
    }
  }

  private bidView(bid: UserBidRecord) {
    const auction = this.auctions.find((item) => item.id === bid.auctionId)
    return {
      id: bid.id,
      auctionId: bid.auctionId,
      title: auction?.title ?? 'Auction',
      image: auction?.image ?? '',
      category: auction?.category ?? '',
      status: bid.status,
      timeLeft: !auction
      ? ''
      : bid.status === 'won' || bid.status === 'lost'
        ? `Ended ${new Date(bid.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        : `${this.toView(auction).timeLeft} remaining`,
      currentBid: auction?.currentBid ?? bid.yourBid,
      yourBid: bid.yourBid,
      bidCount: auction?.bidCount ?? 0,
    }
  }

  watchIds(userId: string) {
    return this.findUser(userId)?.watchIds ?? []
  }

  toggleWatch(userId: string, auctionId: string) {
    const user = this.findUser(userId)
    if (!user) return []
    user.watchIds = user.watchIds.includes(auctionId)
      ? user.watchIds.filter((id) => id !== auctionId)
      : [...user.watchIds, auctionId]
    return user.watchIds
  }

  profile(userId: string) {
    const user = this.findUser(userId)
    if (!user) return null
    return {
      name: user.displayName,
      handle: user.handle,
      location: user.location,
      memberSince: user.memberSince,
      rating: user.rating,
      reviews: user.reviews,
      bio: user.bio,
      avatar: user.avatar,
      email: user.email,
      stats: user.stats,
      activity: user.activity,
    }
  }

  updateProfile(userId: string, patch: { name?: string; bio?: string }) {
    const user = this.findUser(userId)
    if (!user) return null
    if (patch.name?.trim()) {
      user.displayName = patch.name.trim()
      user.initials = initialsFromName(patch.name)
    }
    if (typeof patch.bio === 'string') user.bio = patch.bio
    return this.profile(userId)
  }

  notifications(userId: string) {
    return this.findUser(userId)?.notifications ?? []
  }
}

function compareBids(a: UserBidRecord, b: UserBidRecord, sort: BidQuery['sort'], auctions: AuctionRecord[]) {
  const left = auctions.find((item) => item.id === a.auctionId)
  const right = auctions.find((item) => item.id === b.auctionId)
  if (sort === 'highest') return (right?.currentBid ?? 0) - (left?.currentBid ?? 0)
  if (sort === 'recent') return b.updatedAt.localeCompare(a.updatedAt)
  return (left?.endsAt ?? '').localeCompare(right?.endsAt ?? '')
}

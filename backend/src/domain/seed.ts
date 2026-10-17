import { endsAtFromLabel, type AuctionQuery } from './query'

export type BidHistoryEntry = {
  bidder: string
  amount: number
  time: string
  highest: boolean
  userId?: string
}

export type AuctionRecord = {
  id: string
  title: string
  location: string
  currentBid: number
  homeBid?: number
  bidCount: number
  homeBidCount?: number
  endsAt: string
  image: string
  images?: string[]
  category: string
  condition: string
  seller: string
  sellerHandle?: string
  sellerAvatar?: string
  rating?: number
  reviews?: number
  recentlyAdded: boolean
  endingSoon: boolean
  homeSection?: 'ending' | 'recent'
  description: string
  increment: number
  startPrice?: number
  started?: string
  ends?: string
  shipping?: string
  returns?: string
  payment?: string
  history: BidHistoryEntry[]
  ownerId?: string
  status: 'live' | 'draft'
  durationDays?: number
  pickup?: boolean
  domestic?: boolean
  international?: boolean
  pickupNotes?: string
  reservePrice?: number
}

export type UserBidRecord = {
  id: string
  auctionId: string
  status: 'leading' | 'outbid' | 'ending' | 'won' | 'lost'
  yourBid: number
  updatedAt: string
}

export type ActivityRecord = {
  title: string
  amount: string
  when: string
  tone: 'bid' | 'won' | 'outbid'
}

export type UserRecord = {
  id: string
  name: string
  email: string
  passwordHash: string
  initials: string
  displayName: string
  handle: string
  bio: string
  location: string
  memberSince: string
  rating: number
  reviews: number
  avatar: string
  watchIds: string[]
  bids: UserBidRecord[]
  activity: ActivityRecord[]
  notifications: { id: string; text: string }[]
  stats: { label: string; value: string }[]
}

const now = Date.parse('2026-10-17T07:00:00.000Z')

function auction(partial: Omit<AuctionRecord, 'endsAt' | 'history' | 'status'> & { timeLeft: string; history?: BidHistoryEntry[] }): AuctionRecord {
  const { timeLeft, history, ...rest } = partial
  return { ...rest, endsAt: endsAtFromLabel(timeLeft, now), history: history ?? [], status: 'live' }
}

export function seedAuctions(): AuctionRecord[] {
  return [
    auction({
      id: 'leather-club-chair', title: 'Vintage 1970s Leather Club Chair', location: 'Portland, OR',
      currentBid: 320, homeBid: 285, bidCount: 14, timeLeft: '2h 45m', image: 'chair',
      category: 'Furniture', condition: 'Used', seller: 'Neighborhood Finds', recentlyAdded: false,
      endingSoon: true, homeSection: 'ending', increment: 10,
      description: 'A well-kept 1970s leather club chair with a deep seat and original patina. Local pickup in Portland.',
    }),
    auction({
      id: 'sony-a7', title: 'Sony Alpha a7 III Mirrorless Camera (Body Only)', location: 'Seattle, WA',
      currentBid: 850, homeBid: 920, bidCount: 28, homeBidCount: 22, timeLeft: '4h 12m', image: 'camera',
      category: 'Electronics', condition: 'Used', seller: 'Lens & Co', recentlyAdded: false,
      endingSoon: true, homeSection: 'ending', increment: 25,
      description: 'Sony Alpha a7 III body in excellent working order. Shutter count available on request. Body only, no lens.',
    }),
    auction({
      id: 'fantasy-collection', title: '1982 First Edition Hardcover Fantasy Collection', location: 'Austin, TX',
      currentBid: 110, homeBid: 145, bidCount: 9, homeBidCount: 8, timeLeft: '6h 50m', image: 'books',
      category: 'Books', condition: 'Used', seller: 'Shelf Life', recentlyAdded: false,
      endingSoon: true, homeSection: 'ending', increment: 5,
      description: 'A matched set of 1982 first-edition hardcover fantasy novels. Jackets present, light shelf wear.',
    }),
    auction({
      id: 'oak-table', title: 'Handmade Oak Dining Table (Seats 6)', location: 'Denver, CO',
      currentBid: 420, bidCount: 18, homeBidCount: 5, timeLeft: '1d 3h', image: 'table',
      category: 'Furniture', condition: 'Used', seller: 'Mile High Made', recentlyAdded: true,
      endingSoon: false, homeSection: 'recent', increment: 20,
      description: 'Solid oak dining table seating six. Hand-finished top, sturdy trestle base. Local pickup in Denver.',
    }),
    auction({
      id: 'rockhopper', title: 'Specialized Rockhopper Comp Mountain Bike', location: 'Boulder, CO',
      currentBid: 550, homeBid: 510, bidCount: 22, homeBidCount: 19, timeLeft: '1d 8h', image: 'bike',
      category: 'Sports', condition: 'Used', seller: 'Front Range Cycles', recentlyAdded: true,
      endingSoon: false, homeSection: 'recent', increment: 15,
      description: 'Specialized Rockhopper Comp, recently serviced. Hydraulic brakes and fresh tires. Size medium.',
    }),
    auction({
      id: 'letterman-jacket', title: 'Rare 1960s Wool Varsity Letterman Jacket', location: 'Brooklyn, NY',
      currentBid: 185, homeBid: 180, bidCount: 11, timeLeft: '1d 10h', image: 'jacket',
      category: 'Clothing', condition: 'Used', seller: 'Archive Thread', recentlyAdded: true,
      endingSoon: false, homeSection: 'recent', increment: 10,
      description: '1960s wool varsity jacket with original chenille lettering. Rare size, honest vintage wear.',
    }),
    auction({
      id: 'fuji-x100v', title: 'Fujifilm X100V Digital Camera - Silver', location: 'Chicago, IL',
      currentBid: 1450, bidCount: 37, timeLeft: '3h 15m', image: 'fuji',
      category: 'Electronics', condition: 'Used', seller: 'Loop Cameras', recentlyAdded: false,
      endingSoon: true, increment: 25,
      description: 'Silver Fujifilm X100V with low shutter count and original packaging. Includes lens cap and strap.',
    }),
    auction({
      id: 'aeron-chair', title: 'Herman Miller Aeron Chair - Size B', location: 'San Francisco, CA',
      currentBid: 620, bidCount: 19, timeLeft: '1d 2h', image: 'aeron',
      category: 'Furniture', condition: 'Refurbished', seller: 'Desk Supply', recentlyAdded: true,
      endingSoon: false, increment: 20,
      description: 'Refurbished Herman Miller Aeron, size B, with posture-fit adjustment. Cleaned and inspected.',
    }),
    auction({
      id: 'chronograph', title: 'Vintage Mechanical Chronograph Watch', location: 'Boston, MA',
      currentBid: 950, bidCount: 42, timeLeft: '18h 5m', image: 'watch',
      category: 'Collectibles', condition: 'Used', seller: 'Harbor Time', recentlyAdded: false,
      endingSoon: true, increment: 25,
      description: 'Vintage mechanical chronograph, recently serviced. Running and keeping time. Includes a leather strap.',
    }),
    auction({
      id: 'macbook-pro-14', title: 'MacBook Pro 14-inch (M3 Pro, 2024)', location: 'Melbourne, VIC',
      currentBid: 650, bidCount: 12, timeLeft: '2h 31m', image: 'macbook',
      images: ['macbook', 'macbook-2', 'macbook-3', 'macbook-4', 'macbook-5'],
      category: 'Electronics', condition: 'Excellent', seller: 'TechTrader_AU', sellerHandle: '@techtrader_au',
      sellerAvatar: 'seller', rating: 4.9, reviews: 127, recentlyAdded: false, endingSoon: true, increment: 25,
      startPrice: 200, started: 'Sep 23, 2026, 10:00 AM', ends: 'Sep 26, 2026, 3:00 PM',
      shipping: 'Australia-wide ($15 flat rate)', returns: '3-day inspection period', payment: 'Auctionly Secure Pay',
      description: 'Apple MacBook Pro 14-inch with M3 Pro chip, 18GB RAM, 512GB SSD. Space Black finish. Purchased March 2024, excellent condition with original box and charger. Battery cycle count: 47. AppleCare+ until March 2026. Minor cosmetic mark on bottom case, see photo 4.',
      history: [
        { bidder: 'you_user2024 (You)', amount: 650, time: '12 min ago', highest: true, userId: 'user-alex' },
        { bidder: 'bargain_hunter', amount: 625, time: '28 min ago', highest: false },
        { bidder: 'tech_deals99', amount: 600, time: '1 hour ago', highest: false },
        { bidder: 'laptop_lover', amount: 550, time: '2 hours ago', highest: false },
        { bidder: 'early_bird_42', amount: 500, time: '5 hours ago', highest: false },
      ],
    }),
    auction({
      id: 'sony-headphones', title: 'Sony WH-1000XM5 Headphones', location: 'Melbourne, VIC',
      currentBid: 280, bidCount: 8, timeLeft: '5h 12m', image: 'headphones',
      category: 'Electronics', condition: 'Used', seller: 'TechTrader_AU', recentlyAdded: false,
      endingSoon: true, increment: 10,
      description: 'Sony WH-1000XM5 wireless headphones in black. Light wear, both ear cups and the case included.',
    }),
    auction({
      id: 'canon-ae1', title: 'Canon AE-1 Film Camera (1978)', location: 'Melbourne, VIC',
      currentBid: 185, bidCount: 6, timeLeft: '12m 45s', image: 'film',
      category: 'Collectibles', condition: 'Used', seller: 'Harbor Time', recentlyAdded: false,
      endingSoon: true, increment: 5,
      description: 'Canon AE-1 from 1978. Shutter fires, light meter works, includes a 50mm lens.',
    }),
    auction({
      id: 'keychron-q1', title: 'Keychron Q1 Pro Mechanical Keyboard', location: 'Melbourne, VIC',
      currentBid: 145, bidCount: 5, timeLeft: '1d 4h', image: 'keyboard',
      category: 'Electronics', condition: 'Used', seller: 'Desk Supply', recentlyAdded: true,
      endingSoon: false, increment: 5,
      description: 'Keychron Q1 Pro with brown switches. Wireless, includes the cable and keycap puller.',
    }),
  ]
}

export function emptyAuctionQuery(overrides: Partial<AuctionQuery> = {}): AuctionQuery {
  return {
    search: '',
    categories: [],
    conditions: [],
    location: '',
    minPrice: null,
    maxPrice: null,
    ending: '',
    sort: 'ending',
    page: 1,
    pageSize: 9,
    savedIds: undefined,
    ...overrides,
  }
}

export const categories = ['Electronics', 'Furniture', 'Books', 'Clothing', 'Sports', 'Home & Garden', 'Collectibles']
export const conditions = ['New', 'Used', 'Refurbished', 'Excellent']

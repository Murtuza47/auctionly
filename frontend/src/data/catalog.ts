import hero from '../assets/hero.png'
import chair from '../assets/chair.png'
import camera from '../assets/camera.png'
import books from '../assets/books.png'
import table from '../assets/table.png'
import bike from '../assets/bike.png'
import jacket from '../assets/jacket.png'
import fuji from '../assets/fuji.png'
import aeron from '../assets/aeron.png'
import watch from '../assets/watch.png'
import macbookHero from '../assets/macbook-2.png'
import macbookThumb1 from '../assets/macbook-3.png'
import macbookThumb2 from '../assets/macbook-4.png'
import macbookThumb3 from '../assets/macbook-5.png'
import macbookThumb4 from '../assets/macbook-6.png'
import sellerPhoto from '../assets/macbook-7.png'
import headphones from '../assets/bid-3.png'
import filmCamera from '../assets/bid-4.png'
import keyboard from '../assets/bid-5.png'
import profilePhoto from '../assets/profile-extra.png'
import headerAvatar from '../assets/avatar.png'
import uploadA from '../assets/upload-2.png'
import uploadB from '../assets/upload-3.png'
import uploadC from '../assets/upload-4.png'

export type Auction = {
  id: string
  title: string
  location: string
  currentBid: number
  homeBid?: number
  bidCount: number
  homeBidCount?: number
  timeLeft: string
  image: string
  images?: string[]
  category: string
  condition: string
  seller: string
  sellerHandle?: string
  sellerAvatar?: string
  rating?: number
  reviews?: number
  history?: { bidder: string; amount: number; time: string; highest: boolean }[]
  suggestedBids?: number[]
  recentlyAdded: boolean
  endingSoon: boolean
  description: string
  increment: number
  startPrice?: number
  started?: string
  ends?: string
  shipping?: string
  returns?: string
  payment?: string
}

export const categories = [
  'Electronics',
  'Furniture',
  'Books',
  'Clothing',
  'Sports',
  'Home & Garden',
  'Collectibles',
] as const

export const conditions = ['New', 'Used', 'Refurbished', 'Excellent'] as const

export const heroImage = hero
export const profileImage = profilePhoto
export const userAvatar = headerAvatar
export const sampleUploads = [uploadA, uploadB, uploadC]

const imageKeys: Record<string, string> = {
  chair,
  camera,
  books,
  table,
  bike,
  jacket,
  fuji,
  aeron,
  watch,
  macbook: macbookHero,
  'macbook-2': macbookHero,
  'macbook-3': macbookThumb1,
  'macbook-4': macbookThumb2,
  'macbook-5': macbookThumb3,
  'macbook-6': macbookThumb4,
  seller: sellerPhoto,
  headphones,
  film: filmCamera,
  keyboard,
  profile: profilePhoto,
  avatar: headerAvatar,
  'upload-a': uploadA,
  'upload-b': uploadB,
  'upload-c': uploadC,
}

export function resolveImage(src: string | undefined): string {
  if (!src) return ''
  if (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('http:') || src.startsWith('https:') || src.includes('/')) return src
  return imageKeys[src] ?? src
}

export function withImages<T extends { image?: string; images?: string[]; sellerAvatar?: string; avatar?: string }>(item: T): T {
  return {
    ...item,
    image: item.image ? resolveImage(item.image) : item.image,
    images: item.images?.map((image) => resolveImage(image)),
    sellerAvatar: item.sellerAvatar ? resolveImage(item.sellerAvatar) : item.sellerAvatar,
    avatar: item.avatar ? resolveImage(item.avatar) : item.avatar,
  }
}

export const auctions: Auction[] = [
  {
    id: 'leather-club-chair',
    title: 'Vintage 1970s Leather Club Chair',
    location: 'Portland, OR',
    currentBid: 320,
    homeBid: 285,
    bidCount: 14,
    timeLeft: '2h 45m',
    image: chair,
    category: 'Furniture',
    condition: 'Used',
    seller: 'Neighborhood Finds',
    recentlyAdded: false,
    endingSoon: true,
    increment: 10,
    description: 'A well-kept 1970s leather club chair with a deep seat and original patina. Local pickup in Portland.',
  },
  {
    id: 'sony-a7',
    title: 'Sony Alpha a7 III Mirrorless Camera (Body Only)',
    location: 'Seattle, WA',
    currentBid: 850,
    homeBid: 920,
    bidCount: 28,
    homeBidCount: 22,
    timeLeft: '4h 12m',
    image: camera,
    category: 'Electronics',
    condition: 'Used',
    seller: 'Lens & Co',
    recentlyAdded: false,
    endingSoon: true,
    increment: 25,
    description: 'Sony Alpha a7 III body in excellent working order. Shutter count available on request. Body only, no lens.',
  },
  {
    id: 'fantasy-collection',
    title: '1982 First Edition Hardcover Fantasy Collection',
    location: 'Austin, TX',
    currentBid: 110,
    homeBid: 145,
    bidCount: 9,
    homeBidCount: 8,
    timeLeft: '6h 50m',
    image: books,
    category: 'Books',
    condition: 'Used',
    seller: 'Shelf Life',
    recentlyAdded: false,
    endingSoon: true,
    increment: 5,
    description: 'A matched set of 1982 first-edition hardcover fantasy novels. Jackets present, light shelf wear.',
  },
  {
    id: 'oak-table',
    title: 'Handmade Oak Dining Table (Seats 6)',
    location: 'Denver, CO',
    currentBid: 420,
    bidCount: 18,
    homeBidCount: 5,
    timeLeft: '1d 3h',
    image: table,
    category: 'Furniture',
    condition: 'Used',
    seller: 'Mile High Made',
    recentlyAdded: true,
    endingSoon: false,
    increment: 20,
    description: 'Solid oak dining table seating six. Hand-finished top, sturdy trestle base. Local pickup in Denver.',
  },
  {
    id: 'rockhopper',
    title: 'Specialized Rockhopper Comp Mountain Bike',
    location: 'Boulder, CO',
    currentBid: 550,
    homeBid: 510,
    bidCount: 22,
    homeBidCount: 19,
    timeLeft: '1d 8h',
    image: bike,
    category: 'Sports',
    condition: 'Used',
    seller: 'Front Range Cycles',
    recentlyAdded: true,
    endingSoon: false,
    increment: 15,
    description: 'Specialized Rockhopper Comp, recently serviced. Hydraulic brakes and fresh tires. Size medium.',
  },
  {
    id: 'letterman-jacket',
    title: 'Rare 1960s Wool Varsity Letterman Jacket',
    location: 'Brooklyn, NY',
    currentBid: 185,
    homeBid: 180,
    bidCount: 11,
    timeLeft: '1d 10h',
    image: jacket,
    category: 'Clothing',
    condition: 'Used',
    seller: 'Archive Thread',
    recentlyAdded: true,
    endingSoon: false,
    increment: 10,
    description: '1960s wool varsity jacket with original chenille lettering. Rare size, honest vintage wear.',
  },
  {
    id: 'fuji-x100v',
    title: 'Fujifilm X100V Digital Camera - Silver',
    location: 'Chicago, IL',
    currentBid: 1450,
    bidCount: 37,
    timeLeft: '3h 15m',
    image: fuji,
    category: 'Electronics',
    condition: 'Used',
    seller: 'Loop Cameras',
    recentlyAdded: false,
    endingSoon: true,
    increment: 25,
    description: 'Silver Fujifilm X100V with low shutter count and original packaging. Includes lens cap and strap.',
  },
  {
    id: 'aeron-chair',
    title: 'Herman Miller Aeron Chair - Size B',
    location: 'San Francisco, CA',
    currentBid: 620,
    bidCount: 19,
    timeLeft: '1d 2h',
    image: aeron,
    category: 'Furniture',
    condition: 'Refurbished',
    seller: 'Desk Supply',
    recentlyAdded: true,
    endingSoon: false,
    increment: 20,
    description: 'Refurbished Herman Miller Aeron, size B, with posture-fit adjustment. Cleaned and inspected.',
  },
  {
    id: 'chronograph',
    title: 'Vintage Mechanical Chronograph Watch',
    location: 'Boston, MA',
    currentBid: 950,
    bidCount: 42,
    timeLeft: '18h 5m',
    image: watch,
    category: 'Collectibles',
    condition: 'Used',
    seller: 'Harbor Time',
    recentlyAdded: false,
    endingSoon: true,
    increment: 25,
    description: 'Vintage mechanical chronograph, recently serviced. Running and keeping time. Includes a leather strap.',
  },
  {
    id: 'macbook-pro-14',
    title: 'MacBook Pro 14-inch (M3 Pro, 2024)',
    location: 'Melbourne, VIC',
    currentBid: 650,
    bidCount: 12,
    timeLeft: '2h 31m',
    image: macbookHero,
    images: [macbookHero, macbookThumb1, macbookThumb2, macbookThumb3, macbookThumb4],
    category: 'Electronics',
    condition: 'Excellent',
    seller: 'TechTrader_AU',
    sellerHandle: '@techtrader_au',
    rating: 4.9,
    reviews: 127,
    recentlyAdded: false,
    endingSoon: true,
    increment: 25,
    startPrice: 200,
    started: 'Sep 23, 2026, 10:00 AM',
    ends: 'Sep 26, 2026, 3:00 PM',
    shipping: 'Australia-wide ($15 flat rate)',
    returns: '3-day inspection period',
    payment: 'Auctionly Secure Pay',
    description:
      'Apple MacBook Pro 14-inch with M3 Pro chip, 18GB RAM, 512GB SSD. Space Black finish. Purchased March 2024, excellent condition with original box and charger. Battery cycle count: 47. AppleCare+ until March 2026. Minor cosmetic mark on bottom case, see photo 4.',
  },
]

export const sellerAvatar = sellerPhoto

export type BidStatus = 'leading' | 'outbid' | 'ending' | 'won' | 'lost'

export type UserBid = {
  id: string
  auctionId: string
  title: string
  image: string
  category: string
  status: BidStatus
  timeLeft: string
  currentBid: number
  yourBid: number
  bidCount: number
}

export const userBids: UserBid[] = [
  {
    id: 'bid-macbook',
    auctionId: 'macbook-pro-14',
    title: 'MacBook Pro 14-inch (M3 Pro, 2024)',
    image: macbookHero,
    category: 'Electronics',
    status: 'leading',
    timeLeft: '2h 31m remaining',
    currentBid: 650,
    yourBid: 650,
    bidCount: 12,
  },
  {
    id: 'bid-sony',
    auctionId: 'sony-headphones',
    title: 'Sony WH-1000XM5 Headphones',
    image: headphones,
    category: 'Electronics',
    status: 'outbid',
    timeLeft: '5h 12m remaining',
    currentBid: 280,
    yourBid: 255,
    bidCount: 8,
  },
  {
    id: 'bid-canon',
    auctionId: 'canon-ae1',
    title: 'Canon AE-1 Film Camera (1978)',
    image: filmCamera,
    category: 'Collectibles',
    status: 'ending',
    timeLeft: '12m 45s remaining',
    currentBid: 185,
    yourBid: 185,
    bidCount: 6,
  },
  {
    id: 'bid-keychron',
    auctionId: 'keychron-q1',
    title: 'Keychron Q1 Pro Mechanical Keyboard',
    image: keyboard,
    category: 'Electronics',
    status: 'outbid',
    timeLeft: '1d 4h remaining',
    currentBid: 145,
    yourBid: 130,
    bidCount: 5,
  },
]

export const bidHistory = [
  { bidder: 'you_user2024 (You)', amount: 650, time: '12 min ago', highest: true },
  { bidder: 'bargain_hunter', amount: 625, time: '28 min ago', highest: false },
  { bidder: 'tech_deals99', amount: 600, time: '1 hour ago', highest: false },
  { bidder: 'laptop_lover', amount: 550, time: '2 hours ago', highest: false },
  { bidder: 'early_bird_42', amount: 500, time: '5 hours ago', highest: false },
]

export function getAuction(id: string | undefined): Auction | undefined {
  return auctions.find((auction) => auction.id === id)
}

export const profile = {
  name: 'TechTrader_AU',
  handle: '@techtrader_au',
  location: 'Melbourne, VIC',
  memberSince: 'March 2023',
  rating: 4.9,
  reviews: 127,
  bio: 'Tech enthusiast and gadget collector. Buying and selling quality electronics since 2023. Fast shipping, careful packaging guaranteed.',
  stats: [
    { label: 'Active Listings', value: '14' },
    { label: 'Auctions Won', value: '47' },
    { label: 'Completed Tx', value: '89' },
    { label: 'Total Earnings', value: '$12,450' },
  ],
  activity: [
    { title: 'Sony WH-1000XM5 Headphones', amount: '$265.00', when: '2 hours ago', tone: 'bid' },
    { title: 'MacBook Pro 14-inch', amount: '$650.00', when: '3 hours ago', tone: 'bid' },
    { title: 'Canon AE-1 Film Camera', amount: '$50.00', when: 'Yesterday', tone: 'won' },
    { title: 'Keychron Q1 Pro', amount: '@bargain_hunter', when: '2 days ago', tone: 'outbid' },
  ],
}

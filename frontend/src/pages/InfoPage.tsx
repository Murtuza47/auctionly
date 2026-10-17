import { Link } from 'react-router-dom'

const pages = {
  how: {
    title: 'How It Works',
    lead: 'Discover, bid, and win high-quality items from trusted neighbors. No shipping headaches. Simple, secure local pickups.',
    blocks: [
      ['Browse auctions', 'Search local listings by category, location, price, and ending time.'],
      ['Place a bid', 'Enter at least the minimum next bid. Quick bids jump you ahead in one tap.'],
      ['Pick up locally', 'Win, pay with Auctionly Secure Pay, and collect the item from the seller.'],
    ],
  },
  help: {
    title: 'Help Center',
    lead: 'Answers for bidding, selling, and local pickup.',
    blocks: [
      ['Bidding', 'Your bid must meet the minimum increment. Leading bids are marked in green.'],
      ['Selling', 'Add up to 10 photos. The first image is the cover. Starting price must be at least $1.00.'],
      ['Fees & Rates', 'Sellers keep the hammer price minus a simple success fee shown before you publish.'],
    ],
  },
  trust: {
    title: 'Trust & Safety',
    lead: 'Trustworthy bidding, verified sellers, and secure transactions.',
    blocks: [
      ['Secure Pay', 'Payment is held until pickup is confirmed.'],
      ['Seller Protection', 'Verified accounts and a 3-day inspection window on shipped items.'],
      ['Local Pickups', 'Meet in a public place and confirm the item before releasing payment.'],
    ],
  },
  about: {
    title: 'About Auctionly',
    lead: "We're rebuilding local marketplace bidding. Buy and sell with total confidence right in your neighborhood.",
    blocks: [
      ['The community', 'Auctionly is a community-first auction platform for local and national sellers.'],
      ['Careers', 'We are a small team building calmer, clearer auctions. Open roles are posted here when we hire.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    lead: 'We collect the account, bid, and listing details needed to run an auction.',
    blocks: [
      ['What we store', 'Name, email, bids, watchlist, and listings you create in this session stay in your browser.'],
      ['What we share', 'Your public profile shows the display name and activity you choose to publish.'],
    ],
  },
  terms: {
    title: 'Terms of Service',
    lead: 'By creating an account you agree to bid and sell in good faith.',
    blocks: [
      ['Bids', 'A bid at or above the minimum increment is a commitment to buy if you win.'],
      ['Listings', 'Describe condition honestly, including defects called out in the photos.'],
    ],
  },
  guidelines: {
    title: 'Community Guidelines',
    lead: 'Keep auctions neighborly, accurate, and safe.',
    blocks: [
      ['Be accurate', 'Photos should show the real item, including marks and wear.'],
      ['Be respectful', 'Use messages and pickup arrangements the way you would with a neighbor.'],
    ],
  },
} as const

export function InfoPage({ id }: { id: keyof typeof pages }) {
  const page = pages[id]
  return (
    <article className="info-page">
      <h1>{page.title}</h1>
      <p className="lead">{page.lead}</p>
      {page.blocks.map(([heading, body]) => (
        <section key={heading}>
          <h2>{heading}</h2>
          <p>{body}</p>
        </section>
      ))}
      <Link className="btn btn-primary" to="/browse">Browse Auctions</Link>
    </article>
  )
}

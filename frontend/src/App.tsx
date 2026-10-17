import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { BottomNav, SiteFooter, SiteHeader } from './components/Chrome'
import { SessionProvider } from './context/SessionContext'
import { AuctionDetailsPage } from './pages/AuctionDetailsPage'
import { LoginPage, SignUpPage } from './pages/AuthPages'
import { BrowsePage } from './pages/BrowsePage'
import { CreateAuctionPage } from './pages/CreateAuctionPage'
import { HomePage } from './pages/HomePage'
import { InfoPage } from './pages/InfoPage'
import { MyBidsPage } from './pages/MyBidsPage'
import { ProfilePage } from './pages/ProfilePage'

function Shell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const selling = location.pathname.startsWith('/sell')
  return (
    <div className={`app-shell ${selling ? 'selling' : ''}`}>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      {selling ? null : <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Shell><HomePage /></Shell>} />
          <Route path="/browse" element={<Shell><BrowsePage /></Shell>} />
          <Route path="/auction/:id" element={<Shell><AuctionDetailsPage /></Shell>} />
          <Route path="/my-bids" element={<Shell><MyBidsPage /></Shell>} />
          <Route path="/profile" element={<Shell><ProfilePage /></Shell>} />
          <Route path="/sell" element={<Shell><CreateAuctionPage /></Shell>} />
          <Route path="/how-it-works" element={<Shell><InfoPage id="how" /></Shell>} />
          <Route path="/help" element={<Shell><InfoPage id="help" /></Shell>} />
          <Route path="/trust" element={<Shell><InfoPage id="trust" /></Shell>} />
          <Route path="/about" element={<Shell><InfoPage id="about" /></Shell>} />
          <Route path="/privacy" element={<Shell><InfoPage id="privacy" /></Shell>} />
          <Route path="/terms" element={<Shell><InfoPage id="terms" /></Shell>} />
          <Route path="/guidelines" element={<Shell><InfoPage id="guidelines" /></Shell>} />
          <Route path="/login" element={<Shell><LoginPage /></Shell>} />
          <Route path="/signup" element={<Shell><SignUpPage /></Shell>} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  )
}

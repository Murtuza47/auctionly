import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../api/client'
import { initialsFromName } from '../utils/format'

export type SessionUser = {
  id?: string
  name: string
  email: string
  initials: string
  displayName?: string
  handle?: string
}

type SessionValue = {
  user: SessionUser | null
  token: string | null
  savedIds: string[]
  remember: boolean
  notifications: string[]
  signIn: (user: SessionUser, remember: boolean) => void
  login: (email: string, password: string, remember: boolean) => Promise<Record<string, string> | null>
  register: (input: { name: string; email: string; password: string; confirmPassword: string; acceptedTerms: boolean }) => Promise<Record<string, string> | null>
  signOut: () => void
  toggleSaved: (id: string) => void
  isSaved: (id: string) => boolean
}

const SessionContext = createContext<SessionValue | null>(null)
const tokenKey = 'auctionly-token'

const demoUser: SessionUser = {
  name: 'Alex Morgan',
  email: 'alex@auctionly.com',
  initials: 'AM',
  displayName: 'TechTrader_AU',
  handle: '@techtrader_au',
}

type AuthPayload = { accessToken: string; user: { id: string; name: string; email: string; initials: string; displayName: string; handle: string } }

function readToken() {
  return localStorage.getItem(tokenKey) || sessionStorage.getItem(tokenKey)
}

function writeToken(token: string, remember: boolean) {
  localStorage.removeItem(tokenKey)
  sessionStorage.removeItem(tokenKey)
  ;(remember ? localStorage : sessionStorage).setItem(tokenKey, token)
}

function toSession(user: AuthPayload['user']): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    initials: user.initials || initialsFromName(user.name),
    displayName: user.displayName,
    handle: user.handle,
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(demoUser)
  const [token, setToken] = useState<string | null>(null)
  const [remember, setRemember] = useState(true)
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [notifications, setNotifications] = useState<string[]>([
    'You are the highest bidder on MacBook Pro 14-inch.',
    'You were outbid on Sony WH-1000XM5 Headphones.',
    'Canon AE-1 Film Camera ends in 12 minutes.',
  ])

  useEffect(() => {
    let ignore = false
    async function boot() {
      let current = readToken()
      if (!current) {
        const login = await api<AuthPayload>('/auth/login', {
          method: 'POST',
          body: { email: 'alex@auctionly.com', password: 'Auction1', remember: true },
        })
        if (login.ok) {
          current = login.data.accessToken
          writeToken(current, true)
          if (!ignore) setUser(toSession(login.data.user))
        }
      } else {
        const me = await api<{ user: AuthPayload['user'] }>('/auth/me', { token: current })
        if (me.ok && !ignore) setUser(toSession(me.data.user))
      }
      if (!ignore) setToken(current)
      if (current) {
        const watch = await api<{ items: { id: string }[] }>(`/auctions?saved=1&pageSize=50`, { token: current })
        const notes = await api<{ items: { text: string }[] }>('/me/notifications', { token: current })
        if (!ignore && watch.ok) setSavedIds(watch.data.items.map((item) => item.id))
        if (!ignore && notes.ok && notes.data.items.length) setNotifications(notes.data.items.map((item) => item.text))
      }
    }
    void boot()
    return () => {
      ignore = true
    }
  }, [])

  const value = useMemo<SessionValue>(() => {
    function applyAuth(payload: AuthPayload, shouldRemember: boolean) {
      writeToken(payload.accessToken, shouldRemember)
      setToken(payload.accessToken)
      setRemember(shouldRemember)
      setUser(toSession(payload.user))
    }

    return {
      user,
      token,
      savedIds,
      remember,
      notifications,
      signIn: (next, shouldRemember) => {
        setUser({ ...next, initials: next.initials || initialsFromName(next.name) })
        setRemember(shouldRemember)
      },
      login: async (email, password, shouldRemember) => {
        const result = await api<AuthPayload>('/auth/login', { method: 'POST', body: { email, password, remember: shouldRemember } })
        if (result.ok) {
          applyAuth(result.data, shouldRemember)
          return null
        }
        if (result.status === 0) {
          setUser({ name: 'Alex Morgan', email, initials: 'AM' })
          setRemember(shouldRemember)
          return null
        }
        return result.errors
      },
      register: async (input) => {
        const result = await api<AuthPayload>('/auth/register', { method: 'POST', body: input })
        if (result.ok) {
          applyAuth(result.data, true)
          return null
        }
        if (result.status === 0) {
          setUser({ name: input.name, email: input.email, initials: initialsFromName(input.name) })
          setRemember(true)
          return null
        }
        return result.errors
      },
      signOut: () => {
        localStorage.removeItem(tokenKey)
        sessionStorage.removeItem(tokenKey)
        setToken(null)
        setUser(null)
        setSavedIds([])
      },
      toggleSaved: (id) => {
        setSavedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
        if (!token) return
        void api<{ savedIds: string[] }>(`/me/watchlist/${id}`, { method: 'POST', token }).then((result) => {
          if (result.ok) setSavedIds(result.data.savedIds)
        })
      },
      isSaved: (id) => savedIds.includes(id),
    }
  }, [notifications, remember, savedIds, token, user])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext)
  if (!value) throw new Error('useSession must be used within SessionProvider')
  return value
}

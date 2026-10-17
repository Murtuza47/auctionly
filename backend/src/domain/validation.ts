import { categories, conditions } from './seed'

export type FieldErrors = Record<string, string>

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function passwordIssues(password: string): string | null {
  if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return 'Must be at least 8 characters with one uppercase and one number'
  }
  return null
}

export function validateLogin(input: { email?: string; password?: string }): FieldErrors {
  const errors: FieldErrors = {}
  const email = input.email?.trim() ?? ''
  if (!email) errors.email = 'Email address is required'
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address'
  if (!input.password) errors.password = 'Password is required'
  return errors
}

export function validateSignup(input: {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  acceptedTerms?: boolean
}): FieldErrors {
  const errors: FieldErrors = {}
  if (!input.name?.trim()) errors.name = 'Full name is required'
  const email = input.email?.trim() ?? ''
  if (!email) errors.email = 'Email address is required'
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address'
  if (!input.password) errors.password = 'Password is required'
  else {
    const issue = passwordIssues(input.password)
    if (issue) errors.password = issue
  }
  if (!input.confirmPassword) errors.confirmPassword = 'Confirm your password'
  else if (input.password !== input.confirmPassword) errors.confirmPassword = 'Passwords do not match'
  if (!input.acceptedTerms) errors.terms = 'Agree to the Terms of Service and Privacy Policy'
  return errors
}

export function validateBidAmount(amount: number | null, currentBid: number, increment: number): string | null {
  if (amount === null || !Number.isFinite(amount)) return 'Enter a valid bid amount'
  const minimum = Math.round((currentBid + increment) * 100) / 100
  if (amount < minimum) return `Bid must be at least ${minimum.toFixed(2)}`
  return null
}

export function validateAuctionDraft(input: {
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
}): FieldErrors {
  const errors: FieldErrors = {}
  const title = input.title?.trim() ?? ''
  if (!title) errors.title = 'Item title is required'
  else if (title.length > 100) errors.title = 'Title must be 100 characters or fewer'
  if (!input.category || !categories.includes(input.category)) errors.category = 'Select a category'
  if (!input.condition || !conditions.includes(input.condition)) errors.condition = 'Select a condition'
  const description = input.description?.trim() ?? ''
  if (!description) errors.description = 'Description is required'
  else if (description.length > 2000) errors.description = 'Description must be 2000 characters or fewer'
  if (input.startingPrice === null || input.startingPrice === undefined || !Number.isFinite(input.startingPrice)) {
    errors.startingPrice = 'Enter a starting price'
  } else if (input.startingPrice < 1) errors.startingPrice = 'Minimum starting price is $1.00'
  if (input.reservePrice !== null && input.reservePrice !== undefined) {
    if (!Number.isFinite(input.reservePrice)) errors.reservePrice = 'Enter a valid reserve price'
    else if (input.startingPrice !== null && input.startingPrice !== undefined && input.reservePrice < input.startingPrice) {
      errors.reservePrice = 'Reserve price must be at least the starting price'
    }
  }
  if (!input.location?.trim()) errors.location = 'Item location is required'
  if (!input.pickup && !input.domestic && !input.international) errors.shipping = 'Choose at least one shipping option'
  return errors
}

export function parseMoney(input: unknown): number | null {
  if (typeof input === 'number') return Number.isFinite(input) && input >= 0 ? Math.round(input * 100) / 100 : null
  if (typeof input !== 'string') return null
  const cleaned = input.replace(/[$,\s]/g, '')
  if (!cleaned) return null
  const value = Number(cleaned)
  if (!Number.isFinite(value) || value < 0) return null
  return Math.round(value * 100) / 100
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'A'
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'A'
}

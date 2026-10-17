import { nextMinimumBid, parseMoney } from './format'

export type FieldErrors = Record<string, string>

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function passwordIssues(password: string): string | null {
  if (password.length < 8) return 'Must be at least 8 characters with one uppercase and one number'
  if (!/[A-Z]/.test(password) || !/\d/.test(password)) {
    return 'Must be at least 8 characters with one uppercase and one number'
  }
  return null
}

export function validateLogin(input: { email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {}
  if (!input.email.trim()) errors.email = 'Email address is required'
  else if (!isValidEmail(input.email)) errors.email = 'Enter a valid email address'
  if (!input.password) errors.password = 'Password is required'
  return errors
}

export function validateSignup(input: {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptedTerms: boolean
}): FieldErrors {
  const errors: FieldErrors = {}
  if (!input.name.trim()) errors.name = 'Full name is required'
  if (!input.email.trim()) errors.email = 'Email address is required'
  else if (!isValidEmail(input.email)) errors.email = 'Enter a valid email address'
  const passwordError = passwordIssues(input.password)
  if (!input.password) errors.password = 'Password is required'
  else if (passwordError) errors.password = passwordError
  if (!input.confirmPassword) errors.confirmPassword = 'Confirm your password'
  else if (input.password !== input.confirmPassword) errors.confirmPassword = 'Passwords do not match'
  if (!input.acceptedTerms) errors.terms = 'Agree to the Terms of Service and Privacy Policy'
  return errors
}

export function validateBid(amountInput: string, currentBid: number, increment: number): string | null {
  const amount = parseMoney(amountInput)
  if (amount === null) return 'Enter a valid bid amount'
  const minimum = nextMinimumBid(currentBid, increment)
  if (amount < minimum) return `Bid must be at least ${minimum.toFixed(2)}`
  return null
}

export type AuctionDraftInput = {
  title: string
  category: string
  condition: string
  description: string
  startingPrice: string
  reservePrice: string
  location: string
  pickup: boolean
  domestic: boolean
  international: boolean
}

export function validateAuctionDraft(input: AuctionDraftInput): FieldErrors {
  const errors: FieldErrors = {}
  const title = input.title.trim()
  if (!title) errors.title = 'Item title is required'
  else if (title.length > 100) errors.title = 'Title must be 100 characters or fewer'
  if (!input.category) errors.category = 'Select a category'
  if (!input.condition) errors.condition = 'Select a condition'
  if (!input.description.trim()) errors.description = 'Description is required'
  else if (input.description.length > 2000) errors.description = 'Description must be 2000 characters or fewer'
  const starting = parseMoney(input.startingPrice)
  if (starting === null) errors.startingPrice = 'Enter a starting price'
  else if (starting < 1) errors.startingPrice = 'Minimum starting price is $1.00'
  const reserve = input.reservePrice.trim() ? parseMoney(input.reservePrice) : null
  if (input.reservePrice.trim() && reserve === null) errors.reservePrice = 'Enter a valid reserve price'
  else if (reserve !== null && starting !== null && reserve < starting) {
    errors.reservePrice = 'Reserve price must be at least the starting price'
  }
  if (!input.location.trim()) errors.location = 'Item location is required'
  if (!input.pickup && !input.domestic && !input.international) {
    errors.shipping = 'Choose at least one shipping option'
  }
  return errors
}

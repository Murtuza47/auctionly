import { describe, expect, it } from 'vitest'
import { passwordIssues, validateAuctionDraft, validateBid, validateLogin, validateSignup } from '../validation'

describe('validateLogin', () => {
  it('requires a valid email and password', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: 'Email address is required',
      password: 'Password is required',
    })
    expect(validateLogin({ email: 'not-an-email', password: 'secret' }).email).toMatch(/valid email/)
    expect(validateLogin({ email: 'you@example.com', password: 'secret' })).toEqual({})
  })
})

describe('validateSignup', () => {
  const valid = {
    name: 'John Smith',
    email: 'you@example.com',
    password: 'Auction1',
    confirmPassword: 'Auction1',
    acceptedTerms: true,
  }

  it('accepts a complete signup', () => {
    expect(validateSignup(valid)).toEqual({})
  })

  it('checks password rules, confirmation, and terms', () => {
    expect(passwordIssues('short')).toMatch(/8 characters/)
    expect(passwordIssues('longpassword')).toMatch(/uppercase/)
    const errors = validateSignup({
      ...valid,
      password: 'auction1',
      confirmPassword: 'other',
      acceptedTerms: false,
    })
    expect(errors.password).toBeTruthy()
    expect(errors.confirmPassword).toMatch(/do not match/)
    expect(errors.terms).toMatch(/Terms/)
  })
})

describe('validateBid', () => {
  it('rejects bids under the minimum increment', () => {
    expect(validateBid('660', 650, 25)).toMatch(/675\.00/)
    expect(validateBid('abc', 650, 25)).toMatch(/valid bid/)
    expect(validateBid('700.00', 650, 25)).toBeNull()
  })
})

describe('validateAuctionDraft', () => {
  const draft = {
    title: 'MacBook Pro 14-inch M3 Pro 2024',
    category: 'Electronics',
    condition: 'Excellent',
    description: 'Space Black, original charger included.',
    startingPrice: '200',
    reservePrice: '',
    location: 'Melbourne, VIC',
    pickup: true,
    domestic: false,
    international: false,
  }

  it('accepts a complete listing', () => {
    expect(validateAuctionDraft(draft)).toEqual({})
  })

  it('enforces price, reserve, and shipping rules', () => {
    const errors = validateAuctionDraft({
      ...draft,
      title: '',
      startingPrice: '0.50',
      reservePrice: '0.10',
      pickup: false,
      location: '',
    })
    expect(errors.title).toBeTruthy()
    expect(errors.startingPrice).toMatch(/\$1\.00/)
    expect(errors.reservePrice).toBeTruthy()
    expect(errors.shipping).toBeTruthy()
    expect(errors.location).toBeTruthy()
  })
})

import { validateAuctionDraft, validateBidAmount, validateLogin, validateSignup } from './validation'

describe('request validation', () => {
  it('checks login and signup the same way the forms do', () => {
    expect(validateLogin({ email: '', password: '' }).email).toMatch(/required/)
    expect(validateLogin({ email: 'you@example.com', password: 'secret' })).toEqual({})
    expect(validateSignup({
      name: 'John Smith',
      email: 'you@example.com',
      password: 'Auction1',
      confirmPassword: 'Auction1',
      acceptedTerms: true,
    })).toEqual({})
    const errors = validateSignup({ name: '', email: 'bad', password: 'auction1', confirmPassword: 'other', acceptedTerms: false })
    expect(errors.password).toMatch(/uppercase/)
    expect(errors.confirmPassword).toMatch(/do not match/)
    expect(errors.terms).toBeTruthy()
  })

  it('rejects low bids and incomplete listings', () => {
    expect(validateBidAmount(10, 650, 25)).toMatch(/675\.00/)
    expect(validateBidAmount(700, 650, 25)).toBeNull()
    const listing = validateAuctionDraft({
      title: '',
      category: '',
      condition: '',
      description: '',
      startingPrice: 0.5,
      reservePrice: 0.1,
      location: '',
      pickup: false,
      domestic: false,
      international: false,
    })
    expect(listing.title).toBeTruthy()
    expect(listing.startingPrice).toMatch(/\$1\.00/)
    expect(listing.shipping).toBeTruthy()
  })
})

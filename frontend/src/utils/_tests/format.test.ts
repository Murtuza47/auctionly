import { describe, expect, it } from 'vitest'
import {
  characterCount,
  formatBidCount,
  formatMoney,
  initialsFromName,
  nextMinimumBid,
  parseMoney,
  splitCountdown,
  suggestedBids,
  timeLeftToMinutes,
} from '../format'

describe('formatMoney', () => {
  it('formats dollars with cents', () => {
    expect(formatMoney(650)).toBe('$650.00')
    expect(formatMoney(1450)).toBe('$1,450.00')
  })

  it('can hide cents', () => {
    expect(formatMoney(285, false)).toBe('$285')
  })

  it('treats non-finite amounts as zero', () => {
    expect(formatMoney(Number.NaN)).toBe('$0.00')
  })
})

describe('parseMoney', () => {
  it('parses currency text', () => {
    expect(parseMoney('$1,450.00')).toBe(1450)
    expect(parseMoney(' 700.00 ')).toBe(700)
  })

  it('rejects empty or invalid values', () => {
    expect(parseMoney('')).toBeNull()
    expect(parseMoney('abc')).toBeNull()
    expect(parseMoney('-5')).toBeNull()
  })
})

describe('bid helpers', () => {
  it('computes the next minimum and suggested bids', () => {
    expect(nextMinimumBid(650, 25)).toBe(675)
    expect(suggestedBids(650, 25)).toEqual([675, 700, 750])
  })

  it('pluralizes bid counts', () => {
    expect(formatBidCount(1)).toBe('1 bid')
    expect(formatBidCount(12)).toBe('12 bids')
  })
})

describe('splitCountdown', () => {
  it('pads hours, minutes, and seconds', () => {
    expect(splitCountdown(2 * 3600 + 31 * 60 + 18)).toMatchObject({
      hours: '02',
      minutes: '31',
      seconds: '18',
    })
  })

  it('clamps negative time to zero', () => {
    expect(splitCountdown(-4).totalSeconds).toBe(0)
  })
})

describe('timeLeftToMinutes', () => {
  it('reads day, hour, minute, and second labels', () => {
    expect(timeLeftToMinutes('2h 45m')).toBe(165)
    expect(timeLeftToMinutes('1d 3h')).toBe(27 * 60)
    expect(timeLeftToMinutes('12m 45s')).toBeCloseTo(12.75)
  })
})

describe('initials and character counts', () => {
  it('builds initials from a name', () => {
    expect(initialsFromName('Alex Morgan')).toBe('AM')
    expect(initialsFromName('   ')).toBe('A')
  })

  it('reports a capped character count', () => {
    expect(characterCount('hello', 100)).toBe('5/100 characters')
  })
})

import { describe, expect, it } from 'vitest'
import { resolveImage } from '../../data/catalog'

describe('resolveImage', () => {
  it('maps catalog keys and leaves real urls alone', () => {
    expect(resolveImage('chair')).toContain('chair')
    expect(resolveImage('macbook')).toBeTruthy()
    expect(resolveImage('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png')
    expect(resolveImage('blob:http://local/1')).toBe('blob:http://local/1')
    expect(resolveImage('data:image/png;base64,aaa')).toBe('data:image/png;base64,aaa')
    expect(resolveImage('/assets/photo.png')).toBe('/assets/photo.png')
    expect(resolveImage(undefined)).toBe('')
  })
})

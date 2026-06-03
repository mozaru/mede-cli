import { describe, it, expect } from 'vitest'
import { calculateHashFromContent, calculateHashFromJson } from './crypto.js'

describe('calculateHashFromContent', () => {
  it('returns an empty string for empty input', () => {
    expect(calculateHashFromContent('')).toBe('')
  })

  it('produces a deterministic 32-char md5 hex digest', () => {
    const hash = calculateHashFromContent('hello world')
    expect(hash).toBe(calculateHashFromContent('hello world'))
    expect(hash).toMatch(/^[a-f0-9]{32}$/)
  })

  it('produces different digests for different content', () => {
    expect(calculateHashFromContent('a')).not.toBe(calculateHashFromContent('b'))
  })
})

describe('calculateHashFromJson', () => {
  it('returns an empty string for null/undefined', () => {
    expect(calculateHashFromJson(null)).toBe('')
    expect(calculateHashFromJson(undefined)).toBe('')
  })

  it('hashes the JSON serialization of an object', () => {
    const value = { a: 1, b: 2 }
    expect(calculateHashFromJson(value)).toBe(
      calculateHashFromContent(JSON.stringify(value)),
    )
  })

  it('is sensitive to property order (string serialization)', () => {
    expect(calculateHashFromJson({ a: 1, b: 2 })).not.toBe(
      calculateHashFromJson({ b: 2, a: 1 }),
    )
  })
})

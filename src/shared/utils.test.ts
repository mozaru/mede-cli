import { describe, it, expect } from 'vitest'
import { isEmpty, notIsEmpty } from './utils.js'

describe('isEmpty', () => {
  it('treats null and undefined as empty', () => {
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
  })

  it('treats blank and whitespace-only strings as empty', () => {
    expect(isEmpty('')).toBe(true)
    expect(isEmpty('   ')).toBe(true)
    expect(isEmpty('\n\t  ')).toBe(true)
  })

  it('treats non-blank strings as not empty', () => {
    expect(isEmpty('x')).toBe(false)
    expect(isEmpty('  content  ')).toBe(false)
  })
})

describe('notIsEmpty', () => {
  it('is the logical negation of isEmpty', () => {
    expect(notIsEmpty(null)).toBe(false)
    expect(notIsEmpty('   ')).toBe(false)
    expect(notIsEmpty('value')).toBe(true)
  })
})

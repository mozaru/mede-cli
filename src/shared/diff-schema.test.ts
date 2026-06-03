import { describe, it, expect } from 'vitest'
import { validateDiffChunks } from './diff-schema.js'
import { parseDiff } from './diff.js'

describe('validateDiffChunks', () => {
  it('accepts well-formed hunks produced by parseDiff', () => {
    const chunks = parseDiff('@@ -1,2 +1,3 @@\n context\n+added\n more')

    expect(() => validateDiffChunks(chunks)).not.toThrow()
    expect(validateDiffChunks(chunks)).toHaveLength(1)
  })

  it('accepts an empty array (no changes)', () => {
    expect(validateDiffChunks([])).toEqual([])
  })

  it('rejects a chunk with a malformed hunk header', () => {
    const malformed = [
      { index: 1, offset: 0, location: '@@ garbage @@', content: '+x' },
    ]

    expect(() => validateDiffChunks(malformed)).toThrow(/diff malformado/)
  })

  it('reports the chunk position of the malformed hunk', () => {
    const chunks = [
      { index: 1, offset: 0, location: '@@ -1,1 +1,2 @@', content: '+ok' },
      { index: 2, offset: 0, location: 'NOT A HEADER', content: '+bad' },
    ]

    expect(() => validateDiffChunks(chunks)).toThrow(/chunk #1/)
  })
})
